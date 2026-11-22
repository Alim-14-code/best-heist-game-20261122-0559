// VAULTBREAK — the thief's tools. Q throws a coin: a visible gold coin
// arcs to a landing point and the nearest guard walks over to investigate.
// E fires an EMP: a blue pulse ring blinds the cameras for a while, at the
// cost of alarm.
var VB = window.VB || (window.VB = {});

VB.createTools = function createTools() {
  return {
    coinsLeft: VB.CFG.COIN_COUNT,
    empsLeft: VB.CFG.EMP_COUNT,
    coin: null, // {x0,y0,x1,y1,t,landed,ringT} while a coin is in play
    emp: null, // {x,y,r} while the blue pulse ring is expanding
  };
};

// Throw a coin ahead of the thief. Returns false when no coins are left.
VB.throwCoin = function throwCoin(game) {
  var tools = game.tools;
  if (tools.coinsLeft <= 0 || tools.coin) return false;
  var C = VB.CFG;
  var p = game.player;
  var lx = p.x + Math.cos(p.angle) * C.COIN_THROW;
  var ly = p.y + Math.sin(p.angle) * C.COIN_THROW;
  // Keep the landing point inside the room and out of the walls.
  lx = Math.max(50, Math.min(C.W - 50, lx));
  ly = Math.max(50, Math.min(C.H - 50, ly));
  if (VB.circleHitsSolids(game.world, lx, ly, 10)) {
    lx = p.x + Math.cos(p.angle) * 70;
    ly = p.y + Math.sin(p.angle) * 70;
  }
  tools.coin = { x0: p.x, y0: p.y, x1: lx, y1: ly, t: 0, landed: false, ringT: 0 };
  tools.coinsLeft -= 1;
  VB.Audio.coin();
  return true;
};

// Fire an EMP. Returns false when no EMPs are left.
VB.fireEMP = function fireEMP(game) {
  var tools = game.tools;
  if (tools.empsLeft <= 0 || tools.emp) return false;
  var C = VB.CFG;
  tools.emp = { x: game.player.x, y: game.player.y, r: 0 };
  tools.empsLeft -= 1;
  game.alarm = Math.min(100, game.alarm + C.EMP_COST);
  var cams = game.cameras;
  for (var i = 0; i < cams.length; i++) cams[i].blindTimer = C.EMP_BLIND;
  VB.Audio.emp();
  return true;
};

// Advance the coin flight, the landing ring and the EMP pulse. When the
// coin lands, the nearest guard inside range walks over to investigate.
VB.updateTools = function updateTools(dt, game) {
  var C = VB.CFG;
  var tools = game.tools;
  var coin = tools.coin;
  if (coin) {
    if (!coin.landed) {
      coin.t += dt / C.COIN_FLIGHT;
      if (coin.t >= 1) {
        coin.t = 1;
        coin.landed = true;
        coin.ringT = 0;
        distractNearestGuard(game, coin.x1, coin.y1);
      }
    } else {
      coin.ringT += dt;
      if (coin.ringT > 0.9) tools.coin = null;
    }
  }
  var emp = tools.emp;
  if (emp) {
    emp.r += (C.EMP_RADIUS / 0.8) * dt;
    if (emp.r >= C.EMP_RADIUS) tools.emp = null;
  }
};

function distractNearestGuard(game, x, y) {
  var C = VB.CFG;
  var best = null;
  var bestDist = C.COIN_RANGE;
  var guards = game.guards;
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    if (g.state === 'hunt') continue; // hunting guards ignore coins
    var dx = g.x - x;
    var dy = g.y - y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDist) {
      bestDist = d;
      best = g;
    }
  }
  if (best) {
    best.state = 'distracted';
    best.distractX = x;
    best.distractY = y;
    best.distractTimer = C.COIN_DISTRACT;
    best.seeTimer = 0;
  }
}
