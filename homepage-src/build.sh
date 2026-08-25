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

# sitemap 에서 색인 차단 경로 제외
#
# robots.txt 가 /projects/ 와 /courses/ 를 Disallow 하고 페이지에 noindex 메타도 넣는데,
# sitemap 에 URL 이 남아 있으면 "색인하지 말라면서 목록에는 올린다" 는 모순이 된다.
# mkdocs 는 페이지 단위 sitemap 제외를 지원하지 않아 후처리한다.
echo "▶ sitemap 정리 (색인 차단 경로 제외)..."
python3 - "$ROOT" <<'PYEOF'
import gzip, re, sys, os
root = sys.argv[1]
sm = os.path.join(root, "sitemap.xml")
if os.path.exists(sm):
    x = open(sm, encoding="utf-8").read()
    before = x.count("<url>")
    x = re.sub(r"\s*<url>(?:(?!</url>).)*?<loc>[^<]*/(?:projects|courses)/.*?</url>", "", x, flags=re.S)
    after = x.count("<url>")
    open(sm, "w", encoding="utf-8").write(x)
    with gzip.open(sm + ".gz", "wb") as f:
        f.write(x.encode("utf-8"))
    print("   URL %d -> %d (%d개 제외)" % (before, after, before - after))
PYEOF

rm -rf "$TMP"
echo "✅ 완료 — 변경분을 git add/commit/push 하세요."
