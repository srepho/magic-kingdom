/* Moment — the sandwich.
 * Tap a layer and it slides out, and beside it appears the plant or animal it started as.
 * Tap it again and it slides back. One sandwich comes from several farms.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, A = BQ.foodArt, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, CX = 200, SLIDE = 62, HALF = 62;
  var LAYERS = [
    { kind: 'bread', y: 82, from: 'wheat', say: 'Bread is made from wheat, a plant.' },
    { kind: 'lettuce', y: 116, from: 'lettuceplant', say: 'Lettuce is a plant. You eat its leaves.' },
    { kind: 'tomato', y: 146, from: 'tomatoplant', say: 'Tomatoes grow on a tomato plant.' },
    { kind: 'cheese', y: 176, from: 'cow', say: 'Cheese is made from milk, and milk comes from cows.' },
    { kind: 'bread', y: 210, from: 'wheat', say: 'Bread is made from wheat, a plant.' }
  ];

  var frame, surf, loop, off, st;

  function fresh() { return { want: [0, 0, 0, 0, 0], out: [0, 0, 0, 0, 0], wob: 0, clock: 0, opened: 0 }; }
  function side(i) { return i % 2 ? 1 : -1; }
  function layerX(i) { return CX + side(i) * SLIDE * st.out[i]; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q), best = -1, bd = 20;
        for (var i = 0; i < LAYERS.length; i++) {
          var d = Math.abs(p.y - LAYERS[i].y);
          if (d < bd && Math.abs(p.x - layerX(i)) < HALF + 22) { bd = d; best = i; }
        }
        if (best < 0) { if (p.y > 226) { st.wob = 1; BQ.sound.click(); } return; }
        st.want[best] = st.want[best] ? 0 : 1;
        if (st.want[best]) { st.opened++; frame.caption(LAYERS[best].say); BQ.sound.whoosh(); } else BQ.sound.click();
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; st.wob = Math.max(0, st.wob - dt * 2);
    for (var i = 0; i < LAYERS.length; i++) st.out[i] += (st.want[i] - st.out[i]) * Math.min(1, 9 * dt);
    draw();
  }

  function layer(g, kind, x, y) {
    g.strokeStyle = INK.line; g.lineWidth = 3; g.lineJoin = 'round';
    if (kind === 'bread') {
      g.strokeStyle = '#a8703a'; g.lineWidth = 4;
      D.round(g, x - HALF, y - 13, 2 * HALF, 26, 10); g.fillStyle = '#e9c489'; g.fill(); g.stroke();
    } else if (kind === 'lettuce') {
      g.strokeStyle = '#5da24c'; g.fillStyle = '#9bd97f'; g.beginPath(); g.moveTo(x - HALF - 6, y);
      for (var k = 0; k < 8; k++) g.quadraticCurveTo(x - HALF + 2 + k * 17, y - (k % 2 ? 13 : 5), x - HALF + 11 + k * 17, y);
      for (k = 7; k >= 0; k--) g.quadraticCurveTo(x - HALF + 2 + k * 17, y + (k % 2 ? 5 : 12), x - HALF - 6 + k * 17, y);
      g.closePath(); g.fill(); g.stroke();
    } else if (kind === 'tomato') {
      for (var t = -1; t <= 1; t++) { g.fillStyle = '#e4534a'; g.beginPath(); g.ellipse(x + t * 38, y, 20, 8, 0, 0, 6.283); g.fill(); g.stroke(); }
    } else { D.round(g, x - HALF - 4, y - 6, 2 * HALF + 8, 12, 4); g.fillStyle = '#ffd23f'; g.fill(); g.stroke(); }
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, calm = BQ.calm();
    g.fillStyle = '#efe7d6'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = 'rgba(111,182,217,.25)';
    for (i = 0; i < 9; i++) g.fillRect(4 + i * 46, 4, 20, VH - 8);
    // plate
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.ellipse(CX, 244, 120, 24, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(59,58,54,.2)'; g.beginPath(); g.ellipse(CX, 244, 86, 15, 0, 0, 6.283); g.stroke();

    for (i = LAYERS.length - 1; i >= 0; i--) {
      var L = LAYERS[i], x = layerX(i), o = st.out[i], s = side(i);
      var hint = (!st.opened && !calm && (st.clock + i * 0.5) % 3 < 0.4) ? Math.sin(st.clock * 22) * 3 : 0;
      var wob = Math.sin(st.clock * 18 + i) * 4 * st.wob;
      if (o > 0.05) {                                    // where it came from, out at the edge
        var ox = CX + s * 164, pop = Math.min(1, o * 1.4);
        g.setLineDash([3, 6]); g.strokeStyle = 'rgba(59,58,54,.45)'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(x + s * (HALF + 8), L.y); g.lineTo(ox - s * 26, L.y); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
        g.beginPath(); g.arc(ox, L.y, 25 * pop, 0, 6.283); g.fill(); g.stroke();
        A.form(g, L.from, ox, L.y + (L.from === 'cow' ? -2 : 0), (L.from === 'cow' ? 14 : 16) * pop);
      }
      layer(g, L.kind, x + hint + wob, L.y);
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.sandwich = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, layers: LAYERS, VW: VW, VH: VH, CX: CX, HALF: HALF, SLIDE: SLIDE };
})(window);
