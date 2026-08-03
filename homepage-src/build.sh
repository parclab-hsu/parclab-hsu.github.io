#!/usr/bin/env bash
# PARC Lab 메인 홈페이지 빌드 & 배포 스크립트
# - homepage-src/ 의 MkDocs(Material) 소스를 저장소 루트로 빌드합니다.
# - courses/, courses-src/, workshop-hansung/ 등 다른 서브사이트는 건드리지 않습니다.
#
# 사용법:  cd homepage-src && ./build.sh
set -euo pipefail

if [[ "${ALLOW_EXTERNAL_REDEPLOY:-}" != "1" ]]; then
  cat <<'EOF'
External redeploy is disabled.

This script copies generated files into the GitHub Pages public root.
Run it only when the user explicitly asks for deployment:

  ALLOW_EXTERNAL_REDEPLOY=1 ./build.sh
EOF
  exit 1
fi

SRC="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SRC/.." && pwd)"
TMP="$(mktemp -d)"

# L-Project SRS/SDP 공개 페이지는 저장소 docs/ 의 정적 복사본이라 원문 개정 시
# 다시 만들어야 한다. 저장소를 못 찾으면(NAS 미마운트 등) 경고만 남기고 진행.
echo "▶ L-Project SRS/SDP 동기화..."
python3 "$SRC/sync-l-project-docs.py"

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
