# 1주차 — NVIDIA Isaac Sim 설치 및 활용 사례

!!! abstract "학습목표"
    Physical AI 개발의 출발점인 **NVIDIA Isaac Sim**을 왜 사용하는지(현실적인 시뮬레이션·비용/시간 절감·광범위한 호환성)를 이해한다. Ubuntu 22.04 + Miniconda(Conda) 가상환경 위에서 **CUDA·NVIDIA 드라이버·PyTorch·Isaac Sim·Isaac Lab**까지 이어지는 개발 환경 구축 절차를 익히고, Isaac Sim이 실제 로봇 연구·산업에서 어떻게 활용되는지 대표 사례를 통해 살펴본다.

!!! quote "출처 (Source)"
    본 자료의 그림·예제는 교안 **「NVIDIA Isaac Sim 설치 및 활용 사례」**(제작: *ENGI UNIVERSE*)를 바탕으로 재구성하였습니다. 명령어·표는 교안의 설명을 충실히 따른 재구성 예제입니다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro — Isaac Sim을 왜 공부하는가 / 권장 개발 환경 | 01 Intro · 02 개발 환경 구축(사양) |
| 2교시 | 50분 | 개발 환경 구축 — Miniconda·CUDA·PyTorch·Isaac Sim·Isaac Lab 설치 | 02·03 개발 환경 구축 |
| 3교시 | 50분 | Isaac Sim 실제 활용 사례 & Wrap-up | 03 활용 사례 · 04 Wrap-up |

---

## 🧭 01 Intro — Isaac Sim을 왜 공부해야 하는가?

로봇 알고리즘을 실제 하드웨어에서 바로 시험하면 비용·시간·안전 문제가 큽니다. Isaac Sim은 이를 **가상 환경**에서 먼저 검증하게 해 줍니다.

- **현실적인 시뮬레이션** — 고품질 물리·렌더링으로 현실에 가까운 환경을 재현
- **비용 및 시간 절감** — 실제 로봇·실험 공간 없이 반복 검증이 가능
- **다양한 기능과 통합 도구, 광범위한 호환성** — 여러 도구·프레임워크(ROS/ROS2 등)와 폭넓게 연동

![Isaac Sim을 공부하는 이유 — 현실적 시뮬레이션·비용 절감·호환성](img/w01/s03.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 03 (출처: ENGI UNIVERSE)
///

---

## 🖥️ 02 개발 환경 구축 — 권장 사양

교안에서 제시하는 **권장 개발 환경**입니다. Isaac Sim은 RTX 기반 GPU를 전제로 동작하므로 그래픽카드 사양이 특히 중요합니다.

| 구성 요소 | 권장 사양 |
| --- | --- |
| 운영체제 | Ubuntu 22.04 LTS |
| CPU | Intel i9-14900K |
| 메모리 | 64 GB RAM |
| 그래픽카드 | RTX 4090 |

![권장 개발 환경 사양 — Ubuntu 22.04 / i9 / 64GB / RTX 4090](img/w01/s05.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 05 (출처: ENGI UNIVERSE)
///

### 왜 Miniconda / Conda 인가?

- **Miniconda** — Anaconda의 경량화 버전. Python과 필수 패키지 관리자(`conda`)를 포함. Anaconda도 사용 가능하지만, **경량화·독립성 확보**를 위해 Miniconda 사용을 권장.
- **Conda** — 프로젝트별 Python 버전·패키지 구성을 **완전히 독립적으로** 관리.
    - 예) 한 머신에서 Python 3.8 기반 프로젝트와 Python 3.10 기반 프로젝트를 **동시에** 개발·운영
    - `environment.yml` 파일로 환경을 간단히 정의하고, **동일한 환경을 복제**
    - 패키지 간 **의존성을 자동 분석**해 충돌을 방지 → 디버깅 비용 절감

```bash
# environment.yml 로 동일한 환경을 복제
conda env create -f environment.yml
```

!!! tip "가상환경의 핵심 가치"
    하나의 Python 버전만 쓰면 프로젝트끼리 **패키지 충돌·버전 호환성 문제**가 발생합니다. Conda 가상환경은 프로젝트마다 별도의 Python 실행 환경을 분리해 이러한 문제를 근본적으로 막아 줍니다.

---

## 🧱 02 개발 환경 구축 — Miniconda 설치

**Step 1 — 설치 디렉토리 생성**

```bash
mkdir -p ~/miniconda3
```

- 사용자 홈 디렉토리에 `miniconda3` 디렉토리를 생성
- `-p` : 상위 디렉토리가 없으면 자동으로 생성

**Step 2 — 설치 스크립트 다운로드**

```bash
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
```

- `-O` : 다운로드된 파일을 저장할 경로·파일명을 명시

**Step 3 — 설치 실행**

```bash
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
```

- `-b` : 비대화 모드 설치(사용자 입력 없이 기본값으로 진행)
- `-u` : 기존 설치 경로에 덮어쓰기 허용
- `-p` : 설치 경로(`~/miniconda3`) 지정

**Step 4 — 설치 스크립트 삭제** 후, Conda 환경을 초기화하고 가상 환경을 생성합니다.

![Miniconda 설치 절차 — mkdir / wget / bash 설치](img/w01/s09.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 09 (출처: ENGI UNIVERSE)
///

---

## 🎮 03 개발 환경 구축 — CUDA & NVIDIA Driver

### 여기서 잠깐! — 내 GPU에 맞는 CUDA·드라이버 고르기

GPU 모델마다 지원하는 CUDA 버전과 권장 드라이버가 다릅니다. 설치 전 반드시 호환성을 확인합니다.

**Step 1 —** `nvidia-smi` 로 GPU 모델 확인

```bash
nvidia-smi
```

**Step 2 —** NVIDIA 공식 페이지(*Why CUDA Compatibility*)에서 모델 지원 범위 확인
**Step 3 —** 드라이버 ↔ CUDA 버전 호환성 매트릭스 확인 (GPU가 CUDA X.Y를 지원하는지, 현재 드라이버가 CUDA X.Y와 호환되는지)

#### 상황별 설치 전략 요약

| 상황 | 조치 |
| --- | --- |
| 최신 GPU (RTX 30/40 시리즈) | CUDA 12.x 이상 설치 가능. 최신 드라이버 유지 권장 |
| 구형 GPU (GTX 10/16 시리즈) | CUDA 11.x 또는 10.x 사용. 최신 CUDA는 비호환 가능성 |
| 리눅스 실시간(RT) 커널 사용 | `nvidia-open` 드라이버 권장. CUDA 일부 기능 제한 가능 |
| Docker·원격 환경 사용 | NVIDIA Container Toolkit 또는 headless CUDA 설치 권장 |

#### GPU 모델별 예시 조합

| GPU 모델 | 최대 지원 CUDA | 권장 드라이버 | 설치 예시 |
| --- | --- | --- | --- |
| RTX 4090 | 12.5+ | 560.x 이상 | CUDA 12.8 + 드라이버 570 |
| RTX 3080 Ti | 12.1~12.5 | 535.x 이상 | CUDA 12.2 + 드라이버 550 |
| GTX 1080 Ti | 12.1 | 515.x 이상 | CUDA 11.8 + 드라이버 525 |
| Jetson Xavier NX | CUDA 11.4 | JetPack 제공 버전 | JetPack SDK 사용 |
| Quadro P2000 | CUDA 11.x | 470.x 이상 | CUDA 11.4 + 드라이버 470 |

![다양한 NVIDIA GPU 사용자를 위한 CUDA & 드라이버 가이드](img/w01/s13.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 13 (출처: ENGI UNIVERSE)
///

### CUDA 12 설치 흐름

1. **CUDA 저장소 등록** — CUDA 설치 패키지 다운로드 및 저장소 등록
2. **CUDA Toolkit 패키지 다운로드** — 수동으로 로컬 저장소의 **GPG 키** 등록
3. **CUDA Toolkit 설치** (방법 1 / 방법 2) → 설치 완료 후 **재부팅** → 설치 확인

!!! note "GPG 키란?"
    리눅스에서 소프트웨어 **출처의 신뢰성과 무결성**을 검증하는 공개키 기반 암호화 키입니다.
    - 구성: **공개키 + 개인키**
    - 동작: 공급자가 개인키로 패키지에 디지털 서명 → 사용자가 공개키를 시스템에 등록 → `apt` 패키지 관리자가 공개키로 서명을 검증

![CUDA 12 & NVIDIA Driver 설치 — 저장소 등록·GPG 키](img/w01/s16.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 16 (출처: ENGI UNIVERSE)
///

### nvidia-open vs nvidia-driver-XXX

GPU 드라이버 설치가 확인되지 않으면 드라이버를 선택해 설치합니다. 두 방식의 차이는 다음과 같습니다.

| 구분 | nvidia-open | nvidia-driver-XXX |
| --- | --- | --- |
| 형식 | 오픈소스 (Linux 전용) | 폐쇄형 |
| 커널 통합성 | 리눅스 커널과 통합성 우수 | 커널 업데이트 시 충돌 가능성 |
| AI 가속기 지원 | 일부 기능 제한 가능성 | CUDA·TensorRT 등 완전 지원 |
| 커널 호환성 | 실시간 커널(RT)에서 유리 | 제한적 |
| 업데이트 주기 | 커뮤니티 기반 | NVIDIA 직접 관리 |

---

## 🔥 02 개발 환경 구축 — PyTorch 설치

PyTorch는 GPU(CUDA) 버전에 맞춰 설치하며, 설치 중 의존성 오류가 발생할 수 있으므로 단계적으로 해결합니다.

- 설치 중 발생 가능한 **의존성 오류(오류 1~3)** 와 해결 방법을 순서대로 적용
- 설치 확인은 **Python 인터프리터**에서 직접 import 하여 예상 출력 확인

??? tip "함께 쓰이는 보조 패키지 (코드 품질·통신·런타임)"
    | 패키지 | 역할 |
    | --- | --- |
    | **Black** | Python 코드 자동 정렬·스타일 포맷팅 (들여쓰기·괄호·공백 통일) |
    | **unidiff** | 소스 변경(diff) 파싱·조작. `ament-black` 등 코드 품질 도구에서 사용 |
    | **uvloop** | 고성능 asyncio 이벤트 루프. Isaac Sim·ROS2 비동기 통신에 사용 |
    | **requests** | HTTP 클라이언트. 모델 다운로드·업데이트 확인 등에 사용 |
    | **wrapt** | 데코레이터 작성·런타임 제어. 디버깅·검증, TensorFlow 내부 활용 |

![PyTorch 설치 및 의존성 오류 해결](img/w01/s20.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 20 (출처: ENGI UNIVERSE)
///

---

## 🤖 02 개발 환경 구축 — Isaac Sim 설치

설치 명령에는 다음 옵션이 사용됩니다(교안 설명 기준).

| 옵션 | 의미 |
| --- | --- |
| `all` | 확장 모듈을 포함하여 설치 |
| `extscache` | 로컬 확장 캐시를 활용한 실행 최적화를 포함 |
| `--extra-index-url` | NVIDIA 공식 패키지 저장소를 추가해 종속성 문제 없이 설치를 유도 |

**설치 확인 및 초기 실행**

- 설치 확인 후 실행
- **최초 실행 시 라이선스 동의 확인 메시지**가 표시됨 → 동의해야 정상 실행

![Isaac Sim 설치 — 설치 명령 옵션·최초 실행 라이선스 동의](img/w01/s24.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 24 (출처: ENGI UNIVERSE)
///

---

## 🧪 02 개발 환경 구축 — Isaac Lab 설치

### Isaac Sim vs Isaac Lab

| 항목 | Isaac Sim | Isaac Lab |
| --- | --- | --- |
| 목적 | 로봇 시뮬레이션 및 테스트 | 대규모 로봇 학습 |
| 물리엔진 | NVIDIA PhysX | 대규모 학습용 NVIDIA PhysX |
| 강화학습 지원 | 일부 지원 (RL 환경 연결 가능) | 대규모 병렬 RL 학습 최적화 |
| GPU 가속 | CUDA + Omniverse RTX 기반 | CUDA 가속 최적화 (GPU 병렬 학습) |
| 디지털 트윈 (실시간 동기화) | 가능 | 없음 |
| 대규모 병렬학습 | 제한적 | 가능 (최대 수천 개 시뮬레이션 동시 실행) |
| ROS / ROS2 연동 | 공식 통합 지원 | 미지원 (테스트·학습 분리 운영) |

### 설치 절차

**Step 1 —** Isaac Lab 소스 코드를 로컬로 **클론**
**Step 2 —** 필수 시스템 패키지 설치 (1·2)
**Step 3 —** 설치 중 발생할 수 있는 **오류**를 해결방안에 따라 처리
**Step 4 —** 설치 확인 후 **실행 결과** 확인

!!! success "환경 구축 체크"
    Ubuntu 22.04 → Miniconda(Conda) → CUDA/드라이버 → PyTorch → Isaac Sim → Isaac Lab 순으로 설치가 끝나면, 시뮬레이션(Isaac Sim)과 대규모 학습(Isaac Lab) 양쪽을 모두 다룰 수 있는 개발 환경이 완성됩니다.

![Isaac Lab 설치 및 Isaac Sim과의 비교](img/w01/s28.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 28 (출처: ENGI UNIVERSE)
///

---

## 🌍 03 NVIDIA Isaac Sim의 실제 활용 사례

교안에서 소개하는 대표 활용 사례입니다.

=== "Sim-to-Real (Fourier 휴머노이드)"

    **Spotlight: Fourier Trains Humanoid Robots for Real-World Roles Using NVIDIA Isaac Lab**

    - 실제·체험하기 어려운 환경에서도 **시뮬레이션을 통한 효율적인 개발** 수행
    - 강화 학습을 통한 **동작 훈련** 후, 학습 결과를 실제 로봇으로 이전(**Sim-to-Real Gap** 축소)

=== "Nav2 + Isaac ROS (Spot 4족 보행)"

    **Integrating the Nav2 Stack with NVIDIA / Spot Quadruped Locomotion with Isaac ROS GEMs**

    - 물리 환경 설정 + 고품질 물리 시뮬레이션
    - **이미지 처리 및 포인트 클라우드 생성**, **시차(disparity) 필터링을 통한 정확도 향상**
    - 시뮬레이션 결과를 **실제 로봇으로 바로 탑재** 가능

=== "대규모 병렬 학습 (Isaac Gym)"

    **NVIDIA Isaac Gym — GPU 기반 병렬 처리**

    - GPU 기반 병렬 처리로 **대규모 물리 시뮬레이션** 수행
    - **효율적인 대규모 학습** + 성능 최적화로 개발 시간·비용을 크게 절감

![Isaac Sim 실제 활용 사례 — Sim-to-Real, Nav2, Isaac Gym](img/w01/s30.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 30 (출처: ENGI UNIVERSE)
///

---

## 🧩 04 Wrap-up

오늘 강의 내용을 요약합니다.

1. **NVIDIA Isaac Sim 설치 과정** — Ubuntu 22.04 / Miniconda·Conda 가상환경 / CUDA·드라이버 / PyTorch / Isaac Sim / Isaac Lab
2. **NVIDIA Isaac Sim 활용 분야** — Sim-to-Real, Nav2 연동 자율주행, GPU 기반 대규모 병렬 학습

![Wrap-up — 설치 과정과 활용 분야 요약](img/w01/s32.jpg){ width="720" }
/// caption
NVIDIA Isaac Sim 설치 및 활용 사례 — 슬라이드 32 (출처: ENGI UNIVERSE)
///

## ✅ 체크포인트

- [ ] Isaac Sim을 사용하는 세 가지 이유(현실적 시뮬레이션·비용 절감·호환성)를 설명할 수 있는가
- [ ] 권장 개발 환경(Ubuntu 22.04 / RTX 4090 / 64GB)을 알고, Miniconda·Conda를 쓰는 이유를 설명할 수 있는가
- [ ] 내 GPU에 맞는 CUDA·드라이버 버전을 `nvidia-smi`와 호환성 매트릭스로 확인할 수 있는가
- [ ] Miniconda → CUDA → PyTorch → Isaac Sim → Isaac Lab 설치 순서를 따라 환경을 구축할 수 있는가
- [ ] Isaac Sim과 Isaac Lab의 차이, 그리고 대표 활용 사례를 구분할 수 있는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| Isaac Sim 학습 동기 이해 | 20 | 현실적 시뮬레이션·비용 절감·호환성을 근거로 설명 |
| 개발 환경/사양 이해 | 20 | 권장 사양과 Miniconda·Conda 가상환경의 필요성 설명 |
| 설치 절차 수행 | 30 | Miniconda·CUDA·PyTorch·Isaac Sim·Isaac Lab 설치 절차 재현 |
| Isaac Sim vs Isaac Lab 비교 | 15 | 목적·물리엔진·RL·ROS 연동 차이를 표로 정리 |
| 활용 사례 분석 | 15 | Sim-to-Real·Nav2·Isaac Gym 사례의 핵심 가치 설명 |

## 🔗 출처 및 참고자료

- 교안 **「NVIDIA Isaac Sim 설치 및 활용 사례」** (제작: ENGI UNIVERSE) — 강의 슬라이드 원본
- NVIDIA Isaac Sim 공식 문서 — <https://docs.isaac-sim.nvidia.com>
- NVIDIA Isaac Lab 공식 문서 — <https://isaac-sim.github.io/IsaacLab>
- Miniconda 설치 가이드 — <https://docs.anaconda.com/miniconda/>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [시스템 요구사항](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/requirements.html)
    - [빠른 설치](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/quick-install.html)
    - [워크스테이션 설치](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/install_workstation.html)
    - [워크플로우(Workflows)](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/introduction/workflows.html)

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (32매)"
    ![슬라이드 01](img/w01/s01.jpg){ width="700" }
    ![슬라이드 02](img/w01/s02.jpg){ width="700" }
    ![슬라이드 03](img/w01/s03.jpg){ width="700" }
    ![슬라이드 04](img/w01/s04.jpg){ width="700" }
    ![슬라이드 05](img/w01/s05.jpg){ width="700" }
    ![슬라이드 06](img/w01/s06.jpg){ width="700" }
    ![슬라이드 07](img/w01/s07.jpg){ width="700" }
    ![슬라이드 08](img/w01/s08.jpg){ width="700" }
    ![슬라이드 09](img/w01/s09.jpg){ width="700" }
    ![슬라이드 10](img/w01/s10.jpg){ width="700" }
    ![슬라이드 11](img/w01/s11.jpg){ width="700" }
    ![슬라이드 12](img/w01/s12.jpg){ width="700" }
    ![슬라이드 13](img/w01/s13.jpg){ width="700" }
    ![슬라이드 14](img/w01/s14.jpg){ width="700" }
    ![슬라이드 15](img/w01/s15.jpg){ width="700" }
    ![슬라이드 16](img/w01/s16.jpg){ width="700" }
    ![슬라이드 17](img/w01/s17.jpg){ width="700" }
    ![슬라이드 18](img/w01/s18.jpg){ width="700" }
    ![슬라이드 19](img/w01/s19.jpg){ width="700" }
    ![슬라이드 20](img/w01/s20.jpg){ width="700" }
    ![슬라이드 21](img/w01/s21.jpg){ width="700" }
    ![슬라이드 22](img/w01/s22.jpg){ width="700" }
    ![슬라이드 23](img/w01/s23.jpg){ width="700" }
    ![슬라이드 24](img/w01/s24.jpg){ width="700" }
    ![슬라이드 25](img/w01/s25.jpg){ width="700" }
    ![슬라이드 26](img/w01/s26.jpg){ width="700" }
    ![슬라이드 27](img/w01/s27.jpg){ width="700" }
    ![슬라이드 28](img/w01/s28.jpg){ width="700" }
    ![슬라이드 29](img/w01/s29.jpg){ width="700" }
    ![슬라이드 30](img/w01/s30.jpg){ width="700" }
    ![슬라이드 31](img/w01/s31.jpg){ width="700" }
    ![슬라이드 32](img/w01/s32.jpg){ width="700" }
