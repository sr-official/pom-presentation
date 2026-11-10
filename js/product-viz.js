// DeskViz — a pseudo-3D FlexDesk visualization built from flat SVG shapes
// animated with CSS transforms. No external 3D library, per project spec.
// v2: more realistic desk rendering (shaded legs, wood-grain top, edge band,
// grounded shadow) plus a small per-variant "demo scene" prop and chair so
// each target-customer variant reads as a distinct, plausible setting.
const DeskViz = (() => {

  let state = {
    mode: 'focus',
    exploded: false,
    variant: 'standard',
    rotating: false,
    photoMode: false,
    viewAngle: 0,
    onPartClick: null
  };

  const PARTS = [
    { id: 'top',        label: 'Main Tabletop' },
    { id: 'frameL',      label: 'Left Support Frame' },
    { id: 'frameR',      label: 'Right Support Frame' },
    { id: 'mechanism',   label: 'Folding Mechanism' },
    { id: 'connector',   label: 'Desk Connector' },
    { id: 'feet',        label: 'Base / Rubber Feet' },
    { id: 'storage',     label: 'Storage Tray' },
    { id: 'device',      label: 'Device Stand' }
  ];

  const VARIANTS = {
    standard: { label: 'Standard',      units: 1, scale: 1.00, defaultMode: 'focus',   customer: 'Schools & Coaching Centers', scene: 'classroom', chairs: true },
    compact:  { label: 'Compact Home',  units: 1, scale: 0.86, defaultMode: 'compact', customer: 'Students & Home Learners',   scene: 'home',       chairs: true },
    bench:    { label: 'Bench Duo',     units: 2, scale: 0.92, defaultMode: 'connect', customer: 'Madrasas & Group Seating',   scene: 'bench',      chairs: false },
    trainer:  { label: 'Trainer Set',   units: 2, scale: 0.86, defaultMode: 'present', customer: 'Training Organizations & Institutions', scene: 'training', chairs: true }
  };

  // ---------- one desk unit (tabletop, frames, mechanism, accessories) ----------
  function oneUnit(unitId, xOffset) {
    return `
    <g id="${unitId}" class="stage-svg-wrap" transform="translate(${xOffset}, 0)">
      <ellipse class="desk-shadow" cx="320" cy="350" rx="215" ry="16" fill="#000" opacity="0.28"/>

      <g class="desk-part" data-id="feet" tabindex="0" role="button" aria-label="Base / Rubber Feet">
        <ellipse cx="185" cy="345" rx="15" ry="5" fill="#0c1224"/>
        <ellipse cx="455" cy="345" rx="15" ry="5" fill="#0c1224"/>
      </g>

      <g class="desk-part" data-id="frameL" tabindex="0" role="button" aria-label="Left Support Frame">
        <rect x="176" y="185" width="11" height="155" rx="3" fill="url(#legShade)"/>
        <rect x="178" y="185" width="3" height="155" fill="#ffffff" opacity="0.25"/>
        <rect x="150" y="183" width="70" height="11" rx="3" fill="url(#metalGrad)"/>
        <rect x="150" y="183" width="70" height="3" rx="1.5" fill="#ffffff" opacity="0.3"/>
      </g>
      <g class="desk-part" data-id="frameR" tabindex="0" role="button" aria-label="Right Support Frame">
        <rect x="454" y="185" width="11" height="155" rx="3" fill="url(#legShade)"/>
        <rect x="456" y="185" width="3" height="155" fill="#ffffff" opacity="0.25"/>
        <rect x="420" y="183" width="70" height="11" rx="3" fill="url(#metalGrad)"/>
        <rect x="420" y="183" width="70" height="3" rx="1.5" fill="#ffffff" opacity="0.3"/>
      </g>

      <g class="desk-part" data-id="mechanism" tabindex="0" role="button" aria-label="Folding / Adjustment Mechanism">
        <rect x="298" y="177" width="44" height="19" rx="4" fill="#4B5568"/>
        <rect x="298" y="177" width="44" height="4" rx="2" fill="#6b768c"/>
        <circle cx="309" cy="187" r="4" fill="#0E1730" stroke="#6b768c" stroke-width="1"/>
        <circle cx="331" cy="187" r="4" fill="#0E1730" stroke="#6b768c" stroke-width="1"/>
      </g>

      <g class="desk-part" data-id="top" tabindex="0" role="button" aria-label="Main Tabletop">
        <rect x="118" y="148" width="404" height="30" rx="5" fill="url(#topGrad)" stroke="#8b96ab" stroke-width="1"/>
        <rect x="118" y="148" width="404" height="7" rx="3.5" fill="#ffffff" opacity="0.6"/>
        <!-- subtle wood-grain lines -->
        <path d="M136 160 H504" stroke="#b9c3d6" stroke-width="1" opacity="0.5"/>
        <path d="M136 166 H480" stroke="#b9c3d6" stroke-width="1" opacity="0.35"/>
        <path d="M150 172 H500" stroke="#a7b2c8" stroke-width="1" opacity="0.3"/>
        <!-- edge band strip along the front edge -->
        <rect x="118" y="173" width="404" height="5" rx="2" fill="#7d879c"/>
      </g>

      <g class="desk-part" data-id="connector" tabindex="0" role="button" aria-label="Desk Connector">
        <rect x="503" y="153" width="22" height="16" rx="2" fill="url(#greenGrad)"/>
        <rect x="507" y="156" width="14" height="3" rx="1.5" fill="#ffffff" opacity="0.4"/>
      </g>

      <g class="desk-part" data-id="storage" tabindex="0" role="button" aria-label="Storage Tray">
        <rect x="198" y="258" width="124" height="16" rx="3" fill="#8b96ab"/>
        <rect x="198" y="258" width="124" height="4" rx="2" fill="#a4adbf"/>
      </g>

      <g class="desk-part" data-id="device" tabindex="0" role="button" aria-label="Device Stand">
        <rect x="359" y="116" width="9" height="36" rx="2" fill="url(#greenGrad)"/>
        <rect x="343" y="110" width="41" height="9" rx="2" fill="url(#greenGrad)"/>
      </g>
    </g>`;
  }

  // ---------- simple chair silhouette, tucked behind a unit ----------
  function chair(unitId, xOffset) {
    return `
    <g id="${unitId}-chair" class="scene-chair stage-svg-wrap" transform="translate(${xOffset + 250}, 0)" opacity="1">
      <rect x="0" y="222" width="58" height="9" rx="3" fill="#2b3554"/>
      <rect x="0" y="222" width="58" height="60" rx="4" fill="none" stroke="#2b3554" stroke-width="9" stroke-linecap="round"/>
      <rect x="4" y="278" width="6" height="60" fill="#232c48"/>
      <rect x="48" y="278" width="6" height="60" fill="#232c48"/>
    </g>`;
  }

  // ---------- per-variant demo-scene backdrop (drawn behind the desks) ----------
  function sceneBackdrop() {
    return `
    <g id="scene-classroom" class="scene-prop">
      <rect x="330" y="34" width="280" height="96" rx="4" fill="#0c3d24" stroke="#1a5c39" stroke-width="2"/>
      <path d="M352 58 H560 M352 76 H540 M352 94 H520" stroke="#3fae7a" stroke-width="2" opacity="0.55" stroke-linecap="round"/>
      <rect x="330" y="130" width="280" height="8" rx="2" fill="#6b768c"/>
    </g>
    <g id="scene-home" class="scene-prop">
      <rect x="378" y="24" width="150" height="120" rx="8" fill="url(#windowGrad)" stroke="#8b96ab" stroke-width="2"/>
      <path d="M453 24 V144 M378 84 H528" stroke="#8b96ab" stroke-width="2"/>
      <circle cx="640" cy="255" r="20" fill="none" stroke="#E0A93A" stroke-width="3" opacity="0.7"/>
      <path d="M640 235 V214" stroke="#4B5568" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="640" cy="212" rx="14" ry="7" fill="#E0A93A" opacity="0.85"/>
    </g>
    <g id="scene-bench" class="scene-prop">
      <rect x="150" y="300" width="470" height="20" rx="6" fill="#2b3554"/>
      <rect x="170" y="320" width="10" height="26" fill="#232c48"/>
      <rect x="600" y="320" width="10" height="26" fill="#232c48"/>
      <rect x="380" y="320" width="10" height="26" fill="#232c48"/>
      <path d="M150 296 h470" stroke="#3a4674" stroke-width="2" opacity="0.6" stroke-dasharray="3 5"/>
    </g>
    <g id="scene-training" class="scene-prop">
      <rect x="360" y="30" width="200" height="130" rx="4" fill="#0E1730" stroke="#8b96ab" stroke-width="2"/>
      <path d="M390 60 L430 100 L460 75 L530 130" stroke="#1EBE61" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="390" cy="60" r="4" fill="#1EBE61"/>
      <circle cx="430" cy="100" r="4" fill="#1EBE61"/>
      <circle cx="460" cy="75" r="4" fill="#1EBE61"/>
      <circle cx="530" cy="130" r="4" fill="#1EBE61"/>
      <line x1="330" y1="200" x2="360" y2="60" stroke="#4B5568" stroke-width="4"/>
      <line x1="590" y1="200" x2="560" y2="60" stroke="#4B5568" stroke-width="4"/>
    </g>`;
  }

  function buildSVG() {
    return `
    <div class="desk-rotate-wrap" id="desk-rotate-wrap">
      <svg id="desk-svg" viewBox="0 0 940 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DIPTO FlexDesk product visualization">
        <defs>
          <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F5F7FB"/>
            <stop offset="100%" stop-color="#C2CCE0"/>
          </linearGradient>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0A2E6D"/>
            <stop offset="100%" stop-color="#1c4694"/>
          </linearGradient>
          <linearGradient id="legShade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#082352"/>
            <stop offset="55%" stop-color="#153a82"/>
            <stop offset="100%" stop-color="#0A2E6D"/>
          </linearGradient>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1EBE61"/>
            <stop offset="100%" stop-color="#149249"/>
          </linearGradient>
          <linearGradient id="windowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2a3f6e"/>
            <stop offset="100%" stop-color="#E0A93A" stop-opacity="0.35"/>
          </linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0c1224"/>
            <stop offset="100%" stop-color="#141c36"/>
          </linearGradient>
          <linearGradient id="reflFadeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#080d1c" stop-opacity="0"/>
            <stop offset="100%" stop-color="#080d1c" stop-opacity="1"/>
          </linearGradient>
        </defs>

        <rect x="-120" y="352" width="1180" height="68" fill="url(#floorGrad)"/>
        <line x1="-120" y1="352" x2="1060" y2="352" stroke="#28345c" stroke-width="1.5"/>

        <g id="desk-reflection" class="desk-reflection" transform="translate(0,704) scale(1,-1)" style="opacity:0;">
          <use href="#desk-units-wrap"/>
        </g>
        <rect x="-120" y="352" width="1180" height="68" fill="url(#reflFadeGrad)"/>

        <g id="scene-backdrop">${sceneBackdrop()}</g>

        <g id="chairs-wrap">
          ${chair('desk-unit-a', 0)}
          ${chair('desk-unit-b', 300)}
        </g>

        <g id="desk-units-wrap">
          ${oneUnit('desk-unit-a', 0)}
          ${oneUnit('desk-unit-b', 300)}
        </g>
      </svg>
    </div>`;
  }

  function transformFor(partId, mode, exploded) {
    const explodeMap = {
      top:        'translate(0px, -46px)',
      frameL:     'translate(-40px, 30px)',
      frameR:     'translate(40px, 30px)',
      mechanism:  'translate(0px, -70px)',
      connector:  'translate(70px, -18px)',
      feet:       'translate(0px, 55px)',
      storage:    'translate(-70px, 60px)',
      device:     'translate(50px, -40px)'
    };
    const modeMap = {
      focus:   {},
      connect: { connector: 'translate(6px, 0px) scale(1.3)' },
      present: { top: 'rotate(-4deg)', frameL: 'rotate(-3deg)', frameR: 'rotate(-3deg)' },
      compact: {
        top: 'translate(0px, 26px) rotate(90deg) scale(0.72,1)',
        frameL: 'translate(-4px, 40px) scaleY(0.35)',
        frameR: 'translate(4px, 40px) scaleY(0.35)',
        mechanism: 'translate(0px, 40px) scale(0.6)',
        storage: 'translate(0px, 46px) scale(0.7)',
        device: 'translate(0px, -10px) scale(0.6)',
        connector: 'scale(0.001)'
      }
    };
    let t = (modeMap[mode] && modeMap[mode][partId]) || '';
    if (exploded) t = (explodeMap[partId] || '') + ' ' + t;
    return t;
  }

  function assembleStart(partId) {
    const starts = {
      top: 'translate(-30px, -140px) scale(0.5)',
      frameL: 'translate(-160px, -20px) scale(0.5)',
      frameR: 'translate(160px, -20px) scale(0.5)',
      mechanism: 'translate(0px, -180px) scale(0.4)',
      connector: 'translate(200px, -60px) scale(0.4)',
      feet: 'translate(0px, 140px) scale(0.4)',
      storage: 'translate(-180px, 100px) scale(0.4)',
      device: 'translate(120px, -120px) scale(0.4)'
    };
    return starts[partId] || 'scale(0.4)';
  }

  function unitVisible(unitId) {
    const v = VARIANTS[state.variant] || VARIANTS.standard;
    if (unitId === 'desk-unit-a') return true;
    return v.units === 2 || state.mode === 'connect';
  }

  function applyState(container) {
    const wrap = container.querySelector('#desk-rotate-wrap');
    const svg = container.querySelector('#desk-svg');
    if (!svg) return;
    const v = VARIANTS[state.variant] || VARIANTS.standard;

    ['desk-unit-a', 'desk-unit-b'].forEach((unitId, unitIdx) => {
      const unitG = svg.querySelector('#' + unitId);
      if (!unitG) return;
      const visible = unitVisible(unitId);
      unitG.style.opacity = visible ? '1' : '0';
      const baseX = unitIdx === 0 ? 0 : (visible ? 300 : 60);
      unitG.setAttribute('transform', `translate(${baseX}, 0)`);

      unitG.querySelectorAll('.desk-part').forEach(el => {
        const partId = el.getAttribute('data-id');
        el.style.transform = transformFor(partId, state.mode, state.exploded);
        el.style.opacity = '1';
      });

      // Chairs: only for variants that use them, only in un-exploded FOCUS/PRESENT
      // views (hidden for COMPACT storage mode and the CONNECT/bench layout,
      // where a shared bench prop is shown instead).
      const chairEl = svg.querySelector(`#${unitId}-chair`);
      if (chairEl) {
        const showChair = visible && v.chairs && !state.exploded && state.mode !== 'compact' && state.mode !== 'connect';
        chairEl.style.opacity = showChair ? '1' : '0';
        chairEl.setAttribute('transform', `translate(${baseX + 250}, 0)`);
      }
    });

    // Demo-scene backdrop prop: exactly one shown, matched to the active variant.
    const sceneMap = { classroom: 'standard', home: 'compact', bench: 'bench', training: 'trainer' };
    svg.querySelectorAll('.scene-prop').forEach(propEl => {
      const propScene = propEl.id.replace('scene-', '');
      const matches = sceneMap[propScene] === state.variant;
      propEl.style.opacity = matches && !state.exploded ? '1' : '0';
    });

    // Photo mode: fade in a floor reflection for a "product shot" feel;
    // hidden in the technical exploded view where it would just be clutter.
    const reflEl = svg.querySelector('#desk-reflection');
    if (reflEl) {
      const show = state.photoMode && !state.exploded;
      reflEl.style.transition = 'opacity 500ms ease';
      reflEl.style.opacity = show ? '0.18' : '0';
    }

    const showingTwo = unitVisible('desk-unit-b');
    const centerX = showingTwo ? 460 : 320;
    svg.setAttribute('viewBox', `${centerX - 470} 0 940 420`);
    if (wrap) {
      wrap.style.setProperty('--desk-scale', v.scale);
      wrap.classList.toggle('rotating', !!state.rotating);
      // A static camera-angle shot (gallery thumbnails) only applies when not
      // actively spinning — the rotating class drives its own animation.
      if (!state.rotating) {
        wrap.querySelector('svg').style.transform = `scale(var(--desk-scale, 1)) rotateY(${state.viewAngle || 0}deg)`;
      } else {
        wrap.querySelector('svg').style.transform = '';
      }
    }
  }

  function playAssembleIn(container) {
    const svg = container.querySelector('#desk-svg');
    if (!svg) return;
    const parts = svg.querySelectorAll('.desk-part');
    parts.forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = assembleStart(el.getAttribute('data-id'));
    });
    void svg.getBoundingClientRect();
    parts.forEach(el => { el.style.transition = ''; });
    requestAnimationFrame(() => requestAnimationFrame(() => applyState(container)));
  }

  function attachEvents(container) {
    const svg = container.querySelector('#desk-svg');
    if (!svg) return;
    svg.querySelectorAll('.desk-part').forEach(el => {
      const activate = () => {
        const id = el.getAttribute('data-id');
        if (state.onPartClick) state.onPartClick(id, el);
      };
      el.addEventListener('click', activate);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  /**
   * Mount the desk visualization into a container element.
   * opts: { mode, exploded, variant, onPartClick }
   */
  function mount(container, opts) {
    state = Object.assign({ mode: 'focus', exploded: false, variant: 'standard', rotating: false, photoMode: false, onPartClick: null }, opts || {});
    container.innerHTML = buildSVG();
    attachEvents(container);
    playAssembleIn(container);
  }

  function setMode(container, mode) {
    state.mode = mode;
    applyState(container);
  }

  function setExploded(container, exploded) {
    state.exploded = exploded;
    applyState(container);
  }

  function setVariant(container, variantId) {
    state.variant = variantId;
    const v = VARIANTS[variantId] || VARIANTS.standard;
    state.mode = v.defaultMode;
    playAssembleIn(container);
  }

  function setRotating(container, on) {
    state.rotating = on;
    applyState(container);
  }

  function setViewAngle(container, deg) {
    state.viewAngle = deg;
    state.rotating = false;
    applyState(container);
  }

  function setPhotoMode(container, on) {
    state.photoMode = on;
    applyState(container);
  }

  function getState() { return Object.assign({}, state); }
  function getVariants() { return VARIANTS; }

  return { mount, setMode, setExploded, setVariant, setRotating, setViewAngle, setPhotoMode, getState, getVariants, PARTS };
})();
