# SDP — 소프트웨어 개발 계획서 (LPJ-HILS-SDP-001)

!!! abstract "문서 정보"
    개발 환경·형상 관리·개발 단계(P/A/N)·위험 관리·검증 전략과 시험 실적을 정의합니다. 요구사항(SRS)의 구현·검증 경로를 추적하는 상위 계획 문서입니다.

    이 페이지는 저장소 `l-project-hils-ros2`의 `docs/SDP.md`를 그대로 게재한 것입니다
    (저장소는 비공개·승인제이며, 본 문서는 연구 성과 공개용으로 발췌 없이 수록).
    상위 프로젝트 개요는 [현대차 L-Project 12축 HILS 시스템](l-project-hils.md)을 참조하세요.

---

**L-Project HILS 시스템 — 12축(4륜 독립조향 + 액티브 서스펜션) 로버 구동 제어 및 시뮬레이션 소프트웨어**

| 항목 | 내용 |
|---|---|
| 문서 번호 | LPJ-HILS-SDP-001 |
| 버전 | 1.8 |
| 작성일 | 2026-07-28 (개정 2026-07-31) |
| 과제 | 현대자동차 L-Project팀 과제 — HILS 시스템 개발 |
| 관련 문서 | SRS-001, AD-002(아키텍처), TP-001(벤치)·TP-002(통합), DP-001(Jetson)·DP-002(시뮬 PC), IG-001(Isaac Sim)·IG-002(Nav2)·IG-003(NVIDIA Nav) |

**개정 이력**

| 버전 | 일자 | 내용 |
|---|---|---|
| 1.0 | 2026-07-28 | 최초 작성 |
| 1.1 | 2026-07-29 | 펌웨어 git 전환 반영, 아키텍처 v2 이행 단계(A1~A6) 추가, 벤치 시험 절차서 연계, 리스크 갱신 |
| 1.2 | 2026-07-30 | A1~A5 완료 반영(A6만 하드웨어 대기), 산출물 등재(TP-002·DP-001/002·IG-001·배포 도구·sim_plant·DDS 설정), 최종 검토 수정 반영(도메인 42·drive 공통 타임아웃·상수 단일화), 시험 실적 추가 |
| 1.3 | 2026-07-30 | 12축 개정(v3) 반영 — ROS2·펌웨어·브리지·sim_plant 전면 개정 및 검증, 잔여 작업 백로그 등재(에뮬레이터 12노드/PPM, TP-001/002 기대값 개정, 제원·기어비 실측) |
| 1.4 | 2026-07-31 | 백로그 B1(에뮬레이터 12노드/PPM)·B2(TP-001/002 개정) 완료 반영. 전체 검토 — 본문 8륜 잔재를 12축으로 정합화(1장 개요·위험·rover_mcu 상태) |
| 1.5 | 2026-07-31 | 노드 헬스 모니터링 산출물 등재 — health_monitor 노드·`/diagnostics` (SRS 3.7절, AD-002 v2.3 6a절), sim 폐루프 검증 실적 추가 |
| 1.6 | 2026-07-31 | **EPOS4 실물 미구매 — 에뮬레이터 대체 결정** 반영: 12축 전체 프로토콜 시험(test_master_12axis) 등재, N2/N3 성격 변경, B3/B4 재정의, 대체 한계 리스크 등재 |
| 1.7 | 2026-08-03 | **조이스틱 수동 주행 신설** — rover_teleop 노드·`tools/test_teleop.py` 산출물 등재, SRS 3.8절/AD-002 3b절 연계, 시험 실적 추가 |
| 1.8 | 2026-08-03 | 2.4절에 문서 공개 경로(연구실 홈페이지 게재·자동 재생성) 명시 |

---

## 1. 프로젝트 개요

### 1.1 목표

12축 로버(4륜 독립조향 + 액티브 서스펜션, v3 계약 — AN-001)의 Navigation-구동계 폐루프를
HILS로 구축한다. 실물 모터드라이버(EPOS4 ×12) 없이도 동일 CAN 프로토콜로 개발·검증이
가능하도록 플랜트 에뮬레이터를 제공하고, 실물 전환 시 파라미터 변경만으로 동작하도록 한다.

### 1.2 개발 산출물

| 산출물 | 위치 | 상태 |
|---|---|---|
| ROS2 구동 제어 패키지 `hils_rover_control` | 본 저장소 | 완료 (v0.1.0) |
| ROS2 지그 브리지 `hils_bridge` | 본 저장소 | 완료 (v0.1.0) |
| EPOS4 로버 에뮬레이터/모니터 GUI | 본 저장소 `tools/epos_rover_emulator/` | 완료 |
| 로버 제어 펌웨어 `hils-rover-fw` | `l-project-hils/firmware/` (NAS) | 빌드 검증 완료, 실기 시험 대기 |
| 지그 펌웨어/부트로더 `hils-fw`, `hils-boot` | `l-project-hils/firmware/` (NAS) | 기존 자산 (리네이밍 완료) |
| 테스트 인프라 (vcan systemd, SIL/통합 테스트) | 본 저장소 `tools/` | 완료 |
| 문서 일체 (SRS·SDP·AD-002·TP-001/002·DP-001/002·IG-001/002/003·AN-001·RR-001·OP-001) | 본 저장소 `docs/` | 유지 관리 중 |
| 배포 도구 (Jetson·시뮬 PC 설치 스크립트/systemd) | `tools/jetson/`, `tools/simpc/` | 완료 |
| 시뮬레이터 대역 `sim_plant.py` · DDS 설정 | `tools/`, `config/dds/` | 완료 (검증됨) |
| Isaac Sim 연동 준비 (어댑터·URDF·가이드 IG-001) | `tools/isaac/`, `docs/` | 완료 (어댑터·URDF 검증됨) |
| Nav2 통합 준비 (파라미터·런치·가이드 IG-002) | `hils_rover_control/config/nav2/`, `docs/` | 완료 (빌드·문법 검증) |
| NVIDIA Isaac ROS Navigation 가이드 (IG-003) | `docs/` | 완료 — **N4는 NVIDIA 경로·카메라 D455 확정**, 발주 대기 |
| `rover_mcu` (micro-ROS/XRCE-DDS 펌웨어 노드) | CSCI-6 확장 | 완료 (A1~A4) |
| `rover_state` 노드 · `/rover/*` 토픽 개편 | `hils_rover_control/` | 완료 (A5) |
| `health_monitor` 노드 (`/diagnostics` 헬스 모니터링) | `hils_rover_control/` | 완료 (sim 폐루프 + real 모드 SIL 검증) |
| `rover_teleop` 노드 (조이스틱 수동 주행) + `tools/test_teleop.py` | `hils_rover_control/`, `tools/` | 완료 (합성 /joy 자동 시험 5 PASS) |
| 서스펜션 운용 도구 `suspension_cmd.py` + 정책 OP-001 | `tools/`, `docs/` | 완료 (B5 1단계) |

---

## 2. 개발 환경

### 2.1 도구 및 버전

| 구분 | 도구 | 버전 |
|---|---|---|
| OS | Ubuntu (Linux 6.8) | 22.04 계열 |
| ROS2 | Humble | 시스템 Python 3.10 |
| 펌웨어 툴체인 | ARM GNU Toolchain (arm-none-eabi-gcc) | 13.3.Rel1 (`~/opt/arm-gnu-13.3`) |
| 펌웨어 빌드 | CMake + Make | `ARM_TOOLCHAIN_DIR` 환경변수 필요 |
| MCU SDK | STM32CubeH7 HAL (STM32H723ZG) | 코드베이스 내장 |
| Python 라이브러리 | python-can 4.6, PySide6 6.11 | conda(3.13) 및 시스템(3.10) 양쪽 설치 |
| CAN 테스트 버스 | vcan0 (systemd 유닛 `tools/systemd/`) | 부팅 자동 생성 |
| 형상관리 | git | 저장소 2개 (2.4절) |

### 2.2 펌웨어 빌드 절차

```bash
export ARM_TOOLCHAIN_DIR=$HOME/opt/arm-gnu-13.3/bin
cd l-project-hils/firmware/hils-rover-fw
cmake -S . -B build && make -C build -j
# build/hils-rover-fw.bin → hils-loader로 다운로드 (UDP:5000 또는 USB CDC)
```

### 2.3 ROS2 빌드 절차

```bash
source /opt/ros/humble/setup.bash
colcon build --base-paths <이 저장소> --packages-select hils_bridge hils_rover_control
source install/setup.bash
```

### 2.4 형상 관리

| 저장소 | 내용 | 비고 |
|---|---|---|
| `l-project-hils-ros2` (git) | ROS2 패키지, 에뮬레이터, 테스트, 문서 | 본 저장소 |
| `l-project-hils` (git) | 펌웨어(hils-fw/boot/rover-fw), PC 도구 | GitHub parclab-hsu/l-project-hils (비공개), build/·archive/ 제외 |

커밋 규칙: 기능 단위 커밋, 메시지 영어 요약 + 상세 불릿.
브랜치: 현재 `main` 단일 (팀 확장 시 feature 브랜치 도입).

**문서 공개**: SRS·SDP는 연구실 홈페이지에도 게재된다(`parclab-hsu.github.io/projects/l-project-{srs,sdp}`).
공개 페이지는 본 저장소 `docs/` 원문의 정적 복사본이며, 홈페이지 `build.sh`가 빌드 직전
`sync-l-project-docs.py`로 자동 재생성하므로 문서 개정 후 홈페이지를 빌드·커밋하면 반영된다.

**접근 정책(승인제)**: 두 저장소 모두 PRIVATE — 소유자(parclab-hsu)가 초대·승인한 콜라보레이터만 접근.
초대: `gh api -X PUT repos/parclab-hsu/<repo>/collaborators/<id> -f permission=push` (읽기 전용은 `pull`).
개인 계정 저장소는 포크 차단 불가 — 팀 확대 시 Organization 전환 검토(포크 금지·팀 권한·감사 로그).

---

## 3. 개발 프로세스 및 단계

### 3.1 수행 완료 단계 (2026-07-28 기준)

| 단계 | 내용 | 검증 |
|---|---|---|
| P1. 자산 분석 | 기존 wiznet-iot-speaker 기반 지그 펌웨어/도구 전체 분석, 리네이밍 | 코드 리뷰 |
| P2. ROS2 구동 구조 설계 | rover_control(real/sim)·sim_feedback 노드, 스키드스티어 기구학 | 루프백 시험 |
| P3. 드라이버 규격 학습 | EPOS4 공식 문서 3종 정독, CANopen 프로토콜 추출 | 문서 대조 |
| P4. 3중 구현 | ROS2 마스터 / STM32 펌웨어 / GUI 에뮬레이터 (동일 규격) | 각 단위시험 |
| P5. SIL 검증 | 마스터 ↔ 에뮬레이터 in-process 검증 (ALL PASS) | `test_sil_master.py` |
| P6. 통합 검증 | 프로세스 분리 + vcan0 실 CAN 스택 검증 (ALL PASS) | 통합 시험 |
| P7. 운영 도구화 | 게이지/그래프 GUI, Monitor 모드, vcan systemd 영구화 | 시연 |

### 3.2 향후 단계 — 실기 전환 (N) + 아키텍처 v2 이행 (A)

| 단계 | 내용 | 선행 조건 |
|---|---|---|
| N1. 실기 파라미터 확정 | 휠 반경/트랙/감속비/정격토크 실측 반영 | 기구 제원 확정 |
| N2. 펌웨어-에뮬레이터 CAN 시험 | **실물 대체**: 보드 FDCAN ↔ USB-CAN 어댑터 ↔ PC 에뮬레이터(socketcan) — TP-001 v1.2 대체 구성 | 보드·USB-CAN 어댑터 입고 |
| N3. EPOS Studio 튜닝 | (보류 — 실물 미구매) 실물 도입 시에만 수행 | 실물 도입 결정 |
| A1. micro-ROS 골격 | 펌웨어 FreeRTOS + `rover_mcu` 노드 (시리얼 전송) | — |
| A2. W5300 UDP 전송 (완료 2026-07-30) | XRCE UDP 전송(소켓3, 에이전트 :8888), 시리얼 폴백 유지, 보드 IP .30 기본화 | A1 |
| A3. Drive Interface (완료 2026-07-30) | 추상 계층 + drv_epos 래핑 + drv_sim 루프백 스텁 — 소비자 전부 drive API 경유 | A1 |
| A4. drv_sim 백엔드 (완료 2026-07-30) | micro-ROS /sim/* 연동, 피드백 신선도 안전, 루프백 폴백 유지 | A3 |
| A5. Jetson 노드 개편 (완료 2026-07-30) | rover_control `real_backend`(mcu/can), `rover_state` 신설 — 3경로 시험 통과 | A1 |
| A6. 3머신 통합 시험 | Jetson+시뮬 PC+보드, real/sim 양 모드 | A2~A5, N2 |
| N4. Navigation 통합 (**NVIDIA 확정**) | Isaac ROS(cuVSLAM·nvblox)+Nav2 — IG-002/IG-003 절차(D455 확정) | A6, D455 발주 |
| N5. 안전 기능 보강 | STO 배선, EMCY 정책, RPDO 타임아웃(0x8250) 설정 | N2 |

### 3.2a 12축 개정 백로그 (2026-07-30)

| # | 항목 | 비고 |
|---|---|---|
| B1 | EPOS4 에뮬레이터 12노드·PPM 지원 | **완료 (2026-07-31)** — 12노드 기본, PPM 세트포인트 핸드셰이크, 4WS 자세 적분, SIL 복원 (test_emulator 20 PASS / test_sil_master ALL PASS) |
| B2 | TP-001/TP-002 기대값·절차 개정 | **완료 (2026-07-31)** — TP-001 v1.1(epos_bench 도구화, TS-8 PPM 벤치, 12대 확장), TP-002 v1.1(axes_cmd[12], 4WS 기대값 기구학 교차검증, 서스 명령·조향 유지 워치독) |
| B3 | 조향/서스 기어비·카운트 상수 확정 | 실물 미구매로 실측 불가 — 기구 설계 제원 확정 시 상수 갱신(drive.h·axes.py·emu_core.py 3곳), 에뮬레이터는 동일 상수로 정합 유지 |
| B4 | PPM 핸드셰이크 검증 | **에뮬레이터 검증으로 대체 완료 (2026-07-31)** — test_master_12axis 8축 동시 ack/target-reached 확인. 실물 도입 시에만 재검증 |
| B5 | 서스펜션 제어 정책 정의 | **1단계 완료 (2026-07-31, OP-001)** — 운영자 프리셋(level/lift/drop/manual) CLI `tools/suspension_cmd.py`, 정지 중 즉시 반영, 한계 이중 클램프. 2단계(지형 적응 자동화)는 실기 데이터 확보 후 |

### 3.3 위험 관리

| 위험 | 영향 | 대응 |
|---|---|---|
| 로버 제원 가정값과 실측 불일치 | 주행 오차 | 파라미터 일원화 — 변경점 3곳(axes.py/drive.h/emu_core.py)으로 국한 |
| EPOS4 단위계 설정 상이(0x60A9 등) | 속도 스케일 오류 | 시동 시 0x6061 검증, 필요 시 SI unit 확인 로직 추가 |
| CAN 버스 부하 (12노드 PDO) | 지연 | 1Mbit/s + inhibit time, 실측 부하 분석 예정 |
| NAS 저장소 이중 마운트/권한 문제 재발 | 개발 중단 | fstab 자격증명 수정, 마운트 점검 절차 문서화 |
| W5300 XRCE 커스텀 전송 개발 난이도 | A2 지연 | A1(시리얼)로 기능 선완성 후 전송만 교체 |
| 머신 간 RMW 혼용/발견 실패 | 통신 두절 | 전 머신 RMW·도메인 통일, 설정 파일 형상 관리 (SRS-FR-056) |
| XRCE 세션 두절 시 거동 | 폭주 위험 | 보드 로컬 타임아웃이 최종 안전선 (SRS-FR-055) |
| 에뮬레이터-실물 동작 차이 (전류/토크 물리, 튜닝, 비실시간 PC 타이밍) | 실물 도입 시 재작업 | 프로토콜 표면은 시험으로 정합 유지(test_master_12axis), 물리 파라미터는 플랜트 모델(Isaac)로 보완, 실물 도입 시 TP-001 원 절차 재수행 |

---

## 4. 검증 전략 및 현황

### 4.1 시험 수준

| 수준 | 방법 | 자동화 |
|---|---|---|
| 단위 | 프로토콜 프레임 인코딩/디코딩 검사 | pytest 가능 (현재 스크립트) |
| 구성요소 | 에뮬레이터 자체 시험 `test_emulator.py` | 20항목 (12노드·PVM·PPM) |
| SIL | 마스터↔에뮬레이터 `test_sil_master.py` | 7항목 (4구동 벤치+PPM 스모크) |
| 통합 | vcan0 프로세스 분리, ROS2 토픽 단위 확인 | 수동 절차 (자동화 예정) |
| 실기 | EPOS4 실물 + Monitor 모드 계기판 | 예정 (N2) |

### 4.2 시험 실적

시간순 기록이다. **① 초기 8륜 스키드 구성(2026-07-28)** 실적은 12축 개정으로 대체되었고,
현행 유효 실적은 **② 12축(v3) 구성** 이하 행이다.

**① 초기 8륜 구성 (2026-07-28 — 이력)**

| 시험 | 결과 |
|---|---|
| 에뮬레이터 자체 시험 (SDO/PDO/402/EMCY/폴트리셋) | 11 PASS / 0 FAIL (8노드 PVM 기준) |
| SIL (시동·속도추종·토크·정지·EMCY) | ALL PASS |
| 통합: 8노드 시동 | 1.2 s 내 전 노드 Operation Enabled |
| 통합: /cmd_vel(0.5, 0.2) 추종 | 휠 좌 4.40 / 우 5.60 rad/s (이론값 일치) |
| 통합: 토크 피드백 | 0.33~0.72 Nm 수신 |
| 통합: 워치독 | 0.56 s에 전 모터 정지 |
| 펌웨어 빌드 | hils-rover-fw.bin 381 KB / 896 KB 영역 |

**② 아키텍처 v2 · 12축(v3) 구성 — 현행 유효 실적**

| 시험 | 결과 |
|---|---|
| A5: 3경로(mcu/can/sim) 명령·피드백 (2026-07-30) | 전부 통과 (wheel_cmd 4.4/5.6, odom 0.5/0.2 복원) |
| sim_plant 대역 플랜트 (2026-07-30) | 4.4/5.6 rad/s 수렴, 49.98 Hz |
| Isaac 어댑터 재정렬 (2026-07-30) | 역순 입력 → 표준 순서 복원 통과 |
| micro-ROS 포함 펌웨어 빌드 (2026-07-30) | FLASH 459 KB / 894 KB, RAM_D1 77.5% |
| 12축 ROS2 폐루프 (2026-07-30) | cmd_vel(0.5, 0.2) → 구동 1.89/3.02 rad/s·조향 ±21.9/13.5° → /odom 0.5/0.2 복원 |
| 12축 펌웨어 빌드 (2026-07-30) | FLASH 461 KB / 894 KB, RAM_D1 77.7% |
| 에뮬레이터 12노드·PPM (2026-07-31, B1) | test_emulator **20 PASS / 0 FAIL**, test_sil_master(4구동+PPM 조향 30° 수렴) **ALL PASS** |
| 헬스 모니터 (2026-07-31) | sim 폐루프 전 항목 OK(50.0Hz 판정) → sim_plant kill 3s 내 joint_states·odom ERROR·종합 degraded |
| 헬스 모니터 real 모드 SIL (2026-07-31) | 합성 /rover/status: 전 축 enabled → `rover/axes` OK, 노드3 Fault+EMCY 주입 → ERROR `fault [N3] emcy [N3:0x2310]` 정확 지목 |
| 서스펜션 정책 (2026-07-31, B5) | 정지 중 프리셋 lift 0.2 rad → axes_cmd[8..11]=0.2 즉시 발행 확인 |
| **12축 전체 프로토콜 시험** (2026-07-31, 실물 대체 판정) | test_master_12axis **11 PASS / 0 FAIL** — 12노드 시동·PVM 4축 속도(1% 이내)·TPDO3 토크 4B·PPM 8축 위치(±1 cnt)·ack/target-reached·4WS 조향각 일치·EMCY/리셋 |
| 조이스틱 수동 주행 (2026-08-03) | test_teleop **5 PASS / 0 FAIL** — Nav2 단독 반영 · 조이스틱 선점(2.35 vs Nav2 0.94) · crab 전 축 조향 90.0° · 데드맨 해제 시 정지 유지 · release 후 Nav2 복귀 |

### 4.3 요구사항 추적

SRS의 각 요구사항(SRS-FR/NF-xxx)은 4.2의 시험 항목 및 저장소 커밋으로 추적된다.
주요 커밋: `811aa0c`(ROS2 구조) → `e989183`(EPOS4 프로토콜 3중 구현+SIL) →
`f833878`(GUI 게이지/모니터 모드) → `0ad2519`(트렌드 그래프) → `f600f7d`(vcan 인프라) →
`9c765c7`(12축 v3 전면 개정) → `dd293d2`(B1: 에뮬레이터 12노드·PPM) → `8a37c90`(B2: TP-001/002 v1.1) →
`43d65f0`(전체 정합성 검토) → `2c2f76d`(SRS/SDP 흐름 검증) → `421f240`(RR-001 검토 보고서) →
`45b219f`(헬스 모니터링) → `d756c3e`(B5 서스펜션 정책) → `3fb5614`·`7c08ce4`(EPOS4 실물 대체 판정).

---

## 5. 운영 절차 요약

### 5.1 ROS2 폐루프 시뮬레이션 (실물 없음 — sim 모드)

```bash
# 터미널 1: 대역 플랜트 (또는 Isaac Sim + sim_isaac_bridge — IG-001)
/usr/bin/python3 tools/sim_plant.py
# 터미널 2: 제어·상태 노드 (sim 모드)
ros2 launch hils_rover_control rover_control.launch.py mode:=sim
# 터미널 3: Navigation 또는 수동 명령
ros2 topic pub -r 10 /cmd_vel geometry_msgs/msg/Twist '{linear: {x: 0.5}, angular: {z: 0.2}}'
# 확인: /sim/axes_cmd 구동 1.89/3.02 rad/s·조향 ±21.9/13.5° → /odom 0.5/0.2 복원
```

### 5.2 CAN 레벨 SIL (실물 없음 — 에뮬레이터 + 벤치 도구)

```bash
# 터미널 1: 에뮬레이터 GUI (12노드)
python3 tools/epos_rover_emulator/epos-rover-emulator.py --interface socketcan --channel vcan0
# 터미널 2: 구동 4노드 PVM 벤치 (구 rover_control CAN 백엔드는 폐지)
/usr/bin/python3 tools/epos_bench.py --channel vcan0 --nodes 1 2 3 4 --rpm 200
# PPM 위치축은 TP-001 v1.1 TS-8 cansend 절차 사용
```

### 5.3 실물 로버 (3머신 — TP-002 v1.1)

```bash
# EPOS4 12대: 노드ID 1~12 (DIP: 1~4 구동/5~8 조향/9~12 서스), 1Mbit/s, 양 끝 종단 ON,
# EPOS Studio 튜닝 완료 상태. Jetson·시뮬 PC·HILS 보드 배포는 DP-001/DP-002.
ros2 launch hils_rover_control rover_control.launch.py mode:=real   # Jetson, 보드 경유
# 모니터링 계기판 (CAN 수동 청취)
python3 tools/epos_rover_emulator/epos-rover-emulator.py \
  --interface socketcan --channel can0 --mode monitor
```


---

[:octicons-arrow-left-24: 프로젝트 개요로](l-project-hils.md){ .md-button }
[:octicons-file-document-16: SRS (요구사항 명세서) 보기](l-project-srs.md){ .md-button }
