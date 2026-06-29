# DLI 심화 · 합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos)

!!! abstract "학습목표"
    Physical AI를 위한 **합성 데이터 생성(SDG)** 파이프라인을 이해한다. 소수의 사람 시연을 **GR00T-Mimic**으로 수백~수천 개의 합성 궤적으로 증강하고, 이를 **모방학습(Behavioral Cloning)** 으로 학습시켜 큐브 쌓기 과제를 수행하는 정책을 만든다. 나아가 **NVIDIA Cosmos** World Foundation Model로 영상을 증강해 sim-to-real 격차를 줄이는 흐름까지 살펴본다.

!!! quote "출처 (Source)"
    본 모듈은 **NVIDIA «Isaac for Accelerated Robotics» (GTC Paris 2025) / NVIDIA DLI 코스 C-OV-05 — Part 4: Synthetic Data Generation for Imitation Learning using NVIDIA Isaac Lab and Cosmos** (Alexander Schwarz, Solutions Architect – Robotics, NVIDIA)의 강의 자료를 바탕으로 재구성하였습니다.

## ⏱️ 구성

| 단계 | 내용 |
| --- | --- |
| 개요 | Physical AI · 로보틱스 데이터 과제 · Isaac Lab |
| **Module 1** | GR00T-Teleop(XR 디바이스)으로 **시연 데이터 수집** |
| **Module 2** | **GR00T-Mimic**으로 데이터 주석(Annotation) & 합성 데이터 생성 |
| **Module 3** | Isaac Lab에서 **모방학습(BC-RNN)** 으로 정책 학습·배포 |
| 심화 | **Cosmos** World Foundation Model로 영상 증강 · GR00T-N1 |

!!! note "실습 과제 (Goal of the lab)"
    **3개의 큐브를 차례로 쌓아 올리는** 로봇을 학습시킨다. Franka 로봇 + Isaac Sim 시뮬레이션 환경에서 진행한다.

![Part 4 타이틀](img/dli-smmg/s04.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 04 (출처: NVIDIA GTC Paris 2025)
///

## 1. Physical AI와 데이터 과제

AI는 **Perception AI → Generative AI → Agentic AI → Physical AI** 로 진화하고 있습니다. Physical AI는 물리 세계에서 동작하므로 개발이 특히 어렵습니다.

- **실세계 데이터 수집 비용이 큼** — 방대하고 고품질인 데이터셋을 현실에서 모으는 일은 지루하고, 시간이 오래 걸리며, 비용이 막대합니다.
- **물리 테스트는 위험하고 비쌈** — 실제 로봇으로 반복 시험하는 것은 안전·비용 측면에서 부담이 큽니다.

NVIDIA는 Physical AI 구축을 위한 **3대의 컴퓨터**를 제시합니다.

| 컴퓨터 | 역할 |
| --- | --- |
| **NVIDIA DGX** | 모델 학습 |
| **NVIDIA Omniverse + Cosmos (RTX PRO)** | 시뮬레이션·합성 데이터 생성 |
| **NVIDIA Jetson AGX** | 로봇 온보드 추론(배포) |

!!! info "Physical AI Is Born in Simulation"
    로보틱스 데이터는 **인터넷 영상(사전학습)** 과 **사람 시연(후학습)** 만으로는 부족합니다. **물리 시뮬레이션에서의 합성 데이터 생성(SDG)과 강화학습**이 이 간극을 메웁니다.

![3대의 컴퓨터로 만드는 Physical AI](img/dli-smmg/s10.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 10 (출처: NVIDIA GTC Paris 2025)
///

## 2. Isaac Lab — 로봇 학습 프레임워크

**Isaac Lab**은 시뮬레이션 우선(Simulation-First) 접근으로 로봇 학습을 가능하게 하는 프레임워크입니다. 그 아래에 **Isaac Sim**(테스트·시뮬레이션)과 **NVIDIA Omniverse / OpenUSD · RTX · PhysX** 플랫폼이 있습니다.

- **워크플로**: Direct-Based Workflow · Manager-Based Workflow
- **학습 알고리즘**: 강화학습(RL) · 모방학습(IL)
- **에셋·환경**: Actuators, Controllers, Sensors, Terrain Generation
- **데이터/센서/유틸**: SDG, Annotations, Randomization, Writers, Pose Estimation, 스테레오·RGBD·Lidar·IMU·Contact 센서
- **인터페이스**: ROS / ROS 2 / Python / OmniGraph / 커스텀, URDF·CAD·Gazebo·MuJoCo

> 코드: <https://github.com/isaac-sim/IsaacLab>

![Isaac Lab 프레임워크 구조](img/dli-smmg/s16.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 16 (출처: NVIDIA GTC Paris 2025)
///

### 로봇 학습이란

- **로봇 학습(Robot Learning)**: 데이터와 환경 상호작용을 통해 로봇이 스스로 과제를 배우게 하는 AI 분야. 수동 프로그래밍을 줄이고 변화하는 환경에 적응하게 합니다.
- **모방학습(Imitation Learning)**: 사람 등의 **시연을 모방**하여 학습 (예: 조립 작업, 로코모션).
- **강화학습(Reinforcement Learning)**: **시행착오와 보상 최대화**로 학습 (예: 파지, 로코모션, 복잡한 과제).

## 3. 모방학습(Imitation Learning)

!!! question "왜 모방학습인가?"
    - **장점**: 보상 정책(reward policy)을 정의하는 것보다 **시연을 녹화하는 편이 더 단순**할 수 있다.
    - **도전 과제**: 완벽한 시연을 만들기 어렵고, 예기치 못한 상황에 로봇이 취약할 수 있다. 또 현실에서 대규모 고품질 데이터를 모으는 일은 지루·고비용이다.
    - **해법**: **물리적으로 정확한 시뮬레이션에서 생성한 합성 데이터**로 데이터 수집을 가속한다.

![모방학습이란](img/dli-smmg/s22.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 22 (출처: NVIDIA GTC Paris 2025)
///

### Isaac GR00T로 데이터 10배 증폭

Isaac GR00T는 휴머노이드 로보틱스를 위한 범용 로봇 파운데이션 모델·데이터 파이프라인 플랫폼입니다. **수십 개의 사람 시연을 100만 배(1M X) 학습 데이터로** 증폭합니다.

```text
수십 개 시연  →  수백 개 합성 모션  →  100만 X 학습 데이터
(GR00T-Teleop)   (GR00T-Mimic)       (GR00T-Gen 3D)
```

| 도구 | 역할 |
| --- | --- |
| **Isaac Lab / Omniverse** | 데이터 수집 가속(Expedite Data Collection) |
| **GR00T-Mimic** | 더 빠른 반복(Iterate Faster) |
| **Cosmos** | sim-to-real 격차 감소(Reduce Sim-to-Real Gap) |

### SMMG 블루프린트 (합성 조작 모션 생성)

1. 사람 시연으로부터 **데이터셋 생성**
2. **GR00T-Mimic** 으로 합성 데이터 생성
3. **GR00T-Gen** 으로 합성 데이터셋 스케일업
4. 학습된 모델 **배포(Deploy)**

![GR00T로 시연을 1M X로 증폭](img/dli-smmg/s30.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 30 (출처: NVIDIA GTC Paris 2025)
///

## 4. 과제 정의 — 관측/행동 공간

학습 목표는 로봇이 과제를 완수하도록 **정답(ground-truth) 관측-행동 쌍의 집합을 모방**하는 에이전트를 학습시키는 것입니다.

- **정책 모델(Policy Model)**: 출력단에 **GMM(Gaussian Mixture Model)** 레이어를 둔 **LSTM 기반 순환 신경망(RNN)**
- **알고리즘**: **robomimic** 스위트의 **Behavioral Cloning-RNN (BC-RNN)**

추론·테스트 경로: `Model → Action → Inverse Kinematics Controller → Joint Positions → PD Controller`

### 관측 공간(Observation Space) / 행동 공간(Action Space)

| Observation Space | Action Space |
| --- | --- |
| End-effector(EEF) XYZ 위치 | EEF Delta XYZ 위치 |
| EEF 자세(쿼터니언) | EEF Delta Roll/Pitch/Yaw |
| 그리퍼 위치(1=열림 / 0=닫힘) | 그리퍼 행동(열기/닫기) |
| 큐브 절대 포즈 | |
| EEF와 각 큐브 간 상대 위치 | |
| 큐브 쌍 간 상대 포즈 (cube1–cube2, cube2–cube3) | |

!!! note "이종(heterogeneous) 공간"
    포즈는 **연속값**, 그리퍼 행동은 **이산값**입니다. 데이터 파이프라인과 학습 프레임워크는 이러한 **연속·이산이 섞인 이종 공간을 자동으로 처리**합니다.

![관측/행동 공간 정의](img/dli-smmg/s38.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 38 (출처: NVIDIA GTC Paris 2025)
///

## 5. Module 1 — XR 텔레오퍼레이션으로 시연 수집

**Apple Vision Pro(AVP)** 등 XR 디바이스로 Isaac Sim 안의 로봇을 원격 조작하여 시연을 수집합니다.

```text
Apple Vision Pro  ──(CloudXR)──>  GPU 가속 시스템 + Isaac Lab
                                  (Isaac XR Teleop / CloudXR Runtime)
```

1. **CloudXR로 AVP를 Isaac Sim에 연결**
2. Isaac Sim과 AVP 간 **텔레오퍼레이션 통신 수립**
3. AVP로 **텔레오퍼레이션 시연 캡처**

지원 디바이스: **Apple Vision Pro · 키보드 · SpaceMouse**

!!! tip "성공적인 시연을 위한 팁"
    좋은 데이터가 좋은 정책을 만듭니다. 우선은 **성공적인 시연 2개**만 모으면 됩니다.

    1. **짧게** — 시연이 짧을수록 정책이 내려야 할 결정이 줄어 학습이 쉬워집니다.
    2. **직선 경로** — 임의 축을 따라가지 말고 목표를 향해 곧장 움직이세요.
    3. **멈추지 말 것** — 부드럽고 연속적인 동작이 정책이 배우기 쉽습니다.

![Apple Vision Pro 텔레오퍼레이션](img/dli-smmg/s46.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 46 (출처: NVIDIA GTC Paris 2025)
///

## 6. Module 2 — GR00T-Mimic으로 합성 데이터 생성

**GR00T-Mimic**은 텔레오퍼레이션 시연으로부터 모션 데이터를 생성하는 견고한 워크플로입니다. 소수의 사람 시연을 외삽(extrapolate)해 **방대한 합성 모션 궤적**을 만듭니다.

- 데이터 수집 시간을 **100배 단축**
- 사람 시연 **10개만으로 직접 학습**하면 성공률이 거의 없지만, 이 방식은 **84% 이상의 성공률** 달성

### Step 1 — 데이터 주석(Annotation)

복잡한 과제를 다룰 수 있는 **하위 과제(subtask)** 로 분해합니다. 큐브 쌓기 예시:

- **첫 번째 하위 과제**: 빨간 큐브를 **파지** (객체 기준 = 빨간 큐브)
- **두 번째 하위 과제**: 빨간 큐브를 파란 큐브 **위에 놓기** (객체 기준이 파란 큐브로 이동)

### Step 2 — 데이터 생성(Generation)

- 물체·로봇 위치 등 **장면 초기 조건을 무작위화(randomize)**
- 생성 알고리즘이 캡처한 시연을 **분할·변환**하여 새로운 조건에서의 샘플을 생성
- **보간(interpolation)** 으로 합성 궤적을 부드럽고 맥락에 맞게 생성
- 생성된 데이터를 **평가·정제**하여 학습 기준을 충족시킴

```text
Human Demos → Annotation Tooling → Annotated Demos
   → GR00T-Mimic (+ Isaac Lab 디지털 트윈/환경 정의)
   → Successful Demos → Human + Generated Demos
```

![GR00T-Mimic 하위 과제 주석·데이터 생성](img/dli-smmg/s50.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 50 (출처: NVIDIA GTC Paris 2025)
///

## 7. Module 3 — 모방학습으로 정책 학습·배포

### Behavioral Cloning 알고리즘

전문가 행동을 모방하도록 학습하는 **지도학습** 기법입니다.

1. **데이터 수집** — 전문가가 과제를 수행하며 상태-행동(state-action) 쌍을 시연 데이터로 수집
2. **지도학습** — 수집한 데이터셋으로 상태(관측) → 행동을 매핑하도록 모델 학습
3. **추론(실행)** — 학습된 모델이 새 관측에 대해 행동을 예측, 에이전트가 자율적으로 과제 수행

### 모델 아키텍처

**2-layer LSTM-RNN + 출력단 GMM 레이어**

- **LSTM-RNN**: 시간에 따른 행동 시퀀스를 모델링. 장기 의존성에 적합("기억" 메커니즘 보유).
- **GMM**: 여러 정규분포의 혼합을 표현하는 확률 모델. 단일 결정값 대신 **확률을 가진 여러 결과**를 생성.

### 학습 설정 및 평가

| 항목 | 값 |
| --- | --- |
| Dataset Points | 1000 |
| Iterations | 2000 |
| Batch size | 100 |
| Optimizer | Adam |
| LSTM-RNN Layers | 2 |
| LSTM-RNN Hidden Dim | 400 |
| GMM 활성화 함수 | Softplus |

!!! success "결과"
    - 학습 속도 약 **50 iterations/sec** (RTX 4090 기준 약 **0.5시간** 학습).
    - **50회 시도 평균** 으로 스택 과제 **84% 성공률** 달성 (Epoch 100 정책).

> 설정 파일: `IsaacLab/.../manager_based/manipulation/stack/config/franka/agents/robomimic/bc_rnn_low_dim.json`
> BC-RNN 참고: <https://robomimic.github.io/docs/introduction/implemented_algorithms.html#bc-rnn>

![BC-RNN 학습 설정과 결과](img/dli-smmg/s56.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 56 (출처: NVIDIA GTC Paris 2025)
///

### 워크플로 정리 & 이점

이번 실습에서 배운 것: **AVP로 텔레오퍼레이션 시연 수집 → GR00T-Mimic 합성 데이터로 데이터셋 확장 → 모델 학습 후 Isaac Sim의 Franka 로봇에 배포.**

- **시간 절약** — 데이터 수집을 수 시간에서 수 분으로 단축, 높은 성공률 유지
- **사람 노력 감소** — 더 적은 시연으로 높은 성공률
- **확장성·비용 효율** — 방대한 수작업 없이 다양한 데이터셋 생성
- **다용도** — 큐브 쌓기부터 정밀 조작까지, 매니퓰레이터·휴머노이드 모두 지원
- **사실성 향상** — **NVIDIA Cosmos**로 합성 이미지를 포토리얼하게 증강해 sim-to-real 격차 감소

## 8. Cosmos World Foundation Models로 영상 증강

**NVIDIA Cosmos**는 Physical AI를 위한 World Foundation Model(WFM) 개발 플랫폼입니다 (Cosmos NIMs). 데이터 큐레이션(NeMo Curator), 토큰화(Cosmos Tokenizer), 후학습(NeMo / PyTorch)을 포함합니다.

| 모델 | 역할 |
| --- | --- |
| **Cosmos Predict** | 멀티모달 입력으로부터 미래 가상 세계 상태 생성 |
| **Cosmos Transfer** | 실세계·3D 입력으로 조건화한 **물리 인식(physics-aware) 가상 세계** 생성 |
| **Cosmos Reason** | Physical AI 세계 상태 이해를 위한 **Chain-of-Thought 추론** |

### Cosmos Transfer로 로봇 데이터 증강

**문제**: 휴머노이드가 시뮬레이션에서 과제를 수행하는 ego-view 영상에서, **로봇 형상(foreground)은 보존하면서 배경(background)에 변화(variance)** 를 주려면?

**방법**:

1. 로봇의 **시맨틱 세그멘테이션(semantic segmentation)** 추출
2. **깊이(depth) + 세그멘테이션**으로 배경을 조건화
3. **시공간(spatial-temporal) 제어**로 배경을 수정하되 로봇 전경의 형상·외형은 유지 (foreground는 edge·vis 제어에 더 높은 가중치)

```json
{
  "prompt": "In a sleek, high-end kitchen flooded with warm, diffused LED lighti...",
  "input_video_path": "assets/example1_input_video.mp4",
  "vis":   { "control_weight": 0.5, "control_weight_prompt": "robotic arms . gloves" },
  "edge":  { "control_weight": 0.5, "control_weight_prompt": "robotic arms . gloves" },
  "depth": { "control_weight": 0.5 },
  "seg":   { "control_weight": 0.5 }
}
```

> 코드: <https://github.com/nvidia-cosmos/cosmos-transfer1/tree/main/cosmos_transfer1/auxiliary/robot_augmentation>

![Cosmos Transfer 로봇 데이터 증강](img/dli-smmg/s60.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 60 (출처: NVIDIA GTC Paris 2025)
///

### Isaac GR00T-Dreams & GR00T N

- **GR00T-Dreams**: 소규모 사람 시연 팀이 수천 명 분량의 일을 해내도록, Cosmos로 합성 모션·궤적 데이터를 생성하고 액션 라벨링.
- **GR00T-Mimic on Humanoids**: 사람 시연을 하위 과제(Grasp Left/Right, Pour, Place)로 주석 → **수천 개 합성 모션** 생성 → Fourier **GR-1** 로봇에 학습된 정책 실행.
- **Isaac GR00T N1 파운데이션 모델**: Vision-Language-Model + Diffusion Transformer 구조. 오픈·완전 커스터마이즈(실·합성 데이터로 후학습)·**Cross-Embodiment**(여러 휴머노이드에 배포) 지원.
- **Isaac Lab 2.2 — N1 Finetuning 파이프라인**: 데이터 생성부터 폐루프(closed-loop) 평가까지 모두 Isaac Lab에서. 과제당 **1K 궤적**, **시연 10개 미만**으로 N1 파인튜닝 (예: Nut Pouring, Pipe Sorting).

![GR00T-Dreams / GR00T N 파운데이션 모델](img/dli-smmg/s64.jpg){ width="720" }
/// caption
합성 데이터 생성 & 모방학습 (Isaac Lab + Cosmos) — 슬라이드 64 (출처: NVIDIA GTC Paris 2025)
///

## ✅ 체크포인트

- [ ] Physical AI의 **데이터 과제**(고비용·위험)와, 이를 시뮬레이션 기반 **SDG**로 해결하는 이유를 설명할 수 있다.
- [ ] **GR00T-Teleop → GR00T-Mimic → 학습**으로 이어지는 데이터 증폭 흐름(수십 시연 → 1M X)을 설명할 수 있다.
- [ ] 큐브 쌓기 과제의 **관측/행동 공간**과 이종(연속·이산) 공간 처리 개념을 안다.
- [ ] **BC-RNN(2-layer LSTM + GMM)** 의 구조와 84% 성공률 등 학습 설정을 안다.
- [ ] **Cosmos Transfer**가 로봇 전경을 보존하며 배경을 증강해 **sim-to-real 격차**를 줄이는 원리를 설명할 수 있다.

## 🔗 출처 및 참고자료

- NVIDIA «Isaac for Accelerated Robotics» (GTC Paris 2025) / DLI **C-OV-05 Part 4**
- Isaac Lab — <https://github.com/isaac-sim/IsaacLab> · 텔레오퍼레이션/모방학습 가이드 <https://isaac-sim.github.io/IsaacLab/main/source/overview/teleop_imitation.html>
- robomimic BC-RNN — <https://robomimic.github.io/docs/introduction/implemented_algorithms.html#bc-rnn>
- Cosmos Transfer1 (robot augmentation) — <https://github.com/nvidia-cosmos/cosmos-transfer1>
- Cosmos Predict 체험 — <https://build.nvidia.com/nvidia/cosmos-predict1-7b>
- 관련 모듈: [LeRobot로 배우는 모방학습 & VLA](lerobot.md)

<!-- FULLDECK -->
## 🖼️ 원본 워크샵 슬라이드

??? note "원본 슬라이드 전체 (65매)"
    ![슬라이드 01](img/dli-smmg/s01.jpg){ width="700" }
    ![슬라이드 02](img/dli-smmg/s02.jpg){ width="700" }
    ![슬라이드 03](img/dli-smmg/s03.jpg){ width="700" }
    ![슬라이드 04](img/dli-smmg/s04.jpg){ width="700" }
    ![슬라이드 05](img/dli-smmg/s05.jpg){ width="700" }
    ![슬라이드 06](img/dli-smmg/s06.jpg){ width="700" }
    ![슬라이드 07](img/dli-smmg/s07.jpg){ width="700" }
    ![슬라이드 08](img/dli-smmg/s08.jpg){ width="700" }
    ![슬라이드 09](img/dli-smmg/s09.jpg){ width="700" }
    ![슬라이드 10](img/dli-smmg/s10.jpg){ width="700" }
    ![슬라이드 11](img/dli-smmg/s11.jpg){ width="700" }
    ![슬라이드 12](img/dli-smmg/s12.jpg){ width="700" }
    ![슬라이드 13](img/dli-smmg/s13.jpg){ width="700" }
    ![슬라이드 14](img/dli-smmg/s14.jpg){ width="700" }
    ![슬라이드 15](img/dli-smmg/s15.jpg){ width="700" }
    ![슬라이드 16](img/dli-smmg/s16.jpg){ width="700" }
    ![슬라이드 17](img/dli-smmg/s17.jpg){ width="700" }
    ![슬라이드 18](img/dli-smmg/s18.jpg){ width="700" }
    ![슬라이드 19](img/dli-smmg/s19.jpg){ width="700" }
    ![슬라이드 20](img/dli-smmg/s20.jpg){ width="700" }
    ![슬라이드 21](img/dli-smmg/s21.jpg){ width="700" }
    ![슬라이드 22](img/dli-smmg/s22.jpg){ width="700" }
    ![슬라이드 23](img/dli-smmg/s23.jpg){ width="700" }
    ![슬라이드 24](img/dli-smmg/s24.jpg){ width="700" }
    ![슬라이드 25](img/dli-smmg/s25.jpg){ width="700" }
    ![슬라이드 26](img/dli-smmg/s26.jpg){ width="700" }
    ![슬라이드 27](img/dli-smmg/s27.jpg){ width="700" }
    ![슬라이드 28](img/dli-smmg/s28.jpg){ width="700" }
    ![슬라이드 29](img/dli-smmg/s29.jpg){ width="700" }
    ![슬라이드 30](img/dli-smmg/s30.jpg){ width="700" }
    ![슬라이드 31](img/dli-smmg/s31.jpg){ width="700" }
    ![슬라이드 32](img/dli-smmg/s32.jpg){ width="700" }
    ![슬라이드 33](img/dli-smmg/s33.jpg){ width="700" }
    ![슬라이드 34](img/dli-smmg/s34.jpg){ width="700" }
    ![슬라이드 35](img/dli-smmg/s35.jpg){ width="700" }
    ![슬라이드 36](img/dli-smmg/s36.jpg){ width="700" }
    ![슬라이드 37](img/dli-smmg/s37.jpg){ width="700" }
    ![슬라이드 38](img/dli-smmg/s38.jpg){ width="700" }
    ![슬라이드 39](img/dli-smmg/s39.jpg){ width="700" }
    ![슬라이드 40](img/dli-smmg/s40.jpg){ width="700" }
    ![슬라이드 41](img/dli-smmg/s41.jpg){ width="700" }
    ![슬라이드 42](img/dli-smmg/s42.jpg){ width="700" }
    ![슬라이드 43](img/dli-smmg/s43.jpg){ width="700" }
    ![슬라이드 44](img/dli-smmg/s44.jpg){ width="700" }
    ![슬라이드 45](img/dli-smmg/s45.jpg){ width="700" }
    ![슬라이드 46](img/dli-smmg/s46.jpg){ width="700" }
    ![슬라이드 47](img/dli-smmg/s47.jpg){ width="700" }
    ![슬라이드 48](img/dli-smmg/s48.jpg){ width="700" }
    ![슬라이드 49](img/dli-smmg/s49.jpg){ width="700" }
    ![슬라이드 50](img/dli-smmg/s50.jpg){ width="700" }
    ![슬라이드 51](img/dli-smmg/s51.jpg){ width="700" }
    ![슬라이드 52](img/dli-smmg/s52.jpg){ width="700" }
    ![슬라이드 53](img/dli-smmg/s53.jpg){ width="700" }
    ![슬라이드 54](img/dli-smmg/s54.jpg){ width="700" }
    ![슬라이드 55](img/dli-smmg/s55.jpg){ width="700" }
    ![슬라이드 56](img/dli-smmg/s56.jpg){ width="700" }
    ![슬라이드 57](img/dli-smmg/s57.jpg){ width="700" }
    ![슬라이드 58](img/dli-smmg/s58.jpg){ width="700" }
    ![슬라이드 59](img/dli-smmg/s59.jpg){ width="700" }
    ![슬라이드 60](img/dli-smmg/s60.jpg){ width="700" }
    ![슬라이드 61](img/dli-smmg/s61.jpg){ width="700" }
    ![슬라이드 62](img/dli-smmg/s62.jpg){ width="700" }
    ![슬라이드 63](img/dli-smmg/s63.jpg){ width="700" }
    ![슬라이드 64](img/dli-smmg/s64.jpg){ width="700" }
    ![슬라이드 65](img/dli-smmg/s65.jpg){ width="700" }
