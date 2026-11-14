/* Moment — many, many generations.
 * A made-up little animal. Tap one and it has a baby: the row moves on by one generation,
 * and the baby looks just like its parent. Slide the handle to go through many, many
 * generations at once. The row always looks alike; but compare the long-ago one (left card)
 * with the one now (right card). No animal ever changes: only each new baby is a tiny bit
 * different. The animal is invented, and the change is shown steady and one-way: see notes.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, GENS = 4000, ROW = 5;
  var TRACK = { x0: 60, x1: 420, y: 268 };

  var frame, surf, loop, off, st;

  function fresh() { return { gen: 0, drag: false, pop: 1, clock: 0, told: {} }; }
  function rowX(k) { return 96 + k * 72; }
  /* how one animal looks: p runs 0 (long ago) to 1 (now). A little wobble makes siblings differ. */
  function look(gen) {
    var p = Math.max(0, Math.min(1, gen / GENS)), w = Math.sin(gen * 12.9898) * 0.5 + Math.sin(gen * 4.1) * 0.5;
    return { p: p, leg: 5 + 15 * p + w * 0.8, ear: 4 + 13 * p + w * 0.6, tail: 22 - 15 * p - w, size: 1 + w * 0.03 };
  }
  function mix(a, b, t) { return Math.round(a + (b - a) * t); }
  function fur(p) { return 'rgb(' + mix(217, 122, p) + ',' + mix(179, 152, p) + ',' + mix(128, 178, p) + ')'; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.y > TRACK.y - 32) { st.drag = true; slide(p); } },
      move: function (q) { if (st.drag) slide(surf.toView(q)); },
      up: function () { st.drag = false; },
      tap: function (q) {
        var p = surf.toView(q);
        if (p.y > 130 && p.y < TRACK.y - 32 && st.gen < GENS) {      // one baby: one generation on
          st.gen = Math.min(GENS, Math.round(st.gen) + 1); st.pop = 0; BQ.sound.plop();
          if (!st.told.baby) { st.told.baby = true; frame.caption('A new baby! It looks just like its parent. Almost.'); }
        }
      }
    });
    frame.caption('Tap for one baby. Slide for many, many <b>generations</b>.');
    loop = BQ.loop(tick);
  }
  function slide(p) {
    st.gen = Math.max(0, Math.min(1, (p.x - TRACK.x0) / (TRACK.x1 - TRACK.x0))) * GENS;
    if (st.gen > GENS * 0.6 && !st.told.far) { st.told.far = true; frame.caption('Every baby looked like its parents. But tiny changes add up.'); }
  }
  function tick(dt) { st.clock += dt; st.pop = Math.min(1, st.pop + dt * 3.5); draw(); }

  function animal(g, x, y, s, L, t) {
    var k = s * L.size, bob = Math.sin(t) * 1.2;
    g.strokeStyle = INK.line; g.lineWidth = Math.max(1.5, k * 2.2); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x - 12 * k, y + bob); g.quadraticCurveTo(x - (16 + L.tail * 0.5) * k, y - 8 * k, x - (14 + L.tail) * k, y - 2 * k + bob); g.stroke();   // tail
    [-7, 7].forEach(function (d) { g.beginPath(); g.moveTo(x + d * k, y + 7 * k); g.lineTo(x + d * k, y + (7 + L.leg) * k); g.stroke(); });                 // legs
    g.fillStyle = fur(L.p);
    [-4, 4].forEach(function (d) { g.beginPath(); g.ellipse(x + (11 + d * 0.9) * k, y - (9 + L.ear * 0.5) * k + bob, 2.6 * k, (2 + L.ear * 0.5) * k, d * 0.06, 0, 6.283); g.fill(); g.stroke(); });
    g.beginPath(); g.ellipse(x, y + bob, 14 * k, 9.5 * k, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.arc(x + 12 * k, y - 5 * k + bob, 7.5 * k, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = INK.line; g.beginPath(); g.arc(x + 14.5 * k, y - 6.5 * k + bob, 1.2 * k, 0, 6.283); g.fill();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k, calm = BQ.calm(), gen = st.gen, base = Math.round(gen);
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(4, 196, VW - 8, 44);

    // two cards to compare: the long-ago one, and the one now
    [[90, 0], [390, gen]].forEach(function (c, n) {
      g.fillStyle = '#fff'; g.strokeStyle = n ? '#a66a00' : INK.line; g.lineWidth = 3;
      D.round(g, c[0] - 78, 14, 156, 104, 14); g.fill(); g.stroke();
      animal(g, c[0], 66 - look(c[1]).leg * 0.6, 1.5, look(c[1]), calm ? 0 : st.clock * 2 + n);
    });
    // between them: many, many dots of time
    for (k = 0; k < 11; k++) {
      var on = k / 10 <= gen / GENS;
      g.fillStyle = on ? '#a66a00' : 'rgba(59,58,54,.2)'; g.beginPath(); g.arc(184 + k * 11.2, 66, on ? 3.5 : 2.5, 0, 6.283); g.fill();
    }

    // the family row: parent, child, grandchild... newest on the right
    for (k = 0; k < ROW; k++) {
      var n2 = base - (ROW - 1 - k);
      if (n2 < 0) continue;
      var x = rowX(k), newest = k === ROW - 1, s = newest ? 0.75 + 0.25 * st.pop : 1, L = look(n2);
      if (k > 0 && n2 > 0) {
        g.strokeStyle = 'rgba(59,58,54,.45)'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(x - 46, 172); g.lineTo(x - 30, 172); g.lineTo(x - 35, 167); g.moveTo(x - 30, 172); g.lineTo(x - 35, 177); g.stroke();
      }
      animal(g, x - 4, 186 - L.leg, s, L, calm ? 0 : st.clock * 2 + k);
    }

    // the slider: one end long ago, the other now
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, TRACK.x0 - 26, TRACK.y - 12, TRACK.x1 - TRACK.x0 + 52, 24, 12); g.fill(); g.stroke();
    var hx = TRACK.x0 + (gen / GENS) * (TRACK.x1 - TRACK.x0), pulse = (!calm && gen === 0 && !st.drag) ? 1 + 0.08 * Math.sin(st.clock * 6) : 1;
    g.fillStyle = INK.sun; g.strokeStyle = '#a66a00'; g.lineWidth = 4;
    g.beginPath(); g.arc(hx, TRACK.y, 21 * pulse, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(hx - 3, TRACK.y - 7); g.lineTo(hx + 5, TRACK.y); g.lineTo(hx - 3, TRACK.y + 7); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption('Tap for one baby. Slide for many, many <b>generations</b>.'); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.generations = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, look: look, GENS: GENS,
    spots: { track: TRACK, row: function (k) { return { x: rowX(k), y: 180 }; } } };
})(window);
