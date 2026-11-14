#!/usr/bin/env python3
"""Rebuild the shelf (index.html) and the offline file list (sw.js) from the guides.

Run after changing any published file: python3 big-questions/tools/build_shelf.py
It copies each guide's cover art and title onto the shelf, lists every script and
stylesheet the pages load, and derives the offline version from the release content.
"""
import os, re, hashlib
from pathlib import Path

# Work the same way from the repository root or from big-questions/.
os.chdir(Path(__file__).resolve().parents[1])

guides = sorted(d for d in os.listdir('guides') if os.path.exists(f'guides/{d}/index.html'))
books, files, seen = [], [], set()
def add(p):
    if p not in seen:
        seen.add(p); files.append(p)
for p in ['./', 'index.html', 'shared/base.css', 'shared/kit.js', 'shared/cast.js']:
    add(p)
for d in guides:
    page = f'guides/{d}/index.html'
    s = open(page).read()
    title = re.search(r'<h1>(.*?)</h1>', s).group(1)
    svg = re.search(r'<a class="cover-art".*?(<svg .*?</svg>)', s, re.S).group(1)
    svg = re.sub(r'viewBox="0 0 300 240"', 'viewBox="0 30 300 190"', svg, count=1)
    assert 'viewBox="0 30 300 190"' in svg, f'{d}: cover must use viewBox "0 0 300 240"'
    svg = '\n'.join('    ' + ln.strip() for ln in svg.strip().splitlines())
    books.append(f'  <a class="book" href="{page}">\n{svg}\n    {title}\n  </a>')
    add(f'guides/{d}/'); add(page)
    for ref in re.findall(r'(?:src|href)="([^"#:]+\.(?:js|css))"', s):
        path = os.path.normpath(os.path.join(f'guides/{d}', ref))
        assert os.path.exists(path), path
        add(path)

shelf = open('index.html').read()
a = shelf.index('<!-- the shelf'); a = shelf.index('\n', a) + 1
b = shelf.index('</main>')
open('index.html', 'w').write(shelf[:a] + '\n'.join(books) + '\n' + shelf[b:])

sw = open('sw.js').read()
a = sw.index('var FILES = ['); b = sw.index('];', a) + 2
rows, row = [], '  '
for f in files:
    item = "'" + f + "', "
    if len(row) + len(item) > 100:
        rows.append(row.rstrip()); row = '  '
    row += item
rows.append(row.rstrip().rstrip(','))
sw = sw[:a] + 'var FILES = [\n' + '\n'.join(rows) + '\n];' + sw[b:]
# Hash the actual release, including worker logic, rather than the wall clock.
# Consecutive edits in the same minute must not reuse an offline cache.
digest = hashlib.sha256()
for f in files:
    path = Path(f)
    if path.is_dir():
        path /= 'index.html'
    digest.update(f.encode() + b'\0' + path.read_bytes() + b'\0')
digest.update(re.sub(r"var VERSION = '[^']+';", "var VERSION = '';", sw).encode())
stamp = 'bq-' + digest.hexdigest()[:16]
sw = re.sub(r"var VERSION = '[^']+';", f"var VERSION = '{stamp}';", sw)
open('sw.js', 'w').write(sw)
print(f'{len(guides)} guides on the shelf; {len(files)} files cached offline; version {stamp}')
