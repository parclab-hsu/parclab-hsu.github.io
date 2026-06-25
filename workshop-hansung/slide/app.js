const COLORS = {
  ink: "#18212f",
  muted: "#5d6876",
  line: "#d8dde5",
  teal: "#2f9eac",
  blue: "#3b6ea8",
  gold: "#e7a93c",
  red: "#c64545",
  green: "#4f9d69",
  violet: "#7a6fa6",
};

const DATA = {
  foreignTotals: [
    { year: 2023, total: 380 },
    { year: 2024, total: 400 },
    { year: 2025, total: 506 },
  ],
  foreignCountries2025: [
    { country: "베트남", total: 333 },
    { country: "중국", total: 68 },
    { country: "일본", total: 43 },
    { country: "미얀마", total: 28 },
    { country: "몽골", total: 15 },
  ],
  dropoutRates: [
    { label: "공시 2023\n기준 2022", enrolled: 364, dropout: 16, rate: 4.4 },
    { label: "공시 2024\n기준 2023", enrolled: 380, dropout: 24, rate: 6.3 },
    { label: "공시 2025\n기준 2024", enrolled: 400, dropout: 13, rate: 3.2 },
  ],
  admissionsByType: [
    { year: "2023", values: { "수능위주": 394, "학생부교과": 533, "학생부종합": 539, "실기위주": 152, "기타": 35 } },
    { year: "2024", values: { "수능위주": 535, "학생부교과": 472, "학생부종합": 496, "실기위주": 152, "기타": 36 } },
    { year: "2025", values: { "수능위주": 535, "학생부교과": 490, "학생부종합": 368, "실기위주": 144, "기타": 8 } },
  ],
  grades: [
    { year: "2023", values: { A: 49.6, B: 24.1, C: 20.3, D: 3.1, F: 2.9 } },
    { year: "2024", values: { A: 40.9, B: 34.8, C: 19.1, D: 2.6, F: 2.6 } },
    { year: "2025", values: { A: 43.2, B: 33.9, C: 18.3, D: 2.5, F: 2.1 } },
  ],
};

const PROMPTS = {
  inventory: `data 폴더 안의 파일들을 확인하고,
각 파일이 어떤 주제와 연도인지 표로 정리해줘.
파일을 읽기 전에 예상되는 분석 질문도 5개 제안해줘.`,
  structure: `data 폴더의 모든 xlsx 파일을 열어보고,
1) 파일명, 2) 주제, 3) 파일명 연도, 4) 실제 데이터 행 수,
5) 헤더가 시작되는 행, 6) 분석 시 주의점을 표로 정리해줘.

결과를 내기 전에 파일을 실제로 읽었는지 근거를 보여줘.`,
  failure: `엑셀 파일을 읽었을 때 한 칸만 보이거나 행 수가 이상하면,
파일 내부 구조와 실제 셀 태그 수를 확인해서 원인을 설명해줘.
가능하면 데이터를 복원하는 방법도 제안해줘.`,
  cleanGrades: `전공과목 성적 분포 파일을 분석 가능한 형태로 정리하려면
어떤 열은 위 행 값을 채워야 하고,
어떤 행은 제외해야 하는지 규칙을 제안해줘.

그 규칙으로 2023-2025년 성적 분포를 A/B/C/D/F 구간으로 요약해줘.`,
  validation: `방금 만든 분석 결과를 검증해줘.
원본 합계 행과 계산 결과를 비교하고,
기준연도/파일명 연도/분모/단위에서 해석상 주의할 점을 적어줘.
검증이 불충분한 부분은 '추가 확인 필요'라고 표시해줘.`,
  countryGrowth: `외국학생 현황 2023-2025 파일에서
국가별 총원 증감을 계산하고,
증가분이 큰 상위 5개 국가를 표로 보여줘.
합계 증가분과 국가별 증가분 합계가 맞는지도 확인해줘.`,
  storyboard: `지금까지 분석한 내용을 가지고
'AI 에이전트로 대학 행정 데이터를 분석하고 발표자료를 만드는 흐름'이라는 주제의
8장 발표자료 구성을 만들어줘.

슬라이드마다
1) 제목, 2) 핵심 메시지 한 문장, 3) 들어갈 차트나 표,
4) 발표할 때 말할 진행 멘트를 적어줘.
청중은 대학 교수이고, 실습형 워크숍에 맞는 자연스러운 말투로 작성해줘.`,
  htmlDeck: `위 구성안으로 GitHub Pages에 올릴 수 있는 웹 발표자료를 만들어줘.
조건은 다음과 같아.

- 발표자료/slide/index.html, styles.css, app.js로 구성
- 16:9 발표 화면
- 키보드로 이전/다음 이동
- 발표자 메모 토글
- 외국학생 총원 추이, 국가별 상위 국가, 중도탈락률, 성적분포 차트를 SVG로 렌더링
- 마지막에는 참가자가 다시 써볼 수 있는 프롬프트 카드 섹션 포함
- 외부 라이브러리 없이 GitHub Pages에서 바로 열리게 작성`,
  notes: `슬라이드마다 진행 메모를 작성해줘.
메모는 다음 형식으로 해줘.

- 말문 열기: 1문장
- 확인할 숫자: 1-2개
- 참가자에게 던질 질문: 1개
- 다음 슬라이드로 넘어갈 때 쓸 연결 문장: 1문장

너무 길게 쓰지 말고 실제 강의장에서 말할 수 있는 자연스러운 문장으로 써줘.`,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const DISPLAY_ENDINGS = [
  [/확인하겠습니다\.?$/, "확인"],
  [/해야 합니다\.?$/, "필요"],
  [/할 수 있습니다\.?$/, "가능"],
  [/수 있습니다\.?$/, "가능"],
  [/하지 않습니다\.?$/, "하지 않음"],
  [/지 않습니다\.?$/, "지 않음"],
  [/않습니다\.?$/, "않음"],
  [/입니다\.?$/, ""],
  [/합니다\.?$/, ""],
  [/됩니다\.?$/, "됨"],
  [/봅니다\.?$/, "보기"],
  [/둡니다\.?$/, "두기"],
  [/남깁니다\.?$/, "남기기"],
  [/만듭니다\.?$/, "만들기"],
  [/나눕니다\.?$/, "나누기"],
  [/엽니다\.?$/, "열기"],
  [/읽습니다\.?$/, "읽기"],
  [/씁니다\.?$/, "쓰기"],
  [/받습니다\.?$/, "받기"],
  [/잡습니다\.?$/, "잡기"],
  [/묻습니다\.?$/, "묻기"],
  [/졌습니다\.?$/, "짐"],
  [/있습니다\.?$/, "있음"],
  [/없습니다\.?$/, "없음"],
  [/좋습니다\.?$/, "좋음"],
  [/큽니다\.?$/, "큼"],
  [/습니다\.?$/, "음"],
];

const COMPACT_PHRASES = [
  [/확인하겠습니다/g, "확인"],
  [/확인했습니다/g, "확인"],
  [/증가했습니다/g, "증가"],
  [/달라졌습니다/g, "달라짐"],
  [/시작됩니다/g, "시작"],
  [/기록됩니다/g, "기록"],
  [/놓입니다/g, "놓임"],
  [/안정됩니다/g, "안정"],
  [/가능합니다/g, "가능"],
  [/필요합니다/g, "필요"],
  [/중요합니다/g, "중요"],
  [/충분합니다/g, "충분"],
  [/어렵습니다/g, "어려움"],
  [/쉽습니다/g, "쉬움"],
  [/많습니다/g, "많음"],
  [/높습니다/g, "높음"],
  [/낫습니다/g, "나음"],
  [/맞습니다/g, "맞음"],
  [/없습니다/g, "없음"],
  [/있습니다/g, "있음"],
  [/못합니다/g, "못함"],
  [/않습니다/g, "않음"],
  [/약합니다/g, "약함"],
  [/느슨합니다/g, "느슨함"],
  [/안전합니다/g, "안전"],
  [/적당합니다/g, "적당"],
  [/유용합니다/g, "유용"],
  [/좋습니다/g, "좋음"],
  [/고정합니다/g, "고정"],
  [/관리합니다/g, "관리"],
  [/구분합니다/g, "구분"],
  [/긋습니다/g, "긋기"],
  [/넣습니다/g, "넣기"],
  [/논리입니다/g, "논리"],
  [/말합니다/g, "말하기"],
  [/만들어봅니다/g, "만들어보기"],
  [/넘겨봅니다/g, "넘겨보기"],
  [/눌러봅니다/g, "눌러보기"],
  [/열어봅니다/g, "열어보기"],
  [/묻습니다/g, "묻기"],
  [/반복합니다/g, "반복"],
  [/분리합니다/g, "분리"],
  [/분석합니다/g, "분석"],
  [/비교합니다/g, "비교"],
  [/사용합니다/g, "사용"],
  [/선택합니다/g, "선택"],
  [/설계합니다/g, "설계"],
  [/설명합니다/g, "설명"],
  [/습관화합니다/g, "습관화"],
  [/승인합니다/g, "승인"],
  [/시작합니다/g, "시작"],
  [/안내합니다/g, "안내"],
  [/압축합니다/g, "압축"],
  [/연결합니다/g, "연결"],
  [/요구합니다/g, "요구"],
  [/이해합니다/g, "이해"],
  [/입력합니다/g, "입력"],
  [/잡습니다/g, "잡기"],
  [/전달합니다/g, "전달"],
  [/전환합니다/g, "전환"],
  [/정리합니다/g, "정리"],
  [/정합니다/g, "정하기"],
  [/제시합니다/g, "제시"],
  [/준비합니다/g, "준비"],
  [/줄입니다/g, "줄이기"],
  [/지시합니다/g, "지시"],
  [/지정합니다/g, "지정"],
  [/진행합니다/g, "진행"],
  [/짚습니다/g, "짚기"],
  [/참여합니다/g, "참여"],
  [/표시합니다/g, "표시"],
  [/피드백합니다/g, "피드백"],
  [/피합니다/g, "피하기"],
  [/합의합니다/g, "합의"],
  [/허용합니다/g, "허용"],
  [/확장합니다/g, "확장"],
  [/기준점입니다/g, "기준점"],
  [/공간입니다/g, "공간"],
  [/관리입니다/g, "관리"],
  [/교육입니다/g, "교육"],
  [/검증자입니다/g, "검증자"],
  [/것입니다/g, "것"],
  [/문장입니다/g, "문장"],
  [/목표입니다/g, "목표"],
  [/방식입니다/g, "방식"],
  [/순서입니다/g, "순서"],
  [/슬라이드입니다/g, "슬라이드"],
  [/에이전트입니다/g, "에이전트"],
  [/원칙입니다/g, "원칙"],
  [/장면입니다/g, "장면"],
  [/중심입니다/g, "중심"],
  [/층위입니다/g, "층위"],
  [/파일입니다/g, "파일"],
  [/편집본입니다/g, "편집본"],
  [/프롬프트입니다/g, "프롬프트"],
  [/흐름입니다/g, "흐름"],
  [/가지입니다/g, "가지"],
  [/차트입니다/g, "차트"],
  [/틀입니다/g, "틀"],
];

function compactLine(value) {
  let text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  for (const [pattern, replacement] of COMPACT_PHRASES) {
    text = text.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of DISPLAY_ENDINGS) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/[.。]$/, "").trim();
}

function compactDisplayText(value) {
  return String(value)
    .split("\n")
    .map((line) => compactLine(line))
    .join("\n");
}

function cardBodyItems(body) {
  return String(body)
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => compactLine(line))
    .filter(Boolean);
}

function compactPlainElement(element) {
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.nodeValue = compactDisplayText(node.nodeValue);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      compactPlainElement(node);
    }
  });
}

function compactRenderedSlideText(root) {
  root.querySelectorAll(".note-strip, .table th, .table td").forEach((element) => {
    compactPlainElement(element);
  });
}

function card(title, body, accent = COLORS.teal, dark = false) {
  const items = cardBodyItems(body);
  return `
    <article class="card ${dark ? "card--dark" : ""}" style="--accent:${accent}">
      <h3 class="card__title">${escapeHtml(compactDisplayText(title))}</h3>
      <ul class="card__body">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `;
}

function metric(value, label, accent = COLORS.teal) {
  return `
    <div class="metric" style="--accent:${accent}">
      <div>
        <div class="metric__value">${escapeHtml(value)}</div>
        <div class="metric__label">${escapeHtml(label)}</div>
      </div>
    </div>
  `;
}

function promptBox(label, text) {
  return `
    <div class="prompt">
      <button class="prompt__copy" type="button" data-prompt="${escapeHtml(text)}">복사</button>
      <div class="prompt__label">${escapeHtml(label)}</div>
      <pre class="prompt__text">${escapeHtml(text)}</pre>
    </div>
  `;
}

function bullets(items) {
  return `<ul class="bullets">${items.map((item) => `<li>${escapeHtml(compactLine(item))}</li>`).join("")}</ul>`;
}

function table(headers, rows) {
  return `
    <table class="table">
      <thead>
        <tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function timeline(steps) {
  return `
    <div class="timeline" style="--count:${steps.length}">
      ${steps
        .map(
          (step) => `
              <div class="timeline__step">
              <div class="timeline__title">${escapeHtml(compactDisplayText(step.title))}</div>
              <div class="timeline__subtitle">${escapeHtml(compactDisplayText(step.subtitle))}</div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function screenshotFigure(src, alt, caption) {
  return `
    <figure class="screenshot-card">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
      <figcaption>${escapeHtml(caption)}</figcaption>
    </figure>
  `;
}

function codexDesktopMock() {
  return `
    <div class="codex-window" role="img" aria-label="Codex Desktop App의 프로젝트, 스레드, 모드, 브라우저, 터미널, Diff, 승인 요청 영역 예시">
      <div class="codex-window__bar">
        <span class="codex-window__dot"></span>
        <span class="codex-window__dot"></span>
        <span class="codex-window__dot"></span>
        <strong>Codex</strong>
        <span>workshop-hansung</span>
      </div>
      <div class="codex-window__body">
        <aside class="codex-window__sidebar">
          <div class="codex-window__project">workshop-hansung</div>
          <div class="codex-window__nav is-active">+ 새 스레드</div>
          <div class="codex-window__nav">데이터 분석</div>
          <div class="codex-window__nav">발표자료 제작</div>
          <div class="codex-window__spacer"></div>
          <div class="codex-window__nav">Skills</div>
          <div class="codex-window__nav">Settings</div>
        </aside>
        <main class="codex-window__thread">
          <div class="codex-window__toolbar">
            <span class="codex-window__mode">Local</span>
            <span>Browser</span>
            <span>Terminal</span>
            <span>Diff</span>
          </div>
          <div class="codex-window__message codex-window__message--user">
            data 폴더의 엑셀을 읽고 분석 계획을 세워줘.
          </div>
          <div class="codex-window__message">
            계획을 세우고 파일 구조를 확인하겠습니다.
          </div>
          <div class="codex-window__approval">
            <strong>권한 요청</strong>
            <span>네트워크 또는 작업 폴더 밖 접근은 범위를 확인합니다.</span>
            <div>
              <button type="button">승인 1회</button>
              <button type="button">세션 승인</button>
            </div>
          </div>
          <div class="codex-window__composer">Codex에게 다음 작업을 자연어로 지시합니다</div>
        </main>
      </div>
    </div>
  `;
}

function chartShell(chartHtml, insight, question, accent = COLORS.red) {
  return `
    <div class="chart-layout">
      <div class="chart-card">${chartHtml}</div>
      <div class="insight-stack">
        ${card("읽을 포인트", insight, accent)}
        ${card("참가자 질문", question, COLORS.teal)}
      </div>
    </div>
  `;
}

function svgLineChart(data, title) {
  const width = 720;
  const height = 390;
  const margin = { top: 58, right: 44, bottom: 54, left: 70 };
  const yMin = 330;
  const yMax = 580;
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const x = (idx) => margin.left + (plotW * idx) / (data.length - 1);
  const y = (value) => margin.top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
  const points = data.map((d, i) => `${x(i)},${y(d.total)}`).join(" ");
  const grid = [350, 400, 450, 500, 550]
    .map(
      (tick) => `
        <line class="chart-grid" x1="${margin.left}" x2="${width - margin.right}" y1="${y(tick)}" y2="${y(tick)}" />
        <text class="chart-label" x="${margin.left - 12}" y="${y(tick) + 4}" text-anchor="end">${tick}</text>
      `,
    )
    .join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
      <text class="chart-title" x="${margin.left}" y="28">${escapeHtml(title)}</text>
      ${grid}
      <line class="chart-axis" x1="${margin.left}" x2="${width - margin.right}" y1="${margin.top + plotH}" y2="${margin.top + plotH}" />
      <polyline points="${points}" fill="none" stroke="${COLORS.teal}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      ${data
        .map(
          (d, i) => `
            <circle cx="${x(i)}" cy="${y(d.total)}" r="7" fill="${COLORS.teal}" />
            <text class="chart-value" x="${x(i)}" y="${y(d.total) - 15}" text-anchor="middle">${d.total}명</text>
            <text class="chart-label" x="${x(i)}" y="${height - 18}" text-anchor="middle">${d.year}</text>
          `,
        )
        .join("")}
    </svg>
  `;
}

function svgHorizontalBarChart(data, title) {
  const width = 720;
  const height = 390;
  const margin = { top: 58, right: 42, bottom: 28, left: 104 };
  const plotW = width - margin.left - margin.right;
  const barH = 40;
  const gap = 16;
  const max = Math.max(...data.map((d) => d.total));
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
      <text class="chart-title" x="${margin.left}" y="28">${escapeHtml(title)}</text>
      ${data
        .map((d, idx) => {
          const y = margin.top + idx * (barH + gap);
          const w = (d.total / max) * plotW;
          return `
            <text class="chart-label" x="${margin.left - 14}" y="${y + 25}" text-anchor="end">${escapeHtml(d.country)}</text>
            <rect x="${margin.left}" y="${y}" width="${w}" height="${barH}" rx="6" fill="${idx === 0 ? COLORS.teal : COLORS.blue}" />
            <text class="chart-value" x="${margin.left + w + 10}" y="${y + 25}">${d.total}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgDropoutChart(data, title) {
  const width = 720;
  const height = 390;
  const margin = { top: 58, right: 42, bottom: 76, left: 70 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const max = 8;
  const barW = 100;
  const colors = [COLORS.green, COLORS.red, COLORS.teal];
  const x = (idx) => margin.left + idx * (plotW / data.length) + (plotW / data.length - barW) / 2;
  const y = (value) => margin.top + plotH - (value / max) * plotH;
  const grid = [0, 2, 4, 6, 8]
    .map(
      (tick) => `
        <line class="chart-grid" x1="${margin.left}" x2="${width - margin.right}" y1="${y(tick)}" y2="${y(tick)}" />
        <text class="chart-label" x="${margin.left - 12}" y="${y(tick) + 4}" text-anchor="end">${tick}%</text>
      `,
    )
    .join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
      <text class="chart-title" x="${margin.left}" y="28">${escapeHtml(title)}</text>
      ${grid}
      ${data
        .map((d, idx) => {
          const h = margin.top + plotH - y(d.rate);
          const labelLines = d.label.split("\n");
          return `
            <rect x="${x(idx)}" y="${y(d.rate)}" width="${barW}" height="${h}" rx="7" fill="${colors[idx]}" />
            <text class="chart-value" x="${x(idx) + barW / 2}" y="${y(d.rate) - 24}" text-anchor="middle">${d.rate.toFixed(1)}%</text>
            <text class="chart-label" x="${x(idx) + barW / 2}" y="${y(d.rate) - 7}" text-anchor="middle">${d.dropout}/${d.enrolled}</text>
            <text class="chart-label" x="${x(idx) + barW / 2}" y="${height - 42}" text-anchor="middle">${escapeHtml(labelLines[0])}</text>
            <text class="chart-label" x="${x(idx) + barW / 2}" y="${height - 24}" text-anchor="middle">${escapeHtml(labelLines[1])}</text>
          `;
        })
        .join("")}
    </svg>
  `;
}

function svgStackedBarChart(data, title, categories, maxValue, isPercent = false) {
  const width = 720;
  const height = 390;
  const margin = { top: 58, right: 28, bottom: 82, left: 70 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const colors = {
    "수능위주": COLORS.blue,
    "학생부교과": COLORS.teal,
    "학생부종합": COLORS.gold,
    "실기위주": COLORS.red,
    "기타": COLORS.muted || "#5d6876",
    A: COLORS.teal,
    B: COLORS.blue,
    C: COLORS.gold,
    D: COLORS.red,
    F: COLORS.violet,
  };
  const barW = 104;
  const x = (idx) => margin.left + idx * (plotW / data.length) + (plotW / data.length - barW) / 2;
  const y = (value) => margin.top + plotH - (value / maxValue) * plotH;
  const gridTicks = isPercent ? [0, 25, 50, 75, 100] : [0, 500, 1000, 1500];
  const grid = gridTicks
    .map(
      (tick) => `
        <line class="chart-grid" x1="${margin.left}" x2="${width - margin.right}" y1="${y(tick)}" y2="${y(tick)}" />
        <text class="chart-label" x="${margin.left - 12}" y="${y(tick) + 4}" text-anchor="end">${tick}${isPercent ? "%" : ""}</text>
      `,
    )
    .join("");
  const bars = data
    .map((row, idx) => {
      let cursor = 0;
      const segments = categories
        .map((cat) => {
          const value = row.values[cat] || 0;
          const segmentY = y(cursor + value);
          const segmentH = y(cursor) - segmentY;
          cursor += value;
          return `<rect x="${x(idx)}" y="${segmentY}" width="${barW}" height="${segmentH}" fill="${colors[cat]}" />`;
        })
        .join("");
      return `
        ${segments}
        <text class="chart-label" x="${x(idx) + barW / 2}" y="${height - 42}" text-anchor="middle">${escapeHtml(row.year)}</text>
      `;
    })
    .join("");
  const legend = categories
    .map((cat, idx) => {
      const lx = margin.left + idx * 112;
      return `
        <rect x="${lx}" y="${height - 24}" width="12" height="12" rx="2" fill="${colors[cat]}" />
        <text class="chart-label" x="${lx + 18}" y="${height - 14}">${escapeHtml(cat)}</text>
      `;
    })
    .join("");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}">
      <text class="chart-title" x="${margin.left}" y="28">${escapeHtml(title)}</text>
      ${grid}
      ${bars}
      ${legend}
    </svg>
  `;
}

const slides = [
  {
    type: "cover",
    title: "AI 에이전트로\n데이터 분석 및\n발표자료 제작",
    subtitle: "한성대학교 교수법 워크숍 | 4시간 실습형 진행안",
    body: `
      <div class="cover-layout">
        <div>
          <div class="cover-kicker">한성대학교 교수법 워크숍</div>
          <h1 class="cover-title">AI 에이전트로<br />데이터 분석 및<br />발표자료 제작</h1>
          <p class="cover-subtitle">설치 → 데이터 읽기 → 분석/검증 → 웹 발표자료 → Q&A 클리닉</p>
        </div>
        <div class="cover-card">
          ${card("오늘 만들어볼 것", "AI 에이전트에게 로컬 엑셀 자료를 읽히고, 핵심 인사이트를 검증한 뒤, GitHub Pages에 올릴 수 있는 발표자료 초안까지 만들어봅니다.", COLORS.gold, true)}
          ${card("오늘의 핵심", "좋은 프롬프트 한 줄보다 중요한 것은 자료를 확인하고, 이상한 점을 찾고, 정제와 검증을 거쳐 결과물로 연결하는 흐름입니다.", COLORS.red, true)}
        </div>
      </div>
    `,
    notes: "시작 3분 안에 오늘은 코딩 강의가 아니라 업무 자료를 AI와 함께 다루는 워크숍이라고 안내합니다. 최종 결과물이 PPTX가 아니라 웹 슬라이드라는 점도 여기서 분명히 말합니다.",
  },
  {
    section: "오프닝",
    title: "오늘 끝나면 남길 결과물",
    subtitle: "완성도보다 흐름을 몸으로 익히는 것이 목표입니다.",
    body: `
      <div class="grid grid--3">
        ${card("1. 데이터 지도", "data 폴더의 엑셀 파일이 어떤 주제와 연도를 담고 있는지 표로 정리합니다.\n완성 형태: 파일명, 연도, 시트, 행/열 수", COLORS.teal)}
        ${card("2. 검증된 인사이트", "AI가 만든 분석 결과를 행 수, 합계, 기준연도, 샘플 행으로 다시 확인합니다.\n완성 형태: 근거가 붙은 결론 문장 1개", COLORS.red)}
        ${card("3. 웹 슬라이드 초안", "분석 결과를 발표 흐름으로 바꾸고 GitHub Pages로 공유할 수 있는 형태까지 연결합니다.\n완성 형태: HTML 파일과 실제 공유 URL", COLORS.gold)}
      </div>
      <div style="margin-top:30px" class="note-strip">오늘의 성공 기준 | 완벽한 산출물보다, AI에게 일을 맡기고 결과를 의심하고 다시 고치는 절차를 익히는 것입니다.</div>
    `,
    notes: "참가자가 결과물을 너무 크게 상상하지 않도록 범위를 잡아줍니다. 오늘은 산출물 완성보다 작업 절차를 배우는 시간이라고 말합니다.",
  },
  {
    section: "오프닝",
    title: "진행 방식: 짧게 맡기고 바로 확인",
    subtitle: "긴 설명보다 작은 작업 단위를 반복합니다.",
    body: `
      ${timeline([
        { title: "보기", subtitle: "3-5분 시연" },
        { title: "따라 하기", subtitle: "같은 프롬프트" },
        { title: "확인", subtitle: "행 수·합계 점검" },
        { title: "고치기", subtitle: "추가 지시" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("수강생에게 강조", "처음부터 완성하려 하지 않음\n첫 결과를 보고 다음 질문 만들기\n결과보다 확인 과정을 말로 남기기")}
        ${card("강사에게 강조", "막힌 화면은 함께 읽기\n설치·판독·권한 문제도 학습 장면\n멈춘 이유를 질문으로 바꾸기", COLORS.blue)}
      </div>
    `,
    notes: "이 슬라이드는 워크숍의 리듬을 정합니다. 한 번에 오래 설명하지 않고 작은 루프를 반복하겠다고 안내합니다.",
  },
  {
    section: "오프닝",
    title: "오늘 4시간은 이렇게 씁니다",
    subtitle: "설치가 끝나면 바로 실제 자료를 다룹니다.",
    body: `
      <div class="metric-row">
        ${metric("1시간", "설치와 작업 폴더 열기", COLORS.teal)}
        ${metric("1시간", "데이터 분석", COLORS.blue)}
        ${metric("1시간", "웹 발표자료 제작", COLORS.gold)}
        ${metric("1시간", "Q&A 클리닉", COLORS.red)}
      </div>
      <div style="margin-top:30px">${bullets(["앞 1시간은 설치 편차를 흡수하기 위해 넉넉하게 둡니다.", "중간 2시간은 데모-실습-검증을 짧게 반복합니다.", "마지막 1시간은 각자의 업무 자료로 옮겨갈 질문을 정리합니다."])}</div>
    `,
    notes: "참가자가 개발자가 아니어도 괜찮다는 점을 먼저 안내합니다. 오늘의 핵심은 도구 기능이 아니라 일하는 순서입니다.",
  },
  {
    section: "오프닝",
    title: "전체 시간표",
    subtitle: "설치 편차를 감안해 앞 1시간은 여유 있게, 나머지는 데모-실습-검증으로 짧게 반복합니다.",
    body: table(
      ["시간", "세션", "진행 내용", "참가자 결과"],
      [
        ["00:00-00:10", "문제 설정", "AI 에이전트 작업 흐름 소개", "오늘 다룰 자료 이해"],
        ["00:10-00:50", "GitHub/Codex 준비", "GitHub 가입, Codex 접속, 권한 설명", "계정 로그인과 작업 폴더 연결"],
        ["00:50-01:00", "첫 프롬프트", "파일 목록 파악 시연", "데이터 목록 요약"],
        ["01:00-02:00", "데이터 분석", "정제, 차트, 검증 프롬프트", "핵심 인사이트 1개"],
        ["02:00-03:00", "웹 발표자료 제작", "분석 결과를 웹 슬라이드로 전환", "웹 발표자료 초안"],
        ["03:00-04:00", "Q&A 클리닉", "개인/학과 자료 적용 상담", "다음 실천 과제"],
      ],
    ),
    notes: "휴식은 현장 상태에 맞춰 5-10분씩 넣습니다. 설치가 늦는 참가자는 옆 사람 화면을 보며 검증자 역할을 맡게 합니다.",
  },
  {
    section: "오프닝",
    title: "진행 전 준비 체크리스트",
    subtitle: "설치가 길어질수록 예비 자료와 데모 동선이 중요합니다.",
    body: `
      <div class="grid grid--3">
        ${card("파일", "data 폴더가 참가자 PC에 내려받아졌는지 확인\n파일명 한글/공백이 그대로 유지되는지 확인\n데모용 백업 폴더를 준비")}
        ${card("환경", "GitHub 계정 또는 가입용 이메일 확인\nOpenAI 계정 로그인 확인\n기관 네트워크 접속 제한 확인", COLORS.gold)}
        ${card("진행", "프롬프트 카드 열어두기\n결과가 다르게 나올 때 보여줄 기준 수치 준비\n개인정보 자료 입력 금지 원칙 안내", COLORS.red)}
      </div>
      <div style="margin-top:28px">${bullets(["설치가 안 된 참가자는 관찰자가 아니라 검증자 역할로 함께 참여합니다.", "정답을 바로 맞히는 것보다 확인 질문을 어떻게 이어가는지가 더 중요합니다.", "AI가 한 번에 못 읽는 상황은 실패가 아니라 좋은 실습 장면으로 다룹니다."])}</div>
    `,
    notes: "이 슬라이드는 실제 발표에서는 빠르게 넘기고, 진행 준비용 체크리스트로 활용하면 됩니다.",
  },
  {
    section: "설치",
    title: "GitHub는 오늘의 배포 공간입니다",
    subtitle: "처음 쓰는 참가자에게는 저장소보다 '링크로 나누는 작업 폴더'로 설명합니다.",
    body: `
      <div class="grid grid--3">
        ${card("파일 보관", "HTML, CSS, JS 파일을 웹에 올릴 수 있는 공간입니다.\n오늘 만든 발표자료 파일이 여기에 놓입니다.\n참가자는 링크 하나로 결과물을 다시 엽니다.", COLORS.blue)}
        ${card("변경 기록", "수정할 때마다 어떤 파일이 바뀌었는지 기록됩니다.\nAI가 만든 결과를 되돌아볼 때 유용합니다.\n실수했을 때 이전 상태를 확인할 수 있습니다.", COLORS.gold)}
        ${card("Pages 배포", "정적 HTML 파일을 별도 서버 없이 웹 주소로 공개할 수 있습니다.\n수강생은 링크 하나로 결과물을 확인합니다.\n오늘은 GitHub를 배포 공간으로만 이해해도 충분합니다.", COLORS.teal)}
      </div>
      <div style="margin-top:30px" class="note-strip">짧은 설명 | GitHub는 개발자만 쓰는 공간이 아니라, 오늘은 웹 발표자료를 올리고 공유하는 장소로 사용합니다.</div>
    `,
    notes: "Git, 저장소, 브랜치 같은 용어를 처음부터 모두 설명하지 않습니다. 파일을 올리고 링크로 공유하는 공간이라는 설명으로 시작하세요.",
  },
  {
    section: "설치",
    title: "GitHub 계정부터 준비합니다",
    subtitle: "GitHub를 처음 쓰는 참가자도 가입과 이메일 인증까지 진행할 수 있게 안내합니다.",
    body: `
      <div class="screenshot-layout screenshot-layout--signup">
        ${screenshotFigure(
          "./assets/github-signup-form.png?v=signup-crop-1",
          "GitHub 가입 화면: 이메일, 비밀번호, 사용자명, 국가/지역 입력 후 Create account 버튼을 누르는 공개 가입 양식",
          "github.com/signup 공개 가입 화면",
        )}
        <div class="insight-stack">
          ${card("가입 순서", "접속: github.com/signup\n입력: 계정 정보와 Country/Region\n생성: Create account 후 이메일 인증", COLORS.blue)}
          ${card("현장 체크", "사용자명은 공개 주소에 포함\n무료 계정으로 충분\n메일이 없으면 스팸함 확인", COLORS.red)}
        </div>
      </div>
    `,
    notes: "GitHub를 모르는 참가자에게는 '자료를 올려두고 링크로 나누는 공간' 정도로 설명하면 충분합니다. 가입 화면 문구는 바뀔 수 있으니 주소와 이메일 인증만 분명히 잡습니다.",
  },
  {
    section: "설치",
    title: "가입 후 확인할 것",
    subtitle: "가입 완료와 실습 가능 상태는 다릅니다.",
    body: `
      <div class="grid grid--2 check-grid">
        ${card("로그인", "우측 상단 프로필 확인\n안 보이면 로그인부터", COLORS.blue)}
        ${card("이메일 인증", "인증 메일 클릭\n전에는 저장소·배포 제한 가능", COLORS.gold)}
        ${card("사용자명", "공개 주소에 포함\n실명·학번 그대로 사용 금지", COLORS.red)}
        ${card("결제 화면", "무료 계정으로 충분\n유료 안내는 건너뛰기", COLORS.green)}
      </div>
      <div style="margin-top:28px" class="note-strip">운영 기준 | 인증 지연 시 개인 메일 사용 / 계정 생성이 막히면 강사 화면으로 검증자 역할</div>
    `,
    notes: "가입 화면에서 시간이 많이 흐르지 않도록 완료 기준을 명확히 말합니다. 로그인, 이메일 인증, 사용자명만 확인하면 다음으로 넘어갑니다.",
  },
  {
    section: "설치",
    title: "Codex에서 오늘 할 일은 네 가지입니다",
    subtitle: "기능 목록보다 작업 흐름을 먼저 잡습니다.",
    body: `
      ${timeline([
        { title: "폴더 열기", subtitle: "작업 폴더 연결" },
        { title: "자료 읽기", subtitle: "data 엑셀 확인" },
        { title: "파일 만들기", subtitle: "slide 파일 생성" },
        { title: "결과 확인", subtitle: "Browser/Diff 검토" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("수강생에게 필요한 이해", "Codex는 채팅창이 아니라 작업 폴더 안에서 파일을 읽고 고치고 확인하는 에이전트입니다.\n오늘은 data 폴더와 slide 폴더를 오가며 일하게 합니다.", COLORS.teal)}
        ${card("강사가 지킬 기준", "오늘 쓰는 버튼만 보여주기\n프로젝트·새 스레드·Browser·Terminal·Diff·Approval\n실제 화면에서 눌러 보며 설명", COLORS.gold)}
      </div>
    `,
    notes: "Codex 기능을 많이 설명하려고 하면 설치 시간이 길어집니다. 오늘 실제로 쓰는 네 가지 행동으로 압축합니다.",
  },
  {
    section: "설치",
    title: "Codex 설치와 접속에서 확인할 것",
    subtitle: "제품 메뉴는 바뀔 수 있으니, 오늘 필요한 개념만 짧게 전달합니다.",
    body: `
      <div class="grid grid--2">
        ${card("계정", "OpenAI 계정으로 로그인되어 있는지 확인합니다. 계정별 기능 차이는 강의 당일 본인 화면을 기준으로 안내합니다.", COLORS.gold)}
        ${card("작업 폴더", "Codex에서 이 저장소 폴더를 열었는지 확인합니다. 다른 폴더를 열면 data 파일을 찾지 못합니다.", COLORS.blue)}
        ${card("네트워크", "GitHub, OpenAI, Pages 접속이 기관 네트워크에서 막히지 않는지 확인합니다.", COLORS.teal)}
        ${card("권한 요청", "파일 쓰기, 명령 실행, 네트워크 접근 요청이 뜨면 이유와 범위를 읽고 승인합니다.", COLORS.red)}
      </div>
    `,
    notes: "설치 안내는 길어지기 쉽습니다. 제품 기능보다 오늘의 작업 폴더와 권한 범위에 집중하세요.",
  },
  {
    section: "설치",
    title: "Codex Desktop App 버튼을 먼저 읽습니다",
    subtitle: "수강생이 화면에서 길을 잃지 않도록 입력창, 권한(승인) 모드, 모델 선택 같은 오늘 쓰는 버튼만 짚습니다.",
    body: `
      <div class="screenshot-layout">
        ${screenshotFigure(
          "./assets/codex-composer.png?v=codex-1",
          "Codex 데스크톱 앱 메인 화면: 입력창과 +, 나 대신 승인, 모델·추론 강도, 음성, 전송, 프로젝트에서 작업하기 버튼",
          "Codex 데스크톱 앱 메인 화면",
        )}
        <div class="insight-stack">
          ${card("입력창과 전송", "무엇이든 해보세요: 할 일을 한국어로 입력\n+ : 파일·자료 추가\n↑ : 전송해 작업 시작", COLORS.blue)}
          ${card("권한·모델 버튼", "나 대신 승인: 권한 모드 선택\n5.5 매우 높음: 모델·추론 강도\n프로젝트에서 작업하기: 작업 폴더 연결", COLORS.teal)}
        </div>
      </div>
    `,
    notes: "Codex 앱 UI는 업데이트될 수 있습니다. 강의에서는 버튼 이름 자체보다 프로젝트, 새 스레드, Local/Worktree, Browser, Terminal, Diff, Approval의 역할을 잡아주면 충분합니다.",
  },
  {
    section: "설치",
    title: "왼쪽 내비게이션으로 작업을 오갑니다",
    subtitle: "새 작업 시작, 검색, 외부 도구 연결은 모두 왼쪽 사이드바에서 합니다.",
    body: `
      <div class="screenshot-layout">
        ${screenshotFigure(
          "./assets/codex-nav-full.png?v=codex-1",
          "Codex 왼쪽 내비게이션: 새 채팅, 검색, 플러그인, 자동화 버튼과 맨 아래 설정 버튼",
          "Codex 왼쪽 내비게이션 (맨 아래 설정 포함)",
        )}
        <div class="insight-stack">
          ${card("오늘 쓰는 버튼", "새 채팅: 새 작업(스레드) 시작\n검색: 지난 스레드·내용 찾기\n설정: 계정·환경 (맨 아래)", COLORS.blue)}
          ${card("나중에 볼 버튼", "플러그인: 외부 앱·도구 연결\n자동화: 반복 작업 예약·자동 실행", COLORS.gold)}
        </div>
      </div>
    `,
    notes: "오늘은 '새 채팅'으로 작업 단위를 나누는 것만 확실히 잡습니다. 플러그인·자동화는 있다는 것만 보여주고 깊이 들어가지 않습니다.",
  },
  {
    section: "설치",
    title: "권한 모드는 승인 전에 함께 정합니다",
    subtitle: "'나 대신 승인'을 누르면 어디까지 자동으로 허용할지 고를 수 있습니다.",
    body: `
      <div class="screenshot-layout">
        ${screenshotFigure(
          "./assets/codex-approval.png?v=codex-1",
          "Codex 승인 권한 모드 드롭다운: 승인 요청, 나 대신 승인, 전체 권한, 사용자 지정(config.toml) 선택지",
          "Codex 권한(승인) 모드 선택",
        )}
        <div class="insight-stack">
          ${card("권한 모드 네 가지", "승인 요청: 외부 수정·인터넷 시 항상 확인\n나 대신 승인: 위험 작업만 확인 (오늘 기본)\n전체 권한: 제한 없이 접근 (권장 안 함)", COLORS.blue)}
          ${card("워크숍 기준", "작업 폴더 밖 접근 허용 안 함\n민감정보 접근 허용 안 함\n승인 화면을 교육 장면으로 활용", COLORS.red)}
        </div>
      </div>
    `,
    notes: "권한 화면은 보안 주제와 직접 연결됩니다. 오늘은 '나 대신 승인' 또는 '승인 요청'으로 시작하고, 폴더 밖·민감정보 접근은 허용하지 않는다고 분명히 말합니다.",
  },
  {
    section: "설치",
    title: "모델과 추론 강도를 작업에 맞춥니다",
    subtitle: "어려운 분석은 깊게, 간단한 작업은 빠르게 — 컴포저 오른쪽에서 고릅니다.",
    body: `
      <div class="screenshot-layout">
        ${screenshotFigure(
          "./assets/codex-model.png?v=codex-1",
          "Codex 모델·추론 강도 선택: 추론 낮음/중간/높음/매우 높음, 모델 GPT-5.5, 속도",
          "Codex 모델·추론 강도 선택",
        )}
        <div class="insight-stack">
          ${card("추론 강도", "낮음·중간·높음·매우 높음\n깊을수록 정확하지만 느림\n어려운 분석은 높게, 간단한 작업은 낮게", COLORS.teal)}
          ${card("모델·속도", "모델: 사용할 모델(GPT-5.5 등) 선택\n속도: 응답 속도를 우선하는 옵션", COLORS.violet)}
        </div>
      </div>
    `,
    notes: "강도 차이를 길게 설명하지 말고, 분석이 막히면 강도를 올려 다시 시켜보라는 정도로 안내합니다.",
  },
  {
    section: "설치",
    title: "새 스레드는 작업 단위로 나눕니다",
    subtitle: "한 스레드에 모든 일을 넣기보다, 목표가 바뀔 때 새로 시작합니다.",
    body: `
      <div class="grid grid--3">
        ${card("설치 확인 스레드", "폴더가 열렸는지, data 폴더가 보이는지, 파일 목록을 읽을 수 있는지 확인합니다.\n완료 기준: 파일 목록 요약이 나온다.", COLORS.teal)}
        ${card("데이터 분석 스레드", "엑셀 구조 파악, 정제, 차트 데이터 생성, 검증 질문을 진행합니다.\n완료 기준: 숫자와 근거가 같이 나온다.", COLORS.blue)}
        ${card("발표자료 제작 스레드", "구성안, HTML/CSS/JS 생성, 화면 검수, GitHub Pages 배포 확인을 맡깁니다.\n완료 기준: 브라우저에서 열린다.", COLORS.gold)}
      </div>
      <div style="margin-top:30px" class="note-strip">현장 멘트 | 스레드는 노트북의 새 페이지처럼 생각하면 됩니다. 주제가 바뀌면 새 페이지를 열어 맥락을 정리합니다.</div>
    `,
    notes: "초보자는 한 대화에 모든 것을 이어 붙이는 경향이 있습니다. 작업 단위로 새 스레드를 열면 설명과 결과가 훨씬 깔끔해집니다.",
  },
  {
    section: "설치",
    title: "권한과 보안: 처음에 함께 정할 기준",
    subtitle: "AI 에이전트는 파일과 명령을 다룰 수 있으므로 승인 전 확인을 습관화합니다.",
    body: `
      ${timeline([
        { title: "읽기", subtitle: "파일 내용 파악" },
        { title: "쓰기", subtitle: "새 파일 생성" },
        { title: "명령 실행", subtitle: "분석/변환" },
        { title: "승인", subtitle: "허용 범위 확인" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("함께 지킬 기준", "AI가 요청하는 권한은 왜 필요한지 보고 허용합니다. 오늘은 워크숍 폴더 안의 실습 파일을 읽고 결과물을 만드는 범위에서만 진행합니다.")}
        ${card("민감정보 원칙", "학생 개인 식별정보, 성적 원자료, 상담 내용, 민감 설문 응답은 익명화 전에는 넣지 않습니다. 공개 가능한 예제 데이터로 먼저 흐름을 익힙니다.", COLORS.red)}
      </div>
    `,
    notes: "보안 이야기는 겁주는 방식보다 실무 기준을 제시하는 방식이 좋습니다. 파일 범위와 개인정보 두 가지만 분명히 잡습니다.",
  },
  {
    section: "설치",
    title: "승인 요청은 세 문장으로 읽습니다",
    subtitle: "허용 버튼을 누르기 전에 범위와 이유를 말로 확인합니다.",
    body: `
      <div class="grid grid--3">
        ${card("무엇을 하려는가", "파일을 읽는지, 파일을 쓰는지, 명령을 실행하는지 먼저 봅니다.\n예: 엑셀 읽기, HTML 수정, 브라우저 검수", COLORS.blue)}
        ${card("어디까지 접근하는가", "워크숍 폴더 안인지, 폴더 밖인지, 네트워크 접근이 필요한지 확인합니다.\n민감정보 폴더 접근은 허용하지 않습니다.", COLORS.red)}
        ${card("왜 필요한가", "분석, 미리보기, 배포처럼 현재 작업과 직접 연결되는 이유가 있는지 묻습니다.\n이유가 불명확하면 설명을 다시 요구합니다.", COLORS.gold)}
      </div>
      <div style="margin-top:28px">${bullets(["모르면 거절하는 것이 아니라, Codex에게 왜 필요한지 설명하게 합니다.", "수업 중에는 작업 폴더 밖 접근과 민감정보 접근을 허용하지 않습니다.", "승인 과정 자체를 수강생에게 보여주면 AI 에이전트의 작동 범위를 이해시키기 좋습니다."])}</div>
    `,
    notes: "승인 요청을 숨기지 말고 오히려 교육 장면으로 씁니다. 무엇, 어디까지, 왜 필요한가를 반복해서 말하게 합니다.",
  },
  {
    section: "설치",
    title: "첫 프롬프트: 폴더를 열었는지 확인",
    subtitle: "설치가 끝난 참가자는 곧바로 파일 목록을 읽게 합니다.",
    body: `
      <div class="two-column">
        ${promptBox("실습 프롬프트", PROMPTS.inventory)}
        <div class="grid">
          ${card("기대 결과", "4개 주제 × 3개년 구조를 인식한다.\n전공과목 성적 분포, 입학전형, 외국학생 현황, 중도탈락을 구분한다.\n분석 전에 질문을 먼저 만든다.")}
          ${card("확인 포인트", "참가자 화면에서 파일 경로가 다르면 바로 드러난다.\nAI가 없는 파일을 말하면 실제 파일명만 근거로 하라고 다시 지시한다.", COLORS.gold)}
        </div>
      </div>
    `,
    notes: "첫 성공 경험이 중요합니다. 복잡한 분석 전에 내 폴더를 AI가 보고 있다는 감각을 만들게 합니다.",
  },
  {
    type: "section",
    sectionClass: "section-dark",
    sectionNumber: "PART 1",
    title: "데이터 분석 실습",
    subtitle: "깔끔한 예제 대신 실제 행정 엑셀의 불편함을 그대로 다룹니다.",
    notes: "여기서부터는 데모-실습-검증 루프를 짧게 반복합니다.",
  },
  {
    section: "분석",
    title: "오늘의 데이터 지도",
    subtitle: "대학 행정 데이터 4종을 3개년으로 비교합니다.",
    body: table(
      ["주제", "파일 수", "읽어낸 행 수", "분석 질문"],
      [
        ["전공과목 성적 분포", "3", "3,177", "성적 분포가 어떻게 바뀌었나?"],
        ["입학전형 유형별 선발 결과", "3", "80", "전형별 등록 규모와 등록률은?"],
        ["외국학생 현황", "3", "79", "외국학생 수와 국가 구성은?"],
        ["외국학생 중도탈락 현황", "3", "78", "중도탈락률은 어느 해에 높았나?"],
      ],
    ) + `<div style="margin-top:26px">${bullets(["분석은 정답 찾기보다 질문을 세우고 확인하는 과정으로 진행합니다.", "각 주제마다 합계 행, 기준연도, 단위, 빈칸 반복 여부를 먼저 확인합니다."])}</div>`,
    notes: "참가자에게 '여러분이라면 어떤 질문을 먼저 하시겠습니까?'라고 묻고 2-3개만 받습니다.",
  },
  {
    section: "분석",
    title: "좋은 실습 자료인 이유",
    subtitle: "이 파일들은 처음부터 정리된 데이터가 아니라 실제 업무에서 만나는 문제를 그대로 담고 있습니다.",
    body: `
      <div class="grid grid--3">
        ${card("문제 1: 겉보기 오류", "엑셀 내부의 표 범위 정보가 A1로 저장되어 일반 판독기는 한 칸짜리 파일처럼 착각할 수 있다.", COLORS.red)}
        ${card("문제 2: 병합 헤더", "제목 행, 설명 행, 2단 헤더, 합계 행이 섞여 있어 바로 표 분석을 하기 어렵다.", COLORS.gold)}
        ${card("문제 3: 빈칸 반복", "학과명, 전형유형, 기준연도 등이 첫 행에만 있고 아래 행은 빈칸이라 위 행 값을 이어받아야 한다.", COLORS.teal)}
      </div>
      <div style="margin-top:30px" class="note-strip">강의 포인트 | AI가 처음에 틀리는 장면을 실패로 처리하지 말고, 파일 구조를 함께 읽는 실습으로 바꿉니다.</div>
    `,
    notes: "AI가 틀렸을 때 바로 포기하지 않고 왜 그렇게 읽었는지 확인하라고 지시하는 장면을 보여줍니다.",
  },
  {
    section: "분석",
    title: "읽기 실패를 좋은 질문으로 바꾸기",
    subtitle: "한 칸만 읽었다면 '다시 해줘'가 아니라 원인을 묻습니다.",
    body: `
      <div class="two-column">
        ${promptBox("실패했을 때 이어가는 프롬프트", PROMPTS.failure)}
        <div class="grid">
          ${card("나쁜 반응", "엑셀이 이상한가 봐요.\nAI가 못 읽네요.\n다른 파일로 넘어갈게요.", COLORS.red)}
          ${card("좋은 반응", "왜 한 칸으로 보였는지 설명해줘.\n실제 셀 수와 표 범위를 비교해줘.\n복원 가능한 읽기 방식을 제안해줘.", COLORS.teal)}
          ${card("참가자 역할", "이 장면에서 참가자는 사용자라기보다 검증자입니다. AI가 말한 근거를 원본 파일과 맞춰 봅니다.", COLORS.gold)}
        </div>
      </div>
    `,
    notes: "파일 읽기 실패는 워크숍의 좋은 장면입니다. AI를 혼내는 것이 아니라 원인을 설명하게 만드는 연습으로 전환합니다.",
  },
  {
    section: "분석",
    title: "AI 에이전트 분석 흐름",
    subtitle: "한 번에 끝내지 않고 짧은 루프를 반복합니다.",
    body: `
      ${timeline([
        { title: "1 탐색", subtitle: "파일/시트/행·열" },
        { title: "2 정제", subtitle: "헤더/빈칸/단위" },
        { title: "3 분석", subtitle: "추이/비교/순위" },
        { title: "4 검증", subtitle: "합계/샘플/해석" },
        { title: "5 정리", subtitle: "차트/슬라이드" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("핵심 멘트", "AI 에이전트에게 '분석해줘'라고만 말하면 결과는 그럴듯하지만 약합니다. 먼저 자료를 확인시키고, 이상한 점을 찾게 한 뒤 분석을 요청해야 합니다.")}
        ${card("반복 질문 예시", "방금 계산한 합계가 원본의 합계 행과 맞아?\n빈칸은 위 행 값으로 채워야 하나?\n파일명 연도와 기준연도가 같은 뜻이야?", COLORS.red)}
      </div>
    `,
    notes: "이 슬라이드는 전체 실습의 기준점입니다. 이후 모든 데모를 이 5단계 중 어디에 해당하는지 연결해 말합니다.",
  },
  {
    section: "분석",
    title: "데모는 세 번 끊어서 진행합니다",
    subtitle: "한 번에 완성하지 말고, 참가자가 따라올 수 있는 지점에서 멈춥니다.",
    body: `
      <div class="grid grid--3">
        ${card("멈춤 1: 파일 목록", "파일 수, 주제, 연도, 시트 구조가 맞는지 확인합니다.", COLORS.teal)}
        ${card("멈춤 2: 정제 규칙", "어떤 행을 제외하고, 어떤 빈칸을 채우고, 어떤 단위를 쓸지 합의합니다.", COLORS.gold)}
        ${card("멈춤 3: 분석 결과", "차트와 표를 보기 전에 합계, 기준연도, 샘플 행을 확인합니다.", COLORS.red)}
      </div>
      <div style="margin-top:28px">${bullets(["각 멈춤 지점에서 참가자에게 '지금 무엇을 확인했나요?'라고 묻습니다.", "결과가 다르면 틀린 참가자를 찾는 것이 아니라 프롬프트와 파일 경로 차이를 봅니다.", "강사 화면의 결과와 참가자 화면의 결과가 달라도 검증 질문은 동일합니다."])}</div>
    `,
    notes: "라이브 데모가 길어지면 보는 사람이 놓칩니다. 세 번 끊어 확인 질문을 던지는 구조로 운영하세요.",
  },
  {
    section: "분석",
    title: "라이브 데모 1: 데이터 목록과 구조 파악",
    subtitle: "참가자들이 그대로 따라 할 수 있는 첫 분석 프롬프트입니다.",
    body: `
      <div class="two-column">
        ${promptBox("실습 프롬프트", PROMPTS.structure)}
        <div class="grid">
          ${card("함께 확인할 것", "파일이 12개인지\n4개 주제 × 3개년 구조인지\n엑셀 표 범위 문제를 발견했는지\n행 수가 제목 한 줄로만 나오지 않는지")}
          ${card("결과가 이상할 때", "AI에게 '일반 판독기로 읽은 행 수와 내부 XML의 셀 수를 비교해줘'라고 지시합니다. 이 장면이 에이전트 활용법의 핵심입니다.", COLORS.red)}
        </div>
      </div>
    `,
    notes: "프롬프트 끝의 '근거를 보여줘'가 중요합니다. 참가자에게 이 표현을 자주 쓰게 합니다.",
  },
  {
    section: "분석",
    title: "데모 1의 완료 기준",
    subtitle: "프롬프트를 실행했다는 것과 자료를 이해했다는 것은 다릅니다.",
    body: table(
      ["확인 항목", "좋은 결과", "다시 물어볼 신호"],
      [
        ["파일 수", "12개 파일을 주제별·연도별로 구분", "일부 파일만 읽거나 파일명을 추측"],
        ["주제 구분", "성적, 입학전형, 외국학생, 중도탈락을 분리", "파일명 일부만 보고 같은 주제로 묶음"],
        ["행 수", "제목 행과 실제 데이터 행을 구분", "모든 파일을 1행 또는 0행으로 보고"],
        ["주의점", "병합 헤더, 빈칸 반복, 기준연도 차이를 언급", "바로 차트부터 만들려고 함"],
      ],
    ) + `<div style="margin-top:26px" class="note-strip">강사 멘트 | 결과 확인 후 멈추지 말고, 네 가지 완료 기준을 함께 표시</div>`,
    notes: "완료 기준을 보여주면 참가자들이 자기 화면을 스스로 점검할 수 있습니다.",
  },
  {
    section: "분석",
    title: "라이브 데모 2: 정제 기준 정하기",
    subtitle: "병합 헤더와 빈칸 반복을 분석 가능한 표로 바꾸게 합니다.",
    body: `
      <div class="two-column">
        ${promptBox("실습 프롬프트", PROMPTS.cleanGrades)}
        <div class="grid">
          ${card("정제 규칙 예시", "제목/작성자 행 제외\n헤더 행 이후만 사용\n학과명, 구분, 학기 등은 빈칸일 때 위 행 값으로 채움\n등급 표기는 공백 제거: A + → A+", COLORS.gold)}
          ${card("검증 규칙 예시", "등급별 학생수 합계가 성적인정 학생총수와 크게 어긋나지 않는지 확인\n연도별 합계와 차트 값이 같은지 확인")}
        </div>
      </div>
    `,
    notes: "정제는 자동화보다 설명 가능성이 중요하다고 말합니다. 참가자가 규칙을 이해해야 결과를 믿을 수 있습니다.",
  },
  {
    section: "분석",
    title: "정제 결과는 규칙으로 설명돼야 합니다",
    subtitle: "숫자가 나왔다는 사실보다, 어떤 행과 열을 어떻게 처리했는지가 중요합니다.",
    body: `
      <div class="grid grid--4">
        ${card("제외", "제목 행, 작성자 행, 빈 설명 행, 합계 중복 행을 어떻게 제외했는지 표시합니다.", COLORS.red)}
        ${card("채우기", "학과명, 전형유형, 기준연도처럼 위 행 값을 이어받은 열을 적습니다.", COLORS.gold)}
        ${card("단위", "명, %, 건수처럼 차트에 들어갈 단위를 분리합니다.", COLORS.blue)}
        ${card("근거", "원본 행 샘플과 정제 후 행 샘플을 3개 이상 비교합니다.", COLORS.teal)}
      </div>
      <div style="margin-top:28px">${bullets(["정제 규칙이 설명되지 않으면 차트가 맞아 보여도 신뢰하기 어렵습니다.", "참가자에게 'AI가 어떤 행을 버렸는지 아세요?'라고 물어보면 검증 감각이 생깁니다."])}</div>
    `,
    notes: "정제 결과 표보다 정제 규칙을 먼저 말하게 합니다. 이 습관이 실무 적용에서 중요합니다.",
  },
  {
    section: "분석",
    title: "외국학생 총원은 3년간 증가",
    subtitle: "2023년 380명에서 2025년 506명으로 증가했습니다.",
    body: chartShell(
      svgLineChart(DATA.foreignTotals, "외국학생 총원 추이"),
      "외국학생 총원은 2023→2025년에 126명 증가했습니다. 이 변화는 이후 국가별 구성 변화와 함께 읽어야 합니다.",
      "이 차트만 보고 결론을 낸다면 무엇을 놓칠 수 있을까요?",
    ),
    notes: "첫 번째 쉬운 성공 차트입니다. 단순 추이를 먼저 잡고, 바로 국가별 구성으로 한 단계 내려갑니다.",
  },
  {
    section: "분석",
    title: "차트에서 발표 문장 만들기",
    subtitle: "숫자 하나를 결론, 근거, 주의점으로 나눠 말합니다.",
    body: `
      <div class="grid grid--3">
        ${card("결론", "외국학생 총원은 2023년 380명에서 2025년 506명으로 증가했습니다.", COLORS.blue)}
        ${card("근거", "3년 사이 126명 증가했고, 2024년보다 2025년 증가 폭이 큽니다.", COLORS.teal)}
        ${card("주의점", "총원 증가만으로 지원 수요를 단정하지 말고 국가별 구성과 중도탈락률을 함께 봐야 합니다.", COLORS.red)}
      </div>
      <div style="margin-top:30px" class="note-strip">실습 질문 | 여러분의 차트에서도 결론, 근거, 주의점을 각각 한 문장으로 분리해 보세요.</div>
    `,
    notes: "차트를 읽고 바로 발표 문장으로 바꾸는 연습입니다. 숫자 나열과 메시지의 차이를 보여줍니다.",
  },
  {
    section: "분석",
    title: "2025년에는 베트남 학생 비중이 큽니다",
    subtitle: "상위 국가 구성이 전체 증가 해석의 핵심입니다.",
    body: chartShell(
      svgHorizontalBarChart(DATA.foreignCountries2025, "2025년 외국학생 상위 국가"),
      "2025년 상위 국가 중 베트남이 333명으로 가장 많습니다. 전체 증가가 특정 국가의 변화로 얼마나 설명되는지 물어볼 수 있습니다.",
      "학생지원, 수업 운영, 언어 지원 관점에서 어떤 후속 질문이 필요할까요?",
      COLORS.blue,
    ),
    notes: "비중 집중은 좋다/나쁘다로 결론 내기보다 지원 체계를 어디에 맞춰야 하는지로 연결하면 교수법 워크숍에 잘 맞습니다.",
  },
  {
    section: "분석",
    title: "해석은 다음 질문으로 끝냅니다",
    subtitle: "데이터가 답한 것과 아직 답하지 못한 것을 구분합니다.",
    body: `
      <div class="grid grid--2">
        ${card("데이터가 말한 것", "2025년 외국학생 상위 국가 중 베트남 학생 수가 가장 큽니다.\n국가별 구성은 수업 운영과 학생 지원 논의의 출발점이 됩니다.", COLORS.blue)}
        ${card("데이터만으로 말할 수 없는 것", "왜 특정 국가 학생이 늘었는지, 학업 적응도가 어떤지, 지원 요구가 무엇인지는 추가 자료가 필요합니다.", COLORS.red)}
      </div>
      <div style="margin-top:28px">${bullets(["좋은 인사이트는 단정으로 끝나지 않고 다음 확인 질문을 남깁니다.", "AI에게 '이 데이터로 말할 수 없는 것은 무엇인가?'를 꼭 물어보게 합니다."])}</div>
    `,
    notes: "해석의 경계를 가르치는 슬라이드입니다. AI가 과도하게 단정하지 않도록 다음 질문을 남기게 합니다.",
  },
  {
    section: "분석",
    title: "중도탈락률은 기준연도부터 확인",
    subtitle: "파일명 연도와 실제 기준연도는 한 해 차이",
    body: chartShell(
      svgDropoutChart(DATA.dropoutRates, "외국학생 중도탈락률"),
      "공시 2024 파일 / 기준연도 2023\n중도탈락률 6.3%로 최고\n파일명 연도와 기준연도 분리",
      "혼동하면 생기는 오해는?",
    ),
    notes: "데이터 해석 주의점을 강조하기 좋은 슬라이드입니다. AI에게 기준연도 차이를 설명하라고 시키면 좋은 토론이 됩니다.",
  },
  {
    section: "분석",
    title: "전형별 등록인원 구성이 달라졌습니다",
    subtitle: "수능위주, 학생부교과, 학생부종합의 규모 변화를 비교합니다.",
    body: chartShell(
      svgStackedBarChart(DATA.admissionsByType, "입학전형 유형별 등록인원", ["수능위주", "학생부교과", "학생부종합", "실기위주", "기타"], 1800),
      "2024-2025년에는 수능위주 등록인원이 높게 나타나고, 학생부종합은 2025년에 줄어듭니다. 모집 구조 변화와 함께 해석해야 합니다.",
      "전형별 등록인원 변화와 수업 운영은 어떤 방식으로 연결될 수 있을까요?",
      COLORS.gold,
    ),
    notes: "이 차트는 행정 데이터를 슬라이드 메시지로 바꾸는 예로 다룹니다. 전형 변화 자체의 원인 단정은 피합니다.",
  },
  {
    section: "분석",
    title: "성적 분포는 A/B 구간 변화가 핵심입니다",
    subtitle: "2023년 A 비율이 높고, 2024-2025년에는 B 비율이 커집니다.",
    body: chartShell(
      svgStackedBarChart(DATA.grades, "전공과목 성적 분포 변화", ["A", "B", "C", "D", "F"], 100, true),
      "A구간 비율은 2023년 49.6%, 2024년 40.9%, 2025년 43.2%입니다. 평가정책, 과목구성, 수강생 규모 차이를 함께 확인해야 합니다.",
      "성적 분포 변화에서 데이터만으로 말할 수 있는 것과 말할 수 없는 것은 무엇일까요?",
      COLORS.teal,
    ),
    notes: "성적 데이터는 민감하게 들릴 수 있으므로 개별 교수 평가가 아니라 집계 데이터 읽기라고 선을 긋습니다.",
  },
  {
    section: "분석",
    title: "분석 결과를 말하기 전에 선을 긋습니다",
    subtitle: "집계 데이터의 변화와 원인 설명은 다른 층위입니다.",
    body: `
      <div class="grid grid--3">
        ${card("말할 수 있음", "연도별 A/B/C/D/F 비율이 어떻게 달라졌는지 설명할 수 있습니다.", COLORS.teal)}
        ${card("추가 확인 필요", "평가 정책, 과목 구성, 수강생 규모 변화가 영향을 줬는지 확인해야 합니다.", COLORS.gold)}
        ${card("말하면 안 됨", "개별 교수의 평가 방식이나 학생 수준을 집계 자료만으로 단정하지 않습니다.", COLORS.red)}
      </div>
      <div style="margin-top:30px">${promptBox("해석 경계 확인", `방금 분석 결과에서
1) 데이터로 직접 말할 수 있는 것,
2) 추가 자료가 있어야 말할 수 있는 것,
3) 단정하면 안 되는 것을 구분해줘.`)}</div>
    `,
    notes: "성적 분포는 민감하게 해석될 수 있습니다. AI가 만든 문장을 그대로 쓰지 말고 해석 경계를 확인하게 합니다.",
  },
  {
    section: "분석",
    title: "참가자 실습: 인사이트 1개 만들기",
    subtitle: "정답보다 근거가 있는 한 문장을 만드는 훈련입니다.",
    body: `
      <div class="grid grid--3">
        ${card("1. 질문", "질문 하나 선택\n예: 어느 국가가 이끌었나?")}
        ${card("2. 분석", "파일과 계산 기준 지정\n예: 국가별 총원 증감", COLORS.blue)}
        ${card("3. 검증", "합계·상위 샘플 확인\n예: 증가 합계 비교", COLORS.gold)}
      </div>
      <div style="margin-top:26px">${promptBox("실습 프롬프트", PROMPTS.countryGrowth)}</div>
    `,
    notes: "실습 시간은 12분 정도가 적당합니다. 결과 공유는 2-3명만 받고, 나머지는 Q&A 시간에 이어갑니다.",
  },
  {
    section: "분석",
    title: "공유할 때는 한 문장만 남깁니다",
    subtitle: "결과 공유는 길게 발표하지 않고 구조를 맞춥니다.",
    body: `
      <div class="grid grid--4">
        ${card("질문", "궁금한 질문", COLORS.blue)}
        ${card("근거", "확인한 파일과 숫자", COLORS.teal)}
        ${card("검증", "다시 확인한 기준", COLORS.gold)}
        ${card("다음", "추가 확인 대상", COLORS.red)}
      </div>
      <div style="margin-top:28px" class="grid grid--2">
        ${card("공유 구조", "질문: ○○\n근거: △△ 파일 / □□ 숫자\n검증: 합계·기준연도\n다음: ◇◇ 추가 확인", COLORS.teal)}
        ${card("말할 때 기준", "30초 안에 끝내기\n숫자는 하나만 강조\n모르는 부분은 다음 질문으로 남기기", COLORS.gold)}
      </div>
    `,
    notes: "전체 공유 시간이 길어지지 않도록 발표 틀을 고정합니다. 이 템플릿을 쓰면 초보자도 말하기 쉽습니다.",
  },
  {
    section: "분석",
    title: "검증 체크리스트",
    subtitle: "AI 분석 결과를 믿기 전에 최소한 이 네 가지를 확인합니다.",
    body: `
      <div class="grid grid--4 prompt-check-grid">
        ${card("행 수", "전체 파일 읽음?\n제목 줄만 아님?", COLORS.red)}
        ${card("합계", "원본 합계 일치?\n분모 확인?")}
        ${card("기준", "기준연도 구분\n학기·학생 구분", COLORS.gold)}
        ${card("해석", "차트·결론 일치?\n추가 맥락?", COLORS.blue)}
      </div>
      <div style="margin-top:28px">${promptBox("검증 프롬프트", PROMPTS.validation)}</div>
    `,
    notes: "AI를 잘 쓰는 사람은 결과를 빨리 받는 사람이 아니라 검증 루프를 돌리는 사람이라고 말합니다.",
  },
  {
    type: "section",
    sectionClass: "section-teal",
    sectionNumber: "PART 2",
    title: "웹 발표자료 제작",
    subtitle: "분석 결과를 링크로 나눌 수 있는 웹 슬라이드로 바꿉니다.",
    notes: "여기서는 PPTX가 아니라 GitHub Pages로 공유할 수 있는 HTML 슬라이드라는 장점을 분명히 말합니다.",
  },
  {
    section: "제작",
    title: "분석 결과를 발표 흐름으로 바꾸기",
    subtitle: "차트가 아니라 메시지가 슬라이드의 중심입니다.",
    body: `
      ${timeline([
        { title: "결론", subtitle: "한 문장" },
        { title: "근거", subtitle: "숫자/차트" },
        { title: "해석", subtitle: "왜 중요한가" },
        { title: "다음 질문", subtitle: "추가 확인" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("부족한 요청", "분석 결과로 발표자료 만들어줘.\n→ 구조는 나오지만 메시지가 흐려지고 차트가 장식처럼 들어갈 가능성이 큽니다.", COLORS.red)}
        ${card("더 나은 요청", "청중은 대학 교수이고, 목표는 AI 에이전트 활용법 교육입니다. 데이터 분석 결과를 8장짜리 실습 발표자료로 구성해줘.\n→ 청중, 목적, 장수, 말투, 차트 기준이 들어갑니다.")}
      </div>
    `,
    notes: "발표자료 제작도 한 번에 끝내지 않습니다. 구성안 → HTML 구조 → 차트 → 배포 순서가 좋습니다.",
  },
  {
    section: "제작",
    title: "제목은 주제가 아니라 결론으로 씁니다",
    subtitle: "슬라이드 제목만 읽어도 메시지가 이어져야 합니다.",
    body: `
      <div class="grid grid--2">
        ${card("주제형 제목", "외국학생 현황\n중도탈락률\n전형별 등록인원\n성적 분포", COLORS.red)}
        ${card("결론형 제목", "외국학생 총원은 3년간 증가했습니다\n중도탈락률은 기준연도부터 확인합니다\n전형별 등록인원 구성이 달라졌습니다\n성적 분포는 A/B 구간 변화가 핵심입니다", COLORS.teal)}
      </div>
      <div style="margin-top:30px">${promptBox("제목 수정 프롬프트", `현재 슬라이드 제목을 모두 결론형으로 바꿔줘.
각 제목은 18자 안팎의 자연스러운 한국어 문장으로 만들고,
데이터가 말하지 않는 원인은 단정하지 마.`)}</div>
    `,
    notes: "제목을 결론형으로 바꾸는 것만으로도 발표자료가 훨씬 명확해집니다. 참가자에게 자기 결과 제목을 하나 고치게 합니다.",
  },
  {
    section: "제작",
    title: "슬라이드 재료를 네 칸으로 나눕니다",
    subtitle: "AI에게 자료를 넘기기 전에 사람이 구조를 정합니다.",
    body: table(
      ["재료", "예시", "슬라이드에서의 역할"],
      [
        ["메시지", "외국학생 총원은 3년간 증가", "제목 또는 핵심 문장"],
        ["숫자", "380명 → 506명, +126명", "근거 텍스트"],
        ["시각자료", "추이선, 막대그래프, 누적막대", "한눈에 보는 증거"],
        ["주의점", "기준연도, 합계, 분모 확인", "해석의 경계"],
      ],
    ) + `<div style="margin-top:26px" class="note-strip">진행 팁 | 이 네 칸이 채워지지 않으면 HTML을 만들기 전에 분석으로 돌아갑니다.</div>`,
    notes: "발표자료 제작을 디자인 작업으로만 보지 않게 합니다. 메시지, 숫자, 시각자료, 주의점의 재료 정리가 먼저입니다.",
  },
  {
    section: "제작",
    title: "추천 발표 구성: 8장",
    subtitle: "참가자가 자신의 분석 결과를 짧은 발표로 바꿀 때 쓰는 기본 틀입니다.",
    body: table(
      ["장", "제목", "핵심 메시지", "시각자료"],
      [
        ["1", "문제 제기", "AI 에이전트로 업무 데이터를 다룰 수 있다", "작업 흐름"],
        ["2", "데이터 소개", "4개 주제, 3개년 자료를 분석했다", "데이터 지도"],
        ["3", "품질 이슈", "겉보기와 실제 데이터 구조가 달랐다", "오류 도식"],
        ["4", "인사이트 1", "외국학생 총원이 증가했다", "추이선"],
        ["5", "인사이트 2", "국가 구성 변화가 중요하다", "막대그래프"],
        ["6", "인사이트 3", "전형과 성적 분포도 비교할 수 있다", "요약 차트"],
        ["7", "검증", "합계와 기준연도를 확인했다", "체크리스트"],
        ["8", "적용", "내 수업/학과 자료에 적용할 질문", "다음 질문"],
      ],
    ),
    notes: "참가자에게는 8장 전체 제작보다 3장만 만들어도 좋다고 말합니다. 중요한 건 구성의 논리입니다.",
  },
  {
    section: "제작",
    title: "시간이 부족하면 3장만 만듭니다",
    subtitle: "현장 실습에서는 완성형보다 작은 완성 단위가 안전합니다.",
    body: `
      <div class="grid grid--3">
        ${card("1. 데이터 소개", "어떤 파일을 읽었고 어떤 질문을 세웠는지 보여줍니다.", COLORS.blue)}
        ${card("2. 핵심 인사이트", "차트 하나와 결론형 제목 하나로 가장 중요한 발견을 설명합니다.", COLORS.teal)}
        ${card("3. 검증과 다음 질문", "합계, 기준연도, 해석상 주의점과 다음 확인 질문을 남깁니다.", COLORS.red)}
      </div>
      <div style="margin-top:30px">${bullets(["초보자는 8장을 억지로 만들기보다 3장을 제대로 만드는 편이 낫습니다.", "3장 구조가 안정되면 8장 구성으로 확장합니다.", "Q&A 시간에는 참가자별 3장 MVP를 기준으로 피드백합니다."])}</div>
    `,
    notes: "시간이 밀릴 때 바로 쓸 수 있는 축소 운영안입니다. 3장 MVP를 제시하면 현장 운영이 안정됩니다.",
  },
  {
    section: "제작",
    title: "구성안 요청 프롬프트",
    subtitle: "먼저 HTML 파일을 만들게 하기보다 슬라이드 설계부터 받습니다.",
    body: `
      <div class="two-column">
        ${promptBox("구성안 프롬프트", PROMPTS.storyboard)}
        <div class="grid">
          ${card("수정 지시 예", "슬라이드 제목을 결론형으로 바꿔줘.\n차트가 없는 장에는 어떤 표가 필요한지 제안해줘.\n청중이 교수라는 점을 반영해 수업/교육행정 적용 예를 넣어줘.")}
          ${card("체크 포인트", "장수가 맞는가?\n각 장마다 메시지가 하나인가?\n데이터와 무관한 일반론이 많지 않은가?", COLORS.gold)}
        </div>
      </div>
    `,
    notes: "파일 생성보다 구성안 검토가 먼저입니다. 이 순서를 지키면 결과물이 훨씬 좋아집니다.",
  },
  {
    section: "제작",
    title: "구성안은 바로 통과시키지 않습니다",
    subtitle: "AI가 만든 목차를 사람의 검수 질문으로 한 번 거릅니다.",
    body: `
      <div class="grid grid--4 prompt-check-grid">
        ${card("한 장 한 메시지", "결론은 하나?\n두 메시지 아님?", COLORS.blue)}
        ${card("근거 연결", "숫자·표가 붙었나?", COLORS.teal)}
        ${card("청중 적합성", "교수법 맥락 연결?", COLORS.gold)}
        ${card("해석 경계", "원인 단정 없음?", COLORS.red)}
      </div>
      <div style="margin-top:30px">${promptBox("구성안 검수 프롬프트", `방금 만든 슬라이드 구성안을 검토해줘.
1) 한 슬라이드에 메시지가 두 개 이상인 장,
2) 근거 데이터가 부족한 장,
3) 청중에게 너무 일반적인 장,
4) 데이터 범위를 넘어 단정한 장을 찾아서 수정안을 제시해줘.`)}</div>
    `,
    notes: "AI의 첫 목차는 대체로 그럴듯하지만 느슨합니다. 검수 질문을 넣어 한 번 더 조이게 합니다.",
  },
  {
    section: "제작",
    title: "웹 슬라이드 생성 프롬프트",
    subtitle: "발표 화면, 차트, 메모, 배포 조건을 한 번에 지정합니다.",
    body: `
      <div class="two-column">
        ${promptBox("HTML 생성 프롬프트", PROMPTS.htmlDeck)}
        <div class="grid">
          ${card("왜 웹 슬라이드인가", "링크로 공유\n수정 후 재배포 쉬움\n메모·복사·차트 기능 추가 가능")}
          ${card("현장 운영 팁", "완성형 HTML보다 구성안 먼저\n1-2장 초안만 만들기", COLORS.red)}
        </div>
      </div>
    `,
    notes: "이 강의 자료 자체가 이 방식으로 만들어졌다고 보여주면 설득력이 좋습니다.",
  },
  {
    section: "제작",
    title: "파일 구조는 단순하게 둡니다",
    subtitle: "초보자 실습에서는 복잡한 빌드 도구보다 바로 열리는 구조가 낫습니다.",
    body: `
      <div class="grid grid--3">
        ${card("index.html", "슬라이드가 들어가는 시작 파일입니다. GitHub Pages가 가장 먼저 여는 파일입니다.", COLORS.blue)}
        ${card("styles.css", "글자 크기, 여백, 색상, 모바일 대응을 관리합니다.", COLORS.gold)}
        ${card("app.js", "슬라이드 데이터, 이전/다음 이동, 발표자 메모, 차트 렌더링을 담당합니다.", COLORS.teal)}
      </div>
      <div style="margin-top:30px" class="note-strip">현장 기준 | React, 빌드, 패키지 설치 없이도 GitHub Pages에서 열리는 정적 HTML 구조로 시작합니다.</div>
    `,
    notes: "파일 구조를 먼저 보여주면 참가자가 AI가 만든 결과물을 어디서 확인해야 할지 이해합니다.",
  },
  {
    section: "제작",
    title: "GitHub Pages 배포 흐름",
    subtitle: "정적 HTML은 빌드 없이 GitHub Pages에서 바로 열 수 있습니다.",
    body: `
      ${timeline([
        { title: "1 계정", subtitle: "GitHub 로그인" },
        { title: "2 폴더", subtitle: "발표자료/slide" },
        { title: "3 파일", subtitle: "index.html, CSS, JS" },
        { title: "4 커밋", subtitle: "GitHub에 push" },
        { title: "5 공유", subtitle: "Pages 링크 확인" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("예상 접속 경로", "https://<github-id>.github.io/workshop-hansung/", COLORS.blue)}
        ${card("공유할 때 주의", "GitHub 계정에 로그인되어 있어야 저장소에 push할 수 있습니다. 공유 전에는 실제 열리는 주소를 한 번 눌러보고 전달합니다.", COLORS.gold)}
      </div>
    `,
    notes: "GitHub 계정이 없는 참가자는 앞에서 만든 계정을 사용합니다. Pages 설정은 저장소 Settings에서 Source를 GitHub Actions로 지정해 둡니다.",
  },
  {
    section: "제작",
    title: "배포 후에는 주소를 직접 눌러봅니다",
    subtitle: "push가 끝났다는 것과 발표자료가 열린다는 것은 다릅니다.",
    body: `
      <div class="grid grid--3">
        ${card("열림 확인", "Pages 주소를 새 브라우저 탭에서 직접 열어봅니다.", COLORS.blue)}
        ${card("캐시 확인", "수정했는데 예전 화면이 보이면 CSS/JS 버전 또는 새로고침을 확인합니다.", COLORS.gold)}
        ${card("화면 확인", "첫 장, GitHub 가입 장, Codex 안내 장, 차트 장, 마지막 장을 빠르게 넘겨봅니다.", COLORS.teal)}
      </div>
      <div style="margin-top:30px">${bullets(["발표 전에 로컬 화면과 배포 화면이 같은지 비교합니다.", "모바일 공유까지 고려한다면 휴대폰에서도 첫 장과 핵심 장표를 확인합니다.", "링크 공유 전에는 비공개 자료나 실명 데이터가 들어가지 않았는지 다시 봅니다."])}</div>
    `,
    notes: "배포 확인을 별도 단계로 두면 Pages 지연이나 캐시 문제를 현장에서 설명하기 좋습니다.",
  },
  {
    section: "제작",
    title: "좋은 웹 슬라이드로 고치는 기준",
    subtitle: "AI가 만든 초안은 끝이 아니라 첫 편집본입니다.",
    body: `
      <div class="grid grid--3">
        ${card("제목", "주제형보다 결론형으로 바꾼다.\n예: 외국학생 현황 → 외국학생은 3년간 126명 증가")}
        ${card("차트", "한 슬라이드에 메시지 하나만 남긴다.\n축, 단위, 기준연도, 데이터 출처를 확인한다.", COLORS.gold)}
        ${card("화면", "프로젝터에서 글자가 작지 않은가?\n모바일에서는 핵심 내용이 먼저 보이는가?", COLORS.blue)}
        ${card("동작", "이전/다음 이동이 되는가?\n복사 버튼, 메모 토글이 발표를 방해하지 않는가?", COLORS.green)}
        ${card("검증", "합계가 맞는지, 기준이 섞이지 않았는지, 결론이 데이터 범위를 넘지 않는지 확인한다.", COLORS.red)}
        ${card("청중", "기능 나열보다 내 수업과 업무에 어떻게 적용할까로 연결한다.", COLORS.violet)}
      </div>
    `,
    notes: "참가자에게 AI가 초안을 만들면 사람의 역할은 편집장이라고 표현하면 이해가 빠릅니다.",
  },
  {
    section: "제작",
    title: "가독성은 실제 화면에서 봅니다",
    subtitle: "CSS 숫자만 보고 판단하지 않고 프로젝터와 모바일 화면을 확인합니다.",
    body: `
      <div class="grid grid--4">
        ${card("글자", "본문 최소 크기, 제목 줄바꿈, 버튼 안 글자 넘침을 봅니다.", COLORS.blue)}
        ${card("여백", "카드가 너무 빽빽하거나 빈 공간이 과하게 크지 않은지 봅니다.", COLORS.gold)}
        ${card("차트", "축, 단위, 범례가 읽히는지 확인합니다.", COLORS.teal)}
        ${card("모바일", "작은 화면에서 핵심 내용이 먼저 보이는지 확인합니다.", COLORS.red)}
      </div>
      <div style="margin-top:30px" class="note-strip">강사 멘트 | AI가 만든 디자인은 캡처해서 직접 보는 순간부터 진짜 편집이 시작됩니다.</div>
    `,
    notes: "이전 작업에서 직접 캡처를 보며 고쳤던 경험을 자연스럽게 연결해도 좋습니다.",
  },
  {
    section: "제작",
    title: "진행 메모까지 요청하기",
    subtitle: "자료 제작과 강의 진행을 함께 준비하게 합니다.",
    body: `
      <div class="two-column">
        ${promptBox("메모 작성 프롬프트", PROMPTS.notes)}
        <div class="grid">
          ${card("진행할 때 좋은 이유", "흐름이 끊겨도 다음 멘트 회복\n보조 진행자와 기준 공유")}
          ${card("주의", "메모는 그대로 읽지 않기\n현장 반응에 맞춰 줄이기", COLORS.gold)}
        </div>
      </div>
    `,
    notes: "발표자료 제작이 디자인만이 아니라 진행 준비라는 점을 강조하세요.",
  },
  {
    type: "section",
    sectionClass: "section-red",
    sectionNumber: "PART 3",
    title: "Q&A와 적용 클리닉",
    subtitle: "질문을 받되, 각자의 업무 자료로 옮겨가는 시간으로 설계합니다.",
    notes: "마지막 시간은 자유 질문을 받되 세 범주로 나눠 진행하면 산만함이 줄어듭니다.",
  },
  {
    section: "Q&A",
    title: "마지막 1시간 운영법",
    subtitle: "자유 Q&A만 하면 산만해지기 쉬우니, 적용 클리닉 메뉴를 제시합니다.",
    body: `
      <div class="grid grid--3">
        ${card("A. 내 자료 진단", "파일 구조가 복잡한 엑셀\n학과/수업 운영 데이터\n설문 응답 데이터")}
        ${card("B. 분석 질문 만들기", "무엇을 비교할지\n어떤 기준으로 나눌지\n어떤 검증이 필요한지", COLORS.gold)}
        ${card("C. 발표자료 바꾸기", "결론형 제목\n차트 선택\nHTML 배포 흐름", COLORS.blue)}
      </div>
      <div class="grid grid--2" style="margin-top:28px">
        ${card("운영 방식", "질문은 A/B/C 중 하나\n한 화면 5분\n공통 프롬프트 남기기", COLORS.red)}
        ${card("진행 기준", "답보다 질문 구조\n좋은 사례는 함께 저장", COLORS.green)}
      </div>
    `,
    notes: "질문을 즉흥적으로 모두 받기보다 범주로 나누면 마지막 시간이 훨씬 차분해집니다.",
  },
  {
    section: "Q&A",
    title: "5분 클리닉은 순서가 있어야 합니다",
    subtitle: "한 사람의 문제를 전체가 배울 수 있는 구조로 바꿉니다.",
    body: `
      ${timeline([
        { title: "1분", subtitle: "문제 상황 듣기" },
        { title: "1분", subtitle: "파일/화면 상태 확인" },
        { title: "2분", subtitle: "프롬프트 함께 수정" },
        { title: "1분", subtitle: "전체 적용 원칙 정리" },
      ])}
      <div class="grid grid--2" style="margin-top:30px">
        ${card("좋은 클리닉", "개별 참가자의 문제를 해결하면서도 전체가 가져갈 수 있는 질문 문장을 남깁니다.", COLORS.teal)}
        ${card("피할 것", "한 사람의 PC 문제를 오래 붙잡고 전체 흐름을 멈추는 상황을 피합니다.", COLORS.red)}
      </div>
    `,
    notes: "마지막 시간에 가장 필요한 것은 답변 능력보다 시간 관리입니다. 5분 단위로 클리닉을 끊는다고 미리 말하세요.",
  },
  {
    section: "Q&A",
    title: "예상 질문과 답변",
    subtitle: "자주 나오는 질문을 미리 준비합니다.",
    body: table(
      ["질문", "짧은 답변"],
      [
        ["코딩을 몰라도 가능한가요?", "가능합니다. 다만 결과를 검증하는 질문을 배워야 합니다."],
        ["개인 성적표를 넣어도 되나요?", "식별정보와 민감정보는 익명화 전에는 넣지 않는 것이 원칙입니다."],
        ["AI가 틀리면 어떻게 하나요?", "행 수, 합계, 샘플 행, 기준연도를 확인하게 하고 근거를 요구합니다."],
        ["HTML이 PPT보다 어려운가요?", "생성은 AI에게 맡기고, 구조와 검증 기준을 분명히 제시하면 됩니다."],
        ["GitHub Pages가 어려우면요?", "수업 중에는 로컬 HTML로 확인하고, 배포는 사후 과제로 처리해도 됩니다."],
        ["엑셀이 안 읽히면요?", "일반 판독 실패인지, 내부 구조 문제인지 먼저 진단하게 합니다."],
      ],
    ),
    notes: "질문 답변은 짧게 한 뒤, 가능한 경우 바로 프롬프트 예시로 바꿔 보여줍니다.",
  },
  {
    section: "Q&A",
    title: "질문은 프롬프트로 바꿔서 남깁니다",
    subtitle: "답변만 하고 끝내지 말고 다시 쓸 수 있는 문장으로 정리합니다.",
    body: table(
      ["참가자 질문", "프롬프트로 바꾼 문장"],
      [
        ["엑셀이 이상하게 읽혀요", "이 파일을 읽을 때 실제 데이터 범위와 헤더 행을 진단하고, 왜 일부만 읽혔는지 설명해줘."],
        ["이 숫자가 맞는지 모르겠어요", "원본 합계 행과 계산 결과를 비교하고, 차이가 있으면 원인을 후보별로 정리해줘."],
        ["차트를 뭘로 해야 할까요?", "이 메시지를 보여주기에 적합한 차트 후보 3개와 각각의 장단점을 제안해줘."],
        ["발표 제목이 밋밋해요", "현재 제목을 결론형 제목으로 바꾸고, 데이터가 말하지 않는 원인은 단정하지 않게 다듬어줘."],
      ],
    ),
    notes: "Q&A에서 나온 좋은 질문은 바로 프롬프트 카드로 바꿔 공유하면 워크숍의 밀도가 올라갑니다.",
  },
  {
    section: "Q&A",
    title: "문제가 생겼을 때의 복구 동선",
    subtitle: "현장에서 가장 많이 생길 상황을 미리 안내합니다.",
    body: `
      <div class="grid grid--3">
        ${card("설치 실패", "짝꿍 화면으로 관찰\n개인 설치는 마지막", COLORS.red)}
        ${card("파일 못 찾음", "작업 폴더 확인\ndata 위치와 파일명 확인", COLORS.gold)}
        ${card("분석 결과 이상", "행 수·합계 확인\n원본 샘플·기준연도 확인")}
        ${card("HTML 생성 지연", "구성안 먼저 만들기\n슬라이드 1-2장만 제작", COLORS.blue)}
        ${card("GitHub Pages 지연", "로컬 HTML로 발표\n배포는 사후 과제", COLORS.green)}
        ${card("네트워크 제한", "준비한 분석 결과 사용\n프롬프트 설계 중심 진행", COLORS.violet)}
      </div>
    `,
    notes: "복구 동선을 말해두면 문제가 생겨도 강의 분위기가 덜 흔들립니다.",
  },
  {
    section: "마무리",
    title: "마무리 메시지",
    subtitle: "오늘의 핵심은 도구가 아니라 작업 방식입니다.",
    body: `
      <div class="big-message big-message--closing">
        <h2 class="big-message__title">
          AI 에이전트 활용 능력은<br />
          자료를 확인시키고,<br />
          이상한 점을 찾게 하고,<br />
          검증해 결과물로 연결하는 능력입니다.
        </h2>
      </div>
      ${timeline([
        { title: "확인", subtitle: "무엇이 있나" },
        { title: "질문", subtitle: "무엇을 알고 싶나" },
        { title: "분석", subtitle: "어떻게 계산했나" },
        { title: "검증", subtitle: "맞는가" },
        { title: "전달", subtitle: "어떻게 말할까" },
      ])}
    `,
    notes: "마지막에는 오늘 만든 프롬프트 중 하나를 각자 저장하게 합니다. 다음 주에 바로 써볼 질문 하나로 끝내면 좋습니다.",
  },
  {
    type: "section",
    sectionClass: "section-dark",
    sectionNumber: "APPENDIX",
    title: "프롬프트 카드",
    subtitle: "복사해서 바로 쓸 수 있는 실습 문장입니다.",
    notes: "부록은 시간 여유가 있을 때만 보여주고, 링크 공유용으로 남겨도 됩니다.",
  },
  {
    section: "부록",
    title: "프롬프트 카드 1: 탐색",
    subtitle: "파일을 읽기 전후에 근거를 남기게 합니다.",
    body: `
      <div class="two-column">
        ${promptBox("데이터 탐색", PROMPTS.structure)}
        ${promptBox("오류 진단", PROMPTS.failure)}
      </div>
    `,
    notes: "탐색 프롬프트는 모든 참가자가 성공해야 합니다. 여기서 흔들리면 뒤 실습이 어렵습니다.",
  },
  {
    section: "부록",
    title: "프롬프트 카드 2: 분석과 검증",
    subtitle: "분석 질문과 검증 질문을 붙여 씁니다.",
    body: `
      <div class="two-column">
        ${promptBox("분석", `외국학생 현황 2023-2025 파일을 분석해서
1) 총원 추이, 2) 국가별 상위 5개, 3) 증가분 상위 국가,
4) 해석상 주의점을 정리해줘.

표와 차트에 쓸 수 있는 데이터 형태로 결과를 만들어줘.`)}
        ${promptBox("검증", PROMPTS.validation)}
      </div>
    `,
    notes: "검증 프롬프트를 붙이는 습관을 워크숍의 가장 중요한 습관으로 남깁니다.",
  },
  {
    section: "부록",
    title: "프롬프트 카드 3: 웹 발표자료",
    subtitle: "분석 결과를 GitHub Pages에 올릴 결과물로 바꿉니다.",
    body: `
      <div class="two-column">
        ${promptBox("구성안", PROMPTS.storyboard)}
        ${promptBox("HTML 생성", PROMPTS.htmlDeck)}
      </div>
    `,
    notes: "참가자가 자기 자료에 적용할 때는 청중, 목적, 장수, 차트 종류를 반드시 바꾸게 합니다.",
  },
  {
    section: "부록",
    title: "개인정보와 민감정보 안내 문구",
    subtitle: "워크숍 시작 전에 짧게 읽어도 좋습니다.",
    body: `
      <div class="grid grid--2 privacy-grid">
        ${card("오늘 실습 데이터", "공개 가능한 예제 데이터만 사용합니다.\n이름, 학번, 연락처, 개별 성적, 상담 내용, 민감 설문 응답은 AI 도구에 입력하지 않습니다.", COLORS.red)}
        ${card("업무 자료를 다룰 때", "기관 정책과 데이터 등급을 먼저 확인합니다.\n필요 최소한의 범위에서 집계·익명화한 뒤 분석합니다.", COLORS.blue)}
      </div>
      <div class="note-strip">진행 보충 | 개인정보는 '쓰지 말자'보다 집계·익명화해 쓸 수 있는 상태로 만들자는 방향으로 설명합니다.</div>
    `,
    notes: "이 문구는 기관 정책에 맞춰 수정해서 쓰세요.",
  },
];

let currentIndex = getIndexFromHash();
let printing = false;

const stage = document.querySelector("#stage");
const slideNumber = document.querySelector("#slideNumber");
const progressBar = document.querySelector("#progressBar");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const notesBtn = document.querySelector("#notesBtn");
const closeNotes = document.querySelector("#closeNotes");
const notesPanel = document.querySelector("#notesPanel");
const notesBody = document.querySelector("#notesBody");
const overviewBtn = document.querySelector("#overviewBtn");
const closeOverview = document.querySelector("#closeOverview");
const overviewPanel = document.querySelector("#overviewPanel");
const overviewList = document.querySelector("#overviewList");
const printBtn = document.querySelector("#printBtn");

function getIndexFromHash() {
  const match = location.hash.match(/#\/(\d+)/);
  if (!match) return 0;
  return Math.min(Math.max(Number(match[1]) - 1, 0), slides.length - 1);
}

function slideClass(slide) {
  if (slide.type === "cover") return "slide slide--cover";
  if (slide.type === "section") return `slide slide--section ${slide.sectionClass || ""}`;
  return "slide";
}

function renderSlide(slide, index) {
  if (slide.type === "cover") {
    return `
      <article class="${slideClass(slide)}" data-slide="${index + 1}">
        <div class="slide__body">${slide.body}</div>
        <footer class="slide__footer">
          <span>자료 기준: data 폴더의 2023-2025년 대학 공시 엑셀 파일</span>
          <span>${String(index + 1).padStart(2, "0")}</span>
        </footer>
      </article>
    `;
  }

  if (slide.type === "section") {
    return `
      <article class="${slideClass(slide)}" data-slide="${index + 1}">
        <div class="section-layout">
          <div class="section-number">${escapeHtml(slide.sectionNumber || "")}</div>
          <h1 class="section-title">${escapeHtml(compactDisplayText(slide.title))}</h1>
          <p class="section-subtitle">${escapeHtml(compactDisplayText(slide.subtitle || ""))}</p>
        </div>
        <footer class="slide__footer">
          <span>한성대학교 교수법 워크숍 | AI 에이전트로 데이터 분석 및 발표자료 제작</span>
          <span>${String(index + 1).padStart(2, "0")}</span>
        </footer>
      </article>
    `;
  }

  return `
    <article class="${slideClass(slide)}" data-slide="${index + 1}">
      <header class="slide__header">
        <div class="slide__section">${escapeHtml(slide.section || "")}</div>
        <h1 class="slide__title">${escapeHtml(compactDisplayText(slide.title))}</h1>
        ${slide.subtitle ? `<p class="slide__subtitle">${escapeHtml(compactDisplayText(slide.subtitle))}</p>` : ""}
      </header>
      <div class="slide__body">${slide.body}</div>
      <footer class="slide__footer">
        <span>한성대학교 교수법 워크숍 | AI 에이전트로 데이터 분석 및 발표자료 제작</span>
        <span>${String(index + 1).padStart(2, "0")}</span>
      </footer>
    </article>
  `;
}

function render() {
  if (printing) return;
  const slide = slides[currentIndex];
  stage.innerHTML = renderSlide(slide, currentIndex);
  compactRenderedSlideText(stage);
  slideNumber.textContent = `${currentIndex + 1} / ${slides.length}`;
  progressBar.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === slides.length - 1;
  document.title = `${compactDisplayText(slide.title).replace(/\n/g, " ")} | 한성대학교 교수법 워크숍`;
  updateNotes();
  updateOverview();
}

function goTo(index) {
  const nextIndex = Math.min(Math.max(index, 0), slides.length - 1);
  if (nextIndex === currentIndex) return;
  currentIndex = nextIndex;
  history.replaceState(null, "", `#/${currentIndex + 1}`);
  render();
}

function next() {
  goTo(currentIndex + 1);
}

function prev() {
  goTo(currentIndex - 1);
}

function updateNotes() {
  const slide = slides[currentIndex];
  notesBody.innerHTML = `
    <div class="note-block">${escapeHtml(compactDisplayText(slide.notes || "이 슬라이드에는 별도 진행 메모 없음"))}</div>
  `;
}

function renderOverview() {
  overviewList.innerHTML = slides
    .map(
      (slide, index) => `
        <button class="overview-item ${index === currentIndex ? "is-active" : ""}" type="button" data-index="${index}">
          <span class="overview-item__num">${String(index + 1).padStart(2, "0")}</span>
          <span class="overview-item__title">${escapeHtml(compactDisplayText(slide.title).replace(/\n/g, " "))}</span>
        </button>
      `,
    )
    .join("");
}

function updateOverview() {
  if (!overviewList.innerHTML) {
    renderOverview();
    return;
  }
  overviewList.querySelectorAll(".overview-item").forEach((item, index) => {
    item.classList.toggle("is-active", index === currentIndex);
  });
}

function toggleNotes(force) {
  notesPanel.classList.toggle("is-open", force ?? !notesPanel.classList.contains("is-open"));
}

function toggleOverview(force) {
  if (!overviewList.innerHTML) renderOverview();
  overviewPanel.classList.toggle("is-open", force ?? !overviewPanel.classList.contains("is-open"));
}

function renderPrintDeck() {
  printing = true;
  document.body.classList.add("printing");
  stage.innerHTML = slides.map((slide, index) => renderSlide(slide, index)).join("");
  compactRenderedSlideText(stage);
}

function restoreFromPrint() {
  printing = false;
  document.body.classList.remove("printing");
  render();
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);
notesBtn.addEventListener("click", () => toggleNotes());
closeNotes.addEventListener("click", () => toggleNotes(false));
overviewBtn.addEventListener("click", () => toggleOverview());
closeOverview.addEventListener("click", () => toggleOverview(false));
printBtn.addEventListener("click", () => {
  renderPrintDeck();
  requestAnimationFrame(() => window.print());
});

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
  }
  return copied;
}

function showCopyStatus(button, label) {
  const original = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = original;
  button.textContent = label;
  setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

function selectPromptText(button) {
  const promptText = button.closest(".prompt")?.querySelector(".prompt__text");
  const selection = window.getSelection?.();
  if (!promptText || !selection) return false;
  const range = document.createRange();
  range.selectNodeContents(promptText);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function showCopyFallback(button) {
  showCopyStatus(button, selectPromptText(button) ? "직접 복사" : "복사 실패");
}

stage.addEventListener("click", (event) => {
  const button = event.target.closest(".prompt__copy");
  if (!button) return;
  const text = button.dataset.prompt || "";
  if (copyTextFallback(text)) {
    showCopyStatus(button, "복사됨");
    return;
  }
  if (!navigator.clipboard?.writeText) {
    showCopyFallback(button);
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => showCopyStatus(button, "복사됨"))
    .catch(() => showCopyFallback(button));
});

overviewList.addEventListener("click", (event) => {
  const item = event.target.closest(".overview-item");
  if (!item) return;
  goTo(Number(item.dataset.index));
  toggleOverview(false);
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("button")) return;
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    next();
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    prev();
  }
  if (event.key === "Home") {
    event.preventDefault();
    goTo(0);
  }
  if (event.key === "End") {
    event.preventDefault();
    goTo(slides.length - 1);
  }
  if (event.key.toLowerCase() === "n") {
    toggleNotes();
  }
  if (event.key.toLowerCase() === "o") {
    toggleOverview();
  }
  if (event.key === "Escape") {
    toggleNotes(false);
    toggleOverview(false);
  }
});

window.addEventListener("hashchange", () => {
  currentIndex = getIndexFromHash();
  render();
});

window.addEventListener("afterprint", restoreFromPrint);
window.addEventListener("beforeprint", () => {
  if (!printing) renderPrintDeck();
});

history.replaceState(null, "", `#/${currentIndex + 1}`);
renderOverview();
render();

// 편집 링크 게이트: ?edit=1 / localStorage['wh-edit'] 일 때만 노출 (소유자 전용 외관)
(function () {
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("edit") === "1") localStorage.setItem("wh-edit", "1");
    if (q.get("edit") === "0") localStorage.removeItem("wh-edit");
    if (localStorage.getItem("wh-edit") === "1") {
      var b = document.getElementById("editBtn");
      if (b) b.hidden = false;
    }
  } catch (e) {}
})();
