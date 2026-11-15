// DIPA HQ — main.js
// Bootstrap: builds the scene from separated components, wires UI, runs the
// render loop. Errors are surfaced (loading overlay / error panel) — never a
// silent black screen (Phase 1 finding T1/T4).
//
// Phase 3 wiring: jointed character rigs (rig.js) + animation engine
// (animation.js) + agent activity system (activity.js) + CEO behaviour
// controller (ceo.js) + environment animation (environment.js), all
// delta-time based. Identity is config-driven (config.js) — see README.
import * as THREE from 'three';
import { createScene } from './scene.js';
import { buildShell } from './building.js';
import { buildFloor1 } from './floor1.js';
import { buildFloor2 } from './floor2.js';
import { buildExterior } from './exterior.js';
import { buildCharacters, setAgentName, setCEOName } from './characters.js';
import { createCEOController } from './ceo.js';
import { createDayNight } from './lighting.js';
import { createCameraController } from './camera.js';
import { renderDirectory, updateActivities } from './status.js';
import { createActivitySystem } from './activity.js';
import { createEnvironment } from './environment.js';
import { loadQuality, saveQuality, applyQuality, QUALITY, nextLowerQuality } from './performance.js';
import { toast, initPanels, initNav, initBottomBar, initCameraButtons, initSettings, setRoutine, markQuality } from './ui.js';
import { AGENTS, CEO } from './config.js';

const loader = document.getElementById('loader');
const loadError = document.getElementById('loadError');

// Directory row click handler (module scope: also used by the debug API).
const dirSelect = (label) => toast(label + ' · NOT CONNECTED · LIVE STATUS NOT AVAILABLE');

function showError(msg) {
  if (loader) loader.style.display = 'none';
  if (loadError) {
    loadError.style.display = 'block';
    loadError.querySelector('.err-msg').textContent = msg;
  }
  console.error('[DIPA HQ]', msg);
}

window.addEventListener('error', (e) => {
  if (!window.__DIPA_READY) showError('Gagal memuat aplikasi 3D: ' + (e.message || 'error tidak diketahui'));
});
window.addEventListener('unhandledrejection', (e) => {
  if (!window.__DIPA_READY) showError('Gagal memuat modul 3D: ' + (e.reason?.message || e.reason || 'error tidak diketahui'));
});

let app;
try {
  const qualityLevel = loadQuality();
  const quality = QUALITY[qualityLevel];

  const host = document.getElementById('scene');
  const sceneCtx = createScene(host, quality);
  const { scene, camera, renderer, controls } = sceneCtx;

  buildShell(scene);
  const f1 = buildFloor1(scene);
  const f2 = buildFloor2(scene);
  const ext = buildExterior(scene);
  const { actors, pickables, ceoActor } = buildCharacters(scene);
  const ceo = createCEOController(ceoActor, setRoutine);
  const dayNight = createDayNight(sceneCtx);
  const cam = createCameraController(camera, controls);
  const interiorLights = [...f1.accentLights, ...f2.accentLights];

  // --- Phase 3 systems ---
  const activity = createActivitySystem(actors, (id, state) => {
    updateActivities({ [id]: state });
  });
  const environment = createEnvironment({
    fountain: ext.fountain, entranceGlow: ext.entranceGlow,
    cityMats: sceneCtx.cityMats,
    screens: [...f1.screens, ...f2.screens],
    globe: f1.globe, doors: f1.doors,
  });

  // --- UI ---
  renderDirectory(dirSelect);
  updateActivities(activity.getAll());
  initPanels();
  initNav(cam);
  initBottomBar(cam);
  initCameraButtons(cam);
  // Perf fix: manual quality change goes through app.applyQualityLevel
  // (defined in the if (app) block below) so the adaptive state, the
  // render scale and the pulse effects stay in sync.
  initSettings(qualityLevel, (level) => { if (app) app.applyQualityLevel(level, false); });

  // --- Character tap (toast, non-blocking — v2.2's alert() is not used) ---
  const ray = new THREE.Raycaster();
  const pt = new THREE.Vector2();
  let downX = 0, downY = 0;
  renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return; // it was a drag
    pt.x = (e.clientX / innerWidth) * 2 - 1;
    pt.y = -(e.clientY / innerHeight) * 2 + 1;
    ray.setFromCamera(pt, camera);
    const hits = ray.intersectObjects(pickables, false);
    if (!hits.length) return;
    let o = hits[0].object;
    while (o.parent && !actors.some(a => a.g === o)) o = o.parent;
    const a = actors.find(x => x.g === o);
    if (!a) return;
    toast(a.isCEO
      ? a.name + ' · SUPREME DIRECTOR · ' + (ceo.isSleeping() ? 'Tidur (00:00–07:00 WIB)' : ceo.getRoutine())
      : a.name + ' · ' + a.room + ' · ' + (activity.getActivity(a.id) || 'UNKNOWN') + ' · SIMULATION · UNKNOWN · Belum terhubung ke platform');
  });

  app = {
    sceneCtx, cam, ceo, dayNight, interiorLights, renderer, controls, activity, environment, actors, ceoActor, pickables,
    // Perf fix: adaptive quality state (see applyQualityLevel below).
    adaptive: { level: qualityLevel, lowSeconds: 0, reducedScale: false },
  };
} catch (err) {
  showError(err.message || String(err));
}

if (app) {
  const clock = new THREE.Clock();
  let firstFrame = true;

  // --- FPS meter (Phase 3: real measurement, not a claim) ---
  let fpsFrames = 0, fpsTime = 0;
  const fpsSamples = [];
  window.__DIPA_FPS = { current: 0, avg: 0, min: 0, samples: 0 };
  window.__DIPA_PERF = { calls: 0, triangles: 0, geometries: 0, textures: 0, programs: 0 };

  // --- Perf fix: adaptive quality -----------------------------------------
  // If FPS stays low, step down automatically (ULTRA -> BALANCED ->
  // PERFORMANCE) and, as a last resort on PERFORMANCE, drop the render
  // scale to 0.85. Pulse effects (fountain, neon, city twinkle, screens)
  // are NEVER disabled automatically: the fountain is a required feature
  // and freezing it was a regression found in verification (fountainJet
  // frozen at 0.8695 while the last-resort step ran under llvmpipe).
  // The shown level in the settings menu is always updated, so the state
  // stays honest.
  // Never steps back up on its own (avoids oscillation); the owner can
  // raise it manually in Settings.
  app.applyQualityLevel = (level, auto) => {
    const ad = app.adaptive;
    ad.level = level;
    ad.lowSeconds = 0;
    ad.reducedScale = false;
    app.environment.setPulseEnabled(true);
    applyQuality(app.renderer, level);
    saveQuality(level);
    markQuality(level);
    if (auto) toast('Kualitas grafis diturunkan otomatis ke ' + level + ' agar lebih lancar');
  };

  // --- Debug / verification API (no user-facing function; proves the
  // architecture is config-driven and lets the harness force poses) ---
  window.__DIPA_DEBUG = {
    quality: () => ({
      level: app.adaptive.level,
      pixelRatio: app.renderer.getPixelRatio(),
      shadows: app.renderer.shadowMap.enabled,
      reducedScale: app.adaptive.reducedScale,
      auto: true,
    }),
    activities: () => app.activity.getAll(),
    positions: () => Object.fromEntries(app.actors.map(a => [a.id, {
      x: +a.g.position.x.toFixed(2), z: +a.g.position.z.toFixed(2), activity: a.activity,
    }])),
    setActivity: (id, state) => app.activity.setActivity(id, state),
    resumeActivity: (id) => app.activity.resume(id),
    ceoBehaviour: () => app.ceo.getBehaviour(),
    setCEOBehaviour: (name) => app.ceo.setBehaviour(name),
    clearCEOForced: () => app.ceo.clearForced(),
    setCEOHour: (h) => app.ceo.setHour(h),
    clearCEOHour: () => app.ceo.clearHour(),
    env: () => app.environment.getState(),
    // Open-top proof (roof removed 2026-11-16): cast a ray straight down
    // through the building centre (x 0, z 0 — the glass viewing strip).
    // With the roof it hit the roof slab at y ~8.1; without it the first
    // hit is the floor-2 interior (glass viewing floor / railing, y ~4.5).
    roofCheck: () => {
      const rc = new THREE.Raycaster(new THREE.Vector3(0, 30, 0), new THREE.Vector3(0, -1, 0));
      rc.camera = app.sceneCtx.camera; // required: character name tags are Sprites, Sprite.raycast needs a camera
      const hits = rc.intersectObjects(app.sceneCtx.scene.children, true)
        .filter(h => !h.object.isSprite); // ignore floating name tags
      return hits.length ? { y: +hits[0].point.y.toFixed(2) } : null;
    },
    setAgentName: (id, name) => {
      const a = app.actors.find(x => x.id === id);
      if (!a || a.isCEO) return false;
      const entry = AGENTS.find(x => x.id === id);
      if (entry) entry.name = name; // config is the source of truth
      setAgentName(a, name);
      renderDirectory(dirSelect);
      updateActivities(app.activity.getAll());
      return true;
    },
    setCEOName: (name, title) => {
      if (name) CEO.name = name;
      if (title) CEO.title = title;
      return setCEOName(app.ceoActor, CEO.name, CEO.title);
    },
    // Picking diagnostics: project a world point to screen pixels, and
    // report how many meshes are raycast-pickable.
    pickCount: () => app.pickables.length,
    cameraPos: () => ({
      pos: app.sceneCtx.camera.position.toArray().map(n => +n.toFixed(2)),
      target: app.controls.target.toArray().map(n => +n.toFixed(2)),
    }),
    project: (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(app.sceneCtx.camera);
      return {
        x: +(((v.x + 1) / 2) * innerWidth).toFixed(1),
        y: +(((1 - v.y) / 2) * innerHeight).toFixed(1),
        behind: v.z > 1,
      };
    },
  };

  function animate() {
    requestAnimationFrame(animate);
    // rawDt (real elapsed time) drives the camera tween so focus moves
    // converge in wall-clock time even on slow/software renderers.
    // (Before this fix the tween advanced per-frame, so at ~3 fps a
    // focus move was still mid-flight after 2 s.)
    const rawDt = clock.getDelta();
    // dtAnim drives animation/activity/CEO/environment. Cap 0.5 s (not
    // 0.05): on a 60 fps device dt is ~0.016 so the cap never bites, but
    // on a very slow/software renderer (0.5 fps here) a 0.05 cap would
    // run the whole simulation at 1/40 real speed and nothing would
    // visibly move between screenshots. 0.5 s bounds any single-frame
    // jump (walk <= 0.6 units/frame) while keeping motion observable.
    const dtAnim = Math.min(rawDt, 0.5);
    const elapsed = clock.elapsedTime;
    const env = app.dayNight.update(app.interiorLights);
    app.activity.update(dtAnim, elapsed);
    const ceoState = app.ceo.update(dtAnim, env.h, elapsed);
    setRoutine(ceoState.routine);
    app.environment.update(dtAnim, elapsed);
    app.cam.update(Math.min(rawDt, 0.5));
    app.controls.update();
    app.renderer.render(app.sceneCtx.scene, app.sceneCtx.camera);

    // FPS accounting (1 s windows)
    fpsFrames++;
    fpsTime += rawDt;
    if (fpsTime >= 1) {
      const fps = fpsFrames / fpsTime;
      fpsSamples.push(fps);
      if (fpsSamples.length > 30) fpsSamples.shift();
      window.__DIPA_FPS = {
        current: Math.round(fps * 10) / 10,
        avg: Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length * 10) / 10,
        min: Math.round(Math.min(...fpsSamples) * 10) / 10,
        samples: fpsSamples.length,
      };
      const info = app.renderer.info.render;
      window.__DIPA_PERF = {
        calls: info.calls, triangles: info.triangles,
        geometries: app.renderer.info.memory.geometries,
        textures: app.renderer.info.memory.textures,
        programs: app.renderer.info.programs ? app.renderer.info.programs.length : 0,
      };
      // Adaptive step-down: sustained low FPS -> lower quality.
      // Thresholds are wall-clock FPS on the real device; under the
      // llvmpipe verifier (~0.5 fps) this fires promptly by design.
      const ad = app.adaptive;
      if (fps < 20) {
        ad.lowSeconds++;
        if (ad.lowSeconds >= 3) {
          const lower = nextLowerQuality(ad.level);
          if (lower) {
            app.applyQualityLevel(lower, true);
          } else if (!ad.reducedScale && fps < 15) {
            ad.reducedScale = true;
            app.renderer.setPixelRatio(0.85);
            // Pulse effects deliberately NOT disabled here: fountain/neon/
            // city/screens must keep moving (required feature).
            toast('Mode hemat diaktifkan otomatis agar lebih lancar');
          }
          ad.lowSeconds = 0;
        }
      } else {
        ad.lowSeconds = 0;
      }
      fpsFrames = 0;
      fpsTime = 0;
    }

    if (firstFrame) {
      firstFrame = false;
      window.__DIPA_READY = true;
      if (loader) loader.style.display = 'none';
    }
  }
  animate();
}
