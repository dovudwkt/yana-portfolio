"""Rasterize selected drawing PDFs and re-ink them into one house style:
graphite linework, terracotta for red/orange annotation, warm paper."""
import subprocess, os, sys, json
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PDF = f'{ROOT}/_src/pdf'
RAW = f'{ROOT}/_src/pdfpng'
OUT = f'{ROOT}/site/assets/dwg'
PAPER = np.array((246, 241, 233), np.float32)
INK = np.array((40, 36, 33), np.float32)
ACCENT = np.array((166, 88, 60), np.float32)

SHEETS = {  # key: (pdf basename, page, dpi)
  'sp_furniture': ('dzhona_Чертежи_план_мебели', 1, 110),
  'sp_sockets': ('dzhona_Чертежи_план_розеток', 1, 110),
  'sp_heating': ('dzhona_Чертежи_план_теплого_пола', 1, 110),
  'sp_plumbing': ('dzhona_Чертежи_план_сантехники', 1, 110),
  'sp_switches': ('dzhona_Чертежи_план_выключателей', 1, 110),
  'sp_elev_kitchen': ('dzhona_Чертежи_разрез_кухня', 1, 110),
  'sp_elev_bath': ('dzhona_Чертежи_разрез_ванная', 1, 110),
  'du_floor_hall': ('hanifa_Чертежи_План_пола_в_прихожей_2_5400342653646711865', 1, 220),
  'du_elev_living': ('hanifa_Чертежи_Развертки_гостиная_развертки', 1, 220),
  'du_elev_living2': ('hanifa_Чертежи_Развертки_гостиная_развертки', 2, 220),
  'du_elev_master': ('hanifa_Чертежи_Развертки_мастер_спальня', 1, 220),
  'du_elev_wc': ('hanifa_Чертежи_Развертки_гостевои_туалет_развертки', 1, 220),
  'du_ceiling': ('hanifa_Чертежи_2_план_потолков', 1, 110),
  'du_light': ('hanifa_Чертежи_4_план_потолочного_света', 1, 110),
  'cy_heating': ('anna_heating_floor_2_plans', 1, 110),
  'cy_plan': ('anna_normal_plan', 1, 110),
}

def raster(key, base, page, dpi):
    dst = f'{RAW}/{key}'
    if not os.path.exists(dst + '.png'):
        subprocess.run(['pdftoppm', '-r', str(dpi), '-png', '-singlefile', '-f', str(page), '-l', str(page),
                        f'{PDF}/{base}.pdf', dst], check=True)
    return Image.open(dst + '.png').convert('RGB')

def reink(im, max_side=2400):
    a = np.asarray(im, np.float32) / 255
    mx, mn = a.max(2), a.min(2)
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    S = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # hue in degrees
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    warm = ((h < 35) | (h > 315)) & (S > 0.35) & (mx > 0.45)
    alpha = np.clip((1 - L) * 1.15 + S * 0.25, 0, 1)
    alpha = np.where(alpha < 0.06, 0, alpha) ** 0.85
    # pale coloured fills (furniture, tiles) become a light ink tint
    fill = (S > 0.12) & (L > 0.55) & ~warm
    alpha = np.where(fill, np.minimum(alpha, 0.16), alpha)
    col = np.where(warm[..., None], ACCENT, INK)
    alpha = np.where(warm, np.maximum(alpha, 0.85 * S), alpha)
    rgb = PAPER * (1 - alpha[..., None]) + col * alpha[..., None]
    out = Image.fromarray(rgb.astype(np.uint8))
    # crop to content
    m = alpha > 0.15
    ys, xs = np.where(m)
    if len(xs):
        pad = int(0.03 * max(out.size))
        box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, out.width), min(ys.max() + pad, out.height))
        out = out.crop(box)
    s = max_side / max(out.size)
    if s < 1:
        out = out.resize((round(out.width * s), round(out.height * s)), Image.LANCZOS)
    return out

if __name__ == '__main__':
    os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]
    meta = {}
    for key, (base, page, dpi) in SHEETS.items():
        if only and key not in only: continue
        im = reink(raster(key, base, page, dpi))
        im.save(f'{OUT}/{key}.webp', quality=80, method=6)
        meta[key] = im.size
        print(key, im.size, os.path.getsize(f'{OUT}/{key}.webp') // 1024, 'KB')
