/* Run: node --test big-questions/tests/tree-sim.test.js
 * Checks the family tree says only true things: who is closer to whom, that it is a tree
 * and not a ladder, and that people are not given a special place. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const t = require('../guides/05-people/scenes/tree-sim.js');
const age = (a, b) => t.meet(a, b).age;
const names = t.tips.map(n => n.name);

test('twelve living things, each a tip, none an ancestor of another', () => {
  assert.strictEqual(names.length, 12);
  assert.strictEqual(new Set(names).size, 12);
  t.tips.forEach(n => { assert.strictEqual(n.age, 0); assert.strictEqual(n.kids.length, 0); });
  // every join has at least two branches and no name: ancestors are not living animals
  t.nodes.filter(n => n.kids.length).forEach(n => { assert.ok(n.kids.length >= 2); assert.strictEqual(n.name, undefined); });
});

test('people are one tip among many: not first, not last, not in the middle', () => {
  const i = names.indexOf('person');
  assert.ok(i > 0 && i < names.length - 1);
  assert.ok(i !== names.length / 2 && i !== names.length / 2 - 1, 'position ' + i);
});

test('people and chimps are cousins: neither comes from the other', () => {
  const m = t.meet('person', 'chimp');
  assert.ok(m.age > 0);
  assert.ok(m !== t.tip('chimp') && m !== t.tip('person'));
  assert.strictEqual(t.kin(m.age), 'close cousins');
});

test('closeness is nested the way biology says', () => {
  const order = ['chimp', 'dog', 'kangaroo', 'platypus', 'kookaburra', 'frog', 'fish', 'bee', 'mushroom', 'gum tree'];
  for (let i = 1; i < order.length; i++) {
    assert.ok(age('person', order[i]) > age('person', order[i - 1]), `${order[i]} is further than ${order[i - 1]}`);
  }
  // birds and lizards are closer to each other than either is to a mammal
  assert.ok(age('lizard', 'kookaburra') < age('lizard', 'dog'));
  assert.strictEqual(age('kookaburra', 'person'), age('lizard', 'kangaroo'));
  // mushrooms are closer to animals than to plants
  assert.ok(age('mushroom', 'bee') < age('mushroom', 'gum tree'));
  // a dog is as far from a kangaroo as a person is: no ladder
  assert.strictEqual(age('dog', 'kangaroo'), age('person', 'kangaroo'));
  assert.strictEqual(age('chimp', 'fish'), age('person', 'fish'));
});

test('any two living things meet somewhere, the same either way round', () => {
  for (const a of names) for (const b of names) {
    const m = t.meet(a, b);
    assert.ok(m, `${a} / ${b}`);
    assert.strictEqual(m, t.meet(b, a));
    if (a === b) assert.strictEqual(m.age, 0); else assert.ok(m.age > 0);
  }
  assert.strictEqual(t.meet('person', 'unicorn'), null);
  assert.strictEqual(age('gum tree', 'person'), t.OLDEST);
});

test('older joins are always deeper; a join is older than everything under it', () => {
  t.nodes.forEach(n => { if (n.parent) assert.ok(n.parent.age > n.age); });
});

test('tips sit left to right in the order the tree is walked, so no branches cross', () => {
  t.tips.forEach((n, i) => assert.strictEqual(n.x, i));
  t.nodes.filter(n => n.kids.length).forEach(n => {
    const xs = t.line(n)[0].kids.map(k => k.x);
    assert.ok(n.x >= Math.min(...xs) && n.x <= Math.max(...xs));
  });
});

test('the time strip runs from 0 (today) to 1 (the oldest join) and back again', () => {
  assert.strictEqual(t.scale(0), 0);
  assert.strictEqual(t.scale(t.OLDEST), 1);
  let last = -1;
  for (const a of [0, 1, 6.5, 66, 95, 320, 700, 1500]) { const u = t.scale(a); assert.ok(u > last); last = u; }
  for (const a of [6.5, 160, 430, 1300]) assert.ok(Math.abs(t.unscale(t.scale(a)) - a) < 1e-6);
  assert.strictEqual(t.scale(-5), 0);
  assert.strictEqual(t.scale(1e9), 1);
});

test('the words for kinship', () => {
  assert.strictEqual(t.kin(age('person', 'dog')), 'cousins');
  assert.strictEqual(t.kin(age('person', 'frog')), 'distant cousins');
  assert.strictEqual(t.kin(age('person', 'gum tree')), 'very distant cousins');
});
