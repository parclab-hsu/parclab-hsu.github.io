---
noindex: true
---

# 기술 상세 — 제조환경 Digital Twin·Deformation Engine 기반 Robot RFM 데이터팩토리

:material-circle-outline:{ style="color:#e0a800" } **컨소시엄 제안** · 기술 근거·수치·운영 규약

!!! tip "이 페이지의 범위"
    과제 개요·대표 성과·일정·예산 요약은 **[대표 페이지](index.md)** 에 있습니다.
    여기는 그 주장을 뒷받침하는 **기술 근거와 운영 규약**입니다.

---

## 왜 제조환경에는 물리적으로 반응하는 Digital Twin이 필요한가

제조 로봇의 성능은 3D 형상만으로 결정되지 않습니다. 같은 공간과 작업이라도 바닥 마찰,
부품 공차, 포장재 강성, 그리퍼 접촉, 설비 진동, 센서 노이즈, 작업 순서와 누적 사용 상태에 따라
로봇의 관측과 행동 결과가 달라집니다. 따라서 RFM 학습용 제조 Digital Twin은 다음 세 계층을
동시에 표현해야 합니다.

| 계층 | 표현 대상 | RFM 학습에서의 의미 |
|---|---|---|
| Geometry Twin | 공간, 설비, 치구, 부품, 로봇의 형상·좌표·Semantic | 인식, 위치추정, 경로계획의 기준 |
| Physics Twin | 질량·관성, 마찰, 강성, 감쇠, 접촉, 변형·복원 특성 | 접촉행동과 실패조건의 재현 |
| Behavior Twin | 공정 순서, 로봇 행동, 정상·실패·복구 시나리오 | Task–Observation–Action 학습 데이터 생성 |

```mermaid
flowchart TB
    REAL["실제 제조환경<br/>공간·설비·로봇·작업"] -->|Scan · Mapping · 도면| DT["Simulation-ready<br/>Digital Twin"]
    DT --> PHYS["Material & Physics Layer<br/>물성·접촉·변형"]
    PHYS --> SIM["Isaac Sim / ROS 2<br/>Robot·Sensor·Task"]
    SIM --> DATA["Robot Learning Data<br/>관측·상태·행동·이벤트"]
    DATA --> RFM["Robot Foundation Model<br/>학습·평가"]
    RFM --> ROBOT["Physical Robot<br/>제조작업 검증"]
    ROBOT -.->|Failure · Edge Case · Domain Gap| DT
    ROBOT -.->|Validation Feedback| PHYS
```

---

## 핵심 기술: OmniLRS에서 Manufacturing Deformation Engine으로

[OmniLRS](https://github.com/OmniLRS/OmniLRS)는 NVIDIA Isaac Sim 기반의 오픈소스 달 탐사
로봇 시뮬레이터로, 절차적·무작위 지형 생성, ROS 2 연계, 합성데이터 생성과 함께 로버 주행에
따른 지형 변형을 지원합니다. 한성대학교는 OmniLRS 기반 달 로버 시뮬레이션과 HILS 연구에서
확보한 경험을 토대로, 변형지형 엔진의 개념을 제조 로봇의 **접촉–물성–상태 변화** 문제로
파생·고도화합니다.

### OmniLRS 기반 기술의 제조환경 전환

| OmniLRS 변형지형 개념 | 제조환경 Deformation Engine으로의 확장 |
|---|---|
| Wheel Footprint | 바퀴·그리퍼·공구·부품의 Contact Patch |
| 접촉력–변형깊이 회귀 | 힘·토크·접촉시간·속도에 따른 변위·변형 응답 |
| 반복 통과 시 변형 누적·감쇠 | 반복 하중, 마찰, 마모, 히스테리시스, 영구변형 상태 |
| Depth·Boundary Distribution | 접촉부 변형 형상과 영향영역 분포 |
| 지형·조명·Asset Randomization | 재질·공차·마찰·강성·배치·센서·작업조건 Randomization |
| ROS 2와 합성데이터 | 로봇 상태·행동·접촉·성공/실패가 시간 동기화된 학습 Episode |

OmniLRS의 기존 Deformation Engine은 접촉력으로부터 변형 깊이를 계산하는 비교적 단순한
모델을 사용합니다. 제조환경 확장에서는 소재·형상·온도·속도·시간 의존성과 접촉 이력을
포함할 수 있도록 모델을 모듈화하고, 실제 계측 데이터로 파라미터를 보정합니다.

### 파생의 근거가 되는 OmniLRS 수행실적

Deformation Engine 파생은 개념 차용이 아니라, 한성대학교가 직접 구동·계측·확장해 본 환경에서
출발합니다. 아래는 확보된 수행실적이며, 그대로 제조환경 요소로 치환할 대상입니다.

| 수행 항목 | 확보된 실적 | 제조환경 전환 대상 |
|---|---|---|
| 실행환경 | **Isaac Sim 5.0.0 + OmniLRS + ROS 2 Humble** Docker 통합 구동 | 제조 Cell·Line Simulation 실행환경 |
| 환경 구성 | Hydra 기반 단일 yaml로 환경·모드·렌더링·물리엔진 통합 제어 | 설비·공정·Robot·Sensor 조건의 Scenario 파라미터화 |
| 환경 종류 | `lunalab`(Digital Twin) · `lunaryard_20m/40m`(절차생성) · `largescale`, 각각 `_deformable` 변형지형 | 실측 기반 제조 Cell Twin과 절차생성 Layout, 변형 대상물 |
| 실시간 제어 | 조명·태양광·렌즈·렌더·지형·로봇 6개 카테고리 **ROS 2 토픽 제어** (조명 on/off·세기, 광원 위치·자세, 암석 배치 랜덤화, 로봇 Spawn·Reset·Teleport) | 조명·설비·부품 배치·로봇 초기상태의 Randomization 제어면 |
| 합성데이터 | 조명·지형 자동 변화 + 카메라 랜덤 시점, **1회 Run당 약 1,000 프레임 자동 생성 후 종료** | 제조 Task Episode의 자동 대량 생성 |
| 자동 Annotation | Bounding Box · Instance Segmentation · Pixel-level Labeling | 6D Pose·Collision·접촉·변형·이벤트 Ground Truth |
| Sim-to-Real 효과 | **암석 Instance Segmentation** 에서 합성데이터 사전학습 후 실물 Fine-tuning 한 모델이 실물 단독 학습 대비 **Average Precision 약 14% 향상**(OmniLRS 문헌 보고값, 자체 재현 예정) | 제조 부품·결함 인식의 사전학습 기여도 검증 |
| 접촉물리 | Grouser Wheel 지형변형 모델 이식 — 슬립·침하, Mesh 실시간 변형, 접촉력·저항력 모델링 | 그리퍼·공구·부품 접촉의 변형·미끄럼·잔류변형 |

!!! note "무엇이 새로 개발되는가"
    OmniLRS의 변형 모델은 **접촉력에서 변형 깊이를 얻는 단일 경로**이며, 대상 물성이 월면토로
    고정되어 있습니다. 제조환경에서는 대상이 금속·수지·포장재·탄성체로 바뀌고 온도·속도·반복이력에
    따라 응답이 달라지므로, **물성 Profile 분리 · 응답 모델 교체 가능 구조 · 실계측 파라미터 보정**이
    새로 개발되어야 할 범위입니다.

    변형지형 참조 구현: Kamohara, J., Ares, V. E., Hurrell, J., Takehana, K., Richard, A., Santra, S.,
    Uno, K., Rohmer, E., & Yoshida, K. (2024). *Modeling of terrain deformation by a grouser wheel for
    lunar rover simulation.* Proc. 21st Int'l & 12th Asia-Pacific Regional Conf. of the ISTVS, 283–289.

### Manufacturing Deformation Engine의 구성

```mermaid
flowchart TB
    INPUT["입력<br/>Contact Force·Torque·Velocity·Pose"] --> PATCH["Contact Patch Estimator"]
    MAT["Material Profile<br/>마찰·강성·감쇠·복원·공차"] --> RESPONSE["Material Response Model"]
    PATCH --> RESPONSE
    HISTORY["State History<br/>반복하중·마모·잔류변형"] --> RESPONSE
    RESPONSE --> UPDATE["Geometry / Collider / Material State Update"]
    UPDATE --> SENSOR["Camera·Depth·LiDAR·F/T·Tactile Observation"]
    UPDATE --> LABEL["Deformation·Contact·Failure Ground Truth"]
    SENSOR --> EPISODE["RFM Training Episode"]
    LABEL --> EPISODE
```

개발 대상은 특정 단일 물리모델에 고정하지 않고 다음과 같이 계층화합니다.

- **Material Profile** — 마찰, 반발, 밀도, 강성, 감쇠, 복원, 파손·변형 임계값과 불확실성 범위
- **Contact Model** — 로봇 바퀴·그리퍼·공구와 대상물 사이의 접촉면·힘·토크·미끄럼 추정
- **Response Model** — 탄성·점탄성·소성·마모 등 Use Case별 변형 응답 모듈
- **State Update** — 변형된 형상, Collision, 표면 상태와 누적 이력의 실시간 또는 준실시간 갱신
- **Data Labeler** — 접촉, 변형량, 물성 파라미터, 정상·실패·복구 이벤트의 자동 Ground Truth 생성
- **Calibration Interface** — 실제 센서·시험 결과를 이용한 파라미터 식별과 Sim-to-Real 오차 보정

---

### 기존 물리엔진 위에 무엇을 더하는가

"Isaac Sim 에 이미 Deformable 이 있지 않은가"는 반드시 나오는 질문입니다. 답부터 적으면,
**대체하지 않습니다.** NVIDIA PhysX 는 FEM 기반의 Surface·Volume Deformable 을 지원하고 금속판·
고무 같은 재료 거동도 표현할 수 있습니다. 본 과제가 더하는 것은 **더 나은 물리 계산이 아니라,
그 계산을 제조 RFM 학습데이터 생산체계로 전환하는 계층**입니다.

| 계층 | PhysX 가 제공 | Manufacturing Deformation Engine 이 추가 |
|---|---|---|
| 변형 계산 | FEM 기반 Surface·Volume Deformable | **그대로 활용** — 재구현하지 않음 |
| 물성 값 | 사용자가 지정하는 재료 파라미터 | **제조현장 실측으로 식별·보정한 Material Profile** |
| 상태 이력 | 시뮬레이션 세션 내 상태 | **세션을 넘는 반복하중·마모·잔류상태 누적과 버전 관리** |
| 응답 모델 | 엔진이 제공하는 재료 모델 | **소재군별 교체형 Response Model 과 Calibration 절차** |
| 학습용 정답 | 별도 구성 필요 | **접촉점·힘·변형량·이벤트 Ground Truth 자동 생성** |
| 의미·추적 | — | **Ontology 연결과 Provenance** — 어떤 조건의 사건인지 검색·재현 가능 |
| 판정 | 사용자 정의 | **NRMSE·잔류변형량 등 정량 오차 기준** |

!!! tip "방어하기 좋은 주장"
    "PhysX 보다 물리를 더 잘한다"가 아니라 **"PhysX 를 제조 RFM 학습데이터 생산체계로 전환한다"**
    입니다. 범용 엔진의 변형 계산 위에 **실측 보정된 물성 · 반복이력 · 자동 Ground Truth ·
    Ontology·Provenance** 를 결합하는 것이 본 과제의 개발 범위입니다.

| 구분 | OmniLRS 원형 | 본 과제 신규 개발 |
|---|---|---|
| 대상 물성 | 월면토 고정 | **제조 소재군 Profile (금속·수지·포장재·탄성체)** |
| 응답 경로 | 접촉력 → 변형깊이 단일 경로 | **교체형 Response Model, 온도·속도·이력 의존** |
| 파라미터 | 논문값 고정 | **Calibration Tool 로 실계측 보정** |
| 산출 | 지형 변형 | **Engine Module · Material Library · Calibration Tool · Data Labeler** |

### 개발 단계와 버전별 검증목표

엔진은 한 번에 완성되지 않습니다. **재현할 수 있는 물리현상의 범위를 단계적으로 넓히고, 각 단계마다
실측으로 검증**합니다. 아래 소재군·현상은 Use Case 확정 시 대상에 맞춰 교체될 수 있습니다.

| 버전 | 시기 | 재현 범위 | 검증 방법 | 완료 판정 |
|---|---|---|---|---|
| **v0** 기준선 | 1차년도 | OmniLRS 원형 이식 — 단일 접촉력→변형깊이 | 월면토 조건 재현 재확인 | 기존 결과와 동일 재현 |
| **v1** 탄성·강체 접촉 | 2차년도 | 마찰·반발·강성·감쇠, 그리퍼 파지와 미끄럼 | 기준 시편 접촉력–변위 시험 | 접촉력 NRMSE ≤ 20 % |
| **v2** 소성·잔류변형 | 3차년도 | 영구변형, 반복하중, 히스테리시스, 포장재·연성부품 | 반복하중 시험, 형상 스캔 대조 | 잔류변형량 오차 ≤ 25 % |
| **v3** 이력·마모 | 4차년도 | 누적 사용상태, 표면 마모, 공차 변화의 장기 영향 | 장시간 반복운전 로그 대조 | 추세 상관계수 **≥ 0.8**, 기울기 오차 **≤ 30 %** |

각 버전은 **Material Profile을 교체하면 다른 소재군으로 확장되는 구조**로 만듭니다. 특정 소재에
맞춘 수식을 하드코딩하지 않는 것이 설계 원칙입니다.

### 왜 이 항목을 한성대가 맡아야 하는가

| 관점 | 근거 |
|---|---|
| 코드 수준 경험 | OmniLRS 변형지형 엔진을 **직접 구동·수정·계측**해 봤다. 논문 구현을 이식해 슬립·침하와 Mesh 실시간 변형을 재현한 이력이 있다 |
| 역할 분담상의 위치 | **현재 협의안 기준** 모빌테크는 3D Asset, 타 기관은 데이터 플랫폼·모델·Robot HW 를 맡는다. 접촉물리·물성 계층은 **한성대가 주도 제안하는 영역**이며 최종 분담은 컨소시엄 협약으로 확정한다 |
| 검증 수단 보유 | HSU-PAC 의 Manipulation Cell·F/T·Tactile 센서로 시뮬레이션 값과 실측을 같은 자리에서 대조할 수 있다 |
| 확장 경로 | 달 지형이라는 극단 조건에서 출발했기 때문에, 물성 범위를 넓히는 방향의 일반화가 자연스럽다 |

!!! note "이 계층이 다른 산출물과 어떻게 연결되는가"
    Deformation Engine 은 독립 산출물이 아니라 **다른 산출물의 입력**입니다. 접촉으로 상태가 변하는
    조건이 갖춰져야 파지 실패·미끄럼·변형 같은 사건이 데이터로 남고, 그래야 Edge Case Extractor 가
    걸러낼 대상이 생기며, 학생 Demonstration 의 복구 행동에 재현할 상황이 주어지고, Sim-to-Real Gap
    분석이 형상 오차를 넘어 물리 오차까지 다룰 수 있습니다. 세 성과가 서로를 필요로 하는 구조입니다.

---

## Physical AI 구축 환경 최적화 — Cosmos · Isaac Sim · LeRobot

세 가지를 각각 잘하는 일에만 쓰고, 그 사이를 한성대가 잇는 구조입니다. 무엇을 직접 만들고
무엇을 가져다 쓰는지 분명히 나눕니다.

| 계층 | 무엇을 쓰나 | 무엇을 얻나 | 누가 만드나 |
|---|---|---|---|
| 외관·환경 다양화 | **NVIDIA Cosmos** (World Foundation Model) | 조명·재질·시점·배경의 사실적 다양성, 희소 장면 생성 | 가져다 씀 |
| 물리·정답 | **Isaac Sim + Manufacturing Deformation Engine** | 접촉력·변형량·잔류상태와 자동 Ground Truth | **한성대 개발** |
| 의미·조준 | **Manufacturing Ontology** | 무엇을 생성할지 결정하는 조건, 사건의 의미 색인 | **한성대 개발** |
| 행동 | 학생 Teleoperation · 실물 Robot | 사람의 성공·실패회피·복구 행동 | **한성대 운영** |
| 정규화·학습 | **LeRobot / LeRobotDataset v3** | 모든 출처를 한 포맷으로, RFM 기관이 바로 학습 | 규약 정의 |

!!! tip "한 문장으로"
    **Cosmos 는 그럴듯함을 만들고, 한성대 엔진은 정답을 만듭니다.**
    Cosmos 3 는 텍스트·이미지·비디오·음향·행동을 아우르는 개방형 World Foundation Model 로
    사실적인 물리 환경 영상을 생성하지만, **그 장면에서 그리퍼가 부품을 얼마의 힘으로 눌렀고
    얼마나 변형됐는지는 알지 못합니다.** 제조 RFM 학습에 필요한 것은 그 값입니다.

### 왜 Cosmos 만으로는 부족한가

| Cosmos 가 주는 것 | 제조 RFM 학습에 더 필요한 것 | 한성대가 채우는 방식 |
|---|---|---|
| 사실적 장면·시점·재질의 다양성 | 접촉력·토크·변형량·잔류상태의 **수치 정답** | Deformation Engine 의 자동 Ground Truth |
| 그럴듯한 다음 행동 예측 | **왜 실패했는가**의 인과·상태전이 | Ontology Temporal Knowledge Graph |
| 대량 생성 | **무엇을 생성해야 하는가**의 조준 | Ontology 희소조합 분석 → 생성 조건 |
| 일반 도메인 지식 | 이 공장의 설비·공차·소재 | 모빌테크 Digital Twin + 실계측 Material Profile |
| — | 생성물의 **재현성·출처 추적** | Versioned Episode Factory · Provenance |

### Ontology 조건으로 Cosmos 생성을 조준합니다

무작위 프롬프트로 대량 생성하면 이미 흔한 장면만 늘어납니다. 한성대는 **Ontology 가 희소하다고
판단한 조합을 생성 조건으로 변환**해 Cosmos 에 넘깁니다. "많이 만들기"가 아니라 "없는 것 만들기"입니다.

```mermaid
flowchart TB
    ONT["Manufacturing Ontology<br/>Asset·Process·State·Failure"] --> GAP["Coverage 분석<br/>재질×공차×조명×Pose 희소조합"]
    GAP --> COND["생성 조건 명세<br/>Prompt · Layout · Sensor 조건"]
    COND --> COSMOS["NVIDIA Cosmos<br/>외관·환경 다양화"]
    DT["Digital Twin + Deformation Engine"] --> ISAAC["Isaac Sim Rollout<br/>물리·접촉·변형"]
    COND --> ISAAC
    COSMOS --> PAIR["Scene–Scenario 정합<br/>Asset·Scenario·Task·Material 버전 공유"]
    ISAAC --> PAIR
    TELE["학생 Teleoperation<br/>행동·복구"] --> NORM
    PAIR --> NORM["LeRobotDataset v3 정규화<br/>Observation·Action·Physics·Provenance"]
    NORM --> RFM["RFM 학습·평가"]
    RFM -->|Confidence 저하·행동 불일치| GAP
```

**핵심은 조건·의미 정합입니다 — 픽셀·좌표 정합이 아닙니다.**

| 무엇을 맞추나 | 어떻게 |
|---|---|
| 공유하는 것 | **Asset ID · Scenario 조건 · Task 정의 · Material Profile 버전** |
| Cosmos 담당 | 외관·환경 증강 — 조명·재질 질감·시점·배경의 사실적 다양성 |
| Isaac Sim 담당 | **접촉력·Pose·변형량 등 물리 Ground Truth 는 여기서만 생성** |
| 판정 | 두 산출물이 **같은 Asset·조건·Task 를 참조하는지**로 판정. 생성 영상과 시뮬레이션 상태를 정밀 공간정합하지 않는다 |

Cosmos 생성물은 **정답 없는 외관 증강**이고, 정답이 필요한 학습은 Isaac Sim Episode 로 합니다.
둘을 같은 Scenario 아래 묶어 관리하는 것이 Versioned Episode Factory 의 역할입니다.

### LeRobotDataset 을 단일 데이터 계약으로

출처가 넷(Isaac Sim 합성 · Cosmos 증강 · 실물 Robot · 학생 Teleoperation)인데 포맷이 넷이면
RFM 기관이 매번 변환기를 만들어야 합니다. **모든 출처를 LeRobotDataset v3 로 정규화**합니다.

| LeRobotDataset v3 특성 | 본 과제에서의 쓰임 |
|---|---|
| Parquet + MP4, 다중 Episode 를 한 파일에 | 대량 합성 Episode 의 저장·전송 효율 |
| 관계형 Metadata 로 Episode 경계 해석 | **Ontology ID·Material 버전·Scenario Seed 를 Metadata 에 심어 검색 가능** |
| `delta_timestamps` 윈도잉 | 접촉 직전·직후 구간을 잘라 실패·복구 학습에 사용 |
| Streaming (`StreamingLeRobotDataset`) | 대용량 Dataset 을 내려받지 않고 학습 |
| Hugging Face Hub 생태계·PyTorch 연동 | RFM 기관이 별도 변환 없이 바로 학습 |

!!! note "확장 필드는 우리가 정의합니다"
    표준 LeRobotDataset 에는 **접촉력·변형량·물성 파라미터·Edge Case ID** 필드가 없습니다.
    한성대가 이를 확장 필드로 정의하고 규약을 문서화합니다. 표준 필드만 읽는 기존 도구와도
    호환되도록 **필수 필드는 표준 그대로 두고 확장은 별도 네임스페이스**에 둡니다.

### HSU-PAC 위에서의 실행 배치

무엇을 어디서 돌릴지가 정해져 있어야 자원이 낭비되지 않습니다.

| 작업 | 실행 위치 | 이유 |
|---|---|---|
| Isaac Sim + Deformation Engine Rollout | 교내 GPU 서버 | 상시 반복, 지연에 민감, 라이선스·자산이 로컬 |
| Cosmos 추론 — Nano(16B) | **교내 GPU 서버 (RTX PRO 6000 계열)** | 워크스테이션급에서 구동. 1차년도 타당성 검증과 조건 제어 실험 |
| Cosmos 추론 — Super(64B) | 컨소시엄 공용 GPU · 클라우드 버스트 | 데이터센터급 다중 GPU 필요. 대규모 생성 시에만 |
| LeRobot 정규화·품질검사 | 교내 CPU·스토리지 | I/O 중심, GPU 불필요 |
| RFM Fine-tuning·평가 | DGX Spark 계열 · 클라우드 버스트 | 메모리 중심, 피크성 |
| 학생 Teleoperation 수집 | 실습실 + 실물 실증공간 | 사람이 있어야 함 |

**주간에는 실습·수집·실물검증을, 야간에는 Cosmos 생성과 학습 큐를 돌리는 방식**으로 장비
활용률을 높입니다. 생성물은 즉시 LeRobotDataset 으로 정규화해 다음 날 학습에 들어가도록 합니다.

### Cosmos 도입 실행계획

모델 규모에 따라 필요한 연산자원이 다릅니다. **교내에서 검증하고 규모가 필요할 때만 외부로 나갑니다.**

| 모델 | 규모 | 권장 연산자원 | 본 과제에서의 용도 | 실행 위치 |
|---|---|---|---|---|
| **Cosmos3-Nano** | 16B (8B reasoner + 8B generator) | 워크스테이션급 (RTX PRO 6000 계열) | **1차년도 타당성 검증**, 조건 제어 실험, 소량 생성 | **교내 GPU 서버** |
| **Cosmos3-Super** | 64B (32B + 32B) | Hopper·Blackwell 데이터센터 GPU (다중 GPU·layerwise offload) | 대규모 합성데이터 생성 | 컨소시엄 공용 GPU 또는 클라우드 버스트 |

**1차년도 Gate — 통과해야 2차년도 본 생성으로 갑니다.**

| Gate 항목 | 판정 기준 |
|---|---|
| Scene–Scenario 정합 | Cosmos 생성물과 Isaac Sim Episode 가 Asset ID·Scenario·Task·Material Profile 버전을 공유하는 비율 |
| 조건 일치율 | 지시한 재질·조명·Pose·배치가 생성물에 실제로 반영된 비율 (표본 육안 검수 병행) |
| 비용 | 유효 Episode 1건당 GPU-hour 와 환산 비용 |
| 품질 기여 | Cosmos 증강 유무에 따른 인식·조작 성능 차 |

!!! warning "실패 시 회귀 경로를 미리 둡니다"
    Gate 를 통과하지 못하면 **Isaac Sim Domain Randomization 중심으로 회귀**하고, Cosmos 는
    **인식 학습용 외관 증강에 한정**해 사용합니다. 조작 정책 학습은 Isaac Sim 물리량만으로
    수행합니다. 이 경우 KPI 의 *Cosmos 조건 준수율* 은 목표에서 제외하고, *Metadata 연결 완전성* 만 유지합니다.

!!! note "라이선스와 표시 의무는 착수 전 검토합니다"
    Cosmos 모델·NIM·생성물의 **라이선스 조건과 표시(attribution) 의무**, 생성물의 상업적 활용
    범위, 제조기업 데이터를 조건으로 넣었을 때의 취급을 1차년도 착수 전에 확인합니다.
    LeRobotDataset 확장 필드도 **표준 도구에서 실제로 무변환 로드되는지 호환성 시험**이 필요합니다
    — 문서상 호환과 실제 동작은 다를 수 있습니다.

!!! warning "도입 상태를 정확히 씁니다"
    Isaac Sim · ROS 2 · OmniLRS 는 **이미 구동해 본 환경**이고, LeRobot 은 HSU-PAC 소프트웨어
    스택에 포함되어 있습니다. **Cosmos 연계는 본 과제에서 새로 구축할 범위**이며 현재 수행실적이
    아닙니다.

---

## 학생 주도 Human Data Engine — Demonstration과 Edge Case 수집

HSU-PAC의 **30명·5개 조 실습체계**로 교육을 운영하고, 그 가운데 **MD-3 이수자 중 선발한 유급 참여자
6~9명(3개 조)이 과제 Dataset 생산**을 담당합니다. 학생이 실제 또는 시뮬레이션 Robot을 원격 조작하고,
성공 행동뿐 아니라 경계조건·실패회피·복구 행동을 포함한 Human Demonstration을 수집합니다.
**수집에서 끝나지 않습니다** — 같은 조가 Edge Case 파이프라인의 1차 검수·재현 조건 탐색·복구
시연까지 담당해, 학습데이터와 Edge Case가 한 팀에서 함께 만들어집니다.
이는 학생을 단순 반복작업 인력으로 사용하는 방식이 아니라, 표준 교육·안전·품질 Protocol 아래에서
**RFM 학습데이터 생산과 Physical AI 인력양성**을 함께 수행하는 산학협력 구조입니다.

```mermaid
flowchart TB
    PROTOCOL["Task·Safety Protocol<br/>Ontology·성공·실패·복구 기준"] --> TRAINING["학생 사전교육·Calibration<br/>Expert Seed Demonstration"]
    TRAINING --> TELEOP["Simulation / Physical Teleoperation<br/>교육 30명·5개 조 / 생산 유급 3개 조"]
    TELEOP --> RECORD["Multimodal Synchronized Recording<br/>Observation·Action·State·Event"]
    RECORD --> QC["자동 QC + 전문가 검수<br/>시간동기·범위·Label·재현성"]
    QC --> DATASET["Demonstration Dataset<br/>성공·실패·복구·운영자 다양성"]
    DATASET --> LEARN["Imitation·VLA/RFM Fine-tuning<br/>Recovery Policy·Evaluation"]
    LEARN -->|Hard Case·재수집 요청| PROTOCOL
```

### 수집 데이터와 활용

| 데이터군 | 수집 항목 | RFM 활용 |
|---|---|---|
| Observation | RGB/RGB-D, LiDAR, Robot State, F/T, Tactile, 설비상태 | Multimodal 인식·상태추정 |
| Action | Joint·Cartesian 명령, Gripper·Mobile Base, Teleoperation 입력 | Behavior Cloning·Action Token 학습 |
| Task·Language | Task 지시, 공정 단계, 성공조건, 작업자 판단 | Vision–Language–Action 정렬 |
| Event·Outcome | 접촉, 실패·Near-miss, 개입, 복구, 성공·품질 결과 | 실패예측·Recovery Policy 학습 |
| Provenance | Robot·Asset·Material·Scenario·Operator Group·Session 버전 | 재현성·편향분석·데이터 분할 |

운영자 식별정보는 최소화·가명화하고, 모델 평가 시에는 작업자 단위로 학습·검증 Set을 분리해
특정 조작자의 습관을 외운 성능을 배제합니다.

### Physical AI 마이크로디그리(MD) 과정 — 숙련인력 양성·선발 경로

학생 참여를 일회성 아르바이트로 두면 학기마다 숙련도가 초기화되고 데이터 품질이 흔들립니다.
**한성대는 Physical AI 마이크로디그리(MD) 과정을 숙련인력 양성·선발 경로로 설계**합니다.

!!! warning "MD 과정은 인력 경로이지 데이터 생산 라인이 아닙니다"
    **연구개발 Dataset 에 편입되는 데이터는 별도 계약·동의를 거친 유급 참여자가 생산합니다.**
    교과 실습 산출물은 **과제 Dataset 과 정량 성과에 직접 계상하지 않으며**, 동의한 범위에서
    익명 통계로만 활용합니다. 아래 표의 "그 과정에서 다루는 것"은 **교육 내용**이며, 그것이
    곧바로 과제 산출물이 되는 것은 아닙니다.

| 모듈 | 배우는 것 | 그 과정에서 다루는 것 | 관련 WP |
|---|---|---|---|
| **MD-1** Physical AI 기초 | Linux · Git · Docker · ROS 2, 재현 가능한 실행환경 | 실행환경 재현 기록, 도구 숙련도 | HSU-7 운영 |
| **MD-2** Simulation·Digital Twin | USD/URDF · Isaac Sim · 센서 시뮬레이션, **Deformation Engine 사용법** | Scenario 조건표, 물성 파라미터 관측 로그 | HSU-2 · HSU-3 |
| **MD-3** Robot Learning Data | **LeRobot·모방학습**, Teleoperation, 자동 QC, **Ontology 태깅** | Demonstration·Edge Case 검수·태깅 **실습** — 유급 참여 자격 요건 | HSU-4 · HSU-5 |
| **MD-4** RFM·Sim-to-Real | VLM/VLA·RFM 구조, 정책 이전, 평가, 캡스톤 | **Benchmark 실행 결과 · Domain Gap 측정 · 실패 사례 보고** | HSU-6 · HSU-7 |

MD-1~2 는 [HSU-PAC](../hsu-pac.md) 의 1~8주차, MD-3 은 9~10주차, MD-4 는 11~15주차 커리큘럼과
대응합니다. **없던 과정을 새로 만드는 것이 아니라, 이미 설계된 커리큘럼에 과제의 표준 Protocol 을
가르치는 구조**입니다.

### 교육–데이터–학습–결과가 한 바퀴를 돕니다

```mermaid
flowchart LR
    EDU["MD 과정 수강 (30명·5개 조)<br/>표준 Protocol 학습"] --> MD3["MD-3 이수"]
    MD3 --> GATE{"지원 · 선발<br/>참여계약 · 동의"}
    GATE -->|선발| PAID["유급 연구참여<br/>6~9명 · 3개 조"]
    GATE -->|미선발| EDUONLY["교과 실습 계속<br/>산출물은 익명 통계로만"]
    PAID --> COLLECT["데이터 생산<br/>Demonstration · Edge Case · 태깅"]
    COLLECT --> QC["자동 QC + 전문가 검수"]
    QC --> DATASET["LeRobotDataset 편입"]
    DATASET --> TRAIN["RFM 학습 · 평가"]
    TRAIN --> RESULT["결과 · 실패 사례 · Hard Case"]
    RESULT -->|다음 학기 교육 자료로| EDU
    RESULT -->|재수집 요청| COLLECT
    QC -->|반려 사유| EDU
    EDUONLY -.->|다음 기수 재지원| GATE
```

**되돌아오는 것이 있어야 교육이다.** 학생이 만든 데이터가 어떤 모델에서 어떻게 쓰였고 어디서
실패했는지를 다음 학기 교재로 되돌립니다. 구체적으로는 이렇게 씁니다.

| 되돌아오는 것 | 교육에서의 쓰임 |
|---|---|
| QC 반려 사유 통계 | 무엇을 잘못 수집하는지 — 다음 기수 사전교육 자료 |
| 모델이 실패한 Episode | 왜 이 조건이 어려운가 — MD-4 사례연구 |
| Benchmark 성능 추이 | 내 데이터가 성능을 얼마나 움직였는가 — 기여도 피드백 |
| Hard Case Queue | 다음 학기 수집 우선순위 — 조별 과제 주제 |

**학생 입장에서 이 순환이 중요한 이유** — 자기가 만든 데이터가 실제 모델을 움직이는 것을 보면
데이터 품질에 대한 감각이 생깁니다. 이것은 강의로 가르치기 어려운 부분이고, 제조 Physical AI
현장에서 곧바로 쓰이는 역량입니다.

### 두 트랙과 MD 과정의 관계

앞서 나눈 **교과 실습 / 유급 연구참여** 두 트랙은 MD 과정 위에서 이렇게 연결됩니다.

| | 교과 실습 트랙 | 유급 연구참여 트랙 |
|---|---|---|
| 대상 | MD 과정 수강생 **30명 · 5개 조** | **MD-3 이수자 중 선발 6~9명 · 3개 조** |
| 데이터 | 실습 산출물 (동의 시 익명 통계) | 연구개발 Dataset 편입 |
| 기간 | 학기 단위 | 학기 넘어 연속 |
| 역할 | 6인 역할 순환 경험 | **숙련 Operator · Quality Reviewer 로 고정 배치** |

**MD-3 이수를 유급 참여의 자격 요건으로 둡니다.** 표준 Protocol·안전·QC 를 배운 사람만 실제
Dataset 에 들어가는 데이터를 만들게 하는 것이며, 데이터 품질과 연구윤리를 동시에 지키는 장치입니다.

### 인력양성 성과 지표

**연구개발 성과와 교육 성과는 동의·회계·평가기준에 따라 분리 집계**하되, 동일한 교육–연구 피드백
순환 안에서 연계 관리합니다. 아래는 교육 성과 지표이며, 연구개발 Dataset 관련 지표는 정량 KPI 절에 있습니다.

| 지표 | 측정 방법 | 잠정 목표 |
|---|---|---|
| MD 과정 이수자 | 모듈별 이수 인원 (연간) | **연 30명 규모 유지** |
| 6개 역할 순환 이수율 | 6개 역할을 모두 경험한 비율 | 학기당 **≥ 80 %** |
| 유급 연구참여 전환 | MD-3 이수자 중 연구참여 선발 비율 | 기수당 **20~30 %** |
| 1인당 유효 Episode | QC 통과 Episode ÷ 참여 학생 수 | 기수 간 **증가 추세** |
| 숙련도 곡선 | 기수·개인별 QC 통과율 변화 | **후반 기수일수록 상승** |
| 캡스톤 성과 연계 | 과제 Use Case 를 다룬 캡스톤 수 | 학기당 **2건 이상** |

!!! note "인력양성은 부수 효과가 아니라 설계 목표입니다"
    제조 Physical AI 인력은 시장에 거의 없습니다. **데이터를 만들 줄 아는 사람이 곧 이 분야의
    실무인력**입니다. 과제가 끝나도 MD 과정과 숙련 인력은 남습니다.
    다만 **교육 성과를 연구개발 성과로 대체 계상하지 않습니다** — 회계·평가기준이 다릅니다.

### 6인 역할과 담당 산출물

각 6인 조는 아래 역할을 순환하며, 동일 Task를 여러 숙련도·전략으로 반복합니다. 역할은 명칭이
아니라 **책임지는 산출물**로 정의합니다.

| 역할 | 학습데이터 수집에서 | Edge Case 수집에서 | 책임 산출물 |
|---|---|---|---|
| Operator | Teleoperation 조작, 성공·실패회피·복구 시연 | 조작 중 이상 감지 시 **Edge Case 신고(flag)**, 복구 행동 시연 | Demonstration Episode |
| Safety Observer | 속도·힘·작업영역 감시, 비상정지 | 위험 사건의 상황·전조 기록 | Near-miss Log |
| Scenario Controller | 환경·설비·부품·센서 조건 변경 | **재현 조건 범위 탐색, 인접 Edge Case 생성** | Scenario 조건표 |
| Data Steward | 시간동기·버전·Provenance 관리 | Edge Case Package 메타데이터 정합 | Dataset·Provenance |
| Quality Reviewer | 자동 QC 결과 확인, 결측·범위 이탈 판정 | **후보 재생 확인, 중복 병합, 기각** | QC 리포트 |
| Analyst | 조별 Coverage·작업자 분산 분석 | **Ontology 태깅, 실패–복구 관계 정리** | Coverage·태깅 결과 |

한 학기 안에 6개 역할을 모두 경험하도록 순환시키므로, 학생은 **데이터를 만드는 쪽과 검증하는 쪽을
모두 겪게 됩니다.** 이것이 단순 수집 인력과 다른 지점입니다.

### 품질·안전 운영 원칙

| 관리항목 | 적용 원칙 |
|---|---|
| 작업 표준화 | Task별 SOP, Expert Seed Demonstration, 성공·실패·중단조건 사전 정의 |
| 데이터 품질 | 센서 시간동기, Action 범위검사, 결측·Outlier 탐지, 자동 QC 후 전문가 표본검수 |
| 안전 | Simulation 선행, 속도·힘·작업영역 제한, 충돌감시, 비상정지와 Safety Observer 배치 |
| 보안·윤리 | NDA·권한분리, 제조 데이터 격리, 개인정보 최소수집·가명화 |
| 연구윤리 | 참여 동의·철회 절차, 학업과 분리된 자발적 참여, 인건비 지급기준 준수, 사람 대상 데이터 수집에 해당하는 범위는 IRB 심의 여부를 사전 확인 |
| 평가 | 유효 Demonstration 시간, QC 통과율, 성공/실패/복구 Coverage, 작업자 간 분산, 재현 성공률 |

최종 수집량은 Use Case와 Robot별 Cycle Time을 실측한 뒤 확정합니다. 제안 단계에서는 단순 시간
목표보다 **QC를 통과한 Episode 수, Edge Case·Recovery Coverage, 작업자 다양성**을 핵심 KPI로 둡니다.

### 교과 실습과 연구참여는 분리합니다

30명 전원을 연구인력으로 간주하지 않습니다. **교과 실습**과 **유급 연구참여**는 근거·대가·데이터
활용범위가 다르므로 처음부터 두 트랙으로 나눕니다.

| 구분 | 교과 실습 트랙 | 유급 연구참여 트랙 |
|---|---|---|
| 대상 | 수강생 전원 | 지원·선발된 일부 (연구보조원) |
| 근거 | 교과 운영계획 | **참여계약 · 별도 동의서** |
| 대가 | 없음 (학점) | **학생인건비 — 기관 지급기준** |
| 데이터 성격 | 실습 산출물 | **연구개발 Dataset 편입 대상** |
| 성적 연계 | 데이터 생산량과 **무관** | 해당 없음 |
| 연구 활용 | 동의한 범위에서 익명 통계로만 | 동의 범위 내 Dataset 편입 |
| IRB | 해당 시 검토 | **착수 전 필요 여부 확인** |

**철회 시점을 명확히 둡니다.** Dataset 편입 전에는 개인 단위로 데이터를 삭제하고, 편입·익명화
이후에는 개인 식별이 불가능해 개별 삭제가 어렵다는 점을 사전 고지합니다. 참여 철회는 언제든
가능하며 교육과정상 불이익이 없도록 대체 과제를 둡니다.

!!! warning "표현에 주의할 것"
    "학생이 데이터를 생산한다"는 서술은 **유급 연구참여 트랙에 한정**해 씁니다. 교과 실습 산출물을
    과제 성과로 계상하려면 별도 동의와 근거가 필요합니다. 조작자 식별정보는 가명화하고, 수집
    목적·보관기간·활용범위를 사전 고지합니다.

---

## Ontology 기반 Edge Case Data Factory

제조현장의 Edge Case는 단순히 발생 빈도가 낮은 영상이 아니라, 특정 **자산·공정·상태·행동·물성·
안전제약의 조합**에서 정상 경로를 벗어난 사건입니다. 한성대학교는 Digital Twin과 실제 Robot에서
수집된 로그를 공통 Ontology에 연결하고, 규칙·희소성·상태전이·Domain Gap·모델 불확실성을 함께
분석하여 Edge Case를 **자동 후보화한 뒤 전문가가 확정**하는 구조를 제안합니다.

### Manufacturing Ontology의 기준 구조

| 계층 | 핵심 Entity·Relation | 활용 목적 |
|---|---|---|
| Factory·Line·Cell | 공간, 설비, 안전구역, 좌표계, 포함·인접 관계 | 사건이 발생한 제조 Context 고정 |
| Process·Task·Step | 공정, 작업, 선·후행조건, 성공·중단조건 | 정상 작업경로와 이탈지점 판별 |
| Asset·Material | 설비·치구·부품 ID, 형상·물성·버전 | Digital Twin Asset과 실제 자산 연결 |
| Robot·Sensor·Skill | Embodiment, 관측·행동공간, 제어기, Calibration | 모델·로봇·센서 조건별 성능 비교 |
| State·Event | Pose, 접촉, 변형, 품질, 안전상태와 시간전이 | Episode 내 원인–결과 추적 |
| Failure·Recovery | 실패유형, Trigger, 심각도, 복구행동, 결과 | 실패 재현·복구정책 학습 |

### 공개 표준과의 매핑

자체 Ontology 로 닫히지 않도록, 기존 제조·자산 표준에 매핑해 설계합니다. 컨소시엄 Data 기관과
협의해 최종 확정합니다.

| 계층 | 매핑 대상 표준 | 사용 목적 |
|---|---|---|
| Factory·Line·Cell / Process·Task | **ISA-95** (IEC 62264) | 제조 계층구조와 공정·작업 정의의 공통 어휘 |
| Asset·Material | **Asset Administration Shell** (IEC 63278) | 설비·자산의 디지털 표현과 속성 교환 |
| 실시간 상태·이벤트 | **OPC UA** (IEC 62541) | 설비 상태·이벤트 수집 인터페이스 |
| 관계·추론·제약 | **RDF/OWL + SHACL** | 관계 표현, 제약 검증, Edge Case 규칙 기술 |
| 로봇 Embodiment | URDF/USD, ROS 2 인터페이스 | Robot·Sensor·Skill 계층 연결 |

```mermaid
flowchart TB
    RAW["Real · Simulation · Teleoperation Log"] --> MAP["Ontology Mapping<br/>Asset·Task·State·Event"]
    MAP --> GRAPH["Temporal Knowledge Graph<br/>원인·전이·영향 관계"]
    GRAPH --> SCORE["Edge Candidate Scoring<br/>규칙·희소성·불확실성·Domain Gap"]
    SCORE --> TRIAGE["학생 1차 검수<br/>재생 확인·태깅·중복 병합"]
    TRIAGE --> REVIEW["전문가 확정<br/>안전·품질 판정·심각도 부여"]
    REVIEW --> PACK["Edge Case Package<br/>Episode·조건·Trigger·Recovery·Provenance"]
    PACK --> REPLAY["Scenario Replay · Data Regeneration"]
    REPLAY --> RFM["RFM 학습·평가"]
    RFM -->|실패·불확실성 Feedback| RAW
```

### Edge Case 추출 기준

| 추출 관점 | 후보화 기준 예시 | 생성되는 학습·검증 항목 |
|---|---|---|
| 규칙·제약 위반 | 안전영역 침범, 허용 접촉력 초과, 공정 순서 이탈 | Constraint Violation·Near-miss Scenario |
| 희소 조합 | 재질×공차×조명×Sensor×Pose의 저빈도 조합 | OOD·Long-tail Evaluation Set |
| 비정상 상태전이 | 정상→미끄럼→파지실패, 정지→복구실패 | Failure Transition·Recovery Episode |
| Real–Sim 불일치 | 접촉력·Cycle Time·센서분포·실패조건의 편차 | Domain Gap Calibration Set |
| 모델 불확실성 | RFM Confidence 저하, 모델 간 행동 불일치, 반복 진동 | Hard Example·Active Learning Queue |
| 데이터 이상 | 시간동기 오류, Ontology 관계 누락, Label 충돌 | Data Quality Issue·재취득 요청 |

Edge Case Package에는 `EdgeCase ID`, 제조 Context, Trigger 전·후 시계열, 관련 Asset·Robot·Sensor,
물성·Scenario·Model 버전, 심각도, 실패·복구 Label과 데이터 출처를 함께 저장합니다. 이 구조를 통해
검색된 사건을 동일 Digital Twin에서 재생하고 조건을 변화시켜 추가 학습데이터로 확장할 수 있습니다.

### 학생이 Edge Case 파이프라인에서 하는 일

Edge Case 추출을 "자동화했다"고만 쓰면 실제로 누가 판단하는지가 비게 됩니다. 본 제안에서
**Human-in-the-loop의 실체는 유급 참여 학생 3개 조**이며, 전문가는 최종 확정만 맡습니다.

| 단계 | 담당 | 구체적인 작업 |
|---|---|---|
| 후보 생성 | 자동 | 규칙·희소성·상태전이·Domain Gap·모델 불확실성 점수화 |
| **1차 검수** | **학생 (Quality Reviewer · Analyst)** | 후보 Episode를 Digital Twin에서 **재생해 실제로 사건이 일어나는지 확인**, 중복 병합, Ontology 태그 부여, 재현 불가 후보 기각 |
| **재현 조건 탐색** | **학생 (Scenario Controller)** | 사건이 재현되는 조건 범위를 좁히고, 파라미터를 흔들어 **인접 Edge Case를 추가로 만들어냄** |
| **복구 시연** | **학생 (Operator · Safety Observer)** | 확정된 실패 상황에서 사람이 어떻게 복구하는지 Teleoperation으로 시연·기록 |
| 최종 확정 | 제조 전문가 · RFM·Robot HW 기관 | 안전·품질 판정, 심각도 부여, 현장 타당성 검토 |
| 재생성·재학습 | 자동 + 학생 검수 | Scenario Replay로 데이터 확장, QC 통과 여부 확인 |

이 구조에서 학생은 **찾아진 Edge Case를 확인만 하는 것이 아니라 새로 만들어내는 쪽**입니다.
자동 점수화가 잡아내지 못하는 사건은 조작 중에 사람이 먼저 느끼기 때문에, Operator가 세션 중
직접 **Edge Case 신고(flag)** 를 남기는 경로를 별도로 둡니다. 신고 건은 자동 후보와 같은 큐로
들어가 동일한 검수를 거칩니다.

!!! note "자동화의 책임범위"
    Ontology와 규칙은 Edge Case의 **탐색·정렬·재현을 자동화**하지만, 재현 여부 확인과 태깅은
    학생 검수 단계가, 안전·품질과 관련된 최종 판정은 제조 전문가와 RFM·Robot HW 기관이 맡습니다.
    자동 후보화 → 학생 1차 검수 → 전문가 확정의 3단 구조로 누락과 오탐을 관리합니다.

---

## RFM 학습데이터 설계

### Episode 단위 데이터

| 데이터 계층 | 주요 항목 |
|---|---|
| Task | 자연어·Task ID, 공정 단계, 성공조건, 안전 제약 |
| Observation | RGB/RGB-D, LiDAR, Robot State, F/T, Tactile, 설비·환경 상태 |
| Action | Joint·Cartesian 명령, Gripper, Mobile Base, 고수준 Skill |
| Physics | 접촉점·힘·토크, 마찰·강성, 변형량·복원·마모 상태 |
| Ground Truth | 6D Pose, Segmentation, Depth, Velocity, Collision, Event Label |
| Outcome | 성공·실패·복구, Cycle Time, 품질·안전 지표 |
| Provenance | Asset·Material·Scenario 버전, Random Seed, 생성·실측 조건 |

### 데이터 생성 전략

```mermaid
flowchart TB
    BASE["기준 제조 Scenario"] --> DR["Domain Randomization"]
    DR --> SYN["Synthetic Episode"]
    REAL["실제 Robot Episode"] --> ALIGN["시간·좌표·Semantic 정렬"]
    SYN --> MIX["Synthetic + Real Dataset"]
    ALIGN --> MIX
    MIX --> TRAIN["RFM Pre-training / Fine-tuning"]
    TRAIN --> EVAL["Simulation·Physical Evaluation"]
    EVAL -->|실패·미커버 조건| DR
```

Randomization 대상에는 조명·시점·배치·공차·마찰·강성·감쇠·변형 임계값·센서 노이즈·작업
속도·로봇 초기상태가 포함됩니다. 모든 변화조건을 Metadata로 보존하여 모델 성능의 원인을
추적하고 같은 Episode를 재생성할 수 있도록 합니다.

### RFM 기관과의 연계 범위

한성대학교가 RFM 전체 모델을 단독 개발하는 구조가 아니라, RFM 주관기관과 다음 Interface를
공동 정의하고 제조환경 학습·평가를 지원합니다.

- 로봇별 Observation·Action Space와 Embodiment Metadata
- 자연어 Task·공정 단계와 저수준 Robot Action의 연결
- Synthetic·Real Dataset의 혼합비, Curriculum과 Fine-tuning 조건
- Offline Benchmark와 Simulation Rollout 평가
- 실물 Robot 성공률·안전·복구성능 및 Sim-to-Real Gap 분석
- Failure·Edge Case의 재시뮬레이션과 재학습 데이터 생성

---

## 정량 KPI 정의와 기준선 확정 절차

"확정 후 정한다"만으로는 제안이 성립하지 않으므로, **무엇을 어떤 식으로 잴 것인가**는 제안
단계에서 고정하고, **목표 수치만** 기준선 확정 시점에 동결합니다. 아래 표의 잠정 목표는 수행실적에서
유추한 제안단계 값이며 산정근거를 함께 표기합니다. **Engine** 과 **학생 Data** 로 표기한 항목이
한성대 대표 성과에 직접 대응하는 지표입니다.

| 구분 | 지표 | 산정 방식 | 잠정 목표 | 산정근거 |
|---|---|---|---|---|
| Geometry | Asset 정합 오차 | 실측 기준점 대비 위치·치수 RMS 편차 | 주요 설비·치구 기준 **≤ 20 mm** | 모빌테크 도면·MMS 기반 물류센터 구축 실적 |
| Geometry | Sensor 가시성 일치 | 동일 Pose에서 실·가상 Depth 유효화소 비율 차 | **≤ 10 %p** | 실·가상 카메라 정합 검수 관행 |
| **Engine** | **재현 가능 소재군 수** | Material Profile 로 검증 완료된 소재군 개수 | 기본안 **2개 이상** / 확장안 4개 이상 | 예산 범위와 연동. 물성시험 횟수가 직접 제약 |
| **Engine** | **접촉력 재현오차** | 기준 물성시험 대비 접촉력·변위 곡선 NRMSE | 대상 소재군별 **≤ 20 %** | 물성 파라미터 식별 후 보정 전제 |
| **Engine** | **잔류변형 재현오차** | 반복하중 후 형상 스캔 대조 | v2 시점 **≤ 25 %** | 소성 거동은 탄성보다 오차 허용 |
| **Engine** | **Calibration 소요** | 신규 소재 1종의 파라미터 식별에 드는 **시험 횟수 · 소요시간 · 반복자 간 편차** | **≤ 5회 · ≤ 40시간**, 반복자 간 파라미터 편차 **≤ 15 %** | 절차서·도구 제공 전제. 2인 이상이 독립 수행해 편차 측정 |
| Physics | Cycle Time 편차 | 동일 Task의 실물–시뮬레이션 소요시간 차 | **≤ 15 %** | Task별 SOP 고정 시 달성 가능 범위 |
| Physics | 실패 발생조건 일치 | 실물에서 관측된 실패조건의 시뮬레이션 재현율 | **≥ 70 %** | Edge Case 재생 구조 전제 |
| Data | Episode 생성 처리량 | **GPU-hour당 유효 Episode 수**와 프레임 수 (Scenario·해상도·Sensor 구성 고정 조건) | 기준 구성에서 **GPU-hour당 Episode 수 기준선 대비 유지** | OmniLRS에서 1 Run ≈ 1,000 프레임 자동 생성·종료 확인 |
| Data | Schema 완전성 | 필수 필드(Task·Observation·Action·Physics·GT·Outcome·Provenance) 충족률 | **100 %** | 자동 검증 Gate로 강제 |
| Data | **Dataset 호환성** | 표준 LeRobot 도구로 무변환 로드 성공률 (확장 필드 무시 조건) | **100 %** | 필수 필드는 표준 그대로, 확장은 별도 네임스페이스 |
| Data | **Metadata 연결 완전성** | Cosmos 생성물이 Asset ID·Scenario·Task·Material Profile 버전을 Isaac Sim Episode 와 공유하고 추적 가능한 비율 | **100 %** | 자동 검증 Gate로 강제. 기록만으로 달성되므로 아래 지표와 함께 본다 |
| Data | **Cosmos 조건 준수율** | 요청한 **재질·조명·배치·시점이 실제 생성물에 반영**됐는지 — 분기당 무작위 표본 100건 이상, 항목별 판정 후 합산 | **≥ 70 %** | Metadata 기록과 별개로 **생성 품질**을 본다. 1차년도 Gate 결과로 확정 |
| Edge Case | **조준 생성 효율** | Ontology 조건 생성분이 무작위 생성분보다 희소조합을 채운 비율 | **2배 이상** | "많이"가 아니라 "없는 것"을 만드는 설계 |
| Data | **상태값 재현성** | 동일 Seed·버전 재생성 시 Robot State·Physics 값 상대오차 | **≤ 1e-3 인 Episode ≥ 99 %** | 상태값은 결정적 경로로 재현 가능 |
| Data | **렌더 통계동등성** | 재생성 영상의 통계적 동등성 (PSNR/SSIM 분포, 밝기·색 히스토그램 거리) | 분포 차 **유의하지 않음** | **GPU 비결정성 때문에 픽셀 단위 동일은 요구하지 않는다** |
| Data | QC 통과율 | 자동 QC + 전문가 표본검수 통과 Episode 비율 | **≥ 90 %** | 시간동기·범위검사·결측 탐지 자동화 |
| Edge Case | 후보 정밀도 | 자동 후보 중 전문가가 확정한 비율 — **분기당 무작위 표본 100건 이상, 판정 기준은 Ontology 규칙 위반·재현 가능성·안전 영향 3항목 합의** | **≥ 50 %** | Human-in-the-loop 검수 전제, 오탐 허용 설계 |
| Edge Case | Recovery Coverage | 실패유형 대비 복구 Episode 보유 비율 | **≥ 80 %** | 실패–복구 쌍 수집 Protocol 적용 |
| Model | Sim-to-Real Gap | 동일 Task의 시뮬레이션–실물 성공률 차 | **≤ 20 %p** | 합성 사전학습 + 소량 실데이터 Fine-tuning 전략 |
| Model | 합성데이터 기여도 | 합성 사전학습 유무에 따른 **ΔmAP(인식) · Δ성공률(조작)** — 동일 평가 Dataset·동일 학습예산 조건 | **ΔmAP ≥ +5 %p 또는 Δ성공률 ≥ +5 %p** | OmniLRS 문헌 보고값(Instance Segmentation AP 약 14%) 참고. 자체 재현시험으로 기준선 확정 |
| **학생 Data** | **유효 Demonstration** | QC 통과 Episode 수, 작업자 다양성, 조별 Coverage | 조·Task별 **균등 분포 유지** | **유급 참여 6~9명·3개 조**가 Dataset 생산 담당 |
| **학생 Data** | **Edge Case 검수 처리량** | 자동 후보 대비 학생이 재생 확인·판정한 비율 (월별 후보 건수 ÷ 유급 참여자 처리용량으로 검증) | **≥ 90 %** | 유급 3개 조 순환. 후보 유입이 처리용량을 넘으면 목표를 낮추고 우선순위 큐로 운영 |
| **학생 Data** | **학생 신고 기여도** | 전체 확정 Edge Case 중 학생 flag 에서 출발한 비율 | **추세 관리** | 자동 점수화가 놓치는 사건의 포착률 지표 |
| **학생 Data** | **역할 순환 이수율** | 6개 역할을 모두 경험한 학생 비율 | 학기당 **≥ 80 %** | 인력양성 성과 지표 |
| **인력양성** | **MD 과정 이수자** | Physical AI 마이크로디그리 모듈별 이수 인원 | 연 **30명 규모 유지** | HSU-PAC 30명·5개 조 실습체계 |
| **인력양성** | **유급 연구참여 전환율** | MD-3 이수자 중 연구참여 선발 비율 | 기수당 **20~30 %** | 숙련자만 Dataset 편입 데이터를 만든다 |
| **인력양성** | **1인당 유효 Episode** | QC 통과 Episode ÷ 참여 학생 수 | 기수 간 **증가 추세** | 숙련도 곡선 확인용 |
| 운영 | 공동활용 성과 | 참여기업 수, Asset 재사용률, Onboarding 소요, 검증 Turnaround | 분기 단위 추세관리 | HSU-PAC Shared Testbed 운영 |

**측정 규약** — 각 지표에는 다음을 함께 정의해 기준선과 함께 동결합니다.

| 항목 | 내용 |
|---|---|
| 담당기관 | 지표별 측정 주체 (Engine·학생 Data 는 한성대, Model 은 RFM 기관과 공동, Geometry 는 모빌테크와 공동) |
| 평가 Dataset | 학습에 쓰지 않은 고정 평가셋. 버전과 해시를 기록 |
| 표본 수 | 지표별 최소 표본과 측정 주기 (분기 또는 마일스톤 단위) |
| 측정 조건 | Robot·Sensor 구성, 해상도, GPU 사양 등 비교 가능성을 좌우하는 조건 |

!!! warning "잠정 목표의 취급"
    위 수치는 **제안 단계의 잠정치**입니다. 대상 Use Case, 소재군, Robot·Sensor 구성, 실증환경이
    확정되면 기준 데이터를 실측한 뒤 컨소시엄 공통 KPI로 동결하며, 확정 전에는 협약 목표로 인용하지
    않습니다. 특히 접촉력·Cycle Time·Sim-to-Real Gap은 **대상 소재와 Task 난이도에 강하게 의존**하므로
    Use Case별로 별도 목표를 둡니다.

**기준선 동결 절차** — ① Use Case·Robot·소재군 확정 → ② 실물 기준시험(물성·Cycle Time·실패조건)
계측 → ③ 지표별 현재값(Baseline) 산출 → ④ 차년도별 목표값 합의 → ⑤ Interface Specification에
포함해 승인 → ⑥ 변경 시 개정이력으로 관리.

---

## Validation Feedback Loop

```mermaid
flowchart TB
    V1["실물 제조작업 검증"] --> V2["Failure·Edge Case 수집"]
    V2 --> V3["Geometry·Material·Sensor Domain Gap 분석"]
    V3 --> V4["Digital Twin·Deformation Model 보정"]
    V4 --> V5["Scenario 보강·데이터 재생성"]
    V5 --> V6["RFM 재학습·재평가"]
    V6 --> V1
```

검증은 단순한 영상 유사도가 아니라 다음 관점에서 수행합니다.

| 검증영역 | 평가항목 예시 |
|---|---|
| Geometry Fidelity | 위치·치수·좌표 정합, Sensor 가시성, Collision 일치도 |
| Physics Fidelity | 접촉력, 변위·복원, 미끄럼, Cycle Time, 실패 발생조건 |
| Data Quality | Schema 완전성, 시간동기, Label 정확도, 재현성, 조건 Coverage |
| Model Performance | Task 성공률, OOD 강건성, 실패복구, Sim-to-Real 성능차 |
| Operational Quality | Asset·Dataset 버전 추적, 자동화율, 재생성 시간, 자원 사용량 |

정량 목표값은 대상 Use Case와 실제 제조환경의 기준 데이터를 확보한 뒤 컨소시엄 공통 KPI로
확정합니다.

---

## 한성대학교–모빌테크 공동개발 구조

<figure markdown>
  ![한성대학교 제조 Physical AI R&R — 모빌테크 Digital Twin, Ontology Edge Case, 학생 Teleoperation, 참여기업 Shared Testbed와 실물 로봇 검증](../../assets/manufacturing-rfm-hsu-rr.svg){ loading=lazy }
  <figcaption>한성대학교 제조 Physical AI R&R — Asset·Physics·Ontology·Teleoperation Data·Model·Validation을 연결하는 Real–Digital–Physical AI 인터페이스</figcaption>
</figure>

### 기관별 주도 역할

| 구분 | 모빌테크 — Real → Digital | 한성대학교 — Digital → Physical AI |
|---|---|---|
| 요구사항 | 현장 취득범위·정밀도·갱신주기 정의 | Robot·Sensor·Task·물리모델 요구조건 정의 |
| 공간 취득 | LiDAR·MMS·Camera·도면 기반 Scan·Mapping | 로봇 작업영역·센서 가시성·접촉영역 검토 |
| 3D Asset | 설비·공간·부품의 정밀 3D 모델과 LOD 구성 | USD 계층, Articulation, Collision, Joint 요구조건 정의 |
| 물성정보 | 현장 재질·설비·자산 Metadata 조사와 Asset 연결 | 물성 Schema, 파라미터 식별, Deformation Model 개발 |
| 시뮬레이션 | Simulation-ready Asset·좌표·Semantic 제공 | Isaac Sim·ROS 2 환경과 Robot·Sensor·Task 구성 |
| 데이터 | Asset·공간 Metadata와 버전·출처 관리 | Domain Randomization, Synthetic Data와 자동 Annotation |
| 검증 | Real–Digital 공간·Asset 정합 지원 | RFM·Robot HW 실증, Domain Gap 분석과 Feedback |

### 모빌테크 수행 레퍼런스

모빌테크는 실공간을 정밀 공간데이터로 변환하고 이를 다수의 상용 시뮬레이터로 넘겨 본 실적을
보유합니다. 본 과제에서 요구되는 것은 **보기 좋은 3D**가 아니라 **다음 단계로 넘어가는 Asset**이며,
아래 실적은 그 Hand-off가 이미 반복 수행되었음을 보여줍니다.

| 구분 | 내용 |
|---|---|
| 산업·물류 Digital Twin | **인천신항 콜드체인 특화구역 물류센터**(한국초저온인천, 2023.11~2024.12) — 건설 전 도면(조감도·평면도) 기반 실외 전경·랜드스케이프, 창고 Layout과 층별 호실 팝업, **자동화 창고 입출고 시나리오 애니메이션**, Unreal Project 일체 납품 |
| 제조환경 참고사례 | **현대제철소 Visual 구현** — Unreal 기반, 개발기간 약 5개월, 중·상급 품질 기준 약 4억원 규모(모빌테크 공유 참고 견적) |
| 실공간 정밀 디지털화 | LiDAR · MMS · HD Map · 3D Modeling 기반 고정밀 공간데이터 변환 |
| 시뮬레이터 호환 | NVIDIA Omniverse · Unreal · Unity · dSPACE Aurelion · Blender · PC-Crash 연계 |
| 이기종 결과 통합 | Omniverse · VISSIM · dSPACE 시뮬레이션 결과의 통합 처리 경험 |
| 공간 레퍼런스 | 강남 스마트시티, 여의도 UAM·교통, 판교 제로시티, 태백 스피드웨이, 샤르자 공항(UAE), K-City, 새만금 PG |
| HD맵 공급 | SWM · MORAI · dSPACE · 42dot · Phantom AI 및 연구기관 다수 |
| 대외 지위 | NVIDIA 시뮬레이션 인증 파트너, 서울시 XR 서비스 플랫폼 MOU |

!!! warning "참고 견적을 본 과제 예산으로 읽지 말 것"
    현대제철소 사례의 **5개월·약 4억원**은 *Visual 구현* 기준의 참고치입니다. 본 과제가 요구하는
    Asset은 여기에 **Collision·질량/관성·Joint·마찰/강성 등 물성·Sensor 기준좌표·Provenance**가
    결합된 Simulation-ready Package이므로, 대상 면적·설비 수·요구 LOD·물성시험 범위에 따라
    비용 구조가 달라집니다. 예산은 이 차이를 반영해 별도로 산정했으며, 산정 근거는 내부 자료로 관리합니다.

### 산출물 역할분담 매트릭스 (LCIV)

기관 간 충돌을 줄이려면 "누가 무엇을 한다"보다 **"이 산출물에 누가 어떤 자격으로 관여하는가"** 를
적어야 합니다. **아래는 현재 협의안 기준의 제안이며, 최종 분담은 컨소시엄 협약으로 확정합니다.**

표준 RACI(Accountable/Responsible/Consulted/Informed)가 아니라, 산출물 중심으로 정의한
**LCIV** 매트릭스입니다.

**L** Lead 주도 · **C** Co-develop 공동개발 · **I** Interface 규약 합의 · **V** Validate 검증 참여

<small>표가 넓습니다 — 좁은 화면에서는 표를 가로로 밀어 보십시오.</small>

| 산출물 | 한성대 | 모빌테크 | Data | RFM | SI | Robot HW | 제조·수요 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 현장 취득·정밀 3D Asset | I | **L** | — | — | — | — | V |
| Simulation-ready Asset Package | C | **L** | I | — | I | I | V |
| Material Profile · 물성 파라미터 | **L** | C | I | — | — | — | V |
| Manufacturing Deformation Engine | **L** | I | — | I | I | I | — |
| Manufacturing Ontology · Schema | **L** | C | **C** | I | C | I | V |
| Edge Case Extractor · Package | **L** | — | C | I | C | V | V |
| Robot·Sensor·Task Scenario Library | **L** | I | — | I | I | C | V |
| Demonstration · Teleoperation Corpus | **L** | — | I | I | I | C | — |
| RFM Dataset · Benchmark Protocol | C | — | C | **L** | C | I | V |
| RFM 모델 · Checkpoint | I | — | — | **L** | I | I | — |
| 데이터팩토리 Workflow · 운영 API | I | I | C | I | **L** | I | V |
| 실물 Robot Sim-to-Real 검증 | C | I | — | C | I | **L** | V |
| 참여기업 공동 Testbed 운영 | **L** | C | C | C | C | C | I |

!!! note "이 표의 용도"
    **C 표시는 공동개발 가능성이 있는 검토 대상이며 지분을 결정하지 않습니다.** 실제 지분은
    기여·발명자·저작자 확인과 협약으로 정합니다.

    R&R 협의에서 다투게 되는 것은 대개 **공동개발(C)과 규약 합의(I)의 경계**입니다. 이 표를 먼저
    합의하면 「Interface Specification」 작성 범위가 자동으로 정해집니다. 표에 없는 산출물이 생기면
    그때 추가하고, 한 산출물에 Lead 가 둘이 되지 않도록 관리합니다.

### 공동 Hand-off Interface

모빌테크의 3D Asset이 시뮬레이터에서 보이는 것만으로는 충분하지 않습니다. 다음 정보를 하나의
버전으로 묶어 전달하는 **Simulation-ready Asset Package**를 공동 정의합니다.

| Interface | 필수 정보 | 검증 관점 |
|---|---|---|
| Geometry | Mesh, LOD, 단위, 원점, 좌표계, Scale | 공간 치수·배치·정합 오차 |
| Semantic | Asset ID, 설비·부품 분류, 공정·작업 태그 | 데이터 검색과 Task 연결성 |
| Visual | PBR Material, Texture, 조명 반응, 표면 상태 | Camera 기반 인식의 사실성 |
| Collision | 단순화 Collider, Contact 영역, Self-collision | 충돌 안정성과 계산성능 |
| Dynamics | 질량, 무게중심, 관성, Joint, 구동·제약조건 | 로봇 행동과 설비 운동 재현성 |
| Material | 마찰, 반발, 강성, 감쇠, 복원·변형·마모 파라미터 | 실제 시험 응답과 Physics 오차 |
| Sensor | Camera·LiDAR·F/T·Tactile 기준좌표와 Noise | 관측 데이터의 실·가상 정합 |
| Provenance | 취득일, 출처, 보정조건, 버전, 유효범위 | 재현성·변경관리·데이터 거버넌스 |

```mermaid
sequenceDiagram
    participant M as 모빌테크
    participant I as 공동 Asset·Physics Interface
    participant H as 한성대학교
    participant R as RFM·Robot HW 기관

    M->>I: 3D Asset·좌표·Semantic·현장 Metadata
    H->>I: 물성 Schema·Collision·Sensor·Task 요구조건
    I->>H: Simulation-ready Asset Package
    H->>R: Scenario·Robot Data·Model Interface
    R->>H: 모델·제어기·실물 검증 결과
    H->>I: Domain Gap·Failure·파라미터 보정값
    I->>M: 정합·Asset 갱신 요구
```

---

## 참여기업 공동활용 Physical AI 실습실

[HSU-PAC](../hsu-pac.md)은 AI 실습공간, Mobile Robot Arena, Manipulation Cell, Sensor & Perception
환경, 제작·Prototype 공간과 GPU·NAS·ROS 2 인프라를 연결합니다. 참여기업은 각자의 Asset·Dataset·
Model·Robot Interface를 가져와 본 실증에 들어가기 전 사전 통합·재현·성능검증을 수행할 수 있습니다.

### 공동활용 가능한 연구 인프라

자원은 **현재 보유 / 과제 착수 시 구축 / 사용률 기반 선택 증설** 세 단계로 구분합니다.
제안 시점에 이미 있는 것과 앞으로 만들 것을 섞어 적지 않기 위함입니다.

| 단계 | 구성 | 본 과제에서의 용도 |
|---|---|---|
| **현재 보유** | 교내 GPU 서버(RTX PRO 6000 Blackwell 96GB급 다중 구성), NAS, 10GbE 코어망, Isaac Sim·Isaac Lab·ROS 2 환경, 실습실과 로봇 실증공간 | Isaac Sim 원격 실행·스트리밍, Isaac Lab 학습, 합성데이터 생성 |
| **착수 시 구축** | Teleoperation Console(3개 조 기준), Engine 검증용 F/T·Tactile·형상계측 Sensor, Calibration 지그, 기업별 격리환경(VLAN·Namespace·Quota) | Demonstration 수집, Deformation Engine 실계측 보정, 참여기업 반입 |
| **선택 증설** | DGX Spark 추가 노드, NAS 증설, AWS G6e/P 버스트 | 대형 모델 적재·검증, Dataset 증가 대응, 피크 학습 |

| 구분 | 내용 |
|---|---|
| 소프트웨어 | Isaac Sim · Isaac Lab · ROS 2 · PyTorch · LeRobot · Docker/NVIDIA Container Toolkit · Slurm · MLflow/W&B · DCGM/Prometheus/Grafana |
| 실물 실증공간 | Mobile Robot Arena, Robot Manipulation Cell(협동로봇·F/T), Sensor & Perception Studio(RGB-D·LiDAR·캘리브레이션), Wearable·HRI, Maker 공간 |
| 인력 운영 | 교육 30명·5개 조 / **Dataset 생산 유급 6~9명·3개 조**, 계정·Quota·권한 분리, 예약제 |

!!! warning "GPU 메모리 합산은 그대로 쓸 수 있는 용량이 아니다"
    GPU 여러 장의 메모리를 더한 값은 **단일 모델이 곧바로 쓸 수 있는 용량이 아닙니다.** 그 용량을
    쓰려면 모델·파이프라인 병렬화 같은 분산학습 구성이 필요하고, 통신 대역폭과 구현 비용이 따릅니다.
    단일 GPU 메모리를 넘는 모델의 **적재·검증**은 통합 메모리를 쓰는 DGX Spark 계열이 적합하며,
    이것이 두 자원을 함께 두는 이유입니다.

!!! note "정확한 보유 사양은 확정 후 기재합니다"
    HSU-PAC 문서 안에서 GPU 서버 대수와 모델명 표기가 일치하지 않는 부분이 확인되어
    (내부 미결항목 관리대장 7번), 본 문서에서는 단정적 수치 대신 구성 단계로 기술했습니다.
    확정되는 대로 정확한 사양으로 교체합니다.

    HSU-PAC은 **교육·연구 규모**로 설계된 플랫폼입니다. 컨소시엄의 제조 데이터 규모와 다기관
    동시 운영을 감당하려면 연산·스토리지·보안 격리·실증환경의 확장이 필요하며, 그 증설분은
    예산의 *연구시설·장비* 항목에 반영했습니다.

| 참여 주체 | HSU-PAC 공동활용 내용 | 공동 산출물 |
|---|---|---|
| 모빌테크 | 3D Asset 반입, USD·좌표·LOD·Collision 검수, 현장–가상 정합 | Simulation-ready Asset Package |
| Data 기관 | Ontology·Schema·Metadata·품질규칙·검색 Interface 검증 | Data Contract·Edge Case Index |
| RFM 기관 | Checkpoint·Adapter 탑재, Offline·Simulation Rollout 평가 | Benchmark Report·Hard Case Queue |
| SI 기관 | 데이터 생성–학습–평가 Workflow와 API 연동 | 통합 Pipeline·운영 Interface |
| Robot HW 기관 | URDF/USD·제어·Sensor 연동, Teleoperation·안전·복구 검증 | Robot Adapter·Physical Validation Data |
| 제조·수요기업 | Use Case·안전·품질 기준 제공, 시나리오 검수·인수평가 | Acceptance Scenario·현장 Feedback |

```mermaid
flowchart LR
    ONBOARD["기업 Onboarding<br/>NDA·권한·환경"] --> IMPORT["Asset·Data·Model·Robot 반입"]
    IMPORT --> SPRINT["Simulation·Data Sprint"]
    SPRINT --> PHYSICAL["Physical Pre-validation"]
    PHYSICAL --> REVIEW["공동 Demo·KPI Review"]
    REVIEW -->|보정·재시험| SPRINT
    REVIEW --> SCALE["상생공간·현장 실증으로 Scale-up"]
```

기업별 Project Namespace·Container·Dataset 권한을 분리하고, 예약·GPU/Robot 사용량·접근 Log·Asset
버전을 관리합니다. 주간에는 공동개발·교육·실물검증을, 야간에는 Simulation·학습 Queue를 운영하는
방식으로 장비 활용률을 높일 수 있습니다. 공동활용 KPI는 참여기업 수, Asset 재사용률, Onboarding
소요시간, 검증 Turnaround Time, 시설 활용률과 Scenario 재현 성공률로 관리합니다.

!!! info "상생공간과 HSU-PAC의 역할 구분"
    HSU-PAC은 소규모·신속한 **사전 통합과 인력양성 Testbed**, **주관기관이 계획·협의 중인 약 500평 규모 상생공간**은 컨소시엄
    전체 시스템의 **대규모 통합·운영·실증공간**으로 구분합니다. 동일 Interface와 Version을 사용해
    대학에서 검증한 결과를 상생공간과 실제 제조현장으로 이관합니다.

---

## 컨소시엄 공통 Interface

| 참여영역 | 한성대학교와 주고받는 정보 |
|---|---|
| 제조환경·수요기업 | 공정, Task, 안전조건, 품질기준, 실증 데이터 |
| Digital Twin·모빌테크 | 3D Asset, 좌표·Semantic, 물성 Metadata, 정합 결과 |
| Data 기관 | Manufacturing Ontology, Dataset Schema, Edge Case Index, 저장·검색·품질관리 |
| RFM 기관 | Model Interface, 학습·평가 조건, 모델·Checkpoint·불확실성·Hard Case 결과 |
| SI 기관 | 데이터팩토리 서비스·워크플로·운영 API 통합 |
| Robot HW 기관 | URDF/USD, 제어·센서·Teleoperation Interface, 실물 검증과 Failure·Recovery Data |
| 연구기관 | 시험기준, Benchmark, 성능·안전 검증 협력 |

한성대학교는 기관별 기능을 대체하지 않고, 각 산출물이 다음 단계에서 바로 사용될 수 있도록
**Asset–Physics–Data–Model–Validation Hand-off**를 연결합니다.

---

## 연구인력 구성

아래는 참여 인력 구성입니다. 최종 인원과 참여율은 확정 예산과 학사일정에 맞춰
산정하며, 증액 시 석사과정 연구원과 박사후연구원 참여기간을 우선 늘립니다.

| 구분 | 인원(잠정) | 주 담당 Work Package |
|---|---|---|
| 연구책임자 | 1 | 전체 총괄, HSU-1 Interface, HSU-6 RFM 연계 협의 |
| 참여교수 | 1 | HSU-2 물리모델, HSU-4 Ontology |
| 박사후연구원 | 1 (2·3차년도 집중) | HSU-2 Deformation Engine, 파라미터 식별·보정 |
| 석사과정 연구원 | 2~3 | HSU-3 Simulation, HSU-4 Edge Case, HSU-5 Dataset |
| 학부연구생·조교 | 순환 | HSU-5 Teleoperation 수집·검수, HSU-7 Testbed 운영지원 |
| 연구근접지원인력 | 1 | 연구비 관리·연구행정 |

!!! note "연구근접지원인력은 조건부 의무다"
    공고 기준으로 **대학은 연구책임자(교수) 단위로 산업부 소관 국가연구개발사업의 연차별
    정부지원연구개발비 합계가 5억원 이상이면 연구근접지원인력을 1명 이상 활용**해야 합니다.
    한성대 차년도 몫은 1.3~2.0억이라 이 기준(5억)에 미치지 않습니다. 다만 연구책임자가 수행하는 다른 산업부 과제와 합산되므로 협약 시 확인이 필요하며,
    협약 형태와 배분이 확정돼야 판단되므로, 인건비에 조건부로 반영해 두었습니다.

    학생 참여는 [학생 주도 Human Data Engine](#human-data-engine-demonstration-edge-case) 절의 교육·안전·품질
    Protocol을 따르며, 학생인건비는 기관 지급기준에 따라 계상합니다.

---

## 리스크와 대응

제안 단계에서 이미 드러난 위험을 감추지 않고, 완화 수단과 판단 시점을 함께 둡니다.

| 구분 | 리스크 | 영향 | 대응 |
|---|---|---|---|
| 범위 | **기관 간 역할 중첩** — Simulation·Data·검증 영역에서 타 기관과 업무가 겹칠 수 있음 | 중복투자, 산출물 소유 불명확 | 기능이 아니라 **Hand-off 산출물 단위**로 책임을 정의하고 Interface Specification에 명시 |
| 범위 | **Use Case 확정 지연** | Asset·물성·Scenario 착수 지연 | 1차년도에 Pilot Use Case 1건을 먼저 동결해 Interface를 검증하고, 확장은 2차년도로 분리 |
| 기술 | **제조 Use Case·Data Schema 구체화 부족** | Dataset 재작업 | Schema를 버전화하고 최소 필수 필드부터 강제, 확장 필드는 선택으로 시작 |
| 기술 | **물성 파라미터 식별 실패** — 소재군이 넓거나 시험 데이터 부족 | Physics Fidelity 미달 | 응답 모델을 교체 가능한 모듈로 설계하고, 소재군을 단계적으로 확대. 미확보 소재는 불확실성 범위로 표기 |
| 기술 | **Deformation 계산비용** — 실시간 요구와 충돌 | Episode 생성 처리량 저하 | 실시간·준실시간 2개 모드 운영, 학습데이터 생성은 준실시간 배치로 분리 |
| 기술 | **Cosmos 조건 준수 미달** — 요청한 재질·조명·배치·시점이 생성물에 반영되지 않을 수 있음 | 희소조건 조준 생성의 효율과 추적성 저하 | 1차년도에 타당성을 먼저 검증. 실패 시 **Domain Randomization 중심으로 회귀**하고 Cosmos 는 인식 학습용 증강에 한정 |
| 기술 | **외부 모델·프레임워크 의존** (Cosmos·LeRobot 버전 변화) | 파이프라인 파손 | 버전 고정과 정규화 계층 분리. **LeRobotDataset 필수 필드는 표준 준수**해 대체 가능성 확보 |
| 실적 | **제조 로봇 실물검증 레퍼런스 부족** — 기존 실적이 달·야외 주행 중심 | 연구역량 평가 감점 | HSU-PAC Manipulation Cell·Mobile Robot Arena에서 선행 검증하고, Robot HW 기관과 조기 공동시험 |
| 자산 | **제조 특화 Asset·Scenario 축적 부족** | 초기 데이터 다양성 부족 | 모빌테크 산업·물류 Asset 실적을 기반선으로 사용하고, Scenario Library를 재사용 단위로 설계 |
| 운영 | **Teleoperation 데이터 편향** — 특정 조작자 습관 학습 | 모델 일반화 실패 | 작업자 단위로 학습·검증 Set 분리, 숙련도·전략 다양성 확보, 조별 Coverage 관리 |
| 운영 | **참여기업 데이터 보안** | 반입 거부, 실증 축소 | 기업별 Namespace·권한 분리, NDA, 접근 Log와 Asset 버전 관리 |
| 사업 | **수행기간 확정치 변동** | 계획 재작성 | 차년도 구조를 단계 중첩으로 설계해 기간 변동 시 마일스톤 순서를 유지한 채 구간만 조정 |
| 사업 | **총사업비·기관별 배분 미확정** | 예산 재작성 | 인월·시험 횟수·장비 수량에서 쌓아 올린 값이라 **범위를 줄이면 금액이 따라 줄어드는 구조**. 확정 시 「증액 시 우선 확대할 범위」 순서로 재산정 |
| 사업 | **RFP/품목서 정량목표와의 불일치** | 목표 미달 판정 | 품목서 확보 즉시 KPI 표와 대조해 기준선 동결 전에 정렬 |

---

## 성과 귀속과 데이터 이용 원칙

컨소시엄 제안 단계에서 가장 늦게 합의되면서 가장 많이 다투게 되는 항목이라, 원칙을 먼저 둡니다.
최종 조건은 협약과 컨소시엄 협약서로 확정합니다.

### 공개 범위는 3단계로 나눕니다

"한성대 귀속"과 "재현 가능한 공개 규격"을 함께 쓰면 어디까지 공개인지 모호해집니다. 나눕니다.

| 단계 | 대상 | 이유 |
|---|---|---|
| **공개** | API 규격 · 데이터 Schema · 평가 Protocol · Benchmark 정의 · 논문 | 타 기관이 연동·비교하려면 규격은 열려야 한다 |
| **컨소시엄 한정** | Engine 소스코드 · Calibration Tool · 상세 기술문서 · Material Library 구조 | 참여기관은 쓰되 외부 배포는 제한 |
| **비공개** | 제조기업 원본 데이터 · 현장별 Material Parameter 실측값 · 보정 계수 | 기업 자산이며 공개 시 공정 정보가 드러난다 |

**특허 출원 전에는 공개 단계 항목도 공개하지 않습니다.** 출원·공개 시점은 IP 관리 절차에 따릅니다.

### 성과 귀속

| 대상 | 귀속·이용 원칙(제안) |
|---|---|
| **Background IP** | 각 기관이 과제 이전부터 보유한 기술·자산. 소유권 변동 없음. 모빌테크 취득 기술, RFM 기관 기존 모델, 한성대 기존 연구성과가 여기 해당 |
| **제3자 SW·모델** | **OmniLRS(BSD-3-Clause) · Isaac Sim · PhysX · Cosmos · LeRobot 등은 제3자 자산**이며 각 라이선스와 표시(attribution) 의무를 준수한다. 한성대가 권리를 갖는 것은 **원본이 아니라 자체 수정분·신규 모듈·Calibration·Ontology 계층**이다 |
| Manufacturing Deformation Engine | 한성대 개발분(Foreground)은 한성대 귀속. 컨소시엄 참여기관에 **과제 목적 범위의 실시권** 부여 |
| Manufacturing Ontology·Schema | **공개 표준 지향** — 컨소시엄 공통 자산. 과제 종료 후 규격 공개를 원칙으로 함 |
| Simulation-ready Asset | 모빌테크 원저작물 기반. 한성대가 부가한 물성·Collision·Sensor Metadata 는 **공동개발분(Joint Foreground)** |
| 제조현장 원본 데이터 | 제조·수요기업 소유. 반출·가공·공개 범위를 별도 이용조건으로 정함 |
| Synthetic·Teleoperation Dataset | 생성기관 귀속, 컨소시엄 내 학습·평가 목적 이용 허용. 외부 공개는 제조기업 동의 전제 |
| RFM 모델·Checkpoint | RFM 주관기관 귀속. 한성대는 평가·검증 목적 이용 |
| Benchmark·Evaluation Protocol | 공통 자산 — 기관별 모델을 동일 조건에서 비교하려면 중립이어야 함 |
| **공동개발분(Joint Foreground)** | 지분·실시조건을 **개별 산출물 단위로** 협약서에 명시. 「산출물 역할분담 매트릭스(LCIV)」의 **C 표시는 공동개발 가능성이 있는 검토 대상**을 뜻하며, 실제 지분은 기여·발명자·저작자 확인과 협약으로 확정한다 — C 표시만으로 공동소유가 결정되지 않는다 |


!!! note "기술료와 영리기관 참여"
    공고의 「기술료 징수」 과제는 **영리기관이 반드시 연구개발기관으로 참여**해야 합니다. 한성대학교는
    비영리기관이므로, 기술료·사업화 경로는 모빌테크를 포함한 참여 영리기관의 구성에 따라 정해집니다.
    비영리기관 성과의 중소기업 실시 허락 관련 조항도 협약 시 함께 검토합니다.

---

## 시스템 강점

| 강점 | 구현 방식 | 사업 기여 |
|---|---|---|
| Real–Digital–Physical Closed Loop | 모빌테크 현장 Digital Twin→한성대 Physics·Data→RFM→실물검증 Feedback | 일회성 구축이 아닌 지속개선 데이터팩토리 |
| Ontology 기반 의미 일관성 | Asset·Process·Task·State·Failure·Recovery를 공통 관계로 연결 | 기관 간 데이터 검색·결합·원인분석 가능 |
| Edge Case 능동 발굴 | 규칙·희소성·상태전이·Domain Gap·모델 불확실성 결합 | 희귀·위험조건의 재현·학습·평가 비용 절감 |
| Synthetic–Real–Teleoperation 융합 | Simulation 자동생성, 실물 Log, 학생 Human Demonstration 정렬 | 데이터 규모·현실성·행동 다양성 동시 확보 |
| Deformation-aware Physics | 접촉·물성·변형·누적상태를 Scenario와 Ground Truth에 반영 | 조작·이송 실패조건과 Domain Gap 정밀 재현 |
| 참여기업 Shared Testbed | 기업별 격리환경에서 Asset·Model·Robot을 사전 통합 | 본 실증 전 시행착오·통합기간·장비 중복투자 절감 |
| 재현성과 확장성 | Versioned Asset·Material·Scenario·Model·Random Seed와 Hybrid GPU | 동일 Episode 재생성, 기관·Robot·Use Case 확장 |
| 데이터–인재 선순환 | 30명·5개 조 Teleoperation·분석·검수 교육 | 과제 수행인력과 제조 Physical AI 전문인력 동시 양성 |

!!! tip "한 문장 차별화"
    **모빌테크가 제조현장을 정밀 Digital Twin으로 만들고, 한성대학교가 Ontology·Deformation·
    Teleoperation·Sim-to-Real을 연결하여, 모든 참여기관이 반복 활용하는 제조 Physical AI
    Data Factory와 공동 검증 플랫폼으로 고도화합니다.**

---

## HSU-PAC과의 연계

[HSU-PAC](../hsu-pac.md)은 Isaac Sim·Isaac Lab·ROS 2·GPU·NAS·실물 로봇을 연결하는
한성대학교 Physical AI 교육·연구 플랫폼입니다. 본 프로젝트에서는 HSU-PAC을 초기
Ontology·Algorithm·Scenario·Teleoperation Dataset 검증과 참여기업 사전 통합 기반으로 활용하고,
컨소시엄의 제조 데이터 규모와 다기관 운영 요구에 맞춰 연산·스토리지·보안·실증환경을 확장합니다.

> HSU-PAC은 **개발·검증 Seed Platform**, 컨소시엄 데이터팩토리는 **제조환경 공동운영 Production Platform**으로 구분합니다.

---

## 기술 참고

**시뮬레이션·물리**

- [OmniLRS — Omniverse Lunar Robotics Simulator](https://github.com/OmniLRS/OmniLRS) (BSD-3-Clause)
- Richard, A., et al. (2024). *OmniLRS: A Photorealistic Simulator for Lunar Robotics.* IEEE ICRA 2024. — **AP 약 14% 향상 수치의 출처**
- [OmniLRS Deformation Engine](https://github.com/OmniLRS/OmniLRS/wiki/deformation_engine)
- [OmniLRS 설치·실행 매뉴얼](https://github.com/OmniLRS/OmniLRS/wiki)
- [NVIDIA Isaac Sim Container 설치 문서](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/install_container.html)
- Kamohara, J., Ares, V. E., Hurrell, J., Takehana, K., Richard, A., Santra, S., Uno, K., Rohmer, E., & Yoshida, K. (2024). *Modeling of terrain deformation by a grouser wheel for lunar rover simulation.* Proc. 21st Int'l & 12th Asia-Pacific Regional Conf. of the ISTVS, 283–289.
- [산업통상부 공고 제2026-549호 — 2026년도 제2차 로봇산업기술개발사업 신규지원 대상과제](https://www.motir.go.kr/kor/article/ATCLc01b2801b/71273/view)
- [한성대학교 Physical AI 교육·연구 플랫폼 HSU-PAC](../hsu-pac.md)

---

`Manufacturing Digital Twin` · `Deformation Engine` · `NVIDIA Cosmos` · `LeRobot` · `Manufacturing Ontology` · `Edge Case Extraction` · `Teleoperation Data` · `Shared Testbed` · `Robot Foundation Model` · `Isaac Sim` · `ROS 2` · `Sim-to-Real`

[:octicons-arrow-left-24: 프로젝트 목록으로](https://parclab-hsu.github.io/projects/)

---
