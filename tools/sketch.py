"""Turn a render into an ink line drawing on transparent/paper (numpy only)."""
import numpy as np, sys
from PIL import Image, ImageFilter

INK = (43, 39, 36)

def sketch(src, dst, width=1920, paper=(244, 238, 230), lo=0.06, hi=0.30, blur=1.2):
    im = Image.open(src).convert('RGB')
    if im.width != width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    g = np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(blur)), dtype=np.float32) / 255
    # Sobel
    kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], np.float32)
    pad = np.pad(g, 1, mode='edge')
    def conv(k):
        out = np.zeros_like(g)
        for dy in range(3):
            for dx in range(3):
                out += k[dy, dx] * pad[dy:dy + g.shape[0], dx:dx + g.shape[1]]
        return out
    gx, gy = conv(kx), conv(kx.T)
    mag = np.sqrt(gx * gx + gy * gy)
    a = np.clip((mag - lo) / (hi - lo), 0, 1) ** 0.8
    # faint tonal wash so large shapes still read
    wash = np.clip((0.55 - g) * 0.35, 0, 0.18)
    a = np.clip(a + wash, 0, 1)
    p = np.array(paper, np.float32); ink = np.array(INK, np.float32)
    rgb = p * (1 - a[..., None]) + ink * a[..., None]
    Image.fromarray(rgb.astype(np.uint8)).save(dst, quality=82)

if __name__ == '__main__':
    sketch(sys.argv[1], sys.argv[2], **({} if len(sys.argv) < 4 else {'lo': float(sys.argv[3]), 'hi': float(sys.argv[4])}))
