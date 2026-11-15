// DIPA HQ — scene.js
// Scene, renderer, camera, controls and the futuristic night-city backdrop.
// Renderer creation is guarded: a failed WebGL context shows a useful error
// instead of a silent black screen (Phase 1 finding T4).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PALETTE } from './config.js';
import { M, box, cyl } from './materials.js';

export function createScene(host, quality) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.Fog(PALETTE.bg, 30, 95);

  const camera = new THREE.PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 220);
  camera.position.set(22, 17, 26);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: 'high-performance' });
  } catch (e) {
    throw new Error('WebGL tidak tersedia di browser ini: ' + e.message);
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.pixelRatio));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // from v1 (smoothest look)
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 4.1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 12;
  controls.maxDistance = 52;
  controls.maxPolarAngle = Math.PI * 0.49;

  // --- Base lighting (day/night module adjusts intensities per phase) ---
  const hemi = new THREE.HemisphereLight(0xc7eaff, 0x1a2a40, 1.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe7c3, 0.4);
  sun.position.set(-13, 22, 15);
  sun.castShadow = quality.shadows;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
  scene.add(sun);
  const ambient = new THREE.AmbientLight(0x7896c2, 0.35);
  scene.add(ambient);

  // --- Ground: dark plaza + road in front + sidewalk ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({ color: 0x0a1826, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.9;
  ground.receiveShadow = true;
  scene.add(ground);
  // road (front, z 8..14) with lane dashes
  box(scene, 46, 0.08, 6, M.deep, 0, -0.82, 11);
  for (let x = -21; x <= 21; x += 3) box(scene, 1.8, 0.02, 0.1, M.silver, x, -0.76, 11, { shadow: false });
  // sidewalk strip
  box(scene, 46, 0.1, 1.6, new THREE.MeshStandardMaterial({ color: 0x1c3346, roughness: 0.8 }), 0, -0.8, 7.6);

  // --- Futuristic night-city ring (silhouette towers with lit windows) ---
  // Each tower gets its OWN material clone so the environment animator
  // can twinkle windows tower by tower (shared materials would flash
  // whole groups of towers in unison).
  const cityMats = buildCity(scene);

  // --- Sun / moon discs (positioned by the day/night module) ---
  const sunDisc = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe9b0 }),
  );
  const moonDisc = new THREE.Mesh(
    new THREE.SphereGeometry(1.6, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xdfe9ff }),
  );
  scene.add(sunDisc, moonDisc);

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);

  return { scene, camera, renderer, controls, hemi, sun, ambient, sunDisc, moonDisc, cityMats };
}

// Window texture shared by the city towers: dark facade, random lit windows.
function cityTexture(hue) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0b1727'; ctx.fillRect(0, 0, 64, 128);
  for (let y = 6; y < 122; y += 10) {
    for (let x = 6; x < 58; x += 10) {
      if (Math.random() < 0.42) {
        ctx.fillStyle = Math.random() < 0.5 ? hue : '#ffd9a0';
        ctx.globalAlpha = 0.35 + Math.random() * 0.65;
        ctx.fillRect(x, y, 5, 6);
      }
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildCity(scene) {
  const texA = cityTexture('#6ee7ff');
  const texB = cityTexture('#b79bff');
  const texC = cityTexture('#7dffd4');
  const baseMats = [texA, texB, texC].map(t => new THREE.MeshStandardMaterial({
    map: t, roughness: 0.85, metalness: 0.1,
    emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.55,
  }));
  const group = new THREE.Group();
  const cityMats = [];
  // Ring of towers around the HQ, leaving the front (camera side) lower
  // so the building stays the hero.
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
    const r = 42 + Math.random() * 30;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.8;
    const w = 4 + Math.random() * 5;
    const d = 4 + Math.random() * 5;
    const h = (z > 4 ? 5 + Math.random() * 7 : 8 + Math.random() * 20); // low in front
    const m = baseMats[i % 3].clone();
    cityMats.push(m);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, h / 2 - 0.9, z);
    group.add(mesh);
    // rooftop beacon on the tallest towers
    if (h > 20) cyl(group, 0.08, 0.08, 1.2, M.violetGlow, x, h - 0.3, z, 6);
  }
  scene.add(group);
  return cityMats;
}
