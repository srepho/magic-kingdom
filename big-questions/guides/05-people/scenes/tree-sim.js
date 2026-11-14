/* The family tree of living things — structure only (no DOM), so it can be tested in Node.
 *
 * Twelve living things she knows, and the order in which their family lines join as you go
 * back in time. Ages are in millions of years and are estimates (see notes.md); the shape of
 * the tree is the well-established part.
 *
 * Rules the picture must keep (from the brief):
 *  - a branching tree, never a ladder;
 *  - people are one tip among many: not first, not last, not in the middle;
 *  - no living thing is anyone's ancestor. Ancestors are the joins, and they are not drawn
 *    as any animal alive today.
 */
(function (root) {
  'use strict';
  function T(name) { return { name: name, age: 0, kids: [] }; }
  function N(age, kids) { return { age: age, kids: kids }; }

  var TREE =
    N(1500, [T('gum tree'),
      N(1300, [T('mushroom'),
        N(700, [T('bee'),
          N(430, [T('fish'),
            N(350, [T('frog'),
              N(320, [
                N(180, [
                  N(160, [
                    N(95, [T('dog'), N(6.5, [T('chimp'), T('person')])]),
                    T('kangaroo')]),
                  T('platypus')]),
                N(280, [T('lizard'), T('kookaburra')])])])])])])]);
  var OLDEST = TREE.age;

  var tips = [], nodes = [];
  (function walk(n, parent) {
    n.parent = parent; n.id = nodes.length; nodes.push(n);
    if (!n.kids.length) { n.x = tips.length; tips.push(n); }
    n.kids.forEach(function (k) { walk(k, n); });
    if (n.kids.length) n.x = n.kids.reduce(function (s, k) { return s + k.x; }, 0) / n.kids.length;
  })(TREE, null);

  function tip(name) { for (var i = 0; i < tips.length; i++) if (tips[i].name === name) return tips[i]; return null; }
  function line(n) { var out = []; while (n) { out.push(n); n = n.parent; } return out; }   // a thing and all its ancestors

  /* where two family lines meet: the most recent ancestor they share */
  function meet(a, b) {
    var A = tip(a), B = tip(b);
    if (!A || !B) return null;
    var seen = line(A);
    for (var n = B; n; n = n.parent) if (seen.indexOf(n) >= 0) return n;
    return null;
  }
  function kin(age) {
    return age <= 0 ? 'the same' : age < 10 ? 'close cousins' : age < 200 ? 'cousins' : age < 800 ? 'distant cousins' : 'very distant cousins';
  }
  /* squeeze 1,500 million years onto one strip: 0 is today, 1 is the oldest join */
  function scale(age) { return Math.pow(Math.max(0, Math.min(OLDEST, age)) / OLDEST, 0.4); }
  function unscale(u) { return OLDEST * Math.pow(Math.max(0, Math.min(1, u)), 2.5); }

  var api = { tree: TREE, tips: tips, nodes: nodes, tip: tip, line: line, meet: meet, kin: kin,
              scale: scale, unscale: unscale, OLDEST: OLDEST };
  root.BQ = root.BQ || {};
  root.BQ.treeSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
