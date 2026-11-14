/* Moment — the paper roll.
 * A timeline that does NOT zoom. One sheet is as long as her whole life. She pulls the paper
 * to go back in time: eight sheets to Dad as a baby, about nineteen to the new Harbour Bridge,
 * and the whole roll to reach castles. Feeling how far that is, is why the big timeline zooms.
 * Flick to send the paper flying; pull the other way to wind back.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.longAgoSim, P = BQ.longAgoPics, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, SW = 56, NOW_X = 436, ROLL_X = 46, TOP = 168, BOT = 232;
  var MARKS = [{ key: 'baby', n: 1 }, { key: 'dad', n: S.sheets(40) }, { key: 'bridge', n: S.sheets(94) }, { key: 'castle', n: S.sheets(950) }];
  var END = 0;                                             // set below: how far the paper can be pulled
  var ZONES = [
    { from: 0, say: 'Each sheet is as long as your whole life. Pull the paper!' },
    { from: 3, say: 'Dad was a baby here. Keep pulling!' },
    { from: 14, say: 'The Harbour Bridge was brand new. Castles are much further.' },
    { from: 60, say: 'Still pulling... castles are a long, long way back.' },
    { from: 130, say: 'Nearly there. Can you see the roll getting thin?' },
    { from: -1, say: 'A whole roll to reach castles! Dinosaurs would need a truck full of rolls.' }
  ];

  var frame, surf, loop, off, st;

  END = S.sheets(950) - (NOW_X - 240) / SW;                 // pulled this far, the castle sits at x = 240
  ZONES[5].from = END - 2.5;

  function fresh() { return { s: 0, v: 0, drag: null, zone: -1, hop: {}, ticked: 0, clock: 0 }; }
  function xOf(n) { return NOW_X + (st.s - n) * SW; }
  function zoneOf(s) { var z = 0; for (var i = 0; i < ZONES.length; i++) if (s >= ZONES[i].from) z = i; return z; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { st.drag = { x: q.x, s: st.s, lastX: q.x, lastT: performance.now(), v: 0 }; st.v = 0; },
      move: function (q) {
        var d = st.drag; if (!d) return;
        st.s = clamp(d.s + (q.x - d.x) / (surf.k * SW));
        var now = performance.now(), dt = Math.max(0.008, (now - d.lastT) / 1000);
        d.v = 0.6 * d.v + 0.4 * ((q.x - d.lastX) / (surf.k * SW)) / dt; d.lastX = q.x; d.lastT = now;
      },
      up: function () {
        var d = st.drag; if (!d) return;
        st.drag = null;
        if (performance.now() - d.lastT < 120) st.v = Math.max(-70, Math.min(70, d.v));   // a flick keeps going
      },
      tap: function (q) {
        var p = surf.toView(q);
        MARKS.concat([{ key: 'kid', n: 0 }]).forEach(function (m) {
          if (Math.hypot(p.x - xOf(m.n), p.y - (TOP - 34)) < 38) { st.hop[m.key] = 1; BQ.sound.squeak(); }
        });
      }
    });
    loop = BQ.loop(tick);
  }
  function clamp(s) { return s < 0 ? 0 : s > END ? END : s; }

  function tick(dt) {
    st.clock += dt;
    if (!st.drag && st.v) {
      st.s += st.v * dt; st.v *= Math.exp(-1.1 * dt);
      if (st.s <= 0 || st.s >= END) { st.s = clamp(st.s); st.v = 0; }
      if (Math.abs(st.v) < 0.15) st.v = 0;
    }
    var passed = Math.floor(st.s / 3);                       // a soft tick as sheets go by
    if (passed !== st.ticked) { st.ticked = passed; BQ.sound.click(); }
    Object.keys(st.hop).forEach(function (k) { st.hop[k] = Math.max(0, st.hop[k] - dt * 2.4); });
    var z = zoneOf(st.s);
    if (z !== st.zone) { st.zone = z; frame.caption(ZONES[z].say); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k, calm = BQ.calm();
    g.fillStyle = '#e9e2d3'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();           // bathroom wall, tiles
    g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = 2;
    for (k = 1; k < 9; k++) { g.beginPath(); g.moveTo(4 + k * 54, 4); g.lineTo(4 + k * 54, 250); g.stroke(); }
    for (k = 1; k < 5; k++) { g.beginPath(); g.moveTo(4, 4 + k * 54); g.lineTo(VW - 4, 4 + k * 54); g.stroke(); }
    g.fillStyle = '#c9b79a'; g.fillRect(4, 252, VW - 8, VH - 256);

    // at the very end: what it would take to go further
    var end = Math.max(0, Math.min(1, (st.s - (END - 6)) / 5));
    if (end > 0) {
      g.globalAlpha = end;
      g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
      D.round(g, 280, 14, 188, 62, 10); g.fill(); g.stroke();
      P.pic(g, 'pyramid', 304, 44, 17, 0);
      for (k = 0; k < 5; k++) P.roll(g, 340 + k * 26, 46, 11, 5);
      D.round(g, 280, 84, 188, 62, 10); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = INK.line; g.lineWidth = 3; g.stroke();
      P.pic(g, 'dino', 306, 116, 17, 0);
      g.fillStyle = '#6fb6d9'; D.round(g, 338, 98, 86, 34, 5); g.fill(); g.stroke();                         // a truck full
      g.fillStyle = '#f5b942'; D.round(g, 426, 108, 30, 24, 5); g.fill(); g.stroke();
      g.fillStyle = INK.line; [352, 408, 442].forEach(function (wx) { g.beginPath(); g.arc(wx, 134, 6, 0, 6.283); g.fill(); });
      for (k = 0; k < 8; k++) P.roll(g, 349 + (k % 4) * 21, 107 + Math.floor(k / 4) * 16, 7, 3);
      g.globalAlpha = 1;
    }

    // the paper: one long strip from the roll, sliding to the right as she pulls
    var left = ROLL_X, right = Math.min(VW + 20, xOf(0) + 8);
    g.fillStyle = '#fff'; g.fillRect(left, TOP, right - left, BOT - TOP);
    g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(left, TOP); g.lineTo(right, TOP); g.moveTo(left, BOT); g.lineTo(right, BOT); g.stroke();
    if (right < VW + 20) { g.beginPath(); g.moveTo(right, TOP); g.lineTo(right, BOT); g.stroke(); }
    var n0 = Math.max(0, Math.ceil(st.s - (VW + 20 - NOW_X) / SW)), n1 = Math.floor(st.s + (NOW_X - left) / SW);
    for (k = n0; k <= n1; k++) {
      var x = xOf(k);
      if (x < left + 4) continue;
      if (k === 0) {                                           // her own sheet, pink like her bit of the timeline
        g.fillStyle = 'rgba(242,120,143,.38)'; g.fillRect(Math.max(left, x - SW), TOP + 2, Math.min(SW, x - left), BOT - TOP - 4);
      }
      if (k > 0) {                                             // perforations between sheets
        g.setLineDash([3, 5]); g.strokeStyle = 'rgba(59,58,54,.4)'; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x, TOP + 3); g.lineTo(x, BOT - 3); g.stroke(); g.setLineDash([]);
      }
      g.fillStyle = 'rgba(159,199,234,.35)';                    // a little quilted pattern on every sheet
      for (var d = 0; d < 3; d++) { g.beginPath(); g.arc(x - SW / 2 + (d - 1) * 14, (TOP + BOT) / 2 + (d % 2 ? 8 : -8), 3, 0, 6.283); g.fill(); }
    }

    // landmarks stand on the paper where they happened
    MARKS.forEach(function (m) {
      var mx = xOf(m.n);
      if (mx < left - 30 || mx > VW + 30) return;
      var hop = Math.sin((st.hop[m.key] || 0) * Math.PI) * 16;
      g.strokeStyle = INK.line; g.lineWidth = 2; g.beginPath(); g.moveTo(mx, TOP); g.lineTo(mx, TOP - 10); g.stroke();
      P.pic(g, m.key, mx, TOP - 36 - hop, 24, calm ? 0 : st.clock);
    });
    var kx = xOf(0);
    if (kx < VW + 40) P.kid(g, kx + 2, TOP - Math.sin((st.hop.kid || 0) * Math.PI) * 16, 78, 5, st.clock, st.hop.kid > 0 || (st.s < 0.5 && !calm && st.clock % 4 < 1.2));

    // the roll itself, thinner the more she has pulled
    var r = 15 + 30 * Math.sqrt(Math.max(0, 1 - st.s / END));
    P.roll(g, ROLL_X, (TOP + BOT) / 2, r, 15);
  }

  function reset() { if (!st) return; st = fresh(); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.roll = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    spots: { end: function () { return END; }, xOf: function (n) { return xOf(n); }, sw: SW, vw: VW, vh: VH, pad: 12 } };
})(window);
