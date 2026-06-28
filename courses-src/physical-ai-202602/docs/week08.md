# 8주차 — 중간고사 (Isaac Sim & SLAM 종합)

!!! abstract "학습목표"
    1~7주차에서 다룬 **Isaac Sim 환경 구축·센서 시뮬레이션·Isaac Lab 강화학습·Spot+ATS 구축·SLAM/Nav2 자율주행**을 종합 평가한다. 개념 이해(이론)와 실제 시뮬레이션 구성 능력(실기)을 함께 점검한다.

!!! quote "출처 (Source)"
    평가 범위는 교안 **NVIDIA Isaac Sim 1~5강** 및 **SLAM 1~2강**(제작: ENGI UNIVERSE)에 기반한다.

!!! note "강의 흐름 (FLOW)"
    `Isaac Sim` → `센서` → `Isaac Lab` → `SLAM` → `Nav2`

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 평가 (서술/객관식) |
| 2교시 | 50분 | 실기 평가 — Isaac Sim 환경·센서 구성 |
| 3교시 | 50분 | 실기 평가 — SLAM/Nav2 자율주행 |

## 📚 평가 범위

| 주차 | 주제 | 핵심 키워드 |
| --- | --- | --- |
| 1 | Isaac Sim 설치·활용 | 권장 사양, 시뮬레이션의 이점 |
| 2 | 물리환경·카메라 센서 | Stage/World/Prim, DynamicCuboid, RGB/Depth |
| 3 | IMU·LiDAR·Radar | RTX LiDAR, Annotator, PointCloud |
| 4 | Isaac Lab 강화학습 | MDP, Action/Observation, Height Scan |
| 5 | Spot+ATS 구축 | URDF Import, ROS2 연동, RL 재학습 |
| 6 | SLAM·Nav2 기본 | Odometry, Sensor Fusion, slam_toolbox |
| 7 | Spot+ATS SLAM 연동 | ROS2 Bridge, TF 트리, 자율주행 |

## 📝 1교시. 이론 평가 (예시 문항)

1. Isaac Sim에서 **Stage / World / Prim** 의 차이를 설명하고, `/World/Robot1/base_link` 경로가 의미하는 바를 쓰라.
2. `SimulationApp({"headless": ...})` 의 `headless` 옵션이 GUI 모드와 학습(백그라운드) 모드에서 갖는 의미를 비교하라.
3. **RGB 카메라**와 **Depth 카메라**가 생성하는 데이터와 활용 목적을 각각 설명하라.
4. RTX LiDAR 시뮬레이션에서 **Annotator** 와 **Writer(PointCloud)** 의 역할을 구분하라.
5. Isaac Lab 강화학습에서 **Action** 과 **Observation** 설계가 왜 중요한지, Height Scan 센서의 역할과 함께 설명하라.
6. **SLAM** 과 **Localization(위치추정)** 의 차이, 그리고 **Odometry + Sensor Fusion** 이 필요한 이유를 쓰라.
7. Isaac Sim과 ROS 2를 연결할 때 **TF 트리 정합**이 자율주행에 중요한 이유를 설명하라.

## 🛠️ 2교시. 실기 — Isaac Sim 환경·센서 (예시 과제)

!!! note
    제한시간 내 다음을 구성·실행하고 결과(스크린샷/로그)를 제출.

**과제 A** — Isaac Sim에서 `World` 생성 + Ground Plane + `DynamicCuboid`(빨간 큐브)를 1m 높이에 배치하고, 중력으로 낙하·충돌하는 장면을 시뮬레이션하라.

```python
from isaacsim import SimulationApp
simulation_app = SimulationApp({"headless": False})
from isaacsim.core.api import World
from isaacsim.core.api.objects import DynamicCuboid

world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()
world.scene.add(DynamicCuboid(prim_path="/World/cube",
    position=[0, 0, 1.0], scale=[0.5, 0.5, 0.5], color=[255, 0, 0]))
world.reset()
while simulation_app.is_running():
    world.step(render=True)
simulation_app.close()
```

**과제 B** — 큐브에 **RGB 또는 RTX LiDAR 센서**를 부착하고, 센서 데이터를 시각화(HUD 또는 PointCloud)하라.

## 🛠️ 3교시. 실기 — SLAM/Nav2 (예시 과제)

**과제 C** — Spot+ATS(또는 제공 로봇) 시뮬레이션에서 `slam_toolbox`로 지도를 작성하고, **Nav2 2D Goal**로 목표지점까지 자율주행시켜라.

- 평가 포인트: 센서 토픽 ROS2 퍼블리시 · TF 트리 정합 · 지도 생성 · 목표 도달

## 📊 평가 기준

| 항목 | 비중 |
| --- | --- |
| 이론 서술 | 40% |
| 실기 — Isaac Sim 환경·센서(A·B) | 35% |
| 실기 — SLAM/Nav2(C) | 25% |

## 🧰 유의사항

- 시험 전 `env_isaaclab` Conda 환경과 ROS 2 워크스페이스 빌드가 정상인지 확인
- 시뮬이 무거우면 불필요한 뷰포트/디스플레이를 끄고 진행
- 시험 후 **9주차부터는 Physical AI(System-1/System-2) 파트**로 전환된다 (SLAM 후속 + LLM 고수준 제어)
