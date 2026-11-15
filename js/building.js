// DIPA HQ — building.js
// The building shell: foundation, TWO FULL floors (not a mezzanine),
// glass walls, columns/beams, roof, staircase and glass railings.
// Floor 2 is the same footprint as Floor 1 (21.3 × 13.3) — Phase 1 found
// v3's half-depth second floor read as a mezzanine; that is fixed here.
import * as THREE from 'three';
import { LAYOUT } from './config.js';
import { M, box, beam, sign } from './materials.js';

export function buildShell(scene) {
  const W = LAYOUT.width, D = LAYOUT.depth;
  const hw = W / 2, hd = D / 2;

  // --- Foundation + plinth ---
  box(scene, 23, 0.5, 15, M.deep, 0, -0.05, 0);
  box(scene, 21.8, 0.18, 13.8, M.silver, 0, 0.28, 0);
  box(scene, 21.3, 0.12, 13.3, new THREE.MeshStandardMaterial({ color: 0xc8d8df, roughness: 0.24, metalness: 0.2 }), 0, 0.42, 0);

  // --- Floor 1 polished floor panels ---
  for (let x = -9; x <= 9; x += 3) {
    box(scene, 2.95, 0.018, 12.6, x % 2 ? M.floorAlt : M.floor, x, 0.5, 0, { shadow: false });
  }

  // --- Floor 1 glass walls (front/back/left/right) + cyan mullions ---
  for (const x of [-hw, hw]) box(scene, 0.12, 3.6, D - 0.2, M.glass, x, 2.35, 0, { shadow: false });
  for (const z of [-hd, hd]) box(scene, W - 0.2, 3.6, 0.12, M.glass, 0, 2.35, z, { shadow: false });
  for (let x = -10; x <= 10; x += 2.1) {
    box(scene, 0.07, 3.6, 0.09, M.cyan, x, 2.35, -hd + 0.1, { shadow: false });
    box(scene, 0.07, 3.6, 0.09, M.cyan, x, 2.35, hd - 0.1, { shadow: false });
  }
  for (let z = -6; z <= 6; z += 2.15) {
    box(scene, 0.07, 3.6, 0.09, M.cyan, -hw + 0.1, 2.35, z, { shadow: false });
    box(scene, 0.07, 3.6, 0.09, M.cyan, hw - 0.1, 2.35, z, { shadow: false });
  }
  // back wall (solid, behind the glass) + floor 1 ceiling beams
  box(scene, W, 0.18, 0.18, M.navy, 0, 2.3, -hd + 0.02);
  for (const x of [-10.6, -5.3, 0, 5.3, 10.6]) box(scene, 0.16, 0.18, 13.3, M.cyan, x, 4.2, 0, { shadow: false });
  for (const z of [-6.6, 0, 6.6]) box(scene, 21.2, 0.18, 0.16, M.cyan, 0, 4.2, z, { shadow: false });

  // --- Floor 1 room partitions (glass dark, with door gaps) ---
  // back band | front band separators
  box(scene, 0.1, 3.15, 4.5, M.glassDark, -3, 2.2, -4.25);
  box(scene, 0.1, 3.15, 4.5, M.glassDark, 4, 2.2, -4.25);
  // middle band | front band (z = -2), gap at centre x -1..1
  box(scene, 9.5, 2.8, 0.09, M.glassDark, -5.75, 2.1, -2);
  box(scene, 9.5, 2.8, 0.09, M.glassDark, 5.75, 2.1, -2);
  // side separators, full front depth
  box(scene, 0.1, 3.15, 8.5, M.glassDark, -4, 2.2, 2.25);
  box(scene, 0.1, 3.15, 8.5, M.glassDark, 4, 2.2, 2.25);
  // front band splits (z = 2)
  box(scene, 6.5, 2.8, 0.09, M.glassDark, -7.25, 2.1, 2);
  box(scene, 6.5, 2.8, 0.09, M.glassDark, 7.25, 2.1, 2);

  // --- Floor 2 slab: FULL footprint, with a glass viewing strip ---
  // Back band slab (z -6.5..-2)
  box(scene, W - 0.2, 0.28, 4.5, M.deep, 0, 4.48, -4.25);
  box(scene, W - 0.5, 0.1, 4.2, M.floorAlt, 0, 4.65, -4.25, { shadow: false });
  // Front-left slab (x -10.5..-1, z -2..6.5)
  box(scene, 9.5, 0.28, 8.5, M.deep, -5.75, 4.48, 2.25);
  box(scene, 9.2, 0.1, 8.2, M.floor, -5.75, 4.65, 2.25, { shadow: false });
  // Front-right slab (x 4..10.5, z -2..6.5)
  box(scene, 6.5, 0.28, 8.5, M.deep, 7.25, 4.48, 2.25);
  box(scene, 6.2, 0.1, 8.2, M.floorAlt, 7.25, 4.65, 2.25, { shadow: false });
  // Front-centre slab behind the viewing strip (x -1..4, z 0.5..6.5)
  box(scene, 5, 0.28, 6, M.deep, 1.5, 4.48, 3.5);
  box(scene, 4.7, 0.1, 5.7, M.floor, 1.5, 4.65, 3.5, { shadow: false });
  // Glass viewing floor over Floor 1 (x -1..4, z -2..0.5)
  box(scene, 5, 0.06, 2.5, M.glassFloor, 1.5, 4.5, -0.75, { shadow: false });
  // Railing around the viewing strip
  for (let x = -1; x <= 4; x += 1.25) box(scene, 0.06, 1.0, 0.06, M.cyan, x, 5.15, 0.55, { shadow: false });
  box(scene, 5, 0.06, 0.06, M.glass, 1.5, 5.65, 0.55, { shadow: false });
  box(scene, 0.06, 1.0, 2.5, M.glass, -1, 5.15, -0.75, { shadow: false });
  box(scene, 0.06, 1.0, 2.5, M.glass, 4, 5.15, -0.75, { shadow: false });

  // --- Floor 2 glass walls + violet mullions (full depth) ---
  for (const x of [-hw, hw]) box(scene, 0.12, 3.2, D - 0.2, M.glass, x, 6.25, 0, { shadow: false });
  box(scene, W - 0.2, 3.2, 0.12, M.glass, 0, 6.25, -hd, { shadow: false });
  box(scene, W - 0.2, 3.2, 0.12, M.glass, 0, 6.25, hd, { shadow: false });
  for (let x = -10; x <= 10; x += 2) {
    box(scene, 0.07, 3.1, 0.08, M.violet, x, 6.25, -hd + 0.08, { shadow: false });
    box(scene, 0.07, 3.1, 0.08, M.violet, x, 6.25, hd - 0.08, { shadow: false });
  }
  // Floor 2 partitions
  box(scene, 0.1, 2.8, 4.5, M.glassDark, -1, 6.1, -4.25);
  box(scene, 9.5, 2.8, 0.09, M.glassDark, -5.75, 6.1, -2);
  box(scene, 9.5, 2.8, 0.09, M.glassDark, 5.75, 6.1, -2);
  box(scene, 0.1, 2.8, 8.5, M.glassDark, -1, 6.1, 2.25);
  // Roof outline beams (violet) + roof slab (thin, full footprint)
  for (const x of [-10.6, 0, 10.6]) box(scene, 0.18, 0.18, 13.4, M.violet, x, 7.9, 0, { shadow: false });
  for (const z of [-6.6, 6.6]) box(scene, 21.2, 0.18, 0.18, M.violet, 0, 7.9, z, { shadow: false });
  box(scene, W, 0.18, D, M.deep, 0, LAYOUT.roofY, 0);
  box(scene, W - 0.4, 0.06, D - 0.4, M.floorAlt, 0, LAYOUT.roofY + 0.12, 0, { shadow: false });

  // --- Structural columns (both floors, corners + mids) ---
  for (const [x, z] of [[-10.4, -6.4], [10.4, -6.4], [-10.4, 6.4], [10.4, 6.4], [0, -6.4], [0, 6.4], [-5.2, -6.4], [5.2, -6.4], [-5.2, 6.4], [5.2, 6.4]]) {
    box(scene, 0.22, 7.4, 0.22, M.silver, x, 4.2, z);
    box(scene, 0.06, 7.4, 0.06, M.cyan, x + 0.14, 4.2, z, { shadow: false });
  }

  // --- Staircase, right side: floor 1 (9, 5.0) up to floor 2 (9, -1.0) ---
  const steps = 15;
  for (let i = 0; i < steps; i++) {
    const y = 0.65 + i * 0.28;
    const z = 5.0 - i * 0.4;
    box(scene, 1.4, 0.16, 0.55, M.silver, 9.0, y, z);
    box(scene, 1.4, 0.03, 0.5, M.cyanGlow, 9.0, y + 0.09, z, { shadow: false });
  }
  // stair rails (glass + cyan handrail)
  beam(scene, [8.3, 0.8, 5.2], [8.3, 4.9, -1.2], 0.045, M.cyan);
  beam(scene, [9.7, 0.8, 5.2], [9.7, 4.9, -1.2], 0.045, M.cyan);
  // landing railing on floor 2 around the stair opening
  for (let x = 8.2; x <= 9.8; x += 0.8) box(scene, 0.06, 1.0, 0.06, M.cyan, x, 5.15, -1.2, { shadow: false });
  box(scene, 1.8, 0.06, 0.06, M.glass, 9.0, 5.65, -1.2, { shadow: false });

  // --- Building fascia sign (on the roof front edge — clear of beams) ---
  sign(scene, 'DIPA NEXUS', 0, 8.05, 6.72, '#62e5ff', 4.6, 0.62, true);

  // --- Decorative ceiling light strips ---
  for (const x of [-9, -3, 3, 9]) {
    box(scene, 0.035, 0.035, 5.8, M.cyan, x, 3.95, -2.8, { shadow: false });
    box(scene, 0.035, 0.035, 5.8, M.violet, x, 7.78, -2.8, { shadow: false });
  }
}
