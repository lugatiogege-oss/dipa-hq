// DIPA HQ — activity.js
// Agent activity state machine (Phase 3). States: IDLE, WORKING,
// THINKING, WALKING, INTERACTING, RESTING, OFFLINE.
// The schedule is VISUAL SIMULATION ONLY — it drives the animation, not
// a real platform connection. Integration status stays UNKNOWN /
// NOT CONNECTED (see status.js); the directory labels activity as
// SIMULATION so no fake "working" status is ever claimed.
//
// Default cycle (seeded RNG, staggered per agent so the office is not
// synchronised): WORKING (typing) -> THINKING -> WORKING -> IDLE ->
// WALKING (seat -> room point, interact there, walk back) -> WORKING...
// RESTING and OFFLINE are not in the default cycle; they can be assigned
// via setActivity (e.g. by Owner Mode later, or the debug API).
import { WALK_TARGETS } from './config.js';
import { stepMove } from './animation.js';

export const ACTIVITIES = ['IDLE', 'WORKING', 'THINKING', 'WALKING', 'INTERACTING', 'RESTING', 'OFFLINE'];

const WALK_SPEED = 1.15; // units/s

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = (rng, a, b) => a + rng() * (b - a);

export function createActivitySystem(actors, onChange) {
  const agents = actors.filter(a => !a.isCEO);
  const states = new Map();

  // Staggered start: the first frame already shows a mix of activities.
  const initial = ['WORKING', 'THINKING', 'WORKING', 'IDLE', 'WORKING', 'THINKING', 'WORKING'];
  agents.forEach((a, i) => {
    const rng = mulberry32(1000 + i * 77);
    const start = initial[i % initial.length];
    states.set(a.id, {
      actor: a, rng, state: start, timer: rand(rng, 4, 12),
      phase: 'at-seat', moving: false, speed: 0, forced: false,
    });
    a.activity = start;
    a.animator.setActivity(start);
  });

  function setState(s, next, timer, phase = 'at-seat', poseOverride) {
    s.state = next;
    s.timer = timer;
    s.phase = phase;
    s.actor.activity = next;
    s.actor.animator.setActivity(next, poseOverride);
    if (onChange) onChange(s.actor.id, next);
  }

  // Force a state (debug API / future Owner Mode). Walking is forced as a
  // full excursion (seat -> target -> back); other states snap the agent
  // home and hold the pose until the cycle resumes.
  function setActivity(id, next) {
    const s = states.get(id);
    if (!s || !ACTIVITIES.includes(next)) return false;
    const a = s.actor;
    if (next === 'WALKING') {
      s.forced = true;
      setState(s, 'WALKING', 60, 'to');
      return true;
    }
    s.forced = true;
    s.moving = false;
    a.g.position.set(a.home.x, a.home.y, a.home.z);
    a.g.rotation.y = a.home.rotY;
    setState(s, next, next === 'RESTING' || next === 'OFFLINE' ? 3600 : rand(s.rng, 6, 12));
    return true;
  }

  function resume(id) {
    const s = states.get(id);
    if (!s) return false;
    s.forced = false;
    setState(s, 'WORKING', rand(s.rng, 8, 14));
    return true;
  }

  function update(dt, t) {
    for (const s of states.values()) {
      const a = s.actor;
      if (s.state === 'RESTING' || s.state === 'OFFLINE') {
        // Held states: pose only, no schedule advance (until resumed).
        a.animator.update(dt, t, { moving: false });
        continue;
      }
      s.timer -= dt;

      if (s.state === 'WALKING') {
        // Safety: a walk that cannot finish (blocked path) snaps home
        // instead of walking forever.
        if (s.timer <= 0) {
          a.g.position.set(a.home.x, a.home.y, a.home.z);
          a.g.rotation.y = a.home.rotY;
          setState(s, 'WORKING', rand(s.rng, 10, 16), 'at-seat');
          continue;
        }
        const target = s.phase === 'to'
          ? WALK_TARGETS[a.id]
          : [a.home.x, a.home.z];
        const r = stepMove(a.g, target[0], target[1], WALK_SPEED, dt);
        s.moving = r.moving;
        a.animator.update(dt, t, { moving: r.moving, speed: WALK_SPEED });
        if (r.arrived) {
          if (s.phase === 'to') {
            // Arrived at the room point: interact while STANDING (no chair
            // here — sitInteract would crouch mid-air).
            s.phase = 'at';
            setState(s, 'INTERACTING', rand(s.rng, 4, 7), 'at', 'standInteract');
            // face the room centre / nearest workstation area
            const cx = a.home.x < 0 ? a.home.x + 2 : a.home.x - 2;
            a.g.rotation.y = Math.atan2(cx - a.g.position.x, 0 - a.g.position.z);
          } else {
            // Back at the seat: sit down and resume work.
            s.phase = 'at-seat';
            a.g.position.set(a.home.x, a.home.y, a.home.z);
            a.g.rotation.y = a.home.rotY;
            setState(s, 'WORKING', rand(s.rng, 10, 16), 'at-seat');
          }
        }
        continue;
      }

      // Seated states: keep the agent at its seat (safety: a forced
      // WALKING that was interrupted snaps back on the next transition).
      a.animator.update(dt, t, { moving: false });

      if (s.timer > 0) continue;
      if (s.forced) { s.forced = false; }
      switch (s.state) {
        case 'WORKING':
          setState(s, s.rng() < 0.6 ? 'THINKING' : 'IDLE', rand(s.rng, 5, 8));
          break;
        case 'THINKING':
          setState(s, 'WORKING', rand(s.rng, 10, 16));
          break;
        case 'IDLE':
          if (s.rng() < 0.5) setState(s, 'WALKING', 60, 'to');
          else setState(s, 'WORKING', rand(s.rng, 10, 16));
          break;
        case 'INTERACTING':
          // Interaction happened at the walk target: walk back to the seat.
          setState(s, 'WALKING', 60, 'back');
          break;
        default:
          setState(s, 'WORKING', rand(s.rng, 10, 16));
      }
    }
  }

  return {
    update, setActivity, resume,
    getActivity: (id) => states.get(id)?.state || null,
    getAll: () => Object.fromEntries([...states.entries()].map(([id, s]) => [id, s.state])),
  };
}
