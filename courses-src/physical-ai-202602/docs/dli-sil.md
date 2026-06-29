# DLI 심화 · SIL — Software-in-the-Loop (Nav2 자율주행 + MoveIt 매니퓰레이션)

!!! abstract "학습목표"
    NVIDIA **Isaac Sim** 시뮬레이터와 **ROS 2 Humble** 스택을 **Software-in-the-Loop(SIL)** 로 연결해, 시뮬레이션 속 로봇을 실제 ROS 2 노드로 제어하는 통합 파이프라인을 구성한다. 완성 워크스페이스 **`gtc25-mega1`** 를 빌드하여 **Carter 모바일 로봇의 창고 자율주행(Nav2)** 과 **Franka(Panda) 매니퓰레이터의 모션 플래닝(MoveIt)** 두 가지 SIL 시나리오를 실행한다. 단계별 **Checkpoint** 자산이 어떻게 최종 패키지로 합쳐지는지 흐름을 이해한다.

!!! quote "출처 (Source)"
    본 모듈은 **NVIDIA «Isaac for Accelerated Robotics» (GTC Paris 2025) / NVIDIA DLI 코스 C-OV-05** 의 SIL 실습(`DLI/17_SIL`)을 바탕으로 재구성하였습니다. 워크스페이스·런치 파일·설치 스크립트는 실제 실습 패키지의 내용을 그대로 반영합니다.

## ⏱️ 모듈 구성

| 단계 | 자산 | 내용 |
| --- | --- | --- |
| Checkpoint 2 | `Checkpoint2_franka/franka` | Franka USD + 카메라/센서 자산 (매니퓰레이션 씬 준비) |
| Checkpoint 4 | `Checkpoint4_completed_environment/warehouse_ROS` | 창고(warehouse) ROS USD/머티리얼 환경 (Nav2 씬 준비) |
| Checkpoint 5 | `Checkpoint5_completed_ros_package/gtc25-mega1` | 완성 ROS 2 워크스페이스 — `install.sh`, `ros_ws`(carter_navigation + isaac_moveit) |

!!! note "Software-in-the-Loop(SIL)이란"
    SIL은 **실제 하드웨어 대신 시뮬레이터(Isaac Sim)** 가 센서·액추에이터·물리를 담당하고, **제어 소프트웨어(ROS 2 노드: Nav2·MoveIt)** 는 실물 배포와 동일하게 동작하는 통합 방식입니다. Isaac Sim의 OmniGraph/ROS 2 브리지가 토픽·TF·`/clock` 을 주고받으므로, ROS 2 측에서는 시뮬레이션을 실제 로봇처럼 다룹니다. 이 때문에 모든 흐름에서 **`use_sim_time` 이 `true`** 로 설정됩니다.

## 📦 1. 워크스페이스 구조 — `gtc25-mega1`

최종 실습 패키지는 ROS 2 소스 워크스페이스 하나(`ros_ws`)와 설치 스크립트로 구성됩니다.

```text
Checkpoint5_completed_ros_package/
└─ gtc25-mega1/
   ├─ install.sh                 # 서브모듈 init → ROS 2 Humble → Isaac ROS → colcon build
   ├─ README.md                  # 루트에서 `bash ./install.sh`
   └─ ros_ws/
      └─ src/
         ├─ navigation/
         │  └─ carter_navigation/        # Nav2 창고 자율주행
         │     ├─ launch/                # carter_warehouse_env / _individual / nova_carter_description_isaac_sim
         │     ├─ maps/                  # warehouse_env.yaml + .png
         │     ├─ params/                # carter_warehouse_env_params.yaml
         │     └─ rviz2/                 # carter_navigation(_namespaced).rviz
         └─ manipulation/
            ├─ isaac_moveit/             # Panda MoveIt + Isaac Sim 통합
            │  ├─ launch/isaac_moveit.launch.py
            │  ├─ scripts/publish_cubes.py
            │  └─ rviz2/panda_moveit_config.rviz
            └─ moveit_resources/         # 서브모듈(ayushgnv/moveit_resources, branch gtc25)
               ├─ panda_description/     # Panda URDF/메시
               └─ panda_moveit_config/  # MoveIt 설정 + ros2_controllers.yaml
```

`moveit_resources` 는 **Git 서브모듈**(`.gitmodules`)입니다.

```ini
[submodule "ros_ws/src/manipulation/moveit_resources"]
    path = ros_ws/src/manipulation/moveit_resources
    url = https://github.com/ayushgnv/moveit_resources.git
    branch = gtc25
```

!!! warning "서브모듈 주의"
    `moveit_resources` 는 별도 Git 저장소이므로 함부로 편집하지 마세요. 자체 이력/상태를 가질 수 있습니다. 또한 `install.sh` 는 **Windows PowerShell에서 실행하지 마세요** — Ubuntu(Bash) 전용입니다.

## 🛠️ 2. 설치 — `install.sh`

워크스페이스 루트(`gtc25-mega1/`)에서 한 번에 실행합니다.

```bash
cd gtc25-mega1
bash ./install.sh
```

스크립트가 수행하는 작업 순서:

1. **서브모듈 동기화** — `git submodule update --init --recursive`
2. **ROS 2 Humble 설치** — 로케일(UTF-8) 설정, `universe` 저장소, ROS 2 apt 키/소스 등록 후 `ros-humble-desktop` 설치
3. **Isaac ROS 저장소 등록** — NVIDIA Isaac ROS `release-3.0` apt 소스 추가
4. **`nova_carter_description` 설치** — `ros-humble-nova-carter-description` (Carter URDF/calibration 패키지)
5. **워크스페이스 빌드** — `rosdep` 의존성 설치 후 `colcon build`

핵심 명령만 발췌하면 다음과 같습니다.

```bash
# 1) 서브모듈
git submodule update --init --recursive

# 2) ROS 2 Humble apt 소스 + 설치
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
     -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" \
     | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update -y && sudo apt install -y ros-humble-desktop
source /opt/ros/humble/setup.bash

# 3) Isaac ROS apt 소스 (US CDN)
wget -qO - https://isaac.download.nvidia.com/isaac-ros/repos.key | sudo apt-key add -
echo "deb https://isaac.download.nvidia.com/isaac-ros/release-3 $(lsb_release -cs) release-3.0" \
     | sudo tee -a /etc/apt/sources.list
sudo apt update -y

# 4) Nova Carter description
sudo apt install -y ros-humble-nova-carter-description

# 5) 워크스페이스 빌드
cd ros_ws
sudo rosdep init        # 이미 ROS가 설치된 머신에서는 이미 초기화돼 있을 수 있음
rosdep update
rosdep install --from-paths src --ignore-src -r -y
colcon build
source install/setup.bash
```

!!! tip "rosdep init 멱등성"
    `sudo rosdep init` 은 멱등(idempotent)하지 않습니다. 이미 ROS가 설치된 머신에서는 *"already exists"* 오류가 날 수 있는데, 정상이므로 무시하고 `rosdep update` 로 진행하면 됩니다.

빌드가 끝나면 새 터미널마다 환경을 source 합니다.

```bash
source /opt/ros/humble/setup.bash
source ~/gtc25-mega1/ros_ws/install/setup.bash
```

## 🚗 3. Carter 창고 자율주행 (Nav2) — `carter_navigation`

Isaac Sim에서 **창고(warehouse) 씬 + Nova Carter** 를 띄운 뒤, ROS 2 측에서 Nav2 스택을 실행해 자율주행을 수행합니다. 모든 노드는 `carter` 네임스페이스로 묶입니다.

```bash
# (사전) Isaac Sim에서 Checkpoint4 warehouse_ROS 씬 + Carter 로봇 재생(Play)
ros2 launch carter_navigation carter_warehouse_env.launch.py
```

`carter_warehouse_env.launch.py` 가 구성하는 요소:

- **RViz2** — `rviz2/carter_navigation_namespaced.rviz`, `carter` 네임스페이스로 기동
- **Nav2 브링업** — `carter_navigation_individual.launch.py` 를 포함(per-robot bringup), 기본 BT는 `navigate_w_replanning_and_recovery.xml`
- **`pointcloud_to_laserscan`** — Carter의 `front_3d_lidar` 포인트클라우드(`point_cloud`)를 2D `scan` 으로 변환 (AMCL/코스트맵 입력)
- **TF relay** — `topic_tools/relay` 로 `/tf`·`/tf_static` 을 `/carter/tf`·`/carter/tf_static` 으로 중계(네임스페이스 정합)

기본 인자(런치 파일에서 선언):

| 인자 | 기본값 |
| --- | --- |
| `map` | `maps/warehouse_env.yaml` |
| `carter_params_file` | `params/carter_warehouse_env_params.yaml` |
| `use_sim_time` | `True` |
| `autostart` | `True` |
| `use_rviz` | `True` |

맵 메타데이터(`warehouse_env.yaml`):

```yaml
image: warehouse_env.png
resolution: 0.05
origin: [-5.975, -6.975, 0.0000]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.196
```

!!! note "Carter URDF 로딩"
    `nova_carter_description_isaac_sim.launch.py` 는 `carter` 네임스페이스를 push 하고, `nova_carter_description` 의 `urdf/nova_carter.urdf.xacro` 를 calibration(`/etc/nova/calibration/isaac_calibration.urdf`)과 함께 로드합니다. 이 패키지는 `install.sh` 에서 apt로 설치됩니다.

RViz가 뜨면 **2D Goal Pose** 로 목표 지점을 찍어 Carter가 창고 맵에서 경로를 계획·주행하는 것을 확인합니다.

## 🦾 4. Panda 매니퓰레이션 (MoveIt) — `isaac_moveit`

Isaac Sim에 **Franka(Panda) 씬**(Checkpoint2 자산)을 띄운 뒤, MoveIt 스택을 SIL로 실행합니다.

```bash
# (사전) Isaac Sim에서 Checkpoint2 franka 씬 재생(Play)
ros2 launch isaac_moveit isaac_moveit.launch.py
# 하드웨어 인터페이스 기본값: ros2_control_hardware_type:=isaac
```

`isaac_moveit.launch.py` 가 기동하는 노드:

- **`move_group`** — `MoveItConfigsBuilder("moveit_resources_panda")` 로 빌드. URDF `config/panda.urdf.xacro`, SRDF `config/panda.srdf`, 플래닝 파이프라인 **OMPL + Pilz Industrial Motion Planner**
- **RViz2** — `rviz2/panda_moveit_config.rviz` (MotionPlanning 플러그인)
- **`robot_state_publisher`** — Panda 로봇 디스크립션 퍼블리시
- **`ros2_control_node`** + 스포너 — `joint_state_broadcaster`, `panda_arm_controller`, `panda_hand_controller` (컨트롤러 설정은 `moveit_resources_panda_moveit_config` 의 `ros2_controllers.yaml`)
- **정적 TF 2개**
    - `world → panda_link0` : `(-4.7, -6.1, 0.8)` — 창고 좌표계에 로봇 베이스 배치
    - `panda_hand → sim_camera` : `(0.04, 0.0, 0.04)` — 손목 카메라 프레임
- **`publish_cubes.py`** — 조작 대상 큐브 마커 퍼블리셔

`ros2_control_hardware_type` 인자로 하드웨어 인터페이스를 전환할 수 있습니다.

```bash
# Isaac Sim 없이 MoveIt 동작만 확인 (mock 하드웨어)
ros2 launch isaac_moveit isaac_moveit.launch.py ros2_control_hardware_type:=mock_components
```

### 큐브 마커 퍼블리셔

`publish_cubes.py` 는 `MarkerArray` 를 `visualization_marker_array` 토픽으로 발행합니다. 각 큐브는 한 변 **0.06m**, **초록색**(RGBA = 0,1,0,1) `CUBE` 마커이며, 프레임은 `nvidia_cube`/`nvidia_cube_NN` 으로 RViz에서 조작 대상의 위치를 시각화합니다.

```python
from visualization_msgs.msg import Marker, MarkerArray
# ...
marker.type = Marker.CUBE
marker.scale.x = marker.scale.y = marker.scale.z = 0.06
marker.color.a = 1.0
marker.color.r = 0.0; marker.color.g = 1.0; marker.color.b = 0.0
```

RViz의 MotionPlanning 패널에서 목표 자세를 설정하고 **Plan & Execute** 하면, MoveIt이 만든 궤적이 Isaac Sim 속 Panda로 전달되어 실제처럼 움직입니다.

## 🔄 5. Checkpoint → 완성 패키지 흐름

```text
Checkpoint2 (Franka USD/센서)  ┐
                               ├─►  Checkpoint5 gtc25-mega1 / ros_ws
Checkpoint4 (warehouse_ROS)    ┘     ├─ isaac_moveit   ← Franka 씬과 연결
                                     └─ carter_navigation ← warehouse 씬과 연결
```

- **Checkpoint 2** 에서 준비한 Franka 씬·센서가 **`isaac_moveit`** 의 매니퓰레이션 SIL 대상이 됩니다.
- **Checkpoint 4** 에서 완성한 창고 환경이 **`carter_navigation`** 의 Nav2 자율주행 무대가 됩니다.
- **Checkpoint 5** 는 위 두 씬을 구동할 **완성 ROS 2 패키지**로, `install.sh` 와 `colcon build` 만으로 환경을 재현합니다.

## ✅ 체크포인트

- [ ] `bash ./install.sh` 가 서브모듈 동기화 → ROS 2 Humble → Isaac ROS → `nova_carter_description` → `colcon build` 까지 끝까지 완료되는가?
- [ ] `moveit_resources` 서브모듈이 `gtc25` 브랜치로 정상 체크아웃됐는가? (`ros_ws/src/manipulation/moveit_resources` 가 비어 있지 않은지 확인)
- [ ] `carter_warehouse_env.launch.py` 실행 후 RViz에서 **2D Goal Pose** 로 Carter가 창고 맵을 자율주행하는가? (`pointcloud_to_laserscan` 으로 LiDAR→scan 변환, `carter` 네임스페이스 TF 중계 확인)
- [ ] `isaac_moveit.launch.py` 실행 후 `joint_state_broadcaster`·`panda_arm_controller`·`panda_hand_controller` 가 모두 스폰되고, RViz에서 **Plan & Execute** 가 Isaac Sim의 Panda를 움직이는가?
- [ ] 모든 흐름에서 `use_sim_time:=true` 가 적용되고 Isaac Sim의 `/clock` 과 동기화되는가?

## 🔗 출처 및 참고자료

- NVIDIA DLI **«Isaac for Accelerated Robotics»** (C-OV-05, GTC Paris 2025) — `DLI/17_SIL`
- NVIDIA **Isaac ROS** — <https://nvidia-isaac-ros.github.io/>
- NVIDIA **Isaac Sim** (ROS 2 Bridge / Nav2 · MoveIt 튜토리얼) — <https://docs.isaacsim.omniverse.nvidia.com/>
- **Nav2** 공식 문서 — <https://docs.nav2.org/>
- **MoveIt 2** 공식 문서 — <https://moveit.picknik.ai/>
- `moveit_resources` 서브모듈(gtc25) — <https://github.com/ayushgnv/moveit_resources>
