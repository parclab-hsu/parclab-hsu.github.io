# Physical AI — 강의 개요

!!! info "교과목 한 줄 소개"
    **NVIDIA Isaac Sim** 기반 시뮬레이션 위에서 **센서 → SLAM/자율주행 → 강화학습 → LLM 고수준 제어**까지, 실제 **Spot + ATS** 보안로봇 프로젝트를 한 학기 동안 직접 구축하는 임베디드 지능(Physical AI) 교과목입니다.

!!! abstract "Notion으로도 볼 수 있습니다"
    같은 강의자료를 Notion 페이지로도 공개하고 있습니다 — [📗 Physical AI · 2026-2학기 (Notion)](https://app.notion.com/p/38f495ed919b8106ad14e27bb9888996)
    하위 주차·모듈 페이지가 함께 열립니다. 이 사이트와 내용은 동일하니 편한 쪽을 쓰세요.

## 🎒 수강생 시작 가이드 (먼저 읽으세요)

**이 사이트는 이렇게 씁니다** — 왼쪽 메뉴의 **강의 계획 (15주)** 에서 그 주차 페이지 하나만 열면 그 주 내용이 전부 들어 있습니다.

각 주차 페이지는 항상 같은 순서로 구성됩니다.

| 섹션 | 무엇인가 | 언제 보나 |
| --- | --- | --- |
| ⏱️ 3시간 구성 | 그 주 1·2·3교시 계획 | 수업 전 훑어보기 |
| 본문 (1~N교시) | 개념 설명 + 실습 코드 | 수업 중·복습 |
| ✅ 체크포인트 | 이해했는지 자가 점검 | 수업 직후 |
| 📊 평가 루브릭 | 무엇으로 점수가 매겨지는가 | 과제 시작 전 |
| 📖 핵심 용어 설명 | 처음 보는 용어 정의 | 막힐 때마다 |
| 📝 N주차 과제 | 그 주 제출 과제 | 과제 할 때 |
| 🖼️ 원본 강의 슬라이드 | 수업에 쓴 슬라이드 원본 | 복습·시험 대비 |

### 📅 학습 순서

```text
1~3주차          4~5주차        6~7·9주차      10주차       11~13주차       14주차      15주차
Isaac Sim 기초   Isaac Lab RL   SLAM·자율주행   Vision      System-1 실행   System-2 LLM  통합 검증
센서 시뮬레이션    Spot+ATS 구축   (8주차 중간고사)  YOLOv8      단위 액션        플래너       기말 데모
```

!!! tip "순서대로 하세요"
    11~13주차 과제는 앞 주차의 코드를 이어서 씁니다. 중간을 건너뛰면 뒤에서 막힙니다.

### 🖥️ 수업 전 준비 (1주차 전까지)

- [ ] **RTX 계열 NVIDIA GPU**가 있는 PC 확인 — Isaac Sim은 GPU 없이 실행되지 않습니다 (아래 시스템 사양 참고)
- [ ] Ubuntu 22.04 LTS 설치 (또는 실습실 PC 사용 확인)
- [ ] 본인 PC 사양을 권장 사양과 비교해 정리 — **과제 1의 제출물**입니다
- [ ] 선수 지식 점검: 파이썬 기초 문법, 선형대수(행렬·좌표 변환), 인공지능 기초

설치 절차는 [1주차 페이지](week01.md)에 단계별로 있습니다. 미리 혼자 설치하다 막혀도 괜찮습니다 — 막힌 지점을 기록해 두면 그대로 과제 1의 트러블슈팅 항목이 됩니다.

### 📝 과제·평가

- 과제 15개와 제출 규정은 [📋 과제 · 평가 통합 안내](assignments.md)에 한눈에 정리되어 있습니다.
- 기본 마감은 **다음 주차 강의 시작 전까지 LMS 업로드**입니다 (15주차만 기말 발표 시 제출).
- 제출물은 ① 코드/설정 `zip` ② 보고서 `PDF`(표지에 학번·이름·과제명) ③ 실행 결과 캡처/영상 3종입니다.

### ❓ 막혔을 때

1. 그 주차 페이지의 **📖 핵심 용어 설명**에서 모르는 용어부터 확인
2. [복사용 실습 코드](code-snippets.md)에서 명령어를 그대로 복사해 재시도
3. 공식 문서 확인 — 각 주차 하단 **🔗 출처 및 참고자료** / **📘 Isaac Sim 5.1.0 공식 문서**
4. 그래도 안 되면 **증상 → 실행한 명령 → 에러 메시지 전문**을 정리해 질문하세요. 이 형식이면 답변이 빠릅니다.

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

!!! tip "복사 가능한 실습 코드"
    슬라이드 이미지 안에 포함된 명령어와 예제 소스는 [복사용 실습 코드](code-snippets.md) 페이지에 주차별 코드블록으로 따로 모았습니다.

## 💻 시스템 사양

!!! warning "GPU 필수"
    NVIDIA Isaac Sim / Isaac Lab은 **RTX 계열 NVIDIA GPU**가 필요합니다(RTX 레이트레이싱·CUDA 사용). 강화학습·VLA 학습 시 **VRAM과 RAM**이 성능을 크게 좌우합니다.

| 구분 | 교안 권장 환경 | Isaac Sim 5.1 최소 | Isaac Sim 5.1 권장 |
| --- | --- | --- | --- |
| 운영체제 | Ubuntu 22.04 LTS | Ubuntu 22.04 / 20.04, Windows 10·11 | Ubuntu 22.04 LTS |
| CPU | Intel i9-14900K | Intel i7(7세대)·AMD Ryzen 5 이상 | Intel i9 · AMD Ryzen 9 |
| 메모리(RAM) | 64 GB | 32 GB | 64 GB |
| 그래픽(GPU) | RTX 4090 | RTX 지원 GPU · VRAM 8 GB | RTX 4080/4090 · VRAM 16 GB↑ |
| 저장장치 | SSD | SSD 50 GB↑ | NVMe SSD 100 GB↑ |
| 드라이버 | 최신 NVIDIA 드라이버 | 권장 드라이버 버전 이상 | 최신 스튜디오/프로덕션 드라이버 |

- **환경 관리**: Miniconda(권장) / Conda 가상환경 — 프로젝트별 Python·패키지를 독립 관리(`environment.yml`로 환경 복제)
- **소프트웨어 스택**: NVIDIA Isaac Sim 5.1 · Isaac Lab · ROS 2 Humble · slam_toolbox·Nav2 · PyTorch · LangChain/LLM · (심화) LeRobot
- 정확한 요구사항은 공식 문서를 확인하세요 → [Isaac Sim 5.1.0 System Requirements](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/requirements.html)

!!! tip "GPU가 없거나 사양이 낮다면"
    - 강화학습/VLA **학습**은 GPU가 필수지만, 일부 **추론·평가**는 시간이 더 걸려도 진행 가능합니다.
    - 클라우드 GPU(예: 워크스테이션 원격 접속)나 학과 실습실 장비를 활용하세요. LeRobot의 **SmolVLA 평가**처럼 가벼운 작업부터 시작하면 좋습니다.

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

## 🧩 심화 트랙 — DLI 워크샵 (선택)

본 강의(Isaac Sim · SLAM · Physical AI) 외에, **NVIDIA DLI(Deep Learning Institute) 워크샵** 자료를 심화 트랙으로 활용할 수 있습니다. 자율주행·매니퓰레이션·합성데이터 파이프라인을 Isaac Sim에서 더 깊이 다룹니다.

| 모듈 | 주제 | 핵심 |
| --- | --- | --- |
| USD for Robotics | 로봇 자산을 USD로 | Jetbot·UR·Robotiq 설명 모델, USD 구조 |
| SIL (Software-in-the-Loop) | ROS 2 ↔ Isaac Sim 통합 검증 | Nova Carter Nav2 창고 주행, Panda MoveIt 매니퓰레이션 |
| Isaac ROS | GPU 가속 ROS 2 인지 | Isaac ROS 패키지·파이프라인 |
| SMMG | 합성 데이터·모바일 매니퓰레이션 생성 | HDF5 데이터셋·체크포인트, 모방학습 데이터 |

!!! note "연계"
    SIL의 **Nav2 자율주행**은 6·7·9주차, **MoveIt 매니퓰레이션**과 **SMMG 합성 데이터**는 11~15주차(System-1/2)·[LeRobot 모듈](lerobot.md)과 자연스럽게 이어집니다. 워크샵 실행은 Linux/ROS 2 Humble 환경에서 진행하세요.

## 📚 참고자료

- **NVIDIA Isaac Sim 5.1.0 공식 문서** — <https://docs.isaacsim.omniverse.nvidia.com/5.1.0/index.html>
- NVIDIA Isaac Lab Documentation — <https://isaac-sim.github.io/IsaacLab/>
- NVIDIA Isaac ROS (DLI 심화) — <https://nvidia-isaac-ros.github.io/>
- ROS 2 Documentation (Humble) — <https://docs.ros.org>
- Nav2 — <https://docs.nav2.org> · slam_toolbox — <https://github.com/SteveMacenski/slam_toolbox>
- Ultralytics YOLOv8 — <https://docs.ultralytics.com> · LangChain — <https://python.langchain.com>
- 강의 교안: **NVIDIA Isaac Sim 1~5강 · SLAM 1~4강 · Physical AI 1~5강** (제작: ENGI UNIVERSE) · Spot+ATS 프로젝트 매뉴얼
- 산업 동향 연계: **매경·KAIST CAIO AI 리더스 포럼 2026** 발표자료 (Agentic AI·에이전트 신뢰성·AX) → 14·15주차 연계
