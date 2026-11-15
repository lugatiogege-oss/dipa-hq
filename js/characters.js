// DIPA HQ — characters.js
// Character factory + placement (Phase 3: jointed rigs + animators).
// Identity is GENERIC by owner rule (Master Prompt Revisi): the 7 workers
// are "Agent 1".."Agent 7" placeholders — no platform/division split, no
// permanent names. All identity/placement data comes from config.js;
// changing a name only touches config + the name tag (see setAgentName).
// CEO is built here too but controlled separately by ceo.js.
import * as THREE from 'three';
import { AGENTS, WORKER_SPOTS, CEO } from './config.js';
import { buildRig } from './rig.js';
import { createAnimator } from './animation.js';
import { nameTag } from './materials.js';

function makeTag(text, color, scale) {
  return nameTag(text, color, scale);
}

export function buildCharacters(scene) {
  const actors = [];
  const pickables = [];
  const byId = {};
  for (const a of AGENTS) byId[a.id] = a;

  for (const [id, x, z, y, rotY] of WORKER_SPOTS) {
    const info = byId[id];
    const rig = buildRig({ suitColor: info.color, badgeColor: '#c8f4ff' });
    const g = rig.group;
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    scene.add(g);
    const tag = makeTag(info.name, '#c8f4ff', 2.6);
    tag.position.set(0, 2.6, 0);
    g.add(tag);
    g.traverse(o => { if (o.isMesh) pickables.push(o); });
    const animator = createAnimator(rig);
    animator.setActivity('WORKING'); // start seated at the workstation
    actors.push({
      id, name: info.name, room: info.room, isCEO: false,
      g, rig, animator, tag, home: { x, z, y, rotY },
      activity: 'WORKING',
    });
  }

  // CEO — DFNX PRIME, separate character on Floor 2 (Executive Office).
  const ceoRig = buildRig({
    suitColor: 0x242a4e, badgeColor: '#8ff3ff', scale: 1.06,
    tie: true, crown: true, hairColor: 0x151d2b,
  });
  const ceoGroup = ceoRig.group;
  ceoGroup.position.set(-6.0, 4.65, -3.4);
  scene.add(ceoGroup);
  const ceoTag = makeTag(CEO.name + ' · ' + CEO.title, '#8ff3ff', 3.4);
  ceoTag.position.set(0, 2.95, 0);
  ceoGroup.add(ceoTag);
  ceoGroup.traverse(o => { if (o.isMesh) pickables.push(o); });
  const ceoAnimator = createAnimator(ceoRig);
  ceoAnimator.setActivity('IDLE', 'standIdle');
  const ceoActor = {
    id: 'ceo', name: CEO.name, room: 'Executive Office', isCEO: true,
    g: ceoGroup, rig: ceoRig, animator: ceoAnimator, tag: ceoTag,
    home: { x: -6.0, z: -3.4, y: 4.65, rotY: 0 },
    activity: 'IDLE',
  };
  actors.push(ceoActor);

  return { actors, pickables, ceoGroup, ceoActor };
}

// Update an agent's display name (Owner Mode path): swaps the floating
// 3D tag and the actor record. The config entry is the source of truth;
// this only reflects a config change in the scene.
export function setAgentName(actor, newName) {
  if (!actor || actor.isCEO) return false;
  actor.name = newName;
  const old = actor.tag;
  const tag = makeTag(newName, '#c8f4ff', 2.6);
  tag.position.copy(old.position);
  actor.g.remove(old);
  if (old.material?.map) old.material.map.dispose();
  if (old.material) old.material.dispose();
  actor.g.add(tag);
  actor.tag = tag;
  return true;
}

// Update the CEO display name (config change reflected in the scene).
export function setCEOName(ceoActor, newName, title) {
  if (!ceoActor || !ceoActor.isCEO) return false;
  ceoActor.name = newName;
  const old = ceoActor.tag;
  const tag = makeTag(newName + ' · ' + (title || CEO.title), '#8ff3ff', 3.4);
  tag.position.copy(old.position);
  ceoActor.g.remove(old);
  if (old.material?.map) old.material.map.dispose();
  if (old.material) old.material.dispose();
  ceoActor.g.add(tag);
  ceoActor.tag = tag;
  return true;
}
