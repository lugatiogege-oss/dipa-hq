// DIPA HQ — camera.js
// Camera controller: smooth damped focus moves (no hard cuts), reset, zoom.
// Focus presets map to rooms/areas (assignment §8: optional room selection
// and camera focus). Default view shows the whole two-floor HQ.
import * as THREE from 'three';

export const VIEWS = {
  default: { pos: [22, 17, 26], target: [0, 4.1, 0] },
  floor1: { pos: [16, 3.0, 22], target: [0, 2.0, 0] },
  floor2: { pos: [16, 6.8, 22], target: [0, 6.0, 0] },
  entrance: { pos: [8, 2.4, 26], target: [0, 1.8, 7.5] },
  top: { pos: [16, 20, 16], target: [0, 4.2, 0] }, // open-top dollhouse view (roof removed 2026-11-16): looks down INTO the building
  research: { pos: [-14, 3.0, 14], target: [-7, 2.0, -4.5] },
  mission: { pos: [10, 3.0, 20], target: [0, 2.0, -4.5] },
  boardroom: { pos: [14, 7.0, 20], target: [4.5, 6.2, -4.2] },
  security: { pos: [14, 3.2, 20], target: [7.5, 2.0, 4.5] },
  ceo: { pos: [-14, 8, 14], target: [-6, 5.8, -3.5] }, // close-up: executive office desk, through the front glass
};

export function createCameraController(camera, controls) {
  const desiredPos = new THREE.Vector3(...VIEWS.default.pos);
  const desiredTarget = new THREE.Vector3(...VIEWS.default.target);
  let tweening = false;

  function focus(name) {
    const v = VIEWS[name];
    if (!v) return false;
    desiredPos.set(...v.pos);
    desiredTarget.set(...v.target);
    tweening = true;
    return true;
  }

  function reset() { return focus('default'); }

  function zoom(factor) {
    // dolly toward/away from the current target (v3 pattern, smoothed by damping)
    const dir = camera.position.clone().sub(controls.target).multiplyScalar(factor);
    const len = THREE.MathUtils.clamp(dir.length(), controls.minDistance, controls.maxDistance);
    dir.setLength(len);
    desiredPos.copy(controls.target).add(dir);
    tweening = true;
  }

  function update(dt) {
    if (!tweening) return;
    const k = 1 - Math.exp(-3.2 * dt);
    camera.position.lerp(desiredPos, k);
    controls.target.lerp(desiredTarget, k);
    if (camera.position.distanceTo(desiredPos) < 0.05 && controls.target.distanceTo(desiredTarget) < 0.05) {
      tweening = false;
    }
  }

  // user drag cancels the tween so OrbitControls stays in charge
  controls.addEventListener('start', () => { tweening = false; });

  return { focus, reset, zoom, update, views: VIEWS };
}
