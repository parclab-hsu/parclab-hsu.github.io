# stella_n2_bridge

`/scan` LiDAR 거리 배열을 받아 순수 C 함수(`scan_logic.c`)로 전진/회피/정지를 판단하고, ROS2의 `/cmd_vel` 토픽으로 주행 명령을 발행하는 예제다.

## 빌드

```bash
source /opt/ros/jazzy/setup.bash
mkdir -p ~/cprog_ws/src
cp -r stella_n2_bridge ~/cprog_ws/src/
cd ~/cprog_ws
colcon build --packages-select stella_n2_bridge
source install/setup.bash
```

## 실행

```bash
ros2 run stella_n2_bridge stella_n2_bridge
```

테스트용 `/scan` 발행:

```bash
ros2 topic pub /scan sensor_msgs/msg/LaserScan "{ranges: [1.2, 0.9, 0.4, 0.8, 1.1], range_min: 0.05, range_max: 8.0}" -r 2
```

출력 확인:

```bash
ros2 topic echo /cmd_vel
```

## 학생이 볼 핵심

- `scan_logic.c`: 배열, 반복문, 조건문, 구조체 반환
- `stella_n2_bridge.cpp`: ROS2 토픽 subscribe/publish
- `geometry_msgs/Twist`: 로봇 속도 명령 메시지

!!! warning "실제 로봇 연결 전"
    먼저 바퀴를 바닥에서 띄우고 `/cmd_vel` 값만 확인한다. 실제 주행 전에는 비상정지 방법과 최대 속도를 반드시 확인한다.
