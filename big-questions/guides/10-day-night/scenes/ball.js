/* Opening — a ball and a lamp.
 * A beach ball with a star sticker sits beside a bedside lamp. The lamp never moves.
 * She pushes the ball round with a finger: the star rolls into the light, then into the dark.
 * Same idea as the Earth and the Sun, with things from her own room.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, B = { x: 236, y: 150, r: 78 }, LAMP = { x: 62, y: 118 };
  var STRIPES = ['#f2788f', '#fff', '#6fb6d9', '#fff', '#f5b942', '#fff'];

  var frame, surf, loop, off, st;

  function fresh() { return { turn: -0.9, speed: 0, drag: null, wasLit: true, moved: 0, told: false, clock: 0 }; }
  /* the star is on the side facing us while cos > 0; it is on the lamp's side while sin < 0 */
  function star() {
    var s = Math.sin(st.turn), c = Math.cos(st.turn);
    return { x: B.x + B.r * 0.92 * s, y: B.y - 8, front: c > 0, squash: Math.max(0, c), lit: s < 0.05 };
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - B.x, p.y - B.y) < B.r + 24) { st.drag = { x: p.x, t: performance.now(), v: 0 }; st.speed = 0; }
      },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q), d = (p.x - st.drag.x) / B.r, t = performance.now();
        st.turn += d; st.moved += Math.abs(d);
        st.drag.v = st.drag.v * 0.5 + (d / Math.max(0.008, (t - st.drag.t) / 1000)) * 0.5;
        st.drag.x = p.x; st.drag.t = t;
      },
      up: function () {
        if (!st.drag) return;
        st.speed = performance.now() - st.drag.t > 140 ? 0 : Math.max(-5, Math.min(5, st.drag.v));
        st.drag = null;
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    if (st.speed) {
      st.turn += st.speed * dt; st.moved += Math.abs(st.speed * dt);
      st.speed *= Math.exp(-0.5 * dt);
      if (Math.abs(st.speed) < 0.05) st.speed = 0;
    }
    var s = star(), lit = s.front && s.lit;
    if (s.front && lit !== st.wasLit) {
      st.wasLit = lit;
      if (!lit && !st.told) {
        st.told = true;
        frame.caption('The lamp stays still. The ball turns, and the star goes into the dark.');
      }
      if (lit) BQ.sound.lock(); else BQ.sound.drip();
    }
    if (st.moved > 7) frame.nudgeToy();
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k, calm = BQ.calm();
    // a bedroom in the evening
    g.fillStyle = '#39406b'; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#2b3157'; g.fillRect(4, 226, VW - 8, 70);
    g.fillStyle = '#4a527f'; D.round(g, 286, 26, 86, 86, 8); g.fill();                    // window, with stars
    g.fillStyle = '#fff';
    for (k = 0; k < 6; k++) { g.beginPath(); g.arc(300 + (k * 29) % 60, 40 + (k * 17) % 58, 1.6, 0, 6.283); g.fill(); }
    // the lamp's light: a fixed pool, always from the left
    var glow = g.createRadialGradient(LAMP.x + 10, LAMP.y, 10, LAMP.x + 10, LAMP.y, 250);
    glow.addColorStop(0, 'rgba(255,222,140,.55)'); glow.addColorStop(1, 'rgba(255,222,140,0)');
    g.fillStyle = glow; g.fillRect(4, 4, VW - 8, VH - 8);
    // bedside table and lamp
    g.fillStyle = '#8b7355'; D.round(g, 18, 196, 92, 60, 6); g.fill();
    g.fillStyle = '#5c4433'; g.fillRect(56, 150, 10, 48);
    g.fillStyle = '#ffe9a8'; g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(40, 92); g.lineTo(84, 92); g.lineTo(98, 150); g.lineTo(26, 150); g.closePath(); g.fill(); g.stroke();
    var flick = calm ? 0 : Math.sin(st.clock * 3) * 1.5;
    g.fillStyle = 'rgba(255,240,190,.9)'; g.beginPath(); g.arc(LAMP.x, 150, 9 + flick, 0, Math.PI); g.fill();

    // the ball: its stripes turn; its light and dark sides do not
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(B.x + 14, B.y + B.r + 6, B.r * 0.85, 9, 0, 0, 6.283); g.fill();
    g.save(); g.beginPath(); g.arc(B.x, B.y, B.r, 0, 6.283); g.clip();
    g.fillStyle = '#fff'; g.fillRect(B.x - B.r, B.y - B.r, 2 * B.r, 2 * B.r);
    var edges = [];
    for (k = 0; k < 6; k++) edges.push(st.turn + k * Math.PI / 3);
    for (k = 0; k < 6; k++) {                                // each coloured panel between two seams
      var a0 = edges[k], a1 = a0 + Math.PI / 3, mid = a0 + Math.PI / 6;
      if (Math.cos(mid) <= -0.5) continue;                   // wholly round the back
      var x0 = Math.cos(a0) > 0 ? Math.sin(a0) : (Math.sin(mid) > 0 ? 1 : -1);
      var x1 = Math.cos(a1) > 0 ? Math.sin(a1) : (Math.sin(mid) > 0 ? 1 : -1);
      g.fillStyle = STRIPES[k];
      g.beginPath();
      g.ellipse(B.x, B.y, Math.abs(x0) * B.r + 0.01, B.r, 0, -Math.PI / 2, Math.PI / 2, x0 < 0);
      g.ellipse(B.x, B.y, Math.abs(x1) * B.r + 0.01, B.r, 0, Math.PI / 2, -Math.PI / 2, x1 >= 0);
      g.closePath(); g.fill();
    }
    var s = star();
    if (s.front && s.squash > 0.08) {
      g.save(); g.translate(s.x, s.y); g.scale(s.squash, 1); D.star(g, 0, 0, 19); g.restore();
    }
    var shade = g.createLinearGradient(B.x - B.r * 0.15, 0, B.x + B.r * 0.35, 0);       // the side away from the lamp
    shade.addColorStop(0, 'rgba(22,26,60,0)'); shade.addColorStop(1, 'rgba(22,26,60,.72)');
    g.fillStyle = shade; g.fillRect(B.x - B.r * 0.15, B.y - B.r, B.r * 1.2, 2 * B.r);
    g.restore();
    g.strokeStyle = INK.line; g.lineWidth = 4; g.beginPath(); g.arc(B.x, B.y, B.r, 0, 6.283); g.stroke();

    if (!st.moved && !calm) {                                // a ghost fingertip sliding across
      var t = (st.clock * 0.5) % 1;
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(B.x - 36 + t * 72, B.y + 34, 12, 0, 6.283); g.fill();
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.ball = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, star: star, spots: { ball: B } };
})(window);
