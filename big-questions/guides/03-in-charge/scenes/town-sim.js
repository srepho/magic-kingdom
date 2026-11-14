/* The town — rules only (no DOM), so they can be tested in Node.
 *
 * Seven townsfolk each like one of two candidates' plans. With no leader, nothing can be
 * decided: asking everyone just makes noise. An election counts the votes and the candidate
 * with the most becomes leader. The leader then decides each thing the town needs, their own
 * way, without asking again. Another election can choose someone new; what was built stays.
 */
(function (root) {
  'use strict';
  var NEEDS = ['playground', 'bench', 'tree', 'bin', 'fountain', 'lamp'];
  var SLOTS = 6;                       // room for six things on each side of town
  var START = [0, 1, 0, 1, 1, 0, 0];   // who likes which candidate at the start: 4 against 3

  function create(opts) {
    var prefs = (opts && opts.prefs) || START;
    if (prefs.length % 2 === 0) throw new Error('an odd number of voters, so there is never a tie');
    var s = {};

    function reset() {
      s.voters = prefs.map(function (p) { return { pref: p }; });
      s.leader = null; s.tally = [0, 0]; s.built = []; s.need = 0;
      s.jams = 0; s.decisions = 0; s.elections = 0;
    }
    function count(side) { return s.built.filter(function (b) { return b.side === side; }).length; }
    function nextNeed() { return s.built.length >= SLOTS * 2 ? null : NEEDS[s.need % NEEDS.length]; }

    /* a townsperson changes their mind */
    function flip(i) { var v = s.voters[i]; if (!v) return null; v.pref = 1 - v.pref; return v.pref; }

    /* the town needs the next thing. Who decides? */
    function ask() {
      var what = nextNeed();
      if (!what) return { type: 'none' };
      if (s.leader === null) { s.jams++; return { type: 'jam', what: what }; }
      var side = count(s.leader) < SLOTS ? s.leader : 1 - s.leader;   // no room left on their side
      var slot = count(side);
      s.built.push({ what: what, side: side, slot: slot, by: s.leader });
      s.need++; s.decisions++;
      return { type: 'built', what: what, side: side, slot: slot, by: s.leader };
    }

    /* everyone votes for the candidate they like; most votes wins */
    function vote() {
      var before = s.leader, t = [0, 0];
      s.voters.forEach(function (v) { t[v.pref]++; });
      s.tally = t; s.leader = t[0] > t[1] ? 0 : 1;
      s.decisions = 0; s.elections++;
      return { tally: t.slice(), leader: s.leader, first: before === null, changed: before !== null && before !== s.leader };
    }

    reset();
    return { state: s, reset: reset, flip: flip, ask: ask, vote: vote, nextNeed: nextNeed, count: count };
  }

  var api = { create: create, NEEDS: NEEDS, SLOTS: SLOTS, START: START };
  root.BQ = root.BQ || {};
  root.BQ.townSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
