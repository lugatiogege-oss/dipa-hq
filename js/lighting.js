// DIPA HQ — lighting.js
// Real-time day/night system (adapted from v1's smooth cycle, windows
// aligned to assignment §6). Asia/Jakarta, updates automatically.
// 05:00–06:59 Sunrise · 07:00–15:59 Day · 16:00–17:59 Sunset · 18:00–04:59 Night.
import * as THREE from 'three';
import { COLORS, phaseForHour } from './config.js';

function getJakarta() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23', weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
  }).formatToParts(new Date());
  const o = {};
  parts.forEach(p => { o[p.type] = p.value; });
  return {
    h: +o.hour, m: +o.minute, s: +o.second,
    display: `${o.hour}:${o.minute}:${o.second}`,
    date: `${o.weekday.toUpperCase()} · ${o.day} ${o.month.toUpperCase()} ${o.year}`,
  };
}

function smooth(a, b, x) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

export function createDayNight(ctx) {
  const { scene, sun, hemi, ambient, sunDisc, moonDisc } = ctx;
  const el = {
    time: document.getElementById('time'),
    date: document.getElementById('date'),
    phase: document.getElementById('phase'),
    execTime: document.getElementById('exec-time'),
  };

  function update(interiorLights) {
    const t = getJakarta();
    const h = t.h + t.m / 60 + t.s / 3600;
    const phase = phaseForHour(t.h);
    // smooth factors (v1 logic): day rises 05→08, falls 16→19
    const day = smooth(5, 8, h) * (1 - smooth(16, 19, h));
    const dusk = (smooth(16, 18, h) * (1 - smooth(19, 21, h))) + (smooth(4, 5, h) * (1 - smooth(5, 7, h)));
    const night = 1 - day;

    // sky: night navy -> day blue, blended through dawn/dusk
    const sky = COLORS.nightSky.clone()
      .lerp(COLORS.daySky, day * 0.82)
      .lerp(COLORS.dawnSky, Math.min(1, dusk) * 0.35)
      .lerp(COLORS.duskSky, Math.min(1, dusk) * 0.25);
    scene.background.copy(sky);
    scene.fog.color.copy(sky);

    // sun arc + moon opposite; sun low/warm at night hours
    const ang = ((h - 12) / 12) * Math.PI;
    sun.position.set(Math.cos(ang) * 16, 4 + day * 20, 10);
    sun.intensity = 0.25 + day * 2.8;
    sun.color.set(day > 0.2 ? 0xffe4bf : 0x8397ff);
    sunDisc.position.set(Math.cos(ang) * 55, 6 + day * 42, 30);
    sunDisc.visible = day > 0.05;
    const mang = ang + Math.PI;
    moonDisc.position.set(Math.cos(mang) * 55, 8 + night * 30, -20);
    moonDisc.visible = night > 0.4;

    hemi.intensity = 0.35 + day * 1.3;
    ambient.intensity = 0.15 + day * 0.42;
    // interior lights: on at night, reduced in daylight (monitors stay lit)
    for (const l of interiorLights) l.intensity = 0.25 + night * 1.1;

    if (el.time) el.time.textContent = t.display + ' WIB';
    if (el.date) el.date.textContent = t.date;
    if (el.phase) el.phase.textContent = phase + ' · WIB';
    if (el.execTime) el.execTime.textContent = t.display.slice(0, 5) + ' WIB';
    return { h, phase, day, night };
  }

  return { update, getJakarta };
}
