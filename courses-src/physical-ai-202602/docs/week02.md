# 2주차 — Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션

!!! abstract "학습목표"
    NVIDIA Isaac Sim에서 **가상 물리 환경(Stage·World·Prim)** 을 구성하고 기본 지형과 동적 오브젝트를 배치하는 방법을 익힌다. 또한 **RGB / Depth 카메라 센서**를 시뮬레이션에 추가·설정하고, 센서 데이터를 실시간으로 수집·시각화하여 실제 로봇 센서와 유사한 가상 환경을 구현하는 능력을 기른다.

!!! note "강의 흐름 (FLOW)"
    `가상 환경` → `센서 모델` → `프레임 획득` → `시각화` → `ROS 연동`

## 💽 시작 전에 — 학과 노트북 리눅스 재설치 (USB)

!!! info "누가 읽어야 하나"
    학과 노트북에는 **Windows와 리눅스가 이미 듀얼부팅**으로 설치되어 있습니다. 아래에 해당하면 **본 주차 내용에 들어가기 전에** 이 절차부터 진행하십시오.

    - 기존 리눅스 버전이 Ubuntu 22.04가 아니다
    - 패키지·드라이버가 꼬여 Isaac Sim 설치가 반복 실패한다
    - 이전 사용자의 환경이 남아 있어 처음부터 다시 잡고 싶다

    해당 사항이 없으면 이 절은 건너뛰고 [⏱️ 3시간 구성](#3) 부터 보면 됩니다.
학과 노트북에는 **Windows와 리눅스가 이미 듀얼부팅으로 설치**되어 있습니다. 기존 리눅스가 버전이 맞지 않거나 환경이 꼬였을 때, 리눅스만 지우고 Ubuntu 22.04를 새로 설치하는 절차입니다.

!!! danger "시작 전에 반드시 읽으십시오"
    이 작업은 **디스크 파티션을 직접 건드립니다.** 순서를 잘못 밟으면 리눅스뿐 아니라 **Windows까지 부팅되지 않거나 전체 데이터가 사라질 수 있습니다.**

    - **기존 리눅스의 내 파일은 전부 삭제됩니다.** 필요한 자료는 먼저 USB나 클라우드로 옮기세요.
    - **Windows 쪽 자료도 백업**하세요. 파티션 작업 중 사고가 나면 함께 영향을 받습니다.
    - 혼자 진행하다 확신이 서지 않으면 **멈추고 조교·교수에게 문의**하십시오. 되돌리기 어려운 작업입니다.

### STEP 0 — 사전 점검 (Windows에서)

설치 실패의 대부분이 이 단계를 건너뛰어 생깁니다.

**① BitLocker 상태 확인 — 가장 중요**

Windows 드라이브가 BitLocker로 암호화되어 있으면, 파티션 구성이 바뀔 때 **다음 부팅에서 48자리 복구 키를 요구**합니다. 키가 없으면 Windows에 들어갈 수 없습니다.

```powershell
# Windows PowerShell (관리자 권한)
manage-bde -status
```

| 결과 | 조치 |
| --- | --- |
| `Protection Status: Protection Off` | 그대로 진행 가능 |
| `Protection Status: Protection On` | **복구 키를 먼저 확보**하거나 일시 중단(`manage-bde -protectors -disable C:`) |

복구 키는 [account.microsoft.com/devices/recoverykey](https://account.microsoft.com/devices/recoverykey) 에서 확인할 수 있습니다.

**② 빠른 시작(Fast Startup) 끄기**

켜져 있으면 Windows가 완전히 종료되지 않아, 리눅스에서 Windows 파티션을 읽을 때 문제가 생깁니다.

```
제어판 → 전원 옵션 → 전원 단추 작동 설정 → 현재 사용할 수 없는 설정 변경
→ "빠른 시작 켜기" 체크 해제
```

**③ 현재 디스크 구성 확인**

`Windows + R` → `diskmgmt.msc` 로 디스크 관리를 열어 **파티션 구성을 캡처해 두세요.** 어떤 파티션이 리눅스인지 눈으로 확인해야 합니다.

| 파티션 유형 | 크기 | 정체 | 처리 |
| --- | --- | --- | --- |
| **EFI 시스템 파티션** | 100~500MB, FAT32 | Windows·리눅스가 **함께 쓰는 부팅 영역** | 🚫 **절대 삭제 금지** |
| **복구 파티션** | 500MB~1GB | 제조사·Windows 복구용 | 🚫 건드리지 않음 |
| **주 NTFS 파티션** | 수백 GB | **Windows 본체** | 🚫 건드리지 않음 |
| **ext4 파티션** | — | 기존 리눅스 루트 | ✅ 삭제 대상 |
| **linux-swap** | 2~16GB | 기존 리눅스 스왑 | ✅ 삭제 대상 |

!!! warning "EFI 파티션을 지우면 Windows도 부팅되지 않습니다"
    UEFI 듀얼부팅에서 EFI 시스템 파티션은 **두 운영체제가 공유**합니다. "작아서 필요 없어 보이는" 파티션이 대개 이것입니다. 크기가 100~500MB이고 FAT32라면 손대지 마십시오.

### STEP 1 — 설치 USB 만들기

- **8GB 이상 빈 USB** (USB 안의 기존 자료는 모두 지워집니다)
- Ubuntu 22.04 LTS(Jammy Jellyfish) ISO — [ubuntu.com/download/desktop](https://ubuntu.com/download/desktop) → `check alternative downloads` → `Past releases and other flavours`
- 굽기 도구: **Rufus**(Windows) 또는 **balenaEtcher**(공용)

Rufus 설정값:

| 항목 | 값 |
| --- | --- |
| 부팅 유형 | 다운로드한 Ubuntu ISO |
| 파티션 방식 | **GPT** |
| 대상 시스템 | **UEFI (CSM 없음)** |
| 파일 시스템 | FAT32 |
| 쓰기 모드 | **ISO 이미지 모드 (권장)** |

작업에는 7~8분 정도 걸리며, 완료 시 "준비 완료" 상태가 됩니다.

### STEP 2 — USB로 부팅

1. USB를 꽂고 노트북을 재시작합니다.
2. 검은 화면이 나오는 즉시 **Boot Menu 키**를 연타합니다.

| 제조사 | Boot Menu 키 |
| --- | --- |
| 삼성·LG | `F10` 또는 `F12` |
| 레노버 | `F12` (또는 옆면 Novo 버튼) |
| HP | `F9` |
| Dell | `F12` |
| ASUS·MSI | `F8` / `F11` |

부팅 시 화면 하단에 안내 키가 잠깐 표시되므로 확인 후 누르면 됩니다.

3. 목록에서 **`UEFI: <USB 이름>`** 항목을 선택합니다. `UEFI:` 가 붙은 항목을 골라야 합니다.
4. `Try or Install Ubuntu` 선택 → 언어에서 **한국어** 선택 → `Ubuntu 설치`

!!! tip "화면이 깨지거나 설치 화면이 안 뜨는 경우"
    NVIDIA 그래픽과의 호환 문제입니다. 부팅 메뉴에서 `e` 키를 눌러 편집 모드로 들어간 뒤, `quiet splash` 뒤에 **`nomodeset`** 을 추가하고 `F10` 으로 진행하십시오. 커널이 그래픽 드라이버를 먼저 로드하지 않게 하는 설정입니다.

### STEP 3 — 기존 리눅스 파티션만 삭제하고 설치

설치 유형 화면에서 **반드시 `기타(Something else)`** 를 선택합니다.

!!! danger "'디스크를 지우고 Ubuntu 설치'를 절대 고르지 마십시오"
    이 항목은 **Windows를 포함해 디스크 전체를 지웁니다.** 듀얼부팅을 유지하려면 반드시 `기타`로 들어가 수동으로 파티션을 지정해야 합니다.

**① 기존 리눅스 파티션 삭제**

파티션 목록에서 STEP 0에서 확인한 **ext4 파티션과 linux-swap 파티션만** 선택해 `-` 버튼으로 삭제합니다. 삭제 후 그 공간이 **`남은 공간(free space)`** 으로 바뀝니다.

**② 새 파티션 할당**

`남은 공간`을 선택하고 `+` 버튼으로 아래와 같이 만듭니다.

| 용도 | 크기 | 종류 | 마운트 지점 |
| --- | --- | --- | --- |
| 루트 | 나머지 전부 (**최소 150GB 권장**) | ext4 | `/` |
| 스왑 | RAM과 같은 크기 (8~16GB) | swap 영역 | — |

!!! note "왜 150GB 이상인가"
    Isaac Sim 이미지·캐시만으로 50GB 이상을 쓰고, Isaac Lab·학습 데이터·YOLO 모델이 추가됩니다. 100GB 미만이면 학기 중반에 공간이 부족해집니다.

**③ 부트로더 설치 위치 — 가장 실수가 잦은 항목**

화면 하단 **`부트로더를 설치할 장치`** 는 파티션이 아니라 **디스크 전체**(`/dev/nvme0n1` 또는 `/dev/sda`)를 지정합니다. `/dev/nvme0n1p3` 처럼 **끝에 숫자가 붙은 파티션을 고르면 부팅이 되지 않습니다.**

**④ 설치 진행** → 지역·계정 설정 → 완료 후 `지금 다시 시작` → **USB를 뽑고** Enter

### STEP 4 — 설치 후 확인

재부팅하면 **GRUB 메뉴**가 뜨고 `Ubuntu` 와 `Windows Boot Manager` 가 함께 보여야 정상입니다.

```bash
# 부팅 후 터미널에서 확인
lsb_release -a          # Ubuntu 22.04 LTS 인지
df -h /                 # 루트 파티션 용량
free -h                 # 스왑이 잡혔는지
nvidia-smi              # GPU 인식 (드라이버 설치 전이면 미인식이 정상)
```

### 🧰 자주 생기는 문제

??? failure "GRUB에 Windows가 안 보인다"
    리눅스에서 아래를 실행해 Windows를 다시 탐지시킵니다.

    ```bash
    sudo apt update && sudo apt install os-prober
    sudo os-prober                 # Windows 가 검출되는지 확인
    sudo update-grub
    ```

    그래도 안 보이면 BIOS에서 **Secure Boot**를 끄고 다시 시도합니다.

??? failure "재부팅하니 GRUB 없이 바로 Windows로 부팅된다"
    BIOS의 부팅 순서에서 `ubuntu` 항목이 뒤에 있는 경우입니다. BIOS(보통 `F2`·`Del`) → Boot 탭에서 **`ubuntu` 를 1순위로** 올립니다.

??? failure "Windows가 BitLocker 복구 키를 요구한다"
    STEP 0의 BitLocker 확인을 건너뛴 경우입니다. [account.microsoft.com/devices/recoverykey](https://account.microsoft.com/devices/recoverykey) 에 로그인해 해당 기기의 48자리 키를 확인해 입력하십시오. **키 없이는 복구할 수 없습니다.**

??? failure "설치 중 '이 컴퓨터에 다른 운영체제가 없는 것 같습니다' 라고 나온다"
    Windows가 **빠른 시작** 상태로 종료되어 인식되지 않는 경우입니다. Windows로 돌아가 빠른 시작을 끄고 **완전 종료(Shift + 시스템 종료)** 후 다시 시도하십시오.

??? failure "USB로 부팅이 되지 않는다"
    - Boot Menu에서 `UEFI:` 가 붙은 항목을 선택했는지 확인합니다.
    - BIOS에서 **Secure Boot 비활성화**, **부팅 모드 UEFI** 를 확인합니다.
    - Rufus에서 파티션 방식을 `GPT` / `UEFI(CSM 없음)` 로 구웠는지 확인합니다.

### ✅ 재설치 완료 체크리스트

- [ ] GRUB에서 Ubuntu와 Windows가 **모두** 선택 가능한가
- [ ] Windows가 BitLocker 키 요구 없이 정상 부팅되는가
- [ ] `df -h /` 결과 루트 파티션이 150GB 이상인가
- [ ] 인터넷·Wi-Fi가 연결되는가
- [ ] 이후 [1주차 페이지](week01.md)의 Miniconda → CUDA → PyTorch → Isaac Sim 순서로 진행

---

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 | 근거 교안 |
| --- | --- | --- | --- |
| 1교시 | 50분 | Intro & 사전 준비(Conda 환경, VS Code 연동·인터프리터 설정) | §01~02 |
| 2교시 | 50분 | 물리 환경 구성 기본 개념(Stage/World/Prim) & 지형·오브젝트 생성 | §03 |
| 3교시 | 50분 | 센서 시뮬레이션(RGB·Depth 카메라) & Wrap-up | §04~05 |

---

## 🤖 1. Intro — Isaac Sim을 활용한 로봇 센서 시뮬레이션

![Isaac Sim 로봇 센서 시뮬레이션 개요](img/w02/s03.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 03
///

- **목표**
    - Isaac Sim 기반 로봇 시뮬레이션의 **기본 환경 구성**
    - **RGB / Depth 카메라 센서** 시뮬레이션 적용 방법 이해
- **주요 학습 내용**
    - 가상의 물리 환경 생성 방법
    - 센서 구성 요소(RGB, Depth 등) 추가 및 설정
    - 센서 데이터를 실시간으로 수집·시각화하는 절차 학습
- **기대 효과**
    - 실제 로봇의 센서와 유사한 환경을 가상 공간에서 구현
    - 시뮬레이션 기반 센서 테스트 및 데이터 활용 능력 향상

---

## 🧰 2. 사전 준비

### Conda 가상환경 활성화

Isaac Sim 실행 전, **Conda 가상환경 활성화는 필수**입니다. 가상환경을 활성화하지 않으면 오류가 발생합니다.

![Conda 가상환경 활성화](img/w02/s06.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 06
///

| 상태 | 의미 |
| --- | --- |
| `(base)` | 기본환경이며 **Isaac Sim용 환경이 아님** |
| `(env_isaaclab)` | Isaac Sim 전용 환경이 활성화된 **정상 상태** |

```bash
# 기본(base) 상태라면 Isaac Sim용 가상환경으로 전환
conda activate env_isaaclab
```

!!! warning "환경 확인법"
    프롬프트가 `(base)` 로 보인다면 Isaac Sim용 환경이 아닙니다. 반드시 `(env_isaaclab)` 으로 되어 있어야 정상 상태입니다.

### Visual Studio Code 설치 및 Isaac Sim 연동

VS Code를 설치해 Isaac Sim과 연동하면 Python 코드를 효율적으로 작성·실행·디버깅할 수 있습니다.

![VS Code 설치 및 Isaac Sim 연동](img/w02/s09.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 09
///

**Step 1 —** 시스템 패키지 목록 갱신 및 설치 준비용 툴(wget, gpg) 설치

```bash
# 패키지 목록 갱신 및 최신 상태 업그레이드
sudo apt update && sudo apt upgrade

# 설치 준비용 툴(wget, gpg) 설치
sudo apt install wget gpg
```

**Step 2 —** Microsoft GPG 키 등록(VS Code 설치를 위한 신뢰 키 등록) 및 저장소 등록

**Step 3 —** 패키지 목록 재갱신 후 VS Code 설치 → VS Code 실행

### VS Code에 Python 인터프리터 설정

VS Code가 **Conda 가상환경의 Python**을 사용하도록 지정해야 Isaac Sim 관련 코드가 올바르게 실행됩니다.

![VS Code Python 인터프리터 설정](img/w02/s13.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 13
///

**Step 1 —** `Ctrl + Shift + X` 로 확장 프로그램(Extension) 창을 열고 **Microsoft 제공 Python 확장 프로그램** 설치

**Step 2 —** `env_isaaclab` 환경이 활성화된 상태에서 Python 경로 확인 후 출력된 경로 복사

**Step 3 —** `Ctrl + Shift + P` 로 명령 팔레트를 열고 **`Python: Select Interpreter`** 입력·선택 → 복사한 Python 경로 붙여넣기

!!! note "왜 인터프리터 설정이 필요한가"
    VS Code가 기본 시스템 Python을 가리키면 Isaac Sim 모듈을 찾지 못합니다. Conda 가상환경(`env_isaaclab`)의 Python을 명시적으로 지정해야 시뮬레이션 코드가 정상 실행됩니다.

---


## 🌍 3. 물리 환경 구성 기본 개념

### Stage · World · Prim

Isaac Sim의 장면은 **Stage → World → Prim** 의 계층으로 구성됩니다.

![Stage / World / Prim 기본 개념](img/w02/s16.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 16
///

| 구성 단위 | 정의 | 핵심 특징 |
| --- | --- | --- |
| **Stage** | 시뮬레이션 장면 전체(최상위 단위) | 로봇·지형·센서·조명 등 모든 요소 포함, `.usd` 파일로 저장해 전체 장면 로드·재사용 |
| **World** | 물리 엔진이 적용되는 공간 | Stage 내부의 물리 연산 영역, 중력·충돌·마찰·관절·운동 등 실시간 시뮬레이션(없으면 정적 장면만 표현) |
| **Prim** | 개별 오브젝트 단위 | 로봇·센서·장애물·조명 등 모든 객체, 계층적 트리 구조로 배치, 고유 경로로 식별·제어 |

!!! tip "Prim 경로 예시"
    `/World/Robot1/base_link` → World 내 Robot1의 구성요소인 `base_link`. 모든 객체는 이러한 **경로와 계층구조**로 식별·제어됩니다.

### 예시 시나리오 — 자율 주행 로봇 장애물 회피

![자율주행 로봇 장애물 회피 시나리오](img/w02/s18.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 18
///

- **Stage 구성**: 두 대의 로봇 `/World/Robot1`, `/World/Robot2` + 카메라·LiDAR 센서 장착, 비포장도로·경사면·나무·돌·경계석 등 장애물, 자연광 조명과 고정형 외부 카메라 포함 → `.usd` 파일로 전체 장면 관리
- **World**: 물리적 상호작용이 World 안에서 실시간으로 계산됨
- **Prim 구조**
    - `/World/Robot1/base_link` → 로봇 본체
    - `/World/Robot1/camera` → 카메라 센서
    - `/World/obstacle_1` → 장애물

### 기본 지형 생성

시뮬레이션 애플리케이션을 실행하고 `World` 를 초기화한 뒤 기본 지형을 생성합니다.

```python
# 1) 시뮬레이션 애플리케이션 실행 (가장 먼저 실행되어야 함)
from isaacsim import SimulationApp
# headless=False → GUI 모드(화면 렌더링 O) / True → 백그라운드, 학습 성능 최적화
simulation_app = SimulationApp({"headless": False})

# 2) 시뮬레이션 환경(World) 초기화 및 지형 생성
from omni.isaac.core import World
my_world = World(stage_units_in_meters=1.0)   # 1단위 = 1미터
my_world.scene.add_default_ground_plane()      # 기본 바닥면 추가
my_world.reset()                               # 환경 초기화 및 준비 완료

# 3) 시뮬레이션 루프 및 종료 처리
while simulation_app.is_running:                # 창이 열려 있는 동안 루프 지속
    my_world.step(render=True)                  # 한 프레임 실행 + 렌더링
simulation_app.close()                          # 시뮬레이션 정상 종료
```

!!! note "코드 분석"
    - **`SimulationApp`** : Isaac Sim의 핵심 런타임 객체. `headless` 옵션으로 GUI/백그라운드 모드 결정
    - **`World`** : 물리 엔진(**PhysX**)이 적용되는 공간 정의, `stage_units_in_meters=1.0` → 1단위=1m
    - **`add_default_ground_plane()`** : 기본 바닥면 추가 / **`reset()`** : 환경 초기화
    - **`step(render=True)`** : 한 프레임 실행 + 렌더링 / **`close()`** : 정상 종료

### 오브젝트 생성

중력·충돌·마찰 등 물리 특성이 적용되는 **동적 큐브(DynamicCuboid)** 를 추가합니다.

![오브젝트(동적 큐브) 생성](img/w02/s20.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 20
///

```python
# 필요한 모듈 임포트
import numpy as np
from omni.isaac.core.objects import DynamicCuboid          # 물리 특성 적용 객체
import omni.isaac.core.utils.numpy.rotations as rot_utils  # 오일러 각 → 쿼터니언

# 물체 추가
my_world.scene.add(
    DynamicCuboid(
        prim_path="/World/cube",                  # /World 아래 cube Prim 경로 생성
        name="cube",                              # 제어·조회·삭제 등에 사용
        position=np.array([0.0, 0.0, 1.0]),       # 지면 위 1m 높이에 배치
        orientation=np.array([1.0, 0.0, 0.0, 0.0]),   # 회전 없음(0도)
        scale=np.array([0.5, 0.5, 0.5]),          # 기본 크기의 절반(0.5배)
        size=1.0,                                 # 기준 크기 1.0m (최종 크기 = 0.5m)
        color=np.array([255, 0, 0]),              # 빨간색 큐브
    )
)
```

| 파라미터 | 의미 |
| --- | --- |
| `prim_path` | `/World` 아래 `cube` Prim 경로 생성 |
| `name` | 객체 제어·조회·삭제 작업에 사용 |
| `position` | 지면 위 1m 높이 `[0.0, 0.0, 1.0]` 배치 |
| `orientation` | 회전 없음(0도) |
| `scale` / `size` | 기본 크기의 절반(0.5배) / 기준 크기 1.0m → 최종 0.5m |
| `color` | `[255, 0, 0]` → 빨간색 |

!!! success "시뮬레이션 결과"
    - **초기 상태**: 빨간색 큐브가 공중(높이 1m, `[0.0, 0.0, 1.0]`)에 배치
    - **동작 과정**: 중력에 의해 낙하 → 기본 지면(Ground Plane)에 충돌하여 멈춤 → 물리 엔진(**PhysX**)이 실시간 상호작용 계산
    - **물리 반응**: 다른 물체와의 충돌, 힘(force) 작용에도 반응하는 **동적 물리 객체**(정적 시각 요소가 아님)

---

## 📷 4. 센서 시뮬레이션 (RGB·Depth 카메라)

카메라 센서는 로봇에게 **주변 환경 인식 및 상황 판단**을 위한 핵심 센서입니다.

![카메라 센서 개요 (RGB / Depth)](img/w02/s24.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 24
///

| 센서 | 생성 데이터 | 활용 |
| --- | --- | --- |
| **RGB 카메라** | 색상이 포함된 2D 이미지 | 객체 탐지, 추적, SLAM, 행동 인식 |
| **Depth 카메라** | 픽셀 단위 물체 거리(시각화 정보) | 상대적 거리, 3D 모델 재구성, 공간 내 충돌 감지 |

### RGB 카메라 센서 시뮬레이션

```python
import numpy as np
import matplotlib.pyplot as plt
from omni.isaac.sensor import Camera        # Camera 모듈 import
import omni.isaac.core.utils.numpy.rotations as rot_utils

# 카메라 객체 생성 및 설정
camera = Camera(
    prim_path="/World/camera",            # World 아래 camera Prim 생성 경로
    position=np.array([0.0, 0.0, 25.0]),  # 3D 좌표, 지면 위 25m 상공
    frequency=60,                         # 프레임 레이트(Hz), 초당 60프레임
    resolution=(256, 256),                # 출력 해상도, 256×256 정사각형
    orientation=rot_utils.euler_angles_to_quats(
        np.array([0, 90, 0]), degrees=True   # y축 기준 90도 회전(오일러→쿼터니언)
    ),
)

camera.initialize()                       # 카메라 센서 초기화

i = 0
while simulation_app.is_running:          # 시뮬레이션 루프 실행
    my_world.step(render=True)
    rgba_image = camera.get_rgba()        # 매 프레임 RGBA 이미지 획득(NumPy 배열)
    if i > 60:                            # 과도한 렌더링 방지 → 60프레임마다 출력
        plt.imshow(rgba_image[:, :, :3])  # RGB 채널만 추출(알파 제외)
        plt.axis("off")                   # 축 제거
        plt.show()
        i = 0
    i += 1
```

| 설정 항목 | 의미 |
| --- | --- |
| `prim_path` | 카메라가 생성될 경로(World 아래 camera Prim) |
| `position` | 카메라 3D 좌표, 지면 위 **25m 상공** |
| `frequency` | 카메라 프레임 레이트(Hz), 초당 **60프레임** 촬영 |
| `resolution` | 출력 이미지 해상도, **256 × 256** 정사각형 |
| `orientation` | 회전 방향(오일러 각 → 쿼터니언), **y축 기준 90도 회전** |

!!! note "이미지 획득 및 시각화"
    - `get_rgba()` → NumPy 배열 형태로 이미지 반환
    - `rgba_image[:, :, :3]` → RGB 채널만 추출(알파 채널 제외)
    - `i > 60` 조건으로 60프레임마다 한 번씩 출력 → 과도한 렌더링 방지
    - `plt.imshow()` 로 시각화, `plt.axis("off")` 로 축 제거

### Depth 카메라 센서 시뮬레이션

Depth 카메라는 RGB 구성에 **어노테이터(Annotator) 등록**과 **Depth Map 시각화**를 추가합니다.

![Depth 카메라 센서 시뮬레이션](img/w02/s27.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 27
///

```python
camera.initialize()
# Depth 정보 활성화: "distance_to_camera" 어노테이터 추가
camera.add_distance_to_camera_to_frame()   # 각 픽셀의 거리(Depth) 포함 프레임 생성

while simulation_app.is_running:
    my_world.step(render=True)
    # 현재 프레임에서 Depth Map 추출 → NumPy 배열(각 값 = 카메라-객체 거리)
    depth_image = camera.get_current_frame()["distance_to_camera"]
    # 거리별 색상 차등 표현: 파란색=가까움 / 빨간색=멀어짐
    plt.imshow(depth_image, cmap="jet")
    plt.axis("off")
    plt.show()
```

!!! tip "Depth 정보 활성화"
    카메라에 **`distance_to_camera` 어노테이터**를 추가하면 각 픽셀의 거리 정보(Depth)가 포함된 프레임을 생성할 수 있습니다. `cmap="jet"` 으로 거리 분포를 직관적으로 확인합니다.

=== "Depth 이미지 획득"

    - 현재 프레임에서 **Depth Map 추출**
    - NumPy 배열로 반환됨 → 각 값은 **카메라–객체 간 거리**

=== "Depth 이미지 시각화"

    - `cmap="jet"` 사용 → 거리별 색상 차등 표현
    - **파란색: 가까움 / 빨간색: 멀어짐**
    - 시각적으로 거리 분포를 직관적으로 확인 가능

!!! info "여기서 잠깐 — 어노테이션(Annotation)이란?"
    카메라가 촬영한 이미지에 대해 사람 또는 시스템이 **부가정보를 덧붙이는 행위**입니다.

    - **Depth 카메라**: 각 픽셀에 카메라로부터의 거리(깊이 값) 포함
    - **세그멘테이션 마스크**: 각 픽셀에 객체 레이블 부여(예: "이 픽셀은 의자", "저 픽셀은 책상")
    - **바운딩 박스(Bounding Box)**: 이미지 내 객체를 사각형으로 둘러싸고 클래스 레이블 표시(예: Chair, Table)
    - **활용 목적**: 객체 인식, 거리 분석, 로봇 시각 처리, 자율주행 학습 등

---

## 🧩 5. Wrap-up

![오늘 강의 내용 요약](img/w02/s29.jpg){ width="720" }
/// caption
Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션 — 슬라이드 29
///

오늘 강의 내용 요약:

- **VS Code ↔ Isaac Sim 연동**으로 Python 코드를 효율적으로 작성·실행·디버깅
- NVIDIA Isaac에서 **물리환경을 구축**하고 물건(동적 큐브)을 놓아보는 예제 수행
- **RGB / Depth 카메라**를 시뮬레이션 상에서 구현하고 사용

## ✅ 체크포인트

- [ ] `(env_isaaclab)` 가상환경을 활성화하고 VS Code 인터프리터를 올바르게 설정했는가
- [ ] Stage / World / Prim의 차이와 계층 구조(예: `/World/Robot1/base_link`)를 설명할 수 있는가
- [ ] `World` 초기화 + `add_default_ground_plane()` 로 기본 지형을 생성하고 `DynamicCuboid` 가 중력으로 낙하·충돌하는 것을 확인했는가
- [ ] RGB 카메라(`get_rgba()`)로 이미지를 획득해 RGB 채널만 시각화했는가
- [ ] `distance_to_camera` 어노테이터로 Depth Map을 추출해 `cmap="jet"` 로 거리 분포를 시각화했는가

## 📊 평가 루브릭

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| 환경 준비 | 20 | Conda 환경 활성화 + VS Code 연동·인터프리터 설정 완료 |
| 물리 개념 이해 | 20 | Stage/World/Prim 계층과 Prim 경로 설명의 정확성 |
| 지형·오브젝트 생성 | 25 | `World` 초기화·지형 생성, `DynamicCuboid` 배치·물리 동작 구현 |
| RGB 카메라 | 20 | 카메라 설정(해상도·위치·회전) 및 RGB 이미지 획득·시각화 |
| Depth 카메라 | 15 | `distance_to_camera` 어노테이터 등록 및 Depth Map 시각화 |

## 🔗 참고자료

- 교안 「Isaac Sim 물리환경 구축 및 카메라(RGB/Depth) 센서 시뮬레이션」
- NVIDIA Isaac Sim 공식 문서 — <https://docs.isaacsim.omniverse.nvidia.com/5.1.0/index.html>
- Isaac Sim Camera & Sensors — <https://docs.isaacsim.omniverse.nvidia.com/5.1.0/sensors/index.html>
- Visual Studio Code (Linux) — <https://code.visualstudio.com/docs/setup/linux>

## 📘 Isaac Sim 5.1.0 공식 문서

!!! note "공식 문서 (NVIDIA Isaac Sim 5.1.0)"
    본 주차의 Isaac Sim/ROS 2 API·절차는 아래 공식 문서로 보강·검증할 수 있습니다.

    - [OpenUSD 입문](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/omniverse_usd/intro_to_usd.html)
    - [Asset 구조](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/robot_setup/asset_structure.html)
    - [카메라 센서](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/sensors/isaacsim_sensors_camera.html)
    - [Depth 센서](https://docs.isaacsim.omniverse.nvidia.com/5.1.0/sensors/isaacsim_sensors_camera_depth.html)

!!! note "🔬 NVIDIA Isaac 워크샵 연계 (DLI)"
    Isaac Sim의 장면·자산은 **OpenUSD**(Pixar가 개발한 3D 장면 기술 표준) 형식으로 저장됩니다. 이번 주의 Stage/World/Prim 개념이 바로 USD의 계층 구조이며, 로봇 자산을 USD로 구성하면 **재사용·합성·공유**가 쉬워집니다.
    → 자세한 내용: [DLI · USD for Robotics](dli-usd.md)

## 📖 핵심 용어 설명

이번 주차 본문에 등장한 핵심 용어들을 초보자도 이해할 수 있도록 정리합니다.

### Isaac Sim
- **정의**: NVIDIA가 제공하는 로봇 시뮬레이션 플랫폼으로, 실제와 유사한 물리·렌더링 환경에서 로봇과 센서를 가상으로 실험할 수 있는 도구입니다.
- **역할/왜 중요한가**: 실제 로봇·센서를 사다 망가뜨릴 위험 없이, 가상 공간에서 환경 구성·센서 부착·데이터 수집을 반복 실험할 수 있게 해 줍니다. 본 강의의 모든 실습이 이 위에서 이루어집니다.
- **맥락·예시**: 본문에서 `from isaacsim import SimulationApp` 으로 시뮬레이터를 실행하고, RGB/Depth 카메라를 부착해 프레임을 획득합니다.

### Stage · World · Prim
- **정의**: Isaac Sim 장면의 계층 구조 3단위입니다. **Stage**는 장면 전체(최상위), **World**는 물리 엔진이 적용되는 공간, **Prim**은 로봇·센서·장애물 같은 개별 객체 단위입니다.
- **역할/왜 중요한가**: 모든 객체가 `Stage → World → Prim` 의 트리(나무) 구조로 배치되며, 각 객체는 고유 경로로 식별·제어됩니다. 이 개념을 알아야 어떤 객체를 어디에 만들지 지정할 수 있습니다.
- **맥락·예시**: 본문의 `/World/Robot1/base_link` 는 "World 안의 Robot1의 base_link 부품"을 가리키는 Prim 경로입니다. Stage는 보통 `.usd` 파일로 저장해 재사용합니다.

### PhysX
- **정의**: NVIDIA가 개발한 물리 연산 엔진으로, 중력·충돌·마찰·관절 운동 등을 실시간으로 계산합니다.
- **역할/왜 중요한가**: `World` 안에서 물체가 실제처럼 움직이게 만드는 핵심 엔진입니다. PhysX가 적용되지 않으면 객체는 그냥 멈춰 있는 정적 시각 요소에 불과합니다.
- **맥락·예시**: 본문에서 빨간 `DynamicCuboid` 가 공중에서 떨어져 바닥에 충돌해 멈추는 동작이 바로 PhysX가 계산한 결과입니다.

### DynamicCuboid (동적 큐브)
- **정의**: 중력·충돌·마찰 등 물리 특성이 적용되는 정육면체 객체 클래스입니다.
- **역할/왜 중요한가**: 단순한 시각용 도형이 아니라 힘과 충돌에 반응하는 "동적 물리 객체"라서, 물리 시뮬레이션이 제대로 동작하는지 확인하는 가장 간단한 테스트 물체로 쓰입니다.
- **맥락·예시**: `position=[0.0, 0.0, 1.0]` 로 1m 상공에 띄우면 중력으로 낙하해 Ground Plane에 부딪혀 멈춥니다.

### RGB 카메라 / Depth 카메라
- **정의**: **RGB 카메라**는 색상(빨강·초록·파랑)이 담긴 일반 2D 이미지를 만들고, **Depth(깊이) 카메라**는 각 픽셀까지의 거리 정보를 담은 이미지를 만듭니다.
- **역할/왜 중요한가**: 로봇이 주변을 인식하는 두 가지 시각 정보입니다. RGB는 "무엇이 보이는가"(객체 탐지·추적·SLAM), Depth는 "얼마나 멀리 있는가"(거리 측정·충돌 감지·3D 재구성)에 쓰입니다.
- **맥락·예시**: 본문에서 RGB는 `camera.get_rgba()` 로, Depth는 `distance_to_camera` 어노테이터로 획득하며, Depth는 `cmap="jet"`(파랑=가까움, 빨강=멀어짐)로 시각화합니다.

### 어노테이터/어노테이션 (Annotator / Annotation)
- **정의**: 카메라가 만든 이미지에 부가정보(거리, 객체 레이블 등)를 덧붙이는 기능 또는 그 행위입니다.
- **역할/왜 중요한가**: 일반 RGB 영상만으로는 알 수 없는 "각 픽셀의 거리"나 "이 픽셀이 어떤 물체인지" 같은 정보를 함께 제공해, 객체 인식·자율주행 학습 등에 활용됩니다.
- **맥락·예시**: 본문에서 `camera.add_distance_to_camera_to_frame()` 으로 `distance_to_camera` 어노테이터를 등록하면 Depth(깊이) 정보가 포함된 프레임을 얻을 수 있습니다. 그 밖에 세그멘테이션 마스크, 바운딩 박스도 어노테이션의 예입니다.

### 그 외 용어 빠른 정리

| 용어 | 설명 |
| --- | --- |
| `SimulationApp` | Isaac Sim의 핵심 런타임 객체. 시뮬레이터를 실행·종료하며 항상 가장 먼저 생성해야 함 |
| `headless` 옵션 | `False`면 GUI(화면 렌더링) 모드, `True`면 백그라운드 모드로 학습 성능 최적화 |
| Ground Plane | `add_default_ground_plane()` 으로 추가하는 기본 바닥면. 물체가 떨어져 멈추는 지면 역할 |
| 오일러 각 / 쿼터니언 | 회전을 표현하는 두 방식. 사람이 이해하기 쉬운 오일러 각(예: y축 90도)을 `euler_angles_to_quats()` 로 내부 표현인 쿼터니언으로 변환 |
| `resolution` / `frequency` | 카메라 출력 해상도(예: 256×256)와 초당 프레임 수(Hz, 예: 60) |
| USD (`.usd`) | Universal Scene Description. 장면(Stage) 전체를 저장·재사용하는 표준 파일 형식 |
| Conda 가상환경 (`env_isaaclab`) | Isaac Sim 전용 파이썬 패키지가 설치된 격리 환경. 활성화하지 않으면 모듈을 찾지 못해 오류 발생 |

## 🧠 핵심 용어 암기 노트

!!! tip "이 절의 사용법"
    위 **📖 핵심 용어 설명**이 "뜻"이라면, 이 절은 **외우고 확인하는 곳**입니다. ① 암기표 오른쪽을 손으로 가리고 용어만 보며 말해 보기 → ② 그림으로 장면을 기억하기 → ③ 퀴즈로 확인하기 순서로 쓰세요.

### ① 빠른 암기표

| 용어 | 한 줄로 외우기 | 헷갈리는 지점 |
| --- | --- | --- |
| **Stage** | 장면 전체를 담는 **USD 파일 = 무대** | World는 시뮬레이션 제어 객체, Stage는 데이터(장면) 그 자체 |
| **World** | 물리·시간·리셋을 관리하는 **시뮬레이션 컨트롤러** | `World.reset()`을 빼먹으면 물리가 초기화되지 않는다 |
| **Prim** | Stage 안의 **모든 개체 한 개** (Primitive). `/World/Cube` 같은 경로로 지정 | 경로가 곧 이름 — 경로가 틀리면 객체를 못 찾는다 |
| **PhysX** | NVIDIA **물리 엔진**. 중력·충돌·마찰 계산 담당 | 렌더링(보이는 것)과 물리(움직이는 것)는 별개. 물리 속성을 안 주면 안 떨어진다 |
| **DynamicCuboid** | 물리가 **적용되는** 큐브. 중력에 반응해 떨어지고 충돌함 | 정적(static) 오브젝트와 구분 — 정적은 안 움직인다 |
| **RGB 카메라** | 색상 영상. **무엇인지**를 본다 | 사람이 보는 것과 같은 정보 — 거리는 모른다 |
| **Depth 카메라** | 각 픽셀의 **거리** 값. **얼마나 먼지**를 본다 | `distance_to_camera` 어노테이터로 얻는다. RGB와 해상도·좌표계를 맞춰야 융합 가능 |
| **Annotator** | 렌더 결과에서 **원하는 데이터만 뽑는 추출기** | 카메라를 만들었다고 데이터가 나오지 않는다 — 어노테이터를 붙여야 나온다 |

### ② 그림으로 잡기

![Stage / World / Prim 계층 — 무대·관리자·개체](img/w02/s16.jpg)
*Stage / World / Prim 계층 — 무대·관리자·개체 — 출처: 강의 슬라이드 2강 16*

![Depth(깊이) 영상의 원리 — 가까울수록 밝고 멀수록 어둡게 거리를 이미지로 표현](https://upload.wikimedia.org/wikipedia/commons/f/fa/Z-depth2.png)
*Depth(깊이) 영상의 원리 — 가까울수록 밝고 멀수록 어둡게 거리를 이미지로 표현 — 출처: Wikimedia Commons, Z-depth2.png (Public domain)*

### ③ 자가 점검 퀴즈

1. Stage · World · Prim을 각각 한 단어로 비유하면?
2. RGB 카메라만으로는 알 수 없고 Depth 카메라가 있어야 아는 정보는?
3. 카메라 Prim을 만들었는데 이미지가 안 나옵니다. 가장 먼저 확인할 것은?
4. 큐브를 만들었는데 떨어지지 않습니다. 왜일까요?

??? success "정답 확인"
    1. Stage = 무대(장면 데이터, USD), World = 무대 감독(물리·시간·리셋 관리), Prim = 무대 위 개체 하나.
    2. 카메라로부터 각 픽셀까지의 거리(깊이). RGB는 색·형태만 준다.
    3. Annotator(어노테이터)를 등록했는지. 렌더 결과에서 데이터를 뽑아내는 추출기를 붙여야 이미지가 나온다.
    4. 물리 속성이 적용되지 않은 정적 오브젝트이기 때문. `DynamicCuboid`처럼 물리(PhysX)가 적용되는 객체로 만들어야 중력에 반응한다.

## 📝 2주차 과제

!!! example "과제 2 — 물리 환경 + RGB/Depth 카메라 시뮬레이션"
    **목표**: Isaac Sim에서 World·Ground·DynamicCuboid로 물리 장면을 구성하고 RGB·Depth 카메라를 부착해 프레임을 획득·시각화한다.

**과제 흐름도**

```mermaid
graph LR
  A[World+Ground] --> B[큐브 낙하] --> C[RGB 카메라] --> D[Depth 카메라] --> E[📦 코드+이미지]
```

**수행 단계**

1. `World`(stage_units=1.0)+Ground Plane 생성
2. 빨간 `DynamicCuboid`를 1m 높이에 배치 → 낙하·충돌 확인
3. RGB 카메라 + Depth 카메라 부착 후 프레임 캡처
4. matplotlib 등으로 RGB/Depth 이미지 저장

**제출물**

- [ ] 실행 파이썬 스크립트(`.py`)
- [ ] 큐브 낙하 장면 캡처(초기/낙하/정지 3컷)
- [ ] RGB·Depth 출력 이미지 각 1장
- [ ] 코드 핵심부 주석 설명(보고서)

**평가 (배점 100)**

| 항목 | 배점 | 기준 |
| --- | --- | --- |
| 물리 장면 구성 | 35 | 큐브 낙하·충돌 동작 |
| 카메라 RGB/Depth | 45 | 두 센서 프레임 획득·시각화 |
| 보고서 | 20 | 코드 설명·결과 해석 |

**제출 형식·마감**: 다음 주차 강의 시작 전까지 LMS 업로드 — ① 코드/설정 `zip` ② 보고서 `PDF`(표지: 학번·이름·과제명) ③ 실행 결과 스크린샷/영상. 코드는 재현 가능해야 하며, 외부 코드를 사용하면 출처를 명시한다(미표기 시 감점).

<!-- FULLDECK -->
## 🖼️ 원본 강의 슬라이드

??? note "원본 강의 슬라이드 전체 (29매)"
    ![슬라이드 01](img/w02/s01.jpg){ width="700" }
    ![슬라이드 02](img/w02/s02.jpg){ width="700" }
    ![슬라이드 03](img/w02/s03.jpg){ width="700" }
    ![슬라이드 04](img/w02/s04.jpg){ width="700" }
    ![슬라이드 05](img/w02/s05.jpg){ width="700" }
    ![슬라이드 06](img/w02/s06.jpg){ width="700" }
    ![슬라이드 07](img/w02/s07.jpg){ width="700" }
    ![슬라이드 08](img/w02/s08.jpg){ width="700" }
    ![슬라이드 09](img/w02/s09.jpg){ width="700" }
    ![슬라이드 10](img/w02/s10.jpg){ width="700" }
    ![슬라이드 11](img/w02/s11.jpg){ width="700" }
    ![슬라이드 12](img/w02/s12.jpg){ width="700" }
    ![슬라이드 13](img/w02/s13.jpg){ width="700" }
    ![슬라이드 14](img/w02/s14.jpg){ width="700" }
    ![슬라이드 15](img/w02/s15.jpg){ width="700" }
    ![슬라이드 16](img/w02/s16.jpg){ width="700" }
    ![슬라이드 17](img/w02/s17.jpg){ width="700" }
    ![슬라이드 18](img/w02/s18.jpg){ width="700" }
    ![슬라이드 19](img/w02/s19.jpg){ width="700" }
    ![슬라이드 20](img/w02/s20.jpg){ width="700" }
    ![슬라이드 21](img/w02/s21.jpg){ width="700" }
    ![슬라이드 22](img/w02/s22.jpg){ width="700" }
    ![슬라이드 23](img/w02/s23.jpg){ width="700" }
    ![슬라이드 24](img/w02/s24.jpg){ width="700" }
    ![슬라이드 25](img/w02/s25.jpg){ width="700" }
    ![슬라이드 26](img/w02/s26.jpg){ width="700" }
    ![슬라이드 27](img/w02/s27.jpg){ width="700" }
    ![슬라이드 28](img/w02/s28.jpg){ width="700" }
    ![슬라이드 29](img/w02/s29.jpg){ width="700" }
