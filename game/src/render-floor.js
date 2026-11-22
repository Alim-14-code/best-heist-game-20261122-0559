// VAULTBREAK — drawing the room: floor and shadow pools, the carpet
// runner, the marble vault with its circular steel door, the named lanes,
// walls, paintings, cases, benches, plants, the security desk, the
// sculpture pedestal and the EXIT door.
var VB = window.VB || (window.VB = {});

VB.drawFloor = function drawFloor(ctx, game) {
  var C = VB.CFG;
  var world = game.world;
  var w = C.W;
  var h = C.H;

  // Gallery floor.
  ctx.fillStyle = C.COL.floor;
  ctx.fillRect(0, 0, w, h);

  // Subtle floor tiling.
  ctx.strokeStyle = C.COL.floorEdge;
  ctx.lineWidth = 1;
  for (var gx = 0; gx <= w; gx += 80) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (var gy = 0; gy <= h; gy += 80) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Pools of deep blue-violet shadow: safe cover. Drawn under everything
  // else on the floor so loot and characters stand out of them.
  drawShadowPools(ctx, world);

  // The vault floor is pale marble, distinct from the gallery floor.
  var v = world.vault;
  ctx.fillStyle = C.COL.vaultFloor;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = C.COL.vaultFloorEdge;
  ctx.lineWidth = 2;
  for (var mx = v.x + 40; mx < v.x + v.w; mx += 40) {
    ctx.beginPath();
    ctx.moveTo(mx, v.y);
    ctx.lineTo(mx, v.y + v.h);
    ctx.stroke();
  }
  for (var my = v.y + 40; my < v.y + v.h; my += 40) {
    ctx.beginPath();
    ctx.moveTo(v.x, my);
    ctx.lineTo(v.x + v.w, my);
    ctx.stroke();
  }

  // The red carpet runner down the central lane to the vault door.
  var carpet = world.carpet;
  ctx.fillStyle = C.COL.carpet;
  ctx.fillRect(carpet.x, carpet.y, carpet.w, carpet.h);
  ctx.strokeStyle = C.COL.carpetEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(carpet.x + 3, carpet.y);
  ctx.lineTo(carpet.x + 3, carpet.y + carpet.h);
  ctx.moveTo(carpet.x + carpet.w - 3, carpet.y);
  ctx.lineTo(carpet.x + carpet.w - 3, carpet.y + carpet.h);
  ctx.stroke();

  // Lane names written on the floor itself, in small capitals.
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(220,210,240,0.55)';
  var lanes = world.lanes;
  for (var li = 0; li < lanes.length; li++) {
    ctx.fillText(lanes[li].name, lanes[li].x, lanes[li].y);
  }

  // Walls: every solid starts as slate; furniture is redrawn over it.
  ctx.fillStyle = C.COL.wall;
  var solids = world.solids;
  for (var si = 0; si < solids.length; si++) {
    ctx.fillRect(solids[si].x, solids[si].y, solids[si].w, solids[si].h);
  }
  // Lighter top edge on the outer walls so the room reads as a room.
  ctx.fillStyle = C.COL.wallTop;
  ctx.fillRect(0, 0, w, 5);
  ctx.fillRect(0, 0, 5, h);
  ctx.fillRect(w - 5, 0, 5, h);

  // The vault door: a large circular steel door with spokes, set into the
  // vault's back wall.
  drawVaultDoor(ctx);

  // Props, each with one clear job.
  drawPaintings(ctx, world);
  drawDisplayCases(ctx, world);
  drawBenches(ctx, world);
  drawSecurityDesk(ctx, world);
  drawPedestal(ctx, world);
  drawPlants(ctx, world);
  drawExitDoor(ctx, world);
};

function drawShadowPools(ctx, world) {
  var pools = world.shadowPools;
  for (var i = 0; i < pools.length; i++) {
    var p = pools[i];
    ctx.fillStyle = 'rgba(16,12,34,0.55)';
    ctx.beginPath();
    ctx.ellipse(p.cx, p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(12,9,26,0.6)';
    ctx.beginPath();
    ctx.ellipse(p.cx, p.cy, p.rx * 0.7, p.ry * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVaultDoor(ctx) {
  var cx = 640;
  var cy = 84;
  var r = 26;
  ctx.fillStyle = '#8a94a6';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a6373';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#6e7889';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 7, 0, Math.PI * 2);
  ctx.fill();
  // Spokes.
  ctx.strokeStyle = '#4a5261';
  ctx.lineWidth = 3;
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * (r - 7), cy + Math.sin(a) * (r - 7));
    ctx.stroke();
  }
  ctx.fillStyle = '#3c4352';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPaintings(ctx, world) {
  var paintings = world.paintings;
  for (var i = 0; i < paintings.length; i++) {
    var p = paintings[i];
    // Gilt frame.
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(p.x - 3, p.y - 3, p.w + 6, p.h + 6);
    // Canvas: a tiny landscape, horizon line with a sun or a moon dot.
    var grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    grad.addColorStop(0, '#2c4a6b');
    grad.addColorStop(0.6, '#7a6a4f');
    grad.addColorStop(1, '#3d5a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = 'rgba(230,220,200,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.h * 0.55);
    ctx.lineTo(p.x + p.w, p.y + p.h * 0.55);
    ctx.stroke();
    ctx.fillStyle = p.moon ? '#e8e4d0' : '#ffd34d';
    ctx.beginPath();
    ctx.arc(p.x + p.w * 0.7, p.y + p.h * 0.3, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDisplayCases(ctx, world) {
  var cases = [
    { x: 120, y: 180, w: 60, h: 40 },
    { x: 1100, y: 180, w: 60, h: 40 },
  ];
  for (var i = 0; i < cases.length; i++) {
    var c = cases[i];
    ctx.fillStyle = 'rgba(160,200,230,0.28)';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#9fb6c9';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    // A small artifact glinting inside.
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBenches(ctx, world) {
  var benches = [
    { x: 150, y: 300, w: 120, h: 24 },
    { x: 1010, y: 300, w: 120, h: 24 },
    { x: 520, y: 470, w: 60, h: 24 },
  ];
  for (var i = 0; i < benches.length; i++) {
    var b = benches[i];
    ctx.fillStyle = '#7a5a38';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#5a4026';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + b.h / 2);
    ctx.lineTo(b.x + b.w, b.y + b.h / 2);
    ctx.stroke();
  }
}

function drawSecurityDesk(ctx, world) {
  ctx.fillStyle = '#333a4d';
  ctx.fillRect(560, 560, 160, 36);
  ctx.strokeStyle = '#4a5468';
  ctx.lineWidth = 2;
  ctx.strokeRect(560, 560, 160, 36);
  // A glowing monitor on the desk.
  ctx.fillStyle = '#9fd8ff';
  ctx.fillRect(628, 566, 24, 16);
  ctx.fillStyle = 'rgba(159,216,255,0.35)';
  ctx.fillRect(622, 560, 36, 28);
  // Papers.
  ctx.fillStyle = '#e8e4d0';
  ctx.fillRect(580, 572, 18, 12);
  ctx.fillRect(688, 574, 18, 12);
}

function drawPedestal(ctx, world) {
  // Stone pedestal with a small statue, standing in a shadow pool.
  ctx.fillStyle = '#6b6f7d';
  ctx.fillRect(250, 600, 60, 60);
  ctx.fillStyle = '#82869a';
  ctx.fillRect(250, 600, 60, 10);
  ctx.fillStyle = '#c9c2ae';
  ctx.beginPath();
  ctx.arc(280, 596, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(274, 600, 12, 14);
}

function drawPlants(ctx, world) {
  var plants = world.plants;
  for (var i = 0; i < plants.length; i++) {
    var p = plants[i];
    ctx.fillStyle = '#8a5a34';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f7d44';
    ctx.beginPath();
    ctx.arc(p.x - 7, p.y - 10, 8, 0, Math.PI * 2);
    ctx.arc(p.x + 7, p.y - 10, 8, 0, Math.PI * 2);
    ctx.arc(p.x, p.y - 16, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawExitDoor(ctx, world) {
  var e = world.exit;
  var C = VB.CFG;
  ctx.fillStyle = C.COL.exit;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = '#0f7a34';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + 28);
  ctx.font = '11px sans-serif';
  ctx.fillText('getaway van', e.x + e.w / 2, e.y + 56);
}
