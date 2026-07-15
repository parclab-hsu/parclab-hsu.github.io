# 용어·도해 사전

> 개요와 1~15주차에서 반복되는 핵심 용어를 따로 모았다. 각 주차에서는 이 페이지의 용어 링크와 도해를 함께 보며, 학생이 회로·펌웨어·제어·최신 SDV 흐름을 같은 언어로 설명하게 한다.

## 전체 구조 그림

![모빌리티 ECU 계층 구조](figures/ecu_layers.svg)

![SDV와 존 아키텍처 개념도](figures/sdv_zonal.svg)

![모터 제어 데이터와 Edge AI 예지보전 흐름](figures/edge_ai_fault.svg)

![ECU 안전·보안 V 모델](figures/safety_security_vmodel.svg)

## 핵심 용어

### ECU {#ecu}
Electronic Control Unit. 센서·명령 입력을 받아 MCU가 판단하고, 드라이버와 인버터를 통해 모터·액추에이터를 구동하는 제어 장치다. 이 강의의 로버 구동보드는 모터 ECU의 축소 실습 모델이다.

### MCU {#mcu}
Microcontroller Unit. CPU, 메모리, GPIO, ADC, Timer, UART 같은 주변장치를 한 칩에 넣은 작은 컴퓨터다. STM32는 이 강의의 주 MCU 계열이다.

### HSI {#hsi}
Hardware-Software Interface. MCU 핀, 전압 범위, 센서 스케일, PWM 채널처럼 하드웨어와 펌웨어가 공유해야 할 계약서다.

### PWM {#pwm}
Pulse Width Modulation. 스위치를 빠르게 켜고 끄며 듀티비로 평균 전압을 만드는 방식이다. 모터 속도와 인버터 전압 지령을 만드는 기본 기술이다.

### Dead Time {#deadtime}
상·하단 MOSFET이 동시에 켜져 암단락이 생기지 않도록 두 스위치를 모두 끄는 짧은 시간이다.

### BLDC {#bldc}
Brushless DC Motor. 브러시 대신 전자적 정류로 회전자 위치에 맞춰 상전류를 바꾸는 모터다. 홀센서 6-step 또는 FOC로 구동한다.

### FOC {#foc}
Field-Oriented Control. 3상 전류를 자속축과 토크축으로 변환해 PMSM/BLDC를 부드럽고 효율적으로 제어하는 고급 제어 방식이다.

### PI 제어 {#pi-control}
비례(P)와 적분(I) 동작으로 목표 속도와 실제 속도의 오차를 줄이는 폐루프 제어다. 모터 속도제어의 출발점이다.

### ADC {#adc}
Analog-to-Digital Converter. 전압, 전류, 온도 같은 아날로그 신호를 MCU가 처리할 수 있는 숫자로 바꾼다.

### EXTI/NVIC {#interrupt}
외부 이벤트와 인터럽트 제어 구조다. 스위치, 홀센서, 엔코더처럼 놓치면 안 되는 이벤트를 빠르게 처리한다.

### Teleplot {#teleplot}
UART로 보낸 변수 값을 실시간 그래프로 확인하는 디버깅 방식이다. 속도 응답, 전류 리플, PI 튜닝 결과를 보는 데 유용하다.

### SDV {#sdv}
Software-Defined Vehicle. 차량 기능이 하드웨어 결선보다 소프트웨어, 업데이트, 데이터, 서비스 구조로 정의되는 흐름이다.

### Zonal Architecture {#zonal}
차량을 앞/뒤/좌/우 같은 물리적 존으로 나누고, 각 존 컨트롤러가 센서·액추에이터를 모아 중앙 컴퓨트와 연결하는 E/E 구조다.

### OTA/FOTA {#ota}
Over-the-Air/Firmware-over-the-Air. 차량이나 로봇의 소프트웨어를 현장 방문 없이 원격으로 업데이트하는 방식이다. 안전·보안·추적성이 함께 필요하다.

### Edge AI/TinyML {#edge-ai}
클라우드가 아니라 MCU나 엣지 보드에서 데이터를 분석하는 AI다. 모터 전류·속도·온도 로그로 이상징후를 감지하는 예지보전에 연결된다.

### Functional Safety {#functional-safety}
고장이 나더라도 사람이 위험해지지 않도록 요구사항, 설계, 검증, 보호 상태를 체계적으로 다루는 안전 관점이다.

### Cybersecurity {#cybersecurity}
통신, 업데이트, 로그, 원격 명령이 공격 경로가 되지 않도록 인증, 무결성, 권한, 기록을 관리하는 관점이다.

### AUTOSAR {#autosar}
Automotive Open System Architecture. 차량 소프트웨어 구조, 인터페이스, 통신, 안전·보안 관련 표준 생태계다. 이 강의에서는 직접 AUTOSAR를 구현하지 않지만, HSI·상태기계·진단 로그가 산업 표준 개발 방식과 어떻게 이어지는지 설명할 때 사용한다.

### V-Model {#v-model}
요구사항에서 설계·구현·검증으로 내려가고, 다시 시험 결과로 요구사항 충족을 확인하는 개발 모델이다. 11주차 요구사항과 15주차 최종 검증을 연결하는 핵심 프레임이다.

### CSMS/SUMS {#csms-sums}
Cyber Security Management System / Software Update Management System. 차량 사이버보안과 소프트웨어 업데이트를 조직·프로세스·증거로 관리하는 체계다. 학생 수준에서는 원격 명령, UART/BLE, 업데이트 파일의 신뢰 경계를 이해하는 데 초점을 둔다.

### NPU {#npu}
Neural Processing Unit. 신경망 추론을 빠르고 효율적으로 실행하기 위한 전용 가속기다. STM32N6처럼 MCU 계열에도 엣지 AI 가속기가 들어가면서, 작은 제어기에서도 이상 탐지나 간단한 인지 기능을 다룰 수 있다.

### Anti-windup {#anti-windup}
PI 제어기에서 출력이 포화되었는데도 적분항이 계속 쌓여 회복이 늦어지는 문제를 줄이는 기법이다. 7주차 속도제어와 15주차 안전정지에서 함께 다룬다.

### Shunt Resistor {#shunt}
전류를 측정하기 위해 작은 저항을 전류 경로에 넣고 전압강하를 읽는 부품이다. 모터 전류 보호, 토크 추정, 고장 진단의 기본 센서가 된다.

### Bootstrap Gate Driver {#bootstrap}
하이사이드 MOSFET을 켜기 위해 스위칭 노드보다 높은 게이트 전압을 만드는 게이트드라이버 회로 방식이다. 12주차 인버터 하드웨어 설계에서 핵심적으로 다룬다.

### Return Current {#return-current}
신호나 전력 전류가 부하를 지난 뒤 전원으로 되돌아가는 전류다. 돌아오는 경로가 길거나 끊기면 노이즈와 EMI가 커지므로 14주차 PCB 노이즈 수업에서 중요하다.

## 주차별 빠른 용어 링크

| 주차 | 먼저 볼 용어 | 함께 볼 도해 |
|---|---|---|
| 1 | [ECU](#ecu), [MCU](#mcu), [SDV](#sdv), [Zonal Architecture](#zonal) | ECU 계층 구조, SDV 존 구조 |
| 2 | [ADC](#adc), [Shunt Resistor](#shunt), [ECU](#ecu) | ECU 계층 구조 |
| 3 | [Dead Time](#deadtime), [PWM](#pwm), [Shunt Resistor](#shunt) | ECU 계층 구조 |
| 4 | [ECU](#ecu), [Functional Safety](#functional-safety) | ECU 계층 구조 |
| 5 | [BLDC](#bldc), [FOC](#foc) | Edge AI 예지보전 흐름 |
| 6 | [PWM](#pwm), [Dead Time](#deadtime), [FOC](#foc) | ECU 계층 구조 |
| 7 | [PI 제어](#pi-control), [Anti-windup](#anti-windup), [Teleplot](#teleplot) | Edge AI 예지보전 흐름 |
| 8 | [MCU](#mcu), [HSI](#hsi) | ECU 안전·보안 V 모델 |
| 9 | [EXTI/NVIC](#interrupt), [MCU](#mcu) | ECU 계층 구조 |
| 10 | [ADC](#adc), [PWM](#pwm), [Teleplot](#teleplot) | Edge AI 예지보전 흐름 |
| 11 | [HSI](#hsi), [V-Model](#v-model), [Functional Safety](#functional-safety) | ECU 안전·보안 V 모델 |
| 12 | [Bootstrap Gate Driver](#bootstrap), [Dead Time](#deadtime), [Functional Safety](#functional-safety) | ECU 계층 구조 |
| 13 | [HSI](#hsi), [Cybersecurity](#cybersecurity) | SDV 존 구조 |
| 14 | [Return Current](#return-current), [Zonal Architecture](#zonal), [Cybersecurity](#cybersecurity) | SDV 존 구조 |
| 15 | [OTA/FOTA](#ota), [CSMS/SUMS](#csms-sums), [NPU](#npu), [Functional Safety](#functional-safety) | Edge AI 예지보전, V 모델 |
