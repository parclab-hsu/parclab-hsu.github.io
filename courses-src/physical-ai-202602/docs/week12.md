# 12주차 — 모방학습 (Imitation Learning)

!!! abstract "학습목표"
    모방학습(Behavior Cloning)의 원리를 이해하고, 시연 데이터를 수집하여 정책을 학습시킨다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — BC·시연데이터·Diffusion Policy |
| 2교시 | 50분 | 실습 — 시연 데이터 수집 |
| 3교시 | 50분 | 실습 — BC 정책 학습/평가 |

## 📖 1교시. 이론

- **모방학습**: 전문가 시연(state→action)을 지도학습으로 모방
- **Behavior Cloning(BC)**: 가장 기본. 분포 변화(distribution shift) 문제
- RL vs IL 비교: 보상 설계 불필요, 데이터 의존
- 최신 동향: **Diffusion Policy**, ACT — 복잡한 조작 작업에 강점

## 🛠️ 2교시. 실습 — 시연 데이터 수집

**Step 1 — 환경 준비**

```bash
pip install gymnasium stable-baselines3 numpy torch
```

**Step 2 — 전문가 시연 수집 (상태-행동 쌍)**

```python
import gymnasium as gym, numpy as np
from stable_baselines3 import PPO

env = gym.make('CartPole-v1')
expert = PPO.load('ppo_cartpole')   # 11주차 모델을 전문가로 사용
X, Y = [], []
for ep in range(50):
    obs, _ = env.reset()
    done = False
    while not done:
        a, _ = expert.predict(obs, deterministic=True)
        X.append(obs); Y.append(int(a))
        obs, _, term, trunc, _ = env.step(a)
        done = term or trunc
np.savez('demo.npz', X=np.array(X), Y=np.array(Y))
print('수집 샘플:', len(X))
```

## 🛠️ 3교시. 실습 — BC 정책 학습

**Step 3 — 지도학습으로 정책 학습**

```python
import numpy as np, torch, torch.nn as nn

d = np.load('demo.npz')
X = torch.tensor(d['X'], dtype=torch.float32)
Y = torch.tensor(d['Y'], dtype=torch.long)

net = nn.Sequential(nn.Linear(4, 64), nn.ReLU(), nn.Linear(64, 2))
opt = torch.optim.Adam(net.parameters(), 1e-3)
for epoch in range(200):
    opt.zero_grad()
    loss = nn.functional.cross_entropy(net(X), Y)
    loss.backward(); opt.step()
print('final loss:', float(loss))
```

**Step 4 — 평가**: 학습된 BC 정책을 환경에서 실행해 전문가와 비교

✅ BC 정책이 CartPole을 일정 시간 이상 유지하면 성공.

## ✅ 체크포인트

- [ ] 시연 데이터(demo.npz)가 수집되는가
- [ ] BC 정책 loss가 수렴하고 동작하는가

## 📝 과제

- 시연 에피소드 수(10/50/200)에 따른 BC 성능 비교
- RL과 IL의 장단점을 표로 정리

## 🖼️ PPT 슬라이드 개요

1. 모방학습 개요와 동기
2. Behavior Cloning(BC) 원리
3. 분포 변화(distribution shift) 문제
4. RL vs IL 비교
5. 최신 동향: Diffusion Policy, ACT
6. 실습: 시연 수집→BC 학습

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 시연 데이터 수집 | 30 | 충분·정제 | 수집만 | 실패 |
| BC 정책 학습 | 40 | 수렴·동작 | 학습만 | 미동작 |
| 과제(에피소드 비교) | 30 | 비교표·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: 11주차 PPO 모델(ppo_cartpole), numpy, torch

- ❌ 전문가 모델 없음 → 11주차에서 먼저 PPO 학습·저장
- ❌ BC가 금방 실패 → 시연 데이터 부족, 에피소드 수 늘리기
- ❌ loss 안 떨어짐 → 입력 정규화·학습률 확인

## 🔗 참고자료

- Diffusion Policy — <https://diffusion-policy.cs.columbia.edu>
- ACT (Aloha) — <https://tonyzhaozh.github.io/aloha/>
- imitation 라이브러리 — <https://imitation.readthedocs.io>
