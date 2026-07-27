# Repository Instructions

- Do not perform external redeploys unless the user explicitly asks for deployment.
- Default MkDocs builds must write to `.local-site/`, not to the GitHub Pages public output folders.
- Do not copy generated files into the repository root or `courses/` for publication unless deployment is explicitly requested.
- Do not push changes only to trigger GitHub Pages rebuilds unless the user explicitly asks for push/deploy.

## Project Memory (컨텍스트 메모)

- **HSU-PAC (한성대 Physical AI 교육 클러스터)** — 2026-07 확정 구성: RTX PRO 6000 Blackwell ×1 (공유 학습 서버, MIG 4분할) + NVIDIA DGX Spark ×5 (조별 전용 노드, 30명 = 6인×5조) + 10G Ethernet 백본 + NAS.
  - 근거: 학생 노트북(RTX 4060 8GB)은 Isaac Sim 최소사양(16GB VRAM) 미달 → 서버 실행 + 노트북은 접속 단말. DGX Spark는 Isaac Sim/Isaac Lab·GR00T 파인튜닝 공식 지원(aarch64)이라 조별 실습 노드로 활용.
  - DGX Spark는 대역폭(273GB/s) 한계로 대규모 고속 학습에는 부적합 — 학기말 대형 학습은 AWS 버스트(하이브리드)로 처리.
  - 서버 섀시는 2~4 GPU 베이로 확보하여 향후 PRO 6000 증설로 확장.
  - 홈페이지 `homepage-src/docs/projects.md`의 "계획중 · 한성대 Physical AI 교육 클러스터 (HSU-PAC)" 카드가 이 프로젝트임. 공개용 상세 페이지는 `homepage-src/docs/projects/hsu-pac.md`(→ `/projects/hsu-pac/`) — 예산 수치를 제외한 요약본이며, 카드에서 "자세히 보기" 링크로 연결됨. 다른 프로젝트 카드들은 아직 상세 페이지 없음.
  - 관련 산출물(예산 포함 내부 문서, 비공개 저장소 `parclab-hsu/PhysicalAiRoboticsSimulation`의 `HSU-PAC/` 폴더): HSU-PAC 상세 구축안, 온프레미스 vs AWS 비교 보고서, 교육환경 구조 제안. 기획조정처 보고용 docx는 저장소 외부. 노션 통합본: "HSU-PAC — 한성대 Physical AI 교육 클러스터 구축안 (최종)" (Physical AI · 2026-2학기 강의 페이지 하위).
  - 교육환경 3계층 구조 확정(2026-07-27): 1계층 시뮬/연산(HSU-PAC) + 2계층 실물 로봇(조별 SO-101급 로봇암 5세트 + 공용 플랫폼 1대, 보강 제안) + 3계층 AWS 버스트. 예산 수치는 공개 페이지에 게시하지 않는 것이 방침.
