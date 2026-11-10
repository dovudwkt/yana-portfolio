"""Restyle the re-inked drawings (_src/dwg_paper, made by reink.py) for the site:
transparent sheet, graphite lines, terracotta accent. Writes site/assets/dwg."""
import os, glob
import numpy as np
from PIL import Image
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, '_src', 'dwg_paper')
OUT = os.path.join(ROOT, 'site', 'assets', 'dwg')
os.makedirs(OUT, exist_ok=True)
INK = np.array([42, 38, 35], float)
ACC = np.array([146, 74, 49], float)
for f in sorted(glob.glob(f'{SRC}/*.webp')):
    im = Image.open(f).convert('RGB')
    a = np.asarray(im, float)
    paper = np.median(a[:40, :40].reshape(-1, 3), axis=0)
    d = np.clip((paper - a) / paper, 0, 1).max(axis=2)
    alpha = np.clip(d * 1.5, 0, 1)
    warm = ((a[..., 0] - a[..., 2]) > 55) & (d > .25)
    rgb = np.where(warm[..., None], ACC, INK)
    out = Image.fromarray(np.dstack([rgb, alpha * 255]).astype('uint8'), 'RGBA')
    name = os.path.basename(f)[:-5]
    for suffix, m in (('', 2200), ('-s', 1000)):
        o = out.copy(); o.thumbnail((m, m), Image.LANCZOS)
        o.save(f'{OUT}/{name}{suffix}.webp', quality=86, method=3)
    print(name, out.size)
