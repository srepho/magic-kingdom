/* Centrepiece — the journey.
 * A food sits at home on the right. She slides it back along the road, past the shop, the
 * truck and the place it was made, to the farm where it began as a plant or an animal.
 * At each stop it turns into what it really is there. She can slide it forward again, tap a
 * stop to send it there, or tap another food on the tray. Rules live in food-sim.js.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, A = BQ.foodArt, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, X0 = 52, X1 = 428, GY = 172, TY = 200, TRAY = 262;
  var BUB = { x: 240, y: 56, r: 44 };

  var frame, surf, loop, off, sim, st;

  function fresh() { return { scrub: false, touched: false, last: -1, lastFood: '', pop: 0, clock: 0 }; }
  function tOf(x) { return (x - X0) / (X1 - X0); }
  function xOf(t) { return X0 + (X1 - X0) * t; }
  function stopX(i) { return xOf(i / (sim.count() - 1)); }
  function trayX(i) { return 120 + i * 60; }

  function start(stage, api) {
    frame = api; sim = BQ.foodSim.create(); st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (Math.abs(p.y - TY) < 30 || Math.hypot(p.x - xOf(sim.state.t), p.y - TY) < 44) {
          st.scrub = true; st.touched = true; sim.hold(tOf(p.x));
        }
      },
      move: function (q) { if (st.scrub) sim.hold(tOf(surf.toView(q).x)); },
      up: function () { if (st.scrub) { st.scrub = false; sim.release(); } },
      tap: function (q) {
        var p = surf.toView(q), i;
        if (p.y > TRAY - 30) {
          for (i = 0; i < BQ.foodSim.ORDER.length; i++) {
            if (Math.abs(p.x - trayX(i)) < 30) { sim.choose(BQ.foodSim.ORDER[i]); BQ.sound.plop(); return; }
          }
          return;
        }
        if (p.y < GY + 6 && p.y > GY - 76) {
          for (i = 0; i < sim.count(); i++) {
            if (Math.abs(p.x - stopX(i)) < 34) { st.touched = true; sim.goTo(i); return; }
          }
        }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; sim.tick(dt);
    st.pop = Math.max(0, st.pop - dt * 3);
    var i = sim.index();
    if (i !== st.last || sim.state.food !== st.lastFood) {
      var first = st.last < 0;
      st.last = i; st.lastFood = sim.state.food; st.pop = 1;
      frame.caption(sim.here().say);
      if (!first) { if (i === 0) BQ.sound.squeak(); else BQ.sound.click(); }
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), s = sim.state, stops = sim.stops(), n = stops.length, cur = sim.index(), i, calm = BQ.calm();
    // sky, paddocks on the farm side fading to town on the home side
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = '#fff';
    var drift = calm ? 120 : (st.clock * 4) % 560;
    g.beginPath(); g.ellipse(-40 + drift, 30, 34, 10, 0, 0, 6.283); g.fill();
    g.beginPath(); g.ellipse(((drift + 280) % 560) - 40, 100, 26, 8, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(0, 150, VW, 150);
    g.fillStyle = '#a5cf92'; g.fillRect(0, 150, VW, 5);
    g.fillStyle = '#efe7d6'; g.fillRect(0, 232, VW, 70);                       // the table the tray sits on
    // the road
    g.fillStyle = '#b4afa6'; g.fillRect(0, TY - 15, VW, 30);
    g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.setLineDash([10, 10]);
    g.beginPath(); g.moveTo(8, TY); g.lineTo(VW - 8, TY); g.stroke(); g.setLineDash([]);
    g.restore();

    // the places along the way; the one the food is at stands tall
    for (i = 0; i < n; i++) {
      var here = i === cur;
      g.globalAlpha = here ? 1 : 0.55;
      A.place(g, stops[i].at, stopX(i), GY, here ? 1.12 + 0.1 * st.pop : 0.95, { cold: stops[i].cold, live: here, t: st.clock });
      g.globalAlpha = 1;
    }

    // what the food is, here: shown large
    var f = stops[cur].form, tx = xOf(s.t), k = 1 + 0.18 * st.pop;
    g.setLineDash([2, 6]); g.strokeStyle = 'rgba(59,58,54,.4)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(tx, TY - 24); g.quadraticCurveTo(tx, BUB.y + BUB.r + 30, BUB.x + (tx - BUB.x) * 0.25, BUB.y + BUB.r); g.stroke();
    g.setLineDash([]);
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3.5;
    g.beginPath(); g.arc(BUB.x, BUB.y, BUB.r * k, 0, 6.283); g.fill(); g.stroke();
    A.form(g, f, BUB.x, BUB.y + (f === 'potato' ? -4 : 0), 27 * k);

    // the token she slides
    if (!st.touched && !calm) {                                                 // an invitation: this way
      g.strokeStyle = INK.bit; g.lineWidth = 4;
      for (i = 0; i < 3; i++) {
        var ph = (st.clock * 1.2 + i * 0.25) % 1, ax = tx - 34 - i * 16 - ph * 8;
        g.globalAlpha = 0.25 + 0.6 * (1 - i / 3);
        g.beginPath(); g.moveTo(ax + 7, TY - 9); g.lineTo(ax, TY); g.lineTo(ax + 7, TY + 9); g.stroke();
      }
      g.globalAlpha = 1;
    }
    var wig = (!st.touched && !calm) ? Math.sin(st.clock * 5) * 3 : 0;
    g.fillStyle = '#fff'; g.strokeStyle = st.scrub ? INK.bit : INK.line; g.lineWidth = 3.5;
    g.beginPath(); g.arc(tx + wig, TY, 22, 0, 6.283); g.fill(); g.stroke();
    A.form(g, f, tx + wig, TY + (f === 'potato' ? -3 : 0), 13);

    // the tray of foods
    for (i = 0; i < BQ.foodSim.ORDER.length; i++) {
      var name = BQ.foodSim.ORDER[i], js = BQ.foodSim.JOURNEYS[name].stops, on = name === s.food;
      g.fillStyle = '#fff'; g.strokeStyle = on ? INK.bit : INK.line; g.lineWidth = on ? 5 : 3;
      g.beginPath(); g.arc(trayX(i), TRAY, 23, 0, 6.283); g.fill(); g.stroke();
      A.form(g, js[js.length - 1].form, trayX(i), TRAY, 14);
    }
  }

  function reset() { if (!st) return; sim.reset(); st = fresh(); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = sim = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.journey = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, state: function () { return st; },
    spots: { xOf: xOf, stopX: stopX, trayX: trayX, roadY: TY, groundY: GY, trayY: TRAY, VW: VW, VH: VH } };
})(window);
