(function () {
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('edit') === '1') localStorage.setItem('wh-edit', '1');
    if (q.get('edit') === '0') localStorage.removeItem('wh-edit');
  } catch (e) {}
  function apply() {
    var on = false;
    try { on = localStorage.getItem('wh-edit') === '1'; } catch (e) {}
    if (document.body) document.body.classList.toggle('wh-edit-on', on);
  }
  if (window.document$ && typeof window.document$.subscribe === 'function') {
    window.document$.subscribe(apply);
  } else {
    document.addEventListener('DOMContentLoaded', apply);
  }
})();
