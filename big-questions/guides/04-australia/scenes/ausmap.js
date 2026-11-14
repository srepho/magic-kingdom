/* Guide 04 — drawing the map. Shared by the story (centrepiece) and the sea (moment).
 * The patchwork of tiles stands for "many Countries". The tiles are regular and made up:
 * they are not real boundaries. Nothing here copies an Aboriginal or Torres Strait Islander
 * art style: it is a plain modern map.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.storySim, INK = BQ.ink;
  var HUES = [[242, 196, 141], [232, 168, 124], [200, 214, 160], [160, 207, 176], [170, 201, 232], [215, 181, 224], [240, 217, 140], [236, 170, 170]];
  var PALE = [226, 220, 208];

  function path(g, poly) {
    g.beginPath();
    poly.forEach(function (p, i) { if (i) g.lineTo(S.px(p[0]), S.py(p[1])); else g.moveTo(S.px(p[0]), S.py(p[1])); });
    g.closePath();
  }
  function tint(hue, c) {
    var h = HUES[hue];
    return 'rgb(' + Math.round(PALE[0] + (h[0] - PALE[0]) * c) + ',' + Math.round(PALE[1] + (h[1] - PALE[1]) * c) + ',' + Math.round(PALE[2] + (h[2] - PALE[2]) * c) + ')';
  }
  function hex(g, x, y, r) {
    g.beginPath();
    for (var k = 0; k < 6; k++) { var a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
    g.closePath();
  }

  /* opts: low (0..1 extra dry land), year (for colonisation; omit for "before"), glow {index: 0..1}, clock */
  function draw(g, opts) {
    var low = opts.low || 0, y = opts.year, i;
    // land that is under the sea today
    if (low > 0.01) {
      g.fillStyle = 'rgba(233,221,172,' + low + ')'; g.strokeStyle = 'rgba(160,140,96,' + (0.8 * low) + ')'; g.lineWidth = 1.5;
      g.setLineDash([4, 4]);
      S.SHELF.forEach(function (poly) { path(g, poly); g.fill(); g.stroke(); });
      g.setLineDash([]);
    }
    g.fillStyle = '#e6dfcf'; g.strokeStyle = '#b9a98a'; g.lineWidth = 1.5;
    path(g, S.NEW_GUINEA); g.fill(); g.stroke();
    // the patchwork, clipped to the coast
    [S.MAINLAND, S.TASMANIA].forEach(function (poly) {
      g.save(); path(g, poly); g.fillStyle = '#e6dfcf'; g.fill(); g.clip();
      for (i = 0; i < S.TILES.length; i++) {
        var t = S.TILES[i]; if (t.island) continue;
        var c = y == null ? 1 : S.colour(t, y), glow = (opts.glow && opts.glow[i]) || 0;
        g.fillStyle = tint(t.hue, c);
        hex(g, S.px(t.lon), S.py(t.lat), 7.4 + glow * 2); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.stroke();
        if (glow > 0) { g.fillStyle = 'rgba(255,255,255,' + (0.6 * glow) + ')'; g.fill(); }
      }
      g.restore();
      g.strokeStyle = INK.line; g.lineWidth = 2.5; path(g, poly); g.stroke();
    });
    // the Torres Strait Islands
    S.TILES.forEach(function (t) {
      if (!t.island) return;
      g.fillStyle = tint(t.hue, y == null ? 1 : S.colour(t, y)); g.strokeStyle = INK.line; g.lineWidth = 1.5;
      g.beginPath(); g.arc(S.px(t.lon), S.py(t.lat), 3.2, 0, 6.283); g.fill(); g.stroke();
    });
    if (y != null) {
      S.TOWNS.forEach(function (town) {                      // the newcomers' towns
        if (y < town.from) return;
        var x = S.px(town.at[0]), yy = S.py(town.at[1]), grow = Math.min(1, (y - town.from) / 12);
        g.fillStyle = '#8d8a84'; g.strokeStyle = INK.line; g.lineWidth = 1.5;
        g.beginPath(); g.rect(x - 4 * grow, yy - 3 * grow, 8 * grow, 6 * grow); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(x - 5.5 * grow, yy - 3 * grow); g.lineTo(x, yy - 8 * grow); g.lineTo(x + 5.5 * grow, yy - 3 * grow); g.closePath(); g.fill(); g.stroke();
      });
    }
  }

  /* a small boat. kind: 'ship' (tall, square sails) or 'prau' (one slanted sail) */
  function boat(g, x, y, kind, clock, alpha) {
    if (alpha <= 0.02) return;
    g.save(); g.globalAlpha = alpha; g.translate(x, y + Math.sin(clock * 2 + x) * 1.2);
    g.strokeStyle = INK.line; g.lineWidth = 1.5; g.fillStyle = '#8b6a4a';
    g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.lineTo(6, 5); g.lineTo(-6, 5); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -14); g.stroke();
    g.fillStyle = '#fff';
    if (kind === 'ship') { g.beginPath(); g.rect(-6, -13, 12, 5); g.rect(-5, -7, 10, 5); g.fill(); g.stroke(); }
    else { g.beginPath(); g.moveTo(0, -14); g.lineTo(9, -3); g.lineTo(-4, -4); g.closePath(); g.fill(); g.stroke(); }
    g.restore();
  }

  BQ.ausmap = { draw: draw, boat: boat, W: S.px(154), H: S.py(-44) };
})(window);
