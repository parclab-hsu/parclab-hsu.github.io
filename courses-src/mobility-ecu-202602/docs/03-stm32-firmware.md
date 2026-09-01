# STM32 임베디드/센서 실습 기술 노트 (8~10주차)

> 근거: UAV개발/STM32_강의자료_Ver0.2.pdf(F767 레지스터 예시), ST마이크로프로세서/(F103 HAL 비교), 모빌리티센서/(ESP32 Arduino 보충)

!!! note "이번 학기 구현 기준"
    실습 기준 MCU는 **STM32F767**이며, HAL 없이 레지스터 직접 제어로 원리를 확인한다. F103(HAL)·ESP32(Arduino) 첨부자료는 주변장치 구조와 추상화 수준을 비교하기 위한 참고 예시로만 사용한다.

## ⚠️ 자료가 3개 하드웨어 계열로 분리됨 (핵심 함정)
| 폴더 | 하드웨어 | 방식 |
|---|---|---|
| ST마이크로프로세서/ | STM32F103RB (Cortex-M3, 72MHz) NUCLEO+EVB | CubeIDE+CubeMX+**HAL** |
| UAV개발/STM32_강의자료 | STM32F767 (Cortex-M7, 216MHz) 교육보드 예시 | **포인터 레지스터 직접접근 원리 비교** |
| 모빌리티센서/ | ESP32-WROOM-32 LAFVIN 키트 | **Arduino IDE(.ino)** |
- "F767 메모리맵/레지스터 직접접근/쓰로틀 ADC"=UAV개발 파일 근거. "HAL/GPIO&EXTI/ADC/TIM/Serial/I2C"=F103 계열. 모빌리티센서 11개=ESP32/Arduino(개념 매핑 보충실습만).
- 교육흐름 권장: **STM32F767 레지스터 직접 제어**를 구현 기준으로 두고, F103 HAL 자료는 생산성·추상화 수준을 설명할 때만, ESP32 자료는 센서 보조 실습에만 사용한다.

## ARM/Cortex-M/메모리맵
- ARM=RISC 32/64bit. Cortex-A(앱)/R(실시간)/M(MCU). M0~M7. M7=고성능·캐시·TCM.
- Cortex-M3: ARMv7-M, 3-스테이지 파이프라인, 하버드구조, Thumb-2, NVIC, 최대240 인터럽트.
- MCU=CPU+주변장치. 버스: **AHB(고속·메모리/DMA)**, **APB(저속 GPIO/UART/SPI/I2C)**.
- **4GB 고정 메모리맵**: Code(0x0000_0000, Flash) / SRAM(0x2000_0000) / Peripheral(0x4000_0000) / External RAM(0x6000_0000) / PPB(0xE000_0000, NVIC·SysTick).
- 코어 레지스터 R0~R12, SP(R13), LR(R14), PC(R15), PSR.
- 실행: 리셋→시작코드(초기화)→main(). SRAM=스택+힙.

## 개발도구
- STM32CubeIDE(Eclipse+GCC+GDB) + CubeMX(GUI 핀/클럭). Tera Term(시리얼). 로직분석기(Saleae 24MS/s).
- 디버깅: GDB(F5 StepInto/F6 StepOver/F7 Return), printf 시리얼(syscalls.c `__io_putchar` weak 재정의), 로직분석기.
- CubeMX: `/* USER CODE BEGIN/END */` 구역 보존.

## 8주차 — GPIO/메모리맵/레지스터 직접접근
- GPIO 모드: 입력/출력/AF/아날로그/EXTI. 출력 Push-Pull/Open-Drain. 내부 보호다이오드+슈미트트리거+풀업/풀다운.
- MCU 레지스터 3분류: **Control**(설정) / **Status**(상태 플래그) / **Data**(값).
- **F767 GPIO 출력 시퀀스**: RCC_AHB1ENR(클럭)→MODER(출력)→OTYPER(PushPull)→OSPEEDR(속도, 빠르면 EMI)→ODR(값). LED = PD3→**PC6로 HW변경**(High=Off, Low=On).
- F103 HAL: HAL_GPIO_WritePin/TogglePin, HAL_Delay(ms), HAL_GetTick().

## 9주차 — 입력/클럭/인터럽트
- 입력: Pull-up/down/Floating, **IDR** 읽기. 폴링 한계→인터럽트.
- **클럭(RCC)**: HSE(외부 4~26MHz)/HSI(내부 16MHz, 리셋기본)/LSE(32.768kHz RTC)/LSI(32kHz IWDG). **PLL 체배→24~216MHz**.
  - 설정: RCC_CR(PLLON=0→PLLRDY대기)→RCC_PLLCFGR→PLLON=1→PLLRDY대기.
  - **키트 버스: HCLK 216MHz, APB1 54MHz, APB2 54MHz**. **타이머클럭 함정: APB 프리스케일≠1이면 PCLK×2**.
  - MCO(PA8)로 클럭 출력 검증.
- **인터럽트 NVIC**: Interrupt Vector Table, Tail-Chaining/Late Arrival, Preemption+Sub Priority.
- **EXTI**: EXTI0~15=GPIO핀, EXTI16전원/17RTC/18USB. EXTI0~4 개별, EXTI9_5·15_10 묶음. 레지스터: SYSCFG_EXTICR(포트선택)/IMR(마스크)/RTSR·FTSR(엣지)/PR(펜딩, 1write로 clear).
- F103 HAL: `HAL_GPIO_EXTI_Callback()` weak 재정의.
- 로터리 엔코더: A가 B보다 먼저 Rising=CW.

## 10주차 — ADC/Timer/UART
### ADC
- 3단계: 샘플링→양자화→부호화. Nyquist. F767 12/10/8/6bit(**12bit=4096, 3.3V/스텝 0.8mV**).
- **ADC_out=(2^N−1)·Vin/Vref**. 오차: 양자화/오프셋(SW가감)/이득(SW곱셈).
- SAR 방식. Regular(16채널)/Injected(4채널·우선). 결과 ADCx_DR. 트리거 SW/Timer TRGO/EXTI. 획득 Polling/Interrupt/**DMA(다채널 권장)**.
- **F767 쓰로틀(PA7=채널7)**: ADC클럭 27MHz, ADC_CR1(12bit)→SQR1(길이)→SQR3(채널)→SR EOC대기→DR읽기.
- F103: ADCCLK≤14MHz, 부팅후 Calibration 필수, HAL_ADC_Start→PollForConversion→GetValue.

### Timer/Counter/PWM
- Timer=내부클럭 주기, Counter=외부신호. 레지스터: **PSC→CNT→ARR(최대값)→CCR(비교)→OCREF**.
- 모드: Up/Down/**Center-aligned**. ARPE(오토리로드 프리로드). Input Capture/Output Compare. PWM: ARR=주파수, CCR=듀티, mode1/2.
- **F767: TIM1~14. TIM1/8=Advanced(상보출력+데드타임, 모터용). RCR(반복카운터)**.
- F767 1초 토글: PSC→ARR→EGR(UG=1)→CR1(CEN)→SR(UIF). Center상보PWM: PE9(CH1)/PE8(CH1N).
- F103 계산예: APB1 64MHz→PSC로 10kHz→ARR9999→1Hz. 서보 SG90(50Hz, 1~2ms), 부저(tone=1MHz/(ARR+1)).

### UART
- 직렬(1비트씩) vs 병렬. 전이중/반이중. 동기(I2C/SPI) vs 비동기(UART). USART=동기겸용, UART=비동기.
- 프레임: Start+Data(5~8)+Parity+Stop. **Tx↔Rx 교차연결**. Tera Term 115200.
- printf 리타게팅: syscalls.c `__io_putchar` UART 재정의.

## (여유) 통신심화 — I2C
- 2선(SCL/SDA), Start(SCL High시 SDA Falling)→주소+R/W→ACK→데이터→Stop.
- MPU6050(0xD0), HAL_I2C_Mem_Read 0x3B부터 14byte. 가속도/16384, 각속도/131.

## 모빌리티센서(ESP32 Arduino) 보충실습 매핑
디지털출력/입력(GPIO), 터미널(UART), 12bit ADC 조이스틱(ADC), 멜로디/부저(Timer tone), 초음파 HC-SR04 pulseIn(입력캡처/µs), 모터 analogWrite(PWM 듀티), 온도 TMP37(ADC 스케일링). ※EXTI/DMA/레지스터 없음.

## 자료 한계
F767 레지스터 비트값은 슬라이드 이미지로만 존재(텍스트 미추출) → 레퍼런스매뉴얼 병행. LED PD3→PC6 개정.
