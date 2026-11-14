/* Moment — the farm.
 * Poke anything growing or living here and it gives what it gives: the hen lays an egg, the
 * cow's bucket fills with milk, an apple drops from the tree, the wheat shakes out grain, and
 * the potato plant lifts to show potatoes hiding under the ground. A thought bubble shows the
 * food each one becomes. Nothing happens unless she pokes.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, A = BQ.foodArt, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300;
  var SPOT = {
    wheat: { x: 66, y: 150, r: 46, gives: 'slice', say: 'Wheat is a <b>crop</b>. Its seeds are crushed into flour for bread.', sound: 'click' },
    hen: { x: 176, y: 214, r: 38, gives: 'eggcup', say: 'Hens lay eggs.', sound: 'squeak' },
    cow: { x: 296, y: 168, r: 50, gives: 'glass', say: 'Cows make milk. The farmer milks them every day.', sound: 'nope' },
    tree: { x: 414, y: 112, r: 54, gives: 'apple', say: 'Apples grow on trees.', sound: 'plop' },
    potato: { x: 92, y: 246, r: 40, gives: 'chips', say: 'Potatoes grow under the ground. Surprise!', sound: 'whoosh' }
  };
  var NAMES = ['wheat', 'hen', 'cow', 'tree', 'potato'];

  var frame, surf, loop, off, st;

  function fresh() {
    return { poke: { wheat: 0, hen: 0, cow: 0, tree: 0, potato: 0 }, shown: {}, bubble: {}, eggs: [], apples: [], grains: [],
             milk: 0, lift: 0, liftHold: 0, clock: 0 };
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q), best = null, bd = Infinity;
        NAMES.forEach(function (n) {
          var d = Math.hypot(p.x - SPOT[n].x, p.y - SPOT[n].y) / SPOT[n].r;
          if (d < 1 && d < bd) { bd = d; best = n; }
        });
        if (best) pokeIt(best);
      }
    });
    loop = BQ.loop(tick);
  }

  function pokeIt(n) {
    var s = SPOT[n], k;
    st.poke[n] = 1; st.bubble[n] = 2.6;
    BQ.sound[s.sound]();
    st.shown[n] = true;
    frame.caption(s.say);
    if (n === 'hen') {
      if (st.eggs.length >= 4) st.eggs = [];
      st.eggs.push({ x: s.x - 6, y: s.y + 20, vx: -40 - Math.random() * 50, rest: s.x - 34 - st.eggs.length * 15 });
    } else if (n === 'cow') {
      st.milk = st.milk >= 1 ? 0.34 : Math.min(1, st.milk + 0.34);
    } else if (n === 'tree') {
      if (st.apples.length >= 4) st.apples = [];
      st.apples.push({ x: s.x - 30 + Math.random() * 60, y: s.y - 10, vy: 0, floor: 218 + Math.random() * 10 });
    } else if (n === 'wheat') {
      for (k = 0; k < 6; k++) st.grains.push({ x: s.x - 30 + Math.random() * 60, y: s.y - 30, vx: (Math.random() - 0.5) * 50, vy: -40 - Math.random() * 40, life: 1 });
    } else if (n === 'potato') { st.liftHold = 1.8; }
  }

  function tick(dt) {
    st.clock += dt;
    NAMES.forEach(function (n) {
      st.poke[n] = Math.max(0, st.poke[n] - dt * 1.6);
      if (st.bubble[n] > 0) st.bubble[n] -= dt;
    });
    st.eggs.forEach(function (e) { if (e.x > e.rest) { e.x = Math.max(e.rest, e.x + e.vx * dt); } });
    st.apples.forEach(function (a) {
      if (a.y < a.floor || a.vy < 0) { a.vy += 500 * dt; a.y += a.vy * dt; if (a.y >= a.floor) { a.y = a.floor; a.vy = a.vy > 80 ? -a.vy * 0.35 : 0; } }
    });
    st.grains = st.grains.filter(function (p) { p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.2; return p.life > 0; });
    st.liftHold = Math.max(0, st.liftHold - dt);
    var want = st.liftHold > 0 ? 1 : 0;
    st.lift += (want - st.lift) * Math.min(1, 6 * dt);
    draw();
  }

  function wiggle(n, i) {                       // a gentle hint for anything not yet poked
    return (!st.shown[n] && !BQ.calm() && (st.clock + i * 0.7) % 3.5 < 0.5) ? Math.sin(st.clock * 20) * 2 : 0;
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k, s;
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(150, 40, 40, 12, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.beginPath(); g.moveTo(0, 150); g.quadraticCurveTo(240, 118, 480, 150); g.lineTo(480, 300); g.lineTo(0, 300); g.closePath(); g.fill();
    A.place(g, 'farm', 216, 150, 1.5);
    g.strokeStyle = '#8b7355'; g.lineWidth = 3;                                  // fence
    g.beginPath(); g.moveTo(250, 232); g.lineTo(476, 232); g.moveTo(250, 244); g.lineTo(476, 244); g.stroke();
    for (k = 0; k < 8; k++) { g.beginPath(); g.moveTo(258 + k * 30, 224); g.lineTo(258 + k * 30, 252); g.stroke(); }

    // wheat: a little field of it
    s = SPOT.wheat;
    g.fillStyle = '#e6d39a'; D.round(g, s.x - 50, s.y + 20, 100, 16, 6); g.fill();
    var sway = Math.sin(st.clock * 14) * 0.5 * st.poke.wheat + wiggle('wheat', 0) * 0.04;
    for (k = 0; k < 3; k++) A.form(g, 'wheat', s.x - 30 + k * 30, s.y + 6, 24, { sway: sway });
    g.fillStyle = '#e9b949';
    st.grains.forEach(function (p) { g.globalAlpha = p.life; g.beginPath(); g.ellipse(p.x, p.y, 2.5, 4, 0.4, 0, 6.283); g.fill(); });
    g.globalAlpha = 1;

    // apple tree
    s = SPOT.tree;
    A.form(g, 'tree', s.x + Math.sin(st.clock * 16) * 3 * st.poke.tree + wiggle('tree', 3), s.y + 12, 62);
    st.apples.forEach(function (a) { C.food(g, 'apple', a.x, a.y, 8); });

    // cow and her bucket
    s = SPOT.cow;
    g.save(); g.translate(s.x + wiggle('cow', 2), s.y); g.scale(1 + 0.06 * st.poke.cow, 1 - 0.08 * st.poke.cow * Math.abs(Math.sin(st.clock * 12)));
    A.form(g, 'cow', 0, 0, 42); g.restore();
    var bx = s.x - 62, by = s.y + 42;
    g.strokeStyle = INK.line; g.lineWidth = 2.5;
    if (st.milk > 0) { g.fillStyle = '#fff'; g.fillRect(bx - 11, by + 14 - 24 * st.milk, 22, 24 * st.milk); }
    g.beginPath(); g.moveTo(bx - 14, by - 12); g.lineTo(bx - 10, by + 14); g.lineTo(bx + 10, by + 14); g.lineTo(bx + 14, by - 12); g.stroke();
    g.beginPath(); g.arc(bx, by - 12, 14, Math.PI, 0); g.stroke();

    // hen and her eggs
    s = SPOT.hen;
    st.eggs.forEach(function (e) { A.form(g, 'egg', e.x, e.y, 8); });
    A.form(g, 'hen', s.x + wiggle('hen', 1), s.y - Math.sin(st.poke.hen * Math.PI) * 16, 26);

    // potato plant: the soil hides the potatoes until she pulls it up
    s = SPOT.potato;
    g.fillStyle = '#b08f6a'; D.round(g, s.x - 60, s.y + 6, 120, 34, 10); g.fill();
    g.save(); g.beginPath(); g.rect(s.x - 70, s.y - 90, 140, 96 + 0.01); g.clip();
    A.form(g, 'potato', s.x + wiggle('potato', 4), s.y + 6 - st.lift * 44, 28);
    g.restore();
    g.strokeStyle = '#8b7355'; g.lineWidth = 3; g.beginPath(); g.moveTo(s.x - 60, s.y + 6); g.lineTo(s.x + 60, s.y + 6); g.stroke();
    g.restore();

    // what each one becomes
    NAMES.forEach(function (n) {
      if (!(st.bubble[n] > 0)) return;
      var p = SPOT[n], side = p.x > 300 ? -1 : 1, bx2 = p.x + side * (p.r * 0.75), by2 = Math.max(34, p.y - p.r - 6);
      var pop = Math.min(1, (2.6 - st.bubble[n]) * 6) * Math.min(1, st.bubble[n] * 4);
      C.bubble(g, bx2, by2, 21 * pop, side);
      if (pop > 0.5) A.form(g, p.gives, bx2, by2, 12 * pop);
    });
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.farm = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: SPOT, VW: VW, VH: VH };
})(window);
