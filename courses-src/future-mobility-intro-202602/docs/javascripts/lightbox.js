/* 강의 자료 이미지 라이트박스 — 외부 의존성 없음
   · 본문 이미지 클릭 → 전체 화면 확대
   · 확대 화면에서 다시 클릭 → 원본 크기(1:1) 토글, 스크롤로 이동
   · ESC 닫기, ← → 로 같은 페이지 안의 이미지 이동 */
(function () {
  "use strict";

  var overlay, stage, img, cap, count, prevBtn, nextBtn;
  var list = [];
  var idx = 0;
  var lastFocus = null;

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "이미지 확대 보기");
    overlay.innerHTML =
      '<div class="lb-stage"><img alt=""></div>' +
      '<button type="button" class="lb-btn lb-close" aria-label="닫기">✕</button>' +
      '<button type="button" class="lb-btn lb-nav lb-prev" aria-label="이전 이미지">‹</button>' +
      '<button type="button" class="lb-btn lb-nav lb-next" aria-label="다음 이미지">›</button>' +
      '<div class="lb-bar"><span class="lb-caption"></span>' +
      '<span class="lb-count"></span>' +
      '<button type="button" class="lb-btn lb-zoom">원본 크기</button></div>';
    document.body.appendChild(overlay);

    stage = overlay.querySelector(".lb-stage");
    img = overlay.querySelector(".lb-stage img");
    cap = overlay.querySelector(".lb-caption");
    count = overlay.querySelector(".lb-count");
    prevBtn = overlay.querySelector(".lb-prev");
    nextBtn = overlay.querySelector(".lb-next");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target === stage) close();
    });
    overlay.querySelector(".lb-close").addEventListener("click", close);
    overlay.querySelector(".lb-zoom").addEventListener("click", toggleZoom);
    img.addEventListener("click", toggleZoom);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
  }

  function captionFor(el) {
    if (el.alt && el.alt.trim()) return el.alt.trim();
    var fig = el.closest("figure");
    var fc = fig && fig.querySelector("figcaption");
    if (fc) return fc.textContent.trim();
    return "";
  }

  function show(i) {
    idx = (i + list.length) % list.length;
    var el = list[idx];
    setZoom(false);
    img.src = el.currentSrc || el.src;
    img.alt = el.alt || "";
    cap.textContent = captionFor(el);
    count.textContent = list.length > 1 ? idx + 1 + " / " + list.length : "";
    overlay.setAttribute("data-single", list.length > 1 ? "0" : "1");
  }

  function setZoom(on) {
    overlay.setAttribute("data-zoom", on ? "1" : "0");
    var b = overlay.querySelector(".lb-zoom");
    b.textContent = on ? "화면에 맞추기" : "원본 크기";
    if (on) { stage.scrollTop = 0; stage.scrollLeft = 0; }
  }

  function toggleZoom(e) {
    if (e) e.stopPropagation();
    setZoom(overlay.getAttribute("data-zoom") !== "1");
  }

  function step(d) { if (list.length > 1) show(idx + d); }

  function open(i) {
    build();
    lastFocus = document.activeElement;
    show(i);
    overlay.setAttribute("data-open", "1");
    document.body.style.overflow = "hidden";
    overlay.querySelector(".lb-close").focus();
  }

  function close() {
    if (!overlay) return;
    overlay.removeAttribute("data-open");
    setZoom(false);
    img.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (!overlay || overlay.getAttribute("data-open") !== "1") return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });

  function init() {
    var scope = document.querySelector(".md-content article") || document.body;
    list = Array.prototype.filter.call(
      scope.querySelectorAll("img"),
      function (el) {
        if (el.closest("a")) return false;                    // 이미 링크인 이미지는 제외
        return !/twemoji|emojione|gemoji/.test(el.className);  // 이모지 제외
      }
    );
    list.forEach(function (el, i) {
      if (el.dataset.lbBound === "1") return;
      el.dataset.lbBound = "1";
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", (captionFor(el) || "이미지") + " — 클릭하면 확대됩니다");
      el.addEventListener("click", function () { open(list.indexOf(el)); });
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(list.indexOf(el)); }
      });
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);   // Material instant navigation 대응
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
