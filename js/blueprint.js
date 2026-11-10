// Blueprint — engineering/drafting-table visual flourishes.
// Draws technical wireframes with a real stroke-dashoffset "trace" animation
// (measured per-shape via getTotalLength, not a guessed value), builds
// reusable HUD viewfinder corners, and runs a small cycling status ticker.
const Blueprint = (() => {

  function traceOnce(svgEl, opts) {
    opts = opts || {};
    const shapes = Array.from(svgEl.querySelectorAll('.bp-draw, .bp-draw-fill'));
    shapes.forEach((el, i) => {
      let len = 60;
      try { len = el.getTotalLength(); } catch (e) { /* non-geometry element, ignore */ }
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      el.style.transition = 'none';
      // eslint-disable-next-line no-unused-expressions
      el.getBoundingClientRect();
      const delay = (opts.stagger || 90) * i;
      el.style.transition = `stroke-dashoffset ${opts.duration || 900}ms cubic-bezier(.65,0,.35,1) ${delay}ms`;
      requestAnimationFrame(() => { el.style.strokeDashoffset = '0'; });
    });
    const totalTime = shapes.length ? (shapes.length - 1) * (opts.stagger || 90) + (opts.duration || 900) : 0;

    // Text labels fade in once the line work is mostly complete, rather than
    // trying to "trace" glyph outlines.
    const labels = Array.from(svgEl.querySelectorAll('.dim-label'));
    labels.forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.getBoundingClientRect();
      el.style.transition = `opacity 400ms ${opts.ease || 'ease'} ${Math.max(0, totalTime - 250)}ms`;
      requestAnimationFrame(() => { el.style.opacity = '0.85'; });
    });

    return totalTime;
  }

  /** Trace the wireframe in, then periodically re-trace it for a continuous "system check" feel. */
  function animateLoop(svgEl, opts) {
    opts = opts || {};
    const cycle = () => {
      const total = traceOnce(svgEl, opts);
      setTimeout(cycle, total + (opts.holdMs || 7000));
    };
    cycle();
  }

  function hudFrameHtml() {
    return `
      <span class="hud-corner tl"></span>
      <span class="hud-corner tr"></span>
      <span class="hud-corner bl"></span>
      <span class="hud-corner br"></span>`;
  }

  /** Small cycling monospace status line, e.g. for a loading/engineering feel. */
  function mountTicker(container, phrases, intervalMs) {
    container.innerHTML = `<span class="status-dot"></span><span class="status-ticker-text mono"></span>`;
    const textEl = container.querySelector('.status-ticker-text');
    let i = 0;
    function show() {
      textEl.textContent = phrases[i % phrases.length];
      textEl.classList.remove('swap');
    }
    show();
    setInterval(() => {
      textEl.classList.add('swap');
      setTimeout(() => {
        i++;
        show();
      }, 240);
    }, intervalMs || 2200);
  }

  // A simple technical schematic of the FlexDesk: top-down-ish line art with
  // a dimension callout and a couple of "fastener" circles, built to read as
  // a drafting sheet rather than a picture.
  function deskWireframeSVG() {
    return `
    <svg viewBox="0 0 480 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DIPTO FlexDesk technical schematic">
      <rect class="bp-draw-fill" x="60" y="70" width="360" height="24" rx="3"/>
      <line class="bp-draw" x1="90" y1="94" x2="90" y2="220"/>
      <line class="bp-draw" x1="390" y1="94" x2="390" y2="220"/>
      <rect class="bp-draw" x="70" y="92" width="40" height="8"/>
      <rect class="bp-draw" x="370" y="92" width="40" height="8"/>
      <rect class="bp-draw" x="210" y="86" width="24" height="12" rx="2"/>
      <circle class="bp-draw" cx="216" cy="92" r="2"/>
      <circle class="bp-draw" cx="228" cy="92" r="2"/>
      <rect class="bp-draw" x="150" y="150" width="70" height="10" rx="2"/>
      <line class="bp-draw" x1="60" y1="250" x2="420" y2="250"/>
      <line class="bp-draw" x1="60" y1="244" x2="60" y2="256"/>
      <line class="bp-draw" x1="420" y1="244" x2="420" y2="256"/>
      <text x="240" y="270" text-anchor="middle" class="dim-label">1200 mm</text>
    </svg>`;
  }

  return { traceOnce, animateLoop, hudFrameHtml, mountTicker, deskWireframeSVG };
})();
