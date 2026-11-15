// DIPA HQ — floor2.js
// Floor 2 (Executive), FULL footprint. Back band (z -6.5..-2):
// Executive Office — DFNX PRIME | Board Room.
// Front band (z -2..6.5): Executive Lounge | Management Deck / Balcony.
// The glass viewing strip over Floor 1 is built in building.js.
import * as THREE from 'three';
import { LAYOUT } from './config.js';
import { M, box, cyl, sphere, sign, glowLight, screenClone } from './materials.js';

const FY = LAYOUT.floor2Y; // floor 2 surface

// Registered monitor screens (cloned materials, see floor1.js).
const screens = [];
function scr(base) {
  const mat = screenClone(base);
  screens.push({ mat, base: 0.55, phase: Math.random() * 6.28, speed: 0.9 + Math.random() * 1.6 });
  return mat;
}

function plant(parent, x, z, y = FY) {
  cyl(parent, 0.2, 0.25, 0.35, M.wood, x, y + 0.18, z, 9);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 6), M.plant);
  stem.position.set(x, y + 0.8, z);
  parent.add(stem);
  for (let i = 0; i < 5; i++) {
    sphere(parent, 0.22, M.plant, x + Math.cos(i * 1.26) * 0.25, y + 1.15 + Math.sin(i) * 0.12, z + Math.sin(i * 1.26) * 0.25, 0.6, 1.5, 0.65);
  }
}

export function buildFloor2(scene) {
  // ---------- Back band ----------
  // (1) Executive Office — DFNX PRIME (x -10.5..-1, z -6.5..-2)
  box(scene, 2.5, 0.18, 1.2, M.wood, -6.0, FY + 0.9, -4.7);
  box(scene, 1.1, 0.65, 0.1, M.black, -6.0, FY + 1.4, -5.05);
  box(scene, 1.0, 0.5, 0.025, scr(M.screenViolet), -6.0, FY + 1.43, -4.99, { shadow: false });
  // executive chair (CEO sits/stands here)
  cyl(scene, 0.38, 0.4, 0.18, M.deep, -6.0, FY + 0.5, -3.4, 12);
  box(scene, 0.75, 0.6, 0.75, new THREE.MeshStandardMaterial({ color: 0x384e67, roughness: 0.5 }), -6.0, FY + 0.85, -3.4);
  box(scene, 0.75, 0.9, 0.18, new THREE.MeshStandardMaterial({ color: 0x384e67, roughness: 0.5 }), -6.0, FY + 1.35, -3.05);
  // bookshelf + awards shelf
  box(scene, 0.5, 2.4, 2.2, M.wood, -10.0, FY + 1.2, -4.0);
  for (let i = 0; i < 3; i++) box(scene, 0.4, 0.3, 1.8, i % 2 ? M.violet : M.cyan, -10.0, FY + 0.5 + i * 0.7, -4.0, { shadow: false });
  // office wall screen
  box(scene, 2.0, 1.1, 0.08, M.black, -6.0, FY + 2.2, -6.3);
  box(scene, 1.85, 0.95, 0.03, scr(M.screenViolet), -6.0, FY + 2.2, -6.24, { shadow: false });
  sign(scene, 'DFNX PRIME · EXECUTIVE OFFICE', -5.75, 7.2, -6.36, '#b6a0ff', 4.2, 0.55);
  plant(scene, -9.5, -2.6);
  glowLight(scene, 0x987cff, 0.9, -6.0, FY + 2.0, -4.0);

  // (2) Board Room (x -1..10.5, z -6.5..-2)
  box(scene, 3.4, 0.18, 1.45, M.wood, 4.5, FY + 0.4, -4.2);
  for (let i = 0; i < 6; i++) {
    const x = 3.3 + (i % 3) * 1.2, z = i < 3 ? -5.35 : -3.05;
    cyl(scene, 0.28, 0.3, 0.12, M.deep, x, FY + 0.2, z, 12);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8), M.silver);
    post.position.set(x, FY + 0.45, z);
    scene.add(post);
    box(scene, 0.5, 0.5, 0.12, new THREE.MeshStandardMaterial({ color: 0x384e67, roughness: 0.5 }), x, FY + 0.7, z - 0.35);
  }
  // boardroom screen wall
  box(scene, 3.0, 1.6, 0.08, M.black, 4.5, FY + 2.1, -6.3);
  box(scene, 2.85, 1.45, 0.03, scr(M.screenCyan), 4.5, FY + 2.1, -6.24, { shadow: false });
  sign(scene, 'BOARD ROOM', 4.5, 7.2, -6.36, '#a98cff', 2.8, 0.55);

  // ---------- Front band ----------
  // (3) Executive Lounge (x -10.5..-1, z -2..6.5)
  box(scene, 2.4, 0.55, 0.8, new THREE.MeshStandardMaterial({ color: 0x334f6d, roughness: 0.6 }), -7.1, FY + 0.45, 1.0);
  box(scene, 2.4, 0.6, 0.2, new THREE.MeshStandardMaterial({ color: 0x496783, roughness: 0.6 }), -7.1, FY + 0.8, 0.65);
  box(scene, 2.4, 0.55, 0.8, new THREE.MeshStandardMaterial({ color: 0x334f6d, roughness: 0.6 }), -7.1, FY + 0.45, 4.2);
  box(scene, 2.4, 0.6, 0.2, new THREE.MeshStandardMaterial({ color: 0x496783, roughness: 0.6 }), -7.1, FY + 0.8, 4.55);
  box(scene, 1.1, 0.12, 0.75, M.wood, -7.1, FY + 0.2, 2.6);
  plant(scene, -9.8, 5.8);
  sign(scene, 'EXECUTIVE LOUNGE', -5.75, 7.0, -1.9, '#62e5ff', 3.4, 0.55);

  // (4) Management Deck / Balcony (x -1..10.5, z -2..6.5)
  // glass railing along the front edge
  for (let x = -1; x <= 10.5; x += 1.9) box(scene, 0.06, 1.05, 0.06, M.violet, x, FY + 0.55, 6.35, { shadow: false });
  box(scene, 11.5, 0.06, 0.06, M.glass, 4.75, FY + 1.07, 6.35, { shadow: false });
  // deck lounge chairs + side tables
  for (const [x, z] of [[2.5, 4.5], [6.5, 4.5]]) {
    box(scene, 1.0, 0.5, 0.9, new THREE.MeshStandardMaterial({ color: 0x3d5872, roughness: 0.6 }), x, FY + 0.3, z);
    box(scene, 1.0, 0.6, 0.2, new THREE.MeshStandardMaterial({ color: 0x526f88, roughness: 0.6 }), x, FY + 0.65, z - 0.4);
  }
  cyl(scene, 0.45, 0.45, 0.1, M.wood, 4.5, FY + 0.3, 4.5, 16);
  plant(scene, 9.8, 5.8);
  plant(scene, 0.2, 5.8);
  sign(scene, 'MANAGEMENT DECK', 4.75, 7.0, -1.9, '#a98cff', 3.4, 0.55);

  // (5) Glass viewing area — the glass floor strip (built in building.js)
  // is labeled here; it overlooks the Main Operations Floor below.
  sign(scene, 'GLASS VIEWING · OPERATIONS BELOW', 1.5, 5.6, 0.55, '#62e5ff', 4.0, 0.5);
  glowLight(scene, 0x55dfff, 0.9, 1.5, FY + 1.8, -0.75);

  // floor 2 accent lights
  const accentLights = [];
  for (const [x, z, c] of [[-6, -4, 0x987cff], [4.5, -4, 0x4edaff], [-7, 2, 0x4edaff], [5, 3, 0x987cff]]) {
    accentLights.push(glowLight(scene, c, 0.9, x, FY + 1.8, z, 9));
  }
  return { accentLights, screens };
}
