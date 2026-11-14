/* Centrepiece — the warmth toy.
 * Left: what eyes see (painted). Right: the model (crayon on paper). Same bits drive both.
 * Scene interface: start(stage, frame), reset(), cleanup(). Needs kit.js and warmth-sim.js.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.warmthSim, D = BQ.draw, INK = BQ.ink;
  var VW = S.W + 40, VH = S.H + 70, PX = 20, PY = 30;   // picture box and where the pot sits in it
  var STEP = 1 / 120;

  var CAPTIONS = {
    model: 'This is a <b>model</b>: a pretend picture of something too small to see.',
    cold: 'Cold. The <b>bits</b> hold tight and jiggle on the spot.',
    warm: 'Warmer. The bits let go and slide past each other.',
    hot: 'Hot. The bits fly apart. This is <b>steam</b>. Same bits!'
  };

  var el, frame, sim, loop, eyes, model, track, thumb, offs = [];
  var dragging = false, clock = 0, phase = 'cold', blupDue = 0;

  function start(stage, api) {
    el = stage; frame = api;
    el.innerHTML =
      '<div class="wt-panels">' +
        '<div class="wt-panel wt-eyes"></div>' +
        '<div class="wt-panel wt-model"></div>' +
      '</div>' +
      '<div class="wt-bar">' +
        '<span class="wt-end wt-snow"></span>' +
        '<div class="wt-track"><div class="wt-thumb"></div></div>' +
        '<span class="wt-end wt-flame"></span>' +
      '</div>';
    sim = S.create();
    eyes = BQ.surface(el.querySelector('.wt-eyes'), draw);
    model = BQ.surface(el.querySelector('.wt-model'), draw);
    track = el.querySelector('.wt-track');
    thumb = el.querySelector('.wt-thumb');

    function slide(p) {
      var half = thumb.offsetWidth / 2;
      sim.state.target = Math.max(0, Math.min(1, (p.x - half) / (track.clientWidth - 2 * half)));
      placeThumb();
    }
    offs.push(BQ.touch(track, {
      down: function (p) { dragging = true; slide(p); },
      move: function (p) { if (dragging) slide(p); },
      up: function () { dragging = false; }
    }));
    offs.push(BQ.touch(model.c, {
      down: function (p) { sim.state.finger = toPot(p); },
      move: function (p) { sim.state.finger = toPot(p); },
      up: function () { sim.state.finger = null; },
      tap: function (p) {
        var q = toPot(p), b = sim.bitAt(q.x, q.y, 30);
        if (b) { b.star = !b.star; BQ.sound.squeak(); }
      }
    }));
    root.addEventListener('resize', placeThumb);
    offs.push(function () { root.removeEventListener('resize', placeThumb); });

    phase = 'cold'; clock = 0;
    placeThumb();
    frame.caption(CAPTIONS.model);
    loop = BQ.loop(tick);
  }

  function toPot(p) { var v = model.toView(p); return { x: v.x - PX, y: v.y - PY }; }
  function placeThumb() {
    if (!thumb) return;
    thumb.style.transform = 'translateX(' + (sim.state.target * (track.clientWidth - thumb.offsetWidth)) + 'px)';
  }

  function tick(dt) {
    for (var left = dt; left > 1e-6; left -= STEP) sim.step(Math.min(STEP, left));
    clock += dt;
    var c = sim.census(), next = phase;
    if (c.ice >= 30) next = 'cold'; else if (c.liquid >= 24) next = 'warm'; else if (c.gas >= 24) next = 'hot';
    if (next !== phase) {
      phase = next; frame.caption(CAPTIONS[phase]);
      if (phase === 'cold') BQ.sound.lock(); else if (phase === 'hot') BQ.sound.whoosh();
    }
    if (sim.state.T > 0.58 && c.liquid > 3) {          // bubbling
      blupDue -= dt;
      if (blupDue <= 0) { BQ.sound.blup(); blupDue = 0.12 + Math.random() * 0.3; }
    }
    draw();
  }

  function draw() {
    if (!sim || !model || !eyes) return;
    drawModel(); drawEyes();
  }

  /* ----- the model: crayon on paper ----- */
  function drawModel() {
    var g = model.begin(VW, VH), bits = sim.state.bits, sites = sim.state.sites, i;
    D.glasses(g, 22, 12, 13);
    g.translate(PX, PY);
    g.strokeStyle = '#8a7f6a'; g.lineWidth = 3.5;           // pot, drawn twice a little off, like crayon
    for (i = 0; i < 2; i++) {
      g.globalAlpha = i ? 0.45 : 1;
      g.beginPath(); g.moveTo(-i, -i); g.lineTo(i, S.H + i); g.lineTo(S.W - i, S.H - i); g.lineTo(S.W + i, i); g.stroke();
      g.beginPath(); g.moveTo(-10, -4 + i); g.lineTo(S.W + 10, -4 - i); g.stroke();
    }
    g.globalAlpha = 1;
    g.beginPath(); g.arc(S.W / 2, -13, 7, 0, 6.283); g.stroke();

    g.strokeStyle = INK.bitEdge; g.lineWidth = 2.5;         // the holds between neighbours in ice
    for (i = 0; i < sim.links.length; i++) {
      var a = sites[sim.links[i][0]], b = sites[sim.links[i][1]];
      var h = Math.min(a.hold, b.hold);
      if (h <= 0 || a.bit < 0 || b.bit < 0) continue;
      var p = bits[a.bit], q = bits[b.bit];
      if (Math.hypot(p.x - q.x, p.y - q.y) > 34) continue;
      g.globalAlpha = 0.4 * h;
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
    }
    g.globalAlpha = 1;
    for (i = 0; i < bits.length; i++) D.bit(g, bits[i].x, bits[i].y, S.R, bits[i].ang, bits[i].star);

    var f = sim.state.finger;
    if (f) {
      g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2;
      g.beginPath(); g.arc(f.x, f.y, 26, 0, 6.283); g.stroke();
    }
  }

  /* ----- what eyes see: a clear pot on a hob. No white cloud: steam is invisible,
   * so a hot pot just looks nearly empty. Drawn from census() so it never disagrees. ----- */
  function drawEyes() {
    var g = eyes.begin(VW, VH), c = sim.census(), T = sim.state.T, N = S.N, W = S.W, H = S.H;
    var iceF = c.ice / N, liqF = c.liquid / N, gasF = c.gas / N, k, calm = BQ.calm();
    var heat = Math.max(0, sim.state.target - 0.45) / 0.55;
    var cold = Math.max(0, 0.3 - sim.state.target) / 0.3;
    g.translate(PX, PY);

    // bench and hob
    g.fillStyle = '#cdbfa8'; g.fillRect(-PX, H + 30, VW, 12);
    g.fillStyle = '#5b5750'; D.round(g, 10, H + 8, W - 20, 24, 8); g.fill();
    if (heat > 0) {
      for (k = 0; k < 9; k++) {
        var fx = 26 + k * (W - 52) / 8;
        var fh = (7 + 13 * heat) * (calm ? 1 : 0.75 + 0.25 * Math.sin(clock * 9 + k * 2));
        g.fillStyle = INK.warm;
        g.beginPath(); g.moveTo(fx - 7, H + 12); g.quadraticCurveTo(fx, H + 12 - 2 * fh, fx + 7, H + 12); g.fill();
        g.fillStyle = INK.sun;
        g.beginPath(); g.moveTo(fx - 3, H + 12); g.quadraticCurveTo(fx, H + 12 - fh, fx + 3, H + 12); g.fill();
      }
    }
    if (cold > 0) {                                         // a cold plate with frost stars
      g.strokeStyle = 'rgba(190,225,255,' + (0.5 + 0.5 * cold) + ')'; g.lineWidth = 2;
      for (k = 0; k < 7; k++) {
        var sx = 30 + k * (W - 60) / 6;
        for (var r = 0; r < 3; r++) {
          var an = r * Math.PI / 3;
          g.beginPath(); g.moveTo(sx - Math.cos(an) * 6, H + 20 - Math.sin(an) * 6);
          g.lineTo(sx + Math.cos(an) * 6, H + 20 + Math.sin(an) * 6); g.stroke();
        }
      }
    }

    // inside the pot
    var bw = 190 * Math.sqrt(iceF), bh = 98 * Math.sqrt(iceF);
    var waterH = 64 * liqF + (iceF > 0.01 ? 0.9 * bw * bh / W * Math.min(1, liqF * 6) : 0);
    if (waterH > 0.5) {
      var wob = calm ? 0 : Math.sin(clock * 2.2) * 1.2 * Math.min(1, heat * 2 + 0.3);
      g.fillStyle = INK.water;
      g.beginPath(); g.moveTo(3, H - 3); g.lineTo(3, H - waterH + wob);
      g.quadraticCurveTo(W / 2, H - waterH - wob * 2, W - 3, H - waterH + wob); g.lineTo(W - 3, H - 3); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(8, H - waterH + wob + 3); g.quadraticCurveTo(W / 2, H - waterH - wob * 2 + 3, W - 8, H - waterH + wob + 3); g.stroke();
    }
    if (iceF > 0.01) {                                      // the block floats once there is water
      var by = H - 3 - bh - Math.max(0, waterH - 0.9 * bh), bx = (W - bw) / 2, rr = Math.min(10, bh / 3);
      g.fillStyle = INK.ice; D.round(g, bx, by, bw, bh, rr); g.fill();
      g.strokeStyle = INK.iceEdge; g.lineWidth = 2.5; D.round(g, bx, by, bw, bh, rr); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(bx + bw * 0.12, by + bh * 0.25); g.lineTo(bx + bw * 0.3, by + bh * 0.25); g.stroke();
      g.strokeStyle = 'rgba(156,201,230,.6)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(bx + bw * 0.55, by + bh * 0.8); g.lineTo(bx + bw * 0.7, by + bh * 0.45); g.lineTo(bx + bw * 0.82, by + bh * 0.6); g.stroke();
    }
    if (T > 0.58 && liqF > 0.05) {                          // bubbles while it boils
      g.strokeStyle = '#fff'; g.lineWidth = 1.5;
      for (k = 0; k < 9; k++) {
        var ph = (clock * (0.9 + k * 0.13) + k * 0.37) % 1;
        g.beginPath(); g.arc(20 + ((k * 53) % (W - 40)), H - 5 - ph * Math.max(0, waterH - 8), 2 + (k % 3), 0, 6.283); g.stroke();
      }
    }
    if (gasF > 0.03 && T < S.T_BOIL && T > 0.42) {          // cooling steam: drops on the lid, running down
      g.fillStyle = INK.water;
      var drops = Math.round(gasF * 18);
      for (k = 0; k < drops; k++) {
        var run = (clock * 0.35 + k * 0.29) % 1;
        var dx = k % 2 ? 4 : W - 4, dy = 4 + run * (H - waterH - 10);
        if (k % 3 === 0) { dx = 14 + ((k * 97) % (W - 28)); dy = 3 + (k % 2); }
        g.beginPath(); g.arc(dx, dy, 3, 0, 6.283); g.fill();
      }
    }
    if (cold > 0.3) {                                       // frost on the glass
      g.fillStyle = 'rgba(255,255,255,' + (0.35 * cold) + ')';
      g.fillRect(0, 0, 14, H); g.fillRect(W - 14, 0, 14, H);
    }

    // the pot itself, on top: clear walls, lid, knob, handles
    var rattle = (!calm && T > 0.62) ? Math.sin(clock * 31) * 1.2 : 0;
    g.strokeStyle = '#59636b'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, H - 8); g.quadraticCurveTo(0, H, 8, H);
    g.lineTo(W - 8, H); g.quadraticCurveTo(W, H, W, H - 8); g.lineTo(W, 0); g.stroke();
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(0, 30); g.lineTo(-13, 30); g.lineTo(-13, 44); g.lineTo(0, 44); g.stroke();
    g.beginPath(); g.moveTo(W, 30); g.lineTo(W + 13, 30); g.lineTo(W + 13, 44); g.lineTo(W, 44); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(9, 14); g.lineTo(9, 70); g.stroke();
    g.save(); g.translate(W / 2, -4); g.rotate(rattle * 0.006); g.translate(-W / 2, 4 + Math.abs(rattle) * -0.5);
    g.strokeStyle = '#59636b'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-10, -4); g.lineTo(W + 10, -4); g.stroke();
    g.fillStyle = '#59636b'; g.beginPath(); g.arc(W / 2, -13, 7, 0, 6.283); g.fill();
    g.restore();
  }

  function reset() {
    if (!sim) return;
    sim.reset(); phase = 'cold'; placeThumb(); frame.caption(CAPTIONS.model); draw();
  }
  function cleanup() {
    if (loop) loop.destroy();
    offs.forEach(function (off) { off(); }); offs = [];
    if (eyes) eyes.destroy();
    if (model) model.destroy();
    if (el) el.innerHTML = '';
    el = sim = loop = eyes = model = track = thumb = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.warmthToy = {
    start: start, reset: reset, cleanup: cleanup,
    // test hooks
    loop: function () { return loop; }, sim: function () { return sim; },
    setWarmth: function (v) { sim.state.target = v; placeThumb(); }
  };
})(window);
