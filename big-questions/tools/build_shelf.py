#!/usr/bin/env python3
"""Rebuild the shelf (index.html) and the offline file list (sw.js) from the guides.

Run from big-questions/ after adding a guide or a file:   python3 tools/build_shelf.py
It copies each guide's cover art and title onto the shelf, lists every script and
stylesheet the pages load, and bumps the offline cache version so devices pick up the change.
"""
import os, re, datetime

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
stamp = datetime.datetime.now().strftime('bq-%Y-%m-%d-%H%M')
sw = re.sub(r"var VERSION = '[^']+';", f"var VERSION = '{stamp}';", sw)
open('sw.js', 'w').write(sw)
print(f'{len(guides)} guides on the shelf; {len(files)} files cached offline; version {stamp}')
