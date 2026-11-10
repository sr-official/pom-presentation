// DIPTO FlexDesk — Investor Presentation
// Main application controller: section registry, rendering, interactions.

(function () {
  "use strict";

  // ---------- Guard against missing data (graceful degradation) ----------
  const D = window.APPDATA || {};
  const FIN = D.finance || {
    currency: "৳",
    sellingPrice: 0,
    variableCosts: [],
    monthlyFixedCost: 0,
    monthlyCapacity: 0,
    sliderMin: 100,
    sliderMax: 1000,
    sliderStep: 50,
    sliderDefault: 300,
  };
  const PROD = D.product || { modes: [], components: [], differentiators: [] };
  const PRODN = D.production || { stages: [], factoryZones: [] };
  const WORK = D.workforce || { roles: [], total: 0 };
  const QUAL = D.quality || {
    gates: [],
    scenario: {},
    inventory: {},
    supplyChain: {},
    risks: [],
    sustainability: {},
  };
  const CAP = D.capacity || {};

  // ---------- Finance math (single source of truth = FIN) ----------
  function totalVariableCost() {
    return (FIN.variableCosts || []).reduce(
      (sum, c) => sum + (Number(c.value) || 0),
      0,
    );
  }
  function contributionPerUnit() {
    return FIN.sellingPrice - totalVariableCost();
  }
  function breakEvenUnits() {
    const c = contributionPerUnit();
    return c > 0 ? Math.round(FIN.monthlyFixedCost / c) : 0;
  }
  function financeAt(units) {
    const vc = totalVariableCost();
    const revenue = FIN.sellingPrice * units;
    const variableCost = vc * units;
    const totalCost = FIN.monthlyFixedCost + variableCost;
    const profit = revenue - totalCost;
    return { revenue, variableCost, totalCost, profit };
  }

  // ---------- DOM refs ----------
  const el = {
    opening: document.getElementById("opening"),
    app: document.getElementById("app"),
    enterBtn: document.getElementById("enter-btn"),
    stageEyebrow: document.getElementById("stage-eyebrow"),
    stageTitle: document.getElementById("stage-title"),
    stageCount: document.getElementById("stage-count"),
    stageBody: document.getElementById("stage-body"),
    contextBlock: document.getElementById("context-block"),
    progressFill: document.getElementById("progress-fill"),
    progressLabel: document.getElementById("progress-label"),
    kpiBar: document.getElementById("kpi-bar"),
    toggleLeft: document.getElementById("toggle-left"),
    toggleRight: document.getElementById("toggle-right"),
    mobileScrim: document.getElementById("mobile-scrim"),
    themeToggle: document.getElementById("theme-toggle"),
  };

  function fieldRow(label, value) {
    return `<div class="detail-field"><label>${label}</label><div>${value}</div></div>`;
  }

  // ---------- theme (dark / light) ----------
  const THEME_KEY = "dipto-flexdesk-theme";
  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }
  function writeStoredTheme(v) {
    try {
      localStorage.setItem(THEME_KEY, v);
    } catch (e) {
      /* storage unavailable — theme just won't persist */
    }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.themeToggle.innerHTML = Icons.icon(theme === "light" ? "moon" : "sun", {
      size: 16,
    });
    el.themeToggle.title =
      theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  }
  applyTheme(readStoredTheme() === "light" ? "light" : "dark");
  el.themeToggle.addEventListener("click", () => {
    const next =
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light";
    applyTheme(next);
    writeStoredTheme(next);
    // Re-render the current section so any inline SVG using var(--...) colors
    // (charts, diagrams) picks up the new palette immediately rather than
    // waiting for the next navigation.
    if (typeof currentSectionIndex === "number")
      goToSection(currentSectionIndex);
  });

  // ---------- collapsible side panels ----------
  const MOBILE_BP = 780;
  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function setPanel(side, collapsed) {
    const cls = "collapse-" + side;
    const btn = side === "left" ? el.toggleLeft : el.toggleRight;
    el.app.classList.toggle(cls, collapsed);
    btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
    btn.innerHTML =
      side === "left"
        ? collapsed
          ? "&#10095;"
          : "&#10094;"
        : collapsed
          ? "&#10094;"
          : "&#10095;";
  }

  function wireCollapse(btn, side) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cls = "collapse-" + side;
      const willCollapse = !el.app.classList.contains(cls);
      setPanel(side, willCollapse);
      // On phones, only one drawer at a time avoids the two overlays fighting for space.
      if (isMobile() && !willCollapse) {
        setPanel(side === "left" ? "right" : "left", true);
      }
    });
  }
  wireCollapse(el.toggleLeft, "left");
  wireCollapse(el.toggleRight, "right");
  el.mobileScrim.addEventListener("click", () => {
    setPanel("left", true);
    setPanel("right", true);
  });

  // Sensible defaults per viewport size: the brand panel tucks away first on
  // tablet-ish widths; both side panels start closed on phones so the
  // product gets the full screen, one tap away via the edge tabs.
  function applyDefaultPanelState() {
    if (isMobile()) {
      setPanel("left", true);
      setPanel("right", true);
    } else if (window.innerWidth < 1100) {
      setPanel("left", true);
      setPanel("right", false);
    } else {
      setPanel("left", false);
      setPanel("right", false);
    }
  }
  applyDefaultPanelState();
  let lastTier = isMobile()
    ? "mobile"
    : window.innerWidth < 1100
      ? "tablet"
      : "desktop";
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const tier = isMobile()
        ? "mobile"
        : window.innerWidth < 1100
          ? "tablet"
          : "desktop";
      // Only reset panel visibility when crossing into a different size
      // tier — not on every minor resize (e.g. a mobile browser's address
      // bar showing/hiding) — so a manual open/close choice isn't undone.
      if (tier !== lastTier) {
        lastTier = tier;
        applyDefaultPanelState();
      }
    }, 200);
  });

  // ================================================================
  // SECTION DEFINITIONS
  // ================================================================
  const sections = [
    // 01 PROBLEM ---------------------------------------------------
    {
      name: "PROBLEM",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "The Problem",
          [
            "Learning environments shift between activities constantly - but furniture usually stays fixed.",
            "Buying separate furniture for every configuration adds cost, storage burden, and clutter.",
          ],
          null,
          null,
        ),
      render(body) {
        body.innerHTML = `
          <div class="rise-in" style="display:flex;flex-direction:column;gap:34px;justify-content:center;height:100%;">
            <div class="flow-row">
              ${["Individual Study", "Group Work", "Presentation", "Storage"]
                .map(
                  (s, i, arr) =>
                    `<div class="flow-node">${s}</div>` +
                    (i < arr.length - 1
                      ? '<span class="flow-arrow">&#8594;</span>'
                      : ""),
                )
                .join("")}
            </div>
            <p class="text-secondary" style="max-width:560px;font-size:1.05rem;line-height:1.7;">
              Traditional furniture usually requires a different physical arrangement — or a different
              piece of furniture entirely - for each of these activities.
            </p>
            <h3 class="h-display" style="font-size:2rem;color:var(--green);">What if the furniture adapted instead?</h3>
            <div>
              <div class="h-display" style="font-size:2.6rem;">DIPTO FlexDesk</div>
              <div class="text-secondary" style="font-size:1.1rem;">One Desk. Multiple Possibilities.</div>
            </div>
          </div>`;
      },
    },

    // 02 PRODUCT -----------------------------------------------------
    {
      name: "PRODUCT",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "The Product",
          [
            "DIPTO FlexDesk is a proposed modular desk system: one basic unit, four working configurations.",
            "Existing modular and foldable furniture already exists - the differentiation is a single system that reconfigures for different learning activities.",
          ],
          (PROD.differentiators || []).map((d) => ({
            title: d.title,
            sub: d.text,
          })),
          null,
        ),
      render(body) {
        const variants = DeskViz.getVariants();
        const variantIds = Object.keys(variants);
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;height:100%;gap:10px;">
            <div>
              <div class="text-faint mono" style="font-size:0.68rem;letter-spacing:0.08em;margin-bottom:6px;">CONFIGURATION</div>
              <div class="mode-row" id="mode-row"></div>
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;">
              <div class="view-toggle" id="view-toggle">
                <button data-view="technical" class="active" type="button">TECHNICAL</button>
                <button data-view="photo" type="button">PHOTO VIEW</button>
                <button data-view="real" type="button">REAL PHOTO</button>
              </div>
              <button class="auto-chip on" id="auto-chip" type="button" aria-pressed="true">
                <span class="status-dot"></span><span id="auto-chip-label">AUTO-CYCLE</span>
              </button>
              <button class="btn-ghost" id="rotate-toggle">Rotate View</button>
            </div>
            <div>
              <div class="text-faint mono" style="font-size:0.68rem;letter-spacing:0.08em;margin-bottom:6px;">PRODUCT VARIANT - BY TARGET CUSTOMER</div>
              <div class="mode-row" id="variant-row"></div>
            </div>
            <div class="hud-frame scanline-wrap blueprint-grid" id="stage-frame" style="flex:1;position:relative;min-height:0;border:1px solid var(--border);border-radius:6px;">
              <span class="hud-corner tl"></span><span class="hud-corner tr"></span>
              <span class="hud-corner bl"></span><span class="hud-corner br"></span>
              <span class="scanline"></span>
              <div class="photo-vignette" id="photo-vignette" style="display:none;"></div>
              <div class="photo-caption" id="photo-caption" style="display:none;"></div>
              <div id="desk-mount" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
              <div id="real-photo-mount" style="display:none;width:100%;height:100%;padding:16px;box-sizing:border-box;"></div>
            </div>
            <div class="gallery-strip" id="gallery-strip" style="display:none;"></div>
            <p class="text-secondary rise-in" id="mode-desc" style="max-width:640px;"></p>
          </div>`;
        const mountEl = body.querySelector("#desk-mount");
        DeskViz.mount(mountEl, {
          mode: "focus",
          exploded: false,
          variant: "standard",
        });
        attachComponentPopovers(mountEl);

        const realPhotoMount = body.querySelector("#real-photo-mount");
        function renderRealPhoto(vId) {
          realPhotoMount.innerHTML = RealImage.panel({
            src: `assets/images/product-${vId}.jpg`,
            alt: `DIPTO FlexDesk — ${variants[vId].label} — real photo`,
            aspect: "fill",
            caption: `DIPTO FLEXDESK — ${variants[vId].label.toUpperCase()} (REAL PHOTO)`,
            fallbackHtml: `<div style="text-align:center;color:var(--text-faint);">
                <div style="margin-bottom:8px;display:flex;justify-content:center;">${Icons.icon("image", { size: 28 })}</div>
                <div style="font-size:0.85rem;">No real photo added yet for this variant</div>
              </div>`,
          });
        }

        // ---------- Photo View gallery: preset camera angles, like product shots ----------
        const shots = [
          { id: "front", label: "Front", angle: 0 },
          { id: "angle", label: "3/4 Angle", angle: -28 },
          { id: "side", label: "Side", angle: -75 },
          { id: "reverse", label: "Reverse Angle", angle: 152 },
        ];
        const galleryStrip = body.querySelector("#gallery-strip");
        galleryStrip.innerHTML = shots
          .map(
            (s, i) =>
              `<button class="gallery-thumb${i === 0 ? " active" : ""}" data-angle="${s.angle}" type="button">${s.label}</button>`,
          )
          .join("");
        galleryStrip.querySelectorAll(".gallery-thumb").forEach((btn) => {
          btn.addEventListener("click", () => {
            galleryStrip
              .querySelectorAll(".gallery-thumb")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            DeskViz.setViewAngle(mountEl, parseFloat(btn.dataset.angle));
            rotateBtn.classList.remove("active");
            rotateBtn.textContent = "Rotate View";
            rotating = false;
          });
        });

        // ---------- Technical / Photo / Real Photo view toggle ----------
        const stageFrame = body.querySelector("#stage-frame");
        const photoVignette = body.querySelector("#photo-vignette");
        const photoCaption = body.querySelector("#photo-caption");
        const viewToggle = body.querySelector("#view-toggle");
        viewToggle.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            viewToggle
              .querySelectorAll("button")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const view = btn.dataset.view;
            const photo = view === "photo";
            const real = view === "real";
            stageFrame.classList.toggle("blueprint-grid", view === "technical");
            stageFrame.classList.toggle("hud-frame", view === "technical");
            stageFrame.classList.toggle("scanline-wrap", view === "technical");
            stageFrame.classList.toggle("photo-stage", photo);
            stageFrame
              .querySelectorAll(".hud-corner, .scanline")
              .forEach((elx) => {
                elx.style.display = view === "technical" ? "" : "none";
              });
            photoVignette.style.display = photo ? "" : "none";
            photoCaption.style.display = photo ? "" : "none";
            galleryStrip.style.display = photo ? "flex" : "none";
            mountEl.style.display = real ? "none" : "flex";
            realPhotoMount.style.display = real ? "block" : "none";
            DeskViz.setPhotoMode(mountEl, photo);
            const vId = variantRow.querySelector(".active")
              ? variantRow.querySelector(".active").dataset.variant
              : "standard";
            photoCaption.textContent = `DIPTO FLEXDESK — ${variants[vId].label.toUpperCase()}`;
            if (real) renderRealPhoto(vId);
          });
        });

        const modeRow = body.querySelector("#mode-row");
        const modes =
          PROD.modes && PROD.modes.length
            ? PROD.modes
            : [
                { id: "focus", label: "FOCUS", detail: "" },
                { id: "connect", label: "CONNECT", detail: "" },
                { id: "present", label: "PRESENT", detail: "" },
                { id: "compact", label: "COMPACT", detail: "" },
              ];
        modeRow.innerHTML = modes
          .map(
            (m, i) =>
              `<button class="btn-ghost${i === 0 ? " active" : ""}" data-mode="${m.id}">${m.label}</button>`,
          )
          .join("");
        const descEl = body.querySelector("#mode-desc");
        descEl.textContent = (modes[0] && modes[0].detail) || "";

        function setModeActive(modeId) {
          modeRow
            .querySelectorAll("button")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === modeId),
            );
          const m = modes.find((mm) => mm.id === modeId);
          descEl.textContent =
            (m && (m.purpose ? m.purpose + " — " : "") + m.detail) || "";
          FX.playRiseIn(descEl);
        }

        // ---------- auto-cycle: continuously step through modes ----------
        const autoChip = body.querySelector("#auto-chip");
        const autoChipLabel = body.querySelector("#auto-chip-label");
        let cycleIdx = 0;
        let autoTimer = null;
        let autoOn = true;

        function stopAuto() {
          if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
          }
        }
        function startAuto() {
          stopAuto();
          autoTimer = setInterval(() => {
            cycleIdx = (cycleIdx + 1) % modes.length;
            const m = modes[cycleIdx];
            DeskViz.setMode(mountEl, m.id);
            setModeActive(m.id);
          }, 3200);
        }
        function setAuto(on) {
          autoOn = on;
          autoChip.classList.toggle("on", on);
          autoChip.setAttribute("aria-pressed", String(on));
          autoChipLabel.textContent = on ? "AUTO-CYCLE" : "AUTO-CYCLE PAUSED";
          if (on) startAuto();
          else stopAuto();
        }
        autoChip.addEventListener("click", () => setAuto(!autoOn));
        startAuto();
        registerCleanup(stopAuto);

        modeRow.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            setAuto(false); // manual selection takes over; chip shows how to resume
            cycleIdx = modes.findIndex((m) => m.id === btn.dataset.mode);
            DeskViz.setMode(mountEl, btn.dataset.mode);
            setModeActive(btn.dataset.mode);
          });
        });

        // Variant selector — mirrors the resource pack's B2B/B2C customer segments.
        const variantRow = body.querySelector("#variant-row");
        variantRow.innerHTML = variantIds
          .map(
            (id, i) =>
              `<button class="btn-ghost${id === "standard" ? " active" : ""}" data-variant="${id}" title="${variants[id].customer}">${variants[id].label}</button>`,
          )
          .join("");
        variantRow.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            variantRow
              .querySelectorAll("button")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const vId = btn.dataset.variant;
            DeskViz.setVariant(mountEl, vId);
            setAuto(false);
            cycleIdx = modes.findIndex(
              (m) => m.id === variants[vId].defaultMode,
            );
            setModeActive(variants[vId].defaultMode);
            descEl.textContent = `${variants[vId].label} — sized and configured for ${variants[vId].customer}.`;
            FX.playRiseIn(descEl);
            // Re-attach popovers since setVariant may reveal the second unit's parts for the first time.
            attachComponentPopovers(mountEl);
            if (viewToggle.querySelector(".active").dataset.view === "real")
              renderRealPhoto(vId);
          });
        });

        const rotateBtn = body.querySelector("#rotate-toggle");
        let rotating = false;
        rotateBtn.addEventListener("click", () => {
          rotating = !rotating;
          DeskViz.setRotating(mountEl, rotating);
          rotateBtn.classList.toggle("active", rotating);
          rotateBtn.textContent = rotating ? "Stop Rotation" : "Rotate View";
        });
      },
    },

 // 03 ANATOMY -------------------------------------------------------
{
  name: "ANATOMY",
  kpis: () => defaultKPIs(),
  left: () =>
    leftPanel(
      "Product Anatomy",
      [
        "Explode the model to inspect each component: material, purpose, manufacturing process and quality checkpoint.",
        "Hover a component for a quick preview, or click it to pin the details open.",
      ],
      null,
      null,
    ),

  render(body) {
    const components = PROD.components || [];

    const bomIcons = {
      top: "board",
      frameL: "steel",
      frameR: "steel",
      frontSupport: "steel",
      rearSupport: "steel",
      mechanism: "hardware",
      feet: "rubber",
      connector: "hardware",
      bookHolder: "layers",
      device: "hardware",
      storage: "box",
      cableChannel: "route",
      hinges: "hardware",
      lockingPins: "hardware",
      fasteners: "hardware",
      rubberFeet: "rubber",
      laminate: "laminate",
      edgeBanding: "edge",
    };

    const sorted = components
      .slice()
      .sort((a, b) => (a.bom || 0) - (b.bom || 0));

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px;">

        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div class="mode-row">
            <button
              class="btn-ghost active"
              id="explode-toggle"
              type="button"
            >
              Explode Product
            </button>

            <button
              class="btn-ghost"
              id="reassemble-btn"
              type="button"
            >
              Reassemble
            </button>
          </div>

          <button
            class="auto-chip on"
            id="auto-chip-2"
            type="button"
            aria-pressed="true"
          >
            <span class="status-dot"></span>
            <span id="auto-chip-2-label">AUTO-CYCLE</span>
          </button>
        </div>


        <!-- 3D EXPLODED MODEL -->
        <div
          class="hud-frame scanline-wrap blueprint-grid"
          style="
            flex:0 0 auto;
            height:min(52vh,420px);
            display:flex;
            align-items:center;
            justify-content:center;
            border:1px solid var(--border);
            border-radius:6px;
            position:relative;
          "
        >
          <span class="hud-corner tl"></span>
          <span class="hud-corner tr"></span>
          <span class="hud-corner bl"></span>
          <span class="hud-corner br"></span>
          <span class="scanline"></span>

          <div
            id="desk-mount-2"
            style="
              width:100%;
              height:100%;
              display:flex;
              align-items:center;
              justify-content:center;
            "
          ></div>
        </div>


        <p
          class="text-faint"
          style="font-size:0.8rem;"
        >
          Hover a highlighted component to preview it, or click it to pin the details open.
        </p>


        <!-- =========================================================
             TWO ANATOMY IMAGES
             ========================================================= -->

        <div class="anatomy-photo-section">

          <div
            class="eyebrow anatomy-photo-title"
            style="margin-bottom:8px;"
          >
            REAL PHOTOS — DISASSEMBLED / EXPLODED VIEW
          </div>


          <div class="anatomy-images-grid">

            <!-- IMAGE 1 -->
            <figure class="anatomy-image-card">

              <div class="anatomy-image-wrap">
                <img
                  src="assets/images/anatomy-exploded.jpg"
                  alt="DIPTO FlexDesk exploded assembly view"
                  loading="eager"
                >
              </div>

              <figcaption>
                EXPLODED ASSEMBLY VIEW
              </figcaption>

            </figure>


            <!-- IMAGE 2 -->
            <figure class="anatomy-image-card">

              <div class="anatomy-image-wrap">
                <img
                  src="assets/images/disassembled-view.jpg"
                  alt="DIPTO FlexDesk disassembled component view"
                  loading="eager"
                >
              </div>

              <figcaption>
                DISASSEMBLED COMPONENT VIEW
              </figcaption>

            </figure>

          </div>

        </div>


        <!-- COMPLETE BILL OF MATERIALS -->
        <div style="margin-top:6px;">

          <div
            class="eyebrow"
            style="margin-bottom:6px;"
          >
            COMPLETE BILL OF MATERIALS - ${sorted.length} COMPONENTS
          </div>

          <p
            class="text-faint"
            style="
              font-size:0.78rem;
              max-width:720px;
              margin-bottom:14px;
            "
          >
            ${PROD.bomNote || ""}
          </p>


          <div class="grid-row" id="bom-grid">

            ${sorted
              .map(
                (c) => `
                  <div
                    class="card bom-card${c.visual ? " on-model" : ""}"
                    data-bom-id="${c.id}"
                    style="
                      width:210px;
                      ${c.visual ? "cursor:pointer;" : ""}
                    "
                    ${
                      c.visual
                        ? 'tabindex="0" role="button"'
                        : ""
                    }
                  >

                    <div class="card-icon-row">

                      <div class="icon-chip${c.visual ? "" : " navy"}">
                        ${Icons.icon(
                          bomIcons[c.id] || "target",
                          { size: 17 },
                        )}
                      </div>

                      <div style="flex:1;min-width:0;">

                        <div
                          class="card-sub mono"
                          style="font-size:0.62rem;"
                        >
                          BOM-${String(c.bom).padStart(2, "0")}
                          ${c.visual ? " · ON MODEL" : ""}
                        </div>

                        <div class="card-title">
                          ${c.name}
                        </div>

                        <div
                          class="card-sub"
                          style="margin-top:3px;"
                        >
                          ${c.material}
                        </div>

                      </div>

                    </div>

                  </div>
                `,
              )
              .join("")}

          </div>

        </div>

      </div>
    `;


    /* =========================================================
       MOUNT 3D MODEL
       ========================================================= */

    const mountEl = body.querySelector("#desk-mount-2");

    DeskViz.mount(mountEl, {
      mode: "focus",
      exploded: true,
      variant: "standard",
    });

    attachComponentPopovers(mountEl);


    /* =========================================================
       BOM CARD POPOVERS
       ========================================================= */

    body
      .querySelectorAll(".bom-card.on-model")
      .forEach((cardEl) => {
        Popover.attach(
          [cardEl],
          () => componentDetailHtml(cardEl.dataset.bomId),
        );
      });


    /* =========================================================
       EXPLODE / REASSEMBLE CONTROLS
       ========================================================= */

    const toggleBtn = body.querySelector("#explode-toggle");

    let exploded = true;

    function setExploded(val) {
      exploded = val;

      DeskViz.setExploded(
        mountEl,
        exploded,
      );

      toggleBtn.textContent = exploded
        ? "Collapse Product"
        : "Explode Product";
    }


    /* =========================================================
       AUTO-CYCLE
       ========================================================= */

    const autoChip = body.querySelector("#auto-chip-2");

    const autoChipLabel =
      body.querySelector("#auto-chip-2-label");

    let autoTimer = null;

    let autoOn = true;


    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }


    function startAuto() {
      stopAuto();

      autoTimer = setInterval(() => {
        setExploded(!exploded);
      }, 3400);
    }


    function setAuto(on) {
      autoOn = on;

      autoChip.classList.toggle(
        "on",
        on,
      );

      autoChip.setAttribute(
        "aria-pressed",
        String(on),
      );

      autoChipLabel.textContent = on
        ? "AUTO-CYCLE"
        : "AUTO-CYCLE PAUSED";

      if (on) {
        startAuto();
      } else {
        stopAuto();
      }
    }


    autoChip.addEventListener(
      "click",
      () => setAuto(!autoOn),
    );


    startAuto();

    registerCleanup(stopAuto);


    /* =========================================================
       BUTTON EVENTS
       ========================================================= */

    toggleBtn.addEventListener(
      "click",
      () => {
        setAuto(false);
        setExploded(!exploded);
      },
    );


    body
      .querySelector("#reassemble-btn")
      .addEventListener(
        "click",
        () => {
          setAuto(false);
          setExploded(false);
        },
      );
  },
},

    // 04 MATERIALS -------------------------------------------------------
    {
      name: "MATERIALS",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Material System",
          [
            "A plausible furniture material system for a Bangladesh manufacturing context.",
            "No specific supplier names or exclusive sourcing relationships are claimed.",
          ],
          null,
          null,
        ),
      render(body) {
        const materials = [
          {
            name: "Particle Board / Engineered Board",
            icon: "board",
            swatch: "board",
            props: [
              "Consistent thickness, flat surface for lamination",
              "Moisture-resistant core grade specified for tabletop use",
              "Cuts and drills cleanly on standard panel saws",
            ],
            usedIn: "Main tabletop, storage tray",
          },
          {
            name: "Plywood (where appropriate)",
            icon: "layers",
            swatch: "layers",
            props: [
              "Cross-layered plies resist warping better than solid board",
              "Higher screw-holding strength at fixing points",
              "Used selectively where load paths need extra stiffness",
            ],
            usedIn: "Reinforcement at frame-mounting points",
          },
          {
            name: "Mild Steel",
            icon: "steel",
            swatch: "steel",
            props: [
              "Tube/box-section stock for the support frames",
              "Welds and bends reliably with standard fabrication tools",
              "Powder-coat or paint finish for corrosion resistance",
            ],
            usedIn: "Left/right/front/rear support frames",
          },
          {
            name: "Laminate",
            icon: "laminate",
            swatch: "laminate",
            props: [
              "Wear- and scratch-resistant work surface",
              "Wipe-clean finish suited to daily classroom use",
              "Bonded to the board substrate under heat and pressure",
            ],
            usedIn: "Tabletop surface finish",
          },
          {
            name: "PVC / ABS Edge Band",
            icon: "edge",
            swatch: "edge",
            props: [
              "Seals exposed board edges against moisture",
              "Impact-resistant edge protection for daily handling",
              "Color-matched to the tabletop laminate",
            ],
            usedIn: "All exposed panel edges",
          },
          {
            name: "Steel Hardware",
            icon: "hardware",
            swatch: "hardware",
            props: [
              "Fasteners, hinges and locking pins across sub-assemblies",
              "Zinc-plated for basic corrosion resistance",
              "Standardized sizes to simplify repair and restocking",
            ],
            usedIn: "Mechanism, connector, fasteners",
          },
          {
            name: "Rubber Feet",
            icon: "rubber",
            swatch: "rubber",
            props: [
              "Floor grip and vibration/noise dampening",
              "Protects flooring from scratches during compact-mode moves",
              "Replaceable wear part",
            ],
            usedIn: "Base / floor contact points",
          },
          {
            name: "Finishing Materials",
            icon: "finish",
            swatch: "finish",
            props: [
              "Protective coating on exposed metal frame surfaces",
              "Consistent color match across the product line",
              "Applied during the surface finishing production stage",
            ],
            usedIn: "Metal frame surface treatment",
          },
        ];
        body.innerHTML = `
          <div class="rise-in" style="display:flex;flex-direction:column;gap:22px;">
            <div class="flow-row">
              <div class="flow-node accent">Raw Material</div><span class="flow-arrow">&#8594;</span>
              <div class="flow-node accent">Component</div><span class="flow-arrow">&#8594;</span>
              <div class="flow-node accent">Product</div>
            </div>
            <div class="grid-row">
              ${materials
                .map(
                  (m) => `
                <div class="card material-card">
                  ${RealImage.panel({
                    src: `assets/images/material-${m.swatch}.jpg`,
                    alt: m.name + " material sample",
                    aspect: "wide",
                    fallbackHtml: Swatches.svg(m.swatch),
                  })}
                  <div class="material-card-body">
                    <div class="card-icon-row">
                      <div class="icon-chip">${Icons.icon(m.icon, { size: 17 })}</div>
                      <div class="card-title" style="padding-top:4px;">${m.name}</div>
                    </div>
                    <ul class="material-props">
                      ${m.props.map((p) => `<li>${p}</li>`).join("")}
                    </ul>
                    <div class="material-used-in">USED IN — ${m.usedIn}</div>
                  </div>
                </div>`,
                )
                .join("")}
            </div>
          </div>`;
      },
    },

    // 05 PRODUCTION -------------------------------------------------------
    {
      name: "PRODUCTION",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Production Flow",
          [
            "Twelve stages carry raw material through to a packed, dispatch-ready unit.",
            PRODN.assumptionLabel || "",
            "Use ← / → (or [ / ]) to step through stages while this section is open.",
          ],
          null,
          "Illustrative Academic Assumption",
        ),
      render(body) {
        const stages = PRODN.stages || [];
        const stageIcons = {
          1: "warehouse",
          2: "qc",
          3: "cut",
          4: "drill",
          5: "edge",
          6: "weld",
          7: "finish",
          8: "assembly",
          9: "assembly",
          10: "qc",
          11: "shield",
          12: "box",
        };
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;min-height:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
              <div class="flow-row" id="stage-strip" style="overflow-x:auto;flex-wrap:nowrap;padding-bottom:6px;flex:1;"></div>
              <div class="kbd-shortcut-hint"><kbd>[</kbd><kbd>]</kbd> switch stage</div>
            </div>
            <div id="stage-detail"></div>
          </div>`;
        const strip = body.querySelector("#stage-strip");
        strip.innerHTML = stages
          .map(
            (s, i) =>
              `<div class="flow-node${i === 0 ? " accent" : ""}" data-idx="${i}" style="cursor:pointer;display:flex;align-items:center;gap:7px;">
             <span style="display:inline-flex;color:var(--green);">${Icons.icon(stageIcons[s.id] || "target", { size: 14 })}</span>
             ${String(s.id).padStart(2, "0")} ${s.name}
           </div>` +
              (i < stages.length - 1
                ? '<span class="flow-arrow">&#8594;</span>'
                : ""),
          )
          .join("");

        const detail = body.querySelector("#stage-detail");
        let current = 0;
        function showStage(i) {
          if (i < 0 || i >= stages.length) return;
          current = i;
          const s = stages[i];
          strip
            .querySelectorAll(".flow-node")
            .forEach((n, idx) => n.classList.toggle("accent", idx === i));
          strip
            .querySelectorAll(".flow-node")
            [
              i
            ].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
          const cat = stageIcons[s.id] || "target";
          detail.innerHTML = `
            <div class="rise-in" style="display:flex;gap:18px;flex-wrap:wrap;">
              <div class="stage-art-panel">
                ${RealImage.panel({
                  src: `assets/images/production-${String(s.id).padStart(2, "0")}.jpg`,
                  alt: s.name + " — real photo",
                  aspect: "square",
                  fallbackHtml: StageArt.svg(cat),
                })}
              </div>
              <div style="flex:1;min-width:280px;">
                <div class="card-icon-row" style="margin-bottom:10px;">
                  <div class="icon-chip">${Icons.icon(cat, { size: 19 })}</div>
                  <div class="card-title" style="font-size:1.1rem;padding-top:6px;">${String(s.id).padStart(2, "0")} — ${s.name}</div>
                </div>
                <div class="process-diagram" style="margin-bottom:14px;background:var(--bg-panel-raised);border:1px solid var(--border);border-radius:6px;">
                  <div class="process-step">
                    <div class="icon-chip navy">${Icons.icon("box", { size: 16 })}</div>
                    <div class="process-step-label">INPUT</div>
                    <div class="process-step-value">${s.input}</div>
                  </div>
                  <div class="process-arrow-h">&#8594;</div>
                  <div class="process-step">
                    <div class="icon-chip">${Icons.icon(cat, { size: 16 })}</div>
                    <div class="process-step-label">PROCESS</div>
                    <div class="process-step-value">${s.process}</div>
                  </div>
                  <div class="process-arrow-h">&#8594;</div>
                  <div class="process-step">
                    <div class="icon-chip navy">${Icons.icon("shield", { size: 16 })}</div>
                    <div class="process-step-label">OUTPUT</div>
                    <div class="process-step-value">${s.output}</div>
                  </div>
                </div>
                <div class="data-list">
                  <div class="data-row"><span class="k">Worker</span><span class="v mono" style="font-weight:400;">${s.worker}</span></div>
                  <div class="data-row"><span class="k">Equipment</span><span class="v mono" style="font-weight:400;">${s.equipment}</span></div>
                  <div class="data-row"><span class="k">Quality Check</span><span class="v mono" style="font-weight:400;">${s.quality}</span></div>
                  <div class="data-row"><span class="k">Est. Time</span><span class="v">${s.minutes} min</span></div>
                </div>
              </div>
            </div>`;
        }
        strip
          .querySelectorAll(".flow-node")
          .forEach((n) =>
            n.addEventListener("click", () =>
              showStage(parseInt(n.dataset.idx, 10)),
            ),
          );
        showStage(0);

        // ---------- keyboard shortcut: [ / ] steps through stages ----------
        // Deliberately NOT arrow keys — those are already bound globally to
        // section navigation, so reusing them here would fight the section
        // nav whenever this part of the page has focus.
        function onKey(e) {
          const tag = (e.target && e.target.tagName) || "";
          if (tag === "INPUT" || tag === "TEXTAREA") return;
          if (e.key === "]") {
            e.preventDefault();
            showStage(Math.min(current + 1, stages.length - 1));
          } else if (e.key === "[") {
            e.preventDefault();
            showStage(Math.max(current - 1, 0));
          }
        }
        document.addEventListener("keydown", onKey);
        registerCleanup(() => document.removeEventListener("keydown", onKey));
      },
    },

    // 06 FACTORY -------------------------------------------------------
    {
      name: "FACTORY",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Factory Layout",
          [
            "A top-down view of the proposed factory floor. Select a zone to see its role in the flow.",
          ],
          null,
          null,
        ),
      render(body) {
        const zones = PRODN.factoryZones || [];
        const zoneIcons = {
          store: "warehouse",
          cutting: "cut",
          cnc: "drill",
          metal: "weld",
          finishing: "finish",
          subassembly: "assembly",
          finalassembly: "assembly",
          qc: "qc",
          packaging: "box",
          fgstore: "warehouse",
          dispatch: "truck",
        };
        const w = 700,
          h = 260;
        const zoneRects = zones
          .map(
            (z) => `
          <g class="desk-part factory-zone" data-zone="${z.id}" tabindex="0" role="button" aria-label="${z.name}">
            <rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="5" fill="var(--bg-panel-raised)" stroke="var(--border-strong)" stroke-width="1.5"/>
            <g transform="translate(${z.x + z.w / 2 - 8}, ${z.y + 6})" style="color:var(--green);">${Icons.icon(zoneIcons[z.id] || "target", { size: 16 })}</g>
            <text x="${z.x + z.w / 2}" y="${z.y + z.h - 10}" fill="var(--text-secondary)" font-size="10.5" text-anchor="middle" font-family="Consolas, monospace">${z.name}</text>
          </g>`,
          )
          .join("");
        const arrowPairs = [
          ["store", "cutting"],
          ["cutting", "cnc"],
          ["cnc", "metal"],
          ["metal", "finishing"],
          ["finishing", "subassembly"],
          ["subassembly", "finalassembly"],
          ["finalassembly", "qc"],
          ["qc", "packaging"],
          ["packaging", "fgstore"],
          ["fgstore", "dispatch"],
        ];
        function center(id) {
          const z = zones.find((zz) => zz.id === id);
          return z ? [z.x + z.w / 2, z.y + z.h / 2] : [0, 0];
        }
        const arrows = arrowPairs
          .map(([a, b]) => {
            const [x1, y1] = center(a),
              [x2, y2] = center(b);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1EBE61" stroke-width="1.5" opacity="0.4" class="flow-anim" marker-end="url(#arrow)"/>`;
          })
          .join("");

        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;min-height:0;">
            <div class="hud-frame blueprint-grid" style="border:1px solid var(--border);border-radius:6px;padding:6px;position:relative;">
              <span class="hud-corner tl"></span><span class="hud-corner tr"></span>
              <span class="hud-corner bl"></span><span class="hud-corner br"></span>
              <div style="overflow-x:auto;">
                <svg viewBox="0 0 ${w} ${h}" style="width:100%;min-width:560px;display:block;" role="img" aria-label="Factory floor layout">
                  <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1EBE61"/></marker></defs>
                  ${arrows}
                  ${zoneRects}
                </svg>
              </div>
              <div class="opening-blueprint-caption" style="padding:2px 6px 4px 6px;">FIG. 02 — FACTORY FLOOR PLAN, TOP VIEW</div>
            </div>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:0.74rem;color:var(--text-faint);">
              <span style="display:flex;align-items:center;gap:6px;"><span style="width:16px;height:0;border-top:2px dashed #1EBE61;display:inline-block;"></span>Material flow</span>
              <span style="display:flex;align-items:center;gap:6px;"><span class="icon-chip" style="width:20px;height:20px;">${Icons.icon("qc", { size: 12 })}</span>Quality checkpoint zones</span>
            </div>
            <div id="zone-detail" class="card text-faint" style="font-size:0.85rem;">Select a zone to see workers, equipment, output and quality checkpoint.</div>

            <div>

              <div class="eyebrow" style="margin-bottom:6px;">REAL PHOTO — FACTORY FLOOR</div>
              ${RealImage.panel({
                src: "assets/images/factory-layout.jpg",
                alt: "DIPTO FlexDesk proposed factory floor — real photo",
                aspect: "wide",
                fallbackHtml: `<div style="text-align:center;color:var(--text-faint);">
                    <div style="margin-bottom:8px;display:flex;justify-content:center;">${Icons.icon("image", { size: 26 })}</div>
                    <div style="font-size:0.85rem;">A real factory-floor photo would go here</div>
                  </div>`,
              })}
            </div>
            
          </div>`;

        const svgEl = body.querySelector("svg");
        svgEl.querySelectorAll("[data-zone]").forEach((g) => {
          const activate = () => {
            const z = zones.find((zz) => zz.id === g.dataset.zone);
            svgEl
              .querySelectorAll(".factory-zone rect")
              .forEach((r) => r.setAttribute("stroke", "var(--border-strong)"));
            g.querySelector("rect").setAttribute("stroke", "#1EBE61");
            body.querySelector("#zone-detail").innerHTML = `
              <div class="card-icon-row">
                <div class="icon-chip">${Icons.icon(zoneIcons[z.id] || "target", { size: 17 })}</div>
                <div>
                  <strong style="color:var(--text-primary);">${z.name}</strong><br>
                  <span class="text-secondary" style="font-size:0.82rem;">
                    Workers: <span class="mono">${z.workers}</span> ·
                    Equipment: <span class="mono">${z.equipment}</span> ·
                    Output: <span class="mono">${z.output}</span> ·
                    Quality: <span class="mono">${z.quality}</span>
                  </span>
                </div>
              </div>`;
          };
          g.addEventListener("click", activate);
          g.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activate();
            }
          });
        });
      },
    },

    // 07 CAPACITY -------------------------------------------------------
    {
      name: "CAPACITY",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Capacity Planning",
          [
            CAP.note || "",
            "These figures are illustrative academic assumptions for planning discussion, not verified operating results.",
          ],
          null,
          "Illustrative Academic Assumption",
        ),
      render(body) {
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:26px;height:100%;justify-content:center;">
            <div class="grid-row">
              <div class="card"><div class="card-sub">Monthly Target</div><div class="h-display" id="cap-month" style="font-size:1.8rem;">0</div></div>
              <div class="card"><div class="card-sub">Daily Target</div><div class="h-display" id="cap-day" style="font-size:1.8rem;">0</div></div>
              <div class="card"><div class="card-sub">Hourly Target</div><div class="h-display" id="cap-hour" style="font-size:1.8rem;">0</div></div>
              <div class="card"><div class="card-sub">Takt Time</div><div class="h-display" id="cap-takt" style="font-size:1.8rem;">0</div></div>
            </div>
            <div class="data-list" style="max-width:600px;">
              <div class="data-row"><span class="k">Working Days / Month</span><span class="v">${CAP.workingDays || "—"}</span></div>
              <div class="data-row"><span class="k">Working Hours / Day</span><span class="v">${CAP.workingHours || "—"}</span></div>
              <div class="data-row"><span class="k">Available Minutes / Day</span><span class="v">${CAP.availableMinutesPerDay || "—"} min</span></div>
              <div class="data-row"><span class="k">Bottleneck Stage</span><span class="v">${CAP.bottleneckStage || "—"} (${CAP.bottleneckMinutes || "—"} min)</span></div>
            </div>
            <p class="text-secondary" style="max-width:600px;font-size:0.9rem;line-height:1.6;">
              <strong style="color:var(--text-primary);">Takt time</strong> is the pace demand requires — available time
              divided by the daily target. <strong style="color:var(--text-primary);">Cycle time</strong> is how long a
              stage actually takes. The slowest stage (the bottleneck) paces the whole line; balancing work across
              stations closer to takt time raises overall productivity.
            </p>
          </div>`;
        FX.countTo(
          body.querySelector("#cap-month"),
          0,
          CAP.monthlyTarget || 0,
          900,
          (n) => Math.round(n).toLocaleString("en-US") + " units",
        );
        FX.countTo(
          body.querySelector("#cap-day"),
          0,
          CAP.dailyTarget || 0,
          900,
          (n) => Math.round(n) + " units/day",
        );
        FX.countTo(
          body.querySelector("#cap-hour"),
          0,
          CAP.hourlyTarget || 0,
          900,
          (n) => Math.round(n) + " units/hr",
        );
        FX.countTo(
          body.querySelector("#cap-takt"),
          0,
          CAP.targetTaktMinutes || 0,
          900,
          (n) => Math.round(n) + " min/unit",
        );
      },
    },

    // 08 WORKFORCE -------------------------------------------------------
    {
      name: "WORKFORCE",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Workforce Plan",
          [
            WORK.assumptionLabel || "",
            `${WORK.total || 0} workers across ${(WORK.roles || []).length} roles. Select a role to see responsibilities, skills and safety considerations.`,
          ],
          null,
          "Illustrative Workforce Planning Assumption",
        ),
      render(body) {
        const roles = WORK.roles || [];
        const roleIcons = {
          manager: "target",
          cutting: "cut",
          metal: "weld",
          assembly: "assembly",
          finishing: "finish",
          qc: "qc",
          store: "warehouse",
          packaging: "box",
          maintenance: "hardware",
        };
        body.innerHTML = `
          <div class="grid-row" style="align-content:flex-start;overflow-y:auto;height:100%;">
            ${roles
              .map(
                (r) => `
              <div class="card" data-role="${r.id}" style="width:210px;cursor:pointer;" tabindex="0" role="button">
                <div class="card-icon-row">
                  <div class="icon-chip navy">${Icons.icon(roleIcons[r.id] || "person", { size: 18 })}</div>
                  <div>
                    <div class="card-title">${r.title}</div>
                    <div class="card-sub">${r.dept} · ${r.count} ${r.count > 1 ? "people" : "person"}</div>
                  </div>
                </div>
              </div>`,
              )
              .join("")}
          </div>`;
        body.querySelectorAll("[data-role]").forEach((cardEl) => {
          const r = roles.find((rr) => rr.id === cardEl.dataset.role);
          Popover.attach(
            [cardEl],
            () => `
            <div class="popover-title">${r.title}</div>
            <div class="popover-sub">${r.dept} · ${r.count} ${r.count > 1 ? "people" : "person"}</div>
            ${fieldRow("Responsibility", r.responsibility)}
            ${fieldRow("Skills", r.skills)}
            ${fieldRow("Training", r.training)}
            ${fieldRow("Workstation", r.workstation)}
            ${fieldRow("Productivity Contribution", r.productivity)}
            ${fieldRow("Safety Consideration", r.safety)}
          `,
          );
        });
      },
    },

    // 09 QUALITY -------------------------------------------------------
    {
      name: "QUALITY",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Quality Management",
          [
            "Three sequential quality gates catch issues before they reach the customer.",
          ],
          null,
          QUAL.scenario ? QUAL.scenario.label : null,
        ),
      render(body) {
        const gates = QUAL.gates || [];
        const gateIcons = { iqc: "warehouse", ipqc: "assembly", fqc: "shield" };
        const sc = QUAL.scenario || {
          inspected: 0,
          passed: 0,
          rework: 0,
          fpy: 0,
        };
        const r = 54,
          circumference = 2 * Math.PI * r;
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:26px;height:100%;justify-content:center;">
            <div class="flow-row">
              ${gates.map((g, i) => `<div class="flow-node accent" title="${g.full}">${g.name}</div>` + (i < gates.length - 1 ? '<span class="flow-arrow">&#8594;</span>' : "")).join("")}
            </div>
            <div class="grid-row">
              ${gates
                .map(
                  (g) => `
                <div class="card" style="width:250px;">
                  <div class="card-icon-row">
                    <div class="icon-chip">${Icons.icon(gateIcons[g.id] || "qc", { size: 18 })}</div>
                    <div>
                      <div class="card-title">${g.name} — ${g.full}</div>
                      <div class="card-sub" style="margin-top:6px;">${(g.checks || []).join(" · ")}</div>
                    </div>
                  </div>
                </div>`,
                )
                .join("")}
            </div>
            <div class="card" style="max-width:520px;display:flex;align-items:center;gap:22px;">
              <div class="gauge-wrap">
                <svg viewBox="0 0 120 120">
                  <circle class="gauge-track" cx="60" cy="60" r="${r}"/>
                  <circle class="gauge-fill" id="fpy-gauge" cx="60" cy="60" r="${r}"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/>
                </svg>
                <div class="gauge-value" id="fpy-value">0%</div>
              </div>
              <div>
                <div class="eyebrow">${sc.label || "ILLUSTRATIVE SCENARIO"}</div>
                <div class="text-primary" style="font-weight:700;margin-top:4px;">First Pass Yield</div>
                <div class="text-secondary" style="font-size:0.85rem;margin-top:6px;">${sc.inspected} units inspected · ${sc.passed} passed · ${sc.rework} required rework</div>
              </div>
            </div>
          </div>`;
        const fpy = sc.fpy || 0;
        const gaugeEl = body.querySelector("#fpy-gauge");
        requestAnimationFrame(() => {
          gaugeEl.style.strokeDashoffset = String(
            circumference * (1 - fpy / 100),
          );
        });
        FX.countTo(
          body.querySelector("#fpy-value"),
          0,
          fpy,
          1100,
          (n) => Math.round(n) + "%",
        );
      },
    },

    // 10 INVENTORY -------------------------------------------------------
    {
      name: "INVENTORY",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Inventory Model",
          [
            "Material flows through three inventory states before reaching the customer.",
          ],
          null,
          null,
        ),
      render(body) {
        const inv = QUAL.inventory || {
          stages: [],
          materials: [],
          concepts: [],
        };
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:26px;height:100%;justify-content:center;">
            <div class="flow-row">
              ${(inv.stages || []).map((s, i, arr) => `<div class="flow-node accent">${s}</div>` + (i < arr.length - 1 ? '<span class="flow-arrow">&#8594;</span>' : "")).join("")}
            </div>
            <div>
              <div class="eyebrow" style="margin-bottom:8px;">RAW MATERIALS TRACKED</div>
              <div class="flow-row">${(inv.materials || []).map((m) => `<div class="flow-node">${m}</div>`).join("")}</div>
            </div>
            <div class="grid-row">
              ${(inv.concepts || []).map((c) => `<div class="card" style="width:230px;"><div class="card-title">${c.term}</div><div class="card-sub" style="margin-top:6px;">${c.text}</div></div>`).join("")}
            </div>
          </div>`;
      },
    },

    // 11 SUPPLY CHAIN -------------------------------------------------------
    {
      name: "SUPPLY CHAIN",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Supply Chain",
          [
            "From supplier to end institution, with quality control before goods reach the warehouse.",
          ],
          null,
          null,
        ),
      render(body) {
        const sc = QUAL.supplyChain || { flow: [], risks: [] };
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:22px;height:100%;justify-content:center;">
            <div class="flow-row">
              ${(sc.flow || []).map((s, i, arr) => `<div class="flow-node accent">${s}</div>` + (i < arr.length - 1 ? '<span class="flow-arrow">&#8594;</span>' : "")).join("")}
            </div>
            <div class="data-list" style="max-width:680px;">
              ${(sc.risks || []).map((r) => `<div class="data-row"><span class="k">${r.risk}</span><span class="v mono" style="font-weight:400;color:var(--text-secondary);">${r.mitigation}</span></div>`).join("")}
            </div>
          </div>`;
      },
    },

    // 12 FINANCE -------------------------------------------------------
    {
      name: "FINANCE",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Financial Model",
          [
            FIN.assumptionLabel || "",
            "All figures are stored centrally and referenced everywhere they appear.",
          ],
          null,
          "Illustrative Academic Assumption",
        ),
      render(body) {
        const vc = totalVariableCost();
        const contrib = contributionPerUnit();
        const costs = FIN.variableCosts || [];
        const palette = [
          "#1EBE61",
          "#3f8cff",
          "#E0A93A",
          "#9b7bff",
          "#ff6b8a",
          "#37c8c0",
          "#c2c9d6",
        ];
        let acc = 0;
        const stops = costs
          .map((c, i) => {
            const p0 = (acc / vc) * 100;
            acc += c.value;
            const p1 = (acc / vc) * 100;
            return `${palette[i % palette.length]} ${p0.toFixed(2)}% ${p1.toFixed(2)}%`;
          })
          .join(", ");
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:22px;height:100%;justify-content:center;">
            <div class="grid-row">
              <div class="card"><div class="card-sub">Selling Price</div><div class="h-display" id="f-sp" style="font-size:1.9rem;">—</div></div>
              <div class="card"><div class="card-sub">Total Variable Cost</div><div class="h-display" id="f-vc" style="font-size:1.9rem;">—</div></div>
              <div class="card"><div class="card-sub">Contribution / Unit</div><div class="h-display" id="f-cb" style="font-size:1.9rem;color:var(--green);">—</div></div>
              <div class="card"><div class="card-sub">Monthly Fixed Cost</div><div class="h-display" id="f-fc" style="font-size:1.9rem;">—</div></div>
            </div>
            <div style="display:flex;gap:28px;flex-wrap:wrap;align-items:center;">
              <div>
                <div class="eyebrow" style="margin-bottom:10px;">VARIABLE COST BREAKDOWN</div>
                <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
                  <div class="donut-wrap">
                    <div class="donut-ring" id="cost-donut" style="--donut-stops: ${stops};"></div>
                    <div class="donut-hole"><span class="v">${FX.fmtCurrency(vc, FIN.currency)}</span><span class="l">TOTAL / UNIT</span></div>
                  </div>
                  <div class="donut-legend">
                    ${costs
                      .map(
                        (c, i) => `
                      <div class="donut-legend-row">
                        <span class="donut-swatch" style="background:${palette[i % palette.length]};"></span>
                        <span class="text-secondary">${c.label}</span>
                        <span class="mono" style="margin-left:auto;padding-left:14px;">${FX.fmtCurrency(c.value, FIN.currency)}</span>
                      </div>`,
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        FX.countTo(body.querySelector("#f-sp"), 0, FIN.sellingPrice, 800, (n) =>
          FX.fmtCurrency(n, FIN.currency),
        );
        FX.countTo(body.querySelector("#f-vc"), 0, vc, 800, (n) =>
          FX.fmtCurrency(n, FIN.currency),
        );
        FX.countTo(body.querySelector("#f-cb"), 0, contrib, 800, (n) =>
          FX.fmtCurrency(n, FIN.currency),
        );
        FX.countTo(
          body.querySelector("#f-fc"),
          0,
          FIN.monthlyFixedCost,
          800,
          (n) => FX.fmtCurrency(n, FIN.currency),
        );
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            body.querySelector("#cost-donut").classList.add("in");
          }),
        );
      },
    },

    // 13 BREAK-EVEN -------------------------------------------------------
    {
      name: "BREAK-EVEN",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Break-Even Simulator",
          [
            "Drag the slider to see how monthly volume affects revenue, cost and profit.",
            "Break-even quantity = Fixed Cost ÷ Contribution per Unit.",
          ],
          null,
          "Illustrative Model",
        ),
      render(body) {
        const be = breakEvenUnits();
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:20px;height:100%;justify-content:center;">
            <svg id="be-chart" viewBox="0 0 640 260" style="width:100%;max-height:260px;" role="img" aria-label="Break-even chart"></svg>
            <div>
              <input type="range" id="be-slider" min="${FIN.sliderMin}" max="${FIN.sliderMax}" step="${FIN.sliderStep}" value="${FIN.sliderDefault}">
              <div style="display:flex;justify-content:space-between;margin-top:6px;" class="text-faint mono" style="font-size:0.75rem;">
                <span>${FIN.sliderMin} units</span><span id="be-units-label">${FIN.sliderDefault} units</span><span>${FIN.sliderMax} units</span>
              </div>
            </div>
            <div class="grid-row">
              <div class="card"><div class="card-sub">Revenue</div><div class="h-display" id="be-rev" style="font-size:1.5rem;">—</div></div>
              <div class="card"><div class="card-sub">Total Cost</div><div class="h-display" id="be-cost" style="font-size:1.5rem;">—</div></div>
              <div class="card"><div class="card-sub" id="be-pl-label">Profit / Loss</div><div class="h-display" id="be-pl" style="font-size:1.5rem;">—</div></div>
              <div class="card"><div class="card-sub">Break-Even Point</div><div class="h-display" style="font-size:1.5rem;color:var(--green);">${be} units</div></div>
            </div>
          </div>`;

        const chart = body.querySelector("#be-chart");
        const slider = body.querySelector("#be-slider");
        const unitsLabel = body.querySelector("#be-units-label");
        const maxUnits = FIN.sliderMax;
        const chartW = 640,
          chartH = 260,
          padL = 46,
          padB = 26,
          padT = 14,
          padR = 14;
        const plotW = chartW - padL - padR,
          plotH = chartH - padT - padB;
        const maxRevenue = FIN.sellingPrice * maxUnits;
        const maxCost = FIN.monthlyFixedCost + totalVariableCost() * maxUnits;
        const yMax = Math.max(maxRevenue, maxCost) * 1.05;

        function xFor(units) {
          return padL + (units / maxUnits) * plotW;
        }
        function yFor(value) {
          return padT + plotH - (value / yMax) * plotH;
        }

        function drawChart(units) {
          const rev0 = 0,
            revMax = FIN.sellingPrice * maxUnits;
          const cost0 = FIN.monthlyFixedCost,
            costMax = FIN.monthlyFixedCost + totalVariableCost() * maxUnits;
          const beX = xFor(be);
          const beY = yFor(FIN.sellingPrice * be);
          const curX = xFor(units);
          chart.innerHTML = `
            <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${chartH - padB}" stroke="var(--border-strong)"/>
            <line x1="${padL}" y1="${chartH - padB}" x2="${chartW - padR}" y2="${chartH - padB}" stroke="var(--border-strong)"/>
            <line x1="${padL}" y1="${yFor(rev0)}" x2="${chartW - padR}" y2="${yFor(revMax)}" stroke="#1EBE61" stroke-width="2"/>
            <line x1="${padL}" y1="${yFor(cost0)}" x2="${chartW - padR}" y2="${yFor(costMax)}" stroke="#E0A93A" stroke-width="2"/>
            <circle cx="${beX}" cy="${beY}" r="4.5" fill="var(--bg-panel-raised)" stroke="#1EBE61" stroke-width="2"/>
            <text x="${beX + 8}" y="${beY - 8}" fill="var(--text-secondary)" font-size="10" font-family="Consolas, monospace">Break-even: ${be}</text>
            <line x1="${curX}" y1="${padT}" x2="${curX}" y2="${chartH - padB}" stroke="var(--text-primary)" stroke-width="1" stroke-dasharray="3 4" opacity="0.5"/>
            <text x="${padL - 8}" y="${padT + 4}" fill="var(--text-faint)" font-size="9" text-anchor="end" font-family="Consolas, monospace">high</text>
            <text x="${padL - 8}" y="${chartH - padB}" fill="var(--text-faint)" font-size="9" text-anchor="end" font-family="Consolas, monospace">0</text>
            <text x="${padL}" y="${chartH - 6}" fill="var(--text-faint)" font-size="9" font-family="Consolas, monospace">${FIN.sliderMin}</text>
            <text x="${chartW - padR}" y="${chartH - 6}" fill="var(--text-faint)" font-size="9" text-anchor="end" font-family="Consolas, monospace">${maxUnits}</text>
            <text x="${chartW - padR - 70}" y="${padT + 12}" fill="#1EBE61" font-size="10" font-family="Consolas, monospace">Revenue</text>
            <text x="${chartW - padR - 70}" y="${padT + 26}" fill="#E0A93A" font-size="10" font-family="Consolas, monospace">Total Cost</text>
          `;
        }

        function update() {
          const units = parseInt(slider.value, 10);
          unitsLabel.textContent = units + " units";
          const f = financeAt(units);
          FX.countTo(body.querySelector("#be-rev"), 0, f.revenue, 350, (n) =>
            FX.fmtCurrency(n, FIN.currency),
          );
          FX.countTo(body.querySelector("#be-cost"), 0, f.totalCost, 350, (n) =>
            FX.fmtCurrency(n, FIN.currency),
          );
          const plEl = body.querySelector("#be-pl");
          const plLabel = body.querySelector("#be-pl-label");
          plLabel.textContent = f.profit >= 0 ? "Profit" : "Loss";
          plEl.style.color =
            f.profit >= 0 ? "var(--green)" : "var(--accent-danger)";
          FX.countTo(
            plEl,
            0,
            Math.abs(f.profit),
            350,
            (n) => (f.profit >= 0 ? "" : "-") + FX.fmtCurrency(n, FIN.currency),
          );
          drawChart(units);
        }
        slider.addEventListener("input", update);
        update();
      },
    },

    // 14 RISK -------------------------------------------------------
    {
      name: "RISK",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Risk Matrix",
          [
            "Eight operating risks with likelihood, impact and mitigation. Probability and impact levels are qualitative judgments, not measured statistics.",
          ],
          null,
          null,
        ),
      render(body) {
        const risks = QUAL.risks || [];
        const lvl = { LOW: 1, MEDIUM: 2, HIGH: 3 };
        const bubbleColor = {
          LOW: "#1EBE61",
          MEDIUM: "#E0A93A",
          HIGH: "#D14C4C",
        };
        const svgW = 460,
          svgH = 290,
          padL = 58,
          padR = 18,
          padT = 14,
          padB = 42;
        const plotW = svgW - padL - padR,
          plotH = svgH - padT - padB;
        const cellW = plotW / 3,
          cellH = plotH / 3;
        const cx = (p) => padL + (p - 0.5) * cellW;
        const cy = (m) => padT + (3 - m + 0.5) * cellH;

        // Cell shading: greener toward low-probability/low-impact, redder toward high/high.
        let cellsSvg = "";
        for (let p = 1; p <= 3; p++) {
          for (let m = 1; m <= 3; m++) {
            const score = p + m;
            const fill =
              score <= 3
                ? "rgba(30,190,97,0.10)"
                : score <= 4
                  ? "rgba(224,169,58,0.10)"
                  : "rgba(209,76,76,0.12)";
            cellsSvg += `<rect x="${padL + (p - 1) * cellW}" y="${padT + (3 - m) * cellH}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="var(--border)" stroke-width="1"/>`;
          }
        }

        // Group risks sharing a (probability, impact) cell so bubbles don't stack exactly.
        const buckets = {};
        risks.forEach((r, i) => {
          const p = lvl[r.probability] || 2,
            m = lvl[r.impact] || 2;
          const key = p + "," + m;
          (buckets[key] = buckets[key] || []).push(i);
        });
        let bubblesSvg = "";
        Object.keys(buckets).forEach((key) => {
          const [p, m] = key.split(",").map(Number);
          const idxs = buckets[key];
          idxs.forEach((riskIdx, j) => {
            const n = idxs.length;
            const offsetX = n > 1 ? (j - (n - 1) / 2) * 30 : 0;
            const r = risks[riskIdx];
            bubblesSvg += `
              <g transform="translate(${cx(p) + offsetX},${cy(m)})">
                <g class="rq-bubble" data-idx="${riskIdx}" tabindex="0" role="button" aria-label="${r.risk}">
                  <circle r="15" fill="${bubbleColor[r.impact] || "#8fa8c9"}" stroke="#0B1220" stroke-width="1.5"/>
                  <text class="rq-bubble-label" text-anchor="middle" dy="4">${riskIdx + 1}</text>
                </g>
              </g>`;
          });
        });

        const axisLabels = ["LOW", "MEDIUM", "HIGH"];
        let axisSvg = "";
        axisLabels.forEach((lab, i) => {
          axisSvg += `<text class="rq-axis-label" x="${cx(i + 1)}" y="${svgH - padB + 20}" text-anchor="middle">${lab}</text>`;
          axisSvg += `<text class="rq-axis-label" x="${padL - 10}" y="${cy(i + 1) + 3}" text-anchor="end">${lab}</text>`;
        });

        body.innerHTML = `
          <div style="display:flex;gap:26px;height:100%;align-items:center;flex-wrap:wrap;">
            <div style="flex:1;min-width:340px;max-width:500px;">
              <svg class="risk-quadrant-svg" viewBox="0 0 ${svgW} ${svgH}" role="img" aria-label="Probability versus impact risk matrix">
                ${cellsSvg}
                ${axisSvg}
                <text class="rq-axis-label" x="${padL + plotW / 2}" y="${svgH - 4}" text-anchor="middle" style="letter-spacing:0.12em;">PROBABILITY &#8594;</text>
                <text class="rq-axis-label" x="${-(padT + plotH / 2)}" y="14" text-anchor="middle" transform="rotate(-90)" style="letter-spacing:0.12em;">IMPACT &#8594;</text>
                ${bubblesSvg}
              </svg>
            </div>
            <div style="flex:1;min-width:280px;display:flex;flex-direction:column;gap:10px;max-height:100%;overflow-y:auto;">
              ${risks
                .map(
                  (r, i) => `
                <div class="data-row risk-list-row" data-idx="${i}" tabindex="0" role="button" style="cursor:pointer;">
                  <span class="k" style="display:flex;align-items:center;gap:8px;">
                    <span class="mono" style="color:${bubbleColor[r.impact]};font-weight:700;">${i + 1}</span>${r.risk}
                  </span>
                  <span class="risk-level ${r.impact}">${r.impact}</span>
                </div>`,
                )
                .join("")}
              <div id="risk-detail" class="card text-secondary" style="font-size:0.85rem;margin-top:4px;">Select a risk to see its mitigation strategy.</div>
            </div>
          </div>`;

        function activate(idx) {
          const r = risks[idx];
          body
            .querySelectorAll(".rq-bubble")
            .forEach((b) =>
              b.classList.toggle("sel", Number(b.dataset.idx) === idx),
            );
          body
            .querySelectorAll(".risk-list-row")
            .forEach((row) =>
              row.classList.toggle("active", Number(row.dataset.idx) === idx),
            );
          body.querySelector("#risk-detail").innerHTML =
            `<strong style="color:var(--text-primary);">${r.risk}</strong> — Mitigation: ${r.mitigation}`;
        }
        body.querySelectorAll(".rq-bubble, .risk-list-row").forEach((el) => {
          el.addEventListener("click", () => activate(Number(el.dataset.idx)));
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activate(Number(el.dataset.idx));
            }
          });
          el.addEventListener("mouseenter", () => {
            body
              .querySelectorAll(".rq-bubble")
              .forEach((b) =>
                b.classList.toggle(
                  "sel",
                  Number(b.dataset.idx) === Number(el.dataset.idx),
                ),
              );
          });
        });
      },
    },

    // 15 SUSTAINABILITY -------------------------------------------------------
    {
      name: "SUSTAINABILITY",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "Sustainability",
          (QUAL.sustainability && QUAL.sustainability.points) || [],
          null,
          null,
        ),
      render(body) {
        const sus = QUAL.sustainability || {
          principle: "REPAIR > REPLACE",
          steps: [],
        };
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:30px;height:100%;justify-content:center;">
            <h3 class="h-display" style="font-size:2.2rem;color:var(--green);">${sus.principle}</h3>
            <div class="flow-row" id="sus-steps">
              ${(sus.steps || []).map((s, i, arr) => `<div class="flow-node" data-idx="${i}">${s}</div>` + (i < arr.length - 1 ? '<span class="flow-arrow">&#8594;</span>' : "")).join("")}
            </div>
            <button class="btn-ghost" id="sus-play" style="align-self:flex-start;">Play Repair Sequence</button>
          </div>`;
        const nodes = body.querySelectorAll("#sus-steps .flow-node");
        body.querySelector("#sus-play").addEventListener("click", () => {
          nodes.forEach((n) => n.classList.remove("accent"));
          let i = 0;
          const timer = setInterval(() => {
            nodes.forEach((n) => n.classList.remove("accent"));
            if (nodes[i]) nodes[i].classList.add("accent");
            i++;
            if (i >= nodes.length) clearInterval(timer);
          }, 550);
        });
      },
    },

    // 16 INVESTMENT -------------------------------------------------------
    {
      name: "INVESTMENT",
      kpis: () => defaultKPIs(),
      left: () =>
        leftPanel(
          "The Investment Case",
          [
            "A summary of the model presented across this walkthrough.",
            "These are presentation interactions only — no data is submitted anywhere.",
          ],
          null,
          null,
        ),
      render(body) {
        const be = breakEvenUnits();
        body.innerHTML = `
          <div class="rise-in" style="display:flex;flex-direction:column;gap:24px;height:100%;justify-content:center;">
            <div>
              <div class="h-display" style="font-size:2.4rem;">DIPTO FlexDesk</div>
              <div class="text-secondary">One Desk. Multiple Possibilities.</div>
            </div>
            <div class="data-list" style="max-width:420px;">
              <div class="data-row"><span class="k">Selling Price</span><span class="v">${FX.fmtCurrency(FIN.sellingPrice, FIN.currency)}</span></div>
              <div class="data-row"><span class="k">Variable Cost</span><span class="v">${FX.fmtCurrency(totalVariableCost(), FIN.currency)}</span></div>
              <div class="data-row"><span class="k">Contribution</span><span class="v" style="color:var(--green);">${FX.fmtCurrency(contributionPerUnit(), FIN.currency)}</span></div>
              <div class="data-row"><span class="k">Monthly Capacity</span><span class="v">${FIN.monthlyCapacity.toLocaleString("en-US")} units</span></div>
              <div class="data-row"><span class="k">Break-Even</span><span class="v">${be} units</span></div>
            </div>
            <h3 class="h-display" style="font-size:1.6rem;">Would you invest?</h3>
            <div class="invest-row" style="max-width:560px;">
              <div class="invest-btn yes" data-choice="yes">Yes — Invest</div>
              <div class="invest-btn data" data-choice="data">I Need More Data</div>
              <div class="invest-btn risky" data-choice="risky">Too Risky</div>
            </div>
            <div class="invest-response" id="invest-response"></div>
          </div>`;
        const responses = {
          yes: "Noted — thank you for the confidence. This is a presentation interaction only.",
          data: "Fair — ask about any section again; every number here traces back to the finance model.",
          risky:
            "Fair concern — the risk matrix and break-even model are built to make that judgment easier.",
        };
        body.querySelectorAll(".invest-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            body
              .querySelectorAll(".invest-btn")
              .forEach((b) => b.classList.remove("picked"));
            btn.classList.add("picked");
            body.querySelector("#invest-response").textContent =
              responses[btn.dataset.choice] || "";
          });
        });
      },
    },
  ];

  // ---------- shared helpers ----------
  function defaultKPIs() {
    const be = breakEvenUnits();
    return [
      {
        label: "Capacity",
        value: `${(FIN.monthlyCapacity || 0).toLocaleString("en-US")} / mo`,
      },
      {
        label: "Selling Price",
        value: FX.fmtCurrency(FIN.sellingPrice, FIN.currency),
      },
      {
        label: "Variable Cost",
        value: FX.fmtCurrency(totalVariableCost(), FIN.currency),
      },
      {
        label: "Contribution",
        value: FX.fmtCurrency(contributionPerUnit(), FIN.currency),
      },
      { label: "Break-Even", value: `${be} units` },
    ];
  }

  function leftPanel(title, paragraphs, listItems, assumptionLabel) {
    return {
      title,
      paragraphs: paragraphs || [],
      listItems: listItems || null,
      assumptionLabel: assumptionLabel || null,
    };
  }

  function componentDetailHtml(partId) {
    const comp = (PROD.components || []).find((c) => c.id === partId);
    if (!comp) return "";
    return `
      <div class="popover-title">${comp.name}</div>
      ${fieldRow("Material", comp.material)}
      ${fieldRow("Purpose", comp.purpose)}
      ${fieldRow("Process", comp.process)}
      ${fieldRow("Quality Checkpoint", comp.quality)}
    `;
  }

  /** Wire hover/click popovers onto every .desk-part inside a mounted DeskViz container. */
  function attachComponentPopovers(mountEl) {
    const parts = mountEl.querySelectorAll(".desk-part");
    Popover.attach(Array.from(parts), (elm) =>
      componentDetailHtml(elm.getAttribute("data-id")),
    );
  }

  // ---------- rendering orchestration ----------
  function renderLeft(sectionIndex) {
    const data = sections[sectionIndex].left();
    let listHtml = "";
    if (data.listItems) {
      listHtml = `<div class="context-list">${data.listItems
        .map(
          (li) =>
            `<div class="context-list-item"><b>${li.title}</b><span>${li.sub}</span></div>`,
        )
        .join("")}</div>`;
    }
    const assumption = data.assumptionLabel
      ? `<div class="assumption-tag">${data.assumptionLabel}</div>`
      : "";
    el.contextBlock.innerHTML = `
      <div class="context-eyebrow eyebrow">${sections[sectionIndex].name}</div>
      <div class="context-title h-display">${data.title}</div>
      ${data.paragraphs
        .filter(Boolean)
        .map((p) => `<p class="context-text">${p}</p>`)
        .join("")}
      ${listHtml}
      ${assumption}`;
  }

  function renderKPI(sectionIndex) {
    const items = sections[sectionIndex].kpis();
    el.kpiBar.innerHTML = items
      .map(
        (k) => `
      <div class="kpi-item">
        <span class="kpi-label">${k.label}</span>
        <span class="kpi-value">${k.value}</span>
      </div>`,
      )
      .join("");
  }

  // Sections that run their own timers (auto-cycling animations, etc.) register
  // a cleanup callback here so it always gets cancelled before the next
  // section renders — otherwise an interval can keep firing against a
  // detached DOM node after the user navigates away.
  let activeSectionCleanup = null;
  function registerCleanup(fn) {
    activeSectionCleanup = fn;
  }

  function renderStage(sectionIndex) {
    const s = sections[sectionIndex];
    el.stageEyebrow.textContent =
      "SECTION " + String(sectionIndex + 1).padStart(2, "0");
    el.stageTitle.textContent = s.name;
    el.stageCount.textContent = `${String(sectionIndex + 1).padStart(2, "0")} / ${sections.length}`;
    el.progressLabel.textContent = `${String(sectionIndex + 1).padStart(2, "0")} / ${sections.length}`;
    el.progressFill.style.width = `${((sectionIndex + 1) / sections.length) * 100}%`;

    if (activeSectionCleanup) {
      activeSectionCleanup();
      activeSectionCleanup = null;
    }
    Popover.hide(true);
    el.stageBody.classList.remove("fade-enter-active");
    el.stageBody.classList.add("fade-enter");
    // eslint-disable-next-line no-unused-expressions
    void el.stageBody.offsetWidth;
    try {
      s.render(el.stageBody);
    } catch (err) {
      el.stageBody.innerHTML = `<p class="text-faint">This section could not be rendered (${err.message}).</p>`;
      // eslint-disable-next-line no-console
      console.error("Section render error:", err);
    }
    el.stageBody.classList.add("fade-enter-active");
  }

  let currentSectionIndex = 0;
  function goToSection(index) {
    currentSectionIndex = index;
    renderStage(index);
    renderLeft(index);
    renderKPI(index);
    // On phones the section list is a full-screen overlay drawer — close it
    // after a selection so the person actually sees the section they picked.
    if (isMobile()) setPanel("right", true);
  }

  // ---------- boot ----------
  function enterApp() {
    el.opening.classList.add("hidden");
    el.app.classList.add("active");
    el.app.setAttribute("aria-hidden", "false");
    Nav.init(sections, (idx) => goToSection(idx));
    goToSection(0);
  }

  el.enterBtn.addEventListener("click", enterApp);
  el.enterBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enterApp();
  });

  document.addEventListener("dipto:toggle-anim", () => {
    // Global play/pause hook — currently a no-op placeholder since most
    // animations are short and interaction-triggered rather than looping.
  });

  // ---------- opening screen: blueprint trace + status ticker ----------
  (function initOpeningBlueprint() {
    const mount = document.getElementById("opening-blueprint");
    const tickerEl = document.getElementById("opening-ticker");
    if (mount) {
      mount.innerHTML = Blueprint.deskWireframeSVG();
      const svg = mount.querySelector("svg");
      if (svg)
        Blueprint.animateLoop(svg, {
          duration: 850,
          stagger: 80,
          holdMs: 6500,
        });
    }
    if (tickerEl) {
      Blueprint.mountTicker(
        tickerEl,
        [
          "INITIALIZING FLEXDESK MODULE",
          "CALIBRATING JOINT TOLERANCES",
          "VERIFYING BILL OF MATERIALS",
          "SYSTEM READY",
        ],
        1900,
      );
    }
  })();
})();
