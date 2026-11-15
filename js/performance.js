// DIPA HQ — performance.js
// Quality levels (assignment §9): PERFORMANCE / BALANCED / ULTRA.
// Mobile defaults to PERFORMANCE. Antialias is fixed at renderer creation,
// so a quality change applies pixel ratio + shadows immediately and
// antialias on the next load (stored in localStorage — a visual setting,
// not a secret).
export const QUALITY = {
  PERFORMANCE: { pixelRatio: 1.0, shadows: false, antialias: false },
  BALANCED: { pixelRatio: 1.5, shadows: true, antialias: true },
  ULTRA: { pixelRatio: 2.0, shadows: true, antialias: true },
};

export function detectDefaultQuality() {
  const mobile = innerWidth < 700 || 'ontouchstart' in window;
  return mobile ? 'PERFORMANCE' : 'BALANCED';
}

export function loadQuality() {
  try {
    const saved = localStorage.getItem('dipa-hq-quality');
    if (saved && QUALITY[saved]) return saved;
  } catch (e) { /* storage unavailable — use default */ }
  return detectDefaultQuality();
}

export function saveQuality(level) {
  try { localStorage.setItem('dipa-hq-quality', level); } catch (e) { /* ignore */ }
}

export function applyQuality(renderer, level) {
  const q = QUALITY[level];
  if (!q) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, q.pixelRatio));
  renderer.shadowMap.enabled = q.shadows;
  // materials need a refresh when shadows toggle
  renderer.shadowMap.needsUpdate = true;
  return q;
}
