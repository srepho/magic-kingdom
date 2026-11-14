/* Opening — your own family tree.
 * One child. Tap her and her two parents appear above. Tap a parent and their parents appear.
 * It goes back and back: after great-grandparents the lines run on off the top of the page.
 * These are birth parents: the grown-up notes say that families come in many shapes.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, DEPTH = 3;
  var SKIN = ['#e8b88f', '#c98e62', '#8f5d3b', '#f0cba8', '#b07a52'];
  var SHIRT = ['#57b5a6', '#f2788f', '#f5b942', '#6fb6d9', '#8a7fd1', '#7cc36a'];
  var HAIR = ['#4a372b', '#2e2620', '#8a5a34', '#c9c2b8', '#6b4a35'];

  var frame, surf, loop, off, st;

  function pos(gen, i) { return { x: (i + 0.5) * VW / Math.pow(2, gen), y: 248 - gen * 64, s: [20, 17, 13, 9][gen] }; }
  function key(gen, i) { return gen + ':' + i; }
  function fresh() { return { open: {}, pop: {}, hop: {}, clock: 0, on: 0 }; }
  function shown(gen, i) { return gen === 0 || !!st.open[key(gen - 1, Math.floor(i / 2))]; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      tap: function (q) {
        var p = surf.toView(q);
        for (var gen = DEPTH; gen >= 0; gen--) for (var i = 0; i < Math.pow(2, gen); i++) {
          var at = pos(gen, i);
          if (!shown(gen, i) || Math.hypot(p.x - at.x, p.y - at.y) > Math.max(24, at.s * 1.5)) continue;
          var k = key(gen, i);
          st.hop[k] = 1;
          if (st.open[k]) { BQ.sound.squeak(); return; }
          st.open[k] = true; st.on++; BQ.sound.plop();
          if (gen < DEPTH) { st.pop[key(gen + 1, i * 2)] = 0; st.pop[key(gen + 1, i * 2 + 1)] = 0; }
          if (st.on === 1) frame.caption('Everyone is born from parents. And they had parents too.');
          else if (gen === DEPTH || st.on === 4) { frame.caption('Back and back it goes. Each one is your <b>ancestor</b>.'); frame.nudgeToy(); }
          return;
        }
      }
    });
    loop = BQ.loop(tick);
  }
  function tick(dt) {
    st.clock += dt;
    Object.keys(st.pop).forEach(function (k) { st.pop[k] = Math.min(1, st.pop[k] + dt * 3); });
    Object.keys(st.hop).forEach(function (k) { st.hop[k] = Math.max(0, st.hop[k] - dt * 2.5); });
    draw();
  }

  function person(g, x, y, s, n, mood) {
    g.strokeStyle = INK.line; g.lineWidth = Math.max(1.5, s * 0.11);
    g.fillStyle = SHIRT[n % SHIRT.length];
    g.beginPath(); g.moveTo(x - s * 0.75, y + s * 1.9); g.lineTo(x - s * 0.6, y + s * 0.75); g.quadraticCurveTo(x, y + s * 0.4, x + s * 0.6, y + s * 0.75); g.lineTo(x + s * 0.75, y + s * 1.9); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = SKIN[(n * 3 + 1) % SKIN.length]; g.beginPath(); g.arc(x, y, s * 0.72, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = HAIR[(n * 7 + 2) % HAIR.length]; g.beginPath(); g.arc(x, y - s * 0.12, s * 0.74, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill();
    if (s > 10) {
      g.fillStyle = INK.line; g.beginPath(); g.arc(x - s * 0.26, y + s * 0.05, s * 0.07, 0, 6.283); g.arc(x + s * 0.26, y + s * 0.05, s * 0.07, 0, 6.283); g.fill();
      g.beginPath(); g.arc(x, y + s * 0.2, s * 0.26, 0.3, Math.PI - 0.3); g.stroke();
    }
    void mood;
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), gen, i, calm = BQ.calm();
    g.fillStyle = '#f6efe0'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    // lines from each child up to their parents
    g.strokeStyle = '#b9a98a'; g.lineWidth = 3;
    for (gen = 0; gen < DEPTH; gen++) for (i = 0; i < Math.pow(2, gen); i++) {
      if (!shown(gen, i) || !st.open[key(gen, i)]) continue;
      var c = pos(gen, i);
      [i * 2, i * 2 + 1].forEach(function (j) {
        var p = pos(gen + 1, j), grow = st.pop[key(gen + 1, j)];
        g.beginPath(); g.moveTo(c.x, c.y - c.s * 0.8); g.lineTo(c.x + (p.x - c.x) * grow, c.y - c.s * 0.8 + (p.y + p.s * 1.9 - c.y + c.s * 0.8) * grow); g.stroke();
      });
    }
    // great-grandparents' own parents run on off the page
    for (i = 0; i < 8; i++) {
      if (!shown(DEPTH, i) || !st.open[key(DEPTH, i)]) continue;
      var t = pos(DEPTH, i);
      g.setLineDash([3, 5]);
      g.beginPath(); g.moveTo(t.x, t.y - 8); g.lineTo(t.x - 9, 6); g.moveTo(t.x, t.y - 8); g.lineTo(t.x + 9, 6); g.stroke();
      g.setLineDash([]);
    }
    for (gen = 0; gen <= DEPTH; gen++) for (i = 0; i < Math.pow(2, gen); i++) {
      if (!shown(gen, i)) continue;
      var at = pos(gen, i), k = key(gen, i), grown = gen === 0 ? 1 : st.pop[k];
      var hop = Math.sin((st.hop[k] || 0) * Math.PI) * 8;
      var wig = (!calm && !st.open[k] && (st.clock + i) % 3 < 0.4) ? Math.sin(st.clock * 22) * 2.5 : 0;
      person(g, at.x + wig, at.y - hop, at.s * (0.3 + 0.7 * grown), gen * 8 + i);
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.family = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: { pos: pos } };
})(window);
