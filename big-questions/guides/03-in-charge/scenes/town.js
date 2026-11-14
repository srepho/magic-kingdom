/* Centrepiece — the tiny town.
 * The town needs things (a playground first). Tap the need card with no leader and everyone
 * shouts something different: nothing gets built. Tap the ballot box: everyone votes for the
 * candidate they like, and the one with most votes becomes leader. Now tapping a need makes
 * the leader decide, their way. Tap a townsperson to change their mind, and vote again.
 * Rules live in town-sim.js; this file draws and listens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300;
  var SIDE = ['#f5a742', '#5aa9dc'];                         // hill candidate, river candidate
  var CAND = [{ kind: 'wombat', x: 38, y: 218 }, { kind: 'koala', x: 442, y: 218 }];
  var TUBE = [{ x: 76, y: 284 }, { x: 404, y: 284 }];
  var BOX = { x: 240, y: 270 }, CARD = { x: 240, y: 58 };
  var KINDS = ['frog', 'koala', 'wombat', 'frog', 'wombat', 'koala', 'frog'];
  var SLOT = [
    [[52, 134], [106, 116], [160, 132], [60, 182], [114, 172], [168, 184]],
    [[292, 140], [338, 126], [384, 140], [300, 186], [345, 176], [388, 188]]
  ];

  var frame, surf, loop, off, sim, st;

  function vx(i) { return 105 + i * 45; }
  function fresh() {
    return { clock: 0, hop: [0, 0, 0, 0, 0, 0, 0], shout: 0, think: [0, 0, 0, 0, 0, 0, 0], voting: null,
             landed: [0, 0], shown: null, balls: [], pop: [], cardShake: 0, cheer: 0, told: {} };
  }

  function start(stage, api) {
    frame = api; sim = BQ.townSim.create(); st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      tap: function (q) {
        if (st.voting) return;
        var p = surf.toView(q), i;
        if (Math.hypot(p.x - BOX.x, p.y - BOX.y) < 40) { election(); return; }
        if (sim.nextNeed() && Math.abs(p.x - CARD.x) < 44 && Math.abs(p.y - CARD.y) < 40) { need(); return; }
        for (i = 0; i < 7; i++) {
          if (Math.abs(p.x - vx(i)) < 22 && p.y > 176 && p.y < 252) {
            sim.flip(i); st.think[i] = 1; st.hop[i] = 1; BQ.sound.squeak();
            if (sim.state.leader !== null && !st.told.again) { st.told.again = true; frame.caption('Someone changed their mind. Vote again and see!'); }
            return;
          }
        }
        for (i = 0; i < 2; i++) if (Math.hypot(p.x - CAND[i].x, p.y - CAND[i].y) < 34) { st.cheer = 1; BQ.sound.squeak(); }
      }
    });
    loop = BQ.loop(tick);
  }

  function need() {
    var r = sim.ask();
    if (r.type === 'jam') {
      st.shout = 1.6; st.cardShake = 1; BQ.sound.nope();
      for (var i = 0; i < 7; i++) st.hop[i] = 0.6 + (i % 3) * 0.2;
      frame.caption('Everyone wants something different. Who decides?');
    } else if (r.type === 'built') {
      st.pop.push({ index: sim.state.built.length - 1, t: 0 });
      BQ.sound.plop();
      sim.state.voters.forEach(function (v, i) { if (v.pref === r.side) st.hop[i] = 1; });
      if (!st.told.decide) { st.told.decide = true; frame.caption('The <b>leader</b> decides for everyone. Nobody has to shout.'); }
      else if (sim.state.decisions === 3) frame.caption('Leaders we choose are a <b>government</b>. And we can choose again.');
    }
  }
  function election() {
    var r = sim.vote();
    st.landed = [0, 0]; st.shown = null; st.balls = [];
    st.voting = { next: 0, due: 0.2, result: r };
    BQ.sound.click();
    frame.caption('Time to <b>vote</b>! Everyone picks the one they like.');
  }

  function tick(dt) {
    st.clock += dt;
    var i, v = st.voting;
    for (i = 0; i < 7; i++) { st.hop[i] = Math.max(0, st.hop[i] - dt * 2.4); st.think[i] = Math.max(0, st.think[i] - dt * 1.5); }
    st.shout = Math.max(0, st.shout - dt); st.cardShake = Math.max(0, st.cardShake - dt * 2); st.cheer = Math.max(0, st.cheer - dt * 2);
    st.pop.forEach(function (p) { p.t += dt * 3; });
    st.pop = st.pop.filter(function (p) { return p.t < 1; });
    if (v) {
      v.due -= dt;
      if (v.next < 7 && v.due <= 0) {                        // one at a time, each drops a vote
        var side = sim.state.voters[v.next].pref;
        st.balls.push({ x0: vx(v.next), y0: 205, side: side, t: 0 });
        st.hop[v.next] = 1; v.next++; v.due = 0.28; BQ.sound.click();
      }
      st.balls.forEach(function (b) {
        b.t += dt / 0.5;
        if (b.t >= 1 && !b.done) { b.done = true; st.landed[b.side]++; BQ.sound.drip(); }
      });
      st.balls = st.balls.filter(function (b) { return !b.done; });
      if (v.next >= 7 && !st.balls.length) {                 // counted: the taller pile wins
        st.voting = null; st.shown = v.result.leader; st.cheer = 1; BQ.sound.coin();
        frame.caption(v.result.changed ? 'A new leader this time! We can always choose again.'
          : v.result.first ? 'The most votes wins. Now the town has a <b>leader</b>.'
          : 'The same leader again. Most people still liked their plan.');
      }
    }
    draw();
  }

  function flag(g, x, y, s, side) {
    g.strokeStyle = INK.line; g.lineWidth = Math.max(1.5, s * 0.14);
    g.beginPath(); g.moveTo(x, y + s * 1.3); g.lineTo(x, y - s); g.stroke();
    g.fillStyle = SIDE[side]; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 1.3, y - s * 0.55); g.lineTo(x, y - s * 0.1); g.closePath(); g.fill(); g.stroke();
  }
  function thing(g, what, x, y, col) {
    g.strokeStyle = INK.line; g.lineWidth = 2.5; g.fillStyle = col;
    if (what === 'playground') {
      g.beginPath(); g.moveTo(x - 16, y + 12); g.lineTo(x - 16, y - 14); g.lineTo(x - 2, y - 14); g.lineTo(x - 2, y + 12); g.stroke();
      g.beginPath(); g.moveTo(x - 2, y - 12); g.quadraticCurveTo(x + 10, y - 8, x + 20, y + 12); g.lineWidth = 6; g.strokeStyle = col; g.stroke();
      g.lineWidth = 2.5; g.strokeStyle = INK.line; D.round(g, x - 19, y - 22, 20, 9, 3); g.fill(); g.stroke();
    } else if (what === 'bench') {
      D.round(g, x - 15, y - 2, 30, 7, 2); g.fill(); g.stroke(); D.round(g, x - 15, y - 13, 30, 7, 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - 11, y + 5); g.lineTo(x - 11, y + 13); g.moveTo(x + 11, y + 5); g.lineTo(x + 11, y + 13); g.stroke();
    } else if (what === 'tree') {
      g.fillStyle = '#8b7355'; g.fillRect(x - 3, y - 2, 6, 15);
      g.fillStyle = '#7cc36a'; g.beginPath(); g.arc(x, y - 10, 14, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x - 5, y - 12, 3, 0, 6.283); g.arc(x + 5, y - 6, 3, 0, 6.283); g.fill();
    } else if (what === 'bin') {
      g.beginPath(); g.moveTo(x - 9, y - 10); g.lineTo(x + 9, y - 10); g.lineTo(x + 7, y + 13); g.lineTo(x - 7, y + 13); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = INK.line; D.round(g, x - 12, y - 15, 24, 6, 2); g.fill();
    } else if (what === 'fountain') {
      g.fillStyle = INK.water; g.beginPath(); g.ellipse(x, y + 8, 17, 6, 0, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = col; g.fillRect(x - 3, y - 8, 6, 15); g.strokeRect(x - 3, y - 8, 6, 15);
      g.strokeStyle = INK.waterDeep; g.beginPath(); g.moveTo(x, y - 9); g.quadraticCurveTo(x - 9, y - 20, x - 11, y + 2); g.moveTo(x, y - 9); g.quadraticCurveTo(x + 9, y - 20, x + 11, y + 2); g.stroke();
    } else {
      g.beginPath(); g.moveTo(x, y + 13); g.lineTo(x, y - 12); g.stroke();
      g.fillStyle = INK.sun; g.beginPath(); g.arc(x, y - 15, 6, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = col; D.round(g, x - 6, y + 10, 12, 5, 2); g.fill();
    }
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), s = sim.state, i, k, calm = BQ.calm();
    // sky, ground, the hill on one side and the river on the other
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, VH - 8, 14); g.clip();
    g.fillStyle = '#a5cf92'; g.beginPath(); g.ellipse(112, 170, 150, 86, 0, 0, 6.283); g.fill();
    g.fillStyle = '#b9dca8'; g.fillRect(0, 150, VW, 160);
    g.fillStyle = '#a5cf92'; g.beginPath(); g.ellipse(112, 152, 132, 22, 0, Math.PI, 0); g.fill();
    g.fillStyle = INK.water; g.beginPath(); g.moveTo(412, 150);
    for (k = 0; k <= 6; k++) g.lineTo(412 + Math.sin(k * 1.3) * 7, 150 + k * 26);
    g.lineTo(480, 306); g.lineTo(480, 150); g.closePath(); g.fill();
    g.restore();

    // what has been built
    s.built.forEach(function (b, n) {
      var at = SLOT[b.side][b.slot], pop = 1;
      st.pop.forEach(function (p) { if (p.index === n) pop = 0.3 + 0.7 * p.t + Math.sin(p.t * Math.PI) * 0.35; });
      g.save(); g.translate(at[0], at[1]); g.scale(pop, pop); thing(g, b.what, 0, 0, SIDE[b.by]); g.restore();
    });

    // the two candidates, each with a flag for their plan, and a clear tube for their votes
    for (i = 0; i < 2; i++) {
      var c = CAND[i], lead = st.shown === i, jump = lead ? Math.abs(Math.sin(st.cheer * Math.PI)) * 10 : 0;
      if (lead) { g.fillStyle = '#d9b98a'; D.round(g, c.x - 26, c.y + 24, 52, 14, 4); g.fill(); g.strokeStyle = '#8b7355'; g.lineWidth = 2.5; D.round(g, c.x - 26, c.y + 24, 52, 14, 4); g.stroke(); }
      C.critter(g, c.kind, c.x, c.y - (lead ? 8 : 0) - jump, 18, lead ? 'happy' : 'want', st.clock);
      flag(g, c.x + (i ? -24 : 24), c.y - 12 - (lead ? 8 : 0) - jump, 13, i);
      if (lead) D.star(g, c.x, c.y - 36 - jump, 9);
      var t = TUBE[i];
      g.fillStyle = 'rgba(255,255,255,.75)'; D.round(g, t.x - 11, t.y - 52, 22, 54, 6); g.fill();
      for (k = 0; k < st.landed[i]; k++) { g.fillStyle = SIDE[i]; g.strokeStyle = INK.line; g.lineWidth = 1.5; D.round(g, t.x - 8, t.y - 7 - k * 7, 16, 6, 3); g.fill(); g.stroke(); }
      g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, t.x - 11, t.y - 52, 22, 54, 6); g.stroke();
    }

    // the townsfolk, each thinking of the plan they like
    for (i = 0; i < 7; i++) {
      var x = vx(i), hop = Math.sin(st.hop[i] * Math.PI) * 12, pref = s.voters[i].pref;
      var mood = st.shout > 0 ? 'yum' : st.think[i] > 0 ? 'meh' : 'want';
      C.critter(g, KINDS[i], x, 216 - hop, 13, mood, st.clock + i);
      var big = st.shout > 0 ? 1.5 + 0.3 * Math.sin(st.clock * 20 + i * 2) : 1;
      C.bubble(g, x + 12, 182 - hop, 12 * big, 1);
      flag(g, x + 8, 183 - hop, 8 * big, pref);
    }

    // votes on their way
    st.balls.forEach(function (b) {
      var e = b.t * b.t * (3 - 2 * b.t), t = TUBE[b.side];
      var bx = b.x0 + (t.x - b.x0) * e, by = b.y0 + (t.y - 56 - b.y0) * e - Math.sin(b.t * Math.PI) * 40;
      g.fillStyle = SIDE[b.side]; g.strokeStyle = INK.line; g.lineWidth = 1.5; D.round(g, bx - 8, by - 3, 16, 6, 3); g.fill(); g.stroke();
    });

    // the ballot box: pulses when it is the way forward
    var nudge = !st.voting && !calm && ((s.leader === null && s.jams >= 2) || s.decisions >= 3);
    var kk = nudge ? 1 + 0.08 * Math.sin(st.clock * 7) : 1;
    g.save(); g.translate(BOX.x, BOX.y); g.scale(kk, kk);
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 2.5;
    g.save(); g.rotate(-0.2); D.round(g, -9, -40, 18, 24, 2); g.fill(); g.stroke(); g.restore();
    g.fillStyle = '#8a7fd1'; D.round(g, -30, -20, 60, 40, 8); g.fill(); g.lineWidth = 3.5; D.round(g, -30, -20, 60, 40, 8); g.stroke();
    g.fillStyle = INK.line; D.round(g, -15, -15, 30, 5, 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(-9, 6); g.lineTo(-2, 12); g.lineTo(11, -2); g.stroke();
    g.restore();

    // the need card: what the town wants next
    var what = sim.nextNeed();
    if (what && !st.voting) {
      var sh = st.cardShake > 0 ? Math.sin(st.clock * 40) * 5 * st.cardShake : 0;
      var bob = calm ? 0 : Math.sin(st.clock * 2.2) * 2;
      g.save(); g.translate(CARD.x + sh, CARD.y + bob);
      g.fillStyle = 'rgba(0,0,0,.12)'; D.round(g, -36, -30, 76, 66, 12); g.fill();
      g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3; D.round(g, -38, -33, 76, 66, 12); g.fill(); g.stroke();
      thing(g, what, -6, 4, '#cfcabd');
      g.fillStyle = INK.sun; g.beginPath(); g.arc(26, -22, 12, 0, 6.283); g.fill(); g.stroke();
      g.strokeStyle = INK.line; g.lineWidth = 2.5; g.beginPath(); g.arc(26, -25, 4, Math.PI, 0.6); g.lineTo(26, -19); g.stroke();
      g.fillStyle = INK.line; g.beginPath(); g.arc(26, -15, 1.6, 0, 6.283); g.fill();
      g.restore();
    }
  }

  function reset() { if (!st) return; sim.reset(); st = fresh(); frame.caption(''); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = sim = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.town = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, view: function () { return st; },
    spots: { box: BOX, card: CARD, voter: function (i) { return { x: vx(i), y: 214 }; }, cand: CAND } };
})(window);
