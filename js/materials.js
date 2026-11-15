// DIPA HQ — materials.js
// Shared materials and small geometry helpers used by every building module.
// Keeps the palette and construction style consistent across components.
import * as THREE from 'three';
import { PALETTE } from './config.js';

const std = (c, r = 0.55, m = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });

export const M = {
  navy: std(PALETTE.navy),
  deep: std(PALETTE.deep),
  floor: std(PALETTE.floor, 0.28, 0.25),
  floorAlt: std(0x304c60, 0.22, 0.25),
  silver: std(PALETTE.silver, 0.28, 0.55),
  white: std(PALETTE.white, 0.34, 0.12),
  cyan: std(PALETTE.cyan, 0.25, 0.35),
  violet: std(PALETTE.violet, 0.28, 0.35),
  cyanGlow: std(PALETTE.cyan, 0.3, 0.1, { emissive: 0x0a5266, emissiveIntensity: 1.4 }),
  violetGlow: std(PALETTE.violet, 0.3, 0.1, { emissive: 0x35206f, emissiveIntensity: 1.2 }),
  wood: std(PALETTE.wood, 0.65, 0),
  plant: std(PALETTE.plant, 0.8, 0),
  skin: std(PALETTE.skin, 0.8, 0),
  black: std(0x101c2c, 0.3, 0.1),
  dark: std(0x0a1421, 0.3, 0.1),
  // Perf fix: MeshPhysicalMaterial + transmission forced a second full
  // scene render into a transmission target EVERY frame — the single
  // biggest GPU cost on a phone. Plain transparent standard material
  // keeps the glass look without the extra pass.
  glass: std(0x7bdcff, 0.16, 0.08, { transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
  glassDark: std(0x2a7090, 0.22, 0.15, { transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
  glassFloor: std(0x9fe8ff, 0.08, 0.1, { transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
  water: new THREE.MeshStandardMaterial({
    color: 0x2fb9e8, roughness: 0.08, metalness: 0.1,
    transparent: true, opacity: 0.85, emissive: 0x0a4a6b, emissiveIntensity: 0.7,
  }),
  screenCyan: std(0x123a56, 0.22, 0.25, { emissive: 0x43c9ff, emissiveIntensity: 0.55 }),
  screenViolet: std(0x243b64, 0.2, 0.2, { emissive: 0x927aff, emissiveIntensity: 0.55 }),
};

// --- Perf fix: instancing helpers -----------------------------------------
// Hundreds of identical small parts (mullions, columns, stair steps,
// server LEDs, road dashes, city towers, workstation parts) were each
// their own mesh = their own draw call (~1,400 total). One InstancedMesh
// per material collapses them to a single draw call each.
// t: { x, y, z, rotY?, sx?, sy?, sz? } — unit geometry scaled to size.
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(),
  _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function fillInstance(mesh, list) {
  list.forEach((t, i) => {
    _e.set(0, t.rotY || 0, 0);
    _q.setFromEuler(_e);
    _v.set(t.x, t.y, t.z);
    _s.set(t.sx ?? 1, t.sy ?? 1, t.sz ?? 1);
    _m4.compose(_v, _q, _s);
    mesh.setMatrixAt(i, _m4);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

export function instancedBoxes(parent, material, list, opts = {}) {
  if (!list.length) return null;
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, list.length);
  fillInstance(m, list);
  m.castShadow = !!opts.shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function instancedGeo(parent, geometry, material, list, opts = {}) {
  if (!list.length) return null;
  const m = new THREE.InstancedMesh(geometry, material, list.length);
  fillInstance(m, list);
  m.castShadow = !!opts.shadow;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// Perf fix: plants were 7 meshes each (~50 across the scene). Collect
// pots/stems/leaves into instanced sets, flushed once per floor.
export function createPlantCollector() {
  const pots = [], stems = [], leaves = [];
  return {
    add(x, z, y) {
      pots.push({ x, y: y + 0.18, z, sx: 0.22, sy: 0.35, sz: 0.22 });
      stems.push({ x, y: y + 0.8, z, sx: 0.035, sy: 0.9, sz: 0.035 });
      for (let i = 0; i < 5; i++) {
        leaves.push({
          x: x + Math.cos(i * 1.26) * 0.25, y: y + 1.15 + Math.sin(i) * 0.12,
          z: z + Math.sin(i * 1.26) * 0.25, sx: 0.13, sy: 0.33, sz: 0.14,
        });
      }
    },
    flush(parent) {
      instancedGeo(parent, new THREE.CylinderGeometry(1, 1, 1, 9), M.wood, pots);
      instancedGeo(parent, new THREE.CylinderGeometry(1, 1, 1, 6), M.plant, stems);
      instancedGeo(parent, new THREE.SphereGeometry(1, 12, 10), M.plant, leaves);
    },
  };
}

// Clone a screen material so the environment animator can pulse each
// monitor independently (a shared material would pulse all screens at once).
export function screenClone(base) {
  return base.clone();
}

export function box(parent, w, h, d, material, x, y, z, opts = {}) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  o.position.set(x, y, z);
  o.castShadow = opts.shadow !== false;
  o.receiveShadow = true;
  if (opts.rotY) o.rotation.y = opts.rotY;
  parent.add(o);
  return o;
}

export function cyl(parent, rt, rb, h, material, x, y, z, n = 12) {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, n), material);
  o.position.set(x, y, z);
  o.castShadow = true;
  parent.add(o);
  return o;
}

export function sphere(parent, r, material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), material);
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  o.castShadow = true;
  parent.add(o);
  return o;
}

export function beam(parent, a, b, r, material) {
  const d = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), material);
  o.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(0.5));
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  parent.add(o);
  return o;
}

export function glowLight(parent, color, intensity, x, y, z, dist = 9) {
  const l = new THREE.PointLight(color, intensity, dist, 2);
  l.position.set(x, y, z);
  parent.add(l);
  return l;
}

// Canvas-texture room sign (plane, double-sided). Placed carefully so beams
// do not clip it — Phase 1 found v3's DIPA NEXUS sign clipped by the roof beam.
export function sign(parent, text, x, y, z, color = '#64e2ff', w = 3.3, h = 0.68, faceFront = false) {
  const c = document.createElement('canvas');
  c.width = 600; c.height = 130;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(4,17,31,.94)'; ctx.fillRect(0, 0, 600, 130);
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(4, 4, 592, 122);
  ctx.fillStyle = color; ctx.font = 'bold 42px Arial'; ctx.textAlign = 'center';
  ctx.fillText(text, 300, 82);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const o = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }),
  );
  // Signs face +z (the building front / default camera) by default.
  // NOTE: an earlier version rotated faceFront signs by PI, which made the
  // DIPA NEXUS fascia sign read MIRRORED from the default view (the plane's
  // back face shows through DoubleSide). Do not re-add a Y flip here.
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}

// Floating name tag above a character (canvas sprite, like v1's textSprite).
export function nameTag(text, color = '#e3f1ff', scale = 2.2) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.font = '800 44px Arial'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  s.scale.set(scale, scale / 4, 1);
  return s;
}
