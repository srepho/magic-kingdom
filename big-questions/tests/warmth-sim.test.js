/* Run: node --test big-questions/tests/
 * Checks the promises the warmth toy makes to a child: the same bits are always
 * there, each state looks like itself, and every change undoes. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/01-made-of/scenes/warmth-sim.js');

function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function run(s, warmth, seconds) {
  s.state.target = warmth;
  for (let i = 0; i < seconds * 120; i++) s.step(1 / 120);
}
function offLattice(s) {
  return Math.max(...s.state.bits.map(b =>
    b.site < 0 ? Infinity : Math.hypot(b.x - s.state.sites[b.site].x, b.y - s.state.sites[b.site].y)));
}
function inPot(s) {
  return s.state.bits.every(b => b.x >= sim.R && b.x <= sim.W - sim.R &&
    b.y >= sim.R && b.y <= sim.H - sim.R && Number.isFinite(b.vx + b.vy));
}
const meanY = s => s.state.bits.reduce((a, b) => a + b.y, 0) / sim.N;

test('cold: every bit holds its place but never stops jiggling', () => {
  const s = sim.create({ random: rng(1), warmth: 0 });
  run(s, 0, 5);
  assert.ok(offLattice(s) < 6, 'bits stay on the honeycomb');
  const speed = Math.max(...s.state.bits.map(b => Math.hypot(b.vx, b.vy)));
  assert.ok(speed > 5, 'ice bits are still moving');
  assert.strictEqual(Math.round(s.census().ice), sim.N);
});

test('warm: no ice, a pool at the bottom, bits wander', () => {
  const s = sim.create({ random: rng(2) });
  run(s, 0.5, 8);
  const c = s.census();
  assert.strictEqual(c.ice, 0);
  assert.ok(c.liquid >= sim.N - 6, 'nearly all bits are in the pool: ' + JSON.stringify(c));
  assert.ok(meanY(s) > sim.H * 0.72, 'pool sits low: ' + meanY(s));
  const before = s.state.bits.map(b => [b.x, b.y]);
  run(s, 0.5, 6);
  const moved = s.state.bits.filter((b, i) => Math.hypot(b.x - before[i][0], b.y - before[i][1]) > 25).length;
  assert.ok(moved >= sim.N / 3, 'liquid flows, it is not a second solid: ' + moved);
});

test('hot: bits fill the whole pot', () => {
  const s = sim.create({ random: rng(3) });
  run(s, 1, 8);
  const c = s.census();
  assert.ok(c.gas >= sim.N * 0.7, JSON.stringify(c));
  let sum = 0, n = 0;
  for (let i = 0; i < 600; i++) { s.step(1 / 120); sum += meanY(s); n++; }
  assert.ok(Math.abs(sum / n - sim.H / 2) < sim.H * 0.15, 'spread through the pot: ' + sum / n);
});

test('it undoes: hot then cold puts every bit back on the honeycomb', () => {
  for (const seed of [4, 5, 6]) {
    const s = sim.create({ random: rng(seed) });
    run(s, 1, 6);
    run(s, 0, 12);
    assert.ok(offLattice(s) < 6, 'seed ' + seed + ' off by ' + offLattice(s));
    assert.strictEqual(new Set(s.state.bits.map(b => b.site)).size, sim.N, 'one bit per site');
  }
});

test('the same bits are there throughout, including a stickered one', () => {
  const s = sim.create({ random: rng(7) });
  s.state.bits[11].star = true;
  for (const w of [1, 0.5, 0, 0.8, 0.2, 1, 0]) {
    run(s, w, 3);
    assert.strictEqual(s.state.bits.length, sim.N);
    assert.ok(inPot(s), 'all bits inside the pot at warmth ' + w);
  }
  assert.deepStrictEqual(s.state.bits.filter(b => b.star).map(b => b.id), [11]);
});

test('yanking the slider end to end never throws a bit out', () => {
  const s = sim.create({ random: rng(8) });
  for (let i = 0; i < 60; i++) { run(s, i % 2, 0.4); assert.ok(inPot(s)); }
});

test('a poking finger pushes bits; ice springs back', () => {
  const s = sim.create({ random: rng(9), warmth: 0.05 });
  s.state.finger = { x: 130, y: 200 };
  run(s, 0.05, 1);
  assert.ok(offLattice(s) > 8, 'finger shoves ice bits aside');
  assert.ok(inPot(s));
  s.state.finger = null;
  run(s, 0.05, 3);
  assert.ok(offLattice(s) < 6, 'and they spring back');
});

test('ice takes a little more room than water (why ice floats)', () => {
  const s = sim.create({ random: rng(10), warmth: 0 });
  const top = () => { const ys = s.state.bits.map(b => b.y).sort((a, b) => a - b); return ys[3]; };
  const iceTop = top();
  run(s, 0.45, 10);
  assert.ok(top() > iceTop, 'the pool sits lower than the block did');
});

test('reset returns to cold with no stickers', () => {
  const s = sim.create({ random: rng(11) });
  s.state.bits[3].star = true;
  run(s, 1, 3);
  s.reset();
  assert.ok(offLattice(s) < 0.001);
  assert.ok(!s.state.bits.some(b => b.star));
  assert.ok(s.state.target < 0.2);
});
