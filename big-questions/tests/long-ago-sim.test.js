/* Run: node --test big-questions/tests/long-ago-sim.test.js
 * Checks the promises the zooming timeline makes: it is always an honest ruler, each step
 * out shows a far bigger stretch, things stay in order, and her own life really does shrink
 * to nothing. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/06-long-ago/scenes/long-ago-sim.js');

test('each level shows a far bigger stretch of time than the last', () => {
  for (let i = 1; i <= sim.MAX; i++) {
    const ratio = sim.span(i) / sim.span(i - 1);
    assert.ok(ratio >= 2, `level ${i} is only ${ratio.toFixed(2)} times level ${i - 1}`);
  }
});

test('zooming out is smooth and never goes backwards', () => {
  let prev = sim.span(0);
  for (let z = 0.01; z <= sim.MAX; z += 0.01) {
    const s = sim.span(z);
    assert.ok(s > prev, 'span must grow at z=' + z.toFixed(2));
    assert.ok(s / prev < 1.2, 'no sudden jump at z=' + z.toFixed(2));
    prev = s;
  }
});

test('at every zoom the line is an honest ruler: twice as old is twice as far', () => {
  for (const z of [0, 0.3, 1, 2.5, 4, 6.7, 8]) {
    assert.ok(Math.abs(sim.pos(20, z) / sim.pos(10, z) - 2) < 1e-9);
    assert.strictEqual(sim.pos(0, z), 0, 'now is always at the end');
  }
});

test("each landmark sits near the far end at its own level, and is squashed towards now at the next", () => {
  sim.LEVELS.forEach((L, i) => {
    const own = sim.pos(L.age, i);
    assert.ok(own > 0.75 && own < 0.95, `${L.key} at its own level: ${own.toFixed(2)}`);
    if (i < sim.MAX) assert.ok(sim.pos(L.age, i + 1) < 0.45, `${L.key} one level out`);
    if (i > 0) assert.ok(sim.pos(L.age, i - 1) > 1.12, `${L.key} is off the line one level in`);
  });
});

test('landmarks are always in the right order: older is further from now', () => {
  for (let z = 0; z <= sim.MAX; z += 0.25) {
    const m = sim.marks(z);
    for (let i = 1; i < m.length; i++) assert.ok(m[i].pos > m[i - 1].pos);
  }
});

test('what is drawn: things beyond the line are hidden, things near now shrink but stay in place', () => {
  const start = sim.marks(0);
  assert.strictEqual(start[0].alpha, 1);
  assert.ok(start.slice(1).every(m => m.alpha === 0), 'only her babyhood shows at the start');
  const far = sim.marks(sim.MAX);
  assert.strictEqual(far[sim.MAX].alpha, 1);
  assert.strictEqual(far[sim.MAX].size, 1);
  assert.strictEqual(far[0].alpha, 0, 'her babyhood is too small to see at the far zoom');
  for (const m of sim.marks(3.4)) assert.ok(m.size >= 0.16 && m.size <= 1 && m.alpha >= 0 && m.alpha <= 1);
});

test('her whole life fills most of the line at the start and vanishes at the end', () => {
  assert.ok(sim.lifeShare(0) > 0.8);
  assert.ok(sim.lifeShare(1) < 0.15);
  assert.ok(sim.lifeShare(sim.MAX) < 1e-8);
  let prev = 2;
  for (let z = 0; z <= sim.MAX; z += 0.5) { const s = sim.lifeShare(z); assert.ok(s < prev); prev = s; }
});

test('zoom values outside the range, or nonsense, are harmless', () => {
  assert.strictEqual(sim.span(-3), sim.span(0));
  assert.strictEqual(sim.span(99), sim.span(sim.MAX));
  assert.strictEqual(sim.span(NaN), sim.span(0));
  assert.strictEqual(sim.level(-1), 0);
  assert.strictEqual(sim.level(7.6), 8);
  assert.strictEqual(sim.level(100), sim.MAX);
});

test('the paper roll sums used in the captions and notes are right', () => {
  assert.strictEqual(sim.sheets(40), 8, 'Dad as a baby: eight sheets');
  assert.ok(Math.abs(sim.sheets(94) - 19) < 1, 'the bridge: about nineteen sheets');
  assert.ok(Math.abs(sim.rolls(950) - 1) < 0.01, 'castles: one whole roll');
  assert.ok(Math.abs(sim.rolls(4500) - 5) < 0.5, 'pyramids: about five rolls');
  const dino = sim.rolls(66e6);
  assert.ok(dino > 60000 && dino < 80000, 'dinosaurs: tens of thousands of rolls, got ' + dino);
  const earth = sim.rolls(4.54e9);
  assert.ok(earth > 4.5e6 && earth < 5e6, 'the Earth: nearly five million rolls, got ' + earth);
});

test('the caption only talks about a landmark once it is on the line', () => {
  assert.strictEqual(sim.reached(0), 0);
  for (let i = 1; i <= sim.MAX; i++) {
    assert.strictEqual(sim.reached(i), i, 'at its own level');
    assert.strictEqual(sim.reached(i - 0.5), i - 1, 'not yet, half a level before');
  }
  for (let z = 0; z <= sim.MAX; z += 0.05) {
    const r = sim.reached(z);
    assert.ok(sim.pos(sim.LEVELS[r].age, z) <= 1, 'the landmark being described is visible');
  }
  assert.strictEqual(sim.reached(-5), 0);
  assert.strictEqual(sim.reached(50), sim.MAX);
});
