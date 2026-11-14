/* Moment — the other side of the world.
 * The same Earth, with two dots: Sydney (red) and a place almost exactly on the far side
 * (green; it is Rio de Janeiro in Brazil, named only in the grown-up notes).
 * Two round windows show each place's sky. She turns the Earth: when one has day, the other has night.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.dayNightSim, N = BQ.dayNight, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, CARD = { x: 176, y: 10, w: 296, h: 280 };
  var SUN = { x: 208, y: 150 }, E = { x: 356, y: 150, r: 92 };
  var WIN = [{ place: S.SYDNEY, x: 86, y: 80, color: '#e4534a', house: [228, 83, 74] },
             { place: S.RIO, x: 86, y: 220, color: '#3fa66b', house: [63, 166, 107] }];
  var WR = 62;

  var frame, surf, loop, off, sim, spinner, st;

  function fresh() { return { clock: 0, touched: false, told: false }; }

  function start(stage, api) {
    frame = api; sim = S.create(); st = fresh();
    surf = BQ.surface(stage, draw);
    spinner = N.spinner(sim, function () { return E; });
    off = BQ.touch(surf.c, {
      down: function (q) { if (spinner.down(surf.toView(q))) st.touched = true; },
      move: function (q) { spinner.move(surf.toView(q)); },
      up: function () { spinner.up(); }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; sim.tick(dt);
    if (!st.told && sim.state.turned > 1.6) {
      st.told = true;
      frame.caption('When it is day in Sydney, it is night on the other side.');
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), spin = sim.state.spin;
    g.fillStyle = INK.sky; D.round(g, 4, 4, 164, VH - 8, 14); g.fill();

    WIN.forEach(function (w) {                                // a round window on each place's sky
      g.save();
      g.beginPath(); g.arc(w.x, w.y, WR, 0, 6.283); g.clip();
      g.translate(w.x - WR, w.y - WR);
      N.sky(g, 2 * WR, 2 * WR, S.sky(w.place, spin), { mini: true, house: w.house, clock: st.clock });
      g.restore();
      g.strokeStyle = w.color; g.lineWidth = 6; g.beginPath(); g.arc(w.x, w.y, WR, 0, 6.283); g.stroke();
      g.strokeStyle = INK.line; g.lineWidth = 2; g.beginPath(); g.arc(w.x, w.y, WR + 3, 0, 6.283); g.stroke();
    });

    D.paper(g, CARD.x, CARD.y, CARD.w, CARD.h);
    D.glasses(g, CARD.x + CARD.w / 2, CARD.y + 14, 11);
    N.sun(g, SUN.x, SUN.y, 22, E.x, E.r, st.clock);
    N.earth(g, E.x, E.y, E.r, spin, WIN.map(function (w) { return { place: w.place, color: w.color }; }), st.clock);
    N.arrow(g, E.x, E.y, E.r + 9, -1.0, -0.35);
    if (!st.touched && !BQ.calm()) {
      var a = -1.0 + ((st.clock * 0.5) % 1) * 0.65;
      g.fillStyle = 'rgba(59,58,54,.28)'; g.beginPath();
      g.arc(E.x + (E.r - 16) * Math.cos(a), E.y + (E.r - 16) * Math.sin(a), 11, 0, 6.283); g.fill();
    }
  }

  function reset() { if (!st) return; sim.reset(); st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = sim = spinner = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.other = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, state: function () { return st; },
    spots: { earth: E } };
})(window);
