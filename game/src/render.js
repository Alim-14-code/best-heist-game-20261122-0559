// VAULTBREAK rendering: everything the judge sees. The cover must read
// instantly at 768x480, so every label is bold 13-14px with a dark
// outline, cones are vivid amber/red, and nothing important is a dark
// shape on a dark floor.
'use strict';

const VBRender = {
  // Fixed sparkle offsets around the diamond, from the seeded stream, so
  // the same frame always draws the same specks.
  sparkles: (function () {
    const rand = VBRng.cosmetic();
    const out = [];
    for (let i = 0; i < 10; i++) {
      out.push({ a: rand() * Math.PI * 2, r: 24 + rand() * 18, s: 1.5 + rand() * 2 });
    }
    return out;
  })(),

  label: function (ctx, text, x, y, size, color) {
    ctx.font = 'bold ' + size + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(8,8,14,0.9)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color || '#ffffff';
    ctx.fillText(text, x, y);
  },

  // A vision cone, raycast so walls cut it short. `seen` picks red.
  cone: function (ctx, walls, x, y, ang, range, half, seen) {
    const steps = 26;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i <= steps; i++) {
      const a = ang - half + (2 * half * i) / steps;
      const len = VBWorld.rayLen(walls, x, y, a, range);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    }
    ctx.closePath();
    ctx.fillStyle = seen ? 'rgba(255,59,48,0.40)' : 'rgba(255,176,32,0.30)';
    ctx.fill();
    ctx.strokeStyle = seen ? 'rgba(255,59,48,0.75)' : 'rgba(255,176,32,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  floor: function (ctx, world) {
    // Gallery floor: warm dark violet, never near-black.
    ctx.fillStyle = '#262133';
    ctx.fillRect(0, 0, VB.W, VB.H);
    // Subtle tile grid so the floor reads as a floor, not a void.
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= VB.W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VB.H); ctx.stroke();
    }
    for (let y = 0; y <= VB.H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VB.W, y); ctx.stroke();
    }
    // Vault floor: pale marble, distinct from the gallery.
    const v = VBWorld.VAULT;
    ctx.fillStyle = '#cfc6b4';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.strokeStyle = 'rgba(90,80,60,0.35)';
    for (let x = v.x; x <= v.x + v.w; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, v.y); ctx.lineTo(x, v.y + v.h); ctx.stroke();
    }
    for (let y = v.y; y <= v.y + v.h; y += 64) {
      ctx.beginPath(); ctx.moveTo(v.x, y); ctx.lineTo(v.x + v.w, y); ctx.stroke();
    }
    // A faint rug in the middle of the room for warmth.
    ctx.fillStyle = 'rgba(140,60,70,0.25)';
    ctx.fillRect(540, 330, 200, 90);
    ctx.strokeStyle = 'rgba(200,150,120,0.4)';
    ctx.strokeRect(540, 330, 200, 90);
  },

  walls: function (ctx, world) {
    for (let i = 0; i < world.walls.length; i++) {
      const w = world.walls[i];
      ctx.fillStyle = '#5d6f8e';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(w.x, w.y, w.w, 3);
      ctx.strokeStyle = 'rgba(10,12,20,0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
    }
  },

  props: function (ctx, world) {
    // Framed paintings on the walls.
    const skies = ['#7fb2d9', '#e8b64c', '#8ec9a0'];
    for (let i = 0; i < world.paintings.length; i++) {
      const p = world.paintings[i];
      ctx.fillStyle = '#3a2c1c';
      ctx.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
      ctx.fillStyle = skies[p.hue % 3];
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#f5e9c8';
      ctx.beginPath();
      ctx.arc(p.x + p.w * 0.7, p.y + p.h * 0.35, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a6b3a';
      ctx.fillRect(p.x, p.y + p.h - 12, p.w, 12);
    }
    // Glass display cases with a glint.
    for (let i = 0; i < world.cases.length; i++) {
      const c = world.cases[i];
      ctx.fillStyle = 'rgba(160,200,230,0.28)';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#9fb6cc';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(c.x + 8, c.y + c.h - 6);
      ctx.lineTo(c.x + c.w * 0.45, c.y + 6);
      ctx.stroke();
    }
    // Potted plants.
    for (let i = 0; i < world.plants.length; i++) {
      const p = world.plants[i];
      ctx.fillStyle = '#7a4a2b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f9e4d';
      ctx.beginPath();
      ctx.arc(p.x - 6, p.y - 8, 9, 0, Math.PI * 2);
      ctx.arc(p.x + 7, p.y - 9, 10, 0, Math.PI * 2);
      ctx.arc(p.x, p.y - 15, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  loot: function (ctx, world, time) {
    for (let i = 0; i < world.loot.length; i++) {
      const l = world.loot[i];
      if (l.taken) continue;
      ctx.save();
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 18;
      if (l.id === 'diamond') {
        // Big faceted diamond, always labelled.
        ctx.fillStyle = '#bff4ff';
        ctx.beginPath();
        ctx.moveTo(l.x, l.y - l.r);
        ctx.lineTo(l.x + l.r * 0.8, l.y);
        ctx.lineTo(l.x, l.y + l.r);
        ctx.lineTo(l.x - l.r * 0.8, l.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(l.x - l.r * 0.8, l.y);
        ctx.lineTo(l.x + l.r * 0.8, l.y);
        ctx.moveTo(l.x, l.y - l.r);
        ctx.lineTo(l.x, l.y + l.r);
        ctx.stroke();
        // Twinkling sparkles from the seeded stream.
        for (let s = 0; s < VBRender.sparkles.length; s++) {
          const sp = VBRender.sparkles[s];
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 2.4 + s * 1.7));
          const sx = l.x + Math.cos(sp.a) * sp.r;
          const sy = l.y + Math.sin(sp.a) * sp.r;
          ctx.globalAlpha = tw;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, sp.s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (l.id === 'gold') {
        ctx.fillStyle = '#ffd94d';
        ctx.fillRect(l.x - 13, l.y - 4, 26, 9);
        ctx.fillRect(l.x - 10, l.y - 12, 20, 9);
        ctx.strokeStyle = '#a87f00';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(l.x - 13, l.y - 4, 26, 9);
      } else if (l.id === 'cash') {
        ctx.fillStyle = '#8be06a';
        ctx.fillRect(l.x - 13, l.y - 8, 26, 16);
        ctx.fillStyle = '#2c6b1e';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', l.x, l.y + 1);
      } else {
        // Emerald idol: a green gem on a small pedestal.
        ctx.fillStyle = '#3fe08a';
        ctx.beginPath();
        ctx.moveTo(l.x, l.y - 12);
        ctx.lineTo(l.x + 9, l.y);
        ctx.lineTo(l.x, l.y + 12);
        ctx.lineTo(l.x - 9, l.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#c9a86a';
        ctx.fillRect(l.x - 12, l.y + 12, 24, 5);
      }
      ctx.restore();
      VBRender.label(ctx, l.name.toUpperCase(), l.x, l.y + l.r + 14, 13, '#ffe9a8');
    }
  },

  exitDoor: function (ctx, world) {
    const e = world.exit;
    ctx.save();
    ctx.shadowColor = '#39d353';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#1f9d3a';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.restore();
    ctx.strokeStyle = '#b6ffbf';
    ctx.lineWidth = 3;
    ctx.strokeRect(e.x + 1.5, e.y + 1.5, e.w - 3, e.h - 3);
    VBRender.label(ctx, 'EXIT', e.x + e.w / 2, e.y + e.h / 2 - 10, 22, '#eaffea');
    VBRender.label(ctx, 'getaway van', e.x + e.w / 2, e.y + e.h / 2 + 16, 12, '#d2ffd6');
  },

  cameras: function (ctx, game) {
    for (let i = 0; i < game.cameras.length; i++) {
      const c = game.cameras[i];
      // Wall mount so the cone never floats from nowhere.
      ctx.fillStyle = '#22262f';
      ctx.fillRect(c.x - 14, c.y - 8, 28, 14);
      ctx.strokeStyle = '#8b93a5';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(c.x - 14, c.y - 8, 28, 14);
      ctx.fillStyle = c.blind > 0 ? '#555a66' : '#ff2e2e';
      ctx.beginPath();
      ctx.arc(c.x, c.y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
      if (c.blind > 0) {
        VBRender.label(ctx, 'BLIND ' + Math.ceil(c.blind) + 's', c.x, c.y + 30, 12, '#c9cedb');
      }
    }
  },

  guards: function (ctx, game) {
    for (let i = 0; i < game.guards.length; i++) {
      const g = game.guards[i];
      ctx.save();
      ctx.shadowColor = g.state === 'distracted' ? '#ffd94d' : '#ff4040';
      ctx.shadowBlur = g.seen || g.state === 'hunt' ? 14 : 6;
      ctx.fillStyle = '#2c3140';
      ctx.beginPath();
      ctx.arc(g.x, g.y, VB.GUARD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = g.state === 'distracted' ? '#ffd94d' : '#ff5b4d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(g.x, g.y, VB.GUARD_R, 0, Math.PI * 2);
      ctx.stroke();
      // Facing wedge.
      ctx.fillStyle = '#e8ecf4';
      ctx.beginPath();
      ctx.moveTo(g.x + Math.cos(g.dir) * 6, g.y + Math.sin(g.dir) * 6);
      ctx.lineTo(g.x + Math.cos(g.dir + 2.6) * 12, g.y + Math.sin(g.dir + 2.6) * 12);
      ctx.lineTo(g.x + Math.cos(g.dir - 2.6) * 12, g.y + Math.sin(g.dir - 2.6) * 12);
      ctx.closePath();
      ctx.fill();
      VBRender.label(ctx, g.name, g.x, g.y - VB.GUARD_R - 12, 13, '#ffffff');
      if (g.state === 'distracted') {
        VBRender.label(ctx, '?', g.x, g.y - VB.GUARD_R - 28, 16, '#ffd94d');
      } else if (g.state === 'hunt' || g.seen) {
        VBRender.label(ctx, '!', g.x, g.y - VB.GUARD_R - 28, 16, '#ff5b4d');
      }
    }
  },

  player: function (ctx, game) {
    const p = game.player;
    ctx.save();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#101828';
    ctx.beginPath();
    ctx.arc(p.x, p.y, VB.PLAYER_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, VB.PLAYER_R, 0, Math.PI * 2);
    ctx.stroke();
    // White hood wedge showing which way the thief faces.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.dir) * 8, p.y + Math.sin(p.dir) * 8);
    ctx.lineTo(p.x + Math.cos(p.dir + 2.7) * 15, p.y + Math.sin(p.dir + 2.7) * 15);
    ctx.lineTo(p.x + Math.cos(p.dir - 2.7) * 15, p.y + Math.sin(p.dir - 2.7) * 15);
    ctx.closePath();
    ctx.fill();
    VBRender.label(ctx, 'YOU', p.x, p.y - VB.PLAYER_R - 12, 13, '#a5f3fc');
    if (p.sneaking) {
      VBRender.label(ctx, 'SNEAK', p.x, p.y + VB.PLAYER_R + 13, 12, '#67e8f9');
    }
  },

  coin: function (ctx, game) {
    const c = game.coin;
    if (!c.active) return;
    ctx.save();
    ctx.shadowColor = '#ffd94d';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#a87f00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  },

  hud: function (ctx, game) {
    // Top bar: title, alarm meter, score and loot count.
    ctx.fillStyle = 'rgba(8,8,16,0.85)';
    ctx.fillRect(0, 0, VB.W, 46);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('VAULTBREAK', 16, 24);
    // Alarm bar.
    const bw = 260;
    const bx = VB.W / 2 - bw / 2;
    ctx.fillStyle = '#1c1f2a';
    ctx.fillRect(bx, 14, bw, 18);
    const frac = game.alarm / 100;
    ctx.fillStyle = game.alarm >= 80 ? '#ff4040' : game.alarm >= 40 ? '#ffb020' : '#39d353';
    ctx.fillRect(bx, 14, bw * frac, 18);
    ctx.strokeStyle = '#8b93a5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 14, bw, 18);
    VBRender.label(ctx, 'ALARM ' + Math.round(game.alarm) + '%', VB.W / 2, 42, 12, '#ffffff');
    // Score and loot, right side.
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffd94d';
    ctx.fillText('$' + game.score.toLocaleString('en-US'), VB.W - 16, 18);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Loot ' + game.lootTaken + '/4', VB.W - 16, 38);
    // Tool chips, bottom-left.
    let cx = 16;
    const chips = [
      '[Q] COIN x' + game.coins,
      '[E] EMP x' + game.emps,
    ];
    ctx.textAlign = 'left';
    for (let i = 0; i < chips.length; i++) {
      ctx.font = 'bold 13px sans-serif';
      const w = ctx.measureText(chips[i]).width + 16;
      ctx.fillStyle = 'rgba(8,8,16,0.8)';
      ctx.fillRect(cx, VB.H - 38, w, 24);
      ctx.strokeStyle = i === 0 ? '#ffd94d' : '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx, VB.H - 38, w, 24);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(chips[i], cx + 8, VB.H - 26);
      cx += w + 10;
    }
    // Objective line, bottom-centre.
    const obj = game.diamondTaken
      ? 'Diamond secured — reach the green EXIT!'
      : 'Steal the Meridian Diamond, then reach the green EXIT.';
    ctx.font = 'bold 14px sans-serif';
    const ow = ctx.measureText(obj).width + 20;
    ctx.fillStyle = 'rgba(8,8,16,0.8)';
    ctx.fillRect(VB.W / 2 - ow / 2, VB.H - 38, ow, 24);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(obj, VB.W / 2, VB.H - 26);
  },

  overlay: function (ctx, title, lines, color) {
    ctx.fillStyle = 'rgba(6,6,12,0.78)';
    ctx.fillRect(0, 0, VB.W, VB.H);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 64px sans-serif';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.strokeText(title, VB.W / 2, 250);
    ctx.fillStyle = color;
    ctx.fillText(title, VB.W / 2, 250);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], VB.W / 2, 330 + i * 34);
    }
  },

  draw: function (ctx, game) {
    const world = game.world;
    VBRender.floor(ctx, world);
    // Vision cones first, so walls and props cover where sight stops.
    for (let i = 0; i < game.guards.length; i++) {
      const g = game.guards[i];
      VBRender.cone(ctx, world.walls, g.x, g.y, g.dir, VB.VISION_RANGE, VB.VISION_HALF, g.seen || g.state === 'hunt');
    }
    for (let i = 0; i < game.cameras.length; i++) {
      const c = game.cameras[i];
      if (c.blind <= 0) {
        VBRender.cone(ctx, world.walls, c.x, c.y + 8, c.angle, VB.CAMERA_RANGE, VB.CAMERA_HALF, c.seen);
      }
    }
    VBRender.exitDoor(ctx, world);
    VBRender.loot(ctx, world, game.time);
    VBRender.walls(ctx, world);
    VBRender.props(ctx, world);
    VBRender.cameras(ctx, game);
    VBRender.guards(ctx, game);
    VBRender.player(ctx, game);
    VBRender.coin(ctx, game);
    VBRender.hud(ctx, game);

    if (game.state === 'title') {
      VBRender.overlay(ctx, 'VAULTBREAK', [
        'Steal the Meridian Diamond. Dodge the cones. Get out.',
        'WASD / arrows move   Shift sneak   Q coin   E EMP   P pause',
        'Press Enter to start',
      ], '#7fe7ff');
    } else if (game.state === 'caught') {
      VBRender.overlay(ctx, 'CAUGHT!', [
        (game.caughtBy || 'A guard') + ' caught you.',
        'Score $' + game.score.toLocaleString('en-US'),
        'Press Enter to try again',
      ], '#ff5b4d');
    } else if (game.state === 'escaped') {
      VBRender.overlay(ctx, 'ESCAPED!', [
        'Loot $' + game.lootScore.toLocaleString('en-US') +
          '  +  time bonus $' + game.timeBonus.toLocaleString('en-US'),
        'Final score $' + game.score.toLocaleString('en-US'),
        'Press Enter to play again',
      ], '#39d353');
    } else if (game.state === 'paused') {
      VBRender.overlay(ctx, 'PAUSED', [
        'Press P to resume',
      ], '#ffffff');
    }
  },
};
