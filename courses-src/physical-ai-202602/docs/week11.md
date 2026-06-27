# 11주차 — 로봇 강화학습 기초 (RL)

!!! abstract "학습목표"
    강화학습의 MDP·정책·보상 개념을 이해하고, 시뮬레이션 환경에서 간단한 정책을 학습시킨다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — MDP·정책·PPO |
| 2교시 | 50분 | 실습 — Gym 환경 학습 |
| 3교시 | 50분 | 실습 — 학습 결과 분석 |

## 📖 1교시. 이론

- **MDP**: 상태 S, 행동 A, 전이 P, 보상 R, 할인 γ
- **정책 π(a\|s)** · **가치함수 V, Q** · 탐험 vs 활용
- **PPO**: 정책경사 계열, 안정적인 업데이트. 로봇에서 널리 쓰임
- **보상 설계(reward shaping)**의 중요성과 함정(reward hacking)

## 🛠️ 2교시. 실습 — 정책 학습

**Step 1 — 설치**

```bash
pip install gymnasium stable-baselines3
```

**Step 2 — CartPole 정책 학습**

```python
import gymnasium as gym
from stable_baselines3 import PPO

env = gym.make('CartPole-v1')
model = PPO('MlpPolicy', env, verbose=1)
model.learn(total_timesteps=30000)
model.save('ppo_cartpole')
```

**Step 3 — 학습된 정책 평가**

```python
import gymnasium as gym
from stable_baselines3 import PPO

env = gym.make('CartPole-v1', render_mode='human')
model = PPO.load('ppo_cartpole')
obs, _ = env.reset()
for _ in range(1000):
    action, _ = model.predict(obs, deterministic=True)
    obs, r, done, trunc, _ = env.step(action)
    if done or trunc:
        obs, _ = env.reset()
```

## 🛠️ 3교시. 실습 — 결과 분석 & 로봇 연결

- 학습 곡선(보상 증가) 해석, total_timesteps 변화에 따른 성능 비교
- (심화) Isaac Lab / Gymnasium-Robotics의 로봇 환경 소개 — 관절 제어를 RL로 학습

✅ 학습 후 막대기(CartPole)가 쓰러지지 않고 서 있으면 성공.

## ✅ 체크포인트

- [ ] PPO 학습이 완료되고 보상이 증가하는가
- [ ] 학습된 정책이 환경을 안정적으로 제어하는가

## 📝 과제

- timesteps를 1만/3만/10만으로 바꿔 성능 비교 표 작성
- 보상 함수를 바꿀 때 행동이 어떻게 변하는지 관찰

## 🖼️ PPT 슬라이드 개요

1. 강화학습이란 (에이전트·환경·보상)
2. MDP: S, A, P, R, γ
3. 정책 π와 가치함수 V/Q
4. 탐험 vs 활용, PPO 개요
5. 보상 설계와 reward hacking
6. 실습: PPO로 정책 학습

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| PPO 학습 | 40 | 보상 증가·해석 | 학습만 | 미동작 |
| 정책 평가 | 30 | 안정 제어·시연 | 부분 | 미동작 |
| 과제(timesteps 비교) | 30 | 비교표·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: gymnasium, stable-baselines3, (선택) PyTorch

- ❌ 학습이 발산 → learning rate·timesteps 조정, 시드 변경
- ❌ render 오류 → `render_mode='human'` 환경에서만 렌더
- ❌ 보상이 안 오름 → 환경 reset/step 반환값 처리 확인

## 🔗 참고자료

- Stable-Baselines3 — <https://stable-baselines3.readthedocs.io>
- Gymnasium — <https://gymnasium.farama.org>
- PPO 논문 — <https://arxiv.org/abs/1707.06347>
