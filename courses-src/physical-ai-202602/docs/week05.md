# 5주차 — Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습)

!!! abstract "학습목표"
    2축(Yaw/Pitch)으로 회전하는 ATS(탐지·조준·추적) 시스템의 기구학과 URDF 구조를 이해하고, 이를 Isaac Sim으로 Import하여 ROS2로 짐벌을 제어한다. 나아가 ATS를 4족 보행 로봇 Spot에 탑재하고, 바뀐 무게중심에 맞춰 넘어지지 않고 걷도록 보행 정책을 **강화학습으로 재훈련**하는 Physical AI 시스템 설계·최적화 파이프라인 전체를 따라간다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습)」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드·명령은 교안의 설명을 충실히 따른 재구성 예제입니다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro & ATS 기구 구조·URDF 이해/분석 | §01~03 |
| 2교시 | 50분 | Isaac Sim URDF Import & ROS2 연동 제어(Yaw/Pitch) | §04~05 |
| 3교시 | 50분 | ATS의 Spot 탑재 & 강화학습 재훈련 + Wrap-up | §06~08 |

---

## 🛰️ 1. Intro — ATS와 이번 강의 로드맵

지난 강의에서 정의한 **ATS**는 탐지(Detection) → 조준(Aiming) → 추적(Tracking)을 AI가 수행하는 완전 자율 시스템입니다. 사람이 모든 결정과 조작을 맡는 **RCWS(원격 조종 시스템)** 와 달리, ATS는 센서로 위협을 인지하고 AI가 직접 모터를 제어하며 사람과 자연어로 명령·보고를 주고받습니다.

!!! note "ATS의 범위"
    본 실습의 ATS는 실제 무기 시스템이 아니라 **‘2축으로 회전 가능한 고성능 카메라 시스템’** 입니다.

![ATS 자율 시스템 개념과 RCWS 비교](img/w05/s04.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 04 (출처: ENGI UNIVERSE)
///

### 이번 강의 학습 로드맵

| 단계 | 내용 |
| --- | --- |
| ① 기구학·URDF 이해 | ATS의 관절 구조, 자유도, 좌표계 정의 분석 |
| ② Isaac Sim Import | ATS 모델을 시뮬레이션에 배치하고 기본 동작 확인 |
| ③ ROS2 연동 제어 | 토픽/명령으로 Yaw/Pitch 짐벌을 실제로 움직여 보기 |
| ④ Spot에 결합 | 고정형 포탑 → 이동형 4족 로봇 플랫폼으로 확장 |
| ⑤ 강화학습 재훈련 | ATS 장착으로 바뀐 무게중심에 맞춰 보행 정책 재학습 |

!!! success "강의 목표"
    단순 모델 조립을 넘어서 **물리적 AI(Physical AI) 시스템 설계·최적화 파이프라인 전체**를 따라가 봅니다. 학습 전에는 ATS의 무게로 비틀거리던 Spot이, 재학습 후에는 안정적으로 걷는 모습을 직접 확인합니다.

---

## 🔧 2. ATS 기구 구조 이해하기

ATS는 두 개의 회전축으로 구성된 단순한 구조입니다.

| 회전축 | 동작 | 설명 |
| --- | --- | --- |
| **Yaw 축** | 좌우 회전 | 포탑(또는 카메라)을 왼쪽/오른쪽으로 돌리는 축 |
| **Pitch 축** | 위아래 회전 | 포신/카메라를 위·아래로 들어 올리고 내리는 축 |

![ATS의 2축(Yaw/Pitch) 회전 구조](img/w05/s07.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 07 (출처: ENGI UNIVERSE)
///

!!! tip "여기서 잠깐 — URDF(Unified Robot Description Format)란?"
    ROS2에서 URDF는 로봇을 설명하는 **‘설계도 같은 텍스트 파일’** 입니다. 로봇의 생김새와 구조, 관절이 어떻게 연결돼 있는지를 **XML 형식**으로 정리한 문서로, 각 관절·링크의 길이와 모양, 회전/직선 운동 특성, 센서·카메라가 붙은 위치까지 정의할 수 있습니다. ROS2 툴들은 이 정보를 읽어 시뮬레이션에서 로봇을 똑같이 그리거나, 실제 하드웨어를 제어할 때 구조를 기준으로 동작을 계산합니다.

### ATS의 URDF 조인트 구성

| 조인트 유형 | 특성 | ATS 적용 |
| --- | --- | --- |
| **Continuous Joint** | 360도 회전 가능 (각도 제한 없음) | **Yaw 축** — "계속 돌아도 되는 회전축" |
| **Revolute Joint** | 정해진 각도 범위 안에서만 회전 (예: +45°~−45°) | **Pitch 축** — 위·아래 각도가 제한된 축 |

---

## 📂 3. ATS URDF 불러오기와 분석하기

### GitHub에서 URDF 패키지 가져오기

ATS 패키지 폴더 구조 개요입니다.

| 폴더 | 내용 |
| --- | --- |
| `config` | 조인트 컨트롤러 설정 |
| `launch` | RViz, Gazebo 등에서 로봇을 한 번에 띄우는 런치 파일 모음 |
| `meshes` | 로봇의 3D 형상(STL, DAE 등) |
| `textures` | (현재 비어 있음) 추후 색상·질감 표현용 텍스처 위치 |
| `urdf` | 링크·조인트 구조, 관성·질량 등 물리 속성을 정의한 URDF 파일 |

![ATS URDF 패키지 폴더 구조](img/w05/s12.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 12 (출처: ENGI UNIVERSE)
///

### URDF 구조 분석 — Link

URDF는 **링크(link) + 조인트(joint)** 구조로 로봇을 표현합니다. Link는 실제 물리 부품, Joint는 두 링크를 연결하고 어떻게 움직일 수 있는지를 정의합니다. 하나의 link는 보통 세 블록으로 구성됩니다.

=== "inertial (물리)"

    물리 시뮬레이션에서 힘·회전 반응을 결정하는 블록.

    - **origin(무게중심)**: 해당 부품의 무게중심 좌표
    - **mass(질량)**: 링크의 질량(kg 단위)
    - **inertia(관성모멘트)**: 관성 모멘트 행렬 — 대칭이므로 **6개 값**으로 3×3 행렬 표현

=== "visual (외형)"

    화면에 보이는 외형을 정의하는 블록.

    - **origin**: 시각적 모델(mesh)이 위치할 좌표
    - **geometry**: 외형을 구성하는 3D 모델 파일
    - **material/color**: 재질 속성 및 RGB/RGBA 색상 정보

=== "collision (충돌)"

    충돌 감지 전용 형상 정보.

    - visual과 비슷하지만 **geometry 기반 충돌 판정 전용**

### Joint 구조 — 핵심 항목

| 항목 | 의미 |
| --- | --- |
| `type` | 조인트 유형 (revolute, continuous, fixed 등) |
| `origin` | 조인트의 위치·자세 (좌표계 정렬 기준) |
| `parent / child` | 어떤 링크와 어떤 링크를 연결하는지 |
| `axis` | 회전/이동 방향 벡터 (예: `1 0 0` → x축) |
| `limit` | 회전 범위, 속도·토크 제한 등 물리적 한계 |
| `dynamics` | 마찰·감쇠처럼 움직임에 걸리는 저항 |
| `safety_controller` | 제어기 차원의 안전 한계 (최대 속도·각도 보호) |

### ATS URDF 전체 구조 — 링크 3개 + 조인트 2개

ATS는 **2축 팬-틸트(pan-tilt) 구조**입니다.

```text
base_link        ── 기준 몸통 / 좌표계 시작점
  └─ joint1      ── 좌우 회전 (Yaw, pan), continuous
      └─ link1   ── joint1에 연결되어 함께 회전하는 연결체
          └─ joint2  ── 상하 회전 (Pitch, tilt), revolute
              └─ link2   ── 카메라·센서·장비가 올라가는 탑재부
```

![ATS URDF 전체 구조 — 링크 3개·조인트 2개](img/w05/s18.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 18 (출처: ENGI UNIVERSE)
///

---

## 🖥️ 4. Isaac Sim에서 URDF Import 하기

**Step 1 —** Isaac Sim 실행 → 상단 메뉴 `File → Import → URDF` 선택
**Step 2 —** Git에서 받아둔 ATS URDF 파일 선택
**Step 3 —** 우측 패널에서 ATS 모델용 옵션을 설정한 뒤 `Import` 버튼 클릭

### 필수 Import 옵션 (실습 권장값)

| 옵션 | 권장 선택 | 이유 |
| --- | --- | --- |
| **Static Base** | ◉ Static Base | ATS를 고정 상태(차량/구조물 고정)로 배치. Moveable Base 선택 시 바닥에서 미끄러지거나 날아다니는 이상 동작 발생 가능 |
| **Joint Drive Type** | ◉ Position | 목표 위치 + 속도 제어 모두 가능 → 실습에 적합. Velocity는 속도만 제어, 목표 각도 지정 불가 |
| **Joint Configuration** | ◉ Stiffness | 강성 K·댐핑 C를 직접 지정해 반응 속도·힘을 정밀 제어. Natural Frequency는 고유진동수·감쇠비 기반 전체 안정성 위주 튜닝 |

![Isaac Sim URDF Import 옵션 패널](img/w05/s24.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 24 (출처: ENGI UNIVERSE)
///

### 시뮬레이션 환경 설정하기

**Step 1 — 실내 환경 생성**: `Create → Environment → Simple Room`
**Step 2 — ATS 불러오기**: Scene Tree의 “ATS” 선택 → Simple Room으로 드래그&드롭
**Step 3 — 테이블에 고정**: `ATS`의 하위 `root_joint` 선택 → Property → `Body0` → `+Add Target` → `table_low_327`

!!! note "왜 고정하나요?"
    이렇게 root_joint를 테이블과 연결하면, 단순히 "공중에 뜬 로봇"이 아니라 **실제 환경에 설치된 시스템처럼 동작**하는 시뮬레이션이 됩니다.

---

## 🔌 5. ROS2와 연동해 ATS 제어하기

ROS2에서 명령을 보내고 ATS가 실제로 반응하는지 확인하는 **3단계** 흐름입니다.

**Step 1 — 조인트 컨트롤러 설정 (Isaac Sim 내부)**: 각 조인트의 드라이브 타입/상태 확인, ROS2에서 제어 가능한 형태로 조인트 드라이브 준비
**Step 2 — OmniGraph로 ROS2 ↔ Isaac Sim 연결**: ROS2 토픽과 Isaac Sim의 조인트·상태 노드를 와이어링(연결)
**Step 3 — ROS2에서 명령 전송 & 확인**: `ros2 topic pub` 등으로 조인트 명령을 발행하고 Yaw/Pitch가 의도대로 움직이는지 시각적으로 검증

!!! tip "여기서 잠깐 — OmniGraph란?"
    OmniGraph는 NVIDIA Isaac Sim과 Omniverse에서 사용하는 **노드 기반 계산 그래프 시스템**입니다. 물리 연산, 로봇 센서 입력, 제어 명령 등 다양한 작업을 그래프 형태로 처리하며 Python과 USD Stage에 직접 연결되어 시뮬레이션과 실시간으로 연동됩니다. 쉽게 말하면, 데이터 흐름과 제어 로직을 **눈으로 보면서 구성·관리**하는 프레임워크입니다.

### 조인트 컨트롤러 파라미터 튜닝

`ATS` 선택 → `joints → joint1` 선택 → Property 창 → **Drive** 항목에서 설정합니다.

| 파라미터 | 의미 |
| --- | --- |
| Target Position | 목표 각도(위치) |
| Target Velocity | 목표 속도 |
| **Stiffness (kp)** | 강성 — 목표 위치로 끌어당기는 힘의 세기 |
| **Damping (kv)** | 감쇠 — 움직임의 진동을 줄이는 저항 |

![조인트 Drive 파라미터(kp/kv) 튜닝](img/w05/s31.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 31 (출처: ENGI UNIVERSE)
///

### Action Graph 구성

Action Graph는 시뮬레이션 안에서 ROS2 메시지를 주고받기 위한 핵심 시스템입니다. `Window → Graph Editors → Action Graph`로 열고, 편집 창에서 “New Action Graph”를 클릭해 새 캔버스를 만듭니다.

| 노드 | 역할 |
| --- | --- |
| **On Playback Tick** | 시뮬레이션 시간에 맞춰 프레임마다 신호 발생 → 주기적 제어 값 갱신/전달 |
| **Articulation Controller** | ATS 관절을 실제로 움직이는 메인 제어 노드 — 목표 위치에 도달하도록 힘 계산·적용 |
| **ROS2 Subscribe Joint State** | ROS2에서 오는 조인트 명령(목표 위치·속도)을 받는 입구 |
| **ROS2 Publish Joint State** | Isaac Sim 관절 상태를 ROS2로 내보내는 출구 (외부 실시간 모니터링용) |

![ROS2 ↔ Isaac Sim 연결 Action Graph](img/w05/s37.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 37 (출처: ENGI UNIVERSE)
///

### ROS2에서 ATS로 명령 주기

조인트 제어는 `sensor_msgs/msg/JointState` 메시지를 사용합니다. 예시로 Yaw 조인트(joint1)를 **+90도(1.57 rad)** 만큼 회전시킵니다.

```bash
# joint1(Yaw)을 +90도(1.57 rad)로 회전시키는 명령 예시
ros2 topic pub /joint_command sensor_msgs/msg/JointState \
  "{name: ['joint1'], position: [1.57]}"
```

!!! success "검증"
    명령을 발행한 뒤 Isaac Sim에서 ATS의 Yaw/Pitch가 의도한 각도로 회전하면 ROS2 ↔ 시뮬레이션 제어 파이프라인이 정상 연동된 것입니다.

---

## 🐕 6. ATS를 4족 보행 Spot 위에 탑재하기

**Step 1 — Spot 모델 로드**: `Window → Examples → Robotics Examples` → 별도 탭의 `policy` 항목 → **Quadruped 예제 → Load** (보행 정책이 적용된 Spot 모델)
**Step 2 — ATS 모델 탑재**: `File → Import` → ATS URDF 로드 → **Spot 항목의 하위로 ATS 편입**
**Step 3 — 결합 고정**: ATS 쪽 **articulation enable 비활성화** 후, `root_joint`의 `Body0` Target을 Spot의 **body 링크**로 지정

![ATS를 탑재한 Spot 보행 시뮬레이션](img/w05/s42.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 42 (출처: ENGI UNIVERSE)
///

!!! note "고정형 포탑 → 이동형 플랫폼"
    이 단계로 ATS는 테이블 위 고정형 시스템에서 **4족 로봇이 짊어지고 이동하는 이동형 플랫폼**으로 확장됩니다.

---

## 🧠 7. ATS 탑재 Spot 로봇 강화학습하기

### 왜 재학습이 필요한가?

- 기존 Spot 보행 Policy는 **"ATS 없는 상태"** 의 질량·관성·무게중심을 기준으로 학습됨
- ATS를 올리면 **질량 분포·무게중심이 완전히 달라짐**
- 기존 제어기가 새 상황을 반영하지 못하므로, **"ATS를 짊어진 Spot"** 을 대상으로 강화학습을 다시 수행

### 학습 환경 설정 — rsl_rl

- **사용 라이브러리**: `rsl_rl` (Isaac Lab용 경량 강화학습 라이브러리)
- **벡터화 환경**으로 수십~수백 개 시뮬레이션을 병렬 실행
- **참고 설정 파일**: `velocity_env_cfg.py`

| `velocity_env_cfg.py` 주요 클래스 | 역할 |
| --- | --- |
| `MySceneCfg` | 지형·마찰·물리 재질·조명·센서 등 전체 물리 환경 구성 |
| `CommandsCfg` | 속도 명령(random cmd) 생성, `lin_vel_x`·`lin_vel_y`·`ang_vel_z` 범위 정의 |
| `ActionsCfg` | Joint Position Control 기반 관절 위치 명령 제어 |
| `ObservationsCfg` | Policy가 보는 관측 벡터 구성 |
| `RewardsCfg` | 보상·페널티 설계 |
| `TerminationsCfg` | 에피소드 종료 기준 정의 |
| `CurriculumCfg` | 난이도 조절(커리큘럼 학습) |

![Spot 강화학습 환경(velocity_env_cfg) 구성](img/w05/s45.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 45 (출처: ENGI UNIVERSE)
///

### 학습용 로봇 모델 설정

**Step 1 — 로봇 루트 정리**: Spot 이름 변경(`robot`) → world 자식 → 루트 레벨 → 우클릭 → `Set as DefaultPrim`
**Step 2 — ATS 조인트 비활성화**: `root_joint`, `joint1`, `joint2` 우클릭 → `Deactivate`
**Step 3 — Spot + ATS 고정 결합**: `base_link(+ link1, link2)` 우클릭 → `Create → Physics → Joint → Fixed` → Spot body와 ATS base_link 고정 → 원하는 경로에 저장
**Step 4 — config 수정**: `spot.py`의 `usd_path`를 결합 모델로 수정

```text
# spot.py — 강화학습 예제 구성 파일의 모델 경로를 결합 모델로 변경
usd_path = f"{usd 파일이 저장된 경로}/spot_learnmodel.usd"
```

!!! tip "여기서 잠깐 — 강화학습인데 왜 ‘데이터 습득’을 따로 하나요?"
    강화학습은 지도학습처럼 미리 준비된 정답 데이터셋으로 시작하지 않아 흔히 ‘데이터 없이 학습한다’고 표현합니다. 하지만 실제로는 에이전트가 환경 속에서 수많은 행동을 시도하며 **얻는 상태 변화와 보상 정보가 모두 새로운 데이터**가 됩니다. ATS를 얹은 Spot이 시뮬레이션에서 수천·수만 번 움직여 넘어지기도 하고 균형을 잡기도 하며, 그 모든 시도와 결과가 곧 강화학습의 학습 데이터입니다.

### 정책 학습과 적용

- **데이터 습득**: 시뮬레이션에서 시도·보상을 수집 — **headless 모드**로 렌더링 자원을 최소화해 효율 극대화
- **정책 학습**: 수집한 데이터 기반으로 보행 정책 학습 → 결과를 저장 경로에 보관
- **정책 적용**: `spot.py`를 열어 새로 학습된 정책을 적용하도록 수정 → 테스트 영상으로 안정적 보행 확인

![headless 모드 병렬 학습 — 데이터 습득](img/w05/s48.jpg){ width="720" }
/// caption
Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습) — 슬라이드 48 (출처: ENGI UNIVERSE)
///

---

## 🧩 8. Wrap-up — 오늘 강의 요약

- ✔ ATS의 **기구학적 구조 및 URDF 작업** 이해 (2축 팬-틸트, continuous/revolute joint)
- ✔ Isaac Sim 내에서 **Spot + ATS 결합** (URDF Import → 환경 배치 → ROS2 제어 → Spot 탑재)
- ✔ **Spot + ATS 강화학습** 과정 진행 (무게중심 변화 대응 보행 정책 재훈련)

## ✅ 체크포인트

- [ ] ATS의 Yaw(continuous)·Pitch(revolute) 조인트 차이를 URDF 관점에서 설명할 수 있다
- [ ] Isaac Sim에서 Static Base·Position·Stiffness 옵션으로 ATS를 Import할 수 있다
- [ ] OmniGraph Action Graph로 ROS2 `JointState` 명령을 ATS 짐벌에 연결할 수 있다
- [ ] ATS를 Spot에 Fixed Joint로 결합하고 학습용 모델로 저장할 수 있다
- [ ] `rsl_rl`로 ATS 탑재 Spot의 보행 정책을 재학습하는 이유와 절차를 설명할 수 있다

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| URDF 구조 이해 | 20 | 링크/조인트 구성과 ATS 2축 구조를 정확히 분석 |
| Isaac Sim Import | 20 | Static/Position/Stiffness 옵션을 올바르게 설정·배치 |
| ROS2 연동 제어 | 25 | OmniGraph 구성 + `JointState`로 Yaw/Pitch 제어 검증 |
| Spot 탑재 결합 | 15 | Fixed Joint 결합 및 학습용 모델 저장 수행 |
| 강화학습 재훈련 | 20 | 재학습 필요성 이해 + `velocity_env_cfg`/`spot.py` 수정·학습 진행 |

## 🔗 출처 및 참고자료

- 교안 **「Spot + ATS 시스템 구축 (URDF Import·ROS2 연동·RL 재학습)」** (제작: ENGI UNIVERSE)
- NVIDIA Isaac Sim — URDF Importer — <https://docs.isaacsim.omniverse.nvidia.com/latest/robot_setup/import_urdf.html>
- ROS2 URDF 튜토리얼 — <https://docs.ros.org/en/rolling/Tutorials/Intermediate/URDF/URDF-Main.html>
- Isaac Lab / rsl_rl — <https://github.com/leggedrobotics/rsl_rl>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [URDF Importer](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/importer_exporter/ext_isaacsim_asset_importer_urdf.html)
    - [URDF Import 튜토리얼](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/importer_exporter/import_urdf.html)
    - [ROS 2 통합](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/ros2_landing_page.html)
    - [ROS 2 튜토리얼](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/index.html)

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (50매)"
    ![슬라이드 01](img/w05/s01.jpg){ width="700" }
    ![슬라이드 02](img/w05/s02.jpg){ width="700" }
    ![슬라이드 03](img/w05/s03.jpg){ width="700" }
    ![슬라이드 04](img/w05/s04.jpg){ width="700" }
    ![슬라이드 05](img/w05/s05.jpg){ width="700" }
    ![슬라이드 06](img/w05/s06.jpg){ width="700" }
    ![슬라이드 07](img/w05/s07.jpg){ width="700" }
    ![슬라이드 08](img/w05/s08.jpg){ width="700" }
    ![슬라이드 09](img/w05/s09.jpg){ width="700" }
    ![슬라이드 10](img/w05/s10.jpg){ width="700" }
    ![슬라이드 11](img/w05/s11.jpg){ width="700" }
    ![슬라이드 12](img/w05/s12.jpg){ width="700" }
    ![슬라이드 13](img/w05/s13.jpg){ width="700" }
    ![슬라이드 14](img/w05/s14.jpg){ width="700" }
    ![슬라이드 15](img/w05/s15.jpg){ width="700" }
    ![슬라이드 16](img/w05/s16.jpg){ width="700" }
    ![슬라이드 17](img/w05/s17.jpg){ width="700" }
    ![슬라이드 18](img/w05/s18.jpg){ width="700" }
    ![슬라이드 19](img/w05/s19.jpg){ width="700" }
    ![슬라이드 20](img/w05/s20.jpg){ width="700" }
    ![슬라이드 21](img/w05/s21.jpg){ width="700" }
    ![슬라이드 22](img/w05/s22.jpg){ width="700" }
    ![슬라이드 23](img/w05/s23.jpg){ width="700" }
    ![슬라이드 24](img/w05/s24.jpg){ width="700" }
    ![슬라이드 25](img/w05/s25.jpg){ width="700" }
    ![슬라이드 26](img/w05/s26.jpg){ width="700" }
    ![슬라이드 27](img/w05/s27.jpg){ width="700" }
    ![슬라이드 28](img/w05/s28.jpg){ width="700" }
    ![슬라이드 29](img/w05/s29.jpg){ width="700" }
    ![슬라이드 30](img/w05/s30.jpg){ width="700" }
    ![슬라이드 31](img/w05/s31.jpg){ width="700" }
    ![슬라이드 32](img/w05/s32.jpg){ width="700" }
    ![슬라이드 33](img/w05/s33.jpg){ width="700" }
    ![슬라이드 34](img/w05/s34.jpg){ width="700" }
    ![슬라이드 35](img/w05/s35.jpg){ width="700" }
    ![슬라이드 36](img/w05/s36.jpg){ width="700" }
    ![슬라이드 37](img/w05/s37.jpg){ width="700" }
    ![슬라이드 38](img/w05/s38.jpg){ width="700" }
    ![슬라이드 39](img/w05/s39.jpg){ width="700" }
    ![슬라이드 40](img/w05/s40.jpg){ width="700" }
    ![슬라이드 41](img/w05/s41.jpg){ width="700" }
    ![슬라이드 42](img/w05/s42.jpg){ width="700" }
    ![슬라이드 43](img/w05/s43.jpg){ width="700" }
    ![슬라이드 44](img/w05/s44.jpg){ width="700" }
    ![슬라이드 45](img/w05/s45.jpg){ width="700" }
    ![슬라이드 46](img/w05/s46.jpg){ width="700" }
    ![슬라이드 47](img/w05/s47.jpg){ width="700" }
    ![슬라이드 48](img/w05/s48.jpg){ width="700" }
    ![슬라이드 49](img/w05/s49.jpg){ width="700" }
    ![슬라이드 50](img/w05/s50.jpg){ width="700" }
