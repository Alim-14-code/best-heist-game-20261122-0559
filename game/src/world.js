// VAULTBREAK world: the gallery room, its walls, dressing, loot and exit.
// All coordinates are in the 1280x720 playfield. Walls are solid
// axis-aligned rectangles; props are decoration that never blocks movement
// (except the benches and desk, which are walls too).
'use strict';

const VBWorld = {
  // The vault room, top-centre. Its bottom wall has a single door gap
  // (x 600..680): the only way in to the diamond.
  VAULT: { x: 480, y: 60, w: 320, h: 200 },

  build: function () {
    const walls = [
      // Outer border.
      { x: 0, y: 0, w: 1280, h: 24 },
      { x: 0, y: 696, w: 1280, h: 24 },
      { x: 0, y: 0, w: 24, h: 720 },
      { x: 1256, y: 0, w: 24, h: 720 },
      // Vault room: top wall, left wall, right wall, bottom wall in two
      // pieces with the door gap between them.
      { x: 480, y: 60, w: 320, h: 24 },
      { x: 480, y: 60, w: 24, h: 200 },
      { x: 776, y: 60, w: 24, h: 200 },
      { x: 480, y: 236, w: 120, h: 24 },
      { x: 680, y: 236, w: 120, h: 24 },
      // Lane walls that split the floor into three routes.
      { x: 120, y: 380, w: 240, h: 24 },
      { x: 920, y: 380, w: 240, h: 24 },
      // Centre pillars.
      { x: 556, y: 440, w: 24, h: 84 },
      { x: 700, y: 440, w: 24, h: 84 },
      // Upper side blocks (cover near the side loot).
      { x: 120, y: 150, w: 24, h: 120 },
      { x: 1136, y: 150, w: 24, h: 120 },
      // Security desk near the bottom centre.
      { x: 560, y: 560, w: 160, h: 40 },
    ];

    // Gallery dressing: paintings on the walls, glass display cases,
    // benches and potted plants. Cases and plants are floor dressing
    // (not solid); benches are low and solid, listed in `benches`.
    const paintings = [
      { x: 300, y: 30, w: 90, h: 46, hue: 0 },
      { x: 890, y: 30, w: 90, h: 46, hue: 1 },
      { x: 300, y: 644, w: 90, h: 46, hue: 2 },
      { x: 890, y: 644, w: 90, h: 46, hue: 0 },
    ];
    const cases = [
      { x: 260, y: 110, w: 90, h: 46 },
      { x: 930, y: 110, w: 90, h: 46 },
      { x: 260, y: 520, w: 90, h: 46 },
      { x: 930, y: 520, w: 90, h: 46 },
    ];
    const benches = [
      { x: 600, y: 330, w: 80, h: 46 },
      { x: 180, y: 470, w: 80, h: 40 },
      { x: 1020, y: 470, w: 80, h: 40 },
    ];
    const plants = [
      { x: 60, y: 300, r: 20 },
      { x: 1180, y: 300, r: 20 },
      { x: 60, y: 620, r: 20 },
      { x: 1180, y: 620, r: 20 },
    ];
    // Benches are solid; add them to the wall list.
    for (let i = 0; i < benches.length; i++) {
      walls.push({ x: benches[i].x, y: benches[i].y, w: benches[i].w, h: benches[i].h });
    }

    const loot = [
      { id: 'diamond', name: 'Meridian Diamond', x: 640, y: 150, value: 5000, color: '#7fe7ff', r: 20, taken: false },
      { id: 'gold', name: 'Gold Bars', x: 180, y: 212, value: 800, color: '#ffd94d', r: 12, taken: false },
      { id: 'cash', name: 'Cash Stack', x: 1100, y: 212, value: 600, color: '#8be06a', r: 12, taken: false },
      { id: 'emerald', name: 'Emerald Idol', x: 1100, y: 560, value: 1200, color: '#3fe08a', r: 12, taken: false },
    ];

    return {
      walls: walls,
      paintings: paintings,
      cases: cases,
      benches: benches,
      plants: plants,
      loot: loot,
      exit: { x: VB.EXIT.x, y: VB.EXIT.y, w: VB.EXIT.w, h: VB.EXIT.h },
      start: { x: VB.START.x, y: VB.START.y },
    };
  },

  // Move a circle against the walls, axis by axis. Returns the new
  // position; the circle slides along walls instead of sticking.
  moveCircle: function (walls, x, y, r, dx, dy) {
    let nx = x + dx;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (nx + r > w.x && nx - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) {
        nx = dx > 0 ? w.x - r : w.x + w.w + r;
      }
    }
    let ny = y + dy;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (nx + r > w.x && nx - r < w.x + w.w && ny + r > w.y && ny - r < w.y + w.h) {
        ny = dy > 0 ? w.y - r : w.y + w.h + r;
      }
    }
    return { x: nx, y: ny };
  },

  // Does the segment (x1,y1)-(x2,y2) cross any wall? Used for sight:
  // a guard cannot see through a wall.
  blocked: function (walls, x1, y1, x2, y2) {
    for (let i = 0; i < walls.length; i++) {
      if (VBWorld.segHitsRect(x1, y1, x2, y2, walls[i])) return true;
    }
    return false;
  },

  // Segment vs axis-aligned rectangle, slab method.
  segHitsRect: function (x1, y1, x2, y2, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    let tmin = 0;
    let tmax = 1;
    if (dx === 0) {
      if (x1 < r.x || x1 > r.x + r.w) return false;
    } else {
      let t1 = (r.x - x1) / dx;
      let t2 = (r.x + r.w - x1) / dx;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return false;
    }
    if (dy === 0) {
      if (y1 < r.y || y1 > r.y + r.h) return false;
    } else {
      let t1 = (r.y - y1) / dy;
      let t2 = (r.y + r.h - y1) / dy;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return false;
    }
    return true;
  },

  // Distance from a point along a direction to the nearest wall, capped
  // at maxLen. Used to raycast vision cones so they stop at walls.
  rayLen: function (walls, x, y, ang, maxLen) {
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    let best = maxLen;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      let tmin = 0;
      let tmax = best;
      let hit = true;
      if (dx === 0) {
        if (x < w.x || x > w.x + w.w) hit = false;
      } else {
        let t1 = (w.x - x) / dx;
        let t2 = (w.x + w.w - x) / dx;
        if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
        if (t1 > tmin) tmin = t1;
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) hit = false;
      }
      if (hit) {
        if (dy === 0) {
          if (y < w.y || y > w.y + w.h) hit = false;
        } else {
          let t1 = (w.y - y) / dy;
          let t2 = (w.y + w.h - y) / dy;
          if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
          if (t1 > tmin) tmin = t1;
          if (t2 < tmax) tmax = t2;
          if (tmin > tmax) hit = false;
        }
      }
      if (hit && tmin > 0 && tmin < best) best = tmin;
    }
    return best;
  },
};
