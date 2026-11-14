/* Big Questions — offline support. After the first visit everything here opens with no network.
 * Serves from the cache straight away and refreshes the cached copy in the background,
 * so a change shows up on the visit after next. Bump VERSION when files are added or renamed. */
var VERSION = 'bq-2026-11-14d';
var FILES = [
  './', 'index.html', 'shared/base.css', 'shared/kit.js', 'shared/cast.js',
  'guides/01-made-of/', 'guides/01-made-of/index.html',
  'guides/01-made-of/scenes/warmth-sim.js', 'guides/01-made-of/scenes/warmth-toy.js',
  'guides/01-made-of/scenes/opening.js', 'guides/01-made-of/scenes/puddle.js',
  'guides/01-made-of/scenes/kettle.js',
  'guides/02-money/', 'guides/02-money/index.html',
  'guides/02-money/scenes/market-sim.js',
  'guides/02-money/scenes/market.js', 'guides/02-money/scenes/picnic.js',
  'guides/02-money/scenes/jar.js',
  'guides/03-in-charge/', 'guides/03-in-charge/index.html',
  'guides/03-in-charge/scenes/town-sim.js', 'guides/03-in-charge/scenes/town.js',
  'guides/03-in-charge/scenes/hands.js', 'guides/03-in-charge/scenes/levels.js'
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
