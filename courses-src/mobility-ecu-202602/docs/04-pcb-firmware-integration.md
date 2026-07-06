# PCB 설계·BLDC 펌웨어 통합 기술 노트 (11·13·14·15주차)

> 근거: UAV개발/PCB설계강의자료_ver0.1.pdf, 전동킥보드펌웨어_ver0.2.pdf, 속도제어,Teleplot.pdf, 소형보드(넷리스트), + 실제 펌웨어 코드 Intergrated_V2

## ✅ 11주차(요구사항/HSI/블록도) — 보강 완료
근거는 **인버터하드웨어설계_ver0.1.pdf의 1장 "제품 개발 프로세스"**에 충분히 있음(PCB 5개 파일이 아니라 여기): 개발흐름(요구사항→회로→PCB→기능테스트→기구조립→통합→EMI/EMC), Top-Down 요구사항, **3상 인버터 사양서**(18~42V/350W/15A RMS/27A peak/10~20kHz), **HSI = MCU 핀별 동작 정의**, 시스템 블록도, JLCPCB+EasyEDA 업체선정, 회로 3분할(MCU/GateDriver/Power), 기능→실차→EMC(=EMS+EMI). 실무 방법론 사례는 chcbaram WIZnet 블로그(목표→요구사항 단순화→개발환경→기본사양→블록도→To-do→WBS). HSI 핀표는 코드 검증(PE8~13 PWM, PD0~2 홀, PA0~2 상전류, PA3 Vdc, PA6 NTC, PA7 쓰로틀, PC6 LED, UART2 디버그, USART3 BLE, I2C4 EEPROM). → Notion 11주차 페이지 작성 완료(상태 완료).

## 13주차 — EasyEDA & PCB 기초
### EasyEDA 워크플로우
- 회로도+PCB, Pro Edition 로컬. Board=회로도+PCB. **Footprint**=부품 실물 모양. Component↔Footprint 연동.
- 설계과정: 회로설계→PCB이동→외곽→부품배치→중요신호배선→전원/그라운드→일반배선→거버→BOM→SMT.
- 단위 mm 사용. 라우팅 Alt+W, 굵기 Tab. **폴리곤**(넓은 트레이스), **카파푸어**(GND/파워 채움). Design Rule(이격거리), DRC(회로도·PCB 각각). **JLCPCB 연동 최소 5개 주문**.
- 레이어: LED회로=2층, 인버터=4층.

### PCB 기초
- PCB=부품 고정·연결. 라우팅=회로도대로 배선(부품특성·전압/전류·속도 고려). **같은 회로도 레이아웃에 따라 성능 다름**.
- 8대 용어: PCB/동박·PAD/Through Hole/SMD/트레이스/실크스크린/카파푸어/솔더마스크.
- 레이어↑=배선↑·노이즈강인·가격↑. 4층 스택업 예(모터제어기): SIG/GND/POWER/SIG.

### 설계규칙
- **트레이스폭**: 전류+동박두께(1oz/2oz)로 결정, 외부배선이 더 큰 전류 허용. Digikey 계산기.
- **3W 룰**: 신호 중심간격 ≥ 트레이스폭 3배 → 크로스토크(오버슈트·링잉) 방지. 클럭/고속신호 우선.
- 배선: 짧고 굵게, **직각 금지(45°/원호)**, 양면기판 상하층 수직 배선. 벅컨버터 인덕터 주위 주의.
- **비아**: 다층 이동, 고전류부 Via로 결합·발열예방.
- **PGND/GND 분리**: 0Ω 저항 단일점 연결.
- **켈빈커넥션(4접점)**: 션트 전류센싱, 접촉저항 오차 제거(안쪽 V+/V- 라우팅).
- 클럭: GND 가드+MCU 근처. 디커플링캡: IC핀 최대한 가깝게.

## 14주차 — 노이즈 & 그라운드
### 노이즈
- 노이즈=원치 않는 신호. EMC 인증 못하면 판매불가. 모터=고전력+스위칭→대비 안하면 99% 오동작.
- 3종류: **전도성**(전도경로 유입, 대책 TVS·RC필터), **유도성**(기생인덕턴스 자기장), **방사(EMC 대상)**.
- "모든 전송선로=RLC 집합". VL=L·diL/dt, IC=C·dVc/dt.
- 용량성결합(도체간 유전층). 인덕티브결합 M=k√(L1L2), V=−M·di/dt(전류방향 반대면 상쇄).
- **크로스토크**→3W룰. **차동모드**(바이패스캡·트위스트케이블). **공통모드**(기준전위차, EMI 주원인→그라운드 설계 중요).

### 그라운드
- 그라운드=기준전위 0V. 모든 전류는 최저임피던스 폐루프로 리턴. PGND/AGND/DGND 분리.
- 기생임피던스→전위차(그라운드 바운싱, 3.3V가 4.3V로). Vz=Iz·Z.
- **낮은 임피던스 조건**: 저R·저L(트레이스 넓고 짧게)+높은C(면적 넓게). Z=√(R²+(ωL−1/ωC)²).
- 트레이스 인덕턴스 L≅μ₀·(l/w)·(ln(2h/w)+0.5) → **길이 짧게·폭 넓게**.
- 루프면적 최소화(리턴패스 짧게). 접지 3방식: 직렬단일점(간단·전체영향)/병렬단일점(배선길어짐)/**다중점병렬(PCB 사용)**.
- 부품배치가 가장 중요(고전류/스위칭부 vs 예민신호부 분리).

## 15주차 — BLDC 펌웨어 통합 (STM32F767, 실제 코드 Intergrated_V2 검증)
### 구조
- **헤더/소스 분리**: clock/adc/dac/hall/uart/timer/GPIO.c.
- **6-step 홀 정류**: 홀 Ha·Hb·Hc(000·111 제외 6가지). **HallSum=Ha·4+Hb·2+Hc**. 섹터별 2,3,1,5,4,6. 홀변화 010→011→001→101→100→110. 홀 EXTI0/1/2 인터럽트로 감지→스위칭패턴.
- **유니폴라 PWM**: 상단 스위치 PWM, 하단 On. (인휠매핑/소형BLDC매핑 config USE_INWHEEL로 전환, 정/역 dir).

### 핵심 코드/수치 (코드 검증됨)
- **Center Align PWM (TIM1)**: 션트 정확 센싱 위해. **CNT_MAX=5400, PSC=0(216MHz), ARR=CNT_MAX → 216MHz/5400/2 = 20kHz**. Center-aligned mode3(CR1=0x0065), **데드타임 DEADTIME_1us=180**(BDTR). RCR=1(카운터 시작후 설정→언더플로우 업데이트, 100us주기).
- **쓰로틀→듀티 반전**: DutyA=CNT_MAX−VoltageRef (안빼면 쓰로틀↑에 상단듀티↓).
- **SysTick 스케줄러**: LOAD=(216M/1000)−1=215999 → **1ms 인터럽트**. SysTick_Handler서 msTicks++·Scheduler(). msTicks%N으로 10/100/500/1000ms 태스크 플래그, main while서 실행. Task_10ms(RpmRef/Fdb UART), Task_500ms(BLE 송신).
- **ADC**: 3상전류(PA0/1/2=ADC1/2/3 동시)·쓰로틀(PA7)은 TIM1 인터럽트서, Vdc(PA3)·NTC(PA6 tempLaw)는 10ms. 전류식 ias=(result−offset)·VREF/FS−OFFSET_Volt)/OPAMP_GAIN. 오프셋=10회평균−2048.
- **NTC 온도**: MosfetTemp = −11.48·x³+63.23·x²−149.02·x+181.97 (x=tempLaw, 3차 다항식).
- **T방식 RPM**: TIM2 **54MHz**(PSC=3, ARR=53999999≈1초). SpeedCal(): delta_time=현재−last(오버플로우 보정). **calculated_rpm=(60·54000000)/(Edges_per_Rev·delta_time)**. HALL_EDGES_PER_REV=소형BLDC 24, 인휠 90.
- **속도→km/h**: RPM_TO_KMH(rpm)=rpm·(π·WHEEL_DIAMETER)·60/1000.
- **BLE(AT-09)**: UART3, 9600bps, 500ms 송신(Spd/Vdc/MosfetTemp/Flt), 초기PW 000000.
- **고장 FltFlg**: 0정상/1과전류(OC_LEVEL 35A, 50ms지속)/2과열(MOSFET>100°C, 90°C서 클리어)/3저전압(<32V)/4과전압.
- **쓰로틀 히스테리시스**: THROTTLE_OFF 1.00V / THROTTLE_ON 1.05V.
- **Set_Phases(A,B,C)**: +1→CCR=Duty(Unmask), −1→CCR=CNT_MAX(Unmask), 0→Mask. VoltageRef=0/StartFlag=0시 Disable_PWM.
- 제어플로우: Init→전류 Calibration(10회)→홀 초기값→TIM1 인터럽트 활성→구동. 런타임: TIM1 20kHz(전류·쓰로틀 ADC→듀티) + 홀 EXTI(홀 업데이트→속도).

### 하드웨어 (소형보드 넷리스트)
- MCU STM32F767VIT6. **게이트드라이버 부품 불일치**: 슬라이드=UCC27211D vs 회로도=IR2101STRPBF (강의시 실물기준 명시). MOSFET IRF3205PBF(게이트10Ω+1N5819+10k/1nF). 션트 10mΩ ±10A, OP-AMP TLV2374(1.65V). 벅 TPS54360(24~36V→12V, L33µH), LDO LM2940(5V)/LM1117(3.3V). 홀버퍼 SN74LVC3G17. EEPROM M24C64(I2C4). NTC NTCS0603E3103.

### PI 속도제어 & Teleplot
- PI: E(s)→Kp+Ki/s→U(s)→Gp(s)→Y(s). **Kp=J·ωc²/KT, Ki=J·ωc²/(5·KT)** (J관성, ωc대역폭, KT토크상수). 정격 4000RPM.
- Teleplot: VSCode 확장, UART 출력 `>변수:값` 포맷 맞춰야 그래프. 코드에 UART2_SendString(">RpmRef:")... 존재.

## 주차 배분
- 11주차: 요구사항/HSI/블록도 (자료 부족 → 12주차 인버터HW 개발프로세스+펌웨어 블록도로 대체, 정형자료 보강)
- 13주차: EasyEDA+PCB기초+트레이스/3W/배선/비아
- 14주차: 노이즈 3종+그라운드 이론+접지 3방식+PGND/AGND
- 15주차: BLDC 펌웨어 전체 + PI속도제어/Teleplot + 킷 구동 시연
