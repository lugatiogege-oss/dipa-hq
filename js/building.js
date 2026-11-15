// DIPA HQ — building.js
// The building shell: foundation, TWO FULL floors (not a mezzanine),
// glass walls, columns/beams, roof, staircase and glass railings.
// Floor 2 is the same footprint as Floor 1 (21.3 × 13.3) — Phase 1 found
// v3's half-depth second floor read as a mezzanine; that is fixed here.
//
// Perf fix: the shell used to be ~200 separate box meshes (one draw call
// each). Static boxes are now collected per material and emitted as ONE
// InstancedMesh per material (~9 draw calls for the whole shell).
// Positions/sizes are identical to the pre-fix build.
import * as THREE from 'three';
import { LAYOUT } from './config.js';
import { M, box, beam, sign, instancedBoxes } from './materials.js';

export function buildShell(scene) {
  const W = LAYOUT.width, D = LAYOUT.depth;
  const hw = W / 2, hd = D / 2;

  // Per-material collectors: { x, y, z, sx, sy, sz } (unit box scaled).
  const C = { cyan: [], violet: [], silver: [], deep: [], floor: [], floorAlt: [], glass: [], glassDark: [], cyanGlow: [] };
  const b = (mat, w, h, d, x, y, z) => C[mat].push({ x, y, z, sx: w, sy: h, sz: d });

  // --- Foundation + plinth ---
  b('deep', 23, 0.5, 15, 0, -0.05, 0);
  b('silver', 21.8, 0.18, 13.8, 0, 0.28, 0);
  box(scene, 21.3, 0.12, 13.3, new THREE.MeshStandardMaterial({ color: 0xc8d8df, roughness: 0.24, metalness: 0.2 }), 0, 0.42, 0);

  // --- Floor 1 polished floor panels ---
  for (let x = -9; x <= 9; x += 3) {
    b(x % 2 ? 'floorAlt' : 'floor', 2.95, 0.018, 12.6, x, 0.5, 0);
  }

  // --- Floor 1 glass walls (front/back/left/right) + cyan mullions ---
  for (const x of [-hw, hw]) b('glass', 0.12, 3.6, D - 0.2, x, 2.35, 0);
  for (const z of [-hd, hd]) b('glass', W - 0.2, 3.6, 0.12, 0, 2.35, z);
  for (let x = -10; x <= 10; x += 2.1) {
    b('cyan', 0.07, 3.6, 0.09, x, 2.35, -hd + 0.1);
    b('cyan', 0.07, 3.6, 0.09, x, 2.35, hd - 0.1);
  }
  for (let z = -6; z <= 6; z += 2.15) {
    b('cyan', 0.07, 3.6, 0.09, -hw + 0.1, 2.35, z);
    b('cyan', 0.07, 3.6, 0.09, hw - 0.1, 2.35, z);
  }
  // back wall (solid, behind the glass) + floor 1 ceiling beams
  box(scene, W, 0.18, 0.18, M.navy, 0, 2.3, -hd + 0.02);
  for (const x of [-10.6, -5.3, 0, 5.3, 10.6]) b('cyan', 0.16, 0.18, 13.3, x, 4.2, 0);
  for (const z of [-6.6, 0, 6.6]) b('cyan', 21.2, 0.18, 0.16, 0, 4.2, z);

  // --- Floor 1 room partitions (glass dark, with door gaps) ---
  b('glassDark', 0.1, 3.15, 4.5, -3, 2.2, -4.25);
  b('glassDark', 0.1, 3.15, 4.5, 4, 2.2, -4.25);
  b('glassDark', 9.5, 2.8, 0.09, -5.75, 2.1, -2);
  b('glassDark', 9.5, 2.8, 0.09, 5.75, 2.1, -2);
  b('glassDark', 0.1, 3.15, 8.5, -4, 2.2, 2.25);
  b('glassDark', 0.1, 3.15, 8.5, 4, 2.2, 2.25);
  b('glassDark', 6.5, 2.8, 0.09, -7.25, 2.1, 2);
  b('glassDark', 6.5, 2.8, 0.09, 7.25, 2.1, 2);

  // --- Floor 2 slab: FULL footprint, with a glass viewing strip ---
  b('deep', W - 0.2, 0.28, 4.5, 0, 4.48, -4.25);
  b('floorAlt', W - 0.5, 0.1, 4.2, 0, 4.65, -4.25);
  b('deep', 9.5, 0.28, 8.5, -5.75, 4.48, 2.25);
  b('floor', 9.2, 0.1, 8.2, -5.75, 4.65, 2.25);
  b('deep', 6.5, 0.28, 8.5, 7.25, 4.48, 2.25);
  b('floorAlt', 6.2, 0.1, 8.2, 7.25, 4.65, 2.25);
  b('deep', 5, 0.28, 6, 1.5, 4.48, 3.5);
  b('floor', 4.7, 0.1, 5.7, 1.5, 4.65, 3.5);
  // Glass viewing floor over Floor 1 (x -1..4, z -2..0.5) — unique material, keep single
  box(scene, 5, 0.06, 2.5, M.glassFloor, 1.5, 4.5, -0.75, { shadow: false });
  // Railing around the viewing strip
  for (let x = -1; x <= 4; x += 1.25) b('cyan', 0.06, 1.0, 0.06, x, 5.15, 0.55);
  b('glass', 5, 0.06, 0.06, 1.5, 5.65, 0.55);
  b('glass', 0.06, 1.0, 2.5, -1, 5.15, -0.75);
  b('glass', 0.06, 1.0, 2.5, 4, 5.15, -0.75);

  // --- Floor 2 glass walls + violet mullions (full depth) ---
  for (const x of [-hw, hw]) b('glass', 0.12, 3.2, D - 0.2, x, 6.25, 0);
  b('glass', W - 0.2, 3.2, 0.12, 0, 6.25, -hd);
  b('glass', W - 0.2, 3.2, 0.12, 0, 6.25, hd);
  for (let x = -10; x <= 10; x += 2) {
    b('violet', 0.07, 3.1, 0.08, x, 6.25, -hd + 0.08);
    b('violet', 0.07, 3.1, 0.08, x, 6.25, hd - 0.08);
  }
  // Floor 2 partitions
  b('glassDark', 0.1, 2.8, 4.5, -1, 6.1, -4.25);
  b('glassDark', 9.5, 2.8, 0.09, -5.75, 6.1, -2);
  b('glassDark', 9.5, 2.8, 0.09, 5.75, 6.1, -2);
  b('glassDark', 0.1, 2.8, 8.5, -1, 6.1, 2.25);
  // Roof outline beams (violet) + roof slab (thin, full footprint)
  for (const x of [-10.6, 0, 10.6]) b('violet', 0.18, 0.18, 13.4, x, 7.9, 0);
  for (const z of [-6.6, 6.6]) b('violet', 21.2, 0.18, 0.18, 0, 7.9, z);
  b('deep', W, 0.18, D, 0, LAYOUT.roofY, 0);
  b('floorAlt', W - 0.4, 0.06, D - 0.4, 0, LAYOUT.roofY + 0.12, 0);

  // --- Structural columns (both floors, corners + mids) ---
  for (const [x, z] of [[-10.4, -6.4], [10.4, -6.4], [-10.4, 6.4], [10.4, 6.4], [0, -6.4], [0, 6.4], [-5.2, -6.4], [5.2, -6.4], [-5.2, 6.4], [5.2, 6.4]]) {
    b('silver', 0.22, 7.4, 0.22, x, 4.2, z);
    b('cyan', 0.06, 7.4, 0.06, x + 0.14, 4.2, z);
  }

  // --- Staircase, right side: floor 1 (9, 5.0) up to floor 2 (9, -1.0) ---
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const y = 0.65 + i * 0.28;
    const z = 5.0 - i * 0.4;
    b('silver', 1.4, 0.16, 0.55, 9.0, y, z);
    b('cyanGlow', 1.4, 0.03, 0.5, 9.0, y + 0.09, z);
  }
  // stair rails (glass + cyan handrail)
  beam(scene, [8.3, 0.8, 5.2], [8.3, 4.9, -1.2], 0.045, M.cyan);
  beam(scene, [9.7, 0.8, 5.2], [9.7, 4.9, -1.2], 0.045, M.cyan);
  // landing railing on floor 2 around the stair opening
  for (let x = 8.2; x <= 9.8; x += 0.8) b('cyan', 0.06, 1.0, 0.06, x, 5.15, -1.2);
  b('glass', 1.8, 0.06, 0.06, 9.0, 5.65, -1.2);

  // --- Building fascia sign (on the roof front edge — clear of beams) ---
  sign(scene, 'DIPA NEXUS', 0, 8.05, 6.72, '#62e5ff', 4.6, 0.62, true);

  // --- Decorative ceiling light strips ---
  for (const x of [-9, -3, 3, 9]) {
    b('cyan', 0.035, 0.035, 5.8, x, 3.95, -2.8);
    b('violet', 0.035, 0.035, 5.8, x, 7.78, -2.8);
  }

  // --- Emit: one InstancedMesh per material (was ~200 meshes) ---
  instancedBoxes(scene, M.cyan, C.cyan);
  instancedBoxes(scene, M.violet, C.violet);
  instancedBoxes(scene, M.silver, C.silver, { shadow: true });
  instancedBoxes(scene, M.deep, C.deep, { shadow: true });
  instancedBoxes(scene, M.floor, C.floor, { shadow: true });
  instancedBoxes(scene, M.floorAlt, C.floorAlt, { shadow: true });
  instancedBoxes(scene, M.glass, C.glass);
  instancedBoxes(scene, M.glassDark, C.glassDark);
  instancedBoxes(scene, M.cyanGlow, C.cyanGlow);
}
