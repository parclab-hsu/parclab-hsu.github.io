# PARC Lab Website
**Physical AI Real-Time Control for Mobility & Robotics**  
한성대학교 미래모빌리티학과 · Hansung University

🌐 Live: https://parclab-hsu.github.io/

---

## 📁 File Structure

```
parclab-hsu.github.io/
├── index.html          ← Home (메인)
├── research.html       ← Research Areas (6개 연구 분야)
├── projects.html       ← Projects (진행중/계획중 프로젝트)
├── people.html         ← Members (교수, 대학원생, 학부 연구생)
├── publications.html   ← Publications (논문, 특허, 보고서)
├── news.html           ← News & Updates
├── contact.html        ← Contact Info & Collaboration
├── style.css           ← Shared stylesheet (모든 페이지 공통)
└── image.png           ← PARC Lab logo
```

---

## 🚀 GitHub Pages 배포 방법

1. **GitHub 저장소 생성**
   - 저장소 이름: `parclab-hsu.github.io`
   - Public으로 설정

2. **파일 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial PARC Lab website"
   git branch -M main
   git remote add origin https://github.com/parclab-hsu/parclab-hsu.github.io.git
   git push -u origin main
   ```

3. **GitHub Pages 활성화**
   - 저장소 Settings → Pages
   - Source: Deploy from a branch → `main` / `/ (root)`
   - Save 클릭

4. **접속 확인**
   - https://parclab-hsu.github.io/ (몇 분 후 활성화)

---

## ✏️ 콘텐츠 업데이트 가이드

| 항목 | 파일 | 업데이트 방법 |
|------|------|--------------|
| 연구원 프로필 | `people.html` | `.person` 카드의 이름/역할/설명 수정 |
| 논문 목록 | `publications.html` | `.pub-item` 블록 추가/수정 |
| 프로젝트 | `projects.html` | `.project-card` 블록 추가/수정 |
| 뉴스 | `news.html` | `.news-card` 블록 추가 (최신순) |
| 연락처 | `contact.html` | `.info-value` 내용 수정 |
| 연구실 위치(지도) | `contact.html` | `.map-placeholder` 를 Google Maps iframe으로 교체 |

---

## 🎨 디자인

- **테마**: Dark space / 우주 테마
- **색상**: Cyan (#6DDFF5) + Green (#5ED45E) + Blue (#1A88E0)
- **폰트**: Syne (제목) + DM Sans (본문) — Google Fonts
- **반응형**: 모바일/태블릿/데스크탑 완전 지원

---

© 2026 PARC Lab · Hansung University · kblee@hansung.ac.kr
