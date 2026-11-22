// VAULTBREAK — configuration: every design number of the game in one place.
// All speeds are pixels per second, all alarm rates are points per second.
var VB = window.VB || (window.VB = {});

VB.CFG = {
  // Playfield
  W: 1280,
  H: 720,
  WALL: 24,

  // Movement
  WALK_SPEED: 165,
  SNEAK_SPEED: 70,
  GUARD_SPEED: 72,
  HUNT_SPEED: 132,

  // Sizes
  PLAYER_R: 17,
  GUARD_R: 14,
  PICKUP_R: 26,
  CATCH_R: 20,

  // Vision
  GUARD_RANGE: 235,
  GUARD_HALF: 0.61, // half-angle, radians (~35 degrees)
  CAM_RANGE: 265,
  CAM_HALF: 0.44, // half-angle, radians (~25 degrees)

  // Alarm
  ALARM_GUARD: 46,
  ALARM_CAM: 36,
  ALARM_SNEAK: 0.45, // sneaking multiplies the rise
  ALARM_SHADOW: 0.5, // standing in a shadow pool multiplies the rise
  ALARM_DECAY: 13,
  ALARM_HUNT_FLOOR: 40, // hunt ends once the alarm falls under this
  SUSPICION_TIME: 0.8, // seconds a guard stays suspicious before it truly sees you
  SUSPICION_RATE: 20, // alarm rise per second while a guard is suspicious

  // Tools
  COIN_COUNT: 3,
  COIN_RANGE: 290, // nearest guard inside this range investigates a thrown coin
  COIN_DISTRACT: 4, // seconds a guard investigates
  COIN_THROW: 150, // how far ahead of the thief a coin lands
  COIN_FLIGHT: 0.45, // seconds the coin spends in the air
  EMP_COUNT: 2,
  EMP_BLIND: 6, // seconds cameras stay blind after an EMP
  EMP_COST: 12, // alarm points an EMP adds when fired
  EMP_RADIUS: 340, // how far the blue pulse ring expands

  // Laser grid across the vault door gap
  LASER_ON: 3.0, // seconds the grid stays on
  LASER_OFF: 2.0, // seconds the grid stays off
  LASER_HIT: 20, // alarm points for crossing while the grid is on

  // Loot values in dollars
  DIAMOND: 5000,
  GOLD: 800,
  CASH: 600,
  EMERALD: 1200,

  // Escape bonus: up to this many dollars for a fast getaway
  ESCAPE_BONUS: 3000,
  ESCAPE_BONUS_PER_SECOND: 10,

  // Palette: warm night gallery. Nothing important is a dark shape on a
  // dark floor; safe cover is deep blue-violet shadow, danger is warm
  // amber light, loot glows bright.
  COL: {
    floor: '#262133',
    floorEdge: '#2e2840',
    shadowPool: '#171224',
    vaultFloor: '#cfc4ae',
    vaultFloorEdge: '#b8ab8d',
    wall: '#4a5468',
    wallTop: '#6b7a94',
    carpet: '#5e1f2a',
    carpetEdge: '#c9a227',
    conePatrol: 'rgba(255,176,32,0.30)',
    conePatrolEdge: 'rgba(255,200,80,0.85)',
    coneSeen: 'rgba(255,59,48,0.42)',
    coneSeenEdge: 'rgba(255,90,70,0.95)',
    coneBlind: 'rgba(120,130,150,0.20)',
    laser: '#ff2d3f',
    exit: '#22c55e',
    diamond: '#7ff3ff',
    gold: '#ffd34d',
    cash: '#7ddb8a',
    emerald: '#34d399',
    thiefRim: '#7ff3ff',
    guardBody: '#232a3d',
    guardCap: '#1a2030',
  },
};
