// Icons — small stroke-based line icons (24x24 viewBox) used to give
// otherwise text-only cards a visual anchor. Deliberately minimal/geometric
// to match the technical/blueprint visual language rather than reading as
// clip-art.
const Icons = (() => {
  const base =
    'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

  const paths = {
    cut: `<path ${base} d="M6 6l12 12M18 6L6 18"/><circle ${base} cx="6" cy="6" r="2"/><circle ${base} cx="18" cy="18" r="2"/><circle ${base} cx="6" cy="18" r="2"/><circle ${base} cx="18" cy="6" r="2"/>`,
    drill: `<path ${base} d="M3 15l6-6 3 3-6 6H3v-3z"/><path ${base} d="M12 9l4-4 4 4-4 4"/><path ${base} d="M16 5l3-3"/>`,
    weld: `<path ${base} d="M4 20l6-6"/><path ${base} d="M14 4l6 6-8 8-6-6z"/><path ${base} d="M13 5l6 6"/>`,
    finish: `<path ${base} d="M4 15l5 5L20 9l-5-5z"/><path ${base} d="M4 15l-1 5 5-1"/>`,
    assembly: `<circle ${base} cx="12" cy="12" r="3"/><path ${base} d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>`,
    qc: `<circle ${base} cx="11" cy="11" r="6"/><path ${base} d="M21 21l-4.3-4.3"/><path ${base} d="M8.5 11l2 2 3.5-4"/>`,
    box: `<path ${base} d="M3 8l9-5 9 5-9 5-9-5z"/><path ${base} d="M3 8v9l9 5 9-5V8"/><path ${base} d="M12 13v9"/>`,
    truck: `<rect ${base} x="2" y="8" width="12" height="9"/><path ${base} d="M14 11h4l3 3v3h-7"/><circle ${base} cx="6" cy="19" r="1.6"/><circle ${base} cx="17" cy="19" r="1.6"/>`,
    warehouse: `<path ${base} d="M3 10l9-6 9 6"/><path ${base} d="M5 9v11h14V9"/><path ${base} d="M10 20v-6h4v6"/>`,
    person: `<circle ${base} cx="12" cy="8" r="3.4"/><path ${base} d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6"/>`,
    clock: `<circle ${base} cx="12" cy="12" r="8.5"/><path ${base} d="M12 7v5l3.5 2"/>`,
    shield: `<path ${base} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path ${base} d="M9 12l2 2 4-4"/>`,
    alert: `<path ${base} d="M12 3L2 20h20L12 3z"/><path ${base} d="M12 10v4"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/>`,
    board: `<rect ${base} x="3" y="6" width="18" height="12" rx="1.5"/><path ${base} d="M3 10h18M3 14h18"/>`,
    steel: `<rect ${base} x="4" y="4" width="16" height="16" rx="2"/><path ${base} d="M4 9h16M4 15h16M9 4v16M15 4v16"/>`,
    laminate: `<rect ${base} x="3" y="5" width="18" height="14" rx="1.5"/><path ${base} d="M3 9.5h18"/>`,
    rubber: `<circle ${base} cx="12" cy="12" r="8"/><circle ${base} cx="12" cy="12" r="3.5"/>`,
    hardware: `<circle ${base} cx="12" cy="12" r="3"/><path ${base} d="M12 2v3M12 19v3M4.2 6.3l2.4 1.4M17.4 16.3l2.4 1.4M4.2 17.7l2.4-1.4M17.4 7.7l2.4-1.4"/>`,
    edge: `<path ${base} d="M4 18L18 4"/><path ${base} d="M4 18h4v-4"/>`,
    target: `<circle ${base} cx="12" cy="12" r="8"/><circle ${base} cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>`,
    coin: `<circle ${base} cx="12" cy="12" r="8.5"/><path ${base} d="M12 7v10M9.5 9.3c0-1.3 1.1-2.1 2.5-2.1s2.5.8 2.5 2c0 2.6-5 1.7-5 4.3 0 1.3 1.1 2.1 2.5 2.1s2.5-.8 2.5-2"/>`,
    route: `<circle ${base} cx="5" cy="6" r="2"/><circle ${base} cx="19" cy="18" r="2"/><path ${base} d="M5 8v4a4 4 0 0 0 4 4h6"/>`,
    layers: `<path ${base} d="M12 3l9 5-9 5-9-5 9-5z"/><path ${base} d="M3 13l9 5 9-5"/>`,
    repair: `<path ${base} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-3 3-2-2z"/>`,
    sun: `<circle ${base} cx="12" cy="12" r="4.2"/><path ${base} d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>`,
    moon: `<path ${base} d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5z"/>`,
    image: `<rect ${base} x="3" y="4" width="18" height="16" rx="2"/><circle ${base} cx="9" cy="10" r="1.8"/><path ${base} d="M21 16l-6-5-4 3.5-3-2.5-5 4.5"/>`,
    swatch: `<rect ${base} x="4" y="4" width="16" height="16" rx="3"/><path ${base} d="M4 14l4-4 4 4 4-6 4 4"/>`,
    grid: `<rect ${base} x="3" y="3" width="7" height="7"/><rect ${base} x="14" y="3" width="7" height="7"/><rect ${base} x="3" y="14" width="7" height="7"/><rect ${base} x="14" y="14" width="7" height="7"/>`,
  };

  function icon(name, opts) {
    opts = opts || {};
    const size = opts.size || 20;
    const cls = opts.class ? ` class="${opts.class}"` : "";
    const body = paths[name] || paths.target;
    return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
  }

  return { icon, names: Object.keys(paths) };
})();
