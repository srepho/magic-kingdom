/* Where are we? — drawing shared by this guide's scenes: the globe, planets, stars, the home pin.
 * (A candidate for shared/ if another guide needs a globe; kept here for now.)
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.whereSim, INK = BQ.ink;
  var SPACE = '#232a52', LAND = '#9ccf8a', ICE = '#f4f8fb';

  /* the round Earth seen from far away, centred on (lon0, lat0) */
  function globe(g, cx, cy, r, lon0, lat0) {
    g.save();
    g.beginPath(); g.arc(cx, cy, r, 0, 6.283);
    g.fillStyle = INK.water; g.fill(); g.clip();
    for (var i = 0; i < S.LANDS.length; i++) {
      var land = S.LANDS[i], pts = land.dense, seen = false;
      g.beginPath();
      for (var k = 0; k < pts.length; k++) {
        var p = S.project(pts[k][0], pts[k][1], lon0, lat0), x = p.x, y = p.y;
        if (p.z > 0) seen = true;
        else { var n = Math.hypot(x, y) || 1; x /= n; y /= n; }   // round the back: slide to the rim
        if (k) g.lineTo(cx + r * x, cy + r * y); else g.moveTo(cx + r * x, cy + r * y);
      }
      if (!seen) continue;
      g.closePath(); g.fillStyle = land.ice ? ICE : LAND; g.fill();
    }
    g.restore();
    if (r < 2000) {
      g.strokeStyle = 'rgba(47,111,181,.55)'; g.lineWidth = Math.max(1, Math.min(3, r * 0.025));
      g.beginPath(); g.arc(cx, cy, r, 0, 6.283); g.stroke();
    }
  }

  /* one planet, i = 0 (Mercury) … 7 (Neptune) */
  function planet(g, i, x, y, r) {
    var p = S.PLANETS[i];
    if (i === 2) { globe(g, x, y, r, S.VIEW.lon, S.VIEW.lat); return; }
    if (p.rings) {
      g.strokeStyle = '#cdb98a'; g.lineWidth = Math.max(1.5, r * 0.22);
      g.beginPath(); g.ellipse(x, y, r * 2.05, r * 0.55, -0.35, Math.PI * 0.02, Math.PI * 0.98); g.stroke();
    }
    g.fillStyle = p.colour; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    if (i === 4 && r > 6) {                                   // Jupiter's bands and spot
      g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.clip();
      g.fillStyle = 'rgba(170,110,70,.45)';
      g.fillRect(x - r, y - r * 0.45, 2 * r, r * 0.2); g.fillRect(x - r, y + r * 0.1, 2 * r, r * 0.26);
      g.fillStyle = 'rgba(200,90,60,.7)'; g.beginPath(); g.ellipse(x + r * 0.35, y + r * 0.3, r * 0.2, r * 0.12, 0, 0, 6.283); g.fill();
      g.restore();
    }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = Math.max(1, r * 0.06);
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
    if (p.rings) {
      g.strokeStyle = '#cdb98a'; g.lineWidth = Math.max(1.5, r * 0.22);
      g.beginPath(); g.ellipse(x, y, r * 2.05, r * 0.55, -0.35, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
    }
  }

  /* a dark sky with a fixed scatter of stars that twinkle gently */
  function sky(g, x, y, w, h, seed, n, clock) {
    g.fillStyle = SPACE; g.fillRect(x, y, w, h);
    var s = seed, calm = BQ.calm();
    for (var i = 0; i < n; i++) {
      s = (s * 1664525 + 1013904223) >>> 0; var sx = x + (s % 10000) / 10000 * w;
      s = (s * 1664525 + 1013904223) >>> 0; var sy = y + (s % 10000) / 10000 * h;
      var tw = calm ? 0.7 : 0.55 + 0.35 * Math.sin(clock * (1 + (i % 5) * 0.4) + i);
      g.fillStyle = 'rgba(255,255,255,' + tw + ')';
      g.beginPath(); g.arc(sx, sy, 0.8 + (i % 3) * 0.5, 0, 6.283); g.fill();
    }
  }

  /* "home is here": a red dot with a soft ring */
  function pin(g, x, y, s, clock, alpha) {
    if (alpha <= 0.01) return;
    g.save(); g.globalAlpha = alpha;
    var pulse = BQ.calm() ? 0.5 : (clock * 0.7) % 1;
    g.strokeStyle = 'rgba(228,83,74,' + (1 - pulse) + ')'; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y, s + pulse * s * 2.2, 0, 6.283); g.stroke();
    g.fillStyle = '#e4534a'; g.strokeStyle = '#fff'; g.lineWidth = Math.max(1.5, s * 0.35);
    g.beginPath(); g.arc(x, y, s, 0, 6.283); g.fill(); g.stroke();
    g.restore();
  }

  BQ.atlas = { globe: globe, planet: planet, sky: sky, pin: pin, SPACE: SPACE };
})(window);
