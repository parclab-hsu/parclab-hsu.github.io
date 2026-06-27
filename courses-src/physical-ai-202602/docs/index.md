# Physical AI — 강의 개요

!!! info "교과목 한 줄 소개"
    인공지능을 물리적 신체(로봇)에 구현하여 **인식·학습·제어**를 통합하는 임베디드 지능 교과목입니다. 시뮬레이션 기반 실습 중심으로 ROS 2부터 강화학습·VLA까지 한 학기 동안 직접 구현합니다.

## 📌 교과목 정보

| 항목 | 내용 |
| --- | --- |
| 교과목명 | Physical AI (피지컬 AI) |
| 대상 | 한성대학교 미래모빌리티학과 3학년 |
| 학기 | 2026학년도 2학기 (202602) |
| 학점/시수 | 3학점 (주 3시간) |
| 선수과목 | 파이썬 프로그래밍, 인공지능 기초, 선형대수 |
| 개발환경 | Ubuntu 22.04 · ROS 2 (Humble) · Gazebo · PyTorch |
| 실습 환경 | **전 주차 Gazebo 시뮬레이션 기준으로 통일** |
| 평가 | 출석 10% · 실습/과제 30% · 중간 25% · 기말 프로젝트 35% |

## 🎯 교과 목표

- 물리 세계에서 작동하는 AI(임베디드 지능)의 개념과 구성요소를 이해한다.
- ROS 2 기반으로 로봇의 인식–판단–제어 파이프라인을 구현할 수 있다.
- 시뮬레이션 환경에서 강화학습·모방학습을 적용하고 Sim-to-Real 개념을 설명할 수 있다.
- VLA(Vision-Language-Action) 등 최신 Foundation Model 기반 로봇 지능을 체험한다.
- 인식·학습·제어를 통합한 End-to-End Physical AI 시스템을 팀 프로젝트로 완성한다.

## 🗓️ 주차별 강의계획

| 주차 | 주제 | 학습 내용 | 실습 |
| --- | --- | --- | --- |
| [1](week01.md) | Physical AI 개요 | 임베디드 지능, Digital vs Physical AI | 개발환경 구축 |
| [2](week02.md) | ROS 2 기초 | 노드·토픽·서비스·액션 | 퍼블리셔/구독자 작성 |
| [3](week03.md) | 좌표계와 기구학 | 강체 변환·TF2·FK/IK | TF 브로드캐스트·RViz |
| [4](week04.md) | 센서와 인식 | LiDAR·카메라·IMU 원리 | 센서 토픽 구독·시각화 |
| [5](week05.md) | 로봇 시뮬레이션 | Gazebo·URDF·물리엔진 | 로봇 모델링·스폰 |
| [6](week06.md) | 이동로봇 제어 | 차동구동 운동학·Odometry | Teleop·주행 노드 |
| [7](week07.md) | SLAM과 자율주행 | 점유격자지도·SLAM·Nav2 | 지도작성·자율주행 |
| [8](week08.md) | 중간고사 | 1~7주차 종합 평가 | 이론+실기 평가 |
| [9](week09.md) | 컴퓨터 비전·딥러닝 | CNN·객체탐지(YOLO) | YOLO ROS2 연동 |
| [10](week10.md) | 로봇 매니퓰레이션 | 로봇팔 기구학·MoveIt | 모션플래닝·픽앤플레이스 |
| [11](week11.md) | 강화학습 기초 | MDP·정책·PPO·보상설계 | PPO 정책 학습 |
| [12](week12.md) | 모방학습 | Behavior Cloning·Diffusion Policy | 시연 수집·BC 학습 |
| [13](week13.md) | Sim-to-Real | Reality Gap·도메인 랜덤화 | 도메인 랜덤화 실험 |
| [14](week14.md) | Foundation Models & VLA | LLM·VLM·VLA | 언어명령 제어 체험 |
| [15](week15.md) | System-2 테스트 & 검증 | System-1/System-2 통합·시나리오 검증 | 통합 프로젝트·시연·발표 |

## 🖥️ 실습 환경 안내

!!! note "공통 실습 환경"
    본 강의 실습은 전 주차 **Gazebo 시뮬레이션** 기준으로 통일합니다. 실물 로봇 없이 `~/cluad_ws` 워크스페이스에서 모두 수행 가능합니다. (강화학습·모방학습 주차는 가벼운 Gymnasium 시뮬 사용)

## 📚 참고자료

- ROS 2 Documentation (Humble) — <https://docs.ros.org>
- NVIDIA Isaac Sim / Isaac Lab Documentation
- *Probabilistic Robotics*, Thrun et al.
- OpenVLA / RT-2 논문 및 Open X-Embodiment 데이터셋
