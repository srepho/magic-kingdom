/* Moment A — the puddle.
 * Drag the cloud off the sun: bits leave the puddle one at a time and float in the air.
 * Cloud over the sun: they nearly stop leaving. Tap the cloud: rain, and the puddle refills.
 * The bits never leave the model card, so she can see none are lost.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, N = 24, R = 8;
  var CARD = { x: 318, y: 14, w: 150, h: 272 }, COLS = 6, GAP = 21;
  var SUN = { x: 78, y: 62 };

  var frame, surf, loop, off, st;

  function slot(j) {
    var row = Math.floor(j / COLS), col = j % COLS;
    return { x: CARD.x + 17 + col * GAP + (row % 2) * 10, y: CARD.y + CARD.h - 16 - row * 18 };
  }
  function fresh() {
    var bits = [];
    for (var i = 0; i < N; i++) {
      var s = slot(i);
      bits.push({ x: s.x, y: s.y, vx: 0, vy: 0, jx: 0, jy: 0, ang: Math.random() * 6.283, air: false, star: false });
    }
    return { bits: bits, pool: bits.slice(), cloud: { x: 230, y: 66 }, drag: null, due: 0, rain: 0, rainDue: 0,
             left: 0, splash: [], clock: 0, told: false };
  }
  function sunPower() { return Math.min(1, Math.hypot(st.cloud.x - SUN.x, st.cloud.y - SUN.y) / 70); }
  function wet() { return st.pool.length / N; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - st.cloud.x, p.y - st.cloud.y) < 64) st.drag = { dx: st.cloud.x - p.x, dy: st.cloud.y - p.y };
      },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q);
        st.cloud.x = Math.max(40, Math.min(280, p.x + st.drag.dx));
        st.cloud.y = Math.max(40, Math.min(110, p.y + st.drag.dy));
      },
      up: function () { st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q), b = null, bd = 24;
        if (Math.hypot(p.x - st.cloud.x, p.y - st.cloud.y) < 64) { st.rain = 2.6; BQ.sound.drip(); return; }
        st.bits.forEach(function (c) { var d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; b = c; } });
        if (b) { b.star = !b.star; BQ.sound.squeak(); return; }
        if (p.x < 300 && p.y > 205 && wet() > 0.05) {      // splash!
          for (var k = 0; k < 7; k++) st.splash.push({ x: p.x, y: 252, vx: (Math.random() - 0.5) * 160, vy: -90 - Math.random() * 90, life: 1 });
          BQ.sound.plop();
        }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    var airTop = CARD.y + 22, top = st.pool.length ? slot(st.pool.length - 1).y : CARD.y + CARD.h;
    var floor = top - 26;

    // leaving: quick in the sun, very slow in shade
    st.due += dt * (0.05 + 0.85 * sunPower());
    if (st.due >= 1 && st.pool.length && st.rain <= 0) {
      st.due = 0;
      var b = st.pool.pop();
      b.air = true; b.vx = (Math.random() - 0.5) * 30; b.vy = -55;
      st.left++;
      if (st.left === 3 && !st.told) { st.told = true; frame.caption("The puddle didn't vanish. Its <b>bits</b> floated off into the air."); }
    }
    // rain brings them back
    if (st.rain > 0) {
      st.rain -= dt; st.rainDue -= dt;
      if (st.rainDue <= 0) {
        st.rainDue = 0.09;
        var up = st.bits.filter(function (c) { return c.air; });
        if (up.length) { var c = up[Math.floor(Math.random() * up.length)]; c.air = false; st.pool.push(c); }
      }
    }
    st.pool.forEach(function (c, j) {                       // bits in the pool jostle about their places
      var s = slot(j);
      c.jx += (Math.random() - 0.5) * 60 * dt - c.jx * 2 * dt; c.jy += (Math.random() - 0.5) * 60 * dt - c.jy * 2 * dt;
      c.x += (s.x + c.jx - c.x) * Math.min(1, 7 * dt); c.y += (s.y + c.jy - c.y) * Math.min(1, 7 * dt);
      c.ang += (Math.random() - 0.5) * 3 * dt;
    });
    if (st.pool.length > 1 && Math.random() < dt * 3) {     // and slide past one another
      var a = Math.floor(Math.random() * (st.pool.length - 1)), t = st.pool[a];
      st.pool[a] = st.pool[a + 1]; st.pool[a + 1] = t;
    }
    st.bits.forEach(function (c) {
      if (!c.air) return;
      c.vx += (Math.random() - 0.5) * 220 * dt; c.vy += (Math.random() - 0.5) * 220 * dt;
      var sp = Math.hypot(c.vx, c.vy) || 1, want = 42;
      c.vx *= 1 + (want / sp - 1) * 2 * dt; c.vy *= 1 + (want / sp - 1) * 2 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt; c.ang += 2.5 * dt;
      if (c.x < CARD.x + 12) { c.x = CARD.x + 12; c.vx = Math.abs(c.vx); }
      if (c.x > CARD.x + CARD.w - 12) { c.x = CARD.x + CARD.w - 12; c.vx = -Math.abs(c.vx); }
      if (c.y < airTop) { c.y = airTop; c.vy = Math.abs(c.vy); }
      if (c.y > floor) { c.y = floor; c.vy = -Math.abs(c.vy); }
    });
    st.splash = st.splash.filter(function (d) { d.vy += 420 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * 1.5; return d.life > 0 && d.y < 262; });
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), sp = sunPower(), f = wet(), k, calm = BQ.calm();
    // sky, dimmer when the sun is covered
    g.fillStyle = INK.sky; D.round(g, 6, 6, 300, 288, 14); g.fill();
    g.save(); D.round(g, 6, 6, 300, 288, 14); g.clip();
    g.fillStyle = 'rgba(90,110,130,' + (0.22 * (1 - sp)) + ')'; g.fillRect(0, 0, 310, 300);
    // sun
    g.strokeStyle = INK.sun; g.lineWidth = 5;
    for (k = 0; k < 10; k++) {
      var a = k * 0.628 + (calm ? 0 : st.clock * 0.25), len = 8 + 14 * sp;
      g.beginPath(); g.moveTo(SUN.x + Math.cos(a) * 36, SUN.y + Math.sin(a) * 36);
      g.lineTo(SUN.x + Math.cos(a) * (36 + len), SUN.y + Math.sin(a) * (36 + len)); g.stroke();
    }
    g.fillStyle = INK.sun; g.beginPath(); g.arc(SUN.x, SUN.y, 28, 0, 6.283); g.fill();
    // grass, footpath
    g.fillStyle = '#9ccf8a'; g.fillRect(0, 196, 310, 24);
    g.fillStyle = '#c9c5bd'; g.fillRect(0, 216, 310, 90);
    g.strokeStyle = '#b4afa6'; g.lineWidth = 2;
    for (k = 0; k < 4; k++) { g.beginPath(); g.moveTo(40 + k * 80, 216); g.lineTo(20 + k * 80, 300); g.stroke(); }
    // where the puddle was stays a little dark
    g.fillStyle = 'rgba(120,115,105,.25)'; g.beginPath(); g.ellipse(150, 256, 98, 21, 0, 0, 6.283); g.fill();
    if (f > 0.01) {
      var rx = 14 + 84 * Math.sqrt(f), ry = 4 + 17 * Math.sqrt(f);
      g.fillStyle = INK.waterDeep; g.beginPath(); g.ellipse(150, 256, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = INK.water; g.beginPath(); g.ellipse(150, 254, rx * 0.92, ry * 0.8, 0, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.5;
      g.beginPath(); g.ellipse(150 - rx * 0.3, 251, rx * 0.3, ry * 0.25, 0, 3.4, 5.2); g.stroke();
    }
    g.fillStyle = INK.water;
    st.splash.forEach(function (d) { g.globalAlpha = d.life; g.beginPath(); g.arc(d.x, d.y, 4, 0, 6.283); g.fill(); });
    g.globalAlpha = 1;
    // rain
    if (st.rain > 0) {
      g.strokeStyle = INK.waterDeep; g.lineWidth = 3;
      for (k = 0; k < 14; k++) {
        var rxx = st.cloud.x - 50 + ((k * 37) % 100), ph = (st.clock * 2.2 + k * 0.173) % 1;
        var ry0 = st.cloud.y + 24 + ph * (236 - st.cloud.y);
        g.beginPath(); g.moveTo(rxx, ry0); g.lineTo(rxx - 3, ry0 + 12); g.stroke();
      }
    }
    // the cloud: the thing to drag (and tap)
    var cx = st.cloud.x, cy = st.cloud.y + (calm || st.drag ? 0 : Math.sin(st.clock * 1.3) * 2.5);
    g.fillStyle = st.rain > 0 ? '#cfd6dc' : '#fff'; g.strokeStyle = '#aab6bf'; g.lineWidth = 2.5;
    g.beginPath();
    g.arc(cx - 34, cy + 8, 22, 0, 6.283); g.arc(cx - 8, cy - 10, 28, 0, 6.283);
    g.arc(cx + 26, cy - 2, 24, 0, 6.283); g.arc(cx + 44, cy + 12, 16, 0, 6.283); g.arc(cx + 4, cy + 14, 24, 0, 6.283);
    g.fill();
    g.restore();

    // the model card
    D.paper(g, CARD.x, CARD.y, CARD.w, CARD.h);
    D.glasses(g, CARD.x + CARD.w / 2, CARD.y + 13, 11);
    st.bits.forEach(function (c) { D.bit(g, c.x, c.y, R, c.ang, c.star); });
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.puddle = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; } };
})(window);
