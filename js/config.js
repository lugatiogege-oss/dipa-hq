// DIPA HQ — config.js
// Identity, palette and layout constants. Single source of truth for names,
// roles, rooms and placement. Owner Mode will read/write this file's data
// (see README §Owner Mode) — do NOT hard-code agent identity elsewhere.
//
// Identity rule (Master Prompt Revisi, owner 2026-11-16 ~00:37 WIB —
// SUPERSEDES the Phase 2 identity correction): agent names are NOT final.
// The 7 workers are GENERIC temporary placeholders "Agent 1".."Agent 7".
// They are NOT assigned to any platform or division. Their name, role,
// display identity, room and spot are all data here so the Owner can
// change them later without touching character code.
// CEO is a SEPARATE character, outside Agent 1–7: DFNX PRIME,
// SUPREME DIRECTOR. Its display name/title live here only; changing them
// must not change the CEO's base identity, avatar or function.
import * as THREE from 'three';

export const THREE_VERSION = '0.180.0';

// --- CEO (separate from Agent 1–7) ---
export const CEO = { name: 'DFNX PRIME', title: 'SUPREME DIRECTOR', level: 1, xp: 0, xpMax: 1000 };

// --- Agents (generic placeholders; roles unassigned until the Owner sets them) ---
// Suit accent per agent is a neutral colour cycle — NOT a division code.
export const AGENTS = [
  { id: 'agent-1', name: 'Agent 1', role: 'Unassigned', room: 'Research Lab', color: 0x145b78 },
  { id: 'agent-2', name: 'Agent 2', role: 'Unassigned', room: 'Mission Control Center', color: 0x473b75 },
  { id: 'agent-3', name: 'Agent 3', role: 'Unassigned', room: 'Main Operations Floor', color: 0x1f7a6d },
  { id: 'agent-4', name: 'Agent 4', role: 'Unassigned', room: 'Development Lab', color: 0x8a5a2b },
  { id: 'agent-5', name: 'Agent 5', role: 'Unassigned', room: 'Collaboration Room', color: 0x3d5a8a },
  { id: 'agent-6', name: 'Agent 6', role: 'Unassigned', room: 'Collaboration Room', color: 0x6b4a8a },
  { id: 'agent-7', name: 'Agent 7', role: 'Unassigned', room: 'Collaboration Room', color: 0x2f6b4f },
];

// 3D placement of the 7 worker figures: [agentId, x, z, floorY, facingRotationY]
// z is the workstation z + 0.55 (seated on the chair side, behind the desk);
// rotY = PI faces the monitor (-z). Face = +z local on the figure.
export const WORKER_SPOTS = [
  ['agent-1', -7.0, -3.65, 0.55, Math.PI],
  ['agent-2', 0.5, -3.65, 0.55, Math.PI],
  ['agent-3', -1.0, 1.15, 0.55, Math.PI],
  ['agent-4', 7.5, 1.15, 0.55, Math.PI],
  ['agent-5', -8.0, 0.95, 0.55, Math.PI],
  ['agent-6', -6.2, 1.95, 0.55, Math.PI],
  ['agent-7', -9.6, 1.95, 0.55, Math.PI],
];

// Walk destination per agent: a clear floor point inside the agent's room
// (open lane, no desk/table in the way). The agent walks seat -> target,
// pauses to interact, then walks back to its seat. [x, z]
export const WALK_TARGETS = {
  'agent-1': [-4.6, -3.2],
  'agent-2': [2.8, -3.0],
  'agent-3': [-2.5, -0.5],
  'agent-4': [9.0, -0.8],
  'agent-5': [-7.4, -1.2],
  'agent-6': [-5.0, 0.2],
  'agent-7': [-9.6, -0.6],
};

// CEO patrol waypoints on Floor 2 (adapted from v1 logic).
export const CEO_WAYPOINTS = [
  [-6.0, -4.0], // executive office desk
  [0.0, -3.5],  // board room
  [-7.0, 1.5],  // executive lounge
  [5.0, 3.0],   // management deck
  [-6.0, -4.0],
];

// CEO behaviour spots on Floor 2: [x, z, facingRotationY].
// facing: PI = faces -z (desk / board screen), 0 = faces +z (front / viewing).
export const CEO_SPOTS = {
  desk: [-6.0, -3.4, Math.PI],      // executive chair, faces the desk
  board: [0.0, -3.5, Math.PI],      // board room, faces the screen wall
  lounge: [-7.1, 2.6, 0],           // executive lounge, coffee table
  deck: [5.0, 3.0, 0],              // management deck
  viewing: [1.5, 0.5, 0],           // glass viewing area, overlooks Floor 1
  phone: [-5.0, -2.6, Math.PI],     // near the desk, phone call
};

// --- Palette (assignment §2): midnight navy, silver, white, cyan, violet ---
export const PALETTE = {
  bg: 0x061326,
  navy: 0x10243b,
  deep: 0x08182b,
  floor: 0x263c50,
  silver: 0xaebfca,
  white: 0xe8f2f6,
  cyan: 0x56dfff,
  violet: 0x927aff,
  wood: 0x755b4a,
  plant: 0x327d63,
  skin: 0xd7a47d,
};

// --- Building layout (metres-ish units) ---
// x: -10.5..10.5 (width 21), z: -6.5..6.5 (depth 13), front = +z.
export const LAYOUT = {
  width: 21.3, depth: 13.3,
  floor1Y: 0.55,          // floor 1 surface
  floor1Top: 4.2,         // floor 1 ceiling beams
  floor2SlabY: 4.5,       // floor 2 slab centre
  floor2Y: 4.65,          // floor 2 surface
  floor2Top: 7.9,         // roof beams
  roofY: 8.05,            // roof slab centre
};

// --- Day/night windows, Asia/Jakarta (assignment §6) ---
export const DAY_PHASES = [
  { name: 'SUNRISE', from: 5, to: 7 },
  { name: 'DAYLIGHT', from: 7, to: 16 },
  { name: 'SUNSET', from: 16, to: 18 },
  { name: 'NIGHT', from: 18, to: 29 }, // 18:00–04:59 (wraps past midnight)
];

export function phaseForHour(h) {
  if (h >= 5 && h < 7) return 'SUNRISE';
  if (h >= 7 && h < 16) return 'DAYLIGHT';
  if (h >= 16 && h < 18) return 'SUNSET';
  return 'NIGHT';
}

export const COLORS = {
  nightSky: new THREE.Color('#061326'),
  dawnSky: new THREE.Color('#c17f75'),
  daySky: new THREE.Color('#8bbbd7'),
  duskSky: new THREE.Color('#d58d72'),
};
