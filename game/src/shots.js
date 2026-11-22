// Staged screenshot scenes (?shot=1..4). Each one freezes a composed frame
// of the real game — same world, same render path, no special-cased art.
'use strict';

const Shots = {
  apply(n, game) {
    game.state = 'playing';
    game.alarm = 0;
    game.score = 0;
    game.lootScore = 0;
    World.reset();
    Guards.reset();
    game.player.x = VB.PLAYER_START.x;
    game.player.y = VB.PLAYER_START.y;
    game.player.dir = -Math.PI / 2;

    if (n === 1) {
      // Cover: mid-heist, thief sneaking toward the vault, every system
      // visible in one frame — cones, cameras, loot, alarm, exit.
      game.player.x = 520; game.player.y = 400;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = true;
      game.alarm = 34;
      game.score = 800;
      game.lootScore = 800;
      World.loot.find((l) => l.id === 'gold').taken = true;
      const g1 = Guards.list[0], g2 = Guards.list[1], g3 = Guards.list[2];
      g1.x = 470; g1.y = 330; g1.dir = Math.PI; // facing left, away
      g2.x = 420; g2.y = 520; g2.dir = Math.PI / 2;
      g3.x = 760; g3.y = 292; g3.dir = Math.PI; // facing the thief's lane
      g3.seen = false;
      Guards.cameras[0].angle = Math.PI / 2 + 0.5;
      Guards.cameras[1].angle = Math.PI / 2 - 0.4;
    } else if (n === 2) {
      // Title screen.
      game.state = 'title';
    } else if (n === 3) {
      // High alarm: the thief is spotted at the vault door, a guard closes in.
      game.player.x = 640; game.player.y = 300;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = false;
      game.alarm = 92;
      game.score = 5000;
      game.lootScore = 5000;
      World.loot.find((l) => l.id === 'diamond').taken = true;
      game.hunting = true;
      const g3 = Guards.list[2];
      g3.x = 700; g3.y = 292; g3.dir = Math.PI; // facing the thief
      g3.state = 'hunt';
      g3.seen = true;
      const g1 = Guards.list[0];
      g1.x = 560; g1.y = 330; g1.dir = Math.PI / 2;
      g1.state = 'hunt';
      const g2 = Guards.list[1];
      g2.x = 420; g2.y = 420; g2.dir = 0;
      Guards.cameras[0].angle = Math.PI / 2 + 0.2;
      Guards.cameras[1].angle = Math.PI / 2 + 0.6;
    } else if (n === 4) {
      // Clean getaway: escaped screen with the final score.
      World.loot.forEach((l) => { l.taken = true; });
      game.lootScore = 7600;
      game.timeBonus = 2140;
      game.score = 9740;
      game.elapsed = 86;
      game.state = 'escaped';
    }
  },
};
