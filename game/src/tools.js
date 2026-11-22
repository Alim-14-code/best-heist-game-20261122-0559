// VAULTBREAK tools: the coin and the EMP. Tools are what give the heist
// depth — a coin buys a quiet route, an EMP buys blind cameras, both at
// a cost (a limited count, and the EMP feeds the alarm).
'use strict';

const VBTools = {
  // Throw a coin from the thief toward (dx, dy) (a unit vector). The
  // coin lands about 220 pixels ahead after a short flight; the nearest
  // guard within range of the landing point walks over to investigate.
  // Guards already hunting ignore coins.
  throwCoin: function (game) {
    if (game.coins <= 0) return false;
    if (game.coin.active) return false;
    game.coins -= 1;
    const px = game.player.x;
    const py = game.player.y;
    const dx = Math.cos(game.player.dir);
    const dy = Math.sin(game.player.dir);
    game.coin = {
      active: true,
      x: px, y: py,
      sx: px, sy: py,
      tx: px + dx * 220, ty: py + dy * 220,
      t: 0, dur: 0.35, landed: false,
    };
    VBAudio.coin();
    return true;
  },

  // Advance a flying coin; when it lands, distract the nearest guard.
  stepCoin: function (game, dt) {
    const c = game.coin;
    if (!c.active) return;
    c.t += dt;
    const k = Math.min(1, c.t / c.dur);
    c.x = c.sx + (c.tx - c.sx) * k;
    c.y = c.sy + (c.ty - c.sy) * k;
    if (k >= 1 && !c.landed) {
      c.landed = true;
      let best = null;
      let bestD = VB.COIN_RANGE;
      for (let i = 0; i < game.guards.length; i++) {
        const g = game.guards[i];
        if (g.state === 'hunt' || game.hunting) continue;
        const dx = g.x - c.x;
        const dy = g.y - c.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestD) { bestD = d; best = g; }
      }
      if (best) {
        best.state = 'distracted';
        best.distract = { x: c.x, y: c.y };
        best.wait = VB.COIN_TIME;
        best.seen = false;
      }
      // The coin stays on the floor briefly as a visual, then clears.
      c.clearIn = 1.2;
    }
    if (c.landed) {
      c.clearIn -= dt;
      if (c.clearIn <= 0) c.active = false;
    }
  },

  // Fire the EMP: every camera goes blind for a while, and the burst
  // feeds the alarm. Returns false when no EMPs are left.
  fireEmp: function (game) {
    if (game.emps <= 0) return false;
    game.emps -= 1;
    for (let i = 0; i < game.cameras.length; i++) {
      game.cameras[i].blind = VB.EMP_TIME;
      game.cameras[i].seen = false;
    }
    game.alarm = Math.min(100, game.alarm + VB.EMP_COST);
    VBAudio.emp();
    return true;
  },
};
