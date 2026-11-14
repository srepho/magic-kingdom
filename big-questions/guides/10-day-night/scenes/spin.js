/* Centrepiece — spin the Earth.
 * Right: the model (crayon on paper). The Sun sits still on the left and lights half the
 * Earth. She turns the Earth with a finger; Sydney is the red dot.
 * Left: what eyes see in Sydney, looking north. Both are drawn from the same spin angle.
 * Nothing turns unless she turns it. A flick coasts for a while, the real way only.
 */
(function (root) {
  'use strict';
  var BQ = root.BQ, S = BQ.dayNightSim, N = BQ.dayNight, D = BQ.draw, INK = BQ.ink;
  var V = 300, SUN = { x: 30, y: 146 }, E = { x: 190, y: 146, r: 94 };
  var CAP = {
    start: 'A pretend picture of the <b>Earth</b> from space. Sydney is the red dot.',
    night: 'Sydney has turned away from the Sun. Night!',
    rise: 'Sydney turns back to face the Sun. <b>Sunrise</b>!',
    turn: 'One whole <b>spin</b> is one day and one night.',
    still: 'When the Earth stops turning, the day stops changing.'
  };

  var el, frame, sim, loop, eyes, model, spinner, offs = [];
  var st;

  function fresh() { return { clock: 0, wasDay: true, days: 0, hold: 0, idle: 0, toldStill: true, touched: false }; }

  function start(stage, api) {
    el = stage; frame = api;
    el.innerHTML = '<div class="dn-panels"><div class="dn-panel dn-eyes"></div><div class="dn-panel dn-model"></div></div>';
    sim = S.create(); st = fresh();
    eyes = BQ.surface(el.querySelector('.dn-eyes'), draw);
    model = BQ.surface(el.querySelector('.dn-model'), draw);
    spinner = N.spinner(sim, function () { return E; });
    offs.push(BQ.touch(model.c, {
      down: function (q) { if (spinner.down(model.toView(q))) st.touched = true; },
      move: function (q) { spinner.move(model.toView(q)); },
      up: function () { spinner.up(); }
    }));
    frame.caption(CAP.start);
    loop = BQ.loop(tick);
  }

  function say(key, secs) { frame.caption(CAP[key]); st.hold = secs || 0; }

  function tick(dt) {
    st.clock += dt; sim.tick(dt);
    st.hold = Math.max(0, st.hold - dt);
    var k = S.sky(S.SYDNEY, sim.state.spin), days = sim.days();
    if (days > st.days) { say('turn', 4); BQ.sound.coin(); }
    st.days = days;
    if (k.day !== st.wasDay) {
      st.wasDay = k.day;
      if (st.hold <= 0) say(k.day ? 'rise' : 'night');
      if (k.day) BQ.sound.lock(); else BQ.sound.drip();
    }
    var moving = sim.state.speed > 0 || spinner.active();
    if (moving) { st.idle = 0; st.toldStill = false; }
    else if (!st.toldStill && sim.state.turned > Math.PI) {
      st.idle += dt;
      if (st.idle > 3.5) { st.toldStill = true; say('still'); }
    }
    draw();
  }

  function draw() {
    if (!sim || !model || !eyes) return;
    var spin = sim.state.spin, k = S.sky(S.SYDNEY, spin), g, i;

    // what eyes see
    g = eyes.begin(V, V, 8);
    g.save(); D.round(g, 0, 0, V, V, 14); g.clip();
    N.sky(g, V, V, k, { clock: st.clock });
    g.restore();

    // the model
    g = model.begin(V, V, 8);
    D.glasses(g, 24, 16, 13);
    N.sun(g, SUN.x, SUN.y, 34, E.x, E.r, st.clock);
    N.earth(g, E.x, E.y, E.r, spin, [{ place: S.SYDNEY, color: '#e4534a' }], st.clock);
    N.arrow(g, E.x, E.y, E.r + 10, -1.0, -0.35);
    if (!st.touched && !BQ.calm()) {                        // a ghost fingertip shows the way in
      var a = -1.0 + ((st.clock * 0.5) % 1) * 0.65;
      g.fillStyle = 'rgba(59,58,54,.28)'; g.beginPath();
      g.arc(E.x + (E.r - 16) * Math.cos(a), E.y + (E.r - 16) * Math.sin(a), 11, 0, 6.283); g.fill();
    }
    // one little sun for each whole turn: days going by (a week, then it starts again)
    var shown = ((st.days % 8) + 8) % 8;
    for (i = 0; i < 7; i++) {
      var x = 105 + i * 26, y = 276;
      g.strokeStyle = 'rgba(59,58,54,.3)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.stroke();
      if (i < shown) { g.fillStyle = INK.sun; g.beginPath(); g.arc(x, y, 8, 0, 6.283); g.fill(); g.strokeStyle = '#a66a00'; g.stroke(); }
    }
  }

  function reset() {
    if (!sim) return;
    sim.reset(); st = fresh(); frame.caption(CAP.start); draw();
  }
  function cleanup() {
    if (loop) loop.destroy();
    offs.forEach(function (off) { off(); }); offs = [];
    if (eyes) eyes.destroy();
    if (model) model.destroy();
    if (el) el.innerHTML = '';
    el = sim = loop = eyes = model = spinner = st = null;
  }

  BQ.scenes = BQ.scenes || {};
  BQ.scenes.spin = { start: start, reset: reset, cleanup: cleanup,
    loop: function () { return loop; }, sim: function () { return sim; }, state: function () { return st; },
    spots: { earth: E, V: V } };
})(window);
