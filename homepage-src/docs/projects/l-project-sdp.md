---
noindex: true
---

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
| 버전 | 1.55 |
| 작성일 | 2026-07-28 (개정 2026-08-14) |
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
| 1.9 | 2026-08-03 | 공개 홈페이지·Git 구현 정합화 — 폐기된 PC 직결 CAN 경로 제거, 벤치 에뮬레이터 시험과 STM32/실물 검증 범위 구분, 레거시 URDF 범위 명시 |
| 1.10 | 2026-08-04 | **TP-002 사전 리허설 도입** — 보드 대역 노드 `mcu_stub.py`와 자동 리허설 `test_tp002_rehearsal.py` 산출물 등재(TP-002 v1.3 0a절), 시험 실적 추가 |
| 1.11 | 2026-08-04 | **통합 회귀 러너 도입** — `tools/run_all_tests.sh`로 5종 시험 일괄 수행, 4.1절 '수동 절차(자동화 예정)' 해소 |
| 1.12 | 2026-08-04 | micro_ros_agent 사전 검증 실적 등재(DP-001 4.2절) — 빌드·세션 확립 확인, conda 파이썬 빌드 함정 기록 |
| 1.13 | 2026-08-04 | **Nav2 스모크 자동화·실행** — `test_nav2_smoke.py` 등재, 회귀 러너 편입, inflation_radius 결함 수정(IG-002) |
| 1.14 | 2026-08-04 | 전수 검증 — 3.2b절 신설(하드웨어 대기 중 사전 준비 P1~P5 등재), A6·N4에 예행 완료 상태 반영 |
| 1.15 | 2026-08-04 | 재검증 — Nav2 편입 후에도 4.1절·시험 실적에 남아 있던 회귀 러너 '5종/75 s' 표기를 6종/90 s로 정정 |
| 1.16 | 2026-08-04 | **공유 안내서 SG-001 신설** — 현대자동차 L-Project팀 대상 자료 구성·문서 지도·재현 절차·검증 범위 안내 |
| 1.17 | 2026-08-04 | **홈페이지 공개 운영 안내 PG-001 신설** — 공개 범위·페이지 구성·갱신 절차·작성 규칙·게시 후 검증 |
| 1.18 | 2026-08-06 | P5 경로를 **OmniLRS 도커**로 확정(IG-001 2b절), 사전 점검 도구 등재 |
| 1.19 | 2026-08-13 | N2 어댑터를 **PEAK PCAN-USB**로 확정(TP-001 v1.3) — 준비물·배선·속도 정합·점검 도구, 보드 트랜시버 확인 필요 명시 |
| 1.20 | 2026-08-14 | **ND-001 노드·데이터 명세**와 **OP-002 조이패드 원격 조종 운용** 신설, 원격 조종석 런치 추가 |
| 1.21 | 2026-08-14 | OP-002 v1.1 — 조종간을 **Xbox 무선 컨트롤러**로 확정 |
| 1.22 | 2026-08-14 | **P5 부분 완료** — Isaac 대역 노드 `isaac_stub.py`와 `test_isaac_bridge.py`로 연동 계약 15항목 자동 검증(IG-001 2c절). 회귀 러너 **7종**으로 확장. Isaac Sim 실제 실행은 GPU 드라이버 재부팅 대기로 여전히 미수행 |
| 1.23 | 2026-08-14 | **노션 자산 허브 전수 대조** — 노션에 게시된 문서 페이지 15종(SG-001·PG-001은 허브 본문에만 요약) 중 SDP만 2판 뒤처져 있었고, 다수 페이지의 *본문*이 초판(8륜 계약) 그대로였음. 경고 배너·개정 콜아웃으로 조치하고 재발 방지 규칙을 PG-001 6절에 신설(v1.1) |
| 1.24 | 2026-08-14 | **전수 검증(R4)** — 결함 3건(D-12 러너가 SKIP을 통과로 보고 / D-13 PG-001 페이지 구성 / D-14 홈페이지 수치 드리프트) 수정·검증, RR-001 v1.1 |
| 1.25 | 2026-08-14 | **AD-002 v2.7** — 시뮬레이터 어댑터 계층을 아키텍처에 반영(구성도·노드 그래프에 `sim_isaac_bridge`·`isaac/*` 내부 토픽, 3c절 「플랜트 교체 경계」 신설, 토픽 계약·매트릭스 분리). 홈페이지 다이어그램 동기화 |
| 1.26 | 2026-08-20 | **사전 준비 재점검(R5)** — 점검·시험 도구 결함 2건 수정: D-15 `check_omnilrs_ready.sh`가 GCC 버전을 드라이버 버전으로 오독(해소된 선행 조건을 미해소로 보고) / D-16 Nav2 스모크가 노드 스냅샷 재사용으로 정상 기동을 FAIL 판정. P5 대기 사유를 **docker 그룹 단일 항목**으로 좁힘. 1.22~1.25 이력 순서 정정(D-09 재발) |
| 1.27 | 2026-08-20 | **제원 갱신 지점 정정(D-17)** — 3.2a B3·3.3 위험표의 "3곳"에서 `rover_params.yaml`이 빠져 있었다. 런치 3종이 적재하는 이 yaml이 `axes.py` 기본값을 덮으므로, 실측 반영 시 누락하면 실행 노드가 옛 제원으로 돈다. **4곳**으로 정정 (SRS v1.9 6장 동시 개정) |
| 1.28 | 2026-08-20 | **정식 플랜트를 `final_rover_HH` 로 채택**(AN-001 8.6) — 자산은 수정하지 않고 브리지에 `command_mode: split` 을 신설해 자산의 두 그래프(wheel/steering) 계약에 맞췄다. 플랜트 프로파일 `config/isaac/*.yaml` 도입, IG-6 시험 신설. **기구학·모션 모델 검증 시험**(31항목)을 회귀에 편입해 8종으로 확장 |
| 1.29 | 2026-08-21 | **자산 배선 결함 D-18 수정** — 정식 자산 `final_rover_HH` 의 두 Action Graph 가 컨트롤러·구독자 입력 전부를 양쪽에 교차 연결하고 있었고 없는 노드 참조도 있었다(14건 수정, 원본 백업 보존). `test_isaac_bridge.py` 에 **IG-0 자산 배선 검사**를 신설해 회귀에서 자동 검출(리허설 22항목). AD-002 v2.8 3d절「플랜트 프로파일」신설, SRS v1.10 정식 플랜트 교체 |
| 1.30 | 2026-08-21 | **자산 ROS 도메인 결함 D-19** — `ROS2Context` 5개가 도메인 10 이었다(계약 42). 기동은 되는데 토픽이 안 보이는 종류라 IG-0 검사에 도메인 항목을 추가하고 자산을 42 로 정정. **sim↔real 전주기 대응 명시** — AD-002 v2.9 3e절에 필드 대응표(특히 구동축 토크: 실기 TPDO3 0x6077 ↔ Isaac effort→`drv_sim` 역산)와 Isaac 끝단이 비어 있을 수 있다는 한계를 기술. IG-7 토크 대칭 시험 신설 (리허설 26항목), TP-IG-5 에 effort 확인 단계 추가 |
| 1.31 | 2026-08-21 | **P5 차단 사유 변경** — docker 그룹 해소로 TP-IG 착수, TP-IG-1 통과. 이후 **Isaac Sim 5.0.0-rc.45 자체가 기동 실패**(빈 스테이지에서도 재현)하여 TP-IG-2~6 차단. 해소는 OmniLRS 이미지 재빌드 문제로 이관 |
| 1.32 | 2026-08-21 | **이미지 재빌드가 해법이 아님을 확인** — 베이스 `isaac-sim:5.0.0`·신규 `5.1.0` 모두 단독으로 동일 세그폴트(`librtx.scenedb.plugin.so`). 5.1.0 은 Warp CUDA 문제만 해소되고 RTX 크래시는 남는다. 반면 같은 이미지의 NVIDIA 호환성 검사기는 정상 기동하며 드라이버 595.84 를 supported 로 판정한다. P5 차단은 **벤더 레벨 사안**으로 이관 — 저장소 측 조치 없음 |
| 1.33 | 2026-08-21 | **P5 차단 원인 확정** — NVIDIA 확인상 **595.xx 드라이버 분기의 Blackwell GPU 알려진 결함**(우리 환경: 595.84 + RTX 5080 sm_120). Isaac Sim 버전과 무관하며 이미지 재빌드로 해결되지 않는다. 해법은 **드라이버 다운그레이드**(591.74 확인됨, 또는 Requirements 명시 580.65.06/580.95.05). 전 시스템 영향 조치라 사용자 승인 대기. 근거는 IG-001 2b절 |
| 1.34 | 2026-08-21 | **P5 차단 해소, TP-IG 1회차 수행** — 드라이버를 580.173.02-open 으로 내려 Isaac Sim 정상 기동 확인. TP-IG-1~4·effort 관문 통과, **TP-IG-5 구동축 FAIL**. 실행으로만 드러난 결함 4건 등재(RR-001 R6: D-20 점검 스크립트 재발 · D-21 브리지 명령 QoS 비호환 · D-22 컨테이너 SHM 권한 · **D-23 자산 구동 드라이브 — 미해결**). D-21 수정으로 명령 경로 성립. P5 는 D-23 때문에 **완료로 올리지 않는다** |
| 1.35 | 2026-08-21 | **D-23 원인 확정** — 자산의 ① 질량 특성 플레이스홀더(전 강체 관성 1e-4, COM -inf) ② 구동 조인트 위치 스프링(stiffness 10 → PhysX kp 572.96) 두 가지이며 **둘 다 풀어야 한다.** 인과 격리 실험으로 확인 — 둘 다 교정 시 지령 추종 오차 1.2 %, 계약 경로 선회 성립(IG-001 2e). 조치는 자산 쪽이고 실제 제원이 필요해 기구팀 확인 대기. P5 는 여전히 완료 아님 |
| 1.36 | 2026-08-21 | **D-24 등재 — 정식 플랜트가 달 환경이 아니다.** 중력이 USD 센티널이라 PhysX 가 지구 9.81 을 쓰고(실측), 휠 마찰 재질은 어느 콜라이더에도 바인딩돼 있지 않으며, 지면은 월면토가 아닌 무한 평면이다. 중력만 달로 바꿔도 직진 속도가 62 % 변한다. **중력·마찰은 D-23 고착의 원인이 아님을 실험으로 배제**했다. 아울러 그라우저 휠·월면토 특성상 `ω·r` 기준 슬립 계산이 무효임을 명시 — 이 단계 주행 수치는 IG-002 입력으로 쓰지 않는다(IG-001 2e) |
| 1.37 | 2026-08-21 | **D-23 자산 반영 완료 — TP-IG 전 항목 통과.** NASA VIPER 공개 제원을 참조해 총질량 450 kg 을 링크별로 배분하고(이동계 33 %), 관성은 `(0,0,0)` 자동 계산으로 되돌리고, 달 중력 1.62 와 구동 stiffness 0 을 함께 반영했다(`config/isaac/final_rover_HH_physics.yaml` + `tools/isaac/apply_asset_physics.py`, 산출물 등재). 오버라이드 없이 재수행한 결과 구동 오차 0.75 % · 조향 1.6 % · `/cmd_vel` → `/odom` 0.4992/0.1993 · 워치독 정상. **P5 는 조건부 완료** — 제원이 VIPER 참조 추정치이고 지형·마찰(D-24 ②③)이 미반영이다 |
| 1.38 | 2026-08-21 | **월면토 지형 전환(D-24 ③)** — 무한 평면에서 **OmniLRS lunaryard** 로 옮겼다. 자산의 Action Graph 가 로버 바깥에 있어 OmniLRS 스폰 규약(defaultPrim 하나 아래)에 맞지 않으므로 `tools/isaac/make_omnilrs_robot_usd.py` 로 로봇 USD 를 재구성한다(D-18 배선 복사·대조 보존, 차이 0). 환경 설정 `config/isaac/lunaryard_lproject.yaml` 등재. 월면 지형 위 구동 추종 오차 약 0.1 %. **마찰(② )은 lunaryard 로도 미해결**이고 **로봇 USD 에 odometry 그래프가 없어 월면토 슬립은 미측정**이다 — P5 조건부 완료 유지 |
| 1.39 | 2026-08-21 | **지상 진실 오도메트리 신설 · 월면토 슬립 첫 측정.** 자산에 없던 오도메트리 그래프를 `make_omnilrs_robot_usd.py` 가 husky `ROS_Odometry` 구성으로 만들어 넣고, `/rover/odom_gt` 로 낸다(`/odom` 은 조인트 역산이라 슬립이 정의상 0 이므로 쓰지 않는다). `tools/isaac/measure_slip.py` 등재. 월면토 평탄 정상상태 **슬립 49.1 %**(무한 평면 31.2 % 대비), ω≥2 에서는 지형에 걸려 80 % 이상. **설계 입력으로는 아직 쓰지 않는다** — 마찰이 월면토 계수가 아니고(D-24 ②) 지형 변형이 꺼져 있으며 제원이 VIPER 참조 추정치다 |
| 1.40 | 2026-08-22 | **Jetson 실기 배포 첫 수행 — 결함 5건과 안전 공백 1건.** ROS 설치된 Jetson 에서 시작해 조이패드 조종까지 명령 경로 전 구간을 세웠다. 다섯 결함은 **회귀 8종이 계속 통과하는 상태에서** 나왔다 — 전부 개발 PC 가 우연히 만족시키던 환경·하드웨어 전제였다: 스크립트 22개 실행 비트 누락(CIFS 라 개발 측에서 안 보임) · `set -u` 와 ROS `setup.bash` 충돌 · 선택 의존성(pip3)이 배포 전체를 중단 · **펌웨어 발행 주기 오차**(status 1.536 Hz / joint_states 약 38 Hz — `vTaskDelay` 를 `xTaskDelayUntil` 로) · **조이패드 런치가 패드를 열 수 없었음**(경로를 `device_name` 에 전달). 안전 공백은 **B6/SRS-FR-076** — 패드 링크 두절이 정지로 연결되지 않는다. 산출물 등재: `BRINGUP.md`, `check_teleop_kinematics.py`. 문서: DP-001 v1.2, OP-002 v1.2, SRS v1.12 |
| 1.41 | 2026-08-22 | **HILS 폐루프 성립 — `rover_control → 보드 → Isaac → 보드 → rover_state` 를 값까지 확인.** 막고 있던 것은 두 층이었다. ① 보드의 `/rover/joint_states` 가 **한 번도 발행에 성공한 적이 없었다**(D-25) — XRCE MTU 512 에 약 684 B 메시지. `libmicroros.a` 를 MTU 1024 로 재빌드해 조인트명 계약을 지켰고, 재플래시 후 50.005 Hz 로 처음 흘렀다. ② 보드가 **EPOS(CAN) 백엔드로 부팅**해 CAN 에 아무것도 없는 동안 구동이 성립하지 않았다 — `/rover/drive_mode` 토픽 전환을 신설했다(SRS FR-078). **정상상태 8축 일치**(구동 `+2.318~+2.346` 대 Isaac `+2.319~+2.346`), `/odom` vx +0.465(지령 0.5). 신규 결함: **D-29** 순차 `--once` 점검이 없는 결함을 만들어냄 — `tools/check_hils_loop.py` 로 동시 샘플링. 문서: SRS v1.13, ND-001 v1.2, RR-001 v1.14, `BRINGUP.md` |
| 1.42 | 2026-08-22 | **D-28(조이 우선권) 철회 — 결함이 아니었다.** `rover_teleop` 은 Start 버튼(`button_release`=7)에서 우선권을 반납하고 `/cmd_vel_joy` 발행을 멈추며, 그러면 `/cmd_vel` 이 다시 통한다(실측: `/rover/axes_cmd` 2.347). 등재 근거였던 "영구 차단" 은 **문서에 있는 반납 조작을 수행하지 않고** 측정한 결과이며, `/cmd_vel_joy` 발행 노드도 `teleop_twist_joy` 로 잘못 지목한 것이었다. **D-29 와 같은 계열의 세 번째 사례** — 제품이 아니라 점검 절차가 결함원이었다. 백로그 B7 삭제, SRS FR-077 철회(v1.14), RR-001 v1.15 |
| 1.43 | 2026-08-22 | **D-24 ② 조치 완료(월면토 마찰 명시 바인딩)와 조향 모드 신설.** 마찰: Apollo 토질 시험(내부 마찰각 대표 42°, 그라우저는 토양 내부 전단) 근거로 static 0.90 / dynamic 0.70 을 휠·지형에 바인딩했다 — `config/isaac/lunar_regolith_friction.yaml` + `tools/isaac/apply_friction.py` + `tools/isaac/run_lunaryard_lproject.py`(지형은 절차 생성이라 런타임 바인딩, 메시가 아니라 부모 Xform 에). **그런데 A/B 결과 슬립이 소수점까지 같았다**(0.50/0.50 대 0.90/0.70 모두 49.0/49.1 %) — 이 슬립은 견인 한계로 생긴 것이 아니며 **D-31 로 미해결 등재**했다. 그 A/B 를 하려다 **D-30** 을 찾았다 — 보드가 sim 모드에서 `/sim/axes_cmd` 에 0 을 50 Hz 로 계속 쏘아 측정 지령과 섞이고, 평균만 보면 그럴듯한 슬립처럼 보인다. `measure_slip.py` 에 각속도 변동계수 판정을 넣어 그런 구간을 무효로 기각하게 했다. 조향: **동위상/역위상 모드**와 **왼쪽=방향·오른쪽=스로틀** 배치를 넣었다(SRS FR-079·080). 기구학은 그대로다 — `tools/check_steer_modes.py` 로 두 모드가 의도한 바퀴 배치를 만드는지 검증한다. 문서: SRS v1.15, RR-001 v1.16, ND-001 v1.3 |
| 1.44 | 2026-08-22 | **조향축 오프셋 반영 — 백로그 B7 완료.** 기구 도면이 없어 자산 USD 조인트 좌표에서 실측했다(스크럽 반경 0.1271 m). 기구학 3곳을 고쳤다: 조향각은 조향축에서, 휠 속도는 조향각만큼 돌아간 휠 접지점에서, 역기구학은 일반 최소자승으로. **에뮬레이터 GUI 자세 적분 사본도 같이 고쳤다** — 안 고치면 GUI 궤적만 조용히 어긋난다. 회귀를 배포 구성(오프셋 포함)으로 돌리도록 바꾸고 K2b(오프셋 전용 6항목)를 신설했다 — **49 PASS / 0 FAIL**. 하류 기대값(TP-002·ND-001·BRINGUP·test_isaac_bridge)을 함께 갱신했고, 과거 측정 기록은 고치지 않고 주석만 달았다. 문서: SRS v1.16, RR-001 v1.17 |
| 1.45 | 2026-08-22 | **선회 포락선 신설(SRS FR-081) — 백로그 B8 완료.** 참조 코드 식을 그대로 쓰지 않고 우리 구속에서 다시 유도했다. 축별 클램프보다 **먼저** twist 를 줄여 강체 정합을 지킨다 — 클램프는 휠마다 따로 잘라 지령과 다른 운동을 만든다. 평시 주행(0.5 m/s · 0.8 rad/s)은 걸리지 않고, 터보(1.0 m/s)에서 wz 1.6 → 0.55 로 잘린다. 제자리 회전은 막지 않는다. 회귀 **58 PASS / 0 FAIL**(K7 신설 9항목). 무게중심 높이 0.3153 m 를 자산 질량 분포에서 실측해 SRS 6장에 등재했다. 문서: SRS v1.17, ND-001 v1.4 |
| 1.46 | 2026-08-22 | **에뮬레이터 GUI 에 ROS 토픽 수신 감시 신설, 모니터 모드 결함 2건 수정.** GUI 에 **ROS Topics** 탭을 추가해 계약 토픽의 수신 주기·경과·값을 본다 — 흐르는 토픽과 "목록에만 있는" 토픽을 색으로 구분한다. **GUI 는 rclpy 를 쓸 수 없다**(PySide6 는 conda 3.13, rclpy 는 시스템 3.10 전용) — `tools/ros_topic_probe.py` 가 ROS 를 맡고 UDP 로 GUI 에 넘긴다. 프로브가 없어도 GUI 는 정상이다. 함께 수정한 결함: ① `mainHeadless()` 가 `--mode` 를 무시해 `--headless --mode monitor` 가 **에뮬레이터로 돌아 실 버스에 프레임을 냈을 것**(GUI 경로는 정상이라 headless 만 조용히 틀려 있었다) ② Rover View heading 이 0 대신 360.0 으로 표시. 확인: vcan0 에 에뮬레이터+벤치 마스터를 올려 모니터가 명령·피드백·statusword·토크를 모두 해독하고 **송신 0 프레임**임을 실측, 실제 창으로 세 탭 렌더 확인. 회귀 20 PASS / 0 FAIL. 문서: ND-001 v1.5, BRINGUP.md |
| 1.47 | 2026-08-22 | **ROS Topics 탭에 추세 그래프 추가 — Motors 탭과 같은 방식으로 본다.** 확인해 보니 v1.46 의 ROS 탭은 **표뿐이었다.** 표는 "지금 몇 Hz"만 알려주고 **언제 끊겼는지·어떻게 흔들리는지는 못 보여준다** — 이번 세션에서 스틱-슬립을 평균값만 보고 놓쳤던 것과 같은 사각이다. `TopicTrend` 위젯을 붙여 위쪽에 **수신 주기[Hz]**, 아래쪽에 **값 4계열**을 그린다. 표에서 행을 고르면 그 토픽이, 안 고르면 실제로 흐르는 첫 토픽이 그려진다. 프로브가 `nums`(숫자 최대 4개)를 같이 싣고, **이력은 GUI(`lib/ros_monitor.py`)가 토픽별 300 표본으로 보관**한다 — 프로브가 이력까지 실으면 데이터그램이 커지고 GUI 재기동 시 어차피 비어야 한다. 실측: `/rover/axes_cmd` 20 Hz 주기 곡선과 값 4계열 렌더 확인. 회귀 20 PASS / 0 FAIL. 문서: ND-001 v1.6 |
| 1.48 | 2026-08-22 | **`BRINGUP.md` 를 머신별 절차로 재편.** 종전에는 Jetson 중심 흐름 하나에 시뮬 PC 항목이 섞여 있어 **어느 머신에서 무엇을 실행하는지가 문서 구조로 드러나지 않았다.** 머신마다 절을 하나씩 두고(B Jetson · C 보드 · D 시뮬 PC), 앞에 **구성표와 의존 순서**를, 뒤에 **세 머신을 묶어 확인하는 절(E)** 을 두었다. 신설: **B1 갱신 절차**(git pull + 재빌드, `--symlink-install` 금지 이유, **재기동 전에는 옛 코드가 돈다**는 점, 기대값으로 반영 여부 검산) · **A 공통 절**(DDS 환경, 시뮬 PC 인터프리터 분리). IG-001 2f 에는 **마찰 바인딩 러너의 docker 실행 전문**과 `friction_verified` 로 확인하는 방법을 채웠다 — BRINGUP 은 그쪽을 가리키기만 한다(마운트를 옮겨 적으면 낡는다) |
| 1.49 | 2026-08-22 | **GUI 화면 원천을 CAN/ROS 선택식으로.** 보드를 sim 백엔드로 두면 CAN 이 비어 Motors 탭이 전부 `No data` 가 된다 — 고장이 아니라 **보드가 CAN 을 안 쓰고 ROS 로 Isaac 과 주고받기** 때문이고, 게다가 보드 CAN 버스는 어댑터가 없어 시뮬 PC 에서 보이지도 않는다. 상단 `View` 로 원천을 고르면 같은 12축을 ROS 로 볼 수 있다(`/rover/axes_cmd`·`/rover/joint_states`·`/rover/status`). **NMT 칸은 `-` 로 남긴다** — CANopen 계층이라 ROS 에 없는 정보를 0 이나 Online 으로 채우지 않는다. 환산 상수는 `emu_core` 의 `GEAR_RATIO`·`CNT_PER_RAD` 를 그대로 쓴다(다시 적으면 CAN 화면과 ROS 화면이 조용히 갈린다). 실측: 조향 4축 ±19°/±9° 가 ROS 원천으로 그대로 보였다. 회귀 20 PASS / 0 FAIL. 문서: ND-001 v1.7, BRINGUP.md |
| 1.50 | 2026-08-23 | **백로그 B3 의 제원 갱신 지점 목록 정정 (RR-001 D-33).** "600 rpm 이면 13 m/s 아니냐" 는 질문을 확인하다 드러났다 — 그 값은 감속비를 빼고 계산한 것이고(15:1 반영 시 0.89 m/s), 확인 과정에서 **B3 이 지목한 갱신 지점 4곳 중 둘은 감속비를 갖고 있지 않고 실제 두 곳은 목록에 없다**는 것을 발견했다. 그대로 기구 제원을 반영하면 펌웨어와 에뮬레이터가 서로 다른 감속비로 도는 상태가 된다. 목록을 실제 3곳으로 정정하고 정본(`drive.h`)을 명시했으며, `epos-rover-emulator.py` 의 중복 상수를 제거했다. **감속비 15.0 은 여전히 가정값**이다 |
| 1.51 | 2026-08-23 | **제원을 정식 자산 실측으로 갱신 (RR-001 D-34).** 주요 치수를 물어 대조하다 **기구학이 쓰지 않는 자산(구 viper_v4)의 치수로 돌고 있었다**는 것이 드러났다 — 플랜트를 `final_rover_HH` 로 교체(08-20)하면서 재측정이 누락됐다. 윤거 1.26 → **1.2867**(+2.1 %), 축거 1.50 → **1.4910**, 휠 반경 → **0.2133**. 갱신 지점은 **검색으로 찾아** 5개 파일 6블록을 동시에 고쳤다(D-33 교훈). SRS 6장에 **주요 치수표를 신설**했다 — 전장·전폭·전고·지상고·서스펜션 암 길이까지 한 표에 모았다(종전에는 세 파일에 흩어져 있었다). 회귀 58 PASS / 0 FAIL. **펌웨어 재플래시 필요.** 문서: SRS v1.18, RR-001 v1.19, ND-001·TP-002·IG-001·BRINGUP 기대값 |
| 1.52 | 2026-08-24 | **12축 URDF 신설 — 자산에서 생성한다 (SRS FR-082).** 기존 `tools/isaac/rover.urdf` 는 **레거시 8륜 스키드스티어**(휠 반경 0.1 m·트랙 0.6 m)로 현행 계약과 무관했다. `tools/isaac/make_rover_urdf.py` 가 정식 자산에서 뽑아 만든다 — **손으로 관리하면 자산 교체 시 조용히 낡는다**(D-34 가 그 사례다). 산출물 `config/description/lproject_rover.urdf`(링크 22·조인트 21). **서스펜션 4절 링크는 URDF(트리)로 표현할 수 없어** 루프를 끊었고 그 한계를 파일과 생성기에 명시했다. 검증 2단: `check_urdf`(파싱) + **`tools/test_urdf_contract.py`**(계약 정합 — 조인트명·영점 기하·축 한계·루프 부재). 만들면서 **D-35**(서스 클램프가 자산 한계보다 50 % 넓음)를 찾아 고쳤다. 생성기 자체 결함도 하나 잡았다 — **USD 는 행벡터 규약**이라 회전행렬을 전치해 읽어야 하는데 빼먹어 킹핀 10° 아래 좌표가 1.6 cm 어긋났다 |
| 1.53 | 2026-08-25 | **지형 변형 엔진 정밀 분석(`DEFORMATION.md` 신설)과 OmniLRS 버전 고정 체계.** 조향 시 참조점 처리를 묻는 질문에서 시작해 엔진을 우리 설정으로 재현했다 — 참조점은 **휠 링크 월드 원점(x,y)**이고 방향은 **쿼터니언 yaw 하나**라 조향은 반영되나 z·roll·pitch 는 버린다. **결정적 발견: 현행 설정으로 켜면 변형이 정확히 0 이고 오류도 나지 않는다** — 발자국 폭 0.09 m 가 격자 두 칸(0.10 m)보다 좁아 경계 분포가 전부 0 이 된다. 폭을 실제 휠 폭 0.159 m 로 고치면 발생하지만 이번엔 침하가 **휠 반경의 44 %** 로 비현실적이고 회귀 계수 출처가 없다(D-31 과 같은 구조). **당분간 `enable: False` 유지**를 권고했다 — 켜면 DEM 이 매 통과마다 바뀌어 D-31 조사의 회차 간 비교가 깨진다. 재현 도구 `tools/isaac/analyze_deformation.py`. **OmniLRS 소스 결함 2건**(`y_deform_offset` 이 x 값을 받음, `delay` 단위 변환이 곱셈)을 찾아 패치로 만들었다. OmniLRS 를 저장소에 통째로 넣는 것은 **git-lfs 6.1 GB** 라 불가해, `third_party/omnilrs/` 에 **고정 커밋 + 오버레이 + 패치 + 설치/검사 스크립트**(합 28 KB)로 관리한다 |
| 1.54 | 2026-08-25 | **그라우저 수 실측 — 24개, 변형 엔진 `wave_frequency` 가 틀렸음을 확인.** 휠 메시(SubUSDs/Rover_hyundai_base.usd, 정점 453만)에서 방위각 히스토그램의 **이산 푸리에 변환**으로 셌다 — 봉우리 세기는 문턱값에 좌우되므로 지배 주파수를 본다. 반경 문턱 98/95/92 % 에서 모두 24, 2등 후보 48 은 배음. **그라우저 24개 · 높이 19.1 mm**(VIPER 참조는 24개 × 26 mm — 개수 일치, 높이는 우리가 낮다). 설정값 4.14 는 그라우저 **13개**에 해당해 틀렸고, 주석의 `num_grouser/pi` 공식도 **접지 길이가 휠 지름과 같을 때만** 성립한다(OmniLRS 기본 휠은 우연히 그랬다). 일반식 `L·N/(2πR)` 로 우리 값은 **3.58** 이다. 도구 `tools/isaac/count_grousers.py`. 문서: `DEFORMATION.md` §4a |
| 1.55 | 2026-08-25 | **수정 검토에서 D-36 발견 — D-34·D-35 가 실배포에 반영되지 않고 있었다.** 갱신 지점을 `grep` 으로 찾고 **결과를 `head` 로 자른 뒤 전수로 믿은** 것이 원인이다. 특히 `rover_params.yaml` 의 `sus_limit` 이 옛 값이라 **노드는 여전히 ±30° 로 클램프**하고 있었다 — axes.py 는 기본값일 뿐 실행 시에는 YAML 이 이긴다. **사람이 갱신 지점 목록을 관리하는 방식은 D-33·D-34·D-36 으로 세 번 실패했으므로** 회귀 **K8「제원·한계 계층 간 일치」**를 신설해 다섯 계층을 파일에서 직접 읽어 대조한다. 신설 즉시 `steer_offset` 파라미터 누락을 잡아냈다. 회귀 **74 PASS / 0 FAIL** |
| 1.46 | 2026-08-22 | **Jetson 실기 브링업 절차를 5.4 절로 요약 등재**하고 2.1 도구표에 Navigation 머신(Orin 계열 + JetPack 6.x)을 추가했다. 배포 절차가 DP-001·`BRINGUP.md` 에만 있어 SDP 5 장 운영 절차에는 실물 로버 명령 두 줄뿐이었다. 저장소는 **git clone 으로 내려받는다**(NAS 마운트는 CIFS 심링크 미지원으로 `~/hils_ws/src` 구조가 깨진다), 워크스페이스가 개발 PC 와 다르다(`~/hils_ws`), Nav2 는 별도 apt 설치라는 세 가지를 명시했다. 플랫폼 요건은 SRS v1.18 6 장에 등재 |

---

## 1. 프로젝트 개요

### 1.1 목표

12축 로버(4륜 독립조향 + 액티브 서스펜션, v3 계약 — AN-001)의 Navigation-구동계 폐루프를
HILS로 구축한다. 실물 모터드라이버(EPOS4 ×12) 없이도 CANopen 소프트웨어 계약과 제어 로직을
사전 검증할 수 있는 플랜트 에뮬레이터를 제공한다. 전기적·실시간 호환성, PPM 핸드셰이크와
안전 기능은 보드·실물 도입 후 별도 검증한다.

### 1.2 개발 산출물

| 산출물 | 위치 | 상태 |
|---|---|---|
| ROS2 구동 제어 패키지 `hils_rover_control` | 본 저장소 | 완료 (v0.1.0) |
| ROS2 지그 브리지 `hils_bridge` | 본 저장소 | 완료 (v0.1.0) |
| EPOS4 로버 에뮬레이터/모니터 GUI | 본 저장소 `tools/epos_rover_emulator/` | 완료 |
| 로버 제어 펌웨어 `hils-rover-fw` | `l-project-hils/firmware/` (NAS) | 빌드 검증 완료, 실기 시험 대기 |
| 지그 펌웨어/부트로더 `hils-fw`, `hils-boot` | `l-project-hils/firmware/` (NAS) | 기존 자산 (리네이밍 완료) |
| 테스트 인프라 (vcan systemd, SIL/통합 테스트) | 본 저장소 `tools/` | 완료 |
| 문서 일체 (SRS·SDP·AD-002·TP-001/002·DP-001/002·IG-001/002/003·AN-001·RR-001·OP-001·SG-001·PG-001·ND-001·OP-002) | 본 저장소 `docs/` | 유지 관리 중 |
| 공유 안내서 `SG-001` (현대차 L-Project팀 대상) | 본 저장소 `docs/` | 완료 |
| 홈페이지 공개 운영 안내 `PG-001` | 본 저장소 `docs/` | 완료 |
| 노드·데이터 명세 `ND-001` (파라미터·토픽·필드별 의미) | 본 저장소 `docs/` | 완료 |
| 조이패드 원격 조종 `OP-002` + `teleop_remote.launch.py` | `docs/`, `hils_rover_control/launch/` | 완료 |
| 배포 도구 (Jetson·시뮬 PC 설치 스크립트/systemd) | `tools/jetson/`, `tools/simpc/` | 완료 |
| 시뮬레이터 대역 `sim_plant.py` · DDS 설정 | `tools/`, `config/dds/` | 완료 (검증됨) |
| Isaac Sim 연동 준비 (12축 어댑터·**final_rover_HH USD(정식)**·플랜트 프로파일·OmniLRS 도커 절차·주행 시험 절차 2d, IG-001) | `tools/isaac/`, `config/isaac/`, `docs/` | 완료 (브리지 재정렬·split 분할 검증 20항목. 구 8륜 URDF와 viper_v4 는 레거시) |
| Nav2 통합 준비 (파라미터·런치·가이드 IG-002) | `hils_rover_control/config/nav2/`, `docs/` | 완료 (빌드·문법 검증) |
| NVIDIA Isaac ROS Navigation 가이드 (IG-003) | `docs/` | 완료 — **N4는 NVIDIA 경로·카메라 D455 확정**, 발주 대기 |
| `rover_mcu` (micro-ROS/XRCE-DDS 펌웨어 노드) | CSCI-6 확장 | 완료 (A1~A4) |
| `rover_state` 노드 · `/rover/*` 토픽 개편 | `hils_rover_control/` | 완료 (A5) |
| `health_monitor` 노드 (`/diagnostics` 헬스 모니터링) | `hils_rover_control/` | 완료 (sim 폐루프 + real 모드 SIL 검증) |
| `rover_teleop` 노드 (조이스틱 수동 주행) + `tools/test_teleop.py` | `hils_rover_control/`, `tools/` | 완료 (합성 /joy 자동 시험 5 PASS) |
| 서스펜션 운용 도구 `suspension_cmd.py` + 정책 OP-001 | `tools/`, `docs/` | 완료 (B5 1단계) |
| 보드 대역 노드 `mcu_stub.py` + TP-002 자동 리허설 `test_tp002_rehearsal.py` | `tools/` | 완료 (15항목 통과, 펌웨어 검증은 범위 밖) |
| 통합 회귀 러너 `run_all_tests.sh` | `tools/` | 완료 (7종 일괄, 전체 통과) |
| Isaac 연동 사전 검증 `isaac_stub.py` + `test_isaac_bridge.py` | `tools/isaac/`, `tools/` | 완료 (15항목 — IG-001 2c절) |
| OmniLRS 로봇 USD 재구성 `make_omnilrs_robot_usd.py` | `tools/isaac/` | 완료 — 그래프를 복사·재배치하고 원본과 대조 검산 (IG-001 2f절) |
| lunaryard 환경 설정 `lunaryard_lproject.yaml` | `config/isaac/` | 완료 — 월면토 지형(80 m 야드) 위 12축 주행 (IG-001 2f절) |
| 슬립 측정 `measure_slip.py` | `tools/isaac/` | 완료 — 지상 진실 `/rover/odom_gt` 대 휠 회전, 낙하 검출 포함 (IG-001 2f절) |
| GUI 스크린샷 캡처 `capture_screens.py` | `tools/epos_rover_emulator/` | 완료 — 실제 GUI 를 offscreen 으로 캡처, 문서 이미지 갱신용 |
| 구동 가이드 `BRINGUP.md` | 저장소 루트 | 완료 (2026-08-22) — 전원 인가에서 조이패드 조종까지 **실기에서 통과한 순서**. `docs/` 는 17종 고정이라 루트에 둔다 |
| 조종 기구학 대조 `check_teleop_kinematics.py` | `tools/` | 완료 (2026-08-22) — `/cmd_vel_joy` 대 `/rover/axes_cmd` 를 **독립 구현한 역기구학**으로 대조. `kinematics.py` 를 쓰지 않아 구현 오류가 상쇄되지 않는다 |
| 자산 물리 특성 정의 `final_rover_HH_physics.yaml` | `config/isaac/` | 완료 — 질량·관성·중력·구동 드라이브. **VIPER 참조 추정치**이며 기구팀 실측 대체 대상 (IG-001 2e절) |
| 자산 물리 특성 적용 도구 `apply_asset_physics.py` | `tools/isaac/` | 완료 — 기본 dry-run, `--write` 시 `.bak-<타임스탬프>` 자동 백업. 제원이 바뀌면 yaml 만 고쳐 재실행한다 |
| Nav2 스모크 시험 `test_nav2_smoke.py` | `tools/` | 완료 (10항목 통과, IG-002 4절 자동화) |

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
| Navigation 머신 | NVIDIA Jetson Orin 계열 | JetPack 6.x = Ubuntu 22.04 (Humble 네이티브 전제 — SRS 6장) |
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
공개 범위·갱신 절차·작성 규칙·게시 후 검증은 **LPJ-HILS-PG-001**에 정리했다.

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
| P4. 3중 구현 | PC 벤치 마스터 / STM32 펌웨어 / GUI 에뮬레이터 (EPOS4 사양 기반) | 각 단위시험 |
| P5. SIL 검증 | PC 벤치 마스터 ↔ 에뮬레이터 in-process 검증 (ALL PASS) | `test_sil_master.py` |
| P6. 통합 검증 | 프로세스 분리 + vcan0 실 CAN 스택 검증 (ALL PASS) | 통합 시험 |
| P7. 운영 도구화 | 게이지/그래프 GUI, Monitor 모드, vcan systemd 영구화 | 시연 |

### 3.2 향후 단계 — 실기 전환 (N) + 아키텍처 v2 이행 (A)

| 단계 | 내용 | 선행 조건 |
|---|---|---|
| N1. 실기 파라미터 확정 | 휠 반경/트랙/감속비/정격토크 실측 반영 | 기구 제원 확정 |
| N2. 펌웨어-에뮬레이터 CAN 시험 | **프로토콜 대역 시험**: 보드 FDCAN ↔ **PCAN-USB** ↔ PC 에뮬레이터(socketcan) — 실물 전기·타이밍 검증은 포함하지 않음. 준비물·배선은 TP-001 v1.3, 점검은 `tools/check_can_ready.sh` | PCAN-USB 발주(2026-08-13), **보드 CAN 트랜시버 유무 확인 필요** |
| N3. EPOS Studio 튜닝 | (보류 — 실물 미구매) 실물 도입 시에만 수행 | 실물 도입 결정 |
| A1. micro-ROS 골격 | 펌웨어 FreeRTOS + `rover_mcu` 노드 (시리얼 전송) | — |
| A2. W5300 UDP 전송 (완료 2026-07-30) | XRCE UDP 전송(소켓3, 에이전트 :8888), 시리얼 폴백 유지, 보드 IP .30 기본화 | A1 |
| A3. Drive Interface (완료 2026-07-30) | 추상 계층 + drv_epos 래핑 + drv_sim 루프백 스텁 — 소비자 전부 drive API 경유 | A1 |
| A4. drv_sim 백엔드 (완료 2026-07-30) | micro-ROS /sim/* 연동, 피드백 신선도 안전, 루프백 폴백 유지 | A3 |
| A5. Jetson 노드 개편 (완료 2026-07-30) | `rover_control` `/rover/*` 전환, `rover_state` 신설. 당시 mcu/can/sim 시험 기록은 v2 이력이며, v3에서 PC 직결 CAN 제거 — 현행 real 경로는 MCU 단일 | A1 |
| A6. 3머신 통합 시험 | Jetson+시뮬 PC+보드, real/sim 양 모드. **IT-1~IT-3은 P1으로 예행 완료**(보드 대역 노드) — 실제 구성으로 IT-0부터 재수행 | A2~A5, N2 |
| N4. Navigation 통합 (**NVIDIA 확정**) | Isaac ROS(cuVSLAM·nvblox)+Nav2 — IG-002/IG-003 절차(D455 확정). **Nav2 무맵 1단계는 P4로 검증 완료** | A6, D455 발주 |
| N5. 안전 기능 보강 | STO 배선, EMCY 정책, RPDO 타임아웃(0x8250) 설정 | N2 |

### 3.2a 12축 개정 백로그 (2026-07-30)

| # | 항목 | 비고 |
|---|---|---|
| B1 | EPOS4 에뮬레이터 12노드·PPM 지원 | **완료 (2026-07-31)** — 12노드 기본, PPM 세트포인트 핸드셰이크, 4WS 자세 적분, SIL 복원 (test_emulator 20 PASS / test_sil_master ALL PASS) |
| B2 | TP-001/TP-002 기대값·절차 개정 | **완료 (2026-07-31)** — TP-001 v1.1(epos_bench 도구화, TS-8 PPM 벤치, 12대 확장), TP-002 v1.1(axes_cmd[12], 4WS 기대값 기구학 교차검증, 서스 명령·조향 유지 워치독) |
| B3 | 조향/서스 기어비·카운트 상수 확정 | 실물 미구매로 실측 불가 — 기구 설계 제원 확정 시 갱신한다. **갱신 지점 목록을 2026-08-23 에 정정했다**(RR-001 D-33) — 종전 목록은 `axes.py`·`rover_params.yaml` 을 지목했으나 **둘 다 감속비를 갖고 있지 않고**(ROS 계층은 휠 rad/s 로만 다룬다), 실제로 값을 가진 두 곳이 목록에서 빠져 있었다. 현행 지점: **① `firmware/.../drive/drive.h` 의 `DRIVE_GEAR_RATIO`(계약 정본, 현재 가정 15.0) ② `tools/epos_rover_emulator/lib/emu_core.py` 의 `GEAR_RATIO` ③ `tools/check_hils_loop.py`(양자화 폭 계산용)**. `epos-rover-emulator.py` 의 중복 `DEMO_GEAR_RATIO` 는 같은 정정에서 제거해 emu_core 것을 쓰게 했다 상수로 정합 유지. yaml을 빠뜨리면 코드만 바뀌고 실행 노드는 옛 값으로 돈다(D-17) |
| B4 | PPM 핸드셰이크 검증 | **PC 벤치 마스터↔에뮬레이터 소프트웨어 시험 완료 (2026-07-31)** — test_master_12axis에서 8축 ack/target-reached 확인. STM32 `epos.cpp`와 실물 EPOS4 조합은 미검증이며 N2·실물 도입 시 재시험 |
| B5 | 서스펜션 제어 정책 정의 | **1단계 완료 (2026-07-31, OP-001)** — 운영자 프리셋(level/lift/drop/manual) CLI `tools/suspension_cmd.py`, 정지 중 즉시 반영, 한계 이중 클램프. 2단계(지형 적응 자동화)는 실기 데이터 확보 후 |
| B6 | **패드 링크 두절 감지 → 구동축 정지 (SRS-FR-076)** | **미착수 — 안전 공백.** 패드가 절전에 들어가거나 무선이 끊겨도 `joy_node` 의 `autorepeat_rate`(20 Hz) 때문에 `/cmd_vel_joy` 가 계속 흘러 FR-005 워치독이 걸리지 않는다. 데드맨을 쥔 채 끊기면 마지막 주행 명령이 무한 반복된다. `autorepeat_rate` 는 링크 지연 대비로 의도한 값이라 끄는 것이 답이 아니고, **링크 생존을 명령 흐름과 별개 신호로** 판정해야 한다(`/joy` 타임스탬프 정체 감시, joy 장치 파일 존재 확인 등). **실물·에뮬레이터 연결 전에 닫아야 한다** — 그때까지는 OP-002 2.4 운용 규칙으로만 막고 있다 |
| B7 | **조향축 오프셋(WHEELOFFSET) 보정** | **완료 (2026-08-22).** 기구 도면이 없어 `final_rover_HH` 자산의 조인트 좌표에서 실측했다 — **스크럽 반경 0.1271 m**(캐스터 트레일 0, 킹핀 경사 10.0°). 참조 코드의 0.1125 m 는 다른 차량 값이다. `FourWheelSteering` 이 조향각을 조향축에서 정하고 휠 속도를 옮겨진 접지점에서 다시 구하도록 고쳤고, 역기구학도 배치 대칭 전제를 버리고 일반 최소자승으로 바꿨다(오프셋이 들어가면 sum(py)≠0 이다). 에뮬레이터 GUI 의 자세 적분 사본도 같이 고쳤다. 참조 코드의 **선회 포락선 제한**(`Vr ≤ 0.339·Vl + 0.0205`)은 여전히 없다 — 그 계수는 참조 차량 것이라 우리 값이 따로 필요하다(B8) |
| B8 | **선회 포락선 우리 값 산정** | **완료 (2026-08-22).** 참조 코드의 `Vr ≤ 0.339·Vl + 0.0205` 는 조향각이 제한된 애커먼 차량의 **최소 선회반경**(2.95 m)에서 나온 식이라 속도에 **비례해 커진다**. 우리는 조향 ±90°(자산 실측)라 최소 선회반경이 없어 그 식이 성립하지 않는다 — 포락선이 속도에 따라 **좁아진다**. 구속을 다시 유도했다: ① 휠 각속도 한계(저속 구속, 제자리 회전 2.07 rad/s) ② 횡가속 한계 0.55 m/s²(중속 구속) — 전도 3.24 m/s²(CG 높이 0.3153 m 실측)보다 **견인 1.134 m/s² 가 엄격**해 그 절반을 횡방향에 배분했다. `SRS-FR-081`, `tools/check_turn_envelope.py`, 회귀 K7 |

### 3.2b 하드웨어 대기 중 사전 준비 (P) — 2026-08-04

보드·Jetson·허브·실물 드라이버가 없는 동안 **하드웨어 없이 앞당길 수 있는 검증**을 먼저 수행해,
입고 후 남는 위험을 좁힌다. 각 항목의 검증 범위 한계는 해당 절차서에 명시한다.

| # | 항목 | 상태 |
|---|---|---|
| P1 | TP-002 사전 리허설 | **완료** — 보드 대역 노드 `mcu_stub.py`로 IT-1~IT-3 예행, 15항목 통과 (TP-002 v1.3 0a절). 펌웨어·XRCE·FDCAN은 범위 밖 |
| P2 | micro_ros_agent 사전 검증 | **완료** — 빌드·UDP :8888 바인딩·XRCE 세션 확립과 객체 생성 체인 확인 (DP-001 4.2절). conda 파이썬 빌드 함정 기록 |
| P3 | 통합 회귀 러너 | **완료** — `tools/run_all_tests.sh` 7종 일괄(P5 편입으로 확장), 4.1절 자동화 항목 해소 |
| P4 | Nav2 스모크 | **완료** — IG-002 4절 자동화·실행 10항목 통과. `inflation_radius`(0.55) < 내접원(0.76) 결함 발견·수정 |
| P5 | Isaac Sim 12축 연동 검증 | **조건부 완료(2026-08-21)** — 드라이버 다운그레이드로 실행 차단이 풀린 뒤 TP-IG-1~6 을 두 회차 수행했다. 1회차에서 실행으로만 드러나는 결함 5건(D-20~D-24)을 잡았고, 그중 브리지 QoS(D-21)와 자산 물리 특성(D-23)·중력(D-24 ①)을 수정한 뒤 **2회차에서 전 항목이 통과했다** — 구동 추종 오차 0.75 %, 조향 1.6 %, 서스펜션 좌우 편차 ±8 %, `/cmd_vel` 0.5·0.2 → `/odom` 0.4992·0.1993, 명령 두절 시 워치독 정상(SRS-FR-005). **완료로 단정하지 않는 이유**: 자산 제원이 NASA VIPER 참조 **추정치**이고(기구팀 실측 대체 대상), 지면이 월면토가 아닌 무한 평면이며 마찰 재질이 미바인딩이다(D-24 ②③). 따라서 **이 플랜트의 주행·슬립 수치는 IG-002 Nav2 파라미터 입력으로 쓰지 않는다.** 상세는 IG-001 2b·2d·2e, 결함은 RR-001 R6 |

P1~P4로 A6·N4의 소프트웨어 측 위험은 상당 부분 제거되었다. 남은 것은 **하드웨어가 있어야만
확인 가능한 것들**(펌웨어 실기 동작, XRCE 실 전송, CAN 전기·타이밍, 센서 인지)이다.

### 3.3 위험 관리

| 위험 | 영향 | 대응 |
|---|---|---|
| 로버 제원 가정값과 실측 불일치 | 주행 오차 | 파라미터 일원화 — 변경점 **4곳**(axes.py/`rover_params.yaml`/drive.h/emu_core.py)으로 국한. 런치가 적재하는 yaml이 코드 기본값을 덮으므로 반드시 함께 갱신(D-17) |
| EPOS4 단위계 설정 상이(0x60A9 등) | 속도 스케일 오류 | 시동 시 0x6061 검증, 필요 시 SI unit 확인 로직 추가 |
| CAN 버스 부하 (12노드 PDO) | 지연 | 1Mbit/s + inhibit time, 실측 부하 분석 예정 |
| NAS 저장소 이중 마운트/권한 문제 재발 | 개발 중단 | fstab 자격증명 수정, 마운트 점검 절차 문서화 |
| W5300 XRCE 커스텀 전송 개발 난이도 | A2 지연 | A1(시리얼)로 기능 선완성 후 전송만 교체 |
| 머신 간 RMW 혼용/발견 실패 | 통신 두절 | 전 머신 RMW·도메인 통일, 설정 파일 형상 관리 (SRS-FR-056) |
| XRCE 세션 두절 시 거동 | 폭주 위험 | 보드 로컬 타임아웃이 최종 안전선 (SRS-FR-055) |
| 에뮬레이터-실물 동작 차이 (전류/토크 물리, 튜닝, 비실시간 PC 타이밍) | 실물 도입 시 재작업 | 벤치 마스터↔에뮬레이터 내부 정합만 test_master_12axis로 회귀시험, 보드·실물 조합은 TP-001/N2로 별도 검증 |

---

## 4. 검증 전략 및 현황

### 4.1 시험 수준

| 수준 | 방법 | 자동화 |
|---|---|---|
| 단위 | 프로토콜 프레임 인코딩/디코딩 검사 | pytest 가능 (현재 스크립트) |
| 구성요소 | 에뮬레이터 자체 시험 `test_emulator.py` | 20항목 (12노드·PVM·PPM) |
| SIL | PC 벤치 마스터↔에뮬레이터 `test_sil_master.py` | 7항목 (4구동 벤치+PPM 스모크) |
| 통합 | ROS2 폐루프 — 조이스틱 텔레옵 `test_teleop.py`, TP-002 리허설 `test_tp002_rehearsal.py` | 5항목 / 15항목 |
| 회귀 | **`tools/run_all_tests.sh`** — 위 시험을 일괄 수행·요약 | 자동 7종 (약 110 s) |
| 실기 | EPOS4 실물 + Monitor 모드 계기판 | 예정 (N2) |

회귀 러너는 시험별로 갈리는 인터프리터(에뮬레이터=PySide6 conda / ROS2=시스템 python)를
자동 선택하고, 이전 시험이 남긴 노드를 정리한 뒤 실행한다 — 잔존 노드가 다음 시험 결과를
조용히 오염시킨 사례가 있었기 때문이다. 판정은 각 시험의 종료코드를 정본으로 한다.

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
| A5(v2 이력): 3경로(mcu/can/sim) 명령·피드백 (2026-07-30) | 당시 시험 통과. 현행 12축 v3 계약은 PC 직결 CAN을 포함하지 않으며 real 경로는 MCU 단일 |
| sim_plant 대역 플랜트 (2026-07-30) | 4.4/5.6 rad/s 수렴, 49.98 Hz |
| Isaac 어댑터 재정렬 (2026-07-30) | 역순 입력 → 표준 순서 복원 통과 |
| micro-ROS 포함 펌웨어 빌드 (2026-07-30) | FLASH 459 KB / 894 KB, RAM_D1 77.5% |
| 12축 ROS2 폐루프 (2026-07-30) | cmd_vel(0.5, 0.2) → 구동 1.89/3.02 rad/s·조향 ±21.9/13.5° → /odom 0.5/0.2 복원 |
| 12축 펌웨어 빌드 (2026-07-30) | FLASH 461 KB / 894 KB, RAM_D1 77.7% |
| 에뮬레이터 12노드·PPM (2026-07-31, B1) | test_emulator **20 PASS / 0 FAIL**, test_sil_master(4구동+PPM 조향 30° 수렴) **ALL PASS** |
| 헬스 모니터 (2026-07-31) | sim 폐루프 전 항목 OK(50.0Hz 판정) → sim_plant kill 3s 내 joint_states·odom ERROR·종합 degraded |
| 헬스 모니터 real 모드 SIL (2026-07-31) | 합성 /rover/status: 전 축 enabled → `rover/axes` OK, 노드3 Fault+EMCY 주입 → ERROR `fault [N3] emcy [N3:0x2310]` 정확 지목 |
| 서스펜션 정책 (2026-07-31, B5) | 정지 중 프리셋 lift 0.2 rad → axes_cmd[8..11]=0.2 즉시 발행 확인 |
| **벤치 master↔emulator 12축 소프트웨어 프로토콜 시험** (2026-07-31) | test_master_12axis **11 PASS / 0 FAIL** — 12노드 시동·PVM 4축 속도(1% 이내)·TPDO3 토크 4B·PPM 8축 위치(±1 cnt)·ack/target-reached·4WS 조향각 일치·EMCY/리셋. STM32/실물 호환성 판정은 아님 |
| **Nav2 스모크** (2026-08-04) | test_nav2_smoke **10 PASS / 0 FAIL** — 스택 기동·액션 서버·goal 수락·`/cmd_vel` 163건·12축 경로 163건·목표 오차 **0.12 m** SUCCEEDED·종료 후 워치독 정지. 이 시험에서 `inflation_radius`(0.55) < 내접원(0.76) 결함을 잡아 1.0으로 수정 |
| **micro_ros_agent 사전 검증** (2026-08-04, 개발 PC) | 빌드 통과 · UDP :8888 바인딩 · 표준 XRCE 클라이언트로 **세션 확립 + 객체 생성 체인 5종 각 1건** 성공(XRCE-DDS 2.4). 범위: 에이전트·XRCE 세션 계층까지 — ROS2 토픽 브리징·W5300 전송은 보드 연결 후 IT-0 |
| **IG-001 Isaac 연동 리허설** (2026-08-14) | **15 PASS / 0 FAIL** — USD 12축 조인트명 실재, `/sim/axes_cmd`→`/isaac/joint_command`(구동 velocity·조향 position 분리), 역순·잡조인트 섞인 피드백에서 12조인트 표준 순서 복원(60.0 Hz), 폐루프 `/odom` vx 0.500·wz 0.200, 게걸음 네 축 +90.0°, 조인트 결손 내성. **Isaac 자리는 대역 노드 — 물리·접촉·슬립·GPU·Action Graph 실배선은 범위 밖** |
| **통합 회귀 러너** (2026-08-14) | `run_all_tests.sh` **7종 전체 통과** — 에뮬레이터 20 / 12축 프로토콜 11 / SIL ALL / 텔레옵 5 / TP-002 리허설 15 / **IG-001 Isaac 리허설 15** / Nav2 스모크 10, 총 약 110 s |
| **TP-002 사전 리허설** (2026-08-04) | test_tp002_rehearsal **15 PASS / 0 FAIL** — IT-1 주기·형식(50.0/2.0 Hz, 24개), IT-2 4WS 전달·`/odom` 0.500/0.200·서스 반영, IT-3 두절 시 구동만 정지·폴트 진단·시뮬 두절 감지. **보드 자리는 Linux 대역 노드이며 펌웨어·XRCE·FDCAN은 범위 밖** |
| 조이스틱 수동 주행 (2026-08-03) | test_teleop **5 PASS / 0 FAIL** — Nav2 단독 반영 · 조이스틱 선점(2.35 vs Nav2 0.94) · crab 전 축 조향 90.0° · 데드맨 해제 시 정지 유지 · release 후 Nav2 복귀 |

### 4.3 요구사항 추적

SRS의 각 요구사항(SRS-FR/NF-xxx)은 4.2의 시험 항목 및 저장소 커밋으로 추적된다.
주요 커밋: `811aa0c`(ROS2 구조) → `e989183`(EPOS4 프로토콜 3중 구현+SIL) →
`f833878`(GUI 게이지/모니터 모드) → `0ad2519`(트렌드 그래프) → `f600f7d`(vcan 인프라) →
`9c765c7`(12축 v3 전면 개정) → `dd293d2`(B1: 에뮬레이터 12노드·PPM) → `8a37c90`(B2: TP-001/002 v1.1) →
`43d65f0`(전체 정합성 검토) → `2c2f76d`(SRS/SDP 흐름 검증) → `421f240`(RR-001 검토 보고서) →
`45b219f`(헬스 모니터링) → `d756c3e`(B5 서스펜션 정책) → `3fb5614`·`7c08ce4`(벤치 에뮬레이터 프로토콜 시험).

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

### 5.4 Jetson 실기 브링업 (Navigation 머신 — DP-001 / BRINGUP.md)

전원 인가에서 조이패드 조종까지의 **실기 통과 순서는 `BRINGUP.md`** 가 정본이다. 아래는 배치 요약이다.

```bash
# 최초 1회 - 저장소는 git 으로 내려받는다 (NAS 마운트 금지: CIFS 는 심링크 미지원)
git clone https://github.com/parclab-hsu/l-project-hils-ros2.git ~/l-project-hils-ros2
cd ~/l-project-hils-ros2/tools/jetson && ./install-jetson.sh   # ~/hils_ws 빌드 + DDS(.bashrc)
sudo ./install-jetson.sh service                               # systemd (agent 자동시작)
# 매번 - 워크스페이스가 개발 PC 와 다르다
source ~/hils_ws/install/setup.bash
ros2 launch hils_rover_control rover_control.launch.py mode:=real          # 로버 노드
ros2 launch hils_rover_control nav2_hils.launch.py mode:=real              # + Nav2 (IG-002)
ros2 launch hils_rover_control teleop_remote.launch.py joy_device_id:=<n>  # 조종석 (OP-002)
```

- Nav2 는 `ros-humble-navigation2 ros-humble-nav2-bringup` 을 별도 설치한다 — `install-jetson.sh` 범위 밖이다
- 조이패드 장치는 **경로가 아니라 `joy_device_id`(정수 인덱스)** 로 지정한다 (OP-002 2.3절 — 경로를 `device_name` 에 넘겨 패드가 열리지 않은 결함 이력)
- 갱신 배포: `git pull` → `colcon build --packages-select hils_rover_control hils_bridge` → `systemctl restart hils-rover`


---

[:octicons-arrow-left-24: 프로젝트 개요로](l-project-hils.md){ .md-button }
[:octicons-file-16: SRS (요구사항 명세서) 보기](l-project-srs.md){ .md-button }
