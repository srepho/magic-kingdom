'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../guides/05-people/scenes/generations-sim.js');

test('each individual keeps a fixed appearance on rewind, including fractional slider input', () => {
  const before = structuredClone(S.look(1350));
  S.look(S.GENS); S.look(0);
  assert.deepEqual(S.look(1350), before);
  assert.deepEqual(S.look(1350.2), before);
  assert.ok(Object.isFrozen(S.look(1350)));
  assert.throws(() => { S.look(1350).leg = 999; }, TypeError);
});

test('successive generations resemble each other and each trait changes in both directions', () => {
  const limits = { p: 0.008, leg: 0.16, ear: 0.14, tail: 0.18, size: 0.001 };
  for (const [trait, limit] of Object.entries(limits)) {
    let up = false, down = false, min = Infinity, max = -Infinity;
    for (let n = 1; n <= S.GENS; n++) {
      const value = S.look(n)[trait], delta = value - S.look(n - 1)[trait];
      assert.ok(Math.abs(delta) <= limit + 1e-10, `${trait} changed too much at ${n}`);
      assert.ok(Number.isFinite(value) && value > 0);
      up ||= delta > 0; down ||= delta < 0; min = Math.min(min, value); max = Math.max(max, value);
    }
    assert.ok(up && down, `${trait} must not march in one direction`);
    assert.ok(max - min > 10 * limit, `${trait} must vary visibly over many generations`);
  }
});

test('traits need not change together, and out-of-range inputs stay drawable', () => {
  assert.ok(Array.from({length: S.GENS}, (_, i) => i + 1).some(n =>
    (S.look(n).ear - S.look(n - 1).ear) * (S.look(n).leg - S.look(n - 1).leg) < 0));
  for (const n of [NaN, undefined, Infinity, -1]) assert.deepEqual(S.look(n), S.look(0));
  assert.deepEqual(S.look(S.GENS + 1), S.look(S.GENS));
});
