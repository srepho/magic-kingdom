/* Opening — a picnic swap.
 * Two friends each have a snack and fancy the other one's. Drag either snack across:
 * they swap and munch. Then new snacks appear. Here a swap always works, because each
 * wants what the other has. The market is where that stops being true.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 400, VH = 300;
  var WHO = [{ kind: 'koala', x: 125, y: 140 }, { kind: 'wombat', x: 275, y: 140 }];
  var HELD = [{ x: 168, y: 214 }, { x: 232, y: 214 }];
  var SNACKS = ['banana', 'biscuit', 'berry', 'apple', 'bread'];

  var frame, surf, loop, off, fx, st;

  function deal(prev) {
    var a, b;
    do { a = SNACKS[Math.floor(Math.random() * SNACKS.length)]; b = SNACKS[Math.floor(Math.random() * SNACKS.length)]; }
    while (a === b || (prev && a === prev[0] && b === prev[1]));
    return [a, b];
  }
  function fresh() { return { has: deal(), eating: 0, next: 0, drag: null, hop: [0, 0], swaps: 0, clock: 0, pop: 1 }; }

  function start(stage, api) {
    frame = api; fx = C.flights(); st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        if (st.eating > 0 || fx.busy()) return;
        var p = surf.toView(q);
        for (var i = 0; i < 2; i++) if (Math.hypot(p.x - HELD[i].x, p.y - HELD[i].y) < 34) { st.drag = { from: i, x: p.x, y: p.y }; return; }
      },
      move: function (q) { if (st.drag) { var p = surf.toView(q); st.drag.x = p.x; st.drag.y = p.y; } },
      up: function (q) {
        var d = st.drag; if (!d) return;
        st.drag = null;
        var p = surf.toView(q), o = 1 - d.from;
        var near = Math.hypot(p.x - WHO[o].x, p.y - WHO[o].y - 20) < 78 || Math.hypot(p.x - HELD[o].x, p.y - HELD[o].y) < 44;
        if (!near) { fx.send('food', st.has[d.from], p.x, p.y, HELD[d.from].x, HELD[d.from].y); return; }
        // the swap: mine goes to you, yours comes to me
        var mine = st.has[d.from], yours = st.has[o];
        st.has = [null, null];
        fx.send('food', mine, p.x, p.y, WHO[o].x, WHO[o].y + 22);
        fx.send('food', yours, HELD[o].x, HELD[o].y, WHO[d.from].x, WHO[d.from].y + 22, function () {
          st.eating = 1.7; st.next = 2.6; BQ.sound.squeak();
        });
        BQ.sound.whoosh();
        st.swaps++;
        if (st.swaps === 1) frame.caption('A <b>swap</b>: I give you mine, and you give me yours.');
        if (st.swaps === 2) frame.nudgeToy();
      },
      cancel: function () { st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q);
        for (var i = 0; i < 2; i++) if (Math.hypot(p.x - WHO[i].x, p.y - WHO[i].y) < 40) { st.hop[i] = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function tick(dt) {
    st.clock += dt; fx.tick(dt);
    st.eating = Math.max(0, st.eating - dt);
    st.pop = Math.min(1, st.pop + dt * 3);
    st.hop[0] = Math.max(0, st.hop[0] - dt * 2.4); st.hop[1] = Math.max(0, st.hop[1] - dt * 2.4);
    if (st.next > 0 && (st.next -= dt) <= 0) { st.has = deal(); st.pop = 0; BQ.sound.plop(); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, k, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(300, 46, 44, 13, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.beginPath(); g.moveTo(4, 150); g.quadraticCurveTo(200, 120, 396, 150); g.lineTo(396, 290); g.lineTo(4, 290); g.closePath(); g.fill();
    g.fillStyle = '#8b7355'; g.fillRect(44, 60, 12, 80);
    g.fillStyle = '#7cc36a'; g.beginPath(); g.arc(50, 52, 38, 0, 6.283); g.fill();
    // rug
    g.save(); g.beginPath(); g.ellipse(200, 232, 150, 44, 0, 0, 6.283); g.clip();
    g.fillStyle = '#f6d7d2'; g.fillRect(40, 180, 320, 100);
    g.fillStyle = 'rgba(228,83,74,.55)';
    for (k = 0; k < 9; k++) g.fillRect(44 + k * 38, 180, 14, 100);
    for (k = 0; k < 4; k++) g.fillRect(40, 192 + k * 24, 320, 9);
    g.restore();

    for (i = 0; i < 2; i++) {
      var w = WHO[i], hop = Math.sin(st.hop[i] * Math.PI) * 16, side = i ? -1 : 1;
      var mood = st.eating > 0 ? 'yum' : 'want';
      C.critter(g, w.kind, w.x, w.y - hop, 32, mood, st.clock);
      var other = st.has[1 - i];
      if (other && st.eating <= 0) {                       // each is thinking about the other's snack
        var bx = w.x - side * 46, by = 70 + (calm ? 0 : Math.sin(st.clock * 1.6 + i) * 2);
        C.bubble(g, bx, by, 20, -side); C.food(g, other, bx, by, 10);
      } else if (st.eating > 0) { C.bubble(g, w.x - side * 46, 70, 20, -side); C.food(g, 'heart', w.x - side * 46, 71, 10); }
      if (st.has[i] && !(st.drag && st.drag.from === i)) {
        var wig = (!calm && !st.swaps && st.clock % 3 < 0.5) ? Math.sin(st.clock * 22) * 3 : 0;
        C.food(g, st.has[i], HELD[i].x + wig, HELD[i].y, 17 * st.pop);
      }
    }
    fx.draw(g, 16);
    if (st.drag) C.food(g, st.has[st.drag.from], st.drag.x, st.drag.y - 16, 19);
  }

  function reset() { if (!st) return; fx.clear(); st = fresh(); frame.caption(''); frame.nudgeToy(false); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = fx = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.picnic = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: { held: HELD, who: WHO } };
})(window);
