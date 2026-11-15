// DIPA HQ — exterior.js
// Outside the building: fountain, garden, entrance canopy/columns/steps
// and the D identity.
// NOTE (owner 2026-11-16 ~02:55 WIB): the rooftop helipad + helicopter
// were REMOVED entirely — the roof is gone (open-top dollhouse) and the
// helicopter on top was distracting. Not relocated, no replacement.
// Nothing else here is removed without a technical reason (owner affirmation §2).
import * as THREE from 'three';
import { M, box, cyl, sphere, glowLight, instancedGeo } from './materials.js';

// Perf fix: trees/bushes were 3 meshes each (~35). Collected into
// instanced sets, flushed at the end of buildExterior.
const EX = { trunks: [], crowns: [] };
function tree(parent, x, z, s = 1) {
  EX.trunks.push({ x, y: 0.55 * s - 0.3, z, sx: 0.19 * s, sy: 1.1 * s, sz: 0.19 * s });
  EX.crowns.push({ x, y: 1.5 * s - 0.3, z, sx: 0.75 * s, sy: 0.94 * s, sz: 0.75 * s });
  EX.crowns.push({ x: x + 0.45 * s, y: 1.1 * s - 0.3, z: z + 0.2 * s, sx: 0.5 * s, sy: 0.5 * s, sz: 0.5 * s });
}

export function buildExterior(scene) {
  // ---------- NO HELIPAD / NO HELICOPTER (owner 2026-11-16) ----------
  // The rooftop helipad + helicopter used to live here. Removed with the
  // roof — not relocated, no replacement.

  // ---------- Fountain (front centre, z ~11.5) ----------
  const fount = new THREE.Group();
  fount.position.set(0, -0.7, 11.5);
  scene.add(fount);
  // pool rim + water
  box(fount, 7, 0.5, 3.5, M.silver, 0, 0.25, 0);
  box(fount, 6.4, 0.4, 2.9, M.water, 0, 0.35, 0, { shadow: false });
  // central jet pedestal + water column + crown
  cyl(fount, 0.5, 0.7, 0.5, M.silver, 0, 0.7, 0, 16);
  const jet = cyl(fount, 0.12, 0.2, 1.4, M.water, 0, 1.5, 0, 10);
  const crown = sphere(fount, 0.45, M.water, 0, 2.25, 0, 1.4, 0.7, 1.4);
  // side jets
  const sideJets = [];
  for (const dx of [-2.2, 2.2]) {
    sideJets.push(cyl(fount, 0.07, 0.12, 0.9, M.water, dx, 1.0, 0, 8));
    sphere(fount, 0.28, M.water, dx, 1.5, 0, 1.3, 0.6, 1.3);
  }
  glowLight(scene, 0x35c8f0, 1.4, 0, 0.8, 11.5, 10);
  // neon rim around the pool
  box(fount, 7.1, 0.06, 0.06, M.cyanGlow, 0, 0.55, 1.78, { shadow: false });
  box(fount, 7.1, 0.06, 0.06, M.cyanGlow, 0, 0.55, -1.78, { shadow: false });
  box(fount, 0.06, 0.06, 3.6, M.cyanGlow, 3.55, 0.55, 0, { shadow: false });
  box(fount, 0.06, 0.06, 3.6, M.cyanGlow, -3.55, 0.55, 0, { shadow: false });

  // ---------- Garden strips (both sides) + front planters ----------
  for (const x of [-13.5, 13.5]) {
    box(scene, 4, 0.12, 9, new THREE.MeshStandardMaterial({ color: 0x203c39, roughness: 0.9 }), x, -0.72, 1);
    for (let j = 0; j < 3; j++) tree(scene, x + (j % 2 ? 1 : -1), -2.5 + j * 3.2, 0.9 + j * 0.15);
    for (let k = 0; k < 4; k++) EX.crowns.push({ x: x + (k % 2 ? 1.2 : -1.2), y: -0.35, z: -3.5 + k * 2.4, sx: 0.4, sy: 0.28, sz: 0.4 });
  }
  // front planters flanking the entrance walkway
  for (const x of [-6.5, 6.5]) {
    box(scene, 2.2, 0.4, 1.0, M.deep, x, -0.5, 8.2);
    for (let k = 0; k < 3; k++) EX.crowns.push({ x: x - 0.6 + k * 0.6, y: -0.05, z: 8.2, sx: 0.32, sy: 0.29, sz: 0.32 });
  }
  // walkway from road to entrance
  box(scene, 4.5, 0.06, 3.5, new THREE.MeshStandardMaterial({ color: 0x2a4456, roughness: 0.7 }), 0, -0.72, 9.6, { shadow: false });

  // ---------- Entrance canopy, columns, steps, D logo ----------
  box(scene, 5.5, 0.18, 2.0, M.deep, 0, 3.65, 8.2);
  box(scene, 5.5, 0.05, 2.0, M.cyanGlow, 0, 3.56, 9.15, { shadow: false });
  for (const x of [-2.4, 2.4]) {
    box(scene, 0.18, 3.6, 0.18, M.cyan, x, 1.8, 8.9);
    box(scene, 0.3, 0.15, 0.3, M.silver, x, 0.05, 8.9);
  }
  // steps up to the entrance
  for (let i = 0; i < 3; i++) box(scene, 5.0 - i * 0.5, 0.14, 0.8, M.silver, 0, -0.5 + i * 0.14, 7.6 + i * 0.45);
  // D logo on the canopy fascia
  const dc = document.createElement('canvas');
  dc.width = 128; dc.height = 128;
  const dctx = dc.getContext('2d');
  dctx.clearRect(0, 0, 128, 128);
  dctx.strokeStyle = '#56dfff'; dctx.lineWidth = 9;
  dctx.beginPath(); dctx.moveTo(38, 18); dctx.lineTo(38, 110); dctx.lineTo(72, 110);
  dctx.arc(72, 64, 46, -Math.PI / 2, Math.PI / 2); dctx.lineTo(38, 18); dctx.stroke();
  const dTex = new THREE.CanvasTexture(dc);
  dTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: dTex, transparent: true }),
  );
  logo.position.set(0, 3.65, 9.22);
  scene.add(logo);
  const entranceGlow = glowLight(scene, 0x56dfff, 0.8, 0, 2.8, 8.6, 8);

  // --- Emit instanced garden parts (was ~35 meshes) ---
  instancedGeo(scene, new THREE.CylinderGeometry(1, 1, 1, 8), M.wood, EX.trunks);
  instancedGeo(scene, new THREE.SphereGeometry(1, 12, 10), M.plant, EX.crowns);

  return {
    fountain: { jet, crown, sideL: sideJets[0], sideR: sideJets[1], water: M.water },
    entranceGlow,
  };
}
