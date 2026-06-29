# 7주차 — Spot + ATS SLAM 연동 part 1 (ROS2 브릿지·자율주행)

!!! abstract "학습목표"
    Isaac Sim 환경에 **Spot + ATS 로봇**을 로드해 물리적으로 연동하고, 센서를 ROS2 토픽으로 퍼블리시하며 **TF 트리(map–odom–body–sensor)** 로 좌표 정합을 확보한다. 수동 제어(키보드 텔레옵)와 Spot 정책 제어를 통합 설계하고, `slam_toolbox`·Nav2를 연동해 지도 작성과 동시에 자율 보행을 수행한다. 이를 통해 **목적 → 설계 → 구현 → 테스트 → 연동**으로 이어지는 완전한 로봇 시스템 개발 과정을 경험한다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「Spot + ATS SLAM 연동 part 1 (ROS2 브릿지·자율주행)」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 코드·노드명·토픽명은 교안의 설명을 충실히 따른 재구성 예제입니다.

!!! note "강의 흐름 (FLOW)"
    `모델 로드` → `ROS2 브릿지` → `정책/제어` → `TF 정합` → `자율주행`

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro + 시스템 구조 설계와 코드 구성 설계 (모듈 분할) | §01~02 |
| 2교시 | 50분 | 환경 세팅과 ROS2 브릿지 (world.py·graph_builder.py) | §03 |
| 3교시 | 50분 | 정책·제어 실행 + 테스트·자율주행 연동(slam_toolbox·Nav2) + Wrap-up | §04~06 |

---

## 1. Intro — 이번 강의 목표

![Spot + ATS SLAM 연동 개요](img/w07/s03.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 (ROS2 브릿지·자율주행) — 슬라이드 03 (출처: ENGI UNIVERSE)
///

- **Isaac Sim 환경에서 Spot + ATS 로봇 제어 및 SLAM 자율 보행 구현**
- 시뮬레이션 환경에 Spot + ATS 모델 로드 및 물리적 연동
- 센서를 ROS2 토픽으로 퍼블리시
- TF 트리를 유지해 좌표 정합 확보
- 수동 제어(키보드 Teleoperation)와 Spot 정책 제어를 통합 설계
- ROS2 패키지 `slam_toolbox`와 Nav2를 연동해 지도 작성과 동시에 자율 보행 수행

!!! success "기대 효과"
    목적 → 설계 → 구현 → 테스트 → 연동으로 이어지는 **완전한 로봇 시스템 개발 과정**을 경험하고, 다양한 분야의 로봇 설계 응용력을 기른다.

---

## 2. 시스템 구조 설계와 코드 구성 설계

### 시작 전 핵심 개념

| 개념 | 의미 | 본 프로젝트에서 |
| --- | --- | --- |
| **자유도(DOF)** | 로봇이 독립적으로 움직일 수 있는 축의 개수 | Spot: 12 DOF(다리 관절), ATS: 2 DOF(상하·좌우) |
| **TF(Transform)** | ROS2에서 좌표계 간 변환 관계를 표현하는 체계 | `/map`, `/odom`, `/body`, `/camera`, `/scan` 등의 연결 관계 |

!!! note "왜 TF가 중요한가"
    SLAM·Navigation 같은 상위 알고리즘이 정확히 동작하려면 **좌표 구조를 명확히 이해**하고 유지해야 한다.

### 시스템의 구조와 필수 기능

목표: **Isaac Sim에 Spot + ATS 로드·연동 → 센서를 ROS2 토픽으로 퍼블리시 → SLAM으로 지도 생성, Nav2로 자율 보행.**

**필수 기능 4가지**

1. **시뮬레이션 환경을 불러오고 로봇 초기화** — USD 로드(Spot/ATS 배치), 시간 스텝·주기 등 실행 환경 설정, Articulation Root 식별·초기화로 제어 루프 준비
2. **센서와 ROS2 브릿지 연결** — 카메라·LiDAR·IMU·Odometry 토픽 퍼블리시, TF 트리(map–odom–body–sensor) 유지, 속도/조인트 명령 구독 → 시뮬 반영
3. **정책 기반 제어와 입력 처리** — 관절 위치·속도·자세 등 관측 벡터 구성 → 정책 모델 입력 → 출력(다리/ATS 명령), 키보드 텔레옵과 정책 출력의 모드/우선순위/게이트 설계로 충돌 방지
4. **매 프레임 실행 루프와 전체 관리** — 시뮬 스텝 → 입력 수집 → 관측 생성 → 정책 실행 → 제어 적용 → 센서/TF 퍼블리시, 시작/종료·오류 처리·로깅/모니터링 포함

![시스템 필수 기능 정의](img/w07/s08.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 08 (출처: ENGI UNIVERSE)
///

!!! tip "설계 철학"
    설계는 **출발점**일 뿐이다. 현재 수준에서 가능한 구조로 시작하고, 학습/발견에 따라 점진적으로 수정·보완한다.

### 세부 모듈 분할

| 역할 | 모듈 | 담당 |
| --- | --- | --- |
| 환경 초기화 | `world.py` / `sim_app.py` | USD 스테이지 로드, Spot·ATS 초기화, 물리·시간 스텝 설정 |
| 센서 & ROS2 브릿지 | `graph_builder.py` | 카메라·LiDAR·IMU·Odometry 퍼블리시, TF·명령 구독을 그래프로 일괄 구성 |
| 관측 | `observation.py` | 관측 벡터 구성(관절 각/속도, 자세, 중력 등) |
| 정책 | `policy.py` | 학습 모델 로드·추론 |
| 제어 | `controller.py` | 정책 출력 → 관절 명령 변환 |
| 입력 | `input.py` | 키보드 입력 수집 / 모드·우선순위 게이트 |
| 실행 루프 | `loop.py` / `main.py` | 실행 루프 / 모듈 조립 및 실행 |

!!! note "개발 순서 체크리스트"
    1. `world`로 로봇을 불러와 무대에 세움 → 2. `graph_builder`로 센서가 하나씩 퍼블리시되는지 확인 → 3. `observation`으로 관측 벡터를 만들고 값 검증 → 4. `policy`로 입력을 넣어 출력 확인 → 5. `controller`로 다리를 움직여 제어 동작 확인 → 6. `loop`·`main`으로 전체 시스템 조립·실행

---

## 3. 환경 세팅과 ROS2 브릿지

목표: Isaac Sim에서 Spot + ATS를 안정적으로 로드하고, ROS2 브릿지를 구축해 데이터가 양방향으로 오갈 수 있는 파이프라인을 만든다. 이 과정은 `world.py`와 `graph_builder.py`로 세팅한다.

### 무대를 여는 법 — `world.py`

![world.py 의 의도와 구현](img/w07/s18.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 18 (출처: ENGI UNIVERSE)
///

| 항목 | 역할 |
| --- | --- |
| `open_stage(usd_path)` | 스테이지(USD) 오픈 |
| `omni.usd.get_context().get_stage()` | 로봇을 물리 시뮬의 아티큘레이션(Articulation)으로 연결 |
| `_find_articulation_root()` | 아티큘레이션 루트 프림 탐색기 |
| `UsdPhysics.ArticulationRootAPI` | 경로의 하위 경로들을 순회해 유효 루트 탐색 |
| `omni.timeline.get_timeline_interface()` | 시간 및 타임라인 고정 |
| `fixed_time_step` | 목표 주파수를 설정해 ROS2와 시간축 통일 |
| `define_prim("/World/odom", "Xform")` | odom과 map 좌표계를 구분하기 위해 스테이지 상 Xform으로 고정점 생성 |

- **`ArticulationView`**: 관절 상태 조회·목표치 설정 통로. `self.spot`/`self.ats`를 각각 ArticulationView로 두면 서로 다른 제어 모드 적용이 쉽고, 카메라 TF 구조도 명확히 유지된다.
- **`step(render=True)`**: 한 줄로 물리 + 렌더를 함께 진행한다.

### 배선을 잇는 법 — `graph_builder.py`

센서/제어 신호를 ROS2 토픽으로 노출하는 파이프라인을 구축하는 역할이다. **OmniGraph**(노드 기반 실행 그래프)를 코드로 구성해 카메라·IMU·Odom·TF·LiDAR가 안정적으로 발행되도록 한다.

!!! note "여기서 잠깐 — OmniGraph란?"
    Isaac Sim/Omniverse에서 동작하는 **데이터 플로우 기반 실행 그래프**다. 어떤 연산을, 어떤 입력·출력으로, 어떤 순서로 실행할지를 **노드와 엣지 연결**로 정의한다. 예) "카메라 센서 노드 → 데이터 변환 노드 → ROS2 퍼블리셔 노드". 실행 방식은 두 가지:

    - **프레임 단위 자동 실행(execution per frame)**: 매 프레임 갱신마다 노드가 자동 실행 — 센서처럼 매 순간 새 데이터를 내야 할 때
    - **필요할 때만 실행(push / ondemand)**: 특정 이벤트·조건에서만 평가 — 연산 비용 절감

![graph_builder.py — OmniGraph 배선](img/w07/s28.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 28 (출처: ENGI UNIVERSE)
///

#### 카메라 퍼블리셔 그래프

!!! note "여기서 잠깐 — RenderProduct란?"
    카메라 프림이 찍어낸 결과를 다른 노드가 바로 쓸 수 있게 만드는 **오프스크린 렌더 타깃**이다. `UsdGeom.Camera` 자체는 광학적 정의(포즈·초점거리·조리개·클리핑)만 담고, 이를 매 프레임 이미지 버퍼(AOV)로 뽑아 다운스트림 노드가 읽게 하려면 RenderProduct가 필요하다. **이미지는 RenderProduct에서, 내/외부 파라미터는 카메라 프림에서** 오고, 둘을 한 프레임 기준으로 동기화해 내보낸다. 뷰포트(UI 화면)와 분리되어 **헤드리스 모드에서도** 동일 품질의 버퍼를 얻을 수 있다.

실행 순서(액션 엣지로 강제):

```text
OnTick → createViewport → getRenderProduct → setCamera → (cameraHelperRgb & cameraHelperInfo)
```

| 노드/설정 | 역할 |
| --- | --- |
| `evaluator_name="push"` / `GRAPH_PIPELINE_STAGE_ONDEMAND` | 매 프레임 자동 평가가 아닌 필요 시 직접 실행 |
| `OnTick` (`omni.graph.action.OnTick`) | 트리거(시작 신호) 역할 |
| `IsaacCreateViewport` | 렌더링에 필요한 논리적 뷰 생성 |
| `IsaacGetViewportRenderProduct` | 뷰포트에 RenderProduct 생성, `renderProductPath` 출력 |
| `IsaacSetCameraOnRenderProduct` | RenderProduct에 카메라 prim 바인딩 |
| `ROS2CameraHelper` / `ROS2CameraInfoHelper` | RenderProduct 결과를 ROS2 이미지·카메라 정보 토픽으로 퍼블리시 |

```text
# 헬퍼의 토픽 메타데이터 설정 (SET_VALUES 블록)
cameraHelperRgb:  frameId="Camera", topicName="yolo/image_raw", type="rgb"
cameraHelperInfo: frameId="Camera", topicName="camera_info"
# 카메라 경로: "/World/Spot/ATS/ATS/link2/Xform/Camera" (ATS 짐벌 하위)
```

!!! tip "frame_id ≠ TF"
    `frameId`는 메시지의 `header.frame_id`일 뿐, **TF 트리와의 일관성은 별개**다. `static_transform_publisher` 등 별도 노드로 카메라 고정 변환을 반드시 브로드캐스트해야 RViz/소비자가 좌표계를 올바르게 해석한다. `Render product not valid` 경고가 뜨면 ① 카메라 프림 경로 오타 ② 타임라인 미재생 ③ RenderProduct 조기 생성 순으로 점검한다.

#### ActionGraph — 제어/상태·시간·관성·위치추정·좌표계

![ActionGraph 연결 구조](img/w07/s40.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 40 (출처: ENGI UNIVERSE)
///

=== "제어/상태 (JointState·Twist)"

    - `ROS2SubscribeJointState`: 받은 `jointNames`를 컨트롤러에 연결
    - `IsaacArticulationController`: Spot 프림에 힘/속도/위치 명령 적용
    - `ROS2SubscribeTwist`: `/cmd_vel` 구독(컨트롤러 입력/오도메트리 계산에 사용)
    - `ROS2PublishJointState`: 현재 관절 위치·속도·토크 퍼블리시(디버그/상위 제어용)

=== "시간 (Clock)"

    - `IsaacReadSimulationTime → ROS2PublishClock`
    - 시뮬 시간(`/clock`)을 ROS 전체에 배포 → `use_sim_time` 노드들이 같은 시간축으로 동작

=== "IMU"

    - `OnTickIMU`: `framePeriod=0, onlyPlayback=True` → 플레이 중 매 프레임 평가
    - `IsaacComputeOdometry`: 바디 포즈 기반 가짜 IMU 값 합성(orientation, angular velocity, linear acceleration)
    - `ROS2PublishImu`: `/imu`로 퍼블리시, `frameId`는 TF 프레임 이름과 일치

=== "Odometry"

    - `OnPlaybackTick`: 매 프레임 오도메트리 계산
    - `IsaacComputeOdometry`: 바디 포즈/속도 → position, orientation, linear/angular velocity → `odom → base_link` 생성
    - `ROS2PublishOdometry`: `/odom` 발행, `odomFrameId="odom"`(누적 기준, 점프 없음), `chassisFrameId="base_link"`(=body)

=== "TF 트리"

    - `ROS2PublishTransformTree(Cam)`: `camera_base → camera` 고정변환(짐벌 움직임 반영)
    - `ROS2PublishTransformTree(Imu)`: `body → imu_link` 고정변환(메시지 frame_id와 child 이름 일치 필수)
    - `ROS2PublishTransformTree(Odom)`: `odom → base_link(body)` 변환(/odom 메시지와 위치 관계 일치 유지)

#### RTX LiDAR (2D/3D) 퍼블리셔 그래프

![RTX LiDAR 퍼블리셔 그래프](img/w07/s50.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 50 (출처: ENGI UNIVERSE)
///

실행 순서 강제: `OnPlaybackTick → RunOneSimulationFrame → RenderProduct → LiDAR Helper`

```text
RunSim.step → RenderProduct.execIn → RenderProduct.execOut → LiDAR Helper.execIn
# "시뮬레이션 스텝 → RP 평가 → 헬퍼 퍼블리시" 순서로 빈 프레임 문제 방지
```

| 경로 | 메시지 | frameId |
| --- | --- | --- |
| 2D → `/scan` | `sensor_msgs/LaserScan` | `frames["base_scan"]` |
| 3D → `/point_cloud` | `sensor_msgs/PointCloud2` | `frames["base_scan_3D"]` |

- 2D/3D 각각 전용 RenderProduct(`RP_2D`, `RP_3D`)를 만들고 `cameraPrim`에 **LiDAR 프림을 바인딩**한다.
- RenderProduct 해상도(예: 640×480)는 내부 레이캐스트 **샘플링 해상도** 역할 → 출력 품질에 직접 영향. 실제 각도/빔 수/회전 속도는 LiDAR 프림 속성에서 결정된다.
- `ROS2RtxLidarHelper`가 RenderProduct 버퍼를 ROS 표준 메시지로 직렬화. `frameSkipCount`로 퍼블리시 빈도 조정, `publishFullScan`으로 회전형 LiDAR 옵션 활성화.

!!! tip "자주 발생하는 오류 & 해결"
    `Render product not valid` 발생 시 ① LiDAR 프림 경로 확인 → ② RTX LiDAR 활성/설정 확인 → ③ "Sim Step → RP → Helper" 실행 순서 유지. 또한 **`frame_id` == TF child 이름**(예: `base_scan`)을 맞춰 좌표 변환 실패를 막고, 샘플 밀도가 부족하면 LiDAR 빔 수와 RP 해상도를 함께 늘린다.

---

## 4. 정책과 제어 실행

### 관측 벡터 구성 — `ObservationBuilder` (48차원)

![관측 벡터 구성](img/w07/s60.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 60 (출처: ENGI UNIVERSE)
///

Isaac Sim에서 얻은 로봇 상태를 **몸체 좌표계 기준 48차원 벡터**로 정리한다.

| 구간 | 내용 |
| --- | --- |
| `obs[0:9]` | 몸체 기준 선속도·각속도·중력 방향 벡터 |
| `obs[9:12]` | 명령 벡터 `cmd_vec` |
| `obs[12:24]` | 기본자세(`default_pos`)와 관절 위치 차이 벡터 → 안정적 학습 |
| `obs[24:36]` | 관절 속도 벡터 → 보행 위상·스윙/서포트 전환의 핵심 단서 |
| `obs[36:48]` | 이전 액션(`prev_action`) → 보행 리듬을 외부 신호로 이어 안정성 향상 |

- 관성 좌표계 속도(`lin_vel_I`, `ang_vel_I`)는 **쿼터니언 → 회전행렬(R_BI)** 로 몸체좌표계에 투영: `lin_vel_b = R_BI @ lin_vel_I`, `ang_vel_b = R_BI @ ang_vel_I`
- `gravity_b`: 중력 `g = (0, 0, -1)`을 몸체 측으로 투영
- Spot 다리 관절은 **12 DOF까지만** 사용

!!! note "구성 시 유의점"
    - **순서 일치**: 관절 순서 = `default_pos` 순서
    - **스케일 일치**: 관절 각도 → rad, 관절 속도 → rad/s, 선속도 → m/s (학습 당시와 동일 단위)
    - **좌표계 정의 일치**: `quat_to_rot_matrix` 좌표계 = Isaac 바디 프레임
    - **`prev_action` 갱신 필수**: 매 스텝 정책 출력 후 `update_prev_action()`을 반드시 호출(미호출 시 0 벡터로 고정)

### 정책 실행 — `PolicyRunner`

학습된 **TorchScript 정책 모델**을 로딩, 관측 벡터를 넣어 **12차원 액션**을 추론하는 전용 실행기.

```python
class PolicyRunner:
    def __init__(self, model_path, device="auto"):
        # GPU 연결 O → cuda:0 / X → cpu
        self.device = "cuda:0" if (device == "auto" and torch.cuda.is_available()) else "cpu"
        self.model = torch.jit.load(model_path).eval()   # 추론 전용(Dropout/BatchNorm 비활성)

    def infer(self, obs):
        with torch.no_grad():                            # 그래디언트/메모리 오버헤드 비활성
            x = torch.as_tensor(obs, dtype=torch.float32).reshape(1, 48)
            out = self.model(x).squeeze(0)               # (1,12) → (12,)
        return out                                       # 원시 액션(-1 ~ 1)
```

- 반환값은 정책의 **원시 액션(-1~1)** → 이후 `기본자세 + 스케일링`을 적용해 물리적으로 유효한 각도로 변환
- **워밍업** 1~2회 실행으로 JIT 내부 그래프/캐시를 예열해 초반 지연 방지
- `dtype=float32` 고정(GPU/CPU 호환·속도), `torch.set_float32_matmul_precision("high")`로 정밀도–속도 균형
- 멀티 스레드 환경에서 `prev_action` 갱신이 관측 빌드와 엇갈리지 않게 **락 또는 상태 스냅샷 복사**

### 제어 적용 — `RobotController`

정책의 원시 액션 + 사용자 명령을 실제 관절 목표로 변환해 시뮬레이터에 적용한다.

| 대상 | 변환식 |
| --- | --- |
| **Spot (12 DOF)** | `q_target = default_pos + spot_action_scale × action` |
| **ATS (2 DOF)** | `q_ats[i] += ats_joint_step × ats_cmd[i]` (증분 제어, Smooth Move) |

```python
# Spot 다리 12축 목표각
q_spot = spot.get_joint_positions()[0].copy()
q_spot[self._leg_idx] = default_pos + spot_action_scale * policy_action
q_spot = np.clip(q_spot, q_min, q_max)          # TIP: 관절 리미트 클램프 한 번 더
spot.set_joint_position_targets(q_spot)          # PD/임피던스 컨트롤러가 목표각으로 이동

# ATS 짐벌(yaw/pitch) 증분
q_ats = ats.get_joint_positions()[0].copy()
ats_cmd = [yaw, pitch]
q_ats += ats_joint_step * np.array(ats_cmd)
ats.set_joint_position_targets(q_ats)
```

- `default_pos`를 기준점으로 사용 → 절대 위치 예측보다 안정적 제어
- `read_twist_from_graph()`: OmniGraph `SubscribeTwist` 출력에서 선속/각속 명령 직접 로드
- `teleop_from_keys(pressed, ...)`: WASD/화살표 → 선속(vx, vz)·짐벌 회전(yaw, pitch)

!!! tip "안전장치 & 유의점"
    - **길이 미스매치 방어**: 정책 출력/ATS 명령 길이가 부족하면 0으로 패딩 → 시스템 중단 방지
    - **아티큘레이션 부재**: ATS가 없거나 DOF < 2면 제어 비활성 + 로그 출력(크래시 방지)
    - **`default_pos` 동결**: 생성 시 1회 캐시 → 환경 Reset 후 재갱신 필요
    - **스케일 주의**: `spot_action_scale`이 크면 보행 발산, 작으면 발 들기 불가 → 학습 시 값 그대로 사용
    - **블렌딩**: `cmd = α * cmd_policy + (1-α) * cmd_teleop`

### 시뮬레이션 루프 — `SimLoop` / `main`

프레임당 액션을 정의하고 순서를 정립하는 **스케줄러** 역할이다.

**Step 1 —** `world.step(render=True)`: 물리/센서/렌더 한 프레임 진행(센서 샘플링·제어 적용 순서 고정)
**Step 2 —** `cmd_vec` 합성: 텔레옵 + 자율(`read_twist_from_graph()`의 Twist)을 더함(가중치 블렌딩 권장)
**Step 3 —** `obs = obsb.build(cmd_vec)`: 현재 프레임 상태를 48차원 관측으로 패킹
**Step 4 —** `action = policy.infer(obs)`: 12차원 보행 액션 추론
**Step 5 —** `ctrl.apply_actions(action, ats_cmd)`: Spot/ATS 아티큘레이션 갱신
**Step 6 —** `obsb.update_prev_action(action)`: 직전 액션 저장(보행 위상 안정성)
**Step 7 —** `ctrl.trigger_graph()`: ATS 그래프에 1프레임 임펄스 신호(매 프레임이 아닌 필요 시점만)

!!! note "`main()` 부팅 순서"
    `cfg = load_cfg()` → `sim = SimulationApp(...)`(Isaac 부팅) → `sim.update()`(1프레임 플러시) → **모듈 임포트**(Isaac 런타임 이후라야 타입 미등록 방지) → `world = SimWorld(...)`(USD 로드, ArticulationView 래핑, `/World/odom` 정리, `fixed_time.step`/`target_hz` 설정) → 그래프 빌드(`build_camera_ros_graph`/`build_ats_graph`/LiDAR 그래프) → `play()` → 메인 루프 → `sim.close()`

---

## 5. 테스트와 자율주행 연동

### Isaac 실행 & 토픽 발행 확인

!!! note "여기서 잠깐 — 왜 `./python.sh`로 진입해야 하나?"
    Isaac Sim은 단순한 파이썬 시뮬레이터가 아니라 **Omniverse 런타임 위에서 동작하는 복합 실행 환경**이다. `import omni`, `from isaacsim import SimulationApp` 같은 코드는 일반 라이브러리가 아니라 **런타임에 동적 로드되는 확장 모듈(Extension)** 을 부르는 것이다. 기본 `python3`에는 `omni`, `carb`, `pxr`, `isaacsim` 경로가 없으므로, 엔진이 `sys.path`와 `.so`를 등록해주는 전용 런처 **`./python.sh`** 를 통해 진입해야 한다.

실행 시 다음 토픽이 발행되는지 확인한다.

```bash
/yolo/image_raw      # 카메라 RGB
/camera_info         # 카메라 내부 파라미터
/imu                 # 합성 IMU
/odom                # 오도메트리
/scan                # 2D LaserScan
/point_cloud2        # 3D PointCloud2
```

![Isaac 실행 및 토픽 발행](img/w07/s68.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 68 (출처: ENGI UNIVERSE)
///

### RViz2 동작 확인

- **시간**: RViz2에서 ROS Time 증가 확인. 정지했다면 `use_sim_time` 체크 박스 확인
- **LaserScan**: Add → topic `/scan` → 라이다 정보 표시
- **Image**: `/yolo/image_raw`로 카메라가 ATS 짐벌에서 동작하는지 확인
- **Odometry**: `/odom`은 로봇 이동 궤적(trajectory). 제자리 회전 시 `base_link(body)` 방향 변화 반영 확인
- **TF 구조**: `map → odom → body → sensors`
    - `slam_toolbox` 실행 시 `map` 프레임 생성, Isaac 오도메트리는 `odom` 프레임 발행
    - `body`가 `odom`의 자식, 카메라·IMU·라이다가 각각 `body` 아래 개별 링크로 매달린 형태

### SLAM 모드 개념 정리

| 모드 | 특징 | 용도 |
| --- | --- | --- |
| `online_sync` | 모든 스캔 빠짐없이 처리, 정확도 우선, 연산 부담 ↑ | 정밀 매핑 |
| `online_async` | 실시간성 우선, 일부 스캔 생략 가능, 반응성 좋음 | **내비게이션 + 동시 매핑 (Nav2 기본)** |
| `localization` | 기존 지도 위에서 위치 추정만, 지도 갱신 X | 완성된 지도 위 주행 |

!!! note "여기서 잠깐 — AMCL vs slam_toolbox localization"
    지도를 **새로 그릴 때**는 SLAM이, **이미 만든 지도에서 내 위치를 찾을 때**는 Localization이 필요하다.

    - **AMCL(Adaptive Monte Carlo Localization)**: 확률 기반(Particle filter). 지도 위에 여러 '입자'를 뿌리고, 센서·오도메트리로 신뢰도를 갱신해 가장 그럴듯한 위치로 수렴. 가볍고 빠르며 `.pgm`/`.yaml` 지도만 있으면 동작.
    - **slam_toolbox localization**: 스캔 정합 기반(Pose Graph Matching). 매핑 때 만든 **pose graph**(노드=위치, 엣지=이동 관계, 루프 클로저로 연결 추가)를 그대로 불러와 정합. 연산량은 크지만 정합 정확도가 높다.
    - **Nav2 기본 구조**: 매핑은 `slam_toolbox`의 `online_async`가, 지도 위 주행 위치 추정은 `nav2_bringup`의 `localization_launch.py` → `amcl.launch.py`가 담당.

![RViz2에서 Spot+ATS 동작 확인](img/w07/s74.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 74 (출처: ENGI UNIVERSE)
///

### 자율주행 연동 — Nav2 ↔ Isaac

**Step 1 —** `slam_launch.py`로 실행 → 기본 모드 `online_async`(매핑+주행). 2D Pose Estimate 없이도 시작 포즈가 map 기준으로 자동 정렬되고, 라이다 스캔 + 오도메트리로 지도와 위치가 함께 수렴(점군이 지도 윤곽과 겹치면 정합 성공)
**Step 2 —** RViz에서 **2D Nav Goal** 클릭 → Nav2가 `/cmd_vel` 퍼블리시
**Step 3 —** Isaac 측 `SubscribeTwist` 노드가 `/cmd_vel` 수신
**Step 4 —** `RobotController.read_twist_from_graph()`에서 정책 명령 + `/cmd_vel`을 합성해 사용

!!! success "경로(Path) 시각화로 동작 확인"
    RViz Displays에서 Path ON → 2D Nav Goal 지정 시 `/plan` 기반 trajectory가 지도 위에 표시되고, `/odom` 경로가 목표를 향해 부드럽게 이동, Local Costmap이 장애물을 피해 갱신, 라이다 스캔이 지도와 안정적으로 정합된다. **로봇이 제자리에서 떨기만 한다면** `nav2_params.yaml`의 최대 속도/가속도 제한 값을 조정한다.

---

## 6. Wrap-up

![Wrap-up — 오늘 강의 요약](img/w07/s78.jpg){ width="720" }
/// caption
Spot + ATS SLAM 연동 part 1 — 슬라이드 78 (출처: ENGI UNIVERSE)
///

- **SLAM 시스템 구조 설계** — 모듈 분할(world/graph_builder/observation/policy/controller/input/loop/main)
- **`slam_toolbox` + Nav2 파이프라인 구성** — 센서·TF 퍼블리시 → 지도 작성 → 위치 추정
- **2D Nav Goal을 통해 로봇 자율 이동 확인** — Nav2 `/cmd_vel` → Isaac SubscribeTwist → 정책+자율 명령 합성

## ✅ 체크포인트

- [ ] Isaac Sim에 Spot + ATS를 로드하고 ArticulationView로 제어 루프를 준비할 수 있는가
- [ ] `graph_builder`로 카메라·IMU·Odom·LiDAR 토픽과 TF 트리(map–odom–body–sensor)를 퍼블리시할 수 있는가
- [ ] 48차원 관측 → TorchScript 정책 → 12차원 액션 → Spot/ATS 제어의 흐름을 설명할 수 있는가
- [ ] RViz2에서 `/scan`·`/odom`·TF·Image가 정상 표시되고 `use_sim_time`이 동작하는가
- [ ] `slam_toolbox`(online_async) + Nav2로 2D Nav Goal 기반 자율 이동을 시연할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| 환경 세팅·로드 | 20 | Spot + ATS USD 로드, Articulation Root 초기화, 시간축 통일 |
| ROS2 브릿지·TF | 25 | 센서 토픽 퍼블리시 + TF 트리(map–odom–body–sensor) 정합 유지 |
| 정책·제어 실행 | 25 | 48차원 관측·12차원 액션·Spot/ATS 제어식 정확 구현 및 안전장치 |
| SLAM·Nav2 연동 | 20 | slam_toolbox 매핑 + 2D Nav Goal 자율 이동 시연 |
| 디버깅·운용 | 10 | RViz2 검증, `Render product not valid` 등 오류 진단·해결 |

## 🔗 출처 및 참고자료

- 교안 **「Spot + ATS SLAM 연동 part 1 (ROS2 브릿지·자율주행)」** (제작: ENGI UNIVERSE)
- slam_toolbox — <https://github.com/SteveMacenski/slam_toolbox>
- Nav2 (Navigation2) — <https://docs.nav2.org>
- NVIDIA Isaac Sim ROS 2 Bridge — <https://docs.isaacsim.omniverse.nvidia.com>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [ROS 2 통합(랜딩)](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/ros2_landing_page.html)
    - [ROS 2 튜토리얼](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/ros2_tutorials/index.html)

## 📝 7주차 과제

!!! example "과제 7 — Spot+ATS SLAM 연동 파이프라인 구성"
    **목표**: Isaac Sim의 Spot+ATS 센서를 ROS2로 퍼블리시하고 TF 트리를 정합하여 SLAM 자율보행 파이프라인을 구성한다.

**수행 단계**

1. Spot+ATS 모델 로드 및 물리 연동
2. 센서(LiDAR/Odom)를 ROS2 토픽으로 발행
3. TF 트리 정합 확인(`view_frames`)
4. SLAM/Nav2와 연동해 자율주행 테스트

**제출물**

- [ ] 노드/토픽 그래프(rqt_graph) 캡처
- [ ] TF 트리(frames.pdf)
- [ ] 센서 토픽 echo/hz 로그
- [ ] 자율보행 시연 영상

**평가 (배점 100)**

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| ROS2 브릿지·센서 발행 | 35 | 토픽 정상 발행 |
| TF 정합 | 30 | 좌표계 일관성 |
| 자율주행 연동 | 35 | 파이프라인 동작 |

**제출 형식·마감**: 다음 주차 강의 시작 전까지 LMS 업로드 — ① 코드/설정 `zip` ② 보고서 `PDF`(표지: 학번·이름·과제명) ③ 실행 결과 스크린샷/영상. 코드는 재현 가능해야 하며, 외부 코드를 사용하면 출처를 명시한다(미표기 시 감점).

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (79매)"
    ![슬라이드 01](img/w07/s01.jpg){ width="700" }
    ![슬라이드 02](img/w07/s02.jpg){ width="700" }
    ![슬라이드 03](img/w07/s03.jpg){ width="700" }
    ![슬라이드 04](img/w07/s04.jpg){ width="700" }
    ![슬라이드 05](img/w07/s05.jpg){ width="700" }
    ![슬라이드 06](img/w07/s06.jpg){ width="700" }
    ![슬라이드 07](img/w07/s07.jpg){ width="700" }
    ![슬라이드 08](img/w07/s08.jpg){ width="700" }
    ![슬라이드 09](img/w07/s09.jpg){ width="700" }
    ![슬라이드 10](img/w07/s10.jpg){ width="700" }
    ![슬라이드 11](img/w07/s11.jpg){ width="700" }
    ![슬라이드 12](img/w07/s12.jpg){ width="700" }
    ![슬라이드 13](img/w07/s13.jpg){ width="700" }
    ![슬라이드 14](img/w07/s14.jpg){ width="700" }
    ![슬라이드 15](img/w07/s15.jpg){ width="700" }
    ![슬라이드 16](img/w07/s16.jpg){ width="700" }
    ![슬라이드 17](img/w07/s17.jpg){ width="700" }
    ![슬라이드 18](img/w07/s18.jpg){ width="700" }
    ![슬라이드 19](img/w07/s19.jpg){ width="700" }
    ![슬라이드 20](img/w07/s20.jpg){ width="700" }
    ![슬라이드 21](img/w07/s21.jpg){ width="700" }
    ![슬라이드 22](img/w07/s22.jpg){ width="700" }
    ![슬라이드 23](img/w07/s23.jpg){ width="700" }
    ![슬라이드 24](img/w07/s24.jpg){ width="700" }
    ![슬라이드 25](img/w07/s25.jpg){ width="700" }
    ![슬라이드 26](img/w07/s26.jpg){ width="700" }
    ![슬라이드 27](img/w07/s27.jpg){ width="700" }
    ![슬라이드 28](img/w07/s28.jpg){ width="700" }
    ![슬라이드 29](img/w07/s29.jpg){ width="700" }
    ![슬라이드 30](img/w07/s30.jpg){ width="700" }
    ![슬라이드 31](img/w07/s31.jpg){ width="700" }
    ![슬라이드 32](img/w07/s32.jpg){ width="700" }
    ![슬라이드 33](img/w07/s33.jpg){ width="700" }
    ![슬라이드 34](img/w07/s34.jpg){ width="700" }
    ![슬라이드 35](img/w07/s35.jpg){ width="700" }
    ![슬라이드 36](img/w07/s36.jpg){ width="700" }
    ![슬라이드 37](img/w07/s37.jpg){ width="700" }
    ![슬라이드 38](img/w07/s38.jpg){ width="700" }
    ![슬라이드 39](img/w07/s39.jpg){ width="700" }
    ![슬라이드 40](img/w07/s40.jpg){ width="700" }
    ![슬라이드 41](img/w07/s41.jpg){ width="700" }
    ![슬라이드 42](img/w07/s42.jpg){ width="700" }
    ![슬라이드 43](img/w07/s43.jpg){ width="700" }
    ![슬라이드 44](img/w07/s44.jpg){ width="700" }
    ![슬라이드 45](img/w07/s45.jpg){ width="700" }
    ![슬라이드 46](img/w07/s46.jpg){ width="700" }
    ![슬라이드 47](img/w07/s47.jpg){ width="700" }
    ![슬라이드 48](img/w07/s48.jpg){ width="700" }
    ![슬라이드 49](img/w07/s49.jpg){ width="700" }
    ![슬라이드 50](img/w07/s50.jpg){ width="700" }
    ![슬라이드 51](img/w07/s51.jpg){ width="700" }
    ![슬라이드 52](img/w07/s52.jpg){ width="700" }
    ![슬라이드 53](img/w07/s53.jpg){ width="700" }
    ![슬라이드 54](img/w07/s54.jpg){ width="700" }
    ![슬라이드 55](img/w07/s55.jpg){ width="700" }
    ![슬라이드 56](img/w07/s56.jpg){ width="700" }
    ![슬라이드 57](img/w07/s57.jpg){ width="700" }
    ![슬라이드 58](img/w07/s58.jpg){ width="700" }
    ![슬라이드 59](img/w07/s59.jpg){ width="700" }
    ![슬라이드 60](img/w07/s60.jpg){ width="700" }
    ![슬라이드 61](img/w07/s61.jpg){ width="700" }
    ![슬라이드 62](img/w07/s62.jpg){ width="700" }
    ![슬라이드 63](img/w07/s63.jpg){ width="700" }
    ![슬라이드 64](img/w07/s64.jpg){ width="700" }
    ![슬라이드 65](img/w07/s65.jpg){ width="700" }
    ![슬라이드 66](img/w07/s66.jpg){ width="700" }
    ![슬라이드 67](img/w07/s67.jpg){ width="700" }
    ![슬라이드 68](img/w07/s68.jpg){ width="700" }
    ![슬라이드 69](img/w07/s69.jpg){ width="700" }
    ![슬라이드 70](img/w07/s70.jpg){ width="700" }
    ![슬라이드 71](img/w07/s71.jpg){ width="700" }
    ![슬라이드 72](img/w07/s72.jpg){ width="700" }
    ![슬라이드 73](img/w07/s73.jpg){ width="700" }
    ![슬라이드 74](img/w07/s74.jpg){ width="700" }
    ![슬라이드 75](img/w07/s75.jpg){ width="700" }
    ![슬라이드 76](img/w07/s76.jpg){ width="700" }
    ![슬라이드 77](img/w07/s77.jpg){ width="700" }
    ![슬라이드 78](img/w07/s78.jpg){ width="700" }
    ![슬라이드 79](img/w07/s79.jpg){ width="700" }
