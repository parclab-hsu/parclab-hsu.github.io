# DLI 심화 · USD for Robotics (로봇 자산을 OpenUSD로)

!!! abstract "학습목표"
    OpenUSD가 로봇을 표현하는 **기본 빌딩 블록**(Prim·Geometry·Rigid Body·Collider·Joint·Articulation)을 이해하고, **URDF 로봇을 USD로 임포트**하는 워크플로우를 익힌다. 나아가 **Layer·Reference·Override** 기반의 USD 스테이지 컴포지션으로 로봇과 환경을 조립하는 방법을 학습한다. 실습으로 **UR10e 팔 + Robotiq 2F-140 그리퍼**를 결합하고 학습용 씬을 구성한다.

!!! quote "출처 (Source)"
    본 모듈은 **NVIDIA «Isaac for Accelerated Robotics» (GTC Paris 2025) / DLI C-OV-05** 의 *Part 1 — OpenUSD for Robotics* (발표: Lior Ben Horin, Physical AI Sr. Developer Relations Manager, NVIDIA) 세션을 바탕으로 재구성하였습니다.

## ⏱️ 구성

워크샵 본 세션은 09:15에 시작하며, 다음 세 가지 목표를 다룹니다.

| 단계 | 내용 |
| --- | --- |
| 1 | USD로 표현되는 **로봇의 빌딩 블록** 학습 |
| 2 | **로봇을 USD로 임포트**하는 방법 (URDF Importer) |
| 3 | Isaac Sim에서 **로봇과 환경 조립** (Layer·Reference) |

레슨 시퀀스(DLI 16번 모듈 기준)는 다음과 같이 구성됩니다.

| 레슨 | 주제 |
| --- | --- |
| 01 | Anatomy of a Robot — 자산 구조 |
| 02 | Importer로 로봇 임포트 |
| 03 | Layer로 UR10e + 그리퍼 연결 |
| 04 | 케이스 스터디 |
| 05 | 로봇 학습 씬 조립 |
| 06 | 자산 최적화 (메시 병합·인스턴싱·콜라이더) |

![로봇의 해부학 — USD 빌딩 블록 개요](img/dli-usd/s05.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 05 (출처: NVIDIA GTC Paris 2025)
///

## 🧱 1. OpenUSD 개요와 Prim

**Universal Scene Description(USD)** 는 3D 씬을 기술·교환·합성하기 위한 개방형 프레임워크입니다. USD에서 모든 것의 기본 단위는 **Prim**입니다.

- **Prim(Primitive)**: USD의 **주요 컨테이너 객체**. 씬을 구성하는 기본 단위입니다.
- **Geometry**: 큐브·실린더처럼 **미리 정의된 단순 형상**. Prim에 부여되는 시각적 기하 정보입니다.

![Prim과 Geometry](img/dli-usd/s07.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 07 (출처: NVIDIA GTC Paris 2025)
///

## 🤖 2. 로봇을 이루는 재료 (Robot Ingredients)

USD에서 로봇은 다음 요소들의 조합으로 표현됩니다.

| 요소 | 역할 |
| --- | --- |
| **Rigid Body** | 강체 — 질량·관성을 가진 물리 객체 |
| **Colliders** | 충돌 처리를 위한 충돌 형상 |
| **Joints** | 강체 사이의 연결·구속 |
| **Articulation** | 조인트로 연결된 강체 체인(관절형 구조) |

![로봇의 재료 — Rigid Body·Collider·Joint·Articulation](img/dli-usd/s08.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 08 (출처: NVIDIA GTC Paris 2025)
///

## 🔩 3. USD의 조인트 타입과 URDF 대응

### URDF와 공통되는 조인트

| USD 조인트 | 동작 | URDF 대응 |
| --- | --- | --- |
| **Fixed** | 움직임 없음 | fixed |
| **Revolute** | 회전 운동(리미트 유무 선택) | revolute (URDF에서는 continuous도 가능) |
| **Prismatic** | 직선 운동(리미트 유무 선택) | prismatic |

### USD에만 있는 조인트

| USD 조인트 | 설명 |
| --- | --- |
| **Spherical** | X·Y·Z 회전 허용 — 회전 조인트 3개와 등가 |
| **D6** | 선택한 DOF만 허용 — 모두 선택하면 floating 조인트와 등가 |
| **Gear** | 두 revolute 조인트 사이 비율(ratio) 관계 정의 |
| **Distance** | 두 강체 사이 거리 도달 전까지 완전 자유 |
| **Rack and Pinion** | revolute와 prismatic 조인트 사이 관계 정의 |
| **Mimic** | 조인트가 아닌 **속성(Attribute)** — 두 조인트를 기어비로 연결 |

### URDF에만 있는 조인트

| URDF 조인트 | 설명 |
| --- | --- |
| **Floating** | 모든 DOF에서 완전 자유 |
| **Planar** | 평면 위에서 완전 자유 |

![USD 조인트 타입과 URDF 대응](img/dli-usd/s11.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 11 (출처: NVIDIA GTC Paris 2025)
///

![USD 전용 조인트 — Spherical·D6·Gear·Distance·Rack and Pinion](img/dli-usd/s14.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 14 (출처: NVIDIA GTC Paris 2025)
///

## 🧩 4. USD 스테이지 컴포지션

USD 스테이지는 여러 요소를 **합성(composition)** 하여 구성됩니다. 이 컴포지션 메커니즘이 로봇 자산을 모듈화하고 재사용 가능하게 만듭니다.

| 요소 | 역할 |
| --- | --- |
| **Materials** | 표면 재질·외관 정의 |
| **Layers** | 비파괴적으로 쌓아 올리는 스테이지 레이어 |
| **References** | 다른 USD를 참조로 끌어와 재사용 |
| **Overrides** | 참조된 자산의 속성을 덮어쓰기(재정의) |

![USD 스테이지 구성 요소 — Materials·Layers·References·Overrides](img/dli-usd/s18.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 18 (출처: NVIDIA GTC Paris 2025)
///

## 📄 5. URDF의 구조

로봇을 USD로 임포트하기 전, 원본인 **URDF**의 구조를 이해해야 합니다. URDF는 **링크(link)** 와 **조인트(joint)** 로 구성됩니다.

링크는 시각(`visual`)·충돌(`collision`)·관성(`inertial`) 정보를 가집니다.

```xml
<link name="base_link_inertia">
  <visual>
    <origin rpy="0 0 3.141592653589793" xyz="0 0 0"/>
    <geometry>
      <mesh filename="package://ur_description/meshes/ur10e/visual/base.dae"/>
    </geometry>
    <material name="LightGrey">
      <color rgba="0.7 0.7 0.7 1.0"/>
    </material>
  </visual>
  <collision>
    <origin rpy="0 0 3.141592653589793" xyz="0 0 0"/>
    <geometry>
      <mesh filename="package://ur_description/meshes/ur10e/collision/base.stl"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="4.0"/>
    <origin rpy="0 0 0" xyz="0 0 0"/>
    <inertia ixx="0.0061063308908" ixy="0.0" ixz="0.0"
             iyy="0.0061063308908" iyz="0.0" izz="0.01125"/>
  </inertial>
</link>
```

조인트는 부모·자식 링크를 연결하고 회전축·리미트·동역학을 정의합니다.

```xml
<joint name="shoulder_pan_joint" type="revolute">
  <parent link="base_link_inertia"/>
  <child link="shoulder_link"/>
  <origin rpy="0 0 0" xyz="0 0 0.1807"/>
  <axis xyz="0 0 1"/>
  <limit effort="330.0" lower="-6.283185307179586"
         upper="6.283185307179586" velocity="2.0943951023931953"/>
  <dynamics damping="0" friction="0"/>
</joint>
```

!!! note "UR Description 자산 구조"
    실습에서 사용하는 `Universal_Robots_ROS2_Description`(ROS 2 `ur_description` 패키지)은 `ur3`/`ur3e`/`ur5`/`ur5e`/`ur7e`/`ur10`/`ur10e`/`ur12e`/`ur16e`/`ur20`/`ur30` 변형을 지원합니다. 각 변형은 `default_kinematics.yaml`·`joint_limits.yaml`·`physical_parameters.yaml`·`visual_parameters.yaml` 설정을 사용하며, 핵심 Xacro는 `urdf/ur_macro.xacro`·`urdf/ur.urdf.xacro`·`urdf/ur.ros2_control.xacro`·`urdf/inc/ur_common.xacro`입니다.

    ```bash
    # ROS 2 환경 설정 후 RViz 시각화 스모크 테스트
    ros2 launch ur_description view_ur.launch.py ur_type:=ur5e
    ```

## 📥 6. URDF Importer

Isaac Sim의 **URDF Importer**는 URDF를 USD 로봇 자산으로 변환합니다. GUI의 주요 옵션은 다음과 같습니다.

| # | 옵션 | 설명 |
| --- | --- | --- |
| 1 | Reference Function | 현재 열린 스테이지에 자산을 스폰할지, 스테이지에 **레퍼런스로 링크**할지 결정 |
| 2 | Output File Path | 생성될 USD의 출력 경로 |
| 3 | Static Base | 선택 시 로봇 베이스 링크와 world 사이에 **고정 조인트** 생성 |
| 4 | Density | 0으로 두면 URDF의 질량을 사용, 질량이 없으면 물 밀도(1000/m³) 적용 |
| 5 | Mimic Joints | mimic 조인트 무시 여부 |
| 6 | Joint Configuration | stiffness·damping을 직접 설정하거나 고유진동수로 간접 계산 |
| 7 | Joint Settings | force가 링크의 질량·관성을 반영하도록 설정 |
| 8 | Collider | URDF에 콜라이더 형상이 없을 때의 콜라이더 구성 |
| 9 | Self-Collision | 로봇이 자기 자신과 충돌하도록 허용 |

![URDF Importer GUI 옵션](img/dli-usd/s24.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 24 (출처: NVIDIA GTC Paris 2025)
///

## 🗂️ 7. 케이스 스터디 — URDF Importer 자산 구조

Importer가 생성하는 로봇 자산은 **여러 USD 파일로 분리**되어 레이어로 합성됩니다. 이렇게 분리하면 물리·센서·외형을 독립적으로 관리·재사용할 수 있습니다.

| USD 파일 | 역할 |
| --- | --- |
| `ur_base.usd` | 기본 형상·계층(베이스 자산) |
| `ur_physics.usd` | 물리 속성(강체·조인트·콜라이더) |
| `ur_sensor.usd` | 센서 구성 |
| `ur.usd` | 위 레이어들을 합성한 **최상위 로봇 자산** |

![URDF Importer 자산 구조 — USD 파일 분리](img/dli-usd/s27.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 27 (출처: NVIDIA GTC Paris 2025)
///

![로봇 자산의 컴포지션 구조](img/dli-usd/s29.jpg){ width="720" }
/// caption
USD for Robotics — 슬라이드 29 (출처: NVIDIA GTC Paris 2025)
///

## 🛠️ 8. 핸즈온 — UR10e + 2F-140 그리퍼 조립

실습에서는 **UR10e 로봇 팔**과 **Robotiq 2F-140 그리퍼**를 USD 레이어로 결합하고, 이어서 학습용 씬(robot training scenario)을 조립합니다.

- **Layer 기반 조립**: 그리퍼를 별도 레이어/레퍼런스로 UR10e 자산에 연결하여 비파괴적으로 합성합니다(레슨 03).
- **Robotiq 패키지**: `robotiq` 디렉터리는 2F/3F 그리퍼 제어, 시각화, EtherCAT, Modbus(TCP/RTU), FT 센서 등 다수의 패키지로 구성된 ROS 1/catkin 형식 자산입니다. (upstream은 2021-05-28 기준 미유지보수 상태로 표기됨)
- **학습 씬 조립**: 조립된 로봇과 환경(예: `completed_warehouse` 체크포인트)을 결합해 학습 시나리오를 구성합니다(레슨 05).

!!! warning "패키지 스타일 혼동 주의"
    `Universal_Robots_ROS2_Description`(ROS 2, package format 3)과 `robotiq`(ROS 1/catkin, package format 2)는 **패키지 스타일이 다르므로 호환되는 것처럼 다루면 안 됩니다.** 또한 `Jetbot_Base/parts`는 다수의 참조 USD 파트를 담고 있어 일괄 편집을 피해야 합니다.

## ♻️ 9. 자산 최적화

레슨 06에서는 USD 로봇 자산의 성능을 높이기 위한 최적화를 다룹니다.

- **메시 병합(Mesh Merging)**: 다수의 작은 메시를 합쳐 드로우콜 감소
- **인스턴싱(Instancing)**: 반복되는 자산을 인스턴스로 공유해 메모리 절감
- **콜라이더 최적화**: 시각 메시 대신 단순화한 충돌 형상 사용

## ✅ 체크포인트

- USD의 **Prim·Geometry**와 로봇 재료(**Rigid Body·Collider·Joint·Articulation**)를 구분해 설명할 수 있다.
- USD 전용 조인트(**Spherical·D6·Gear·Distance·Rack and Pinion**)와 URDF 전용 조인트(**Floating·Planar**)의 차이를 안다.
- **Layer·Reference·Override**로 로봇 자산을 비파괴적으로 합성하는 원리를 이해한다.
- **URDF Importer**의 주요 옵션(Static Base·Density·Self-Collision 등)의 의미를 설명할 수 있다.
- `ur_base`/`ur_physics`/`ur_sensor`/`ur.usd`로 **분리·합성된 자산 구조**의 장점을 안다.

## 🔗 출처 및 참고자료

- NVIDIA **«Isaac for Accelerated Robotics»** (GTC Paris 2025) / DLI **C-OV-05** — Part 1: *OpenUSD for Robotics*
- OpenUSD 공식 — <https://openusd.org>
- NVIDIA **Isaac Sim** 문서 (URDF Importer) — <https://docs.isaacsim.omniverse.nvidia.com>
- Universal Robots **`ur_description`** (ROS 2) — <https://github.com/UniversalRobots/Universal_Robots_ROS2_Description>
- 관련 모듈: [DLI · Software-in-the-Loop](dli-sil.md) · [DLI · ROS 2 가속](dli-ros.md)
</content>
</invoke>

<!-- FULLDECK -->
## 🖼️ 원본 워크샵 슬라이드

??? note "원본 슬라이드 전체 (30매)"
    ![슬라이드 01](img/dli-usd/s01.jpg){ width="700" }
    ![슬라이드 02](img/dli-usd/s02.jpg){ width="700" }
    ![슬라이드 03](img/dli-usd/s03.jpg){ width="700" }
    ![슬라이드 04](img/dli-usd/s04.jpg){ width="700" }
    ![슬라이드 05](img/dli-usd/s05.jpg){ width="700" }
    ![슬라이드 06](img/dli-usd/s06.jpg){ width="700" }
    ![슬라이드 07](img/dli-usd/s07.jpg){ width="700" }
    ![슬라이드 08](img/dli-usd/s08.jpg){ width="700" }
    ![슬라이드 09](img/dli-usd/s09.jpg){ width="700" }
    ![슬라이드 10](img/dli-usd/s10.jpg){ width="700" }
    ![슬라이드 11](img/dli-usd/s11.jpg){ width="700" }
    ![슬라이드 12](img/dli-usd/s12.jpg){ width="700" }
    ![슬라이드 13](img/dli-usd/s13.jpg){ width="700" }
    ![슬라이드 14](img/dli-usd/s14.jpg){ width="700" }
    ![슬라이드 15](img/dli-usd/s15.jpg){ width="700" }
    ![슬라이드 16](img/dli-usd/s16.jpg){ width="700" }
    ![슬라이드 17](img/dli-usd/s17.jpg){ width="700" }
    ![슬라이드 18](img/dli-usd/s18.jpg){ width="700" }
    ![슬라이드 19](img/dli-usd/s19.jpg){ width="700" }
    ![슬라이드 20](img/dli-usd/s20.jpg){ width="700" }
    ![슬라이드 21](img/dli-usd/s21.jpg){ width="700" }
    ![슬라이드 22](img/dli-usd/s22.jpg){ width="700" }
    ![슬라이드 23](img/dli-usd/s23.jpg){ width="700" }
    ![슬라이드 24](img/dli-usd/s24.jpg){ width="700" }
    ![슬라이드 25](img/dli-usd/s25.jpg){ width="700" }
    ![슬라이드 26](img/dli-usd/s26.jpg){ width="700" }
    ![슬라이드 27](img/dli-usd/s27.jpg){ width="700" }
    ![슬라이드 28](img/dli-usd/s28.jpg){ width="700" }
    ![슬라이드 29](img/dli-usd/s29.jpg){ width="700" }
    ![슬라이드 30](img/dli-usd/s30.jpg){ width="700" }
