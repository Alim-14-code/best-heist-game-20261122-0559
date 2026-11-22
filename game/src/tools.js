// Tools at a cost: the thief carries a few coins and EMP charges.
// A tossed coin clinks on the floor and pulls the nearest guard off its
// patrol to investigate. An EMP burst blinds both cameras for a while —
// but the pulse is loud, so it costs alarm. Both are limited; when they
// are gone, the thief is on foot and on nerve alone.
'use strict';

const Tools = {
  coins: VB.COIN_START,
  emp: VB.EMP_START,
  empTimer: 0, // seconds of camera blackout remaining
  coin: null, // { x, y, t } — a landed coin guards walk toward, or null
  flash: 0, // EMP screen-flash timer for the renderer

  reset() {
    this.coins = VB.COIN_START;
    this.emp = VB.EMP_START;
    this.empTimer = 0;
    this.coin = null;
    this.flash = 0;
  },

  get camerasDown() {
    return this.empTimer > 0;
  },

  // Throw a coin ahead of the thief. The nearest guard that can hear it
  // leaves its patrol to investigate the landing spot.
  throwCoin(player) {
    if (this.coins <= 0) return false;
    this.coins -= 1;
    const lx = clamp(player.x + Math.cos(player.dir) * VB.COIN_THROW_DIST, 40, VB.W - 40);
    const ly = clamp(player.y + Math.sin(player.dir) * VB.COIN_THROW_DIST, 40, VB.H - 40);
    this.coin = { x: lx, y: ly, t: VB.COIN_DISTRACT_SECS };
    AudioFX.coinToss();
    this.distractNearestGuard(lx, ly);
    return true;
  },

  distractNearestGuard(lx, ly) {
    let best = null, bestD = VB.COIN_HEAR_RANGE;
    for (const g of Guards.list) {
      if (g.state === 'hunt') continue; // a hunting guard ignores coins
      const d = dist(g.x, g.y, lx, ly);
      if (d < bestD) { best = g; bestD = d; }
    }
    if (best) {
      best.state = 'distracted';
      best.investigateX = lx;
      best.investigateY = ly;
      best.distractTimer = VB.COIN_DISTRACT_SECS;
    }
  },

  // Fire the EMP: cameras go dark, the alarm jumps from the noise.
  // Returns the alarm cost, or 0 when no charge is left.
  fireEmp() {
    if (this.emp <= 0) return 0;
    this.emp -= 1;
    this.empTimer = VB.EMP_DISABLE_SECS;
    this.flash = 0.35;
    AudioFX.empBurst();
    return VB.EMP_ALARM_COST;
  },

  update(dt) {
    if (this.empTimer > 0) this.empTimer = Math.max(0, this.empTimer - dt);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);
    if (this.coin) {
      this.coin.t -= dt;
      if (this.coin.t <= 0) this.coin = null;
    }
  },
};
