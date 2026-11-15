// DIPA HQ — animation.js
// Modular animation system (Phase 3). Poses are joint targets; the
// Animator damps every joint toward its target with delta time, so
// transitions are smooth and frame-rate independent. Procedural layers
// (typing oscillation, walk cycle, breathing, head scan, greet wave) are
// added on top of the base pose — never a bare up/down bob.
//
// Pose target format (all optional, defaults = neutral stand):
//   bodyY, bodyRX, bodyRZ, head {x,y,z}, armL {x,y,z}, armR {x,y,z},
//   legL {x}, legR {x}, shinL {x}, shinR {x}
import * as THREE from 'three';

const NEUTRAL = {
  bodyY: 0, bodyRX: 0, bodyRZ: 0,
  head: { x: 0, y: 0, z: 0 },
  armL: { x: 0.08, y: 0, z: 0.12 }, armR: { x: 0.08, y: 0, z: -0.12 },
  legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
};

// Seated leg targets (thigh forward, shin down).
const SEATED_LEGS = { legL: { x: -1.35 }, legR: { x: -1.35 }, shinL: { x: 1.32 }, shinR: { x: 1.32 } };

export const POSES = {
  // --- seated (agents at workstations) ---
  sitType: {
    bodyY: -0.25, bodyRX: 0.12,
    head: { x: 0.14, y: 0, z: 0 },
    armL: { x: -1.15, y: 0, z: 0.1 }, armR: { x: -1.15, y: 0, z: -0.1 },
    ...SEATED_LEGS,
  },
  sitThink: {
    bodyY: -0.25, bodyRX: 0.04,
    head: { x: 0.08, y: 0.15, z: 0.18 },
    armL: { x: -0.55, y: 0, z: 0.55 }, armR: { x: -1.85, y: 0, z: -0.3 },
    ...SEATED_LEGS,
  },
  sitIdle: {
    bodyY: -0.25, bodyRX: 0.02,
    head: { x: 0, y: 0, z: 0 },
    armL: { x: -0.25, y: 0, z: 0.15 }, armR: { x: -0.25, y: 0, z: -0.15 },
    ...SEATED_LEGS,
  },
  sitInteract: {
    bodyY: -0.25, bodyRX: 0.08,
    head: { x: 0.05, y: 0.35, z: 0 },
    armL: { x: -0.9, y: 0, z: 0.25 }, armR: { x: -1.3, y: 0, z: -0.2 },
    ...SEATED_LEGS,
  },
  sitRead: { // seated, holding a report (CEO at the executive desk)
    bodyY: -0.25, bodyRX: 0.1,
    head: { x: 0.3, y: 0, z: 0 },
    armL: { x: -0.95, y: 0, z: 0.2 }, armR: { x: -0.95, y: 0, z: -0.2 },
    ...SEATED_LEGS,
  },
  sitSleep: { // resting / CEO sleep at the desk
    bodyY: -0.25, bodyRX: 0.1, bodyRZ: 0.22,
    head: { x: 0.5, y: 0, z: 0.1 },
    armL: { x: -1.2, y: 0, z: 0.1 }, armR: { x: -1.2, y: 0, z: -0.1 },
    ...SEATED_LEGS,
  },
  // --- standing ---
  stand: { ...NEUTRAL },
  standPoint: {
    bodyY: 0, bodyRX: 0.03,
    head: { x: 0.05, y: 0, z: 0 },
    armL: { x: 0.1, y: 0, z: 0.15 }, armR: { x: -1.5, y: 0, z: -0.1 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standPhone: {
    bodyY: 0, bodyRX: 0.02,
    head: { x: 0.05, y: -0.1, z: 0.14 },
    armL: { x: 0.1, y: 0, z: 0.15 }, armR: { x: -1.95, y: 0, z: -0.35 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standCoffee: {
    bodyY: 0, bodyRX: 0.02,
    head: { x: 0.05, y: 0.2, z: 0 },
    armL: { x: 0.1, y: 0, z: 0.15 }, armR: { x: -1.05, y: 0, z: -0.1 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standRead: {
    bodyY: 0, bodyRX: 0.08,
    head: { x: 0.35, y: 0, z: 0 },
    armL: { x: -0.95, y: 0, z: 0.2 }, armR: { x: -0.95, y: 0, z: -0.2 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standInteract: { // interacting while standing (walk target, no chair)
    bodyY: 0, bodyRX: 0.05,
    head: { x: 0.05, y: 0.35, z: 0 },
    armL: { x: -0.9, y: 0, z: 0.25 }, armR: { x: -1.3, y: 0, z: -0.2 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standGreet: {
    bodyY: 0, bodyRX: 0,
    head: { x: 0, y: 0, z: 0 },
    armL: { x: 0.1, y: 0, z: 0.15 }, armR: { x: 0.2, y: 0, z: 2.3 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
  standIdle: {
    bodyY: 0, bodyRX: 0,
    head: { x: 0, y: 0, z: 0 },
    armL: { x: 0.08, y: 0, z: 0.12 }, armR: { x: 0.08, y: 0, z: -0.12 },
    legL: { x: 0 }, legR: { x: 0 }, shinL: { x: 0.06 }, shinR: { x: 0.06 },
  },
};

// Activity -> base pose (agents). The CEO maps its behaviours to poses
// in ceo.js; the animator itself is activity-agnostic.
export const ACTIVITY_POSES = {
  WORKING: 'sitType',
  THINKING: 'sitThink',
  IDLE: 'sitIdle',
  WALKING: 'stand',
  INTERACTING: 'sitInteract',
  RESTING: 'sitSleep',
  OFFLINE: 'sitIdle',
};

function mergePose(name) {
  const p = POSES[name] || NEUTRAL;
  return {
    bodyY: p.bodyY ?? NEUTRAL.bodyY,
    bodyRX: p.bodyRX ?? 0, bodyRZ: p.bodyRZ ?? 0,
    head: { ...NEUTRAL.head, ...(p.head || {}) },
    armL: { ...NEUTRAL.armL, ...(p.armL || {}) },
    armR: { ...NEUTRAL.armR, ...(p.armR || {}) },
    legL: { ...NEUTRAL.legL, ...(p.legL || {}) },
    legR: { ...NEUTRAL.legR, ...(p.legR || {}) },
    shinL: { ...NEUTRAL.shinL, ...(p.shinL || {}) },
    shinR: { ...NEUTRAL.shinR, ...(p.shinR || {}) },
  };
}

const damp = THREE.MathUtils.damp;

export function createAnimator(rig) {
  const j = rig.joints;
  let poseName = 'sitIdle';
  let target = mergePose(poseName);
  let activity = 'IDLE';
  let frozen = false;      // OFFLINE: hold the pose, no procedural motion
  let walkPhase = 0;
  let moveBlend = 0;       // 0 = pose only, 1 = full walk cycle

  function setPose(name) {
    if (!POSES[name]) return;
    poseName = name;
    target = mergePose(name);
  }

  function setActivity(next, poseOverride) {
    activity = next;
    frozen = next === 'OFFLINE';
    if (poseOverride) setPose(poseOverride);
    else setPose(ACTIVITY_POSES[next] || 'sitIdle');
  }

  // motion: { moving: bool, speed: units/s } — supplied by the behaviour
  // controller (activity system / CEO controller).
  function update(dt, t, motion = {}) {
    const moving = !!motion.moving;
    moveBlend = damp(moveBlend, moving ? 1 : 0, 5, dt);
    if (moving) walkPhase += dt * (motion.speed || 1) * 4.2;

    const k = 6; // joint damping rate — smooth transitions between poses
    const jx = (joint, axis, value) => { joint.rotation[axis] = damp(joint.rotation[axis], value, k, dt); };

    // body height + lean/slump
    j.body.position.y = damp(j.body.position.y, target.bodyY, 4, dt);
    j.body.rotation.x = damp(j.body.rotation.x, target.bodyRX, 4, dt);
    j.body.rotation.z = damp(j.body.rotation.z, target.bodyRZ, 4, dt);

    // head
    jx(j.head, 'x', target.head.x);
    jx(j.head, 'y', target.head.y);
    jx(j.head, 'z', target.head.z);

    // arms — procedural layers override the pose target where relevant
    let armLx = target.armL.x, armRx = target.armR.x;
    let armLz = target.armL.z, armRz = target.armR.z;
    if (!frozen) {
      if (poseName === 'sitType') { // typing: alternating small key presses
        armLx += Math.sin(t * 11) * 0.05;
        armRx += Math.sin(t * 11 + 1.3) * 0.05;
      }
      if (poseName === 'standGreet') armRz = 2.3 + Math.sin(t * 6) * 0.35; // wave
      if (poseName === 'standCoffee') armRx = -1.05 - Math.max(0, Math.sin(t * 0.9)) * 0.55; // sip
      if (moveBlend > 0.01) { // walk swing blends in over the pose
        const s = Math.sin(walkPhase);
        armLx = armLx * (1 - moveBlend) + (-0.3 * s) * moveBlend;
        armRx = armRx * (1 - moveBlend) + (0.3 * s) * moveBlend;
      }
    }
    jx(j.armL, 'x', armLx); jx(j.armL, 'y', target.armL.y); jx(j.armL, 'z', armLz);
    jx(j.armR, 'x', armRx); jx(j.armR, 'y', target.armR.y); jx(j.armR, 'z', armRz);

    // legs
    let legLx = target.legL.x, legRx = target.legR.x;
    let shinLx = target.shinL.x, shinRx = target.shinR.x;
    if (!frozen && moveBlend > 0.01) {
      const s = Math.sin(walkPhase);
      legLx = legLx * (1 - moveBlend) + (0.55 * s) * moveBlend;
      legRx = legRx * (1 - moveBlend) + (-0.55 * s) * moveBlend;
      shinLx = shinLx * (1 - moveBlend) + (0.25 + Math.max(0, -s) * 0.55) * moveBlend;
      shinRx = shinRx * (1 - moveBlend) + (0.25 + Math.max(0, s) * 0.55) * moveBlend;
    }
    jx(j.legL, 'x', legLx); jx(j.legR, 'x', legRx);
    jx(j.shinL, 'x', shinLx); jx(j.shinR, 'x', shinRx);

    // breathing (torso scale) + walk bob + idle head scan
    const breatheRate = activity === 'RESTING' ? 0.8 : 1.4;
    const breatheAmp = frozen ? 0 : (activity === 'RESTING' ? 0.03 : 0.018);
    j.torso.scale.y = 1 + Math.sin(t * breatheRate) * breatheAmp;
    if (!frozen && moveBlend > 0.01) j.body.position.y += Math.abs(Math.sin(walkPhase)) * 0.03 * moveBlend;
    if (!frozen && (activity === 'IDLE' || poseName === 'standIdle')) {
      j.head.rotation.y = damp(j.head.rotation.y, Math.sin(t * 0.45) * 0.4, 2, dt);
    }
  }

  return {
    setPose, setActivity, update,
    get pose() { return poseName; },
    get activity() { return activity; },
  };
}

// Move a character group toward a target on the floor (x,z) at `speed`.
// Returns { arrived, moving, heading } — heading is the facing rotation.y.
// Shared by the agent activity system and the CEO controller.
export function stepMove(group, tx, tz, speed, dt) {
  const dx = tx - group.position.x;
  const dz = tz - group.position.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.12) return { arrived: true, moving: false, heading: group.rotation.y };
  const step = Math.min(dist, speed * dt);
  group.position.x += (dx / dist) * step;
  group.position.z += (dz / dist) * step;
  const heading = Math.atan2(dx, dz);
  let d = heading - group.rotation.y;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  group.rotation.y += d * Math.min(1, dt * 4);
  return { arrived: false, moving: true, heading, dist };
}
