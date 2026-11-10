// Small, dependency-free animation & formatting helpers.
const FX = (() => {

  /** Animate a number from `from` to `to` inside el.textContent over duration ms. */
  function countTo(el, from, to, duration, formatter) {
    if (!el) return;
    const start = performance.now();
    const fmt = formatter || (n => Math.round(n).toLocaleString('en-US'));
    if (prefersReducedMotion()) {
      el.textContent = fmt(to);
      return;
    }
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      const val = from + (to - from) * eased;
      el.textContent = fmt(val);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Re-trigger a CSS class-based enter animation on an element. */
  function playRiseIn(el) {
    if (!el) return;
    el.classList.remove('rise-in');
    // force reflow so the animation restarts
    void el.offsetWidth;
    el.classList.add('rise-in');
  }

  function fmtCurrency(n, symbol) {
    return (symbol || '৳') + Math.round(n).toLocaleString('en-US');
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  return { countTo, playRiseIn, fmtCurrency, clamp, prefersReducedMotion };
})();
