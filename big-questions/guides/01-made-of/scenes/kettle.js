/* Moment B — the kettle cloud.
 * Tap the kettle to boil it. Just past the spout there is a clear gap (steam, invisible),
 * then a white cloud (tiny drops of water). Drag the model card: its ring shows what the
 * bits are doing wherever it sits. The card stays crayon-on-paper so it never reads as a lens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, N = 18, R = 7, CS = 112;        // card size
  var TIP = { x: 236, y: 118 }, DIR = { x: 0.64, y: -0.77 };
  var GAP = { x: TIP.x + DIR.x * 16, y: TIP.y + DIR.y * 16, r: 22 };
  var PUFF = { x: TIP.x + DIR.x * 84, y: TIP.y + DIR.y * 84, r: 52 };
  var BODY = { x: 96, y: 128, w: 128, h: 112 };

  var frame, surf, loop, off, st;

  function fresh() {
    var bits = [];
    for (var i = 0; i < N; i++) bits.push({ x: Math.random() * CS, y: Math.random() * CS, vx: 0, vy: 0, a: 0, ang: Math.random() * 6.283 });
    return { on: false, heat: 0, card: { x: 388, y: 196 }, drag: null, bits: bits, puffs: [], puffDue: 0, blup: 0,
             zone: 'air', clock: 0, told: false };
  }
  function ring() { return { x: st.card.x - CS / 2 - 26, y: st.card.y - CS / 2 + 24 }; }
  function boiling() { return st.heat > 0.9; }
  function zoneAt(p) {
    if (p.x > BODY.x && p.x < BODY.x + BODY.w && p.y > BODY.y + 10 && p.y < BODY.y + BODY.h) return 'water';
    if (boiling()) {
      if (Math.hypot(p.x - GAP.x, p.y - GAP.y) < GAP.r) return 'steam';
      if (Math.hypot(p.x - PUFF.x, p.y - PUFF.y) < PUFF.r) return 'drops';
    }
    return 'air';
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q), r = ring();
        var onCard = Math.abs(p.x - st.card.x) < CS / 2 + 10 && Math.abs(p.y - st.card.y) < CS / 2 + 10;
        if (onCard || Math.hypot(p.x - r.x, p.y - r.y) < 34) st.drag = { dx: st.card.x - p.x, dy: st.card.y - p.y };
      },
      move: function (q) {
        if (!st.drag) return;
        var p = surf.toView(q);
        st.card.x = Math.max(CS / 2 + 44, Math.min(VW - CS / 2 - 4, p.x + st.drag.dx));
        st.card.y = Math.max(CS / 2 + 4, Math.min(VH - CS / 2 - 4, p.y + st.drag.dy));
      },
      up: function () { st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q);
        if (Math.abs(p.x - st.card.x) < CS / 2 + 10 && Math.abs(p.y - st.card.y) < CS / 2 + 10) return;
        if (p.x > BODY.x - 30 && p.x < BODY.x + BODY.w + 40 && p.y > 90 && p.y < 250) { st.on = !st.on; BQ.sound.click(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    st.heat = Math.max(0, Math.min(1, st.heat + (st.on ? dt / 2.2 : -dt / 3.5)));
    if (boiling()) {
      st.puffDue -= dt;
      if (st.puffDue <= 0) {
        st.puffDue = 0.16;
        st.puffs.push({ x: TIP.x + DIR.x * 40, y: TIP.y + DIR.y * 40, r: 9, life: 1, drift: (Math.random() - 0.5) * 26 });
      }
      st.blup -= dt;
      if (st.blup <= 0) { BQ.sound.blup(); st.blup = 0.15 + Math.random() * 0.3; }
    }
    st.puffs = st.puffs.filter(function (p) {
      p.x += (DIR.x * 34 + p.drift) * dt; p.y += (DIR.y * 34 - 6) * dt; p.r += 13 * dt; p.life -= dt / 2.3;
      return p.life > 0;
    });

    var z = zoneAt(ring());
    if (z !== st.zone) {
      st.zone = z;
      if ((z === 'steam' || z === 'drops') && !st.told) {
        st.told = true; frame.caption('<b>Steam</b> is invisible. The white cloud is tiny drops of water.');
      }
    }
    var show = z === 'steam' ? 6 : z === 'air' ? 2 : N, speed = z === 'steam' ? 150 : 55;
    st.bits.forEach(function (b, i) {
      var want = i < show ? 1 : 0, tx, ty;
      b.a += (want - b.a) * Math.min(1, 6 * dt);
      if (z === 'water') {                                // packed at the bottom, jostling
        tx = 13 + (i % 6) * 17 + (Math.floor(i / 6) % 2) * 8; ty = CS - 12 - Math.floor(i / 6) * 15;
      } else if (z === 'drops') {                         // gathered into three tiny drops
        var c = i % 3, j = Math.floor(i / 3), t = st.clock;
        var cx = CS / 2 + 30 * Math.cos(t * 0.5 + c * 2.09), cy = CS / 2 + 26 * Math.sin(t * 0.6 + c * 2.09);
        tx = cx + (j ? Math.cos(j * 1.257) * 13 : 0); ty = cy + (j ? Math.sin(j * 1.257) * 13 : 0);
      }
      if (tx != null) {
        b.x += (tx + (Math.random() - 0.5) * 3 - b.x) * Math.min(1, 7 * dt);
        b.y += (ty + (Math.random() - 0.5) * 3 - b.y) * Math.min(1, 7 * dt);
        b.vx = (Math.random() - 0.5) * speed; b.vy = (Math.random() - 0.5) * speed;
        b.ang += (Math.random() - 0.5) * 4 * dt;
      } else {                                            // far apart and flying
        var sp = Math.hypot(b.vx, b.vy) || 1;
        b.vx *= speed / sp; b.vy *= speed / sp;
        b.x += b.vx * dt; b.y += b.vy * dt; b.ang += 3 * dt;
        if (b.x < R + 2) { b.x = R + 2; b.vx = Math.abs(b.vx); }
        if (b.x > CS - R - 2) { b.x = CS - R - 2; b.vx = -Math.abs(b.vx); }
        if (b.y < R + 16) { b.y = R + 16; b.vy = Math.abs(b.vy); }
        if (b.y > CS - R - 2) { b.y = CS - R - 2; b.vy = -Math.abs(b.vy); }
      }
    });
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), k, calm = BQ.calm(), hot = boiling();
    // kitchen wall, tiles, bench
    g.fillStyle = '#e9e2d3'; D.round(g, 6, 6, VW - 12, 288, 14); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.05)'; g.lineWidth = 2;
    for (k = 1; k < 8; k++) { g.beginPath(); g.moveTo(6 + k * 58, 6); g.lineTo(6 + k * 58, 240); g.stroke(); }
    for (k = 1; k < 4; k++) { g.beginPath(); g.moveTo(6, 6 + k * 58); g.lineTo(VW - 6, 6 + k * 58); g.stroke(); }
    g.fillStyle = '#c9b79a'; g.fillRect(6, 240, VW - 12, 54);
    g.fillStyle = '#b7a384'; g.fillRect(6, 240, VW - 12, 6);

    // the white cloud: drops, not gas. It starts a little way past the spout.
    st.puffs.forEach(function (p) {
      g.fillStyle = 'rgba(255,255,255,' + (0.8 * Math.min(1, p.life * 1.6) * Math.min(1, (1 - p.life) * 6)) + ')';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
    });

    // kettle
    var jig = hot && !calm ? Math.sin(st.clock * 40) * 0.8 : 0;
    g.save(); g.translate(jig, 0);
    g.strokeStyle = '#4d5a66'; g.lineWidth = 9; g.beginPath();                    // handle
    g.moveTo(BODY.x + 6, BODY.y + 26); g.quadraticCurveTo(BODY.x - 44, BODY.y + 50, BODY.x + 2, BODY.y + 92); g.stroke();
    g.lineCap = 'butt';                                                           // spout
    g.strokeStyle = '#4d5a66'; g.lineWidth = 24; g.beginPath();
    g.moveTo(BODY.x + BODY.w - 14, BODY.y + 58); g.lineTo(TIP.x, TIP.y); g.stroke();
    g.strokeStyle = '#8fb5d6'; g.lineWidth = 16; g.beginPath();
    g.moveTo(BODY.x + BODY.w - 14, BODY.y + 58); g.lineTo(TIP.x - DIR.x * 2, TIP.y - DIR.y * 2); g.stroke();
    g.lineCap = 'round';
    g.fillStyle = '#8fb5d6'; D.round(g, BODY.x, BODY.y, BODY.w, BODY.h, 22); g.fill();
    g.strokeStyle = '#4d5a66'; g.lineWidth = 4; D.round(g, BODY.x, BODY.y, BODY.w, BODY.h, 22); g.stroke();
    g.fillStyle = '#4d5a66'; D.round(g, BODY.x + 14, BODY.y - 9, BODY.w - 28, 12, 6); g.fill();
    g.beginPath(); g.arc(BODY.x + BODY.w / 2, BODY.y - 14, 8, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(BODY.x + 18, BODY.y + 22); g.lineTo(BODY.x + 18, BODY.y + 70); g.stroke();
    // the switch: glows when on, breathes gently when off to invite a tap
    var pulse = st.on ? 1 : (calm ? 0.5 : 0.5 + 0.3 * Math.sin(st.clock * 3));
    g.fillStyle = st.on ? INK.warm : 'rgba(255,255,255,' + pulse + ')';
    g.strokeStyle = '#4d5a66'; g.lineWidth = 3;
    g.beginPath(); g.arc(BODY.x + BODY.w / 2, BODY.y + BODY.h - 26, 13, 0, 6.283); g.fill(); g.stroke();
    g.restore();

    // the card and its ring
    var c = st.card, r = ring(), x0 = c.x - CS / 2, y0 = c.y - CS / 2;
    g.strokeStyle = INK.paperEdge; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x0 + 4, r.y); g.lineTo(r.x + 17, r.y); g.stroke();
    g.setLineDash([5, 5]); g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.arc(r.x, r.y, 17, 0, 6.283); g.stroke(); g.setLineDash([]);
    D.paper(g, x0, y0, CS, CS);
    D.glasses(g, c.x, y0 + 11, 9);
    g.save(); D.round(g, x0, y0, CS, CS, 8); g.clip();
    st.bits.forEach(function (b) { D.bit(g, x0 + b.x, y0 + b.y, R, b.ang, false, b.a); });
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.kettle = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, ring: ring,
    spots: { gap: GAP, puff: PUFF, body: BODY } };
})(window);
