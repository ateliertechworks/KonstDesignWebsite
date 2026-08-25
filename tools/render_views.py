#!/usr/bin/env python3
"""Drawn perspective views — SUPERSEDED.

The card previews (01.webp) are now cut from the photoreal renders in
public/img/ by tools/make-previews.py. Running this script overwrites them
with the drawn versions, which is almost certainly not what you want; it is
kept because the perspective engine in render_kit.py is reusable.

    python3 tools/render_views.py [slug ...]
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from render_kit import Scene
import renders

want = sys.argv[1:] or list(renders.RENDERS)
for slug in want:
    fn = renders.RENDERS[slug]
    out = os.path.join(HERE, "..", "public", "img", "projects", slug)
    os.makedirs(out, exist_ok=True)
    sc = Scene()
    fn(sc)
    p = sc.save(os.path.join(out, "01.webp"))
    print("  %s/01.webp  %5.0f KB" % (slug, os.path.getsize(p) / 1024))
