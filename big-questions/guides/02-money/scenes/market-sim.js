/* The market — rules only (no DOM), so they can be tested in Node.
 *
 * Three stallholders. Each has one thing and wants one thing, in a ring:
 * nobody wants what the person who wants THEIR thing has. So every direct swap jams.
 * Turn coins on and every trade works, because everyone accepts coins.
 * Coins are never created or lost while they are on: they only move.
 */
(function (root) {
  'use strict';
  var CAST = [
    { who: 'wombat', has: 'apple', wants: 'bread' },
    { who: 'koala', has: 'bread', wants: 'fish' },
    { who: 'frog', has: 'fish', wants: 'apple' }
  ];
  var START_COINS = 2, FULL_FOR = 8;      // seconds someone stays happy after getting what they wanted

  function create() {
    var s = { coinsOn: false, folk: [], trades: 0, jams: 0 };

    function reset() {
      s.coinsOn = false; s.trades = 0; s.jams = 0;
      s.folk = CAST.map(function (c) { return { who: c.who, has: c.has, wants: c.wants, coins: 0, fed: 0 }; });
    }
    /* i holds out their own thing to j, hoping for a swap */
    function offer(i, j) {
      var a = s.folk[i], b = s.folk[j];
      if (i === j || !a || !b) return { type: 'none' };
      if (b.wants === a.has && a.wants === b.has) {
        a.fed = b.fed = FULL_FOR; s.trades++;
        return { type: 'swap' };
      }
      s.jams++;
      // whoever would end up with something they do not want says no
      return { type: 'jam', refuser: b.wants === a.has ? i : j };
    }
    /* i hands a coin to j and gets j's thing. Works whatever i wanted: money buys anything. */
    function pay(i, j) {
      var a = s.folk[i], b = s.folk[j];
      if (!s.coinsOn || i === j || !a || !b) return { type: 'none' };
      if (a.coins < 1) return { type: 'broke' };
      a.coins--; b.coins++; s.trades++;
      var liked = a.wants === b.has;
      if (liked) a.fed = FULL_FOR;
      return { type: 'buy', good: b.has, liked: liked };
    }
    function setCoins(on) {
      s.coinsOn = !!on;
      s.folk.forEach(function (f) { f.coins = on ? START_COINS : 0; });
    }
    function tick(dt) { s.folk.forEach(function (f) { f.fed = Math.max(0, f.fed - dt); }); }
    function totalCoins() { return s.folk.reduce(function (n, f) { return n + f.coins; }, 0); }

    reset();
    return { state: s, reset: reset, offer: offer, pay: pay, setCoins: setCoins, tick: tick, totalCoins: totalCoins };
  }

  var api = { create: create, START_COINS: START_COINS };
  root.BQ = root.BQ || {};
  root.BQ.marketSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
