// DIPA HQ — environment.js
// Environment animation system (Phase 3). All motion is delta-time
// based and subtle — the page must stay light enough to share.
// Animated: helicopter main + tail rotors, fountain jets + water,
// helipad neon ring, entrance glow, night-city window twinkle,
// workstation monitor activity (per-screen emissive pulse),
// mission-wall globe rotation, reception glass doors (periodic slide).
// NOTE: interior accent lights are owned by lighting.js (day/night
// scaling) and are deliberately NOT touched here.
export function createEnvironment(refs) {
  const { rotorMain, rotorTail, fountain, neonRing, entranceGlow, cityMats, screens, globe, doors } = refs;
  let rotorAngle = 0;
  let doorTimer = 0;
  let doorPhase = 'closed'; // closed -> opening -> open -> closing -> closed
  let doorOpen = 0; // 0 = shut, 1 = fully open
  // Perf fix: the pulse parts below touched ~60 materials every frame.
  // They now update at most every 0.1 s (10 Hz) — the eye cannot tell
  // the difference on a slow sine pulse, and the CPU churn drops ~10x.
  // Rotor/door/globe stay per-frame (cheap transforms, visible motion).
  let pulseAcc = 0;
  let pulseEnabled = true;

  function update(dt, t) {
    // helicopter rotors (visible spin)
    if (rotorMain) { rotorMain.rotation.y += dt * 7.5; rotorAngle = rotorMain.rotation.y; }
    if (rotorTail) rotorTail.rotation.x += dt * 12;

    // mission-wall globe: slow rotation
    if (globe) globe.rotation.y += dt * 0.25;

    // reception glass doors: slide open briefly every ~26 s
    if (doors) {
      doorTimer += dt;
      if (doorPhase === 'closed' && doorTimer > 22) { doorPhase = 'opening'; doorTimer = 0; }
      else if (doorPhase === 'opening') {
        doorOpen = Math.min(1, doorOpen + dt * 1.2);
        if (doorOpen >= 1) { doorPhase = 'open'; doorTimer = 0; }
      } else if (doorPhase === 'open' && doorTimer > 5) { doorPhase = 'closing'; doorTimer = 0; }
      else if (doorPhase === 'closing') {
        doorOpen = Math.max(0, doorOpen - dt * 1.2);
        if (doorOpen <= 0) { doorPhase = 'closed'; doorTimer = 0; }
      }
      doors.left.position.x = -0.75 - doorOpen * 0.55;
      doors.right.position.x = 0.75 + doorOpen * 0.55;
    }

    // --- 10 Hz pulse section (fountain jets, neon, city twinkle, screens) ---
    pulseAcc += dt;
    if (!pulseEnabled || pulseAcc < 0.1) return;
    pulseAcc = 0;
    updatePulse(t);
  }

  function updatePulse(t) {
    // fountain: pulsing jets + shimmering water
    if (fountain) {
      const p = Math.sin(t * 2.6);
      if (fountain.jet) fountain.jet.scale.y = 1 + 0.14 * p;
      if (fountain.crown) fountain.crown.position.y = 2.25 + 0.08 * Math.sin(t * 2.6 + 0.5);
      if (fountain.sideL) fountain.sideL.scale.y = 1 + 0.12 * Math.sin(t * 2.6 + 1.2);
      if (fountain.sideR) fountain.sideR.scale.y = 1 + 0.12 * Math.sin(t * 2.6 + 2.1);
      if (fountain.water) fountain.water.emissiveIntensity = 0.6 + 0.25 * Math.sin(t * 1.7);
    }

    // neon / glow pulse (subtle)
    if (neonRing) neonRing.material.emissiveIntensity = 1.2 + 0.35 * Math.sin(t * 1.8);
    if (entranceGlow) entranceGlow.intensity = 0.8 + 0.2 * Math.sin(t * 1.3);

    // night-city window twinkle (per texture group — see scene.js)
    if (cityMats) {
      for (let i = 0; i < cityMats.length; i++) {
        cityMats[i].emissiveIntensity = 0.45 + 0.18 * Math.sin(t * 0.6 + i * 1.7);
      }
    }

    // workstation monitors: independent activity flicker
    if (screens) {
      for (const s of screens) {
        s.mat.emissiveIntensity = s.base * (0.8 + 0.35 * Math.abs(Math.sin(t * s.speed + s.phase)));
      }
    }
  }

  return {
    update,
    setPulseEnabled: (v) => { pulseEnabled = !!v; },
    getState: () => ({
      rotorAngle,
      doorPhase,
      doorOpen: +doorOpen.toFixed(2),
      fountainJet: fountain?.jet ? fountain.jet.scale.y : null,
    }),
  };
}
