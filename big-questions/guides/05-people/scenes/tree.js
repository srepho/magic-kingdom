/* Centrepiece — the family tree of living things.
 * Twelve living things sit side by side along "today". Drag the handle back in time and
 * their family lines grow downward and join. Tap any two and the place their lines meet
 * lights up: that join is an ancestor they share, which makes them cousins.
 * It is drawn on paper because it is a model: nobody could ever see this.
 * Structure lives in tree-sim.js.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink, T = BQ.treeSim;
  var VW = 480, VH = 300, TOP = 76, BOTTOM = 270, TRACK = 450, TIPY = 44;
  var SAY = { 'gum tree': 'Gum trees', mushroom: 'Mushrooms', bee: 'Bees', fish: 'Fish', frog: 'Frogs', dog: 'Dogs',
              chimp: 'Chimps', person: 'People', kangaroo: 'Kangaroos', platypus: 'Platypuses', lizard: 'Lizards', kookaburra: 'Kookaburras' };

  var frame, surf, loop, off, st;

  function tx(x) { return 30 + x * 34.6; }
  function ty(age) { return TOP + T.scale(age) * (BOTTOM - TOP); }
  function fresh() { return { age: 0, goal: null, drag: false, picks: [], meet: null, clock: 0, hop: {}, told: {} }; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.x > TRACK - 34) { st.drag = true; st.goal = null; slide(p); } },
      move: function (q) { if (st.drag) slide(surf.toView(q)); },
      up: function () { st.drag = false; },
      tap: function (q) {
        var p = surf.toView(q);
        if (p.x > TRACK - 34) return;
        for (var i = 0; i < T.tips.length; i++) {
          if (Math.abs(p.x - tx(i)) < 17 && p.y < TIPY + 34) { pick(T.tips[i].name); return; }
        }
      }
    });
    frame.caption('Slide back in time. Watch the family lines join up.');
    loop = BQ.loop(tick);
  }
  function slide(p) {
    st.age = T.unscale((p.y - TOP) / (BOTTOM - TOP));
    if (st.age >= T.OLDEST * 0.999 && !st.told.all) { st.told.all = true; frame.caption('Go back far enough, and every living thing is one family.'); }
  }
  function pick(name) {
    st.hop[name] = 1; BQ.sound.click();
    if (st.picks.indexOf(name) >= 0) { st.picks = st.picks.filter(function (n) { return n !== name; }); st.meet = null; return; }
    st.picks.push(name);
    if (st.picks.length > 2) st.picks.shift();
    st.meet = null;
    if (st.picks.length === 2) {
      st.meet = T.meet(st.picks[0], st.picks[1]);
      if (st.age < st.meet.age) st.goal = st.meet.age * 1.02;   // grow the tree far enough to show the join
      var a = SAY[st.picks[0]], b = SAY[st.picks[1]];
      frame.caption(a + ' and ' + b.toLowerCase() + ' are ' + T.kin(st.meet.age).replace('cousins', '<b>cousins</b>') +
                    '. Their lines meet at an <b>ancestor</b>.');
      BQ.sound.squeak();
    }
  }

  function tick(dt) {
    st.clock += dt;
    if (st.goal !== null) {                                  // ease back in time on the squeezed strip
      var u = T.scale(st.age), g = T.scale(st.goal);
      u += (g - u) * Math.min(1, dt * 3) + 0.2 * dt;
      if (u >= g) { u = g; st.goal = null; }
      st.age = T.unscale(u);
    }
    Object.keys(st.hop).forEach(function (k) { st.hop[k] = Math.max(0, st.hop[k] - dt * 2.5); });
    draw();
  }

  /* small pictures of the living things; all the same size on purpose */
  function icon(g, name, x, y) {
    g.lineWidth = 2; g.strokeStyle = INK.line; g.lineJoin = g.lineCap = 'round';
    function dot(dx, dy, r, c) { g.fillStyle = c; g.beginPath(); g.arc(x + dx, y + dy, r, 0, 6.283); g.fill(); }
    function blob(dx, dy, rx, ry, c) { g.fillStyle = c; g.beginPath(); g.ellipse(x + dx, y + dy, rx, ry, 0, 0, 6.283); g.fill(); g.stroke(); }
    function eyes(dy, gap) { dot(-gap, dy, 1.6, INK.line); dot(gap, dy, 1.6, INK.line); }
    if (name === 'gum tree') { g.fillStyle = '#b7a489'; g.fillRect(x - 2.5, y, 5, 13); blob(0, -4, 12, 9, '#8fb89a'); }
    else if (name === 'mushroom') {
      g.fillStyle = '#f3ead8'; D.round(g, x - 4, y, 8, 12, 3); g.fill(); g.stroke();
      g.fillStyle = '#d9534a'; g.beginPath(); g.arc(x, y + 1, 12, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
      dot(-5, -4, 2, '#fff'); dot(4, -6, 2, '#fff');
    } else if (name === 'bee') {
      blob(-4, -7, 5, 7, 'rgba(255,255,255,.9)'); blob(4, -7, 5, 7, 'rgba(255,255,255,.9)');
      blob(0, 2, 11, 8, '#f5d033');
      g.beginPath(); g.moveTo(x - 3, y - 5); g.lineTo(x - 3, y + 9); g.moveTo(x + 3, y - 5); g.lineTo(x + 3, y + 9); g.lineWidth = 3; g.stroke();
    } else if (name === 'fish') {
      g.fillStyle = '#6fb6d9'; g.beginPath(); g.moveTo(x + 6, y); g.lineTo(x + 13, y - 6); g.lineTo(x + 13, y + 6); g.closePath(); g.fill(); g.stroke();
      blob(-2, 0, 10, 7, '#6fb6d9'); dot(-7, -2, 1.6, INK.line);
    } else if (name === 'frog') {
      blob(-5, -7, 4, 4, '#7cc36a'); blob(5, -7, 4, 4, '#7cc36a'); blob(0, 2, 11, 9, '#7cc36a'); eyes(-7, 5);
      g.beginPath(); g.arc(x, y + 1, 6, 0.3, Math.PI - 0.3); g.stroke();
    } else if (name === 'dog') {
      blob(-10, -1, 4, 8, '#8a6a4f'); blob(10, -1, 4, 8, '#8a6a4f'); blob(0, 1, 10, 10, '#c79a6b'); eyes(-2, 4);
      blob(0, 5, 3.5, 2.5, '#3b3a36');
    } else if (name === 'chimp') {
      blob(-11, -1, 3.5, 3.5, '#b08a6e'); blob(11, -1, 3.5, 3.5, '#b08a6e'); blob(0, 0, 10, 11, '#5a4636');
      g.lineWidth = 1; blob(0, 3, 7, 7, '#c9a585'); g.lineWidth = 2; eyes(-1, 3);
      g.beginPath(); g.arc(x, y + 4, 3, 0.3, Math.PI - 0.3); g.stroke();
    } else if (name === 'person') {
      blob(0, 1, 10, 11, '#d49b72');
      g.fillStyle = '#4a372b'; g.beginPath(); g.arc(x, y - 2, 10.5, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill();
      eyes(0, 4); g.beginPath(); g.arc(x, y + 3, 4, 0.3, Math.PI - 0.3); g.stroke();
    } else if (name === 'kangaroo') {
      blob(-5, -11, 3, 7, '#c9976a'); blob(5, -11, 3, 7, '#c9976a'); blob(0, 2, 8, 10, '#c9976a'); eyes(-1, 3.5);
      blob(0, 7, 2.5, 2, '#3b3a36');
    } else if (name === 'platypus') {
      blob(-1, 0, 11, 7, '#7b5e49');
      g.fillStyle = '#3b3a36'; D.round(g, x + 6, y - 3, 10, 6, 3); g.fill(); dot(4, -3, 1.4, '#fff');
    } else if (name === 'lizard') {
      g.strokeStyle = INK.line; g.lineWidth = 8; g.beginPath(); g.moveTo(x - 10, y + 6); g.quadraticCurveTo(x - 2, y - 8, x + 4, y + 2); g.lineTo(x + 9, y - 6); g.stroke();
      g.strokeStyle = '#9bbf5a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 10, y + 6); g.quadraticCurveTo(x - 2, y - 8, x + 4, y + 2); g.lineTo(x + 9, y - 6); g.stroke();
      dot(9, -7, 1.4, INK.line);
    } else {
      blob(0, 2, 9, 10, '#efe3cf'); blob(3, 5, 5, 6, '#8a6a4f');
      g.fillStyle = '#4a4038'; g.beginPath(); g.moveTo(x - 6, y - 4); g.lineTo(x - 17, y - 1); g.lineTo(x - 6, y + 1); g.closePath(); g.fill(); g.stroke();
      dot(-2, -4, 1.6, INK.line);
    }
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm(), age = st.age, i;
    // today: a strip of sky. Below it, paper: the tree is a model.
    D.paper(g, 6, 62, 412, 232);
    D.glasses(g, 26, 282, 10);
    g.fillStyle = INK.sky; D.round(g, 6, 6, 412, 62, 12); g.fill();

    var lit = {};                                            // the two lines that lead to the shared ancestor
    if (st.meet) st.picks.forEach(function (name) {
      for (var n = T.tip(name); n && n !== st.meet; n = n.parent) lit[n.id] = true;
    });
    function strokeLine(x0, y0, x1, y1, on) {
      g.strokeStyle = on ? '#e89b1c' : INK.bitEdge; g.lineWidth = on ? 6 : 3.5;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    // each family line runs down from its start until it joins its parent line
    T.nodes.forEach(function (n) {
      if (!n.parent) return;
      var until = Math.min(n.parent.age, age);
      if (until > n.age) strokeLine(tx(n.x), ty(n.age), tx(n.x), ty(until), lit[n.id]);
      if (n.parent.age <= age) strokeLine(tx(n.x), ty(n.parent.age), tx(n.parent.x), ty(n.parent.age), lit[n.id]);
    });
    if (age >= T.OLDEST * 0.999) strokeLine(tx(T.tree.x), ty(T.OLDEST), tx(T.tree.x), BOTTOM + 14, false);
    // the joins: ancestors. Plain dots, because none of them was an animal alive today.
    T.nodes.forEach(function (n) {
      if (!n.kids.length || n.age > age) return;
      var here = st.meet === n, r = here ? 8 + (calm ? 0 : 2 * Math.sin(st.clock * 6)) : 4.5;
      g.fillStyle = here ? INK.sun : '#fff'; g.strokeStyle = here ? '#a66a00' : INK.bitEdge; g.lineWidth = here ? 3 : 2.5;
      g.beginPath(); g.arc(tx(n.x), ty(n.age), r, 0, 6.283); g.fill(); g.stroke();
    });
    // how far back she has gone
    g.setLineDash([4, 6]); g.strokeStyle = 'rgba(59,58,54,.35)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(10, ty(age)); g.lineTo(416, ty(age)); g.stroke(); g.setLineDash([]);

    for (i = 0; i < T.tips.length; i++) {
      var name = T.tips[i].name, sel = st.picks.indexOf(name) >= 0, hop = Math.sin((st.hop[name] || 0) * Math.PI) * 6;
      var wig = (!calm && !st.picks.length && (st.clock + i * 0.3) % 5 < 0.35) ? Math.sin(st.clock * 24) * 2 : 0;
      if (sel) { g.fillStyle = INK.sun; g.beginPath(); g.arc(tx(i), TIPY - 6 - hop, 17, 0, 6.283); g.fill(); }
      icon(g, name, tx(i) + wig, TIPY - 6 - hop);
      g.strokeStyle = lit[T.tips[i].id] ? '#e89b1c' : INK.bitEdge; g.lineWidth = lit[T.tips[i].id] ? 6 : 3.5;
      g.beginPath(); g.moveTo(tx(i), TIPY + 12); g.lineTo(tx(i), TOP); g.stroke();
    }

    // the time handle: today at the top, long ago at the bottom
    g.strokeStyle = INK.line; g.lineWidth = 3; g.fillStyle = '#fff';
    D.round(g, TRACK - 9, TOP - 14, 18, BOTTOM - TOP + 28, 9); g.fill(); g.stroke();
    var grad = g.createLinearGradient(0, TOP, 0, BOTTOM); grad.addColorStop(0, INK.sky); grad.addColorStop(1, '#8a7fd1');
    g.fillStyle = grad; D.round(g, TRACK - 6, TOP - 11, 12, BOTTOM - TOP + 22, 6); g.fill();
    var dy = ty(66);                                         // when the last big dinosaurs lived
    g.fillStyle = '#7cc36a'; g.strokeStyle = INK.line; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(TRACK - 22, dy, 8, 5, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(TRACK - 16, dy - 3); g.lineTo(TRACK - 11, dy - 11); g.lineTo(TRACK - 8, dy - 8); g.stroke();
    g.beginPath(); g.moveTo(TRACK - 30, dy); g.lineTo(TRACK - 36, dy + 3); g.stroke();
    var hy = ty(age), pulse = (!calm && age === 0 && !st.drag) ? 1 + 0.08 * Math.sin(st.clock * 6) : 1;
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 4;
    g.beginPath(); g.arc(TRACK, hy, 20 * pulse, 0, 6.283); g.fill(); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(TRACK - 7, hy + 2); g.lineTo(TRACK, hy + 9); g.lineTo(TRACK + 7, hy + 2); g.moveTo(TRACK - 7, hy - 2); g.lineTo(TRACK, hy - 9); g.lineTo(TRACK + 7, hy - 2); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption('Slide back in time. Watch the family lines join up.'); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.tree = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; },
    spots: { tip: function (i) { return { x: tx(i), y: TIPY - 6 }; }, track: function (age) { return { x: TRACK, y: ty(age) }; } } };
})(window);
