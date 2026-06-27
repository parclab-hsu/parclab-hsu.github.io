# 3주차 — 로봇 좌표계와 기구학 (TF2)

!!! abstract "학습목표"
    로봇의 좌표 변환(TF)과 순기구학/역기구학 개념을 이해하고, TF2와 RViz로 좌표계를 시각화한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — 강체 변환·TF·기구학 |
| 2교시 | 50분 | 실습 — TF 브로드캐스터 작성 |
| 3교시 | 50분 | 실습 — RViz 시각화 & tf 도구 |

## 📖 1교시. 이론

- **강체 변환**: 회전(R) + 이동(t), 4×4 동차변환행렬
- **좌표계(frame)**: world → odom → base_link → sensor 의 트리 구조
- **TF2**: 시간에 따라 변하는 좌표계 관계를 관리하는 ROS 시스템
- **순기구학(FK)**: 관절각 → 말단 위치 / **역기구학(IK)**: 목표 위치 → 관절각

## 🛠️ 2교시. 실습 — TF 브로드캐스터

**Step 1 — 패키지 의존성**

```bash
sudo apt install -y ros-humble-tf2-ros ros-humble-tf2-tools ros-humble-rviz2
```

**Step 2 — 동적 TF 브로드캐스터** (회전하는 frame)

```python
import math, rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
from tf2_ros import TransformBroadcaster

class FramePub(Node):
    def __init__(self):
        super().__init__('frame_pub')
        self.br = TransformBroadcaster(self)
        self.create_timer(0.05, self.tick)
        self.t = 0.0
    def tick(self):
        tf = TransformStamped()
        tf.header.stamp = self.get_clock().now().to_msg()
        tf.header.frame_id = 'world'
        tf.child_frame_id = 'robot'
        tf.transform.translation.x = math.cos(self.t)
        tf.transform.translation.y = math.sin(self.t)
        tf.transform.rotation.w = 1.0
        self.br.sendTransform(tf)
        self.t += 0.05

def main():
    rclpy.init(); rclpy.spin(FramePub())
```

## 🛠️ 3교시. 실습 — RViz & tf 도구

**Step 3 — 실행 및 시각화**

```bash
ros2 run my_first_pkg frame_pub   # 위 노드
rviz2                              # Fixed Frame=world, TF 표시 추가
```

**Step 4 — TF 확인 도구**

```bash
ros2 run tf2_ros tf2_echo world robot   # 두 frame 간 변환 출력
ros2 run tf2_tools view_frames          # frames.pdf 트리 생성
```

✅ RViz에서 'robot' 좌표축이 원을 그리며 도는 것을 확인.

## ✅ 체크포인트

- [ ] world→robot 변환이 `tf2_echo`로 출력되는가
- [ ] RViz에서 좌표계 움직임이 보이는가

## 📝 과제

- robot 아래에 'sensor' frame을 0.2m 앞에 추가
- view_frames로 생성된 트리 캡처 제출

## 🖼️ PPT 슬라이드 개요

1. 좌표계와 강체 변환(회전·이동)
2. 동차변환행렬(4×4)과 합성
3. TF 트리: world→odom→base_link→sensor
4. TF2의 시간 동기화 개념
5. 순기구학(FK) vs 역기구학(IK)
6. 실습: TF 브로드캐스터 + RViz

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| TF 브로드캐스터 구현 | 40 | 동적 변환·설명 | 정적 변환만 | 미동작 |
| RViz 시각화 | 30 | 움직임 확인·해석 | 표시만 | 미표시 |
| 과제(sensor frame 추가) | 30 | 트리 구성·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: 2주차 패키지, tf2/rviz2 설치

- ❌ RViz에 TF 안 보임 → Fixed Frame을 `world`로 설정했는지 확인
- ❌ `Lookup would require extrapolation` → header.stamp을 현재 시각으로 채웠는지 확인
- ❌ 좌표축이 고정 → 타이머 콜백에서 변환을 갱신하는지 확인

## 🔗 참고자료

- TF2 튜토리얼 — <https://docs.ros.org/en/humble/Tutorials/Intermediate/Tf2/Tf2-Main.html>
- REP 105 (좌표계 규약) — <https://www.ros.org/reps/rep-0105.html>
- Modern Robotics — <https://modernrobotics.northwestern.edu>
