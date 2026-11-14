/* Run: node --test big-questions/tests/town-sim.test.js
 * Checks what the town toy promises: no leader means nothing gets decided; the most votes
 * wins and there is never a tie; the leader decides without asking again; voting again can
 * choose someone new, and nothing already built is lost. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/03-in-charge/scenes/town-sim.js');

test('with no leader, asking everyone builds nothing', () => {
  const t = sim.create();
  for (let k = 0; k < 5; k++) assert.deepStrictEqual(t.ask(), { type: 'jam', what: 'playground' });
  assert.strictEqual(t.state.built.length, 0);
  assert.strictEqual(t.state.jams, 5);
});

test('the candidate with the most votes becomes leader', () => {
  const t = sim.create();
  const r = t.vote();
  assert.deepStrictEqual(r.tally, [4, 3]);
  assert.strictEqual(r.leader, 0);
  assert.strictEqual(r.first, true);
  assert.strictEqual(r.changed, false);
});

test('there is never a tie, whatever the townsfolk think', () => {
  for (let mask = 0; mask < 128; mask++) {
    const prefs = Array.from({ length: 7 }, (_, i) => (mask >> i) & 1);
    const r = sim.create({ prefs }).vote();
    assert.notStrictEqual(r.tally[0], r.tally[1]);
    assert.strictEqual(r.leader, r.tally[0] > r.tally[1] ? 0 : 1);
    assert.strictEqual(r.tally[0] + r.tally[1], 7);
  }
  assert.throws(() => sim.create({ prefs: [0, 1] }));
});

test('one person changing their mind can change who wins', () => {
  const t = sim.create();
  t.flip(0);
  assert.strictEqual(t.vote().leader, 1);
});

test('the leader decides, their way, without asking the voters again', () => {
  const t = sim.create();
  t.vote();
  const before = t.state.voters.map(v => v.pref);
  const a = t.ask(), b = t.ask();
  assert.deepStrictEqual(a, { type: 'built', what: 'playground', side: 0, slot: 0, by: 0 });
  assert.deepStrictEqual(b, { type: 'built', what: 'bench', side: 0, slot: 1, by: 0 });
  assert.deepStrictEqual(t.state.voters.map(v => v.pref), before);
  assert.strictEqual(t.state.decisions, 2);
});

test('voting again can choose someone new; what was built stays', () => {
  const t = sim.create();
  t.vote(); t.ask(); t.ask();
  t.flip(0);
  const r = t.vote();
  assert.strictEqual(r.changed, true);
  assert.strictEqual(r.leader, 1);
  assert.strictEqual(t.state.decisions, 0);
  assert.strictEqual(t.state.built.length, 2);
  assert.strictEqual(t.ask().side, 1);
  assert.deepStrictEqual(t.state.built.map(b => b.side), [0, 0, 1]);
});

test('voting again with the same minds keeps the same leader', () => {
  const t = sim.create();
  t.vote();
  const r = t.vote();
  assert.strictEqual(r.changed, false);
  assert.strictEqual(r.first, false);
  assert.strictEqual(t.state.elections, 2);
});

test('a full side spills to the other; a full town needs nothing more', () => {
  const t = sim.create();
  t.vote();
  for (let k = 0; k < sim.SLOTS; k++) assert.strictEqual(t.ask().side, 0);
  assert.strictEqual(t.ask().side, 1);
  for (let k = 0; k < sim.SLOTS - 1; k++) t.ask();
  assert.strictEqual(t.state.built.length, sim.SLOTS * 2);
  assert.strictEqual(t.nextNeed(), null);
  assert.deepStrictEqual(t.ask(), { type: 'none' });
  // every slot on each side is used exactly once
  for (const side of [0, 1]) {
    assert.deepStrictEqual(t.state.built.filter(b => b.side === side).map(b => b.slot).sort(), [0, 1, 2, 3, 4, 5]);
  }
});

test('flipping nobody, and reset', () => {
  const t = sim.create();
  assert.strictEqual(t.flip(99), null);
  t.vote(); t.ask(); t.flip(2);
  t.reset();
  assert.strictEqual(t.state.leader, null);
  assert.strictEqual(t.state.built.length, 0);
  assert.deepStrictEqual(t.state.voters.map(v => v.pref), sim.START);
});
