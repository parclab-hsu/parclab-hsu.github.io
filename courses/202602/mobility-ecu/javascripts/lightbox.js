/* 강의 자료 이미지 확대 보기 (의존성 없음)
 *
 * - 본문 이미지를 클릭/Enter 하면 전체 화면 오버레이로 크게 본다.
 * - 오버레이에서 한 번 더 누르면 원본 크기로 전환되어 스크롤·드래그로 세부를 본다.
 *   (회로도, 6층 레이어 이미지처럼 세밀한 그림을 볼 때 필요)
 * - 닫기: Esc, 배경 클릭, 닫기 버튼.
 *
 * 제외 대상: 링크 안의 이미지, 아이콘(폭 200px 미만), .no-zoom 클래스.
 */
(function () {
  'use strict';

  var MIN_WIDTH = 200;
  var overlay, imgEl, capEl, hintEl, closeBtn, lastFocused, zoomed = false;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '이미지 확대 보기');
    overlay.innerHTML =
      '<button class="lb-close" type="button" aria-label="닫기 (Esc)">✕</button>' +
      '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
      '<div class="lb-bar"><p class="lb-cap"></p><p class="lb-hint"></p></div>';
    document.body.appendChild(overlay);

    imgEl = overlay.querySelector('.lb-img');
    capEl = overlay.querySelector('.lb-cap');
    hintEl = overlay.querySelector('.lb-hint');
    closeBtn = overlay.querySelector('.lb-close');

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('lb-stage')) close();
    });
    imgEl.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleZoom();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoom(); }
    });
  }

  function canZoomFurther() {
    // 원본이 화면보다 충분히 커야 원본 크기 보기가 의미 있다
    var nw = imgEl.naturalWidth || 0;
    return nw > window.innerWidth * 1.1;
  }

  function setHint() {
    hintEl.textContent = canZoomFurther()
      ? (zoomed ? '다시 누르면 화면에 맞춤 · Esc 닫기' : '한 번 더 누르면 원본 크기 · Esc 닫기')
      : 'Esc 또는 배경을 누르면 닫힘';
  }

  function toggleZoom() {
    if (!canZoomFurther()) return;
    zoomed = !zoomed;
    overlay.classList.toggle('is-zoomed', zoomed);
    setHint();
    if (zoomed) {
      var stage = overlay.querySelector('.lb-stage');
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
    }
  }

  function open(src, alt) {
    lastFocused = document.activeElement;
    zoomed = false;
    overlay.classList.remove('is-zoomed');
    imgEl.src = src;
    imgEl.alt = alt || '';
    capEl.textContent = alt || '';
    capEl.style.display = alt ? '' : 'none';
    overlay.classList.add('is-open');
    document.body.classList.add('lb-lock');
    if (imgEl.complete) setHint(); else imgEl.addEventListener('load', setHint, { once: true });
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('is-open', 'is-zoomed');
    document.body.classList.remove('lb-lock');
    imgEl.removeAttribute('src');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function enable(img) {
    if (img.dataset.lbReady) return;
    if (img.closest('a')) return;                    // 이미 링크인 이미지는 건드리지 않음
    if (img.classList.contains('no-zoom')) return;
    var w = img.naturalWidth || img.width || 0;
    if (w && w < MIN_WIDTH) return;                  // 아이콘류 제외

    img.dataset.lbReady = '1';
    img.classList.add('lb-zoomable');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', (img.alt ? img.alt + ' — ' : '') + '눌러서 확대');
    img.addEventListener('click', function () { open(img.currentSrc || img.src, img.alt); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img.currentSrc || img.src, img.alt); }
    });
  }

  function scan() {
    var imgs = document.querySelectorAll('.md-content img, article img');
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.complete) enable(img);
      else img.addEventListener('load', function () { enable(img); }, { once: true });
    });
  }

  function init() {
    if (!overlay) buildOverlay();
    scan();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Material for MkDocs 의 즉시 탐색(instant navigation) 대응
  if (window.document$ && typeof window.document$.subscribe === 'function') {
    window.document$.subscribe(init);
  }
})();
