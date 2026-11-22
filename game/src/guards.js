// Guards and cameras: patrol movement, vision cones with line-of-sight,
// alarm contribution, and the hunt state when the alarm maxes out.
'use strict';

function makeGuard(def) {
  const wp = def.waypoints;
  const start = wp[def.start];
  return {
    name: def.name,
    waypoints: wp,
    x: start[0],
    y: start[1],
    dir: 0, // facing angle; set from the first leg below
    target: 1 - def.start,
    leg: def.start === 0 ? 1 : 0,
    state: 'patrol', // 'patrol' | 'hunt' | 'return'
    seen: false, // currently has the thief in its cone
    huntX: 0,
    huntY: 0,
    stepTimer: 0,
  };
}

const Guards = {
  list: [],
  cameras: [],

  reset() {
    this.list = VB.GUARDS.map(makeGuard);
    for (const g of this.list) {
      const t = g.waypoints[g.target];
      g.dir = angleTo(g.x, g.y, t[0], t[1]);
    }
    this.cameras = VB.CAMERAS.map((c) => ({
      ...c,
      angle: c.baseAngle,
      seen: false,
    }));
  },

  // One guard step: walk its patrol leg, or chase the thief while hunting.
  updateGuard(g, dt, player) {
    if (g.state === 'hunt') {
      const d = dist(g.x, g.y, player.x, player.y);
      if (d > 4) {
        const a = angleTo(g.x, g.y, player.x, player.y);
        g.dir = a;
        const nx = g.x + Math.cos(a) * VB.HUNT_SPEED * dt;
        const ny = g.y + Math.sin(a) * VB.HUNT_SPEED * dt;
        if (!World.circleHitsWall(nx, g.y, VB.GUARD_R)) g.x = nx;
        if (!World.circleHitsWall(g.x, ny, VB.GUARD_R)) g.y = ny;
      }
      return;
    }
    const t = g.waypoints[g.target];
    const d = dist(g.x, g.y, t[0], t[1]);
    const speed = VB.GUARD_SPEED;
    if (d < speed * dt + 2) {
      g.x = t[0]; g.y = t[1];
      g.target = (g.target + 1) % g.waypoints.length;
      const nt = g.waypoints[g.target];
      g.dir = angleTo(g.x, g.y, nt[0], nt[1]);
      return;
    }
    const a = angleTo(g.x, g.y, t[0], t[1]);
    g.dir = a;
    g.x += Math.cos(a) * speed * dt;
    g.y += Math.sin(a) * speed * dt;
  },

  updateCameras(dt, time) {
    for (const c of this.cameras) {
      c.angle = c.baseAngle + Math.sin(time * c.speed + c.phase) * c.sweep;
    }
  },

  // Can this watcher (guard or camera) see the player right now?
  // Sneaking halves the effective range.
  canSee(watcher, range, halfAngle, player, sneaking) {
    const effRange = sneaking ? range * 0.55 : range;
    const d = dist(watcher.x, watcher.y, player.x, player.y);
    if (d > effRange) return false;
    const toPlayer = angleTo(watcher.x, watcher.y, player.x, player.y);
    const facing = watcher.dir !== undefined ? watcher.dir : watcher.angle;
    if (Math.abs(angleDiff(toPlayer, facing)) > halfAngle) return false;
    return World.hasLineOfSight(watcher.x, watcher.y, player.x, player.y);
  },

  // Update every watcher; returns { guardSeen, cameraSeen }.
  update(dt, time, player, sneaking, hunting) {
    let guardSeen = false;
    let cameraSeen = false;
    for (const g of this.list) {
      if (hunting) g.state = 'hunt';
      this.updateGuard(g, dt, player);
      g.seen = this.canSee(g, VB.VISION_RANGE, VB.VISION_HALF_ANGLE, player, sneaking);
      if (g.seen) guardSeen = true;
    }
    this.updateCameras(dt, time);
    for (const c of this.cameras) {
      c.seen = this.canSee(c, VB.CAMERA_RANGE, VB.CAMERA_HALF_ANGLE, player, sneaking);
      if (c.seen) cameraSeen = true;
    }
    return { guardSeen, cameraSeen };
  },

  // Any guard close enough to grab the thief?
  touchingPlayer(player) {
    for (const g of this.list) {
      if (dist(g.x, g.y, player.x, player.y) <= VB.CATCH_R + VB.PLAYER_R - 4) return g;
    }
    return null;
  },

  stopHunt() {
    for (const g of this.list) g.state = 'patrol';
  },
};
