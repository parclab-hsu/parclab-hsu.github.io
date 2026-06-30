# 15주차 · C ↔ ROS2 · 로봇 · 기말 프로젝트
> C언어 · 미래모빌리티학과 | CLO2·CLO4·CLO5

![3종 연계](img/10_robot_trio.png)

## 학습 목표
- 배운 C(구조체·포인터·배열)가 로봇 통신의 핵심 코드임을 체험한다.
- C 프로그램과 ROS2 노드가 데이터를 주고받게 한다.
- (캡스톤) **Arduino + C + Stella N2 로봇**으로 자율 동작을 구현·발표한다.

---

## 1. 이론

### 1.1 ROS2와 C의 관계
- ROS2는 로봇 SW의 표준 미들웨어. 노드들이 **토픽(topic)** 으로 데이터를 주고받는다(발행 publish / 구독 subscribe).
- C 진입점: **rcl**(ROS2의 C 코어), **rclc**(MCU용 순수 C, micro-ROS). → 우리가 배운 C가 그대로 쓰인다.

### 1.2 두 가지 연동 방식
=== "방식 A · 시리얼 브리지 (기본)"
    보드는 시리얼 송수신, PC의 C/C++ 브리지가 ROS2로 변환. 설치 간단, C 학습(파싱·구조체) 집중.
    핵심 C 함수: `parse_sensor_line()`(구조체로 파싱), `analyze_scan()`(배열 분석).

=== "방식 B · micro-ROS (도전)"
    보드가 직접 ROS2 노드. **rclc=순수 C**. UNO R4 공식 지원(RAM 32KB라 경량).

### 1.3 LiDAR 배열 → C로 판단 (자율주행의 심장)
Stella N2의 LiDAR는 거리 **배열**을 `/scan`으로 보낸다. 이를 C로 분석해 주행을 정한다.
```c
ScanResult analyze_scan(const float *ranges, int n, float stop_dist) {
    // 1) 배열 순회로 최솟값(가장 가까운 거리) 탐색
    // 2) 거리·방향 → 전진(F)/좌회피(L)/우회피(R)/정지(S)
}
```
> 배운 것 총동원: **배열 순회 + 조건 판단 + 구조체 반환 + 포인터 인자**.
> 상세: [C↔ROS2 & Stella N2 로봇](ros2-robot.md)

---

## 2. 핵심 용어 정리
| 용어 | 설명 |
|------|------|
| ROS2 | 로봇 SW 표준 미들웨어 |
| 노드/토픽 | 실행 단위 / 데이터 통로 |
| publish/subscribe | 발행 / 구독 |
| `/scan`, `/cmd_vel` | LiDAR 거리 / 주행 속도 토픽 |
| 브리지 | 시리얼↔ROS2를 잇는 프로그램 |
| micro-ROS / rclc | MCU용 ROS2 / 순수 C API |

---

## 3. 실습

### 실습 15-1 · 종합 복습
배열·포인터·구조체 총정리.

### 실습 15-2 · C↔ROS2 연동
시리얼 브리지로 보드 ↔ ROS2 토픽 pub/sub 확인.

### 실습 15-3 · 로봇 캡스톤
Stella N2 LiDAR(`/scan`) → `analyze_scan()` → 주행(`/cmd_vel`) + 아두이노 LED 표정.

!!! warning "안전 최우선"
    로봇 바퀴를 띄워 받침대에서 먼저 시험. 속도는 작게, 정지거리는 크게.

---

## 4. 기말 프로젝트(캡스톤)
- 주제 예: 텔레메트리 / 표정로봇 ROS2 제어 / 미니 자율주행 / **Stella N2 장애물 회피 주행**
- 평가: C 코드 품질(최대 비중) + 기능 + 연동 + **안전(게이트)** + 발표 + AI 리터러시 + 난이도 가산.
- 후속 교과(센서처리와 모터제어, 이동로봇과 ROS)의 예고편.

## 5. 참조
- [C↔ROS2 & Stella N2 로봇](ros2-robot.md) · [AI 활용 가이드](ai-literacy.md) · [2026 트렌드 검토](review.md)
- 코드: `code/ros2/{mobility_bridge, microros_uno_r4, stella_n2_bridge}`

## 형성평가 체크포인트
- [ ] 토픽 pub/sub 동작 · [ ] C 로직이 실제 동작을 좌우 · [ ] 안전수칙 준수 · [ ] 발표·문서화

---

## 연습문제
1. ROS2에서 데이터를 보내는 것과 받는 것을 영어 용어로?
2. Stella N2에서 LiDAR 거리 데이터 토픽과 주행 명령 토픽의 이름은?
3. micro-ROS가 보드에서 사용하는 **순수 C** 클라이언트 API의 이름은?

??? success "정답 및 해설"
    1. **publish(발행)** / **subscribe(구독)**.
    2. `/scan` (LiDAR) / `/cmd_vel` (주행 속도 명령).
    3. **rclc** — rcl(C 코어) 위의 MCU용 C API.
