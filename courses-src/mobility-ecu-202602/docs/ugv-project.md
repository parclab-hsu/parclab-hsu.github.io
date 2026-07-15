# 로버 개발 프로젝트 — 직접 만들며 배우는 마이크로프로세서 (캡스톤)

자율이동로봇(AMR, Autonomous Mobile Robot) 또는 지상 로버(UGV, Unmanned Ground Vehicle)를 직접 기획·설계·제작하며 마이크로프로세서를 체득하는 통합 프로젝트. WIZnet IoT 스피커 프로젝트(chcbaram)의 "처음부터 끝까지 과정을 공개하며 완주"하는 개발 방식을 지상 로버로 각색한다.

> 참고 사례: WIZnet Maker — IoT Speaker (chcbaram). 개발 *방법론·구조*를 참고해 지상 로버 프로젝트로 재구성했으며, 오디오/네트워크 구현 대신 이 과정에서 배운 모터제어·센서·통신으로 치환.

## 왜 UGV인가 — 교육 취지

- **직접 이해**: HAL에만 의존하지 않고 데이터시트로 레지스터를 직접 제어 → 마이크로프로세서를 "손으로" 이해
- **개발 자신감**: 작은 목표를 단계별로 완주하며 "내가 만든 로봇이 움직인다"는 성취 경험

## chcbaram 개발 철학 차용 (5원칙)

| 원칙 | IoT 스피커 사례 | 로버 적용 |
|---|---|---|
| ① 목표를 단순화 | "네트워크로 사운드를 스피커로" | "원격 명령으로 로봇을 전진/회전"부터 |
| ② 데이터시트 기반 직접 제어 | W5300 레지스터 직접 라이브러리 | STM32 타이머/ADC/홀센서 레지스터 직접 제어 |
| ③ HW/FW/SW 분리 개발 | 메인보드 + 펌웨어 + PC GUI | 구동보드 + 펌웨어 + 원격제어 앱 |
| ④ 단계별 공개 개발 | 블로그 56편 + 영상 13편 | 각 마일스톤을 기록·발표로 공유(실패 포함) |
| ⑤ WBS로 완주 | 기획→HW→FW→SW→통합 5단계 | 동일 5-Phase 로드맵으로 캡스톤 완성 |

## 로버 시스템 블록도

```mermaid
flowchart LR
    BAT["배터리"] --> PWR["전원(벅·LDO)"]
    PWR --> MCU["STM32 MCU"]
    MCU -->|"PWM"| DRV["모터 드라이버"]
    DRV --> ML["좌측 모터"]
    DRV --> MR["우측 모터"]
    ML --> WHEEL["차동구동 주행"]
    MR --> WHEEL
    ENC["엔코더/홀"] -->|"속도"| MCU
    US["초음파/IMU"] -->|"ADC/I2C"| MCU
    MCU -->|"UART/BLE"| REMOTE["원격제어 앱"]
```

## 강의 → 로버 지식 연계

| 로버 구성 | 연계 주차 |
|---|---|
| 전원부(배터리→벅→MCU) | 2·4주차 (전자부품·전원회로) |
| 모터 구동(PWM·방향·속도) | 5·6·7주차 (모터·인버터·PI 제어) |
| MCU 펌웨어(GPIO·ADC·Timer·인터럽트·UART) | 8·9·10주차 (STM32 펌웨어) |
| 요구사항·HSI·구동보드 PCB | 11·12·13·14주차 (설계·PCB) |
| 통합·원격통신·시연 | 15주차 (펌웨어 통합) |

## 데이터시트 기반 직접 제어 (자신감의 핵심)

- **모터 PWM** — TIM 레지스터(PSC/ARR/CCR) 직접 설정
- **속도 측정** — 엔코더/홀 입력을 EXTI·타이머 캡처로 T방식 계산
- **센서** — 초음파(타이머 캡처), IMU(I2C), 거리 ADC
- **통신** — UART 원격 명령 수신, Teleplot 상태 시각화

## 5-Phase 개발 로드맵 (WBS)

```mermaid
flowchart TD
    P1["Phase 1 · 기획·요구사항<br>목표·요구사항·블록도·WBS"] --> P2["Phase 2 · 하드웨어<br>구동보드 회로·PCB·SMT"]
    P2 --> P3["Phase 3 · 펌웨어<br>GPIO·PWM 구동·센서·속도제어"]
    P3 --> P4["Phase 4 · 원격제어 SW<br>명령 프로토콜·앱/Teleplot"]
    P4 --> P5["Phase 5 · 통합·검증<br>주행 테스트·장애복구·발표"]
```

## 단계별 미션 (예시)

- Mission 1 — 바퀴 1개 PWM 구동(전진/정지)
- Mission 2 — 좌·우 모터 차동구동(전진·후진·제자리회전)
- Mission 3 — 엔코더 속도 피드백 + PI 직진 제어
- Mission 4 — 초음파 장애물 자동 정지/회피
- Mission 5 — 원격제어(UART/BLE) + 텔레메트리 모니터링
- Mission 6 — 최종 주행 미션 통합 및 발표

## 💻 실습 코드 (주석 포함) — 2륜 차동구동 `code/amr_2wheel_drive.c`

TB6612 H-브리지로 좌/우 모터를 제어한다. `amr_drive(v, w)`에 전진 v·회전 w를 주면 차동구동 믹싱으로 주행한다. [⬇ 전체 코드](code/amr_2wheel_drive.c)

```c
/*
 * [로버 실습] 2륜 차동구동 — TB6612 H-브리지로 좌/우 모터 제어
 * ----------------------------------------------------------
 * 브러시 DC 모터 2개를 각각 H-브리지 1채널로 구동한다.
 *   IN1/IN2 : 회전 방향,  PWM : 속도(듀티)
 * 좌/우 속도를 다르게 주면 로봇이 회전한다(차동구동). HAL 스타일(가독성 우선).
 */
#include "stm32f4xx_hal.h"

extern TIM_HandleTypeDef htim3;   /* PWM: CH1=좌, CH2=우 */

/* TB6612 방향 핀 (예시). 실제 배선에 맞게 수정 */
#define AIN1_PORT GPIOC
#define AIN1 GPIO_PIN_8
#define AIN2 GPIO_PIN_9   /* 좌모터 방향 */
#define BIN1 GPIO_PIN_10
#define BIN2 GPIO_PIN_11  /* 우모터 방향 */

/* 한 모터 구동: dir>0 정방향, dir<0 역방향, dir==0 정지. duty 0.0~1.0 */
static void motor_drive(GPIO_TypeDef* port, uint16_t in1, uint16_t in2,
                        uint32_t tim_ch, int dir, float duty)
{
    /* 방향 결정 (진리표: IN1=H,IN2=L → 정방향 / L,H → 역방향 / L,L → 정지) */
    HAL_GPIO_WritePin(port, in1, dir > 0 ? GPIO_PIN_SET : GPIO_PIN_RESET);
    HAL_GPIO_WritePin(port, in2, dir < 0 ? GPIO_PIN_SET : GPIO_PIN_RESET);

    /* 속도 = PWM 듀티. CCR = ARR * duty */
    if (duty < 0) duty = 0; if (duty > 1) duty = 1;
    __HAL_TIM_SET_COMPARE(&htim3, tim_ch,
                          (uint32_t)(__HAL_TIM_GET_AUTORELOAD(&htim3) * duty));
}

/* 좌/우 속도 지령으로 로봇 주행: v(-1~1 전진/후진), w(-1~1 회전) */
void amr_drive(float v, float w)
{
    float left  = v - w;   /* 차동구동 믹싱: 좌 = 전진 - 회전 */
    float right = v + w;   /*               우 = 전진 + 회전 */

    motor_drive(AIN1_PORT, AIN1, AIN2, TIM_CHANNEL_1,
                left  > 0 ? 1 : (left  < 0 ? -1 : 0), left  < 0 ? -left  : left);
    motor_drive(AIN1_PORT, BIN1, BIN2, TIM_CHANNEL_2,
                right > 0 ? 1 : (right < 0 ? -1 : 0), right < 0 ? -right : right);
}
/* 예: amr_drive(0.5f, 0)=직진, amr_drive(0, 0.5f)=제자리 좌회전, amr_drive(0,0)=정지 */
```

