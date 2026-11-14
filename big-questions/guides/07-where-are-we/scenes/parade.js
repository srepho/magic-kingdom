/* Moment — the planet parade.
 * The eight planets in order from the Sun, drawn at their true sizes compared with each other
 * (and the edge of the Sun, also true size). The gaps between them are NOT true: see notes.md.
 * Drag sideways to travel out from the Sun. Tap a planet and it bounces.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.whereSim, A = BQ.atlas, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, MID = 158, EARTH_R = 7;
  var XS = [150, 215, 290, 362, 530, 790, 1010, 1130], WIDE = 1230, SUN_EDGE = 96;

  var frame, surf, loop, off, st;

  function fresh() { return { cam: 0, v: 0, drag: null, hop: [0, 0, 0, 0, 0, 0, 0, 0], clock: 0, told: false }; }
  function radius(i) { return S.PLANETS[i].size * EARTH_R; }
  function maxCam() { return WIDE - VW; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); st.drag = { x: p.x, t: st.clock }; st.v = 0; },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q), dx = p.x - st.drag.x, dt = Math.max(0.016, st.clock - st.drag.t);
        st.cam = Math.max(0, Math.min(maxCam(), st.cam - dx));
        st.v = st.v * 0.5 + (-dx / dt) * 0.5;
        st.drag = { x: p.x, t: st.clock };
      },
      up: function () { st.drag = null; st.v = Math.max(-900, Math.min(900, st.v)); },
      tap: function (q) {
        var p = surf.toView(q), wx = p.x + st.cam;
        for (var i = 0; i < 8; i++) {
          if (Math.hypot(wx - XS[i], p.y - MID) < Math.max(30, radius(i) + 8)) { st.hop[i] = 1; BQ.sound.squeak(); return; }
        }
      }
    });
    frame.caption('Eight <b>planets</b> go around the Sun. Earth is number three.');
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    if (!st.drag && st.v) {
      st.cam += st.v * dt; st.v *= Math.exp(-dt * 2.2);
      if (st.cam <= 0 || st.cam >= maxCam() || Math.abs(st.v) < 4) st.v = 0;
      st.cam = Math.max(0, Math.min(maxCam(), st.cam));
    }
    for (var i = 0; i < 8; i++) st.hop[i] = Math.max(0, st.hop[i] - dt * 1.8);
    if (!st.told && st.cam > 330) {
      st.told = true;
      frame.caption('Jupiter is the biggest planet. Earth could fit across it eleven times.');
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i;
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    A.sky(g, 0, 0, VW, VH, 9, 80, st.clock);
    g.translate(-st.cam, 0);
    // the Sun: only its edge fits
    var sr = S.SUN_SIZE * EARTH_R, sx = SUN_EDGE - sr;
    var glow = g.createRadialGradient(sx, MID, sr, sx, MID, sr + 40);
    glow.addColorStop(0, 'rgba(255,210,63,.5)'); glow.addColorStop(1, 'rgba(255,210,63,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(sx, MID, sr + 40, 0, 6.283); g.fill();
    g.fillStyle = INK.sun; g.beginPath(); g.arc(sx, MID, sr, 0, 6.283); g.fill();
    // a faint line to travel along
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.setLineDash([4, 10]);
    g.beginPath(); g.moveTo(SUN_EDGE, MID); g.lineTo(WIDE, MID); g.stroke(); g.setLineDash([]);
    for (i = 0; i < 8; i++) {
      var r = radius(i), y = MID - Math.sin(st.hop[i] * Math.PI) * 26;
      if (XS[i] + r * 2.2 < st.cam || XS[i] - r * 2.2 > st.cam + VW) continue;
      A.planet(g, i, XS[i], y, r);
      if (i === 2) A.pin(g, XS[i] + r * 0.35, y + r * 0.3, 2.2, st.clock, 1);
      // a little flag above home's planet
    }
    g.strokeStyle = '#e4534a'; g.lineWidth = 2;                 // "we are here" marker over Earth
    g.beginPath(); g.moveTo(XS[2], MID - 20); g.lineTo(XS[2], MID - 44); g.stroke();
    g.fillStyle = '#e4534a'; g.beginPath(); g.moveTo(XS[2], MID - 44); g.lineTo(XS[2] + 16, MID - 38); g.lineTo(XS[2], MID - 32); g.closePath(); g.fill();
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption('Eight <b>planets</b> go around the Sun. Earth is number three.'); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.parade = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    spots: { xs: XS, mid: MID, radius: radius, maxCam: maxCam } };
})(window);
