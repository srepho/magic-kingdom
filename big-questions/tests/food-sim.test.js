/* Run: node --test big-questions/tests/food-sim.test.js
 * Checks the promises the food journey makes: every food starts at a farm as a plant or an
 * animal and ends on the plate, the road can be scrubbed both ways, and nothing she does breaks it. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/09-food/scenes/food-sim.js');

const FORMS = ['wheat', 'flour', 'loaf', 'slice', 'cow', 'bottle', 'glass', 'hen', 'carton', 'eggcup',
  'tree', 'applebox', 'apple', 'potato', 'cutchips', 'chipbag', 'chips'];
const PLACES = ['farm', 'mill', 'bakery', 'factory', 'shed', 'truck', 'shop', 'home'];
const words = html => html.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;

test('every food starts on a farm as a plant or an animal and ends at home', () => {
  assert.deepStrictEqual(Object.keys(sim.JOURNEYS).sort(), sim.ORDER.slice().sort());
  for (const food of sim.ORDER) {
    const j = sim.JOURNEYS[food];
    assert.ok(j.origin === 'plant' || j.origin === 'animal', food);
    assert.strictEqual(j.stops[0].at, 'farm', food);
    assert.strictEqual(j.stops[j.stops.length - 1].at, 'home', food);
    assert.ok(j.stops.some(s => s.at === 'truck') && j.stops.some(s => s.at === 'shop'), food + ' travels');
  }
  // invariant: animal foods are exactly the ones that come from a cow or a hen
  assert.deepStrictEqual(sim.ORDER.filter(f => sim.JOURNEYS[f].origin === 'animal'), ['milk', 'egg']);
});

test('every stop is a known place, has a drawable form and a caption of 15 words or fewer', () => {
  for (const food of sim.ORDER) for (const s of sim.JOURNEYS[food].stops) {
    assert.ok(PLACES.includes(s.at), food + ' ' + s.at);
    assert.ok(FORMS.includes(s.form), food + ' ' + s.form);
    assert.ok(words(s.say) > 0 && words(s.say) <= 15, `${food}/${s.at}: ${words(s.say)} words`);
  }
});

test('captions teach at most three bold terms across the whole toy', () => {
  const terms = new Set();
  for (const food of sim.ORDER) for (const s of sim.JOURNEYS[food].stops) {
    for (const m of s.say.matchAll(/<b>(.*?)<\/b>/g)) terms.add(m[1].toLowerCase());
  }
  assert.ok(terms.size <= 3, [...terms].join(', '));
});

test('it starts on the plate; sliding all the way back reaches the farm', () => {
  const m = sim.create();
  assert.strictEqual(m.here().at, 'home');
  m.hold(0);
  assert.strictEqual(m.here().at, 'farm');
  assert.strictEqual(m.here().form, 'wheat');
});

test('scrubbing passes every stop in order, and comes back the same way', () => {
  for (const food of sim.ORDER) {
    const m = sim.create(); m.choose(food);
    const back = [], fwd = [];
    for (let t = 1; t >= -0.001; t -= 0.01) { m.hold(t); if (back[back.length - 1] !== m.index()) back.push(m.index()); }
    for (let t = 0; t <= 1.001; t += 0.01) { m.hold(t); if (fwd[fwd.length - 1] !== m.index()) fwd.push(m.index()); }
    const all = [...Array(m.count()).keys()];
    assert.deepStrictEqual(back, all.slice().reverse(), food);
    assert.deepStrictEqual(fwd, all, food);
  }
});

test('letting go settles exactly on the nearest stop and stays there', () => {
  const m = sim.create(); m.choose('milk');           // 5 stops: 0, .25, .5, .75, 1
  m.hold(0.31); m.release();
  for (let i = 0; i < 200; i++) m.tick(1 / 60);
  assert.strictEqual(m.state.t, 0.25);
  assert.strictEqual(m.here().at, 'factory');
  m.tick(5);
  assert.strictEqual(m.state.t, 0.25);
});

test('while her finger is down the food does not drift', () => {
  const m = sim.create();
  m.hold(0.47); m.tick(3);
  assert.strictEqual(m.state.t, 0.47);
});

test('tapping a stop sends the food there without overshooting', () => {
  const m = sim.create(); m.choose('chips');
  m.goTo(0);
  let prev = m.state.t;
  for (let i = 0; i < 300; i++) { m.tick(1 / 60); assert.ok(m.state.t <= prev && m.state.t >= 0); prev = m.state.t; }
  assert.strictEqual(m.state.t, 0);
  assert.strictEqual(m.here().form, 'potato');
});

test('out-of-range and nonsense input is harmless', () => {
  const m = sim.create();
  m.hold(-5); assert.strictEqual(m.state.t, 0);
  m.hold(99); assert.strictEqual(m.state.t, 1);
  m.hold(NaN); assert.strictEqual(m.state.t, 0);
  m.goTo(-3); m.tick(10); assert.strictEqual(m.index(), 0);
  m.goTo(42); m.tick(10); assert.strictEqual(m.index(), m.count() - 1);
  m.goTo('x'); m.tick(10); assert.strictEqual(m.index(), 0);
  assert.strictEqual(m.choose('unicorn'), false);
  assert.strictEqual(m.state.food, 'bread');
  m.release();                       // release with no finger down
  m.tick(0); m.tick(-1);
  assert.ok(Number.isFinite(m.state.t));
});

test('choosing a food puts it back on the plate; reset forgets what was seen', () => {
  const m = sim.create();
  m.hold(0); assert.strictEqual(m.farmsSeen(), 1);
  m.choose('egg');
  assert.strictEqual(m.state.t, 1);
  assert.strictEqual(m.here().form, 'eggcup');
  m.goTo(0); m.tick(10);
  assert.strictEqual(m.farmsSeen(), 2);
  m.reset();
  assert.strictEqual(m.farmsSeen(), 0);
  assert.strictEqual(m.state.food, 'bread');
  assert.strictEqual(m.here().at, 'home');
});
