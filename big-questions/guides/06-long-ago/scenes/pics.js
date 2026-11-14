/* Guide 06 — the pictures: a child, babies, and one small picture for each landmark in time.
 * "What eyes see" style from STYLE.md: flat shapes, ink outlines. People from long ago are
 * drawn as plain silhouettes on purpose.
 * (A candidate for shared/ if another guide wants a timeline; kept here for now.)
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, INK = BQ.ink, D = BQ.draw;

  function dot(g, x, y, r, fill) { g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); }
  function ink(g, w) { g.strokeStyle = INK.line; g.lineWidth = w; g.lineJoin = g.lineCap = 'round'; }

  /* a baby in a blanket; x,y is the middle, s about half its width */
  function baby(g, x, y, s, blanket, glasses) {
    ink(g, Math.max(1.5, s * 0.12));
    g.fillStyle = blanket; g.beginPath(); g.ellipse(x + s * 0.2, y + s * 0.1, s * 0.85, s * 0.48, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#ffe0a3'; g.beginPath(); g.arc(x - s * 0.6, y - s * 0.1, s * 0.42, 0, 6.283); g.fill(); g.stroke();
    dot(g, x - s * 0.74, y - s * 0.16, s * 0.055, INK.line); dot(g, x - s * 0.48, y - s * 0.16, s * 0.055, INK.line);
    dot(g, x - s * 0.61, y + s * 0.06, s * 0.1, '#f2788f');                    // dummy
    g.beginPath(); g.arc(x - s * 0.6, y - s * 0.5, s * 0.1, 3.4, 6.2); g.stroke(); // one curl of hair
    if (glasses) {
      g.lineWidth = Math.max(1.2, s * 0.08);
      g.beginPath(); g.arc(x - s * 0.74, y - s * 0.16, s * 0.13, 0, 6.283); g.stroke();
      g.beginPath(); g.arc(x - s * 0.46, y - s * 0.16, s * 0.13, 0, 6.283); g.stroke();
    }
  }

  /* a child standing with feet at x,y. h is the height at age five; age 0 is a baby. */
  function kid(g, x, y, h, age, t, wave) {
    if (age < 0.5) { baby(g, x, y - h * 0.16, h * 0.42, '#f6b8c6'); return; }
    var k = 0.48 + 0.104 * Math.min(5, age), H = h * k, r = H * 0.2;
    ink(g, Math.max(1.5, H * 0.045));
    g.fillStyle = '#6fb6d9'; D.round(g, x - H * 0.2, y - H * 0.6, H * 0.4, H * 0.6, H * 0.12); g.fill(); g.stroke();
    var a = wave ? -0.9 + Math.sin(t * 9) * 0.5 : 0.5;                          // one arm, waving if asked
    g.beginPath(); g.moveTo(x + H * 0.18, y - H * 0.48); g.lineTo(x + H * 0.18 + Math.cos(a) * H * 0.26, y - H * 0.48 + Math.sin(a) * H * 0.26); g.stroke();
    g.beginPath(); g.moveTo(x - H * 0.18, y - H * 0.48); g.lineTo(x - H * 0.34, y - H * 0.28); g.stroke();
    g.fillStyle = '#ffe0a3'; g.beginPath(); g.arc(x, y - H * 0.6 - r * 0.85, r, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#8b5a3c'; g.beginPath(); g.arc(x, y - H * 0.6 - r * 1.05, r * 0.98, 3.3, 6.12); g.fill();
    var ey = y - H * 0.6 - r * 0.85;
    dot(g, x - r * 0.38, ey, r * 0.11, INK.line); dot(g, x + r * 0.38, ey, r * 0.11, INK.line);
    g.lineWidth = Math.max(1.2, r * 0.13); g.beginPath(); g.arc(x, ey + r * 0.2, r * 0.38, 0.3, Math.PI - 0.3); g.stroke();
  }

  var PIC = {
    baby: function (g, x, y, s) { baby(g, x, y, s, '#f6b8c6'); },
    dad: function (g, x, y, s) { baby(g, x, y, s, '#9fc7ea', true); },
    bridge: function (g, x, y, s) {
      g.fillStyle = INK.water; D.round(g, x - s * 1.1, y + s * 0.42, s * 2.2, s * 0.34, s * 0.12); g.fill();
      ink(g, Math.max(1.5, s * 0.13)); g.strokeStyle = '#59636b';
      g.beginPath(); g.ellipse(x, y + s * 0.3, s * 0.82, s * 0.85, 0, Math.PI, 0); g.stroke();
      g.lineWidth = Math.max(1, s * 0.06);
      for (var k = -3; k <= 3; k++) {
        var hx = x + k * s * 0.2, top = y + s * 0.3 - Math.sqrt(Math.max(0, 1 - Math.pow(k * 0.2 / 0.82, 2))) * s * 0.85;
        g.beginPath(); g.moveTo(hx, top); g.lineTo(hx, y + s * 0.3); g.stroke();
      }
      g.lineWidth = Math.max(1.5, s * 0.13);
      g.beginPath(); g.moveTo(x - s * 1.1, y + s * 0.3); g.lineTo(x + s * 1.1, y + s * 0.3); g.stroke();
      g.fillStyle = '#d9c9a8'; ink(g, Math.max(1.2, s * 0.08));
      [-1, 1].forEach(function (d) { g.beginPath(); g.rect(x + d * s * 0.92 - s * 0.12, y - s * 0.12, s * 0.24, s * 0.62); g.fill(); g.stroke(); });
    },
    castle: function (g, x, y, s, t) {
      ink(g, Math.max(1.5, s * 0.1)); g.fillStyle = '#c9c5bd';
      g.beginPath(); g.rect(x - s * 0.55, y - s * 0.1, s * 1.1, s * 0.8); g.fill(); g.stroke();
      [-1, 1].forEach(function (d) {
        var tx = x + d * s * 0.68;
        g.fillStyle = '#b9b4aa'; g.beginPath(); g.rect(tx - s * 0.24, y - s * 0.55, s * 0.48, s * 1.25); g.fill(); g.stroke();
        for (var k = -1; k <= 1; k += 2) { g.beginPath(); g.rect(tx + k * s * 0.15 - s * 0.09, y - s * 0.75, s * 0.18, s * 0.2); g.fill(); g.stroke(); }
      });
      g.fillStyle = '#6b4a33'; g.beginPath(); g.moveTo(x - s * 0.18, y + s * 0.7); g.lineTo(x - s * 0.18, y + s * 0.35);
      g.arc(x, y + s * 0.35, s * 0.18, Math.PI, 0); g.lineTo(x + s * 0.18, y + s * 0.7); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x, y - s * 0.1); g.lineTo(x, y - s * 0.95); g.stroke();
      var f = Math.sin(t * 5) * s * 0.08;
      g.fillStyle = '#f2788f'; g.beginPath(); g.moveTo(x, y - s * 0.95); g.lineTo(x + s * 0.45, y - s * 0.8 + f); g.lineTo(x, y - s * 0.62); g.closePath(); g.fill(); g.stroke();
    },
    pyramid: function (g, x, y, s) {
      dot(g, x + s * 0.7, y - s * 0.6, s * 0.24, INK.sun);
      ink(g, Math.max(1.5, s * 0.1));
      g.fillStyle = '#e8c77a'; g.beginPath(); g.moveTo(x - s * 0.15, y - s * 0.75); g.lineTo(x + s * 0.85, y + s * 0.65); g.lineTo(x - s * 1.05, y + s * 0.65); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#cfa955'; g.beginPath(); g.moveTo(x - s * 0.15, y - s * 0.75); g.lineTo(x + s * 0.85, y + s * 0.65); g.lineTo(x + s * 0.2, y + s * 0.65); g.closePath(); g.fill(); g.stroke();
    },
    /* a campfire (people are here) and a Diprotodon, a giant relative of wombats */
    camp: function (g, x, y, s, t) {
      ink(g, Math.max(1.5, s * 0.09));
      var bx = x + s * 0.3, by = y + s * 0.05;
      g.fillStyle = '#9a7a5a';
      [-0.45, 0.4].forEach(function (d) { g.beginPath(); g.rect(bx + d * s - s * 0.1, by + s * 0.2, s * 0.22, s * 0.45); g.fill(); g.stroke(); });
      g.beginPath(); g.ellipse(bx, by, s * 0.75, s * 0.45, 0, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.arc(bx - s * 0.72, by - s * 0.02, s * 0.34, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.arc(bx - s * 0.62, by - s * 0.36, s * 0.1, 0, 6.283); g.fill(); g.stroke();
      dot(g, bx - s * 0.82, by - s * 0.08, s * 0.05, INK.line); dot(g, bx - s * 1.02, by + s * 0.08, s * 0.08, '#5c4433');
      var fx = x - s * 0.95, fy = y + s * 0.6, fl = 0.8 + 0.2 * Math.sin(t * 11);
      g.lineWidth = Math.max(1.5, s * 0.1); g.strokeStyle = '#6b4a33';
      g.beginPath(); g.moveTo(fx - s * 0.22, fy); g.lineTo(fx + s * 0.22, fy - s * 0.1); g.moveTo(fx + s * 0.22, fy); g.lineTo(fx - s * 0.22, fy - s * 0.1); g.stroke();
      g.fillStyle = INK.warm; g.beginPath(); g.moveTo(fx - s * 0.16, fy - s * 0.06); g.quadraticCurveTo(fx, fy - s * 0.7 * fl, fx + s * 0.16, fy - s * 0.06); g.fill();
      g.fillStyle = INK.sun; g.beginPath(); g.moveTo(fx - s * 0.08, fy - s * 0.06); g.quadraticCurveTo(fx, fy - s * 0.36 * fl, fx + s * 0.08, fy - s * 0.06); g.fill();
    },
    /* some of the first people like us: plain silhouettes against a low sun */
    first: function (g, x, y, s) {
      dot(g, x, y + s * 0.1, s * 0.7, '#ffc078');
      g.fillStyle = INK.line; g.strokeStyle = INK.line; g.lineCap = 'round';
      g.lineWidth = Math.max(1.5, s * 0.1);
      g.beginPath(); g.moveTo(x + s * 0.62, y + s * 0.7); g.lineTo(x + s * 0.58, y - s * 0.3); g.stroke();
      g.beginPath(); g.ellipse(x + s * 0.55, y - s * 0.42, s * 0.5, s * 0.14, 0, 0, 6.283); g.fill();
      [[-0.5, 0.62], [-0.08, 0.42]].forEach(function (p) {
        var px = x + p[0] * s, h = p[1] * s * 1.5;
        g.beginPath(); g.arc(px, y + s * 0.7 - h, h * 0.17, 0, 6.283); g.fill();
        D.round(g, px - h * 0.13, y + s * 0.7 - h * 0.8, h * 0.26, h * 0.8, h * 0.08); g.fill();
      });
      g.fillRect(x - s * 0.95, y + s * 0.68, s * 1.9, Math.max(1.5, s * 0.08));
    },
    dino: function (g, x, y, s, t) {
      var sway = Math.sin(t * 1.6) * s * 0.08, c = '#7cc36a';
      g.lineCap = g.lineJoin = 'round';
      function limb(w, col) {
        g.strokeStyle = col; g.lineWidth = w;
        g.beginPath(); g.moveTo(x - s * 0.25, y + s * 0.05); g.quadraticCurveTo(x - s * 0.75, y - s * 0.2, x - s * 0.8 + sway, y - s * 0.85); g.stroke();   // neck
        g.beginPath(); g.moveTo(x + s * 0.4, y + s * 0.1); g.quadraticCurveTo(x + s * 0.9, y + s * 0.15, x + s * 1.1, y + s * 0.45); g.stroke();          // tail
        [-0.2, 0.3].forEach(function (d) { g.beginPath(); g.moveTo(x + d * s, y + s * 0.2); g.lineTo(x + d * s, y + s * 0.68); g.stroke(); });
      }
      limb(s * 0.34, INK.line);
      g.fillStyle = INK.line; g.beginPath(); g.ellipse(x + s * 0.05, y + s * 0.1, s * 0.58, s * 0.38, 0, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(x - s * 0.88 + sway, y - s * 0.88, s * 0.24, s * 0.17, -0.3, 0, 6.283); g.fill();
      limb(s * 0.2, c);
      g.fillStyle = c; g.beginPath(); g.ellipse(x + s * 0.05, y + s * 0.1, s * 0.5, s * 0.3, 0, 0, 6.283); g.fill();
      g.beginPath(); g.ellipse(x - s * 0.88 + sway, y - s * 0.88, s * 0.17, s * 0.1, -0.3, 0, 6.283); g.fill();
      dot(g, x - s * 0.93 + sway, y - s * 0.9, s * 0.04, INK.line);
    },
    earth: function (g, x, y, s, t) {
      var glow = g.createRadialGradient(x, y, s * 0.5, x, y, s * 1.1);
      glow.addColorStop(0, 'rgba(255,138,92,.55)'); glow.addColorStop(1, 'rgba(255,138,92,0)');
      g.fillStyle = glow; g.beginPath(); g.arc(x, y, s * 1.1, 0, 6.283); g.fill();
      ink(g, Math.max(1.5, s * 0.09));
      g.fillStyle = '#e8663c'; g.beginPath(); g.arc(x, y, s * 0.72, 0, 6.283); g.fill(); g.stroke();
      g.save(); g.beginPath(); g.arc(x, y, s * 0.68, 0, 6.283); g.clip();
      g.fillStyle = INK.sun;
      [[-0.3, -0.2, 0.22], [0.25, 0.1, 0.3], [-0.1, 0.42, 0.18], [0.35, -0.42, 0.14]].forEach(function (b, i) {
        g.globalAlpha = 0.65 + 0.3 * Math.sin(t * 2 + i);
        g.beginPath(); g.ellipse(x + b[0] * s, y + b[1] * s, b[2] * s, b[2] * s * 0.6, i, 0, 6.283); g.fill();
      });
      g.restore(); g.globalAlpha = 1;
    }
  };

  /* draw landmark `key` centred on x,y at half-size s */
  function pic(g, key, x, y, s, t) { if (PIC[key]) PIC[key](g, x, y, s, t || 0); }

  /* a toilet roll seen from the side: r is the paper's radius, tube is the cardboard core */
  function roll(g, x, y, r, tube) {
    ink(g, 2.5);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, Math.max(r, tube), 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#c9a877'; g.beginPath(); g.arc(x, y, tube, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#f3efe6'; g.beginPath(); g.arc(x, y, tube * 0.62, 0, 6.283); g.fill(); g.stroke();
  }

  BQ.longAgoPics = { pic: pic, kid: kid, baby: baby, roll: roll };
})(window);
