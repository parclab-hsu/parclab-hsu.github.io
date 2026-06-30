# PARC Lab Website

**Physical AI Real-Time Control for Mobility & Robotics**
한성대학교 미래모빌리티학과 · Hansung University

🌐 Live: https://parclab-hsu.github.io/

> 메인 홈페이지는 **Material for MkDocs** 기반으로 제작되어, `courses/` 강의 사이트들과 디자인이 통일되어 있습니다.

---

## 📁 구조

```
parclab-hsu.github.io/
├── homepage-src/          ← ⭐ 메인 홈페이지 소스 (MkDocs · 여기서 편집)
│   ├── mkdocs.yml         ← 사이트 설정·네비게이션·테마
│   ├── build.sh           ← 빌드 & 배포 스크립트
│   └── docs/
│       ├── index.md       ← 홈
│       ├── research.md    ← 연구분야
│       ├── projects.md    ← 프로젝트
│       ├── people.md      ← 구성원
│       ├── publications.md← 논문·성과
│       ├── news.md        ← 소식
│       ├── contact.md     ← 연락처
│       ├── assets/logo.png
│       └── stylesheets/extra.css  ← 커스텀 스타일(히어로 등)
│
├── index.html, research/, projects/, ...  ← homepage-src 빌드 산출물 (자동 생성)
├── courses/               ← 강의 사이트 (별도 빌드, courses-src/)
├── courses-src/           ← 강의 MkDocs 소스
└── workshop-hansung/      ← 워크샵 사이트
```

> ⚠️ 루트의 `index.html`, `research/`, `projects/` 등은 **자동 생성물**입니다. 직접 수정하지 말고 `homepage-src/docs/*.md`를 편집한 뒤 다시 빌드하세요.

---

## ✏️ 콘텐츠 수정 & 빌드

1. **내용 수정** — `homepage-src/docs/` 의 해당 `.md` 파일을 편집

   | 항목 | 파일 |
   |------|------|
   | 홈/히어로 | `docs/index.md` |
   | 연구분야 | `docs/research.md` |
   | 프로젝트 | `docs/projects.md` |
   | 구성원 | `docs/people.md` |
   | 논문·성과 | `docs/publications.md` |
   | 소식 | `docs/news.md` |
   | 연락처 | `docs/contact.md` |
   | 네비게이션·테마·색상 | `mkdocs.yml` |
   | 커스텀 디자인(히어로 등) | `docs/stylesheets/extra.css` |

2. **미리보기** (실시간)
   ```bash
   cd homepage-src
   mkdocs serve        # http://127.0.0.1:8000
   ```

3. **빌드 → 루트 배포** (`courses/` 등은 보존됨)
   ```bash
   cd homepage-src
   ./build.sh
   ```

4. **배포**
   ```bash
   git add -A
   git commit -m "Update homepage"
   git push
   ```
   → GitHub Pages가 몇 분 뒤 https://parclab-hsu.github.io/ 에 반영합니다.

### 필수 패키지
```bash
pip install mkdocs-material
```

---

## 🚀 GitHub Pages 설정

- 저장소 Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`
- 루트에 `.nojekyll` 가 있어야 MkDocs 자산이 정상 서빙됩니다 (이미 포함).

---

## 🎨 디자인

- **테마**: Material for MkDocs (light/dark 토글)
- **색상**: Teal (primary/accent) — 강의 사이트와 통일
- **폰트**: Noto Sans KR (본문) + JetBrains Mono (코드)
- **반응형**: 모바일/태블릿/데스크탑 완전 지원
- **기능**: 상단 탭 네비게이션, 전체 검색, 코드 복사, 다크모드

---

© 2026 PARC Lab · Hansung University · kblee@hansung.ac.kr
