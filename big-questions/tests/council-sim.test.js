'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../guides/03-in-charge/scenes/council-sim.js');

test('every combination gives each member exactly one vote; a leader can be outvoted', () => {
  for (let mask = 0; mask < 8; mask++) {
    const council = S.create();
    const choices = [0, 1, 2].map(i => (mask >> i) & 1);
    choices.forEach((choice, i) => { if (council.state.choices[i] !== choice) council.flip(i); });
    const result = council.vote(), river = choices.reduce((a, b) => a + b, 0);
    assert.deepEqual(council.state.tally, [3 - river, river]);
    assert.equal(result.plan, river >= 2 ? 1 : 0);
    assert.equal(result.leaderAgrees, result.plan === choices[0]);
  }
  assert.equal(S.create().vote().leaderAgrees, false, 'the initial example visibly outvotes the leader');
});

test('changing a preference does not silently replace the agreed plan', () => {
  const c = S.create();
  assert.equal(c.state.agreed, null);
  c.vote(); assert.equal(c.state.agreed, 1);
  c.flip(1); assert.equal(c.state.agreed, 1); assert.deepEqual(c.state.tally, [1, 2]);
  c.vote(); assert.equal(c.state.agreed, 0); assert.deepEqual(c.state.tally, [2, 1]);
});

test('repeating a count is stable, invalid choices are harmless, reset clears the decision', () => {
  const c = S.create(), initial = structuredClone(c.state);
  for (const i of [-1, 3, 1.5, NaN, '0', undefined]) c.flip(i);
  assert.deepEqual(c.state, initial);
  const first = c.vote(); assert.deepEqual(c.vote(), first);
  c.flip(0); c.vote(); c.reset(); assert.deepEqual(c.state, initial);
});
