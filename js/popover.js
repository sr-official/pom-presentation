// Popover — a small floating info box anchored to whatever element triggered
// it (hover to preview, click/Enter to pin open). Deliberately NOT a fixed
// full-height sidebar: it sizes to its content and positions itself near the
// element so it never blocks the rest of the visualization.
const Popover = (() => {

  let popEl = null;
  let pinned = false;
  let hideTimer = null;

  function ensureEl() {
    if (popEl) return popEl;
    popEl = document.createElement('div');
    popEl.className = 'popover';
    popEl.setAttribute('role', 'dialog');
    popEl.innerHTML = `<button class="popover-close" aria-label="Close">&times;</button><div class="popover-body"></div>`;
    document.body.appendChild(popEl);
    popEl.querySelector('.popover-close').addEventListener('click', () => hide(true));
    popEl.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    popEl.addEventListener('mouseleave', () => { if (!pinned) scheduleHide(); });
    return popEl;
  }

  function positionNear(rect) {
    const el2 = ensureEl();
    // Measure after content is set (needs to be visible to measure).
    el2.style.visibility = 'hidden';
    el2.style.display = 'block';
    const pw = el2.offsetWidth || 260;
    const ph = el2.offsetHeight || 120;
    const margin = 12;
    let left = rect.right + margin;
    let top = rect.top;

    // Flip to the left side if it would overflow the right edge.
    if (left + pw > window.innerWidth - 8) {
      left = rect.left - pw - margin;
    }
    // Clamp horizontally if still off-screen (small viewport / narrow panel).
    if (left < 8) left = Math.min(rect.left, window.innerWidth - pw - 8);
    left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));

    // Clamp vertically.
    if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
    top = Math.max(8, top);

    el2.style.left = left + 'px';
    el2.style.top = top + 'px';
    el2.style.visibility = 'visible';
  }

  function show(html, anchorEl, opts) {
    opts = opts || {};
    clearTimeout(hideTimer);
    const el2 = ensureEl();
    el2.querySelector('.popover-body').innerHTML = html;
    el2.classList.toggle('pinned', !!opts.pin);
    pinned = !!opts.pin;
    const rect = anchorEl.getBoundingClientRect();
    positionNear(rect);
    el2.classList.add('open');
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => hide(false), 120);
  }

  function hide(force) {
    if (!popEl) return;
    if (pinned && !force) return;
    popEl.classList.remove('open');
    pinned = false;
  }

  function isPinnedOpen() {
    return pinned && popEl && popEl.classList.contains('open');
  }

  let globalListenersBound = false;

  /**
   * Wire hover+click+keyboard behaviour onto a set of elements.
   * getHtml(el) must return the HTML string to show for that element.
   */
  function attach(elements, getHtml) {
    elements.forEach(elm => {
      elm.addEventListener('mouseenter', () => {
        if (isPinnedOpen()) return;
        show(getHtml(elm), elm, { pin: false });
      });
      elm.addEventListener('mouseleave', () => { if (!pinned) scheduleHide(); });
      elm.addEventListener('focus', () => show(getHtml(elm), elm, { pin: false }));
      elm.addEventListener('blur', () => { if (!pinned) scheduleHide(); });
      elm.addEventListener('click', (e) => {
        e.stopPropagation();
        show(getHtml(elm), elm, { pin: true });
      });
      elm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show(getHtml(elm), elm, { pin: true });
        }
      });
    });
    if (!globalListenersBound) {
      document.addEventListener('click', () => hide(true));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(true); });
      globalListenersBound = true;
    }
  }

  return { show, hide, attach };
})();
