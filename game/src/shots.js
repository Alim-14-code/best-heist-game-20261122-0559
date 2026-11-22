// VAULTBREAK — the four staged screenshots. Each shot freezes a composed
// frame of the real game: same world, same render path, no special-cased
// art. `?shot=N` in the page URL applies shot N and renders one frame.
var VB = window.VB || (window.VB = {});

VB.applyShot = function applyShot(game, n) {
  var C = VB.CFG;
  VB.resetGame(game);
  if (n === 1) applyCover(game);
  else if (n === 2) applyTitle(game);
  else if (n === 3) applyAlarm(game);
  else if (n === 4) applyCaught(game);
  else applyCover(game);
};

// The cover: mid-heist, everything in one frame. The thief sneaks toward
// the vault with a coin arcing through the air; the guards' cones are
// staggered so no two overlap heavily; the camera cones aim at the floor
// edges; the diamond glows in the vault; the lanes are named; the EXIT
// is visible; the laser grid is off so the carpet reads clean.
function applyCover(game) {
  var C = VB.CFG;
  game.screen = 'playing';
  game.time = 4.0; // laser off: (4.0 % 5) = 4.0, past the 3-second on-window
  game.alarm = 34;
  game.score = 800;
  game.lootScore = 800;
  game.lootTaken.gold = true;

  var p = game.player;
  p.x = 560;
  p.y = 470;
  p.angle = -Math.PI / 2; // facing up, toward the vault
  p.sneaking = true;

  var rook = game.guards[0];
  rook.x = 760;
  rook.y = 400;
  rook.angle = Math.PI; // facing left, toward the flying coin
  rook.state = 'distracted';
  rook.distractX = 700;
  rook.distractY = 400;
  rook.distractTimer = 3;

  var bishop = game.guards[1];
  bishop.x = 280;
  bishop.y = 560;
  bishop.angle = -Math.PI / 4; // up-right, away from Rook's cone
  bishop.state = 'patrol';

  var knight = game.guards[2];
  knight.x = 700;
  knight.y = 300;
  knight.angle = -Math.PI / 2; // facing up, guarding the vault door
  knight.state = 'patrol';

  game.cameras[0].angle = 2.2; // down-left, toward the floor edge
  game.cameras[1].angle = 0.94; // down-right, toward the floor edge

  // The coin mid-flight, its dotted arc still visible.
  game.tools.coin = { x0: 560, y0: 470, x1: 700, y1: 400, t: 0.5, landed: false, ringT: 0 };
  game.tools.coinsLeft = 2;
  game.inShadow = VB.pointInShadow(game.world, p.x, p.y);
}

// The title screen over the dimmed room.
function applyTitle(game) {
  game.screen = 'title';
  game.time = 0;
  game.player.x = game.world.playerStart.x;
  game.player.y = game.world.playerStart.y;
  game.player.angle = -Math.PI / 2;
}

// High alarm with the diamond secured: the thief at the vault door,
// fleeing toward the EXIT, a guard closing in. The vault is empty, but
// the HUD loot count carries a diamond glyph so it reads as "taken".
function applyAlarm(game) {
  game.screen = 'playing';
  game.time = 4.0; // laser off: the thief just slipped through the gap
  game.alarm = 92;
  game.score = 5800;
  game.lootScore = 5800;
  game.lootTaken.diamond = true;
  game.lootTaken.gold = true;

  var p = game.player;
  p.x = 640;
  p.y = 310;
  p.angle = 0.65; // facing down-right, toward the EXIT
  p.sneaking = false;

  var knight = game.guards[2];
  knight.x = 700;
  knight.y = 345;
  knight.angle = Math.atan2(p.y - knight.y, p.x - knight.x);
  knight.state = 'seen';
  knight.seeTimer = 1.2;

  var rook = game.guards[0];
  rook.x = 480;
  rook.y = 430;
  rook.angle = -0.5;
  rook.state = 'patrol';

  var bishop = game.guards[1];
  bishop.x = 300;
  bishop.y = 480;
  bishop.angle = 0;
  bishop.state = 'patrol';

  game.cameras[0].angle = 2.2;
  game.cameras[1].angle = 0.94;
  game.inShadow = false;
}

// The caught moment: the guard reaching the thief, alarm at 100 percent.
// The "CAUGHT!" text is a small banner at the top, never a panel over
// the action, so the moment itself stays visible.
function applyCaught(game) {
  game.screen = 'caught';
  game.time = 4.0;
  game.alarm = 100;
  game.score = 5000;
  game.lootScore = 5000;
  game.lootTaken.diamond = true;
  game.caughtBy = 'Rook';

  var p = game.player;
  p.x = 640;
  p.y = 440;
  p.angle = Math.PI; // facing back at the guard
  p.sneaking = false;

  var rook = game.guards[0];
  rook.x = 624;
  rook.y = 438;
  rook.angle = 0; // reaching toward the thief
  rook.state = 'seen';
  rook.seeTimer = 2.0;

  var knight = game.guards[2];
  knight.x = 760;
  knight.y = 380;
  knight.angle = Math.PI; // facing left, toward the scene
  knight.state = 'seen';
  knight.seeTimer = 1.5;

  var bishop = game.guards[1];
  bishop.x = 300;
  bishop.y = 500;
  bishop.angle = 0;
  bishop.state = 'patrol';

  game.cameras[0].angle = 2.2;
  game.cameras[1].angle = 0.94;
  game.inShadow = false;
}
