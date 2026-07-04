# 예제 코드 사용법

이 폴더의 예제는 강의 문서에서 바로 연결되는 최소 동작 예제다. 한 번에 큰 프로젝트를 이해하려고 하기보다, 각 파일을 실행하면서 C 문법이 콘솔, Arduino UNO R4 WiFi, ROS2로 어떻게 이어지는지 확인한다.

## 폴더 구성

| 폴더 | 내용 | 먼저 볼 파일 |
|------|------|--------------|
| `code/c/examples` | PC에서 컴파일하는 순수 C 예제 | `ex12_pointer_basics.c` |
| `code/arduino` | Arduino UNO R4 WiFi 스케치 | `05_showface/05_showface.ino` |
| `code/ros2` | ROS2 연동 예제 | `stella_n2_bridge/index.md` |

## PC C 예제 실행

```bash
cd courses-src/c-programming-202602/docs/code/c/examples
gcc -Wall -Wextra -std=c11 ex13_pointer_applications.c -o ex13_pointer_applications
./ex13_pointer_applications
```

Windows Visual Studio에서는 C 콘솔 프로젝트를 만든 뒤 `.c` 파일 내용을 붙여 넣어 실행해도 된다.

## Arduino R4 예제 실행

1. Arduino IDE 2.x를 설치한다.
2. 보드를 `Arduino UNO R4 WiFi`로 선택한다.
3. 실습 폴더의 `.ino` 파일을 연다.
4. 업로드 후 시리얼 모니터를 `115200` baud로 연다.

!!! warning "WiFi 예제 주의"
    `11_wifi_car` 예제는 같은 네트워크에 접속해야 한다. 공용 실습실에서는 공유기 정책 때문에 접속이 막힐 수 있으므로 먼저 시리얼 모니터에 출력되는 IP 주소를 확인한다.

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

별도 터미널에서 `/scan` 토픽에 테스트 데이터를 넣을 수 있다.

```bash
ros2 topic pub /scan sensor_msgs/msg/LaserScan "{ranges: [1.0, 0.8, 0.6, 0.4, 0.9], range_min: 0.05, range_max: 8.0}" -r 2
ros2 topic echo /cmd_vel
```

## 권장 학습 순서

1. `ex12_pointer_basics.c`로 주소와 간접 참조를 복습한다.
2. `ex13_pointer_applications.c`로 문자열 포인터, 포인터 배열, 배열 포인터를 확인한다.
3. `ex13_function_pointer_menu.c`로 함수 포인터 배열을 메뉴 구조로 이해한다.
4. `13_pointer_dispatch.ino`로 Arduino 명령과 함수 호출을 연결한다.
5. `ex14_struct_student.c`로 구조체 선언, 배열, 구조체 포인터 인수를 확인한다.
6. `ex14_struct_packet_list.c`로 구조체 패킷, 직렬화, 연결리스트 맛보기를 확인한다.
7. `packet_parser.c`와 `stella_n2_bridge`로 문자열 패킷과 ROS2 토픽 연결을 확인한다.

이 순서는 **포인터 -> 명령 테이블 -> 구조체 패킷 -> 문자열 직렬화 -> ROS2 콜백**으로 이어진다.
