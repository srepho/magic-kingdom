#!/usr/bin/env python3
"""Draw the home-screen icons (a blue question mark on cream paper) with no dependencies.

Run once, or after changing the design:   python3 big-questions/tools/make_icons.py
Then run tools/build_shelf.py so the offline list picks up the new files.
"""
import math, struct, zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'icons'
PAPER, INK, DOT = (251, 246, 227), (47, 111, 181), (255, 138, 92)
CX, CY, R, T = 0.5, 0.39, 0.17, 0.092          # the hook of the question mark: centre, radius, thickness

def colour(x, y):
    """Colour at a point in the unit square. Content stays inside the middle 70% (safe for masks)."""
    if math.hypot(x - 0.5, y - 0.80) < 0.062:
        return DOT
    d = math.hypot(x - CX, y - CY)
    a = math.degrees(math.atan2(y - CY, x - CX)) % 360          # 0 right, 90 down, 180 left, 270 up
    if abs(d - R) < T / 2 and (a >= 180 or a <= 90):
        return INK
    if math.hypot(x - (CX - R), y - CY) < T / 2:                 # round start of the hook
        return INK
    if abs(x - 0.5) < T / 2 and CY + R <= y <= 0.655:            # the stem
        return INK
    if math.hypot(x - 0.5, y - 0.655) < T / 2:                   # its round end
        return INK
    return PAPER

def render(size, ss=3):
    rows = []
    n = size * ss
    cache = [[colour((i + 0.5) / n, (j + 0.5) / n) for i in range(n)] for j in range(n)]
    for py in range(size):
        row = bytearray([0])                                     # PNG filter: none
        for px in range(size):
            r = g = b = 0
            for j in range(ss):
                line = cache[py * ss + j]
                for i in range(ss):
                    c = line[px * ss + i]; r += c[0]; g += c[1]; b += c[2]
            k = ss * ss
            row += bytes((r // k, g // k, b // k))
        rows.append(bytes(row))
    return b''.join(rows)

def png(size):
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    head = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)    # 8-bit RGB
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', head) + chunk(b'IDAT', zlib.compress(render(size), 9)) + chunk(b'IEND', b'')

OUT.mkdir(exist_ok=True)
for size in (180, 192, 512):
    (OUT / f'icon-{size}.png').write_bytes(png(size))
    print('wrote', f'icons/icon-{size}.png')
