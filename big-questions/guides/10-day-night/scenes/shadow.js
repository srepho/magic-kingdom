/* Moment — shadows.
 * A koala stands in the park. She turns the little Earth on its paper card; the Sun crosses
 * the sky and the koala's shadow swings round: long in the morning, short at lunch, long
 * again in the evening, always pointing away from the Sun. No shadow at night.
 * (She turns the Earth, not the Sun: the Sun only looks as if it moves.)
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.dayNightSim, N = BQ.dayNight, D = BQ.draw, C = BQ.cast, INK = BQ.ink;
  var VW = 480, VH = 300, CARD = { x: 330, y: 150, w: 142, h: 142 }, E = { x: 412, y: 226, r: 46 };
  var WHO = { x: 190, y: 196, s: 24 }, FEET = { x: 190, y: 250 };

  var frame, surf, loop, off, sim, spinner, st;

  function fresh() { return { clock: 0, touched: false, told: false, hop: 0 }; }

  function start(stage, api) {
    frame = api; sim = S.create(); st = fresh();
    surf = BQ.surface(stage, draw);
    spinner = N.spinner(sim, function () { return E; });
    off = BQ.touch(surf.c, {
      down: function (q) { if (spinner.down(surf.toView(q))) st.touched = true; },
      move: function (q) { spinner.move(surf.toView(q)); },
      up: function () { spinner.up(); },
      tap: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - WHO.x, p.y - WHO.y - 16) < 46) { st.hop = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; sim.tick(dt);
    st.hop = Math.max(0, st.hop - dt * 2.4);
    if (!st.told && sim.state.turned > 1.2) {
      st.told = true;
      frame.caption('Shadows point away from the Sun. Long in the morning, short at lunch.');
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), spin = sim.state.spin, k = S.sky(S.SYDNEY, spin);
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    N.sky(g, VW, VH, k, { horizon: 0.66, clock: st.clock });

    var sh = S.shadow(k.H, S.SYDNEY.lat), hop = Math.sin(st.hop * Math.PI) * 16;
    if (sh) {                                               // the shadow lies on the grass, away from the Sun
      var len = Math.min(150, 34 * sh.length), tipX = FEET.x + sh.side * len;
      g.fillStyle = 'rgba(20,30,50,' + (0.34 * k.light) + ')';
      g.beginPath(); g.ellipse((FEET.x + tipX) / 2, FEET.y, Math.abs(tipX - FEET.x) / 2 + 20, 9, 0, 0, 6.283); g.fill();
    }
    C.critter(g, 'koala', WHO.x, WHO.y - hop, WHO.s, k.light > 0.3 ? 'happy' : 'want', st.clock);
    if (k.light < 0.5) { g.fillStyle = 'rgba(18,28,62,' + (0.45 * (1 - k.light)) + ')'; g.beginPath(); g.ellipse(WHO.x, WHO.y + 14 - hop, 34, 50, 0, 0, 6.283); g.fill(); }
    g.restore();

    D.paper(g, CARD.x, CARD.y, CARD.w, CARD.h);
    D.glasses(g, CARD.x + CARD.w / 2, CARD.y + 12, 9);
    N.sun(g, CARD.x + 16, E.y, 9, E.x, E.r, st.clock);
    N.earth(g, E.x, E.y, E.r, spin, [{ place: S.SYDNEY, color: '#e4534a' }], st.clock);
    N.arrow(g, E.x, E.y, E.r + 8, -1.1, -0.3);
    if (!st.touched && !BQ.calm()) {
      var a = -1.0 + ((st.clock * 0.5) % 1) * 0.65;
      g.fillStyle = 'rgba(59,58,54,.28)'; g.beginPath();
      g.arc(E.x + (E.r - 12) * Math.cos(a), E.y + (E.r - 12) * Math.sin(a), 9, 0, 6.283); g.fill();
    }
  }

  function reset() { if (!st) return; sim.reset(); st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = sim = spinner = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.shadow = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, state: function () { return st; },
    spots: { earth: E, who: WHO } };
})(window);
