// DIPA HQ — floor1.js
// Floor 1 (Operations): all 9 areas from assignment §3, visibly separated
// and labeled. Back band (z -6.5..-2): Research Lab | Mission Control | Server Room.
// Middle band (z -2..2): CUE Collaboration | Main Operations Floor | Development Lab.
// Front band (z 2..6.5): Lounge & Pantry | Entrance & Reception | Security Monitoring.
import * as THREE from 'three';
import { LAYOUT } from './config.js';
import { M, box, cyl, sphere, sign, glowLight, screenClone } from './materials.js';

const FY = LAYOUT.floor1Y; // floor 1 surface

// Registered monitor screens: each gets a CLONED material so the
// environment animator can pulse screens independently.
const screens = [];
function scr(base) {
  const mat = screenClone(base);
  screens.push({ mat, base: 0.55, phase: Math.random() * 6.28, speed: 0.9 + Math.random() * 1.6 });
  return mat;
}

export function workstation(parent, x, z, accent, rotY = 0, y = FY) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rotY;
  parent.add(g);
  box(g, 1.75, 0.13, 0.9, M.wood, 0, 0.88, 0);
  for (const dx of [-0.73, 0.73]) for (const dz of [-0.32, 0.32]) box(g, 0.075, 0.86, 0.075, M.deep, dx, 0.42, dz);
  box(g, 0.78, 0.55, 0.09, M.black, 0, 1.25, -0.25);
  box(g, 0.7, 0.45, 0.025, scr(accent === '#54dfff' ? M.screenCyan : M.screenViolet), 0, 1.27, -0.195, { shadow: false });
  box(g, 0.3, 0.06, 0.24, M.black, 0, 1.0, 0.1);
  // chair
  cyl(g, 0.32, 0.34, 0.12, M.deep, 0, 0.15, 0.78, 12);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), M.silver);
  post.position.set(0, 0.45, 0.78);
  g.add(post);
  return g;
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

export function buildFloor1(scene) {
  // ---------- Back band ----------
  // (1) Research Lab — x -10.5..-3, z -6.5..-2
  workstation(scene, -7.0, -4.2, '#54dfff');
  workstation(scene, -9.0, -4.2, '#54dfff');
  // lab bench with beakers / test equipment
  box(scene, 2.6, 0.14, 0.9, M.white, -7.0, FY + 0.9, -5.6);
  for (let i = 0; i < 3; i++) cyl(scene, 0.09, 0.12, 0.4, M.glass, -7.7 + i * 0.7, FY + 1.15, -5.6, 8);
  box(scene, 2.2, 1.0, 0.08, M.black, -6.8, FY + 1.6, -6.3);
  box(scene, 2.0, 0.85, 0.025, scr(M.screenCyan), -6.8, FY + 1.6, -6.24, { shadow: false });
  sign(scene, 'RESEARCH LAB', -6.75, 3.55, -6.36, '#62e5ff', 3.4, 0.6);
  plant(scene, -10.0, -5.8);

  // (2) Mission Control Center — x -3..4, z -6.5..-2
  for (let i = 0; i < 3; i++) {
    box(scene, 2.4, 0.16, 0.75, M.deep, -1.7 + i * 2.3, FY + 0.55, -4.6);
    box(scene, 1.8, 0.9, 0.08, M.black, -1.7 + i * 2.3, FY + 1.05, -4.98);
    box(scene, 1.65, 0.72, 0.025, scr(M.screenCyan), -1.7 + i * 2.3, FY + 1.07, -4.93, { shadow: false });
  }
  // big mission wall: globe + data screens
  box(scene, 3.4, 1.9, 0.1, M.black, 0.5, FY + 2.0, -6.3);
  box(scene, 3.2, 1.7, 0.03, scr(M.screenCyan), 0.5, FY + 2.0, -6.24, { shadow: false });
  const globe = sphere(scene, 0.55, M.screenCyan, 0.5, FY + 2.0, -6.18, 1, 1, 1);
  globe.material = M.screenCyan;
  sign(scene, 'MISSION CONTROL', 0.5, 3.55, -6.36, '#62e5ff', 3.6, 0.6);
  workstation(scene, 0.5, -4.2, '#54dfff');

  // (3) Server Room — x 4..10.5, z -6.5..-2
  for (let i = 0; i < 5; i++) {
    box(scene, 0.82, 2.35, 0.85, M.deep, 4.9 + i * 0.95, FY + 1.2, -4.6);
    for (let j = 0; j < 6; j++) {
      box(scene, 0.52, 0.025, 0.035, i % 2 ? M.violet : M.cyan, 4.9 + i * 0.95, FY + 0.35 + j * 0.29, -4.16, { shadow: false });
    }
  }
  glowLight(scene, 0x4edaff, 1.1, 7.3, FY + 1.6, -4.6);
  sign(scene, 'SERVER ROOM', 7.25, 3.55, -6.36, '#a88cff', 3.0, 0.6);

  // ---------- Middle band ----------
  // (4) Collaboration Room — x -10.5..-4, z -2..2
  workstation(scene, -8.0, 0.4, '#a88cff');
  workstation(scene, -6.2, 1.4, '#a88cff', Math.PI);
  workstation(scene, -9.6, 1.4, '#a88cff');
  // round collaboration table
  cyl(scene, 1.1, 1.1, 0.1, M.wood, -7.4, FY + 0.8, 0.6, 20);
  cyl(scene, 0.12, 0.5, 0.8, M.deep, -7.4, FY + 0.4, 0.6, 12);
  sign(scene, 'COLLABORATION ROOM', -7.25, 3.3, -1.9, '#ae91ff', 3.6, 0.6);
  plant(scene, -10.0, 1.6);

  // (5) Main Operations Floor — x -4..4, z -2..2
  workstation(scene, -1.0, 0.6, '#54dfff');
  workstation(scene, 1.4, 0.6, '#54dfff');
  workstation(scene, -1.0, -1.2, '#54dfff');
  workstation(scene, 1.4, -1.2, '#a88cff');
  sign(scene, 'OPERATIONS FLOOR', 0, 3.3, -1.9, '#62e5ff', 3.4, 0.6);

  // (6) Development Lab — x 4..10.5, z -2..2
  workstation(scene, 7.5, 0.6, '#54dfff');
  workstation(scene, 9.3, 0.6, '#a88cff');
  // whiteboard + code wall
  box(scene, 2.4, 1.3, 0.06, M.white, 7.5, FY + 1.8, -1.9);
  box(scene, 2.2, 1.1, 0.03, scr(M.screenViolet), 7.5, FY + 1.8, -1.86, { shadow: false });
  sign(scene, 'DEVELOPMENT LAB', 7.25, 3.3, -1.9, '#a98cff', 3.4, 0.6);

  // ---------- Front band ----------
  // (7) Lounge and Pantry — x -10.5..-4, z 2..6.5
  box(scene, 2.7, 0.5, 0.8, new THREE.MeshStandardMaterial({ color: 0x3d5872, roughness: 0.6 }), -9.0, FY + 0.3, 3.4);
  box(scene, 2.7, 0.7, 0.22, new THREE.MeshStandardMaterial({ color: 0x526f88, roughness: 0.6 }), -9.0, FY + 0.8, 3.0);
  box(scene, 2.7, 0.5, 0.8, new THREE.MeshStandardMaterial({ color: 0x3d5872, roughness: 0.6 }), -6.2, FY + 0.3, 3.4);
  cyl(scene, 0.58, 0.58, 0.13, M.wood, -7.6, FY + 0.25, 4.4, 16);
  // pantry counter + fridge
  box(scene, 2.2, 1.0, 0.7, M.white, -9.4, FY + 0.5, 5.6);
  box(scene, 1.8, 1.5, 0.8, M.white, -6.0, FY + 0.75, 5.7);
  box(scene, 1.9, 0.12, 0.9, M.cyan, -6.0, FY + 1.55, 5.7, { shadow: false });
  sign(scene, 'LOUNGE & PANTRY', -7.25, 3.3, 2.1, '#62e5ff', 3.4, 0.6);
  plant(scene, -10.0, 5.8);

  // (8) Main Entrance and Reception — x -4..4, z 2..6.5
  box(scene, 3.4, 0.18, 1.4, M.wood, 0, FY + 0.95, 4.6);
  box(scene, 3.4, 1.0, 0.18, M.navy, 0, FY + 0.5, 5.2);
  // big D logo behind reception
  const dCanvas = document.createElement('canvas');
  dCanvas.width = 256; dCanvas.height = 256;
  const dctx = dCanvas.getContext('2d');
  dctx.fillStyle = '#0a1a2e'; dctx.fillRect(0, 0, 256, 256);
  dctx.strokeStyle = '#56dfff'; dctx.lineWidth = 14;
  dctx.beginPath(); dctx.moveTo(70, 40); dctx.lineTo(70, 216); dctx.lineTo(150, 216);
  dctx.arc(150, 128, 88, -Math.PI / 2, Math.PI / 2); dctx.lineTo(70, 40); dctx.stroke();
  const dTex = new THREE.CanvasTexture(dCanvas);
  dTex.colorSpace = THREE.SRGBColorSpace;
  const dLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.6),
    new THREE.MeshBasicMaterial({ map: dTex, transparent: true }),
  );
  dLogo.position.set(0, FY + 2.4, 6.3);
  dLogo.rotation.y = Math.PI;
  scene.add(dLogo);
  // glass double doors (front wall) — slide open periodically (environment)
  const doorL = box(scene, 1.4, 3.0, 0.08, M.glass, -0.75, FY + 1.5, 6.42, { shadow: false });
  const doorR = box(scene, 1.4, 3.0, 0.08, M.glass, 0.75, FY + 1.5, 6.42, { shadow: false });
  sign(scene, 'RECEPTION', 0, 3.3, 2.1, '#62e5ff', 2.6, 0.6);

  // (9) Security Monitoring Area — x 4..10.5, z 2..6.5
  box(scene, 2.6, 0.14, 0.9, M.deep, 7.5, FY + 0.9, 3.6);
  for (let i = 0; i < 3; i++) {
    box(scene, 1.5, 0.9, 0.08, M.black, 6.2 + i * 1.7, FY + 1.9, 6.2);
    box(scene, 1.35, 0.75, 0.03, scr(i % 2 ? M.screenViolet : M.screenCyan), 6.2 + i * 1.7, FY + 1.9, 6.15, { shadow: false });
  }
  box(scene, 1.6, 0.9, 0.08, M.black, 7.5, FY + 2.9, 6.2);
  box(scene, 1.45, 0.75, 0.03, scr(M.screenCyan), 7.5, FY + 2.9, 6.15, { shadow: false });
  glowLight(scene, 0x987cff, 0.9, 7.5, FY + 2.0, 5.0);
  sign(scene, 'SECURITY LAB', 7.25, 3.3, 2.1, '#a98cff', 2.8, 0.6);

  // interior accent lights (dim in day, bright at night — lighting.js scales them)
  const accentLights = [];
  for (const [x, z, c] of [[-8, -4, 0x4edaff], [8, -4, 0x987cff], [0, 0, 0x55dfff], [7, 4, 0x987cff], [-7, 4, 0x4edaff]]) {
    accentLights.push(glowLight(scene, c, 1.0, x, FY + 1.8, z, 9));
  }
  return { accentLights, screens, doors: { left: doorL, right: doorR }, globe };
}
