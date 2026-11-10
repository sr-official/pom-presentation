// StageArt — larger illustrative SVG "process scenes" for the PRODUCTION
// section, one per stage category, so each stage reads as a small rendered
// illustration rather than a text row. Same offline-safe custom-vector
// approach as the rest of the deck.
const StageArt = (() => {
  function wrap(inner) {
    return `<svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" class="stage-art-svg">
      <defs>
        <linearGradient id="sa-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#153a82"/><stop offset="100%" stop-color="#0A2E6D"/>
        </linearGradient>
        <linearGradient id="sa-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F5F7FB"/><stop offset="100%" stop-color="#C2CCE0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="108" width="220" height="2" fill="#28345c" opacity="0.5"/>
      ${inner}
    </svg>`;
  }

  const scenes = {
    warehouse: () =>
      wrap(`
      <g opacity="0.5"><line x1="20" y1="30" x2="20" y2="108" stroke="#3a4674" stroke-width="2"/><line x1="200" y1="30" x2="200" y2="108" stroke="#3a4674" stroke-width="2"/>
      <line x1="20" y1="45" x2="200" y2="45" stroke="#3a4674" stroke-width="1.5"/><line x1="20" y1="70" x2="200" y2="70" stroke="#3a4674" stroke-width="1.5"/></g>
      <rect x="60" y="76" width="34" height="30" rx="2" fill="url(#sa-panel)" stroke="#8b96ab"/>
      <rect x="98" y="60" width="34" height="46" rx="2" fill="#c9a876" stroke="#8b6d43"/>
      <rect x="136" y="84" width="30" height="22" rx="2" fill="#1EBE61" opacity="0.85"/>
      <rect x="50" y="106" width="130" height="6" rx="1" fill="#454f60"/>`),

    qc: () =>
      wrap(`
      <rect x="60" y="40" width="80" height="56" rx="4" fill="url(#sa-panel)" stroke="#8b96ab"/>
      <path d="M75 60l14 14 26-26" fill="none" stroke="#1EBE61" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="158" cy="80" r="22" fill="none" stroke="#1EBE61" stroke-width="5"/>
      <line x1="174" y1="96" x2="190" y2="112" stroke="#1EBE61" stroke-width="6" stroke-linecap="round"/>`),

    cut: () =>
      wrap(`
      <rect x="30" y="66" width="140" height="14" rx="2" fill="url(#sa-panel)" stroke="#8b96ab"/>
      <g transform="translate(150,50)"><circle r="26" fill="none" stroke="#8fa8c9" stroke-width="4"/>
        ${Array.from({ length: 12 })
          .map(
            (_, i) =>
              `<line x1="0" y1="0" x2="${24 * Math.cos((i * Math.PI) / 6)}" y2="${24 * Math.sin((i * Math.PI) / 6)}" stroke="#8fa8c9" stroke-width="3"/>`,
          )
          .join("")}
      </g>
      <line x1="150" y1="76" x2="150" y2="108" stroke="#4B5568" stroke-width="6"/>
      <path d="M120 66 l6 -10 M128 66 l6 -12 M136 66 l6 -10" stroke="#c2cce0" stroke-width="2" opacity="0.7"/>`),

    drill: () =>
      wrap(`
      <rect x="46" y="80" width="120" height="16" rx="2" fill="url(#sa-panel)" stroke="#8b96ab"/>
      <rect x="100" y="18" width="14" height="46" rx="3" fill="#4B5568"/>
      <rect x="92" y="10" width="30" height="12" rx="3" fill="url(#sa-metal)"/>
      <circle cx="107" cy="80" r="3.5" fill="#0E1730"/>
      <path d="M104 66l3 8 3-8" fill="none" stroke="#8fa8c9" stroke-width="2" opacity="0.8"/>`),

    edge: () =>
      wrap(`
      <rect x="30" y="60" width="130" height="20" rx="3" fill="url(#sa-panel)" stroke="#8b96ab"/>
      <rect x="150" y="52" width="16" height="36" rx="3" fill="url(#sa-metal)"/>
      <circle cx="158" cy="70" r="10" fill="none" stroke="#1EBE61" stroke-width="3"/>
      <rect x="160" y="66" width="26" height="8" rx="3" fill="#1EBE61"/>`),

    weld: () =>
      wrap(`
      <line x1="40" y1="90" x2="100" y2="90" stroke="url(#sa-metal)" stroke-width="10" stroke-linecap="round"/>
      <line x1="100" y1="90" x2="100" y2="40" stroke="url(#sa-metal)" stroke-width="10" stroke-linecap="round"/>
      <g transform="translate(100,90)">
        ${Array.from({ length: 8 })
          .map(
            (_, i) =>
              `<line x1="0" y1="0" x2="${16 * Math.cos((i * Math.PI) / 4)}" y2="${16 * Math.sin((i * Math.PI) / 4)}" stroke="#E0A93A" stroke-width="2.5"/>`,
          )
          .join("")}
        <circle r="7" fill="#fff"/><circle r="4" fill="#E0A93A"/>
      </g>`),

    finish: () =>
      wrap(`
      <rect x="100" y="40" width="12" height="50" rx="3" fill="url(#sa-metal)"/>
      <rect x="80" y="34" width="52" height="10" rx="3" fill="url(#sa-metal)"/>
      <g transform="translate(58,64)">
        <rect x="-14" y="-6" width="20" height="12" rx="2" fill="#4B5568"/>
        <rect x="-30" y="-2" width="18" height="4" rx="2" fill="#8fa8c9"/>
        ${[
          [-40, -8],
          [-46, 0],
          [-40, 8],
        ]
          .map(
            ([x, y]) =>
              `<circle cx="${x}" cy="${y}" r="2" fill="#c2cce0" opacity="0.8"/>`,
          )
          .join("")}
      </g>`),

    assembly: () =>
      wrap(`
      <rect x="70" y="70" width="70" height="10" rx="2" fill="url(#sa-metal)"/>
      <rect x="130" y="50" width="10" height="46" rx="2" fill="url(#sa-metal)"/>
      <g transform="translate(140,74) rotate(25)"><rect x="-6" y="-22" width="12" height="40" rx="3" fill="#8fa8c9"/><rect x="-11" y="-30" width="22" height="12" rx="3" fill="#c2cce0"/></g>
      <circle cx="140" cy="74" r="4" fill="#0E1730"/>`),

    shield: () =>
      wrap(`
      <path d="M110 26l34 14v28c0 22-15 36-34 44-19-8-34-22-34-44V40z" fill="none" stroke="#1EBE61" stroke-width="4"/>
      <path d="M96 66l10 10 20-20" fill="none" stroke="#1EBE61" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),

    box: () =>
      wrap(`
      <g transform="translate(70,40)">
        <path d="M0 16 L40 0 L80 16 L40 32 Z" fill="#dcb98a"/>
        <path d="M0 16 L0 60 L40 76 L40 32 Z" fill="#c49a63"/>
        <path d="M80 16 L80 60 L40 76 L40 32 Z" fill="#b3854f"/>
        <path d="M0 16 L40 32 L80 16" fill="none" stroke="#1EBE61" stroke-width="3"/>
        <rect x="34" y="30" width="12" height="46" fill="#1EBE61" opacity="0.85"/>
      </g>`),

    route: () =>
      wrap(`
      <circle cx="40" cy="50" r="8" fill="none" stroke="#1EBE61" stroke-width="4"/>
      <circle cx="180" cy="90" r="8" fill="none" stroke="#1EBE61" stroke-width="4"/>
      <path d="M40 58 v20 a16 16 0 0 0 16 16 h108 a16 16 0 0 1 16 16" fill="none" stroke="#8fa8c9" stroke-width="3" stroke-dasharray="6 5"/>`),
  };

  function svg(category) {
    return (scenes[category] || scenes.assembly)();
  }

  return { svg };
})();
