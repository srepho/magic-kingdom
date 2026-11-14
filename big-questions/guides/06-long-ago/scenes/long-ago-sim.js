/* How long ago — the numbers only (no DOM), so they can be tested in Node.
 *
 * One timeline with "now" at the right-hand end. A zoom value z runs from 0 (her own life
 * fills the line) to 8 (the whole age of the Earth fills it). At every z the line is an
 * honest ruler: twice as far along it is twice as long ago. Zooming out only changes how
 * many years the whole line stands for.
 *
 * Ages are years before 2026.
 */
(function (root) {
  'use strict';

  var LEVELS = [
    { key: 'baby',    age: 5,       span: 6 },        // she was a baby
    { key: 'dad',     age: 40,      span: 46 },       // a grown-up she knows was a baby (adjust to the family)
    { key: 'bridge',  age: 94,      span: 110 },      // Sydney Harbour Bridge opened, 1932
    { key: 'castle',  age: 950,     span: 1150 },     // stone castles in Europe
    { key: 'pyramid', age: 4500,    span: 5400 },     // Great Pyramid of Giza
    { key: 'camp',    age: 65000,   span: 78000 },    // people living in Australia (at least 50,000; evidence for 65,000)
    { key: 'first',   age: 300000,  span: 360000 },   // oldest known fossils of our own species
    { key: 'dino',    age: 66e6,    span: 80e6 },     // last of the giant dinosaurs
    { key: 'earth',   age: 4.54e9,  span: 5.4e9 }     // the Earth forms
  ];
  var MAX = LEVELS.length - 1;
  var HER_LIFE = 5;

  function clampZ(z) { return z < 0 || z !== z ? 0 : z > MAX ? MAX : z; }

  /* how many years the whole line stands for at zoom z (smooth between levels) */
  function span(z) {
    z = clampZ(z);
    var i = Math.min(MAX - 1, Math.floor(z)), f = z - i;
    return LEVELS[i].span * Math.pow(LEVELS[i + 1].span / LEVELS[i].span, f);
  }
  /* where something sits: 0 = now, 1 = the far (old) end of the line */
  function pos(age, z) { return age / span(z); }
  function level(z) { return Math.round(clampZ(z)); }
  /* the oldest landmark that has come onto the line: this is what the caption talks about */
  function reached(z) {
    var s = span(z), r = 0;
    for (var i = 0; i <= MAX; i++) if (LEVELS[i].age <= s) r = i;
    return r;
  }

  /* every landmark, with where it is and how big and solid to draw it */
  function marks(z) {
    return LEVELS.map(function (L, i) {
      var p = pos(L.age, z);
      return {
        key: L.key, index: i, pos: p,
        size: p >= 0.5 ? 1 : Math.max(0.16, p / 0.5),
        alpha: p > 1.12 ? 0 : p > 1 ? (1.12 - p) / 0.12 : p < 0.004 ? 0 : p < 0.02 ? (p - 0.004) / 0.016 : 1
      };
    });
  }
  /* how much of the line her whole life takes up (1 = all of it) */
  function lifeShare(z) { return Math.min(1, HER_LIFE / span(z)); }

  /* The paper roll: one sheet is as long as her life so far. */
  var YEARS_PER_SHEET = HER_LIFE, SHEETS_PER_ROLL = 190;
  function sheets(age) { return age / YEARS_PER_SHEET; }
  function rolls(age) { return sheets(age) / SHEETS_PER_ROLL; }

  var api = { LEVELS: LEVELS, MAX: MAX, HER_LIFE: HER_LIFE, clampZ: clampZ, span: span, pos: pos, level: level, reached: reached,
              marks: marks, lifeShare: lifeShare, sheets: sheets, rolls: rolls,
              YEARS_PER_SHEET: YEARS_PER_SHEET, SHEETS_PER_ROLL: SHEETS_PER_ROLL };
  root.BQ = root.BQ || {};
  root.BQ.longAgoSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
