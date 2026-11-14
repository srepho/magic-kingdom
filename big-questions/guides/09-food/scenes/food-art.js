/* Guide 09 — drawings: the forms a food takes along its journey, and the places it passes.
 * "What eyes see" style from STYLE.md: flat shapes, ink outlines. Nothing here is a model.
 * form(g, name, x, y, s): drawn to fit roughly inside a circle of radius s.
 * place(g, kind, x, y, k, opts): a small building standing on ground line y, scale k.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, C = BQ.cast, D = BQ.draw, INK = BQ.ink;

  function pen(g, s) { g.strokeStyle = INK.line; g.lineWidth = Math.max(1.5, s * 0.1); g.lineJoin = g.lineCap = 'round'; }
  function ell(g, x, y, rx, ry, rot, fill, stroke) {
    g.beginPath(); g.ellipse(x, y, rx, ry, rot || 0, 0, 6.283);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke !== false) g.stroke();
  }
  function box(g, x, y, w, h, r, fill, stroke) {
    D.round(g, x, y, w, h, r);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke !== false) g.stroke();
  }
  function poly(g, pts, fill, stroke) {
    g.beginPath(); g.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke !== false) g.stroke();
  }
  function stick(g, x, y, len, rot, s) {                 // one chip
    g.save(); g.translate(x, y); g.rotate(rot);
    box(g, -s * 0.11, -len, s * 0.22, len, s * 0.06, '#f5d36a');
    g.restore();
  }

  var FORMS = {
    wheat: function (g, x, y, s, o) {
      var sway = (o && o.sway) || 0;
      for (var k = -1; k <= 1; k++) {
        var bx = x + k * s * 0.5, tx = bx + k * s * 0.12 + sway * s;
        g.strokeStyle = '#b98a2e'; g.lineWidth = Math.max(1.5, s * 0.09);
        g.beginPath(); g.moveTo(bx, y + s); g.quadraticCurveTo(bx, y, tx, y - s * 0.15); g.stroke();
        pen(g, s * 0.8); ell(g, tx, y - s * 0.5, s * 0.17, s * 0.45, k * 0.15 + sway, '#e9b949');
      }
    },
    flour: function (g, x, y, s) {
      pen(g, s); box(g, x - s * 0.62, y - s * 0.55, s * 1.24, s * 1.45, s * 0.3, '#f4ecd8');
      ell(g, x, y - s * 0.62, s * 0.36, s * 0.15, 0, '#e2d6b8');
      pen(g, s * 0.6); ell(g, x, y + s * 0.2, s * 0.13, s * 0.34, 0.2, '#e9b949');
    },
    loaf: function (g, x, y, s) { C.food(g, 'bread', x, y, s * 0.85); },
    slice: function (g, x, y, s) {
      g.strokeStyle = '#a8703a'; g.lineWidth = Math.max(2, s * 0.16); g.lineJoin = 'round';
      box(g, x - s * 0.72, y - s * 0.72, s * 1.44, s * 1.44, s * 0.38, '#e9c489');
      box(g, x - s * 0.22, y - s * 0.2, s * 0.44, s * 0.36, s * 0.08, '#ffe37a', false);
    },
    cow: function (g, x, y, s) {
      pen(g, s);
      g.beginPath(); g.moveTo(x - s * 0.62, y + s * 0.4); g.lineTo(x - s * 0.62, y + s);
      g.moveTo(x + s * 0.32, y + s * 0.4); g.lineTo(x + s * 0.32, y + s); g.stroke();
      g.beginPath(); g.moveTo(x - s * 0.9, y - s * 0.2); g.quadraticCurveTo(x - s * 1.15, y, x - s * 1.05, y + s * 0.35); g.stroke();
      ell(g, x - s * 0.12, y + s * 0.52, s * 0.22, s * 0.16, 0, '#f6b5c0');
      box(g, x - s * 0.9, y - s * 0.38, s * 1.5, s * 0.86, s * 0.3, '#fff');
      ell(g, x - s * 0.4, y - s * 0.05, s * 0.26, s * 0.2, 0.3, '#3b3a36', false);
      ell(g, x + s * 0.2, y + s * 0.18, s * 0.17, s * 0.13, -0.3, '#3b3a36', false);
      ell(g, x + s * 0.5, y - s * 0.72, s * 0.14, s * 0.09, -0.5, '#3b3a36');
      ell(g, x + s * 0.74, y - s * 0.42, s * 0.36, s * 0.36, 0, '#fff');
      ell(g, x + s * 0.84, y - s * 0.24, s * 0.24, s * 0.16, 0, '#f6b5c0');
      ell(g, x + s * 0.68, y - s * 0.52, s * 0.05, s * 0.05, 0, INK.line, false);
    },
    bottle: function (g, x, y, s) {
      pen(g, s);
      box(g, x - s * 0.2, y - s * 0.8, s * 0.4, s * 0.5, s * 0.05, '#fff');
      box(g, x - s * 0.44, y - s * 0.4, s * 0.88, s * 1.35, s * 0.2, '#fff');
      box(g, x - s * 0.44, y + s * 0.05, s * 0.88, s * 0.42, 0, '#9fd0ff', false);
      box(g, x - s * 0.26, y - s * 0.98, s * 0.52, s * 0.24, s * 0.08, '#4a90d9');
    },
    glass: function (g, x, y, s, o) {
      var level = o && o.level != null ? o.level : 0.8, top = y + s * 0.9 - s * 1.7 * level;
      var edge = function (yy) { return s * (0.38 + 0.12 * (y + s * 0.9 - yy) / (s * 1.7)); };
      if (level > 0.02) {
        poly(g, [x - edge(top), top, x - s * 0.38, y + s * 0.9, x + s * 0.38, y + s * 0.9, x + edge(top), top], '#f1f5fa', false);
        g.strokeStyle = '#b9cfe2'; g.lineWidth = Math.max(1.5, s * 0.08);
        g.beginPath(); g.moveTo(x - edge(top), top); g.lineTo(x + edge(top), top); g.stroke();
      }
      g.strokeStyle = '#7b8a93'; g.lineWidth = Math.max(2, s * 0.12); g.lineJoin = g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - s * 0.5, y - s * 0.8); g.lineTo(x - s * 0.38, y + s * 0.9);
      g.lineTo(x + s * 0.38, y + s * 0.9); g.lineTo(x + s * 0.5, y - s * 0.8); g.stroke();
    },
    hen: function (g, x, y, s) {
      pen(g, s);
      g.strokeStyle = '#d99a2b';
      g.beginPath(); g.moveTo(x - s * 0.2, y + s * 0.6); g.lineTo(x - s * 0.2, y + s);
      g.moveTo(x + s * 0.15, y + s * 0.6); g.lineTo(x + s * 0.15, y + s); g.stroke();
      pen(g, s);
      poly(g, [x - s * 0.6, y + s * 0.1, x - s * 1.05, y - s * 0.5, x - s * 0.45, y - s * 0.25], '#b0612f');
      ell(g, x - s * 0.08, y + s * 0.15, s * 0.74, s * 0.58, 0, '#c9743c');
      ell(g, x + s * 0.5, y - s * 0.42, s * 0.3, s * 0.3, 0, '#c9743c');
      ell(g, x + s * 0.44, y - s * 0.76, s * 0.12, s * 0.1, 0, '#e4534a', false);
      ell(g, x + s * 0.6, y - s * 0.74, s * 0.1, s * 0.09, 0, '#e4534a', false);
      ell(g, x + s * 0.66, y - s * 0.18, s * 0.08, s * 0.11, 0, '#e4534a', false);
      poly(g, [x + s * 0.76, y - s * 0.5, x + s * 1.05, y - s * 0.4, x + s * 0.76, y - s * 0.3], '#f5b942');
      ell(g, x + s * 0.54, y - s * 0.48, s * 0.05, s * 0.05, 0, INK.line, false);
      g.beginPath(); g.arc(x - s * 0.15, y + s * 0.15, s * 0.32, 0.3, 2.2); g.stroke();
    },
    egg: function (g, x, y, s) { pen(g, s); ell(g, x, y, s * 0.6, s * 0.78, 0, '#f6e7d0'); },
    carton: function (g, x, y, s) {
      pen(g, s);
      for (var k = -1; k <= 1; k++) ell(g, x + k * s * 0.52, y - s * 0.12, s * 0.23, s * 0.32, 0, '#f6e7d0');
      box(g, x - s * 0.92, y + s * 0.02, s * 1.84, s * 0.7, s * 0.14, '#c8c2b4');
    },
    eggcup: function (g, x, y, s) {
      pen(g, s);
      ell(g, x, y - s * 0.28, s * 0.42, s * 0.56, 0, '#f6e7d0');
      poly(g, [x - s * 0.52, y - s * 0.02, x - s * 0.3, y + s * 0.6, x + s * 0.3, y + s * 0.6, x + s * 0.52, y - s * 0.02], '#6fb6d9');
      g.beginPath(); g.moveTo(x - s * 0.45, y + s * 0.85); g.lineTo(x + s * 0.45, y + s * 0.85);
      g.moveTo(x, y + s * 0.6); g.lineTo(x, y + s * 0.85); g.stroke();
    },
    tree: function (g, x, y, s) {
      box(g, x - s * 0.14, y + s * 0.2, s * 0.28, s * 0.8, 0, '#8b7355', false);
      g.strokeStyle = '#5da24c'; g.lineWidth = Math.max(2, s * 0.08);
      ell(g, x, y - s * 0.2, s * 0.8, s * 0.72, 0, '#7cc36a');
      [[-0.4, -0.35], [0.3, -0.5], [0.42, 0.05], [-0.15, 0.1]].forEach(function (p) {
        ell(g, x + p[0] * s, y + p[1] * s, s * 0.13, s * 0.13, 0, '#e4534a', false);
      });
    },
    applebox: function (g, x, y, s) {
      C.food(g, 'apple', x - s * 0.45, y - s * 0.22, s * 0.36); C.food(g, 'apple', x + s * 0.45, y - s * 0.22, s * 0.36);
      C.food(g, 'apple', x, y - s * 0.38, s * 0.36);
      g.strokeStyle = '#8b7355'; g.lineWidth = Math.max(1.5, s * 0.1);
      box(g, x - s * 0.88, y + s * 0.02, s * 1.76, s * 0.78, s * 0.1, '#d9b98a');
      g.beginPath(); g.moveTo(x - s * 0.88, y + s * 0.4); g.lineTo(x + s * 0.88, y + s * 0.4); g.stroke();
    },
    apple: function (g, x, y, s) { C.food(g, 'apple', x, y, s * 0.8); },
    /* potato plant: leaves above the ground line (y), potatoes hanging below it */
    potato: function (g, x, y, s) {
      g.strokeStyle = '#5da24c'; g.lineWidth = Math.max(1.5, s * 0.1); g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s * 0.55); g.stroke();
      [[-0.4, -0.5, -0.5], [0.4, -0.55, 0.5], [0, -0.85, 0]].forEach(function (p) {
        ell(g, x + p[0] * s, y + p[1] * s, s * 0.36, s * 0.2, p[2], '#7cc36a');
      });
      g.strokeStyle = '#8b7355'; g.lineWidth = Math.max(1, s * 0.06);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * 0.4, y + s * 0.4); g.moveTo(x, y); g.lineTo(x + s * 0.42, y + s * 0.5);
      g.moveTo(x, y); g.lineTo(x, y + s * 0.6); g.stroke();
      pen(g, s * 0.8);
      ell(g, x - s * 0.45, y + s * 0.5, s * 0.3, s * 0.21, 0.3, '#c9a26b');
      ell(g, x + s * 0.48, y + s * 0.58, s * 0.3, s * 0.22, -0.3, '#c9a26b');
      ell(g, x, y + s * 0.78, s * 0.26, s * 0.2, 0, '#c9a26b');
    },
    cutchips: function (g, x, y, s) {
      g.strokeStyle = '#b98a2e'; g.lineWidth = Math.max(1.2, s * 0.07);
      stick(g, x - s * 0.6, y + s * 0.5, s * 1.1, 1.2, s); stick(g, x - s * 0.5, y + s * 0.15, s * 1.1, 1.75, s);
      stick(g, x - s * 0.55, y - s * 0.2, s * 1.1, 1.45, s); stick(g, x - s * 0.3, y + s * 0.7, s * 1.0, 0.5, s);
      stick(g, x + s * 0.1, y + s * 0.75, s * 1.0, -0.4, s);
    },
    chipbag: function (g, x, y, s) {
      pen(g, s); box(g, x - s * 0.62, y - s * 0.85, s * 1.24, s * 1.7, s * 0.14, '#6fb6d9');
      box(g, x - s * 0.4, y - s * 0.1, s * 0.8, s * 0.75, s * 0.1, '#fff', false);
      g.strokeStyle = '#b98a2e'; g.lineWidth = Math.max(1, s * 0.06);
      stick(g, x - s * 0.18, y + s * 0.55, s * 0.55, -0.25, s); stick(g, x + s * 0.02, y + s * 0.55, s * 0.6, 0.05, s);
      stick(g, x + s * 0.2, y + s * 0.55, s * 0.5, 0.3, s);
      snow(g, x, y - s * 0.48, s * 0.22);
    },
    chips: function (g, x, y, s) {
      g.strokeStyle = '#b98a2e'; g.lineWidth = Math.max(1.2, s * 0.07);
      [[-0.36, 0.95, -0.28], [-0.18, 1.15, -0.1], [0, 1.0, 0.02], [0.18, 1.2, 0.12], [0.36, 0.9, 0.3]].forEach(function (p) {
        stick(g, x + p[0] * s, y + s * 0.2, p[1] * s, p[2], s);
      });
      pen(g, s);
      poly(g, [x - s * 0.58, y - s * 0.02, x - s * 0.4, y + s * 0.9, x + s * 0.4, y + s * 0.9, x + s * 0.58, y - s * 0.02], '#e4534a');
    },
    cheese: function (g, x, y, s) {
      pen(g, s); box(g, x - s, y - s * 0.16, s * 2, s * 0.32, s * 0.08, '#ffd23f');
    },
    tomato: function (g, x, y, s) {
      pen(g, s);
      for (var k = -1; k <= 1; k++) ell(g, x + k * s * 0.62, y, s * 0.36, s * 0.17, 0, '#e4534a');
    },
    lettuce: function (g, x, y, s) {
      g.strokeStyle = '#5da24c'; g.lineWidth = Math.max(1.5, s * 0.1); g.fillStyle = '#9bd97f';
      g.beginPath(); g.moveTo(x - s * 1.05, y);
      for (var k = 0; k < 7; k++) g.quadraticCurveTo(x - s * 0.9 + k * s * 0.3, y - s * (k % 2 ? 0.34 : 0.1), x - s * 0.75 + k * s * 0.3, y);
      for (k = 6; k >= 0; k--) g.quadraticCurveTo(x - s * 0.9 + k * s * 0.3, y + s * (k % 2 ? 0.12 : 0.32), x - s * 1.05 + k * s * 0.3, y);
      g.closePath(); g.fill(); g.stroke();
    },
    tomatoplant: function (g, x, y, s) {
      g.strokeStyle = '#8b7355'; g.lineWidth = Math.max(1.5, s * 0.08); g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y + s); g.lineTo(x, y - s); g.stroke();
      g.strokeStyle = '#5da24c';
      [[-0.45, -0.6, -0.4], [0.45, -0.35, 0.4], [-0.45, 0.1, -0.3], [0.42, 0.4, 0.3]].forEach(function (p) {
        ell(g, x + p[0] * s, y + p[1] * s, s * 0.34, s * 0.17, p[2], '#7cc36a');
      });
      pen(g, s * 0.7);
      [[-0.3, -0.25], [0.3, 0.02], [-0.25, 0.5]].forEach(function (p) { ell(g, x + p[0] * s, y + p[1] * s, s * 0.2, s * 0.2, 0, '#e4534a'); });
    },
    lettuceplant: function (g, x, y, s) {
      box(g, x - s, y + s * 0.45, s * 2, s * 0.4, s * 0.2, '#a98a6a', false);
      g.strokeStyle = '#5da24c'; g.lineWidth = Math.max(1.5, s * 0.09);
      ell(g, x - s * 0.45, y + s * 0.15, s * 0.5, s * 0.34, -0.6, '#9bd97f');
      ell(g, x + s * 0.45, y + s * 0.15, s * 0.5, s * 0.34, 0.6, '#9bd97f');
      ell(g, x, y - s * 0.05, s * 0.42, s * 0.55, 0, '#b4e69b');
    }
  };
  function snow(g, x, y, r) {
    g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.2, r * 0.3); g.lineCap = 'round';
    for (var k = 0; k < 3; k++) {
      var a = k * Math.PI / 3;
      g.beginPath(); g.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke();
    }
  }

  function form(g, name, x, y, s, opts) { if (FORMS[name]) FORMS[name](g, x, y, s, opts); }

  var PLACES = {
    farm: function (g) {
      box(g, -22, -40, 44, 40, 2, '#d9534a');
      poly(g, [-27, -40, 0, -62, 27, -40], '#b8413a');
      box(g, -9, -24, 18, 24, 1, '#f6e7d0');
      g.beginPath(); g.moveTo(-9, -24); g.lineTo(9, 0); g.moveTo(9, -24); g.lineTo(-9, 0); g.stroke();
    },
    mill: function (g) {
      box(g, -27, -26, 26, 26, 2, '#e9d9b0');
      box(g, -4, -60, 28, 60, 10, '#cfd6dc');
      g.beginPath(); g.moveTo(-4, -44); g.lineTo(24, -44); g.moveTo(-4, -28); g.lineTo(24, -28); g.stroke();
      g.fillStyle = '#9aa3a9'; g.beginPath(); g.arc(-14, -12, 7, 0, 6.283); g.fill(); g.stroke();
    },
    bakery: function (g, o) {
      box(g, 9, -62, 9, 20, 1, '#b8413a');
      if (o && o.live) {
        g.fillStyle = 'rgba(255,255,255,.8)';
        for (var k = 0; k < 3; k++) { var p = ((o.t || 0) * 0.5 + k / 3) % 1; g.beginPath(); g.arc(14 + p * 8, -66 - p * 22, 3 + p * 4, 0, 6.283); g.fill(); }
      }
      box(g, -24, -38, 48, 38, 2, '#f3d9b0');
      box(g, -27, -46, 54, 10, 3, '#a8703a');
      box(g, -17, -28, 20, 16, 3, '#fff');
      C.food(g, 'bread', -7, -19, 6);
      box(g, 8, -22, 11, 22, 1, '#8b7355');
    },
    factory: function (g, o) {
      box(g, 14, -64, 9, 34, 1, '#9aa3a9');
      if (o && o.live) {
        g.fillStyle = 'rgba(255,255,255,.8)';
        for (var k = 0; k < 3; k++) { var p = ((o.t || 0) * 0.5 + k / 3) % 1; g.beginPath(); g.arc(18 + p * 8, -68 - p * 20, 3 + p * 4, 0, 6.283); g.fill(); }
      }
      poly(g, [-26, -32, -26, -46, -9, -32, -9, -46, 8, -32, 8, -46, 26, -32], '#9aa3a9');
      box(g, -26, -32, 52, 32, 2, '#cfd6dc');
      box(g, -19, -22, 10, 9, 1, '#fff'); box(g, -5, -22, 10, 9, 1, '#fff');
      box(g, 10, -18, 11, 18, 1, '#59636b');
    },
    shed: function (g) {
      g.fillStyle = '#9aa3a9'; g.beginPath(); g.moveTo(-29, -26); g.quadraticCurveTo(0, -48, 29, -26); g.closePath(); g.fill(); g.stroke();
      box(g, -27, -26, 54, 26, 2, '#e3c9a0');
      box(g, -12, -19, 24, 19, 1, '#6d5a43');
      box(g, -8, -9, 8, 9, 1, '#d9b98a'); box(g, 1, -9, 8, 9, 1, '#d9b98a');
    },
    truck: function (g, o) {
      box(g, -28, -38, 36, 30, 4, o && o.cold ? '#bfe0ff' : '#fff');
      if (o && o.cold) snow(g, -10, -23, 7);
      g.strokeStyle = INK.line; g.lineWidth = 2.5;
      box(g, 8, -28, 20, 20, 4, '#f5b942');
      box(g, 14, -24, 10, 8, 2, '#dfeef5');
      g.fillStyle = INK.line;
      g.beginPath(); g.arc(-16, -5, 6, 0, 6.283); g.arc(16, -5, 6, 0, 6.283); g.fill();
    },
    shop: function (g) {
      box(g, -24, -36, 48, 36, 2, '#fff');
      box(g, -18, -22, 18, 13, 2, '#dfeef5');
      box(g, 6, -22, 12, 22, 1, '#8b7355');
      box(g, -27, -45, 54, 12, 4, '#f2788f');
      g.fillStyle = 'rgba(255,255,255,.6)';
      for (var k = 0; k < 3; k++) g.fillRect(-20 + k * 18, -43, 8, 8);
    },
    home: function (g) {
      box(g, -22, -34, 44, 34, 2, '#f6d7d2');
      poly(g, [-28, -34, 0, -58, 28, -34], '#b8413a');
      box(g, -5, -18, 11, 18, 1, '#8b7355');
      box(g, -17, -26, 10, 9, 1, '#dfeef5'); box(g, 9, -26, 9, 9, 1, '#dfeef5');
    }
  };

  function place(g, kind, x, y, k, opts) {
    g.save(); g.translate(x, y); g.scale(k, k);
    g.strokeStyle = INK.line; g.lineWidth = 2.5; g.lineJoin = g.lineCap = 'round';
    if (PLACES[kind]) PLACES[kind](g, opts);
    g.restore();
  }

  BQ.foodArt = { form: form, place: place, forms: Object.keys(FORMS), places: Object.keys(PLACES) };
})(window);
