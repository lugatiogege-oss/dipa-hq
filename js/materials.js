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
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x7bdcff, roughness: 0.16, metalness: 0.08,
    transparent: true, opacity: 0.16, transmission: 0.18, side: THREE.DoubleSide,
  }),
  glassDark: std(0x2a7090, 0.22, 0.15, { transparent: true, opacity: 0.32, side: THREE.DoubleSide }),
  glassFloor: new THREE.MeshPhysicalMaterial({
    color: 0x9fe8ff, roughness: 0.08, metalness: 0.1,
    transparent: true, opacity: 0.28, side: THREE.DoubleSide,
  }),
  water: new THREE.MeshStandardMaterial({
    color: 0x2fb9e8, roughness: 0.08, metalness: 0.1,
    transparent: true, opacity: 0.85, emissive: 0x0a4a6b, emissiveIntensity: 0.7,
  }),
  screenCyan: std(0x123a56, 0.22, 0.25, { emissive: 0x43c9ff, emissiveIntensity: 0.55 }),
  screenViolet: std(0x243b64, 0.2, 0.2, { emissive: 0x927aff, emissiveIntensity: 0.55 }),
};

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
