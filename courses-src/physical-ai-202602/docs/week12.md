# 12주차 — System-1 단위 액션 설계 part 1

!!! abstract "학습목표"
    System-2가 만든 플랜을 한 줄씩 실행하는 **System-1 Executor**의 역할(TF 추적·vision 캐시·guard 판단)을 이해하고, 더 이상 쪼갤 수 없는 **단위 액션(Unit Action)** 의 개념을 익힌다. 특히 `move_to`(Nav2 기반 이동)와 `scan`(ATS 회전 탐색) 두 액션의 **입력 파라미터·성공/실패 판정 기준**을 설계하고, ROS 2 명령으로 단독 테스트하는 방법을 학습한다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「System-1 단위 액션 설계 part 1」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드는 교안의 설명을 충실히 따른 **재구성 예제**입니다(원본 소스 비공개).

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro — System-1 Executor & 단위 액션 개념, 오늘의 흐름(설계→구현→테스트) | §01 Intro |
| 2교시 | 50분 | `move_to` 설계 — Nav2Navigator 래퍼, 쿼터니언 변환, stuck 판정, 테스트 | §02 move_to |
| 3교시 | 50분 | `scan` 설계 — ALIGN/SWEEP/FOUND 3단계, vision 연동, 테스트 & Wrap-up | §02 scan / §03 |

---

## 🧭 Intro — System-1 Executor와 단위 액션

이 프로젝트의 두뇌-몸 구조에서 **System-2는 "무엇을 할지"를 자연어로 받아 플랜(step 시퀀스)을 생성**하고, **System-1 Executor는 그 플랜을 한 줄씩 내려가며 실제로 실행**합니다.

![System-1 Executor와 단위 액션 개요](img/w12/s03.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 03 (출처: ENGI UNIVERSE)
///

### Executor가 매 스텝에서 하는 일

| 순서 | 동작 | 설명 |
| --- | --- | --- |
| 1 | **TF로 위치/자세 추적** | 현재 로봇의 위치·방향을 좌표 변환으로 파악 |
| 2 | **vision 컨텍스트 캐시** | 카메라 인식 결과를 캐싱해 액션이 공유 |
| 3 | **guard 판단** | 여러 규칙으로 "지금 이 액션을 실행해도 되는지" 검사 |
| 4 | **단위 액션 수행** | 검증을 통과한 단위 액션을 순서대로 실행 |

### 단위 액션(Unit Action) 개념

- **`move_to`** : 지도 상 특정 좌표/포즈로 이동
- **`scan`** : 제자리에서 ATS를 회전시키며 주변 탐색
- **`track`** : 카메라 기준으로 대상을 화면 중심·일정 거리 안에 유지
- **`report` / `wait_for_command`** : 현재 상황을 System-2에 보고 + 새 플랜/명령 대기
- **`return_to_home`** : 사전 정의된 home position으로 복귀

!!! note "단위 액션의 설계 철학"
    각 단위 액션은 **더 이상 쪼개기 어려운 최소 행동 단위**로 설계합니다. System-2는 이 블록들을 **조합**해 플랜을 만들고, Executor는 이를 **예측 가능한 방식**으로 실행합니다.

### 오늘 강의의 흐름

**Step 1 — 단위 액션 설계**: 각 액션이 어떤 상황에 쓰이는지 정리하고, 액션별 **입력 파라미터 / 출력(성공·실패 판단 기준)** 을 설계합니다.

**Step 2 — 단위 액션 구현**: 액션 함수의 호출·관리 체계를 정리하고, Executor 코드에서 함수 간 관계를 탐색합니다.

**Step 3 — 단위 액션 테스트**: 구현된 액션으로 간단한 테스트 시나리오를 실행합니다.

![오늘 강의의 흐름: 설계 → 구현 → 테스트](img/w12/s05.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 05 (출처: ENGI UNIVERSE)
///

---

## 🚶 `move_to` 설계 — Nav2 기반 이동 액션

### 역할 정의

- Executor는 `move_to()`의 **True / False 결과**로 다음을 결정합니다.
    - **True** → 스텝 진행
    - **False** → 재시도(retry) 또는 System-2에 **replan** 요청

### 주요 구성요소

| 요소 | 역할 |
| --- | --- |
| `self` | 로그·TF·상태를 가진 Executor 노드 |
| `self.navigator` | Nav2 액션 서버와 통신(`Nav2Navigator`) |
| `self._nav_feedback` | Nav2 피드백 딕셔너리 |
| `self.goal` | 플랜이 내려준 목표 포즈 |
| `self.replan_rules` | 재플랜 규칙(stuck 판정 정책 등) |

![move_to 구성요소와 Nav2Navigator 래퍼](img/w12/s09.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 09 (출처: ENGI UNIVERSE)
///

### `Nav2Navigator` — NavigateToPose를 감싸는 전용 래퍼

- Nav2의 `NavigateToPose` 액션을 감싸는 래퍼 클래스
- 스레드 구조 때문에 **폴링(polling) 기반 비동기 대기**를 사용
- `__init__` : Node를 입력받아 `ActionClient` 생성, 액션 이름(`NavigateToPose`)과 기준 좌표계(frame) 설정. **기본 frame은 `map`**

!!! tip "여기서 잠깐! — ROS 2의 서비스 vs 액션"
    | 구분 | 서비스(Service) | 액션(Action) |
    | --- | --- | --- |
    | 구조 | Request → Response (One-shot) | Goal → Feedback(중간) → Result(최종) |
    | 적합한 작업 | 짧게 끝나는 작업 (모드 조회, 파라미터 변경) | 수 초~수십 초 지속 작업 (이동) |
    | 중간 피드백 | 없음 | 진행 상황·장애물 회피·현재 위치 등 계속 발행 |
    | 취소 | 불가 | 가능 (pending → active → succeeded 상태 자체 관리) |

    Spot이 특정 위치까지 걸어가는 작업은 이동 중 피드백이 필요하므로 **액션**이 훨씬 잘 맞습니다.

### 목표 좌표 로드와 서버 대기

**Step 1 — `start()`에서 goal 검증·캐스팅**

```python
def start(self, goal):
    if not isinstance(goal, dict):
        return False
    try:
        # goal의 x, y, yaw를 모두 float로 캐스팅 → Nav2 좌표계를 실수화
        x = float(goal["x"]); y = float(goal["y"]); yaw = float(goal["yaw"])
    except (KeyError, ValueError):
        return False
```

**Step 2 — 서버 연결 폴링**

```python
t0 = time.time()
while not self._client.wait_for_server(timeout_sec=0.2):
    if time.time() - t0 > 5.0:
        # 5초 이상 서버가 안 뜨면 연결 실패 로그 → Executor 레벨에서 replan 발생
        self._node.get_logger().error("Nav2 server not available")
        return False
```

### yaw → 쿼터니언 변환

!!! note "여기서 잠깐! — 쿼터니언이란?"
    ROS 2에서 로봇의 방향은 단순 각도(yaw)가 아니라 항상 **쿼터니언(Quaternion)** 으로 넘깁니다. roll/pitch/yaw 표현은 특정 각도에서 수학적으로 불안정(**짐벌락**)해지는데, 쿼터니언은 4개 값 `(x, y, z, w)` 으로 회전을 안정적으로 표현합니다. `move_to`에서는 z축 회전만 다루므로 **z, w 성분만** 계산하면 충분합니다.

```python
def _yaw_to_quat(yaw):
    # 쿼터니언은 회전 각도의 절반을 사용 → yaw * 0.5
    # z축 회전: (x=0, y=0, z=sin(θ/2), w=cos(θ/2))
    return (0.0, 0.0, math.sin(yaw * 0.5), math.cos(yaw * 0.5))
```

`NavigateToPose.Goal()`로 Nav2가 이해 가능한 목표 pose를 만들 때 이 변환된 쿼터니언을 그대로 넣어 사용합니다.

### 비동기 goal 전송과 결과 풀링

- `self._client.send_goal_async(...)` : 비동기 goal 전송
- `while rclpy.ok() and not send_goal_future.done()` : 결과 future가 완료될 때까지 대기
- `goal_handle.accepted` 로 goal 수락 여부 확인 → `goal_handle.get_result_async()`로 결과 풀링 준비

!!! success "Nav2Navigator 래퍼의 역할"
    변환된 목표 좌표를 받아 Nav2 액션을 시작하고, 피드백을 **딕셔너리 형태로 콜백**하며, 액션 종료 시 result future로 성공/실패를 알려주는 **중간 번역기(Wrapper)** 역할을 수행합니다.

### `exec_move_to` — 실제 이동 단위 액션 함수

![exec_move_to의 인자와 stuck 판정 정책](img/w12/s20.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 20 (출처: ENGI UNIVERSE)
///

System-1 Executor에서 이동을 담당하는 실제 함수로, Nav2 피드백을 모니터링하며 **정상 도착 시 `True`**, **중간 장애·실패 감지 시 `False`** 를 반환하는 **동기 액션 함수**입니다.

```python
def exec_move_to(node, navigator, nav_feedback, goal, replan_rules):
    # node          : 로그, TF, _last_pose 등 현재 상태 접근 핸들
    # navigator     : Nav2 래퍼 객체
    # nav_feedback  : 피드백 콜백이 덮어써 가며 공유하는 딕셔너리
    # goal          : 목표 포즈(어디까지 이동할지)
    # replan_rules  : stuck 판정 정책 등 플랜에서 넘어온 파라미터
    if not isinstance(goal, dict):
        return False   # goal을 잘못 넘기면 실패 → run_loop 재시도 → emit_replan
```

### stuck(정체) 판정 정책

| 파라미터 | 의미 |
| --- | --- |
| `progress_grace_sec` | 출발 직후 stuck 판정을 **유예**하는 시간 |
| `hard_stuck_timeout_sec` | 진행이 없으면 goal 실패로 보는 **최대 대기 시간** |
| `progress_epsilon_m` | 진행으로 인정할 **최소 거리 감소량(Δdistance)** |

판정에 사용하는 추적 변수:

- `accept_t` : Nav2 goal이 수락된 시각
- `last_prog` : 마지막으로 "유의미한 진행"이 감지된 시각
- `best_dist` : 지금까지 관찰한 `distance_remaining` 중 가장 작은 값

→ 이 세 값을 계속 갱신하며 현재 로봇의 움직임 상태를 판단합니다.

```python
# 1초마다 TF 현재 pose(x,y,yaw)와 Nav2 남은 거리 로그 출력
if now - last_print > 1.0:
    # TF 조회 성공: pose(map)=(...), dist_remain=...
    # TF 조회 실패: pose=Unknown(TF fail)

# 진행 감지: 남은 거리가 best_dist보다 eps 이상 줄면 진행으로 인정
if dist < (best_dist - eps_m):
    best_dist = dist
    last_prog = now

# stuck 판정: 유예시간 지났고, 마지막 진행 후 hard_stuck 초과
if (now - accept_t) > grace_sec and (now - last_prog) > hard_stuck:
    navigator.cancel()   # Nav2 goal 즉시 취소
    return False         # step 실패 처리 → retry 또는 replan 결정

# Nav2 최종 결과 판정 (status == 4 → SUCCEEDED)
ok = bool(status == 4)
```

!!! success "exec_move_to 요약"
    Nav2 서버 준비 여부, 이동 진행 여부, Nav2 최종 결과를 **종합**해 이동 성공 여부를 반환하는 동기 액션 함수입니다. 성공 여부에 따라 다음 step / retry / replan을 판단하며, **이동 로직을 바꿔도 플랜 실행 구조는 그대로 재사용**할 수 있습니다.

### `move_to` 테스트 및 검증

![move_to 테스트 플랜 구조와 기대 흐름](img/w12/s30.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 30 (출처: ENGI UNIVERSE)
///

**ROS 2 명령 구조**

- 토픽: `/system2/plan_cmd`
- 메시지 타입: `ats_msgs/msg/PlanCommand`
- 필드: `plan_json` 안에 플랜 JSON이 **문자열**로 들어감

```json
{
  "version": "1.0.0",
  "mission_id": "test_move_001",
  "intent": "move_to 기능 검증용 플랜",
  "steps": [
    {
      "task": "move_to",
      "params": {
        "goal": { "x": 2.5, "y": 1.0, "yaw": 0.0 }
      }
    }
  ],
  "replan_rules": {
    "hard_stuck_timeout_sec": 15.0,
    "progress_grace_sec": 4.0,
    "progress_epsilon_m": 0.05
  }
}
```

- `mission_id: "test_move_001"` → `move_to` 단독 테스트임을 표시
- `goal = {x: 2.5, y: 1.0, yaw: 0.0}` → "현재 위치와 무관하게 map 좌표 (2.5, 1.0)까지 이동하고 yaw를 0 rad(정면)으로 맞춰라"

**replan_rules의 stuck 판정 기준**

| 파라미터 | 값 | 의미 |
| --- | --- | --- |
| `hard_stuck_timeout_sec` | 15.0 | 마지막 진행 후 15초 동안 남은 거리가 안 줄면 정체로 실패 |
| `progress_grace_sec` | 4.0 | goal accept 후 첫 4초는 stuck 체크 안 함(출발 유예) |
| `progress_epsilon_m` | 0.05 | 남은 거리가 5cm 이상 줄 때만 진행으로 인정(노이즈 무시) |

**기대 흐름**

=== "A 상황 (정상)"

    1. 플랜 파싱·스키마 검증 통과
    2. `_run_loop`에서 `task=move_to` 실행
    3. `navigate_to_pose` 액션 서버 연결 시도
    4. `[Nav2Navigator] send goal: x=2.500, y=1.000, yaw=0.000`
    5. 주기적으로 `[move_to] pose(map)=(...), dist_remain=...` 로그
    6. `distance_remaining` 지속 감소 → `[move_to] Nav2 SUCCEEDED`
    7. `exec_move_to → True`, `queue_status: running → done`
    8. `/ats_state` echo: `mission_id=test_move_001`, `state_string: "move_to" → "done"`

=== "B 상황 (실패/stuck)"

    1. 남은 거리값이 grace 4초 이후 15초 이상 거의 안 줄면
    2. `[move_to] 진행 정체 감지 → Nav2 goal cancel & 실패 반환`
       또는 Nav2가 직접 `FAILED` 반환 → `[move_to] Nav2 FAILED, status=...`
    3. `exec_move_to → False`, Executor는 step을 실패로 기록
    4. retry 남아 있으면 재시도, 없으면 `emit_replan`으로 System-2에 재계획 요청

!!! tip "실제 명령 실행"
    rviz2에서 목표 지점까지 path 경로가 생성되고, 실제로 해당 위치까지 Spot이 도착하는 것을 확인합니다.

---

## 🔭 `scan` 설계 — ATS 회전 탐색 액션

`scan`은 **로봇 위치는 그대로 두고 ATS 카메라만 회전시키면서 주변을 탐지**하는 액션입니다. 실제 임무는 보통 **"지점까지 이동(`move_to`) → 그 자리에서 주변 스캔(`scan`)"** 패턴으로 이어집니다.

![scan의 ALIGN / SWEEP / FOUND 3단계](img/w12/s33.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 33 (출처: ENGI UNIVERSE)
///

### 동작 3단계

| 단계 | 동작 |
| --- | --- |
| **1. ALIGN** | 카메라를 기준 정면으로 먼저 정렬 |
| **2. SWEEP** | 설정된 좌/우 각도 범위로 왕복 회전하며 주변 탐색 |
| **3. FOUND** | 비전 결과를 보고 타깃 발견 시 해당 정보를 보고/전달 |

!!! note "설계 포인트"
    실제 로봇에서는 회전 중 노이즈·진동이 큽니다. 그래서 ALIGN / SWEEP / FOUND **각 단계를 별도 함수로 나누어** 안정적으로 관리합니다.

### ALIGN — 정면 정렬 (PID 제어)

`def lookup_yaw_rel()` : 지금 카메라가 어느 방향을 보고 있는지 확인하는 함수로, **Spot 몸체(body) 기준 카메라 yaw**를 계산합니다.

- `tf_buffer.lookup_transform()` : TF 버퍼에서 `body → cam` 변환 로드
- `_quat_to_rotmat` : 3×3 회전행렬 R 생성
- `_axis_vec()` : `camera_forward_axis` 축 선택 및 벡터 변환
- `vx, vy` : `R * forward` 연산으로 몸체 기준 forward 방향 벡터 계산
- `-math.atan2(vy, vx)` : X·Y 성분만으로 yaw 각도 계산 (부호는 ATS 실제 회전 방향과 ROS 좌표계를 맞추기 위한 보정)
- 실패 시 `return False, 0.0` → 경고 메시지 출력 후 제어 정지·루프 재시도

![ALIGN 단계의 PID 제어 흐름](img/w12/s35.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 35 (출처: ENGI UNIVERSE)
///

```python
while rclpy.ok():
    yaw_rel = _lookup_yaw_rel()      # 현재 카메라 각도
    err = -yaw_rel                   # 정면을 0°로 두고 오차 정의
    if abs(err) <= deadband:
        # 아주 작은 오차는 무시 → 미세 진동/헛움직임 억제
        ...
    # i_term: deadband 근처에서만 적분 누적, 그 외엔 _clamp(±align_i_cap)로 wind-up 방지
    # d_term: (err - prev_err)/dt 에 1차 LPF(d_lpf) 적용 → 노이즈 완화
    # yaw_rate_cmd: slew-rate 제한 + 최대 회전 속도 제한 후 짐벌 명령으로 전달
```

→ 0° 근처를 스쳐 지나가는 것이 아니라, **정면을 안정적으로 유지할 때만 SWEEP 단계로 넘어가도록** 설계합니다.

### SWEEP — 좌우 왕복 + 상하 지그재그

![SWEEP 단계의 좌우·상하 지그재그 스캔](img/w12/s38.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 38 (출처: ENGI UNIVERSE)
///

- `half_span` : 전체 스윕 범위의 절반 (예: ±60° → `half_span=60°`)
- `if abs((-half_span) - yaw_rel) <= eps_edge` : 끝점 전환 조건 — 왼쪽 끝 도달 시 오른쪽으로, 오른쪽 끝 도달 시 다시 왼쪽으로 → **좌우 왕복 스윕 자동 형성**
- `yaw_rate_cmd` : **PID가 아닌 단순 P 제어**만 사용 (정밀 정렬이 아니라 넓은 영역 탐색이므로 간단한 제어로 충분)
- `pitch_dir` : 스윕 방향이 바뀔 때마다 `+1 / -1` 반전
    - 좌 → 우 스윕: 카메라 위쪽으로 천천히 이동
    - 우 → 좌 스윕: 카메라 아래쪽으로 천천히 이동
    - 결과: **좌우 + 상하 지그재그 스캔 → 위/아래 사각지대를 크게 감소**

**SWEEP 중 비전 조회**

```python
objs = vision.snapshot()          # 매 틱마다 class, id, center, bbox 조회
cls_set = {c.lower() for c in watch_classes}   # 예: ["person"]
id_set  = {str(i) for i in watch_ids}          # 예: ["17"]
for o in objs:
    # class가 cls_set에 있거나 id가 id_set에 있으면 목표로 간주
    if o.cls in cls_set or o.id in id_set:
        handle_found(o)           # 목표 감지 시 호출
        stop_all()                # 짐벌·이동 명령 정지
        return True               # 스캔 종료
```

### FOUND — 발견 이벤트 발행

![FOUND 메시지와 느슨한 결합 구조](img/w12/s40.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 40 (출처: ENGI UNIVERSE)
///

목표 감지 시 FOUND 메시지를 구성해 `/scan_report` 토픽에 **JSON으로 직렬화하여 퍼블리시**합니다.

```python
msg = {
    "event": "FOUND",                 # 고정
    "class": o.cls, "id": o.id,       # 발견 객체의 핵심 정보
    "center": o.center, "bbox": o.bbox,
    "time": time.time()               # 탐지 시각
}
```

!!! note "상위 시스템과 분리된 구조"
    `scan` 액션은 System-2를 직접 호출하지 않고 `/scan_report` 토픽에 **FOUND 이벤트만** 발행합니다. scan 노드는 "탐색 + FOUND 발행"에만 집중하고, 실제 행동(추종·보고·무시)은 상위 로직이 자유롭게 결정합니다. → scan을 **독립 모듈**로 유지하면서 재사용·확장이 쉬운 구조.

**발견 직후 자동 보고 (`report_on_found`)**

| 값 | 동작 |
| --- | --- |
| `True` | FOUND 직후 `_do_report()`까지 자동 실행 |
| `False` | FOUND 이벤트만 보내고 이후는 System-2/다른 노드가 처리 |

- `hasattr(node, "_do_report")` : node가 `_do_report()`를 가질 때만 호출 → scan 코드는 구현을 전혀 모르는 **느슨한 결합**
- `delay_sec` : 즉시 보고 대신 0.2초 정도 안정화 시간을 주라는 힌트 (탐색 → 발견 → 안정화 → 보고 흐름을 자연스럽게)

### `scan` 테스트 및 검증

![scan 테스트 플랜의 params 구조](img/w12/s44.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 44 (출처: ENGI UNIVERSE)
///

System-2를 생략하고 `/system2/plan_cmd`에 `PlanCommand`를 **한 번만 pub**해서 System-1 Executor를 직접 구동합니다. `plan_json`의 `task: "scan"`이면 `_run_loop()`가 `exec_scan()`을 호출합니다.

**`params` 주요 필드**

| 파라미터 | 의미 |
| --- | --- |
| `sweep_deg` | 좌우 스윕 각도 (예: ±60° → 120°), 스캔 범위 −60°~+60° 왕복 |
| `yaw_rate_dps` | yaw 회전 속도(deg/sec) — ALIGN 상한 / SWEEP 최대 yaw rate |
| `pitch_deg_up / down` | 스윕 시 위/아래 피치 범위 |
| `duration_sec` | 최대 스캔 시간 (과도한 스캔 방지, 다음 액션 시간 확보) |
| `watch_classes` | 감시할 객체 클래스 (예: `"person"`) → 발견 시 즉시 FOUND |
| `report_on_found` | 발견 시 report 액션까지 연계 여부 |

**scan 플랜 실행 흐름 (Executor 내부)**

**Step 1 — 플랜 수신 & 준비**: `/system2/plan_cmd` 수신 → `on_plan_cmd()` JSON 파싱 → `HIGH_LEVEL_PLAN_SCHEMA` 검증 → `current_plan` 저장 → `current_index=0`, `queue_status="running"` → 별도 스레드에서 `_run_loop()` 시작

**Step 2 — exec_scan 진입**: `task == "scan"` 분기 → `params`를 그대로 `exec_scan()` 인자로 전달 → 내부에서 ALIGN → SWEEP → FOUND를 한 번에 수행

**Step 3 — FOUND 처리**: 조건 만족 시 `handle_found()` → `/scan_report` 발행 → (`report_on_found=true`면) `_do_report()` 자동 호출 → 스윕 중단, `True` 반환 → `current_index++`. 미발견 시 `duration_sec` 초과되면 로그 출력 후 `True` 반환.

!!! success "scan 테스트 체크리스트"
    1. `[scan] exec_scan ENTERED` → 함수 진입 확인
    2. `[scan/ALIGN]...` → ALIGN PID 제어 정상 동작
    3. `[scan] ALIGN done (yaw≈0°)` → ALIGN 종료 확인
    4. `[scan/SWEEP]...` → 스윕 왕복 및 yaw 제어 확인
    5. `[scan] vision objects=...` → Vision 입력 정상 수신 여부
    6. `[scan] report_on_found...` → 발견 동작 확인

---

## 🧩 Wrap-up

![오늘 강의 정리](img/w12/s47.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 1 — 슬라이드 47 (출처: ENGI UNIVERSE)
///

- **System-1 Executor 코드·동작 흐름 정리** — 플랜을 한 줄씩 실행하며 TF 추적·vision 캐시·guard 판단을 수행
- **단위 액션 설계** — `move_to`(Nav2 이동), `scan`(ATS 회전 탐색)의 입력 파라미터·성공/실패 판정 기준
- **실전 테스트** — `/system2/plan_cmd` 토픽에 PlanCommand를 직접 발행해 단위 액션 단독 검증
- **Nav2·스레드·Vision/TF 연동 구조 이해** — 래퍼·폴링·콜백 딕셔너리·느슨한 결합으로 안정적이고 재사용 가능한 실행 계층 구성

## ✅ 체크포인트

- [ ] System-1 Executor가 매 스텝에서 TF 추적·vision 캐시·guard 판단을 하는 이유를 설명할 수 있는가
- [ ] `move_to`에서 yaw를 쿼터니언으로 변환하는 이유(짐벌락)와 stuck 판정 3대 파라미터를 설명할 수 있는가
- [ ] `Nav2Navigator` 래퍼가 서비스가 아닌 액션을 쓰는 이유를 설명할 수 있는가
- [ ] `scan`의 ALIGN/SWEEP/FOUND 3단계와 각 단계의 제어 방식(PID vs P)을 구분할 수 있는가
- [ ] `/system2/plan_cmd` 토픽으로 단위 액션을 단독 테스트하는 방법을 설명할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| Executor·단위 액션 개념 이해 | 20 | System-1/2 역할 분리와 단위 액션 5종의 의미를 정확히 설명 |
| `move_to` 설계 이해 | 30 | Nav2Navigator 래퍼·쿼터니언 변환·stuck 판정 기준을 설명·재현 |
| `scan` 설계 이해 | 30 | ALIGN/SWEEP/FOUND 단계와 vision 연동·느슨한 결합 구조를 설명 |
| 단위 액션 테스트 | 20 | PlanCommand 플랜 작성과 기대 로그·성공/실패 흐름을 설명 |
| 합계 | 100 | |

## 🔗 출처 및 참고자료

- 교안 **「System-1 단위 액션 설계 part 1」** (제작: ENGI UNIVERSE) — 강의 슬라이드 원본
- Nav2 (Navigation2) — <https://docs.nav2.org>
- ROS 2 Actions 개념 — <https://docs.ros.org/en/jazzy/Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Actions/Understanding-ROS2-Actions.html>
- ROS 2 tf2 (좌표 변환) — <https://docs.ros.org/en/jazzy/Concepts/Intermediate/About-Tf2.html>

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (48매)"
    ![슬라이드 01](img/w12/s01.jpg){ width="700" }
    ![슬라이드 02](img/w12/s02.jpg){ width="700" }
    ![슬라이드 03](img/w12/s03.jpg){ width="700" }
    ![슬라이드 04](img/w12/s04.jpg){ width="700" }
    ![슬라이드 05](img/w12/s05.jpg){ width="700" }
    ![슬라이드 06](img/w12/s06.jpg){ width="700" }
    ![슬라이드 07](img/w12/s07.jpg){ width="700" }
    ![슬라이드 08](img/w12/s08.jpg){ width="700" }
    ![슬라이드 09](img/w12/s09.jpg){ width="700" }
    ![슬라이드 10](img/w12/s10.jpg){ width="700" }
    ![슬라이드 11](img/w12/s11.jpg){ width="700" }
    ![슬라이드 12](img/w12/s12.jpg){ width="700" }
    ![슬라이드 13](img/w12/s13.jpg){ width="700" }
    ![슬라이드 14](img/w12/s14.jpg){ width="700" }
    ![슬라이드 15](img/w12/s15.jpg){ width="700" }
    ![슬라이드 16](img/w12/s16.jpg){ width="700" }
    ![슬라이드 17](img/w12/s17.jpg){ width="700" }
    ![슬라이드 18](img/w12/s18.jpg){ width="700" }
    ![슬라이드 19](img/w12/s19.jpg){ width="700" }
    ![슬라이드 20](img/w12/s20.jpg){ width="700" }
    ![슬라이드 21](img/w12/s21.jpg){ width="700" }
    ![슬라이드 22](img/w12/s22.jpg){ width="700" }
    ![슬라이드 23](img/w12/s23.jpg){ width="700" }
    ![슬라이드 24](img/w12/s24.jpg){ width="700" }
    ![슬라이드 25](img/w12/s25.jpg){ width="700" }
    ![슬라이드 26](img/w12/s26.jpg){ width="700" }
    ![슬라이드 27](img/w12/s27.jpg){ width="700" }
    ![슬라이드 28](img/w12/s28.jpg){ width="700" }
    ![슬라이드 29](img/w12/s29.jpg){ width="700" }
    ![슬라이드 30](img/w12/s30.jpg){ width="700" }
    ![슬라이드 31](img/w12/s31.jpg){ width="700" }
    ![슬라이드 32](img/w12/s32.jpg){ width="700" }
    ![슬라이드 33](img/w12/s33.jpg){ width="700" }
    ![슬라이드 34](img/w12/s34.jpg){ width="700" }
    ![슬라이드 35](img/w12/s35.jpg){ width="700" }
    ![슬라이드 36](img/w12/s36.jpg){ width="700" }
    ![슬라이드 37](img/w12/s37.jpg){ width="700" }
    ![슬라이드 38](img/w12/s38.jpg){ width="700" }
    ![슬라이드 39](img/w12/s39.jpg){ width="700" }
    ![슬라이드 40](img/w12/s40.jpg){ width="700" }
    ![슬라이드 41](img/w12/s41.jpg){ width="700" }
    ![슬라이드 42](img/w12/s42.jpg){ width="700" }
    ![슬라이드 43](img/w12/s43.jpg){ width="700" }
    ![슬라이드 44](img/w12/s44.jpg){ width="700" }
    ![슬라이드 45](img/w12/s45.jpg){ width="700" }
    ![슬라이드 46](img/w12/s46.jpg){ width="700" }
    ![슬라이드 47](img/w12/s47.jpg){ width="700" }
    ![슬라이드 48](img/w12/s48.jpg){ width="700" }
