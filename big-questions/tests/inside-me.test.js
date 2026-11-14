/* Run: node --test big-questions/tests/inside-me.test.js
 * Checks the promises the body toy makes: running speeds the heart, resting slows it
 * again, it never goes out of a believable range, and nothing she does can break it. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/08-inside-me/scenes/body-sim.js');

function run(b, seconds, running) {
  b.state.running = running;
  let beats = 0;
  for (let i = 0; i < seconds * 60; i++) beats += b.step(1 / 60);
  return beats;
}

test('at rest the heart keeps beating at a steady resting rate', () => {
  const b = sim.create();
  const beats = run(b, 60, false);
  assert.ok(Math.abs(beats - sim.REST) <= 1, 'about ' + sim.REST + ' beats in a minute, got ' + beats);
  assert.ok(Math.abs(b.state.hr - sim.REST) < 0.001);
});

test('running makes the heart beat faster, straight away and then more', () => {
  const b = sim.create();
  run(b, 1, true);
  assert.ok(b.state.hr > sim.REST + 5, 'already faster after one second: ' + b.state.hr);
  run(b, 14, true);
  assert.ok(b.state.hr > sim.RUN - 3, 'near running pace: ' + b.state.hr);
  assert.ok(b.level() > 0.9);
});

test('it undoes: stop running and the heart settles back to rest', () => {
  const b = sim.create();
  run(b, 15, true);
  run(b, 3, false);
  assert.ok(b.state.hr < sim.RUN - 5 && b.state.hr > sim.REST + 10, 'still coming down: ' + b.state.hr);
  run(b, 60, false);
  assert.ok(Math.abs(b.state.hr - sim.REST) < 1, 'back to rest: ' + b.state.hr);
  assert.ok(Math.abs(b.state.br - sim.REST_BREATH) < 1);
});

test('the heart slows more gently than it speeds up', () => {
  const up = sim.create(); run(up, 4, true);
  const rose = up.level();
  const down = sim.create(); run(down, 60, true); run(down, 4, false);
  const fell = 1 - down.level();
  assert.ok(rose > fell, `rose ${rose.toFixed(2)} in 4s, fell ${fell.toFixed(2)} in 4s`);
});

test('breathing speeds up with running too', () => {
  const b = sim.create();
  run(b, 15, true);
  assert.ok(b.state.br > sim.RUN_BREATH - 3);
});

test('the rates never leave their range, however she mashes the button', () => {
  const b = sim.create();
  let seed = 3;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 4000; i++) {
    b.state.running = rnd() < 0.5;
    b.step(rnd() * 0.2);
    assert.ok(b.state.hr >= sim.REST - 1e-9 && b.state.hr <= sim.RUN + 1e-9, 'hr ' + b.state.hr);
    assert.ok(b.state.br >= sim.REST_BREATH - 1e-9 && b.state.br <= sim.RUN_BREATH + 1e-9);
    assert.ok(b.beat() > 0 && b.beat() <= 1);
    assert.ok(b.breath() >= 0 && b.breath() <= 1);
  }
});

test('faster heart means more beats in the same time', () => {
  const rest = sim.create(), fast = sim.create();
  run(fast, 30, true);
  const a = run(rest, 10, false), c = run(fast, 10, true);
  assert.ok(c > a * 1.4, `${c} beats running against ${a} resting`);
});

test('odd time steps are harmless', () => {
  const b = sim.create();
  assert.strictEqual(b.step(0), 0);
  assert.strictEqual(b.step(-1), 0);
  assert.strictEqual(b.step(NaN), 0);
  assert.ok(b.step(5) >= 7, 'a long pause still counts its beats');
  assert.ok(Number.isFinite(b.state.hr));
});

test('reset returns to a resting heart', () => {
  const b = sim.create();
  run(b, 20, true);
  b.reset();
  assert.strictEqual(b.state.hr, sim.REST);
  assert.strictEqual(b.state.running, false);
  assert.strictEqual(b.state.beats, 0);
  assert.strictEqual(b.level(), 0);
});
