// VAULTBREAK — drawing the characters and the loot: the hooded thief
// with a rim of light, the uniformed guards with cap brims and torch
// dots, the four loot items, and the thrown coin with its dotted arc.
var VB = window.VB || (window.VB = {});

VB.drawActors = function drawActors(ctx, game) {
  drawLoot(ctx, game);
  drawCoin(ctx, game);
  drawGuards(ctx, game);
  drawThief(ctx, game);
};

// Bold text with a dark outline stroke, so labels stay readable when the
// image is shrunk to the contact sheet.
VB.label = function label(ctx, text, x, y, size, color) {
  ctx.font = 'bold ' + size + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(10,8,18,0.9)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color || '#ffffff';
  ctx.fillText(text, x, y);
};

function drawThief(ctx, game) {
  var C = VB.CFG;
  var p = game.player;
  // A soft cyan glow around the thief, so the protagonist never melts
  // into the dark floor or a shadow pool.
  var glow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 34);
  glow.addColorStop(0, 'rgba(127,243,255,0.30)');
  glow.addColorStop(1, 'rgba(127,243,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
  ctx.fill();
  // Soft shadow under the thief.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 12, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hooded silhouette: a lighter navy body (never near-black) with a
  // hood wedge showing the facing.
  ctx.fillStyle = '#31435f';
  ctx.beginPath();
  ctx.arc(p.x, p.y, C.PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a6488';
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.arc(p.x, p.y, C.PLAYER_R - 3, p.angle - 0.55, p.angle + 0.55);
  ctx.closePath();
  ctx.fill();
  // A strong rim of light around the whole body, brightest on one side,
  // so the thief reads at a glance even at 768 by 480.
  ctx.strokeStyle = 'rgba(127,243,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, C.PLAYER_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = C.COL.thiefRim;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, C.PLAYER_R, p.angle + Math.PI * 0.5, p.angle + Math.PI * 1.5);
  ctx.stroke();
  // A small white hood wedge at the facing edge.
  ctx.fillStyle = '#e8e4d0';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.angle) * (C.PLAYER_R - 4),
    p.y + Math.sin(p.angle) * (C.PLAYER_R - 4), 4, 0, Math.PI * 2);
  ctx.fill();
  // The name label sits above the thief — unless a guard is right on top
  // of them, when it drops below so the two labels never collide.
  var crowded = false;
  for (var i = 0; i < game.guards.length; i++) {
    var g = game.guards[i];
    var dx = g.x - p.x;
    var dy = g.y - p.y;
    if (dx * dx + dy * dy < 60 * 60) { crowded = true; break; }
  }
  if (crowded) {
    VB.label(ctx, 'YOU', p.x, p.y + 32, 13);
  } else {
    VB.label(ctx, 'YOU', p.x, p.y - 28, 13);
  }
  if (p.sneaking) {
    VB.label(ctx, 'SNEAK', p.x, p.y + 30, 12, '#7ff3ff');
  }
}

function drawGuards(ctx, game) {
  var C = VB.CFG;
  var guards = game.guards;
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    // Soft shadow under the guard.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y + 10, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Uniformed silhouette: navy body, cap brim, bright torch dot where
    // the vision cone starts.
    ctx.fillStyle = C.COL.guardBody;
    ctx.beginPath();
    ctx.arc(g.x, g.y, C.GUARD_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.COL.guardCap;
    ctx.beginPath();
    ctx.arc(g.x, g.y, C.GUARD_R - 2, g.angle - 1.1, g.angle + 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0d111c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x + Math.cos(g.angle - 0.9) * C.GUARD_R,
      g.y + Math.sin(g.angle - 0.9) * C.GUARD_R);
    ctx.lineTo(g.x + Math.cos(g.angle + 0.9) * C.GUARD_R,
      g.y + Math.sin(g.angle + 0.9) * C.GUARD_R);
    ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * (C.GUARD_R + 2),
      g.y + Math.sin(g.angle) * (C.GUARD_R + 2), 3, 0, Math.PI * 2);
    ctx.fill();
    VB.label(ctx, g.name, g.x, g.y - 26, 13);
    if (g.state === 'distracted') {
      VB.label(ctx, '?', g.x, g.y - 42, 16, '#ffd34d');
    } else if (g.state === 'suspicious') {
      VB.label(ctx, '!', g.x, g.y - 42, 16, '#ff9a3d');
    }
  }
  drawCameraMounts(ctx, game);
}

function drawCameraMounts(ctx, game) {
  var C = VB.CFG;
  var cams = game.cameras;
  for (var i = 0; i < cams.length; i++) {
    var cam = cams[i];
    // A visible wall bracket with a red lens at least twice the old size,
    // so the cones never appear to start from nowhere.
    ctx.fillStyle = '#3a4358';
    ctx.fillRect(cam.x - 16, cam.y - 8, 32, 12);
    ctx.fillStyle = '#232a3d';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y + 2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cam.blindTimer > 0 ? '#2a2f3a' : '#ff2d3f';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y + 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cam.x - 2, cam.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLoot(ctx, game) {
  var C = VB.CFG;
  var loot = game.world.loot;
  var rng = VB.makeRng(20261122);
  for (var i = 0; i < loot.length; i++) {
    var item = loot[i];
    if (game.lootTaken[item.id]) continue;
    if (item.kind === 'diamond') {
      drawDiamond(ctx, item, rng);
    } else if (item.kind === 'gold') {
      drawGoldBars(ctx, item);
    } else if (item.kind === 'cash') {
      drawCashStack(ctx, item);
    } else {
      drawEmeraldIdol(ctx, item);
    }
    VB.label(ctx, item.name, item.x, item.y + 34, 13);
  }
}

function drawDiamond(ctx, item, rng) {
  var C = VB.CFG;
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = C.COL.diamond;
  ctx.fillRect(-14, -14, 28, 28);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(-14, -14, 28, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(-6, -6, 12, 12);
  ctx.restore();
  // Sparkles at fixed seeded positions, so the diamond glints the same
  // way on every frame.
  ctx.fillStyle = '#ffffff';
  for (var i = 0; i < 4; i++) {
    var sx = item.x + (rng() - 0.5) * 44;
    var sy = item.y + (rng() - 0.5) * 44;
    ctx.fillRect(sx - 1, sy - 4, 2, 8);
    ctx.fillRect(sx - 4, sy - 1, 8, 2);
  }
}

function drawGoldBars(ctx, item) {
  var C = VB.CFG;
  ctx.fillStyle = C.COL.gold;
  ctx.fillRect(item.x - 14, item.y - 4, 28, 9);
  ctx.fillRect(item.x - 10, item.y - 12, 20, 9);
  ctx.strokeStyle = '#a87e14';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(item.x - 14, item.y - 4, 28, 9);
  ctx.strokeRect(item.x - 10, item.y - 12, 20, 9);
}

function drawCashStack(ctx, item) {
  var C = VB.CFG;
  ctx.fillStyle = C.COL.cash;
  ctx.fillRect(item.x - 13, item.y - 8, 26, 16);
  ctx.strokeStyle = '#2f7a3a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(item.x - 13, item.y - 8, 26, 16);
  ctx.fillStyle = '#e8e4d0';
  ctx.fillRect(item.x - 3, item.y - 8, 6, 16);
  ctx.fillStyle = '#2f7a3a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', item.x, item.y);
}

function drawEmeraldIdol(ctx, item) {
  var C = VB.CFG;
  ctx.fillStyle = C.COL.emerald;
  ctx.beginPath();
  ctx.moveTo(item.x, item.y - 16);
  ctx.lineTo(item.x + 12, item.y);
  ctx.lineTo(item.x, item.y + 16);
  ctx.lineTo(item.x - 12, item.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0f7a4d';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(item.x - 12, item.y);
  ctx.lineTo(item.x + 12, item.y);
  ctx.stroke();
}

// The thrown coin: a dotted arc from the thief's hand to its landing
// point while it flies, then an expanding ring where it lands.
function drawCoin(ctx, game) {
  var coin = game.tools.coin;
  if (!coin) return;
  var C = VB.CFG;
  if (!coin.landed) {
    var t = coin.t;
    var mx = (coin.x0 + coin.x1) / 2;
    var my = (coin.y0 + coin.y1) / 2 - 46;
    var cx = (1 - t) * (1 - t) * coin.x0 + 2 * (1 - t) * t * mx + t * t * coin.x1;
    var cy = (1 - t) * (1 - t) * coin.y0 + 2 * (1 - t) * t * my + t * t * coin.y1;
    // Dotted arc from hand to landing point, thick enough to read small.
    ctx.save();
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = 'rgba(255,211,77,0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(coin.x0, coin.y0);
    ctx.quadraticCurveTo(mx, my, coin.x1, coin.y1);
    ctx.stroke();
    ctx.restore();
    // The coin itself, big enough to read at 768 by 480.
    ctx.fillStyle = C.COL.gold;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87e14';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#a87e14';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy);
  } else {
    var ringR = 10 + coin.ringT * 60;
    ctx.strokeStyle = 'rgba(255,211,77,' + Math.max(0, 1 - coin.ringT).toFixed(2) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(coin.x1, coin.y1, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = C.COL.gold;
    ctx.beginPath();
    ctx.arc(coin.x1, coin.y1, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}
