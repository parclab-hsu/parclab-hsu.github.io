# 한성대 Physical AI 교육 클러스터 (HSU-PAC)

:material-circle-outline:{ style="color:#e0a800" } **계획중** · Hansung University Physical AI Cluster

30명 규모(6인 × 5조) Physical AI 실습 교육을 위한 한성대 전용 GPU 클러스터 구축 프로젝트입니다.
학생은 개인 노트북을 **접속 단말**로만 사용하고, 시뮬레이션·학습 등 GPU 연산은 전부 교내
클러스터에서 수행하는 **서버 실행 + 씬클라이언트** 모델로 운영합니다.

---

## 배경

- 학생 노트북(RTX 4060 Laptop, 8GB)은 Isaac Sim 최소 사양(VRAM 16GB)에 미달 → 원격 GPU 자원 필수
- 클라우드 단독 운영은 학기 내내 상시 사용하는 교육 특성상 비용이 불리 → **온프레미스 기본 + 클라우드 피크 버스트** 하이브리드 설계
- NVIDIA DGX Spark는 Isaac Sim / Isaac Lab / GR00T 파인튜닝을 공식 지원하는 최저가 플랫폼으로 조별 전용 노드에 최적

## 시스템 아키텍처

```
[학생 노트북 ×30] ──(교내망)── WebRTC 스트리밍 / JupyterHub / SSH
                                    │
                          [10G Ethernet 백본 스위치]
                                    │
   [공유 학습 서버]      [DGX Spark ×5 (조별 전용)]      [NAS]
   RTX PRO 6000 96GB
   MIG 4분할
                                    │ (학기말 피크)
                          [AWS 버스트: 대형 학습 전용]
```

| 구성요소 | 수량 | 역할 |
|---|---|---|
| RTX PRO 6000 Blackwell 96GB 서버 | 1 | MIG 4분할 — Isaac Sim 동시 세션, 공용 학습 큐, 교수 시연 |
| NVIDIA DGX Spark (128GB 통합 메모리) | 5 | 조별 전용 노드 — Isaac Sim/Lab 실습, GR00T 파인튜닝 |
| 10GbE 백본 + NAS | 1식 | 데이터셋·체크포인트·홈디렉터리 공유 |
| AWS 스팟 버스트 | - | 학기말 대형 멀티GPU 학습만 처리 |

서버 섀시는 다중 GPU 베이로 확보하여 향후 GPU 증설만으로 처리량을 확장할 수 있습니다.

## 소프트웨어 스택

- **접속**: JupyterHub · SSH · VS Code Remote — 학생 계정별 컨테이너 환경
- **시뮬레이션**: Isaac Sim WebRTC 스트리밍 (노트북 브라우저로 3D 뷰포트 전송)
- **학습**: Isaac Lab · LeRobot · PyTorch · GR00T 파인튜닝
- **운영**: Docker + NGC 이미지(x86/aarch64), MIG 예약제, DCGM + Grafana 모니터링

## 교육환경 3계층 구조

| 계층 | 구성 | 역할 |
|---|---|---|
| 1계층 · 시뮬레이션/연산 | HSU-PAC (본 클러스터) | 전원이 안전하게·병렬로 시행착오를 겪는 층 |
| 2계층 · 실물 로봇 | 조별 로봇암(LeRobot 생태계) + 공용 플랫폼 | sim-to-real 격차를 실물로 검증 |
| 3계층 · 클라우드 버스트 | AWS 스팟 | 학기말 대형 파인튜닝 피크 흡수 |

**커리큘럼 매핑(15주)**: 시뮬 기초·정책 학습(1~8주, 1계층) → 텔레옵 데이터 수집·모방학습(9~11주, 2+1계층) → sim-to-real 실물 이전(12~13주, 2계층) → 파운데이션 모델 파인튜닝·캡스톤(14~15주, 3계층).

## 추진 로드맵

| 단계 | 내용 |
|---|---|
| Phase 1 | HSU-PAC 구축 (연산 계층 + 클라우드 버스트 체계) — 시뮬 중심 수업 개시 |
| Phase 2 | 조별 로봇암 도입 — 파이프라인 완주형 커리큘럼 완성 |
| Phase 3 | 공용 고급 플랫폼(쿼드러페드/휴머노이드) 도입, 캡스톤·대외 시연 |
| Phase 4 | GPU 증설, 분산학습 실습, 타 학과 개방 검토 |

---

`RTX PRO 6000` · `DGX Spark ×5` · `Isaac Sim` · `GR00T` · `MIG` · `JupyterHub` · `10G Ethernet` · `AWS Hybrid`

[:octicons-arrow-left-24: 프로젝트 목록으로](../projects.md)
