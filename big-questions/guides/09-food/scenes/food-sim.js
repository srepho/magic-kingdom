/* The journey — rules only (no DOM), so they can be tested in Node.
 *
 * Each food has a list of stops from the farm (first) to the plate at home (last).
 * A single number t (0 = farm, 1 = home) says how far along the road the food is.
 * She scrubs t with her finger; when she lets go it settles on the nearest stop.
 * At each stop the food has the form it really has there, and one caption.
 */
(function (root) {
  'use strict';

  /* at: the kind of place.  form: what the food looks like there.  say: caption, 15 words or fewer. */
  var JOURNEYS = {
    bread: { origin: 'plant', stops: [
      { at: 'farm', form: 'wheat', say: 'Bread starts as wheat, a <b>crop</b> growing on a <b>farm</b>.' },
      { at: 'mill', form: 'flour', say: 'At the mill, the wheat seeds are crushed into flour.' },
      { at: 'bakery', form: 'loaf', say: 'At the bakery, flour and water are mixed and baked into bread.' },
      { at: 'truck', form: 'loaf', say: 'A truck carries the bread to the shop, early in the morning.' },
      { at: 'shop', form: 'loaf', say: 'At the shop, the bread waits on a shelf for you.' },
      { at: 'home', form: 'slice', say: 'Toast! Slide it back along the road. Where did it come from?' }
    ] },
    milk: { origin: 'animal', stops: [
      { at: 'farm', form: 'cow', say: 'Milk comes from cows. A farmer milks them every day on a <b>farm</b>.' },
      { at: 'factory', form: 'bottle', say: 'At the <b>factory</b>, milk is heated to make it safe, then bottled.' },
      { at: 'truck', form: 'bottle', cold: true, say: 'A cold truck keeps the milk fresh on the way.' },
      { at: 'shop', form: 'bottle', say: 'At the shop, the milk waits in the fridge.' },
      { at: 'home', form: 'glass', say: 'A glass of milk! Slide it back. Where did it come from?' }
    ] },
    egg: { origin: 'animal', stops: [
      { at: 'farm', form: 'hen', say: 'Eggs are laid by hens. Hens live on a <b>farm</b>.' },
      { at: 'shed', form: 'carton', say: 'In the packing shed, eggs are checked and put in cartons.' },
      { at: 'truck', form: 'carton', say: 'A truck carries the cartons, very gently.' },
      { at: 'shop', form: 'carton', say: 'At the shop, the eggs wait on a shelf.' },
      { at: 'home', form: 'eggcup', say: 'A boiled egg! Slide it back. Where did it come from?' }
    ] },
    apple: { origin: 'plant', stops: [
      { at: 'farm', form: 'tree', say: 'Apples grow on trees. A farm full of fruit trees is an orchard.' },
      { at: 'shed', form: 'applebox', say: 'In the packing shed, apples are washed, sorted and packed in boxes.' },
      { at: 'truck', form: 'applebox', cold: true, say: 'A truck carries the boxes of apples to town.' },
      { at: 'shop', form: 'apple', say: 'At the shop, the apples wait in a big pile.' },
      { at: 'home', form: 'apple', say: 'An apple! Slide it back. Where did it come from?' }
    ] },
    chips: { origin: 'plant', stops: [
      { at: 'farm', form: 'potato', say: 'Chips start as potatoes, a <b>crop</b> that grows under the ground!' },
      { at: 'factory', form: 'cutchips', say: 'At the <b>factory</b>, potatoes are washed, peeled, cut into chips and frozen.' },
      { at: 'truck', form: 'chipbag', cold: true, say: 'A freezer truck keeps the chips frozen.' },
      { at: 'shop', form: 'chipbag', say: 'At the shop, the bag of chips waits in the freezer.' },
      { at: 'home', form: 'chips', say: 'Hot chips! Slide them back. Where did they come from?' }
    ] }
  };
  var ORDER = ['bread', 'milk', 'egg', 'apple', 'chips'];
  var SPEED = 1.6;                     // how fast the food settles, in road-lengths per second

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  function create() {
    var s = { food: 'bread', t: 1, target: 1, held: false, seen: {} };

    function stops() { return JOURNEYS[s.food].stops; }
    function count() { return stops().length; }
    function index() { return Math.round(s.t * (count() - 1)); }
    function here() { return stops()[index()]; }
    function mark() { s.seen[s.food + ':' + index()] = true; }

    function choose(food) {
      if (!JOURNEYS[food]) return false;
      s.food = food; s.t = s.target = 1; s.held = false; mark();
      return true;
    }
    function hold(t) { s.held = true; s.t = s.target = clamp01(+t || 0); mark(); }
    function release() {
      if (!s.held) return;
      s.held = false; s.target = index() / (count() - 1);
    }
    function goTo(i) {
      i = Math.max(0, Math.min(count() - 1, Math.round(+i || 0)));
      s.held = false; s.target = i / (count() - 1);
    }
    function tick(dt) {
      if (s.held || s.t === s.target) return;
      var step = SPEED * dt, d = s.target - s.t;
      s.t = Math.abs(d) <= step ? s.target : s.t + (d > 0 ? step : -step);
      mark();
    }
    function reset() { s.seen = {}; choose('bread'); }
    function farmsSeen() {
      return ORDER.filter(function (f) { return s.seen[f + ':0']; }).length;
    }

    reset();
    return { state: s, choose: choose, hold: hold, release: release, goTo: goTo, tick: tick, reset: reset,
             stops: stops, count: count, index: index, here: here, farmsSeen: farmsSeen };
  }

  var api = { create: create, JOURNEYS: JOURNEYS, ORDER: ORDER };
  root.BQ = root.BQ || {};
  root.BQ.foodSim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
