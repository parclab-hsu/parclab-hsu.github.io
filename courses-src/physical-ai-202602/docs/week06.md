# 6주차 — SLAM과 Navigation 기본 개념 (slam_toolbox·Nav2)

!!! abstract "학습목표"
    ATS+Spot 자율보행 시뮬레이션에 필요한 **SLAM(동시적 위치추정 및 지도작성)** 의 기본 개념을 파악한다. 특히 SLAM에서 **오도메트리(Odometry)** 와 **센서 융합(Sensor Fusion)** 의 역할을 이해하고, "센서 정보 → 위치 추정 → 지도 작성(Mapping)"으로 이어지는 큰 흐름과 함께 **slam_toolbox** 와 **Nav2(Navigation2)** 스택의 구조 및 YAML 설계 방법을 익힌다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「SLAM과 Navigation 기본 개념 (slam_toolbox·Nav2)」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드·파라미터는 교안 설명을 충실히 따른 **재구성 예제**입니다.

!!! note "강의 흐름 (FLOW)"
    `Odometry` → `Sensor Fusion` → `Mapping(SLAM)` → `Nav2` → `자율주행`

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | SLAM의 기본 원리(Front-end/Back-end, Odometry·Sensor Fusion) + Nav2 스택 개요 | §01~03 |
| 2교시 | 50분 | slam_toolbox 사용하기 (동작 구성·YAML 설계) | §03~04 |
| 3교시 | 50분 | Nav2 사용하기 (BT Navigator·Planner·Controller·Costmap·YAML) + Wrap-up | §05~06 |

---

## 🗺️ 01. Intro — 이번 강의 목표

![강의 표지: SLAM과 Navigation 기본 개념](img/w06/s01.jpg){ width="720" }
/// caption
SLAM과 Navigation 기본 개념 (slam_toolbox·Nav2) — 슬라이드 01 (출처: ENGI UNIVERSE)
///

- **ATS + Spot 자율보행 시뮬레이션**에 필요한 SLAM의 기본 개념 파악
- SLAM에서 **오도메트리(Odometry)** 와 **센서 융합(Sensor Fusion)** 의 역할 이해
- **센서 정보 → 위치 추정 → 지도 작성(Mapping)** 으로 이어지는 큰 구조 파악

![CONTENTS — SLAM 기본 원리부터 Nav2까지](img/w06/s02.jpg){ width="720" }
/// caption
SLAM과 Navigation 기본 개념 (slam_toolbox·Nav2) — 슬라이드 02 (출처: ENGI UNIVERSE)
///

---

## 🧭 02. SLAM의 기본 원리 (Odometry · Sensor Fusion)

!!! note "SLAM이란?"
    **"나는 지금 어디에 있고(내 위치 파악), 내 주변 환경은 어떻게 생겼는지(지도 그리기)를 동시에 알아내는 기술"** 입니다. *Simultaneous Localization And Mapping* 의 약자입니다.

![SLAM 개념 — 위치추정과 지도작성을 동시에](img/w06/s04.jpg){ width="720" }
/// caption
SLAM과 Navigation 기본 개념 — 슬라이드 04 (출처: ENGI UNIVERSE)
///

SLAM의 구조는 보통 두 단계로 분류됩니다.

| 단계 | 역할 | 핵심 내용 |
| --- | --- | --- |
| **앞단 (Front-end)** | 센서 관측 기반 **제약 조건(관측 방정식) 생성** | 카메라 → 코너·에지 등 특징점 추출 / LiDAR → 포인트 클라우드로 공간 구조 수집 / IMU → 자세 변화(회전·가속) 추정 |
| **뒷단 (Back-end)** | 앞단이 모은 제약 조건들을 **수학적으로 통합** | 그래프 최적화 / 확률적 최적화로 궤적과 지도를 동시 정합. 오차 큰 구간 → 궤적 보정. 최종적으로 일관된 **궤적 + 지도** 생성 |

!!! tip "센서별 역할 (Sensor Fusion)"
    여러 센서의 정보를 융합해 약점을 서로 보완합니다. LiDAR는 공간 구조, 카메라는 특징점, IMU는 자세 변화를 담당하며, 이들을 제약 조건으로 통합해 정확한 위치·지도를 만듭니다.

---

## 🤖 03. Nav2(Navigation2) 스택 개요

![Nav2 스택 구조 — Planner·Controller·BT Navigator](img/w06/s06.jpg){ width="720" }
/// caption
Nav2 스택 개요 — 슬라이드 06 (출처: ENGI UNIVERSE)
///

**NAV2**는 *Navigation2* 의 약자로, **ROS2에서 사용되는 로봇 자율주행 표준 프레임워크**입니다. 로봇이 스스로 갈 길을 찾고, 장애물을 피하고, 목적지에 도착할 수 있게 해주는 **자율주행 엔진**입니다. ROS1의 `move_base`를 대체하는 ROS2의 표준 패키지입니다.

| 구성 요소 | 역할 | 대표 플러그인 |
| --- | --- | --- |
| **Planner** (전역 경로) | A지점 → B지점 최적 경로 탐색. 전역 경로를 그려 **Global Planner**라고도 함 | NavFn, SmacPlanner |
| **Controller** (이동 제어) | Planner의 경로를 올바르게 따라가도록 이동 제어. (예: 오른쪽으로 치우침 → 경로 중앙으로 이동 지시) | RegulatedPurePursuitController |
| **BT Navigator** (행동 결정) | *Behavior Tree Navigator*. 다양한 상황에 맞는 행동 결정. (예: 장애물 발견 → 회피 시도 → 실패 시 맵 초기화 → 재계획) | Behavior Tree(XML) |

!!! success "Nav2 요약"
    **Planner(전역 경로 생성) + Controller(이동 제어) + BT Navigator(행동 조합 및 상황 대응)**

### SLAM과 Navigation을 위한 패키지 구성

- **slam_toolbox 패키지**: 온라인 맵핑, 루프 클로저, 맵 저장과 로드 기능까지 모두 지원
    - `online_async_launch.py`, `online_sync_launch.py`: 실시간 지도 작성과 동시 자기 위치 추정 런치 → 일반적으로 **`online_async`** 를 많이 사용
    - slam_toolbox 노드는 YAML의 지정 프레임명(map, odom, base_link)과 센서 토픽을 받아 동작
    - YAML은 노드의 모든 동작 방식을 정의하는 설계도 → **`slam_toolbox_params.yaml`**
- **Nav2 스택**: 경로 계획·속도 제어·행동 트리 기반 자율주행 로직의 대형 스택
    - **Planner Server**: 지도 위에서 목적지까지의 전역 경로 계산 (예: NavFn, SmacPlanner)
    - **Controller Server**: 경로를 따라가도록 실시간 속도 명령 생성 (예: Regulated Pure Pursuit Controller)
    - **BT Navigator**: Behavior Tree를 이용해 복잡한 논리 관리
    - 기타: `nav2_bringup` → `navigation_launch.py` (map_server, amcl, waypoint_follower 같은 노드 실행)

![slam_launch.py 소스코드 구조](img/w06/s10.jpg){ width="720" }
/// caption
Nav2 스택 개요 — 슬라이드 10: slam_launch.py 소스코드 (출처: ENGI UNIVERSE)
///

### `slam_launch.py` 소스코드 흐름

런치 파일은 SLAM 노드뿐 아니라 **맵 저장 서버(map_saver_server)** 까지 함께 준비합니다.

**Step 1 — 모듈 구성**

- `launch.actions` / `launch_ros.actions` 계열: 실행할 노드를 "파이썬 코드로" 조립해 `LaunchDescription`으로 반환
- `RewrittenYaml` / `ParameterFile`: 사용자가 넘긴 YAML 파라미터를 런치 시점에 가공해 노드에 주입

**Step 2 — 변수 및 리스트 선언**

- `LaunchConfiguration()`: 런치 인자를 입력하면 지정된 인자를 반환 (런치 인자: `namespace`, `params_file`, `use_sim_time` 등)
- `lifecycle_nodes`: SLAM으로 만든 지도를 맵 저장 서버(`map_saver_server`)에 올리기 위한 변수 → 라이프사이클 매니저가 리스트 `['map_saver']`를 넘겨받음

!!! note "여기서 잠깐! — 라이프사이클 노드(Lifecycle Node)란?"
    ROS2에서 보통 쓰는 노드는 실행하자마자 바로 동작을 시작합니다(퍼블리셔는 곧바로 토픽 송신, 서브스크라이버는 곧바로 구독). 그런데 `map_saver_server` 같은 노드는 **아직 SLAM이 초기화되지 않았는데 저장을 시도하면 빈 지도가 나오거나 오류**가 날 수 있습니다.

    이를 막기 위해 **라이프사이클 노드**는 *상태(state)* 를 가집니다. 처음에는 설정되지 않은 상태로 시작 → 준비가 끝나면 **inactive** → 실제 동작 시작 시 **active** 로 전환되며, 필요하면 다시 비활성화·종료도 가능합니다. 언제 기능을 시작·정지할지 명확히 제어할 수 있어 **시스템 전체의 안정성**을 높입니다.

**Step 3 — 패키지 경로 및 YAML 가공**

- `get_package_share_directory()`: `nav2_bringup`, `slam_toolbox`의 설치 경로 반환
- `slam_launch_file`: 런치 파일 경로를 `launch/online_sync_launch.py`로 설정
- `param_substitutions`: YAML의 `use_sim_time` 값을 런치 인자로 덮어쓰기
- `RewrittenYaml`: `params_file`을 런치 시점에 가공
    - `root_key=namespace`: 네임스페이스가 비면 최상단, 지정하면 해당 키 아래에 파라미터 트리 배치
    - `convert_types=True`: `"True"` 같은 문자열을 실제 타입으로 자동 변환
- `ParameterFile`: 주입 가능한 파라미터 세트 객체 (`allow_substs=True`로 앞선 요소를 parameters로 사용)

**Step 4 — 런치 인자 선언**

- `DeclareLaunchArgument()`로 외부에서 조정 가능하게 공개
- 입력 인자: `namespace`, `params_file`, `use_sim_time`, `autostart`, `use_respawn`, `log_level`
- `params_file` 기본값을 `nav2_bringup/params/nav2_params.yaml`로 둠 → 사용자가 별도 파일을 주지 않아도 최소 동작하는 **기본 안전 장치**

**Step 5 — 노드 정의 & 파라미터 분기**

```python
# 맵 저장 서버 노드 (라이프사이클 노드)
start_map_saver_server_cmd = Node(
    package='nav2_map_server',          # 패키지 대상 지정
    executable='map_saver_server',      # 실행 대상 지정
    respawn=use_respawn,                # 크래시 시 재기동 여부를 런치 인자로 제어
    arguments=['--ros-args', '--log-level', log_level],  # 로깅 레벨 외부 제어
    parameters=[configured_params],     # 가공된 YAML 주입
)

# 라이프사이클 매니저 노드
start_lifecycle_manager_cmd = Node(
    package='nav2_lifecycle_manager',
    executable='lifecycle_manager',
    name='lifecycle_manager_slam',
    parameters=[{'use_sim_time': use_sim_time,   # 시뮬레이션 타임 사용 여부
                 'autostart': autostart,         # 런치 후 자동 활성화 전이 여부
                 'node_names': lifecycle_nodes}], # 관리 대상: ['map_saver']
)
```

!!! tip "파라미터 유무에 따른 분기 (HasNodeParams)"
    `HasNodeParams`로 `params_file` 안에 **`slam_toolbox` 섹션**이 있는지 검사합니다. 잘못된 YAML을 전달하면 잘못된 파라미터로 덮여 실행 실패할 수 있으므로 분기합니다.

    - `UnlessCondition()` — `slam_toolbox` 섹션 **없음** → `{ 'use_sim_time': use_sim_time }` 기본 파라미터로 실행
    - `IfCondition()` — `slam_toolbox` 섹션 **있음** → `{ 'use_sim_time': use_sim_time, 'slam_params_file': params_file }` 사용자 정의 파라미터 정확히 주입

**Step 6 — 런치 설명 반환**: `ld.add_action()`으로 선언한 인자, 맵 세이버 서버, 라이프사이클 매니저, `slam_toolbox_cmd`를 모두 등록하고 `return ld`로 종료합니다.

!!! success "소스 전체 구조 요약"
    - `map_saver_server`를 띄움 → `lifecycle_manager`가 자동으로 활성화
    - `slam_toolbox` 런치 include 분기 → `params_file`에 섹션 없으면 기본, 있으면 사용자 정의 파라미터 실행
    - `RewrittenYaml` + `ParameterFile` 조합으로 런치 시점에 파라미터 합성 → **런치 인자 한 줄만 바꿔도 전체에 자동 반영**

---

## 🛰️ 04. slam_toolbox 사용하기

![slam_toolbox 기본 동작 구성 — Front-end/Back-end](img/w06/s18.jpg){ width="720" }
/// caption
slam_toolbox 사용하기 — 슬라이드 18 (출처: ENGI UNIVERSE)
///

### slam_toolbox 기본 동작 구성

SLAM 시스템은 센서를 입력받아 로봇 위치와 지도를 생성합니다.

| 단계 | 처리 내용 |
| --- | --- |
| **Front-end** | 센서: LiDAR → `/scan`, 로봇 이동 추정 → `/odom`, 좌표 변환 → `/tf` |
| **Scan Matching** | 새 스캔을 이전 스캔과 비교해 로봇의 이동량(포즈 변화) 계산 → 포즈 간 연결 관계(제약 조건) 생성 |
| **Back-end** | **Loop Closure**: 장거리 제약 추가 / **Graph Optimization**: 경로와 지도를 일관되게 보정 |
| **출력** | `/map`: 누적 스캔 기반 **점유 격자 지도** 제공 / `/tf`: `map → odom` 변환으로 로봇의 절대 위치 계산 가능 |

### slam_toolbox를 위한 YAML 설계

YAML 필수 구성 요소는 **① 시간동기화 ② 프레임 구조 ③ 센서 토픽 ④ 오도메트리/TF ⑤ 안정화 파라미터 ⑥ 센서 특성** 입니다.

**① 시간동기화** — 모든 노드의 시간을 동기화

**② 프레임 구조** — 모델의 베이스 링크 프레임이나 Xform으로 생성된 중심 프레임 지정

- Spot의 경우 중심 프레임은 보통 **`body`**
- `ros2 run tf2_tools view_frames` 로 프레임 구조 PDF 출력 가능

```bash
# 현재 TF 프레임 구조를 PDF(frames.pdf)로 출력
ros2 run tf2_tools view_frames
```

**③ 센서 토픽** — 라이다가 출력하는 센서의 토픽명 명시

![센서 토픽 — LaserScan/PointCloud/MultiEchoLaserScan](img/w06/s22.jpg){ width="720" }
/// caption
slam_toolbox 사용하기 — 슬라이드 22: 센서 토픽 (출처: ENGI UNIVERSE)
///

=== "LaserScan (2D LiDAR)"

    - `ranges[i]` → `angle_min + i*angle_increment` 방향으로 레이저를 쐈을 때 반사 거리
    - `range_min` / `range_max` → 최소/최대 거리
    - `header.stamp` → TF와 시간 동기 맞추는 기준
    - `header.frame_id` → 이 스캔이 어느 좌표계에서 측정됐는지 표시

=== "PointCloud (3D LiDAR)"

    - 3D 점들의 집합. 장치에 따라 `intensity`, `ring`, `time` 등의 필드 추가
    - 한 프레임에 수만 개의 점 → 바이트 배열 + 메타데이터 구조
    - slam_toolbox는 **2D 평면 SLAM** → 3D 점들을 특정 높이 범위로 잘라 바닥 평면에 투영(전처리 노드 필요)

=== "MultiEchoLaserScan (다중 반사)"

    - 한 각도 빔에서 반사가 여러 번 감지되는 LiDAR 장비용 메시지
    - 필터 노드로 한 개의 거리로 축약(예: 최단거리만 채택)해 일반 LaserScan처럼 사용

**④ 오도메트리/TF** — `map → odom → body` 변환으로 위치·자세를 서로 다른 기준에서 표현

![오도메트리/TF — map→odom→body 좌표계](img/w06/s25.jpg){ width="720" }
/// caption
slam_toolbox 사용하기 — 슬라이드 25: 오도메트리/TF (출처: ENGI UNIVERSE)
///

| 프레임 | 의미 |
| --- | --- |
| **map** | 지도 기준 프레임. 시간에 따라 움직이지 않는 **절대 좌표 기준** |
| **odom** | 단기 위치 추정 프레임. 시간이 지나면 **오차가 누적**되는 단점 |
| **body (base_link)** | 로봇 본체 기준 프레임. 로봇이 움직이면 이 프레임이 실제로 이동 |

- `map → odom`: 지도 좌표계와 오도메트리 좌표계 사이를 연결
- `odom → body`: 변환 주체 선택 가능
    - 시뮬레이터/하드웨어가 `/odom` **전송** → slam_toolbox가 오도메트리 소비
    - `/odom` **미전송** → SLAM에서 직접 위치 추정

!!! note "여기서 잠깐! — SLAM은 map 좌표를 어떻게 알까?"
    SLAM 노드를 처음 실행하면 내부적으로 **빈 종이 한 장을 꺼내는 것**과 같습니다. 그 빈 종이를 "map 프레임"이라 이름 붙이고, 로봇이 처음 있던 자리를 이 좌표계의 **원점(0,0,0)** 으로 정합니다. 즉 map 좌표계는 외부에서 주어진 게 아니라, SLAM이 자기 기준으로 *"여기가 시작점이다"* 라고 **선언**하는 좌표계입니다.

    이후 라이다·카메라·IMU 센서 데이터를 모아 이 원점 기준으로 점을 찍고 지도를 확장합니다. `odom`은 짧은 시간 동안 위치를 잘 추적하지만 시간이 길어지면 조금씩 밀립니다. SLAM은 지도와 센서 관측을 비교하며 *"odom이 조금 틀어졌네?"* 하고 수정값을 **`map → odom` 변환**으로 퍼블리시 → 지도가 점점 더 일관성 있게 유지됩니다.

**⑤ 안정화 파라미터** — 센서 데이터를 TF에 맞춰 정합

SLAM은 센서값만으로 찍지 않고, 센서 측정과 동시에 로봇 위치 추정 정보를 사용해 좌표를 결정합니다. `map → odom → body` 관계를 시간에 따라 기록·변환합니다.

!!! warning "시간 정합 실패 예시"
    LiDAR 스캔은 `12:00:00.500`에 들어왔는데 `odom→body` 변환은 `12:00:00.400`까지만 기록되어 있다면 → SLAM은 스캔이 **어디에서 찍힌 건지 알 수 없음**.

| 파라미터 | 값 | 의미 |
| --- | --- | --- |
| `tf_buffer_duration` | `30.0` | 최대 30초 전까지 TF 기록을 되돌아가 변환 가능하도록 캐싱 |
| `transform_timeout` | `1.0` | 1초 안에 TF 변환을 못 찾으면 데이터 폐기 |
| `queue_size` | `100` | 라이다가 초당 수십 프레임을 내보낼 때도 버퍼 100개로 여유를 두어 누락 방지 |

**⑥ 센서 특성** — 센서 스펙 반영, 시뮬레이션 부하 조절 (하드웨어 실제 스펙을 정확히 반영해야 정확히 동작)

```yaml
# slam_toolbox_params.yaml (센서 특성 발췌)
resolution: 0.05        # 한 칸이 5cm짜리인 지도 격자
max_laser_range: 20     # 라이다 실제 최대 감지 거리 20m 한계 반영
minimum_range: 1.0      # 라이다 실제 최소 감지 거리 1m 한계 반영
throttle_scans: 2       # 들어오는 스캔 주기를 절반으로 줄여 처리장치 부하 관리
```

---

## 🚗 05. Nav2 사용하기

### Nav2 프레임워크의 명령 흐름

![Nav2 프레임워크 전체 구조](img/w06/s31.jpg){ width="720" }
/// caption
Nav2 사용하기 — 슬라이드 31: Nav2 프레임워크 구조 (출처: ENGI UNIVERSE)
///

**Step 1** — 사용자가 `NavigateToPose` 액션으로 목표 위치 명령
**Step 2** — 명령은 **BT Navigator Server**로 전달
**Step 3** — BT는 XML 플러그인을 불러와 **계획 → 제어 → 복구** 순서를 트리 로직으로 관리

| 내부 구성 요소 | 역할 |
| --- | --- |
| **Planner Server** | 전역 비용맵(Global Costmap) 기반 **Global Path** 생성 |
| **Controller Server** | 전역 경로 + 로컬 비용맵(Local Costmap)으로 **`cmd_vel`** 생성 후 로봇 구동 |
| **Recovery Server** | 장애·정지 상황 시 후진/회전 등 **복구 행동** 실행 |

실시간으로 LaserScan/PointCloud2 센서 입력으로 비용맵을 지속 갱신하고, TF 프레임(`odom`, `map`, `base_link`) 정합을 유지하며, `map` 토픽의 점유 그리드 맵 정보를 활용합니다.

### Nav2 YAML 구성 요소

=== "판단 — BT Navigator (`bt_navigator`)"

    - 핵심은 *"어디로 갈까?"* 가 아니라 *"어떤 논리로 행동할까?"*
    - **Behavior Tree**: 로봇 행동 로직을 트리 구조로 (루트 → 조건 검사 → 상황별 행동 선택)
    - 예: 경로 생성 → 경로 따라가기 → 장애물 감지 시 회피 → 경로 재계획
    - Nav2에서 행동 트리를 **XML 파일**로 정의

=== "계획 — Planner Server (`planner_server`)"

    - 다양한 상황을 고려한 **Global Path** 생성 (맵 + 현재 위치 + 목표 좌표 → 연속된 좌표 포인트)
    - **NavFn**: Nav2 대표 플래너. A\* & Dijkstra 기반, 격자 지도에서 최단 경로 탐색
    - 주요 파라미터
        - `expected_planner_frequency: 5.0` → 초당 5번 경로 재계획
        - `Tolerance: 0.5` → 목표 지점 반경 50cm 안에 들어오면 도착 인정(센서 오차 허용)

=== "제어 — Controller Server (`controller_server`)"

    - 경로 계획 정보만으로는 제어 불가 → **속도 명령(`cmd_vel`)** 으로 변환 필요
    - 경로를 실제 주행 명령(선형 속도·각속도)으로 변환
    - **RegulatedPurePursuitController**: Nav2 대표 컨트롤러. *Pure Pursuit(순수 추종)* 기반으로 항상 경로 위 일정 거리 앞의 목표점을 바라보며 곡선을 그리듯 추종

![Nav2 YAML — Costmap 구성](img/w06/s34.jpg){ width="720" }
/// caption
Nav2 사용하기 — 슬라이드 34: Costmap 구성 (출처: ENGI UNIVERSE)
///

### 시야 — Costmap (`global_costmap` / `local_costmap`)

**Costmap**은 공간을 위험도나 접근 비용(cost)으로 표기한 지도입니다.

| 구분 | 기준 프레임 | 특징 & 주요 파라미터 |
| --- | --- | --- |
| **Global Costmap** | `map` | SLAM이 만든 전역 지도 + 실시간 장애물 정보를 합쳐 생성 → Planner에 반환. `static_layer`(SLAM 정적 지도 로드), `obstacle_layer`(LiDAR 등 새 장애물 반영), `inflation_layer`(장애물 주변 완충 거리 확보) |
| **Local Costmap** | `odom` | 보통 6×6m, 로봇 중심으로 이동. Controller가 즉각적 회피·주행 판단에 사용. `rolling_window: true`(지도 창이 로봇을 따라다니며 최신 주변 정보만 유지), `robot_base_frame: body`(`body`로 지정하지 않으면 맵이 엉뚱한 위치에 생성) |

### 속도 — Velocity Smoother (`velocity_smoother`)

컨트롤러가 보내는 정보는 물리세계에 바로 적용하기 어렵습니다. (예: 0m/s → 2m/s를 바로 적용하면 급가속) → **정해진 주기대로 점진적인 속도 변화** 명령으로 다듬습니다.

```yaml
# velocity_smoother (주요 파라미터)
smoothing_frequency: 20.0      # 20Hz 주기로 속도 변화 (낮으면 계단식, 높으면 자원 낭비)
max_velocity: [2.0, 0.0, 2.0]  # [x, y, θ] → x축 2.0m/s, y축 이동 불가, 회전 2.0rad/s 제한
accel_limit:  [2.0, 0.0, 2.0]  # 최대 가속 기울기 제한
decel_limit:  [2.0, 0.0, 2.0]  # 최대 감속 기울기 제한
```

---

## 🧩 06. Wrap-up

![Wrap-up — 오늘 강의 요약](img/w06/s37.jpg){ width="720" }
/// caption
Wrap-up — 슬라이드 37 (출처: ENGI UNIVERSE)
///

!!! success "오늘 강의 내용 요약"
    - SLAM의 **Front-end / Back-end**, 그리고 `map → odom → body` **프레임 관계** 이해
    - **slam_toolbox** 와 **Nav2** 의 구성 요소 이해 (slam_toolbox: 스캔 매칭·루프 클로저·그래프 최적화 / Nav2: BT Navigator·Planner·Controller·Costmap·Velocity Smoother)
    - 시뮬레이션에 필요한 **YAML 설계** (시간동기화·프레임·센서 토픽·오도메트리/TF·안정화·센서 특성)

## ✅ 체크포인트

- [ ] SLAM의 Front-end(제약 조건 생성)와 Back-end(그래프 최적화)의 역할을 구분해 설명할 수 있는가
- [ ] `map → odom → body` 좌표계의 차이와 `map → odom` 변환의 의미를 설명할 수 있는가
- [ ] slam_toolbox YAML의 6대 구성 요소(시간동기화·프레임·센서 토픽·오도메트리/TF·안정화·센서 특성)를 채울 수 있는가
- [ ] Nav2의 Planner / Controller / BT Navigator 역할과 대표 플러그인을 짝지을 수 있는가
- [ ] Global Costmap과 Local Costmap의 기준 프레임·용도 차이를 설명할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| SLAM 원리 이해 | 25 | Front-end/Back-end, Odometry·Sensor Fusion 역할을 정확히 설명 |
| slam_toolbox YAML 설계 | 25 | 6대 구성 요소를 센서 스펙에 맞게 합리적으로 작성 |
| Nav2 스택 구조 | 25 | Planner·Controller·BT Navigator·Costmap의 역할과 흐름 설명 |
| 좌표계·TF 정합 | 15 | `map→odom→body` 관계와 시간 정합 파라미터의 필요성 설명 |
| 종합 적용 | 10 | SLAM→Nav2 연계 흐름을 시뮬레이션 관점에서 설명 |
| **합계** | **100** | |

## 🔗 출처 및 참고자료

- 교안 **「SLAM과 Navigation 기본 개념 (slam_toolbox·Nav2)」** (제작: *ENGI UNIVERSE*)
- slam_toolbox — <https://github.com/SteveMacenski/slam_toolbox>
- Nav2 (Navigation2) 공식 문서 — <https://docs.nav2.org>
- ROS 2 TF2 (tf2_tools) — <https://docs.ros.org/en/rolling/Concepts/About-Tf2.html>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [ROS 2 통합(랜딩)](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/ros2_landing_page.html)
    - [ROS 2 튜토리얼](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/index.html)

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (37매)"
    ![슬라이드 01](img/w06/s01.jpg){ width="700" }
    ![슬라이드 02](img/w06/s02.jpg){ width="700" }
    ![슬라이드 03](img/w06/s03.jpg){ width="700" }
    ![슬라이드 04](img/w06/s04.jpg){ width="700" }
    ![슬라이드 05](img/w06/s05.jpg){ width="700" }
    ![슬라이드 06](img/w06/s06.jpg){ width="700" }
    ![슬라이드 07](img/w06/s07.jpg){ width="700" }
    ![슬라이드 08](img/w06/s08.jpg){ width="700" }
    ![슬라이드 09](img/w06/s09.jpg){ width="700" }
    ![슬라이드 10](img/w06/s10.jpg){ width="700" }
    ![슬라이드 11](img/w06/s11.jpg){ width="700" }
    ![슬라이드 12](img/w06/s12.jpg){ width="700" }
    ![슬라이드 13](img/w06/s13.jpg){ width="700" }
    ![슬라이드 14](img/w06/s14.jpg){ width="700" }
    ![슬라이드 15](img/w06/s15.jpg){ width="700" }
    ![슬라이드 16](img/w06/s16.jpg){ width="700" }
    ![슬라이드 17](img/w06/s17.jpg){ width="700" }
    ![슬라이드 18](img/w06/s18.jpg){ width="700" }
    ![슬라이드 19](img/w06/s19.jpg){ width="700" }
    ![슬라이드 20](img/w06/s20.jpg){ width="700" }
    ![슬라이드 21](img/w06/s21.jpg){ width="700" }
    ![슬라이드 22](img/w06/s22.jpg){ width="700" }
    ![슬라이드 23](img/w06/s23.jpg){ width="700" }
    ![슬라이드 24](img/w06/s24.jpg){ width="700" }
    ![슬라이드 25](img/w06/s25.jpg){ width="700" }
    ![슬라이드 26](img/w06/s26.jpg){ width="700" }
    ![슬라이드 27](img/w06/s27.jpg){ width="700" }
    ![슬라이드 28](img/w06/s28.jpg){ width="700" }
    ![슬라이드 29](img/w06/s29.jpg){ width="700" }
    ![슬라이드 30](img/w06/s30.jpg){ width="700" }
    ![슬라이드 31](img/w06/s31.jpg){ width="700" }
    ![슬라이드 32](img/w06/s32.jpg){ width="700" }
    ![슬라이드 33](img/w06/s33.jpg){ width="700" }
    ![슬라이드 34](img/w06/s34.jpg){ width="700" }
    ![슬라이드 35](img/w06/s35.jpg){ width="700" }
    ![슬라이드 36](img/w06/s36.jpg){ width="700" }
    ![슬라이드 37](img/w06/s37.jpg){ width="700" }
