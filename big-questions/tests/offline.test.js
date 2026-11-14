'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
function worker({ failInstall = false, hit = { body: 'old release' } } = {}) {
  const events = {}, fetched = [], added = [], deleted = [];
  const scope = 'https://example.test/magic-kingdom/big-questions/';
  const cache = {
    async addAll(requests) { added.push(...requests); if (failInstall) throw new Error('Network interrupted'); },
    async match() { return hit; }
  };
  const context = vm.createContext({ URL, Request: class extends Request {
    constructor(url, options) { super(new URL(url, scope), options); }
  }, self: { registration: { scope }, addEventListener: (name, fn) => { events[name] = fn; } },
  caches: { open: async () => cache, keys: async () => ['other-app', 'bq-old', context.VERSION],
    delete: async key => { deleted.push(key); } },
  fetch: async request => { fetched.push(request); return { body: 'network' }; } });
  vm.runInContext(source, context);
  return { context, added, deleted, fetched, scope,
    run(name, extras = {}) {
      let pending;
      events[name]({ waitUntil: p => { pending = p; }, respondWith: p => { pending = p; }, ...extras });
      return pending;
    } };
}

test('offline installation preloads every file with fresh HTTP requests', async () => {
  const w = worker(); await w.run('install');
  assert.equal(w.added.length, w.context.FILES.length);
  assert.ok(w.added.every(r => r.cache === 'reload'));
  for (const f of w.context.FILES) {
    const local = path.join(root, f.endsWith('/') ? f + 'index.html' : f);
    assert.ok(fs.existsSync(local), local);
  }
});

test('an incomplete install rejects instead of activating a partial release', async () => {
  await assert.rejects(worker({ failInstall: true }).run('install'), /Network interrupted/);
});

test('a cached guide stays on one release without background overwrites', async () => {
  const w = worker();
  const response = await w.run('fetch', { request: new Request(w.scope + 'shared/kit.js?v=2') });
  assert.equal(response.body, 'old release'); assert.equal(w.fetched.length, 0);
});

test('unlisted files, other apps, external links and writes bypass the guide cache', () => {
  const w = worker();
  for (const request of [new Request(w.scope + 'notes.md'), new Request('https://example.test/index.html'),
    new Request('https://other.test/shared/kit.js'), new Request(w.scope + 'index.html', { method: 'POST' })]) {
    assert.equal(w.run('fetch', { request }), undefined);
  }
});

test('missing cached entries fall back to the network; activation only deletes old guide caches', async () => {
  const w = worker();
  // Explicit null avoids the helper default used for normal cache hits.
  const missing = worker({ hit: null });
  assert.equal((await missing.run('fetch', { request: new Request(missing.scope + 'index.html') })).body, 'network');
  await w.run('activate'); assert.deepEqual(w.deleted, ['bq-old']);
});

test('shelf builds are reproducible from any directory and change versions when content changes', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bq-build-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const copy = path.join(temp, 'big-questions'); fs.cpSync(root, copy, { recursive: true });
  const build = () => execFileSync('python3', [path.join(copy, 'tools/build_shelf.py')], { cwd: temp });
  const read = file => fs.readFileSync(path.join(copy, file), 'utf8');
  build(); const first = read('sw.js'), shelf = read('index.html');
  build(); assert.equal(read('sw.js'), first); assert.equal(read('index.html'), shelf);
  fs.appendFileSync(path.join(copy, 'shared/kit.js'), '\n// content change\n'); build();
  const version = s => s.match(/var VERSION = '([^']+)'/)[1];
  assert.notEqual(version(read('sw.js')), version(first));
});
