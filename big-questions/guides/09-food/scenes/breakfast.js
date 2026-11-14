/* Opening — breakfast.
 * Toast, a glass of milk, a boiled egg and an apple. Tap one and a bite (or a sip) goes.
 * When it is all gone a fresh one appears. After a few bites the question arrives:
 * where was this before it was on your plate?
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, A = BQ.foodArt, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300;
  var ITEMS = [
    { form: 'slice', x: 108, y: 196, s: 34 },
    { form: 'glass', x: 206, y: 160, s: 34 },
    { form: 'eggcup', x: 286, y: 178, s: 30 },
    { form: 'apple', x: 344, y: 226, s: 30 }
  ];

  var frame, surf, loop, off, st;

  function fresh() { return { bites: [0, 0, 0, 0], back: [0, 0, 0, 0], hop: [0, 0, 0, 0], crumbs: [], total: 0, clock: 0 }; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        for (var i = 0; i < ITEMS.length; i++) {
          var it = ITEMS[i];
          if (st.bites[i] < 3 && Math.hypot(p.x - it.x, p.y - it.y) < it.s + 18) { bite(i); return; }
        }
      }
    });
    loop = BQ.loop(tick);
  }

  function bite(i) {
    var it = ITEMS[i];
    st.bites[i]++; st.hop[i] = 1; st.total++;
    if (it.form === 'glass') BQ.sound.drip(); else BQ.sound.click();
    for (var k = 0; k < 5 && it.form !== 'glass'; k++) {
      st.crumbs.push({ x: it.x, y: it.y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, life: 1 });
    }
    if (st.bites[i] >= 3) st.back[i] = 2.2;
    if (st.total === 3) {
      frame.caption('Yum! Where was your breakfast before it got to your plate?');
      frame.nudgeToy();
    }
  }

  function tick(dt) {
    st.clock += dt;
    for (var i = 0; i < ITEMS.length; i++) {
      st.hop[i] = Math.max(0, st.hop[i] - dt * 3);
      if (st.back[i] > 0 && (st.back[i] -= dt) <= 0) { st.bites[i] = 0; st.hop[i] = 1; BQ.sound.plop(); }
    }
    st.crumbs = st.crumbs.filter(function (c) { c.vy += 400 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.life -= dt * 1.8; return c.life > 0; });
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, calm = BQ.calm();
    // kitchen wall, window, table
    g.fillStyle = '#f6ecd9'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = INK.sky; g.strokeStyle = '#fff'; g.lineWidth = 6; D.round(g, 250, 22, 110, 80, 8); g.fill(); g.stroke();
    g.fillStyle = BQ.ink.sun; g.beginPath(); g.arc(330, 48, 13, 0, 6.283); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = '#d9b98a'; g.fillRect(0, 150, VW, 150);
    g.fillStyle = '#c4a374'; g.fillRect(0, 150, VW, 6);
    g.restore();
    // plate under the toast
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.ellipse(108, 212, 62, 22, 0, 0, 6.283); g.fill(); g.stroke();

    for (i = 0; i < ITEMS.length; i++) {
      var it = ITEMS[i], b = st.bites[i], hop = Math.sin(st.hop[i] * Math.PI) * 10;
      var wig = (!st.total && !calm && (st.clock + i * 0.6) % 2.8 < 0.45) ? Math.sin(st.clock * 22) * 3 : 0;
      if (it.form === 'glass') { A.form(g, 'glass', it.x + wig, it.y - hop, it.s, { level: 0.82 * (1 - b / 3) }); continue; }
      if (b >= 3) continue;                              // all eaten; a fresh one is on its way
      var k = 1 - 0.24 * b;
      A.form(g, it.form, it.x + wig, it.y - hop + it.s * (1 - k) * 0.6, it.s * k);
    }
    g.fillStyle = '#c99a5b';
    st.crumbs.forEach(function (c) { g.globalAlpha = c.life; g.beginPath(); g.arc(c.x, c.y, 2.5, 0, 6.283); g.fill(); });
    g.globalAlpha = 1;
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.breakfast = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, items: ITEMS, VW: VW, VH: VH };
})(window);
