/* Day and night — drawing shared by this guide's scenes.
 *   BQ.dayNight.earth()   the model: the Earth seen from above the South Pole (crayon style)
 *   BQ.dayNight.sun()     the Sun at the edge of the model. It never moves.
 *   BQ.dayNight.sky()     what eyes see from the ground, facing north (painted style)
 *   BQ.dayNight.spinner() one-finger turning of the Earth, with a flick that coasts
 * Needs kit.js and daynight-sim.js. Kept in this guide's folder; move to shared/ if another
 * guide (for example "Where are we?") wants the same Earth.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.dayNightSim, D = BQ.draw, INK = BQ.ink;

  /* rough outlines, as [degrees south, degrees east]. Cartoon shapes, not a map to navigate by. */
  var LAND = [
    // Australia
    [[11, 131], [12, 136], [15, 136], [11, 142], [18, 146], [25, 153], [33, 152], [38, 147], [38, 141], [35, 137],
     [32, 133], [34, 123], [35, 117], [31, 115], [22, 114], [18, 122], [14, 127]],
    [[41, 145], [41, 148], [43.5, 147], [43, 145.5]],                                  // Tasmania
    [[35, 173], [38, 178], [41, 175], [39, 174]], [[41, 173], [44, 172], [46.5, 169], [45, 167]],   // New Zealand
    [[3, 132], [6, 141], [8, 147], [10, 150], [9, 143], [8, 138]],                         // New Guinea
    // southern Africa
    [[0, 9.5], [5, 12], [12, 13.5], [18, 12], [29, 17], [34, 19], [34, 26], [30, 31], [25, 34], [18, 37], [10, 40], [2, 41], [0, 43]],
    [[13, 49], [19, 44], [25, 45], [24, 47.5], [17, 50]],                                // Madagascar
    // South America
    [[0, -80], [5, -81], [15, -75], [23, -70], [33, -72], [45, -74], [53, -72], [55, -67], [50, -68], [42, -64],
     [38, -58], [34, -54], [25, -48], [22, -41], [12, -38], [7, -35], [0, -50]]
  ];
  var ICE = [];                                            // Antarctica, round the pole
  for (var a = 0; a < 360; a += 20) ICE.push([70 + 3 * Math.sin(a * 0.07) - (a > 280 || a < 20 ? 6 : 0), a - 180]);

  function trace(g, cx, cy, R, spin, shape) {
    g.beginPath();
    for (var i = 0; i < shape.length; i++) {
      var r = R * Math.cos(shape[i][0] * S.RAD), ang = S.angleOf({ lon: shape[i][1] }, spin);
      g.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
    }
    g.closePath();
  }
  function spot(place, cx, cy, R, spin) {
    var r = R * Math.cos(place.lat * S.RAD), ang = S.angleOf(place, spin);
    return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
  }

  /* marks: [{ place, color }]. The dark half is fixed in space: only the land turns. */
  function earth(g, cx, cy, R, spin, marks, clock) {
    var i;
    g.save();
    g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.clip();
    g.fillStyle = '#6fb6d9'; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    g.fillStyle = '#8fc97a'; g.strokeStyle = '#5da24c'; g.lineWidth = 1.5; g.lineJoin = 'round';
    for (i = 0; i < LAND.length; i++) { trace(g, cx, cy, R, spin, LAND[i]); g.fill(); g.stroke(); }
    g.fillStyle = '#fff'; g.strokeStyle = '#c9dbe6'; trace(g, cx, cy, R, spin, ICE); g.fill(); g.stroke();
    // the half facing away from the Sun
    var shade = g.createLinearGradient(cx - R * 0.1, 0, cx + R * 0.1, 0);
    shade.addColorStop(0, 'rgba(22,30,70,0)'); shade.addColorStop(1, 'rgba(22,30,70,.62)');
    g.fillStyle = shade; g.fillRect(cx - R * 0.1, cy - R, R * 1.1, 2 * R);
    g.restore();
    for (i = 0; i < 2; i++) {                               // crayon outline, drawn twice a little off
      g.strokeStyle = INK.bitEdge; g.lineWidth = 3; g.globalAlpha = i ? 0.4 : 1;
      g.beginPath(); g.arc(cx + i, cy - i, R + i, 0, 6.283); g.stroke();
    }
    g.globalAlpha = 1;
    (marks || []).forEach(function (m) {
      var p = spot(m.place, cx, cy, R, spin), beat = clock == null || BQ.calm() ? 0 : 1.5 * Math.sin(clock * 4);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(p.x, p.y, 8 + beat, 0, 6.283); g.fill();
      g.fillStyle = m.color; g.beginPath(); g.arc(p.x, p.y, 5.5, 0, 6.283); g.fill();
      g.strokeStyle = INK.line; g.lineWidth = 1.5; g.beginPath(); g.arc(p.x, p.y, 8 + beat, 0, 6.283); g.stroke();
    });
  }

  /* the real way round, for this view: a crayon arrow hugging the rim */
  function arrow(g, cx, cy, R, from, to) {
    g.strokeStyle = 'rgba(59,58,54,.45)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, R, from, to); g.stroke();
    var x = cx + R * Math.cos(to), y = cy + R * Math.sin(to), t = to + Math.PI / 2;
    g.beginPath();
    g.moveTo(x + Math.cos(t - 2.6) * 9, y + Math.sin(t - 2.6) * 9); g.lineTo(x, y);
    g.lineTo(x + Math.cos(t + 2.6) * 9, y + Math.sin(t + 2.6) * 9); g.stroke();
  }

  function sun(g, x, y, r, toX, halfHeight, clock) {
    if (toX != null) {                                      // the light it sends: always the same way
      g.fillStyle = 'rgba(255,210,63,.16)';
      g.beginPath(); g.moveTo(x, y - r * 0.8); g.lineTo(toX, y - halfHeight); g.lineTo(toX, y + halfHeight); g.lineTo(x, y + r * 0.8); g.closePath(); g.fill();
    }
    g.strokeStyle = INK.sun; g.lineWidth = 4; g.lineCap = 'round';
    for (var k = 0; k < 12; k++) {
      var a = k * 0.5236, len = 9 + (BQ.calm() || clock == null ? 0 : 3 * Math.sin(clock * 2 + k));
      g.beginPath(); g.moveTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5));
      g.lineTo(x + Math.cos(a) * (r + 5 + len), y + Math.sin(a) * (r + 5 + len)); g.stroke();
    }
    g.fillStyle = INK.sun; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    g.strokeStyle = '#a66a00'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke();
  }

  function mix(a, b, t) {
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function mixA(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  var DAY_TOP = [126, 190, 236], DAY_LOW = [223, 241, 250], NIGHT_TOP = [14, 22, 54], NIGHT_LOW = [40, 54, 104], DAWN = [255, 170, 110];

  /* The sky over one place, looking north: east is on the right, west on the left.
   * k comes from sim.sky(). o: { horizon: 0..1, mini: bool, house: [r, g, b], clock } */
  function sky(g, w, h, k, o) {
    o = o || {};
    var hy = h * (o.horizon || 0.72), i, calm = BQ.calm(), clock = o.clock || 0;
    var low = mixA(mixA(NIGHT_LOW, DAY_LOW, k.light), DAWN, k.glow * 0.75);
    var grad = g.createLinearGradient(0, 0, 0, hy);
    grad.addColorStop(0, mix(NIGHT_TOP, DAY_TOP, k.light)); grad.addColorStop(1, mix(low, low, 0));
    g.fillStyle = grad; g.fillRect(0, 0, w, h);

    if (k.stars > 0.02) {
      g.fillStyle = '#fff';
      for (i = 0; i < (o.mini ? 12 : 34); i++) {
        var sx = ((i * 73 + 19) % 97) / 97 * w, sy = ((i * 41 + 7) % 89) / 89 * hy * 0.92;
        g.globalAlpha = k.stars * (calm ? 0.9 : 0.65 + 0.35 * Math.sin(clock * 2 + i * 1.7));
        g.beginPath(); g.arc(sx, sy, (i % 3 ? 1.1 : 1.8) * (o.mini ? 0.8 : 1), 0, 6.283); g.fill();
      }
      g.globalAlpha = 1;
    }
    var up = function (alt) { return hy - (Math.sin(alt) / 0.83) * hy * 0.78; };
    if (k.moonAlt > -0.1) {                                 // the Moon: often up in the daytime too
      var mx = w / 2 + k.moonSide * w * 0.42, my = up(k.moonAlt), mr = w * 0.05;
      g.globalAlpha = 0.5 + 0.5 * (1 - k.light);
      g.fillStyle = 'rgba(244,241,228,.25)'; g.beginPath(); g.arc(mx, my, mr, 0, 6.283); g.fill();
      g.fillStyle = '#f4f1e4'; g.beginPath(); g.arc(mx, my, mr, Math.PI / 2, Math.PI * 1.5); g.fill();   // lit side faces the Sun
      g.globalAlpha = 1;
    }
    if (k.alt > -0.2) {
      var x = w / 2 + k.side * w * 0.42, y = up(k.alt), r = w * 0.075;
      g.fillStyle = 'rgba(255,225,120,.35)'; g.beginPath(); g.arc(x, y, r * 1.7, 0, 6.283); g.fill();
      g.fillStyle = INK.sun; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    }

    // the ground: it covers the Sun when the Earth has turned us away. Everything dims at night.
    var dim = function (c) { return mix(c, [18, 28, 62], 0.68 * (1 - k.light)); };
    g.fillStyle = dim([156, 207, 138]);
    g.beginPath(); g.moveTo(0, hy + h * 0.02); g.quadraticCurveTo(w * 0.3, hy - h * 0.05, w * 0.6, hy + h * 0.01);
    g.quadraticCurveTo(w * 0.85, hy + h * 0.05, w, hy); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
    var hx = w * (o.mini ? 0.5 : 0.76), hw = w * (o.mini ? 0.3 : 0.15), hh = hw * 0.75, base = hy + h * 0.1;
    if (!o.mini) {
      g.strokeStyle = dim([123, 138, 147]); g.lineWidth = Math.max(2, w * 0.012); g.lineCap = 'round';    // a harbour bridge, far off
      g.beginPath(); g.moveTo(w * 0.1, hy); g.quadraticCurveTo(w * 0.27, hy - h * 0.16, w * 0.44, hy); g.stroke();
      g.beginPath(); g.moveTo(w * 0.06, hy); g.lineTo(w * 0.48, hy); g.stroke();
      g.fillStyle = dim([139, 115, 85]); g.fillRect(w * 0.545, base - h * 0.2, w * 0.022, h * 0.2);        // a gum tree
      g.fillStyle = dim([134, 179, 138]); g.beginPath(); g.ellipse(w * 0.556, base - h * 0.23, w * 0.07, h * 0.08, 0, 0, 6.283); g.fill();
    }
    g.fillStyle = dim(o.house || [228, 83, 74]); g.fillRect(hx - hw / 2, base - hh, hw, hh);            // the house
    g.fillStyle = dim([122, 59, 59]); g.beginPath(); g.moveTo(hx - hw * 0.65, base - hh); g.lineTo(hx, base - hh * 1.7); g.lineTo(hx + hw * 0.65, base - hh); g.closePath(); g.fill();
    g.fillStyle = k.light < 0.45 ? '#ffe48a' : '#dff1fa';                                       // a light on at night
    g.fillRect(hx - hw * 0.18, base - hh * 0.72, hw * 0.36, hh * 0.38);
  }

  /* One-finger turning. geom() returns { x, y, r } of the Earth in view units. */
  function spinner(sim, geom) {
    var last = 0, lastT = 0, vel = 0, on = false;
    function ang(p) { var e = geom(); return Math.atan2(p.y - e.y, p.x - e.x); }
    return {
      active: function () { return on; },
      down: function (p) {
        var e = geom();
        if (Math.hypot(p.x - e.x, p.y - e.y) > e.r + 22) return false;
        on = true; last = ang(p); lastT = performance.now(); vel = 0; sim.stop();
        return true;
      },
      move: function (p) {
        if (!on) return;
        var a = ang(p), d = S.wrap(a - last), t = performance.now();
        var e = geom();
        if (Math.hypot(p.x - e.x, p.y - e.y) < e.r * 0.12) { last = a; lastT = t; return; }   // too near the middle to tell
        sim.dragBy(d);
        vel = vel * 0.5 + (d / Math.max(0.008, (t - lastT) / 1000)) * 0.5;
        last = a; lastT = t;
      },
      up: function () {
        if (!on) return;
        on = false;
        sim.release(performance.now() - lastT > 140 ? 0 : vel);
      }
    };
  }

  BQ.dayNight = { earth: earth, sun: sun, sky: sky, spinner: spinner, arrow: arrow, spot: spot };
})(window);
