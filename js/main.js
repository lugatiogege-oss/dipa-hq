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
import { loadQuality, saveQuality, applyQuality, QUALITY } from './performance.js';
import { toast, initPanels, initNav, initBottomBar, initCameraButtons, initSettings, setRoutine } from './ui.js';
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
    rotorMain: ext.rotorMain, rotorTail: ext.rotorTail,
    fountain: ext.fountain, neonRing: ext.neonRing, entranceGlow: ext.entranceGlow,
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
  initSettings(qualityLevel, (level) => {
    applyQuality(renderer, level);
    saveQuality(level);
  });

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

  app = { sceneCtx, cam, ceo, dayNight, interiorLights, renderer, controls, activity, environment, actors, ceoActor, pickables };
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
  window.__DIPA_PERF = { calls: 0, triangles: 0, geometries: 0 };

  // --- Debug / verification API (no user-facing function; proves the
  // architecture is config-driven and lets the harness force poses) ---
  window.__DIPA_DEBUG = {
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
      window.__DIPA_PERF = { calls: info.calls, triangles: info.triangles, geometries: app.renderer.info.memory.geometries };
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
