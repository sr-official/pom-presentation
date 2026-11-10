# DIPTO FlexDesk — Investor Presentation

An offline, interactive, single-screen presentation for a Production &
Operations Management course project. Built as a simulation-style investor
pitch rather than a slide deck.

**DIPTO FlexDesk is a fictional academic product concept.** No real
customers, factory, employees, sales, patents, certifications or investment
are claimed anywhere in this project. All financial, capacity, workforce and
quality figures are clearly labeled illustrative academic assumptions.

## How to run

Open `index.html` directly in a browser (double-click it, or drag it into a
browser window). No install step, no server, no internet connection needed.

Works fully offline. Tested at 1366×768 and 1920×1080.

## Controls

- Click a section in the right-hand list, or a mode/stage/zone/component in
  the center stage.
- Keyboard: `→`/`↓` next section, `←`/`↑` previous section, `Esc` jump to
  overview (section 1), number keys `1–9` jump directly to a section.
- Hover any highlighted component, workforce role, or risk cell for a quick
  info preview; click it to pin the details open (click elsewhere, or the
  `×`, to dismiss).
- The `❮`/`❯` tabs at the edges of the center stage collapse the left brand
  panel and right section list, giving the product visualization the full
  screen width. Useful on smaller displays or when you just want the
  audience looking at the product.

## Architecture

```
index.html            App shell: opening screen + 4-panel layout
css/
  variables.css        Design tokens (color, type, spacing, motion)
  layout.css            100vh grid shell, opening screen layout
  components.css        Typography, nav, cards, KPI bar, forms, etc.
  animations.css         Keyframes + desk-part transition rules
js/
  animations.js          Small reusable animation/format helpers (FX)
  product-viz.js          DeskViz — the SVG product model (modes, explode)
  navigation.js            Nav — right-hand section list + keyboard control
  app.js                    Section registry, rendering, all section logic
data/
  _init.js                 Initializes the shared APPDATA namespace
  finance.js, product.js, production.js, workforce.js, quality.js,
  capacity.js               Editable project data (see below)
```

## A note on the data files (`.js`, not `.json`)

The brief called for local JSON. In practice, opening an HTML file directly
via `file://` (the exact way this presentation will be opened in class)
blocks `fetch()`/`XMLHttpRequest` against local files in Chrome-based
browsers for security reasons — so a `fetch('data/finance.json')` approach
would silently fail with a blank data set on the most common browser.

To guarantee the "just open index.html and it works" requirement, project
data is stored as plain JavaScript object literals (`data/*.js`, loaded with
ordinary `<script src="...">` tags) instead of JSON fetched at runtime. Each
number still lives in exactly one place — the appropriate `data/*.js` file —
and nothing is duplicated across the JavaScript. This is a direct,
deliberate fix for an offline-reliability risk in the original plan.

All financial figures in particular trace back to a single object in
`data/finance.js`; every displayed price, cost, contribution and break-even
number in the app is computed from that one source at render time.

## Self-review (professor + investor pass)

Run against the project brief, plus a round of user feedback:

- **Product originality** — framed correctly: modular/foldable furniture is
  not claimed as new; the pitch is a single reconfigurable system, stated
  explicitly in the PROBLEM and PRODUCT sections.
- **Product variation** — the PRODUCT section now offers four variants tied
  to the resource pack's actual target-customer segments (Standard for
  schools/coaching centers, Compact Home for students/home learners, Bench
  Duo for madrasas/group seating, Trainer Set for training organizations),
  each rendering a genuinely different two-unit or single-unit arrangement
  rather than just a relabeled desk.
- **Product animation** — the desk assembles itself into place on mount/
  variant change, bobs gently at idle, and has a toggleable slow-rotation
  showcase view (CSS 3D, no library) in addition to the mode/explode
  transitions.
- **Popover interaction** — component, workforce and risk details now
  appear in a small floating popover that shows on hover and pins open on
  click, positioned next to the element rather than a fixed sidebar that
  covered the visualization.
- **Responsive side panels** — the left brand panel and right section list
  each collapse via an edge tab, independently, at any viewport size, so the
  product can take the full screen when needed.
- **Capacity & numerical consistency** — capacity, takt time, break-even and
  the KPI bar all derive from the same two data files (`capacity.js`,
  `finance.js`); changing a number there updates every section that shows it.
  Verified 300-unit break-even is identical in the KPI bar, FINANCE,
  BREAK-EVEN chart intersection, and INVESTMENT screens.
- **Workforce/quality/capacity labeling** — every illustrative figure (16
  workers, 94% first-pass yield, 1,000-unit capacity, all financials) carries
  an explicit "Illustrative Academic Assumption/Scenario" tag in the left
  panel, not just a footnote.
- **Offline reliability** — switched from fetch-based JSON loading to
  script-tag-loaded data objects (see above) specifically because the
  original approach would break silently under `file://`.
- **Visual hierarchy** — the product/process visualization is always the
  largest element on screen; supporting data lives in the side panels and
  bottom KPI strip rather than crowding the center stage.
- **Scope control** — no AI/IoT/smart-sensor features were added to the
  product itself, per the brief; the desk stays a plausible, low-tech
  furniture product.

## Editing the numbers

To change any financial, capacity, workforce or quality assumption, edit the
corresponding file in `data/`. The whole presentation (KPI bar, FINANCE,
BREAK-EVEN, INVESTMENT) recalculates from those files — nothing else needs
to change.

## Adding real photos (optional)

Every visual "image" in this deck is currently custom vector art — the
project has to stay fully offline with no stock photography, so that was
the honest option available. If you have real photos (your own product
shots, sourced with proper rights, or renders from an image generator you
have separate access to), drop them into `assets/images/` using these exact
filenames and each one will automatically replace its vector fallback —
no code changes needed:

| File | Section | Notes |
|---|---|---|
| `product-standard.jpg` | Product → Real Photo tab | One per variant |
| `product-compact.jpg` | Product → Real Photo tab | |
| `product-bench.jpg` | Product → Real Photo tab | |
| `product-trainer.jpg` | Product → Real Photo tab | |
| `anatomy-exploded.jpg` | Anatomy | Disassembled / exploded components |
| `material-board.jpg` | Materials | Particle board close-up |
| `material-layers.jpg` | Materials | Plywood close-up |
| `material-steel.jpg` | Materials | Mild steel stock |
| `material-laminate.jpg` | Materials | Laminate sheet |
| `material-edge.jpg` | Materials | PVC/ABS edge band |
| `material-hardware.jpg` | Materials | Fasteners / hinges |
| `material-rubber.jpg` | Materials | Rubber feet |
| `material-finish.jpg` | Materials | Finishing coat sample |
| `production-01.jpg` … `production-12.jpg` | Production | One per stage, zero-padded (`production-01.jpg` … `production-12.jpg`) |
| `factory-layout.jpg` | Factory | Overall floor photo |

Any size works — images are displayed with `object-fit: cover` — but
roughly 1200×675px (16:9) lands well for most slots. If a file is missing,
that slot just keeps showing its vector illustration with a small hint
telling you exactly which filename it's waiting for, so nothing ever looks
broken either way.

## Round 2 fixes (user feedback pass)

- **Rotation.** The showcase "Rotate View" toggle originally used a ±16°
  `rotateY` wobble, which is technically an animation but on flat 2D art is
  a ~4% width squish — invisible in practice. Replaced with a continuous
  360° spin so it's unmistakable.
- **Realism + per-customer variation.** Rebuilt the desk artwork (shaded
  legs, wood-grain top, edge-band strip, grounded shadow) and gave each of
  the four product variants its own demo scene — a classroom whiteboard for
  Standard, a window/lamp for Compact Home, a shared bench for Bench Duo,
  and a flipchart easel for Trainer Set — plus chairs where appropriate, so
  each customer segment reads as a distinct, plausible setting rather than
  the same desk relabeled.
- **Mobile responsiveness.** Side panels now become full-height overlay
  drawers with a tap-to-dismiss scrim below 780px, the KPI bar scrolls
  horizontally, grids collapse to fewer columns, and the nav drawer
  auto-closes after picking a section. This also surfaced a real CSS bug:
  the mobile media queries lived in `layout.css`, which loads *before*
  `components.css` — so components.css's unconditional rules for the same
  selectors (`.card`, `.kpi-item`, `.risk-grid`, etc.) were silently winning
  the cascade regardless of screen width, since CSS breaks specificity ties
  by source order, not by whether a media query's condition is true. Fixed
  by moving all breakpoint overrides into `css/responsive.css`, loaded last.
  Verified at 390px (phone), 820px (tablet) and 1366px/1920px (desktop).

## Round 3: continuous, "engineer-feel" animation

- **Opening screen** now runs an auto-playing technical trace-in: a small
  wireframe schematic of the desk (captioned like a drafting-sheet figure)
  draws itself stroke-by-stroke using measured `getTotalLength()` values
  (not a guessed dash length), sits behind a graph-paper blueprint grid,
  inside HUD viewfinder corner brackets, with a cycling monospace status
  line ("CALIBRATING JOINT TOLERANCES…"). It re-traces itself periodically
  for continuous motion rather than a one-shot intro.
- **Product auto-cycle.** The PRODUCT section now steps through FOCUS →
  CONNECT → PRESENT → COMPACT on its own every ~3.2s, and ANATOMY toggles
  explode/reassemble on its own every ~3.4s — both driven by `js/blueprint.js`
  helpers plus a small `auto-chip` control (see `css/engineering.css`).
  Clicking any mode/variant/explode control by hand pauses auto-cycling
  (the chip dims to "AUTO-CYCLE PAUSED") so the audience's manual choice
  always wins; clicking the chip resumes it.
  - Because these run on `setInterval`, a section-cleanup registry
    (`registerCleanup` in `app.js`) guarantees the timer is cancelled the
    moment the person navigates to a different section — otherwise it would
    keep firing against a detached DOM node.
- **Blueprint/HUD kit** (`css/engineering.css`): a reusable graph-paper grid,
  four-corner HUD brackets, a scanning sweep line, and dimension-style
  monospace labelling, applied to the PRODUCT and ANATOMY stages so the
  product visualization reads as a live technical readout rather than a
  static illustration.

## A note on CSS load order (learned twice)

Two real bugs came from the same root cause and are worth flagging for
anyone editing this project: CSS resolves equal-specificity conflicts by
**source order**, not by whether a rule sits inside a matching `@media`
block. `layout.css` and `engineering.css` both load *before*
`components.css`, so any rule in them that shares a selector with
`components.css` will silently lose regardless of viewport or condition.
`responsive.css` is loaded last specifically so its breakpoint overrides
always win. If you add a new override for an existing component class,
either put it in `responsive.css`/after it, or give it enough specificity
to survive the cascade.

## Round 4: real imagery, more visuals, overlap fixes, motion polish

- **"Real image" of the product.** The brief rules out actual photography —
  fully offline, and the resource pack explicitly says no stock photos/
  external images. The closest honest equivalent: a **Photo View** toggle
  next to the existing Technical view in the PRODUCT section, rendering the
  same desk with a studio-style vignette background and a genuine floor
  reflection (an SVG `<use>` of the desk group, faded via a gradient overlay)
  instead of the blueprint grid/HUD/scanline. Caught a real bug while
  building it: the reflection's JS-driven opacity toggle was hard-set to
  `1`, silently overriding the intended subtle `0.16` from CSS — inline
  styles beat class rules regardless of what the class author intended.
- **Visuals added throughout:** a small reusable icon set (`js/icons.js`)
  now anchors the MATERIALS, PRODUCTION, WORKFORCE and QUALITY cards instead
  of text-only rows; QUALITY gets an animated radial gauge for First Pass
  Yield; FINANCE gets a donut chart (CSS `conic-gradient`) of the variable
  cost breakdown with a matching legend; RISK was rebuilt from a plain card
  grid into a genuine probability × impact quadrant scatter chart (closer to
  the brief's original "interactive probability/impact matrix" ask), with
  numbered bubbles synced to a clickable risk list.
  - Building the quadrant chart surfaced a real SVG rendering bug: a bubble
    combined an SVG `transform="translate(...)"` **attribute** with a CSS
    `transform: scale()` **property** on the same element for its hover/
    select state. Browsers don't reliably compose the two together with
    `transform-box: fill-box`, and the bubble jumped to the wrong position
    on selection. Fixed by splitting positioning and scaling into nested
    `<g>` elements — outer group handles the SVG attribute translate, inner
    group handles the CSS scale.
- **Overlap / responsive audit.** Screenshotted all 16 sections at five
  widths (360 / 390 / 1024 / 1366 / 1920px) and found two more real bugs:
  `.stage-body` wasn't padded to clear the mobile edge toggle tabs the way
  `.stage-header` was, so the tabs sat on top of the first word or two of
  body content (e.g. "VARIABLE COST BREAKDOWN" rendered as "RIABLE COST
  BREAKDOWN"); and the FINANCE donut's legend values could get clipped at
  narrow widths because the row relied on `margin-left: auto` without a
  width constraint on its container. Also gave the FACTORY diagram a
  minimum width with horizontal scroll instead of letting it shrink its
  labels into illegibility on small phones.
- **Motion polish.** Cards and flow-diagram nodes now have a staggered
  fade/rise-in on entrance and a hover lift with a soft green glow, so
  switching sections feels more alive without being distracting.

## Round 5: theme toggle, real-image alternatives everywhere, keyboard shortcuts

- **Dark / light theme.** A toggle button (top-right, visible once inside
  the app) switches the whole UI chrome — panels, cards, text, popovers —
  between dark and light via a `data-theme` attribute and a `localStorage`-
  backed preference (safe to use here since this is a locally-run file, not
  a claude.ai artifact). Brand colors and the KPI strip stay consistent in
  both themes deliberately, the way a website's accent color or dark footer
  often doesn't flip with the theme. Building this surfaced several charts
  (BREAK-EVEN, FACTORY) that had hardcoded dark-only SVG colors instead of
  CSS variables — fixed so they repaint correctly in both themes.
- **"Real image" requests (Product, Anatomy, Materials, Factory).** Same
  constraint as before — fully offline, no stock photography allowed by the
  brief — so each ask was answered by pushing the custom vector artwork
  further rather than embedding photos:
  - **Product**: the Photo View now has a shot gallery (Front / 3/4 Angle /
    Side / Reverse Angle) using a new `DeskViz.setViewAngle()` — a real
    product-photography UX pattern applied to the existing render.  - **Anatomy**: expanded from 8 to the full **18-component bill of
    materials** from the original resource pack (front/rear supports, book
    holder, cable channel, hinges, locking pins, fasteners, laminate, edge
    banding, etc.) — the 8 that are separate hotspots on the exploded model
    are marked "ON MODEL"; the rest are listed as the smaller hardware/
    finish items they physically are, so nothing from the spec is missing.
  - **Materials**: replaced icon-only cards with textured SVG swatches
    (particle-board fleck pattern, plywood ply-stack, brushed steel
    gradient, glossy laminate, rubber dimple texture, etc. — `js/swatches.js`)
    plus expanded property bullets and a "used in" note per material.
  - **Factory**: zone boxes now carry category icons, a dashed-arrow /
    quality-checkpoint legend, and a captioned "FIG. 02" blueprint panel
    matching the opening screen's drafting-sheet style.
- **Production realism + keyboard shortcut.** Added `js/stage-art.js`, a
  larger illustrative scene per stage category (saw mid-cut, drill press,
  weld spark, spray finish, etc.), plus an explicit INPUT → PROCESS → OUTPUT
  visual diagram per stage. Stage switching now also responds to `[` / `]`
  — deliberately *not* the arrow keys, which are already bound globally to
  section navigation; reusing them here would have fought that binding.
  Verified both bindings work independently without interfering.
- **Center-stage responsiveness.** `.stage-body` was `overflow: hidden`,
  which meant any section whose content grew taller than the viewport
  (increasingly likely with all the content added this round) would clip
  silently instead of scrolling. Changed to `overflow-y: auto` with a thin
  themed scrollbar — re-audited all 16 sections at five widths (360–1920px)
  after every change in this round with zero clipping or overlap found.

## Round 6: drop-in real photos

A follow-up request asked for actual real images, more clearly and in more
places. Worth stating plainly: this environment has no image-generation
tool available, and even if it did, downloading real photos from the web
would break the offline requirement, raise copyright problems (redistributing
someone else's photography), and risk misrepresenting a fictional product as
if it had been physically photographed. So instead of faking it, the deck now
has a genuine **drop-in real-photo system** (`js/real-image.js`): every image
slot tries to load a real file from `assets/images/` first, and only falls
back to the vector illustration — with a small on-screen hint showing the
exact filename it's waiting for — if that file doesn't exist yet. `<img>`
tags load fine from local relative paths under `file://` (unlike `fetch()`),
so this needed no server and no JS-side existence checks; the browser's own
`onload`/`onerror` events do the work.

Slots now exist in Product (a "Real Photo" tab per variant, alongside
Technical/Photo View), Anatomy (exploded-view photo), Materials (all 8
swatches), Production (all 12 stages), and Factory (floor overview) — see
"Adding real photos" above for exact filenames. Building this caught one
real layout bug: an image panel using `aspect-ratio` inside a `flex: 1`
full-height stage container computed a height taller than its actual
container (aspect-ratio derives height from width, not from the parent's
constrained height), overflowing into the text below it. Fixed by adding a
`fill` aspect mode (`height: 100%` instead of a ratio) for that specific
full-bleed context, while grid-based cards keep the fixed-ratio mode.
