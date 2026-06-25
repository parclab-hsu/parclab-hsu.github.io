# 한성대학교 교수법 워크숍 슬라이드

이 폴더는 외부 라이브러리 없이 GitHub Pages에서 바로 열리는 정적 HTML 발표자료입니다. 16:9 화면 **67장**으로, *AI 에이전트(Codex)로 대학 행정 데이터를 분석하고 발표자료를 만드는 4시간 실습형 워크숍*의 진행 흐름(오프닝 → 환경 설치 → 데이터 분석 → 웹 발표자료 제작 → Q&A → 프롬프트 카드)을 담습니다.

같은 사이트에 슬라이드와 **MkDocs 핸드북**(슬라이드를 풀어쓴 자습 문서, 저장소 루트의 `docs/` + `mkdocs.yml`)이 함께 배포됩니다. 통합 배포 워크플로는 `.github/workflows/deploy.yml`이며, `mkdocs build`로 핸드북을 만든 뒤 이 슬라이드 폴더를 `/slide/` 경로로 묶어 한 번에 올립니다.

## 보기와 조작

- 로컬 확인: `index.html`을 브라우저에서 열기
- 이동: 키보드 `←`/`→`(또는 화면 하단 이전/다음 버튼), 처음/끝은 `Home`/`End`
- 특정 장으로 바로 가기: 주소 끝에 `#/12`처럼 슬라이드 번호 해시(딥링크)
- 추가 패널: **진행 메모**(발표자 노트), **개요**(슬라이드 목록), **인쇄**(유인물/PDF)

## 배포

- `.github/workflows/deploy.yml`이 핸드북과 이 슬라이드를 함께 Pages로 올립니다.
- 저장소 Settings > Pages > Build and deployment에서 Source를 `GitHub Actions`로 설정하세요.
- 배포 URL: 핸드북 `/workshop-hansung/`, 슬라이드 `/workshop-hansung/slide/`

## 파일 구성

- `index.html`: 발표자료 진입점. `styles.css`·`app.js`를 `?v=` 캐시 버전 토큰과 함께 불러옵니다.
- `styles.css`: 슬라이드 화면, 인쇄, 반응형 스타일
- `app.js`: 슬라이드 데이터(`SLIDES`)·차트 수치(`DATA`)·실습 프롬프트(`PROMPTS`)와 내비게이션, SVG 차트 렌더링
- `assets/`: 슬라이드에 들어가는 실제 스크린샷
  - `github-signup-form.png` — GitHub 가입 화면
  - `codex-composer.png` — Codex 메인 컴포저(입력창·승인·모델 버튼)
  - `codex-nav-full.png` — Codex 왼쪽 내비(새 채팅·검색·플러그인·자동화 + 맨 아래 설정)
  - `codex-approval.png` — Codex 승인·권한 모드
  - `codex-model.png` — Codex 모델·추론 강도 선택

## 수정할 때

- 슬라이드 내용·수치·프롬프트는 `app.js`의 `SLIDES`/`DATA`/`PROMPTS`만 고치면 됩니다(데이터와 렌더링이 분리되어 있습니다).
- `app.js`나 `styles.css`를 고친 뒤에는 `index.html`의 `?v=...` 토큰을 새 값으로 올려 주세요. 그래야 이전 방문자의 브라우저 캐시가 갱신됩니다. (현재 값: `codex-screens-2`)
- 슬라이드 데이터는 핸드북(`docs/`)의 단일 출처이기도 하니, 수치를 바꾸면 양쪽이 어긋나지 않는지 함께 확인합니다.

