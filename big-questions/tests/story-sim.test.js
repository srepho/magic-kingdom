/* Run: node --test big-questions/tests/story-sim.test.js
 * Checks the story of Australia keeps its promises: First peoples first and always present,
 * 1788 not the first contact, two honest time scales, and plain words. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const s = require('../guides/04-australia/scenes/story-sim.js');
const words = t => t.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;

test('the long view really is long: everything since 1788 is a hair-thin line', () => {
  const width = 1 - s.place(s.NOW - s.BRITISH, 0);
  assert.ok(width < 0.005, 'fraction of the strip: ' + width);
  assert.ok(width > 0, 'but it is there');
  assert.strictEqual(s.span(0), 65000);
});

test('the close view stretches that line across most of the strip', () => {
  assert.ok(Math.abs(s.span(1) - 430) < 1e-9);
  const width = 1 - s.place(s.NOW - s.BRITISH, 1);
  assert.ok(width > 0.5 && width < 0.6, 'fraction: ' + width);
  // zooming is smooth and one-way
  let last = Infinity;
  for (let z = 0; z <= 1.0001; z += 0.05) { const v = s.span(z); assert.ok(v < last); last = v; }
});

test('a moment keeps its place when you find it again', () => {
  for (const z of [0, 0.3, 1]) for (const u of [0, 0.25, 0.8, 1]) {
    assert.ok(Math.abs(s.place(s.agoAt(u, z), z) - u) < 1e-9);
  }
  assert.strictEqual(s.place(0, 0), 1);
  assert.strictEqual(s.place(1e9, 0), 0);
});

test('1788 is not the first contact: a Dutch ship and the Makassan boats came earlier', () => {
  assert.ok(s.DUTCH < s.BOATS[0] && s.BOATS[0] < s.BRITISH);
  assert.deepStrictEqual(s.ships(1606), { dutch: true, boats: false, british: false });
  assert.deepStrictEqual(s.ships(1650), { dutch: false, boats: false, british: false });
  assert.deepStrictEqual(s.ships(1750), { dutch: false, boats: true, british: false });
  assert.deepStrictEqual(s.ships(1788), { dutch: false, boats: true, british: true });
  assert.deepStrictEqual(s.ships(1950), { dutch: false, boats: false, british: false });
  // the visitors left again; only the British stayed, as towns
  assert.ok(s.TOWNS.every(t => t.from >= s.BRITISH));
  assert.strictEqual(s.TOWNS[0].name, 'Sydney');
});

test('the story is told in order, and starts with the First peoples, not with ships', () => {
  assert.strictEqual(s.moment(65000, 0), 'deep');
  assert.strictEqual(s.moment(30000, 0), 'many');
  assert.strictEqual(s.moment(10000, 0), 'care');
  assert.strictEqual(s.moment(1000, 0), 'first');
  assert.strictEqual(s.moment(100, 0), 'line');
  const close = y => s.moment(s.NOW - y, 1);
  assert.deepStrictEqual([1600, 1620, 1750, 1790, 1850, 1990, 2026].map(close),
    ['stretch', 'dutch', 'boats', 'british', 'took', 'back', 'today']);
  for (const k of ['deep', 'many', 'care', 'first']) assert.ok(!/ship|boat|Brit/i.test(s.SAY[k]), k);
});

test('every caption is 15 words or fewer, and at most three terms are taught', () => {
  Object.entries(s.SAY).forEach(([k, t]) => assert.ok(words(t) <= 15, `${k}: ${words(t)} words`));
  const bold = new Set(Object.values(s.SAY).flatMap(t => [...t.matchAll(/<b>(.*?)<\/b>/g)].map(m => m[1].toLowerCase())));
  assert.ok(bold.size <= 3, [...bold].join(', '));
});

test('the hard part is said plainly, in the brief\'s words, and in the present tense today', () => {
  assert.match(s.SAY.took, /took land that was already someone's home/);
  assert.match(s.SAY.took, /hurt the people living there/);
  assert.match(s.SAY.today, /are still here/);
  assert.match(s.SAY.today, /are alive/);
});

test('before 1788 no Country is touched; afterwards colonisation spreads from Sydney', () => {
  assert.ok(s.TILES.length > 100, 'many Countries: ' + s.TILES.length);
  assert.ok(s.TILES.every(t => s.taken(t, 1787) === 0 && s.colour(t, 1787) === 1));
  const near = s.TILES.reduce((a, t) => Math.hypot(t.lon - 151.2, t.lat + 33.9) < Math.hypot(a.lon - 151.2, a.lat + 33.9) ? t : a);
  const far = s.TILES.reduce((a, t) => Math.hypot(t.lon - 125, t.lat + 25) < Math.hypot(a.lon - 125, a.lat + 25) ? t : a);
  assert.ok(s.taken(near, 1800) > 0.5);
  assert.strictEqual(s.taken(far, 1800), 0);
  assert.ok(s.taken(far, 1930) > 0.9);
  const frac = y => s.TILES.filter(t => s.taken(t, y) > 0.5).length / s.TILES.length;
  assert.ok(frac(1820) < frac(1860) && frac(1860) < frac(1900));
});

test('the First peoples are never shown as gone, and some land comes back', () => {
  for (const y of [1788, 1850, 1900, 1950, 2000, 2026]) {
    assert.ok(s.TILES.every(t => s.colour(t, y) >= 0.28 && s.colour(t, y) <= 1), 'year ' + y);
  }
  const sum = y => s.TILES.reduce((a, t) => a + s.colour(t, y), 0);
  assert.ok(sum(2026) > sum(1970), 'more colour today than in 1970');
  assert.ok(sum(2026) < sum(1787), 'but not as it was');
});

test('the sea: low in the ice age, joined to Tasmania and New Guinea; today as it is', () => {
  assert.strictEqual(s.lowSea(0), 0);
  assert.strictEqual(s.lowSea(5000), 0);
  assert.strictEqual(s.lowSea(20000), 1);
  assert.ok(s.lowSea(12000) > 0 && s.lowSea(12000) < 1);
  assert.ok(s.lowSea(65000) > 0.5);
  for (let a = 0; a < 20000; a += 500) assert.ok(s.lowSea(a + 500) >= s.lowSea(a));
});

test('the map: Sydney is on the mainland east coast, Hobart in Tasmania, the islands in the strait', () => {
  assert.ok(s.inside([150.5, -33.5], s.MAINLAND));
  assert.ok(s.inside([147, -42.5], s.TASMANIA));
  assert.ok(!s.inside([147, -39.8], s.MAINLAND), 'Bass Strait is sea today');
  assert.ok(s.inside([147, -39.8], s.SHELF[0]), 'and was land when the sea was low');
  assert.strictEqual(s.TILES.filter(t => t.island).length, 2);
  assert.ok(s.px(151.2) > s.px(115.9) && s.py(-33.9) > s.py(-12.5));
});
