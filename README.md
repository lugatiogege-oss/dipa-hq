# DIPA HQ — DIPA NEXUS (Phase 3: Character Animation & Behavior System)

Browser-based 3D virtual headquarters for the owner's AI agents.
Visual target: the approved concept image (`../inspection/concept-approved.jpg`).

## What this is

Phase 3 build on the Phase 2 visual rebuild. Base: v3 (two-floor cutaway),
with the CEO patrol/sleep routine and smooth day/night cycle adapted from v1.
v2.2 was NOT used as a foundation (divergent branch, see Phase 1 report).

- **Full two-floor glass building** (not a mezzanine): Floor 1 Operations
  (9 areas) + Floor 2 Executive (5 areas), staircase, glass viewing floor.
- **Exterior:** open-top dollhouse (no roof — interior visible from above),
  fountain, futuristic night-city backdrop, garden, entrance with D logo.
- **Characters:** 7 generic worker figures (Agent 1–7, placeholders) + CEO
  DFNX PRIME. Jointed rigs with a modular animation system: typing,
  thinking, idle, walking, sitting, task transitions, interaction.
  CEO: read, supervise, inspect, point, phone, coffee, greet + sleep
  00:00–07:00 WIB (never disappears while resting).
- **Environment animation:** fountain jets pulse,
  night-city windows twinkle, workstation monitors flicker with activity,
  mission globe rotates, reception doors slide open periodically.
- **Activity system:** IDLE / WORKING / THINKING / WALKING / INTERACTING /
  RESTING / OFFLINE — visual SIMULATION only, labelled as such.
- **Day/night:** real WIB time, windows per assignment §6
  (Sunrise 05:00–06:59, Day 07:00–15:59, Sunset 16:00–17:59, Night 18:00–04:59).
- **UI:** left nav rail (concept), Agent Directory + Operations Center panels
  (independently collapsible), CEO card, WIB clock, bottom bar
  (Camera / Upgrade / Report / Menu). **No coins/stamina/gems HUD.**
- **Statuses are honest:** UNKNOWN / NOT CONNECTED until real integration.
  Owner Mode: NOT IMPLEMENTED (needs a backend; no fake password screen).
- **Three.js 0.180.0 is vendored locally** (`vendor/`) — no CDN dependency
  for core rendering. If WebGL or a module fails, a useful error is shown
  instead of a silent black screen.

## Identity (Master Prompt Revisi — SUPERSEDES the Phase 2 correction)

- The 7 workers are GENERIC placeholders **Agent 1–7**. No permanent
  names, no platform/division assignment. Roles are "Unassigned" until
  the Owner sets them.
- CEO = **DFNX PRIME, SUPREME DIRECTOR** — separate from Agent 1–7.
- All identity/placement data lives in `js/config.js` (single source of
  truth: `AGENTS`, `CEO`, `WORKER_SPOTS`, `WALK_TARGETS`, `CEO_SPOTS`).
  Owner Mode will read/write that config later; nothing is hard-coded
  in the character builders. No Owner Mode settings UI yet.
- Room names (e.g. "R&D Lab", "Collaboration Area") are kept as BUILDING
  location labels from the approved Phase 2 design; they are not agent
  divisions. If the Owner also wants room names neutralised, that is a
  separate decision.

## Owner Mode (architecture, not UI yet)

`js/config.js` is the single source of truth for agent name/role/room/
spot and CEO name/title. A debug API proves the wiring is config-driven
(see `window.__DIPA_DEBUG` in `js/main.js`: `setAgentName`,
`setCEOName`, `setActivity`, `setCEOBehaviour` — verification only, not
a user-facing settings screen). The final Owner Mode settings UI is a
later phase and needs a backend for real auth.

## Run locally

Because the app uses JavaScript modules, serve it over HTTP (do not open
`index.html` via `file://`).

```bash
cd <this folder>
python3 -m http.server 8125
# open http://localhost:8125 in Chrome (desktop or Android)
```

No build step, no dependencies to install, no backend required for the
visual preview.

## Files

```
index.html            entry point + UI shell (panels, nav, top/bottom bar)
README.md             this file
PHASE-2-REPORT.md     Phase 2 report (what was built, verification, gaps)
vendor/
  three.module.js     Three.js 0.180.0 (MIT, vendored locally)
  three.core.js       Three.js 0.180.0 core — REQUIRED: three.module.js
                      re-exports from ./three.core.js (r150+ split build);
                      without it the module fails to load (verified 2026-11-15)
  addons/controls/OrbitControls.js
js/
  main.js             bootstrap + error handling + render loop
  config.js           identity, palette, layout, day/night windows
  materials.js        shared materials + geometry/sign helpers
  scene.js            renderer/scene/camera/controls + night-city backdrop
  building.js         shell: floors, glass, columns, stairs (open-top, no roof)
  floor1.js           Floor 1 rooms + furniture (9 areas)
  floor2.js           Floor 2 rooms + furniture (5 areas)
  exterior.js         fountain, garden, entrance (no helipad/helicopter)
  characters.js       character factory + placement + name tags (rig-based)
  rig.js              jointed character rig (shared by agents + CEO)
  animation.js        animation engine: poses + animator + stepMove
  activity.js         agent activity state machine (SIMULATION)
  environment.js      environment animation (fountain, city, screens, doors, globe)
  ceo.js              CEO behaviour controller (read/supervise/inspect/
                      point/phone/coffee/greet/sleep)
  lighting.js         real-time WIB day/night system
  camera.js           camera controller (reset/zoom/focus presets)
  ui.js               panels, nav, bottom bar, settings, toast
  status.js           Agent Directory data + rendering + activity tags
  performance.js      quality levels PERFORMANCE / BALANCED / ULTRA
                      + FPS meter (window.__DIPA_FPS)
```

## Controls

- Drag: rotate · Scroll / pinch: zoom · Click/tap a character: details
- Camera button / panel: Reset, Zoom +/−, Focus (Floor 1, Floor 2,
  Entrance, Top View — Open Interior)
- Left nav: Overview / Agents / Buildings / Research / Missions / Analytics
  (camera focus shortcuts) / Settings (quality)
- Panels close and reopen independently (☰ Agents / ☰ Info buttons).

## Known limitations (Phase 3)

- Upgrade / Report buttons are honest placeholders (Phase 5).
- No backend, no Owner Mode, no live agent data — all labeled honestly.
- No GLB/GLTF models — all characters are procedural primitives.
- Mobile layout (390px) renders and works, but is cramped: nav rail overlaps
  the DFNX PRIME card, panel headers wrap/overlap, both panels open by
  default cover most of the screen — responsive polish is Phase 5.
- Only the NIGHT day/night window was observed live; Sunrise/Day/Sunset use
  the same v1 logic but still need a mocked-clock check in Phase 7.
  Daytime CEO behaviours were verified with a mocked hour (see
  PHASE-3-REPORT.md §5) because live verification ran at night.
- FPS measured under software rendering (llvmpipe) is NOT representative
  of real GPU hardware — see PHASE-3-REPORT.md §6; performance tuning
  is Phase 6.

## Verification (Phase 3)

Verified in a real browser (Xvfb + headful Firefox + Mesa llvmpipe,
Playwright Firefox 1572, local HTTP :8125): 0 console errors, 0 page
errors, 0 failed requests, 0 external requests; 7 generic agents +
separate CEO; typing/thinking/walking/interaction poses proven with
timed screenshots (same view at t=0/t=4s) and forced-activity checks;
CEO behaviours (read/point/phone/coffee/greet/inspect/sleep) proven via
mocked hour + screenshots; rotor angle and fountain jet scale change
measured between reads; FPS measured (desktop + mobile) — numbers in
`PHASE-3-REPORT.md` §6 (software-rendered, not representative of real
GPUs). Screen recording: `screenshots/p3-recording.webm` (if captured —
see report). Full per-check table, bugs found & fixed, and remaining
gaps: `PHASE-3-REPORT.md`. Raw results:
`verification-phase3.json`. Screenshots: `screenshots/` (p3-*.png).
Harness (persistent): `~/workspace/dipa-hq/verification/`
(`verify-phase3.js`, `record3.js`).

## Verification (Phase 2 — archived)

0 console errors, 0 page errors, 0 failed requests, 0 external requests;
real WIB clock; both floors visible from the default view; all 14 rooms
labeled; camera presets + nav focus + independent panels + character tap
all pass. Full per-check table, the 6 bugs found & fixed during
verification (missing `three.core.js`, mirrored fascia sign, frame-based
camera tween, mis-aimed presets, dark helicopter, favicon 404) and
remaining gaps: `PHASE-2-REPORT.md`. Raw results:
`verification-results.json`, `nav-results.json`. Screenshots:
`screenshots/` (01–14). Checkpoint of the exact Phase 2 state:
`~/workspace/dipa-hq/checkpoints/phase2/`.
