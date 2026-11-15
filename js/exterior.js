// DIPA HQ — exterior.js
// Outside the building: rooftop helipad + helicopter, fountain, garden,
// entrance canopy/columns/steps and the D identity.
// Nothing here is removed without a technical reason (owner affirmation §2).
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
  // ---------- Rooftop helipad + helicopter (roof right side) ----------
  const pad = new THREE.Group();
  pad.position.set(5.5, 8.16, -2.5);
  scene.add(pad);
  cyl(pad, 3.1, 3.1, 0.14, M.deep, 0, 0.07, 0, 40);
  cyl(pad, 2.9, 2.9, 0.05, new THREE.MeshStandardMaterial({ color: 0x1c3346, roughness: 0.5 }), 0, 0.16, 0, 40);
  // yellow ring + H marking (canvas texture on a circle plane)
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = '#ffd94d'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(128, 128, 112, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffd94d';
  ctx.fillRect(88, 58, 18, 140); ctx.fillRect(150, 58, 18, 140); ctx.fillRect(88, 119, 80, 18);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const hMark = new THREE.Mesh(
    new THREE.CircleGeometry(2.85, 40),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  hMark.rotation.x = -Math.PI / 2;
  hMark.position.y = 0.2;
  pad.add(hMark);
  // neon ring around the pad (own material clone so the environment
  // animator can pulse it without touching other violet-glow objects)
  const ringMat = M.violetGlow.clone();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.15, 0.05, 8, 48),
    ringMat,
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.22;
  pad.add(ring);

  // Helicopter (static in Phase 2; rotor animation is Phase 3)
  const heli = new THREE.Group();
  heli.position.set(5.5, 9.0, -2.5);
  heli.rotation.y = -0.5;
  scene.add(heli);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 1.6, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x93a9c4, metalness: 0.55, roughness: 0.35 }));
  body.rotation.z = Math.PI / 2;
  body.position.y = 0.5;
  body.castShadow = true;
  heli.add(body);
  const nose = sphere(heli, 0.7, M.glass, 1.35, 0.55, 0, 1, 0.9, 0.9);
  nose.material = M.glass;
  // tail boom + tail rotor
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.3, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x93a9c4, metalness: 0.55, roughness: 0.35 }));
  boom.rotation.z = Math.PI / 2;
  boom.position.set(-2.0, 0.65, 0);
  boom.castShadow = true;
  heli.add(boom);
  const tailFin = box(heli, 0.08, 0.9, 0.5, M.violet, -3.2, 0.9, 0, { shadow: false });
  // tail rotor spins around the boom (x) axis
  const rotorTail = new THREE.Group();
  rotorTail.position.set(-3.3, 0.9, 0.25);
  heli.add(rotorTail);
  box(rotorTail, 0.05, 1.1, 0.08, M.silver, 0, 0, 0, { shadow: false });
  // main rotor mast + blades (blades live in a spinning group)
  cyl(heli, 0.09, 0.09, 0.5, M.silver, 0, 1.5, 0, 8);
  const rotorMain = new THREE.Group();
  rotorMain.position.set(0, 1.78, 0);
  heli.add(rotorMain);
  box(rotorMain, 5.6, 0.05, 0.28, M.silver, 0, 0, 0, { shadow: false });
  box(rotorMain, 0.28, 0.05, 5.6, M.silver, 0, 0, 0, { shadow: false });
  // skids
  for (const dz of [-0.6, 0.6]) {
    const skid = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), M.silver);
    skid.rotation.z = Math.PI / 2;
    skid.position.set(0, -0.35, dz);
    heli.add(skid);
  }
  // cabin accent stripe + nav lights
  box(heli, 1.9, 0.12, 0.1, M.cyanGlow, 0.2, 0.85, 0.82, { shadow: false });
  sphere(heli, 0.06, M.cyanGlow, 1.9, 0.6, 0, 1, 1, 1);
  // Perf fix: the helicopter point light is dropped (roof is dark anyway;
  // the pad neon ring + city lights keep the silhouette readable).

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
    rotorMain, rotorTail,
    fountain: { jet, crown, sideL: sideJets[0], sideR: sideJets[1], water: M.water },
    neonRing: ring,
    entranceGlow,
  };
}
