/* Moment — when the sea was low.
 * The same map. Slide from the ice age (a snowflake) to today (a sun): when the sea was low,
 * Australia was joined to Tasmania and New Guinea by dry land. As the ice melted the sea rose
 * and they became islands. The patchwork of Countries is there the whole time: people lived
 * through all of it.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink, S = BQ.storySim, M = BQ.ausmap;
  var VW = 480, VH = 300, MS = 0.9, MX = 118, MY = 8;
  var STRIP = { x0: 70, x1: 410, y: 272 }, ICE = 20000;
  var SAY = { low: 'When the sea was low, people could walk to Tasmania and New Guinea.',
              rise: 'Then the ice melted. Slowly, the sea came up.',
              now: 'This is the coast today. People were here the whole time.' };

  var frame, surf, loop, off, st;

  function fresh() { return { u: 0, drag: false, clock: 0, said: '' }; }
  function ago() { return ICE * (1 - st.u); }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.y > STRIP.y - 32) { st.drag = true; slide(p); } },
      move: function (q) { if (st.drag) slide(surf.toView(q)); },
      up: function () { st.drag = false; }
    });
    loop = BQ.loop(tick);
  }
  function slide(p) { st.u = Math.max(0, Math.min(1, (p.x - STRIP.x0) / (STRIP.x1 - STRIP.x0))); }
  function tick(dt) {
    st.clock += dt;
    var low = S.lowSea(ago()), key = low > 0.8 ? 'low' : low > 0.02 ? 'rise' : 'now';
    if (key !== st.said) { st.said = key; frame.caption(SAY[key]); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm(), low = S.lowSea(ago()), k;
    g.fillStyle = '#cfe6f2'; D.round(g, 4, 4, VW - 8, 236, 14); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, 236, 14); g.clip();
    g.translate(MX, MY); g.scale(MS, MS);
    M.draw(g, { low: low, year: null, clock: st.clock });
    g.restore();

    var x0 = STRIP.x0, x1 = STRIP.x1, y = STRIP.y;
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, x0 - 12, y - 12, x1 - x0 + 24, 24, 12); g.fill(); g.stroke();
    g.strokeStyle = '#5aa9dc'; g.lineWidth = 2.5;                                 // ice age end: a snowflake
    for (k = 0; k < 3; k++) { var a = k * Math.PI / 3; g.beginPath(); g.moveTo(x0 - 34 - Math.cos(a) * 11, y - Math.sin(a) * 11); g.lineTo(x0 - 34 + Math.cos(a) * 11, y + Math.sin(a) * 11); g.stroke(); }
    g.fillStyle = INK.sun; g.strokeStyle = '#a66a00'; g.lineWidth = 2.5;          // today end: a sun
    g.beginPath(); g.arc(x1 + 36, y, 9, 0, 6.283); g.fill(); g.stroke();
    for (k = 0; k < 8; k++) { var b = k * Math.PI / 4; g.beginPath(); g.moveTo(x1 + 36 + Math.cos(b) * 12, y + Math.sin(b) * 12); g.lineTo(x1 + 36 + Math.cos(b) * 16, y + Math.sin(b) * 16); g.stroke(); }
    var hx = x0 + st.u * (x1 - x0), pulse = (!calm && st.u === 0 && !st.drag) ? 1 + 0.08 * Math.sin(st.clock * 6) : 1;
    g.fillStyle = INK.water; g.strokeStyle = INK.waterDeep; g.lineWidth = 4;
    g.beginPath(); g.arc(hx, y, 21 * pulse, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(hx - 9, y + 2); g.quadraticCurveTo(hx - 4, y - 6, hx, y + 2); g.quadraticCurveTo(hx + 4, y + 10, hx + 9, y + 2); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.sea = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: { strip: STRIP } };
})(window);
