// DIPA HQ — ceo.js
// CEO controller for DFNX PRIME (Phase 3: full behaviour system).
// Adapted from v1's patrol/sleep logic, rebuilt on the shared rig +
// animator (see rig.js / animation.js).
//
// Rest 00:00–07:00 WIB: the CEO SLEEPS at the executive desk (slumped
// pose + Zzz tag). The CEO NEVER disappears while resting.
// Daytime behaviour cycle (each with a visible activity + props):
//   READ (sit at desk, read reports) -> SUPERVISE (stand at the glass
//   viewing area, observe Floor 1) -> INSPECT (walk the Floor 2
//   waypoints) -> POINT (board room, point at the screen wall) ->
//   PHONE (near the desk, phone call) -> COFFEE (executive lounge,
//   drink coffee) -> GREET (viewing area, wave at the agents) -> READ...
// Name/title come from config.js so they can be edited without touching
// the character identity.
import * as THREE from 'three';
import { CEO_WAYPOINTS, CEO_SPOTS } from './config.js';
import { stepMove } from './animation.js';
import { nameTag } from './materials.js';

const WALK_SPEED = 1.0;
const ROUTINE_LABELS = {
  SLEEP: 'Sleeping',
  READ: 'Membaca laporan',
  SUPERVISE: 'Mengawasi kantor',
  INSPECT: 'Inspeksi',
  POINT: 'Memeriksa papan info',
  PHONE: 'Telepon',
  COFFEE: 'Istirahat kopi',
  GREET: 'Menyapa agent',
};

// Behaviour -> { pose, spot, duration(s), props }
const BEHAVIOURS = {
  READ: { pose: 'standRead', seated: true, spot: 'desk', dur: 20, props: ['report'] },
  SUPERVISE: { pose: 'standIdle', spot: 'viewing', dur: 14, props: [] },
  POINT: { pose: 'standPoint', spot: 'board', dur: 12, props: [] },
  PHONE: { pose: 'standPhone', spot: 'phone', dur: 14, props: ['phone'] },
  COFFEE: { pose: 'standCoffee', spot: 'lounge', dur: 16, props: ['cup'] },
  GREET: { pose: 'standGreet', spot: 'viewing', dur: 10, props: [] },
};
const CYCLE = ['READ', 'SUPERVISE', 'INSPECT', 'POINT', 'PHONE', 'COFFEE', 'GREET'];

export function createCEOController(ceoActor, onRoutine) {
  const g = ceoActor.g;
  const animator = ceoActor.animator;
  const props = ceoActor.rig.props;

  const zzz = nameTag('Z z z', '#9db8ff', 1.6);
  zzz.position.set(0.4, 2.6, 0);
  zzz.visible = false;
  g.add(zzz);

  let behaviour = 'READ';
  let sleeping = false;
  let timer = 18;
  let cycleIdx = 0;
  let wpIndex = 0;
  let travelling = false; // walking toward the current behaviour's spot
  let hourOverride = null; // debug: mock the hour (verification only)
  let forced = false;

  function showProps(list) {
    props.phone.visible = list.includes('phone');
    props.cup.visible = list.includes('cup');
    props.report.visible = list.includes('report');
  }

  function setRoutine(text) {
    if (onRoutine) onRoutine(text);
  }

  function startBehaviour(name) {
    behaviour = name;
    const b = BEHAVIOURS[name];
    timer = b.dur;
    travelling = true;
    showProps(b.props);
    // READ is seated at the desk with the report; other behaviours stand.
    animator.setActivity('IDLE', name === 'READ' ? 'sitRead' : b.pose);
    setRoutine(ROUTINE_LABELS[name]);
  }

  function update(dt, hour, elapsed) {
    const h = hourOverride !== null ? hourOverride : hour;
    sleeping = h >= 0 && h < 7;
    if (sleeping) {
      if (behaviour !== 'SLEEP') {
        behaviour = 'SLEEP';
        showProps([]);
        zzz.visible = true;
        setRoutine(ROUTINE_LABELS.SLEEP);
      }
      // slumped at the executive desk — never disappears
      const [dx, dz] = CEO_SPOTS.desk;
      g.position.x = THREE.MathUtils.damp(g.position.x, dx, 1.2, dt);
      g.position.z = THREE.MathUtils.damp(g.position.z, dz, 1.2, dt);
      g.position.y = 4.65;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.PI, 2, dt);
      animator.setActivity('RESTING', 'sitSleep');
      animator.update(dt, elapsed, { moving: false });
      return { sleeping, routine: ROUTINE_LABELS.SLEEP, behaviour: 'SLEEP' };
    }
    zzz.visible = false;

    if (behaviour === 'SLEEP') { // woke up: restart the daytime cycle
      behaviour = 'READ';
      cycleIdx = 0;
      startBehaviour('READ');
    }

    if (behaviour === 'INSPECT') {
      // Walk the Floor 2 waypoints, pausing briefly at each.
      const [tx, tz] = CEO_WAYPOINTS[wpIndex];
      const r = stepMove(g, tx, tz, WALK_SPEED, dt);
      animator.setActivity('WALKING', 'stand');
      animator.update(dt, elapsed, { moving: r.moving, speed: WALK_SPEED });
      if (r.arrived) {
        timer -= dt;
        animator.setActivity('IDLE', 'standIdle');
        animator.update(dt, elapsed, { moving: false });
        if (timer <= 0) {
          wpIndex = (wpIndex + 1) % CEO_WAYPOINTS.length;
          timer = 3;
          if (wpIndex === 0) {
            cycleIdx = (CYCLE.indexOf('INSPECT') + 1) % CYCLE.length;
            startBehaviour(CYCLE[cycleIdx]);
          }
        }
      } else {
        timer = 3; // reset the pause timer while still walking
      }
      return { sleeping, routine: ROUTINE_LABELS.INSPECT, behaviour: 'INSPECT' };
    }

    const b = BEHAVIOURS[behaviour];
    const [sx, sz, srot] = CEO_SPOTS[b.spot];
    if (travelling) {
      const r = stepMove(g, sx, sz, WALK_SPEED, dt);
      animator.setActivity('WALKING', 'stand');
      animator.update(dt, elapsed, { moving: r.moving, speed: WALK_SPEED });
      if (r.arrived) {
        travelling = false;
        g.rotation.y = srot;
        // READ is seated: switch to the seated reading pose.
        if (behaviour === 'READ') animator.setActivity('IDLE', 'sitRead');
        else animator.setActivity('IDLE', b.pose);
      }
      return { sleeping, routine: ROUTINE_LABELS[behaviour], behaviour };
    }

    // At the spot: hold the behaviour pose.
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, srot, 3, dt);
    if (behaviour === 'READ') animator.setActivity('IDLE', 'sitRead');
    else animator.setActivity('IDLE', b.pose);
    animator.update(dt, elapsed, { moving: false });
    timer -= dt;
    if (timer <= 0 && !forced) {
      cycleIdx = (CYCLE.indexOf(behaviour) + 1) % CYCLE.length;
      const next = CYCLE[cycleIdx];
      if (next === 'INSPECT') {
        behaviour = 'INSPECT';
        wpIndex = 0;
        timer = 3;
        showProps([]);
        setRoutine(ROUTINE_LABELS.INSPECT);
      } else {
        startBehaviour(next);
      }
    }
    return { sleeping, routine: ROUTINE_LABELS[behaviour], behaviour };
  }

  return {
    update,
    getRoutine: () => (sleeping ? ROUTINE_LABELS.SLEEP : ROUTINE_LABELS[behaviour]),
    getBehaviour: () => (sleeping ? 'SLEEP' : behaviour),
    isSleeping: () => sleeping,
    // Debug / verification: force a daytime behaviour (hour mock too).
    // Name matching is case-insensitive ('point' and 'POINT' both work).
    setBehaviour: (name) => {
      const n = String(name || '').toUpperCase();
      if (!BEHAVIOURS[n] && n !== 'INSPECT') return false;
      forced = true;
      if (n === 'INSPECT') {
        behaviour = 'INSPECT'; wpIndex = 0; timer = 3; showProps([]);
        setRoutine(ROUTINE_LABELS.INSPECT);
      } else startBehaviour(n);
      return true;
    },
    clearForced: () => { forced = false; },
    setHour: (h) => { hourOverride = h; },
    clearHour: () => { hourOverride = null; },
  };
}
