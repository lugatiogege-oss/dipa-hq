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

export function initPanels() {  const $ = id => document.getElementById(id);
  for (const [panel, openBtn] of [['leftPanel', 'openLeft'], ['rightPanel', 'openRight']]) {
    const p = $(panel), b = $(openBtn);
    if (!p || !b) continue;
    const closeBtn = p.querySelector('.close');
    if (closeBtn) closeBtn.onclick = () => { p.classList.add('hidden'); b.classList.add('show'); };
    b.onclick = () => { p.classList.remove('hidden'); b.classList.remove('show'); };
  }
}

// --- Nav rail visibility (shared by initNav + initBottomBar) ---
// One function for every toggle path so the rail and the floating ☰
// reopen button can never drift out of sync.
const NAV_HIDDEN_KEY = 'dipa-hq-nav-hidden';
export function setNavHidden(hidden, save = true) {
  const rail = document.getElementById('navRail');
  const openNav = document.getElementById('openNav');
  if (!rail) return hidden;
  rail.classList.toggle('rail-hidden', hidden);
  if (openNav) openNav.classList.toggle('show', hidden);
  if (save) { try { localStorage.setItem(NAV_HIDDEN_KEY, hidden ? '1' : '0'); } catch (_) {} }
  return hidden;
}
export function navIsHidden() {
  const rail = document.getElementById('navRail');
  return !!rail && rail.classList.contains('rail-hidden');
}

export function initNav(cam) {
  // --- Nav rail hide/show (owner report 2026-11-16 ~02:56 WIB: the rail
  // covers most of the phone screen and could not be hidden). Three ways
  // to toggle, all through setNavHidden so the rail + floating reopen
  // button always stay in sync: (1) the ‹ button on the rail itself,
  // (2) the Menu button in the bottom bar (initBottomBar), (3) the
  // floating ☰ button at the rail's spot. State persists in localStorage
  // (dipa-hq-nav-hidden), like the quality setting.
  const rail = document.getElementById('navRail');
  const openNav = document.getElementById('openNav');
  const collapseBtn = document.getElementById('navCollapse');
  let storedHidden = false;
  try { storedHidden = localStorage.getItem(NAV_HIDDEN_KEY) === '1'; } catch (_) {}
  setNavHidden(storedHidden, false);
  if (collapseBtn) collapseBtn.onclick = () => {
    setNavHidden(true);
    toast('Navigasi disembunyikan — ketuk ☰ di kiri atas untuk membuka lagi');
  };
  if (openNav) openNav.onclick = () => setNavHidden(false);

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
    const hidden = setNavHidden(!navIsHidden());
    toast(hidden ? 'Navigasi disembunyikan — ketuk ☰ di kiri atas untuk membuka lagi' : 'Navigasi ditampilkan');
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
      markQuality(level);
      toast('Kualitas grafis: ' + level + (level === 'ULTRA' ? ' (antialias aktif saat reload)' : ''));
    });
  });
  // mark current level
  markQuality(currentLevel);
  // close popovers when clicking the 3D canvas
  document.getElementById('scene')?.addEventListener('pointerdown', () => {
    document.querySelectorAll('.popover.show').forEach(p => p.classList.remove('show'));
  });
}

// Perf fix: let the adaptive monitor (main.js) reflect an automatic
// step-down in the settings menu, so the shown level is always honest.
export function markQuality(level) {
  document.querySelectorAll('#settingsMenu [data-quality]').forEach(n => {
    n.classList.toggle('active', n.dataset.quality === level);
  });
}

export function setRoutine(text) {
  const el = document.getElementById('routine');
  if (el) el.textContent = text;
}
