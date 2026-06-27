# 5주차 — 로봇 시뮬레이션 (Gazebo·URDF)

!!! abstract "학습목표"
    시뮬레이션의 역할과 물리엔진을 이해하고, URDF로 로봇을 모델링하여 Gazebo에 스폰한다.

## ⏱️ 3시간 구성

| 교시 | 시간 | 내용 |
| --- | --- | --- |
| 1교시 | 50분 | 이론 — 시뮬레이션·URDF·물리엔진 |
| 2교시 | 50분 | 실습 — URDF 로봇 모델링 |
| 3교시 | 50분 | 실습 — Gazebo 스폰 & 제어 |

## 📖 1교시. 이론

- 왜 시뮬레이션인가: 안전·비용·대량 데이터·반복성. **Sim-to-Real**의 기반
- **URDF**: link(강체) + joint(관절)로 로봇 구조 기술. SDF와의 차이
- 물리엔진: 질량·관성·마찰·충돌, Gazebo / Isaac Sim 비교

## 🛠️ 2교시. 실습 — URDF 모델링

**Step 1 — 패키지/의존성**

```bash
sudo apt install -y ros-humble-gazebo-ros-pkgs ros-humble-xacro
ros2 pkg create --build-type ament_cmake my_robot_desc
```

**Step 2 — 차동 로봇 URDF** (`urdf/robot.urdf`)

```xml
<?xml version="1.0"?>
<robot name="my_bot">
  <link name="base_link">
    <visual>
      <geometry><box size="0.4 0.3 0.1"/></geometry>
      <material name="blue"><color rgba="0 0 1 1"/></material>
    </visual>
    <collision><geometry><box size="0.4 0.3 0.1"/></geometry></collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.01" iyy="0.01" izz="0.01" ixy="0" ixz="0" iyz="0"/>
    </inertial>
  </link>
  <link name="wheel_left">
    <visual><geometry><cylinder radius="0.1" length="0.05"/></geometry></visual>
  </link>
  <joint name="j_left" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_left"/>
    <origin xyz="0 0.18 0" rpy="1.5708 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>
</robot>
```

## 🛠️ 3교시. 실습 — Gazebo 스폰 & 확인

**Step 3 — Gazebo 실행 및 스폰**

```bash
gazebo --verbose -s libgazebo_ros_factory.so &
ros2 run gazebo_ros spawn_entity.py -entity my_bot \
  -file ~/cluad_ws/src/my_robot_desc/urdf/robot.urdf
```

**Step 4 — RViz로 모델 확인**

```bash
ros2 run robot_state_publisher robot_state_publisher \
  --ros-args -p robot_description:="$(cat ~/cluad_ws/src/my_robot_desc/urdf/robot.urdf)"
rviz2   # RobotModel 디스플레이 추가
```

✅ Gazebo와 RViz에 파란 박스 로봇이 보이면 성공.

## ✅ 체크포인트

- [ ] URDF가 오류 없이 파싱되는가 (`check_urdf robot.urdf`)
- [ ] Gazebo에 로봇이 스폰되는가

## 📝 과제

- 오른쪽 바퀴 joint를 추가하여 양쪽 바퀴 완성
- 색상을 빨강으로 변경하고 스크린샷 제출

## 🖼️ PPT 슬라이드 개요

1. 시뮬레이션의 필요성과 Sim-to-Real
2. URDF 구조: link(강체) + joint(관절)
3. visual / collision / inertial 요소
4. URDF vs SDF, xacro 매크로
5. 물리엔진(질량·마찰·충돌)
6. 실습: 차동 로봇 모델링·스폰

## 📊 평가 루브릭

| 항목 | 배점 | A(우수) | B(보통) | C(미흡) |
| --- | --- | --- | --- | --- |
| URDF 모델링 | 40 | 양 바퀴·관성 완성 | 기본 형상 | 파싱 실패 |
| Gazebo 스폰 | 30 | 정상 스폰·설명 | 스폰만 | 실패 |
| 과제(색상·바퀴 추가) | 30 | 완성·제출 | 일부 | 미제출 |

## 🧰 사전 준비물 & 트러블슈팅

**준비물**: gazebo_ros_pkgs, xacro 설치

- ❌ `check_urdf` 오류 → link/joint 이름 중복·parent 누락 확인
- ❌ Gazebo에 안 보임 → inertial(질량) 정의 누락 시 물리 불안정
- ❌ 모델이 바닥에 가라앉음 → collision 지오메트리와 마찰 계수 확인

## 🔗 참고자료

- URDF 튜토리얼 — <https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html>
- gazebo_ros_pkgs — <https://github.com/ros-simulation/gazebo_ros_pkgs>
- xacro 문서 — <https://github.com/ros/xacro/wiki>
