#!/usr/bin/env python3
"""
Project card previews.

01.webp for each project — the photograph the card shows — cut from the
photoreal renders in public/img/. The drawing plates behind it (02..04) come
from tools/render.py and are untouched by this script.

    python3 tools/make-previews.py

services/visualization.webp is a composite sheet, so several previews are cut
out of different cells of it. Everything is cropped to 4:3 to match the
case-study stage, with the subject kept central so the card crops (3/4 through
5/3, see src/styles/projects.css) all hold.
"""

import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "public", "img")
OUT_W, OUT_H = 1600, 1200          # 4:3, the case-study stage ratio

# slug -> (source, crop box in source pixels or None for the whole image, note)
PREVIEWS = [
    # Rathinapuri's story is the finish — borrowed daylight, warm off-white
    # plaster, teak where a hand touches it. An interior carries that better
    # than another street shot.
    # Dropped below the false ceiling: the point here is the window and the
    # evening light coming through it, not the ceiling detail.
    ("rathinapuri-residence", "interiors/ceiling.webp", (330, 348, 1230, 1023),
     "warm plaster and borrowed evening light"),
    ("courtyard-house", "services/visualization.webp", (0, 0, 612, 466),
     "two storeys with deep shaded balconies, at dusk"),
    ("loft-living-room", "services/interiors.webp", (0, 120, 1254, 1060),
     "the long living volume, cove lighting, the tall media wall"),
    ("mak-complex-interiors", "interiors/visitors.webp", (196, 0, 1476, 941),
     "the seating group a visitor meets first"),
    # This project IS the photoreal render, so it gets the strongest one: a
    # villa at dusk, which is exactly the deliverable the case study describes.
    # It previously showed a white-ground technical cutaway, which read as a
    # drawing rather than as the thing the client signed off.
    ("saravanampatti-villa", "services/architecture.webp", (0, 150, 1254, 1090),
     "the villa at dusk — photoreal, before a brick was laid"),
    ("peelamedu-apartment", "interiors/kitchen.webp", (196, 0, 1476, 941),
     "the modular run, the one place the money went into finish"),
]


def fit(im, w, h):
    """Cover-crop to the target ratio, then resize."""
    sw, sh = im.size
    ar = w / h
    tw, th = (sw, sw / ar) if sw / ar <= sh else (sh * ar, sh)
    im = im.crop((round((sw - tw) / 2), round((sh - th) / 2),
                  round((sw + tw) / 2), round((sh + th) / 2)))
    return im.resize((w, h), Image.LANCZOS)


def main():
    for slug, src, box, note in PREVIEWS:
        im = Image.open(os.path.join(IMG, src)).convert("RGB")
        if box:
            im = im.crop(box)
        im = fit(im, OUT_W, OUT_H)
        out = os.path.join(IMG, "projects", slug, "01.webp")
        im.save(out, "WEBP", quality=82, method=6)
        print("  %-24s %-34s %5.0f KB   %s"
              % (slug, src.split("/")[-1], os.path.getsize(out) / 1024, note))


if __name__ == "__main__":
    main()
