# 심화 모듈 — LeRobot로 배우는 모방학습 & VLA

!!! abstract "학습목표"
    HuggingFace **LeRobot** 프레임워크로 **모방학습(Imitation Learning)** 과 **VLA(Vision-Language-Action, LLM 기반 행동 모델)** 를 직접 실습한다. 시뮬레이션에서 **시연 데이터를 수집 → ACT 정책 학습 → 평가**하고, 사전학습 **SmolVLA** 를 불러와 평가한다. 이 모듈은 14·15주차에서 다룬 **System-1의 규칙 기반(Rule-based) 단위 액션을 "학습형 정책(Policy)"으로 고도화**하는 길을 연결한다.

!!! quote "출처 (Sources)"
    본 모듈은 도서 **『피지컬 AI 시스템 설계』 16장 LeRobot 실습**(저자: 엥지유니버스 / ENGI UNIVERSE, 한빛미디어)의 예제와 **HuggingFace LeRobot 공식 문서**를 바탕으로 재구성하였습니다. 예제 코드 저장소: **[parclab-hsu/Physical-ai-system-design](https://github.com/parclab-hsu/Physical-ai-system-design)** (원본: engiengi/Physical-ai-system-design).

## 🤗 1. LeRobot이란

LeRobot은 **실제 로봇을 위한 모델·데이터셋·도구**를 제공하는 PyTorch 기반 오픈소스 라이브러리입니다. 모방학습과 강화학습에 초점을 두며, 사전학습 모델과 사람이 수집한 시연 데이터셋을 **HuggingFace Hub**에서 공유합니다.

| 분류 | 지원 알고리즘 (예) |
| --- | --- |
| **모방학습(IL)** | **ACT**, **Diffusion Policy**, VQ-BeT |
| **강화학습(RL)** | HIL-SERL, TDMPC |
| **VLA(LLM 계열)** | **SmolVLA**, **Pi0 / Pi0.5**, GR00T N1.5 등 |
| **데이터셋** | `LeRobotDataset` (MP4 영상 + Parquet 상태/행동), HF Hub 호스팅 |

!!! note "왜 이 강의에서 LeRobot인가?"
    - **14·15주차**에서 System-2(LLM)는 자연어 → 계획을 만들고, System-1은 **규칙 기반 단위 액션**(`move_to`·`scan`·`track`…)으로 실행했습니다.
    - 15주차 고도화 §의 **Policy Head(하이브리드)** — *"규칙 기반 실행부 일부를 학습 정책으로 교체"* — 를 **실제로 구현**하는 도구가 LeRobot입니다.
    - **VLA**(SmolVLA·Pi0)는 "이미지 + 언어 명령 → 행동"을 직접 생성하는, System-2와 System-1을 잇는 **LLM 기반 행동 모델**입니다.

## ⏱️ 모듈 구성 (도서 16장 기준)

| 단계 | 내용 |
| --- | --- |
| 1 | LeRobot + 의존성 설치 |
| 2 | **SmolVLA** 정책을 **LIBERO** 환경에서 평가 |
| 3 | 파이썬에서 SmolVLA 정책 불러오기 |
| 4 | **MuJoCo Franka Panda**(gym_hil) 환경에서 시연 데이터 수집 |
| 5 | 수집 데이터로 **ACT 정책 학습** |

## 🛠️ 2. 설치 (따라하기)

!!! warning "환경 주의"
    LeRobot은 Python 3.12 conda 환경을 권장합니다. `PYTHONPATH`에 ROS 경로(`/opt/ros/...`)가 있으면 PyTorch/NumPy import 충돌이 날 수 있으니, 새 터미널에서 `export PYTHONPATH=` 후 진행하세요.

```bash
# 1) conda 환경 생성 (Python 3.12) + ffmpeg
conda create -y -n lerobot python=3.12
conda activate lerobot
conda install -y "ffmpeg>=6" -c conda-forge

# 2) LeRobot 설치
pip install lerobot
lerobot-info        # 설치/버전 확인
```

> 도서 예제에서는 `bash scripts/install_lerobot.sh` 한 번으로 위 과정을 자동화합니다.

## 🧠 3. 모방학습 — 시연 수집 → ACT 학습

### 모방학습 개념

- **ACT (Action Chunking Transformer)**: 한 번에 여러 스텝의 행동 묶음(action chunk)을 예측 → 부드럽고 일관된 조작
- **Diffusion Policy**: 행동을 디퓨전 과정으로 생성 → 다중 모드(multi-modal) 동작에 강함
- 핵심: **전문가 시연(state→action)** 을 지도학습으로 모방 (11주차 System-1·12·13주차 단위 액션의 "학습형" 대안)

### Step 1 — 시뮬레이션에서 시연 데이터 수집

MuJoCo 기반 **Franka Panda**(`gym_hil`)의 `PandaPickCube` 과제를 **키보드로 조작**하며 10개 에피소드를 수집합니다.

```bash
# configs/gym_hil_record.json 설정으로 데이터 수집(record 모드)
python -m lerobot.rl.gym_manipulator --config_path configs/gym_hil_record.json
```

수집 설정(`gym_hil_record.json`) 핵심:

```json
{
  "env": { "type": "gym_manipulator", "name": "gym_hil",
           "task": "PandaPickCubeKeyboard-v0", "fps": 10,
           "processor": { "control_mode": "keyboard",
                          "gripper": { "use_gripper": true } } },
  "dataset": { "repo_id": "username/sim_pick_cube",
               "task": "pick_cube", "num_episodes_to_record": 10,
               "push_to_hub": false },
  "mode": "record"
}
```

→ 결과는 **`LeRobotDataset` 포맷**(영상 MP4 + 상태/행동 Parquet)으로 저장됩니다.

### Step 2 — ACT 정책 학습

```bash
lerobot-train \
  --dataset.repo_id=myname/sim_pick_cube \
  --policy.type=act \
  --output_dir=outputs/train/act_sim_pick_cube \
  --job_name=act_sim_pick_cube \
  --policy.device=cuda \
  --policy.push_to_hub=false \
  --wandb.enable=false
```

!!! tip "Diffusion Policy로 바꿔보기"
    `--policy.type=act` 를 `--policy.type=diffusion` 으로 바꾸면 동일 데이터로 Diffusion Policy를 학습할 수 있습니다. 두 정책의 성공률·동작 부드러움을 비교해 보세요.

## 🗣️ 4. VLA — SmolVLA 평가 (LLM 기반 행동 모델)

**SmolVLA**는 경량 Vision-Language-Action 모델로, **이미지 + 언어 명령 → 로봇 행동**을 생성합니다. 사전학습 모델을 **LIBERO** 시뮬 벤치마크에서 평가합니다.

```bash
export MUJOCO_GL=egl
lerobot-eval \
  --policy.path=HuggingFaceVLA/smolvla_libero \
  --env.type=libero \
  --env.task=libero_object \
  --eval.batch_size=1 \
  --eval.n_episodes=3
```

파이썬에서 정책을 직접 불러와 추론에 사용할 수도 있습니다.

```python
from lerobot.policies.smolvla.modeling_smolvla import SmolVLAPolicy

policy = SmolVLAPolicy.from_pretrained("HuggingFaceVLA/smolvla_libero")
# observation(이미지·상태·언어 명령) → action 추론
# action = policy.select_action(observation)
```

!!! note "VLA ↔ System-1/System-2"
    14주차의 System-2(LLM 플래너)가 *"무엇을 할지"* 를 JSON 계획으로 만들었다면, **VLA는 *"어떻게 움직일지"* 를 연속 행동으로 직접 생성**합니다. 즉 SmolVLA는 15주차 고도화에서 말한 **End-to-End 학습형 System-1**의 한 형태입니다.

## 📋 5. 주요 CLI 요약

| 명령 | 용도 |
| --- | --- |
| `lerobot-info` | 설치·버전·환경 확인 |
| `lerobot-teleoperate` | 로봇 원격 조작(텔레오퍼레이션) |
| `lerobot-record` / `lerobot.rl.gym_manipulator` | 시연 데이터셋 수집 |
| `lerobot-train --policy.type=act\|diffusion` | 정책 학습 |
| `lerobot-eval --policy.path=... --env.type=...` | 정책 평가 |

!!! important "버전 주의"
    LeRobot은 빠르게 업데이트되어 **설치 옵션·설정 형식·CLI 플래그가 달라질 수 있습니다.** 명령이 동작하지 않으면 설치된 버전의 `--help` 와 공식 문서를 함께 확인하세요. (도서 16장 README의 안내와 동일)

## 🔗 출처 및 참고자료

- 도서 예제 저장소(본 강의 포크): <https://github.com/parclab-hsu/Physical-ai-system-design> → `examples/chapter-16-lerobot/`
- HuggingFace **LeRobot** — <https://github.com/huggingface/lerobot> · 문서 <https://huggingface.co/docs/lerobot>
- LeRobot 모델/데이터셋 허브 — <https://huggingface.co/lerobot>
- 도서: **『피지컬 AI 시스템 설계』 16장**(엥지유니버스, 한빛미디어)
- 관련 주차: [13주차 단위 액션](week13.md) · [14주차 System-2 LLM Planner](week14.md) · [15주차 고도화(Policy Head)](week15.md)
