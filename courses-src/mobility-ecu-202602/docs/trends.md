# 최신 기술 트렌드 연결

> 기준 확인일: 2026-07-14. 아래 내용은 모빌리티 ECU 실습을 최신 산업 흐름과 연결하기 위한 강의용 요약이다. 학생은 모든 트렌드를 구현하기보다, "내가 만든 STM32 모터 제어 보드가 실제 차량·로봇 아키텍처에서 어느 위치에 놓이는가"를 설명하는 데 집중한다.

## 1. SDV와 오픈소스 자동차 소프트웨어 {#sdv-open-source}

Eclipse SDV는 SDV 시대의 오픈 협업과 모듈형 자동차 소프트웨어 기반을 강조한다. 강의에서는 STM32 보드를 하나의 기능 ECU로 보고, 상위에서는 서비스·데이터·업데이트 구조가 ECU를 어떻게 묶는지 설명한다.

- 수업 연결: 1주차 ECU 구조, 11주차 요구사항, 15주차 최종 통합
- 학생 질문: "모터 제어 기능을 나중에 업데이트 가능한 서비스로 만들려면 어떤 인터페이스가 필요할까?"

## 2. Zonal Architecture와 중앙 컴퓨트 {#zonal-central-compute}

존 아키텍처는 센서와 액추에이터를 물리적 구역별로 모아 배선과 전력 분배를 단순화하고 중앙 컴퓨트와 연결한다. 실습 보드는 존 내부의 모터 액추에이터 ECU로 해석할 수 있다.

![SDV와 존 아키텍처 개념도](figures/sdv_zonal.svg)

- 수업 연결: 1주차 AMR 전장 구조, 11주차 시스템 블록도, 14주차 그라운드·노이즈
- 학생 질문: "AMR에서 좌우 휠 제어 보드를 존 컨트롤러 가까이에 둘 때 배선과 노이즈는 어떻게 달라질까?"

## 3. AI-defined Vehicle과 Physical AI {#ai-defined-vehicle}

AI-defined vehicle은 인지·판단·제어가 실시간 AI와 중앙/이기종 컴퓨트 위에서 결합되는 방향이다. 3학년 실습에서는 대형 ADAS를 만들기보다, 센서 로그와 제어 로그를 작은 진단 AI로 연결한다.

![모터 제어 데이터와 Edge AI 예지보전 흐름](figures/edge_ai_fault.svg)

- 수업 연결: 7주차 PI 응답 로그, 10주차 ADC/UART 데이터셋, 15주차 고장진단
- 학생 질문: "AI 모델 출력은 곧바로 PWM을 바꾸는가, 아니면 보호 로직의 참고 입력인가?"

## 4. 보안·소프트웨어 업데이트 규제 {#security-software-update}

UN R155는 차량 사이버보안 관리, R156은 소프트웨어 업데이트 관리와 연결된다. 강의 수준에서는 원격 명령, UART/BLE, OTA를 모두 신뢰 경계로 보고 로그와 무결성 개념을 추가한다.

- 수업 연결: 10주차 UART, 11주차 요구사항, 15주차 Fault/통신
- 학생 질문: "원격으로 듀티 명령을 보낼 때 인증·범위 제한·로그 중 무엇이 빠지면 위험한가?"

## 5. STM32 Motor Control SDK와 FOC {#stm32-mcsdk-foc}

ST의 STM32 Motor Control 생태계는 6-step BLDC와 PMSM FOC를 위한 펌웨어 라이브러리와 Workbench를 제공한다. 본 강의의 6-step, PWM, ADC, PI 이해는 MCSDK/FOC로 넘어가기 위한 기초다.

- 수업 연결: 5주차 BLDC, 6주차 인버터/PWM, 7주차 PI, 12주차 게이트드라이버
- 학생 질문: "6-step과 FOC는 어떤 센싱과 연산이 더 필요한가?"

## 6. ROS 2 LTS와 AMR 시스템 통합 {#ros2-amr-integration}

ROS 2 Jazzy는 장기 지원 배포판으로 AMR 상위 제어, 시뮬레이션, 데이터 로깅과 연결된다. MCU 보드는 ROS 2 노드가 아니라, 상위 컴퓨터와 직렬/CAN/Ethernet으로 연결되는 저수준 제어기다.

- 수업 연결: 1주차 AMR 구조, 10주차 UART, 15주차 최종 시연
- 학생 질문: "상위 ROS 2 명령과 하위 MCU 안전 제한이 충돌하면 누가 우선인가?"

## 7. 안전 RTOS와 추적성 {#safety-rtos-traceability}

Zephyr 같은 RTOS 생태계는 안전 문서, 요구사항 추적, 계층형 구조, 테스트 커버리지 같은 활동을 강화하고 있다. bare-metal STM32 실습에서도 요구사항-코드-시험의 추적성을 훈련해야 한다.

![ECU 안전·보안 V 모델](figures/safety_security_vmodel.svg)

- 수업 연결: 8~10주차 펌웨어, 11주차 HSI, 15주차 최종 검증
- 학생 질문: "LED가 켜지는 코드와 모터가 도는 코드는 검증 수준이 왜 달라야 하는가?"

## 참고한 공식·1차 자료

| 주제 | 출처 |
|---|---|
| SDV 오픈 협업 | [Eclipse SDV Working Group](https://eclipsesdv.org/about/) |
| 보안·업데이트 규제 | [Vehicle Certification Agency: UN R155/R156](https://www.vehicle-certification-agency.gov.uk/connected-and-automated-vehicles/cyber-security-and-software-updating/) |
| SDV/domain/zonal 흐름 | [NXP CoreRide SDV Platform](https://www.nxp.com/applications/automotive/software-defined-vehicle%3ASOFTWARE-DEFINED-CARS) |
| 존 컨트롤러 | [NXP Automotive Zone Controller](https://www.nxp.com/applications/AUTOMOTIVE-ZONE-CONTROLLER) |
| AI-defined vehicle | [Arm AI-Defined Vehicles](https://www.arm.com/markets/ai-defined-vehicles) |
| STM32 모터제어 | [ST STM32 Motor Control Ecosystem](https://www.st.com/content/st_com/en/ecosystems/stm32-motor-control-ecosystem.html) |
| ROS 2 LTS | [ROS 2 Jazzy Jalisco release](https://discourse.openrobotics.org/t/ros-2-jazzy-jalisco-released/37862) |
| 안전 RTOS | [Zephyr Safety Overview](https://docs.zephyrproject.org/latest/safety/safety_overview.html) |
| 모터 예지보전 AI | [Microchip Motor Control AI/ML Predictive Maintenance](https://www.microchip.com/en-us/tools-resources/reference-designs/motor-control-ai-ml-predictive-maintenance-demonstration-application-1) |
