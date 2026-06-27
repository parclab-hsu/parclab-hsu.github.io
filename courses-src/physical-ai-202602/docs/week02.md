# 2주차 — ROS 2 기초 (노드·토픽·서비스)

!!! abstract "학습목표"
    ROS 2의 핵심 통신 구조(노드·토픽·서비스·액션)를 이해하고, 직접 퍼블리셔/구독자 노드를 작성한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — ROS 2 통신 모델 |
| 2교시 | 50분 | 실습 — 패키지 생성 & 퍼블리셔 |
| 3교시 | 50분 | 실습 — 구독자 & 통신 확인 |

## 📖 1교시. 이론

- **노드(Node)**: 하나의 기능 단위 프로세스
- **토픽(Topic)**: 단방향 비동기 스트림 (pub/sub). 예: 센서 데이터
- **서비스(Service)**: 요청/응답(동기). 예: 설정 변경
- **액션(Action)**: 장시간 작업 + 피드백. 예: 목표지점 이동
- **메시지(msg)**: 데이터 타입 정의. `rqt_graph`로 노드/토픽 그래프 시각화

## 🛠️ 2교시. 실습 — 패키지 & 퍼블리셔

**Step 1 — 파이썬 패키지 생성**

```bash
cd ~/cluad_ws/src
ros2 pkg create --build-type ament_python my_first_pkg
```

**Step 2 — 퍼블리셔 노드** (`my_first_pkg/my_first_pkg/talker.py`)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):
    def __init__(self):
        super().__init__('talker')
        self.pub = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(0.5, self.tick)
        self.count = 0
    def tick(self):
        msg = String()
        msg.data = f'Hello Physical AI {self.count}'
        self.pub.publish(msg)
        self.get_logger().info(f'Publish: {msg.data}')
        self.count += 1

def main():
    rclpy.init(); rclpy.spin(Talker())
```

**Step 3 — entry point 등록** (`setup.py`의 `console_scripts`)

```python
'console_scripts': [
    'talker = my_first_pkg.talker:main',
    'listener = my_first_pkg.listener:main',
],
```

## 🛠️ 3교시. 실습 — 구독자 & 빌드/실행

**Step 4 — 구독자 노드** (`listener.py`)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Listener(Node):
    def __init__(self):
        super().__init__('listener')
        self.create_subscription(String, 'chatter', self.cb, 10)
    def cb(self, msg):
        self.get_logger().info(f'I heard: {msg.data}')

def main():
    rclpy.init(); rclpy.spin(Listener())
```

**Step 5 — 빌드 & 실행**

```bash
cd ~/cluad_ws
colcon build --packages-select my_first_pkg
source install/setup.bash
# 터미널 1
ros2 run my_first_pkg talker
# 터미널 2
ros2 run my_first_pkg listener
```

**Step 6 — 디버깅 도구**

```bash
ros2 topic list
ros2 topic echo /chatter
rqt_graph
```

## ✅ 체크포인트

- [ ] 두 노드가 `/chatter` 토픽으로 통신하는가
- [ ] `rqt_graph`에 노드 연결이 보이는가

## 📝 과제

- 토픽 주기를 0.5초→2초로 바꾸고 결과 비교
- 메시지에 학번을 포함하도록 수정

## 🖼️ PPT 슬라이드 개요

1. ROS 2는 왜 필요한가 (미들웨어 관점)
2. 노드 · 토픽 · 서비스 · 액션 개념도
3. Pub/Sub 통신 시퀀스 다이어그램
4. 패키지 구조와 빌드 시스템(colcon)
5. 실습: talker/listener 코드 설명
6. rqt_graph로 보는 노드 그래프

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 퍼블리셔/구독자 구현 | 40 | 양쪽 동작·코드 설명 | 동작 | 미완성 |
| 토픽 통신 검증 | 30 | echo·rqt_graph 확인 | 토픽 확인 | 미확인 |
| 과제(주기 변경) | 30 | 실험·비교 제출 | 수행만 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: 1주차 환경 구축 완료, 텍스트 에디터(VS Code 권장)

- ❌ `ros2 run` 시 패키지 미인식 → `colcon build` 후 `source install/setup.bash` 재실행
- ❌ entry point 오류 → `setup.py`의 console_scripts 경로(`패키지.모듈:main`) 확인
- ❌ 수정이 반영 안 됨 → `--symlink-install`로 빌드했는지 확인

## 🔗 참고자료

- ROS 2 튜토리얼(Beginner) — <https://docs.ros.org/en/humble/Tutorials.html>
- rclpy 개요 — <https://docs.ros.org/en/humble/p/rclpy/>
- colcon 문서 — <https://colcon.readthedocs.io>
