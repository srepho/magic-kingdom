/* Opening — birthday candles.
 * Five candles, one for each birthday. Tap a candle to blow it out: she gets a year younger.
 * Tap it again to light it: a year older. No candles at all is the day she was born.
 * This is time she can feel, and it is the pink bit on the timeline.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, P = BQ.longAgoPics, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, N = 5, CAKE = { x: 150, y: 196, w: 190, h: 62 }, KID = { x: 312, y: 262 };

  var frame, surf, loop, off, st;

  function fresh() { return { lit: [true, true, true, true, true], shown: N, taps: 0, hop: 0, smoke: [], clock: 0, told: {} }; }
  function age() { return st.lit.filter(Boolean).length; }
  function candle(i) { return { x: CAKE.x - 68 + i * 34, y: CAKE.y - CAKE.h / 2 - 22 }; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      tap: function (q) {
        var p = surf.toView(q), i, c, best = -1, bd = 30;
        for (i = 0; i < N; i++) { c = candle(i); var d = Math.hypot(p.x - c.x, p.y - c.y + 8); if (d < bd) { bd = d; best = i; } }
        if (best >= 0) {
          st.lit[best] = !st.lit[best]; st.taps++;
          c = candle(best);
          if (!st.lit[best]) {
            for (i = 0; i < 5; i++) st.smoke.push({ x: c.x, y: c.y - 16, vx: (Math.random() - 0.5) * 16, life: 1 });
            BQ.sound.whoosh();
          } else BQ.sound.clink();
          if (!st.told.first) { st.told.first = true; frame.caption('One candle for every birthday. Fewer candles, a younger you.'); }
          if (age() === 0) frame.caption('No candles. This is the day you were born.');
          else if (st.told.first && st.taps > 1) frame.caption('One candle for every birthday. Fewer candles, a younger you.');
          if (st.taps >= 3) frame.nudgeToy();
          return;
        }
        if (Math.hypot(p.x - KID.x, p.y - KID.y + 40) < 56) { st.hop = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    st.shown += (age() - st.shown) * Math.min(1, 7 * dt);          // she grows or shrinks smoothly
    st.hop = Math.max(0, st.hop - dt * 2.4);
    st.smoke = st.smoke.filter(function (s) { s.y -= 26 * dt; s.x += s.vx * dt; s.life -= dt * 0.9; return s.life > 0; });
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, k, calm = BQ.calm();
    g.fillStyle = '#f6e7ee'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    // bunting
    g.strokeStyle = INK.line; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 26); g.quadraticCurveTo(200, 62, 390, 26); g.stroke();
    var flags = ['#f2788f', '#6fb6d9', '#ffd23f', '#7cc36a'];
    for (k = 0; k < 9; k++) {
      var u = (k + 0.5) / 9, fx = 10 + 380 * u, fy = 26 + 36 * 2 * u * (1 - u) * 1;
      g.fillStyle = flags[k % 4]; g.beginPath(); g.moveTo(fx - 13, fy); g.lineTo(fx + 13, fy); g.lineTo(fx, fy + 22); g.closePath(); g.fill(); g.stroke();
    }
    // table
    g.fillStyle = '#d9b98a'; g.fillRect(4, 232, VW - 8, VH - 236);
    g.fillStyle = '#c4a476'; g.fillRect(4, 232, VW - 8, 6);
    // cake
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.ellipse(CAKE.x, 236, CAKE.w / 2 + 16, 9, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#f6c9a0'; D.round(g, CAKE.x - CAKE.w / 2, CAKE.y - CAKE.h / 2, CAKE.w, CAKE.h + 8, 12); g.fill(); g.stroke();
    g.fillStyle = '#f9a8c0';
    g.beginPath(); g.moveTo(CAKE.x - CAKE.w / 2, CAKE.y - 6);
    for (k = 0; k < 6; k++) { var sx = CAKE.x - CAKE.w / 2 + (k + 0.5) * CAKE.w / 6; g.quadraticCurveTo(sx, CAKE.y + 16, sx + CAKE.w / 12, CAKE.y - 6); }
    g.lineTo(CAKE.x + CAKE.w / 2, CAKE.y - CAKE.h / 2 + 10); g.quadraticCurveTo(CAKE.x + CAKE.w / 2, CAKE.y - CAKE.h / 2, CAKE.x + CAKE.w / 2 - 12, CAKE.y - CAKE.h / 2);
    g.lineTo(CAKE.x - CAKE.w / 2 + 12, CAKE.y - CAKE.h / 2); g.quadraticCurveTo(CAKE.x - CAKE.w / 2, CAKE.y - CAKE.h / 2, CAKE.x - CAKE.w / 2, CAKE.y - CAKE.h / 2 + 10);
    g.closePath(); g.fill(); g.stroke();
    // candles
    for (i = 0; i < N; i++) {
      var c = candle(i), wig = (!calm && !st.taps) ? Math.sin(st.clock * 5 + i * 1.3) * 2 : 0;
      g.fillStyle = flags[i % 4]; g.strokeStyle = INK.line; g.lineWidth = 2.5;
      D.round(g, c.x - 6 + wig, c.y, 12, 30, 4); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(c.x + wig, c.y); g.lineTo(c.x + wig, c.y - 6); g.stroke();
      if (st.lit[i]) {
        var fl = calm ? 1 : 0.85 + 0.15 * Math.sin(st.clock * 13 + i * 2);
        g.fillStyle = INK.warm; g.beginPath(); g.moveTo(c.x - 7 + wig, c.y - 6); g.quadraticCurveTo(c.x + wig, c.y - 6 - 30 * fl, c.x + 7 + wig, c.y - 6); g.quadraticCurveTo(c.x + wig, c.y + 2, c.x - 7 + wig, c.y - 6); g.fill();
        g.fillStyle = INK.sun; g.beginPath(); g.moveTo(c.x - 3.5 + wig, c.y - 6); g.quadraticCurveTo(c.x + wig, c.y - 6 - 16 * fl, c.x + 3.5 + wig, c.y - 6); g.fill();
      }
    }
    st.smoke.forEach(function (s) {
      g.fillStyle = 'rgba(150,150,150,' + (0.45 * s.life) + ')';
      g.beginPath(); g.arc(s.x, s.y, 5 + (1 - s.life) * 7, 0, 6.283); g.fill();
    });
    // her, as old as the candles say
    var hop = Math.sin(st.hop * Math.PI) * 18;
    P.kid(g, KID.x, KID.y - hop, 150, st.shown, st.clock, st.hop > 0);
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.candles = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, age: function () { return age(); },
    spots: { candle: candle, kid: { x: KID.x, y: KID.y - 40 }, vw: VW, vh: VH, pad: 12 } };
})(window);
