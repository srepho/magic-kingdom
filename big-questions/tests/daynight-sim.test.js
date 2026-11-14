/* Run: node --test big-questions/tests/daynight-sim.test.js
 * Checks the promises the day-and-night guide makes: the Sun never moves, turning the Earth
 * is the only thing that makes day and night, and the sky she sees matches the real one. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const S = require('../guides/10-day-night/scenes/daynight-sim.js');

const deg = r => r / S.RAD;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} got ${a}, wanted ${b}`);
/* the spin that puts a place at a given hour angle */
const spinFor = (place, H) => H - S.hourAngle(place, 0);

test('it starts in the daytime, in the morning', () => {
  const sky = S.sky(S.SYDNEY, 0);
  assert.ok(sky.day);
  assert.ok(sky.H < 0, 'before midday');
  assert.ok(sky.side > 0, 'morning Sun is in the east, on the right when facing north');
});

test('nothing happens unless she turns it', () => {
  const e = S.create();
  for (let i = 0; i < 600; i++) e.tick(1 / 60);
  assert.strictEqual(e.state.spin, 0);
  assert.strictEqual(S.sky(S.SYDNEY, e.state.spin).H, S.sky(S.SYDNEY, 0).H);
});

test('turning the real way: morning, midday, evening, night, morning', () => {
  const start = S.hourAngle(S.SYDNEY, 0);
  let prev = start, crossings = [];
  for (let spin = 0; spin <= S.TAU + 1e-9; spin += S.TAU / 720) {
    const H = S.hourAngle(S.SYDNEY, spin);
    if (prev < 0 && H >= 0 && Math.abs(H) < 1) crossings.push('midday');
    if (Math.cos(prev) > 0 && Math.cos(H) <= 0) crossings.push('sunset');
    if (Math.cos(prev) <= 0 && Math.cos(H) > 0) crossings.push('sunrise');
    prev = H;
  }
  assert.deepStrictEqual(crossings, ['midday', 'sunset', 'sunrise']);
});

test('the Sun rises in the east and sets in the west', () => {
  const rise = S.sky(S.SYDNEY, spinFor(S.SYDNEY, -Math.PI / 2 + 0.01));
  const set = S.sky(S.SYDNEY, spinFor(S.SYDNEY, Math.PI / 2 - 0.01));
  assert.ok(rise.side > 0.9, 'sunrise on the east side');
  assert.ok(set.side < -0.9, 'sunset on the west side');
  near(rise.alt, 0, 0.02, 'on the horizon at sunrise');
});

test('midday Sun over Sydney is 56 degrees up; midnight Sun is as far below', () => {
  near(deg(S.altitude(0, 34)), 56, 0.01);
  near(deg(S.altitude(Math.PI, 34)), -56, 0.01);
  assert.ok(S.sky(S.SYDNEY, spinFor(S.SYDNEY, 0)).light > 0.99);
  assert.ok(S.sky(S.SYDNEY, spinFor(S.SYDNEY, Math.PI)).light < 0.01);
  assert.ok(S.sky(S.SYDNEY, spinFor(S.SYDNEY, Math.PI)).stars > 0.99);
});

test('exactly half of each turn is day and half is night', () => {
  let day = 0; const n = 3600;
  for (let i = 0; i < n; i++) if (S.sky(S.SYDNEY, i * S.TAU / n).day) day++;
  near(day / n, 0.5, 0.002);
});

test('one whole turn is one day: the sky is back where it was', () => {
  const e = S.create();
  e.dragBy(S.TAU);
  assert.strictEqual(e.days(), 1);
  near(S.hourAngle(S.SYDNEY, e.state.spin), S.hourAngle(S.SYDNEY, 0), 1e-9);
  e.dragBy(S.TAU * 2.5);
  assert.strictEqual(e.days(), 3);
});

test('stop the spin and the time of day stays put', () => {
  const e = S.create();
  e.dragBy(1.2); e.release(3);
  for (let i = 0; i < 30; i++) e.tick(1 / 60);
  e.stop();
  const H = S.hourAngle(S.SYDNEY, e.state.spin);
  for (let i = 0; i < 600; i++) e.tick(1 / 60);
  assert.strictEqual(S.hourAngle(S.SYDNEY, e.state.spin), H);
});

test('a flick coasts the real way, slows, and stops by itself', () => {
  const e = S.create();
  e.release(4);
  let last = 0;
  for (let i = 0; i < 60 * 20; i++) { e.tick(1 / 60); assert.ok(e.state.spin >= last); last = e.state.spin; }
  assert.strictEqual(e.state.speed, 0);
  assert.ok(e.state.spin > 1 && e.state.spin < 30);
  e.release(999);
  assert.ok(e.state.speed <= 5, 'speed is capped');
});

test('she can rewind by hand, but the Earth never coasts backwards', () => {
  const e = S.create();
  e.dragBy(-1);
  assert.strictEqual(e.state.spin, -1);
  e.release(-3);
  for (let i = 0; i < 120; i++) e.tick(1 / 60);
  assert.strictEqual(e.state.spin, -1);
  assert.ok(Number.isFinite(S.sky(S.SYDNEY, -1e4).alt));
});

test('when it is day in Sydney it is night on the far side, and the other way round', () => {
  let opposite = 0; const n = 720;
  for (let i = 0; i < n; i++) {
    const spin = i * S.TAU / n;
    if (S.sky(S.SYDNEY, spin).day !== S.sky(S.RIO, spin).day) opposite++;
  }
  assert.ok(opposite / n > 0.9, 'opposite ' + opposite / n);
  assert.ok(!S.sky(S.RIO, spinFor(S.SYDNEY, 0)).day, 'Sydney midday is night in Rio');
});

test('shadows point away from the Sun, are shortest at midday and vanish at night', () => {
  const am = S.shadow(-1.2, 34), noon = S.shadow(0, 34), pm = S.shadow(1.2, 34);
  assert.ok(am.side < 0 && S.sunSide(-1.2) > 0, 'morning Sun east, shadow west');
  assert.ok(pm.side > 0 && S.sunSide(1.2) < 0, 'afternoon Sun west, shadow east');
  assert.ok(noon.length < am.length && noon.length < pm.length);
  near(noon.length, 1 / Math.tan(56 * S.RAD), 1e-6);
  assert.strictEqual(S.shadow(Math.PI, 34), null);
  assert.ok(S.shadow(-Math.PI / 2 + 0.05, 34).length <= 6, 'capped near sunrise');
});

test('the Moon does not cause night: it is up during part of the day too', () => {
  let moonInDay = 0, darkWithNoMoon = 0; const n = 720;
  for (let i = 0; i < n; i++) {
    const k = S.sky(S.SYDNEY, i * S.TAU / n);
    if (k.day && k.moonAlt > 0) moonInDay++;
    if (!k.day && k.moonAlt <= 0) darkWithNoMoon++;
  }
  assert.ok(moonInDay > n / 8, 'the Moon is in the daytime sky for a good while');
  assert.ok(darkWithNoMoon > n / 8, 'and it is night for a good while with no Moon up');
});

test('reset returns to the start', () => {
  const e = S.create();
  e.dragBy(4); e.release(2); e.tick(0.5);
  e.reset();
  assert.deepStrictEqual(e.state, { spin: 0, speed: 0, turned: 0 });
});
