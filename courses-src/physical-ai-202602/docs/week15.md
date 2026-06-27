# 15주차 — 종합 프로젝트 & 발표

!!! abstract "학습목표"
    한 학기 동안 배운 **인식(Perception) – 판단/학습(Decision/Learning) – 제어(Control)** 요소를 하나의 임베디드 지능 시스템으로 통합하고, 시뮬레이션에서 실행·시연·발표한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 시스템 통합 점검 & 리허설 |
| 2교시 | 50분 | 팀 발표 & 시연 |
| 3교시 | 50분 | 상호 평가 & 한 학기 정리 |

## 📖 시스템 아키텍처

임베디드 지능의 표준 **Sense → Plan → Act** 루프:

```
[센서] → [인식] → [상태추정/지도] → [판단/정책] → [동작계획] → [제어]
Camera   YOLO/CNN   SLAM·Nav2        VLA·RL Policy   경로·모션    구동/매니퓰레이션
 LiDAR                                               계획
```

- 각 단계가 한 학기 어느 주차에서 다뤄졌는지 대응시키며 전체 그림을 복기
- 동기·비동기 처리, 실시간성, 좌표계(TF) 일관성 등 통합 시 발생하는 문제를 다룸

## 🛠️ 실습 — 통합 프로젝트

!!! example "프로젝트 주제: 언어 명령 기반 모바일 매니퓰레이션 에이전트"
    사용자의 자연어 명령(예: "빨간 박스를 집어서 테이블로 옮겨")을 받아 **인식 → 내비게이션 → 그래스핑**을 자율 수행하는 통합 에이전트를 시뮬레이션에서 완성.

### 시스템 구성 (ROS 2 노드)

| 노드 | 역할 | 입력 → 출력 |
| --- | --- | --- |
| `perception_node` | YOLO 객체탐지 + 3D 위치 추정 | `/camera/image` → `/detected_objects` |
| `command_node` | 자연어 명령 파싱(VLM/규칙) | 텍스트 → `/task_goal` |
| `nav_node` | Nav2 목표지점 이동 | `/task_goal` → `/cmd_vel` |
| `manip_node` | MoveIt 그래스핑 | 객체 pose → 관절 궤적 |
| `orchestrator` | behavior tree 태스크 조율 | 전체 상태 관리 |

### 실행 절차

```bash
# 1) 빌드 & 환경 기동
cd ~/cluad_ws && colcon build --symlink-install && source install/setup.bash
ros2 launch capstone_bringup world.launch.py

# 2) 통합 파이프라인 실행
ros2 launch capstone_bringup agent.launch.py

# 3) 자연어 명령 전송
ros2 topic pub --once /user_command std_msgs/String \
  "{data: 'pick the red box and place it on the table'}"
```

### orchestrator 핵심 로직 (예시)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Orchestrator(Node):
    def __init__(self):
        super().__init__('orchestrator')
        self.create_subscription(String, '/user_command', self.on_cmd, 10)
        self.state = 'IDLE'
    def on_cmd(self, msg):
        target = self.parse(msg.data)        # 1) 명령 파싱
        obj = self.perceive(target)          # 2) 객체 인식
        self.navigate_to(obj.location)       # 3) 내비게이션
        self.grasp_and_place(obj)            # 4) 그래스핑
        self.state = 'DONE'
        self.get_logger().info(f'Task done: {target}')

def main():
    rclpy.init(); rclpy.spin(Orchestrator())
```

## 🎤 발표 및 평가

### 발표 구성 (팀당 10분 + Q&A 5분)

1. 문제 정의 및 시나리오
2. 시스템 아키텍처 및 모듈 설계
3. 시연 (라이브 또는 영상)
4. 결과 분석 — 성공률, 실패 원인
5. 한계와 향후 개선(특히 Sim-to-Real 관점)

### 제출물 (팀별)

- [ ] 동작 시연 영상(2~3분) 또는 라이브 시연
- [ ] 시스템 아키텍처 다이어그램(노드/토픽 그래프)
- [ ] 소스코드 + `launch` 파일 (재현 가능해야 함)
- [ ] 발표 슬라이드(문제정의·설계·결과·한계·개선)

## 📊 평가 루브릭 (기말 프로젝트)

| 항목 | 비중 | 평가 기준 |
| --- | --- | --- |
| 시스템 완결성 | 30% | 명령→동작 파이프라인이 끝까지 작동하는가 |
| 기술 통합도 | 25% | 인식·판단·제어가 유기적으로 연결되는가 |
| 강건성·재현성 | 15% | 실패 처리, launch 재현성 |
| 발표·문서화 | 15% | 설계 설명, 다이어그램, 코드 품질 |
| 창의성·확장성 | 15% | 시나리오 독창성, Sim-to-Real 고려 |

## 🧭 마무리 — 한 학기 정리

- Digital AI에서 **Physical AI**로: 인지가 물리적 행동으로 이어지는 임베디드 지능의 전체 흐름을 직접 구현해 봄
- 다음 단계: 실제 로봇으로의 Sim-to-Real 이전, VLA·Foundation Model 기반 일반화, 멀티로봇 협업

!!! tip
    프로젝트는 "화려한 단일 모듈"보다 "끝까지 작동하는 통합 파이프라인"이 높은 평가를 받습니다. 먼저 단순한 end-to-end 버전을 완성한 뒤 모듈 품질을 높이세요.
