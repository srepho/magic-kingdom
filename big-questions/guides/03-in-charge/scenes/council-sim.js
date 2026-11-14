/* A made-up council: three elected members, one vote each, two plans.
 * Choosing a preference is not a decision; only the count adopts a plan. */
(function (root) {
  'use strict';
  function create() {
    var s = {};
    function reset() { s.choices = [0, 1, 1]; s.agreed = null; s.tally = [0, 0]; }
    function flip(i) {
      if (!Number.isInteger(i) || i < 0 || i > 2) return;
      s.choices[i] = 1 - s.choices[i];
    }
    function vote() {
      var tally = [0, 0];
      s.choices.forEach(function (choice) { tally[choice]++; });
      s.tally = tally;
      s.agreed = tally[0] > tally[1] ? 0 : 1;
      return { plan: s.agreed, leaderAgrees: s.choices[0] === s.agreed };
    }
    reset();
    return { state: s, reset: reset, flip: flip, vote: vote };
  }
  var api = { create: create };
  root.BQ = root.BQ || {}; root.BQ.councilSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
