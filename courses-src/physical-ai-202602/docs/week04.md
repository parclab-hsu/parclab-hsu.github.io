# 4주차 — 센서와 인식 (LiDAR·Camera·IMU)

!!! abstract "학습목표"
    로봇 주요 센서(LiDAR·카메라·IMU)의 원리와 데이터 표현을 이해하고, 센서 토픽을 구독·시각화한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — 센서 원리와 메시지 타입 |
| 2교시 | 50분 | 실습 — 센서 토픽 구독 |
| 3교시 | 50분 | 실습 — RViz 센서 시각화 |

## 📖 1교시. 이론

| 센서 | 측정 | ROS 메시지 |
| --- | --- | --- |
| LiDAR(2D) | 거리(스캔) | `sensor_msgs/LaserScan` |
| LiDAR(3D)/Depth | 점군 | `sensor_msgs/PointCloud2` |
| 카메라 | 영상 | `sensor_msgs/Image` |
| IMU | 가속도·각속도 | `sensor_msgs/Imu` |

센서 융합(sensor fusion)의 필요성, 좌표계(frame_id)와 타임스탬프의 중요성.

## 🛠️ 2교시. 실습 — 센서 데이터 구독

**Step 1 — 시뮬레이터 + 센서 로봇 실행** (TurtleBot3 예)

```bash
sudo apt install -y ros-humble-turtlebot3*
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
```

**Step 2 — LaserScan 구독 노드**

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class ScanSub(Node):
    def __init__(self):
        super().__init__('scan_sub')
        self.create_subscription(LaserScan, '/scan', self.cb, 10)
    def cb(self, msg):
        front = msg.ranges[0]
        self.get_logger().info(f'전방 거리: {front:.2f} m')

def main():
    rclpy.init(); rclpy.spin(ScanSub())
```

## 🛠️ 3교시. 실습 — RViz 시각화 & 명령 도구

```bash
ros2 topic list                 # 센서 토픽 확인
ros2 topic hz /scan             # 발행 주기
ros2 topic echo /imu            # IMU 데이터
rviz2                           # LaserScan, Image, TF 디스플레이 추가
```

✅ RViz에서 빨간 점들(스캔)이 벽 형태로 보이면 성공.

## ✅ 체크포인트

- [ ] `/scan` 전방 거리가 로깅되는가
- [ ] RViz에서 LaserScan이 시각화되는가

## 📝 과제

- 전방 0.5m 이내에 장애물이 있으면 "STOP" 경고를 출력하는 노드 작성

## 🖼️ PPT 슬라이드 개요

1. 로봇 센서의 분류와 역할
2. LiDAR 원리(2D/3D)와 LaserScan/PointCloud2
3. 카메라·깊이센서와 Image 메시지
4. IMU 원리와 Imu 메시지
5. frame_id와 타임스탬프의 중요성
6. 실습: 센서 토픽 구독·RViz 시각화

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 센서 토픽 구독 | 40 | 데이터 해석·로그 | 구독만 | 미동작 |
| RViz 시각화 | 30 | 다중 센서 표시 | 단일 표시 | 미표시 |
| 과제(장애물 경고) | 30 | 조건 처리·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: turtlebot3 패키지, `export TURTLEBOT3_MODEL=burger`

- ❌ 토픽이 안 보임 → 시뮬레이터 실행·모델 환경변수 설정 확인
- ❌ `/scan` 값이 inf → 측정 범위 밖(정상). 필터링 시 inf 처리 필요
- ❌ RViz LaserScan 미표시 → Fixed Frame을 `odom` 또는 `base_scan`으로 설정

## 🔗 참고자료

- sensor_msgs 정의 — <https://docs.ros.org/en/humble/p/sensor_msgs/>
- TurtleBot3 매뉴얼 — <https://emanual.robotis.com/docs/en/platform/turtlebot3/overview/>
