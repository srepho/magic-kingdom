/* Opening — a balloon outside home.
 * The front of a house, the way she sees it every day. Tap the door, the letterbox, the magpie.
 * Drag the balloon up and the view lifts with it: home gets small and the whole row of
 * houses comes into view. Drag it back down and home is big again.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, GROUND = 250, PIVOT = { x: 200, y: GROUND };
  var LOW = 196, HIGH = -160;                              // how low and how high the balloon can go
  var ROOFS = ['#8d99a6', '#d9c7a3', '#7f8c6b', '#b5653f', '#a3a9b0'];

  var frame, surf, loop, off, st;

  function fresh() {
    return { bx: 318, by: LOW, drag: null, lift: 0, door: 0, doorOpen: false, flap: 0, hop: 0, clock: 0, told: false };
  }
  function scale() { return 1 - 0.62 * st.lift; }
  function toWorld(p) { var k = scale(); return { x: PIVOT.x + (p.x - PIVOT.x) / k, y: PIVOT.y + (p.y - PIVOT.y) / k + pan() }; }
  function pan() { return -60 * st.lift; }                // the view also drifts up a little as it widens

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var w = toWorld(surf.toView(q)), k = scale();
        if (Math.hypot(w.x - st.bx, w.y - st.by) < 46 / k) st.drag = { dx: st.bx - w.x, dy: st.by - w.y };
      },
      move: function (q) {
        if (!st.drag) return;
        var w = toWorld(surf.toView(q));
        st.bx = Math.max(60, Math.min(340, w.x + st.drag.dx));
        st.by = Math.max(HIGH, Math.min(LOW, w.y + st.drag.dy));
      },
      up: function () { st.drag = null; },
      tap: function (q) {
        var w = toWorld(surf.toView(q));
        if (Math.abs(w.x - 200) < 26 && w.y > 176 && w.y < GROUND) { st.doorOpen = !st.doorOpen; BQ.sound.click(); }
        else if (Math.hypot(w.x - 96, w.y - 222) < 30) { st.flap = 1; BQ.sound.click(); }
        else if (Math.hypot(w.x - 236, w.y - 112) < 32) { st.hop = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    var want = (LOW - st.by) / (LOW - HIGH);
    st.lift += (want - st.lift) * Math.min(1, dt * 6);       // the view follows the balloon
    st.door += ((st.doorOpen ? 1 : 0) - st.door) * Math.min(1, dt * 8);
    st.flap = Math.max(0, st.flap - dt * 2); st.hop = Math.max(0, st.hop - dt * 2.2);
    if (st.lift > 0.7 && !st.told) {
      st.told = true;
      frame.caption('From up high, home looks small. What else can we see?');
      frame.nudgeToy();
    }
    draw();
  }

  function sideHouse(g, x, w, h, roof, wall) {              // a house from the front
    g.fillStyle = wall; g.fillRect(x, GROUND - h, w, h);
    g.fillStyle = roof; g.beginPath(); g.moveTo(x - 8, GROUND - h); g.lineTo(x + w / 2, GROUND - h - w * 0.36); g.lineTo(x + w + 8, GROUND - h); g.closePath(); g.fill();
    g.strokeStyle = INK.line; g.lineWidth = 3;
    g.strokeRect(x, GROUND - h, w, h);
    g.beginPath(); g.moveTo(x - 8, GROUND - h); g.lineTo(x + w / 2, GROUND - h - w * 0.36); g.lineTo(x + w + 8, GROUND - h); g.closePath(); g.stroke();
    g.fillStyle = '#cfe3f5'; g.fillRect(x + w * 0.16, GROUND - h * 0.72, w * 0.22, h * 0.3); g.strokeRect(x + w * 0.16, GROUND - h * 0.72, w * 0.22, h * 0.3);
    g.fillRect(x + w * 0.62, GROUND - h * 0.72, w * 0.22, h * 0.3); g.strokeRect(x + w * 0.62, GROUND - h * 0.72, w * 0.22, h * 0.3);
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k = scale(), i, calm = BQ.calm();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = INK.sky; g.fillRect(0, 0, VW, VH);
    g.translate(PIVOT.x, PIVOT.y); g.scale(k, k); g.translate(-PIVOT.x, -PIVOT.y - pan());

    g.fillStyle = '#fff';                                    // clouds, some of them a long way up
    [[60, 40, 40], [330, 70, 34], [140, -120, 50], [420, -200, 44], [-120, -60, 46], [560, -20, 40], [220, -300, 52]].forEach(function (c) {
      var drift = calm ? 0 : Math.sin(st.clock * 0.3 + c[0]) * 6;
      g.beginPath(); g.ellipse(c[0] + drift, c[1], c[2], c[2] * 0.32, 0, 0, 6.283); g.fill();
    });
    g.fillStyle = '#b9dca8'; g.fillRect(-700, GROUND, 1800, 400);
    g.fillStyle = '#8f8c86'; g.fillRect(-700, GROUND + 26, 1800, 34);

    for (i = -5; i <= 5; i++) {                              // the neighbours, all along the street
      if (i === 0) continue;
      sideHouse(g, 200 + i * 150 - 55, 110, 74 + (Math.abs(i) % 3) * 8, ROOFS[(i + 5) % 5], ['#f3ead8', '#e6dcc8', '#efe2d4'][(i + 6) % 3]);
    }
    for (i = -4; i <= 4; i++) {                              // street trees
      var tx = 200 + i * 150 + 75;
      g.fillStyle = '#8b7355'; g.fillRect(tx - 4, GROUND - 46, 8, 46);
      g.fillStyle = '#7cc36a'; g.beginPath(); g.arc(tx, GROUND - 60, 26, 0, 6.283); g.fill();
    }

    // home
    sideHouse(g, 130, 140, 92, '#c96f52', '#f6efe0');
    g.fillStyle = '#f6efe0'; g.fillRect(180, 176, 40, 74);
    g.fillStyle = '#3b3a36'; g.fillRect(182, 178, 36, 72);   // inside the doorway
    if (st.door > 0.3) {                                     // a cat looks out
      g.fillStyle = '#f5b942'; g.beginPath(); g.arc(200, 236, 9, 0, 6.283); g.fill();
      g.beginPath(); g.moveTo(192, 231); g.lineTo(194, 222); g.lineTo(199, 229); g.moveTo(208, 231); g.lineTo(206, 222); g.lineTo(201, 229); g.fill();
      g.fillStyle = INK.line; g.beginPath(); g.arc(197, 236, 1.5, 0, 6.283); g.arc(203, 236, 1.5, 0, 6.283); g.fill();
    }
    g.fillStyle = '#6fb6d9'; g.fillRect(182, 178, 36 * (1 - st.door * 0.85), 72);          // the door
    g.strokeStyle = INK.line; g.lineWidth = 3; g.strokeRect(182, 178, 36, 72);
    g.fillStyle = INK.sun; g.beginPath(); g.arc(182 + 30 * (1 - st.door * 0.85), 216, 2.5, 0, 6.283); g.fill();
    // the magpie on the roof
    var hy = Math.sin(st.hop * Math.PI) * 16;
    g.fillStyle = '#2b2b2b'; g.beginPath(); g.ellipse(236, 116 - hy, 12, 8, -0.2, 0, 6.283); g.fill();
    g.beginPath(); g.arc(246, 108 - hy, 6, 0, 6.283); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(232, 113 - hy, 6, 3, -0.2, 0, 6.283); g.fill();
    g.fillStyle = '#d9d2c4'; g.beginPath(); g.moveTo(251, 107 - hy); g.lineTo(259, 109 - hy); g.lineTo(251, 111 - hy); g.fill();
    // the letterbox
    g.fillStyle = '#8b7355'; g.fillRect(93, 226, 6, 24);
    g.fillStyle = '#e4534a'; D.round(g, 82, 208, 28, 20, 5); g.fill(); g.strokeStyle = INK.line; g.lineWidth = 2.5; D.round(g, 82, 208, 28, 20, 5); g.stroke();
    g.save(); g.translate(110, 226); g.rotate(-Math.sin(st.flap * Math.PI) * 1.2); g.fillStyle = '#b63d36'; g.fillRect(0, -18, 4, 18); g.restore();

    // the balloon: the thing to drag
    var bob = st.drag || calm ? 0 : Math.sin(st.clock * 2) * 3, bx = st.bx, by = st.by + bob, r = 22 / Math.sqrt(k);
    g.strokeStyle = INK.line; g.lineWidth = 1.5 / k;
    g.beginPath(); g.moveTo(bx, by + r); g.quadraticCurveTo(bx + 8 / k, by + r + 22 / k, bx - 2 / k, by + r + 44 / k); g.stroke();
    g.fillStyle = '#f2788f'; g.beginPath(); g.ellipse(bx, by, r * 0.86, r, 0, 0, 6.283); g.fill();
    g.strokeStyle = INK.line; g.lineWidth = 3 / k; g.beginPath(); g.ellipse(bx, by, r * 0.86, r, 0, 0, 6.283); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3 / k;
    g.beginPath(); g.arc(bx - r * 0.2, by - r * 0.25, r * 0.45, 3.5, 4.6); g.stroke();
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.balloon = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    /* where a spot in the street is on the picture right now (for tests) */
    toView: function (w) { var k = scale(); return { x: PIVOT.x + (w.x - PIVOT.x) * k, y: PIVOT.y + (w.y - pan() - PIVOT.y) * k }; },
    limits: { low: LOW, high: HIGH } };
})(window);
