# 13주차 — Sim-to-Real Transfer

!!! abstract "학습목표"
    시뮬레이션과 실제의 차이(Reality Gap)를 이해하고, 도메인 랜덤화로 정책의 강건성을 높인다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — Reality Gap·도메인 랜덤화 |
| 2교시 | 50분 | 실습 — 도메인 랜덤화 적용 |
| 3교시 | 50분 | 실습 — 강건성 비교 실험 |

## 📖 1교시. 이론

- **Reality Gap**: 물리 파라미터·센서 노이즈·지연 등 시뮬≠실제
- **도메인 랜덤화(Domain Randomization)**: 학습 시 물리/시각 파라미터를 무작위화 → 실제를 "학습 분포의 일부"로
- **기타 기법**: system identification, domain adaptation, sim-and-real co-training
- 사례: OpenAI 루빅스큐브 손, ANYmal 보행

## 🛠️ 2교시. 실습 — 도메인 랜덤화

**Step 1 — 환경 파라미터 랜덤화 래퍼**

```python
import gymnasium as gym, numpy as np

class RandomizedCartPole(gym.Wrapper):
    def reset(self, **kw):
        # 중력·질량 등 물리 파라미터를 매 에피소드 랜덤화
        self.env.unwrapped.gravity = np.random.uniform(8.0, 12.0)
        self.env.unwrapped.masspole = np.random.uniform(0.05, 0.2)
        return self.env.reset(**kw)
    def step(self, a):
        obs, r, term, trunc, info = self.env.step(a)
        obs = obs + np.random.normal(0, 0.01, obs.shape)  # 센서 노이즈
        return obs, r, term, trunc, info
```

**Step 2 — 랜덤화 환경으로 정책 학습**

```python
from stable_baselines3 import PPO
env = RandomizedCartPole(gym.make('CartPole-v1'))
model = PPO('MlpPolicy', env, verbose=1)
model.learn(total_timesteps=50000)
model.save('ppo_dr')
```

## 🛠️ 3교시. 실습 — 강건성 비교

- 일반 정책(ppo_cartpole) vs 랜덤화 정책(ppo_dr)을 **물리값을 바꾼 환경**에서 평가
- 중력/질량을 학습 범위 밖으로 밀어도 랜덤화 정책이 더 잘 버틴다 → Sim-to-Real 효과 체감

✅ 랜덤화 정책이 변화된 환경에서 더 높은 평균 보상을 받으면 성공.

## ✅ 체크포인트

- [ ] 도메인 랜덤화 환경이 동작하는가
- [ ] 두 정책의 강건성 차이를 수치로 확인했는가

## 📝 과제

- 랜덤화 범위를 넓힐 때/좁힐 때 성능 변화 관찰
- "왜 도메인 랜덤화가 Sim-to-Real에 도움이 되는가"를 10줄로 정리

## 🖼️ PPT 슬라이드 개요

1. Sim-to-Real 문제 정의
2. Reality Gap의 원인(물리·센서·지연)
3. 도메인 랜덤화(Domain Randomization)
4. system identification·domain adaptation
5. 사례: 루빅스큐브 손, ANYmal 보행
6. 실습: 랜덤화 학습·강건성 비교

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 도메인 랜덤화 구현 | 40 | 물리·노이즈 적용 | 일부 | 미동작 |
| 강건성 비교 실험 | 30 | 수치 비교·해석 | 비교만 | 미수행 |
| 과제(범위 실험) | 30 | 관찰·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: 11주차 정책, gymnasium, stable-baselines3

- ❌ 랜덤화 후 학습 실패 → 랜덤 범위가 과도, 범위 좁히기
- ❌ 두 정책 차이 없음 → 평가 환경의 물리값을 학습 범위 밖으로 설정
- ❌ 재현 안 됨 → 시드 고정·환경 버전 확인

## 🔗 참고자료

- Domain Randomization 논문 — <https://arxiv.org/abs/1703.06907>
- OpenAI Dexterity — <https://openai.com/research/learning-dexterity>
- Sim-to-Real 서베이 — <https://arxiv.org/abs/2009.13303>
