// VAULTBREAK — guards and cameras: patrols, vision cones, the suspicion
// state, the hunt, and the distracted state a thrown coin causes.
var VB = window.VB || (window.VB = {});

// Three named guards. Each patrols between two waypoints and turns around
// at each end; facing follows the direction of travel.
VB.createGuards = function createGuards() {
  return [
    {
      name: 'Rook', x: 300, y: 380, angle: 0,
      waypoints: [{ x: 300, y: 380 }, { x: 980, y: 380 }],
      wp: 1, state: 'patrol', seeTimer: 0,
      distractX: 0, distractY: 0, distractTimer: 0,
    },
    {
      name: 'Bishop', x: 300, y: 300, angle: Math.PI / 2,
      waypoints: [{ x: 300, y: 300 }, { x: 300, y: 620 }],
      wp: 1, state: 'patrol', seeTimer: 0,
      distractX: 0, distractY: 0, distractTimer: 0,
    },
    {
      name: 'Knight', x: 520, y: 300, angle: 0,
      waypoints: [{ x: 520, y: 300 }, { x: 780, y: 300 }],
      wp: 1, state: 'patrol', seeTimer: 0,
      distractX: 0, distractY: 0, distractTimer: 0,
    },
  ];
};

// Two sweeping cameras on visible wall brackets. Their cones aim toward
// the floor edges so they do not merge with the guards' cones.
VB.createCameras = function createCameras() {
  return [
    {
      x: 120, y: 40, baseAngle: 2.2, sweep: 0.42, phase: 0,
      angle: 2.2, blindTimer: 0,
    },
    {
      x: 1160, y: 40, baseAngle: 0.94, sweep: 0.42, phase: 1.6,
      angle: 0.94, blindTimer: 0,
    },
  ];
};

// Angle difference wrapped to (-PI, PI].
function angleDiff(a, b) {
  var d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

// True when a viewer at (vx, vy) facing `angle` with the given range and
// half-angle can see the point (tx, ty): inside the cone and with a clear
// line of sight through the walls.
VB.canSee = function canSee(world, vx, vy, angle, range, half, tx, ty) {
  var dx = tx - vx;
  var dy = ty - vy;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > range) return false;
  if (dist < 1) return true;
  var targetAngle = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(targetAngle, angle)) > half) return false;
  return !VB.segmentBlocked(world, vx, vy, tx, ty);
};

// Move a guard one step. Patrol walks its waypoints; distracted walks to
// the coin and waits out its timer; hunt chases the thief; suspicious
// stands and turns toward the thief.
VB.updateGuard = function updateGuard(guard, dt, game) {
  var C = VB.CFG;
  var player = game.player;

  if (guard.state === 'distracted') {
    guard.distractTimer -= dt;
    var dx = guard.distractX - guard.x;
    var dy = guard.distractY - guard.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 6) {
      var step = Math.min(dist, C.GUARD_SPEED * dt);
      guard.x += (dx / dist) * step;
      guard.y += (dy / dist) * step;
      guard.angle = Math.atan2(dy, dx);
    }
    if (guard.distractTimer <= 0) guard.state = 'patrol';
    return;
  }

  if (guard.state === 'hunt') {
    var hx = player.x - guard.x;
    var hy = player.y - guard.y;
    var hd = Math.sqrt(hx * hx + hy * hy);
    if (hd > 1) {
      var hstep = Math.min(hd, C.HUNT_SPEED * dt);
      guard.x += (hx / hd) * hstep;
      guard.y += (hy / hd) * hstep;
      guard.angle = Math.atan2(hy, hx);
    }
    return;
  }

  if (guard.state === 'suspicious') {
    // Stand and turn toward the thief while the "!" is showing.
    var want = Math.atan2(player.y - guard.y, player.x - guard.x);
    var diff = angleDiff(want, guard.angle);
    var turn = Math.max(-3 * dt, Math.min(3 * dt, diff));
    guard.angle += turn;
    return;
  }

  // Patrol: walk toward the current waypoint, turn around at each end.
  var target = guard.waypoints[guard.wp];
  var px = target.x - guard.x;
  var py = target.y - guard.y;
  var pd = Math.sqrt(px * px + py * py);
  if (pd < 4) {
    guard.wp = (guard.wp + 1) % guard.waypoints.length;
    target = guard.waypoints[guard.wp];
    px = target.x - guard.x;
    py = target.y - guard.y;
    pd = Math.sqrt(px * px + py * py);
  }
  if (pd > 0.1) {
    var pstep = Math.min(pd, C.GUARD_SPEED * dt);
    guard.x += (px / pd) * pstep;
    guard.y += (py / pd) * pstep;
    guard.angle = Math.atan2(py, px);
  }
};

// Sweep a camera's aim back and forth; count down its blind timer.
VB.updateCamera = function updateCamera(cam, dt, game) {
  cam.phase += dt;
  cam.angle = cam.baseAngle + Math.sin(cam.phase * 0.9) * cam.sweep;
  if (cam.blindTimer > 0) cam.blindTimer -= dt;
};

// A guard's vision check against the thief. Returns 'none', 'suspicious'
// or 'seen', and keeps the suspicion timer that makes a guard show "!"
// and turn toward the thief before it truly sees you.
VB.guardVision = function guardVision(guard, dt, game) {
  var C = VB.CFG;
  if (guard.state === 'distracted' || guard.state === 'hunt') return 'none';
  var sees = VB.canSee(game.world, guard.x, guard.y, guard.angle,
    C.GUARD_RANGE, C.GUARD_HALF, game.player.x, game.player.y);
  if (sees) {
    guard.seeTimer += dt;
    if (guard.seeTimer < C.SUSPICION_TIME) {
      guard.state = 'suspicious';
      return 'suspicious';
    }
    guard.state = 'seen';
    return 'seen';
  }
  guard.seeTimer = Math.max(0, guard.seeTimer - dt * 2);
  if (guard.state === 'suspicious' || guard.state === 'seen') {
    guard.state = 'patrol';
  }
  return 'none';
};

// A camera's vision check. A blind camera sees nothing.
VB.cameraVision = function cameraVision(cam, game) {
  var C = VB.CFG;
  if (cam.blindTimer > 0) return false;
  return VB.canSee(game.world, cam.x, cam.y, cam.angle,
    C.CAM_RANGE, C.CAM_HALF, game.player.x, game.player.y);
};
