/* Moment — earn, spend, save, share.
 * Tap an apple: it drops in the wombat's basket and the wombat pays a coin (earning).
 * Drag a coin to the ice-cream cart (spend), the jar (save) or the frog (share).
 * The kite costs four coins: the dots on its tag fill as the jar fills. Tap the kite to buy it.
 * No choice is marked better than another.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, KITE_PRICE = 4, MAX = 8;
  var APPLES = [[40, 82], [72, 58], [102, 86], [54, 118], [94, 122]];
  var WOMBAT = { x: 152, y: 200 }, BASKET = { x: 108, y: 240 };
  var KOALA = { x: 245, y: 142 }, HAND = { x: 245, y: 242 };
  var CART = { x: 348, y: 226 }, JAR = { x: 432, y: 230 }, FROG = { x: 335, y: 88 }, KITE = { x: 430, y: 62 };

  var frame, surf, loop, off, fx, st;

  function fresh() {
    return { ripe: [0, 0, 0, 0, 0], hand: 0, jar: 0, drag: null, mood: {}, kite: 0, tag: 0, jingle: 0, clock: 0, told: {} };
  }
  function setMood(who, m, secs) { st.mood[who] = { m: m, t: secs }; }
  function moodOf(who, rest) { return st.mood[who] ? st.mood[who].m : rest; }
  function say(key, html) { if (!st.told[key]) { st.told[key] = true; frame.caption(html); } }

  function start(stage, api) {
    frame = api; fx = C.flights(); st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) {
        var p = surf.toView(q);
        if (st.hand > 0 && Math.abs(p.x - HAND.x) < 62 && Math.abs(p.y - HAND.y) < 28) st.drag = { from: 'hand', x: p.x, y: p.y };
        else if (st.jar > 0 && Math.hypot(p.x - JAR.x, p.y - JAR.y) < 36) st.drag = { from: 'jar', x: p.x, y: p.y, start: p };
      },
      move: function (q) { if (st.drag) { var p = surf.toView(q); st.drag.x = p.x; st.drag.y = p.y; } },
      up: function (q) {
        var d = st.drag; if (!d) return;
        st.drag = null;
        var p = surf.toView(q);
        if (Math.hypot(p.x - CART.x, p.y - CART.y) < 48) { take(d.from); buyIce(p, 'koala', KOALA); say('price', 'The <b>price</b> is how many coins something costs.'); }
        else if (Math.hypot(p.x - FROG.x, p.y - FROG.y - 14) < 52) {
          take(d.from); BQ.sound.coin(); setMood('frog', 'happy', 1);
          fx.send('coin', '', p.x, p.y, FROG.x, FROG.y + 30, function () { buyIce({ x: FROG.x, y: FROG.y + 30 }, 'frog', FROG); });
          say('share', 'You shared a coin, and your friend bought an ice cream.');
        }
        else if (d.from === 'hand' && Math.hypot(p.x - JAR.x, p.y - JAR.y) < 48 && st.jar < MAX) {
          st.hand--; st.jar++; st.jingle = 1; BQ.sound.coin();
          say('save', 'Coins in the jar are saved for later.');
        }
        else if (d.from === 'jar' && Math.abs(p.x - HAND.x) < 80 && Math.abs(p.y - HAND.y) < 50 && st.hand < MAX) { st.jar--; st.hand++; BQ.sound.coin(); }
      },
      cancel: function () { st.drag = null; },
      tap: function (q) {
        var p = surf.toView(q), i;
        for (i = 0; i < APPLES.length; i++) {
          if (st.ripe[i] <= 0 && Math.hypot(p.x - APPLES[i][0], p.y - APPLES[i][1]) < 24) { pick(i); return; }
        }
        if (Math.hypot(p.x - KITE.x, p.y - KITE.y - 10) < 50 && st.kite <= 0) {
          if (st.jar >= KITE_PRICE) {
            st.jar -= KITE_PRICE; st.kite = 7; BQ.sound.whoosh(); setMood('koala', 'happy', 7);
            say('kite', 'You saved up, and now you can buy something big!');
          } else { st.tag = 1; BQ.sound.click(); }
          return;
        }
        if (Math.hypot(p.x - JAR.x, p.y - JAR.y) < 36) { st.jingle = 1; BQ.sound.coin(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function take(from) { if (from === 'hand') st.hand--; else st.jar--; }
  function pick(i) {
    st.ripe[i] = 5;                                       // grows back in a few seconds
    BQ.sound.plop();
    fx.send('food', 'apple', APPLES[i][0], APPLES[i][1], BASKET.x, BASKET.y, function () {
      if (st.hand >= MAX) return;
      setMood('wombat', 'happy', 1.2);
      fx.send('coin', '', WOMBAT.x, WOMBAT.y + 10, HAND.x, HAND.y, function () {
        st.hand = Math.min(MAX, st.hand + 1); BQ.sound.coin();
        say('earn', 'You picked an apple, so the wombat pays you. You earned a coin.');
      });
    });
  }
  function buyIce(p, who, at) {
    BQ.sound.coin();
    fx.send('coin', '', p.x, p.y, CART.x, CART.y, function () {
      fx.send('food', 'icecream', CART.x, CART.y - 20, at.x, at.y + 26, function () { setMood(who, 'yum', 2); BQ.sound.squeak(); });
    });
  }

  function tick(dt) {
    st.clock += dt; fx.tick(dt);
    for (var i = 0; i < st.ripe.length; i++) st.ripe[i] = Math.max(0, st.ripe[i] - dt);
    Object.keys(st.mood).forEach(function (k) { if (st.mood[k] && (st.mood[k].t -= dt) <= 0) st.mood[k] = null; });
    st.kite = Math.max(0, st.kite - dt); st.tag = Math.max(0, st.tag - dt * 1.3); st.jingle = Math.max(0, st.jingle - dt * 2.5);
    draw();
  }

  function tag(g, x, y, price, filled, pulse) {           // a price tag: one dot per coin
    var w = price * 15 + 10, k = 1 + pulse * 0.25 * Math.abs(Math.sin(st.clock * 16));
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 2.5;
    D.round(g, -w / 2, -11, w, 22, 6); g.fill(); g.stroke();
    for (var i = 0; i < price; i++) C.coin(g, -w / 2 + 12.5 + i * 15, 0, 6, i >= filled);
    g.restore();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, k, calm = BQ.calm();
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(4, 186, VW - 8, VH - 190);
    g.fillStyle = '#a5cf92'; g.fillRect(4, 186, VW - 8, 5);

    // the apple tree: the job
    g.fillStyle = '#8b7355'; g.fillRect(63, 120, 16, 96);
    g.fillStyle = '#7cc36a'; g.strokeStyle = '#5da24c'; g.lineWidth = 3;
    g.beginPath(); g.arc(72, 92, 62, 0, 6.283); g.fill(); g.stroke();
    for (i = 0; i < APPLES.length; i++) {
      var grow = st.ripe[i] <= 0 ? 1 : Math.max(0, 1 - st.ripe[i] / 1.5);
      var wig = (!calm && !st.told.earn && grow === 1) ? Math.sin(st.clock * 5 + i) * 2 : 0;
      if (grow > 0.05) C.food(g, 'apple', APPLES[i][0] + wig, APPLES[i][1], 11 * grow);
    }
    C.critter(g, 'wombat', WOMBAT.x, WOMBAT.y, 22, moodOf('wombat', 'want'), st.clock);
    g.fillStyle = '#c99a5b'; g.strokeStyle = '#8b7355'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(BASKET.x - 24, BASKET.y - 8); g.lineTo(BASKET.x + 24, BASKET.y - 8);
    g.lineTo(BASKET.x + 18, BASKET.y + 16); g.lineTo(BASKET.x - 18, BASKET.y + 16); g.closePath(); g.fill(); g.stroke();
    C.food(g, 'apple', BASKET.x - 9, BASKET.y - 10, 7); C.food(g, 'apple', BASKET.x + 8, BASKET.y - 11, 7);

    // the friend, and the kite up on its hook
    C.critter(g, 'frog', FROG.x, FROG.y, 22, moodOf('frog', 'want'), st.clock);
    if (!st.mood.frog) { C.bubble(g, FROG.x - 42, FROG.y - 34, 16, -1); C.food(g, 'icecream', FROG.x - 42, FROG.y - 36, 7); }
    if (st.kite > 0) {
      var t = st.clock * 1.6, kx = 250 + Math.cos(t) * 120, ky = 52 + Math.sin(t * 2) * 22;
      g.strokeStyle = 'rgba(59,58,54,.5)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(KOALA.x + 28, KOALA.y + 30); g.quadraticCurveTo((KOALA.x + kx) / 2, ky + 70, kx, ky + 22); g.stroke();
      C.food(g, 'kite', kx, ky, 18);
    } else {
      var ready = st.jar >= KITE_PRICE && !calm ? Math.sin(st.clock * 8) * 0.12 : 0;
      g.save(); g.translate(KITE.x, KITE.y); g.rotate(ready); C.food(g, 'kite', 0, 0, 20); g.restore();
    }
    // a dotted line ties the jar to the kite's price
    g.setLineDash([3, 6]); g.strokeStyle = 'rgba(59,58,54,.35)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(JAR.x, JAR.y - 40); g.lineTo(JAR.x, 150); g.stroke(); g.setLineDash([]);
    tag(g, KITE.x, 134, KITE_PRICE, st.kite > 0 ? 0 : Math.min(st.jar, KITE_PRICE), st.tag);

    // you
    C.critter(g, 'koala', KOALA.x, KOALA.y, 30, moodOf('koala', 'want'), st.clock);
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, HAND.x - 60, HAND.y - 20, 120, 40, 14); g.fill(); g.stroke();
    var shown = st.hand - (st.drag && st.drag.from === 'hand' ? 1 : 0);
    for (k = 0; k < shown; k++) C.coin(g, HAND.x - 45 + k * 13, HAND.y, 10);

    // ice-cream cart
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, CART.x - 34, CART.y - 12, 68, 36, 8); g.fill(); g.stroke();
    g.fillStyle = '#f2788f'; g.beginPath(); g.moveTo(CART.x - 44, CART.y - 40); g.lineTo(CART.x + 44, CART.y - 40); g.lineTo(CART.x + 32, CART.y - 54); g.lineTo(CART.x - 32, CART.y - 54); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(CART.x - 30, CART.y - 40); g.lineTo(CART.x - 30, CART.y - 12); g.moveTo(CART.x + 30, CART.y - 40); g.lineTo(CART.x + 30, CART.y - 12); g.stroke();
    g.fillStyle = INK.line; g.beginPath(); g.arc(CART.x - 20, CART.y + 28, 8, 0, 6.283); g.arc(CART.x + 20, CART.y + 28, 8, 0, 6.283); g.fill();
    C.food(g, 'icecream', CART.x, CART.y - 24, 10);
    tag(g, CART.x, CART.y + 6, 1, 1, 0);

    // the saving jar
    var jx = JAR.x + (st.jingle > 0 ? Math.sin(st.clock * 40) * 2 * st.jingle : 0);
    g.fillStyle = 'rgba(255,255,255,.75)'; D.round(g, jx - 26, JAR.y - 30, 52, 62, 12); g.fill();
    var inJar = st.jar - (st.drag && st.drag.from === 'jar' ? 1 : 0);
    for (k = 0; k < inJar; k++) C.coin(g, jx - 13 + (k % 3) * 13, JAR.y + 22 - Math.floor(k / 3) * 13, 7);
    g.strokeStyle = INK.line; g.lineWidth = 3.5; D.round(g, jx - 26, JAR.y - 30, 52, 62, 12); g.stroke();
    g.fillStyle = '#8b7355'; D.round(g, jx - 20, JAR.y - 40, 40, 11, 5); g.fill();

    fx.draw(g, 12);
    if (st.drag) C.coin(g, st.drag.x, st.drag.y - 14, 13);
  }

  function reset() { if (!st) return; fx.clear(); st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = fx = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.jar = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    spots: { apples: APPLES, hand: HAND, cart: CART, jar: JAR, frog: FROG, kite: KITE } };
})(window);
