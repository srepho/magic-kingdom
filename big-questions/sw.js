/* Big Questions — offline support. After the first visit everything here opens with no network.
 * Serves from the cache straight away and refreshes the cached copy in the background,
 * so a change shows up on the visit after next. Bump VERSION when files are added or renamed. */
var VERSION = 'bq-2026-11-14-1950';
var FILES = [
  './', 'index.html', 'shared/base.css', 'shared/kit.js', 'shared/cast.js', 'guides/01-made-of/',
  'guides/01-made-of/index.html', 'guides/01-made-of/scenes/warmth-sim.js',
  'guides/01-made-of/scenes/warmth-toy.js', 'guides/01-made-of/scenes/opening.js',
  'guides/01-made-of/scenes/puddle.js', 'guides/01-made-of/scenes/kettle.js', 'guides/02-money/',
  'guides/02-money/index.html', 'guides/02-money/scenes/market-sim.js',
  'guides/02-money/scenes/market.js', 'guides/02-money/scenes/picnic.js',
  'guides/02-money/scenes/jar.js', 'guides/03-in-charge/', 'guides/03-in-charge/index.html',
  'guides/03-in-charge/scenes/town-sim.js', 'guides/03-in-charge/scenes/town.js',
  'guides/03-in-charge/scenes/hands.js', 'guides/03-in-charge/scenes/levels.js',
  'guides/04-australia/', 'guides/04-australia/index.html',
  'guides/04-australia/scenes/story-sim.js', 'guides/04-australia/scenes/ausmap.js',
  'guides/04-australia/scenes/story.js', 'guides/04-australia/scenes/beach.js',
  'guides/04-australia/scenes/sea.js', 'guides/05-people/', 'guides/05-people/index.html',
  'guides/05-people/scenes/tree-sim.js', 'guides/05-people/scenes/tree.js',
  'guides/05-people/scenes/family.js', 'guides/05-people/scenes/generations.js',
  'guides/05-people/scenes/spread.js', 'guides/06-long-ago/', 'guides/06-long-ago/index.html',
  'guides/06-long-ago/scenes/long-ago-sim.js', 'guides/06-long-ago/scenes/pics.js',
  'guides/06-long-ago/scenes/timeline.js', 'guides/06-long-ago/scenes/candles.js',
  'guides/06-long-ago/scenes/roll.js', 'guides/07-where-are-we/',
  'guides/07-where-are-we/index.html', 'guides/07-where-are-we/scenes/where-sim.js',
  'guides/07-where-are-we/scenes/atlas.js', 'guides/07-where-are-we/scenes/zoom.js',
  'guides/07-where-are-we/scenes/balloon.js', 'guides/07-where-are-we/scenes/globe.js',
  'guides/07-where-are-we/scenes/parade.js', 'guides/08-inside-me/',
  'guides/08-inside-me/index.html', 'guides/08-inside-me/scenes/body-sim.js',
  'guides/08-inside-me/scenes/body.js', 'guides/08-inside-me/scenes/inside.js',
  'guides/08-inside-me/scenes/hello.js', 'guides/08-inside-me/scenes/bones.js',
  'guides/08-inside-me/scenes/boss.js', 'guides/09-food/', 'guides/09-food/index.html',
  'guides/09-food/scenes/food-art.js', 'guides/09-food/scenes/food-sim.js',
  'guides/09-food/scenes/journey.js', 'guides/09-food/scenes/breakfast.js',
  'guides/09-food/scenes/farm.js', 'guides/09-food/scenes/sandwich.js', 'guides/10-day-night/',
  'guides/10-day-night/index.html', 'guides/10-day-night/scenes/daynight-sim.js',
  'guides/10-day-night/scenes/draw.js', 'guides/10-day-night/scenes/spin.js',
  'guides/10-day-night/scenes/ball.js', 'guides/10-day-night/scenes/other.js',
  'guides/10-day-night/scenes/shadow.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('bq-') === 0 && k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var fresh = fetch(e.request).then(function (res) {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || fresh;
    });
  }));
});
