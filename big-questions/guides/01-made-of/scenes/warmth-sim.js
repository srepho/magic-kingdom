/* Warmth toy — simulation only (no DOM), so it can be tested in Node.
 *
 * 36 water bits in a closed pot. One number, warmth (0..1), drives everything.
 * Cold: bits are held on an open honeycomb (real ice is one) and jiggle.
 * Warmer: sites let go from the outside in; bits pool under a light downward pull.
 * Hot: the pull and the stickiness fade and bits fly about the whole pot.
 * No bit is ever created or destroyed.
 *
 * Steered, not first-principles: see storyboard.md, design decision 4.
 */
(function (root) {
  'use strict';

  var W = 260, H = 240;          // inside of the pot, sim units
  var N = 36, R = 9;             // bits and their drawn radius
  var A = 20;                    // honeycomb bond length
  var T_BOIL = 0.66;
  var SIGMA_FREE = 23, SIGMA_ICE = 19, REACH = 16;
  var KR = 3000, KC = 1500;      // push apart, pull together
  var K_SITE = 400, SITE_FMAX = 1500;
  var G = 300;
  var FINGER_R = 30, KF = 6000;
  var LAG = 0.8;                 // seconds for the pot to follow the slider

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function energy(T) { return 600 + 6000 * T + 33400 * T * T * T * T; }

  function create(opts) {
    opts = opts || {};
    var rand = opts.random || Math.random;
    function randn() {
      var u = 1 - rand(), v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    var sites = [], bits = [];
    var s3 = Math.sqrt(3) * A;
    var x0 = (W - (5 * s3 + s3 / 2)) / 2, yb = H - R - 1;
    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 6; i++) {
        var x = x0 + i * s3 + (j % 2) * s3 / 2, y = yb - j * 1.5 * A;
        sites.push({ x: x, y: y }, { x: x, y: y - A });
      }
    }
    var cx = 0, cy = 0, far = 0;
    sites.forEach(function (s) { cx += s.x / N; cy += s.y / N; });
    sites.forEach(function (s) { far = Math.max(far, Math.hypot(s.x - cx, s.y - cy)); });
    sites.forEach(function (s) {
      // outer sites let go first, so the block melts from its edges
      s.melt = 0.37 - 0.08 * Math.hypot(s.x - cx, s.y - cy) / far;
      s.hold = 0; s.bit = -1;
    });
    // freeze from the middle outwards
    var freezeOrder = sites.map(function (_, k) { return k; })
      .sort(function (a, b) { return sites[b].melt - sites[a].melt; });

    var state = { T: 0, target: 0, finger: null, bits: bits, sites: sites };

    function reset(warmth) {
      state.T = state.target = warmth == null ? 0.08 : warmth;
      state.finger = null;
      for (var k = 0; k < N; k++) {
        bits[k] = { id: k, x: sites[k].x, y: sites[k].y, vx: 0, vy: 0,
                    ang: rand() * 6.283, w: 0, site: k, star: false, near: 0 };
        sites[k].bit = k; sites[k].hold = 1;
      }
    }

    function updateSites() {
      var T = state.T, k, s;
      for (k = 0; k < N; k++) {
        s = sites[k];
        s.hold = clamp01((s.melt - T) / 0.03);
        if (s.hold === 0 && s.bit >= 0) { bits[s.bit].site = -1; s.bit = -1; }
      }
      for (var o = 0; o < N; o++) {
        s = sites[freezeOrder[o]];
        if (s.hold > 0 && s.bit < 0) {
          var best = -1, bd = Infinity;
          for (k = 0; k < N; k++) {
            if (bits[k].site >= 0) continue;
            var d = Math.hypot(bits[k].x - s.x, bits[k].y - s.y);
            if (d < bd) { bd = d; best = k; }
          }
          if (best >= 0) { s.bit = best; bits[best].site = freezeOrder[o]; }
        }
      }
      untangle();
    }

    /* Two held bits whose paths cross would block each other for ever.
     * If trading sites shortens both journeys, trade. */
    function untangle() {
      for (var a = 0; a < N; a++) {
        var p = bits[a];
        if (p.site < 0) continue;
        for (var b = a + 1; b < N; b++) {
          var q = bits[b];
          if (q.site < 0) continue;
          var sp = sites[p.site], sq = sites[q.site];
          var now = sqd(p, sp) + sqd(q, sq), swapped = sqd(p, sq) + sqd(q, sp);
          if (swapped < now - 1) {
            var t = p.site; p.site = q.site; q.site = t;
            sites[p.site].bit = a; sites[q.site].bit = b;
          }
        }
      }
    }
    function sqd(b, s) { var dx = b.x - s.x, dy = b.y - s.y; return dx * dx + dy * dy; }

    function step(dt) {
      state.T += (state.target - state.T) * (1 - Math.exp(-dt / LAG));
      updateSites();
      var T = state.T, kT = energy(T);
      var gas = smooth(T_BOIL - 0.04, T_BOIL + 0.08, T);
      var g = G * (1 - 0.9 * gas), coh = KC * (1 - 0.9 * gas);
      var gamma = 3 - 2.5 * gas;
      var i, j, b, c, dx, dy, d, f;

      for (i = 0; i < N; i++) { b = bits[i]; b.ax = 0; b.ay = g; b.near = 0; }

      for (i = 0; i < N; i++) {
        b = bits[i];
        var hi = b.site >= 0 ? sites[b.site].hold : 0;
        for (j = i + 1; j < N; j++) {
          c = bits[j];
          dx = c.x - b.x; dy = c.y - b.y;
          if (dx > 40 || dx < -40 || dy > 40 || dy < -40) continue;
          d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          var hj = c.site >= 0 ? sites[c.site].hold : 0;
          var sigma = SIGMA_FREE - (SIGMA_FREE - SIGMA_ICE) * Math.min(hi, hj);
          if (d < sigma) f = -KR * (sigma - d);
          else if (d < sigma + REACH) {
            var u = (d - sigma) / REACH;
            // held bits are placed by their sites; stickiness between them
            // would pull the open honeycomb shut
            f = coh * (1 - Math.min(hi, hj)) * (u < 0.5 ? 2 * u : 2 * (1 - u));
          } else continue;
          if (d < sigma + 8) { b.near++; c.near++; }
          dx /= d; dy /= d;
          b.ax += f * dx; b.ay += f * dy;
          c.ax -= f * dx; c.ay -= f * dy;
        }
        if (b.site >= 0) {
          var s = sites[b.site];
          dx = s.x - b.x; dy = s.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          f = K_SITE * hi * d;
          if (f > SITE_FMAX) f = SITE_FMAX;
          if (d > 0) { b.ax += f * dx / d; b.ay += f * dy / d; }
        }
        if (state.finger) {
          dx = b.x - state.finger.x; dy = b.y - state.finger.y;
          d = Math.sqrt(dx * dx + dy * dy) || 0.01;
          if (d < FINGER_R) { f = KF * (FINGER_R - d); b.ax += f * dx / d; b.ay += f * dy / d; }
        }
      }

      var keep = Math.exp(-gamma * dt), kick = Math.sqrt(kT * (1 - keep * keep));
      var spin = kick / R * 0.5;
      for (i = 0; i < N; i++) {
        b = bits[i];
        b.vx = (b.vx + b.ax * dt) * keep + kick * randn();
        b.vy = (b.vy + b.ay * dt) * keep + kick * randn();
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx); }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx); }
        if (b.y < R) { b.y = R; b.vy = Math.abs(b.vy); }
        if (b.y > H - R) { b.y = H - R; b.vy = -Math.abs(b.vy); }
        b.w = b.w * keep + spin * randn();
        var held = b.site >= 0 ? sites[b.site].hold : 0;
        b.ang += b.w * dt * (1 - 0.95 * held);
      }
    }

    /* How many bits are in each state right now. The "what eyes see" picture
     * is drawn from this, so the two halves can never disagree. */
    function census() {
      var ice = 0, liquid = 0;
      // once the pot is properly hot, bits that happen to pass close are not a pool
      var pooling = 1 - smooth(T_BOIL - 0.04, T_BOIL + 0.08, state.T);
      for (var k = 0; k < N; k++) {
        var b = bits[k];
        if (b.site >= 0) ice += sites[b.site].hold;
        // a loose bit beside melting ice is water, not steam
        else if (b.near >= 2 || state.T < 0.42) liquid += pooling;
      }
      return { ice: ice, liquid: liquid, gas: N - ice - liquid };
    }

    function bitAt(x, y, reach) {
      var best = null, bd = reach;
      for (var k = 0; k < N; k++) {
        var d = Math.hypot(bits[k].x - x, bits[k].y - y);
        if (d < bd) { bd = d; best = bits[k]; }
      }
      return best;
    }

    reset(opts.warmth);
    return { state: state, step: step, reset: reset, census: census, bitAt: bitAt };
  }

  var api = { create: create, W: W, H: H, N: N, R: R, T_BOIL: T_BOIL };
  root.BQ = root.BQ || {};
  root.BQ.warmthSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
