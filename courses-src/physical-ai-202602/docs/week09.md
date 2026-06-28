# 9주차 — Spot + ATS SLAM 연동 part 2 (지도 저장·Localization·GIMP)

!!! abstract "학습목표"
    지난 주차에 만든 SLAM 지도를 **파일 형태(.pgm/.yaml)로 저장**하고, SLAM 대신 그 완성된 지도를 불러와 위치만 추정하는 **Localization 모드(AMCL + Nav2)** 로 전환하는 과정을 익힌다. 또한 저장된 지도에서 발생할 수 있는 문제와 원인을 분석하고, **GIMP로 지도 파일을 직접 보정**하여 경로 안정성을 높이는 방법을 실습한다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「Spot + ATS SLAM 연동 part 2 (지도 저장·Localization·GIMP)」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 명령·파라미터는 교안의 설명을 충실히 따르되, 경로는 실습 환경에 맞춰 확인이 필요합니다.

!!! note "강의 흐름 (FLOW)"
    `SLAM 지도생성` → `지도 저장` → `Localization` → `맵 수정(GIMP)` → `재주행`

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | SLAM 모드 복습 + 지도 생성·저장(.pgm/.yaml) | §01 Intro, §02 |
| 2교시 | 50분 | Localization 모드 전환 · 지도 불러오기 · AMCL/Nav2 파라미터 | §03 |
| 3교시 | 50분 | 맵 저장 후 문제·원인 분석 + GIMP 지도 보정 + Wrap-up | §04~§06 |

---

## 🧭 1. Intro — 이번 강의의 흐름

![Spot + ATS SLAM 연동 part 2 표지](img/w09/s01.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 (지도 저장·Localization·GIMP) — 슬라이드 01 (출처: ENGI UNIVERSE)
///

지난 강의에서는 Spot + ATS를 Isaac Sim 환경에서 **SLAM 모드**로 실행했습니다.

- `slam_toolbox`(online_async) 사용 → **지도 생성(SLAM) + 위치 추정(Localization)** 동시 수행
- 로봇이 아무 지도 없이 주변을 탐색하며 **LiDAR + Odom** 기반으로 점점 더 정밀한 지도(map) 작성
- 생성된 지도를 기반으로 Nav2 글로벌/로컬 플래너가 경로를 만들고 **2D Nav Goal → 자율이동**까지 성공

**이번 강의에서 할 일:**

| 단계 | 내용 |
| --- | --- |
| ① 지도 저장 | SLAM으로 만든 지도를 파일(.pgm/.yaml)로 저장 |
| ② 모드 전환 | SLAM 대신 완성된 지도를 불러와 **위치만 추정**(Localization) |
| ③ 자율 이동 | 지도는 **고정**, 로봇은 그 지도에서 자기 위치를 추적하며 이동 |

!!! note "SLAM vs Localization 한눈에"
    - **SLAM 모드**: 지도를 만들면서 동시에 내 위치를 추정 (지도가 계속 변함)
    - **Localization 모드**: 지도는 고정해 두고, 그 위에서 내 위치만 추정 (AMCL이 담당)

---

## 🗺️ 2. SLAM 모드에서 지도 생성 및 저장하기

![SLAM 모드 지도 생성 복습](img/w09/s04.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 04 (출처: ENGI UNIVERSE)
///

### 지난 강의 복습 — 실행 순서

지도 생성을 위해 먼저 **Isaac Sim → SLAM** 순서로 실행합니다(*필히 경로 확인*).

**Step 1 —** Isaac Sim 실행 (필히 경로 확인)
**Step 2 —** SLAM 실행 (필히 경로 확인)
**Step 3 —** SLAM과 Nav2를 동시 실행 (필히 경로 확인)

### `slam_toolbox_params.yaml` — SLAM 동작 정의

SLAM은 `slam_toolbox_params.yaml`을 통해 동작 방식을 정의합니다.

| 파라미터 | 값 | 의미 |
| --- | --- | --- |
| `map_frame` / `odom_frame` / `base_frame` | map / odom / **body** | Spot 본체 링크가 `body`이므로 동일 프레임 구조로 맞춤 |
| `scan_topic` | scan | LiDAR가 `/scan`으로 퍼블리시 → 같은 토픽으로 연결 |
| `use_odometry` | true | Isaac Sim이 `/odom` 제공 → 초기 정합에 활용 |
| `publish_tf` / `provide_odom_frame` | true / true | map → odom → body **TF 체인**을 직접 퍼블리시 |
| `resolution` | 0.05 | 지도 해상도 **5cm** |
| `max_laser_range` | 20.0 | LiDAR 유효 범위 **20m** 기준 매핑 |

!!! tip "프레임이 `body`인 이유"
    Isaac Sim에서 Spot의 본체 링크 이름이 `body`이기 때문에, slam_toolbox·Nav2·AMCL 모두 `base_frame`(robot_base_frame)을 `body`로 통일해야 TF 체인이 끊기지 않습니다.

### `nav2_params.yaml` — 경로·제어·costmap 설정

![Nav2와 slam_toolbox 동시 구동](img/w09/s07.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 07 (출처: ENGI UNIVERSE)
///

- `controller_server` : plugin은 **RegulatedPurePursuitController** 사용
- `desired_linear_vel: 2.0` : Isaac Sim 환경에서 Spot의 이동 속도
- `max_angular_accel: 2.0`
- `global_costmap` / `local_costmap` : `robot_base_frame`이 모두 `body`
- `inflation_layer` : 로봇이 벽·장애물로부터 거리를 두도록 설정 (`inflation_radius: 0.6`)

### 지도 파일 생성

**Step 1 —** SLAM + RViz2 실행
**Step 2 —** 지도 생성 전 RViz2 확인 — `/map`, `/scan`, `/odom`, `/tf` 등 Spot 정보 확인
**Step 3 —** RViz2상의 Spot을 **키보드로 제어**하여 지도 생성 및 정상 동작 확인
**Step 4 —** ROS2 지도 저장 명령 실행 (*필히 경로 확인*)

```bash
# ROS2 지도 저장 (경로/이름은 환경에 맞게 확인)
ros2 run nav2_map_server map_saver_cli -f ~/maps/spot_ats_map
```

저장 결과는 **이미지 파일**과 **메타데이터 파일** 두 개로 생성됩니다.

```text
~/maps/spot_ats_map.pgm    # 실제 지도 이미지 (흑백)
~/maps/spot_ats_map.yaml   # 지도 메타데이터 (해상도, 원점, 임계값 등)
```

!!! success "체크"
    `.pgm`(이미지)과 `.yaml`(메타데이터)이 한 쌍으로 저장되어야 Localization 모드에서 정상적으로 불러올 수 있습니다.

---

## 📍 3. Localization 모드로 전환하여 지도 불러오기

![지도 기반 Localization 개념](img/w09/s10.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 10 (출처: ENGI UNIVERSE)
///

SLAM을 사용하지 않고 **미리 생성된 지도**를 통해 로봇이 자신의 위치를 추정하고 경로를 계획하는 방법입니다. 고정된 위치·범위에서 동작하는 로봇에게 **안정적인 자율보행**이 가능합니다.

### 두 개의 런치 파일

Localization 모드 Nav2 실행에는 **두 개의 런치 파일**이 필요합니다.

=== "localization_launch.py"

    기존 지도를 로딩하고 **AMCL**을 통해 로봇 위치를 추정

    - **지도**: `map_server`가 저장된 지도 파일(`spot_ats_map.yaml`)을 로드하고 `map` 토픽으로 퍼블리시
    - **위치 추정**: AMCL이 `/scan` + `/odom`을 이용해 현재 로봇 위치를 지도 좌표계에서 추정
    - 오도메트리가 **odom → body**, AMCL이 **map → odom**을 이어주어 전체 좌표계(**map → odom → body**)가 닫힘

=== "navigation_launch.py"

    경로 계획에 필요한 네비게이션 엔진을 실행

    - `planner_server` : 전역 경로 생성
    - `controller_server` : 경로 → `cmd_vel` 속도 명령 변환
    - `smoother_server` : 경로 곡률/형태 보정
    - `behavior_server` : 회전/후진/복구 동작 처리
    - `bt_navigator` : 전체 흐름을 **행동 트리(BT)** 로 조율

!!! note "비용맵 구성"
    `/map` → **Static Layer**, `/scan` → **Obstacle Layer**, `inflation_radius` → 장애물 주변 완충 영역 확보. 지도는 고정, 위치 추정은 AMCL이 담당 → **역할 분리 / 충돌 방지 / 경로 안정성** 확보.

### 실행 및 RViz 전환

![Localization 모드 실행 — RViz 전환](img/w09/s13.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 13 (출처: ENGI UNIVERSE)
///

- `localization_launch.py`와 `navigation_launch.py` 실행 (*필히 경로 확인*)
- RViz 전환 → 정적인 지도(`spot_ats_map.yaml`, `spot_ats_map.pgm`) **즉시 로딩**
- SLAM 수행 X → 공간 참조 고정, **AMCL이 로봇 위치 추정**

!!! tip "여기서 잠깐! — 지도가 RViz에 안 보일 때"
    `/map`이 로드되지 않으면 토픽의 **QoS 정책**을 바꿔줍니다.

    - `/map` → 토픽 → **Reliability Policy → Reliable** 변경
    - → **Durability Policy → Transient Local** 변경

### QoS 보충 — Reliability / Durability Policy란?

RViz에서 지도가 보이지 않는다면 단순히 '지도 데이터가 없어서'가 아니라, RViz가 `/map` 토픽 메시지를 **제때 받지 못해서**일 수 있습니다.

| 정책 | 의미 | 지도에 권장 |
| --- | --- | --- |
| **Reliability** | 메시지를 얼마나 '확실하게' 전달할지 | `Best Effort`(손실 허용) ↔ `Reliable`(응답까지 재전송) → **Reliable** |
| **Durability** | 늦게 구독한 노드가 과거 메시지를 받을 수 있는지 | `Volatile`(과거 미전달) ↔ `Transient Local`(마지막 메시지 캐시 후 재전송) → **Transient Local** |

`/map` 토픽은 보통 오래 전 **한 번만** 퍼블리시되고 끝나는 경우가 많습니다. 기본값(Volatile)이면 늦게 켜진 RViz가 타이밍을 놓쳐 화면이 텅 비게 됩니다. **Transient Local**로 바꾸면 퍼블리셔가 마지막 지도를 캐시에 보관했다가 새 구독자에게 다시 보내주므로, RViz가 늦게 연결되어도 최신 지도를 정상 표시합니다.

### 초기 위치(Initial Pose) 설정

![초기 위치 설정 — please set the initial pose](img/w09/s17.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 17 (출처: ENGI UNIVERSE)
///

- 부팅 시 로그: **"please set the initial pose..."**
- 프로그램 부팅 시 로봇의 실제 위치 좌표가 모호 → **초기 위치(Initial Pose = AMCL의 초기 추정치)** 설정 필요
- AMCL은 초기 위치 값을 기반으로 `/scan`, `/map` 정보를 비교하며 **확률적 위치 추정**
- 즉, **초기 위치 = 기준점 제시** (RViz의 **2D Pose Estimate**로 지정)

### `nav2_localization_params.yaml` — 핵심 파라미터

![nav2_localization_params.yaml AMCL 파라미터](img/w09/s24.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 24 (출처: ENGI UNIVERSE)
///

=== "Planner / Controller"

    - `bt_navigator` : `navigate_w_replanning_and_recovery.xml` → 이동 중 재계획 & 리커버리 자동 수행, `use_sim_time: true`(Isaac Sim 시간 동기화)
    - `planner_server` : **NavfnPlanner**, `global_frame: map`, `expected_planner_frequency: 5.0`(초당 5회), `tolerance: 0.5`(0.5m 이내 도달 처리)
    - `controller_server` : **RegulatedPurePursuitController**, `controller_frequency: 30.0`, `desired_linear_vel: 1.2`, `use_rotate_to_heading: true`, `rotate_to_heading_min_angle: 0.26`, `allow_reversing: true`, `transform_tolerance: 0.2`

=== "Smoother / Behavior / Costmap"

    - `smoother_server` : **SimpleSmoother** → 각진 모서리를 부드럽게 보정(조향 안정성 향상)
    - `behavior_server` : `spin`(제자리 회전 후 재스캔), `backup`(후진 탈출), `drive_on_heading`(직진 정렬), `assisted_teleop`, `wait`
    - `global_costmap` : `global_frame: map`, `static_layer`(저장 맵, `map_subscribe_transient_local: true`), `obstacle_layer`(`/scan` 실시간), `inflation_layer`(완충 0.6m), `robot_base_frame: body`
    - `local_costmap` : `global_frame: odom`(주변 6×6m), `robot_base_frame: body`
    - `velocity_smoother` : `smoothing_frequency: 20.0`, `max_velocity`/`accel_limit`/`decel_limit` `[vx, vy, wz]`

=== "AMCL / map_server"

    **AMCL(Adaptive Monte Carlo Localization)** — 지도 위 현재 위치를 확률 기반으로 추정

    - `base_frame_id: body` / `odom_frame_id: odom` / `global_frame_id: map` / `scan_topic: scan`
    - `tf_broadcast: true`, `transform_tolerance: 0.2` → map → odom 변환 안정화
    - `min_particles: 500` ~ `max_particles: 2000` → 위치 가설 폭 & 연산량 균형
    - `update_min_d: 0.05` / `update_min_a: 0.05` → 최소 이동이 있을 때만 관측 업데이트
    - `laser_model_type: "likelihood_field"`, `z_hit: 0.95`, `z_rand: 0.05`, `sigma_hit: 0.2`, `laser_likelihood_max_dist: 2.0`
    - `set_initial_pose: false` → 초기 위치는 RViz **2D Pose Estimate**로 지정

    **map_server** — 고정 지도(`/map`) 퍼블리시: `yaml_filename`으로 저장 맵 로드. 단, launch 인자로 `map:=...`가 들어오면 **그 값이 우선 적용**됩니다.

!!! success "실행 확인"
    RViz 전환 → **Fixed Frame → map** → 데이터가 정상 표시되는지 확인.

---

## 🔍 4. 맵 저장 이후 발생할 수 있는 문제와 원인 분석

![SLAM 지도 문제와 원인](img/w09/s26.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 26 (출처: ENGI UNIVERSE)
///

**SLAM 지도는 항상 완벽하지 않습니다.** 지도에 오류가 있으면 로봇이 실제와 다른 **"가짜 세계"** 를 보고 판단하게 됩니다.

| 문제 | 원인 / 증상 |
| --- | --- |
| **스캔 누락** | LiDAR 스캔이 일부 누락되면 벽이 완전히 연결되지 않음 |
| **얇은 틈(Gap)** | RViz에서는 거의 안 보이지만 Planner가 "통로"로 인식 → 경로가 벽을 관통 |
| **벽 겹침(Loop Closure 실패)** | 한 바퀴 돌아왔을 때 정렬 실패 → 같은 벽이 두 줄로 그려짐 → 위치 추정 흔들림 |
| **외곽 노이즈 띠** | `max_laser_range`를 과도하게 크게 설정 → 신뢰도 낮은 먼 스캔이 잡음으로 포함 |
| **지도 기울어짐** | 바퀴 슬립·IMU 편향·odom 드리프트 누적 → 지도 전체 비틀림(odometry/TF 불일치) |
| **계단형 윤곽** | `use_sim_time` 타임싱크가 어긋나면 지도 윤곽이 들쭉날쭉 |

!!! note "여기서 잠깐! — 반사율이 높으면 데이터를 놓치는 이유"
    LiDAR는 레이저 펄스를 쏘고 반사되어 돌아오는 시간을 측정해 거리를 계산합니다. 그런데 표면이 너무 매끄럽고 반사율이 높으면 빛이 정면으로 반사되지 않고 **거울처럼 특정 방향으로 튕겨** 나갑니다. 결국 센서로 되돌아오는 신호가 약해지거나 아예 들어오지 않아 해당 영역이 **"빈 공간"** 으로 인식되고, 실제로 벽이 있어도 그 부분이 비어 있거나 흐릿하게 나타납니다.

---

## 🎨 5. GIMP로 지도 파일 직접 수정하기

![GIMP로 지도 보정](img/w09/s29.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 29 (출처: ENGI UNIVERSE)
///

**GIMP**는 지도 이미지를 열어 직접 벽을 보강하거나 불필요한 노이즈를 제거하는 툴입니다. **사람의 판단으로 지도를 다듬는 과정**입니다.

### 사용 이유

1. **SLAM 지도 특성** — 반사/투과 재질(유리·금속), 얇은 물체는 스캔이 불안정 → 약하게 표현되거나 누락
2. **FoV 한계** — 라이다 배치에 따라 상/하/측면 사각지대 발생
3. **네비게이션 문제** — 비용맵이 얇은 틈을 "통로"로 오인 → 플래너가 직선 경로 생성 → 얇은 틈으로 로봇 진입

해결 방안: GIMP 등으로 `.pgm` 맵을 직접 열어 **"벽(검정)"** 과 **"빈 공간(흰색)"** 을 사람이 명확히 구분해 다시 채워 넣습니다. 불확실한 부분을 사람이 **확실한 장애물로 선언** → 경로 안정성 향상.

### 파일 준비와 색 규칙

| 파일 | 역할 |
| --- | --- |
| `map2.yaml` | 메타데이터(해상도, 원점, 임계값) |
| `map2.pgm` | 실제 흑백 지도 이미지 |

| 픽셀 값 | 의미 |
| --- | --- |
| **검정 (0)** | 장애물(점유 영역, 지나갈 수 없음) |
| **흰색 (255)** | 자유공간(이동 가능) |
| **회색 (중간값)** | 미확인/애매 영역 |

### GIMP 실행 시 확인 사항

![GIMP 실행 — 편집 규칙](img/w09/s31.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 2 — 슬라이드 31 (출처: ENGI UNIVERSE)
///

**Step 1 — 파일 열기**: File → Open → `map2.pgm`

**Step 2 — 이미지 모드 확인**: Image → Mode → **Grayscale** 인지 확인

**Step 3 — 알파 채널 제거**: Layer → Transparency → **Remove Alpha Channel** (지도 픽셀은 0~255 단일 값)

**Step 4 — 해상도 변경 금지**: Image → **Scale Image 사용 금지**

**Step 5 — 벽 그리기**:

- **Pencil**(Hardness 100%) 사용, 색상 = 완전 검정 `(0,0,0)`
- 직선: 시작점 클릭 → **Shift+클릭**으로 반듯하게 그리기
- 해상도 0.05m 기준: 벽 두께 **2~3 px ≈ 약 10~15 cm** → 충분히 벽으로 인식됨

**Step 6 — 내보내기**: File → Export As → `*.pgm` 유지, Export 옵션에서 **Format = raw** 선택

!!! tip "YAML 경로 확인"
    GIMP로 수정한 `.pgm`을 Localization에서 쓰려면 해당 `.yaml`이 올바른 이미지 파일을 가리키는지 (*필히 경로 확인*) 점검합니다.

### RViz에서 경로 검증

- RViz → **Fixed Frame = map** → 검정 벽 확인 가능
- **2D Nav Goal**로 선반 뒤쪽 등 목적지 지정 → 경로가 검정 벽을 **피해서 우회**하는지 확인
- 경로가 여전히 벽을 관통한다면 점검:
    1. `global_costmap`의 `static_layer`가 실제로 **새 맵을 구독**하고 있는지 확인
    2. `inflation_layer.inflation_radius`가 벽을 너무 가깝게 지나지 않도록 **완충폭 확보**

---

## 🧩 6. Wrap-up

오늘 강의 내용 요약:

- ✅ **SLAM으로 지도 생성 & 저장** (.pgm / .yaml)
- ✅ **AMCL 기반 위치추정 + Nav2 자율주행** 실행 (Localization 모드)
- ✅ **GIMP로 지도 보정** → 경로 우회 여부 검증

!!! success "핵심 메시지"
    SLAM 모드는 지도를 만드는 단계, Localization 모드는 만들어진 지도를 **고정해 두고 그 위에서 내 위치만 추적**하는 단계입니다. 지도가 완벽하지 않으면 로봇이 "가짜 세계"를 보므로, **사람이 GIMP로 직접 보정**해 경로 안정성을 확보하는 것이 실전에서 매우 중요합니다.

## ✅ 체크포인트

- [ ] `map_saver_cli`로 지도를 `.pgm` + `.yaml` 한 쌍으로 저장할 수 있는가
- [ ] `localization_launch.py` + `navigation_launch.py`로 Localization 모드를 실행할 수 있는가
- [ ] 지도가 RViz에 안 보일 때 `/map` QoS를 **Reliable / Transient Local**로 바꿀 수 있는가
- [ ] RViz **2D Pose Estimate**로 AMCL 초기 위치를 지정할 수 있는가
- [ ] GIMP로 `.pgm`의 벽(검정)을 보강하고 raw 형식으로 내보내 경로 우회를 검증할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| 지도 저장 | 20 | SLAM 지도를 `.pgm`/`.yaml`로 정확히 저장 |
| Localization 전환 | 25 | localization/navigation 런치 실행 + 지도 로딩 + AMCL 초기 위치 설정 |
| QoS/파라미터 이해 | 20 | Reliable·Transient Local QoS 및 AMCL/Nav2 핵심 파라미터 설명 |
| 문제·원인 분석 | 15 | 스캔 누락·얇은 틈·Loop Closure 등 지도 오류 원인 진단 |
| GIMP 지도 보정 | 20 | 색 규칙 준수 보정 + raw 내보내기 + RViz 경로 우회 검증 |

## 🔗 출처 및 참고자료

- 교안 **「Spot + ATS SLAM 연동 part 2 (지도 저장·Localization·GIMP)」** (제작: *ENGI UNIVERSE*)
- Nav2 — AMCL & Map Server: <https://docs.nav2.org>
- slam_toolbox: <https://github.com/SteveMacenski/slam_toolbox>
- GIMP: <https://www.gimp.org>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [ROS 2 튜토리얼](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/index.html)
    - [USD로 작업하기](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/omniverse_usd/intro_to_usd.html)

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (31매)"
    ![슬라이드 01](img/w09/s01.jpg){ width="700" }
    ![슬라이드 02](img/w09/s02.jpg){ width="700" }
    ![슬라이드 03](img/w09/s03.jpg){ width="700" }
    ![슬라이드 04](img/w09/s04.jpg){ width="700" }
    ![슬라이드 05](img/w09/s05.jpg){ width="700" }
    ![슬라이드 06](img/w09/s06.jpg){ width="700" }
    ![슬라이드 07](img/w09/s07.jpg){ width="700" }
    ![슬라이드 08](img/w09/s08.jpg){ width="700" }
    ![슬라이드 09](img/w09/s09.jpg){ width="700" }
    ![슬라이드 10](img/w09/s10.jpg){ width="700" }
    ![슬라이드 11](img/w09/s11.jpg){ width="700" }
    ![슬라이드 12](img/w09/s12.jpg){ width="700" }
    ![슬라이드 13](img/w09/s13.jpg){ width="700" }
    ![슬라이드 14](img/w09/s14.jpg){ width="700" }
    ![슬라이드 15](img/w09/s15.jpg){ width="700" }
    ![슬라이드 16](img/w09/s16.jpg){ width="700" }
    ![슬라이드 17](img/w09/s17.jpg){ width="700" }
    ![슬라이드 18](img/w09/s18.jpg){ width="700" }
    ![슬라이드 19](img/w09/s19.jpg){ width="700" }
    ![슬라이드 20](img/w09/s20.jpg){ width="700" }
    ![슬라이드 21](img/w09/s21.jpg){ width="700" }
    ![슬라이드 22](img/w09/s22.jpg){ width="700" }
    ![슬라이드 23](img/w09/s23.jpg){ width="700" }
    ![슬라이드 24](img/w09/s24.jpg){ width="700" }
    ![슬라이드 25](img/w09/s25.jpg){ width="700" }
    ![슬라이드 26](img/w09/s26.jpg){ width="700" }
    ![슬라이드 27](img/w09/s27.jpg){ width="700" }
    ![슬라이드 28](img/w09/s28.jpg){ width="700" }
    ![슬라이드 29](img/w09/s29.jpg){ width="700" }
    ![슬라이드 30](img/w09/s30.jpg){ width="700" }
    ![슬라이드 31](img/w09/s31.jpg){ width="700" }
