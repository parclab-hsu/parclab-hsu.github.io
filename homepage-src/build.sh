#!/usr/bin/env bash
# PARC Lab 메인 홈페이지 빌드 & 배포 스크립트
# - homepage-src/ 의 MkDocs(Material) 소스를 저장소 루트로 빌드합니다.
# - courses/, courses-src/, workshop-hansung/ 등 다른 서브사이트는 건드리지 않습니다.
#
# 사용법:  cd homepage-src && ./build.sh
set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SRC/.." && pwd)"
TMP="$(mktemp -d)"

echo "▶ MkDocs 빌드 중..."
mkdocs build -f "$SRC/mkdocs.yml" -d "$TMP" --clean

echo "▶ 이전 정적 페이지 정리..."
# 구버전(손으로 작성한) 루트 HTML 정리 — 존재할 때만
rm -f "$ROOT"/research.html "$ROOT"/projects.html "$ROOT"/people.html \
      "$ROOT"/publications.html "$ROOT"/news.html "$ROOT"/contact.html \
      "$ROOT"/courses.html "$ROOT"/style.css
# 홈페이지가 소유하는 빌드 산출물 정리 (courses/ 등은 보존)
rm -rf "$ROOT"/assets "$ROOT"/stylesheets "$ROOT"/search \
       "$ROOT"/research "$ROOT"/projects "$ROOT"/people \
       "$ROOT"/publications "$ROOT"/news "$ROOT"/contact

echo "▶ 루트로 복사..."
cp -rT "$TMP" "$ROOT"
# .nojekyll 보장 (GitHub Pages가 _ 폴더/언더스코어 자산을 그대로 서빙하도록)
touch "$ROOT/.nojekyll"

rm -rf "$TMP"
echo "✅ 완료 — 변경분을 git add/commit/push 하세요."
