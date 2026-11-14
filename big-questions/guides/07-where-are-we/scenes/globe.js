/* Moment — spin the Earth.
 * Earth is a ball. Drag it and it turns under her finger; let go while moving and it keeps
 * turning for a bit. Australia comes round, with the red home dot on its east coast.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.whereSim, A = BQ.atlas, D = BQ.draw;
  var VW = 400, VH = 300, CX = 200, CY = 150, R = 124;

  var frame, surf, loop, off, st;

  function fresh() { return { lon: 62, lat: -8, vlon: 0, drag: null, clock: 0, told: false }; }
  function home() { return S.project(S.SYDNEY.lon, S.SYDNEY.lat, st.lon, st.lat); }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); st.drag = { x: p.x, y: p.y, t: st.clock }; st.vlon = 0; },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q), dlon = -(p.x - st.drag.x) / R * 57.3, dt = Math.max(0.016, st.clock - st.drag.t);
        st.lon += dlon;
        st.lat = Math.max(-60, Math.min(60, st.lat + (p.y - st.drag.y) / R * 57.3));
        st.vlon = st.vlon * 0.5 + (dlon / dt) * 0.5;
        st.drag = { x: p.x, y: p.y, t: st.clock };
      },
      up: function () { st.drag = null; st.vlon = Math.max(-240, Math.min(240, st.vlon)); }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    if (!st.drag && st.vlon) {                               // it coasts to a stop after a flick
      st.lon += st.vlon * dt; st.vlon *= Math.exp(-dt * 2.4);
      if (Math.abs(st.vlon) < 1) st.vlon = 0;
    }
    st.lon = ((st.lon + 180) % 360 + 360) % 360 - 180;
    var h = home();
    if (!st.told && h.z > 0.8) {
      st.told = true;
      frame.caption('Earth is a ball. Australia is one piece of land on it.');
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH);
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    A.sky(g, 0, 0, VW, VH, 31, 70, st.clock);
    A.globe(g, CX, CY, R, st.lon, st.lat);
    g.save(); g.beginPath(); g.arc(CX, CY, R, 0, 6.283); g.clip();      // a soft shine, so it reads as a ball
    var shine = g.createRadialGradient(CX - R * 0.4, CY - R * 0.45, R * 0.1, CX, CY, R * 1.05);
    shine.addColorStop(0, 'rgba(255,255,255,.28)'); shine.addColorStop(0.6, 'rgba(255,255,255,0)'); shine.addColorStop(1, 'rgba(20,30,70,.3)');
    g.fillStyle = shine; g.fillRect(CX - R, CY - R, 2 * R, 2 * R);
    g.restore();
    var h = home();
    if (h.z > 0) A.pin(g, CX + R * h.x, CY + R * h.y, 5, st.clock, Math.min(1, h.z * 4));
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.globe = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, home: home,
    spot: { x: CX, y: CY, r: R } };
})(window);
