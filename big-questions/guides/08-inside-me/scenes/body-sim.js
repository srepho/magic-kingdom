/* Inside me — heart and breathing rules only (no DOM), so they can be tested in Node.
 *
 * One input: is she running or resting. The heart rate climbs quickly while she runs and
 * drifts back down more slowly when she stops, as a real heart does. Breathing follows.
 * Numbers are for a child of about five: resting near 90 beats a minute (the Royal
 * Children's Hospital's acceptable range at rest is roughly 75 to 150), running near 150.
 */
(function (root) {
  'use strict';
  var REST = 90, RUN = 150;            // heartbeats a minute
  var REST_BREATH = 22, RUN_BREATH = 44;
  var UP = 3.5, DOWN = 9;              // seconds: quick to rise, slower to settle

  function create() {
    var s = { running: false, hr: REST, br: REST_BREATH, beatPhase: 0, breathPhase: 0, beats: 0 };

    function reset() { s.running = false; s.hr = REST; s.br = REST_BREATH; s.beatPhase = 0; s.breathPhase = 0; s.beats = 0; }
    function toward(now, goal, dt) { return now + (goal - now) * (1 - Math.exp(-dt / (goal > now ? UP : DOWN))); }

    /* returns how many heartbeats happened during this step */
    function step(dt) {
      if (!(dt > 0)) return 0;
      s.hr = toward(s.hr, s.running ? RUN : REST, dt);
      s.br = toward(s.br, s.running ? RUN_BREATH : REST_BREATH, dt);
      s.beatPhase += s.hr / 60 * dt;
      var n = Math.floor(s.beatPhase);
      s.beatPhase -= n; s.beats += n;
      s.breathPhase = (s.breathPhase + s.br / 60 * dt) % 1;
      return n;
    }
    /* 1 at the moment of a beat, fading before the next: drives the squeeze of the heart */
    function beat() { return Math.exp(-s.beatPhase * 5); }
    /* 0 breathed out, 1 breathed in */
    function breath() { return 0.5 - 0.5 * Math.cos(s.breathPhase * 2 * Math.PI); }
    /* 0 at rest, 1 at full running pace */
    function level() { return (s.hr - REST) / (RUN - REST); }

    return { state: s, reset: reset, step: step, beat: beat, breath: breath, level: level };
  }

  var api = { create: create, REST: REST, RUN: RUN, REST_BREATH: REST_BREATH, RUN_BREATH: RUN_BREATH };
  root.BQ = root.BQ || {};
  root.BQ.bodySim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
