# 용어 사전

이 과목에서 나온 약어와 용어를 분야별로 모았다. 시험 직전 훑어보기용.

## 1. 자율주행 일반

| 용어 | 원어 | 뜻 |
|---|---|---|
| **ADAS** | Advanced Driver Assistance Systems | 첨단 운전자 보조 시스템 |
| **ACC** | Adaptive Cruise Control | 앞차와의 거리를 유지하며 설정 속도로 주행 |
| **AEB** | Autonomous Emergency Braking | 자동 긴급제동 |
| **LKA** | Lane Keeping Assist | 차로 이탈방지 보조 — 이탈 임박 시 조향 보조 |
| **LFA** | Lane Following Assist | 차로 유지 보조 — 차로 중앙 30cm만 벗어나도 작동, **사실상 상시 작동** |
| **LKAS** | Lane Keeping Assist System | 차선 유지 보조 시스템 |
| **FCA** | Forward Collision-Avoidance Assist | 전방충돌방지 보조 (카메라 + 레이더) |
| **FCA-JT** | FCA – Junction Turning | 교차로 대향차 충돌 방지 |
| **ESC** | Electronic Stability Control | 자동(자세)제어 |
| **EMS** | Engine Management System | 안전제어(엔진 관리) |
| **MDPS** | Motor Driven Power Steering | 전동식 조향제어 |
| **SAE** | Society of Automotive Engineers | 미국자동차공학회 — 자율주행 레벨 0~5 정의 |
| **ODD** | Operational Design Domain | 운행 가능 영역(설계 운용 범위) |
| **FSD** | Full Self-Driving | 테슬라의 자율주행 소프트웨어/컴퓨터 |
| **SDV** | Software Defined Vehicle | 소프트웨어로 정의되는 차량 |
| **AUTOSAR** | AUTomotive Open System ARchitecture | 차량 SW 표준 — **Classic**(실시간 제어) / **Adaptive**(고성능 자율주행) |
| **REM** | Road Experience Management | 모빌아이의 크라우드소싱 기반 정밀지도 생성 기술 |
| **HD Map** | High Definition Map | 정밀 지도 |
| **NHTSA** | National Highway Traffic Safety Administration | 미국 도로교통안전국 |
| **UNECE** | UN Economic Commission for Europe | UN 유럽경제위원회 |
| **ALKS** | Automated Lane Keeping System | UNECE의 자동 차선 유지 시스템 규정 |
| **ELKS** | Emergency Lane Keeping System | 긴급 차선 유지 시스템 (2025 의무) |
| **DSSAD** | Data Storage System for Automated Driving | 자율주행 주행 데이터 기록 장치 |
| **R155 / R156** | UN Regulation No.155 / No.156 | 사이버보안 / 소프트웨어 업데이트(OTA) |
| **OTA** | Over-The-Air | 무선 소프트웨어 업데이트 |
| **ITS** | Intelligent Transport System | 지능형 교통체계 *(국가교통체계효율화법 제2조)* |
| **C-ITS** | Cooperative-ITS | 차세대 지능형교통체계 |
| **LCA** | Life Cycle Assessment | 환경전과정평가 — 원료채취~폐기 전 과정 환경영향 정량 평가 |
| **CASE** | Connected, Autonomous, Shared, Electrified | 미래 모빌리티 패러다임 전환의 4축 |
| **5-F(ree)** | Accident·Barrier·Congestion·Delay·Emission Free | 2030년 국가 로드맵의 목표 사회상 |

### 1-1. 기능안전·안전 아키텍처 *(심화)*

아래 용어는 [🛡️ 심화 · 자율주행 안전 아키텍처](safety-architecture.md)에서 다룬다.

| 용어 | 원어 | 뜻 |
|---|---|---|
| **L2+ / L2++** | — | SAE 공식 분류가 아닌 업계 관행 표기. 기능은 L3에 근접하나 **최종 책임은 L2** |
| **ODD** | Operational Design Domain | 시스템이 정상 동작하도록 설계된 운행 조건 범위 |
| **ASIL** | Automotive Safety Integrity Level | ISO 26262의 자동차 기능안전 등급 A~D — **D가 최상위** |
| **ISO 26262** | Road vehicles — Functional safety | 전기·전자 시스템의 **고장(Fault)**에 대비하는 기능안전 국제표준 |
| **SOTIF** | Safety Of The Intended Functionality (ISO 21448) | 고장이 없어도 발생하는 **성능 한계(Limitation)**로 인한 위험을 다루는 표준 |
| **HARA** | Hazard Analysis and Risk Assessment | 위험 시나리오 분석 — 안전 목표와 ASIL 등급을 도출하는 절차 |
| **FSC / TSC** | Functional / Technical Safety Concept | 안전 메커니즘 정의 / 그 기술적 구현 개념 |
| **DCAS** | Driver Control Assistance Systems | UNECE **R-171**이 규정하는 운전자 제어 보조 시스템 규제 |
| **HOR** | Hand-Over Request | 시스템이 운전자에게 제어권 인수를 요청하는 절차 |
| **DCA** | Direct Control Alert | ODD 이탈 시 즉각적인 수동 운전 전환 경고 |
| **DUR** | Driver Unavailability Response | 운전자 상태 불량 시 감속·정차 유도 |
| **DMO** | Degraded Mode Operation | 시스템 고장 시 제어 능력을 단계적으로 낮추는 기능 축소 운행 |
| **Fail-operational** | — | 단일 고장이 나도 기능을 **유지**하는 설계 *(cf. 즉시 정지하는 Fail-safe)* |
| **Doer / Checker / Fallback** | — | 1차 경로 생성 / 궤적 유효성 검증 / 2차 경로 생성의 3중 논리 구조 |
| **EPS / SAS / ESC / EPB** | Electric Power Steering / Steering Angle Sensor / Electronic Stability Control / Electronic Parking Brake | 이중화 차량 플랫폼을 구성하는 조향·제동 요소 |
| **PMIC** | Power Management IC | 전원 관리 IC — 이중화 전원 구조에서 독립 배치 |

## 2. 센서·AI

| 용어 | 원어 | 뜻 |
|---|---|---|
| **LiDAR** | Light Detection And Ranging | 레이저 왕복 시간으로 거리 측정, **d = c·t/2** |
| **Radar** | Radio Detection And Ranging | 전파 + 도플러로 거리·상대속도 측정 |
| **Pseudo-LiDAR** | — | 카메라 기반 3D 인식을 라이다처럼 표현한 "가짜 라이다" |
| **SWIR** | Short Wave InfraRed | 단파장 적외선 — 악천후·야간 이미징 (TriEye) |
| **EO / IR** | Electro-Optical / InfraRed | 가시광 전자광학 / 적외선 |
| **VCSEL** | Vertical Cavity Surface Emitting Laser | 수직공진 표면발광 레이저 — 아이폰X Face ID에 최초 도입 |
| **MEMS** | Micro Electro Mechanical Systems | 미세전자기계시스템 — 차량용 고정형 라이다·관성센서 |
| **OPA** | Optical Phased Array | 광 위상배열 — 미래형 고정형 라이다 |
| **HDR** | High Dynamic Range | 명암비가 큰 장면을 동시에 표현 |
| **ISO** | — | 이미지 센서의 빛 증폭 수준(감도) |
| **CNN** | Convolutional Neural Network | 합성곱 신경망 |
| **MFCC** | Mel-Frequency Cepstral Coefficients | 사람의 청각 특성을 반영해 소리를 수치화한 특징 |
| **IoU** | Intersection over Union | 겹치는 영역 / 전체 영역 — 위치 예측 정확도 지표 |
| **NMS** | Non-Maximum Suppression | 비최대값 억제 — 중복 박스 제거 후처리 |
| **YOLO** | You Only Look Once | 대표적 **1-stage** 객체탐지 모델 |
| **R-CNN** | Region-based CNN | 대표적 **2-stage** 객체탐지 모델 |
| **TOPS** | Tera Operations Per Second | 초당 정수 연산 — **AI 추론 성능** 지표 |
| **GFLOPS** | Giga FLoating point OPerations per Second | 초당 부동소수점 연산 — **실수(정밀) 연산** 지표 |
| **NPU** | Neural Processing Unit | 신경망 전용 프로세서 |
| **TIDL** | TI Deep Learning | Texas Instruments의 임베디드 딥러닝 추론 라이브러리 |
| **Quantization** | — | 모델 경량화(부동소수점→정수). **정확도 감소** 이슈 |
| **KITTI / nuScenes / BDD100K** | — | 대표 자율주행 공개 데이터셋 |

## 3. 통신

| 용어 | 원어 | 뜻 |
|---|---|---|
| **V2X** | Vehicle to Everything | 차량과 모든 것의 통신 |
| **V2V / V2I / V2P / V2N / V2G** | Vehicle to Vehicle / Infrastructure / Pedestrian / Network / Grid | 차량↔차량 / 인프라 / 보행자 / 네트워크 / 전력망 |
| **DSRC** | Dedicated Short Range Communications | 5.9GHz, IEEE 802.11p 기반 근거리 전용 통신 |
| **RSU / OBU** | Roadside Unit / On-Board Unit | 노변 기지국 / 차량 탑재 단말 |
| **SPaT** | Signal Phase and Timing | 신호 위상·타이밍 메시지 |
| **MEC** | Mobile Edge Computing | 이동통신 기지국 근처에서 실시간 처리 |
| **CACC** | Coordinated(Cooperative) Adaptive Cruise Control | 협조형 차간거리 유지 제어 |
| **Platooning** | — | 군집주행. V2V 기반, 공기저항 감소로 연비 향상 |
| **5G NR** | 5G New Radio | 5G 무선접속 규격 |
| **Digital Twin** | — | 실제 대상을 가상 공간에 실시간으로 재현한 모델 |

## 4. 드론·UAM

| 용어 | 원어 | 뜻 |
|---|---|---|
| **UAV** | Unmanned Aerial Vehicle | 무인 비행체(**장치**) |
| **UAS** | Unmanned Aircraft System | 무인 항공기 **시스템** — **일반적으로 "드론"은 UAS를 의미** |
| **RPAS** | Remote Piloted Aircraft System | 무선조종 항공기 시스템 — **ICAO 공식 용어** |
| **OPV** | Optionally Piloted Vehicle | 유·무인 겸용 비행체 |
| **ICAO** | International Civil Aviation Organization | 국제민간항공기구 (UN 산하) |
| **VTOL** | Vertical Take-Off and Landing | 수직 이착륙 |
| **Hovering** | — | 제자리 정지 비행 |
| **Quadplane** | — | 리프트+크루즈 방식 하이브리드 |
| **Tailsitter** | — | 기체를 세워/눕혀 전환하는 하이브리드 |
| **MTOW** | Maximum Take-Off Weight | 최대이륙중량 = 기체 + 페이로드 + 배터리 + 기타 |
| **T/W** | Thrust to Weight ratio | 추력 대 중량비 — 안정 호버에 **≥ 1.5~2.0** |
| **Payload** | — | 탑재·운반 장비의 중량 |
| **FC / ESC** | Flight Controller / Electronic Speed Controller | 비행제어기 / 전자변속기 |
| **BPF** | Blade Passing Frequency | 프로펠러 통과주파수 = **회전주파수 × 블레이드 수** |
| **FoS** | Factor of Safety | 안전계수 — 드론 핵심부 2.0~2.5, 항공우주 1.4~1.5 |
| **Weight Spiral** | — | 중량 증가가 추력·모터·배터리 증가를 부르는 발산 루프 |
| **Flutter** | — | 공기력 + 구조진동 + 관성 상호작용의 발산 진동 |
| **RUL** | Remaining Useful Life | 잔여 수명 |
| **LiPo** | Lithium Polymer | 리튬 폴리머 배터리 (≤200 Wh/kg) |
| **UTM** | UAS Traffic Management | 무인기 교통관리 — **400ft(120m) 이하** |
| **ATM** | Air Traffic Management | 항공교통관리 — **18,000ft 이상** |
| **UAM / PAV** | Urban Air Mobility / Personal Air Vehicle | 도심 항공 모빌리티 / 개인용 항공기 |
| **RAM / AAM** | Regional / Advanced Air Mobility | 지역 항공 모빌리티 / 미래형 항공 모빌리티 |
| **eVTOL** | electric VTOL | 전기 수직이착륙기 |
| **OPPAV** | Optionally Piloted PAV | KARI·KAI의 틸트로터형 UAM 기체 |
| **DNA+드론** | Data · Network(5G) · AI + Drone | 5G 기반 비가시권 자율비행 + AI 실시간 처리 플랫폼 (ETRI) |
| **Counter-UAS** | — | 대드론 — 드론의 불법 사용을 예방·방어하는 활동 |
| **DTI** | Detect · Track · Identify | 대드론 탐지–추적–식별 절차 |
| **GNSS** | Global Navigation Satellite System | 위성항법시스템 (Jamming/Spoofing 대상) |
| **IGAAD** | Integrated Ground and Airborne Anti Drone system | KAERI의 통합 안티드론 시스템 |

## 5. 로봇·Physical AI

| 용어 | 원어 | 뜻 |
|---|---|---|
| **Robota** | (체코어) | 강제 노동·노역 — Robot의 어원 (R.U.R., 1920) |
| **로봇 3원칙** | Three Laws of Robotics | 인간 보호 > 명령 복종 > 자기 보호 (아시모프, 1942) |
| **지능형 로봇** | Intelligent Robot | 외부환경을 **인식(Perception)**하고 스스로 **판단(Cognition)**하여 자율적으로 **동작(Mobility & Manipulation)**하는 로봇 |
| **AGV / AMR** | Automated Guided Vehicle / Autonomous Mobile Robot | 무인 반송차 / 자율주행 이동로봇 |
| **SCARA** | Selective Compliance Assembly Robot Arm | 선택적 유연 조립 로봇 팔 — 고속·정밀, 조립 특화 |
| **Cobot** | Collaborative Robot | 협동로봇 |
| **HRC / HRI** | Human-Robot Collaboration / Interaction | 인간-로봇 협업 / 상호작용 |
| **CPS** | Cyber Physical System | 현실 공장을 디지털 공간에 구현 |
| **Mechatronics** | Mechanics + Electronics | 기계 + 전자의 융합 |
| **DOF** | Degree of Freedom | 자유도 — 휴머노이드 다리는 **6 DOF** (Hip 3 + Knee 1 + Ankle 2) |
| **SEA** | Series Elastic Actuator | 시리즈 탄성 액추에이터 — 스프링 변형량으로 힘 추정(F = kx) |
| **QDD** | Quasi-Direct Drive | 준직접구동 — 저감속비로 마찰↓·역구동성↑ (MIT Cheetah) |
| **Harmonic Drive** | — | 하모닉 감속기 — 고감속비, 백래시 거의 없음, **강한 마찰** |
| **BLDC** | Brushless DC Motor | 브러시리스 DC 모터 |
| **EHA** | Electro-Hydrostatic Actuator | 전기-유압 하이브리드 액추에이터 (Hydra) |
| **ZMP** | Zero Moment Point | 이족 보행 안정성 판정 기준점 |
| **Capture Point** | — | 넘어지지 않기 위해 발을 디뎌야 할 지점 |
| **Impedance Control** | — | 힘과 위치의 관계를 제어하는 방식 |
| **VLA** | Vision-Language-Action | 보고·듣고·행동하는 로봇 기반 모델 |
| **Physical AI** | — | 물리 세계에서 동작하는 AI (NVIDIA CES 2026 키노트 테마) |
| **Kimodo** | — | NVIDIA의 운동학적 모션 디퓨전 모델 (700h+ 학습, 2단계 디노이저) |
| **ProtoMotions / GEAR-SONIC** | — | 물리 기반 정책 학습 프레임워크 / 시뮬레이션 실행·추적 |
| **Teleoperation** | — | 원격 조작 — 기존의 로봇 시연 데이터 수집 방식 |

## 6. 서비스·산업

| 용어 | 원어 | 뜻 |
|---|---|---|
| **MaaS** | Mobility as a Service | 모든 교통수단을 하나의 통합 서비스로 제공 |
| **Whim** | — | 핀란드 헬싱키의 MaaS 앱 (MaaS Global) — 대중교통 이용률 48%→74% |
| **RaaS** | Robot as a Service | 로봇 구독·서비스 모델 (Unitree 전환) |
| **UX / CX / DX** | User / Customer eXperience, Digital Transformation | 사용자 경험 → 고객 경험 → 디지털 전환 |
| **UI** | User Interface | 사용자와 시스템 사이의 접점 |
| **Mass Customization** | — | 맞춤형 대량생산 |
| **Regulatory Sandbox** | — | 규제 샌드박스 — 신산업 우선 허용 |
| **PoC** | Proof of Concept | 개념 증명 |
| **Megacity** | — | 인구 1,000만 명 이상 도시 |
