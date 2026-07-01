# 예제 코드 사용법

이 폴더의 예제는 강의 문서에서 바로 연결되는 **최소 동작 예제**다. 큰 프로젝트를 한 번에 이해하려 하지 말고, 한 파일씩 실행하면서 C 문법이 실제 장비와 ROS2로 어떻게 이어지는지 확인한다.

## 폴더 구성

| 폴더 | 내용 | 먼저 볼 파일 |
|------|------|--------------|
| `code/c/examples` | PC에서 컴파일하는 순수 C 예제 | `ex06_pose_struct.c` |
| `code/arduino` | Arduino UNO R4 WiFi 스케치 | `05_showface/05_showface.ino` |
| `code/ros2` | ROS2 연동 예제 | `stella_n2_bridge/README.md` |

## PC C 예제 실행

```bash
cd courses-src/c-programming-202602/docs/code/c/examples
gcc -Wall -Wextra -std=c11 ex06_pose_struct.c -o ex06_pose_struct
./ex06_pose_struct
```

Windows Visual Studio에서는 새 C 콘솔 프로젝트를 만들고 `.c` 파일 내용을 붙여 넣어 실행해도 된다.

## Arduino R4 예제 실행

1. Arduino IDE 2.x를 설치한다.
2. 보드를 `Arduino UNO R4 WiFi`로 선택한다.
3. 스케치 폴더의 `.ino` 파일을 연다.
4. 업로드 후 시리얼 모니터를 `115200` baud로 연다.

!!! warning "WiFi 예제 주의"
    `11_wifi_car` 예제는 같은 네트워크에 접속해야 한다. 공개 실습실에서는 공유기 정책 때문에 접속이 막힐 수 있으므로, 먼저 시리얼 모니터에 출력되는 IP 주소를 확인한다.

## ROS2 예제 실행

ROS2 예제는 Ubuntu 24.04 + ROS2 Jazzy 기준이다.

```bash
source /opt/ros/jazzy/setup.bash
mkdir -p ~/cprog_ws/src
cp -r courses-src/c-programming-202602/docs/code/ros2/stella_n2_bridge ~/cprog_ws/src/
cd ~/cprog_ws
colcon build --packages-select stella_n2_bridge
source install/setup.bash
ros2 run stella_n2_bridge stella_n2_bridge
```

별도 터미널에서 `/scan` 토픽이 없으면 테스트 데이터를 넣는다.

```bash
ros2 topic pub /scan sensor_msgs/msg/LaserScan "{ranges: [1.0, 0.8, 0.6, 0.4, 0.9], range_min: 0.05, range_max: 8.0}" -r 2
ros2 topic echo /cmd_vel
```

## 읽는 순서

1. `ex06_pose_struct.c`로 구조체와 직렬화를 이해한다.
2. `15_struct_packet.ino`로 같은 패킷을 Arduino에서 출력한다.
3. `packet_parser.c`로 문자열 패킷을 다시 구조체로 바꾼다.
4. `stella_n2_bridge`로 LiDAR 배열을 분석해 `/cmd_vel`을 발행한다.

이 순서가 곧 **구조체 → 문자열 → 토픽 → 로봇 주행**의 연결이다.
