// DIPA HQ — rig.js
// Jointed character rig shared by agents and the CEO (Phase 3).
// One builder, no duplicated figure code. All animation goes through the
// pivots below, so poses are joint targets, not mesh swaps.
//
// Rig layout (standing, ~2.1 units tall; face = +z local):
//   root -> body (vertical bob / lean / slump)
//     torso mesh (breathing = scale.y)
//     head group (neck pivot) -> head sphere, hair, eyes
//     armL / armR groups (shoulder pivots) -> arm capsule + hand anchor
//     legL / legR groups (hip pivots) -> thigh capsule
//       shinL / shinR groups (knee pivots) -> shin capsule + foot
// Props (phone / coffee cup / report) hang off the hand anchors and are
// hidden unless the current behaviour shows them.
import * as THREE from 'three';
import { M } from './materials.js';

function capsule(parent, r, len, material, x, y, z) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 8), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

export function buildRig(opts = {}) {
  const {
    suitColor = 0x145b78,
    skinColor = 0xd7a47d,
    hairColor = 0x263044,
    scale = 1,
    tie = false,        // CEO: violet tie
    crown = false,      // CEO: cyan crown band (SUPREME DIRECTOR)
    badgeColor = 0x56dfff,
  } = opts;

  const suit = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.48, metalness: 0.1 });
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  root.scale.setScalar(scale);

  // torso (capsule centre y=1.22, spans ~0.97..1.47)
  const torso = capsule(body, 0.28, 0.5, suit, 0, 1.22, 0);
  // badge on the chest
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.035), new THREE.MeshStandardMaterial({ color: badgeColor, roughness: 0.4 }));
  badge.position.set(0.15, 1.32, 0.28);
  body.add(badge);
  if (tie) {
    const tieMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.04), M.violet);
    tieMesh.position.set(0, 1.32, 0.29);
    body.add(tieMesh);
  }

  // head group (neck pivot at y=1.62; head sphere centre +0.30 -> 1.92)
  const head = new THREE.Group();
  head.position.set(0, 1.62, 0);
  body.add(head);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 }));
  headMesh.position.set(0, 0.3, 0);
  headMesh.scale.set(1, 1.05, 0.95);
  headMesh.castShadow = true;
  head.add(headMesh);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 12), new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7 }));
  hair.position.set(0, 0.48, -0.04);
  hair.scale.set(1.02, 0.55, 0.98);
  head.add(hair);
  for (const dx of [-0.105, 0.105]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.black);
    eye.position.set(dx, 0.32, 0.29);
    eye.scale.set(0.8, 1, 0.5);
    head.add(eye);
  }
  if (crown) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.42), M.cyanGlow);
    band.position.set(0, 0.72, 0);
    head.add(band);
  }

  // arms: shoulder pivots at (±0.36, 1.48, 0); capsule hangs down from pivot.
  function arm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(0.36 * side, 1.48, 0);
    body.add(pivot);
    capsule(pivot, 0.075, 0.4, suit, 0, -0.26, 0);
    const hand = new THREE.Object3D();
    hand.position.set(0, -0.52, 0.02);
    pivot.add(hand);
    return { pivot, hand };
  }
  const armL = arm(-1);
  const armR = arm(1);

  // legs: hip pivots at (±0.15, 0.95, 0); thigh hangs down; knee pivot at -0.5.
  function leg(side) {
    const hip = new THREE.Group();
    hip.position.set(0.15 * side, 0.95, 0);
    body.add(hip);
    capsule(hip, 0.09, 0.34, M.deep, 0, -0.24, 0);
    const knee = new THREE.Group();
    knee.position.set(0, -0.5, 0);
    hip.add(knee);
    capsule(knee, 0.08, 0.34, M.deep, 0, -0.22, 0);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.3), M.deep);
    foot.position.set(0, -0.46, 0.06);
    foot.castShadow = true;
    knee.add(foot);
    return { hip, knee };
  }
  const legL = leg(-1);
  const legR = leg(1);

  // behaviour props (hidden unless the behaviour shows them)
  const phone = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.17, 0.03), M.black);
  phone.position.set(0, 0.02, 0.05);
  armR.hand.add(phone);
  phone.visible = false;
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf2f6f8, roughness: 0.4 }));
  cup.position.set(0, 0.02, 0.05);
  armR.hand.add(cup);
  cup.visible = false;
  const report = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xf4f8fa, roughness: 0.6 }));
  report.position.set(0, -0.02, 0.12);
  report.rotation.x = -0.5;
  armL.hand.add(report);
  report.visible = false;

  const joints = {
    body, torso, head,
    armL: armL.pivot, armR: armR.pivot,
    legL: legL.hip, legR: legR.hip,
    shinL: legL.knee, shinR: legR.knee,
  };
  const props = { phone, cup, report, handL: armL.hand, handR: armR.hand };
  return { group: root, body, joints, props };
}
