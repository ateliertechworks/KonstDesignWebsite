#!/usr/bin/env python3
"""
Generate the transparent cloud sprites for the projects section.

  python3 tools/make-clouds.py

Real cloud photographs cut out cleanly are hard to come by and heavy to ship;
soft CSS blobs read as blobs. These are built instead: a silhouette of stacked
puffs, softened, then broken up by multi-octave value noise so the edges wisp
instead of ending on a clean curve. Colour is a vertical ramp — near-white at
the crown, blush in the shadow — matching the reference sky.

Outputs  public/img/clouds/cloud-1..4.webp   (RGBA, transparent)

Requires Pillow:  pip install Pillow
"""

import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'img', 'clouds')

W, H = 1400, 760

# --- (a) CLOUD COLOUR -------------------------------------------------------
# Crown, body and shadow. Lifted from the reference sky: warm blush, never grey.
CROWN = (255, 251, 250)
BODY = (250, 216, 219)
SHADOW = (243, 199, 206)


def value_noise(size, octaves=5, seed=0):
    """Blurred gaussian noise averaged over halving scales — cheap fBm.

    Each octave is folded in as a weighted blend rather than a sum, so the
    result stays centred near mid-grey however many octaves are used.
    """
    from PIL import ImageChops

    rnd = random.Random(seed)
    w, h = size
    acc = None
    weight = 0.0
    amp = 1.0

    for o in range(octaves):
        step = 2 ** o
        grain = Image.effect_noise(
            (max(4, w // (6 * step)), max(4, h // (6 * step))),
            180 + rnd.randint(0, 60),
        )
        layer = grain.resize(size, Image.BICUBIC).filter(
            ImageFilter.GaussianBlur(max(1, 30 // step)))
        acc = layer if acc is None else ImageChops.blend(acc, layer, amp / (weight + amp))
        weight += amp
        amp *= 0.55

    return acc


def mass_field(seed):
    """A density field built from recursively spawned puffs.

    One row of ellipses gives a smear. Real cloud reads as lobes riding on
    lobes, so each blob of one generation seeds smaller blobs around its own
    rim — biased upward, which keeps the crown billowing and the base flatter,
    the way cumulus actually sits.
    """
    rnd = random.Random(seed)
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)

    def blob(cx, cy, r):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)

    # generation 0 — the spine, a shallow arc across the sprite
    gen = []
    for i in range(9):
        t = i / 8
        cx = W * (0.07 + 0.86 * t)
        cy = H * 0.64 - (math.sin(math.pi * t) ** 1.3) * H * 0.17 + rnd.uniform(-12, 12)
        r = H * rnd.uniform(0.12, 0.17) * (0.6 + 0.7 * math.sin(math.pi * t))
        blob(cx, cy, r)
        gen.append((cx, cy, r))

    # generations 1..2 — puffs around each parent's rim
    for count, shrink in ((5, 0.60), (4, 0.56)):
        nxt = []
        for cx, cy, r in gen:
            for _ in range(count):
                # 45% anywhere, the rest in the upper half
                ang = (rnd.uniform(0, math.tau) if rnd.random() < 0.45
                       else rnd.uniform(math.pi * 1.05, math.pi * 1.95))
                dist = r * rnd.uniform(0.55, 1.0)
                nx = cx + math.cos(ang) * dist
                ny = cy + math.sin(ang) * dist
                nr = r * shrink * rnd.uniform(0.75, 1.15)
                blob(nx, ny, nr)
                nxt.append((nx, ny, nr))
        gen = nxt

    return m.filter(ImageFilter.GaussianBlur(H * 0.016))


def build(seed):
    from PIL import ImageChops

    mass = mass_field(seed)
    noise = value_noise((W, H), octaves=5, seed=seed).convert('L')

    # Noise erodes the soft rim into wisps without eating the solid middle.
    eroded = ImageChops.multiply(mass, Image.eval(noise, lambda v: 96 + v * 0.80))
    alpha = Image.eval(eroded, lambda v: max(0, min(255, int((v / 255 - 0.16) * 2.25 * 255))))
    alpha = alpha.filter(ImageFilter.GaussianBlur(4))

    # --- fake lighting ------------------------------------------------------
    # High-pass of the density field against a copy of itself blurred wide and
    # pushed DOWN: every lobe gets a lit crown and a shaded underside, which is
    # the whole difference between cotton and a white smear. 128 is neutral for
    # the soft-light blend below.
    lit = mass.filter(ImageFilter.GaussianBlur(H * 0.012))
    base = ImageChops.offset(mass.filter(ImageFilter.GaussianBlur(H * 0.075)),
                             0, int(H * 0.055))
    detail = ImageChops.subtract(lit, base, scale=1.0, offset=128)
    # Pulled back towards neutral. At full strength the undersides blend down
    # into a saturated maroon rim rather than a shadow.
    detail = Image.eval(detail, lambda v: round(128 + (v - 128) * 0.52))

    # --- colour ramp --------------------------------------------------------
    grad = Image.new('RGB', (W, H))
    gd = ImageDraw.Draw(grad)
    for y in range(H):
        k = (y / (H - 1)) ** 0.85
        if k < 0.5:
            u = k / 0.5
            c = tuple(round(CROWN[i] + (BODY[i] - CROWN[i]) * u) for i in range(3))
        else:
            u = (k - 0.5) / 0.5
            c = tuple(round(BODY[i] + (SHADOW[i] - BODY[i]) * u) for i in range(3))
        gd.line([(0, y), (W, y)], fill=c)

    shaded = ImageChops.soft_light(grad, detail.convert('RGB'))

    out = shaded.convert('RGBA')
    out.putalpha(alpha)
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    for i in range(1, 5):
        img = build(seed=i * 977)
        path = os.path.join(OUT, f'cloud-{i}.webp')
        img.save(path, 'WEBP', quality=88, method=6)
        print(f'  {path}  {os.path.getsize(path) / 1024:.0f} KB')


if __name__ == '__main__':
    main()
