#!/usr/bin/env python3
"""
Draw the project plates.

    python3 tools/render.py all              # every project
    python3 tools/render.py p3               # just the Loft

Each project has a plates_<id>.py module holding its three plate functions, and
writes public/img/projects/<slug>/02..04.webp — 01 is the perspective
view, drawn by render_views.py. The drawings are generated, not
photographed — see tools/plate_kit.py for the primitives and for CORE, the
region that survives every card crop in src/styles/projects.css.
"""
import importlib, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from plate_kit import Plate

PROJECTS = [
    ("p1", "rathinapuri-residence"),
    ("p2", "courtyard-house"),
    ("p3", "loft-living-room"),
    ("p4", "mak-complex-interiors"),
    ("p5", "saravanampatti-villa"),
    ("p6", "peelamedu-apartment"),
]

args = sys.argv[1:] or ["all"]
if args[0] == "all":
    todo = PROJECTS
elif len(args) == 2:
    todo = [(args[0], args[1])]
else:
    todo = [p for p in PROJECTS if p[0] == args[0]]
    if not todo:
        sys.exit("unknown project %r — try one of %s or 'all'"
                 % (args[0], ", ".join(p[0] for p in PROJECTS)))

for mod, slug in todo:
    out = os.path.join(HERE, "..", "public", "img", "projects", slug)
    os.makedirs(out, exist_ok=True)
    m = importlib.import_module("plates_" + mod)
    print(slug)
    for i, fn in enumerate(m.PLATES, 2):
        pl = Plate()
        fn(pl)
        p = pl.save(os.path.join(out, "%02d.webp" % i))
        print("  %s  %5.0f KB" % (os.path.basename(p), os.path.getsize(p) / 1024))
