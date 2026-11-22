// VAULTBREAK — the game itself: state, the update loop (movement,
// collision, alarm, laser, loot, tools, win and lose), the render order,
// and the boot code. The game object is created once and reset in place,
// so the live handle the page exposes never goes stale.
var VB = window.VB || (window.VB = {});

VB.createGame = function createGame() {
  var game = {
    world: VB.buildWorld(),
    guards: VB.createGuards(),
    cameras: VB.createCameras(),
    tools: VB.createTools(),
    screen: 'title',
    time: 0,
    elapsed: 0,
    alarm: 0,
    score: 0,
    lootScore: 0,
    escapeBonus: 0,
    lootTaken: { diamond: false, gold: false, cash: false, emerald: false },
    player: { x: 90, y: 640, angle: -Math.PI / 2, sneaking: false },
    inShadow: false,
    caughtBy: '',
    hunt: false,
    laserHitThisPass: false,
  };
  return game;
};

// Reset a run in place (the object identity never changes, so the live
// handle exposed to the page and to the probes always stays current).
VB.resetGame = function resetGame(game) {
  game.guards = VB.createGuards();
  game.cameras = VB.createCameras();
  game.tools = VB.createTools();
  game.screen = 'title';
  game.time = 0;
  game.elapsed = 0;
  game.alarm = 0;
  game.score = 0;
  game.lootScore = 0;
  game.escapeBonus = 0;
  game.lootTaken = { diamond: false, gold: false, cash: false, emerald: false };
  game.player = {
    x: game.world.playerStart.x,
    y: game.world.playerStart.y,
    angle: -Math.PI / 2,
    sneaking: false,
  };
  game.inShadow = false;
  game.caughtBy = '';
  game.hunt = false;
  game.laserHitThisPass = false;
};

// Start a fresh run from the title screen.
VB.startRun = function startRun(game) {
  VB.resetGame(game);
  game.screen = 'playing';
};

// One update step. dt is seconds, clamped by the caller.
VB.updateGame = function updateGame(game, dt) {
  var C = VB.CFG;
  var input = VB.Input;

  if (game.screen === 'title') {
    if (input.wasPressed('Enter')) VB.startRun(game);
    return;
  }
  if (game.screen === 'paused') {
    if (input.wasPressed('KeyP')) game.screen = 'playing';
    return;
  }
  if (game.screen === 'caught' || game.screen === 'escaped') {
    if (input.wasPressed('Enter')) VB.startRun(game);
    return;
  }

  // Playing.
  game.time += dt;
  game.elapsed += dt;

  if (input.wasPressed('KeyP')) {
    game.screen = 'paused';
    return;
  }
  if (input.wasPressed('KeyQ')) VB.throwCoin(game);
  if (input.wasPressed('KeyE')) VB.fireEMP(game);

  movePlayer(game, dt);
  VB.updateTools(dt, game);

  // Detection: guards and cameras raise the alarm; hiding drops it.
  var seenBy = updateDetection(game, dt);
  if (!seenBy) {
    game.alarm = Math.max(0, game.alarm - C.ALARM_DECAY * dt);
  }
  if (game.alarm >= 100) {
    game.alarm = 100;
    if (!game.hunt) {
      game.hunt = true;
      for (var hi = 0; hi < game.guards.length; hi++) {
        if (game.guards[hi].state !== 'distracted') game.guards[hi].state = 'hunt';
      }
    }
  }
  if (game.hunt && game.alarm < C.ALARM_HUNT_FLOOR) {
    game.hunt = false;
    for (var pi = 0; pi < game.guards.length; pi++) {
      if (game.guards[pi].state === 'hunt') game.guards[pi].state = 'patrol';
    }
  }
  if (game.alarm > 70) VB.Audio.alarmPulse(game.time);

  updateLaser(game);
  updateLoot(game);
  updateExit(game);
  updateCaught(game);
};

// Move the thief with axis-separated collision: slide along walls instead
// of sticking to them.
function movePlayer(game, dt) {
  var C = VB.CFG;
  var p = game.player;
  var v = VB.Input.moveVector();
  p.sneaking = VB.Input.sneaking();
  var speed = p.sneaking ? C.SNEAK_SPEED : C.WALK_SPEED;
  if (v.x !== 0 || v.y !== 0) {
    p.angle = Math.atan2(v.y, v.x);
    var nx = p.x + v.x * speed * dt;
    if (!VB.circleHitsSolids(game.world, nx, p.y, C.PLAYER_R)) p.x = nx;
    var ny = p.y + v.y * speed * dt;
    if (!VB.circleHitsSolids(game.world, p.x, ny, C.PLAYER_R)) p.y = ny;
  }
  game.inShadow = VB.pointInShadow(game.world, p.x, p.y);
}

// Run every guard and camera vision check and raise the alarm. Returns
// true when anything sees the thief right now.
function updateDetection(game, dt) {
  var C = VB.CFG;
  var seen = false;
  var p = game.player;
  var mod = 1;
  if (p.sneaking) mod *= C.ALARM_SNEAK;
  if (game.inShadow) mod *= C.ALARM_SHADOW;

  for (var i = 0; i < game.guards.length; i++) {
    var g = game.guards[i];
    VB.updateGuard(g, dt, game);
    var vision = VB.guardVision(g, dt, game);
    if (vision === 'seen') {
      game.alarm = Math.min(100, game.alarm + C.ALARM_GUARD * mod * dt);
      seen = true;
    } else if (vision === 'suspicious') {
      game.alarm = Math.min(100, game.alarm + C.SUSPICION_RATE * mod * dt);
      seen = true;
    }
  }
  for (var j = 0; j < game.cameras.length; j++) {
    var cam = game.cameras[j];
    VB.updateCamera(cam, dt, game);
    if (VB.cameraVision(cam, game)) {
      game.alarm = Math.min(100, game.alarm + C.ALARM_CAM * mod * dt);
      seen = true;
    }
  }
  return seen;
}

// The laser grid: crossing the vault door gap while it is live costs
// alarm. The hit fires once per pass through the gap.
function updateLaser(game) {
  var C = VB.CFG;
  var p = game.player;
  var on = VB.laserOnAt(game.time);
  var inGap = VB.pointInLaserGap(game.world, p.x, p.y);
  if (!inGap || !on) {
    if (!inGap) game.laserHitThisPass = false;
    return;
  }
  if (!game.laserHitThisPass) {
    game.laserHitThisPass = true;
    game.alarm = Math.min(100, game.alarm + C.LASER_HIT);
    VB.Audio.laserZap();
  }
}

// Pick up loot the thief walks over.
function updateLoot(game) {
  var C = VB.CFG;
  var p = game.player;
  var loot = game.world.loot;
  for (var i = 0; i < loot.length; i++) {
    var item = loot[i];
    if (game.lootTaken[item.id]) continue;
    var dx = p.x - item.x;
    var dy = p.y - item.y;
    if (dx * dx + dy * dy < C.PICKUP_R * C.PICKUP_R) {
      game.lootTaken[item.id] = true;
      game.score += item.value;
      game.lootScore += item.value;
      VB.Audio.pickup();
    }
  }
}

// Reaching the green EXIT with the diamond wins, with a bonus for a fast
// getaway.
function updateExit(game) {
  var C = VB.CFG;
  if (!game.lootTaken.diamond) return;
  var p = game.player;
  var e = game.world.exit;
  if (p.x >= e.x && p.x <= e.x + e.w && p.y >= e.y && p.y <= e.y + e.h) {
    game.escapeBonus = Math.max(0, C.ESCAPE_BONUS - Math.floor(game.elapsed) * C.ESCAPE_BONUS_PER_SECOND);
    game.score += game.escapeBonus;
    game.screen = 'escaped';
    VB.Audio.win();
  }
}

// A guard touching the thief ends the run.
function updateCaught(game) {
  var C = VB.CFG;
  var p = game.player;
  for (var i = 0; i < game.guards.length; i++) {
    var g = game.guards[i];
    var dx = p.x - g.x;
    var dy = p.y - g.y;
    if (dx * dx + dy * dy < C.CATCH_R * C.CATCH_R) {
      game.screen = 'caught';
      game.caughtBy = g.name;
      VB.Audio.caught();
      return;
    }
  }
}

// Render one frame: floor, then light, then characters, then the HUD,
// then the screen overlay for the current screen.
VB.renderGame = function renderGame(ctx, game) {
  VB.drawFloor(ctx, game);
  VB.drawLight(ctx, game);
  VB.drawActors(ctx, game);
  VB.drawHud(ctx, game);
  if (game.screen === 'title') VB.drawTitleScreen(ctx, game);
  else if (game.screen === 'paused') VB.drawPauseScreen(ctx, game);
  else if (game.screen === 'caught') VB.drawCaughtBanner(ctx, game);
  else if (game.screen === 'escaped') VB.drawEscapedScreen(ctx, game);
};

// A plain snapshot of the live state, for the headless probes.
VB.gameStateSnapshot = function gameStateSnapshot(game) {
  var guards = [];
  for (var i = 0; i < game.guards.length; i++) {
    var g = game.guards[i];
    guards.push({
      name: g.name, state: g.state,
      x: Math.round(g.x), y: Math.round(g.y),
      angle: +g.angle.toFixed(2), seeTimer: +g.seeTimer.toFixed(2),
    });
  }
  var cams = [];
  for (var j = 0; j < game.cameras.length; j++) {
    cams.push({
      blindTimer: +game.cameras[j].blindTimer.toFixed(2),
      angle: +game.cameras[j].angle.toFixed(2),
    });
  }
  return {
    screen: game.screen,
    time: +game.time.toFixed(2),
    elapsed: +game.elapsed.toFixed(2),
    alarm: +game.alarm.toFixed(1),
    score: game.score,
    lootScore: game.lootScore,
    escapeBonus: game.escapeBonus,
    lootTaken: game.lootTaken,
    coinsLeft: game.tools.coinsLeft,
    empsLeft: game.tools.empsLeft,
    coin: game.tools.coin
      ? { landed: game.tools.coin.landed, t: +game.tools.coin.t.toFixed(2), x1: game.tools.coin.x1, y1: game.tools.coin.y1 }
      : null,
    emp: !!game.tools.emp,
    player: {
      x: Math.round(game.player.x), y: Math.round(game.player.y),
      angle: +game.player.angle.toFixed(2), sneaking: game.player.sneaking,
    },
    inShadow: game.inShadow,
    laserOn: VB.laserOnAt(game.time),
    hunt: game.hunt,
    caughtBy: game.caughtBy,
    guards: guards,
    cameras: cams,
  };
};

// Boot: one game, a live handle that never goes stale, and either a
// frozen staged shot or the requestAnimationFrame loop.
(function bootVaultbreak() {
  var canvas = document.getElementById('game');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var game = VB.createGame();

  var api = (window.VAULTBREAK = window.VAULTBREAK || {});
  Object.defineProperty(api, 'game', {
    get: function getGame() { return game; },
    configurable: true,
  });
  api.state = function state() { return VB.gameStateSnapshot(game); };
  api.reset = function reset() { VB.resetGame(game); };
  api.applyShot = function applyShot(n) { VB.applyShot(game, n); };

  var params = new URLSearchParams(window.location.search);
  var shot = params.get('shot');
  if (shot) {
    VB.applyShot(game, parseInt(shot, 10));
    VB.renderGame(ctx, game);
    return;
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    VB.updateGame(game, dt);
    VB.renderGame(ctx, game);
    VB.Input.endFrame();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
