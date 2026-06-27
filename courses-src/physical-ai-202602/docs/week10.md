# 10주차 — 로봇 매니퓰레이션 (MoveIt)

!!! abstract "학습목표"
    로봇팔 기구학과 모션플래닝 개념을 이해하고, MoveIt으로 그래스핑(pick & place)을 수행한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — 매니퓰레이터·IK·모션플래닝 |
| 2교시 | 50분 | 실습 — MoveIt 환경 실행 |
| 3교시 | 50분 | 실습 — 목표 pose 이동 |

## 📖 1교시. 이론

- **매니퓰레이터**: 자유도(DOF), 관절 공간 vs 작업 공간
- **IK(역기구학)**: 목표 포즈 → 관절각 해(다중해·특이점)
- **모션플래닝**: 장애물 회피 경로 생성(OMPL, RRT), 충돌 검사
- **MoveIt**: ROS 매니퓰레이션 스택 (플래닝 + 제어 + 퍼셉션)

## 🛠️ 2교시. 실습 — MoveIt 실행

**Step 1 — 설치**

```bash
sudo apt install -y ros-humble-moveit ros-humble-moveit-resources
```

**Step 2 — 데모 로봇팔(Panda) 실행**

```bash
ros2 launch moveit2_tutorials demo.launch.py
# RViz에서 MotionPlanning 패널이 뜸
```

**Step 3 — RViz에서 대화형 조작**

- 주황색 마커(goal)를 드래그하여 목표 포즈 설정
- `Plan` → 경로 시각화 → `Execute` → 팔 이동

## 🛠️ 3교시. 실습 — 코드로 목표 pose 이동

**Step 4 — MoveItPy로 프로그래밍 제어 (개념 예시)**

```python
# moveit_py 기반 의사코드
# 1) target_pose 설정 (x, y, z, orientation)
# 2) plan = arm.plan(target_pose)
# 3) arm.execute(plan)
# 4) gripper.close()  # 그립어 닫기
```

- 실습은 RViz GUI → 코드 API 순으로 난이도를 올림

✅ RViz에서 Plan→Execute로 팔이 목표 포즈로 이동하면 성공.

## ✅ 체크포인트

- [ ] MoveIt 데모가 RViz에 뜨는가
- [ ] Plan→Execute로 팔이 움직이는가

## 📝 과제

- 서로 다른 포즈 2곳을 왔다갔다 하는 동작 시연
- "그래스핑 → 이동 → 놓기" 흐름을 그림으로 설명

## 🖼️ PPT 슬라이드 개요

1. 매니퓰레이터와 자유도(DOF)
2. 관절공간 vs 작업공간
3. 역기구학(IK)과 다중해·특이점
4. 모션플래닝(OMPL, RRT)과 충돌검사
5. MoveIt 스택 구조
6. 실습: pick & place

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| MoveIt 실행 | 30 | 데모 동작·이해 | 실행만 | 실패 |
| Plan→Execute | 40 | 목표 pose 이동 | 부분 | 미동작 |
| 과제(2 pose 왕복) | 30 | 시연·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: ros-humble-moveit, moveit_resources, moveit2_tutorials

- ❌ 데모 안 뜸 → moveit2_tutorials 설치·소스 빌드 확인
- ❌ 계획 실패 → 목표 pose가 작업영역 밖·충돌 상태인지 확인
- ❌ RViz 무거움 → MotionPlanning 패널만 남기고 정리

## 🔗 참고자료

- MoveIt 2 문서 — <https://moveit.picknik.ai/humble/index.html>
- OMPL — <https://ompl.kavrakilab.org>
- Modern Robotics — <https://modernrobotics.northwestern.edu>
