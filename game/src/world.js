// The level: walls, loot, the exit, and the geometry queries the game
// needs — circle-vs-wall collision and line-of-sight between two points.
'use strict';

const World = {
  walls: VB.WALLS,
  props: VB.PROPS,
  loot: [],
  exit: VB.EXIT,

  reset() {
    this.loot = VB.LOOT.map((l) => ({ ...l, taken: false }));
  },

  lootTaken(id) {
    const item = this.loot.find((l) => l.id === id);
    return item ? item.taken : false;
  },

  get diamond() {
    return this.loot.find((l) => l.id === 'diamond');
  },

  // Is the point inside any wall?
  pointInWall(x, y) {
    for (const w of this.walls) {
      if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return true;
    }
    return false;
  },

  // Move a circle (x, y, r) by (dx, dy), sliding along walls axis by axis.
  // Returns the new position.
  moveCircle(x, y, r, dx, dy) {
    let nx = x + dx;
    if (!this.circleHitsWall(nx, y, r)) x = nx;
    let ny = y + dy;
    if (!this.circleHitsWall(x, ny, r)) y = ny;
    return { x, y };
  },

  circleHitsWall(x, y, r) {
    for (const w of this.walls) {
      const cx = clamp(x, w.x, w.x + w.w);
      const cy = clamp(y, w.y, w.y + w.h);
      const ddx = x - cx, ddy = y - cy;
      if (ddx * ddx + ddy * ddy < r * r) return true;
    }
    return false;
  },

  // True when no wall blocks the straight segment between the two points.
  hasLineOfSight(ax, ay, bx, by) {
    for (const w of this.walls) {
      const edges = [
        [w.x, w.y, w.x + w.w, w.y],
        [w.x + w.w, w.y, w.x + w.w, w.y + w.h],
        [w.x + w.w, w.y + w.h, w.x, w.y + w.h],
        [w.x, w.y + w.h, w.x, w.y],
      ];
      for (const [x1, y1, x2, y2] of edges) {
        if (segmentsCross(ax, ay, bx, by, x1, y1, x2, y2)) return false;
      }
    }
    return true;
  },

  // Is the point inside the green exit zone?
  inExit(x, y) {
    const e = this.exit;
    return x >= e.x && x <= e.x + e.w && y >= e.y && y <= e.y + e.h;
  },

  // Nearest untaken loot within pickup range of (x, y), or null.
  lootNear(x, y) {
    for (const item of this.loot) {
      if (item.taken) continue;
      if (dist(x, y, item.x, item.y) <= VB.PICKUP_R + item.r) return item;
    }
    return null;
  },
};
