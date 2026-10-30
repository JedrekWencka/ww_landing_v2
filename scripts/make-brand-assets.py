#!/usr/bin/env python3
"""Regenerates public/wordmark.png and public/w-mark.png (black outline on transparent)
from the original logo files. Needs: pip install pillow numpy
Run from the project root:  python3 scripts/make-brand-assets.py
"""
from PIL import Image
import numpy as np

# --- single-line wordmark from the stacked WHITE / WATER logo
src = Image.open("logo/WHITEWATER - AFTERLIFE (2).jpg").convert("RGB")
alpha = np.clip((np.asarray(src).astype(float)[:, :, 2] / 255.0 - 0.08) / 0.6, 0, 1)
rows = (alpha > 0.3).sum(axis=1)
ys = np.where(rows > 0)[0]
y0, y1 = ys.min(), ys.max()
mid = (y0 + y1) // 2
gap = min(range(mid - 60, mid + 60), key=lambda y: rows[y])


def line(a, b):
    sub = alpha[a:b]
    cols = np.where((sub > 0.3).sum(axis=0) > 0)[0]
    sub = sub[:, cols.min(): cols.max() + 1]
    r = np.where((sub > 0.3).sum(axis=1) > 0)[0]
    return sub[r.min(): r.max() + 1]


l1, l2 = line(y0, gap), line(gap, y1 + 1)
h = max(l1.shape[0], l2.shape[0])
gapw = int(h * 0.45)
canvas = np.zeros((h, l1.shape[1] + gapw + l2.shape[1]))
canvas[(h - l1.shape[0]) // 2:(h - l1.shape[0]) // 2 + l1.shape[0], : l1.shape[1]] = l1
canvas[(h - l2.shape[0]) // 2:(h - l2.shape[0]) // 2 + l2.shape[0], l1.shape[1] + gapw:] = l2


def save(mask, path, width):
    height = round(mask.shape[0] * width / mask.shape[1])
    im = Image.fromarray((mask * 255).astype("uint8")).resize((width, height), Image.LANCZOS)
    out = Image.new("RGBA", (width + 8, height + 8), (22, 22, 22, 0))
    layer = Image.new("RGBA", im.size, (22, 22, 22, 0))
    layer.putalpha(im)
    out.paste(layer, (4, 4))
    out.save(path, optimize=True)


save(canvas, "public/wordmark.png", 1400)

# --- the W mark (white on black JPG -> black on transparent)
w = np.clip((np.asarray(Image.open("public/logo.jpg").convert("L")).astype(float) / 255 - 0.1) / 0.7, 0, 1)
cols = np.where((w > 0.3).sum(axis=0) > 0)[0]
rws = np.where((w > 0.3).sum(axis=1) > 0)[0]
save(w[rws.min(): rws.max() + 1, cols.min(): cols.max() + 1], "public/w-mark.png", 220)
