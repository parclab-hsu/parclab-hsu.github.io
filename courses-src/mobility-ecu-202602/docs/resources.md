# 첨부자료 활용 가이드

!!! warning "저작권 유의 — 원본 자료 사용 범위 확인"
    아래 원본 첨부자료(PDF·슬라이드 미리보기)는 수업 활용 범위와 외부 배포 가능 여부를 확인해 사용한다. 공개 배포 전에는 인용 허가, 출처 표기, 자작 대체 자료 여부를 점검한다.



> 수업용 강의 페이지에서 참고할 수 있도록 핵심 PDF/XLSX 자료를 선별해 연결했다. 원본 전동킥보드 BLDC 구동 자료는 로버·우주 로버 구동 ECU 관점으로 재해석해 사용한다.

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

## 확장 자료 묶음 활용법

각 주차 메인 페이지 안에는 네 종류의 통합 확장 자료가 들어 있다. 교수자는 모든 자료를 매시간 전부 읽히기보다, 수업 목표에 맞춰 아래처럼 선택한다.

| 통합 확장 섹션 | 언제 쓰는가 | 좋은 사용 예 |
|---|---|---|
| 심화 강의노트 | 이론 설명을 늘려야 하거나 첨부자료 이미지를 자세히 해석할 때 | PDF 첫 페이지나 회로 그림 위에 전원·신호·보호 경로를 색으로 표시 |
| 실습 코칭노트 | 팀 활동 중 질문이 필요하거나 실습 증거를 표준화할 때 | 측정 조건, 예상값, 실제값, 오류 원인을 같은 표에 기록 |
| 평가·문제팩 | 10분 퀴즈, 구두 발표, 보충 문제를 만들 때 | 계산식보다 “조건과 판단 근거”를 설명하게 하는 문항 선택 |
| 현장 사례노트 | 고장 진단, 보고서 문장, 최종 발표 스토리를 만들 때 | 증상 → 가설 → 측정 → 재발 방지 순서로 사례 정리 |

!!! tip "자료를 많이 보여줄 때의 운영 요령"
    첨부 PDF, 자작 도해, 확장 노트를 한꺼번에 설명하면 학생이 길을 잃기 쉽다. 먼저 실제 이미지에서 부품이나 파형을 찾고, 다음에 자작 도해로 단순화한 뒤, 마지막에 계산식과 실습 조건을 정리한다.

## 실습 코드 연결

원격 커밋에 추가된 [실습 코드](code/README.md)는 원본 상용 펌웨어를 복제하지 않는 교육용 예제다. 8~10주차의 STM32 기초 코드와 5~7·15주차의 모터 제어 코드를 이어서 보여 주면, 학생이 “회로 설명”과 “실제로 도는 코드”를 같은 구조로 이해할 수 있다.

| 코드 흐름 | 연결 주차 | 확인할 핵심 |
|---|---|---|
| GPIO LED | 8주차 | RCC 클럭, MODER, ODR/BSRR |
| EXTI Switch | 9주차 | 인터럽트 진입, 플래그 클리어, ISR 최소화 |
| ADC·Timer·UART | 10주차 | 샘플링 주기, PWM 주기, 로그 주기 |
| Hall 6-step | 5·6주차 | 홀 상태, 상 전류 경로, 금지 상태 |
| PI Control | 7주차 | 포화, anti-windup, 로그 기반 튜닝 |
| Scheduler 통합 | 15주차 | SysTick, 상태기계, 안전정지 |

## 학생 제출물 규칙

- 계산 문제는 식, 대입값, 단위, 결론을 함께 제출한다.
- 회로·PCB 과제는 원본 캡처에 표시를 추가해 의도를 설명한다.
- 펌웨어 과제는 코드 일부만 붙이지 말고 로그 또는 파형으로 동작을 증명한다.
- AI 도구를 사용한 경우 질문, 답변 요약, 사람이 검증한 항목을 함께 남긴다.

## 원본 자료 사용 메모

원본 자료의 전동킥보드 사양은 더 큰 전압·전류의 BLDC 구동 사례다. 수업에서는 이를 로버의 좌우 휠 구동 ECU로 축소 적용하며, 실제 실습 전압과 전류 제한은 강의실 장비 기준을 우선한다.

## NotebookLM 기반 우주 로버·AX 시각자료

새로 첨부된 NotebookLM PDF는 사이트에 원문 PDF를 직접 배포하지 않고, 강의에 바로 쓸 수 있는 대표 슬라이드 이미지만 `figures/notebooklm-previews/`에 추출해 주차별 자료에 연결했다.

| 자료 | 강의 적용 위치 | 핵심 활용 |
|---|---|---|
| `Physical_AI_Space_Rover_ECU_Engineering.pdf` | 개요, AX, 1·4·8·13·15주차 | Physical AI 개편 철학, 15주 포트폴리오, 최종 미션 |
| `Space_Rover_ECU_Design (1).pdf` | 3·5·6·8·10·12주차 | 모터 모델, BLDC, 인버터, STM32/DMA/Timer |
| `Space_Rover_AX_Pipeline.pdf` | 9·10·11주차, AX 페이지 | JTAG/SWD, DMA-ADC, Timer 동기화, NVIC |
| `Mobility_ECU_Blueprint.pdf` | 2·4·12·13·14주차 | 임피던스, 그라운드, EMI, 레이아웃, Kelvin 측정 |
| `Edge_AI_Rover_Integration.pdf` / `Space_Rover_Edge_AI.pdf` | 7·14·15주차 | 데이터 기반 제어, Edge AI 전처리, 자율 루프 |
| `Space_Rover_Final_Validation.pdf` | 15주차 | V-Model, 미션 시나리오, 평가 루브릭, 최종 보고서 |
| `Space_Rover_ECU_Design_and_Debugging.pdf` | 11·15주차 | HSI, 설계 리뷰, JTAG/GDB, Logic Analyzer 디버깅 |
