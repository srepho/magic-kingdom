/* Run: node --test big-questions/tests/
 * Checks the promises the market makes: swaps really do jam, coins really do fix it,
 * coins only move, and nothing she does can break it. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/02-money/scenes/market-sim.js');

const pairs = [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]];

test('no direct swap works: every pair jams and nobody gets fed', () => {
  const m = sim.create();
  for (const [i, j] of pairs) {
    const r = m.offer(i, j);
    assert.strictEqual(r.type, 'jam', `${i}->${j}`);
    assert.ok(r.refuser === i || r.refuser === j);
  }
  assert.ok(m.state.folk.every(f => f.fed === 0));
  assert.strictEqual(m.state.jams, 6);
});

test('the one who says no is the one who would get something unwanted', () => {
  const m = sim.create();
  // wombat (apple) offers to frog, who wants apples; but wombat does not want fish
  assert.strictEqual(m.offer(0, 2).refuser, 0);
  // wombat offers apples to koala, who wants fish
  assert.strictEqual(m.offer(0, 1).refuser, 1);
});

test('coins do nothing until they are switched on', () => {
  const m = sim.create();
  assert.strictEqual(m.pay(0, 1).type, 'none');
  assert.strictEqual(m.totalCoins(), 0);
});

test('with coins, everyone can get what they want', () => {
  const m = sim.create();
  m.setCoins(true);
  m.state.folk.forEach((f, i) => {
    const seller = m.state.folk.findIndex(g => g.has === f.wants);
    const r = m.pay(i, seller);
    assert.deepStrictEqual(r, { type: 'buy', good: f.wants, liked: true });
  });
  assert.ok(m.state.folk.every(f => f.fed > 0));
  // one coin went round the ring, so everyone is back where they started
  assert.deepStrictEqual(m.state.folk.map(f => f.coins), [2, 2, 2]);
});

test('coins only move: the total never changes, whatever she does', () => {
  const m = sim.create();
  m.setCoins(true);
  let seed = 7;
  const rnd = n => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % n; };
  for (let k = 0; k < 500; k++) {
    const i = rnd(3), j = rnd(3);
    if (rnd(2)) m.pay(i, j); else m.offer(i, j);
    assert.strictEqual(m.totalCoins(), 3 * sim.START_COINS);
    assert.ok(m.state.folk.every(f => f.coins >= 0));
  }
});

test('someone with no coins cannot pay, and nothing breaks', () => {
  const m = sim.create();
  m.setCoins(true);
  m.pay(0, 1); m.pay(0, 1);
  assert.strictEqual(m.state.folk[0].coins, 0);
  assert.strictEqual(m.pay(0, 1).type, 'broke');
  assert.strictEqual(m.state.folk[1].coins, 4);
  // but they can still earn by selling, then buy again
  assert.strictEqual(m.pay(2, 0).type, 'buy');
  assert.strictEqual(m.pay(0, 1).type, 'buy');
});

test('buying something you did not want still works but does not feed you', () => {
  const m = sim.create();
  m.setCoins(true);
  const r = m.pay(0, 2);            // wombat buys fish; wanted bread
  assert.deepStrictEqual(r, { type: 'buy', good: 'fish', liked: false });
  assert.strictEqual(m.state.folk[0].fed, 0);
});

test('switching coins off brings the jam back; hunger returns with time', () => {
  const m = sim.create();
  m.setCoins(true); m.pay(0, 1);
  assert.ok(m.state.folk[0].fed > 0);
  m.setCoins(false);
  assert.strictEqual(m.totalCoins(), 0);
  assert.strictEqual(m.offer(0, 1).type, 'jam');
  m.tick(100);
  assert.strictEqual(m.state.folk[0].fed, 0);
});

test('offering or paying yourself, or nonsense indexes, is harmless', () => {
  const m = sim.create();
  m.setCoins(true);
  assert.strictEqual(m.offer(1, 1).type, 'none');
  assert.strictEqual(m.pay(1, 1).type, 'none');
  assert.strictEqual(m.offer(0, 9).type, 'none');
  assert.strictEqual(m.pay(-1, 0).type, 'none');
  assert.strictEqual(m.totalCoins(), 6);
});

test('reset returns to the start', () => {
  const m = sim.create();
  m.setCoins(true); m.pay(0, 1); m.offer(0, 2);
  m.reset();
  assert.strictEqual(m.state.coinsOn, false);
  assert.strictEqual(m.totalCoins(), 0);
  assert.strictEqual(m.state.trades + m.state.jams, 0);
});
