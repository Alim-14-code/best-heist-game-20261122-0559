// VAULTBREAK — the gallery: walls, the vault, the three named lanes, the
// laser grid, shadow pools, loot, props and the EXIT. Everything here is
// plain data plus geometry helpers; nothing in this file draws.
var VB = window.VB || (window.VB = {});

VB.buildWorld = function buildWorld() {
  var C = VB.CFG;
  var W = C.W;
  var H = C.H;
  var T = C.WALL;

  // Solid rectangles {x, y, w, h}. The vault's bottom wall is two segments
  // so the door gap (x 600..680) stays open — the only way into the vault.
  var solids = [
    { x: 0, y: 0, w: W, h: T }, // top outer wall
    { x: 0, y: H - T, w: W, h: T }, // bottom outer wall
    { x: 0, y: 0, w: T, h: H }, // left outer wall
    { x: W - T, y: 0, w: T, h: H }, // right outer wall
    { x: 480, y: 60, w: 320, h: 24 }, // vault top wall
    { x: 480, y: 60, w: 24, h: 200 }, // vault left wall
    { x: 776, y: 60, w: 24, h: 200 }, // vault right wall
    { x: 480, y: 236, w: 120, h: 24 }, // vault bottom wall, left of the door
    { x: 680, y: 236, w: 120, h: 24 }, // vault bottom wall, right of the door
    { x: 392, y: 300, w: 16, h: 140 }, // west lane divider, upper part
    { x: 392, y: 500, w: 16, h: 120 }, // west lane divider, lower part
    { x: 872, y: 300, w: 16, h: 80 }, // east lane divider, upper part
    { x: 872, y: 440, w: 16, h: 180 }, // east lane divider, lower part
    { x: 560, y: 560, w: 160, h: 36 }, // security desk
    { x: 150, y: 300, w: 120, h: 24 }, // west bench
    { x: 1010, y: 300, w: 120, h: 24 }, // east bench
    { x: 520, y: 470, w: 60, h: 24 }, // central bench, left of the carpet
    { x: 250, y: 600, w: 60, h: 60 }, // sculpture pedestal
    { x: 120, y: 180, w: 60, h: 40 }, // west display case
    { x: 1100, y: 180, w: 60, h: 40 }, // east display case
  ];

  // The vault room itself (floor is pale marble, distinct from the gallery).
  var vault = { x: 480, y: 60, w: 320, h: 200 };

  // The laser grid spans the vault door gap and cycles on a timer.
  var laser = { x0: 600, x1: 680, y: 248, lines: 4 };

  // The red carpet runner runs down the central lane to the vault door.
  var carpet = { x: 600, y: 260, w: 80, h: 300 };

  // Three named lanes, written on the floor itself so the routes are
  // literally visible in the cover. The west name sits left of the
  // sculpture pedestal and above the tool chips, so nothing overlaps it.
  var lanes = [
    { name: 'WEST WING', x: 165, y: 620 },
    { name: 'CENTRAL', x: 640, y: 660 },
    { name: 'EAST WING', x: 1068, y: 660 },
  ];

  // Pools of deep blue-violet shadow. Standing in one halves how fast
  // the alarm rises: shadow is safe cover, light is danger.
  var shadowPools = [
    { cx: 180, cy: 560, rx: 95, ry: 58 },
    { cx: 300, cy: 630, rx: 85, ry: 52 },
    { cx: 1080, cy: 560, rx: 95, ry: 58 },
    { cx: 640, cy: 480, rx: 105, ry: 62 },
    { cx: 150, cy: 350, rx: 72, ry: 50 },
  ];

  // Framed canvases with a tiny landscape inside (horizon + sun or moon),
  // never a diagonal slash.
  var paintings = [
    { x: 150, y: 30, w: 90, h: 56, moon: false },
    { x: 350, y: 30, w: 90, h: 56, moon: true },
    { x: 950, y: 30, w: 90, h: 56, moon: false },
    { x: 1100, y: 30, w: 90, h: 56, moon: true },
    { x: 30, y: 150, w: 56, h: 90, moon: true },
    { x: 30, y: 450, w: 56, h: 90, moon: false },
    { x: 1194, y: 150, w: 56, h: 90, moon: false },
    { x: 1194, y: 450, w: 56, h: 90, moon: true },
  ];

  // Potted plants in the corners.
  var plants = [
    { x: 62, y: 662 },
    { x: 1218, y: 662 },
    { x: 62, y: 82 },
    { x: 1218, y: 82 },
  ];

  // Loot. The cash stack sits far enough left that its whole label fits
  // inside the frame with margin; every loot is fully visible, never
  // half-hidden behind furniture. Gold bars fill the bottom-left
  // quadrant, which used to be empty dark floor.
  var loot = [
    { id: 'diamond', name: 'MERIDIAN DIAMOND', x: 640, y: 150, value: C.DIAMOND, kind: 'diamond' },
    { id: 'gold', name: 'GOLD BARS', x: 180, y: 560, value: C.GOLD, kind: 'gold' },
    { id: 'cash', name: 'CASH STACK', x: 1010, y: 180, value: C.CASH, kind: 'cash' },
    { id: 'emerald', name: 'EMERALD IDOL', x: 1080, y: 480, value: C.EMERALD, kind: 'emerald' },
  ];

  var exit = { x: 1150, y: 620, w: 100, h: 76 };
  var playerStart = { x: 90, y: 640 };

  return {
    solids: solids,
    vault: vault,
    laser: laser,
    carpet: carpet,
    lanes: lanes,
    shadowPools: shadowPools,
    paintings: paintings,
    plants: plants,
    loot: loot,
    exit: exit,
    playerStart: playerStart,
  };
};

// True when the circle at (x, y) with radius r touches any solid.
VB.circleHitsSolids = function circleHitsSolids(world, x, y, r) {
  var solids = world.solids;
  for (var i = 0; i < solids.length; i++) {
    var s = solids[i];
    var cx = Math.max(s.x, Math.min(x, s.x + s.w));
    var cy = Math.max(s.y, Math.min(y, s.y + s.h));
    var dx = x - cx;
    var dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
};

// True when the segment from (x0, y0) to (x1, y1) crosses any solid:
// the line-of-sight test for vision cones.
VB.segmentBlocked = function segmentBlocked(world, x0, y0, x1, y1) {
  var solids = world.solids;
  for (var i = 0; i < solids.length; i++) {
    if (segmentHitsRect(x0, y0, x1, y1, solids[i])) return true;
  }
  return false;
};

function segmentHitsRect(x0, y0, x1, y1, r) {
  // Slab method: find the overlap of the segment with the rectangle.
  var dx = x1 - x0;
  var dy = y1 - y0;
  var tmin = 0;
  var tmax = 1;
  var p;
  var q;
  var axes = [
    { p: -dx, q: x0 - r.x },
    { p: dx, q: r.x + r.w - x0 },
    { p: -dy, q: y0 - r.y },
    { p: dy, q: r.y + r.h - y0 },
  ];
  for (var i = 0; i < axes.length; i++) {
    p = axes[i].p;
    q = axes[i].q;
    if (p === 0) {
      if (q < 0) return false;
    } else {
      var t = q / p;
      if (p < 0) {
        if (t > tmax) return false;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return false;
        if (t < tmax) tmax = t;
      }
    }
  }
  return true;
}

// True when (x, y) stands inside any shadow pool.
VB.pointInShadow = function pointInShadow(world, x, y) {
  var pools = world.shadowPools;
  for (var i = 0; i < pools.length; i++) {
    var p = pools[i];
    var dx = (x - p.cx) / p.rx;
    var dy = (y - p.cy) / p.ry;
    if (dx * dx + dy * dy <= 1) return true;
  }
  return false;
};

// The laser grid cycles: on for LASER_ON seconds, off for LASER_OFF.
// True when the grid is live at game time t.
VB.laserOnAt = function laserOnAt(t) {
  var C = VB.CFG;
  var period = C.LASER_ON + C.LASER_OFF;
  return (t % period) < C.LASER_ON;
};

// True when (x, y) is inside the vault door gap the laser guards.
VB.pointInLaserGap = function pointInLaserGap(world, x, y) {
  var l = world.laser;
  return x >= l.x0 && x <= l.x1 && y >= l.y - 14 && y <= l.y + 14;
};
