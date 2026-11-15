// DIPA HQ — ui.js
// UI wiring: collapsible panels, nav rail, bottom bar, settings popover, toast.
// Panels are independently collapsible (assignment §7): closing one never
// closes the other. Upgrade/Report are HONEST placeholders for later phases
// (toast says so — no fake functionality). No coins/stamina/gems anywhere.
import { QUALITY } from './performance.js';

export function toast(msg, ms = 2600) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { el.style.display = 'none'; }, ms);
}

export function initPanels() {
  const $ = id => document.getElementById(id);
  for (const [panel, openBtn] of [['leftPanel', 'openLeft'], ['rightPanel', 'openRight']]) {
    const p = $(panel), b = $(openBtn);
    if (!p || !b) continue;
    const closeBtn = p.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => { p.classList.add('hidden'); b.classList.add('show'); };
    b.onclick = () => { p.classList.remove('hidden'); b.classList.remove('show'); };
  }
}

export function initNav(cam) {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.dataset.nav;
      document.querySelectorAll('[data-nav]').forEach(n => n.classList.remove('active'));
      el.classList.add('active');
      switch (action) {
        case 'overview': cam.focus('default'); break;
        case 'agents': {
          const p = document.getElementById('leftPanel');
          const b = document.getElementById('openLeft');
          if (p && p.classList.contains('hidden')) { p.classList.remove('hidden'); b.classList.remove('show'); }
          cam.focus('floor1');
          break;
        }
        case 'buildings': cam.focus('default'); break;
        case 'research': cam.focus('research'); break;
        case 'missions': cam.focus('mission'); break;
        case 'analytics': cam.focus('security'); break;
        case 'settings': toggleMenu('settingsMenu'); break;
      }
    });
  });
}

export function toggleMenu(id) {
  const m = document.getElementById(id);
  if (!m) return;
  const wasOpen = m.classList.contains('show');
  document.querySelectorAll('.popover.show').forEach(p => p.classList.remove('show'));
  if (!wasOpen) m.classList.add('show');
}

export function initCameraButtons(cam) {
  const $ = id => document.getElementById(id);
  const reset = $('reset'), zi = $('zoomIn'), zo = $('zoomOut');
  if (reset) reset.onclick = () => cam.reset();
  if (zi) zi.onclick = () => cam.zoom(0.85);
  if (zo) zo.onclick = () => cam.zoom(1.18);
}

export function initBottomBar(cam) {
  const $ = id => document.getElementById(id);
  const camBtn = $('camBtn');
  if (camBtn) camBtn.onclick = () => toggleMenu('camMenu');
  document.querySelectorAll('#camMenu [data-view]').forEach(el => {
    el.addEventListener('click', () => {
      const v = el.dataset.view;
      if (v === 'zoomIn') cam.zoom(0.85);
      else if (v === 'zoomOut') cam.zoom(1.18);
      else cam.focus(v);
      document.getElementById('camMenu').classList.remove('show');
    });
  });
  const up = $('upgradeBtn');
  if (up) up.onclick = () => toast('Fitur Upgrade belum tersedia — direncanakan Fase 5');
  const rep = $('reportBtn');
  if (rep) rep.onclick = () => toast('Fitur Report belum tersedia — direncanakan Fase 5');
  const menu = $('menuBtn');
  if (menu) menu.onclick = () => {
    const rail = document.getElementById('navRail');
    if (rail) rail.classList.toggle('rail-hidden');
    toast(rail && rail.classList.contains('rail-hidden') ? 'Navigasi disembunyikan' : 'Navigasi ditampilkan');
  };
}

export function initSettings(currentLevel, onChange) {
  const gear = document.getElementById('gearBtn');
  if (gear) gear.onclick = () => toggleMenu('settingsMenu');
  document.querySelectorAll('#settingsMenu [data-quality]').forEach(el => {
    el.addEventListener('click', () => {
      const level = el.dataset.quality;
      if (!QUALITY[level]) return;
      onChange(level);
      document.querySelectorAll('#settingsMenu [data-quality]').forEach(n => n.classList.toggle('active', n === el));
      toast('Kualitas grafis: ' + level + (level === 'ULTRA' ? ' (antialias aktif saat reload)' : ''));
    });
  });
  // mark current level
  document.querySelectorAll('#settingsMenu [data-quality]').forEach(n => {
    n.classList.toggle('active', n.dataset.quality === currentLevel);
  });
  // close popovers when clicking the 3D canvas
  document.getElementById('scene')?.addEventListener('pointerdown', () => {
    document.querySelectorAll('.popover.show').forEach(p => p.classList.remove('show'));
  });
}

export function setRoutine(text) {
  const el = document.getElementById('routine');
  if (el) el.textContent = text;
}
