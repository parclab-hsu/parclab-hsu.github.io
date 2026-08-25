---
noindex: true
---

# 한성대학교 Physical AI 교육·연구 플랫폼 (HSU-PAC)

:material-circle-outline:{ style="color:#e0a800" } **구축 제안** · Hansung University Physical AI Computing Platform

!!! abstract "프로젝트 한눈에 보기"
    HSU-PAC는 **30명 규모(6명 × 5개 조)**의 Physical AI 교육을 위해 학생 노트북, 교내 GPU
    서버, NVIDIA DGX Spark, 10GbE 네트워크, 공용 스토리지, AWS GPU를 하나의 개발
    파이프라인으로 연결하는 하이브리드 교육·연구 플랫폼입니다.

    학생의 RTX 4060급 노트북은 코드 작성, ROS 2 실습, 데이터 확인과 원격 접속을 담당합니다.
    고성능 GPU가 필요한 Isaac Sim, Isaac Lab, 합성데이터 생성, 강화학습, 비전·로봇 모델
    학습은 교내 RTX PRO 6000 서버에서 처리합니다. 96GB GPU 메모리보다 큰 모델을 로드하거나
    메모리 중심의 파인튜닝·추론이 필요한 경우 DGX Spark를 사용하고, 학기말 캡스톤처럼 짧은
    기간에만 필요한 대규모 멀티GPU 학습은 AWS로 확장합니다.

> **핵심 운영 원칙** — 상시 수업은 온프레미스, 대형 모델 실험은 DGX Spark, 일시적 최대부하는 AWS가 담당합니다.

<figure markdown>
  ![Physical AI 교육을 위한 온프레미스 + 클라우드 하이브리드 시스템 구축 방안](../assets/hsu-pac-system-plan.png){ loading=lazy }
  <figcaption>시스템 구축 방안 전체 요약 (클릭하여 확대)</figcaption>
</figure>

---

## 왜 필요한가

Physical AI 교육은 일반적인 Python·AI 실습보다 훨씬 많은 연산자원을 요구합니다. Isaac Sim의 고해상도 시뮬레이션, 다중 환경 병렬 실행, 강화학습, 로봇 파운데이션 모델은 학생 개인 노트북만으로 안정적으로 운영하기 어렵습니다.

| 구분 | 학생 노트북 RTX 4060 | 교내 GPU 플랫폼 |
|---|---:|---:|
| 주요 역할 | 코드 작성, ROS 2, 원격 접속 | 시뮬레이션, 학습, 추론, 렌더링 |
| 일반 GPU 메모리 | 약 8GB | RTX PRO 6000: 96GB |
| 대형 모델 메모리 | 제한적 | DGX Spark: 128GB 통합 메모리 |
| 다중 사용자 운영 | 개인 단말 | 계정·컨테이너·작업 큐 기반 공유 |
| 대규모 확장 | 불가 | AWS 멀티GPU 버스트 |

### 학생 노트북으로 어디까지 가능한가 — 운영 기준

RTX 4060(8GB)은 **Isaac Sim 공식 최소사양(VRAM 16GB)에 미달**합니다.
**Isaac Sim 실행은 교내 GPU 서버가 기본**이고, 학생 노트북은 코드 작성·ROS 2·URDF 편집·
데이터 확인·원격접속 단말로 씁니다. 이 구분이 HSU-PAC 운영의 기준선입니다.

| 구분 | 학생 노트북에서 | 교내 GPU 서버에서 |
|---|---|---|
| 개발·도구 | Python·Git·Docker, VS Code Remote, JupyterHub 접속 | — |
| ROS 2 | 노드 작성·실행, 토픽 확인, rosbag 재생 | 시뮬레이터 연동 브리지 |
| USD·URDF | 파일 편집·검증, 구조 확인 | Isaac Sim 로드·시각 확인 |
| **Isaac Sim** | **실행하지 않음** (VRAM 미달) | **모든 씬 — 원격 실행·스트리밍** |
| 렌더링·센서 | 결과 영상·이미지 확인 | RTX 카메라, Replicator 합성데이터 생성 |
| 학습 | 결과 지표·로그 확인 | Isaac Lab 병렬 강화학습, LeRobot 학습 |
| 대형 모델 | — | GR00T/VLM/VLA 적재·검증 → DGX Spark 계열 |

- **기준선**: GPU 연산이 필요한 모든 작업은 **서버 세션 예약**. 노트북은 편집·확인·접속 전용.
- 1~3주차(Linux·Git·Docker·ROS 2 기초)는 노트북만으로 수행 가능하고,
  **4주차 이후 Isaac Sim 이 들어가는 시점부터 서버 세션이 필요**합니다.
- 수업 자료의 씬마다 "노트북 가능 / 서버 필요" 뱃지를 표기해 학생이 스스로 판단

30명의 교육환경에서는 다음 네 가지 문제를 함께 해결해야 합니다.

1. **동시성** — 30명이 로그인하더라도 모든 학생이 동시에 고사양 시뮬레이션을 실행하지 않도록 개인·조·공용 자원을 계층화해야 합니다.
2. **재현성** — 학생마다 CUDA, ROS 2, Python 버전이 달라 발생하는 환경 문제를 컨테이너로 제거해야 합니다.
3. **경제성** — 매주 반복되는 수업을 모두 AWS로 운영하면 사용시간에 따라 비용이 계속 증가합니다.
4. **확장성** — 학기말 대규모 학습만 클라우드로 확장하고, 평상시에는 교내 자원을 우선 활용해야 합니다.

---

## 권장 시스템 아키텍처

<figure markdown>
  ![HSU-PAC 시스템 블록도](../assets/hsu-pac-blockdiagram.png){ loading=lazy }
  <figcaption>시스템 블록도 — 학생 30명은 서버로 접속(ROS 2·WebRTC), 대용량 모델은 DGX Spark 노드(대수는 사용률 기반 증설)가 담당</figcaption>
</figure>

```mermaid
flowchart TB
    subgraph STUDENT["학생 실습 계층 · 30명"]
        NB["RTX 4060 노트북 ×30<br/>Windows 또는 Linux"]
        DEV["VS Code · SSH · JupyterLab<br/>ROS 2 · Git · Web Browser"]
        NB --> DEV
    end

    DEV -->|"1/2.5GbE 또는 Wi-Fi 6/7"| ACCESS["실습실 Access Switch"]
    ACCESS -->|"10GbE Uplink"| CORE["10GbE Core Switch"]

    subgraph PLATFORM["교육 플랫폼·관리 계층"]
        HUB["JupyterHub · 사용자 인증"]
        GIT["GitLab 또는 GitHub Classroom"]
        QUEUE["GPU 예약·작업 큐<br/>Docker + Slurm"]
        MON["DCGM · Prometheus · Grafana"]
    end

    CORE --> HUB
    HUB --> QUEUE
    HUB --> GIT
    MON --> QUEUE

    subgraph COMPUTE["교내 GPU 연산 계층"]
        RTX["공용 GPU 서버<br/>RTX PRO 6000 Blackwell 96GB급 GPU 서버<br/>Isaac Sim · Isaac Lab · 중형 학습"]
        SPARK["DGX Spark<br/>128GB 통합 메모리<br/>VLM·VLA·대형 모델 실험"]
    end

    QUEUE --> RTX
    QUEUE --> SPARK

    subgraph STORAGE["데이터 계층"]
        NAS["NAS 40~80TB<br/>RAID6/RAIDZ2 · Snapshot · NFS"]
        DATA["Dataset · Checkpoint<br/>학생 Home · Container Cache"]
        NAS --> DATA
    end

    CORE --> NAS
    RTX --> NAS
    SPARK --> NAS

    subgraph CLOUD["클라우드 확장 계층"]
        S3["Amazon S3<br/>필요 데이터만 동기화"]
        AWS["AWS EC2 GPU<br/>G6e / P 계열<br/>대형·멀티GPU 학습"]
    end

    NAS -.->|"암호화 동기화"| S3
    S3 --> AWS
    AWS -.->|"결과·체크포인트 회수"| NAS

    subgraph ROBOT["Physical AI 실물 계층"]
        ARM["로봇암·그리퍼"]
        MOBILE["AMR·Mobile Manipulator"]
        SENSOR["Camera·LiDAR·F/T Sensor"]
    end

    CORE -->|"ROS 2 / DDS"| ROBOT
    RTX -->|"정책 배포·Digital Twin"| ROBOT
```

### 네트워크 설계 원칙

학생 노트북 30대 모두에 10GbE를 제공할 필요는 없습니다. 학생 단말은 코드, 명령, 원격 화면을 주고받기 때문에 1GbE 또는 2.5GbE로 충분합니다. 실제 대용량 데이터가 이동하는 **GPU 서버–DGX Spark–NAS–Core Switch 구간**을 10GbE 이상으로 구성하는 것이 비용 효율적입니다.

- 학생 단말: 1GbE/2.5GbE 또는 Wi-Fi 6/7
- Access Switch 업링크: 10GbE 2회선 이상 권장
- RTX 서버: 10GbE 2포트 권장
- DGX Spark: 10GbE 연결 (노드 간 분산학습은 내장 ConnectX-7 200G 직결 활용)
- NAS: 10GbE 2포트 LACP 또는 25GbE 확장 고려
- 서버 관리망, 학생망, 로봇망, 스토리지망 VLAN 분리

---

## 구성 요소별 역할

### 1. RTX PRO 6000 공용 GPU 서버

교과목에서 가장 자주 사용하는 핵심 연산 노드입니다.

!!! success "기존 교내 자산 우선 활용 (2026-07 확정)"
    교내에 기 구축된 GPU 서버(**RTX PRO 6000 Blackwell 96GB급 GPU 서버** — 총 GPU 메모리
    384GB, 64코어/512GB, Kubernetes 운영 중)를 주 연산 노드로 우선 활용합니다. 신규 GPU
    서버 구매는 초기 필수항목에서 제외하고, 사용률 실증 후 증설 선택항목으로 조정 —
    초기 예산을 스토리지·백업·네트워크·플랫폼·DGX Spark에 우선 배정합니다.

    GPU 운영(권장 배치): **GPU 0 = `4g.96gb+gfx`**(교수 시연·대형 장면·장애 시 예비),
    **GPU 1·2 = `2g.48gb+gfx` ×2씩**(1~4조 Isaac Sim 격리 세션), **GPU 3 = Full 또는
    고정 프로파일**(5조·Isaac Lab 학습 큐·합성데이터). 방학·연구 집중기에는 4GPU
    통합(DDP)으로 전환. MIG 프로파일은 학기 시작 전 고정, 학기 중 변경 금지.

- Isaac Sim 원격 실행 및 스트리밍
- Isaac Lab 강화학습, 합성데이터 생성
- 비전 모델 학습·평가, 디지털 트윈 렌더링
- 조별 중형 학습 작업, 교수 시연 및 과제 자동평가

RTX PRO 6000 Blackwell은 96GB GDDR7 메모리와 최대 4개의 MIG 인스턴스를 지원합니다. 다만 MIG 4분할이 곧바로 "30명 동시 Isaac Sim"을 의미하지는 않습니다. 고해상도 그래픽 세션, 학습 작업, 컨테이너 오버헤드를 고려해 **5개 조 중심의 예약·큐 방식**으로 운영해야 합니다.

#### 권장 서버 사양

| 항목 | 권장 사양 |
|---|---|
| GPU | RTX PRO 6000 Blackwell 96GB급 GPU 서버 |
| 확장성 | 향후 동일 GPU 2~4장 장착 가능한 4U급 섀시 |
| CPU | AMD EPYC 또는 Intel Xeon, 32코어 이상 |
| 시스템 메모리 | ECC RAM 256GB 이상, 권장 512GB |
| OS 스토리지 | NVMe RAID1 2TB 이상 |
| Scratch | NVMe 4~8TB |
| 네트워크 | 10GbE 2포트 이상 |
| 전원 | 이중화 PSU 및 UPS 권장 |
| 운영체제 | Ubuntu Server LTS |

!!! warning "조달 시 유의"
    **(조달 시 유의사항 — 현재 보유 사양에 대한 서술이 아닙니다.)** 조달 사양서에는 반드시 **Server Edition**을 명시해야 합니다. Workstation Edition과
    냉각구조 및 서버 적용조건이 다릅니다.

!!! warning "그래픽 세션 운영 방식 (`+gfx` MIG 기반)"
    RTX PRO 6000 Blackwell은 그래픽 API를 지원하는 **Universal MIG `+gfx` 프로파일**
    (`1g.24gb+gfx` · `2g.48gb+gfx` · `4g.96gb+gfx`)을 제공합니다 — 조별 Isaac Sim 세션은
    **`+gfx` MIG 컨테이너 격리를 기본안**, 복잡한 장면·교수 시연·대형 학습은 **Full GPU
    예약을 병행안**으로 운영합니다(Max-Q는 vGPU만 미지원 — 라이선스 비용 불요).
    단, 프로파일 지원과 Isaac Sim 운영 보장은 다르므로 개강 전 PoC로 확정합니다:
    대표 수업 장면의 렌더링·NVENC·WebRTC·ROS 2 Bridge·동시접속·장애 복구 실측,
    30명 JupyterHub 동시 로그인, PCIe 토폴로지·NCCL 검증. 향후 신규 서버 증설 시에는
    **Server Edition**을 명시해 조달합니다.

### 2. DGX Spark

DGX Spark는 128GB 통합 메모리를 제공하는 소형 Grace Blackwell 시스템입니다. 처리량 중심의 대규모 학습 서버라기보다, 일반 GPU 메모리에 들어가지 않는 모델을 로드하고 검증하는 **대형 모델 개발·실험 노드**로 사용하는 것이 적절합니다.

- GR00T, VLM, VLA, LLM 기반 로봇지능 모델 로드
- LoRA·QLoRA 등 메모리 효율형 파인튜닝, 대형 모델 양자화 및 추론
- AWS 학습 전 코드·데이터 파이프라인 사전 검증
- 교수자·대학원생·캡스톤 프로젝트 예약형 사용
- Arm 기반 소프트웨어 호환성 검증

공용 예약 노드로 시작해 사용률에 따라 단계적으로 증설합니다. **구체 대수는 실물·자산대장 확인 후 확정합니다.**

### 3. NAS 및 공용 스토리지

Physical AI는 이미지, 영상, 포인트클라우드, 시뮬레이션 로그, 체크포인트가 빠르게 누적됩니다.

- 원본 60~80TB, 실사용 40TB 이상 권장, RAID6 또는 RAIDZ2
- 학생 Home 및 조별 프로젝트 NFS 제공, 데이터셋 읽기 전용 영역 분리
- 조별 저장공간 Quota, 일일 Snapshot
- **백업 계층 분리**: 스냅샷(1차)과 별도로 40~100TB 오브젝트/백업 스토리지(2차, Air-gap 권장)를 운영 — 스냅샷만으로는 랜섬웨어·볼륨 장애에 취약
- AWS 동기화 영역 분리, 기업과제·개인정보 데이터 외부 반출 통제

---

## 30명 동시교육 운영 모델

30명의 학생을 6명씩 5개 조로 편성하고, 개인·조·공용 작업을 구분합니다.

| 실습 유형 | 운영 단위 | 권장 운영 방식 |
|---|---:|---|
| Python·ROS 2·Git | 개인 30명 | 노트북 또는 경량 컨테이너 |
| JupyterLab·코드 편집 | 개인 30명 | CPU/RAM 중심, GPU 미점유 |
| Isaac Sim 기본 조작 | 2~3인 또는 조별 | 5~10개 세션, 시간 분할 |
| Isaac Lab 강화학습 | 조별 5개 작업 | GPU 작업 큐 및 예약제 |
| GR00T·VLA 실습 | 조별 순환 | DGX Spark 예약 사용 |
| 대규모 파인튜닝 | 프로젝트별 | AWS 버스트 |

### 수업 시간의 권장 흐름

```mermaid
sequenceDiagram
    participant S as 학생 노트북
    participant H as JupyterHub/VS Code
    participant Q as GPU Scheduler
    participant R as RTX PRO 6000 Server
    participant D as DGX Spark
    participant N as NAS
    participant C as AWS GPU

    S->>H: 학교 계정 로그인
    H->>S: 개인·조별 개발환경 제공
    S->>Q: 시뮬레이션/학습 Job 제출
    Q->>R: 일반 시뮬레이션·중형 학습 배정
    Q->>D: 대형 모델 메모리 작업 배정
    R->>N: 로그·데이터·체크포인트 저장
    D->>N: 모델 결과 저장
    N-->>C: 학기말 대규모 작업만 동기화
    C-->>N: 학습 결과 회수 후 인스턴스 종료
```

### 현실적인 동시성 기준

RTX PRO 6000 한 장으로 30개의 완전 독립된 고해상도 Isaac Sim 세션을 동시에 제공하는 것은 어렵습니다. 따라서 다음 중 하나를 적용해야 합니다.

1. 조별 대표 세션 운영
2. 2~3인 페어 실습
3. Headless 학습과 3D 뷰포트 세션 분리
4. 실습 시간을 순환형으로 설계
5. 사용률 측정 후 RTX PRO 6000 추가 증설

### 구조 타당성 시뮬레이션 검증

"30명이 서버에 접속해 ROS 2 통신으로 학습하고, 대용량 모델은 다수의 DGX Spark로 처리하는
구조가 실제로 동작하는가"를 이산사건 시뮬레이션(수업 3시간 × 30회 반복)으로 검증했습니다.

<figure markdown>
  ![DGX Spark 대수별 대형 모델 잡 대기시간](../assets/hsupac_sim_spark_wait.png){ loading=lazy }
</figure>

<figure markdown>
  ![10G 네트워크 부하](../assets/hsupac_sim_network.png){ loading=lazy }
</figure>

| 검증 질문 | 판정 |
|---|---|
| 30명 동시 접속 (Jupyter/ROS 2 상시 세션) | :material-check-circle:{ style="color:#2e9e44" } 가능 — 단, 서버 CPU는 48코어 이상 권장 (32코어는 시뮬 세션 4개 동시 구동 시 포화) |
| MIG 4분할 조별 Isaac Sim 세션 | :material-check-circle:{ style="color:#2e9e44" } 가능 — 우선순위 예약제 전제, P95 대기 30분 미만 |
| 다수 Spark로 대용량 모델 처리 | :material-check-circle:{ style="color:#2e9e44" } 가능 — 대형 모델 집중 주차(11~14주)에 노드 수요가 몰린다. **필요 대수는 실측 후 산정** |
| ROS 2 + WebRTC + NAS가 10G 내 수용 | :material-check-circle:{ style="color:#2e9e44" } 가능 — 피크 약 1.2Gbps로 10G의 12%만 사용 |

시뮬레이션이 뒷받침하는 운영 경로: **Spark 공용 노드로 시작 → 대형 모델 집중 주차 전
3~5대로 증설(또는 부족분 AWS 병행)**. RL 학습 잡은 배치 큐로 제출해 수업 후 완료를
허용하고, ROS 2는 조별 `ROS_DOMAIN_ID` 분리로 DDS 디스커버리 폭주를 방지합니다.

### 자원 분배·회수 정책

| 자원 | 개인 기본값 | 조별/프로젝트 |
|---|---|---|
| CPU / RAM | 2~4코어 / 8~16GB | 8~16코어 / 32~64GB |
| 저장공간 | 20~50GB | 1~2TB |
| GPU | 직접 고정 할당 없음 — 세션·Job 예약제 | 조별 격리 세션 16~24GB (개인당 1.5~2GB 분할은 Isaac Sim에 부적합) |
| GPU Job 시간 | 2~4시간 제한 | 교수 승인 시 연장 |
| 유휴 세션 | **30~60분 후 자동 종료** (수업시간 예외) | 야간 작업은 예약제 + 체크포인트 자동 저장 |

- 실시간 사용량 대시보드 제공, 과도 사용 시 관리자 알림 — Slurm/K8s에서 CPU·RAM·GPU-hour·Storage Quota 통합 관리

---

## 소프트웨어 플랫폼

| 계층 | 권장 구성 | 역할 |
|---|---|---|
| 사용자 인증 | 학교 계정 연동, LDAP/OIDC | 학생·조교·교수 권한 분리 |
| 개발환경 | JupyterHub, VS Code Remote SSH | 웹·원격 통합 개발환경 |
| 컨테이너 | Docker, NVIDIA Container Toolkit | 수업환경 표준화 |
| 스케줄링 | 초기 예약제, 이후 Slurm | GPU 작업 큐·우선순위 관리 |
| 시뮬레이션 | NVIDIA Isaac Sim | 디지털 트윈·합성데이터 |
| 로봇학습 | Isaac Lab, PyTorch, LeRobot | 강화학습·모방학습 |
| 미들웨어 | ROS 2 | 실물 로봇 연계 |
| 모델 관리 | MLflow 또는 W&B | 실험·체크포인트 추적 |
| 형상 관리 | GitLab 또는 GitHub Classroom | 과제·프로젝트 협업 |
| 모니터링 | DCGM, Prometheus, Grafana | GPU·서버·스토리지 상태 |
| 클라우드 | AWS CLI, S3, EC2, Budget | 버스트·비용통제 |

RTX 서버는 x86-64, DGX Spark는 Arm 기반이므로 컨테이너 이미지는 가능한 범위에서 multi-architecture로 관리해야 합니다. x86 전용 패키지는 DGX Spark에서 실행되지 않을 수 있으므로 학기 시작 전에 호환성 검증이 필요합니다.

---

## 온프레미스와 AWS 비교

| 항목 | 교내 RTX 서버 | DGX Spark | AWS GPU |
|---|---|---|---|
| 핵심 목적 | 상시 수업·시뮬레이션·중형 학습 | 대형 모델 로드·추론·메모리 중심 실험 | 단기 대형·멀티GPU 학습 |
| 초기비용 | 높음 | 중간 | 낮음 |
| 운영비 | 전기·유지관리 중심 | 전기·유지관리 중심 | 사용시간·스토리지·전송량 과금 |
| 수업 안정성 | 항상 확보 | 항상 확보 | 리전 용량·기동시간 영향 |
| 지연시간 | 교내망으로 낮음 | 교내망으로 낮음 | 인터넷 품질 영향 |
| 데이터 보안 | 교내 저장 | 교내 저장 | 외부 반출·S3 정책 필요 |
| 확장성 | GPU 증설 필요 | 장비 추가 | 즉시 다중 GPU 확장 |
| 권장 사용 | 매주 반복되는 실습 | 심화 프로젝트 | 학기말 피크·연구과제 |

**온프레미스가 유리한 경우** — 학기마다 반복되는 정규수업, 매주 정해진 시간에 반드시 사용할 자원, 대용량 데이터 외부 전송이 부담되는 경우, 기업·의료·로봇 실험 데이터의 교내 보관이 필요한 경우, 방학·야간 연구 활용률이 높은 경우

**AWS가 유리한 경우** — 학기말 1~2주에만 연산 수요가 급증하는 경우, 여러 GPU가 필요한 대규모 분산학습, 신규 모델의 단기 벤치마크, 장비 구매 전 성능 검증, 일시적인 연구과제 최대부하 처리

AWS Spot은 비용을 크게 낮출 수 있지만 중단 가능성이 있으므로 체크포인트 저장, 자동 재시작, 인스턴스 자동 종료가 전제되어야 합니다.

---

## 권장 하이브리드 운영전략

=== "상시 수업"

    - RTX PRO 6000 서버 중심 운영
    - JupyterHub 및 컨테이너 상시 제공
    - 조별 GPU 예약 또는 작업 큐
    - Isaac Sim·Isaac Lab 공통 이미지 사전 배포
    - 과제 결과·체크포인트 NAS 저장

=== "대형 모델 실습"

    - DGX Spark 공용 예약 운영
    - VLM·VLA·GR00T 모델 로드
    - 양자화, LoRA, QLoRA 기반 실습
    - AWS 실행 전 파이프라인 검증

=== "학기말 캡스톤·연구과제"

    1. 교내 서버에서 소형 데이터로 코드 검증
    2. 필요한 데이터만 NAS에서 S3로 동기화
    3. AWS GPU 인스턴스 자동 생성
    4. 동일 Docker 이미지로 학습 실행
    5. 체크포인트 주기 저장
    6. 학습 완료 후 인스턴스 자동 종료
    7. 결과를 NAS로 회수

    AWS 계정에는 조별 예산 상한, 태그 기반 비용관리, 자동 종료, 이상비용 알림을 적용합니다.

---

## 교육·연구 테스트베드 공간 구성

**"생각하고 학습시키는 공간(AI 실습실)"과 "움직이고 검증하는 공간(로봇 실증 테스트베드)"**을
연결한 공간 구성안입니다. 두 공간은 10/25GbE로 서버실(GPU 서버·NAS·Core Switch·Kubernetes)과
데이터/제어가 연동됩니다.

<figure markdown>
  ![Physical AI 교육·연구 테스트베드 공간 구성안](../assets/hsu-pac-testbed-layout.png){ loading=lazy }
  <figcaption>Physical AI 교육·연구 테스트베드 공간 구성안 — 실습실(조별 5테이블) · 로봇 실증 6존 · Mission 준비존 · 서버실</figcaption>
</figure>

| 구역 | 구성 | 역할 |
|---|---|---|
| Physical AI 실습실 (파랑) | 조별 실습 테이블 5개(6인) · 교수자 시연/전자칠판 · 장비 캐비닛 · JupyterHub/VS Code/ROS 2 | 시뮬레이션·개발 — 서버 접속 실습 |
| 로봇 실증 공간 (주황) | ① Mobile Robot Arena(AMR·주행 실증) ② Robot Manipulation Cell(협동로봇·F/T 센서) ③ Wearable Robot·HRI ④ Sensor & Perception Studio(RGB-D·LiDAR·캘리브레이션) ⑤ Maker & Rapid Prototyping(3D프린터·전자제작) ⑥ Presentation·Collaboration(발표·전시·기업 미팅) | sim-to-real 검증·실증·시연 |
| Mission 준비존 (연두) | Mission 1~5: 이동·주행 / 비전·인식 / 센서 캘리브레이션 / 조작·매니퓰레이션 / 통합·협업 학습 | 조별 미션 수행 — 커리큘럼과 1:1 대응 |
| 서버실·기자재실 | GPU 서버·NAS·Core Switch·Kubernetes / 로봇·센서·부품 보관 | 인프라·자재 |

## 교육환경 3계층 구조

```mermaid
flowchart LR
    A["1계층<br/>시뮬레이션·연산<br/>RTX 서버 + DGX Spark"] --> B["2계층<br/>실물 로봇<br/>로봇암·AMR·센서"]
    B --> C["3계층<br/>클라우드 버스트<br/>AWS 대형 학습"]
    C -.->|"학습 모델 회수·재배포"| B
    B -.->|"실물 데이터 수집"| A
```

| 계층 | 구성 | 교육 목표 |
|---|---|---|
| 1계층 | RTX 서버, DGX Spark, Isaac Sim | 안전한 반복실험과 정책학습 |
| 2계층 | 조별 로봇암, AMR, 센서 | Sim-to-Real 격차 분석 |
| 3계층 | AWS GPU | 대형 모델·멀티GPU 학습 |

---

## 연산·저장 자원 현황 — 3단계 정본표

!!! warning "이 표가 정본입니다"
    **실물·자산대장 확인 전까지 본문과 도식에서 구체 대수·세부 모델명을 쓰지 않습니다.**
    이전에는 `×1`·`×4`, `Server Edition`·`Max-Q`, DGX Spark `1대`·`1~2대`·`최대 5대`가 혼재했는데,
    모순을 고지하는 대신 **구체 수치를 제거**했습니다. 확인되면 아래 3단계로 한 번에 확정합니다.

| 단계 | 자원 | 상태 |
|---|---|---|
| **① 실제 보유·운영 중** | RTX PRO 6000 Blackwell 96GB급 GPU 서버, NAS, 10GbE 코어망, Isaac Sim·Isaac Lab·ROS 2 환경, 실습실·로봇 실증공간 | **대수·정확한 모델명은 확인 필요** |
| **② 발주 또는 구축 확정** | — | 과제 착수 시 확정. Teleoperation Console, F/T·Tactile·형상계측 Sensor, Calibration 지그, 기업별 격리환경 |
| **③ 사용률 기반 선택 증설** | DGX Spark 추가 노드, NAS 증설, AWS G6e/P 버스트 | 평균 GPU 사용률·대기시간 기준 충족 시 |

!!! note "GPU 메모리 합산값 주의"
    GPU 여러 장의 메모리를 더한 값은 **단일 모델이 곧바로 쓸 수 있는 용량이 아닙니다.**
    그 용량을 쓰려면 모델·파이프라인 병렬화가 필요하고 통신 대역폭과 구현 비용이 따릅니다.
    단일 GPU 메모리를 넘는 모델의 적재·검증은 통합 메모리를 쓰는 DGX Spark 계열이 적합합니다.

---

## 15주 커리큘럼 매핑

| 주차 | 교육 내용 | 주요 자원 |
|---|---|---|
| 1~3주 | Linux, Git, Docker, ROS 2 기초 | 학생 노트북·JupyterHub |
| 4~5주 | USD/URDF, Isaac Sim, 센서 시뮬레이션 | RTX 서버 |
| 6~8주 | Isaac Lab 강화학습, 병렬 환경 | RTX 서버 |
| 9~10주 | LeRobot·모방학습, 데이터 수집 | RTX 서버·실물 로봇 |
| 11~12주 | VLM/VLA·GR00T 구조와 추론 | DGX Spark |
| 13주 | Sim-to-Real 정책 이전 | RTX 서버·실물 로봇 |
| 14주 | 대형 파인튜닝·AWS 버스트 | DGX Spark·AWS |
| 15주 | 캡스톤 시연 및 성능평가 | 전체 플랫폼 |

---

## 보안 및 운영정책

- 학생에게 GPU 서버 관리자 권한을 부여하지 않음
- 학생별 계정, 조별 Linux Group, 저장공간 Quota 분리
- 외부 접속은 VPN 또는 Zero Trust 방식으로 제한
- 서버망·학생망·로봇망·스토리지망 VLAN 분리
- CPU·RAM·GPU·스토리지 사용량 제한
- 기업과제·개인정보 데이터의 AWS 업로드 승인제
- AWS Access Key를 학생 PC에 직접 저장하지 않음
- 학기별 컨테이너 이미지 버전 고정
- 학기 종료 후 홈디렉터리 보관기간과 삭제정책 운영
- GPU 사용률·온도·오류·스토리지 용량 통합 모니터링

---

## 구축 단계 및 일정

장비 발주 후 납품까지 **2~3개월의 리드타임**이 일반적이므로, 전체 기간은 **6~9개월**로 보수적으로 계획합니다. 납기 대기 기간에는 AWS 파일럿 환경으로 선행 교육·개발을 진행할 수 있습니다.

| 단계 | 구축 내용 | 완료 기준 |
|---|---|---|
| Phase 1 | RTX 서버 1대, DGX Spark 1대, 10GbE, NAS | 30명 계정·접속 시험 |
| Phase 2 | JupyterHub, 컨테이너, 모니터링, 예약제 | 5개 조 동시 수업 파일럿 |
| Phase 3 | AWS S3·EC2 버스트 자동화 | 학습 후 자동 종료·결과 회수 |
| Phase 4 | 로봇암·AMR·센서 연동 | Sim-to-Real 캡스톤 수행 |
| Phase 5 | GPU 또는 DGX Spark 추가 증설 | 사용률 기반 확장 |
| (선택) Phase 2 연구용 확장 | H100/H200급 GPU 노드 4~8대 + 200/400G InfiniBand/RoCE + 병렬 파일시스템 | **별도 사업** — 연구 수요·시설 예산 확보 후 (전력 증설·고밀도 냉각 포함) |

세부 일정(총 6~9개월): 요구사항·예산 확정 1개월 → 조달 사양·입찰 준비 1~2개월 → 장비
발주·납기 2~4개월(이 기간에 AWS에서 컨테이너·실습 콘텐츠 선행 개발) → 시설·네트워크 공사
2~4주 → 플랫폼 구축 3~4주 → 시험·검증 2~4주(30명 동시접속·GPU·NAS·장애 복구 시험) →
교육 준비 2주(이미지 고정·교재 점검·조교 교육).

### 시설·전력 검토 (사전 확정 금지 항목)

초기 교육 플랫폼은 H100/H200급 클러스터(노드당 10kW+)보다 시설 부담이 훨씬 작지만,
"일반 냉방으로 충분"을 사전에 확정하지 않고 **최종 서버·NAS·UPS 사양 기준으로 실측과
전기 설계를 수행해 확정**합니다.

- 전기: 전용 회로, 분전반 여유, 차단기 용량, 접지
- UPS: 정전 대응시간, 배터리 교체주기, 바이패스 구성
- 냉방: 여름철 최대 부하, 랙 후면 열 배출, 실내 환기
- 환경: 소음, 먼지, 화재감지, 출입통제
- Phase 2(H100/H200급 연구 확장) 진행 시: 고밀도 전력·수랭·항온항습·PUE 산정을 **별도 사업**으로 분리

### 증설 판단 기준

다음 조건 중 하나가 반복되면 GPU 증설을 검토합니다.

- 수업 중 GPU 평균 사용률 80% 이상
- VRAM 부족으로 작업 실패 반복
- 조별 대기시간이 수업 운영을 방해
- 연구과제와 정규수업 시간 충돌
- 수강인원 30명 초과

---

## 기대 효과

- 30명이 동일한 표준 개발환경에서 Physical AI 실습
- 개인 노트북 성능 차이로 인한 교육격차 완화
- 시뮬레이션–학습–실물배포의 전체 파이프라인 경험
- Docker, GPU Scheduler, MLOps, 클라우드 운영역량 확보
- 정규수업 외 캡스톤·대학원·산학과제에 공동 활용
- 반복 워크로드의 클라우드 비용 누적 방지, 일시적 최대부하만 AWS로 처리하여 과잉투자 방지

---

## 자주 묻는 질문

??? question "학생이 따로 준비할 것이 있나요?"
    없습니다. 브라우저와 교내망 접속만 있으면 됩니다. 개발환경은 전부 서버 쪽 컨테이너로
    제공되며, 첫 수업에서 계정만 배부받으면 바로 실습을 시작합니다.

??? question "왜 클라우드로만 운영하지 않나요?"
    학기 내내 상시 사용하는 교육 워크로드는 종량제 클라우드에 매우 불리한 사용 패턴입니다.
    수업 시간에 인스턴스 회수·기동 지연 리스크도 있습니다. 반대로 학기말에만 필요한 대형
    학습은 클라우드가 유리하므로, 그 부분만 버스트로 처리하는 하이브리드가 최적입니다.

??? question "수강 인원이 늘어나면 어떻게 되나요?"
    공유 서버가 다중 GPU 확장형(4U 섀시)이므로 GPU 증설로 동시 세션이 늘어나고, DGX Spark도
    대수 추가로 선형 확장됩니다. 증설 판단 기준(사용률 80% 등)에 따라 단계적으로 확장합니다.

??? question "다른 수업·연구에도 쓸 수 있나요?"
    네. 수업 시간 외(야간·주말·방학)에는 연구용 학습 큐로 전환할 수 있고, 캡스톤·대학원·
    산학과제에 공동 활용합니다.

---

## 최종 권고안

초기 구축은 다음 구성을 권장합니다.

- **기존 교내 GPU 서버(RTX PRO 6000 Blackwell 96GB급) 우선 활용** — MIG 분할 운영, 신규 GPU 서버는 사용률 실증 후 증설 선택항목. **보유 대수·모델명은 자산대장 확인 후 확정**
- NVIDIA DGX Spark 공용 예약 노드 (대수는 사용률 기반 증설, 미확정)
- 10/25GbE Core Network + VLAN 분리
- 40~80TB급 NAS + **별도 백업 스토리지** (스냅샷과 분리)
- 30명용 JupyterHub·Kubernetes(Namespace/Quota/PriorityClass) 접속 플랫폼 — 학생에게 Docker 권한 미부여
- AWS GPU 버스트 환경 (서버 유지보수 기간 비상 실습환경 겸용)
- ROS 2 기반 실물 로봇 연계망

초기 투자 우선순위는 신규 GPU 서버보다 **네트워크, NAS·백업, 사용자 접속 플랫폼, GPU
자원관리, DGX Spark**에 둡니다.

HSU-PAC는 단순한 GPU 장비 구매가 아니라 **학생 노트북–교내 GPU–대형 모델 노드–스토리지–클라우드–실물 로봇을 연결하는 Physical AI 교육·연구 운영체계**로 구축해야 합니다.

---

## 참고자료

- [NVIDIA RTX PRO 6000 Blackwell](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/)
- [NVIDIA DGX Spark Hardware Overview](https://docs.nvidia.com/dgx/dgx-spark/hardware.html)
- [NVIDIA Isaac Sim Requirements](https://docs.isaacsim.omniverse.nvidia.com/latest/installation/requirements.html)
- [NVIDIA vGPU User Guide](https://docs.nvidia.com/vgpu/latest/grid-vgpu-user-guide/)
- [AWS EC2 G6e Instances](https://aws.amazon.com/ec2/instance-types/g6e/)

---

`RTX PRO 6000 Blackwell` · `DGX Spark` · `Isaac Sim` · `Isaac Lab` · `LeRobot` · `GR00T` · `MIG` · `JupyterHub` · `ROS 2` · `10GbE` · `AWS Hybrid`

[:octicons-arrow-left-24: 프로젝트 목록으로](https://parclab-hsu.github.io/projects/)
