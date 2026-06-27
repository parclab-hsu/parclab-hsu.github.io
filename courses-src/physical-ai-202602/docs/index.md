# Physical AI — 강의 개요

!!! info "교과목 한 줄 소개"
    **NVIDIA Isaac Sim** 기반 시뮬레이션 위에서 **센서 → SLAM/자율주행 → 강화학습 → LLM 고수준 제어**까지, 실제 **Spot + ATS** 보안로봇 프로젝트를 한 학기 동안 직접 구축하는 임베디드 지능(Physical AI) 교과목입니다.

## 📌 교과목 정보

| 항목 | 내용 |
| --- | --- |
| 교과목명 | Physical AI (피지컬 AI) |
| 대상 | 한성대학교 미래모빌리티학과 3학년 |
| 학기 | 2026학년도 2학기 (202602) |
| 학점/시수 | 3학점 (주 3시간) |
| 선수과목 | 파이썬 프로그래밍, 인공지능 기초, 선형대수 |
| 개발환경 | Ubuntu 22.04 · **NVIDIA Isaac Sim 5.1 / Isaac Lab** · ROS 2 (Humble) · slam_toolbox·Nav2 · LangChain/LLM |
| 실습 플랫폼 | **Spot(4족 보행) + ATS(2축 카메라 시스템)** 시뮬레이션 |
| 평가 | 출석 10% · 실습/과제 30% · 중간 25% · 기말 프로젝트 35% |

## 🎯 교과 목표

- NVIDIA Isaac Sim에서 물리 환경과 **센서(카메라·IMU·LiDAR·Radar)** 시뮬레이션을 구성할 수 있다.
- **Isaac Lab 강화학습**으로 4족 보행 로봇의 보행 정책을 학습시킬 수 있다.
- **SLAM(slam_toolbox)·Nav2**로 지도 작성과 자율주행 파이프라인을 구축할 수 있다.
- **System-1(실행)** 단위 액션과 **System-2(LLM 플래너)** 를 설계해 자연어 명령으로 로봇을 제어할 수 있다.
- Isaac Sim–ROS 2–자율주행–AI 추론을 잇는 **현대 로봇 SW 풀스택**을 통합 프로젝트로 완성한다.

## 🗓️ 주차별 강의계획

| 주차 | 주제 | 학습 내용 | 근거 교안 |
| --- | --- | --- | --- |
| [1](week01.md) | Isaac Sim 설치·활용 | 권장 사양, 개발환경 구축, 활용 사례 | Isaac Sim 1강 |
| [2](week02.md) | 물리환경·카메라 센서 | Stage/World/Prim, RGB/Depth 카메라 | Isaac Sim 2강 |
| [3](week03.md) | 센서 (IMU·LiDAR·Radar) | RTX LiDAR, Annotator, PointCloud | Isaac Sim 3강 |
| [4](week04.md) | Isaac Lab 4족 보행 RL | MDP, Action/Observation, Height Scan | Isaac Sim 4강 |
| [5](week05.md) | Spot+ATS 시스템 구축 | URDF Import, ROS2 연동, RL 재학습 | Isaac Sim 5강 |
| [6](week06.md) | SLAM·Nav2 기본 | Odometry, Sensor Fusion, slam_toolbox | SLAM 1강 |
| [7](week07.md) | Spot+ATS SLAM 연동 1 | ROS2 브릿지, TF 트리, 자율주행 | SLAM 2강 |
| [8](week08.md) | 중간고사 | 1~7주차 종합 평가 | — |
| [9](week09.md) | Spot+ATS SLAM 연동 2 | 지도 저장·Localization·GIMP 수정 | SLAM 3강 |
| [10](week10.md) | Spot+ATS Vision | YOLOv8 detector·tracker·debug | SLAM 4강 |
| [11](week11.md) | System-1 Executor 설계 | 아키텍처, 단위 액션, Executor Node | Physical AI 1강 |
| [12](week12.md) | System-1 단위 액션 1 | move_to(Nav2)·scan 설계 | Physical AI 2강 |
| [13](week13.md) | System-1 단위 액션 2 | track 3축 통합 제어·report·return | Physical AI 3강 |
| [14](week14.md) | System-2 LLM Planner | models.py·llm_planner.py·system2_node.py | Physical AI 4강 |
| [15](week15.md) | System-2 테스트·검증 | System-1/2 통합·시나리오 A~D·고도화 | Physical AI 5강 |

## 🧭 커리큘럼 한눈에 보기

```
[Isaac Sim 기초·센서]  →  [Isaac Lab RL]  →  [SLAM·자율주행]  →  [Vision]  →  [System-1 실행]  →  [System-2 LLM]  →  [통합 검증]
   W1~3                     W4~5             W6~7,9            W10         W11~13            W14             W15
```

## 📚 참고자료

- **NVIDIA Isaac Sim 5.1.0 공식 문서** — <https://docs.isaacsim.omniverse.nvidia.com/5.1.0/index.html>
- NVIDIA Isaac Lab Documentation — <https://isaac-sim.github.io/IsaacLab/>
- ROS 2 Documentation (Humble) — <https://docs.ros.org>
- Nav2 — <https://docs.nav2.org> · slam_toolbox — <https://github.com/SteveMacenski/slam_toolbox>
- Ultralytics YOLOv8 — <https://docs.ultralytics.com> · LangChain — <https://python.langchain.com>
- 강의 교안: **NVIDIA Isaac Sim 1~5강 · SLAM 1~4강 · Physical AI 1~5강** (제작: ENGI UNIVERSE) · Spot+ATS 프로젝트 매뉴얼
- 산업 동향 연계: **매경·KAIST CAIO AI 리더스 포럼 2026** 발표자료 (Agentic AI·에이전트 신뢰성·AX) → 14·15주차 연계
