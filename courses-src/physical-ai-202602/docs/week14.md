# 14주차 — Foundation Models & VLA

!!! abstract "학습목표"
    LLM/VLM과 VLA(Vision-Language-Action) 모델을 이해하고, 언어 명령으로 로봇을 제어하는 최신 패러다임을 체험한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — LLM·VLM·VLA |
| 2교시 | 50분 | 실습 — 언어명령 → 태스크 파싱 |
| 3교시 | 50분 | 실습 — VLA 추론 체험 |

## 📖 1교시. 이론

- **Foundation Model**: 대규모 사전학습 → 다양한 다운스트림에 적용
- **LLM → VLM → VLA**: 언어 → 언어+시각 → 언어+시각+**행동(action)**
- **VLA 사례**: RT-2, OpenVLA, Octo — 이미지+명령 → 로봇 동작 토큰 직접 출력
- **Open X-Embodiment**: 여러 로봇 데이터셋 통합으로 일반화·제로샷 능력
- 한계와 과제: 실시간성, 안전성, 환각(hallucination), 데이터 비용

## 🛠️ 2교시. 실습 — 언어명령 파싱

**Step 1 — LLM으로 자연어 → 구조화된 태스크**

```python
# 언어 명령을 로봇 태스크(JSON)로 변환하는 프롬프트 설계 예
SYSTEM = '''너는 로봇 플래너다. 사용자 명령을 다음 JSON으로 변환:
{"action": "pick|place|move", "object": "...", "target": "..."}'''
# 예시 입력: "빨간 박스를 집어서 테이블로 옮겨"
# 기대 출력: {"action": "place", "object": "red box", "target": "table"}
```

!!! tip
    실습은 OpenAI/Claude API 또는 로컬 LLM(Ollama)을 사용. API 키가 없으면 규칙 기반 파서로 대체.

**Step 2 — 파싱 결과를 ROS 토픽으로 발행**

```python
import rclpy, json
from rclpy.node import Node
from std_msgs.msg import String

class CommandParser(Node):
    def __init__(self):
        super().__init__('command_parser')
        self.pub = self.create_publisher(String, '/task_goal', 10)
        self.create_subscription(String, '/user_command', self.cb, 10)
    def cb(self, msg):
        task = self.parse_with_llm(msg.data)   # 위 LLM 호출
        out = String(); out.data = json.dumps(task)
        self.pub.publish(out)
```

## 🛠️ 3교시. 실습 — VLA 추론 체험

- **OpenVLA** 등 공개 VLA 모델을 HuggingFace에서 로드해 이미지+명령 → 행동 토큰 추론 확인
- GPU 없는 경우: 사전 녹화된 데모 영상 + 추론 구조 분석으로 대체
- 토론: VLA가 15주차 프로젝트의 "명령 → 행동" 단계를 어떻게 대체할 수 있는가

✅ 자연어 명령이 구조화된 태스크 JSON으로 변환·발행되면 성공.

## ✅ 체크포인트

- [ ] 언어 명령이 JSON 태스크로 변환되는가
- [ ] `/task_goal` 토픽으로 발행되는가

## 📝 과제 (15주차 프로젝트 연결)

- 내 팀 프로젝트의 명령 체계(지원할 명령 5개) 설계
- 명령 → 태스크 → 서브태스크 매핑 표 작성

## 🖼️ PPT 슬라이드 개요

1. Foundation Model 개념
2. LLM → VLM → VLA 발전
3. VLA 구조(이미지+명령→행동 토큰)
4. 사례: RT-2, OpenVLA, Octo
5. Open X-Embodiment 데이터셋
6. 실습: 언어명령→태스크 파싱

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 언어명령 파싱 | 40 | JSON 변환·발행 | 변환만 | 미동작 |
| VLA 추론 체험 | 30 | 구조 분석·설명 | 실행만 | 미수행 |
| 과제(명령체계 설계) | 30 | 매핑표·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: (선택) LLM API 키 또는 Ollama, transformers

- ❌ API 키 없음 → 규칙 기반 파서로 대체 가능
- ❌ VLA 모델 무거움 → GPU 없으면 데모 영상+구조 분석으로 대체
- ❌ JSON 파싱 실패 → 프롬프트에 출력 형식 예시 명시

## 🔗 참고자료

- OpenVLA — <https://openvla.github.io>
- RT-2 — <https://robotics-transformer2.github.io>
- Open X-Embodiment — <https://robotics-transformer-x.github.io>
