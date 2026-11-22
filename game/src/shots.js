// VAULTBREAK staged screenshots (?shot=1..4). Each one freezes a composed
// frame of the real game — same world, same render path, no special art.
'use strict';

const VBShots = {
  apply: function (n, game) {
    game.state = 'playing';
    game.alarm = 0;
    game.score = 0;
    game.lootScore = 0;
    game.lootTaken = 0;
    game.timeBonus = 0;
    game.diamondTaken = false;
    game.coins = 3;
    game.emps = 2;
    game.hunting = false;
    game.caughtBy = null;
    game.time = 12; // frozen frame time, so sparkles are deterministic
    game.elapsed = 0;
    game.world = VBWorld.build();
    game.guards = VBGuards.makeGuards();
    game.cameras = VBGuards.makeCameras();
    game.coin = { active: false };
    game.player.x = VB.START.x;
    game.player.y = VB.START.y;
    game.player.dir = -Math.PI / 2;
    game.player.sneaking = false;

    if (n === 1) {
      // Cover: mid-heist, everything in one frame — the thief sneaking
      // toward the vault, a coin in flight distracting a guard, cones,
      // cameras, loot, alarm part-filled, EXIT visible.
      game.player.x = 520;
      game.player.y = 400;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = true;
      game.alarm = 34;
      game.score = 800;
      game.lootScore = 800;
      game.lootTaken = 1;
      game.world.loot[1].taken = true; // Gold Bars already pocketed
      const g1 = game.guards[0];
      const g2 = game.guards[1];
      const g3 = game.guards[2];
      g1.x = 470; g1.y = 330; g1.dir = Math.PI;
      g1.state = 'distracted'; g1.distract = { x: 560, y: 378 }; g1.wait = 3;
      g2.x = 420; g2.y = 520; g2.dir = Math.PI / 2;
      g3.x = 760; g3.y = 292; g3.dir = Math.PI;
      game.coin = {
        active: true, x: 545, y: 388, sx: 520, sy: 400,
        tx: 560, ty: 378, t: 0.2, dur: 0.35, landed: false, clearIn: 1.2,
      };
      game.cameras[0].angle = Math.PI / 2 + 0.5;
      game.cameras[1].angle = Math.PI / 2 - 0.4;
    } else if (n === 2) {
      // Title screen.
      game.state = 'title';
    } else if (n === 3) {
      // High alarm: the thief at the vault door WITH the diamond secured,
      // fleeing toward the EXIT, a guard closing in.
      game.player.x = 640;
      game.player.y = 300;
      game.player.dir = 0.55;
      game.player.sneaking = false;
      game.alarm = 92;
      game.score = 5000;
      game.lootScore = 5000;
      game.lootTaken = 1;
      game.diamondTaken = true;
      game.world.loot[0].taken = true;
      game.hunting = true;
      const g1 = game.guards[0];
      const g2 = game.guards[1];
      const g3 = game.guards[2];
      g3.x = 700; g3.y = 292; g3.dir = Math.PI; g3.state = 'hunt'; g3.seen = true;
      g1.x = 560; g1.y = 330; g1.dir = Math.PI / 2; g1.state = 'hunt';
      g2.x = 420; g2.y = 420; g2.dir = 0;
      game.cameras[0].angle = Math.PI / 2 + 0.2;
      game.cameras[1].angle = Math.PI / 2 + 0.6;
    } else if (n === 4) {
      // CAUGHT: a guard reaches the thief, alarm high.
      game.player.x = 640;
      game.player.y = 420;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = false;
      game.alarm = 88;
      game.score = 5000;
      game.lootScore = 5000;
      game.lootTaken = 1;
      game.diamondTaken = true;
      game.world.loot[0].taken = true;
      const g3 = game.guards[2];
      g3.x = 664; g3.y = 420; g3.dir = Math.PI; g3.state = 'hunt'; g3.seen = true;
      const g1 = game.guards[0];
      g1.x = 560; g1.y = 330; g1.dir = Math.PI / 2; g1.state = 'hunt';
      game.state = 'caught';
      game.caughtBy = 'Knight';
      game.cameras[0].angle = Math.PI / 2 + 0.3;
    }
  },
};
