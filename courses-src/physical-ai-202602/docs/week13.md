# 13주차 — System-1 단위 액션 설계 part 2

!!! abstract "학습목표"
    지난 강의에서 정의한 5종의 **단위 액션(Unit Action)** 중, 가장 복잡한 **`track`** 을 중심으로 System-1 Executor의 설계를 완성한다. `track` 이 단순 시야 추적이 아니라 **짐벌(yaw/pitch) + 바디(yaw) + 거리(vx)** 를 동시에 다루는 **3축 통합 제어**임을 이해하고, `report_and_wait`(보고·대기)와 `return_to_home`(귀환) 액션의 구조와 테스트 방법까지 정리한다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「System-1 단위 액션 설계 part 2」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드 표현은 교안의 설명을 충실히 따른 **재구성 예제**입니다(원본 소스 비공개).

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro(단위 액션 5종 복습) + `track` 3축 통합 제어 설계 | §01 Intro · §02 track 설계 |
| 2교시 | 50분 | `track` 내부 구조(DepthBuffer·`_control_step`·`_thread_main`) + 테스트 | §02 track 설계/검증 |
| 3교시 | 50분 | `report_and_wait` · `return_to_home` 설계·테스트 + Wrap-up | §02 report_and_wait·return_to_home · §03 |

---

## 🧭 1. Intro — 단위 액션 5종 복습

지난 강의에서 System-1의 행동을 **더 이상 쪼개기 어려운 최소 행동 단위(단위 액션)** 로 설계했습니다. System-2는 이 블록들을 조합해 플랜을 만들고, **Executor는 이를 예측 가능한 방식으로 실행**합니다.

| 단위 액션 | 역할 |
| --- | --- |
| `move_to` | 지도 상 특정 좌표/포즈로 이동 |
| `scan` | 제자리에서 ATS를 회전시키며 주변 탐색 |
| `track` | 카메라 기준으로 대상을 화면 중심·일정 거리 안에 유지 |
| `report / wait_for_command` | 현재 상황을 System-2에 보고 + 새 플랜/명령 대기 |
| `return_to_home` | 사전 정의된 home position으로 복귀 |

![단위 액션 5종 개요](img/w13/s03.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 03 (출처: ENGI UNIVERSE)
///

!!! note "이번 part 2의 초점"
    part 1이 `move_to`·`scan` 중심이었다면, part 2는 **가장 복잡한 `track`** 과 시나리오 마무리용 액션 `report_and_wait`·`return_to_home` 를 다룹니다.

---

## 🎯 2. `track` 설계 — 3축 통합 제어

`track` 은 **타깃을 화면 중앙에 두고 적정 거리를 유지하며 따라가는 추종 액션**입니다. 핵심은 단순 시야 추적(Tracker)이 아니라 **짐벌 + 바디 + 거리** 를 동시에 다루는 **3축 통합 제어**라는 점입니다.

| 축 | 입력 | 제어 대상 | 동작 요약 |
| --- | --- | --- | --- |
| ① 짐벌 (yaw/pitch) | 픽셀 오차 | ATS 짐벌 각속도 | 타깃이 **화면 한가운데** 오도록 (빠른 응답, 고주파 오차) |
| ② 바디 yaw (wz) | `base_link → camera` TF | Spot 몸체 회전 | 카메라 정면과 몸 정면을 **정렬** (느린 응답, 저주파 정렬) |
| ③ 거리 (vx) | Depth + 타깃 bbox | 전/후진 선속도 | 타깃과 **목표 거리(follow_dist)** 유지 |

- **짐벌(yaw/pitch)**: 타깃이 좌측으로 치우치면 → yaw를 좌(−)로, 화면 아래에 있으면 → pitch를 위(+)로.
- **바디 yaw**: 카메라 방향과 몸체 yaw 차이를 계산, 오차가 크면 `wz` 로 천천히 몸을 회전. 짐벌과 Spot이 **동시에** 회전한다.
- **거리(vx)**: 너무 멀면 `+vx`, 너무 가까우면 `−vx`. **각도 오차가 크면 안전을 위해 `vx = 0`**.

![track의 3축 통합 제어 — 짐벌·바디·거리](img/w13/s06.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 06 (출처: ENGI UNIVERSE)
///

!!! tip "역할 분담의 핵심"
    System-1은 **"트래킹 제어의 성공 여부"만 판단**하고, 세부 제어는 Tracker 내부에서 처리합니다. Tracker는 주기적으로 `_control_step()` 을 반복 실행하며 매 틱마다 **바디·짐벌·속도 명령**을 생성합니다.

### 2.1 DepthBuffer — bbox에서 실제 거리 뽑아내기

"화면 중앙"만으로는 부족합니다. **사람(타깃)과 로봇 사이의 실제 거리**를 알아야 `vx`(전진/후퇴) 제어가 가능합니다. `DepthBuffer` 는 `/depth` 이미지를 캐시하고 bbox ROI의 대표 거리값 `range_m` 을 계산해 Tracker에 제공합니다.

**DepthBuffer 내부 파이프라인**

**Step 1 — depth 표현 통일**: 센서별로 다른 depth 형식을 두 가지로 통일해 코드 복잡화·오류를 방지.

- `32FC1` 형태의 float(meter) 값
- `16UC1` 형태의 uint16(mm) 값

**Step 2 — 해상도 정렬**: vision 해상도(`vision_fw, vision_fh`)와 depth 해상도(`depth_fw, depth_fh`)를 비교하고, vision의 bbox를 depth 좌표계로 **리스케일** → 두 영상이 동일 공간 ROI를 바라보도록 정렬.

**Step 3 — ROI 클리닝 & 크롭**: depth 계산에 치명적인 값을 제거.

- 센서 사용 범위를 벗어난 비정상 값
- `NaN`, `inf` 등 계산 불가능한 값
- `depth_valid_min` 이하 / `depth_valid_max` 이상의 값

**Step 4 — 대표 거리값 선택**: 남은 값의 **중앙값 혹은 백분위수(percentile)** 를 사용해 튐 값에 강한 안정적인 `range_m` 산출.

![DepthBuffer — bbox ROI에서 안정적인 range_m 추출](img/w13/s13.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 13 (출처: ENGI UNIVERSE)
///

산출된 `range_m` 은 ① `follow_dist` 와 비교해 전진/후퇴 판단, ② `vx` 계산의 기준값, ③ **yaw가 정렬된 상태에서만 거리 제어를 시작**하는 조건 판단에 쓰입니다.

### 2.2 Tracker 인터페이스

=== "start(params, rules)"

    - "이 타깃을 이런 조건으로 추적해라" 파라미터 전달 → 내부 제어 스레드가 켜지며 짐벌·바디 yaw·거리 동작 시작.
    - **이미 추적 중이면** 새 스레드를 만들지 않고 **파라미터만 갱신** → 상황 변화에 부드럽게 대응.

=== "wait_initial_success(timeout)"

    아래 조건이 일정 시간 만족되면 `True` 반환(초기 lock 완료):

    - 타깃이 화면 중앙 근처에 들어왔는가?
    - 바디 yaw 정렬 오차가 기준 이하인가?
    - 거리가 너무 가깝거나 멀지 않은가?

=== "stop(flush=True)"

    ATS 짐벌/바디에 **0 속도 명령을 여러 번 전송** → 잔여 명령 없이 "멈춘 뒤 안정화"까지 포함된 정지.

=== "status()"

    정렬 오차, 최근 depth/range, 현재 속도 명령 등 **내부 스냅샷** 조회.

### 2.3 `_control_step()` — track의 제어 루프

매 틱마다 **비전 정보 읽기 → 타깃 선택 → 오차 계산 → 짐벌 회전 → 바디 정렬 → 거리 유지** 순서로 동작합니다.

![_control_step의 제어 흐름](img/w13/s20.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 20 (출처: ENGI UNIVERSE)
///

**① 비전 정보 읽기 / 타깃 선택**

- `vision.snapshot()` 으로 같은 시점의 객체 목록(`objects`, 각 객체의 bbox·center·id·class, `frame_w/h`)을 정리.
- 화면 중심 기준점 계산: `cx, cy = frame_w/2, frame_h/2`.
- `_choose_target()` : `primary_id` 가 있고 현재 프레임에 보이면 **무조건 그 ID**, 없으면 **bbox 면적이 가장 큰 객체** 선택.
- `_update_lock` (**sticky lock**): 같은 ID가 계속 보이면 유지, 사라지면 lock 해제 + zero command, ID가 바뀌면 로그 출력 + **PID I항 초기화(anti-windup)** 로 부드럽게 전환(이전 타깃의 누적 오차로 인한 오버슛 방지).

**② 오차 계산 (Gimbal PID)**

- 타깃 중심 = `x + w/2`, `y + h/2` (없으면 `center["x"], center["y"]`).
- 픽셀 오차: `err_px_x, err_px_y = 타깃 중심 − 화면 중앙`. `abs()` 값에 **데드밴드**를 적용해 손떨림·센서 지터 수준의 미세 흔들림 억제.
- yaw/pitch 각각 **P·D·I** 항으로 제어:
    - `derr`(미분 D항)에 `_yaw_d_lpf`(저역통과 필터)를 적용해 sudden jump·미세 진동의 과잉반응 억제.
    - `if k_yaw_i > 0.0 and allow_i` : 오차가 작아진 구간에서만 적분을 허용해 **windup 방지**.
    - 각 항을 합쳐 `yaw_rate_cmd` 생성.
- **Slew 제한**: `yaw_step` 으로 급변 명령에 `clamp`(slew 제한), `yaw_rate_sat` 으로 짐벌 제한 속도 초과 방지 → `tw_ats.angular.z / .y` 로 ATS에 Twist 발행.

![Gimbal PID + LPF + Slew 제한](img/w13/s27.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 27 (출처: ENGI UNIVERSE)
///

**③ 바디 정렬 (wz)**

짐벌만 돌리면 카메라는 타깃을 보지만 Spot은 엉뚱한 방향을 본 자세가 유지되어 이동·장애물 회피·거리 유지가 불안정해집니다. → **"카메라가 보는 방향 = Spot 몸 방향"** 이 되도록 바디 yaw도 정렬.

- `lookup_yaw_rel()` : TF 기반으로 카메라–몸체 yaw 관계 계산. **TF 조회 실패(`ok_tf`) 시 억지 회전 금지** → `vx, wz` 에 0을 한 번 보내고 안전하게 틱 종료.
- `yaw_rel` : 음수=왼쪽 / 양수=오른쪽. `dyaw_dt`(변화율)에 `_dyaw_lpf` 를 적용해 타깃 흔들림·depth jitter로 인한 튐을 억제.
- **이중 데드밴드**:

| 파라미터 | 값 | 의미 |
| --- | --- | --- |
| `yaw_deadband_enter_deg` | 4.0° | 이하 → "충분히 정렬됨" → `wz = 0`(회전 정지) |
| `yaw_deadband_exit_deg` | 6.5° | 4°~6.5° → "거의 정렬" → 최소 보정 / 초과 → P·D 기반 적극 보정 |

→ 거의 정렬된 상태에서 불필요한 흔들림은 막고, 크게 틀어지면 확실하게 회전해서 맞춥니다.

**④ 거리 유지 (vx)**

- `self.depth.roi_mean_depth()` → `range_m` 계산(RGB bbox → depth 좌표 스케일링 → 비정상 값 제거 → 중앙부 crop + percentile). `range_m = None` 이면 **캐싱된 이전 유효값**을 재사용해 부드럽게 연결.
- **이동 조건**: `if (range_m is not None) and (yaw_err_deg <= move_when_yaw_deg)` → 몸이 충분히 타깃 방향을 볼 때만 전진/후퇴 허용.
- `dist_err = range_m − follow_dist` : `>0` 멀다(`+vx`), `<0` 가깝다(`−vx`).
- `vx` 는 `dist_err` 에 비례, 상·하한은 `vx_cap` 으로 제한, `vx_min_abs` 이하의 자잘한 움직임은 0 처리.
- `cmd_pub.publish(tw)` 로 `vx + wz` 를 Spot에 전송.

```python
# _control_step() 거리 제어 핵심 (교안 설명 기반 재구성)
range_m = self.depth.roi_mean_depth(bbox)          # DepthBuffer에서 대표 거리
if (range_m is not None) and (yaw_err_deg <= move_when_yaw_deg):
    dist_err = range_m - follow_dist               # +면 멀다 / -면 가깝다
    vx = clamp(k_dist * dist_err, -vx_cap, vx_cap) # 비례 + 상하한 제한
    if abs(vx) < vx_min_abs:                        # 자잘한 움직임은 0
        vx = 0.0
else:
    vx = 0.0                                        # 각도 오차 크면 안전상 정지
```

`_control_step()` 은 매 틱마다 `aligned, moving, yaw_err, wz, vx, range_m, dist_err` 를 반환하고, 상위 루프가 이를 이용해 초기 성공 판정·추적 유지·타임아웃을 판단합니다.

### 2.4 `_thread_main()` — 성공 판정 감독 루프

yaw 오차와 거리 오차가 **일정 시간 동안 연속으로** 만족되는지 판단해, 순간적으로 조건을 스쳐 지나가는 것을 성공으로 오인하지 않도록 합니다.

| 변수 | 의미 |
| --- | --- |
| `in_yaw` | yaw 오차가 `success_yaw_deg` 이내인가 |
| `in_dist` | `range_m` 이 `follow_dist ± dist_tol_m` 이내인가 |
| `yaw_hold` / `dist_hold` | 각 조건 유지 시간 |
| `both_hold` | 두 조건이 **동시에** 유지된 시간 |

- `both_hold >= success_hold_sec` → **초기 정렬 성공(Initial Success)** 판정 → `wait_initial_success()` 에서 대기하던 스레드 해제.
- Initial Success 이후에도 `_thread_main()` 은 계속 동작하며 타깃이 움직여도 `_control_step()` 을 반복 호출해 추적을 유지. `stop()` 호출 시 스레드 종료.

!!! success "track 요약 — 3축 통합 제어"
    - **짐벌**: 픽셀 오차 → PID + LPF + slew → `tw_ats` 로 ATS 전송
    - **바디 yaw**: `yaw_rel()` 로 카메라–몸체 관계 추정 → `wz` 제어
    - **거리**: `roi_mean_depth()` → `range_m` → `follow_dist` 비교 → `vx`
    - **신뢰도**: `_thread_main()` 이 성공 조건 **유지 시간**을 보고 보고 시점을 판단

### 2.5 track 테스트 및 검증

System-2 대신 `/system2/plan_cmd` 에 `PlanCommand` 를 한 번 발행하고, `plan_json` 안에 `track` 단일 스텝 플랜을 JSON으로 넣어 전달합니다.

```json
{
  "mission_id": "demo-002",
  "intent": "person",
  "steps": [{
    "task": "track",
    "params": {
      "class": "person", "id": "71",
      "follow_dist": 4.0,
      "tol": 1.0,
      "dwell_sec": 0.8,
      "max_time": 30.0
    }
  }]
}
```

| 파라미터 | 의미 |
| --- | --- |
| `class="person", id="71"` | vision-tracker의 target 선택 기준 |
| `follow_dist = 4.0` | 유지하고 싶은 거리(m), `range_m` 와 비교해 `vx` 결정 |
| `tol = 1.0` | 거리 허용 오차(예: 4±1m면 거리 OK) |
| `dwell_sec = 0.8` | yaw+거리 조건 0.8초 이상 연속 유지 시 **Initial Success** |
| `max_time = 30.0` | 최대 30초 동작, 초과 시 **TIMEOUT** |

**Executor 내부 흐름**

**Step 1 —** `/system2/plan_cmd` 수신 → `plan_json` 파싱 + 스키마 검증 → `current_plan` 저장.
**Step 2 —** `run_loop()` 스레드 시작, 첫 스텝 `task == "track"`.
**Step 3 —** `tracker.start(params, replan_rules)` 로 백그라운드 추적 스레드 시작.
**Step 4 —** `wait_initial_success(timeout=...)` 로 초기 정렬 성공 이벤트 대기.
**Step 5 —** ATS 짐벌이 타깃 추적 + 픽셀 오차 보정, Spot이 카메라 각도에 맞춰 정렬 + 거리 조절 + 로그 출력.

!!! note "튜닝"
    실제 동작에서 발생하는 파라미터 오차는 `track` **튜닝**으로 극복합니다.

---

## 📡 3. `report_and_wait` 설계

`report_and_wait` 는 `report`(상황 보고)와 `wait_for_command`(다음 명령 대기)를 합친 단위 액션입니다. 정보를 **로그 + 상태 토픽(`/ats_state`)** 으로 뿌리고 동일 내용을 **JSON으로 System-2에 전달**한 뒤, 의사 결정(새 플랜, 미션 종료 등)이 내려질 때까지 정지합니다.

![report_and_wait — 보고와 대기의 결합](img/w13/s38.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 38 (출처: ENGI UNIVERSE)
///

### 3.1 report — 상황 요약

- `_summarize_context()` : 사람이 읽기 쉬운 **한 줄 요약** 생성. 입력은 `mission_id`, `pose`(x, y, yaw, ok), `vision_snapshot`(primary_id, targets).
- `targets[0]` 을 대표 타깃으로 써 class·`range_m` 을 얻고 문장화.
    - 예) `"3개 타겟 감지, 주요 타겟: id=35, person (거리 약 4.2m)"` / `"감지된 타겟 없음"`
- `pose_ok`(TF 성공 여부)에 따라 다른 로그 → 운용자가 "어디서, 어떤 미션으로, 무엇을 보는지" 한눈에 파악.

### 3.2 exec_report_and_wait — 엔트리 포인트

4가지 동작을 수행합니다.

**Step 1 —** 현재 pose + vision 상황을 로그로 출력.
**Step 2 —** `ats_state` 를 최신 상태로 퍼블리시(`publish_state()`, `hasattr` 로 방어적 호출).
**Step 3 —** 같은 컨텍스트(pose·vision·state_string)를 JSON으로 System-2에 전달(`/system2/report_context`).
**Step 4 —** 다음 명령(decision)을 수락 대기.

!!! note "방어적 설계 포인트"
    - `pub_report_context` 가 **없으면** System-2 미연동으로 간주 → 경고 로그 + `fallback_delay_sec` 만큼 대기 후 `True` 반환(플랜을 실패로 만들지 않고 흐름 유지).
    - `ensure_ascii=False` → 한글/유니코드 지원.
    - `decision_holder` : 콜백 밖에서 값을 공유. `mid != mission_id` 면 무시, 이미 값이 있으면 이후 메시지 무시(병렬/큐잉 대비).

### 3.3 결정 대기와 반환

- `create_subscription` 으로 구독자 생성, `wait_timeout_sec`(기본 **600초**) 동안 0.1초 간격으로 `decision_holder["value"]` 를 폴링.
- TIMEOUT 시 경고 로그 + decision 없음 → `"continue"` 로 간주, `destroy_subscription(sub)` 로 초기화.
- **항상 `return True`** : `report_and_wait` 는 "현재 플랜의 한 스텝" 역할만 하고, 실제 시나리오 제어는 상위 로직(System-2 + Executor)이 결정.

| decision 값 | 의미 |
| --- | --- |
| `"continue"` | 아무 것도 못 받거나 TIMEOUT일 때 |
| `"new_plan"` | System-2가 이미 `/high_level_plan` 을 publish 했다고 가정 |
| `"end"` | 이후 플랜 종료/정리 정책은 Executor 상위 레벨에서 결정 |

![report_and_wait 결정 대기 흐름](img/w13/s50.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 50 (출처: ENGI UNIVERSE)
///

### 3.4 테스트 — scan → report_and_wait → return_to_home

`plan_json` 에 세 스텝을 넣어 시나리오를 검증합니다.

```json
{
  "mission_id": "demo_report_wait_001",
  "intent": "person",
  "steps": [
    {"task": "scan", "params": {
      "sweep_deg": 180, "yaw_rate_dps": 15, "duration_sec": 10,
      "watch_classes": ["person"], "report_on_found": true}},
    {"task": "report_and_wait", "params": {"prompt": "..."}},
    {"task": "return_to_home", "params": {}}
  ]
}
```

- `scan` : −90°~+90° 스윕(180°), 15dps, 최대 10초, `person` 만 탐지, FOUND 시 `/scan_report` 발행 + `_do_report()` 연계.
- `report_and_wait` 의 `prompt` 는 현재 `exec_report_and_wait()` 에서 미사용이며 **System-2 UI 인터페이스만 열어둔 상태**.

**실행 흐름**: `/system2/plan_cmd` → `on_plan_cmd()` → 파싱·검증 → `current_plan` 저장 → `_run_loop()` 스레드 시작 → `scan`(ok=True) → `current_index += 1` → `report_and_wait` → `publish_state()` 로 `/ats_state` 최신화 → `/system2/report_context` 발행 → 결정 대기 → `return_to_home` 으로 귀환 → `queue_status = "done"`.

**체크 포인트**

- [ ] `ros2 topic echo /system2/report_context` 를 켜 두고, 맵 좌표·vision 스냅샷·state_string 이 JSON payload에 포함되는지 확인.
- [ ] 테스트 단계에서 `/system1/report_decision` 으로 직접 `"continue"` 결정 발행이 되는지 확인.

---

## 🏠 4. `return_to_home` 설계

로봇을 **home 위치**로 돌려보내는 단위 액션입니다. home은 고정 좌표 1개가 아니라 상황에 따라 다르게 정의될 수 있는 개념이므로, **"home 좌표를 어떻게 결정하나"** 와 **"그 좌표로 어떻게 이동하나"** 를 분리합니다.

- 좌표 결정: `_resolve_home_goal()`
- 실제 이동: 이미 구현된 `move_to` 재사용(`exec_move_to`)

### 4.1 home 좌표 결정 우선순위

| 우선순위 | 출처 | 설명 |
| --- | --- | --- |
| 1 | `params.goal` | params 안에 `goal` 이 dict면 그대로 사용(x,y,yaw를 float 캐스팅) |
| 2 | `node._home_pose` | 미리 세팅된 값(예: **미션 시작 시점 pose**)이 있으면 사용 |
| 3 | `home_x/y/yaw` | 런치/YAML 파라미터 읽기, 실패 시 기본값 `(0.0, 0.0, 0.0)` |

→ "플랜이 좌표 넘김" + "노드가 홈을 기억" + "파라미터 파일에 적힌 홈" 을 모두 커버합니다.

![return_to_home — home 좌표 결정 우선순위](img/w13/s56.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 56 (출처: ENGI UNIVERSE)
///

### 4.2 exec_return_to_home

- `_resolve_home_goal()` 로 최종 home 좌표를 확정하고 **소수점 셋째 자리까지** 로그로 출력(의도한 홈인지 1차 검증).
- `return exec_move_to(goal)` : 내비게이션 로직은 `move_to` 와 **완전히 동일**(Nav2 `NavigateToPose` 호출·경로 추종·재플랜). 성공 시 `True`, 실패/타임아웃 시 `False`.

```python
# return_to_home = "홈 좌표 결정" + "move_to 재사용" (교안 설명 기반 재구성)
def exec_return_to_home(self, params):
    goal = self._resolve_home_goal(params)   # ① params.goal ② _home_pose ③ 파라미터
    self.get_logger().info(
        f"[return_to_home] goal=({goal['x']:.3f}, {goal['y']:.3f}, {goal['yaw']:.3f})")
    return self.exec_move_to(goal)           # 이동 로직은 move_to 하나로 집중 관리
```

!!! tip "캡슐화의 이점"
    home 정의를 바꾸고 싶으면 **`_resolve_home_goal()` 만 수정**하면 됩니다. 이동 로직은 `move_to` 하나에만 집중해 관리합니다.

### 4.3 테스트

`return_to_home` 하나만으로 단위 액션을 검증합니다(`mission_id="rtb_demo_001"`, `intent="rtb_test"`, `params` 는 비워 둠 → 홈 좌표는 `_resolve_home_goal()` 규칙으로 결정).

- [ ] `[return_to_home]` 로그가 의도한 home 좌표와 일치하는가
- [ ] Nav2 로그 / RViz path가 home 좌표로 수렴하는가
- [ ] 실제 로봇 pose가 home 근처에 도착하고 `queue_status = "done"` 으로 깔끔히 종료되는가

![return_to_home 테스트 — Nav2 path 수렴 확인](img/w13/s60.jpg){ width="720" }
/// caption
System-1 단위 액션 설계 part 2 — 슬라이드 60 (출처: ENGI UNIVERSE)
///

---

## 🧩 5. Wrap-up

- **`track`** — 짐벌(yaw/pitch) + 바디(yaw) + 거리(vx)의 **3축 통합 제어** 구조와 `_control_step()`·`_thread_main()` 의 성공 조건을 이해하고 테스트했다.
- **`report_and_wait`** — 보고(`/ats_state`·`report_context`) + System-2 결정 수신 대기의 흐름을 정리하고 `scan → report_and_wait → return_to_home` 시나리오로 검증했다.
- **`return_to_home`** — 좌표 결정(`_resolve_home_goal`)과 이동(`move_to` 재사용)을 분리한 귀환 동작을 테스트했다.

## ✅ 체크포인트

- [ ] `track` 이 짐벌·바디·거리의 3축을 동시에 제어하는 이유를 설명할 수 있다
- [ ] DepthBuffer가 bbox에서 `range_m` 을 안정적으로 산출하는 과정(통일·정렬·클리닝·percentile)을 안다
- [ ] `_thread_main()` 이 `both_hold >= success_hold_sec` 로 Initial Success를 판정하는 원리를 이해한다
- [ ] `report_and_wait` 가 항상 `True` 를 반환하고 상위에서 시나리오를 제어하는 이유를 설명할 수 있다
- [ ] `return_to_home` 의 home 좌표 결정 3단계 우선순위를 안다

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| track 3축 통합 제어 이해 | 30 | 짐벌/바디/거리 각 축의 입력·동작·역할 분담을 정확히 설명 |
| DepthBuffer·오차 계산 | 20 | depth 통일·리스케일·클리닝·percentile, PID+LPF+slew 설명 |
| 성공 판정 구조 | 20 | `_control_step` 반환값과 `_thread_main` 의 hold 기반 성공 판정 |
| report_and_wait | 15 | 보고·대기·방어적 설계·항상 True 반환 의미 |
| return_to_home | 15 | 좌표 결정 우선순위 + move_to 재사용 캡슐화 |
| **합계** | **100** | |

## 🔗 출처 및 참고자료

- 교안 「System-1 단위 액션 설계 part 2」 (제작: ENGI UNIVERSE)
- ROS 2 — <https://docs.ros.org>
- Nav2 (NavigateToPose) — <https://docs.nav2.org>
- tf2 (좌표 변환) — <https://docs.ros.org/en/rolling/Concepts/Intermediate/About-Tf2.html>

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (60매)"
    ![슬라이드 01](img/w13/s01.jpg){ width="700" }
    ![슬라이드 02](img/w13/s02.jpg){ width="700" }
    ![슬라이드 03](img/w13/s03.jpg){ width="700" }
    ![슬라이드 04](img/w13/s04.jpg){ width="700" }
    ![슬라이드 05](img/w13/s05.jpg){ width="700" }
    ![슬라이드 06](img/w13/s06.jpg){ width="700" }
    ![슬라이드 07](img/w13/s07.jpg){ width="700" }
    ![슬라이드 08](img/w13/s08.jpg){ width="700" }
    ![슬라이드 09](img/w13/s09.jpg){ width="700" }
    ![슬라이드 10](img/w13/s10.jpg){ width="700" }
    ![슬라이드 11](img/w13/s11.jpg){ width="700" }
    ![슬라이드 12](img/w13/s12.jpg){ width="700" }
    ![슬라이드 13](img/w13/s13.jpg){ width="700" }
    ![슬라이드 14](img/w13/s14.jpg){ width="700" }
    ![슬라이드 15](img/w13/s15.jpg){ width="700" }
    ![슬라이드 16](img/w13/s16.jpg){ width="700" }
    ![슬라이드 17](img/w13/s17.jpg){ width="700" }
    ![슬라이드 18](img/w13/s18.jpg){ width="700" }
    ![슬라이드 19](img/w13/s19.jpg){ width="700" }
    ![슬라이드 20](img/w13/s20.jpg){ width="700" }
    ![슬라이드 21](img/w13/s21.jpg){ width="700" }
    ![슬라이드 22](img/w13/s22.jpg){ width="700" }
    ![슬라이드 23](img/w13/s23.jpg){ width="700" }
    ![슬라이드 24](img/w13/s24.jpg){ width="700" }
    ![슬라이드 25](img/w13/s25.jpg){ width="700" }
    ![슬라이드 26](img/w13/s26.jpg){ width="700" }
    ![슬라이드 27](img/w13/s27.jpg){ width="700" }
    ![슬라이드 28](img/w13/s28.jpg){ width="700" }
    ![슬라이드 29](img/w13/s29.jpg){ width="700" }
    ![슬라이드 30](img/w13/s30.jpg){ width="700" }
    ![슬라이드 31](img/w13/s31.jpg){ width="700" }
    ![슬라이드 32](img/w13/s32.jpg){ width="700" }
    ![슬라이드 33](img/w13/s33.jpg){ width="700" }
    ![슬라이드 34](img/w13/s34.jpg){ width="700" }
    ![슬라이드 35](img/w13/s35.jpg){ width="700" }
    ![슬라이드 36](img/w13/s36.jpg){ width="700" }
    ![슬라이드 37](img/w13/s37.jpg){ width="700" }
    ![슬라이드 38](img/w13/s38.jpg){ width="700" }
    ![슬라이드 39](img/w13/s39.jpg){ width="700" }
    ![슬라이드 40](img/w13/s40.jpg){ width="700" }
    ![슬라이드 41](img/w13/s41.jpg){ width="700" }
    ![슬라이드 42](img/w13/s42.jpg){ width="700" }
    ![슬라이드 43](img/w13/s43.jpg){ width="700" }
    ![슬라이드 44](img/w13/s44.jpg){ width="700" }
    ![슬라이드 45](img/w13/s45.jpg){ width="700" }
    ![슬라이드 46](img/w13/s46.jpg){ width="700" }
    ![슬라이드 47](img/w13/s47.jpg){ width="700" }
    ![슬라이드 48](img/w13/s48.jpg){ width="700" }
    ![슬라이드 49](img/w13/s49.jpg){ width="700" }
    ![슬라이드 50](img/w13/s50.jpg){ width="700" }
    ![슬라이드 51](img/w13/s51.jpg){ width="700" }
    ![슬라이드 52](img/w13/s52.jpg){ width="700" }
    ![슬라이드 53](img/w13/s53.jpg){ width="700" }
    ![슬라이드 54](img/w13/s54.jpg){ width="700" }
    ![슬라이드 55](img/w13/s55.jpg){ width="700" }
    ![슬라이드 56](img/w13/s56.jpg){ width="700" }
    ![슬라이드 57](img/w13/s57.jpg){ width="700" }
    ![슬라이드 58](img/w13/s58.jpg){ width="700" }
    ![슬라이드 59](img/w13/s59.jpg){ width="700" }
    ![슬라이드 60](img/w13/s60.jpg){ width="700" }
