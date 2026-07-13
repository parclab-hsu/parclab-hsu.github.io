# 첨부자료 활용 가이드

> 공개 강의 페이지에서 바로 열 수 있도록 핵심 PDF/XLSX 자료를 선별해 연결했다. 원본 전동킥보드 BLDC 구동 자료는 AMR·우주로버 2륜 구동 ECU 관점으로 재해석해 사용한다.

## 주차별 핵심 자료

| 주차 | 첨부자료 | 활용 포인트 |
|---|---|---|
| 1 | [키트사용법](attachments/kit-guide.pdf), [STM32 개발환경](attachments/stm32-orientation-dev-env.pdf) | 실습 키트 구성, 전원 인가 전 점검, 개발환경 설치 |
| 2~4 | [실무회로](attachments/practical-circuits.pdf) | 수동소자, MOSFET, 전원회로 계산과 데이터시트 읽기 |
| 5~7 | [모터제어&인버터 이론](attachments/motor-control-inverter-theory.pdf), [속도제어·Teleplot](attachments/speed-control-teleplot.pdf) | BLDC 6-step, PWM, PI 제어, 속도 로그 해석 |
| 8~10 | [STM32 강의자료](attachments/stm32-lecture-v0.2.pdf), [GPIO/EXTI](attachments/stm32-gpio-exti.pdf), [ADC](attachments/stm32-adc-updated.pdf), [TIM](attachments/stm32-tim.pdf), [Serial](attachments/stm32-serial-communication-updated.pdf) | 레지스터·HAL 비교, 인터럽트, ADC/Timer/UART 통합 실습 |
| 11~12 | [인버터 하드웨어 설계](attachments/inverter-hardware-design-v0.1.pdf), [사양·회로·가격표](attachments/electric-scooter-v2-spec-circuit-cost.xlsx) | 요구사항, HSI, 부품 선정, 전원·게이트드라이버 설계 |
| 13~14 | [PCB 설계 강의자료](attachments/pcb-design-lecture-v0.1.pdf) | EasyEDA, 트레이스폭, 3W룰, 노이즈·그라운드 개선 |
| 15 | [전동킥보드 펌웨어](attachments/electric-scooter-firmware-v0.2.pdf), [속도제어·Teleplot](attachments/speed-control-teleplot.pdf) | 20kHz PWM, SysTick, 센싱, Fault, 최종 시연 로그 |

## 3시간 수업에서의 사용 방식

| 단계 | 자료 사용법 | 교수자 확인 |
|---|---|---|
| 도입 20~30분 | 지난 주 산출물과 오늘 PDF의 핵심 그림 1~2장을 연결한다. | 학생이 오늘 주제가 최종 ECU의 어느 블록인지 말할 수 있는가 |
| 이론 40~50분 | PDF 원본의 공식·회로를 사이트 그림과 함께 다시 설명한다. | 공식 암기보다 입력, 출력, 위험요소를 구분하는가 |
| 실습 60~70분 | 데이터시트, 회로도, 코드, 로그를 직접 열어 계산·측정·수정한다. | 산출물이 수치, 파형, 캡처 중 하나 이상을 포함하는가 |
| 정리 30~40분 | 이해 확인 질문과 팀별 리뷰로 다음 주 설계물에 반영한다. | 다음 주에 이어 쓸 수정 항목이 명확한가 |

## 학생 제출물 규칙

- 계산 문제는 식, 대입값, 단위, 결론을 함께 제출한다.
- 회로·PCB 과제는 원본 캡처에 표시를 추가해 의도를 설명한다.
- 펌웨어 과제는 코드 일부만 붙이지 말고 로그 또는 파형으로 동작을 증명한다.
- AI 도구를 사용한 경우 질문, 답변 요약, 사람이 검증한 항목을 함께 남긴다.

## 원본 자료 사용 메모

원본 자료의 전동킥보드 사양은 더 큰 전압·전류의 BLDC 구동 사례다. 수업에서는 이를 AMR/로버의 좌우 휠 구동 ECU로 축소 적용하며, 실제 실습 전압과 전류 제한은 강의실 장비 기준을 우선한다.
