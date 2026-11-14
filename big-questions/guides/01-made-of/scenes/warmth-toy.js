/* Warmth toy — ROUGH PROTOTYPE (checkpoint 2). Plain shapes on purpose.
 * Scene interface: start(container), reset(), cleanup().
 * Needs warmth-sim.js loaded first. Classic script, so it runs from file://.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ = root.BQ || {};
  var S = BQ.warmthSim;
  var PAD = 16, STEP = 1 / 120;

  var el, sim, raf = 0, last = 0, running = false, clock = 0;
  var eyes, model, track, thumb, listeners = [];
  var press = null, dragging = false;

  function on(target, type, fn, opt) {
    target.addEventListener(type, fn, opt);
    listeners.push(function () { target.removeEventListener(type, fn, opt); });
  }

  function start(container) {
    el = container;
    el.innerHTML =
      '<div class="wt-panels">' +
        '<div class="wt-panel wt-eyes"><span class="wt-tag">👁</span><canvas></canvas></div>' +
        '<div class="wt-panel wt-model"><span class="wt-tag">👓</span><canvas></canvas></div>' +
      '</div>' +
      '<div class="wt-bar">' +
        '<span class="wt-end">❄️</span>' +
        '<div class="wt-track"><div class="wt-thumb"></div></div>' +
        '<span class="wt-end">🔥</span>' +
        '<button class="wt-reset" aria-label="Start again">↺</button>' +
      '</div>';
    eyes = el.querySelector('.wt-eyes canvas');
    model = el.querySelector('.wt-model canvas');
    track = el.querySelector('.wt-track');
    thumb = el.querySelector('.wt-thumb');
    sim = S.create();

    on(track, 'pointerdown', function (e) {
      dragging = true; track.setPointerCapture(e.pointerId); slide(e); e.preventDefault();
    });
    on(track, 'pointermove', function (e) { if (dragging) slide(e); });
    on(track, 'pointerup', function () { dragging = false; });
    on(track, 'pointercancel', function () { dragging = false; });

    on(model, 'pointerdown', function (e) {
      model.setPointerCapture(e.pointerId);
      var p = toSim(e);
      press = { x: p.x, y: p.y, t: performance.now(), moved: false };
      sim.state.finger = p; e.preventDefault();
    });
    on(model, 'pointermove', function (e) {
      if (!press) return;
      var p = toSim(e);
      if (Math.hypot(p.x - press.x, p.y - press.y) > 8) press.moved = true;
      sim.state.finger = p;
    });
    function lift() {
      if (press && !press.moved && performance.now() - press.t < 350) {
        var b = sim.bitAt(press.x, press.y, 30);
        if (b) b.star = !b.star;
      }
      press = null; sim.state.finger = null;
    }
    on(model, 'pointerup', lift);
    on(model, 'pointercancel', lift);

    on(el.querySelector('.wt-reset'), 'click', reset);
    on(root, 'resize', fit);
    on(document, 'visibilitychange', function () {
      if (document.hidden) pause(); else resume();
    });
    fit(); placeThumb(); resume();
  }

  function slide(e) {
    var r = track.getBoundingClientRect(), half = thumb.offsetWidth / 2;
    var v = (e.clientX - r.left - half) / (r.width - 2 * half);
    sim.state.target = Math.max(0, Math.min(1, v));
    placeThumb();
  }
  function placeThumb() {
    var span = track.clientWidth - thumb.offsetWidth;
    thumb.style.transform = 'translateX(' + (sim.state.target * span) + 'px)';
  }

  function toSim(e) {
    var r = model.getBoundingClientRect(), v = view(model);
    return { x: (e.clientX - r.left - v.ox) / v.k, y: (e.clientY - r.top - v.oy) / v.k };
  }
  /* scale and offset that fit the pot inside a canvas, in CSS pixels */
  function view(c) {
    var w = c.clientWidth, h = c.clientHeight;
    // room above for the lid and knob, below for the flames
    var k = Math.min((w - 2 * PAD) / (S.W + 24), (h - 2 * PAD) / (S.H + 52));
    return { k: k, ox: (w - S.W * k) / 2, oy: (h - (S.H + 52) * k) / 2 + 24 * k };
  }
  function fit() {
    [eyes, model].forEach(function (c) {
      var d = Math.min(root.devicePixelRatio || 1, 2);
      c.width = Math.round(c.clientWidth * d); c.height = Math.round(c.clientHeight * d);
    });
    if (sim) placeThumb();
    draw();
  }

  function resume() {
    if (running) return;
    running = true; last = 0; raf = requestAnimationFrame(frame);
  }
  function pause() { running = false; cancelAnimationFrame(raf); }
  function frame(t) {
    if (!running) return;
    var dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60;
    last = t;
    advance(dt);
    raf = requestAnimationFrame(frame);
  }
  /* also called directly by tests, where requestAnimationFrame may be frozen */
  function advance(seconds) {
    for (var left = seconds; left > 1e-6; left -= STEP) sim.step(Math.min(STEP, left));
    clock += seconds;
    draw();
  }

  function begin(c) {
    var g = c.getContext('2d'), d = c.width / c.clientWidth, v = view(c);
    g.setTransform(d, 0, 0, d, 0, 0);
    g.clearRect(0, 0, c.clientWidth, c.clientHeight);
    g.translate(v.ox, v.oy); g.scale(v.k, v.k);
    return g;
  }
  function pot(g, stroke, width) {
    g.lineWidth = width; g.strokeStyle = stroke; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, S.H); g.lineTo(S.W, S.H); g.lineTo(S.W, 0); g.stroke();
    g.beginPath(); g.moveTo(-10, -3); g.lineTo(S.W + 10, -3); g.stroke();      // lid
    g.beginPath(); g.arc(S.W / 2, -12, 7, 0, 6.283); g.stroke();               // knob
  }

  function draw() {
    if (!sim || !model.width) return;
    drawModel(); drawEyes();
  }

  function drawModel() {
    var g = begin(model), bits = sim.state.bits, R = S.R;
    pot(g, '#8a7f6a', 3);
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i];
      g.fillStyle = '#4a90d9';
      g.beginPath(); g.arc(b.x, b.y, R, 0, 6.283); g.fill();
      for (var s = -1; s <= 1; s += 2) {          // two small bumps: the outline of a water bit
        g.beginPath();
        g.arc(b.x + Math.cos(b.ang + s * 0.91) * R * 0.95, b.y + Math.sin(b.ang + s * 0.91) * R * 0.95,
              R * 0.48, 0, 6.283);
        g.fill();
      }
      if (b.star) star(g, b.x, b.y, R * 0.9);
    }
    var f = sim.state.finger;
    if (f) {
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
      g.beginPath(); g.arc(f.x, f.y, 26, 0, 6.283); g.stroke();
    }
  }
  function star(g, x, y, r) {
    g.fillStyle = '#ffd23f'; g.strokeStyle = '#a66a00'; g.lineWidth = 1;
    g.beginPath();
    for (var k = 0; k < 10; k++) {
      var a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * 0.45 : r;
      g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
    }
    g.closePath(); g.fill(); g.stroke();
  }

  /* What eyes would see, drawn from the same bits via census(). No white cloud:
   * steam is invisible, so a hot pot just looks nearly empty. */
  function drawEyes() {
    var g = begin(eyes), c = sim.census(), T = sim.state.T, N = S.N, W = S.W, H = S.H;
    var iceF = c.ice / N, liqF = c.liquid / N, gasF = c.gas / N;

    var heat = Math.max(0, sim.state.target - 0.45) / 0.55;
    if (heat > 0) {
      g.fillStyle = '#ff8a3c';
      for (var k = 0; k < 7; k++) {
        var fx = 30 + k * (W - 60) / 6, fh = (10 + 22 * heat) * (0.75 + 0.25 * Math.sin(clock * 9 + k * 2));
        g.beginPath(); g.moveTo(fx - 9, H + 26); g.quadraticCurveTo(fx, H + 26 - 2 * fh, fx + 9, H + 26); g.fill();
      }
    }
    var cold = Math.max(0, 0.3 - sim.state.target) / 0.3;
    if (cold > 0) { g.fillStyle = 'rgba(150,200,255,' + (0.35 * cold) + ')'; g.fillRect(-14, -24, W + 28, H + 52); }

    var bw = 190 * Math.sqrt(iceF), bh = 98 * Math.sqrt(iceF);
    var waterH = 64 * liqF + (iceF > 0 ? 0.9 * bw * bh / W * Math.min(1, liqF * 6) : 0);
    if (waterH > 0.5) { g.fillStyle = '#7ec4ee'; g.fillRect(2, H - waterH, W - 4, waterH - 2); }

    if (iceF > 0.01) {                       // the block floats once there is water to float in
      var by = H - 2 - bh - Math.max(0, waterH - 0.9 * bh);
      g.fillStyle = '#e8f6ff'; g.strokeStyle = '#9cc9e6'; g.lineWidth = 2;
      g.beginPath(); g.rect((W - bw) / 2, by, bw, bh); g.fill(); g.stroke();
    }
    if (T > 0.58 && liqF > 0.05) {           // bubbles while it boils
      g.strokeStyle = '#fff'; g.lineWidth = 1.5;
      for (var n = 0; n < 9; n++) {
        var ph = (clock * (0.9 + n * 0.13) + n * 0.37) % 1;
        g.beginPath(); g.arc(20 + ((n * 53) % (W - 40)), H - 4 - ph * (waterH - 6), 2 + (n % 3), 0, 6.283); g.stroke();
      }
    }
    if (gasF > 0.03 && T < S.T_BOIL) {       // cooling steam turns back into drops on the lid
      g.fillStyle = '#7ec4ee';
      var drops = Math.round(gasF * 18);
      for (var d = 0; d < drops; d++) {
        var dx = 12 + ((d * 97) % (W - 24));
        g.beginPath(); g.arc(dx, 3 + (d % 3), 3, 0, 6.283); g.fill();
      }
    }
    pot(g, '#555', 5);
  }

  function reset() {
    if (!sim) return;
    sim.reset(); press = null; placeThumb(); draw();
  }
  function cleanup() {
    pause();
    listeners.forEach(function (off) { off(); }); listeners = [];
    if (el) el.innerHTML = '';
    el = sim = eyes = model = track = thumb = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.warmthToy = {
    start: start, reset: reset, cleanup: cleanup,
    // test hooks
    advance: advance, pause: pause, resume: resume,
    sim: function () { return sim; }
  };
})(window);
