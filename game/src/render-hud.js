// VAULTBREAK — drawing the HUD and the screens: the title and alarm bar
// with percent, the dollar score and loot count (with a diamond glyph once
// the diamond is taken), the tool chips, the objective line, and the
// title / pause / caught / escaped screens.
var VB = window.VB || (window.VB = {});

VB.drawHud = function drawHud(ctx, game) {
  var C = VB.CFG;
  // Top bar.
  ctx.fillStyle = 'rgba(12,9,22,0.82)';
  ctx.fillRect(0, 0, C.W, 46);

  // Title, left.
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('VAULTBREAK', 16, 24);

  // Alarm bar, centre, with percent.
  var barX = 440;
  var barW = 400;
  ctx.strokeStyle = '#6b7a94';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, 14, barW, 16);
  var frac = Math.max(0, Math.min(1, game.alarm / 100));
  ctx.fillStyle = game.alarm >= 75 ? '#ff3b30' : game.alarm >= 40 ? '#ff9a3d' : '#4ade80';
  ctx.fillRect(barX + 1, 15, (barW - 2) * frac, 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM ' + Math.round(game.alarm) + '%', barX + barW / 2, 38);

  // Score and loot count, right. A diamond glyph in the count once the
  // diamond is taken, so an empty vault reads as "taken", not "missing".
  var taken = 0;
  var ids = ['diamond', 'gold', 'cash', 'emerald'];
  for (var i = 0; i < ids.length; i++) if (game.lootTaken[ids[i]]) taken++;
  var lootText = game.lootTaken.diamond ? 'Loot ◆' + taken + '/4' : 'Loot ' + taken + '/4';
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('$' + game.score, C.W - 16, 18);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(lootText, C.W - 16, 38);

  // Tool chips, bottom-left.
  drawChip(ctx, 16, C.H - 40, '[Q] COIN x' + game.tools.coinsLeft, '#ffd34d');
  drawChip(ctx, 128, C.H - 40, '[E] EMP x' + game.tools.empsLeft, '#7fb4ff');

  // Objective line, bottom-centre.
  var obj = 'Steal the Meridian Diamond, then reach the green EXIT';
  ctx.font = '13px sans-serif';
  var ow = ctx.measureText(obj).width + 24;
  ctx.fillStyle = 'rgba(12,9,22,0.75)';
  ctx.fillRect(C.W / 2 - ow / 2, C.H - 38, ow, 26);
  ctx.fillStyle = '#e8e4d0';
  ctx.textAlign = 'center';
  ctx.fillText(obj, C.W / 2, C.H - 25);

  // Shadow indicator: the thief is hidden while standing in a shadow pool.
  if (game.inShadow && game.screen === 'playing') {
    VB.label(ctx, 'IN SHADOW — HIDDEN', game.player.x, game.player.y - 44, 12, '#7ff3ff');
  }
};

function drawChip(ctx, x, y, text, color) {
  ctx.font = 'bold 13px sans-serif';
  var w = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(12,9,22,0.8)';
  ctx.fillRect(x, y, w, 26);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, 26);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 8, y + 14);
}

// The title screen: the room dimmed behind a big title, the controls, and
// the press-Enter line.
VB.drawTitleScreen = function drawTitleScreen(ctx, game) {
  var C = VB.CFG;
  ctx.fillStyle = 'rgba(10,7,20,0.72)';
  ctx.fillRect(0, 0, C.W, C.H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VAULTBREAK', C.W / 2, 210);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('A night-gallery heist', C.W / 2, 262);
  ctx.fillStyle = '#e8e4d0';
  ctx.font = '17px sans-serif';
  ctx.fillText('WASD / arrows — move      Shift — sneak      Q — throw a coin      E — fire an EMP', C.W / 2, 340);
  ctx.fillText('Dodge the cones. Steal the Meridian Diamond. Reach the green EXIT.', C.W / 2, 372);
  ctx.fillText('Shadow pools hide you. The laser grid at the vault door cycles on and off.', C.W / 2, 404);
  ctx.fillStyle = '#7ff3ff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER to start', C.W / 2, 470);
};

// The pause screen.
VB.drawPauseScreen = function drawPauseScreen(ctx, game) {
  var C = VB.CFG;
  ctx.fillStyle = 'rgba(10,7,20,0.6)';
  ctx.fillRect(0, 0, C.W, C.H);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', C.W / 2, C.H / 2 - 20);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#e8e4d0';
  ctx.fillText('Press P to resume', C.W / 2, C.H / 2 + 24);
};

// The caught moment: a small banner at the top, never a panel covering
// the action — the guard reaching the thief stays visible.
VB.drawCaughtBanner = function drawCaughtBanner(ctx, game) {
  var C = VB.CFG;
  ctx.fillStyle = 'rgba(180,20,30,0.92)';
  var w = 260;
  ctx.fillRect(C.W / 2 - w / 2, 56, w, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CAUGHT!', C.W / 2, 80);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#e8e4d0';
  ctx.fillText(game.caughtBy + ' caught you — press Enter to try again', C.W / 2, 122);
};

// The escaped screen: the getaway pays off the planning.
VB.drawEscapedScreen = function drawEscapedScreen(ctx, game) {
  var C = VB.CFG;
  ctx.fillStyle = 'rgba(10,20,12,0.72)';
  ctx.fillRect(0, 0, C.W, C.H);
  ctx.fillStyle = '#4ade80';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ESCAPED!', C.W / 2, 280);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Score $' + game.score + '  (loot $' + game.lootScore + ' + getaway bonus $' + game.escapeBonus + ')', C.W / 2, 340);
  ctx.font = '17px sans-serif';
  ctx.fillStyle = '#e8e4d0';
  ctx.fillText('The Meridian Diamond is yours. Press Enter to play again.', C.W / 2, 384);
};
