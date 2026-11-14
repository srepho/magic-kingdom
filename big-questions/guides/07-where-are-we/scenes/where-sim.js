/* Where are we? — the maths and the facts (no DOM), so they can be tested in Node.
 *
 * 1. The zoom: six pictures, each one sitting inside the next at a known spot and size.
 *    home → street → city → country → Earth → space
 * 2. The globe: project a place on the round Earth onto a flat disc, as seen from far away.
 * 3. The planets: order and true relative sizes (NASA Planetary Fact Sheet, ratio to Earth).
 */
(function (root) {
  'use strict';
  var VW = 480, VH = 300, C = { x: 240, y: 150 }, RAD = Math.PI / 180;

  /* ---------- globe ---------- */
  /* Orthographic view centred on (lon0, lat0). x right, y down, both in globe radii.
   * z > 0 means the place is on the side facing us. */
  function project(lon, lat, lon0, lat0) {
    var l = (lon - lon0) * RAD, p = lat * RAD, p0 = lat0 * RAD;
    return {
      x: Math.cos(p) * Math.sin(l),
      y: -(Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
      z: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)
    };
  }
  var VIEW = { lon: 134, lat: -27 };            // looking straight down on the middle of Australia
  var SYDNEY = { lon: 151.2, lat: -33.9 };
  var GLOBE_R = 110, MAP_R = 480;                // the globe, and the same globe zoomed in to a map

  /* Coastlines, very rough: [lon, lat] corners. Enough to recognise, not to navigate by. */
  var LANDS = [
    { name: 'Australia', pts: [[114, -22], [114, -34], [118, -35], [124, -33], [129, -32], [134, -33], [138, -35], [141, -38], [146, -39], [150, -37], [153, -30], [153, -25], [149, -21], [146, -19], [145, -15], [142, -11], [141, -17], [137, -16], [136, -12], [131, -12], [129, -15], [125, -14], [122, -18]] },
    { name: 'Tasmania', pts: [[145, -41], [148, -41], [148, -43.5], [146, -43.5]] },
    { name: 'New Zealand north', pts: [[173, -35], [178, -38], [176, -41], [174, -39]] },
    { name: 'New Zealand south', pts: [[172, -41], [174, -42], [170, -46], [167, -46]] },
    { name: 'New Guinea', pts: [[131, -1], [141, -3], [147, -6], [150, -10], [143, -9], [138, -8], [133, -4]] },
    { name: 'Borneo', pts: [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]] },
    { name: 'Sumatra', pts: [[95, 5], [104, -1], [106, -6], [102, -4], [97, 2]] },
    { name: 'Java', pts: [[106, -6.5], [114, -7.5], [114, -8.5], [106, -7.5]] },
    { name: 'Japan', pts: [[130, 32], [136, 35], [141, 37], [142, 43], [145, 44], [141, 45], [139, 38], [133, 35]] },
    { name: 'Madagascar', pts: [[44, -16], [50, -13], [50, -17], [47, -25], [44, -23]] },
    { name: 'Britain', pts: [[-5, 50], [1, 51], [-2, 56], [-5, 58], [-6, 55]] },
    { name: 'Asia and Europe', pts: [[-10, 36], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [5, 58], [10, 59], [12, 65], [25, 71], [40, 67], [60, 69], [80, 73], [105, 77], [130, 71], [160, 70], [179, 66], [170, 60], [162, 56], [156, 51], [143, 54], [135, 44], [129, 36], [126, 34], [122, 40], [118, 39], [121, 31], [119, 25], [110, 21], [108, 16], [109, 11], [105, 9], [100, 13], [99, 8], [103, 1], [98, 8], [97, 16], [91, 22], [86, 20], [80, 14], [78, 8], [73, 16], [72, 21], [67, 25], [57, 26], [51, 24], [56, 18], [52, 16], [43, 13], [39, 21], [34, 28], [35, 36], [27, 37], [26, 40], [23, 38], [20, 40], [13, 45], [16, 38], [12, 44], [7, 44], [3, 42], [0, 39], [-5, 36]] },
    { name: 'Africa', pts: [[-6, 35], [10, 37], [11, 33], [20, 31], [32, 31], [35, 24], [43, 12], [51, 12], [41, -2], [39, -10], [40, -16], [35, -24], [31, -30], [26, -34], [19, -34], [15, -27], [12, -17], [13, -8], [9, 0], [9, 4], [-4, 5], [-8, 4], [-13, 8], [-17, 14], [-16, 21], [-10, 29]] },
    { name: 'North America', pts: [[-168, 66], [-156, 71], [-128, 70], [-110, 68], [-95, 69], [-85, 66], [-80, 62], [-78, 58], [-64, 60], [-56, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-97, 26], [-97, 20], [-91, 19], [-87, 21], [-88, 16], [-83, 10], [-78, 8], [-85, 11], [-95, 16], [-105, 20], [-110, 24], [-113, 31], [-117, 33], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-160, 58], [-166, 62]] },
    { name: 'Greenland', ice: true, pts: [[-55, 60], [-43, 60], [-22, 70], [-20, 80], [-40, 83], [-62, 81], [-70, 77], [-55, 70]] },
    { name: 'South America', pts: [[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-39, -14], [-41, -22], [-48, -27], [-57, -37], [-65, -41], [-68, -52], [-74, -52], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 1]] },
    { name: 'Antarctica', ice: true, ring: true, pts: [[-180, -78], [-150, -76], [-120, -73], [-90, -72], [-60, -66], [-30, -72], [0, -69], [30, -68], [60, -67], [90, -66], [120, -66], [150, -68], [180, -78]] }
  ];
  /* add points along each edge so shapes bend properly round the ball */
  LANDS.forEach(function (land) {
    var out = [], p = land.pts, n = p.length, last = land.ring ? n - 1 : n;
    for (var i = 0; i < last; i++) {
      var a = p[i], b = p[(i + 1) % n];
      var steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 4));
      for (var s = 0; s < steps; s++) out.push([a[0] + (b[0] - a[0]) * s / steps, a[1] + (b[1] - a[1]) * s / steps]);
    }
    if (land.ring) out.push(p[n - 1]);
    land.dense = out;
  });

  /* ---------- planets: order from the Sun, diameter compared with Earth ---------- */
  var PLANETS = [
    { name: 'Mercury', size: 0.383, colour: '#a9a39a' },
    { name: 'Venus', size: 0.949, colour: '#ecd9a0' },
    { name: 'Earth', size: 1, colour: '#7ec4ee' },
    { name: 'Mars', size: 0.532, colour: '#d2784f' },
    { name: 'Jupiter', size: 11.21, colour: '#dcb48a' },
    { name: 'Saturn', size: 9.45, colour: '#ead9a2', rings: true },
    { name: 'Uranus', size: 4.01, colour: '#b5e3e6' },
    { name: 'Neptune', size: 3.88, colour: '#6f8fe0' }
  ];
  var SUN_SIZE = 109.2;

  /* where things sit in the space picture (not to scale: see notes.md) */
  var SUN_AT = { x: 36, y: 150 };
  var ORBITS = [70, 96, 126, 160, 222, 284, 346, 408];
  var ANGLES = [-25, 20, -8, 28, -14, 12, -10, 8];
  var DOT = [3.2, 4.5, 5, 3.6, 14, 12, 8, 8];
  function planetSpot(i) {
    return { x: SUN_AT.x + ORBITS[i] * Math.cos(ANGLES[i] * RAD), y: SUN_AT.y + ORBITS[i] * Math.sin(ANGLES[i] * RAD), r: DOT[i] };
  }

  /* ---------- the zoom ---------- */
  var syd = project(SYDNEY.lon, SYDNEY.lat, VIEW.lon, VIEW.lat), earth = planetSpot(2);
  /* anchor: where the picture below sits inside this one. ratio: how many times smaller it is there. */
  var LEVELS = [
    { name: 'home' },
    { name: 'street', anchor: { x: 196, y: 176 }, ratio: 12 },
    { name: 'city', anchor: { x: 190, y: 190 }, ratio: 100 },
    { name: 'country', anchor: { x: C.x + MAP_R * syd.x, y: C.y + MAP_R * syd.y }, ratio: 100 },
    { name: 'earth', anchor: { x: C.x, y: C.y }, ratio: MAP_R / GLOBE_R },
    { name: 'space', anchor: { x: earth.x, y: earth.y }, ratio: GLOBE_R / earth.r }
  ];
  var TOP = LEVELS.length - 1;

  function clampZ(z) { return z < 0 ? 0 : z > TOP ? TOP : z; }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  /* Everything needed to draw zoom position z (0 = home, 5 = space).
   * lower: the picture we are leaving, drawn at scale k0 centred on `at`, fading by `fade`.
   * upper: the picture we are arriving in, magnified k1 times about the fixed point W. */
  function frame(z) {
    z = clampZ(z);
    var L = Math.min(TOP - 1, Math.floor(z)), f = z - L;
    var up = LEVELS[L + 1], R = up.ratio, A = up.anchor;
    var k1 = Math.pow(R, 1 - f);
    var W = { x: (R * A.x - C.x) / (R - 1), y: (R * A.y - C.y) / (R - 1) };
    return {
      lower: L, upper: L + 1, f: f, k1: k1, k0: k1 / R, W: W,
      at: { x: W.x + k1 * (A.x - W.x), y: W.y + k1 * (A.y - W.y) },
      fade: 1 - smooth(0.25, 0.6, f)
    };
  }
  /* where home is inside picture L */
  function homeIn(L) {
    var h = { x: C.x, y: C.y };
    for (var i = 1; i <= L; i++) h = { x: LEVELS[i].anchor.x + (h.x - C.x) / LEVELS[i].ratio, y: LEVELS[i].anchor.y + (h.y - C.y) / LEVELS[i].ratio };
    return h;
  }
  /* where home is on screen at zoom z */
  function homeOnScreen(z) {
    var fr = frame(z), h = homeIn(fr.lower);
    return { x: fr.at.x + fr.k0 * (h.x - C.x), y: fr.at.y + fr.k0 * (h.y - C.y) };
  }
  /* which place a caption should talk about */
  function nearest(z) { return Math.round(clampZ(z)); }

  var api = {
    VW: VW, VH: VH, C: C, project: project, VIEW: VIEW, SYDNEY: SYDNEY, GLOBE_R: GLOBE_R, MAP_R: MAP_R,
    LANDS: LANDS, PLANETS: PLANETS, SUN_SIZE: SUN_SIZE, SUN_AT: SUN_AT, ORBITS: ORBITS, planetSpot: planetSpot,
    LEVELS: LEVELS, TOP: TOP, clampZ: clampZ, frame: frame, homeIn: homeIn, homeOnScreen: homeOnScreen, nearest: nearest
  };
  root.BQ = root.BQ || {};
  root.BQ.whereSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
