# 7주차 — SLAM과 자율주행 (Nav2)

!!! abstract "학습목표"
    SLAM으로 지도를 생성하고, Nav2로 목표지점까지 자율주행하는 파이프라인을 구성한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — SLAM·점유격자지도·Nav2 |
| 2교시 | 50분 | 실습 — SLAM 지도 작성 |
| 3교시 | 50분 | 실습 — Nav2 자율주행 |

## 📖 1교시. 이론

- **SLAM**: 위치추정과 지도작성을 동시에 (Cartographer, slam_toolbox)
- **점유격자지도(occupancy grid)**: free / occupied / unknown
- **Nav2 스택**: 전역계획(global planner) + 지역계획(local planner) + 코스트맵 + AMCL 위치추정

## 🛠️ 2교시. 실습 — SLAM

**Step 1 — 패키지 설치**

```bash
sudo apt install -y ros-humble-navigation2 ros-humble-nav2-bringup ros-humble-slam-toolbox
```

**Step 2 — 시뮬레이션 + SLAM 실행**

```bash
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
# 새 터미널
ros2 launch turtlebot3_cartographer cartographer.launch.py use_sim_time:=True
```

**Step 3 — 텔레오퍼레이션으로 환경 탐색하며 지도 작성**

```bash
ros2 run turtlebot3_teleop teleop_keyboard
# RViz에서 지도가 채워지는 것을 확인
```

**Step 4 — 지도 저장**

```bash
ros2 run nav2_map_server map_saver_cli -f ~/cluad_ws/map
```

## 🛠️ 3교시. 실습 — Nav2 자율주행

**Step 5 — 저장한 지도로 자율주행**

```bash
ros2 launch turtlebot3_navigation2 navigation2.launch.py \
  use_sim_time:=True map:=$HOME/cluad_ws/map.yaml
```

**Step 6 — 목표지점 설정**

- RViz에서 `2D Pose Estimate`로 초기 위치 지정
- `Nav2 Goal` 버튼으로 목표지점 클릭 → 로봇이 경로를 따라 자율주행

✅ 로봇이 장애물을 피해 목표까지 도달하면 성공.

## ✅ 체크포인트

- [ ] SLAM 지도가 생성·저장되는가
- [ ] Nav2로 목표지점 자율주행이 되는가

## 📝 과제

- 서로 다른 목표지점 3곳을 순차 방문하는 시나리오 캡처
- 지도 작성 결과(map.pgm) 제출

## 🖼️ PPT 슬라이드 개요

1. 위치추정과 지도작성 문제
2. SLAM 개념(Cartographer, slam_toolbox)
3. 점유격자지도(occupancy grid)
4. Nav2 스택 구조(global/local planner, costmap, AMCL)
5. 경로계획과 장애물 회피
6. 실습: 지도작성→저장→자율주행

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| SLAM 지도작성 | 35 | 깨끗한 지도·저장 | 작성만 | 실패 |
| Nav2 자율주행 | 35 | 목표 도달·회피 | 도달만 | 미동작 |
| 과제(다중 목표) | 30 | 순차 방문·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: navigation2, nav2_bringup, slam_toolbox/cartographer

- ❌ 지도가 깨짐 → 천천히 주행, 회전 시 속도↓
- ❌ Nav2 위치추정 실패 → `2D Pose Estimate`로 초기 위치 지정
- ❌ `use_sim_time` 경고 → 시뮬에서는 항상 `use_sim_time:=True`

## 🔗 참고자료

- Nav2 공식 문서 — <https://docs.nav2.org>
- slam_toolbox — <https://github.com/SteveMacenski/slam_toolbox>
- TurtleBot3 SLAM/Nav — <https://emanual.robotis.com/docs/en/platform/turtlebot3/nav_simulation/>
