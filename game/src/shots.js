// Staged screenshot scenes (?shot=1..4). Each one freezes a composed frame
// of the real game — same world, same render path, no special-cased art.
// Shot 1 is the cover: every system visible in one frame, readable small.
// Shot 4 is new: the caught moment, the fair fail state the old set never
// showed (the old escape panel showed no gameplay at all).
'use strict';

const Shots = {
  apply(n, game) {
    game.state = 'playing';
    game.alarm = 0;
    game.score = 0;
    game.lootScore = 0;
    World.reset();
    Guards.reset();
    Tools.reset();
    game.player.x = VB.PLAYER_START.x;
    game.player.y = VB.PLAYER_START.y;
    game.player.dir = -Math.PI / 2;

    if (n === 1) {
      // Cover: mid-heist, thief sneaking up the centre lane toward the
      // vault, a tossed coin pulling Rook away, Knight's cone sweeping the
      // thief's lane, cameras sweeping, diamond glowing, alarm at 38%.
      // Every system visible in one frame: cones, cameras, loot, tools,
      // alarm, exit.
      game.player.x = 560; game.player.y = 430;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = true;
      game.alarm = 38;
      game.score = 800;
      game.lootScore = 800;
      World.loot.find((l) => l.id === 'gold').taken = true;
      Tools.coins = 2;
      Tools.coin = { x: 700, y: 360, t: 3 };
      const g1 = Guards.list[0], g2 = Guards.list[1], g3 = Guards.list[2];
      g1.x = 640; g1.y = 330; g1.dir = Math.PI / 2; // Rook, walking to the coin
      g1.state = 'distracted';
      g1.investigateX = 700; g1.investigateY = 360;
      g2.x = 420; g2.y = 520; g2.dir = Math.PI / 2;
      g3.x = 760; g3.y = 292; g3.dir = Math.PI; // Knight, facing the thief's lane
      g3.seen = false;
      Guards.cameras[0].angle = Math.PI / 2 + 0.5;
      Guards.cameras[1].angle = Math.PI / 2 - 0.4;
    } else if (n === 2) {
      // Title screen.
      game.state = 'title';
    } else if (n === 3) {
      // High alarm: diamond secured, the thief runs for the exit while
      // two guards hunt and the third closes in. The loot target is the
      // objective line and the $5,000 score — the vault is empty because
      // the diamond is already in hand.
      game.player.x = 640; game.player.y = 420;
      game.player.dir = Math.PI / 2;
      game.player.sneaking = false;
      game.alarm = 92;
      game.score = 5000;
      game.lootScore = 5000;
      World.loot.find((l) => l.id === 'diamond').taken = true;
      Tools.coins = 1;
      Tools.emp = 0;
      game.hunting = true;
      const g3 = Guards.list[2];
      g3.x = 700; g3.y = 380; g3.dir = Math.PI; // Knight, facing the thief
      g3.state = 'hunt';
      g3.seen = true;
      const g1 = Guards.list[0];
      g1.x = 560; g1.y = 380; g1.dir = Math.PI / 2;
      g1.state = 'hunt';
      const g2 = Guards.list[1];
      g2.x = 420; g2.y = 500; g2.dir = 0;
      Guards.cameras[0].angle = Math.PI / 2 + 0.2;
      Guards.cameras[1].angle = Math.PI / 2 + 0.6;
    } else if (n === 4) {
      // Caught: Knight grabs the thief at the vault door, alarm full,
      // the red fail panel over the live game behind it.
      game.player.x = 640; game.player.y = 300;
      game.player.dir = -Math.PI / 2;
      game.player.sneaking = false;
      game.alarm = 100;
      game.score = 800;
      game.lootScore = 800;
      World.loot.find((l) => l.id === 'gold').taken = true;
      const g3 = Guards.list[2];
      g3.x = 640; g3.y = 300; g3.dir = Math.PI;
      g3.state = 'hunt';
      g3.seen = true;
      game.state = 'caught';
      game.caughtBy = 'Knight';
    }
  },
};
