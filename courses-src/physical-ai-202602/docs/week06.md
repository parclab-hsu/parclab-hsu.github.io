# 6주차 — 이동로봇 제어 (Teleop·Odometry)

!!! abstract "학습목표"
    차동구동 운동학을 이해하고, 속도 명령(cmd_vel)으로 로봇을 제어하며 오도메트리를 해석한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — 차동구동 운동학 |
| 2교시 | 50분 | 실습 — Teleop 주행 |
| 3교시 | 50분 | 실습 — 자동 주행 노드 작성 |

## 📖 1교시. 이론

- **차동구동(differential drive)**: 좌우 바퀴 속도 → 선속도 v, 각속도 ω
- `geometry_msgs/Twist` (cmd_vel): linear.x, angular.z
- **Odometry**: 바퀴 회전으로 위치 추정, 누적 오차(drift)와 한계

## 🛠️ 2교시. 실습 — Teleop

**Step 1 — 시뮬레이션 실행**

```bash
export TURTLEBOT3_MODEL=burger
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
```

**Step 2 — 키보드 텔레오퍼레이션**

```bash
ros2 run turtlebot3_teleop teleop_keyboard
# W/X: 전진/후진, A/D: 좌/우회전, S: 정지
```

**Step 3 — cmd_vel 직접 확인**

```bash
ros2 topic echo /cmd_vel
ros2 topic echo /odom
```

## 🛠️ 3교시. 실습 — 자동 주행 노드

**Step 4 — 사각형 주행 노드**

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class Square(Node):
    def __init__(self):
        super().__init__('square_drive')
        self.pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.create_timer(0.1, self.tick)
        self.t = 0.0
    def tick(self):
        cmd = Twist()
        # 2초 직진, 1초 회전 반복
        if int(self.t * 10) % 30 < 20:
            cmd.linear.x = 0.2
        else:
            cmd.angular.z = 0.5
        self.pub.publish(cmd)
        self.t += 0.1

def main():
    rclpy.init(); rclpy.spin(Square())
```

**Step 5 — 실행**

```bash
colcon build --packages-select my_first_pkg && source install/setup.bash
ros2 run my_first_pkg square_drive
```

✅ 로봇이 대략 사각형 궤적으로 움직이면 성공.

## ✅ 체크포인트

- [ ] cmd_vel로 로봇이 움직이는가
- [ ] /odom에서 위치 변화가 보이는가

## 📝 과제

- 원형 궤적(일정한 v, ω)으로 주행하도록 수정
- /odom 값을 읽어 이동 거리를 출력하는 기능 추가

## 🖼️ PPT 슬라이드 개요

1. 이동로봇의 운동학 개요
2. 차동구동(differential drive) 모델
3. cmd_vel(Twist): linear.x, angular.z
4. Odometry 원리와 누적 오차(drift)
5. Teleop과 자율 주행 노드 비교
6. 실습: 사각형/원형 주행

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| cmd_vel 제어 | 40 | 의도 궤적 구현 | 단순 이동 | 미동작 |
| odom 해석 | 30 | 거리 계산·검증 | 값 확인 | 미확인 |
| 과제(원형 주행) | 30 | 완성·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: turtlebot3_gazebo, `TURTLEBOT3_MODEL=burger`

- ❌ 로봇이 안 움직임 → `/cmd_vel` 토픽명·시뮬 실행 확인
- ❌ 회전만 함 → linear.x/angular.z 값과 단위(rad/s) 확인
- ❌ odom drift 누적 → 정상 현상, 7주차 SLAM으로 보정

## 🔗 참고자료

- geometry_msgs/Twist — <https://docs.ros.org/en/humble/p/geometry_msgs/>
- TurtleBot3 주행 예제 — <https://emanual.robotis.com/docs/en/platform/turtlebot3/basic_operation/>
