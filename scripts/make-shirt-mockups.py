"""Placeholder T-shirt photos for the shop: a flat shirt with album artwork printed on the chest.
Run: python3 scripts/make-shirt-mockups.py   (needs Pillow). Replace the output in public/shop/ with real photos later."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np, os

S, W = 3, 1000                       # supersampling, canvas size (px at 1x)
BG = (214, 214, 214)
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def shirt_mask():
    m = Image.new("L", (W * S, W * S), 0)
    d = ImageDraw.Draw(m)
    pts = [(395, 150), (440, 205), (500, 222), (560, 205), (605, 150), (765, 190), (905, 340), (815, 400),
           (748, 335), (752, 870), (248, 870), (252, 335), (185, 400), (95, 340), (235, 190)]
    d.polygon([(x * S, y * S + 0) for x, y in pts], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(7 * S)).point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(1.2 * S))
    return m

def make(name, base, art_file, crop, out):
    mask = shirt_mask()
    arr = np.zeros((W * S, W * S, 3), np.float32)
    arr[:] = base
    yy, xx = np.mgrid[0:W * S, 0:W * S].astype(np.float32) / S
    # soft lighting: lighter chest, darker sides and hem, gentle vertical folds
    shade = 1.0 - 0.10 * (np.abs(xx - 500) / 250) ** 2 - 0.06 * np.clip((yy - 700) / 170, 0, 1)
    folds = 0.03 * np.sin(xx / 38.0 + yy / 190.0) * np.clip((yy - 300) / 300, 0, 1)
    sleeve = np.where((xx < 250) | (xx > 750), 0.92, 1.0)
    lit = np.clip(shade + folds, 0.6, 1.1) * sleeve
    arr *= lit[..., None]
    shirt = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    # collar: inner neckline darker, rib lighter
    layer = Image.new("RGBA", shirt.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([(395 * S, 120 * S), (605 * S, 232 * S)], fill=tuple(int(c * 0.55) for c in base) + (255,))
    d.arc([(395 * S, 120 * S), (605 * S, 232 * S)], 0, 180, fill=tuple(min(255, int(c * 1.25 + 14)) for c in base) + (255,), width=7 * S)
    shirt.paste(layer, (0, 0), layer)

    # print on the chest
    art = Image.open(os.path.join(root, art_file)).convert("RGB")
    if crop:
        art = art.crop(crop)
    side = 330
    art = art.resize((side * S, int(side * S * art.height / art.width)), Image.LANCZOS)
    ax, ay = 500 * S - art.width // 2, 330 * S
    a = Image.fromarray((np.array(art).astype(np.float32) * 0.96).astype(np.uint8))
    # ink sits in the fabric: follow the folds a little
    shirt.paste(a, (ax, ay))
    for_blend = Image.fromarray(np.clip(arr * 0 + 255 * (lit[..., None] ** 1.6), 0, 255).astype(np.uint8))
    region = shirt.crop((ax, ay, ax + a.width, ay + a.height))
    mult = ImageChops.multiply(region, for_blend.crop((ax, ay, ax + a.width, ay + a.height)))
    shirt.paste(Image.blend(region, mult, 0.55), (ax, ay))

    # on a grey backdrop with a soft shadow
    canvas = Image.new("RGB", shirt.size, BG)
    shadow = Image.new("L", shirt.size, 0)
    shadow.paste(mask.point(lambda v: int(v * 0.35)), (12 * S, 16 * S))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20 * S))
    canvas.paste(Image.new("RGB", shirt.size, (60, 60, 60)), (0, 0), shadow)
    canvas.paste(shirt, (0, 0), mask)
    canvas.resize((1000, 1000), Image.LANCZOS).save(os.path.join(root, "public", "shop", out), quality=88, optimize=True)
    print("wrote", out)

make("black", (22, 22, 22), "public/afterlife.jpg", None, "shirt-black.jpg")
make("white", (246, 246, 244), "public/gallery/album/IMG_6036.jpg", (0, 200, 1191, 1400), "shirt-white.jpg")
