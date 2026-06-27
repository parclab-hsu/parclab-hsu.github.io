# 복사용 실습 코드

강의 슬라이드 이미지 안에 포함된 명령어와 예제 소스를 복사해서 실습할 수 있도록 주차별로 모았습니다. 각 코드블록 오른쪽 위의 복사 버튼을 사용하면 됩니다.

!!! warning "실습 전 확인"
    아래 코드는 교안 설명을 바탕으로 한 재구성 예제입니다. 실제 경로, 패키지명, 토픽명, GPU/CUDA 버전, ROS 2 워크스페이스 이름은 실습 PC 환경에 맞게 확인한 뒤 실행하세요.

---

## 1주차 · Isaac Sim 설치 및 활용

### Miniconda 설치

```bash
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh \
  -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
source ~/.bashrc
```

### GPU와 드라이버 확인

```bash
nvidia-smi
ubuntu-drivers devices
```

### Isaac Sim/Isaac Lab 실습 환경 예시

```bash
conda create -n env_isaaclab python=3.10 -y
conda activate env_isaaclab

pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

git clone https://github.com/isaac-sim/IsaacLab.git
cd IsaacLab
./isaaclab.sh --install
```

---

## 2주차 · 물리환경 및 RGB/Depth 카메라

### 기본 World와 DynamicCuboid

```python
from isaacsim import SimulationApp

simulation_app = SimulationApp({"headless": False})

from isaacsim.core.api import World
from isaacsim.core.api.objects import DynamicCuboid
import numpy as np

world = World(stage_units_in_meters=1.0)
world.scene.add_default_ground_plane()

cube = world.scene.add(
    DynamicCuboid(
        prim_path="/World/cube",
        name="red_cube",
        position=np.array([0.0, 0.0, 1.0]),
        scale=np.array([0.5, 0.5, 0.5]),
        color=np.array([255, 0, 0]),
    )
)

world.reset()
for _ in range(300):
    world.step(render=True)

simulation_app.close()
```

### RGB 카메라 프레임 확인

```python
from isaacsim.sensors.camera import Camera
from scipy.spatial.transform import Rotation
import matplotlib.pyplot as plt
import numpy as np

camera = Camera(
    prim_path="/World/camera",
    position=np.array([0.0, 0.0, 25.0]),
    frequency=60,
    resolution=(256, 256),
    orientation=Rotation.from_euler("xyz", [0, 90, 0], degrees=True).as_quat(),
)
camera.initialize()

for i in range(180):
    world.step(render=True)
    if i > 60 and i % 60 == 0:
        rgba = camera.get_rgba()
        rgb = rgba[:, :, :3]
        plt.imshow(rgb)
        plt.axis("off")
        plt.show()
```

### Depth Map 시각화

```python
camera.add_distance_to_camera_to_frame()

for i in range(180):
    world.step(render=True)
    frame = camera.get_current_frame()
    if "distance_to_camera" in frame:
        depth = frame["distance_to_camera"]
        plt.imshow(depth, cmap="jet")
        plt.colorbar()
        plt.axis("off")
        plt.show()
        break
```

---

## 3주차 · IMU, LiDAR, Radar 센서

### IMU 센서 생성 예시

```python
from isaacsim.sensors.physics import IMUSensor
import numpy as np

imu = IMUSensor(
    prim_path="/World/robot/imu",
    name="imu_sensor",
    frequency=100,
    translation=np.array([0.0, 0.0, 0.2]),
)
imu.initialize()

for _ in range(100):
    world.step(render=True)
    frame = imu.get_current_frame()
    print("linear_acceleration:", frame["lin_acc"])
    print("angular_velocity:", frame["ang_vel"])
```

### LiDAR/Radar 토픽 확인 명령

```bash
ros2 topic list
ros2 topic echo /scan
ros2 topic echo /point_cloud
ros2 topic hz /scan
```

---

## 4주차 · Isaac Lab 4족 보행 강화학습

### Isaac Lab 학습 실행

```bash
cd ~/IsaacLab
./isaaclab.sh -p source/standalone/workflows/rsl_rl/train.py \
  --task Isaac-Velocity-Rough-Anymal-D-v0 \
  --num_envs 64
```

### Command, Action, Observation, Reward 구성 예시

```python
from dataclasses import dataclass

@dataclass
class CommandsCfg:
    resampling_time_range = (10.0, 10.0)
    lin_vel_x = (-1.0, 1.0)
    lin_vel_y = (-0.5, 0.5)
    ang_vel_z = (-1.0, 1.0)

@dataclass
class ActionsCfg:
    joint_pos_scale = 0.2

@dataclass
class ObservationsCfg:
    policy_terms = [
        "base_linear_velocity",
        "base_angular_velocity",
        "projected_gravity",
        "velocity_commands",
        "joint_positions",
        "joint_velocities",
        "previous_actions",
        "height_scan",
    ]

@dataclass
class RewardsCfg:
    track_lin_vel_xy_exp = 1.0
    track_ang_vel_z_exp = 0.5
    lin_vel_z_l2 = -2.0
    action_rate_l2 = -0.01
```

---

## 5주차 · Spot + ATS 시스템 구축

### ROS 2에서 ATS 조인트 명령 발행

```bash
# joint1(Yaw)을 +90도(1.57 rad)로 회전
ros2 topic pub /joint_command sensor_msgs/msg/JointState \
  "{name: ['joint1'], position: [1.57]}"

# joint2(Pitch)을 -20도(-0.35 rad)로 회전
ros2 topic pub /joint_command sensor_msgs/msg/JointState \
  "{name: ['joint2'], position: [-0.35]}"
```

### Spot + ATS 결합 모델 경로 설정

```python
# spot.py
from pathlib import Path

ASSET_ROOT = Path.home() / "PhysicalAI" / "assets"
SPOT_ATS_USD = ASSET_ROOT / "spot_ats" / "spot_learnmodel.usd"

robot_cfg = {
    "prim_path": "/World/robot",
    "usd_path": str(SPOT_ATS_USD),
}
```

### ATS 탑재 Spot 재학습 실행 예시

```bash
cd ~/IsaacLab
./isaaclab.sh -p source/standalone/workflows/rsl_rl/train.py \
  --task Isaac-Velocity-Spot-Ats-v0 \
  --num_envs 128 \
  --headless
```

---

## 6주차 · SLAM과 Nav2 기본

### slam_toolbox 실행용 Launch 골격

```python
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    slam_toolbox = Node(
        package="slam_toolbox",
        executable="async_slam_toolbox_node",
        name="slam_toolbox",
        output="screen",
        parameters=[{
            "use_sim_time": True,
            "map_frame": "map",
            "odom_frame": "odom",
            "base_frame": "body",
            "scan_topic": "scan",
            "mode": "mapping",
        }],
    )

    return LaunchDescription([slam_toolbox])
```

### Nav2 핵심 파라미터

```yaml
controller_server:
  ros__parameters:
    use_sim_time: true
    controller_frequency: 30.0
    FollowPath:
      plugin: "nav2_regulated_pure_pursuit_controller::RegulatedPurePursuitController"
      desired_linear_vel: 1.2
      lookahead_dist: 0.8
      use_rotate_to_heading: true

local_costmap:
  local_costmap:
    ros__parameters:
      global_frame: odom
      robot_base_frame: body
      update_frequency: 10.0
      publish_frequency: 10.0
```

---

## 7주차 · Spot + ATS SLAM 연동 part 1

### Isaac Sim 전용 Python 런처 사용

```bash
cd ~/.local/share/ov/pkg/isaac-sim-5.1.0
./python.sh ~/cluad_ws/src/spot_ats_sim/spot_ats_main.py
```

### 정책 출력과 Nav2 `/cmd_vel` 합성 흐름

```python
def sim_step(world, obs_builder, policy, controller):
    world.step(render=True)

    cmd_vec = controller.read_twist_from_graph()       # Nav2 /cmd_vel
    obs = obs_builder.build(cmd_vec)                   # 48차원 관측 구성
    action = policy.infer(obs)                         # 12차원 보행 정책 출력

    ats_cmd = controller.read_ats_joint_command()      # ATS yaw/pitch 명령
    controller.apply_actions(action, ats_cmd)
    obs_builder.update_prev_action(action)
    controller.trigger_graph()
```

### SLAM/Nav2 실행 확인

```bash
ros2 launch spot_ats_nav slam_launch.py
ros2 launch spot_ats_nav navigation_launch.py
ros2 topic echo /cmd_vel
ros2 topic echo /tf
```

---

## 8주차 · 중간고사 예시

### 실기 채점용 점검 스크립트 골격

```python
required_topics = ["/scan", "/odom", "/tf", "/map", "/cmd_vel"]

for topic in required_topics:
    print(f"check topic: {topic}")
    # 실제 시험 환경에서는 `ros2 topic list` 출력과 비교해 확인
```

---

## 9주차 · 지도 저장, Localization, GIMP

### 지도 저장

```bash
mkdir -p ~/maps
ros2 run nav2_map_server map_saver_cli -f ~/maps/spot_ats_map

ls ~/maps/spot_ats_map.pgm
ls ~/maps/spot_ats_map.yaml
```

### Localization/Nav2 실행

```bash
ros2 launch spot_ats_nav localization_launch.py map:=~/maps/spot_ats_map.yaml
ros2 launch spot_ats_nav navigation_launch.py map:=~/maps/spot_ats_map.yaml
```

### AMCL과 map_server 핵심 설정

```yaml
amcl:
  ros__parameters:
    use_sim_time: true
    base_frame_id: body
    odom_frame_id: odom
    global_frame_id: map
    scan_topic: scan
    tf_broadcast: true
    transform_tolerance: 0.2
    min_particles: 500
    max_particles: 2000
    laser_model_type: likelihood_field
    set_initial_pose: false

map_server:
  ros__parameters:
    use_sim_time: true
    yaml_filename: /home/$USER/maps/spot_ats_map.yaml
```

---

## 10주차 · Spot + ATS Vision(YOLOv8)

### YOLOv8 Launch 파일 골격

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    model = LaunchConfiguration("model")
    device = LaunchConfiguration("device")
    threshold = LaunchConfiguration("threshold")
    input_image_topic = LaunchConfiguration("input_image_topic")

    return LaunchDescription([
        DeclareLaunchArgument("model", default_value="yolov8n.pt"),
        DeclareLaunchArgument("device", default_value="cpu"),
        DeclareLaunchArgument("threshold", default_value="0.5"),
        DeclareLaunchArgument("input_image_topic", default_value="/camera/image_raw"),
        Node(
            package="yolov8_bringup",
            executable="yolov8_node",
            name="yolov8_node",
            parameters=[{
                "model": model,
                "device": device,
                "threshold": threshold,
            }],
            remappings=[("image_raw", input_image_topic)],
        ),
    ])
```

### 추론 실행

```bash
ros2 launch yolov8_bringup yolov8.launch.py \
  model:=yolov8n.pt \
  device:=cuda:0 \
  threshold:=0.45 \
  input_image_topic:=/ats/rgb/image_raw
```

### 트래커 업데이트 흐름

```python
tracks = self.tracker.update(det_boxes, cv_image)

for track in tracks:
    src_idx = int(track[-1])
    detection = detections.detections[src_idx]

    tracked_box = Boxes(track[:-1], cv_image.shape[:2])
    cx, cy, w, h = tracked_box.xywh[0]

    detection.bbox.center.position.x = float(cx)
    detection.bbox.center.position.y = float(cy)
    detection.bbox.size.x = float(w)
    detection.bbox.size.y = float(h)

    if tracked_box.is_track:
        detection.id = str(int(tracked_box.id))
```

---

## 11주차 · System-1 Executor Node

### 단위 액션 스키마 검증

```python
from typing import Literal
from pydantic import BaseModel, Field

class UnitAction(BaseModel):
    task: Literal["move_to", "scan", "report_and_wait", "track", "return_to_home"]
    params: dict = Field(default_factory=dict)
    retry: int = Field(default=0, ge=0)

class PlanCommand(BaseModel):
    mission_id: str
    intent: str
    steps: list[UnitAction]
```

### Executor 콜백 골격

```python
import json
from std_msgs.msg import String

def on_plan_cmd(self, msg: String):
    plan = PlanCommand.model_validate(json.loads(msg.data))
    self.current_plan = plan
    self.current_index = 0
    self.queue_status = "running"
    self.get_logger().info(f"new plan: {plan.mission_id}")
```

---

## 12주차 · System-1 단위 액션 part 1

### move_to 실행 골격

```python
from geometry_msgs.msg import PoseStamped

def exec_move_to(self, params):
    goal = params["goal"]

    pose = PoseStamped()
    pose.header.frame_id = "map"
    pose.header.stamp = self.get_clock().now().to_msg()
    pose.pose.position.x = float(goal["x"])
    pose.pose.position.y = float(goal["y"])
    pose.pose.orientation = yaw_to_quaternion(float(goal.get("yaw", 0.0)))

    self.nav_client.wait_for_server()
    future = self.nav_client.send_goal_async(pose)
    return wait_nav_result(future, timeout_sec=params.get("timeout_sec", 60.0))
```

### scan 실행 골격

```python
def exec_scan(self, params):
    sweep_deg = float(params.get("sweep_deg", 120.0))
    yaw_rate_dps = float(params.get("yaw_rate_dps", 15.0))
    duration_sec = float(params.get("duration_sec", sweep_deg / yaw_rate_dps))
    watch_classes = set(params.get("watch_classes", ["person"]))

    self.ats_controller.start_sweep(
        sweep_deg=sweep_deg,
        yaw_rate_dps=yaw_rate_dps,
        duration_sec=duration_sec,
    )

    while not self.ats_controller.done():
        target = self.vision_tracker.primary_target()
        if target and target.class_name in watch_classes:
            self.publish_scan_report(target)
            return True

    return True
```

---

## 13주차 · System-1 단위 액션 part 2

### track 테스트 플랜

```json
{
  "mission_id": "track_demo_001",
  "intent": "person tracking",
  "steps": [
    {
      "task": "track",
      "params": {
        "class": "person",
        "id": "71",
        "follow_dist": 4.0,
        "tol": 1.0,
        "dwell_sec": 0.8,
        "max_time": 30.0
      }
    }
  ]
}
```

### report_and_wait 테스트 플랜

```json
{
  "mission_id": "demo_report_wait_001",
  "intent": "person",
  "steps": [
    {
      "task": "scan",
      "params": {
        "sweep_deg": 180,
        "yaw_rate_dps": 15,
        "duration_sec": 10,
        "watch_classes": ["person"],
        "report_on_found": true
      }
    },
    {
      "task": "report_and_wait",
      "params": {
        "prompt": "현장 상황을 보고하고 다음 명령을 기다린다."
      }
    },
    {
      "task": "return_to_home",
      "params": {}
    }
  ]
}
```

### return_to_home 실행 골격

```python
def exec_return_to_home(self, params):
    goal = self._resolve_home_goal(params)
    self.get_logger().info(
        f"[return_to_home] goal=({goal['x']:.3f}, {goal['y']:.3f}, {goal['yaw']:.3f})"
    )
    return self.exec_move_to(goal)
```

---

## 14주차 · System-2 LLM Planner

### models.py

```python
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

class Step(BaseModel):
    task: Literal["move_to", "scan", "report_and_wait", "track", "return_to_home"]
    params: Dict = Field(default_factory=dict)
    retry: int = Field(default=0, ge=0)

class ReplanRules(BaseModel):
    lost_target_sec: float = Field(default=5.0, ge=0.0)
    battery_rtb: float = Field(default=0.18, ge=0.0, le=1.0)

class HighLevelPlan(BaseModel):
    version: str = "1.0.0"
    intent: str
    steps: List[Step]
    replan_rules: ReplanRules = Field(default_factory=ReplanRules)

class VisionSnapshot(BaseModel):
    summary: str = ""

class System1State(BaseModel):
    mission_id: str
    system1_state: Literal["idle", "moving", "working"]
    current_task: Optional[str] = None
    step_index: int = 0
    pose: Dict = Field(default_factory=dict)
    vision_snapshot: VisionSnapshot = Field(default_factory=VisionSnapshot)
```

### llm_planner.py

```python
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from models import HighLevelPlan

llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
parser = PydanticOutputParser(pydantic_object=HighLevelPlan)

system_template = """너는 Spot+ATS 보안 로봇의 작전 플래너(System-2)다.
[Action] 사용 가능한 단위 액션은 move_to, scan, report_and_wait, track, return_to_home 뿐이다.
[Map] A:(-10.7,-12.6), B:(9.8,-12.6), C:(-10.7,-18.3), D:(9.8,-18.3)
[Logic] 배터리 부족, 타깃 손실, 사람 감지 상황에서는 안전 규칙을 우선한다.
[Format] 반드시 아래 JSON 스키마만 출력한다.
{format_instructions}
"""

def state_to_text(state: dict) -> str:
    pose = state.get("pose", {})
    return (
        f"pos=({pose.get('x', 0):.2f}, {pose.get('y', 0):.2f}) "
        f"battery={state.get('battery', 1.0):.2f}"
    )

def build_plan(cmd: str, state: dict) -> HighLevelPlan:
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("human", "{state}\n명령: {cmd}"),
    ]).partial(format_instructions=parser.get_format_instructions())

    chain = prompt | llm | parser
    return chain.invoke({"state": state_to_text(state), "cmd": cmd})
```

### system2_node.py

```python
import json
import threading

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

from llm_planner import build_plan

class System2Node(Node):
    def __init__(self):
        super().__init__("system2_node")
        self.latest_state = {}
        self.create_subscription(String, "/ats_state", self.on_state, 10)
        self.plan_pub = self.create_publisher(String, "/system2/plan_cmd", 10)
        self.decision_pub = self.create_publisher(String, "/system2/decision", 10)
        threading.Thread(target=self._operator_input_loop, daemon=True).start()

    def on_state(self, msg: String):
        self.latest_state = json.loads(msg.data)

    def _operator_input_loop(self):
        while True:
            cmd = input("운영자 명령> ")
            plan = build_plan(cmd, self.latest_state)
            out = String()
            out.data = plan.model_dump_json()
            self.plan_pub.publish(out)

def main():
    rclpy.init()
    rclpy.spin(System2Node())
```

---

## 15주차 · System-2 테스트 및 검증

### System-2 단독 테스트 명령

```text
A 구역으로 이동해줘
A, C, D 구역을 순서대로 이동하면서 주변을 스캔하고, 만약 사람이 발견되면 보고하고 대기해줘.
```

### Scenario A-D 테스트 명령

```text
Scenario A:
D 구역으로 가줘

Scenario B:
지도의 중앙으로 이동해서 사람이 있는지 120도 반경 살펴보고 있다면 보고해줘

Scenario C:
D, C, B, A 구역 순서대로 이동하면서 정찰해줘.

Scenario D:
주변 60도 반경을 스캔하고, 만약 트럭이 발견되면 추적해줘.
```

### ROS 2 통합 검증 명령

```bash
ros2 topic echo /ats_state
ros2 topic echo /system2/plan_cmd
ros2 topic echo /system2/decision
ros2 topic echo /system2/report_context
```

### report_and_wait 수동 응답

```bash
ros2 topic pub /system2/decision std_msgs/msg/String \
  "{data: '{\"mission_id\":\"demo_report_wait_001\",\"decision\":\"continue\"}'}"
```
