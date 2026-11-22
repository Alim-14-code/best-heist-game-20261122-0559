// All drawing: the museum floor, walls, vision cones, loot, the thief, the
// guards and cameras, the HUD alarm meter, and the title / caught /
// escaped / pause screens. Pure canvas 2D, no images.
'use strict';

const Render = {
  ctx: null,

  init(canvas) {
    this.ctx = canvas.getContext('2d');
  },

  draw(game) {
    const c = this.ctx;
    const W = VB.W, H = VB.H;
    c.clearRect(0, 0, W, H);
    this.drawFloor(c);
    this.drawProps(c);
    this.drawExit(c);
    this.drawLoot(c);
    this.drawCones(c, game);
    this.drawCameras(c, game);
    this.drawGuards(c, game);
    this.drawPlayer(c, game);
    this.drawWalls(c);
    if (game.state === 'playing' || game.state === 'paused') this.drawHud(c, game);
    if (game.state === 'title') this.drawTitle(c, game);
    if (game.state === 'caught') this.drawCaught(c, game);
    if (game.state === 'escaped') this.drawEscaped(c, game);
    if (game.state === 'paused') this.drawPaused(c);
  },

  drawFloor(c) {
    c.fillStyle = '#14141f';
    c.fillRect(0, 0, VB.W, VB.H);
    // Vault room floor, a shade lighter so the target room reads clearly.
    c.fillStyle = '#191928';
    c.fillRect(504, 84, 272, 152);
    // Tile grid.
    c.strokeStyle = 'rgba(255,255,255,0.045)';
    c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= VB.W; x += 64) { c.moveTo(x, 0); c.lineTo(x, VB.H); }
    for (let y = 0; y <= VB.H; y += 64) { c.moveTo(0, y); c.lineTo(VB.W, y); }
    c.stroke();
    // Wall shadow line along the top border.
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(0, 24, VB.W, 6);
  },

  drawProps(c) {
    for (const p of VB.PROPS) {
      if (p.kind === 'case') {
        c.fillStyle = '#1e2a3a';
        c.fillRect(p.x, p.y, p.w, p.h);
        c.strokeStyle = '#3d5a78';
        c.lineWidth = 2;
        c.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
        c.fillStyle = 'rgba(140,200,255,0.25)';
        c.fillRect(p.x + 8, p.y + 8, p.w - 16, p.h - 16);
      } else if (p.kind === 'rug') {
        c.fillStyle = '#3a1f2b';
        c.fillRect(p.x, p.y, p.w, p.h);
        c.strokeStyle = '#7a3a4d';
        c.lineWidth = 2;
        c.strokeRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8);
      } else if (p.kind === 'plant') {
        c.fillStyle = '#1d3a24';
        c.beginPath();
        c.arc(p.x + 20, p.y + 20, 18, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#2f6b3a';
        c.beginPath();
        c.arc(p.x + 20, p.y + 14, 11, 0, Math.PI * 2);
        c.fill();
      }
    }
  },

  drawWalls(c) {
    for (const w of VB.WALLS) {
      c.fillStyle = '#2b3247';
      c.fillRect(w.x, w.y, w.w, w.h);
      c.fillStyle = '#454f6b';
      c.fillRect(w.x, w.y, w.w, 3);
      c.fillStyle = 'rgba(0,0,0,0.25)';
      c.fillRect(w.x, w.y + w.h - 3, w.w, 3);
    }
  },

  drawExit(c) {
    const e = VB.EXIT;
    const pulse = 0.55 + 0.25 * Math.sin(Date.now() / 350);
    c.fillStyle = `rgba(46, 204, 113, ${pulse})`;
    c.fillRect(e.x, e.y, e.w, e.h);
    c.strokeStyle = '#2ecc71';
    c.lineWidth = 3;
    c.strokeRect(e.x, e.y, e.w, e.h);
    c.fillStyle = '#eafff1';
    c.font = 'bold 20px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 - 10);
    c.font = '12px sans-serif';
    c.fillText('getaway van', e.x + e.w / 2, e.y + e.h / 2 + 12);
  },

  drawLoot(c) {
    for (const item of World.loot) {
      if (item.taken) continue;
      const bob = Math.sin(Date.now() / 300 + item.x) * 2;
      const y = item.y + bob;
      // Glow ring so loot reads at a glance.
      const g = c.createRadialGradient(item.x, y, 2, item.x, y, 34);
      g.addColorStop(0, item.color + '55');
      g.addColorStop(1, item.color + '00');
      c.fillStyle = g;
      c.beginPath();
      c.arc(item.x, y, 34, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = item.color;
      if (item.id === 'diamond') {
        c.beginPath();
        c.moveTo(item.x, y - 15);
        c.lineTo(item.x + 13, y - 2);
        c.lineTo(item.x, y + 15);
        c.lineTo(item.x - 13, y - 2);
        c.closePath();
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.75)';
        c.beginPath();
        c.moveTo(item.x, y - 15);
        c.lineTo(item.x + 13, y - 2);
        c.lineTo(item.x - 13, y - 2);
        c.closePath();
        c.fill();
      } else {
        c.beginPath();
        c.arc(item.x, y, item.r, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(0,0,0,0.4)';
        c.font = 'bold 13px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('$', item.x, y + 1);
      }
      c.fillStyle = '#dfe6f2';
      c.font = '11px sans-serif';
      c.textAlign = 'center';
      c.fillText(item.name, item.x, y + 30);
    }
  },

  // Vision cone: a filled wedge from the watcher along its facing.
  cone(c, x, y, angle, range, halfAngle, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    c.closePath();
    c.fill();
  },

  drawCones(c, game) {
    for (const g of Guards.list) {
      const color = g.seen ? 'rgba(255,64,64,0.30)' : 'rgba(255,214,64,0.16)';
      this.cone(c, g.x, g.y, g.dir, VB.VISION_RANGE, VB.VISION_HALF_ANGLE, color);
    }
    for (const cam of Guards.cameras) {
      const color = cam.seen ? 'rgba(255,64,64,0.30)' : 'rgba(255,120,64,0.15)';
      this.cone(c, cam.x, cam.y, cam.angle, VB.CAMERA_RANGE, VB.CAMERA_HALF_ANGLE, color);
    }
  },

  drawCameras(c, game) {
    for (const cam of Guards.cameras) {
      c.save();
      c.translate(cam.x, cam.y);
      c.rotate(cam.angle);
      c.fillStyle = '#3a3f52';
      c.fillRect(-4, -4, 22, 8);
      c.fillStyle = cam.seen ? '#ff4040' : '#ff9040';
      c.beginPath();
      c.arc(18, 0, 4, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.fillStyle = '#565e78';
      c.beginPath();
      c.arc(cam.x, cam.y, 6, 0, Math.PI * 2);
      c.fill();
    }
  },

  drawGuards(c, game) {
    for (const g of Guards.list) {
      // Body.
      c.fillStyle = g.state === 'hunt' ? '#7a1f1f' : '#22355e';
      c.beginPath();
      c.arc(g.x, g.y, VB.GUARD_R, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#8fa8d8';
      c.lineWidth = 2;
      c.stroke();
      // Facing tick.
      c.strokeStyle = '#dfe6f2';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(g.x, g.y);
      c.lineTo(g.x + Math.cos(g.dir) * 20, g.y + Math.sin(g.dir) * 20);
      c.stroke();
      // Cap brim.
      c.fillStyle = '#8fa8d8';
      c.beginPath();
      c.arc(g.x + Math.cos(g.dir) * 6, g.y + Math.sin(g.dir) * 6, 5, 0, Math.PI * 2);
      c.fill();
      // "!" when the guard sees the thief.
      if (g.seen) {
        c.fillStyle = '#ff4040';
        c.font = 'bold 22px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'bottom';
        c.fillText('!', g.x, g.y - 18);
      }
      c.fillStyle = '#aeb9d4';
      c.font = '11px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'top';
      c.fillText(g.name, g.x, g.y + 18);
    }
  },

  drawPlayer(c, game) {
    const p = game.player;
    if (game.state === 'caught') return;
    // Sneak = smaller, crouched silhouette.
    const r = p.sneaking ? VB.PLAYER_R - 2 : VB.PLAYER_R;
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath();
    c.ellipse(p.x, p.y + r * 0.8, r, r * 0.45, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1c1c26';
    c.beginPath();
    c.arc(p.x, p.y, r, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7fe7ff';
    c.lineWidth = 2;
    c.stroke();
    // Hood point + facing tick.
    c.fillStyle = '#7fe7ff';
    c.beginPath();
    c.arc(p.x + Math.cos(p.dir) * (r + 2), p.y + Math.sin(p.dir) * (r + 2), 3, 0, Math.PI * 2);
    c.fill();
    if (p.sneaking) {
      c.fillStyle = '#7fe7ff';
      c.font = 'bold 11px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'bottom';
      c.fillText('SNEAK', p.x, p.y - r - 6);
    }
  },

  drawHud(c, game) {
    // Top bar.
    c.fillStyle = 'rgba(8,8,16,0.78)';
    c.fillRect(0, 0, VB.W, 46);
    c.fillStyle = '#dfe6f2';
    c.font = 'bold 17px sans-serif';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText('VAULTBREAK', 16, 24);
    // Alarm meter, centre.
    const ax = VB.W / 2 - 150, ay = 14, aw = 300, ah = 18;
    c.fillStyle = '#222';
    c.fillRect(ax - 2, ay - 2, aw + 4, ah + 4);
    const frac = game.alarm / 100;
    const col = frac < 0.5 ? '#2ecc71' : frac < 0.85 ? '#f5b301' : '#ff4040';
    c.fillStyle = col;
    c.fillRect(ax, ay, aw * frac, ah);
    c.strokeStyle = '#888';
    c.lineWidth = 1;
    c.strokeRect(ax, ay, aw, ah);
    c.fillStyle = '#fff';
    c.font = 'bold 13px sans-serif';
    c.textAlign = 'center';
    c.fillText(`ALARM ${Math.round(game.alarm)}%`, VB.W / 2, ay + ah + 14);
    if (game.alarm >= 100) {
      c.fillStyle = '#ff4040';
      c.font = 'bold 15px sans-serif';
      c.fillText('HUNTED!', VB.W / 2, 44);
    }
    // Score + loot, right.
    c.textAlign = 'right';
    c.fillStyle = '#ffd94d';
    c.font = 'bold 17px sans-serif';
    const lootCount = World.loot.filter((l) => l.taken).length;
    c.fillText(`$${game.score.toLocaleString('en-US')}   Loot ${lootCount}/4`, VB.W - 16, 24);
    // Objective line, bottom.
    c.textAlign = 'center';
    c.fillStyle = 'rgba(223,230,242,0.85)';
    c.font = '14px sans-serif';
    const objective = World.diamond.taken
      ? 'Diamond secured — reach the green EXIT!'
      : 'Steal the Meridian Diamond, then reach the green EXIT.';
    c.fillText(objective, VB.W / 2, VB.H - 14);
  },

  panel(c, w, h) {
    const x = (VB.W - w) / 2, y = (VB.H - h) / 2;
    c.fillStyle = 'rgba(6,6,14,0.82)';
    c.fillRect(x, y, w, h);
    c.strokeStyle = '#454f6b';
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);
    return { x, y };
  },

  drawTitle(c, game) {
    c.fillStyle = 'rgba(6,6,14,0.55)';
    c.fillRect(0, 0, VB.W, VB.H);
    const p = this.panel(c, 640, 420);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#7fe7ff';
    c.font = 'bold 64px sans-serif';
    c.fillText('VAULTBREAK', VB.W / 2, p.y + 92);
    c.fillStyle = '#ffd94d';
    c.font = '20px sans-serif';
    c.fillText('One thief. Three guards. Two cameras. One diamond.', VB.W / 2, p.y + 138);
    c.fillStyle = '#dfe6f2';
    c.font = '16px sans-serif';
    const lines = [
      'WASD / Arrow keys — move      SHIFT — sneak (slower, harder to spot)',
      'Grab the Meridian Diamond + side loot, then reach the green EXIT.',
      'Guards and cameras raise the ALARM. At 100% the guards hunt you.',
      'If a guard touches you, the run is over. P — pause.',
    ];
    lines.forEach((line, i) => c.fillText(line, VB.W / 2, p.y + 190 + i * 30));
    c.fillStyle = '#7fe7ff';
    c.font = 'bold 22px sans-serif';
    const blink = Math.sin(Date.now() / 300) > -0.2 ? 1 : 0.25;
    c.globalAlpha = blink;
    c.fillText('Press ENTER to start the heist', VB.W / 2, p.y + 360);
    c.globalAlpha = 1;
  },

  drawCaught(c, game) {
    c.fillStyle = 'rgba(60,0,0,0.55)';
    c.fillRect(0, 0, VB.W, VB.H);
    const p = this.panel(c, 560, 300);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#ff5040';
    c.font = 'bold 56px sans-serif';
    c.fillText('CAUGHT!', VB.W / 2, p.y + 86);
    c.fillStyle = '#dfe6f2';
    c.font = '18px sans-serif';
    c.fillText(`${game.caughtBy || 'A guard'} grabbed you in the Meridian Gallery.`, VB.W / 2, p.y + 140);
    c.fillText(`Score: $${game.score.toLocaleString('en-US')} — Loot ${World.loot.filter((l) => l.taken).length}/4`, VB.W / 2, p.y + 176);
    c.fillStyle = '#7fe7ff';
    c.font = 'bold 20px sans-serif';
    c.fillText('Press ENTER to try again', VB.W / 2, p.y + 238);
  },

  drawEscaped(c, game) {
    c.fillStyle = 'rgba(0,40,10,0.5)';
    c.fillRect(0, 0, VB.W, VB.H);
    const p = this.panel(c, 620, 340);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#2ecc71';
    c.font = 'bold 52px sans-serif';
    c.fillText('CLEAN GETAWAY!', VB.W / 2, p.y + 82);
    c.fillStyle = '#dfe6f2';
    c.font = '18px sans-serif';
    c.fillText('The Meridian Diamond is yours. The van is already moving.', VB.W / 2, p.y + 132);
    const bonus = game.timeBonus;
    c.fillText(`Loot $${game.lootScore.toLocaleString('en-US')}  +  time bonus $${bonus.toLocaleString('en-US')}`, VB.W / 2, p.y + 172);
    c.fillStyle = '#ffd94d';
    c.font = 'bold 26px sans-serif';
    c.fillText(`FINAL SCORE  $${game.score.toLocaleString('en-US')}`, VB.W / 2, p.y + 220);
    c.fillStyle = '#7fe7ff';
    c.font = 'bold 20px sans-serif';
    c.fillText('Press ENTER to run it again', VB.W / 2, p.y + 282);
  },

  drawPaused(c) {
    c.fillStyle = 'rgba(6,6,14,0.6)';
    c.fillRect(0, 0, VB.W, VB.H);
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.fillStyle = '#dfe6f2';
    c.font = 'bold 48px sans-serif';
    c.fillText('PAUSED', VB.W / 2, VB.H / 2 - 10);
    c.font = '18px sans-serif';
    c.fillText('Press P to resume', VB.W / 2, VB.H / 2 + 34);
  },
};
