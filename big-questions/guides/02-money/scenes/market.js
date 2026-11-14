/* Centrepiece — the little market.
 * Drag someone's food to another stall to offer a swap: it jams, because nobody wants what
 * the other one has. Tap the coin jar: now everyone takes coins. Drag a coin to a stall to
 * buy, and the same trades flow. Tap the jar again and the coins go back.
 * Rules live in market-sim.js; this file draws and listens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, JAR = { x: 240, y: 256 };
  var AWNING = ['#f2788f', '#6fb6d9', '#f5b942'];

  var frame, surf, loop, off, sim, fx, st;

  function cx(i) { return 90 + i * 150; }
  function goodsAt(i) { return { x: cx(i) - 26, y: 176 }; }
  function coinsAt(i) { return { x: cx(i) + 30, y: 186 }; }
  function fresh() { return { drag: null, mood: [null, null, null], pulse: [0, 0, 0], hop: [0, 0, 0], clock: 0, bought: 0, deal: 0, told: {} }; }

  function start(stage, api) {
    frame = api; sim = BQ.marketSim.create(); fx = C.flights(); st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q), i, c;
        for (i = 0; i < 3; i++) {
          c = coinsAt(i);
          if (sim.state.coinsOn && sim.state.folk[i].coins > 0 && Math.hypot(p.x - c.x - 8, p.y - c.y) < 26) { st.drag = { type: 'coin', from: i, x: p.x, y: p.y }; return; }
          c = goodsAt(i);
          if (Math.hypot(p.x - c.x, p.y - c.y) < 30) { st.drag = { type: 'good', from: i, x: p.x, y: p.y }; return; }
        }
      },
      move: function (q) { if (st.drag) { var p = surf.toView(q); st.drag.x = p.x; st.drag.y = p.y; } },
      up: function (q) {
        var d = st.drag; if (!d) return;
        st.drag = null;
        var p = surf.toView(q), to = -1;
        for (var i = 0; i < 3; i++) if (i !== d.from && Math.abs(p.x - cx(i)) < 72 && p.y < 228) to = i;
        if (to < 0) { home(d, p); return; }
        if (d.type === 'good') offer(d.from, to, p); else pay(d.from, to, p);
      },
      tap: function (q) {
        var p = surf.toView(q);
        if (Math.hypot(p.x - JAR.x, p.y - JAR.y) < 44) { toggleCoins(); return; }
        for (var i = 0; i < 3; i++) if (Math.hypot(p.x - cx(i), p.y - 112) < 34) { st.hop[i] = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function setMood(i, mood, secs) { st.mood[i] = { m: mood, t: secs }; }
  function home(d, p) {                                   // the thing she let go of flies back
    var h = d.type === 'coin' ? coinsAt(d.from) : goodsAt(d.from);
    fx.send(d.type === 'coin' ? 'coin' : 'food', sim.state.folk[d.from].has, p.x, p.y, h.x, h.y);
  }
  function offer(from, to, p) {
    var r = sim.offer(from, to), f = sim.state.folk;
    if (r.type === 'swap') {                               // cannot happen in this ring, but the rules allow it
      var b = goodsAt(to);
      fx.send('food', f[from].has, p.x, p.y, cx(to), 150, function () { setMood(to, 'yum', 1.6); });
      fx.send('food', f[to].has, b.x, b.y, cx(from), 150, function () { setMood(from, 'yum', 1.6); });
      BQ.sound.squeak();
      return;
    }
    home({ type: 'good', from: from }, p);
    setMood(r.refuser, 'no', 0.9); st.pulse[r.refuser] = 1;
    BQ.sound.nope();
    if (sim.state.jams >= 2 && !sim.state.coinsOn && !st.told.jam) {
      st.told.jam = true;
      frame.caption("Stuck! A <b>swap</b> only works if you both want each other's things.");
    }
  }
  function pay(from, to, p) {
    var r = sim.pay(from, to);
    if (r.type !== 'buy') { home({ type: 'coin', from: from }, p); return; }
    var c = coinsAt(to), g = goodsAt(to);
    BQ.sound.coin();
    fx.send('coin', '', p.x, p.y, c.x, c.y, function () {
      fx.send('food', r.good, g.x, g.y, cx(from), 150, function () {
        setMood(from, r.liked ? 'yum' : 'meh', r.liked ? 1.6 : 1.1);
        if (r.liked) BQ.sound.squeak(); else BQ.sound.nope();
      });
    });
    st.bought++;
    if (st.bought === 3 && !st.told.round) {
      st.told.round = true;
      frame.caption('The coins go round and round, and everyone gets fed.');
    }
  }
  function toggleCoins() {
    var on = !sim.state.coinsOn, i, k, c;
    sim.setCoins(on);
    BQ.sound.coin();
    fx.clear();
    for (i = 0; i < 3; i++) for (k = 0; k < 2; k++) {
      c = coinsAt(i);
      if (on) fx.send('coin', '', JAR.x, JAR.y - 10, c.x + k * 7, c.y, null, (i * 2 + k) * 0.12);
      else fx.send('coin', '', c.x, c.y, JAR.x, JAR.y - 10, null, (i * 2 + k) * 0.08);
    }
    st.bought = 0; st.told.round = false; st.deal = on ? 1.1 : 0;
    frame.caption(on ? 'Now everyone takes coins. Coins are <b>money</b>.' : '');
    if (!on) st.told.jam = false;
  }

  function tick(dt) {
    st.clock += dt; sim.tick(dt); fx.tick(dt); st.deal = Math.max(0, st.deal - dt);
    for (var i = 0; i < 3; i++) {
      if (st.mood[i] && (st.mood[i].t -= dt) <= 0) st.mood[i] = null;
      st.pulse[i] = Math.max(0, st.pulse[i] - dt * 1.2);
      st.hop[i] = Math.max(0, st.hop[i] - dt * 2.4);
    }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), s = sim.state, i, k, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(4, 206, VW - 8, VH - 210);
    g.fillStyle = '#a5cf92'; g.fillRect(4, 206, VW - 8, 5);

    for (i = 0; i < 3; i++) {
      var x = cx(i), f = s.folk[i], hungry = f.fed <= 0;
      var mood = st.mood[i] ? st.mood[i].m : hungry ? 'want' : 'happy';
      // posts and awning
      g.strokeStyle = '#8b7355'; g.lineWidth = 5;
      g.beginPath(); g.moveTo(x - 58, 50); g.lineTo(x - 58, 206); g.moveTo(x + 58, 50); g.lineTo(x + 58, 206); g.stroke();
      // who is behind the counter
      var hop = Math.sin(st.hop[i] * Math.PI) * 14, wantPulse = 1 + st.pulse[i] * 0.45 * Math.abs(Math.sin(st.clock * 14));
      C.critter(g, f.who, x, 112 - hop, 26, mood, st.clock);
      // counter
      g.fillStyle = '#d9b98a'; D.round(g, x - 64, 150, 128, 58, 8); g.fill();
      g.strokeStyle = '#8b7355'; g.lineWidth = 3; D.round(g, x - 64, 150, 128, 58, 8); g.stroke();
      g.fillStyle = AWNING[i]; D.round(g, x - 68, 28, 136, 26, 8); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)';
      for (k = 0; k < 4; k++) g.fillRect(x - 56 + k * 34, 30, 14, 22);
      g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, x - 68, 28, 136, 26, 8); g.stroke();
      // what they have: a little pile that never runs out
      var gp = goodsAt(i), bob = (!calm && !st.drag && st.clock % 6 < 0.6) ? Math.sin(st.clock * 20) * 1.5 : 0;
      C.food(g, f.has, gp.x - 11, gp.y + 6, 10); C.food(g, f.has, gp.x + 11, gp.y + 6, 10); C.food(g, f.has, gp.x, gp.y - 6 + bob, 10);
      // their coins
      if (s.coinsOn && st.deal <= 0) {
        var cp = coinsAt(i), n = f.coins - (st.drag && st.drag.type === 'coin' && st.drag.from === i ? 1 : 0);
        for (k = 0; k < n; k++) C.coin(g, cp.x + (k % 4) * 7, cp.y - Math.floor(k / 4) * 9, 8);
      }
      // what they are thinking about
      C.bubble(g, x + 44, 70, 18 * (hungry ? wantPulse : 1), 1);
      if (hungry) C.food(g, f.wants, x + 44, 70, 9 * wantPulse); else C.food(g, 'heart', x + 44, 71, 9);
    }

    // the coin jar: full when the coins are put away
    var hint = (!s.coinsOn && s.jams >= 2 && !calm) ? 1 + 0.07 * Math.sin(st.clock * 7) : 1;
    g.save(); g.translate(JAR.x, JAR.y); g.scale(hint, hint);
    g.fillStyle = 'rgba(255,255,255,.75)'; D.round(g, -30, -30, 60, 64, 12); g.fill();
    if (!s.coinsOn) for (k = 0; k < 6; k++) C.coin(g, -16 + (k % 3) * 16, 22 - Math.floor(k / 3) * 15, 8);
    g.strokeStyle = INK.line; g.lineWidth = 3.5; D.round(g, -30, -30, 60, 64, 12); g.stroke();
    g.fillStyle = '#8b7355'; D.round(g, -24, -40, 48, 12, 5); g.fill();
    g.restore();

    fx.draw(g, 11);
    if (st.drag) {
      if (st.drag.type === 'coin') C.coin(g, st.drag.x, st.drag.y - 14, 12);
      else C.food(g, s.folk[st.drag.from].has, st.drag.x, st.drag.y - 14, 14);
    }
  }

  function reset() { if (!st) return; sim.reset(); fx.clear(); st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = sim = fx = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.market = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, view: function () { return st; },
    spots: { cx: cx, goodsAt: goodsAt, coinsAt: coinsAt, jar: JAR } };
})(window);
