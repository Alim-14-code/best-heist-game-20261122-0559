// VAULTBREAK guards and cameras: patrols, vision cones, the alarm meter
// and the hunt. A guard sees the thief when the thief is inside its cone
// and no wall blocks the line of sight.
'use strict';

const VBGuards = {
  makeGuards: function () {
    return [
      {
        name: 'Rook',
        waypoints: [[140, 330], [1140, 330]],
        wp: 0, x: 140, y: 330, dir: 0,
        state: 'patrol', seen: false, distract: null, wait: 0,
      },
      {
        name: 'Bishop',
        waypoints: [[420, 300], [420, 640]],
        wp: 0, x: 420, y: 300, dir: Math.PI / 2,
        state: 'patrol', seen: false, distract: null, wait: 0,
      },
      {
        name: 'Knight',
        waypoints: [[430, 292], [850, 292]],
        wp: 1, x: 850, y: 292, dir: Math.PI,
        state: 'patrol', seen: false, distract: null, wait: 0,
      },
    ];
  },

  makeCameras: function () {
    return [
      { x: 300, y: 48, base: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 0, angle: Math.PI / 2, blind: 0, seen: false },
      { x: 980, y: 48, base: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 2.1, angle: Math.PI / 2, blind: 0, seen: false },
    ];
  },

  // Is the thief inside this watcher's cone with a clear line of sight?
  canSee: function (walls, wx, wy, ang, range, half, px, py) {
    const dx = px - wx;
    const dy = py - wy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > range) return false;
    let diff = Math.atan2(dy, dx) - ang;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    if (Math.abs(diff) > half) return false;
    return !VBWorld.blocked(walls, wx, wy, px, py);
  },

  // Advance one guard by dt seconds. Returns nothing; mutates the guard.
  stepGuard: function (g, walls, player, hunting, dt) {
    if (g.state === 'distracted') {
      const tx = g.distract.x;
      const ty = g.distract.y;
      const dx = tx - g.x;
      const dy = ty - g.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 4) {
        const sp = VB.GUARD_SPEED * dt;
        const step = Math.min(sp, d);
        g.dir = Math.atan2(dy, dx);
        const moved = VBWorld.moveCircle(walls, g.x, g.y, VB.GUARD_R,
          (dx / d) * step, (dy / d) * step);
        g.x = moved.x;
        g.y = moved.y;
      } else {
        g.wait -= dt;
        if (g.wait <= 0) {
          g.state = 'patrol';
          g.distract = null;
        }
      }
      return;
    }

    if (hunting) {
      const dx = player.x - g.x;
      const dy = player.y - g.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) {
        const sp = VB.HUNT_SPEED * dt;
        const step = Math.min(sp, d);
        g.dir = Math.atan2(dy, dx);
        const moved = VBWorld.moveCircle(walls, g.x, g.y, VB.GUARD_R,
          (dx / d) * step, (dy / d) * step);
        g.x = moved.x;
        g.y = moved.y;
      }
      return;
    }

    if (g.seen) {
      // A guard that spots the thief stops and watches; the alarm does
      // the chasing until it hits 100 and the hunt starts.
      g.dir = Math.atan2(player.y - g.y, player.x - g.x);
      return;
    }

    // Patrol: walk to the next waypoint, ping-pong.
    const wp = g.waypoints[g.wp];
    const dx = wp[0] - g.x;
    const dy = wp[1] - g.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 4) {
      g.wp = (g.wp + 1) % g.waypoints.length;
      return;
    }
    const sp = VB.GUARD_SPEED * dt;
    const step = Math.min(sp, d);
    g.dir = Math.atan2(dy, dx);
    const moved = VBWorld.moveCircle(walls, g.x, g.y, VB.GUARD_R,
      (dx / d) * step, (dy / d) * step);
    g.x = moved.x;
    g.y = moved.y;
  },

  // Advance one camera's sweep by dt seconds.
  stepCamera: function (cam, t, dt) {
    cam.angle = cam.base + Math.sin(t * cam.speed + cam.phase) * cam.sweep;
    if (cam.blind > 0) cam.blind = Math.max(0, cam.blind - dt);
  },
};
