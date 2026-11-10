"""Build web assets: optimized renders (full + small), line sketches, product crops."""
import os, sys, json
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sketch import sketch

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = f'{ROOT}/_src'
IMG = f'{ROOT}/site/assets/img'
PROD = f'{ROOT}/site/assets/prod'

def save(im, path, max_side, q):
    im = im.convert('RGB')
    s = max_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(path, quality=q, method=6)
    return im.size

def renders():
    sizes = {}
    for f in sorted(os.listdir(f'{SRC}/renders')):
        key = f.rsplit('.', 1)[0]
        im = Image.open(f'{SRC}/renders/{f}')
        sizes[key] = save(im, f'{IMG}/{key}.webp', 1920, 78)
        save(im, f'{IMG}/{key}-s.webp', 760, 72)
    json.dump(sizes, open(f'{SRC}/img_sizes.json', 'w'), indent=0)
    print('renders', len(sizes))

def sketches():
    tmp = f'{SRC}/_sk.jpg'
    for key, kw in {'cy_ext_day': dict(width=1600, lo=0.10, hi=0.45, blur=0.9),
                    'du_living_tv': dict(width=1600, lo=0.08, hi=0.40, blur=0.9),
                    'du_hall_3': dict(width=1280, lo=0.08, hi=0.40, blur=0.9)}.items():
        sketch(f'{SRC}/renders/{key}.jpg', tmp, **kw)
        save(Image.open(tmp), f'{IMG}/{key}-line.webp', 1920, 80)
    os.remove(tmp)
    print('sketches ok')

PRODUCTS = {  # key: (file, crop box)
    'sink': ('image5.jpg', (50, 80, 995, 975)),
    'faucet': ('image1.png', (150, 110, 790, 790)),
    'ironing': ('image3.jpg', (0, 150, 800, 800)),
    'rack': ('image6.jpg', (0, 278, 800, 800)),
    'sconce': ('image2.png', (580, 60, 1300, 1500)),
    'mirror': ('image4.png', (0, 0, 1440, 1440)),
}
def products():
    for key, (f, box) in PRODUCTS.items():
        im = Image.open(f'{SRC}/prod/{f}').convert('RGB').crop(box)
        print(key, save(im, f'{PROD}/{key}.webp', 700, 80))

if __name__ == '__main__':
    os.makedirs(IMG, exist_ok=True); os.makedirs(PROD, exist_ok=True)
    what = sys.argv[1:] or ['renders', 'sketches', 'products']
    for w in what: globals()[w]()
