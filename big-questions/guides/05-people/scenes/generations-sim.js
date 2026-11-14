/* An invented lineage, not a population-genetics model.
 * Each individual is fixed. Small independent trait changes can go either way;
 * there is no target, improvement score or intended final animal. */
(function (root) {
  'use strict';
  var GENS = 4000, seed = 19371, line = [];
  function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
  var bounds = { p: [0.05, 0.95, 0.008], leg: [5, 22, 0.16], ear: [4, 18, 0.14], tail: [6, 27, 0.18], size: [0.92, 1.08, 0.001] };
  line.push(Object.freeze({ p: 0.4, leg: 12, ear: 10, tail: 17, size: 1 }));
  for (var n = 1; n <= GENS; n++) {
    var child = {};
    Object.keys(bounds).forEach(function (key) {
      var b = bounds[key], value = line[n - 1][key] + (random() * 2 - 1) * b[2];
      // Reflect at the illustration's limits instead of getting stuck at an edge.
      if (value < b[0]) value = b[0] + (b[0] - value);
      if (value > b[1]) value = b[1] - (value - b[1]);
      child[key] = value;
    });
    line.push(Object.freeze(child));
  }
  function look(gen) {
    gen = Number.isFinite(gen) ? Math.max(0, Math.min(GENS, Math.round(gen))) : 0;
    return line[gen];
  }
  var api = { GENS: GENS, look: look };
  root.BQ = root.BQ || {}; root.BQ.generationsSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
