/* Moment — where people spread from.
 * A rough world map. Slide through time: the first people are in Africa; over a very long
 * time families reach Asia, Australia, Europe, the Americas and last the far Pacific.
 * Slide back and they are in Africa again. Dates are estimates with wide ranges: see notes.
 * The time strip is squeezed, so the long early stretch does not hide the recent steps.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, START = 300;                      // thousand years ago
  var TRACK = { x0: 60, x1: 420, y: 272 };
  function X(lon) { return (lon + 180) * 1.3333; }
  function Y(lat) { return 14 + (80 - lat) * 1.62; }
  var LAND = [
    [[-17, 21], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -3], [40, -16], [33, -26], [26, -34], [18, -34], [12, -17], [9, 1], [-8, 4], [-17, 12]],
    [[-9, 37], [-9, 43], [-1, 49], [6, 54], [6, 62], [15, 69], [30, 71], [60, 69], [80, 73], [105, 77], [140, 73], [170, 69], [180, 66], [170, 60], [155, 52], [142, 54], [140, 45], [128, 36], [122, 30], [121, 23], [108, 20], [109, 12], [104, 9], [100, 13], [98, 8], [95, 16], [90, 22], [80, 15], [77, 8], [72, 20], [67, 25], [57, 26], [56, 18], [45, 13], [35, 28], [36, 36], [27, 37], [24, 36], [22, 40], [15, 38], [12, 44], [3, 43]],
    [[114, -22], [122, -18], [130, -12], [136, -12], [137, -16], [142, -11], [146, -19], [153, -27], [150, -37], [140, -38], [132, -32], [124, -33], [115, -34]],
    [[-168, 66], [-155, 71], [-120, 70], [-95, 70], [-82, 63], [-65, 60], [-56, 52], [-66, 45], [-75, 38], [-81, 31], [-80, 26], [-90, 29], [-97, 26], [-96, 17], [-84, 10], [-78, 8], [-90, 14], [-105, 20], [-110, 24], [-117, 33], [-124, 42], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
    [[-78, 8], [-72, 12], [-60, 9], [-50, 0], [-35, -7], [-39, -17], [-48, -26], [-57, -36], [-65, -42], [-68, -53], [-74, -50], [-72, -35], [-70, -18], [-80, -5]],
    [[131, -2], [141, -3], [150, -6], [146, -9], [138, -8]],
    [[172, -35], [178, -38], [174, -42], [167, -46], [170, -41]]
  ];
  /* where families were living, and roughly when they first got there (thousand years ago) */
  var PLACES = [
    { name: 'africa', at: [22, 5], when: 300, from: null, dots: [[30, 8], [20, 14], [35, -4], [24, -18], [8, 10], [0, 28]] },
    { name: 'near-east', at: [42, 30], when: 65, from: 0, dots: [[40, 33], [50, 28]] },
    { name: 'south-asia', at: [78, 22], when: 60, from: 1, dots: [[76, 24], [84, 20], [70, 30]] },
    { name: 'south-east-asia', at: [104, 14], when: 57, from: 2, dots: [[102, 16], [108, 24], [136, -5]] },
    { name: 'australia', at: [133, -24], when: 55, from: 3, dots: [[130, -20], [143, -24], [150, -32], [121, -28], [134, -30]] },
    { name: 'europe', at: [12, 48], when: 45, from: 1, dots: [[5, 46], [20, 50], [30, 56], [-4, 40]] },
    { name: 'east-asia', at: [112, 36], when: 42, from: 3, dots: [[110, 34], [118, 40], [100, 44], [135, 37]] },
    { name: 'north', at: [125, 62], when: 30, from: 6, dots: [[110, 60], [135, 64], [160, 64]] },
    { name: 'north-america', at: [-105, 48], when: 17, from: 7, dots: [[-120, 55], [-100, 42], [-85, 38], [-110, 32], [-100, 22]] },
    { name: 'south-america', at: [-60, -12], when: 15, from: 8, dots: [[-70, 2], [-55, -8], [-48, -20], [-65, -30], [-70, -45]] },
    { name: 'far-pacific', at: [173, -41], when: 0.75, from: 3, dots: [[174, -38], [170, -44]] }
  ];
  var HOME = [151, -34];

  var frame, surf, loop, off, st;

  /* squeeze the strip: left end is 300 thousand years ago, right end is now */
  function ageAt(u) { return START * Math.pow(1 - Math.max(0, Math.min(1, u)), 2.6); }
  function fresh() { return { u: 0, drag: false, clock: 0, shown: PLACES.map(function (p, i) { return i ? 0 : 1; }), told: {} }; }
  function reached(i) { return ageAt(st.u) <= PLACES[i].when; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      down: function (q) { var p = surf.toView(q); if (p.y > TRACK.y - 34) { st.drag = true; slide(p); } },
      move: function (q) { if (st.drag) slide(surf.toView(q)); },
      up: function () { st.drag = false; }
    });
    frame.caption('The first people lived in Africa. Slide to see where families went.');
    loop = BQ.loop(tick);
  }
  function slide(p) {
    st.u = Math.max(0, Math.min(1, (p.x - TRACK.x0) / (TRACK.x1 - TRACK.x0)));
    if (st.u === 0) frame.caption('The first people lived in Africa. Slide to see where families went.');
    else if (st.u >= 0.999) frame.caption('Now people live almost everywhere. We all began in Africa.');
    else if (reached(4)) frame.caption('Slowly, families walked and sailed to new places. Some reached Australia.');
    else if (reached(1)) frame.caption('Bit by bit, over a very long time, families moved further.');
  }
  function tick(dt) {
    st.clock += dt;
    PLACES.forEach(function (p, i) {
      var want = reached(i) ? 1 : 0, was = st.shown[i];
      st.shown[i] += (want - st.shown[i]) * Math.min(1, dt * 5);
      if (want && was < 0.05 && st.shown[i] >= 0.05) BQ.sound.plop();
    });
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), calm = BQ.calm();
    g.fillStyle = '#cfe6f2'; D.round(g, 4, 4, VW - 8, 236, 14); g.fill();
    g.save(); D.round(g, 4, 4, VW - 8, 236, 14); g.clip();
    g.fillStyle = '#efe6c9'; g.strokeStyle = '#b9a98a'; g.lineWidth = 2;
    LAND.forEach(function (poly) {
      g.beginPath(); poly.forEach(function (c, i) { if (i) g.lineTo(X(c[0]), Y(c[1])); else g.moveTo(X(c[0]), Y(c[1])); });
      g.closePath(); g.fill(); g.stroke();
    });
    // the ways families went
    PLACES.forEach(function (p, i) {
      if (p.from === null || st.shown[i] < 0.02) return;
      var a = PLACES[p.from].at, b = p.at, t = st.shown[i];
      var ax = X(a[0]), ay = Y(a[1]), bx = X(b[0]), by = Y(b[1]);
      if (Math.abs(bx - ax) > 240) bx += bx < ax ? 480 : -480;   // the short way round the back of the map
      g.strokeStyle = 'rgba(232,155,28,' + (0.75 * t) + ')'; g.lineWidth = 3.5; g.setLineDash([2, 7]);
      g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - 14, ax + (bx - ax) * t, ay + (by - ay) * t); g.stroke();
      g.setLineDash([]);
    });
    // families
    PLACES.forEach(function (p, i) {
      var t = st.shown[i]; if (t < 0.02) return;
      p.dots.forEach(function (d, k) {
        var r = 4.2 * t * (calm ? 1 : 1 + 0.12 * Math.sin(st.clock * 3 + i + k));
        g.fillStyle = '#c9623f'; g.strokeStyle = '#fff'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(X(d[0]), Y(d[1]), r, 0, 6.283); g.fill(); g.stroke();
      });
    });
    // home
    var hx = X(HOME[0]), hy = Y(HOME[1]);
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 2;
    g.beginPath(); g.moveTo(hx - 7, hy + 6); g.lineTo(hx - 7, hy - 2); g.lineTo(hx, hy - 9); g.lineTo(hx + 7, hy - 2); g.lineTo(hx + 7, hy + 6); g.closePath(); g.fill(); g.stroke();
    g.restore();

    // the time strip: long ago on the left, now on the right
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 3;
    D.round(g, TRACK.x0 - 26, TRACK.y - 12, TRACK.x1 - TRACK.x0 + 52, 24, 12); g.fill(); g.stroke();
    var kx = TRACK.x0 + st.u * (TRACK.x1 - TRACK.x0), pulse = (!calm && st.u === 0 && !st.drag) ? 1 + 0.08 * Math.sin(st.clock * 6) : 1;
    g.fillStyle = INK.sun; g.strokeStyle = '#a66a00'; g.lineWidth = 4;
    g.beginPath(); g.arc(kx, TRACK.y, 21 * pulse, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = INK.line; g.lineWidth = 3;
    g.beginPath(); g.moveTo(kx - 3, TRACK.y - 7); g.lineTo(kx + 5, TRACK.y); g.lineTo(kx - 3, TRACK.y + 7); g.stroke();
  }

  function reset() { if (!st) return; st = fresh(); frame.caption('The first people lived in Africa. Slide to see where families went.'); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.spread = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, places: PLACES, ageAt: ageAt,
    spots: { track: TRACK } };
})(window);
