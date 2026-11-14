/* Opening — hands up.
 * Five friends, two games (ball or kite). Each is thinking of the one they want.
 * Tap a game: the friends who want it put their hands up. If that is most of them, everyone
 * plays it, and then a new round starts. If it is only a few, nothing is wrong: try the other.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300;
  var KINDS = ['wombat', 'frog', 'koala', 'frog', 'wombat'], FUR = { wombat: '#a17a55', koala: '#aeb5bd', frog: '#7cc36a' };
  var CARDS = [{ x: 130, y: 252, game: 'ball' }, { x: 270, y: 252, game: 'kite' }];

  var frame, surf, loop, off, st;

  function fx(i) { return 72 + i * 64; }
  function deal() {
    var p;
    do { p = KINDS.map(function () { return Math.random() < 0.5 ? 0 : 1; }); }
    while (p.every(function (v) { return v === p[0]; }));     // both games wanted by someone
    return p;
  }
  function fresh() { return { prefs: deal(), up: null, upT: 0, play: null, playT: 0, plays: 0, clock: 0, pop: 1 }; }
  function wanting(k) { return st.prefs.filter(function (p) { return p === k; }).length; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      tap: function (q) {
        if (st.play !== null) return;
        var p = surf.toView(q);
        for (var k = 0; k < 2; k++) {
          if (Math.abs(p.x - CARDS[k].x) < 58 && Math.abs(p.y - CARDS[k].y) < 40) {
            st.up = k; st.upT = 0; BQ.sound.click();
            if (wanting(k) < 3) BQ.sound.nope();
            return;
          }
        }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; st.pop = Math.min(1, st.pop + dt * 3);
    if (st.up !== null && st.play === null) {
      st.upT += dt;
      if (st.upT > 0.9 && wanting(st.up) >= 3) {            // most hands: that is the one
        st.play = st.up; st.playT = 3.4; st.plays++; BQ.sound.squeak();
        if (st.plays === 1) frame.caption('Hands up! Most friends chose this one. That is a <b>vote</b>.');
        if (st.plays === 2) frame.nudgeToy();
      }
    }
    if (st.play !== null && (st.playT -= dt) <= 0) { st.play = null; st.up = null; st.prefs = deal(); st.pop = 0; BQ.sound.plop(); }
    draw();
  }

  function ball(g, x, y, r) {
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = Math.max(1.5, r * 0.14);
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.fillStyle = '#e4534a'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, -1.2, 0.2); g.closePath(); g.fill();
    g.fillStyle = '#5aa9dc'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, 1.9, 3.3); g.closePath(); g.fill();
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
  }
  function game(g, k, x, y, s) { if (k === 0) ball(g, x, y, s); else C.food(g, 'kite', x, y - s * 0.3, s * 0.8); }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(90, 40, 40, 12, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.beginPath(); g.moveTo(4, 150); g.quadraticCurveTo(200, 128, 396, 150); g.lineTo(396, 292); g.lineTo(4, 292); g.closePath(); g.fill();

    for (i = 0; i < 5; i++) {
      var x = fx(i), want = st.prefs[i], playing = st.play !== null;
      var hands = playing || (st.up !== null && want === st.up);
      var hop = playing ? Math.abs(Math.sin(st.clock * 7 + i)) * 12 : hands ? Math.abs(Math.sin(Math.min(st.upT, 0.5) * 6.283)) * 8 : 0;
      var y = 150 - hop, s = 22;
      var mood = playing ? 'happy' : hands ? 'happy' : (st.up !== null ? 'meh' : 'want');
      // arms: up for "me!", down otherwise
      g.lineCap = 'round';
      [-1, 1].forEach(function (d) {
        var ax = x + d * s * 0.85, ay = y + s * 0.85, bx = x + d * s * (hands ? 1.2 : 1.25), by = y + s * (hands ? -0.55 : 1.55);
        g.strokeStyle = INK.line; g.lineWidth = s * 0.42; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
        g.strokeStyle = FUR[KINDS[i]]; g.lineWidth = s * 0.26; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      });
      C.critter(g, KINDS[i], x, y, s, mood, st.clock + i);
      if (!playing) {
        var by2 = 94 - hop + (calm ? 0 : Math.sin(st.clock * 1.5 + i) * 1.5);
        C.bubble(g, x + 16, by2, 15 * st.pop, 1); game(g, want, x + 16, by2 + (want ? 3 : 0), 8 * st.pop);
      }
    }
    if (st.play === 0) {                                     // everyone plays ball
      var t = st.clock * 2.2, bx3 = 200 + Math.sin(t) * 150;
      ball(g, bx3, 70 - Math.abs(Math.sin(t * 2.5)) * 40 + 20, 13);
    } else if (st.play === 1) {                              // or flies the kite
      var t2 = st.clock * 1.4, kx = 200 + Math.cos(t2) * 120, ky = 52 + Math.sin(t2 * 2) * 18;
      g.strokeStyle = 'rgba(59,58,54,.5)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(fx(2) + 26, 118); g.quadraticCurveTo((fx(2) + kx) / 2, ky + 60, kx, ky + 20); g.stroke();
      C.food(g, 'kite', kx, ky, 17);
    }

    // the two games to choose between
    for (i = 0; i < 2; i++) {
      var c = CARDS[i], sel = st.up === i, wig = (!calm && st.up === null && st.clock % 3 < 0.5) ? Math.sin(st.clock * 22) * 3 : 0;
      g.fillStyle = sel ? '#fff7d6' : '#fff'; g.strokeStyle = sel ? '#a66a00' : INK.line; g.lineWidth = sel ? 5 : 3;
      D.round(g, c.x - 54 + wig, c.y - 34, 108, 68, 16); g.fill(); g.stroke();
      game(g, i, c.x + wig, c.y + (i ? 2 : 0), 20);
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.hands = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: { cards: CARDS } };
})(window);
