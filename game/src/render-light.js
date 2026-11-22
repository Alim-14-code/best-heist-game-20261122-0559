// VAULTBREAK — drawing the light: warm amber vision cones with soft
// edges, the laser grid across the vault door, the EMP pulse ring, and the
// bright glow each loot item carries.
var VB = window.VB || (window.VB = {});

VB.drawLight = function drawLight(ctx, game) {
  var C = VB.CFG;
  drawLootGlows(ctx, game);
  drawGuardCones(ctx, game);
  drawCameraCones(ctx, game);
  drawLaserGrid(ctx, game);
  drawEmpPulse(ctx, game);
};

function drawLootGlows(ctx, game) {
  var C = VB.CFG;
  var loot = game.world.loot;
  for (var i = 0; i < loot.length; i++) {
    var item = loot[i];
    if (game.lootTaken[item.id]) continue;
    var color = item.kind === 'diamond' ? '127,243,255'
      : item.kind === 'gold' ? '255,211,77'
      : item.kind === 'cash' ? '125,219,138'
      : '52,211,153';
    var grad = ctx.createRadialGradient(item.x, item.y, 4, item.x, item.y, 46);
    grad.addColorStop(0, 'rgba(' + color + ',0.55)');
    grad.addColorStop(1, 'rgba(' + color + ',0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(item.x, item.y, 46, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A vision cone: a wedge of warm light spilling across the floor, bright
// near its source and fading softly at its edge, with a visible rim.
function drawCone(ctx, x, y, angle, range, half, fill, edge) {
  var grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, 'rgba(255,176,32,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - half, angle + half);
  ctx.closePath();
  ctx.stroke();
}

function drawGuardCones(ctx, game) {
  var C = VB.CFG;
  var guards = game.guards;
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    if (g.state === 'seen' || g.state === 'hunt') {
      drawCone(ctx, g.x, g.y, g.angle, C.GUARD_RANGE, C.GUARD_HALF,
        C.COL.coneSeen, C.COL.coneSeenEdge);
    } else if (g.state === 'suspicious') {
      drawCone(ctx, g.x, g.y, g.angle, C.GUARD_RANGE, C.GUARD_HALF,
        'rgba(255,140,32,0.38)', 'rgba(255,170,60,0.95)');
    } else {
      drawCone(ctx, g.x, g.y, g.angle, C.GUARD_RANGE, C.GUARD_HALF,
        C.COL.conePatrol, C.COL.conePatrolEdge);
    }
  }
}

function drawCameraCones(ctx, game) {
  var C = VB.CFG;
  var cams = game.cameras;
  for (var i = 0; i < cams.length; i++) {
    var cam = cams[i];
    if (cam.blindTimer > 0) {
      // Blinded by an EMP: the cone turns grey and the lens goes dark.
      drawCone(ctx, cam.x, cam.y, cam.angle, C.CAM_RANGE, C.CAM_HALF,
        C.COL.coneBlind, 'rgba(140,150,170,0.6)');
    } else {
      drawCone(ctx, cam.x, cam.y, cam.angle, C.CAM_RANGE, C.CAM_HALF,
        C.COL.conePatrol, C.COL.conePatrolEdge);
    }
  }
}

function drawLaserGrid(ctx, game) {
  var C = VB.CFG;
  var laser = game.world.laser;
  var on = VB.laserOnAt(game.time);
  // Emitter dots on both sides of the gap, always visible.
  ctx.fillStyle = '#ff5a6a';
  ctx.beginPath();
  ctx.arc(laser.x0 - 2, laser.y, 4, 0, Math.PI * 2);
  ctx.arc(laser.x1 + 2, laser.y, 4, 0, Math.PI * 2);
  ctx.fill();
  if (!on) return;
  // Thin red lines across the gap while the grid is live.
  ctx.save();
  ctx.shadowColor = C.COL.laser;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = C.COL.laser;
  ctx.lineWidth = 2;
  for (var i = 0; i < laser.lines; i++) {
    var y = laser.y - 10 + i * 7;
    ctx.beginPath();
    ctx.moveTo(laser.x0, y);
    ctx.lineTo(laser.x1, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEmpPulse(ctx, game) {
  var emp = game.tools.emp;
  if (!emp) return;
  var C = VB.CFG;
  var alpha = Math.max(0, 1 - emp.r / C.EMP_RADIUS);
  ctx.strokeStyle = 'rgba(120,180,255,' + (0.9 * alpha).toFixed(2) + ')';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(emp.x, emp.y, emp.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,180,255,' + (0.5 * alpha).toFixed(2) + ')';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(emp.x, emp.y, Math.max(0, emp.r - 14), 0, Math.PI * 2);
  ctx.stroke();
}
