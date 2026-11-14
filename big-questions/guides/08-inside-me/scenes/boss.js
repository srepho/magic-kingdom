/* Moment — the brain is the boss.
 * Tap a hand or a foot: a spark runs from the brain down to it, and then it moves.
 * Tap the head: sparks go everywhere and she does a star jump.
 * Drag the feather onto a hand or foot: a spark runs UP to the brain, and then she giggles.
 * Messages go both ways. The yellow lines are a diagram of nerves, drawn far thicker and
 * far fewer than real ones, and the sparks are slowed enormously.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, B = BQ.body, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, FX = 170, FY = 272, TRAVEL = 0.55;

  var frame, surf, loop, off, st;

  function fresh() {
    return { wave: [0, 0], kick: [0, 0], giggle: 0, msgs: [], feather: { x: 318, y: 150 }, drag: null, tickled: 0,
             sent: 0, clock: 0, told: {} };
  }
  function pose() {
    var q = B.stand(), i;
    for (i = 0; i < 2; i++) {
      if (st.wave[i] > 0) { q.arm[i].a = 2.45; q.arm[i].b = 0.35 * Math.sin(st.clock * 15); }
      if (st.kick[i] > 0) q.leg[i].a = 0.95 * Math.sin(Math.min(1, st.kick[i]) * Math.PI);
    }
    var up = Math.max(st.kick[0], st.kick[1]);
    if (up > 0) q.bob = -6 * Math.sin(Math.min(1, up) * Math.PI);
    return q;
  }
  function ends() {                                         // the four places a message can go
    var J = B.joints(pose());
    return [{ kind: 'hand', i: 0, p: J.ha[0] }, { kind: 'hand', i: 1, p: J.ha[1] }, { kind: 'foot', i: 0, p: J.ft[0] }, { kind: 'foot', i: 1, p: J.ft[1] }];
  }
  /* brain -> part: then the part moves */
  function order(kind, i) {
    st.msgs.push({ kind: kind, i: i, t: 0, up: false });
    st.sent++; BQ.sound.click();
    if (!st.told.down) { st.told.down = true; frame.caption('Your brain sends a message down, and that part of you moves.'); }
  }
  /* part -> brain: then she feels it */
  function feel(kind, i) {
    st.msgs.push({ kind: kind, i: i, t: 0, up: true });
    BQ.sound.click();
  }
  function arrive(m) {
    if (m.up) {
      st.giggle = 1.1; BQ.sound.squeak();
      if (!st.told.up) { st.told.up = true; frame.caption('A message goes up to your brain too: that tickles!'); }
    } else if (m.kind === 'hand') { st.wave[m.i] = 1.1; BQ.sound.whoosh(); }
    else { st.kick[m.i] = 1; BQ.sound.plop(); }
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - st.feather.x, p.y - st.feather.y) < 38) st.drag = { dx: st.feather.x - p.x, dy: st.feather.y - p.y };
      },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q);
        st.feather.x = Math.max(20, Math.min(VW - 20, p.x + st.drag.dx));
        st.feather.y = Math.max(24, Math.min(VH - 14, p.y + st.drag.dy));
      },
      up: function () { st.drag = null; },
      tap: function (q) {
        var v = surf.toView(q), p = { x: v.x - FX, y: v.y - FY }, J = B.joints(pose());
        if (Math.hypot(v.x - st.feather.x, v.y - st.feather.y) < 30) return;
        if (Math.hypot(p.x - J.head.x, p.y - J.head.y) < 38) {            // everything at once
          order('hand', 0); order('hand', 1); order('foot', 0); order('foot', 1); return;
        }
        var best = null, bd = 34;
        ends().forEach(function (e) { var d = Math.hypot(p.x - e.p.x, p.y - e.p.y); if (d < bd) { bd = d; best = e; } });
        if (best) order(best.kind, best.i);
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    for (var i = 0; i < 2; i++) { st.wave[i] = Math.max(0, st.wave[i] - dt); st.kick[i] = Math.max(0, st.kick[i] - dt * 1.7); }
    st.giggle = Math.max(0, st.giggle - dt); st.tickled = Math.max(0, st.tickled - dt);
    for (var k = st.msgs.length - 1; k >= 0; k--) {
      var m = st.msgs[k]; m.t += dt / TRAVEL;
      if (m.t >= 1) { st.msgs.splice(k, 1); arrive(m); }
    }
    // the feather tickles whatever it is resting on
    if (st.tickled <= 0) {
      var tip = { x: st.feather.x - FX - 16, y: st.feather.y - FY + 12 };
      ends().some(function (e) {
        if (Math.hypot(tip.x - e.p.x, tip.y - e.p.y) < 24) { feel(e.kind, e.i); st.tickled = 1.3; return true; }
        return false;
      });
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#e6d9c3'; g.fillRect(4, 250, VW - 8, VH - 254);
    g.fillStyle = '#d6c7ad'; g.fillRect(4, 250, VW - 8, 4);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(FX, FY + 3, 46, 7, 0, 0, 6.283); g.fill();

    var q = pose(), J = B.joints(q), P = B.paths(J);
    g.save(); g.translate(FX, FY);
    if (st.giggle > 0) g.rotate(Math.sin(st.clock * 26) * 0.05 * st.giggle);
    B.draw(g, q, { organs: 1, show: { vessels: false, lungs: false, gut: false, heart: false, nerves: true } });
    // places to tap breathe gently until she has found them
    if (st.sent < 2 && !calm) {
      g.strokeStyle = 'rgba(245,185,66,' + (0.5 + 0.3 * Math.sin(st.clock * 4)) + ')'; g.lineWidth = 3;
      ends().forEach(function (e) { g.beginPath(); g.arc(e.p.x, e.p.y, 13 + 2 * Math.sin(st.clock * 4), 0, 6.283); g.stroke(); });
    }
    // sparks: the messages
    st.msgs.forEach(function (m) {
      var path = P[m.kind][m.i], p = B.along(path, m.up ? 1 - m.t : m.t);
      g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(p.x, p.y, 8, 0, 6.283); g.fill();
      D.star(g, p.x, p.y, 7);
    });
    if (st.giggle > 0) {                                   // giggle marks
      g.strokeStyle = 'rgba(59,58,54,' + st.giggle + ')'; g.lineWidth = 2.5; g.lineCap = 'round';
      [-1, 1].forEach(function (s) {
        g.beginPath(); g.moveTo(s * 40, J.head.y - 22); g.lineTo(s * 50, J.head.y - 30);
        g.moveTo(s * 42, J.head.y - 8); g.lineTo(s * 54, J.head.y - 8); g.stroke();
      });
    }
    g.restore();

    // the feather
    var fx = st.feather.x, fy = st.feather.y + (calm || st.drag ? 0 : Math.sin(st.clock * 2.4) * 3);
    g.save(); g.translate(fx, fy); g.rotate(-0.7 + (st.tickled > 0.8 ? Math.sin(st.clock * 30) * 0.2 : 0));
    g.fillStyle = '#b79be0'; g.strokeStyle = INK.line; g.lineWidth = 2;
    g.beginPath(); g.ellipse(0, -6, 9, 22, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, -26); g.lineTo(0, 30); g.stroke();
    g.strokeStyle = 'rgba(59,58,54,.4)'; g.lineWidth = 1.2;
    for (var k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(0, k * 7 - 4); g.lineTo(7, k * 7 - 9); g.moveTo(0, k * 7 - 4); g.lineTo(-7, k * 7 - 9); g.stroke(); }
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.boss = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, origin: { x: FX, y: FY }, ends: ends };
})(window);
