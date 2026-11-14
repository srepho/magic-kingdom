/* Run: node --test big-questions/tests/brief-rules.test.js
 * Guards the brief's rules across every guide, so an edit to one guide cannot quietly break them:
 * the parts each guide must have, captions of 15 words or fewer, at most three taught terms,
 * no links or emoji on child-facing screens, labelled grown-up notes, and home-screen support. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const guides = fs.readdirSync(path.join(root, 'guides')).filter(d => fs.existsSync(path.join(root, 'guides', d, 'index.html'))).sort();
const page = d => fs.readFileSync(path.join(root, 'guides', d, 'index.html'), 'utf8');
const scenes = d => fs.readdirSync(path.join(root, 'guides', d, 'scenes')).filter(f => f.endsWith('.js'))
  .map(f => ({ name: `${d}/scenes/${f}`, text: fs.readFileSync(path.join(root, 'guides', d, 'scenes', f), 'utf8') }));
const words = html => html.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

test('there are ten guides, numbered 01 to 10', () => {
  assert.deepEqual(guides.map(d => d.slice(0, 2)), ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);
});

for (const d of guides) {
  test(`${d}: has a cover, a toy, try-it, wonder-more and held-open grown-up notes`, () => {
    const s = page(d);
    for (const part of ['cover', 'toy', 'tryit', 'wonder', 'grownups']) assert.match(s, new RegExp(`data-part="${part}"`), part);
    assert.match(s, /data-hold="#grownups"/, 'grown-up notes open on press-and-hold');
    assert.match(s, /href="#toy"/, 'the cover opens the toy directly');
    assert.match(s, /scenes:\s*\{[^}]*\btoy:/, 'a toy scene is registered');
    assert.match(s, /<a class="cover-art"[^>]*>\s*<svg viewBox="0 0 300 240"/, 'cover art uses the shelf viewBox');
    const wonder = s.slice(s.indexOf('data-part="wonder"'), s.indexOf('data-part="grownups"'));
    assert.equal((wonder.match(/<li class="card">/g) || []).length, 3, 'three open questions');
  });

  test(`${d}: child-facing screens have no outbound links and no emoji`, () => {
    const s = page(d), child = s.slice(0, s.indexOf('data-part="grownups"'));
    assert.deepEqual(child.match(/href="https?:[^"]*"/g) || [], []);
    assert.doesNotMatch(s, EMOJI, 'page');
    for (const f of scenes(d)) assert.doesNotMatch(f.text, EMOJI, f.name);
  });

  test(`${d}: every caption is 15 words or fewer, and at most three terms are taught`, () => {
    const terms = new Set();
    for (const f of scenes(d)) {
      // any quoted sentence that reaches the caption bar: direct calls, and caption tables
      const quoted = [...f.text.matchAll(/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g)].map(m => m[2].replace(/\\(['"])/g, '$1'));
      const direct = [...f.text.matchAll(/caption\(\s*(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g)].map(m => m[2].replace(/\\(['"])/g, '$1'));
      for (const t of direct) assert.ok(words(t) <= 15, `${f.name}: ${words(t)} words: ${t}`);
      for (const t of quoted) {
        const bold = [...t.matchAll(/<b>(.*?)<\/b>/g)];
        if (!bold.length) continue;
        assert.ok(words(t) <= 15, `${f.name}: ${words(t)} words: ${t}`);
        bold.forEach(m => terms.add(m[1].toLowerCase().replace(/s$/, '')));
      }
    }
    assert.ok(terms.size <= 3, `${terms.size} taught terms: ${[...terms].join(', ')}`);
    assert.ok(terms.size >= 1, 'at least one taught term');
  });

  test(`${d}: grown-up notes label their claims, name the taught words and cite a source`, () => {
    const s = page(d), notes = s.slice(s.indexOf('data-part="grownups"'));
    assert.match(notes, /class="tag fact"/);
    assert.match(notes, /class="tag simp"/);
    assert.match(notes, /Words this guide teaches/);
    assert.match(notes, /href="https:\/\/[^"]+" target="_blank" rel="noopener"/, 'a real source, opening outside the guide');
    assert.doesNotMatch(notes, /href="http:\/\//, 'https only');
  });

  test(`${d}: every script and stylesheet it loads exists, and it can be added to the home screen`, () => {
    const s = page(d);
    for (const [, ref] of s.matchAll(/(?:src|href)="([^"#:]+\.(?:js|css|png|webmanifest))"/g)) {
      assert.ok(fs.existsSync(path.join(root, 'guides', d, ref)), ref);
    }
    assert.match(s, /<link rel="manifest" href="\.\.\/\.\.\/manifest\.webmanifest">/);
    assert.match(s, /<link rel="apple-touch-icon" href="\.\.\/\.\.\/icons\/icon-180\.png">/);
    assert.match(s, /name="apple-mobile-web-app-capable" content="yes"/);
  });
}

test('the home-screen app: manifest is valid, icons are real PNGs of the stated size, and all are cached offline', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.scope, './');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.match(sw, /'manifest\.webmanifest'/);
  for (const icon of [...manifest.icons, { src: 'icons/icon-180.png', sizes: '180x180' }]) {
    const bytes = fs.readFileSync(path.join(root, icon.src));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', icon.src);
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes, icon.src);
    assert.ok(sw.includes(`'${icon.src}'`), icon.src + ' is in the offline list');
  }
  const shelf = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(shelf, /<link rel="manifest" href="manifest\.webmanifest">/);
  assert.equal((shelf.match(/class="book"/g) || []).length, guides.length, 'one cover per guide on the shelf');
});

test('the published folder holds no private notes', () => {
  const ignore = fs.readFileSync(path.join(root, '..', '.gitignore'), 'utf8');
  for (const f of ['big-questions/BRIEF.md', 'big-questions/CLAUDE.md', 'big-questions/FEEDBACK.md']) assert.ok(ignore.includes(f), f);
});
