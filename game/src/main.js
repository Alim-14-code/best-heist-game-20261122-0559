// VAULTBREAK — game loop, state machine, alarm, scoring.
// States: title -> playing -> paused | caught | escaped.
'use strict';

const game = {
  state: 'title',
  player: { x: VB.PLAYER_START.x, y: VB.PLAYER_START.y, dir: -Math.PI / 2, sneaking: false },
  alarm: 0,
  score: 0,
  lootScore: 0,
  timeBonus: 0,
  elapsed: 0,
  time: 0,
  hunting: false,
  caughtBy: null,
  frozen: false,
  stepAcc: 0,

  snapshot() {
    return {
      state: this.state,
      alarm: Math.round(this.alarm * 10) / 10,
      score: this.score,
      lootScore: this.lootScore,
      timeBonus: this.timeBonus,
      elapsed: Math.round(this.elapsed * 10) / 10,
      hunting: this.hunting,
      player: { x: Math.round(this.player.x), y: Math.round(this.player.y), sneaking: this.player.sneaking },
      loot: World.loot.map((l) => ({ id: l.id, taken: l.taken })),
      guards: Guards.list.map((g) => ({
        name: g.name, x: Math.round(g.x), y: Math.round(g.y),
        state: g.state, seen: g.seen,
      })),
      cameras: Guards.cameras.map((c) => ({ seen: c.seen, angle: Math.round(c.angle * 100) / 100 })),
      caughtBy: this.caughtBy,
    };
  },

  start() {
    World.reset();
    Guards.reset();
    this.player.x = VB.PLAYER_START.x;
    this.player.y = VB.PLAYER_START.y;
    this.player.dir = -Math.PI / 2;
    this.player.sneaking = false;
    this.alarm = 0;
    this.score = 0;
    this.lootScore = 0;
    this.timeBonus = 0;
    this.elapsed = 0;
    this.time = 0;
    this.hunting = false;
    this.caughtBy = null;
    this.state = 'playing';
    AudioFX.alarmStop();
    AudioFX.click();
  },

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      AudioFX.alarmStop();
    } else if (this.state === 'paused') {
      this.state = 'playing';
      AudioFX.click();
    }
  },

  update(dt) {
    if (this.state !== 'playing') return;
    this.time += dt;
    this.elapsed += dt;

    // Movement.
    const mv = Input.moveVector();
    this.player.sneaking = Input.sneaking && (mv.x !== 0 || mv.y !== 0);
    const speed = this.player.sneaking ? VB.SNEAK_SPEED : VB.WALK_SPEED;
    if (mv.x !== 0 || mv.y !== 0) {
      this.player.dir = Math.atan2(mv.y, mv.x);
      const moved = World.moveCircle(
        this.player.x, this.player.y, VB.PLAYER_R,
        mv.x * speed * dt, mv.y * speed * dt,
      );
      const movedDist = dist(this.player.x, this.player.y, moved.x, moved.y);
      this.player.x = moved.x;
      this.player.y = moved.y;
      // Footstep ticks while actually moving.
      this.stepAcc += movedDist;
      if (this.stepAcc > 46) {
        this.stepAcc = 0;
        AudioFX.step(this.player.sneaking);
      }
    }

    // Watchers.
    const seen = Guards.update(dt, this.time, this.player, this.player.sneaking, this.hunting);
    const sneakFactor = this.player.sneaking ? VB.ALARM_SNEAK_FACTOR : 1;
    const wasSeen = this.alarm > 0 && (seen.guardSeen || seen.cameraSeen);
    if (seen.guardSeen) {
      if (!this._wasGuardSeen) AudioFX.spotted();
      this.alarm += VB.ALARM_GUARD_RATE * sneakFactor * dt;
    }
    if (seen.cameraSeen) this.alarm += VB.ALARM_CAMERA_RATE * sneakFactor * dt;
    this._wasGuardSeen = seen.guardSeen;
    if (!seen.guardSeen && !seen.cameraSeen) {
      this.alarm -= VB.ALARM_DECAY * dt;
    }
    this.alarm = clamp(this.alarm, 0, 100);

    // Alarm siren while the heat is on.
    if (this.alarm >= 60) AudioFX.alarmStart();
    else if (this.alarm < 40) AudioFX.alarmStop();

    // Hunt triggers at a full meter; ends when the alarm cools down.
    if (this.alarm >= 100 && !this.hunting) {
      this.hunting = true;
      AudioFX.spotted();
    }
    if (this.hunting && this.alarm < VB.HUNT_ALARM_FLOOR) {
      this.hunting = false;
      Guards.stopHunt();
    }

    // Loot pickup.
    const item = World.lootNear(this.player.x, this.player.y);
    if (item) {
      item.taken = true;
      this.lootScore += item.value;
      this.score += item.value;
      AudioFX.pickup();
    }

    // Caught: a guard touches the thief.
    const grabber = Guards.touchingPlayer(this.player);
    if (grabber) {
      this.state = 'caught';
      this.caughtBy = grabber.name;
      AudioFX.caught();
      return;
    }

    // Win: diamond in hand and standing in the exit.
    if (World.diamond.taken && World.inExit(this.player.x, this.player.y)) {
      this.timeBonus = Math.max(0, 3000 - Math.floor(this.elapsed) * 10);
      this.score = this.lootScore + this.timeBonus;
      this.state = 'escaped';
      AudioFX.alarmStop();
      AudioFX.win();
    }
  },

  handleKeys() {
    if (Input.wasPressed('enter')) {
      if (this.state === 'title' || this.state === 'caught' || this.state === 'escaped') {
        this.start();
      }
    }
    if (Input.wasPressed('p') || Input.wasPressed('escape')) {
      this.togglePause();
    }
  },

  frame(now) {
    const dt = Math.min(0.05, (now - (this._last || now)) / 1000 || 0);
    this._last = now;
    this.handleKeys();
    this.update(dt);
    Render.draw(this);
    Input.endFrame();
  },
};

function boot() {
  const canvas = document.getElementById('game');
  Render.init(canvas);
  Input.init();
  World.reset();
  Guards.reset();

  // Test / screenshot hook: the live game state, readable from DevTools.
  window.__vaultbreak = game;

  const shot = new URLSearchParams(window.location.search).get('shot');
  if (shot) {
    // Staged scene: compose, draw one frozen frame, no loop.
    game.frozen = true;
    Shots.apply(parseInt(shot, 10) || 1, game);
    Render.draw(game);
    return;
  }

  const loop = (now) => {
    game.frame(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', boot);
