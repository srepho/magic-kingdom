/* Moment — three governments.
 * Six everyday things. Tap one and the map shows who looks after it:
 * bins and parks → the council (your town); schools and hospitals → the state;
 * passports and the defence force → all of Australia.
 * The map is a simple drawn shape, not a survey: see the grown-up notes.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300;
  var THINGS = [
    { what: 'bin', level: 0 }, { what: 'park', level: 0 },
    { what: 'school', level: 1 }, { what: 'hospital', level: 1 },
    { what: 'passport', level: 2 }, { what: 'ship', level: 2 }
  ];
  var SAY = [
    'The council looks after your town: bins and parks.',
    'The state looks after bigger things: schools and hospitals.',
    'All of Australia shares some things: passports and the defence force.'
  ];
  var COL = ['#f5a742', '#8a7fd1', '#5fb98a'];
  // a rough mainland outline in a 200 × 165 box, clockwise from the north-west
  var AUS = [[30, 60], [45, 40], [70, 30], [85, 18], [100, 28], [108, 12], [125, 10], [128, 28], [140, 38], [147, 20], [152, 2], [160, 30], [172, 50], [185, 72], [188, 95], [181, 110], [166, 132], [150, 140], [132, 132], [120, 118], [105, 112], [90, 108], [65, 112], [45, 125], [25, 128], [15, 105], [12, 80]];
  var TAS = [[146, 148], [160, 148], [154, 162]];
  var NSW = [[150, 90], [187, 88], [188, 95], [181, 110], [175, 124], [166, 126], [150, 116]];
  var SYD = [182, 108], MAP = { x: 262, y: 66 };

  var frame, surf, loop, off, st;

  function tile(i) { return { x: 62 + (i % 2) * 104, y: 62 + Math.floor(i / 2) * 82 }; }
  function fresh() { return { pick: null, level: null, bounce: 0, clock: 0 }; }

  function start(stage, api) {
    frame = api; st = fresh();
    surf = BQ.surface(stage, draw);
    off = BQ.touch(surf.c, {
      tap: function (q) {
        var p = surf.toView(q);
        for (var i = 0; i < THINGS.length; i++) {
          var t = tile(i);
          if (Math.abs(p.x - t.x) < 48 && Math.abs(p.y - t.y) < 38) {
            st.pick = i; st.level = THINGS[i].level; st.bounce = 1;
            BQ.sound.click(); frame.caption(SAY[st.level]);
            return;
          }
        }
      }
    });
    frame.caption('We choose three <b>governments</b>: for the town, the state and all Australia.');
    loop = BQ.loop(tick);
  }
  function tick(dt) { st.clock += dt; st.bounce = Math.max(0, st.bounce - dt * 2.5); draw(); }

  function poly(g, pts) {
    g.beginPath();
    pts.forEach(function (p, i) { if (i) g.lineTo(MAP.x + p[0], MAP.y + p[1]); else g.moveTo(MAP.x + p[0], MAP.y + p[1]); });
    g.closePath();
  }
  function icon(g, what, x, y) {
    g.strokeStyle = INK.line; g.lineWidth = 2.5;
    if (what === 'bin') {
      g.fillStyle = '#5fb98a'; g.beginPath(); g.moveTo(x - 12, y - 10); g.lineTo(x + 12, y - 10); g.lineTo(x + 9, y + 18); g.lineTo(x - 9, y + 18); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#f5d033'; D.round(g, x - 15, y - 18, 30, 8, 3); g.fill(); g.stroke();
    } else if (what === 'park') {
      g.fillStyle = '#8b7355'; g.fillRect(x - 13, y - 2, 6, 20);
      g.fillStyle = '#7cc36a'; g.beginPath(); g.arc(x - 10, y - 8, 14, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + 6, y + 18); g.lineTo(x + 6, y - 6); g.lineTo(x + 22, y - 6); g.lineTo(x + 22, y + 18); g.stroke();
      g.beginPath(); g.moveTo(x + 11, y - 6); g.lineTo(x + 11, y + 8); g.moveTo(x + 17, y - 6); g.lineTo(x + 17, y + 8); g.stroke();
      g.fillStyle = '#e4534a'; D.round(g, x + 9, y + 7, 10, 4, 2); g.fill();
    } else if (what === 'school') {
      g.fillStyle = '#f6d7a8'; D.round(g, x - 20, y - 6, 40, 24, 3); g.fill(); g.stroke();
      g.fillStyle = '#e4534a'; g.beginPath(); g.moveTo(x - 24, y - 6); g.lineTo(x, y - 20); g.lineTo(x + 24, y - 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#8b7355'; g.fillRect(x - 4, y + 6, 8, 12);
      g.fillStyle = INK.sun; g.beginPath(); g.arc(x, y - 9, 4, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = '#6fb6d9'; g.fillRect(x - 15, y, 7, 7); g.fillRect(x + 8, y, 7, 7);
    } else if (what === 'hospital') {
      g.fillStyle = '#fff'; D.round(g, x - 18, y - 14, 36, 32, 3); g.fill(); g.stroke();
      g.fillStyle = '#3f7fd1'; D.round(g, x - 9, y - 9, 18, 16, 3); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 4, y - 5); g.lineTo(x - 4, y + 3); g.moveTo(x + 4, y - 5); g.lineTo(x + 4, y + 3); g.moveTo(x - 4, y - 1); g.lineTo(x + 4, y - 1); g.stroke();
      g.fillStyle = '#8b7355'; g.fillRect(x - 4, y + 10, 8, 8);
    } else if (what === 'passport') {
      g.fillStyle = '#2c4a7c'; D.round(g, x - 14, y - 18, 28, 36, 4); g.fill(); g.stroke();
      g.strokeStyle = INK.sun; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 4, 7, 0, 6.283); g.moveTo(x - 7, y - 4); g.lineTo(x + 7, y - 4); g.stroke();
      g.beginPath(); g.ellipse(x, y - 4, 3, 7, 0, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(x - 7, y + 10); g.lineTo(x + 7, y + 10); g.stroke();
    } else {
      g.fillStyle = INK.water; g.fillRect(x - 24, y + 10, 48, 8);
      g.fillStyle = '#9aa3ab'; g.beginPath(); g.moveTo(x - 24, y + 2); g.lineTo(x + 24, y + 2); g.lineTo(x + 16, y + 13); g.lineTo(x - 18, y + 13); g.closePath(); g.fill(); g.stroke();
      D.round(g, x - 8, y - 8, 14, 10, 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x - 1, y - 8); g.lineTo(x - 1, y - 19); g.stroke();
    }
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), i, calm = BQ.calm(), L = st.level;
    var pulse = calm ? 0.6 : 0.5 + 0.5 * Math.abs(Math.sin(st.clock * 3));
    // the things
    g.fillStyle = '#e9e2d3'; D.round(g, 4, 4, 216, VH - 8, 14); g.fill();
    for (i = 0; i < THINGS.length; i++) {
      var t = tile(i), sel = st.pick === i, b = sel ? Math.sin(st.bounce * Math.PI) * 8 : 0;
      var wig = (!calm && st.pick === null && (st.clock + i * 0.4) % 4 < 0.4) ? Math.sin(st.clock * 22) * 2.5 : 0;
      g.fillStyle = '#fff'; g.strokeStyle = sel ? COL[THINGS[i].level] : INK.line; g.lineWidth = sel ? 6 : 3;
      D.round(g, t.x - 44 + wig, t.y - 34 - b, 88, 68, 14); g.fill(); g.stroke();
      icon(g, THINGS[i].what, t.x + wig, t.y - b);
    }
    // the map
    g.fillStyle = INK.water; D.round(g, 228, 4, 248, VH - 8, 14); g.fill();
    g.fillStyle = L === 2 ? COL[2] : '#efe6c9'; g.strokeStyle = INK.line; g.lineWidth = 3;
    poly(g, AUS); g.fill(); g.stroke(); poly(g, TAS); g.fill(); g.stroke();
    if (L === 2) { g.strokeStyle = 'rgba(255,255,255,' + pulse + ')'; g.lineWidth = 5; poly(g, AUS); g.stroke(); }
    g.fillStyle = L === 1 ? COL[1] : 'rgba(0,0,0,.06)'; g.strokeStyle = L === 1 ? INK.line : 'rgba(59,58,54,.35)'; g.lineWidth = L === 1 ? 3 : 1.5;
    poly(g, NSW); g.fill(); g.stroke();
    if (L === 1) { g.strokeStyle = 'rgba(255,255,255,' + pulse + ')'; g.lineWidth = 4; poly(g, NSW); g.stroke(); }
    var sx = MAP.x + SYD[0], sy = MAP.y + SYD[1];
    if (L === 0) {
      g.strokeStyle = COL[0]; g.lineWidth = 4; g.globalAlpha = 0.4 + 0.6 * pulse;
      g.beginPath(); g.arc(sx, sy, 10 + 8 * pulse, 0, 6.283); g.stroke(); g.globalAlpha = 1;
    }
    g.fillStyle = L === 0 ? COL[0] : INK.line; g.strokeStyle = '#fff'; g.lineWidth = 2;
    g.beginPath(); g.arc(sx, sy, L === 0 ? 7 : 4.5, 0, 6.283); g.fill(); g.stroke();
    // three sizes of meeting place, small to large, with the chosen one lit
    for (i = 0; i < 3; i++) {
      var w = 22 + i * 12, hx = 258 + i * 50, hy = 274, on = L === i;
      g.fillStyle = on ? COL[i] : 'rgba(255,255,255,.7)'; g.strokeStyle = INK.line; g.lineWidth = on ? 3 : 2;
      D.round(g, hx - w / 2, hy - w * 0.45, w, w * 0.6, 3); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(hx - w / 2 - 3, hy - w * 0.45); g.lineTo(hx, hy - w * 0.9); g.lineTo(hx + w / 2 + 3, hy - w * 0.45); g.closePath(); g.fill(); g.stroke();
    }
  }

  function reset() { if (!st) return; st = fresh(); frame.caption('We choose three <b>governments</b>: for the town, the state and all Australia.'); draw(); }
  function cleanup() {
    if (loop) loop.destroy(); if (off) off(); if (surf) surf.destroy();
    surf = loop = off = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.levels = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, state: function () { return st; }, spots: { tile: tile } };
})(window);
