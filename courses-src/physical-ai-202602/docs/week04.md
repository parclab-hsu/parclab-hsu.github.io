# 4주차 — Isaac Lab 4족 보행 로봇 강화학습 환경 만들기

!!! abstract "학습목표"
    NVIDIA **Isaac Lab**을 활용하여 4족 보행 로봇(Spot)의 강화학습 환경을 구성하고, 학습 파이프라인(`train.py`)의 4단계 구조를 이해한다. **MDP 기반 행동(Action)·관측(Observation)** 설계와 **Height Scan(RayCaster)** 지형 인식을 실습하며, 에이전트–환경–보상으로 이어지는 강화학습 핵심 요소를 체득한다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「Isaac Lab 4족 보행 로봇 강화학습 환경 만들기」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드·명령은 교안 설명을 충실히 따른 **재구성 예제**입니다.

!!! note "강의 흐름 (FLOW)"
    `Observation` → `Policy` → `Action` → `Reward` → `Update`

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro & Isaac Lab 소개·설치·실행 방법 | 원문 §01~02 |
| 2교시 | 50분 | 예제 Task 실행과 `train.py` 4단계 구조 (시뮬레이션 환경) | 원문 §03 |
| 3교시 | 50분 | 강화학습 환경 구성(MDP·Action·Observation·Height Scan) & Wrap-up | 원문 §03~05 |

---

## 🧭 1. Intro — 이번 강의

![4족 보행 로봇 학습환경 만들기 표지](img/w04/s01.jpg){ width="720" }
/// caption
Isaac Lab 4족 보행 로봇 강화학습 환경 만들기 — 슬라이드 01 (출처: ENGI UNIVERSE)
///

이번 강의의 목표는 다음과 같습니다.

- **Isaac Lab을 활용해 4족 보행 로봇 강화학습 환경 구성**
- **Height Scan 센서**를 적용해 지형 인식 기능 구현
- **MDP 기반 행동(Action) 및 관측(Observation) 설계** 실습

주요 학습 내용은 ① Isaac Lab 소개, ② 4족 로봇 환경 구성 실습(사전 정의된 모델 활용 → 빠른 배치), ③ Height Scan 센서 설정(RayCaster 방식으로 지형 높낮이 감지 → 로봇이 실시간으로 지면 정보 인식), ④ 강화학습 구성 요소 이해입니다.

### 강화학습의 핵심 요소

강화학습은 **에이전트(Agent)** 가 **환경(Environment)** 안에서 **행동(Action)** 을 하고, 그 결과로 **상태(State)** 와 **보상(Reward)** 을 돌려받으며 학습하는 구조입니다.

```text
        행동(action)
  에이전트  ───────────▶  환경
    ▲                      │
    └──────────────────────┘
        상태(state) · 보상(reward)
```

| 요소 | 의미 |
| --- | --- |
| 에이전트(Agent) | 학습의 주체(로봇 정책) |
| 행동(Action) | 에이전트가 환경에 가하는 조작(예: 관절 명령) |
| 환경(Environment) | 에이전트가 활동하는 무대(로봇 + 지형) |
| 보상(Reward) | 행동의 좋고 나쁨을 알려주는 신호 |

---

## 🚀 2. Isaac Lab 소개 및 실행 방법

![Isaac Lab 소개](img/w04/s05.jpg){ width="720" }
/// caption
Isaac Lab 소개 및 실행 방법 — 슬라이드 05 (출처: ENGI UNIVERSE)
///

### Isaac Lab이란?

- **Isaac Lab** : NVIDIA에서 개발한 **강화학습 + 로봇 시뮬레이션 통합 프레임워크**
- 구성: 강화학습 환경 구성 / 로봇 모델 적용 / 센서 통합 / 보상 및 행동 정책 설정
- 특징
    - **고성능 병렬 시뮬레이션**
    - 정교한 학습 환경 구성 기능 제공
    - 다양한 로봇 모델 및 지형 설정 기능 포함 → 로봇 강화학습 실습에 매우 적합

!!! note "Isaac Lab 권장 환경"
    - NVIDIA GPU 및 **CUDA** 환경
    - **Ubuntu 20.04 또는 22.04** 권장
    - **Isaac Sim** 설치 (Omniverse 기반)
    - **Python 3.10 이상** (Conda 환경 권장)

### Isaac Lab 설치 절차

**Step 1 —** Isaac Lab Repository를 `git clone`
**Step 2 —** 빌드 도구와 시스템 컴파일러 설치
**Step 3 —** Isaac Lab을 설치
**Step 4 —** 설치 확인

### 예제 Task 실행 — RSL-RL 학습 파이프라인

Isaac Lab 실행 후 **RSL-RL** 학습기를 통해 1024개의 Spot을 동시에 학습시킵니다.

```bash
./isaaclab.sh -p scripts/reinforcement_learning/rsl_rl/train.py \
  --task Isaac-Velocity-Flat-Spot-v0 \
  --num_envs 1024
```

| 인자 | 의미 |
| --- | --- |
| `train.py` | 강화학습 메인 스크립트 |
| `rsl_rl` | 정책 학습을 위한 Isaac Lab의 **RSL-RL(PPO 기반)** 프레임워크 로드 |
| `--task Isaac-Velocity-Flat-Spot-v0` | 학습 규칙서(Task) 선택 옵션 |
| `--num_envs 1024` | **병렬 학습 환경 수** 설정 |

!!! tip "num_envs 트레이드오프"
    설정 숫자가 **작을수록** GPU·전력·연산 자원 소모가 적고, **클수록** 자원 소모가 큽니다. 학습 규칙서(Task)는 *학습 대상 / 환경 / 목표 / 관측 / 행동 / 보상 / 종료 조건* 을 정의합니다. `gym.make(task, cfg=env_cfg)` 호출 시 입력된 task로 환경 인스턴스가 생성됩니다.

![예제 Task 실행 실습](img/w04/s09.jpg){ width="720" }
/// caption
RSL-RL 학습 파이프라인 실행 — 슬라이드 09 (출처: ENGI UNIVERSE)
///

### Task(태스크)란?

Isaac Lab에서 말하는 **Task**는 강화학습의 **규칙서**입니다. 로봇이 *어떤 환경에서 어떤 목표를 가지고 학습할지* 를 모두 정의해 놓은 틀입니다.

| 구성 | 정의 |
| --- | --- |
| 환경(Environment) | 로봇이 활동하는 무대 — 어떤 로봇을, 어떤 지형 위에서 (예: Spot을 평지에서, ANYmal을 언덕·자갈길에서) |
| 행동(Action)·관측(Observation) | 로봇이 무엇을 할 수 있고 무엇을 인식할 수 있는지 — 관절 명령이 행동, 속도·기울기·센서 값이 관측 |
| 보상(Reward)·종료(Termination) | 학습 성패의 기준 — 목표 속도에 가까울수록 높은 보상, 넘어지면 큰 감점·에피소드 종료 |

> 정리하면, 하나의 Task는 **"어떤 로봇이 어떤 환경에서 어떤 목표를 향해 어떻게 학습할지"** 를 전부 정의하는 틀입니다.

---

## 🧱 3. Isaac Lab 시뮬레이션 환경 — `train.py` 4단계 구조

![train.py 구조](img/w04/s14.jpg){ width="720" }
/// caption
train.py의 4단계 구조 — 슬라이드 14 (출처: ENGI UNIVERSE)
///

`train.py`는 **① 시뮬레이터를 켜고 ② 학습 설정을 확정하고 ③ 환경을 만들어 래퍼로 포장한 뒤 ④ 학습기를 돌려 정책을 학습**하는 스크립트입니다.

=== "1단계 — 시뮬레이터 구동"

    - `argparse.ArgumentParser` : `--task`, `--num_envs`, `--video` 등 사용자 옵션 정의
    - `AppLauncher.add_app_launcher_args` : `--headless` 같은 Isaac Sim 전용 옵션 자동 추가
    - `AppLauncher`로 Isaac Sim 실행 → `simulation_app`이 엔진을 메모리에 로드
    - **App(시뮬레이터)을 먼저 켜야** gym, torch가 충돌 없이 초기화됨(순서 위반 시 CUDA/환경 충돌 가능)

=== "2단계 — 설정의 확정"

    - `@hydra_task_config` : task 이름에 해당하는 **환경 설정 + 에이전트 설정** 파일을 자동 로드
    - `def main(env_cfg, agent_cfg)` : 파싱된 설정 객체가 인자로 **주입(injection)**
    - **CLI가 파일 설정보다 우선** (예: 기본값 `num_envs=4096` → `--num_envs 1024`로 덮어쓰기)
    - `env_cfg.seed` : 환경·에이전트가 같은 시드를 쓰도록 맞춰 **재현성** 확보

=== "3단계 — 환경 생성과 포장"

    - `gym.make(...)` : 설정된 task·env_cfg로 시뮬레이션 환경 인스턴스 생성 (num_envs 수만큼 평행 우주 동시 생성)
    - `RecordVideo` : `--video` 옵션이 켜져 있으면 학습 과정을 주기적으로 촬영
    - `RslRlVecEnvWrapper` : Isaac Lab(환경)과 RSL-RL(알고리즘)의 **데이터 형식 차이를 통역**
        - 역할 1: 환경 데이터 → 알고리즘이 원하는 텐서 포맷으로 변환
        - 역할 2: 알고리즘 액션 → 시뮬레이터가 이해할 물리 신호로 변환

=== "4단계 — 학습 시작"

    - `OnPolicyRunner` : PPO 같은 **on-policy 알고리즘을 돌리는 코치(학습기)**
    - `dump_yaml`, `dump_pickle` : env_cfg·agent_cfg를 로그 디렉터리에 저장(재현성)
    - `runner.learn()` : `max_iterations`만큼 데이터 수집 → **정책 업데이트 루프 반복**
    - `env.close()` : 학습 종료 시 시뮬레이터 프로세스 종료, GPU·메모리 정리

![train.py 학습 시작 단계](img/w04/s18.jpg){ width="720" }
/// caption
4단계 학습 시작 — OnPolicyRunner로 정책 학습 (출처: ENGI UNIVERSE)
///

!!! success "한 줄 요약"
    `train.py` = **시뮬레이터 구동 → 설정 확정(Hydra+CLI) → 환경 생성·래핑 → 학습기 실행** 의 흐름. 래퍼는 가상 세계와 AI 알고리즘 사이의 **통역사 + 어댑터** 역할을 합니다.

---

## 🎛️ 4. 강화학습 환경 구성 (MDP · Action · Observation · Height Scan)

![flat_env_cfg.py](img/w04/s22.jpg){ width="720" }
/// caption
flat_env_cfg.py — 강화학습 환경 설정 (출처: ENGI UNIVERSE)
///

`flat_env_cfg.py`의 목표는 **Spot이 평지 + Cobbles(거친 지형)에서도 사용자가 원하는 속도대로 안정적으로 걷도록** 훈련하는 것입니다. 주요 기능 4가지는 다음과 같습니다.

| 기능 | 설명 |
| --- | --- |
| 로봇 입출력 정의 | 관절 위치(Joint Position)로 움직이고, 몸체 속도·자세 등 센서 정보를 관측값으로 수신 |
| 목표 설정(Command) | "앞으로 x m/s", "yaw를 얼마나" 같은 속도 명령의 범위·형태 정의 |
| 보상 체계(Reward) | 전진 속도, 발 끌지 않기(Foot clearance), 부드럽게 걷기, 보행 패턴(Gait) 유지 유도 |
| 현실감 부여(Domain Randomization) | 마찰력·질량·외부 충격을 랜덤화 → 변화에 강한 정책 |

### Action & Command — MDP의 행동 정의

```python
# 행동(Action) 정의 : 토크 직접 제어 X → 관절 목표 위치(Position) 제어 O
class SpotActionCfg:
    joint_pos = mdp.JointPositionActionCfg(
        joint_names=[".*"],   # 정규식으로 Spot의 모든 관절에 동일 규칙 적용
        scale=0.2,            # 값을 곱해 관절 움직임 축소/증폭 → 떨림·하드웨어 부담↓
    )

# 명령(Command) 정의 : 학습 도중 무작위 속도 명령을 균일 분포로 샘플링
class SpotCommandCfg:
    base_velocity = mdp.UniformVelocityCommandCfg(
        resampling_time_range=(10.0, 10.0),  # 10초마다 새 목표 속도 부여
        lin_vel_x=(-2.0, 3.0),               # 뒤로 최대 2 m/s, 앞으로 최대 3 m/s
    )
```

!!! note "왜 토크가 아닌 위치 제어인가?"
    `scale=0.2`로 관절 움직임을 줄이면 **관절 떨림과 하드웨어 부담을 줄이는 안전장치** 역할을 하며 안정적인 학습을 유도합니다. 10초마다 속도 명령을 바꿔 한 가지 동작만 외우지 않고 **다양한 상황에 적응하는 보행 정책**을 학습합니다.

### Observation — MDP의 관측 정의

```python
class SpotObservationCfg:
    base_lin_vel = ...        # 몸체 선속도 — 얼마나 빨리 움직이는지
    base_ang_vel = ...        # 몸체 각속도 — 얼마나 빨리 도는지
    projected_gravity = ...   # 중력 벡터 기준 기울기(평형 감각)
    # 깨끗한 시뮬레이터 관측에 일부러 랜덤 노이즈 주입
    noise = Unoise(n_min=-0.1, n_max=0.1)
```

!!! tip "Sim-to-Real 갭 줄이기"
    실제 센서는 항상 떨림·오차·지터가 존재합니다. 관측값에 일부러 노이즈를 섞어 **시뮬레이션과 실제 환경의 격차(Sim-to-Real Gap)** 를 줄입니다.

![관측·이벤트·보상 설정](img/w04/s26.jpg){ width="720" }
/// caption
Observation·Events·Reward 설정 (출처: ENGI UNIVERSE)
///

### Events — 랜덤화 이벤트(Domain Randomization)

| 이벤트 | 설정 | 효과 |
| --- | --- | --- |
| `physics_material` | 에피소드마다 바닥 마찰을 **0.3 ~ 1.0** 랜덤 | 미끄러운 대리석 ~ 거친 아스팔트까지 적응 |
| `add_base_mass` | 몸체 질량을 **−2.5kg ~ +2.5kg** 랜덤 | 짐·배터리 교체 등 신체 조건 변화 적응 |
| `mode="interval"` (Push) | **10~15초마다** x/y 속도 랜덤 주입 | 옆에서 누가 툭 치듯 밀어 균형 회복 학습 |

### Rewards — 보상 체계

| 보상 항목 | 의미 |
| --- | --- |
| `base_linear_velocity` | 명령 속도와 실제 속도가 **가까울수록 높은 보상** |
| `gait` | 대각선 발 짝(예: 왼앞+오른뒤, 오른앞+왼뒤)을 맞춰 디뎌 자연스러운 박자 유도 |
| `base_orientation` | 몸통이 기울어질수록 **큰 벌점** → 등판을 수평에 가깝게 유지 |
| `joint_torques` | 토크를 많이 쓸수록 벌점 → 에너지 효율적·부드러운 움직임 |

### Environment Setup — 제어 주기와 지형

```python
# 물리 업데이트 주기와 액션 주기 분리
sim.dt = 0.002        # 500Hz로 물리 법칙 계산
decimation = 10       # 물리 10번 계산마다 액션 1번 업데이트
# update_time = sim.dt × decimation = 0.002 × 10 = 0.02초 (50Hz)
```

!!! success "실기 이식의 핵심"
    `sim.dt × decimation = 0.02초(50Hz)` 는 **실제 Spot 제어 주기**와 맞춘 값으로, 시뮬에서 학습된 정책이 실기 로봇에도 잘 옮겨가도록(Sim-to-Real) 하는 핵심 설정입니다. 지형은 `TerrainImporterCfg`로 설정하며(예: `COBBLESTONE_ROAD_CFG` = 자갈길), 시각화/데모용 실행에서는 `num_envs`를 작게 띄우고 `enable_corruption`으로 정책의 보행 품질을 눈으로 확인합니다.

![학습 정책 적용](img/w04/s30.jpg){ width="720" }
/// caption
학습된 정책 적용과 관측 벡터 구성 (출처: ENGI UNIVERSE)
///

### Height Scan & 관측 벡터(Observation) 구성

**Height Scan** 센서는 **RayCaster 방식**으로 지면의 높낮이를 감지하여, 로봇이 실시간으로 지형 정보를 인식하도록 합니다. 학습된 정책 적용 단계에서 `main.py`는 World 초기화와 정책 추론을 담당하며, `ObservationBuilder.build(cmd_vec)`로 **48차원 관측 벡터**를 생성합니다.

| 항목 | 차원수 |
| --- | --- |
| 선형 속도 (linear velocity, body frame) | 3 |
| 각속도 (angular velocity, body frame) | 3 |
| 중력 벡터 (body frame) | 3 |
| 명령 벡터 (cmd_vec) | 3 |
| 관절 위치 (joint positions, 초기값 기준) | 12 |
| 관절 속도 (joint velocities) | 12 |
| 이전 행동 (prev action) | 12 |
| **합계** | **48** |

### 정책 추론과 행동 적용 루프

```python
# 학습된 정책 로딩 → 추론 → 행동 적용
def infer(obs):
    # 1) 관측 벡터를 PyTorch 텐서로 변환 후 디바이스(CPU/GPU)로 이동
    # 2) 정책 모델 실행 → 행동(action) 예측
    action = policy(obs)
    return action

ctrl.apply_actions(action)          # 각 관절에 행동 전달
obsb.update_prev_action(action)     # 다음 관측을 위해 이전 행동 저장
```

!!! note "동작 순환 구조"
    `관측 생성 → 정책 추론 → 행동 적용 → 시뮬레이션 업데이트` 순서로 로봇이 동작합니다. `PolicyRunner`가 정책 모델을 로딩하고(`path`, `device` 자동 선택), `infer(obs)`로 48차원 관측을 정책에 전달해 행동을 예측합니다.

![정책 추론과 시뮬레이션 동작](img/w04/s34.jpg){ width="720" }
/// caption
Policy 추론과 행동 적용 — 시뮬레이션 환경 동작 (출처: ENGI UNIVERSE)
///

---

## 🧩 5. Wrap-up

![Wrap-up](img/w04/s37.jpg){ width="720" }
/// caption
오늘 강의 내용 요약 — 슬라이드 37 (출처: ENGI UNIVERSE)
///

- ✔ **Isaac Lab 기반 4족 보행 RL 파이프라인** 개요 이해
- ✔ **속도 명령·액션·랜덤화**로 강건한 보행 학습
- ✔ **관측 → 정책 → 액션** 순환 구조 이해

## ✅ 체크포인트

- [ ] Isaac Lab의 정의와 권장 환경(GPU/CUDA, Ubuntu, Isaac Sim, Python 3.10+)을 설명할 수 있는가
- [ ] `train.py`의 4단계 구조(시뮬레이터 구동 → 설정 확정 → 환경 생성·래핑 → 학습 시작)를 설명할 수 있는가
- [ ] MDP의 Action(JointPosition, scale)·Command·Observation을 구분해 설계할 수 있는가
- [ ] Domain Randomization(마찰·질량·Push)이 강건한 정책에 기여하는 이유를 설명할 수 있는가
- [ ] Height Scan(RayCaster)과 48차원 관측 벡터의 구성을 설명할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| Isaac Lab 실행 환경 구성 | 20 | 설치·실행 명령(`isaaclab.sh`, `--task`, `--num_envs`)을 올바르게 이해·시연 |
| train.py 구조 이해 | 20 | 4단계 구조와 각 단계 핵심 객체(AppLauncher·Hydra·Wrapper·OnPolicyRunner) 설명 |
| Action/Observation 설계 | 25 | JointPosition·scale·Command 범위, 48차원 관측 구성의 정확성 |
| Reward·Domain Randomization | 20 | 보상 항목과 랜덤화 이벤트의 목적·효과를 정확히 설명 |
| Height Scan & Sim-to-Real | 15 | RayCaster 지형 인식과 제어 주기(50Hz) 매칭의 의미 설명 |

## 🔗 출처 및 참고자료

- 교안 **「Isaac Lab 4족 보행 로봇 강화학습 환경 만들기」** (제작: ENGI UNIVERSE) — 강의 슬라이드 원본
- NVIDIA Isaac Lab 공식 문서 — <https://isaac-sim.github.io/IsaacLab/>
- NVIDIA Isaac Sim — <https://docs.isaacsim.omniverse.nvidia.com/>
- RSL-RL (PPO 기반 학습 프레임워크) — <https://github.com/leggedrobotics/rsl_rl>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [Isaac Lab 개요](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/isaac_lab_tutorials/index.html)
    - [정책 배포(Policy Deployment)](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/isaac_lab_tutorials/tutorial_policy_deployment.html)

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (37매)"
    ![슬라이드 01](img/w04/s01.jpg){ width="700" }
    ![슬라이드 02](img/w04/s02.jpg){ width="700" }
    ![슬라이드 03](img/w04/s03.jpg){ width="700" }
    ![슬라이드 04](img/w04/s04.jpg){ width="700" }
    ![슬라이드 05](img/w04/s05.jpg){ width="700" }
    ![슬라이드 06](img/w04/s06.jpg){ width="700" }
    ![슬라이드 07](img/w04/s07.jpg){ width="700" }
    ![슬라이드 08](img/w04/s08.jpg){ width="700" }
    ![슬라이드 09](img/w04/s09.jpg){ width="700" }
    ![슬라이드 10](img/w04/s10.jpg){ width="700" }
    ![슬라이드 11](img/w04/s11.jpg){ width="700" }
    ![슬라이드 12](img/w04/s12.jpg){ width="700" }
    ![슬라이드 13](img/w04/s13.jpg){ width="700" }
    ![슬라이드 14](img/w04/s14.jpg){ width="700" }
    ![슬라이드 15](img/w04/s15.jpg){ width="700" }
    ![슬라이드 16](img/w04/s16.jpg){ width="700" }
    ![슬라이드 17](img/w04/s17.jpg){ width="700" }
    ![슬라이드 18](img/w04/s18.jpg){ width="700" }
    ![슬라이드 19](img/w04/s19.jpg){ width="700" }
    ![슬라이드 20](img/w04/s20.jpg){ width="700" }
    ![슬라이드 21](img/w04/s21.jpg){ width="700" }
    ![슬라이드 22](img/w04/s22.jpg){ width="700" }
    ![슬라이드 23](img/w04/s23.jpg){ width="700" }
    ![슬라이드 24](img/w04/s24.jpg){ width="700" }
    ![슬라이드 25](img/w04/s25.jpg){ width="700" }
    ![슬라이드 26](img/w04/s26.jpg){ width="700" }
    ![슬라이드 27](img/w04/s27.jpg){ width="700" }
    ![슬라이드 28](img/w04/s28.jpg){ width="700" }
    ![슬라이드 29](img/w04/s29.jpg){ width="700" }
    ![슬라이드 30](img/w04/s30.jpg){ width="700" }
    ![슬라이드 31](img/w04/s31.jpg){ width="700" }
    ![슬라이드 32](img/w04/s32.jpg){ width="700" }
    ![슬라이드 33](img/w04/s33.jpg){ width="700" }
    ![슬라이드 34](img/w04/s34.jpg){ width="700" }
    ![슬라이드 35](img/w04/s35.jpg){ width="700" }
    ![슬라이드 36](img/w04/s36.jpg){ width="700" }
    ![슬라이드 37](img/w04/s37.jpg){ width="700" }
