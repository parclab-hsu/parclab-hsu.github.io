# 15주차 · C ↔ ROS2 연동 · 로봇 · 기말 프로젝트
> C언어 · 미래모빌리티학과 | CLO2·CLO4·CLO5 | 자료 `docs/` · `code/ros2/`

![개념도](img/10_robot_trio.png)

## 학습 목표
- 배운 C(구조체·포인터·배열)가 로봇 통신의 핵심 코드임을 체험한다.
- C 프로그램과 ROS2 노드 간 데이터를 주고받는다(시리얼 브리지/micro-ROS).
- (캡스톤) **Arduino + C + Stella N2 로봇**으로 자율 동작을 구현·발표한다.

## 강의 흐름 (150분)
| 시간 | 활동 | 내용·자료 |
|------|------|-----------|
| 15 | 종합복습 | 배열·포인터·구조체 총정리 · 그림 `10_robot_trio.png` |
| 30 | 개념 | C↔ROS2 두 방식: 시리얼 브리지(A)/micro-ROS(B) (`15_ROS2_연동_실습.md`) |
| 35 | 시연 | `serial_proto.c`·`analyze_scan()`가 ROS2 노드에서 그대로 쓰임 `code/ros2/` |
| 40 | **로봇 실습** | Stella N2 연계 `로봇연계_StellaN2.md` — LiDAR 배열→C 판단→주행 |
| 30 | 기말 발표 | 팀별 시연·발표, 동료평가 |

## 트렌드·진로 연계
- Physical AI/SDV 큰 그림 마무리, "C는 어디로 가나"(micro-ROS·TinyML 티저).
- 후속 교과(3-1 센서처리·모터제어, 4-1 이동로봇과 ROS) 예고편으로 마무리.

## 기말 프로젝트(캡스톤)
- 주제: 텔레메트리 / 표정로봇 ROS2 제어 / 미니 자율주행 / **Stella N2 장애물 회피 주행**
- 평가: **`캡스톤_채점루브릭.md`** (C코드품질30 + 안전 게이트 + 난이도 가산 + 개인 기여도)
- 트러블슈팅: `code/ros2/microros_uno_r4/TROUBLESHOOTING.md`

## 자료
- 코드: `code/ros2/{mobility_bridge, microros_uno_r4, stella_n2_bridge}`
- 문서: `docs/15_ROS2_연동_실습.md`, `로봇연계_StellaN2.md`, `프로토콜_명세.md`
- 그림: `docs/images/{05_arch_serial_bridge,06_arch_microros,10_robot_trio}.png`

## 형성평가/기말
- ☐ 토픽 pub/sub 동작 ☐ C 로직이 실제 동작을 좌우 ☐ 안전수칙 준수 ☐ 발표·문서화
