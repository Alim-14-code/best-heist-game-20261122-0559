// VAULTBREAK configuration: canvas, speeds, detection tuning, level layout.
// All numbers are plain constants; the level is data, the logic lives elsewhere.
'use strict';

const VB = {
  W: 1280,
  H: 720,
  TILE: 24,
  WALK_SPEED: 165,
  SNEAK_SPEED: 70,
  GUARD_SPEED: 72,
  HUNT_SPEED: 132,
  PLAYER_R: 13,
  GUARD_R: 14,
  PICKUP_R: 26,
  EXIT: { x: 1152, y: 612, w: 88, h: 72 },
  PLAYER_START: { x: 92, y: 632 },
  VISION_RANGE: 235,
  VISION_HALF_ANGLE: 0.61, // ~35 degrees
  CAMERA_RANGE: 265,
  CAMERA_HALF_ANGLE: 0.44, // ~25 degrees
  ALARM_GUARD_RATE: 46, // per second while seen by a guard
  ALARM_CAMERA_RATE: 36, // per second while seen by a camera
  ALARM_SNEAK_FACTOR: 0.45, // sneak multiplies the rise rate
  ALARM_DECAY: 13, // per second while unseen
  HUNT_ALARM_FLOOR: 40, // hunt ends when the alarm falls back under this
  CATCH_R: 20, // guard touch distance that ends the run
};

// Walls: solid rectangles {x, y, w, h}. The vault room sits top-centre;
// the door gap in its bottom wall is the only way in.
VB.WALLS = [
  // Outer border
  { x: 0, y: 0, w: 1280, h: 24 },
  { x: 0, y: 696, w: 1280, h: 24 },
  { x: 0, y: 0, w: 24, h: 720 },
  { x: 1256, y: 0, w: 24, h: 720 },
  // Vault room (x 480..800, y 60..260), door gap x 600..680
  { x: 480, y: 60, w: 320, h: 24 },
  { x: 480, y: 60, w: 24, h: 200 },
  { x: 776, y: 60, w: 24, h: 200 },
  { x: 480, y: 236, w: 120, h: 24 },
  { x: 680, y: 236, w: 120, h: 24 },
  // Gallery cover walls
  { x: 120, y: 380, w: 240, h: 24 },
  { x: 920, y: 380, w: 240, h: 24 },
  // Centre pillars
  { x: 556, y: 440, w: 24, h: 84 },
  { x: 700, y: 440, w: 24, h: 84 },
  // Upper side blocks (cover near the loot)
  { x: 120, y: 150, w: 24, h: 120 },
  { x: 1136, y: 150, w: 24, h: 120 },
];

// Decorative floor props (not solid): display cases, rugs, plants.
VB.PROPS = [
  { x: 300, y: 120, w: 90, h: 46, kind: 'case' },
  { x: 890, y: 120, w: 90, h: 46, kind: 'case' },
  { x: 300, y: 520, w: 90, h: 46, kind: 'case' },
  { x: 890, y: 520, w: 90, h: 46, kind: 'case' },
  { x: 600, y: 330, w: 80, h: 46, kind: 'rug' },
  { x: 60, y: 300, w: 40, h: 40, kind: 'plant' },
  { x: 1180, y: 300, w: 40, h: 40, kind: 'plant' },
];

// Loot: the Meridian Diamond is the target; the rest is bonus score.
VB.LOOT = [
  { id: 'diamond', name: 'Meridian Diamond', x: 640, y: 148, value: 5000, color: '#7fe7ff', r: 15 },
  { id: 'gold', name: 'Gold Bars', x: 178, y: 212, value: 800, color: '#ffd94d', r: 12 },
  { id: 'cash', name: 'Cash Stack', x: 1102, y: 212, value: 600, color: '#8be06a', r: 12 },
  { id: 'emerald', name: 'Emerald Idol', x: 1102, y: 560, value: 1200, color: '#3fe08a', r: 12 },
];

// Guard patrol routes: waypoints the guard walks between, ping-pong.
VB.GUARDS = [
  { name: 'Rook', waypoints: [[140, 330], [1140, 330]], start: 0 },
  { name: 'Bishop', waypoints: [[420, 300], [420, 640]], start: 0 },
  { name: 'Knight', waypoints: [[430, 292], [850, 292]], start: 1 },
];

// Security cameras: fixed mounts that sweep their aim back and forth.
VB.CAMERAS = [
  { x: 300, y: 48, baseAngle: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 0 },
  { x: 980, y: 48, baseAngle: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 2.1 },
];
