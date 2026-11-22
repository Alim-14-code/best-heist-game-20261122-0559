// VAULTBREAK main loop: state machine, movement, vision, alarm, loot,
// tools, win and caught. All tuning lives in config.js; the level in
// world.js; guards and cameras in guards.js; tools in tools.js; drawing
// in render.js; staged shots in shots.js.
'use strict';

const VBGame = {
  canvas: null,
  ctx: null,
  game: null,

  newGame: function () {
    return {
      state: 'title',
      time: 0,
      elapsed: 0,
      alarm: 0,
      score: 0,
      lootScore: 0,
      lootTaken: 0,
      timeBonus: 0,
      diamondTaken: false,
      coins: VB.COINS,
      emps: VB.EMPS,
      hunting: false,
      caughtBy: null,
      world: VBWorld.build(),
      guards: VBGuards.makeGuards(),
      cameras: VBGuards.makeCameras(),
      coin: { active: false },
      player: {
        x: VB.START.x, y: VB.START.y,
        dir: -Math.PI / 2, sneaking: false,
      },
    };
  },

  reset: function () {
    this.game = this.newGame();
  },

  start: function () {
    this.reset();
    this.game.state = 'playing';
  },

  update: function (dt) {
    const g = this.game;
    if (g.state !== 'playing') return;
    g.time += dt;
    g.elapsed += dt;

    // Movement.
    const mv = VBInput.move();
    const sneaking = VBInput.sneaking();
    g.player.sneaking = sneaking;
    const speed = sneaking ? VB.SNEAK_SPEED : VB.WALK_SPEED;
    if (mv.x !== 0 || mv.y !== 0) {
      g.player.dir = Math.atan2(mv.y, mv.x);
      const moved = VBWorld.moveCircle(g.world.walls, g.player.x, g.player.y,
        VB.PLAYER_R, mv.x * speed * dt, mv.y * speed * dt);
      g.player.x = moved.x;
      g.player.y = moved.y;
    }

    // Tools.
    if (VBInput.hit('KeyQ')) VBTools.throwCoin(g);
    if (VBInput.hit('KeyE')) VBTools.fireEmp(g);
    VBTools.stepCoin(g, dt);

    // Cameras sweep (and count down EMP blindness).
    for (let i = 0; i < g.cameras.length; i++) {
      VBGuards.stepCamera(g.cameras[i], g.time, dt);
    }

    // Vision: who sees the thief right now?
    let guardSees = false;
    let cameraSees = false;
    for (let i = 0; i < g.guards.length; i++) {
      const gd = g.guards[i];
      gd.seen = VBGuards.canSee(g.world.walls, gd.x, gd.y, gd.dir,
        VB.VISION_RANGE, VB.VISION_HALF, g.player.x, g.player.y);
      if (gd.seen) guardSees = true;
    }
    for (let i = 0; i < g.cameras.length; i++) {
      const cam = g.cameras[i];
      cam.seen = cam.blind <= 0 && VBGuards.canSee(g.world.walls, cam.x, cam.y + 8,
        cam.angle, VB.CAMERA_RANGE, VB.CAMERA_HALF, g.player.x, g.player.y);
      if (cam.seen) cameraSees = true;
    }

    // Alarm: rise while seen (sneaking softens it), decay while hidden.
    let rise = 0;
    if (guardSees) rise += VB.ALARM_GUARD;
    if (cameraSees) rise += VB.ALARM_CAMERA;
    if (rise > 0) {
      g.alarm += rise * (sneaking ? VB.ALARM_SNEAK : 1) * dt;
    } else {
      g.alarm -= VB.ALARM_DECAY * dt;
    }
    if (g.alarm > 100) g.alarm = 100;
    if (g.alarm < 0) g.alarm = 0;
    if (g.alarm >= 100) g.hunting = true;
    if (g.hunting && g.alarm < VB.HUNT_FLOOR) {
      g.hunting = false;
      for (let i = 0; i < g.guards.length; i++) {
        if (g.guards[i].state === 'hunt') g.guards[i].state = 'patrol';
      }
    }
    if (g.hunting) {
      for (let i = 0; i < g.guards.length; i++) {
        if (g.guards[i].state !== 'distracted') g.guards[i].state = 'hunt';
      }
    }
    if (g.alarm >= 70) VBAudio.alarmPulse(g.time);

    // Guards move.
    for (let i = 0; i < g.guards.length; i++) {
      VBGuards.stepGuard(g.guards[i], g.world.walls, g.player, g.hunting, dt);
    }

    // Loot pickup.
    for (let i = 0; i < g.world.loot.length; i++) {
      const l = g.world.loot[i];
      if (l.taken) continue;
      const dx = l.x - g.player.x;
      const dy = l.y - g.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < VB.PICKUP_R + l.r) {
        l.taken = true;
        g.lootScore += l.value;
        g.score += l.value;
        g.lootTaken += 1;
        if (l.id === 'diamond') g.diamondTaken = true;
        VBAudio.pickup();
      }
    }

    // Caught: a guard touches the thief.
    for (let i = 0; i < g.guards.length; i++) {
      const gd = g.guards[i];
      const dx = gd.x - g.player.x;
      const dy = gd.y - g.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < VB.CATCH_R + VB.GUARD_R * 0.4) {
        g.state = 'caught';
        g.caughtBy = gd.name;
        VBAudio.caught();
        return;
      }
    }

    // Escape: reach the green EXIT with the diamond.
    const e = g.world.exit;
    if (g.player.x + VB.PLAYER_R > e.x && g.player.x - VB.PLAYER_R < e.x + e.w &&
        g.player.y + VB.PLAYER_R > e.y && g.player.y - VB.PLAYER_R < e.y + e.h) {
      if (g.diamondTaken) {
        g.timeBonus = Math.max(0, Math.round((VB.PAR_TIME - g.elapsed) * VB.BONUS_RATE));
        g.score = g.lootScore + g.timeBonus;
        g.state = 'escaped';
        VBAudio.win();
      }
    }
  },

  frame: function (now) {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000 || 0);
    this.last = now;
    // Edge-triggered keys.
    if (VBInput.hit('Enter')) {
      if (this.game.state === 'title' || this.game.state === 'caught' || this.game.state === 'escaped') {
        VBAudio.ensure();
        this.start();
      }
    }
    // Re-read the game object: start() replaces it with a fresh one.
    const g = this.game;
    if (VBInput.hit('KeyP')) {
      if (g.state === 'playing') g.state = 'paused';
      else if (g.state === 'paused') g.state = 'playing';
    }
    this.update(dt);
    VBRender.draw(this.ctx, g);
    VBInput.endFrame();
  },

  init: function () {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    VBInput.init();
    this.reset();
    const self = this;

    // Staged screenshot mode: freeze one composed frame, same render path.
    const shot = new URLSearchParams(window.location.search).get('shot');
    if (shot) {
      VBShots.apply(parseInt(shot, 10) || 1, this.game);
      VBRender.draw(this.ctx, this.game);
      // A getter, so the hook always reads the live game object even
      // after a reset replaces it.
      window.VAULTBREAK = { get game() { return self.game; }, shots: true };
      return;
    }

    const loop = function (now) {
      self.frame(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // Probe hook for headless playtests. `game` is a getter so it never
    // goes stale when reset() swaps in a fresh game object.
    window.VAULTBREAK = {
      get game() { return self.game; },
      start: function () { self.start(); },
      state: function () { return self.game.state; },
    };
  },
};

window.addEventListener('DOMContentLoaded', function () {
  VBGame.init();
});
