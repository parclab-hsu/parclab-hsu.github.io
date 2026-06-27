# 1주차 — Physical AI 개요 & 개발환경 구축

!!! abstract "학습목표"
    Physical AI(임베디드 지능)의 개념과 응용을 이해하고, 한 학기 실습에 사용할 Ubuntu + ROS 2 개발환경을 직접 구축한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — Physical AI란 무엇인가 |
| 2교시 | 50분 | 실습 — Ubuntu/ROS 2 설치 및 검증 |
| 3교시 | 50분 | 실습 — 첫 ROS 2 노드 실행 |

## 📖 1교시. 이론

### Digital AI vs Physical AI

- **Digital AI**: 텍스트·이미지 등 디지털 데이터를 입출력 (ChatGPT, 분류기)
- **Physical AI**: 센서로 세계를 인식하고 **물리적 행동**으로 출력 (로봇, 자율주행, 휴머노이드)
- 핵심 차이: 실시간성, 불확실성, 안전성, **Sense → Plan → Act 루프**

### 구성 요소

인식(Perception) · 상태추정(State Estimation) · 계획(Planning) · 학습(Learning) · 제어(Control). 한 학기 동안 이 요소들을 한 주에 하나씩 쌓아 15주차에 통합한다.

### 응용 사례

자율주행(인지-판단-제어), 물류로봇(AMR), 협동로봇(Cobot), 휴머노이드(Figure, Optimus).

## 🛠️ 2교시. 실습 — 개발환경 구축

!!! tip
    Ubuntu 22.04 기준. Windows 사용자는 WSL2 또는 듀얼부팅 권장.

**Step 1 — 시스템 업데이트**

```bash
sudo apt update && sudo apt upgrade -y
```

**Step 2 — ROS 2 Humble 설치**

```bash
sudo apt install -y locales
sudo locale-gen en_US en_US.UTF-8

sudo apt install -y software-properties-common curl
sudo add-apt-repository universe -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
  -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] \
http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" \
  | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install -y ros-humble-desktop python3-colcon-common-extensions
```

**Step 3 — 환경 설정**

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

**Step 4 — 설치 검증 (talker/listener)**

```bash
# 터미널 1
ros2 run demo_nodes_cpp talker
# 터미널 2
ros2 run demo_nodes_py listener
```

✅ listener에 "I heard: Hello World"가 출력되면 성공.

## 🛠️ 3교시. 실습 — 워크스페이스 만들기

```bash
mkdir -p ~/cluad_ws/src
cd ~/cluad_ws
colcon build
source install/setup.bash
ros2 pkg list | head
```

✅ 패키지 목록이 출력되면 워크스페이스 준비 완료.

## ✅ 체크포인트

- [ ] `ros2` 명령이 동작하는가
- [ ] talker/listener 통신이 되는가
- [ ] `~/cluad_ws` 빌드가 성공하는가

## 📝 과제

- 환경 구축 스크린샷 제출
- "내가 생각하는 Physical AI 응용 1가지"를 5줄로 정리

## 🖼️ PPT 슬라이드 개요

1. 강의 소개 · 평가 방식 · 15주 로드맵
2. Digital AI vs Physical AI (정의·차이)
3. Sense → Plan → Act 루프 다이어그램
4. Physical AI 응용 사례 (자율주행·휴머노이드·AMR)
5. 개발환경 구성도 (Ubuntu·ROS2·Gazebo)
6. 실습 안내 및 과제

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| 환경 구축 | 40 | ROS2·Gazebo 정상 동작 | 일부 경고 | 설치 실패 |
| talker/listener 검증 | 30 | 통신 확인·설명 | 통신만 확인 | 미동작 |
| 워크스페이스 빌드 | 30 | 빌드·구조 이해 | 빌드만 성공 | 실패 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: Ubuntu 22.04 (또는 WSL2/듀얼부팅), RAM 8GB 이상, 안정적 인터넷

- ❌ `locale` 오류 → `sudo locale-gen en_US en_US.UTF-8` 재실행
- ❌ apt key 오류 → ros-archive-keyring.gpg 경로 확인 후 저장소 재등록
- ❌ `ros2: command not found` → `source /opt/ros/humble/setup.bash` 누락, .bashrc 확인

## 🔗 참고자료

- ROS 2 Humble 설치 문서 — <https://docs.ros.org/en/humble/Installation.html>
- NVIDIA "What is Physical AI" — <https://blogs.nvidia.com/blog/what-is-physical-ai/>
- Gazebo 문서 — <https://gazebosim.org/docs>
