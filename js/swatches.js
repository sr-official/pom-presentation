// Swatches — small textured SVG material samples (particle-board fleck,
// plywood ply-stack, brushed steel, glossy laminate, etc.) used in the
// MATERIALS section in place of real photography, which this offline,
// no-stock-photo project can't embed.
const Swatches = (() => {

  function svg(type) {
    const body = renderers[type] || renderers.board;
    return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type} material sample" class="material-swatch-svg">${body(type)}</svg>`;
  }

  const renderers = {
    board: () => `
      <defs>
        <pattern id="pb-fleck" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#c9a876"/>
          <circle cx="3" cy="4" r="0.9" fill="#8a6d43"/>
          <circle cx="10" cy="9" r="0.7" fill="#a98750"/>
          <circle cx="7" cy="2" r="0.6" fill="#e6d0a6"/>
          <circle cx="12" cy="3" r="0.5" fill="#75592f"/>
          <circle cx="2" cy="11" r="0.55" fill="#e6d0a6"/>
        </pattern>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#pb-fleck)"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`,

    layers: () => `
      <rect width="120" height="80" rx="7" fill="#dcb98a"/>
      <g>
        ${[0, 11, 22, 33, 44, 55, 66].map((y, i) =>
          `<rect x="0" y="${y}" width="120" height="${i % 2 === 0 ? 8 : 3}" fill="${i % 2 === 0 ? '#c49a63' : '#efd9ae'}"/>`
        ).join('')}
      </g>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`,

    steel: () => `
      <defs>
        <linearGradient id="steel-brush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#b7c0cc"/>
          <stop offset="22%" stop-color="#808994"/>
          <stop offset="45%" stop-color="#ccd4de"/>
          <stop offset="70%" stop-color="#8a93a3"/>
          <stop offset="100%" stop-color="#bcc5d0"/>
        </linearGradient>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#steel-brush)"/>
      ${[10, 22, 34, 46, 58, 70].map(y => `<line x1="0" y1="${y}" x2="120" y2="${y - 14}" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>`).join('')}
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`,

    laminate: () => `
      <defs>
        <linearGradient id="lam-gloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f3f6fb"/>
          <stop offset="38%" stop-color="#c7d0de"/>
          <stop offset="50%" stop-color="#ffffff"/>
          <stop offset="62%" stop-color="#c0c9d8"/>
          <stop offset="100%" stop-color="#98a4b8"/>
        </linearGradient>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#lam-gloss)"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000025"/>`,

    edge: () => `
      <rect width="120" height="80" rx="7" fill="#232c48"/>
      <rect x="14" y="30" width="92" height="20" rx="9" fill="#dfe4ec"/>
      <rect x="14" y="30" width="92" height="7" rx="3.5" fill="#ffffff" opacity="0.6"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`,

    hardware: () => `
      <defs>
        <linearGradient id="hw-brush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#aab4c2"/>
          <stop offset="50%" stop-color="#7c8898"/>
          <stop offset="100%" stop-color="#b0b9c6"/>
        </linearGradient>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#hw-brush)"/>
      <circle cx="34" cy="30" r="10" fill="#454f60"/><circle cx="34" cy="30" r="3" fill="#0E1730"/>
      <circle cx="66" cy="50" r="10" fill="#454f60"/><circle cx="66" cy="50" r="3" fill="#0E1730"/>
      <rect x="82" y="16" width="26" height="8" rx="2" fill="#454f60" transform="rotate(28 95 20)"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`,

    rubber: () => `
      <defs>
        <pattern id="rb-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#1c2333"/>
          <circle cx="7" cy="7" r="2.6" fill="#262f45"/>
        </pattern>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#rb-dots)"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000040"/>`,

    finish: () => `
      <defs>
        <linearGradient id="fin-gloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f4e8cf"/>
          <stop offset="40%" stop-color="#d8b96f"/>
          <stop offset="52%" stop-color="#fbf1d9"/>
          <stop offset="100%" stop-color="#b6924a"/>
        </linearGradient>
      </defs>
      <rect width="120" height="80" rx="7" fill="url(#fin-gloss)"/>
      <rect x="0.75" y="0.75" width="118.5" height="78.5" rx="6.5" fill="none" stroke="#00000030"/>`
  };

  return { svg };
})();
