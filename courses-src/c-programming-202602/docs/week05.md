# 5주차 · 조건문 (if / switch) + LED 표정
> C언어 · 미래모빌리티학과 | CLO1·CLO3 | 교재 Ch06 · 자료 `lectures/05`

![개념도](img/07_led_matrix_coord.png)

## 학습 목표
- `if~else if~else`, 중첩 조건, `switch-case`, 삼항 연산자를 사용한다.
- 거리에 따른 정지/감속/주행 판단 로직을 작성한다.
- **아두이노 LED 매트릭스**에 조건별 표정을 출력한다.

## 강의 흐름 (150분)
| 시간 | 활동 | 내용·자료 |
|------|------|-----------|
| 10 | 복습/도입 | 연산자(관계·논리) 복습 |
| 40 | 개념 | 조건문 전반, switch, 삼항 (Ch06) `lectures/05` |
| 25 | 시연 | `ex03_obstacle.c` 거리→상태 판단 |
| 50 | **아두이노 실습** | 조건별 표정 `code/arduino/05_showface/` · 그림 `07_led_matrix_coord.png` |
| 25 | 정리 | "장애물 판단=자율주행 기초" 연결, 과제 공지 |

## 모빌리티 연계
- 거리센서 → 정지/감속/주행은 15주차 로봇 `analyze_scan()`의 축소판.

## 과제 (5주차)
- 점수→학점 switch(연습 3-1), 아두이노 거리별 LED 표정.

## 자료
- `lectures/05/` (조건문, 조건문 실습, 아두이노 MatrixLED PDF/PPTX)
- 코드 `code/arduino/05_showface/sketch_showface.ino` · 그림 `docs/images/07_led_matrix_coord.png`

## 형성평가
- ☐ if/switch 선택 기준 ☐ LED 표정 출력 성공 ☐ 경계값(15/30) 처리
