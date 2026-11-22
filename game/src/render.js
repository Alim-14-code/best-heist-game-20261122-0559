// All drawing: the warm gallery floor, walls, vision cones, loot, the
// thief, the guards and cameras, the tools, the HUD alarm meter and tool
// chips, and the title / caught / escaped / pause screens. Pure canvas 2D,
// no images. Everything is drawn big and bright enough to read at a glance
// when the screenshot is shrunk to a contact-sheet cell.
'use strict';

const Render = {
  ctx: null,

  init(canvas) {
    this.ctx = canvas.getContext('2d');
  },

  // Bold label readable over any background: dark stroke, light fill.
  label(c, text, x, y, font, fill) {
    c.font = font;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineWidth = 4;
    c.strokeStyle = 'rgba(5,5,12,0.9)';
    c.strokeText(text, x, y);
    c.fillStyle = fill || '#f2f5ff';
    c.fillText(text, x, y);
  },

  draw(game) {
    const c = this.ctx;
    const W = VB.W, H = VB.H;
    c.clearRect(0, 0, W, H);
    this.drawFloor(c);
    this.drawProps(c);
    this.drawExit(c);
    this.drawLoot(c);
    this.drawCoin(c);
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
    if (Tools.flash > 0) {
      c.fillStyle = `rgba(180,140,255,${Tools.flash * 0.8})`;
      c.fillRect(0, 0, W, H);
    }
  },

  drawFloor(c) {
    // Warm slate-violet gallery floor, parquet bands, marble vault floor.
    c.fillStyle = '#262133';
    c.fillRect(0, 0, VB.W, VB.H);
    c.fillStyle = 'rgba(255,220,160,0.05)';
    for (let y = 48; y < VB.H; y += 96) c.fillRect(0, y, VB.W, 44);
    // Vault room floor, lighter marble so the target room reads clearly.
    c.fillStyle = '#322d52';
    c.fillRect(504, 84, 272, 152);
    c.strokeStyle = 'rgba(255,255,255,0.10)';
    c.lineWidth = 2;
    c.strokeRect(504, 84, 272, 152);
    // Tile grid.
    c.strokeStyle = 'rgba(255,255,255,0.06)';
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
        c.fillStyle = '#2a3a52';
        c.fillRect(p.x, p.y, p.w, p.h);
        c.strokeStyle = '#5d7ea8';
        c.lineWidth = 2;
        c.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
        c.fillStyle = 'rgba(160,210,255,0.30)';
        c.fillRect(p.x + 8, p.y + 8, p.w - 16, p.h - 16);
        c.fillStyle = 'rgba(255,255,255,0.55)';
        c.fillRect(p.x + 12, p.y + 10, 18, 4);
      } else if (p.kind === 'rug') {
        c.fillStyle = '#4a2430';
        c.fillRect(p.x, p.y, p.w, p.h);
        c.strokeStyle = '#9a4a5d';
        c.lineWidth = 2;
        c.strokeRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8);
        c.fillStyle = '#9a4a5d';
        c.beginPath();
        c.arc(p.x + p.w / 2, p.y + p.h / 2, 9, 0, Math.PI * 2);
        c.fill();
      } else if (p.kind === 'plant') {
        c.fillStyle = '#24402a';
        c.beginPath();
        c.arc(p.x + 20, p.y + 20, 19, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#3f8a4a';
        c.beginPath();
        c.arc(p.x + 20, p.y + 14, 12, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#6fbf7a';
        c.beginPath();
        c.arc(p.x + 16, p.y + 10, 5, 0, Math.PI * 2);
        c.fill();
      } else if (p.kind === 'painting') {
        c.fillStyle = '#6b5322';
        c.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
        c.fillStyle = '#7fb2d9';
        c.fillRect(p.x, p.y, p.w, p.h);
        c.fillStyle = '#f2e6b8';
        c.beginPath();
        c.arc(p.x + p.w / 2, p.y + p.h / 2, 9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#2a4a2a';
        c.fillRect(p.x, p.y + p.h - 12, p.w, 12);
      }
    }
  },

  drawWalls(c) {
    for (const w of VB.WALLS) {
      c.fillStyle = '#46507a';
      c.fillRect(w.x, w.y, w.w, w.h);
      c.fillStyle = '#6b78a8';
      c.fillRect(w.x, w.y, w.w, 3);
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.fillRect(w.x, w.y + w.h - 3, w.w, 3);
    }
  },

  drawExit(c) {
    const e = VB.EXIT;
    const pulse = 0.55 + 0.25 * Math.sin(Date.now() / 350);
    c.fillStyle = `rgba(46, 204, 113, ${pulse})`;
    c.fillRect(e.x, e.y, e.w, e.h);
    c.strokeStyle = '#7cf2a8';
    c.lineWidth = 3;
    c.strokeRect(e.x, e.y, e.w, e.h);
    c.fillStyle = '#eafff1';
    c.font = 'bold 22px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 - 10);
    c.font = '13px sans-serif';
    c.fillText('getaway van', e.x + e.w / 2, e.y + e.h / 2 + 12);
  },

  drawLoot(c) {
    for (const item of World.loot) {
      if (item.taken) continue;
      const bob = Math.sin(Date.now() / 300 + item.x) * 2;
      const y = item.y + bob;
      // Strong glow ring so loot reads at a glance, even shrunk.
      const glowR = item.id === 'diamond' ? 70 : 44;
      const g = c.createRadialGradient(item.x, y, 2, item.x, y, glowR);
      g.addColorStop(0, item.color + '66');
      g.addColorStop(1, item.color + '00');
      c.fillStyle = g;
      c.beginPath();
      c.arc(item.x, y, glowR, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = item.color;
      if (item.id === 'diamond') {
        // Big faceted diamond with sparkles.
        c.beginPath();
        c.moveTo(item.x, y - 20);
        c.lineTo(item.x + 17, y - 3);
        c.lineTo(item.x, y + 20);
        c.lineTo(item.x - 17, y - 3);
        c.closePath();
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.85)';
        c.beginPath();
        c.moveTo(item.x, y - 20);
        c.lineTo(item.x + 17, y - 3);
        c.lineTo(item.x - 17, y - 3);
        c.closePath();
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.9)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(item.x - 30, y - 24); c.lineTo(item.x - 22, y - 16);
        c.moveTo(item.x + 28, y + 18); c.lineTo(item.x + 20, y + 26);
        c.stroke();
        this.label(c, 'MERIDIAN DIAMOND', item.x, y + 40, 'bold 14px sans-serif');
      } else {
        c.beginPath();
        c.arc(item.x, y, item.r, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(0,0,0,0.45)';
        c.font = 'bold 16px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText('$', item.x, y + 1);
        this.label(c, item.name, item.x, y + 34, 'bold 13px sans-serif');
      }
    }
  },

  // A tossed coin on the floor: gold dot with a pulsing ring and a "?" —
  // the guard walking toward it is the distraction made visible.
  drawCoin(c) {
    const coin = Tools.coin;
    if (!coin) return;
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    c.strokeStyle = `rgba(255,217,77,${0.35 + 0.4 * pulse})`;
    c.lineWidth = 2;
    c.beginPath();
    c.arc(coin.x, coin.y, 12 + 6 * pulse, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#ffd94d';
    c.beginPath();
    c.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#7a5c00';
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('?', coin.x, coin.y - 20);
  },

  // Vision cone: a filled wedge with a bright edge, so danger reads.
  cone(c, x, y, angle, range, halfAngle, fill, edge) {
    c.fillStyle = fill;
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    c.closePath();
    c.fill();
    c.strokeStyle = edge;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x + Math.cos(angle - halfAngle) * range, y + Math.sin(angle - halfAngle) * range);
    c.lineTo(x, y);
    c.lineTo(x + Math.cos(angle + halfAngle) * range, y + Math.sin(angle + halfAngle) * range);
    c.stroke();
  },

  drawCones(c, game) {
    for (const g of Guards.list) {
      const fill = g.seen ? 'rgba(255,59,48,0.40)' : 'rgba(255,176,32,0.30)';
      const edge = g.seen ? 'rgba(255,59,48,0.65)' : 'rgba(255,176,32,0.55)';
      this.cone(c, g.x, g.y, g.dir, VB.VISION_RANGE, VB.VISION_HALF_ANGLE, fill, edge);
    }
    for (const cam of Guards.cameras) {
      if (Tools.camerasDown) {
        // EMP blackout: a short grey stub, no sweep, no danger.
        this.cone(c, cam.x, cam.y, cam.angle, 60, VB.CAMERA_HALF_ANGLE,
          'rgba(140,140,160,0.18)', 'rgba(140,140,160,0.35)');
        continue;
      }
      const fill = cam.seen ? 'rgba(255,59,48,0.40)' : 'rgba(255,122,26,0.28)';
      const edge = cam.seen ? 'rgba(255,59,48,0.65)' : 'rgba(255,122,26,0.55)';
      this.cone(c, cam.x, cam.y, cam.angle, VB.CAMERA_RANGE, VB.CAMERA_HALF_ANGLE, fill, edge);
    }
  },

  drawCameras(c, game) {
    for (const cam of Guards.cameras) {
      // Wall bracket so the cone has a visible source.
      c.fillStyle = '#20242f';
      c.fillRect(cam.x - 8, cam.y - 10, 16, 10);
      c.save();
      c.translate(cam.x, cam.y);
      c.rotate(cam.angle);
      c.fillStyle = '#3a3f52';
      c.fillRect(-4, -5, 26, 10);
      c.fillStyle = Tools.camerasDown ? '#888a96' : (cam.seen ? '#ff4040' : '#ff9040');
      c.beginPath();
      c.arc(22, 0, 6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(22, 0, 2, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.fillStyle = '#565e78';
      c.beginPath();
      c.arc(cam.x, cam.y, 7, 0, Math.PI * 2);
      c.fill();
      if (Tools.camerasDown) {
        this.label(c, 'EMP', cam.x, cam.y - 20, 'bold 11px sans-serif', '#b9b9c9');
      }
    }
  },

  drawGuards(c, game) {
    for (const g of Guards.list) {
      // Body: bigger, high contrast, red when hunting, amber when
      // distracted by a coin.
      const body = g.state === 'hunt' ? '#8a2323' : g.state === 'distracted' ? '#6b5322' : '#31427a';
      c.fillStyle = body;
      c.beginPath();
      c.arc(g.x, g.y, VB.GUARD_R, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#cfe0ff';
      c.lineWidth = 2;
      c.stroke();
      // Facing wedge.
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(g.x + Math.cos(g.dir) * 8, g.y + Math.sin(g.dir) * 8);
      c.lineTo(g.x + Math.cos(g.dir - 0.5) * 22, g.y + Math.sin(g.dir - 0.5) * 22);
      c.lineTo(g.x + Math.cos(g.dir + 0.5) * 22, g.y + Math.sin(g.dir + 0.5) * 22);
      c.closePath();
      c.fill();
      // "!" when the guard sees the thief, "?" when it chases a coin.
      if (g.seen) {
        this.label(c, '!', g.x, g.y - 28, 'bold 26px sans-serif', '#ff5040');
      } else if (g.state === 'distracted') {
        this.label(c, '?', g.x, g.y - 28, 'bold 24px sans-serif', '#ffd94d');
      }
      this.label(c, g.name, g.x, g.y + 28, 'bold 13px sans-serif', '#d7e0f5');
    }
  },

  drawPlayer(c, game) {
    const p = game.player;
    if (game.state === 'caught') return;
    // Big, bright thief: dark body, thick cyan ring, white hood wedge,
    // soft glow — findable in one glance, even shrunk.
    const r = p.sneaking ? VB.PLAYER_R - 2 : VB.PLAYER_R;
    const glow = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, r + 16);
    glow.addColorStop(0, 'rgba(127,231,255,0.35)');
    glow.addColorStop(1, 'rgba(127,231,255,0)');
    c.fillStyle = glow;
    c.beginPath();
    c.arc(p.x, p.y, r + 16, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath();
    c.ellipse(p.x, p.y + r * 0.8, r, r * 0.45, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#101623';
    c.beginPath();
    c.arc(p.x, p.y, r, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#7fe7ff';
    c.lineWidth = 3;
    c.stroke();
    // Hood wedge + facing tick.
    c.fillStyle = '#eafcff';
    c.beginPath();
    c.moveTo(p.x + Math.cos(p.dir) * 6, p.y + Math.sin(p.dir) * 6);
    c.lineTo(p.x + Math.cos(p.dir - 0.45) * (r + 8), p.y + Math.sin(p.dir - 0.45) * (r + 8));
    c.lineTo(p.x + Math.cos(p.dir + 0.45) * (r + 8), p.y + Math.sin(p.dir + 0.45) * (r + 8));
    c.closePath();
    c.fill();
    if (p.sneaking) {
      this.label(c, 'SNEAK', p.x, p.y - r - 12, 'bold 13px sans-serif', '#7fe7ff');
    }
  },

  drawHud(c, game) {
    // Top bar.
    c.fillStyle = 'rgba(8,8,18,0.82)';
    c.fillRect(0, 0, VB.W, 52);
    c.fillStyle = '#dfe6f2';
    c.font = 'bold 20px sans-serif';
    c.textAlign = 'left';
    c.textBaseline = 'middle';
    c.fillText('VAULTBREAK', 16, 27);
    // Alarm meter, centre — bigger, with a bold label.
    const ax = VB.W / 2 - 170, ay = 16, aw = 340, ah = 20;
    c.fillStyle = '#1a1a26';
    c.fillRect(ax - 2, ay - 2, aw + 4, ah + 4);
    const frac = game.alarm / 100;
    const col = frac < 0.5 ? '#2ecc71' : frac < 0.85 ? '#f5b301' : '#ff4040';
    c.fillStyle = col;
    c.fillRect(ax, ay, aw * frac, ah);
    c.strokeStyle = '#999';
    c.lineWidth = 1;
    c.strokeRect(ax, ay, aw, ah);
    this.label(c, `ALARM ${Math.round(game.alarm)}%`, VB.W / 2, ay + ah + 16, 'bold 15px sans-serif');
    if (game.alarm >= 100) {
      this.label(c, 'HUNTED!', VB.W / 2, 50, 'bold 16px sans-serif', '#ff5040');
    }
    // Score + loot, right.
    c.textAlign = 'right';
    c.fillStyle = '#ffd94d';
    c.font = 'bold 20px sans-serif';
    const lootCount = World.loot.filter((l) => l.taken).length;
    c.fillText(`$${game.score.toLocaleString('en-US')}   Loot ${lootCount}/4`, VB.W - 16, 27);
    // Tool chips, bottom-left: what the thief carries, at a cost.
    const chips = [
      { key: 'Q', name: 'COIN', n: Tools.coins, col: '#ffd94d' },
      { key: 'E', name: 'EMP', n: Tools.emp, col: '#b78cff' },
    ];
    let cx = 16;
    c.textBaseline = 'middle';
    for (const chip of chips) {
      const labelText = `[${chip.key}] ${chip.name} x${chip.n}`;
      c.font = 'bold 14px sans-serif';
      const w = c.measureText(labelText).width + 20;
      c.fillStyle = chip.n > 0 ? 'rgba(20,20,34,0.85)' : 'rgba(20,20,34,0.45)';
      c.fillRect(cx, VB.H - 46, w, 26);
      c.strokeStyle = chip.col;
      c.lineWidth = 2;
      c.strokeRect(cx, VB.H - 46, w, 26);
      c.fillStyle = chip.n > 0 ? chip.col : '#777';
      c.textAlign = 'left';
      c.fillText(labelText, cx + 10, VB.H - 32);
      cx += w + 10;
    }
    if (Tools.camerasDown) {
      c.fillStyle = '#b78cff';
      c.font = 'bold 14px sans-serif';
      c.textAlign = 'left';
      c.fillText(`CAMERAS DOWN ${Math.ceil(Tools.empTimer)}s`, cx + 6, VB.H - 32);
    }
    // Objective line, bottom centre.
    c.textAlign = 'center';
    c.fillStyle = 'rgba(223,230,242,0.9)';
    c.font = '14px sans-serif';
    const objective = World.diamond.taken
      ? 'Diamond secured — reach the green EXIT!'
      : 'Steal the Meridian Diamond, then reach the green EXIT.';
    c.fillText(objective, VB.W / 2, VB.H - 14);
  },

  panel(c, w, h) {
    const x = (VB.W - w) / 2, y = (VB.H - h) / 2;
    c.fillStyle = 'rgba(6,6,14,0.86)';
    c.fillRect(x, y, w, h);
    c.strokeStyle = '#5d6a94';
    c.lineWidth = 2;
    c.strokeRect(x, y, w, h);
    return { x, y };
  },

  drawTitle(c, game) {
    c.fillStyle = 'rgba(6,6,14,0.55)';
    c.fillRect(0, 0, VB.W, VB.H);
    const p = this.panel(c, 680, 440);
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
      'Q — toss a coin: the nearest guard walks off to check the clink',
      'E — EMP burst: blinds both cameras 6s, but the pulse costs alarm',
      'Grab the Meridian Diamond + side loot, then reach the green EXIT.',
      'Guards and cameras raise the ALARM. At 100% the guards hunt you.',
      'If a guard touches you, the run is over. P — pause.',
    ];
    lines.forEach((line, i) => c.fillText(line, VB.W / 2, p.y + 188 + i * 30));
    c.fillStyle = '#7fe7ff';
    c.font = 'bold 22px sans-serif';
    const blink = Math.sin(Date.now() / 300) > -0.2 ? 1 : 0.25;
    c.globalAlpha = blink;
    c.fillText('Press ENTER to start the heist', VB.W / 2, p.y + 386);
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
    c.fillText('Press P to resume', VB.W / 2 + 0, VB.H / 2 + 34);
  },
};
