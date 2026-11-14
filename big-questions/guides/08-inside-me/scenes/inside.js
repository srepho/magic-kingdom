/* Centrepiece — look inside, and run.
 * Slide the bar: the outside fades to show the organs, then the organs fade to show the
 * skeleton. Slide back and they return. Hold the shoe: the figure runs, and the heart beats
 * faster and the lungs breathe faster. Let go: both settle down again.
 * A ribbon of dots along the bottom shows the beat: close together means fast.
 * Rules live in body-sim.js; this file draws and listens.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, B = BQ.body, D = BQ.draw, INK = BQ.ink;
  var VW = 480, VH = 300, FX = 240, FY = 270;

  var ICON = {
    shirt: '<svg viewBox="0 0 24 24"><path d="M8 3l4 3 4-3 6 4-3 4-2-1v11H7V10l-2 1-3-4z" fill="#57b5a6" stroke="#3b3a36" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    bone: '<svg viewBox="0 0 24 24"><path d="M6 14l8-8a2.6 2.6 0 1 1 4 0 2.6 2.6 0 1 1 0 4l-8 8a2.6 2.6 0 1 1-4 0 2.6 2.6 0 1 1 0-4z" fill="#fffdf4" stroke="#3b3a36" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    shoe: '<svg viewBox="0 0 24 24"><path d="M3 17v-6l4 1 3-4 3 5 6 2c1.5 .5 2 1.5 2 2z" fill="#e4534a" stroke="#3b3a36" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 19h20" stroke="#3b3a36" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  var CAP = {
    organs: 'Inside: your heart pumps blood, and your <b>lungs</b> breathe air.',
    bones: 'Your <b>skeleton</b>: all your bones, holding you up.',
    fast: 'Running! Your heart beats faster. That beat is your <b>pulse</b>.',
    rest: 'Resting. Your heart slows down again.'
  };

  var el, frame, sim, loop, surf, track, thumb, runBtn, offs = [], st;

  function fresh() { return { layer: 0, zone: 0, held: false, burst: 0, runAmt: 0, stride: 0, flow: 0, ribbon: [], pace: 'calm', clock: 0, dragging: false }; }

  function start(stage, api) {
    el = stage; frame = api; sim = BQ.bodySim.create(); st = fresh();
    el.innerHTML =
      '<div class="bd-view"></div>' +
      '<div class="bd-bar">' +
        '<span class="bd-end">' + ICON.shirt + '</span>' +
        '<div class="bd-track"><div class="bd-thumb"></div></div>' +
        '<span class="bd-end">' + ICON.bone + '</span>' +
        '<button class="bd-run" aria-label="Run">' + ICON.shoe + '</button>' +
      '</div>';
    surf = BQ.surface(el.querySelector('.bd-view'), draw);
    track = el.querySelector('.bd-track'); thumb = el.querySelector('.bd-thumb'); runBtn = el.querySelector('.bd-run');

    function slide(p) {
      var half = thumb.offsetWidth / 2;
      setLayer(2 * Math.max(0, Math.min(1, (p.x - half) / (track.clientWidth - 2 * half))));
    }
    offs.push(BQ.touch(track, {
      down: function (p) { st.dragging = true; slide(p); },
      move: function (p) { if (st.dragging) slide(p); },
      up: function () { st.dragging = false; }
    }));
    offs.push(BQ.touch(runBtn, {
      down: function () { st.held = true; st.burst = 1.2; runBtn.classList.add('on'); },
      up: function () { st.held = false; runBtn.classList.remove('on'); }
    }));
    root.addEventListener('resize', placeThumb);
    offs.push(function () { root.removeEventListener('resize', placeThumb); });
    placeThumb();
    loop = BQ.loop(tick);
  }

  function setLayer(v) {
    st.layer = v; placeThumb();
    var z = v < 0.5 ? 0 : v < 1.5 ? 1 : 2;
    if (z !== st.zone) {
      st.zone = z;
      if (z === 1) frame.caption(CAP.organs); else if (z === 2) frame.caption(CAP.bones);
      BQ.sound.click();
    }
  }
  function placeThumb() {
    if (!thumb || !st) return;
    thumb.style.transform = 'translateX(' + (st.layer / 2 * (track.clientWidth - thumb.offsetWidth)) + 'px)';
  }

  function tick(dt) {
    st.clock += dt;
    st.burst = Math.max(0, st.burst - dt);
    sim.state.running = st.held || st.burst > 0;
    var beats = sim.step(dt), lvl = sim.level();
    st.runAmt += ((sim.state.running ? 1 : 0) - st.runAmt) * Math.min(1, dt * 6);
    st.stride += dt * 2.7 * st.runAmt;
    st.flow += dt * sim.state.hr / 60 * 0.3;
    if (beats > 0) {
      st.ribbon.push({ x: 0 });
      if (st.layer > 0.4 || lvl > 0.12) BQ.sound.plop();   // the thump of the heart
    }
    st.ribbon.forEach(function (d) { d.x += dt * 78; });
    st.ribbon = st.ribbon.filter(function (d) { return d.x < 430; });
    if (st.pace === 'calm' && lvl > 0.55) { st.pace = 'fast'; frame.caption(CAP.fast); }
    else if (st.pace === 'fast' && lvl < 0.12 && !sim.state.running) { st.pace = 'calm'; frame.caption(CAP.rest); }
    draw();
  }

  function draw() {
    if (!surf || !st) return;
    var g = surf.begin(VW, VH), L = st.layer, lvl = sim.level(), k;
    g.fillStyle = INK.sky; D.round(g, 4, 4, VW - 8, VH - 8, 14); g.fill();
    g.fillStyle = '#e6d9c3'; g.fillRect(4, 250, VW - 8, VH - 254);
    g.fillStyle = '#d6c7ad'; g.fillRect(4, 250, VW - 8, 4);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(FX, FY + 3, 46 - st.runAmt * 6, 7, 0, 0, 6.283); g.fill();

    // the beat ribbon: one dot a heartbeat, drifting away. Close together means fast.
    var beat = sim.beat();
    g.strokeStyle = 'rgba(216,57,74,.25)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(26, 284); g.lineTo(456, 284); g.stroke();
    st.ribbon.forEach(function (d) {
      g.fillStyle = 'rgba(216,57,74,' + Math.max(0, 1 - d.x / 430) + ')';
      g.beginPath(); g.arc(26 + d.x, 284, 4.5, 0, 6.283); g.fill();
    });
    g.fillStyle = '#d8394a'; g.beginPath(); g.arc(22, 284, 6 + 3 * beat, 0, 6.283); g.fill();

    var q = B.run(st.stride, st.runAmt);
    var faceNow = sim.state.running ? 'laugh' : lvl > 0.45 ? 'puff' : 'smile';
    g.save(); g.translate(FX, FY);
    var J = B.draw(g, q, {
      skin: Math.max(0, 1 - L), organs: L <= 1 ? 1 : Math.max(0, 2 - L), bones: Math.max(0, L - 1),
      beat: beat, breath: sim.breath(), flow: st.flow, face: faceNow, t: st.clock
    });
    if (L < 0.6) {                                          // from outside you can still feel it: a thump on the chest
      g.strokeStyle = 'rgba(216,57,74,' + (0.55 * beat * (1 - L / 0.6)) + ')'; g.lineWidth = 3;
      g.beginPath(); g.arc(J.heart.x, J.heart.y, 9 + (1 - beat) * 16, 0, 6.283); g.stroke();
    }
    if (st.runAmt > 0.3) {                                  // little puffs of dust under the feet
      g.fillStyle = 'rgba(160,140,110,' + (0.35 * st.runAmt) + ')';
      for (k = 0; k < 2; k++) g.beginPath(), g.arc((k ? 1 : -1) * (26 + (st.stride * 40) % 14), 2, 4, 0, 6.283), g.fill();
    }
    g.restore();
  }

  function reset() {
    if (!st) return;
    sim.reset(); st = fresh(); runBtn.classList.remove('on'); placeThumb(); frame.caption(''); draw();
  }
  function cleanup() {
    if (loop) loop.destroy();
    offs.forEach(function (off) { off(); }); offs = [];
    if (surf) surf.destroy();
    if (el) el.innerHTML = '';
    el = sim = loop = surf = track = thumb = runBtn = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.inside = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, state: function () { return st; },
    setLayer: setLayer, setRun: function (on) { st.held = !!on; } };
})(window);
