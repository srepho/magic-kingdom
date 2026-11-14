/* Guide 02 — the cast: three Australian animals, the things they trade, coins, thought bubbles.
 * Drawn in the "what eyes see" style from STYLE.md: flat shapes, ink outlines.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, INK = BQ.ink;
  var FUR = { wombat: '#a17a55', koala: '#aeb5bd', frog: '#7cc36a' };

  function dot(g, x, y, r, fill) { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }

  /* mood: 'want' | 'happy' | 'yum' | 'no' | 'meh'.  t is a clock for wobbles. */
  function critter(g, kind, x, y, s, mood, t) {
    if (mood === 'no') x += Math.sin(t * 28) * s * 0.14;
    if (mood === 'yum') y += Math.abs(Math.sin(t * 9)) * -s * 0.1;
    var fur = FUR[kind];
    g.lineWidth = s * 0.09; g.strokeStyle = INK.line;
    // body
    g.fillStyle = fur; g.beginPath(); g.ellipse(x, y + s * 1.05, s * 0.95, s * 0.85, 0, 0, 6.283); g.fill(); g.stroke();
    // ears / eye bumps behind the head
    if (kind === 'koala') {
      [-1, 1].forEach(function (d) {
        g.fillStyle = fur; g.beginPath(); g.arc(x + d * s * 0.88, y - s * 0.5, s * 0.46, 0, 6.283); g.fill(); g.stroke();
        dot(g, x + d * s * 0.88, y - s * 0.5, s * 0.24, '#f3e9ea');
      });
    } else if (kind === 'wombat') {
      [-1, 1].forEach(function (d) {
        g.fillStyle = fur; g.beginPath(); g.arc(x + d * s * 0.62, y - s * 0.78, s * 0.24, 0, 6.283); g.fill(); g.stroke();
      });
    } else {
      [-1, 1].forEach(function (d) {
        g.fillStyle = fur; g.beginPath(); g.arc(x + d * s * 0.5, y - s * 0.72, s * 0.36, 0, 6.283); g.fill(); g.stroke();
      });
    }
    // head
    g.fillStyle = fur; g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill(); g.stroke();
    // eyes
    var ex = kind === 'frog' ? 0.5 : 0.4, ey = kind === 'frog' ? -0.72 : -0.15;
    [-1, 1].forEach(function (d) {
      var cx = x + d * s * ex, cy = y + s * ey;
      if (kind === 'frog') dot(g, cx, cy, s * 0.22, '#fff');
      if (mood === 'happy' || mood === 'yum') {
        g.beginPath(); g.arc(cx, cy + s * 0.05, s * 0.12, Math.PI, 0); g.lineWidth = s * 0.08; g.stroke();
      } else dot(g, cx, cy, s * 0.1, INK.line);
    });
    // nose
    if (kind === 'koala') { g.fillStyle = '#33302c'; g.beginPath(); g.ellipse(x, y + s * 0.12, s * 0.17, s * 0.27, 0, 0, 6.283); g.fill(); }
    if (kind === 'wombat') { g.fillStyle = '#5c4433'; g.beginPath(); g.ellipse(x, y + s * 0.16, s * 0.3, s * 0.2, 0, 0, 6.283); g.fill(); }
    // mouth
    var my = y + s * (kind === 'frog' ? 0.3 : 0.58), mw = s * (kind === 'frog' ? 0.55 : 0.28);
    g.lineWidth = s * 0.08; g.strokeStyle = INK.line; g.beginPath();
    if (mood === 'yum') {
      var open = 0.1 + 0.16 * Math.abs(Math.sin(t * 9));
      g.fillStyle = '#7a3b3b'; g.ellipse(x, my, mw * 0.7, s * open, 0, 0, 6.283); g.fill();
    } else if (mood === 'happy') { g.arc(x, my - mw * 0.5, mw, 0.25, Math.PI - 0.25); g.stroke(); }
    else if (mood === 'no') { g.moveTo(x - mw * 0.8, my); g.lineTo(x + mw * 0.8, my); g.stroke(); }
    else if (mood === 'meh') {
      g.moveTo(x - mw, my); g.quadraticCurveTo(x - mw * 0.5, my - s * 0.12, x, my);
      g.quadraticCurveTo(x + mw * 0.5, my + s * 0.12, x + mw, my); g.stroke();
    } else { g.arc(x, my - mw * 0.2, mw * 0.6, 0.5, Math.PI - 0.5); g.stroke(); }
  }

  function food(g, kind, x, y, s) {
    g.lineWidth = Math.max(1.5, s * 0.14); g.strokeStyle = INK.line; g.lineJoin = g.lineCap = 'round';
    if (kind === 'apple') {
      g.fillStyle = '#e4534a'; g.beginPath(); g.arc(x, y + s * 0.1, s * 0.85, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x, y - s * 0.7); g.lineTo(x + s * 0.2, y - s * 1.1); g.stroke();
      g.fillStyle = '#7cc36a'; g.beginPath(); g.ellipse(x + s * 0.5, y - s * 0.95, s * 0.3, s * 0.15, -0.5, 0, 6.283); g.fill();
    } else if (kind === 'bread') {
      g.fillStyle = '#d9a25f'; BQ.draw.round(g, x - s * 1.1, y - s * 0.6, s * 2.2, s * 1.3, s * 0.6); g.fill(); g.stroke();
      g.lineWidth = Math.max(1, s * 0.1);
      for (var k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * s * 0.55 - s * 0.12, y - s * 0.3); g.lineTo(x + k * s * 0.55 + s * 0.12, y + s * 0.1); g.stroke(); }
    } else if (kind === 'fish') {
      g.fillStyle = '#6fb6d9'; g.beginPath(); g.ellipse(x - s * 0.15, y, s * 0.9, s * 0.55, 0, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x + s * 0.7, y); g.lineTo(x + s * 1.25, y - s * 0.5); g.lineTo(x + s * 1.25, y + s * 0.5); g.closePath(); g.fill(); g.stroke();
      dot(g, x - s * 0.55, y - s * 0.12, s * 0.1, INK.line);
    } else if (kind === 'banana') {
      g.strokeStyle = INK.line; g.lineWidth = s * 0.75; g.beginPath(); g.arc(x, y - s * 0.5, s, 0.5, Math.PI - 0.5); g.stroke();
      g.strokeStyle = '#f5d033'; g.lineWidth = s * 0.5; g.beginPath(); g.arc(x, y - s * 0.5, s, 0.55, Math.PI - 0.55); g.stroke();
    } else if (kind === 'biscuit') {
      g.fillStyle = '#d6a868'; g.beginPath(); g.arc(x, y, s * 0.9, 0, 6.283); g.fill(); g.stroke();
      [[-0.3, -0.25], [0.3, -0.1], [-0.1, 0.35], [0.35, 0.4]].forEach(function (p) { dot(g, x + p[0] * s, y + p[1] * s, s * 0.13, '#6b4428'); });
    } else if (kind === 'berry') {
      g.fillStyle = '#e64b6b'; g.beginPath(); g.moveTo(x, y + s);
      g.bezierCurveTo(x - s * 1.3, y - s * 0.2, x - s * 0.6, y - s * 1.0, x, y - s * 0.55);
      g.bezierCurveTo(x + s * 0.6, y - s * 1.0, x + s * 1.3, y - s * 0.2, x, y + s); g.fill(); g.stroke();
      g.fillStyle = '#7cc36a'; g.beginPath(); g.ellipse(x, y - s * 0.7, s * 0.5, s * 0.18, 0, 0, 6.283); g.fill();
    } else if (kind === 'icecream') {
      g.fillStyle = '#e0b070'; g.beginPath(); g.moveTo(x - s * 0.55, y); g.lineTo(x + s * 0.55, y); g.lineTo(x, y + s * 1.3); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#ffc0d0'; g.beginPath(); g.arc(x, y - s * 0.3, s * 0.72, 0, 6.283); g.fill(); g.stroke();
    } else if (kind === 'kite') {
      g.fillStyle = '#ff8a5c'; g.beginPath(); g.moveTo(x, y - s * 1.2); g.lineTo(x + s * 0.85, y); g.lineTo(x, y + s * 1.2); g.lineTo(x - s * 0.85, y); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x, y - s * 1.2); g.lineTo(x, y + s * 1.2); g.moveTo(x - s * 0.85, y); g.lineTo(x + s * 0.85, y); g.stroke();
      g.beginPath(); g.moveTo(x, y + s * 1.2); g.quadraticCurveTo(x + s * 0.6, y + s * 1.7, x, y + s * 2.1); g.stroke();
    } else if (kind === 'heart') {
      g.fillStyle = '#f2788f'; g.beginPath(); g.moveTo(x, y + s * 0.8);
      g.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.5, y - s * 1.1, x, y - s * 0.35);
      g.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.8); g.fill();
    }
  }

  /* a plain gold coin. Not a copy of any real coin. */
  function coin(g, x, y, r, hollow) {
    g.lineWidth = Math.max(1.2, r * 0.16); g.strokeStyle = '#a66a00';
    g.fillStyle = hollow ? 'rgba(255,255,255,.7)' : INK.sun;
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke();
    if (!hollow) {
      g.strokeStyle = 'rgba(166,106,0,.5)'; g.lineWidth = Math.max(1, r * 0.1);
      g.beginPath(); g.arc(x, y, r * 0.62, 0, 6.283); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = Math.max(1, r * 0.14);
      g.beginPath(); g.arc(x, y, r * 0.62, 3.5, 4.5); g.stroke();
    }
  }

  /* a thought bubble; side is -1 or 1 for which way the little circles trail */
  function bubble(g, x, y, r, side) {
    g.fillStyle = '#fff'; g.strokeStyle = INK.line; g.lineWidth = 2.5;
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.arc(x - side * r * 0.85, y + r * 1.05, r * 0.24, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.arc(x - side * r * 1.2, y + r * 1.5, r * 0.14, 0, 6.283); g.fill(); g.stroke();
  }

  /* things that fly from one place to another, with something to do on landing */
  function flights() {
    var list = [];
    return {
      send: function (kind, name, x0, y0, x1, y1, done, delay) {
        list.push({ kind: kind, name: name, x0: x0, y0: y0, x1: x1, y1: y1, t: -(delay || 0), done: done });
      },
      tick: function (dt) {
        for (var i = list.length - 1; i >= 0; i--) {
          var f = list[i]; f.t += dt / 0.45;
          if (f.t >= 1) { list.splice(i, 1); if (f.done) f.done(); }
        }
      },
      draw: function (g, s) {
        list.forEach(function (f) {
          if (f.t < 0) return;
          var e = f.t * f.t * (3 - 2 * f.t), x = f.x0 + (f.x1 - f.x0) * e;
          var y = f.y0 + (f.y1 - f.y0) * e - Math.sin(f.t * Math.PI) * 26;
          if (f.kind === 'coin') coin(g, x, y, s * 0.75); else food(g, f.name, x, y, s);
        });
      },
      busy: function () { return list.length > 0; },
      clear: function () { list.length = 0; }
    };
  }

  BQ.cast = { critter: critter, food: food, coin: coin, bubble: bubble, flights: flights };
})(window);
