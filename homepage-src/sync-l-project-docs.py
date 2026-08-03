#!/usr/bin/env python3
"""L-Project 저장소의 SRS/SDP를 홈페이지 공개 페이지로 동기화한다.

`docs/projects/l-project-{srs,sdp}.md` 는 L-Project 저장소 `docs/` 의 **정적
복사본**이라, 원문을 개정하면 이 페이지도 다시 만들어야 한다. build.sh가 빌드
직전에 본 스크립트를 호출해 그 수작업 단계를 없앤다.

원문 저장소 경로는 환경변수로 바꿀 수 있다:

    L_PROJECT_DOCS=/path/to/l-project-hils-ros2/docs ./build.sh

저장소를 찾을 수 없으면(NAS 미마운트 등) 경고만 남기고 기존 페이지를 그대로 둔다
- 홈페이지의 나머지 부분은 L-Project와 무관하므로 빌드를 막지 않는다.
"""

import os
import sys

DEFAULT_DOCS = '/mnt/nas-drive/Projects/2026/L-Project/l-project-hils-ros2/docs'

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, 'docs', 'projects')

# (원문 파일, 출력 파일, 제목, 안내 문구)
PAGES = [
    ('SRS.md', 'l-project-srs.md',
     'SRS — 소프트웨어 요구사항 명세서 (LPJ-HILS-SRS-001)',
     'IEEE 830 준용. 12축 로버 HILS 시스템의 기능·비기능·인터페이스 요구사항 전체를 정의하며, '
     '각 요구사항에는 검증 방법(I/T/D/A)과 현재 검증 상태가 부여되어 있습니다.'),
    ('SDP.md', 'l-project-sdp.md',
     'SDP — 소프트웨어 개발 계획서 (LPJ-HILS-SDP-001)',
     '개발 환경·형상 관리·개발 단계(P/A/N)·위험 관리·검증 전략과 시험 실적을 정의합니다. '
     '요구사항(SRS)의 구현·검증 경로를 추적하는 상위 계획 문서입니다.'),
]

HEAD = """# %(title)s

!!! abstract "문서 정보"
    %(blurb)s

    이 페이지는 저장소 `l-project-hils-ros2`의 `docs/%(source)s`를 그대로 게재한 것입니다
    (저장소는 비공개·승인제이며, 본 문서는 연구 성과 공개용으로 발췌 없이 수록).
    상위 프로젝트 개요는 [현대차 L-Project 12축 HILS 시스템](l-project-hils.md)을 참조하세요.

---

"""

TAIL = """

---

[:octicons-arrow-left-24: 프로젝트 개요로](l-project-hils.md){ .md-button }
[:octicons-file-document-16: %s 보기](%s){ .md-button }
"""


def render(src_path, title, blurb):
    text = open(src_path, encoding='utf-8').read()
    lines = text.split('\n')
    if not lines[0].startswith('# '):
        raise ValueError('%s: 첫 줄이 제목(#)이 아니다' % src_path)
    body = '\n'.join(lines[1:]).lstrip('\n')
    head = HEAD % {'title': title, 'blurb': blurb,
                   'source': os.path.basename(src_path)}
    other = ('SDP (개발 계획서)', 'l-project-sdp.md') if title.startswith('SRS') \
        else ('SRS (요구사항 명세서)', 'l-project-srs.md')
    return head + body + (TAIL % other)


def main():
    docs = os.environ.get('L_PROJECT_DOCS', DEFAULT_DOCS)
    if not os.path.isdir(docs):
        print('  ! L-Project 저장소를 찾을 수 없어 건너뜀: %s' % docs)
        print('    (기존 SRS/SDP 페이지를 그대로 둡니다)')
        return 0

    changed = []
    for source, out_name, title, blurb in PAGES:
        src_path = os.path.join(docs, source)
        if not os.path.isfile(src_path):
            print('  ! 원문 없음, 건너뜀: %s' % src_path)
            continue

        out_path = os.path.join(OUT_DIR, out_name)
        new = render(src_path, title, blurb)
        old = open(out_path, encoding='utf-8').read() \
            if os.path.isfile(out_path) else None
        if new == old:
            print('  = %s (변경 없음)' % out_name)
            continue
        open(out_path, 'w', encoding='utf-8').write(new)
        changed.append(out_name)
        print('  + %s 갱신' % out_name)

    if changed:
        print('  → 갱신됨: %s — 빌드 후 git add/commit 하세요' % ', '.join(changed))
    return 0


if __name__ == '__main__':
    sys.exit(main())
