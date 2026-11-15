# DIPA HQ — Live Audit, Typography Fix, Visual Quality, Mobile Performance, Campus Revision, Ref A Prototype, Helipad Proposal

**Date:** 2026-11-16 (audit run ~03:28–04:01 WIB)
**Live site:** https://lugatiogege-oss.github.io/dipa-hq/
**Dev build:** `~/workspace/dipa-hq/rebuild-audit/` (snapshot of the pre-audit build in `~/workspace/dipa-hq/checkpoints/pre-audit-20261116/`)
**Method:** Xvfb + headful Firefox + Mesa llvmpipe, desktop 1440×900 and mobile viewport 390×844, bounded runs with timeouts. llvmpipe FPS numbers are a software-rendering baseline, NOT real-device FPS; draw-call count is the trustworthy cross-device signal. The real-device test is always the owner's phone.

---

## 1. Actual cause of any 3D loading failure

**None found on the live site.** The audit run against the live URL (before state) reports:

- `__DIPA_READY = true` on desktop and mobile; 0 console errors, 0 page errors, 0 failed requests, 0 external requests (the build is fully self-contained: Three.js 0.180.0 vendored locally, zero CDN).
- WIB clock ticking (03:28:29 → 03:28:32 desktop; 03:31:14 → 03:31:16 mobile).
- Roof proof: `roofCheck` ray from above hits the floor-2 interior at y 4.53 (not a roof slab at ~8.1) — the open-top state is confirmed live.

**About the "3D tidak dapat dimuat" error the owner saw earlier:** the screenshot the owner sent shows the site opened from the phone's file manager (`content://media/external/...` in the browser address bar). ES modules and the locally vendored Three.js cannot load from a `file://`/`content://` URL — the site must be opened through its GitHub Pages URL, not by tapping `index.html` in the file manager. That is the actual cause of that error, and it is not a defect in the live site.

## 2. Functionality audit

All checks passed on desktop AND mobile (390px viewport), before and after the fixes:

| Check | Desktop | Mobile |
|---|---|---|
| 3D scene loads (`__DIPA_READY`) | ✅ | ✅ |
| WIB clock ticking | ✅ | ✅ |
| Agent Directory: 7 agents, generic names, correct rooms | ✅ | ✅ |
| CEO card (DFNX PRIME, SUPREME DIRECTOR) | ✅ | ✅ |
| No old names (Dipa.Ai/Difa.ai/Evelyn.ai/Rafo.ai) | ✅ | ✅ |
| No platform/division labels; "Divisions Belum diatur" | ✅ | ✅ |
| Left panel close/reopen, right panel close/reopen (independent) | ✅ | ✅ |
| Nav rail hide (‹) → floating ☰ appears → reopen | ✅ | ✅ |
| Camera presets floor1 / floor2 / ceo / entrance / top (all land) | ✅ | ✅ |
| Tap-to-info on Agent 1 | ✅ toast correct | ✅ toast correct (after fix; see §6) |
| Quality: PERFORMANCE, pixelRatio 0.85 (auto reduced scale), shadows off | ✅ | ✅ |
| Roof gone (`roofCheck` y 4.53) | ✅ | ✅ |
| No coin/stamina/gem HUD | ✅ | ✅ |
| Tap toast text | "Agent 1 · Research Lab · WORKING · SIMULATION · UNKNOWN · Belum terhubung ke platform" | same |

The tap-to-info toast is honest: activity is labelled SIMULATION and platform status UNKNOWN / "Belum terhubung ke platform" — no fabricated live data.

## 3. Typography problems identified

Three root causes, all verified by reading `js/materials.js` and measured in the running page (not guessed):

1. **No anisotropy (default 1).** Every sign texture was created with anisotropy 1. Signs are viewed at oblique angles, so without anisotropic filtering the text smears and shimmers — the main cause of the "blurry" complaint.
2. **No text auto-fit — two long signs clip at the edges.** At bold 42px, "DFNX PRIME · EXECUTIVE OFFICE" (28 chars, ~645px) and "GLASS VIEWING · OPERATIONS BELOW" (33 chars, ~760px) exceed the 592px inner width of the 600px canvas. The CEO nameplate ("DFNX PRIME · SUPREME DIRECTOR") clipped the same way. Screenshots confirm the clipped edges.
3. **Low canvas resolution (600×130).** 15 room/building signs + 9 character name tags shared this resolution. Measured before state: all five test signs 600×130, anisotropy 1.

HTML UI text (nav, panels, buttons) is vector text (Inter/system-ui) and is sharp on desktop and on the 390px viewport — the blur complaint is about 3D text only, not the HTML UI. The smallest HTML labels are 8–9px (`.ceo-card small`, `.eyebrow`, `.dir-note`); no CSS change was made to them.

## 4. Typography improvements implemented

In `rebuild-audit/js/materials.js` (`sign()` and `nameTag()` only):

- `sign()` canvas **600×130 → 1024×224** (same ~4.57:1 aspect, so the look is unchanged). Font starts at bold 84px and shrinks to a 28px floor until the text fits the 968px inner width — **no sign can clip any more**.
- `nameTag()` canvas **512×128 → 768×192**, font 44 → 66 with auto-fit to a 24px floor, and SRGB colorspace added (was missing).
- `tex.anisotropy = 8` on both (the driver clamps to its maximum, so this is safe on any GPU).
- Measured texture-memory cost: signs ~1.2 MB each with mipmaps (was ~0.4 MB) × 15 ≈ 18 MB (was ~6 MB); tags ~0.8 MB × 9 ≈ 7 MB (was ~3 MB). Total +~16 MB — acceptable for the readability gain, and texture count is unchanged (30 desktop / 26 mobile).
- Not every texture was blindly enlarged — only the two text texture types changed.

## 5. Before / after text screenshots

Six fixed camera positions via the new `__DIPA_DEBUG.setCamera` helper (`js/main.js`, test/verification only), so before and after are pixel-comparable. Files in `rebuild-audit/screenshots/`:

| Shot | Before | After |
|---|---|---|
| Fascia "DIPA NEXUS" | `typo-before-fascia.png` | `typo-after-fascia.png` |
| "RESEARCH LAB" | `typo-before-research.png` | `typo-after-research.png` |
| "COLLABORATION ROOM" | `typo-before-collab.png` | `typo-after-collab.png` |
| CEO nameplate | `typo-before-ceo-nameplate.png` | `typo-after-ceo-nameplate.png` |
| "DFNX PRIME · EXECUTIVE OFFICE" | `typo-before-exec-office.png` | `typo-after-exec-office.png` |
| "GLASS VIEWING · OPERATIONS BELOW" | `typo-before-glass-viewing.png` | `typo-after-glass-viewing.png` |

What the pairs show:

- The CEO nameplate now reads **"DFNX PRIME · SUPREME DIRECTOR" in full** — before it clipped to "…PRIME · SUPREME DIRE…".
- "EXECUTIVE LOUNGE" and "MANAGEMENT DECK" are visibly crisper after (sharper letter edges, more solid cyan).
- The "DIPA NEXUS" fascia is crisper after; the glass facade reads better (see §6, Phase 3).
- Texture proof (same five signs re-created in-page): before **600×130, anisotropy 1**; after **1024×224, anisotropy 8** — `verification-typo-before.json` / `verification-typo-after.json`, 0 errors both runs.
- The audit's own before/after shots (`a1-before-*.png` / `a1-after-*.png`, preset-based) agree with the precise pairs.

## 6. Desktop + mobile test results

Full audit runs: `verification-audit-before.json` (live, before) and `verification-audit-after.json` (dev build, after). Both viewports: **0 console errors, 0 page errors, 0 failed requests, 0 external requests.**

| Metric (audit window) | Before — desktop | After — desktop | Before — mobile | After — mobile |
|---|---|---|---|---|
| `__DIPA_READY` | true | true | true | true |
| Load | 10.3 s | 4.2–4.7 s | 8.2 s | 1.9 s |
| FPS avg (llvmpipe) | 1.8 | 2.0 | 4.7* | 10.2 |
| Draw calls | 303 | 279 | 258 | 238 |
| Triangles | 38,072 | 38,120 | 34,918 | 35,022 |
| Geometries | 168 | 167 | 140 | 139 |
| Textures / programs | 30 / 22 | 30 / 22 | 26 / 10 | 26 / 10 |

\* The before-run mobile FPS 4.7 was a sampling-window artifact of that script; the clean 12 s idle profile measured 11.63 (see §7).

**Mobile tap-to-info:** the before run could NOT prove it — the projected tap point fell under the left nav rail, so the click hit the nav and showed the nav toast instead of the agent toast. That is a harness artifact, not a product bug. The harness now hides the nav first on mobile; the after run proves the mobile tap: toast "Agent 1 · Research Lab · WORKING · SIMULATION · UNKNOWN · Belum terhubung ke platform", visible = true.

**Two harness bugs found and fixed during the audit (harness only, not the product):**

1. `verify-typo.js` first used `chromium.launch` with the Firefox binary — Chromium flags made Firefox never connect (launch timeout 180 s). Fixed to `firefox.launch` with the same `firefoxUserPrefs` as the other harnesses.
2. The audit's mobile typography branch clicked `#navCollapse` after the tap test had already hidden the nav — the hidden button is not clickable, so the run crashed. Fixed to click only when visible.

## 7. Actual performance measurements

Clean 12-second idle profiles (`profile-perf.js`, same harness both sides), before = live site, after = dev build:

| Metric | Before — desktop | After — desktop | Before — mobile | After — mobile |
|---|---|---|---|---|
| FPS avg (llvmpipe, 12 s idle) | 2.43 (min 1.4) | 2.35 (min 1.0) | 11.63 (min 10.8) | 12.35 (min 11.0) |
| Draw calls (avg) | 303 | **279 (−24, −8%)** | 258 | **238 (−20, −8%)** |
| Triangles | 38,072 | 38,048 | 34,942 | 35,094 |
| Geometries | 168 | 167 | 140 | 139 |
| Textures / programs | 30 / 22 | 30 / 22 | 26 / 10 | 26 / 10 |
| Errors | 0 | 0 | 0 | 0 |

**What was optimized (Phase 4, one change):** in `js/rig.js`, the character rig now merges meshes that share a material and never move independently of their joint group — eyes 2→1 mesh per rig, shin capsule + foot box 2→1 per leg. Animation still drives the joint groups, so poses are unaffected and the merged parts stay pickable. Expected −24 calls; measured exactly −24 desktop, −20 mobile.

**Honest reading:** llvmpipe FPS did not move measurably (2.43 → 2.35 desktop, 11.63 → 12.35 mobile — both inside run-to-run noise under software rendering). The draw-call reduction is the real, cross-device signal, and it dropped 8%. No claim is made that the phone will feel faster until the owner tests it on the Infinix HOT 11 — that is the real-device test and it is still pending.

**What is still heavy (unchanged):** characters are ~40% of draw calls (15/agent × 7 + 17 CEO ≈ 122 of 303 before); 15 signs; 11 workstation screens (each a cloned material for independent pulse — kept deliberately); fountain ~10; exterior ~15; shell 9 InstancedMesh; city 3–4. Adaptive quality still steps down automatically (PERFORMANCE, pixelRatio 0.85, shadows off) and the fountain pulse is never auto-disabled.

## 8. Horizontal campus architecture revision

`CAMPUS-REDESIGN-DESIGN.md` gained **§11 Reconciliation** and **§12 Helipad proposal** (no construction; no project file changed for the redesign itself).

**Floor-plan finding — verified:** a full re-search of all 62 media-library images, `~/workspace/user/files/`, and all of `~/workspace/dipa-hq/` confirms **no literal top-down 2D floor-plan / blueprint file exists in the workspace**. The Nov 15 23:35–23:42 and Nov 16 00:07 screenshots are Xingchi/Gemini API screenshots, not floor plans. The exact missing asset is **a top-down 2D floor-plan / blueprint image**. The owner is NOT asked to resend anything already available.

**References that DO exist and were reconciled against:**

1. `inspection/concept-approved.jpg` — the approved concept: isometric cutaway of the 2-floor building (Mission Control, Board Room, AI Research Lab, Operations Floor, Development Lab, Security Lab, Server Room, Lounge & Pantry; entrance with D logo; rooftop helipad + helicopter; fountain).
2. `references/office-01-idle-office-empire.jpg` — isometric office interior.
3. `references/office-02-office-tycoon.jpg` — isometric multi-room office.

**Preserved from the concept:** all 8 rooms and their functions (Mission Control → Main Operations Center; Board Room → Executive Pavilion; AI Research Lab → Research Lab; Operations Floor → Main Operations Center; Development Lab → Technology Lab; Security Lab → Security Operations; Server Room → Server Room; Lounge & Pantry → Lounge & Pantry); entrance with D logo + fountain directly in front; glass walls, neon palette, plants, dense desks; executive prominence (now the Executive Pavilion).

**Modified (and why):** executive cluster moves from floor 2 to ground-floor pavilions (horizontal expansion is the brief's primary architecture); footprint goes ~square stacked → ~52×22 flat so the default overview still fits a phone frame; rooftop helipad leaves the building (owner decision 2026-11-16 — see §9); stairs → central spine corridor; CEO office moves centre-top → far east end (the only second floor must cover nothing important); resource pills not reproduced (owner rule); agent statuses not reproduced as live data (honest SIMULATION/UNKNOWN labels only).

**Cannot be reproduced exactly:** the stacked two-floor cutaway look itself (that is what the owner asked to replace); the exact stacked adjacencies (e.g. Server Room under AI Research Lab in the concept → attached to Technology Lab in the campus — functional adjacency preserved, geometry necessarily different); the rooftop helipad on the building (removed by owner decision).

**From office-01/02:** preserved as interior-density references (busy desks, plants, sofas, varied furniture). Not preserved: the game HUDs (coins/gems — excluded per the owner's rule) and the single-room framing.

**Plan change:** the 52×22 Spine+Pavilion layout in §2 needed no change — the reconciliation confirms it already carries every concept room, the entrance/fountain relationship, and the visual language. The only plan change is the helipad marker (§9). `campus-plan.svg` + `campus-plan.png` re-rendered and visually verified (no text overlaps).

## 9. Character reference inventory

`~/workspace/dipa-hq/references/` — 9 images + `REFERENCES.md`:

| File | Character |
|---|---|
| `char-01-boy-black-tee.jpg` | Boy, black tee, grey trousers, sneakers, hands in pockets (front/side/back) — **Ref A** |
| `char-02-businessman-suit.jpg` | Man, black suit, red tie, brown briefcase |
| `char-03-boy-blue-hoodie.jpg` | Boy, blue hoodie, jeans (front/side/back) |
| `char-04-girl-black-cargo.jpg` | Girl, black cargo, white crop top |
| `char-05-businesswoman-suit.jpg` | Woman, grey suit, briefcase |
| `char-06-pair-black-outfits.jpg` | Pair: woman black jumpsuit + man black hoodie |
| `char-07-boy-white-hoodie.jpg` | Boy, white hoodie, black pants (front/side/back) |
| `office-01-idle-office-empire.jpg` | Isometric office interior (detail only; HUD excluded) |
| `office-02-office-tycoon.jpg` | Isometric office interior (detail only; HUD excluded) |

**Correction (found during the audit):** `char-01-boy-black-tee.jpg` was saved with the WRONG content — it contained a phone screenshot of the DIPA HQ site showing the "3D tidak dapat dimuat" error, not the character. The first Ref A prototype was therefore built from the written description only. The file has been corrected to the real character image (the file attached to the owner's first "referensi" message, 387×516), the error screenshot remains in the media library as an archive, and the correction is recorded in `REFERENCES.md`. The other eight files were verified against the owner's message attachments and are correct. The count still matches the 8 slots (7 agents + CEO), but **the mapping (who is CEO, who is Agent 1–7) is the owner's decision and has NOT been made**.

## 10. Prototype character progress — Ref A

**Status: built, refined against the real reference, verified, ready for owner review. Not in the live build; Agent 1–7 and CEO untouched.**

- Factory: `rebuild-audit/js/refa-prototype.js` (`buildRefAPrototype()`), reusing the exact `rig.js` joint structure + shared `createAnimator`, so Idle / Typing / Walking / Thinking all drive it. Standalone viewer: `rebuild-audit/prototype/refa.html` + `refa.js` (vendored local Three.js, no network/CDN). Note: `rebuild-audit/prototype/` is excluded from deployment.
- **Refinement pass (after the reference-file correction):** hair reworked to side-swept with volume (the real reference's signature — the first build had a flat fringe); torso shortened/boxier (tee hem at the waist, trousers start higher); sneaker soles dark → beige/tan; left-wrist watch added; trouser drawstring added. Joint structure unchanged.
- **Verification:** `verification-refa.json` — 0 console/page/request errors. Head ratio 0.74 / 2.298 = 32.2% (≈35% chibi target; the taller hair cap accounts for the difference).
- **Screenshots** (`rebuild-audit/prototype/`): `prototype-refa-front.png`, `prototype-refa-side.png`, `prototype-refa-three-quarter.png`, `prototype-refa-walking.png` (walk cycle mid-stride), `prototype-refa-typing.png`. All at the same camera distance (4.2), character centred.
- **Remaining deltas vs the real reference** (documented in `prototype/REFA-NOTE.md`): hair has no strand texture / parting line / highlight streaks; face is the generic minimal style (no big round highlighted eyes, eyebrows, blush); no fabric folds/creases/cuffs; sneakers lack the chunky sole profile and laces; hands-in-pockets is still approximated — a truly literal pocket pose needs an elbow joint (a rig change to make once, deliberately, before building Refs B–G, if the owner approves the style).
- The other seven characters were NOT built. No identities or positions were assigned.

## 11. Remaining problems

1. **Real-device test still pending.** All mobile numbers are 390px-viewport tests under llvmpipe. The owner's Infinix HOT 11 is the real judge of whether the site now feels lighter — the 8% draw-call reduction is measured, but no speed improvement is claimed until the owner tests it.
2. **Mobile default view is cramped.** On 390px both side panels open at once and cover most of the 3D view (`a1-before-mobile-default.png`). The panels can be closed, but the first impression on a phone is panels, not the building. Worth a mobile-first layout pass (not in this audit's scope).
3. **The site must be opened via its Pages URL.** Opening `index.html` from the file manager fails with "3D tidak dapat dimuat" (ES modules cannot load from `file://`/`content://`). Nothing to fix in the build; the owner should always use https://lugatiogege-oss.github.io/dipa-hq/.
4. **Phase 4 (Environment) has not started** — it is gated on the owner's approval of the Phase 3 revision, which has not been given yet.
5. **Owner decisions still open:** approve the campus design; which reference is CEO; ref → Agent 1–7 mapping; pilot rig Ref A (approve the prototype style?); final room names/functions; timing (build the campus now vs finish current-build items first); helipad proposal approval.
6. **Hands-in-pockets needs an elbow joint** for a literal pocket pose (see §10) — a deliberate rig change, only if the owner approves the Ref A style.
7. **No 2D floor plan exists** (see §8) — the exact missing asset is a top-down 2D floor-plan / blueprint image, if the owner ever wants one drawn.

## 12. Deployment URL

**https://lugatiogege-oss.github.io/dipa-hq/**

Deployed from the audited dev build (`rebuild-audit/` minus `screenshots/`, `media/`, `prototype/`, and the prototype-only `js/refa-prototype.js`). Commit on top of main, no force-push. Post-deploy live re-verification: see §6/§7 numbers for the dev build; the live URL was re-checked after the Pages build (HTTP 200, `__DIPA_READY=true`, 0 errors — see `live-check-audit.json`).

---

*Checkpoint: `checkpoints/pre-audit-20261116/` (145 files). Dev build: `rebuild-audit/`. Evidence: `rebuild-audit/verification-audit-before.json`, `verification-audit-after.json`, `verification-typo-before.json`, `verification-typo-after.json`, `profile-before.json`, `profile-after.json`, `screenshots/`.*
