'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function element() {
  const listeners = new Map(), attrs = {}, classes = new Set();
  return {
    dataset: {}, hidden: false, style: { setProperty() {} },
    classList: { add: c => classes.add(c), remove: c => classes.delete(c),
      toggle(c, on) { if (on) classes.add(c); else classes.delete(c); } },
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    emit(type, props = {}) {
      const e = { pointerId: 1, clientX: 10, clientY: 10, button: 0, preventDefault() {}, ...props };
      for (const fn of listeners.get(type) || []) fn(e);
    },
    getBoundingClientRect: () => ({ left: 0, top: 0, height: 72 }),
    setAttribute(k, v) { attrs[k] = v; }, getAttribute: k => attrs[k],
    setPointerCapture() {}, releasePointerCapture() {},
    appendChild() {}, querySelector: () => element()
  };
}
function setup(hash = '') {
  const window = element(), document = element(), raf = new Map(), timers = new Map();
  let clock = 0, next = 0;
  const buttons = ['home', 'toy', 'reset', 'sound'].map(act => Object.assign(element(), { dataset: { act } }));
  const cap = element(), bar = element(), hold = element();
  hold.dataset.hold = '#grown';
  bar.querySelector = () => cap;
  bar.querySelectorAll = () => buttons;
  const parts = ['cover', 'toy', 'grown'].map(part => Object.assign(element(), { dataset: { part } }));
  Object.assign(document, { hidden: false, body: element(), documentElement: element(),
    createElement: () => bar,
    querySelectorAll: selector => selector === '[data-part]' ? parts : [hold],
    querySelector(selector) {
      if (!/^\[data-part="[a-z]+"\]$/.test(selector)) throw new SyntaxError('Invalid selector');
      return parts.find(p => selector.includes('"' + p.dataset.part + '"'));
    }
  });
  Object.assign(window, { location: { hash, protocol: 'file:' }, matchMedia: () => ({ matches: false }) });
  const ctx = vm.createContext({ window, document, navigator: {}, performance: { now: () => clock },
    requestAnimationFrame(fn) { raf.set(++next, fn); return next; }, cancelAnimationFrame: id => raf.delete(id),
    setTimeout(fn) { timers.set(++next, fn); return next; }, clearTimeout: id => timers.delete(id) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../shared/kit.js'), 'utf8'), ctx);
  return { BQ: window.BQ, window, document, raf, timers, hold, buttons, parts,
    time: t => { clock = t; },
    init: () => window.BQ.frame.init({ shelf: '../../index.html', scenes: {} }) };
}

test('a second finger cannot move, release, or replace the active drag', () => {
  const { BQ } = setup(), el = element(), calls = [];
  BQ.touch(el, { down: () => calls.push('down'), move: () => calls.push('move'), up: () => calls.push('up'), tap: () => calls.push('tap') });
  el.emit('pointerdown');
  el.emit('pointerdown', { pointerId: 2 });
  el.emit('pointermove', { pointerId: 2 });
  el.emit('pointerup', { pointerId: 2 });
  assert.deepEqual(calls, ['down']);
  el.emit('pointerup');
  assert.deepEqual(calls, ['down', 'up', 'tap']);
});

test('cancel and lost capture release a hold without tapping or committing a drop', () => {
  const { BQ } = setup(), el = element(), calls = [];
  BQ.touch(el, { up: () => calls.push('drop'), tap: () => calls.push('tap'), cancel: () => calls.push('cancel') });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    el.emit('pointerdown'); el.emit(type); el.emit('pointerup');
  }
  assert.deepEqual(calls, ['cancel', 'cancel']);
});

test('tab hiding and blur release held controls; disposal removes listeners', () => {
  const { BQ, window, document } = setup(), el = element();
  let releases = 0, taps = 0;
  const off = BQ.touch(el, { up: () => releases++, tap: () => taps++ });
  el.emit('pointerdown'); window.emit('blur', { pointerId: undefined });
  el.emit('pointerdown'); document.hidden = true; document.emit('visibilitychange');
  el.emit('pointerdown'); off();
  el.emit('pointerdown'); el.emit('pointerup');
  assert.equal(releases, 3); assert.equal(taps, 0);
});

test('right clicks, non-primary touches, long holds and distant releases are not taps', () => {
  const { BQ, time } = setup(), el = element();
  let taps = 0, downs = 0;
  BQ.touch(el, { down: () => downs++, tap: () => taps++ });
  el.emit('pointerdown', { button: 2 }); el.emit('pointerup');
  el.emit('pointerdown', { isPrimary: false }); el.emit('pointerup');
  assert.equal(downs, 0);
  el.emit('pointerdown'); time(500); el.emit('pointerup');
  el.emit('pointerdown'); el.emit('pointerup', { clientX: 100 });
  assert.equal(taps, 0);
  el.emit('pointerdown'); el.emit('pointerup'); assert.equal(taps, 1);
});

test('loops do not start or resume while hidden and can stop inside a tick', () => {
  const { BQ, document, raf } = setup();
  document.hidden = true;
  const loop = BQ.loop(() => loop.pause());
  loop.resume(); assert.equal(raf.size, 0);
  document.hidden = false; document.emit('visibilitychange'); assert.equal(raf.size, 1);
  const fn = [...raf.values()][0]; raf.clear(); fn(100);
  assert.equal(raf.size, 0);
  loop.destroy(); document.emit('visibilitychange'); assert.equal(raf.size, 0);
});

test('unknown and malformed fragments fall back to the cover', () => {
  for (const hash of ['#missing', '#"]', '#%22', '#constructor']) {
    const env = setup(hash); env.init();
    assert.equal(env.document.body.dataset.at, 'cover');
    assert.equal(env.parts.filter(p => !p.hidden).length, 1);
  }
});

test('home and sound buttons announce their destinations and current action', () => {
  const env = setup(); env.init();
  const [home, , , sound] = env.buttons;
  assert.equal(home.getAttribute('aria-label'), 'All guides');
  assert.equal(sound.getAttribute('aria-label'), 'Turn sound off');
  sound.onclick(); assert.equal(sound.getAttribute('aria-label'), 'Turn sound on');
  env.window.location.hash = '#grown'; env.window.emit('hashchange');
  assert.equal(home.getAttribute('aria-label'), 'Back to cover');
});

test('leaving a cover or hiding the page cancels the grown-up hold timer', () => {
  const env = setup(); env.init();
  env.hold.emit('pointerdown'); assert.equal(env.timers.size, 1);
  env.window.location.hash = '#toy'; env.window.emit('hashchange');
  assert.equal(env.timers.size, 0);
  env.hold.emit('pointerdown'); env.document.hidden = true; env.document.emit('visibilitychange');
  assert.equal(env.timers.size, 0);
  env.hold.emit('keydown', { key: ' ' }); assert.equal(env.window.location.hash, '#grown');
});
