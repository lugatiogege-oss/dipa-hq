// DIPA HQ — status.js
// Agent Directory data + rendering (Phase 3: generic identities).
// Identity is GENERIC by owner rule: 7 placeholder agents, no division
// split, roles unassigned until the Owner sets them (config.js is the
// source of truth). Statuses are HONEST: integration UNKNOWN /
// NOT CONNECTED until real platform integration exists (assignment §4, §10).
// No agent activity is fabricated — the activity shown is the VISUAL
// SIMULATION that drives the animation (see activity.js), labelled
// SIMULATION in the panel so it is never mistaken for live status.
import { AGENTS } from './config.js';

const ACTIVITY_STYLE = {
  WORKING: { color: '#64e2ff', border: '#64e2ff66' },
  THINKING: { color: '#c9a8ff', border: '#c9a8ff66' },
  IDLE: { color: '#9bb3c8', border: '#9bb3c866' },
  WALKING: { color: '#7dffd4', border: '#7dffd466' },
  INTERACTING: { color: '#f4d28f', border: '#f4d28f66' },
  RESTING: { color: '#8fa8d8', border: '#8fa8d866' },
  OFFLINE: { color: '#ff9d9d', border: '#ff9d9d66' },
};

let currentActivities = {};

export function renderDirectory(onSelect) {
  const host = document.getElementById('workers');
  if (!host) return;
  // Fresh DOM: forget cached states so the next updateActivities call
  // rewrites every tag (otherwise a re-render leaves stale "—" tags).
  currentActivities = {};
  host.innerHTML = `
    <div class="division"><span>AGENTS</span><span>07 AGENTS</span></div>
    <div class="dir-note">Identitas generik sementara (placeholder) — nama &amp; role diatur Owner via Owner Mode. Aktivitas di bawah ini adalah SIMULATION visual, bukan status live.</div>
    ${AGENTS.map((e, i) => `
      <div class="worker" data-id="${e.id}" data-label="${e.name}">
        <div class="avatar">${i + 1}</div>
        <div><b>${e.name}</b><small>${e.role} · ${e.room}</small></div>
        <span class="tag act-tag" data-act="${e.id}">—</span>
      </div>`).join('')}
  `;
  host.querySelectorAll('.worker').forEach(el => {
    el.addEventListener('click', () => onSelect && onSelect(el.dataset.label));
  });
}

// Update the per-agent activity tags (called from the main loop on change
// only — DOM writes are skipped when nothing changed).
export function updateActivities(map) {
  let changed = false;
  for (const [id, state] of Object.entries(map)) {
    if (currentActivities[id] === state) continue;
    currentActivities[id] = state;
    changed = true;
    const el = document.querySelector(`.act-tag[data-act="${id}"]`);
    if (!el) continue;
    el.textContent = state;
    const style = ACTIVITY_STYLE[state] || ACTIVITY_STYLE.IDLE;
    el.style.color = style.color;
    el.style.borderColor = style.border;
  }
  return changed;
}
