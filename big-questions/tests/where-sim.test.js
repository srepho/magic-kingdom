/* Run: node --test big-questions/tests/where-sim.test.js
 * Checks the promises the zoom makes: home never jumps, each picture really sits inside
 * the next, and the geography and planet facts are the right way round. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('../guides/07-where-are-we/scenes/where-sim.js');

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} ${a} vs ${b}`);

test('six places, in order, each inside the next', () => {
  assert.deepStrictEqual(sim.LEVELS.map(l => l.name), ['home', 'street', 'city', 'country', 'earth', 'space']);
  for (let i = 1; i < sim.LEVELS.length; i++) {
    const { anchor, ratio } = sim.LEVELS[i];
    assert.ok(ratio > 1, 'the smaller place is smaller');
    assert.ok(anchor.x > 0 && anchor.x < sim.VW && anchor.y > 0 && anchor.y < sim.VH, 'anchor is on the picture');
  }
});

test('at a whole step the picture is shown plain: full size, centred', () => {
  for (let L = 0; L < sim.TOP; L++) {
    const fr = sim.frame(L);
    assert.strictEqual(fr.lower, L);
    near(fr.k0, 1, 1e-9, 'scale');
    near(fr.at.x, sim.C.x, 1e-6); near(fr.at.y, sim.C.y, 1e-6);
    assert.strictEqual(fr.fade, 1);
  }
  const top = sim.frame(sim.TOP);
  near(top.k1, 1, 1e-9, 'space picture at natural size');
  assert.strictEqual(top.fade, 0);
});

test('the zoom is continuous across every step: no jump in scale or place', () => {
  for (let L = 1; L < sim.TOP; L++) {
    const below = sim.frame(L - 1e-7), above = sim.frame(L + 1e-7);
    near(below.k1, 1, 1e-4, 'arriving picture reaches natural size');
    near(above.k0, 1, 1e-4, 'and carries on from there');
    const a = sim.homeOnScreen(L - 1e-7), b = sim.homeOnScreen(L + 1e-7);
    near(a.x, b.x, 0.01, 'home x'); near(a.y, b.y, 0.01, 'home y');
  }
});

test('home stays on the screen and moves smoothly the whole way out and back', () => {
  let prev = sim.homeOnScreen(0);
  near(prev.x, sim.C.x, 1e-6); near(prev.y, sim.C.y, 1e-6);
  for (let z = 0; z <= sim.TOP; z += 0.01) {
    const h = sim.homeOnScreen(z);
    assert.ok(h.x >= 0 && h.x <= sim.VW && h.y >= 0 && h.y <= sim.VH, `on screen at ${z}`);
    assert.ok(Math.hypot(h.x - prev.x, h.y - prev.y) < 12, `no jump at ${z}`);
    prev = h;
  }
  const back = sim.homeOnScreen(0);
  near(back.x, sim.C.x, 1e-6);
});

test('the scale only ever shrinks on the way out', () => {
  let last = Infinity;
  for (let z = 0; z <= sim.TOP; z += 0.05) {
    const fr = sim.frame(z);
    // overall scale of home: product of the steps already passed and the current one
    let k = fr.k0;
    for (let i = 1; i <= fr.lower; i++) k /= sim.LEVELS[i].ratio;
    assert.ok(k <= last * (1 + 1e-9), `shrinks at ${z}`);
    last = k;
  }
});

test('zoom values outside the range are clamped, never broken', () => {
  for (const z of [-3, 99, NaN]) {
    const fr = sim.frame(Number.isNaN(z) ? 0 : z);
    assert.ok(Number.isFinite(fr.k1) && Number.isFinite(fr.at.x));
  }
  assert.strictEqual(sim.clampZ(-1), 0);
  assert.strictEqual(sim.clampZ(9), sim.TOP);
  assert.strictEqual(sim.nearest(2.6), 3);
});

test('globe: the middle of the view lands in the middle, the far side is hidden', () => {
  const mid = sim.project(134, -27, 134, -27);
  near(mid.x, 0, 1e-12); near(mid.y, 0, 1e-12); near(mid.z, 1, 1e-12);
  assert.ok(sim.project(134 - 180, 27, 134, -27).z < -0.99, 'opposite side of the Earth');
  const p = sim.project(20, 50, 134, -27);
  assert.ok(Math.hypot(p.x, p.y) <= 1 + 1e-9, 'everything lies within the disc');
});

test('Sydney is south of the equator, on the east side of Australia, facing us', () => {
  assert.ok(sim.SYDNEY.lat < 0);
  const s = sim.project(sim.SYDNEY.lon, sim.SYDNEY.lat, sim.VIEW.lon, sim.VIEW.lat);
  assert.ok(s.z > 0, 'visible');
  assert.ok(s.x > 0, 'east (right) of the middle of Australia');
  assert.ok(s.y > 0, 'south (down) of the middle of Australia');
  // and inside the rough outline of Australia: east of the west coast, west of the east coast
  const aus = sim.LANDS.find(l => l.name === 'Australia').pts;
  const lons = aus.map(p => p[0]), lats = aus.map(p => p[1]);
  assert.ok(sim.SYDNEY.lon > Math.min(...lons) && sim.SYDNEY.lon <= Math.max(...lons));
  assert.ok(sim.SYDNEY.lat > Math.min(...lats) && sim.SYDNEY.lat < Math.max(...lats));
});

test('Australia is in the southern half and the equator view shows it below the middle', () => {
  const aus = sim.LANDS.find(l => l.name === 'Australia');
  assert.ok(aus.pts.every(p => p[1] < 0), 'all of Australia is south of the equator');
  const fromEquator = sim.project(134, -27, 134, 0);
  assert.ok(fromEquator.y > 0, 'drawn below the equator');
});

test('coastline data is sane', () => {
  for (const land of sim.LANDS) {
    assert.ok(land.dense.length >= land.pts.length, land.name);
    for (const [lon, lat] of land.dense) {
      assert.ok(lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90, land.name);
    }
  }
});

test('eight planets in the right order, Earth third, Jupiter biggest, Sun far bigger', () => {
  assert.deepStrictEqual(sim.PLANETS.map(p => p.name),
    ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']);
  assert.strictEqual(sim.PLANETS[2].name, 'Earth');
  assert.strictEqual(sim.PLANETS[2].size, 1);
  const biggest = sim.PLANETS.reduce((a, b) => (a.size > b.size ? a : b));
  assert.strictEqual(biggest.name, 'Jupiter');
  assert.ok(sim.SUN_SIZE > biggest.size * 9);
  // orbits grow outward and every planet sits on the space picture
  for (let i = 0; i < 8; i++) {
    if (i) assert.ok(sim.ORBITS[i] > sim.ORBITS[i - 1]);
    const s = sim.planetSpot(i);
    assert.ok(s.x > 0 && s.x < sim.VW && s.y > 0 && s.y < sim.VH, sim.PLANETS[i].name);
  }
  // the zoom's last step lands exactly on Earth
  const e = sim.planetSpot(2), a = sim.LEVELS[5].anchor;
  near(a.x, e.x, 1e-9); near(a.y, e.y, 1e-9);
});
