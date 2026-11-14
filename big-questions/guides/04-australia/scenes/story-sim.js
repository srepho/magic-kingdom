/* The story of Australia — the facts and the maths, no DOM, so it can be tested in Node.
 *
 * Time is "years ago" (0 is today, taken as 2026). The strip has two scales:
 *   long view  : 65,000 years across the strip. The last 238 years are a hair-thin line.
 *   close view : about 430 years across the strip (from 1596 to today).
 * The map is a rough coastline and a made-up patchwork that stands for "many Countries".
 * The patchwork is NOT the real boundaries: see notes.md.
 *
 * Rules kept here (from the brief): First peoples come first and are present at every moment,
 * including today; 1788 is the start of British colonisation, not the first contact;
 * the long view and the close view are never squeezed onto one even line.
 */
(function (root) {
  'use strict';
  var NOW = 2026, LONG = 65000, CLOSE = 430;
  var DUTCH = 1606, BOATS = [1700, 1907], BRITISH = 1788, RETURN = 1976;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function year(ago) { return NOW - ago; }
  /* how many years the whole strip covers at zoom z (0 long, 1 close) */
  function span(z) { z = clamp01(z); return Math.pow(LONG, 1 - z) * Math.pow(CLOSE, z); }
  /* where on the strip a moment sits: 0 is the far-past end, 1 is today */
  function place(ago, z) { return 1 - clamp01(ago / span(z)); }
  function agoAt(u, z) { return (1 - clamp01(u)) * span(z); }

  /* how much extra land the low sea left dry: 1 at the coldest part of the ice age, 0 today */
  function lowSea(ago) {
    var pts = [[0, 0], [7000, 0], [9000, 0.15], [14000, 0.6], [20000, 1], [30000, 0.8], [65000, 0.6]];
    if (ago <= 0) return 0;
    for (var i = 1; i < pts.length; i++) {
      if (ago <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (ago - a[0]) / (b[0] - a[0]); }
    }
    return 0.6;
  }

  /* ---------- the map ---------- */
  var K = 6.4, X0 = 112, Y0 = -9.2;
  function px(lon) { return (lon - X0) * K; }
  function py(lat) { return (Y0 - lat) * K * 1.08; }
  var MAINLAND = [[114, -22], [117, -20.5], [121, -19.5], [122.5, -17], [125, -14.5], [127, -14], [129, -15], [130, -12.5], [132, -11.5], [135, -12], [137, -12.3], [136, -14.5], [137.5, -16], [139.5, -17.5], [141, -17], [141.6, -13], [142.5, -10.8], [143.8, -14.3], [145.4, -15], [146.3, -19], [149, -21.5], [150.8, -23.5], [153, -25.5], [153.6, -28.5], [152.5, -32.5], [151.2, -34], [150, -37.3], [147.5, -38], [146.3, -39], [144.5, -38.3], [141, -38.2], [139.5, -36], [138, -35.5], [137.6, -33], [136, -34.8], [135.2, -34.6], [134, -32.8], [131, -31.5], [128.5, -32], [125.5, -33], [123.5, -33.9], [120, -34], [118, -35], [115.2, -34.3], [115.7, -31.5], [114.5, -28], [113.5, -25.5]];
  var TASMANIA = [[144.7, -40.8], [146.5, -41.1], [148.3, -40.9], [148.2, -42.2], [147.5, -43.4], [146, -43.5], [145.2, -42.2]];
  var NEW_GUINEA = [[137, -9.2], [137, -5], [138.5, -7.5], [141, -9.2], [143, -9.2], [144.5, -7.7], [147, -9.5], [150.5, -10.5], [149, -8.5], [147, -6.5], [146, -5], [150, -5], [152, -9.2]];
  /* sea floor that was dry land when the sea was low */
  var SHELF = [
    [[143.5, -38.5], [149.5, -38], [149, -41.2], [144, -41]],
    [[130, -11], [132, -9.5], [137, -9.2], [146, -9.2], [144.5, -11], [142.5, -11], [141.5, -13.5], [141, -17.2], [139, -17.6], [137, -16], [136, -12.3], [133, -11.3]],
    [[114, -22], [117, -19], [121, -17.5], [124, -13.5], [128, -12], [130, -11.5], [130, -12.6], [127, -14], [125, -14.5], [122.5, -17], [121, -19.5], [117, -20.5]]
  ];
  var TOWNS = [
    { name: 'Sydney', at: [151.2, -33.9], from: 1788 }, { name: 'Hobart', at: [147.3, -42.9], from: 1803 },
    { name: 'Brisbane', at: [153, -27.5], from: 1824 }, { name: 'Perth', at: [115.9, -32], from: 1829 },
    { name: 'Melbourne', at: [145, -37.8], from: 1835 }, { name: 'Adelaide', at: [138.6, -34.9], from: 1836 },
    { name: 'Darwin', at: [130.8, -12.5], from: 1869 }
  ];
  var SPOTS = { dutch: [141.2, -12.4], boats: [[133.5, -10.9], [136.2, -11.3], [131.2, -11.2]], fleet: [152.6, -34.2], strait: [[142.3, -10.2], [143.2, -9.9]] };

  function inside(p, poly) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  /* a patchwork of tiles standing for many Countries. Regular hexagons, so nobody takes them for real borders. */
  var TILES = (function () {
    var out = [], step = 1.75, row = 0;
    for (var lat = -10.6; lat > -44; lat -= step * 0.8, row++) {
      for (var lon = 113 + (row % 2) * step / 2; lon < 154; lon += step) {
        var p = [lon, lat];
        if (inside(p, MAINLAND) || inside(p, TASMANIA)) out.push({ lon: lon, lat: lat, hue: (row * 7 + Math.round(lon * 3)) % 8 });
      }
    }
    SPOTS.strait.forEach(function (s, i) { out.push({ lon: s[0], lat: s[1], hue: (i + 3) % 8, island: true }); });
    return out;
  })();
  TILES.forEach(function (t, i) { t.back = (i * 37) % 100 < 38; });      // some land has since been won back (schematic)

  /* how far colonisation has reached a tile in a given year: 0 untouched, 1 taken */
  function taken(tile, y) {
    var most = 0;
    TOWNS.forEach(function (town) {
      if (y < town.from) return;
      var d = Math.hypot((tile.lon - town.at[0]), (tile.lat - town.at[1]) * 1.08);
      var reach = (y - town.from) * 0.19;                                // degrees a year; most of the continent by about 1900
      most = Math.max(most, smooth(reach + 3, reach - 3, d));
    });
    return most;
  }
  /* how much of a tile's own colour shows. Never 0: the First peoples are always still here. */
  function colour(tile, y) {
    var c = 1 - 0.72 * taken(tile, y);
    if (tile.back) c += 0.6 * smooth(RETURN, NOW, y) * taken(tile, y);
    return Math.max(0.28, Math.min(1, c));
  }

  /* what the grown-up reads aloud at each moment */
  var SAY = {
    deep: 'Long, long ago, people already lived all over this land.',
    many: 'Many peoples. Each has its own <b>Country</b> and its own language.',
    care: 'Their families have looked after their Country all this time.',
    first: 'They are Aboriginal and Torres Strait Islander peoples: the <b>First peoples</b>.',
    line: 'See the thin red line? Ships came then. Tap it to look closer.',
    stretch: 'This is the thin red line, stretched out. Slide on.',
    dutch: 'A ship from far away stopped in the north, then sailed off.',
    boats: 'Boats from Makassar came each year to fish and trade, then went home.',
    british: 'Then ships came from Britain. This time the newcomers stayed.',
    took: "The newcomers took land that was already someone's home. That hurt the people living there.",
    back: 'The First peoples never left. They have won some of their land back.',
    today: 'The <b>First peoples</b> are still here. Their cultures are alive and strong.'
  };
  function moment(ago, z) {
    if (z < 0.5) return ago > 40000 ? 'deep' : ago > 20000 ? 'many' : ago > 4000 ? 'care' : ago > CLOSE ? 'first' : 'line';
    var y = year(ago);
    return y < DUTCH ? 'stretch' : y < BOATS[0] ? 'dutch' : y < BRITISH ? 'boats' : y < 1800 ? 'british' : y < 1970 ? 'took' : y < 2021 ? 'back' : 'today';
  }
  /* who is on the water in a given year */
  function ships(y) {
    return { dutch: y >= DUTCH && y <= DUTCH + 8, boats: y >= BOATS[0] && y <= BOATS[1], british: y >= BRITISH && y <= BRITISH + 10 };
  }

  var api = { NOW: NOW, LONG: LONG, CLOSE: CLOSE, DUTCH: DUTCH, BOATS: BOATS, BRITISH: BRITISH,
              year: year, span: span, place: place, agoAt: agoAt, lowSea: lowSea, px: px, py: py, inside: inside,
              MAINLAND: MAINLAND, TASMANIA: TASMANIA, NEW_GUINEA: NEW_GUINEA, SHELF: SHELF, TOWNS: TOWNS, SPOTS: SPOTS,
              TILES: TILES, taken: taken, colour: colour, SAY: SAY, moment: moment, ships: ships };
  root.BQ = root.BQ || {};
  root.BQ.storySim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
