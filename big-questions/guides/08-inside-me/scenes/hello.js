/* Opening — hello, body.
 * A child stands breathing gently. Touch a part and it answers: the chest thumps, the tummy
 * rumbles, the head thinks of something, a hand waves, a foot kicks. No words needed.
 * After two different parts she is invited inside.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, B = BQ.body, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300, FX = 200, FY = 272;
  var THOUGHTS = ['apple', 'icecream', 'kite', 'banana', 'fish', 'berry'];

  var frame, surf, loop, off, st;

  function fresh() { return { wave: [0, 0], kick: [0, 0], thump: 0, rumble: 0, think: 0, thought: 'apple', seen: {}, n: 0, clock: 0 }; }
  function pose() {
    var q = B.stand(), i;
    for (i = 0; i < 2; i++) {
      if (st.wave[i] > 0) { q.arm[i].a = 2.45; q.arm[i].b = 0.35 * Math.sin(st.clock * 15); }
      if (st.kick[i] > 0) { q.leg[i].a = 0.95 * Math.sin(Math.min(1, st.kick[i]) * Math.PI); }
    }
    if (st.kick[0] > 0 || st.kick[1] > 0) q.bob = -5 * Math.sin(Math.max(st.kick[0], st.kick[1]) * Math.PI);
    return q;
  }
  /* which part of her is under the finger? p is in figure units */
  function partAt(p) {
    var J = B.joints(pose()), i;
    for (i = 0; i < 2; i++) if (Math.hypot(p.x - J.ha[i].x, p.y - J.ha[i].y) < 30) return 'hand' + i;
    for (i = 0; i < 2; i++) if (Math.hypot(p.x - J.ft[i].x, p.y - J.ft[i].y) < 30) return 'foot' + i;
    if (Math.hypot(p.x - J.head.x, p.y - J.head.y) < 38) return 'head';
    if (Math.abs(p.x) < 40 && p.y > -176 && p.y <= -122) return 'chest';
    if (Math.abs(p.x) < 40 && p.y > -122 && p.y < -66) return 'tummy';
    for (i = 0; i < 2; i++) if (Math.abs(p.x - J.kn[i].x) < 26 && p.y > -70 && p.y < 0) return 'foot' + i;
    return null;
  }
  function touch(part) {
    if (!part) return;
    if (part === 'chest') {
      st.thump = 1; BQ.sound.plop();
      frame.caption('Thump-thump! Something in there is beating.');
    } else if (part === 'tummy') { st.rumble = 1; BQ.sound.blup(); BQ.sound.nope(); }
    else if (part === 'head') { st.think = 2.2; st.thought = THOUGHTS[(THOUGHTS.indexOf(st.thought) + 1) % THOUGHTS.length]; BQ.sound.squeak(); }
    else if (part.indexOf('hand') === 0) { st.wave[+part.slice(4)] = 1.2; BQ.sound.whoosh(); }
    else if (part.indexOf('foot') === 0) { st.kick[+part.slice(4)] = 1; BQ.sound.click(); }
    if (!st.seen[part.replace(/\d/, '')]) {
      st.seen[part.replace(/\d/, '')] = true; st.n++;
      if (st.n === 3) { frame.caption('What is inside you, doing all that?'); frame.nudgeToy(); }
    }
  }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var v = surf.toView(q); touch(partAt({ x: v.x - FX, y: v.y - FY })); }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt;
    for (var i = 0; i < 2; i++) { st.wave[i] = Math.max(0, st.wave[i] - dt); st.kick[i] = Math.max(0, st.kick[i] - dt * 1.8); }
    st.thump = Math.max(0, st.thump - dt * 1.1); st.rumble = Math.max(0, st.rumble - dt * 1.2); st.think = Math.max(0, st.think - dt);
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm(), k;
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(86, 50, 40, 12, 0, 0, 6.283); g.ellipse(318, 72, 34, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(4, 246, VW - 8, VH - 250);
    g.fillStyle = '#a5cf92'; g.fillRect(4, 246, VW - 8, 5);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(FX, FY + 3, 46, 7, 0, 0, 6.283); g.fill();

    var breath = calm ? 0.3 : 0.5 - 0.5 * Math.cos(st.clock * 2.2);
    var q = pose();
    g.save(); g.translate(FX, FY);
    if (st.rumble > 0) g.translate(Math.sin(st.clock * 45) * 2.5 * st.rumble, 0);
    var J = B.draw(g, q, { skin: 1, breath: breath, face: st.wave[0] > 0 || st.wave[1] > 0 || st.kick[0] > 0 || st.kick[1] > 0 ? 'laugh' : 'smile', t: st.clock });
    if (st.thump > 0) {                                    // two rings: thump-thump
      for (k = 0; k < 2; k++) {
        var u = Math.min(1, Math.max(0, (1 - st.thump) * 1.6 - k * 0.28));
        if (u <= 0 || u >= 1) continue;
        g.strokeStyle = 'rgba(216,57,74,' + (0.8 * (1 - u)) + ')'; g.lineWidth = 4;
        g.beginPath(); g.arc(J.heart.x, J.heart.y, 8 + u * 30, 0, 6.283); g.stroke();
      }
    }
    if (st.rumble > 0) {                                   // wobbly lines round the tummy
      g.strokeStyle = 'rgba(59,58,54,' + (0.6 * st.rumble) + ')'; g.lineWidth = 2.5;
      [-1, 1].forEach(function (s) {
        g.beginPath(); g.moveTo(s * 44, -118); g.quadraticCurveTo(s * 52, -110, s * 44, -102); g.quadraticCurveTo(s * 36, -94, s * 44, -86); g.stroke();
      });
    }
    if (st.think > 0) {
      var pop = Math.min(1, (2.2 - st.think) * 5) * Math.min(1, st.think * 4);
      C.bubble(g, 64, J.head.y - 46, 24 * pop, 1);
      if (pop > 0.5) C.food(g, st.thought, 64, J.head.y - 46, 11 * pop);
    }
    g.restore();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.hello = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    origin: { x: FX, y: FY }, touch: touch, partAt: partAt };
})(window);
