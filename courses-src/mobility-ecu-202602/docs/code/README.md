# 실습 코드 (교육용 · 주석 포함)

원본 상용 펌웨어를 복제하지 않고, **같은 개념을 가르치는 자작 교육 코드**로 작성했다(저작권 안전). 각 파일은 해당 주차 강의자료의 「💻 실습 코드」와 이어진다.

| 파일 | 주차 | 내용 |
|---|---|---|
| [`week08_gpio_led.c`](week08_gpio_led.c) | 8 | GPIO 레지스터 직접 접근 — LED (클럭→MODER→ODR) |
| [`week09_exti_switch.c`](week09_exti_switch.c) | 9 | EXTI 외부 인터럽트 — 스위치→LED (홀/엔코더와 동일 방식) |
| [`week10_adc_timer_uart.c`](week10_adc_timer_uart.c) | 10 | ADC(센서)·Timer PWM(모터)·UART(통신) 3종 |
| [`week0506_bldc_hall.c`](week0506_bldc_hall.c) | 5·6 | 홀센서 6-step 정류 룩업테이블 |
| [`week07_pi_control.c`](week07_pi_control.c) | 7 | PI 속도 제어기(안티 와인드업 포함) |
| [`week15_scheduler.c`](week15_scheduler.c) | 15 | SysTick 스케줄러 + 인터럽트 통합 골격 |
| [`amr_2wheel_drive.c`](amr_2wheel_drive.c) | AMR | 2륜 차동구동 — TB6612 H-브리지 |

## 코드가 이어지는 흐름

```
8주차 GPIO ─▶ 9주차 인터럽트 ─▶ 10주차 ADC·PWM·UART
                                     │
      5·6주차 홀 6-step ◀────────────┘ (센서·PWM 활용)
              │
       7주차 PI 제어 ─▶ 15주차 통합(스케줄러+인터럽트) ─▶ AMR 2륜 주행
```

- 8~10주차에서 **레지스터로 직접 제어**하는 법을 익히고,
- 5·6·7주차의 모터제어(정류·PWM·PI)를 코드로 구현하며,
- 15주차에서 이 모든 것을 **하나의 펌웨어**로 통합하고, AMR 2륜 구동으로 주행한다.

> 컴파일: STM32CubeIDE 프로젝트에 파일을 추가하고, 핀·클럭은 보드 회로도/레퍼런스매뉴얼에 맞게 조정한다. 예제는 개념 전달용 최소 코드다.
