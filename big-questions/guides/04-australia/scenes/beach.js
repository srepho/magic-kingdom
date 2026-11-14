/* Opening — footprints.
 * A beach. Drag a finger and footprints follow it: hers. Tap the water and a wave runs up
 * and washes them away, and each wave uncovers an older set of footprints set hard in the
 * ground: people walked here long before her.
 * This is a picture of an idea. The real ancient footprints in Australia (about 20,000 years
 * old, at the Willandra Lakes) were uncovered by wind, not waves: see the grown-up notes.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, SHORE = 236, LAYERS = 3;
  var SAY = ['The wave washed yours away. But look: older footprints!',
             'People walked here long, long before you.',
             'For a very, very long time. Longer than anyone can count.'];

  var frame, surf, loop, off, st;

  function trail(seed, n, y0, y1) {                        // one long-ago walk across the sand
    var out = [], x = 30, y = y0;
    for (var i = 0; i < n; i++) {
      x += 340 / n; y += (y1 - y0) / n + Math.sin(i * 1.7 + seed) * 5;
      out.push({ x: x, y: y, a: Math.atan2((y1 - y0) / n, 340 / n), left: i % 2 === 0 });
    }
    return out;
  }
  function fresh() {
    return { mine: [], last: null, left: true, wave: 0, old: 0, shown: [0, 0, 0], clock: 0,
             trails: [trail(1, 14, 150, 110).concat(trail(4, 12, 80, 120)), trail(2, 16, 60, 170).concat(trail(7, 10, 190, 150)), trail(3, 18, 120, 70).concat(trail(5, 15, 100, 200))] };
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.y < SHORE - 8) { st.last = p; step(p, 0); } },
      move: function (q) {
        var p = surf.toView(q);
        if (!st.last || p.y > SHORE - 8) return;
        var d = Math.hypot(p.x - st.last.x, p.y - st.last.y);
        if (d > 24) { step(p, Math.atan2(p.y - st.last.y, p.x - st.last.x)); st.last = p; }
      },
      up: function () { st.last = null; },
      tap: function (q) {
        var p = surf.toView(q);
        if (p.y >= SHORE - 8 && st.wave <= 0) { st.wave = 0.001; BQ.sound.whoosh(); }
      }
    });
    loop = BQ.loop(tick);
  }
  function step(p, a) {
    var side = st.left ? -1 : 1; st.left = !st.left;
    st.mine.push({ x: p.x - Math.sin(a) * 7 * side, y: p.y + Math.cos(a) * 7 * side, a: a, left: side < 0, t: 0 });
    if (st.mine.length > 80) st.mine.shift();
    BQ.sound.click();
  }

  function tick(dt) {
    st.clock += dt;
    st.mine.forEach(function (f) { f.t = Math.min(1, f.t + dt * 6); });
    if (st.wave > 0) {
      var was = st.wave; st.wave += dt * 0.55;
      if (was < 0.5 && st.wave >= 0.5) {                     // the wave is right up the beach: hers are gone
        st.mine = [];
        if (st.old < LAYERS) { st.old++; frame.caption(SAY[st.old - 1]); if (st.old === 2) frame.nudgeToy(); }
      }
      if (st.wave >= 1) st.wave = 0;
    }
    for (var i = 0; i < LAYERS; i++) st.shown[i] += ((i < st.old ? 1 : 0) - st.shown[i]) * Math.min(1, dt * 1.5);
    draw();
  }

  function print(g, f, s, fill) {
    g.save(); g.translate(f.x, f.y); g.rotate(f.a + Math.PI / 2 + (f.left ? -0.12 : 0.12));
    g.fillStyle = fill;
    // a bare foot: round heel, wider ball, five toes close in front
    g.beginPath(); g.arc(0, 5.2 * s, 3 * s, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(0, 2 * s, 2.8 * s, 4.6 * s, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(0.3 * s, -1.8 * s, 4.1 * s, 3.6 * s, 0, 0, 6.283); g.fill();
    for (var k = 0; k < 5; k++) { g.beginPath(); g.arc((-3.6 + k * 1.9) * s, (-6.6 + k * 0.55) * s, (1.7 - k * 0.2) * s, 0, 6.283); g.fill(); }
    g.restore();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, calm = BQ.calm();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = '#ecdcb8'; g.fillRect(0, 0, VW, VH);
    g.fillStyle = 'rgba(255,255,255,.25)';
    for (i = 0; i < 26; i++) g.fillRect((i * 97) % 392, (i * 53) % 226, 3, 2);
    // older footprints, set hard: each wave uncovers a deeper, fainter, more crowded layer
    for (i = LAYERS - 1; i >= 0; i--) {
      if (st.shown[i] < 0.02) continue;
      st.trails[i].forEach(function (f) { print(g, f, 1.3 - i * 0.14, 'rgba(120,96,70,' + (st.shown[i] * (0.5 - i * 0.12)) + ')'); });
    }
    st.mine.forEach(function (f) { print(g, f, 1.5 * f.t, 'rgba(96,70,48,.8)'); });
    // the sea, and the wave when she calls it
    var up = st.wave > 0 ? Math.sin(st.wave * Math.PI) : 0, lap = calm ? 0 : Math.sin(st.clock * 1.4) * 3;
    var edge = SHORE - up * (SHORE - 14) + lap;
    g.fillStyle = 'rgba(126,196,238,.55)'; g.beginPath(); g.moveTo(0, VH);
    for (i = 0; i <= 10; i++) g.lineTo(i * 40, edge + Math.sin(i * 1.3 + st.clock * 2) * 5);
    g.lineTo(VW, VH); g.closePath(); g.fill();
    g.fillStyle = INK.water; g.beginPath(); g.moveTo(0, VH);
    for (i = 0; i <= 10; i++) g.lineTo(i * 40, SHORE + 10 + lap + Math.sin(i * 1.7 + st.clock * 1.6) * 4);
    g.lineTo(VW, VH); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.beginPath();
    for (i = 0; i <= 10; i++) { var yy = edge + Math.sin(i * 1.3 + st.clock * 2) * 5; if (i) g.lineTo(i * 40, yy); else g.moveTo(0, yy); }
    g.stroke();
    if (!calm && st.wave <= 0 && st.mine.length > 3) {       // the water invites a tap once she has walked
      g.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.4 * Math.sin(st.clock * 5)) + ')';
      g.beginPath(); g.arc(200, 268, 14 + 3 * Math.sin(st.clock * 5), 0, 6.283); g.fill();
    }
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.beach = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; } };
})(window);
