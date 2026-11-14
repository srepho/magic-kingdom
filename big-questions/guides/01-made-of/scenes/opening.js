/* Opening — an ice cube in a glass of cordial.
 * Poke it: it dunks, clinks and spins. Hold a finger on it: her warm finger melts it.
 * The drink level does not move as it melts (floating ice never raises the level).
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, GX = 200, TOP = 60, BOT = 262, SURF = 118, HALF = 34;

  var frame, surf, loop, off, st;

  function fresh() {
    return { size: 1, bob: 0, bobV: 0, ang: 0.12, angV: 0, drop: 0,
             hold: null, heldFor: 0, melted: 0, gone: 0, pokes: [], dizzy: 0, drips: [], clock: 0, told: false };
  }
  function cube() { return { x: GX + Math.sin(st.clock * 0.7) * (BQ.calm() ? 0 : 6), y: SURF + 20 + st.bob - st.drop, r: HALF * st.size }; }
  function onCube(p) { var c = cube(); return st.size > 0.05 && Math.hypot(p.x - c.x, p.y - c.y) < c.r + 30; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (!onCube(p)) return;
        st.hold = p; st.heldFor = 0;
        st.bobV += 150; st.angV += (Math.random() - 0.5) * 5;
        BQ.sound.clink();
        var now = st.clock;
        st.pokes = st.pokes.filter(function (t) { return now - t < 1.6; }); st.pokes.push(now);
        if (st.pokes.length >= 3) { st.angV = 14; st.dizzy = 1.8; st.pokes = []; BQ.sound.whoosh(); }
      },
      move: function (q) { if (st.hold) { var p = surf.toView(q); st.hold = onCube(p) ? p : null; } },
      up: function () { st.hold = null; }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    st.bobV += (-70 * st.bob - 4.5 * st.bobV) * dt; st.bob += st.bobV * dt;
    var rest = Math.round(st.ang / (Math.PI / 2)) * (Math.PI / 2) + 0.12;
    st.angV += ((rest - st.ang) * (Math.abs(st.angV) < 3 ? 14 : 0) - 1.6 * st.angV) * dt; st.ang += st.angV * dt;
    if (st.dizzy > 0) st.dizzy -= dt;
    if (st.drop > 0) { st.drop = Math.max(0, st.drop - 420 * dt); if (st.drop === 0) { st.bobV += 220; BQ.sound.plop(); } }

    if (st.hold && st.size > 0) {
      st.heldFor += dt;
      if (st.heldFor > 0.3) {                           // her finger is warm: the cube melts
        st.size = Math.max(0, st.size - 0.11 * dt); st.melted += dt;
        if (Math.random() < dt * 9) {
          var c = cube(), a = Math.random() * 6.283;
          st.drips.push({ x: c.x + Math.cos(a) * c.r, y: c.y + Math.abs(Math.sin(a)) * c.r, v: 20, life: 1 });
        }
        if (st.melted > 0.8 && !st.told) {
          st.told = true;
          frame.caption('Your warm finger is melting the ice. Where does the ice go?');
          frame.nudgeToy();
        }
        if (st.size <= 0.05) { st.size = 0; st.hold = null; st.gone = 2.2; BQ.sound.drip(); }
      }
    }
    if (st.gone > 0) {                                  // a fresh cube drops in
      st.gone -= dt;
      if (st.gone <= 0) { st.size = 1; st.drop = 150; st.bob = 0; st.bobV = 0; }
    }
    st.drips = st.drips.filter(function (d) { d.v += 300 * dt; d.y += d.v * dt; d.life -= dt * 1.6; return d.life > 0; });
    draw();
  }

  function glass(g) {
    g.beginPath(); g.moveTo(GX - 78, TOP); g.lineTo(GX - 62, BOT - 10); g.quadraticCurveTo(GX - 61, BOT, GX - 50, BOT);
    g.lineTo(GX + 50, BOT); g.quadraticCurveTo(GX + 61, BOT, GX + 62, BOT - 10); g.lineTo(GX + 78, TOP);
  }
  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), c = cube(), k;
    // window and sill
    g.fillStyle = INK.sky; D.round(g, 20, 8, VW - 40, 250, 14); g.fill();
    g.fillStyle = '#fff';
    for (k = 0; k < 2; k++) { g.beginPath(); g.ellipse(90 + k * 210, 50 + k * 26, 40, 13, 0, 0, 6.283); g.fill(); }
    g.fillStyle = '#d9c9a8'; g.fillRect(0, BOT - 2, VW, 40);
    g.fillStyle = '#c4b28e'; g.fillRect(0, BOT - 2, VW, 5);

    // cordial, clipped to the glass
    g.save(); glass(g); g.clip();
    g.fillStyle = '#ffb3a1'; g.fillRect(GX - 90, SURF, 180, 200);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(GX - 90, SURF, 180, 4);
    st.drips.forEach(function (d) {
      g.fillStyle = 'rgba(126,196,238,' + d.life + ')';
      g.beginPath(); g.arc(d.x, d.y, 3.5, 0, 6.283); g.fill();
    });
    g.restore();

    if (st.size > 0) {                                   // the cube
      g.save(); g.translate(c.x, c.y); g.rotate(st.ang);
      g.fillStyle = INK.ice; D.round(g, -c.r, -c.r, 2 * c.r, 2 * c.r, c.r * 0.28); g.fill();
      g.strokeStyle = INK.iceEdge; g.lineWidth = 3; D.round(g, -c.r, -c.r, 2 * c.r, 2 * c.r, c.r * 0.28); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(-c.r * 0.6, -c.r * 0.55); g.lineTo(-c.r * 0.1, -c.r * 0.55); g.stroke();
      g.restore();
      // the part under the surface looks tinted
      g.save(); glass(g); g.clip();
      g.fillStyle = 'rgba(255,179,161,.35)'; g.fillRect(GX - 90, SURF, 180, 200);
      g.restore();
    }
    if (st.dizzy > 0) {
      for (k = 0; k < 3; k++) {
        var a = st.clock * 6 + k * 2.09;
        D.star(g, c.x + Math.cos(a) * (c.r + 22), c.y - c.r - 8 + Math.sin(a) * 8, 7);
      }
    }
    if (st.hold && st.heldFor > 0.3) {                   // warmth from her finger
      var glow = g.createRadialGradient(st.hold.x, st.hold.y, 4, st.hold.x, st.hold.y, 60);
      glow.addColorStop(0, 'rgba(255,170,90,.55)'); glow.addColorStop(1, 'rgba(255,170,90,0)');
      g.fillStyle = glow; g.beginPath(); g.arc(st.hold.x, st.hold.y, 60, 0, 6.283); g.fill();
    }
    g.strokeStyle = '#7b8a93'; g.lineWidth = 5; glass(g); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(GX - 62, TOP + 22); g.lineTo(GX - 52, BOT - 60); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.opening = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, cube: cube };
})(window);
