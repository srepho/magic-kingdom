/* Centrepiece — a timeline with two scales, over a map of Australia.
 * Long view: the strip is 65,000 years. Slide along it: the map is a patchwork of many
 * Countries the whole way. Right at the end is a hair-thin red line: everything since 1788.
 * Tap the line (or the stretch button): the strip stretches until that line fills it.
 * Close view: a Dutch ship calls and leaves; boats from Makassar come each year and go home;
 * then British ships come and stay, and colonisation spreads. The patchwork pales but never
 * goes. Today some colour is back, and the First peoples are still here.
 *
 * The part after 1788 is shown plainly: no sounds, no silly reactions, nothing to play with.
 * Facts and maths live in story-sim.js.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink, S = BQ.storySim, M = BQ.ausmap;
  var VW = 480, VH = 300, MS = 0.9, MX = 118, MY = 8;
  var STRIP = { x0: 44, x1: 400, y: 272 }, BTN = { x: 446, y: 272 };

  var frame, surf, loop, off, st;

  function fresh() { return { ago: S.LONG, z: 0, zGoal: 0, drag: false, glow: {}, clock: 0, said: '' }; }
  function sx(ago) { return STRIP.x0 + S.place(ago, st.z) * (STRIP.x1 - STRIP.x0); }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.y > STRIP.y - 30 && p.x < STRIP.x1 + 16) { st.drag = true; slide(p); } },
      move: function (q) { if (st.drag) slide(surf.toView(q)); },
      up: function () { st.drag = false; },
      tap: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - BTN.x, p.y - BTN.y) < 34) { zoom(); return; }
        if (st.z < 0.5 && p.y > STRIP.y - 30 && p.x > STRIP.x1 - 22) { zoom(); return; }   // the thin red line
        if (st.z < 0.5 && p.y < STRIP.y - 34) {                // long view only: a Country lights up under her finger
          var mx = (p.x - MX) / MS, my = (p.y - MY) / MS, best = -1, bd = 12;
          S.TILES.forEach(function (t, i) { var d = Math.hypot(S.px(t.lon) - mx, S.py(t.lat) - my); if (d < bd) { bd = d; best = i; } });
          if (best >= 0) { st.glow[best] = 1; BQ.sound.click(); }
        }
      }
    });
    loop = BQ.loop(tick);
  }
  function slide(p) { st.ago = S.agoAt((p.x - STRIP.x0) / (STRIP.x1 - STRIP.x0), st.z); }
  function zoom() {
    st.zGoal = st.zGoal > 0.5 ? 0 : 1;
    if (st.zGoal === 1 && st.ago > S.CLOSE) st.ago = S.CLOSE;   // start the close view at its far-past end
  }

  function tick(dt) {
    st.clock += dt;
    if (st.z !== st.zGoal) {
      var d = st.zGoal - st.z, step = dt * 0.9;
      st.z = Math.abs(d) <= step ? st.zGoal : st.z + Math.sign(d) * step;
    }
    st.ago = Math.min(st.ago, S.span(st.z));
    Object.keys(st.glow).forEach(function (k) { st.glow[k] -= dt * 0.8; if (st.glow[k] <= 0) delete st.glow[k]; });
    var key = S.moment(st.ago, st.z < 0.5 ? 0 : 1);
    if (key !== st.said && st.z === st.zGoal) { st.said = key; frame.caption(S.SAY[key]); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm(), close = st.z >= 0.5, y = S.year(st.ago), who = S.ships(y), k;
    g.fillStyle = '#cfe6f2'; D.round(g, 4, 4, VW - 8, 236, 14); g.fill();

    g.save(); D.round(g, 4, 4, VW - 8, 236, 14); g.clip();
    g.translate(MX, MY); g.scale(MS, MS);
    M.draw(g, { low: close ? 0 : S.lowSea(st.ago), year: st.ago <= S.CLOSE ? y : null, glow: st.glow, clock: st.clock });
    if (close) {                                              // who is on the water
      var t = calm ? 0 : st.clock;
      M.boat(g, S.px(S.SPOTS.dutch[0]) - 16 + (y - S.DUTCH) * 3, S.py(S.SPOTS.dutch[1]), 'ship', t, who.dutch ? 1 : 0);
      S.SPOTS.boats.forEach(function (b, i) {
        var show = who.boats ? Math.min(1, (y - S.BOATS[0]) / 6, (S.BOATS[1] - y) / 6 + 0.01) : 0;
        M.boat(g, S.px(b[0]), S.py(b[1]) - 6 - (calm ? 0 : Math.sin(st.clock * 0.7 + i * 2) * 3), 'prau', t, show);
      });
      for (k = 0; k < 3; k++) M.boat(g, S.px(S.SPOTS.fleet[0]) + 6 + k * 13, S.py(S.SPOTS.fleet[1]) + k * 6 - 6, 'ship', t, who.british ? 1 : 0);
    }
    g.restore();

    // the strip: far past on the left, today on the right
    var x0 = STRIP.x0, x1 = STRIP.x1, yy = STRIP.y;
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, x0 - 12, yy - 12, x1 - x0 + 24, 24, 12); g.fill(); g.stroke();
    g.save(); D.round(g, x0 - 10, yy - 10, x1 - x0 + 20, 20, 10); g.clip();
    g.fillStyle = '#f2c48d'; g.fillRect(x0 - 12, yy - 12, x1 - x0 + 24, 24);            // the First peoples' time: the whole strip
    var bx = sx(S.NOW - S.BOATS[0]), bx2 = sx(S.NOW - S.BOATS[1]);
    if (close) { g.fillStyle = 'rgba(95,185,138,.75)'; g.fillRect(bx, yy + 2, bx2 - bx, 8); }   // the years the Makassan boats came
    var rx = sx(S.NOW - S.BRITISH);
    g.fillStyle = '#d9534a'; g.fillRect(rx, yy - 12, Math.max(1.6, x1 + 12 - rx), close ? 10 : 24);  // since 1788
    if (close) { g.fillStyle = INK.line; g.fillRect(sx(S.NOW - S.DUTCH) - 1.5, yy - 12, 3, 24); }
    g.restore();
    g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, x0 - 12, yy - 12, x1 - x0 + 24, 24, 12); g.stroke();
    D.star(g, x1 + 14, yy - 22, 7);                                                      // today
    if (!close && st.ago <= S.CLOSE * 4 && !calm) {                                      // point at the thin red line
      var bob = Math.sin(st.clock * 6) * 3;
      g.fillStyle = '#d9534a'; g.beginPath(); g.moveTo(x1, yy - 16 + bob); g.lineTo(x1 - 7, yy - 28 + bob); g.lineTo(x1 + 7, yy - 28 + bob); g.closePath(); g.fill();
    }
    var hx = sx(st.ago), pulse = (!calm && st.ago === S.LONG && !st.drag) ? 1 + 0.08 * Math.sin(st.clock * 6) : 1;
    g.fillStyle = INK.sun; g.strokeStyle = '#a66a00'; g.lineWidth = 4;
    g.beginPath(); g.arc(hx, yy, 20 * pulse, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(hx - 3, yy - 7); g.lineTo(hx + 5, yy); g.lineTo(hx - 3, yy + 7); g.stroke();

    // the stretch button: a short bar pulled long, or a long bar let go
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.arc(BTN.x, BTN.y, 24, 0, 6.283); g.fill(); g.stroke();
    var w = close ? 5 : 15;
    g.fillStyle = '#d9534a'; D.round(g, BTN.x - w, BTN.y - 5, w * 2, 10, 3); g.fill();
    g.lineWidth = 2.5; g.beginPath();
    if (close) { g.moveTo(BTN.x - 17, BTN.y); g.lineTo(BTN.x - 9, BTN.y); g.lineTo(BTN.x - 13, BTN.y - 4); g.moveTo(BTN.x - 9, BTN.y); g.lineTo(BTN.x - 13, BTN.y + 4);
                 g.moveTo(BTN.x + 17, BTN.y); g.lineTo(BTN.x + 9, BTN.y); g.lineTo(BTN.x + 13, BTN.y - 4); g.moveTo(BTN.x + 9, BTN.y); g.lineTo(BTN.x + 13, BTN.y + 4); }
    g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.story = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    spots: { strip: STRIP, btn: BTN, at: function (ago) { return { x: sx(ago), y: STRIP.y }; },
             tile: function (i) { var t = S.TILES[i]; return { x: MX + S.px(t.lon) * MS, y: MY + S.py(t.lat) * MS }; } } };
})(window);
