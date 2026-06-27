# 9주차 — 컴퓨터 비전과 딥러닝 인식 (YOLO)

!!! abstract "학습목표"
    CNN과 객체탐지(YOLO) 원리를 이해하고, 카메라 영상을 ROS 2에서 실시간 객체탐지하는 노드를 구현한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — CNN·객체탐지·YOLO |
| 2교시 | 50분 | 실습 — YOLO 단독 추론 |
| 3교시 | 50분 | 실습 — ROS 2 연동 |

## 📖 1교시. 이론

- **CNN**: 합성곱·풀링으로 이미지 특징 추출
- **객체탐지**: 위치(bbox) + 클래스 + 신뢰도. 분류 vs 탐지 vs 세그멘테이션
- **YOLO**: 1-stage 실시간 탐지기. mAP·FPS 트레이드오프
- 로봇에서의 의미: 인식 결과를 3D 좌표(TF)로 옮겨 **판단·제어**에 전달

## 🛠️ 2교시. 실습 — YOLO 추론

**Step 1 — 설치**

```bash
pip install ultralytics opencv-python
```

**Step 2 — 단독 추론 테스트**

```python
from ultralytics import YOLO
model = YOLO('yolov8n.pt')          # 경량 모델
results = model('https://ultralytics.com/images/bus.jpg')
results[0].show()                   # bbox 시각화
for b in results[0].boxes:
    print(model.names[int(b.cls)], float(b.conf))
```

## 🛠️ 3교시. 실습 — ROS 2 연동

**Step 3 — 이미지 구독 + YOLO 탐지 노드**

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from cv_bridge import CvBridge
from ultralytics import YOLO

class Detector(Node):
    def __init__(self):
        super().__init__('yolo_detector')
        self.bridge = CvBridge()
        self.model = YOLO('yolov8n.pt')
        self.create_subscription(Image, '/camera/image_raw', self.cb, 10)
    def cb(self, msg):
        frame = self.bridge.imgmsg_to_cv2(msg, 'bgr8')
        r = self.model(frame, verbose=False)[0]
        for b in r.boxes:
            name = self.model.names[int(b.cls)]
            self.get_logger().info(f'탐지: {name} ({float(b.conf):.2f})')

def main():
    rclpy.init(); rclpy.spin(Detector())
```

**Step 4 — 실행**

```bash
sudo apt install -y ros-humble-cv-bridge
ros2 run my_first_pkg yolo_detector
```

✅ 카메라 영상의 객체 이름과 신뢰도가 로그되면 성공.

## ✅ 체크포인트

- [ ] YOLO 단독 추론이 동작하는가
- [ ] 카메라 토픽을 받아 실시간 탐지가 되는가

## 📝 과제

- 특정 클래스(예: person)만 필터링해 화면 중앙 여부를 판단하는 노드로 확장
- 탐지 결과를 `/detected_objects` 토픽으로 발행

## 🖼️ PPT 슬라이드 개요

1. 컴퓨터 비전과 로봇 인식
2. CNN: 합성곱·풀링·특징 추출
3. 분류 vs 탐지 vs 세그멘테이션
4. YOLO 1-stage 탐지 구조
5. mAP·FPS 트레이드오프
6. 실습: YOLO + ROS2 연동

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| YOLO 단독 추론 | 30 | 결과 해석·시각화 | 추론만 | 미동작 |
| ROS2 연동 | 40 | 실시간 탐지·로그 | 동작 | 미동작 |
| 과제(/detected_objects) | 30 | 토픽 발행·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: ultralytics, opencv-python, cv_bridge

- ❌ `cv_bridge` import 오류 → `sudo apt install ros-humble-cv-bridge` 후 재빌드
- ❌ 추론이 느림 → yolov8n(nano) 모델 사용, GPU 없으면 정상
- ❌ 카메라 토픽 없음 → 시뮬 카메라 플러그인 추가 또는 image_publisher 사용

## 🔗 참고자료

- Ultralytics YOLO 문서 — <https://docs.ultralytics.com>
- cv_bridge — <https://github.com/ros-perception/vision_opencv>
- YOLO 논문 — <https://arxiv.org/abs/1506.02640>
