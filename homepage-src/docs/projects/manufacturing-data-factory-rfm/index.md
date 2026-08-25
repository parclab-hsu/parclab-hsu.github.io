---
noindex: true
---

# 제조환경 Digital Twin·Deformation Engine 기반 Robot RFM 데이터팩토리

:material-circle-outline:{ style="color:#e0a800" } **컨소시엄 제안** · Manufacturing Physical AI Data Factory & Robot Foundation Model

!!! abstract "프로젝트 한눈에 보기"
    본 프로젝트는 실제 제조공간을 **Simulation-ready Digital Twin**으로 전환하고, 로봇의 접촉으로
    발생하는 물리 상태 변화를 재현하는 **Manufacturing Deformation Engine**을 개발하여, 제조 로봇
    파운데이션모델(RFM)의 학습·평가·Sim-to-Real 검증에 필요한 데이터를 지속적으로 생산하는 것을
    목표로 합니다.

    모빌테크는 현장 취득과 정밀 3D Asset·공간 Digital Twin을 담당하고, 한성대학교는 OmniLRS 활용
    연구에서 축적한 변형지형·접촉물리 경험을 제조환경으로 확장해 물성 모델, 로봇 시뮬레이션,
    합성데이터 생성, Ontology 기반 Edge Case 추출, 학생 Teleoperation Demonstration Data 구축,
    RFM 연계 및 실물 검증을 수행합니다. HSU-PAC 실습실은 참여기업의 Asset·Model·Robot을
    사전 통합·검증하는 공동 Testbed로 운영합니다.

> **핵심 제안** — 모빌테크가 제조현장을 정밀 **Geometry Twin** 으로 전환하면, 한성대학교는 이를
> **실측 보정된 Physics Twin** 으로 고도화하고, **실패·복구가 포함된 RFM 학습데이터와 검증
> 피드백으로 순환**시킵니다.

!!! success "한성대학교의 대표 성과 — 무엇으로 평가받을 것인가"
    본 과제에서 한성대학교가 **주도 개발하는 성과**는 다음 세 가지이며, 우선순위가 있습니다.
    성과 귀속과 공개 범위는 협약으로 확정하며 원칙은 [기술 상세](technical.md)에 있습니다.

    **① Manufacturing Deformation Engine (대표 성과)**
    로봇의 접촉으로 대상물의 형상·표면·잔류상태가 바뀌는 과정을 물리적으로 재현하는 엔진입니다.
    한성대가 OmniLRS 변형지형 연구에서 직접 구동·계측해 본 코드를 제조 접촉물리로 파생·재설계합니다.
    **현재 컨소시엄 역할 협의안 기준, 한성대가 주도 제안하는 고유 기술영역**입니다. 이 계층이 있어야
    3D Digital Twin이 로봇 학습에 쓸 수 있는 Physics Twin으로 확장됩니다.

    **② 학생 주도 Human Data Engine**
    **교육은 30명·5개 조**, **과제 Dataset 생산은 MD-3 이수자 중 선발한 유급 참여자 6~9명(3개 조)**
    이 담당합니다. 표준 Protocol 아래에서 Teleoperation Demonstration을 생산하고 Edge Case를
    발견·태깅·재현까지 수행합니다. **Physical AI 마이크로디그리(MD) 과정이 인력 공급 경로**이며,
    교육 → 데이터 생산 → RFM 학습 → 결과 → 다시 교육으로 한 바퀴가 돕니다. 데이터 생산과
    Physical AI 인력양성이 같은 활동에서 나옵니다.

    **③ Manufacturing Ontology·Edge Case Intelligence**
    ①과 ②가 만든 데이터를 의미로 연결해 검색·재현·재학습이 가능한 자산으로 만듭니다.

    ②와 ③은 ①이 만든 물리 반응 위에서 작동합니다. **엔진이 이 제안의 중심축입니다.**

    세 성과는 **NVIDIA Cosmos 로 외관을, Isaac Sim·Deformation Engine 으로 물리 정답을 만들고,
    LeRobotDataset 으로 정규화해 RFM 기관에 넘기는** 하나의 파이프라인 위에서 운영됩니다.
    가져다 쓸 것과 직접 만들 것을 나눈 설계이며, 상세는 「Physical AI 구축 환경 최적화」 절에 있습니다.

!!! info "사업·역할 상태"
    이 페이지는 컨소시엄 제안 단계의 한성대학교–모빌테크 공동 R&R과 기술구조를 정리한 것입니다.
    제조 Use Case, 대상 설비·로봇, 정량 KPI와 기관별 최종 책임범위는 컨소시엄 협의와 실증환경
    확정 후 기준선(Baseline)으로 관리합니다.

<figure markdown>
  ![한성대학교 고유 Physical AI Data Factory 아키텍처 — OmniLRS 파생 Deformation Engine, Manufacturing Ontology, 학생 Teleoperation, Ontology 기반 Edge Case Intelligence, Versioned Episode Factory와 HSU-PAC Shared Testbed](../../assets/manufacturing-rfm-system-architecture.svg){ loading=lazy }
  <figcaption>한성대학교 고유 아키텍처 — 외부기관은 표준 입력·활용 Interface로 두고, 한성대가 보유·개발·운영하는 Physics·Ontology·Human Demonstration·Edge Intelligence·Shared Testbed를 중앙에 배치했습니다.</figcaption>
  <figcaption style="margin-top:.4rem;font-size:.8rem">글자가 작으면 <a href="assets/manufacturing-rfm-system-architecture.svg">원본 SVG 열기</a></figcaption>
</figure>

---

!!! tip "이 문서의 구성"
    **본문** 여섯 절이면 협의·검토에 충분합니다. 근거·수치·운영 규약이 필요할 때
    뒤의 **상세 근거**를 보시면 됩니다.

!!! tip "이 페이지의 범위"
    여기는 **대표 페이지**입니다 — 과제 개요, 대표 성과, 아키텍처, 세부 R&R, 일정, 예산 요약.

    기술 근거·수치·운영 규약은 **[기술 상세](technical.md)** 에 있습니다 —
    Deformation Engine, Ontology·Edge Case, 학생 Human Data Engine, Cosmos·LeRobot 구축,
    정량 KPI 전체.

## 과제 개요와 공고 정합성

본 제안은 산업통상부 공고 **제2026-549호**(2026. 8. 13.) 「2026년도 제2차 로봇산업기술개발사업
신규지원 대상과제」의 **연구개발과제 1 — 로봇 데이터팩토리 구축 및 로봇파운데이션모델(RFM) 개발**을
대상으로 합니다.

| 항목 | 공고 기준 |
|---|---|
| 내역사업 | 로봇산업기술개발 (로봇산업핵심기술개발) |
| 주관연구개발기관 | 제한없음 |
| 지원규모 | 7,500백만원 |
| 수행기간 | 43개월 |
| 과제유형 | 일반 · **원천기술형** · **품목지정형** |
| 과제특징 | 초격차 (R&D자율성트랙(일반) 신청 가능) |
| 접수 | 2026. 8. 21.(금) ~ **9. 11.(금) 18:00**, 범부처통합연구지원시스템(IRIS) |
| 평가 배점 | 기술성 60 / 연구역량 20 / 사업화·경제성 20 — 종합 70점 미만 지원제외 |
| 대학 지원비율 | 정부지원연구개발비 **연구개발비의 100% 이하**, 기관부담 현금은 필요시 |

!!! info "본 자료의 기준"
    일정·예산은 **공고문 기준(수행기간 43개월 · 지원규모 7,500백만원)** 으로 통일해 작성했습니다.
    사업기간은 4개 차년도로 나누며 1차년도는 공고에 따라 9개월 기준입니다.

    컨소시엄 협의 과정에서 이와 다른 총사업비가 공유된 바 있으나, 공식 근거가 확인되기 전까지
    본문에서는 사용하지 않습니다. 해당 사항과 상세 RFP/품목서 확보 여부는
    **내부 미결항목 관리대장**에서 별도로 추적합니다.

### 대학 참여기관으로서의 적합성

| 평가 관점 | 본 제안의 대응 근거 |
|---|---|
| RFP/품목 부합성 | 데이터팩토리(데이터 생성·정제·관리)와 RFM(학습·평가) 사이의 **제조 물리·의미 계층**을 담당 |
| 목표의 도전성 | 시각 중심 Digital Twin을 **접촉·변형·누적상태가 반영되는 Physics Twin**으로 전환 |
| 연구조직 역량 | OmniLRS 기반 Isaac Sim·ROS 2 시뮬레이션과 변형지형·HILS 수행실적, HSU-PAC 인프라 |
| 연구 인프라 | GPU·Isaac Sim·ROS 2·NAS·실물 로봇을 갖춘 [HSU-PAC](../hsu-pac.md)을 **참여기업 공동 Testbed**로 개방 |
| 지역·인력 파급 | 교육 30명·5개 조 · 유급 생산 6~9명 체계로 데이터 생산과 Physical AI 인력양성을 동시 수행 |

---

## 한성대학교 고유 Physical AI Data Factory 아키텍처


한성대의 차별성은 개별 기술을 보유하는 데 그치지 않고, **OmniLRS 파생 Deformation Engine**,
**Manufacturing Ontology**, **MD 과정 기반 Teleoperation Data Engine**, **Ontology 기반 Edge Case
Intelligence**를 Versioned Episode Factory와 HSU-PAC 안에서 하나의 학습 폐루프로 운영하는 데
있습니다. 결과물은 Dynamic Physics Twin, 재생 가능한 Edge Case·Recovery Package, RFM Dataset·
Benchmark와 참여기업 공동검증 체계로 제공됩니다.

---

## 한성대학교 세부 R&R

한성대학교는 전체 컨소시엄에서 제조환경 Digital Twin을 데이터와 RFM, 실제 Robot HW로 연결하는
**Ontology–Simulation–Data–Sim-to-Real 기술 인터페이스**를 담당합니다.

| Work Package | 한성대학교 주도 업무 | 주요 산출물 |
|---|---|---|
| HSU-1. Use Case·Interface 설계 | 제조 Task·Process·Failure Case와 Robot·Sensor 요구조건 정의 | Use Case 명세, 공통 Interface·Dataset Schema |
| **HSU-2. Deformation Engine** | **[대표 성과]** 물성 Profile, 접촉·변형·누적상태 모델과 파라미터 보정, 실계측 기반 검증 | **Manufacturing Deformation Engine**, Material Library, Calibration Tool, 검증 리포트 |
| HSU-3. 제조 로봇 시뮬레이션 | Isaac Sim·ROS 2 기반 Robot·Sensor·Task·Scenario 구성 | Simulation Package, Scenario Library |
| HSU-4. Ontology·Edge Case | 제조 자산·공정·상태·이벤트·실패·복구 Ontology와 Edge Case 후보 추출, **희소조합을 생성 조건으로 변환(Cosmos 조준)**, 학생 1차 검수 체계 운영 | Manufacturing Ontology, Knowledge Graph, Edge Case Extractor, **생성 조건 명세** |
| HSU-5. 학습데이터 생성 | Domain Randomization, **Cosmos 생성물과 Isaac Sim Episode 의 Scene–Scenario 정합**, 자동 Annotation, **LeRobotDataset v3 정규화**, **Physical AI MD 과정** 기반 Demonstration·Edge Case 수집 운영(교육 30명·5개 조 / 유급 생산 6~9명·3개 조) | RFM용 Dataset·Metadata·품질 리포트, Demonstration Corpus, MD 교보재 |
| HSU-6. RFM 연계 | RFM 기관과 Observation·Action·Task·Model Interface 및 평가기준 협의, **LeRobotDataset 확장 필드 규약 정의** | RFM Adapter, Benchmark·Evaluation Protocol, **Dataset 규약서** |
| HSU-7. 공동 Testbed·Physical Validation | HSU-PAC 참여기업 공동활용, 실제 Robot HW 적용, Domain Gap 분석 | 사전 통합환경, Sim-to-Real 검증결과, Feedback Data |

### 한성대학교가 기여하는 핵심 가치

| 기여영역 | 한성대학교의 차별적 기여 | 컨소시엄 효과 |
|---|---|---|
| **Dynamic Physics Twin** **[대표]** | OmniLRS 변형지형 연구경험을 제조용 접촉·물성·변형 모델로 파생 — **한성대가 주도 제안하는 고유 기술영역** | 3D 시각화를 로봇 행동이 가능한 Physics Twin으로 확장 |
| Asset–Physics 표준 | 3D Asset에 Collision, Joint, 질량·관성, 물성·Sensor Metadata를 결합 | 모빌테크 산출물을 Isaac Sim·RFM·Robot HW가 재사용 |
| Ontology·Edge Case | 자산–공정–상태–이벤트–실패–복구 관계를 구조화하고 규칙·희소성·모델 불확실성으로 후보 추출 | 흩어진 실패 로그를 재현 가능한 학습 Scenario로 전환 |
| 제조 데이터 생성 | 정상·경계·실패·복구 Scenario, Domain Randomization, Teleoperation, 자동 Annotation | Synthetic·Real·Human Demonstration이 결합된 RFM 학습데이터 확보 |
| 학생 Human Data Engine | **Physical AI MD 과정** 위에서 유급 참여자가 Demonstration 생산부터 **Edge Case 1차 검수·재현 조건 탐색·복구 시연**까지 수행. 모델 결과가 다음 학기 교재로 되돌아옴 | 학습데이터와 Edge Case가 한 팀에서 나오고, 과제 종료 후에도 MD 과정과 숙련 인력이 남음 |
| RFM 평가 Interface | Observation·Action·Task·Embodiment Schema와 Benchmark 설계 | 기관별 모델을 동일 제조조건에서 비교·평가 |
| Sim-to-Real 검증 | 실물 Robot의 Domain Gap·Failure·Edge Case를 물성·Scenario에 재반영 | 데이터 생성–재학습–재검증의 지속 개선 Loop 구축 |
| HSU-PAC 공동활용 | GPU·Isaac Sim·ROS 2·NAS·실물 로봇과 기업별 격리환경 제공 | 참여기업이 Asset·Model·Robot을 반입해 본 실증 전 사전 통합·검증 |

### 제조 Task·Scenario Library

초기 대상은 컨소시엄 제조 Use Case와 로봇 구성이 확정된 뒤 기준선으로 동결합니다.

- **이송·물류** — AMR 이동, 적재·하역, 도킹, 통로 폐색과 미끄럼 조건
- **조작** — Pick & Place, Bin Picking, 파지 실패, 대상물 변형·미끄럼·낙하
- **조립** — 삽입, 체결, 정렬, 공차와 접촉력 변화, 치구 위치 편차
- **검사** — Camera·Depth·LiDAR·F/T 기반 외관·치수·접촉 품질검사
- **예외·복구** — 설비 정지, 센서 열화, 부품 누락, 충돌 위험, 작업 재계획

각 Task는 **정상–경계–실패–복구** 상태를 포함하고, 환경·설비·부품·로봇·센서 조건을
독립적으로 변화시킬 수 있도록 구성합니다.

---

## 단계별 추진안

| 단계 | 핵심 활동 | 완료 기준 |
|---|---|---|
| 1. 기준선 설계 | 제조 Use Case, 실증조건, Asset·Material·Ontology·Data Interface와 Teleoperation Protocol 합의 | 공동 Interface Specification 승인 |
| 2. Digital Twin 구축 | 현장 취득, 3D Asset, 좌표·Semantic·물성정보 연결 | Simulation-ready Asset Package 검수 |
| 3. Physics·Scenario 개발 | Deformation Engine, Robot·Sensor·Task Scenario 구현 | 기준 물성시험·시뮬레이션 재현 |
| 4. Data·RFM 연계 | Ontology Edge Case 추출, Synthetic·Real·Teleoperation Dataset, RFM Adapter·평가 | 학습·평가 Pipeline 재현 가능 |
| 5. Physical Validation | 실제 Robot 적용, Domain Gap 분석, 반복 보정 | 공통 KPI 기반 Sim-to-Real 검증 |
| 6. 데이터팩토리 운영 | 참여기업 공동활용, 실패·Edge Case 후보화, Scenario 재생성·재학습 | Shared Testbed와 Validation Feedback Loop 운영 |

### 차년도 매핑과 마일스톤

6개 단계는 4개 차년도에 걸쳐 중첩 수행합니다. 1단계는 전 기간에 걸쳐 개정되고, 5·6단계는
3차년도부터 반복 Loop로 운영됩니다.

| 차년도 | 주 수행 단계 | 마일스톤(완료 판정 대상) |
|---|---|---|
| 1차년도 | 1 기준선 설계, 2 착수 | **M1** 공동 Interface Specification 승인 · **M2** Pilot Scan과 기준 3D Asset 검수 · **M3** Ontology v1과 Teleoperation·안전 Protocol 승인 |
| 2차년도 | 2 완료, 3 주력 | **M4** 제조공간 Digital Twin 본 구축 검수 · **M5** Deformation Engine 1차와 Material Library · **M6** Edge Case Extractor 1차, Teleoperation 수집환경 가동 |
| 3차년도 | 4 주력, 5 착수, 6 개시 | **M7** Synthetic·Real·Demonstration Dataset 1차 릴리스 · **M8** RFM Adapter·Benchmark 합의 · **M9** 실물 Robot Domain Gap 1차 측정 · **M10** 참여기업 Shared Testbed 운영 개시 |
| 4차년도 | 5·6 반복, 표준화 | **M11** Edge Case·Recovery Corpus 고도화 · **M12** 재학습–재검증 Loop **1회 완주**(기본안, 확장 시 2회 이상) · **M13** Ontology·Interface·Asset·Dataset 표준화 · **M14** 상생공간·현장 연계 최종 실증 |

| 단계 | 1차년도 | 2차년도 | 3차년도 | 4차년도 |
|---|:--:|:--:|:--:|:--:|
| 1. 기준선·Interface 설계 | ● | ◐ | ◐ | ◐ |
| 2. Digital Twin 구축 | ◐ | ● | ○ | ○ |
| 3. Physics·Scenario 개발 | ○ | ● | ◐ | ○ |
| 4. Data·RFM 연계 | ○ | ◐ | ● | ◐ |
| 5. Physical Validation | ○ | ○ | ● | ● |
| 6. 데이터팩토리 운영 | ○ | ○ | ◐ | ● |

<small>● 주 수행 · ◐ 병행·개정 · ○ 준비 또는 해당 없음</small>


!!! note "일정 가정"
    위 구간은 **공고문 기준 43개월을 4개 차년도로 나눈** 상대 일정입니다. 1차년도는 공고에 따라
    9개월 기준입니다. 기간이 달라져도 마일스톤 순서는 유지하고 구간만 조정합니다.

---

## 예산 요약

일정·예산은 **공고문 기준(43개월 · 지원규모 75억)** 으로 작성했습니다.

| 구분 | 4년 합계 | 연평균 |
|---|---:|---:|
| **한성대학교 직접 수행예산** | **7.0억** | 1.75억 |
| 모빌테크 공동개발 예산 | 3.0억 | 0.75억 |
| **공동 패키지 합계** | **10.0억** | 2.5억 |

| 차년도 | 한성대 | 모빌테크 | 합계 |
|---|---:|---:|---:|
| 1차년도 (9개월) | 1.3 | 0.6 | 1.9 |
| 2차년도 | 2.0 | 1.0 | 3.0 |
| 3차년도 | 2.0 | 0.9 | 2.9 |
| 4차년도 | 1.7 | 0.5 | 2.2 |
| **합계** | **7.0** | **3.0** | **10.0** |

한성대 7.0억의 Work Package별 배분 — **HSU-2 Deformation Engine 2.2억(31%)**, HSU-4 1.1,
HSU-5 1.1, HSU-3 1.0, HSU-7 0.6, HSU-1 0.5, HSU-6 0.5.

!!! note "기관 수 균등배분이 아닙니다"
    **수행범위와 투입인력에서 쌓아 올린 값**입니다. 연구인력 인월(M/M), 물성시험 횟수·단가,
    장비 수량·단가, Teleoperation 운영시간과 유효 Episode 산출량, 현금·현물·간접비 분리를
    근거로 산정했습니다. 상세 산정표는 내부 자료로 관리하며 협의 시 제시합니다.

    **범위를 줄이면 금액이 따라 줄어드는 구조**입니다. 예컨대 소재군을 2종에서 4종으로 늘리면
    물성시험이 30회에서 60회 이상으로 늘어납니다. 총사업비가 확정되면
    **① 소재군 ② Use Case ③ Digital Twin 대상 ④ Teleoperation 조 수 ⑤ 반복 검증
    ⑥ Shared Testbed** 순으로 범위와 예산을 함께 조정합니다.

---

## 기대 산출물

### 대표 산출물 — Manufacturing Deformation Engine

| 구성물 | 내용 |
|---|---|
| Engine 본체 | Contact Patch Estimator, Material Response Model, State Update, Data Labeler — Isaac Sim 연동 모듈 |
| Material Library | 소재군별 마찰·강성·감쇠·복원·변형/파손 임계값과 불확실성 범위 |
| Calibration Tool | 실계측 데이터로 파라미터를 식별·보정하는 도구와 절차서 |
| 검증 리포트 | v1~v3 각 단계의 시험 조건, 실측 대조 결과, 오차와 적용 한계 |
| 공개 성과 | 논문·특허와 Engine 규격 문서 — 컨소시엄 참여기관이 재현할 수 있는 수준의 기술문서 |

### 학생 주도 Human Data Engine 산출물

| 구성물 | 내용 |
|---|---|
| Demonstration Corpus | 성공·경계·실패회피·복구 행동, 작업자·전략 다양성이 확보된 Episode 집합 |
| Edge Case 검수 결과 | 재생 확인·태깅·병합·기각 이력과 학생 신고(flag) 기반 신규 후보 |
| 복구 시연 Set | 확정된 실패 상황별 사람의 복구 행동 기록 |
| 운영 Protocol | Task·안전·품질 SOP, 6인 역할 순환 체계, 교육·검수 절차서 |
| 인력 성과 | 6개 역할을 모두 경험한 Physical AI 실무인력 |
| **MD 과정 교보재** | 모듈별 교재·실습 Protocol, QC 반려 사례집, 모델 실패 사례연구 — 과제 종료 후에도 운영 가능 |

### 그 밖의 산출물

- 제조환경 **Simulation-ready Digital Twin Asset Package**와 검수 기준
- 물성·접촉·변형 파라미터 **Material & Physics Schema**
- 제조 자산·공정·상태·실패·복구를 연결하는 **Manufacturing Ontology·Knowledge Graph**
- 규칙·희소성·불확실성·Domain Gap 기반 **Edge Case Extractor와 Scenario Package**
- Isaac Sim·ROS 2 기반 **Robot·Sensor·Task Scenario Library**
- 정상·실패·복구·Edge Case를 포함한 **Synthetic·Real·Teleoperation RFM Dataset**
- RFM·Robot HW 연계를 위한 **Model·Control·Validation Interface**
- 참여기업 Asset·Model·Robot의 **HSU-PAC 공동 사전검증 운영체계**
- 실물 검증 기반 **Domain Gap Report와 Calibration Data**
- 반복적인 데이터 생성–학습–검증을 위한 **Validation Feedback Pipeline**
- Ontology 희소조합을 생성 조건으로 바꾸는 **Cosmos 조준 규약과 생성 조건 명세**
- 접촉력·변형량·물성·Edge Case ID 를 담는 **LeRobotDataset 확장 필드 규약서**
- Cosmos 생성물과 Isaac Sim Episode 를 Asset·Scenario·Task·Material 버전으로 잇는 **Scene–Scenario 정합 절차**
- 지표 정의·산정식·측정절차를 담은 **정량 KPI 정의서와 기준선(Baseline) Report**
- 기간·범위·기술 리스크의 **리스크 관리대장과 완화 이력** — 현황은 [기술 상세](technical.md) 참조

---

## 더 읽을 것

- **[기술 상세](technical.md)** — Deformation Engine · Ontology·Edge Case · 학생 Human Data
  Engine · Cosmos·LeRobot 구축 최적화 · 정량 KPI 전체 · 검증 체계
- [한성대학교 Physical AI 교육·연구 플랫폼 HSU-PAC](../hsu-pac.md)

---

`Manufacturing Digital Twin` · `Deformation Engine` · `Manufacturing Ontology` · `NVIDIA Cosmos` · `LeRobot` · `Robot Foundation Model` · `Isaac Sim` · `ROS 2` · `Sim-to-Real`
