"""Saravanampatti Villa — the decision moved from reading a drawing to looking
at the house."""

import math
from plate_kit import *

PROJECT = "Saravanampatti Villa — Coimbatore"


def plate_01(pl):
    """Axonometric massing — the model the client actually made the call on."""
    pl.grid(); pl.border()

    ax = Axo(742, 838, 25.0)
    ax.grid(pl, -7, -6, 17, 12.8, 2)

    # Drawn back to front: both axes run away from the viewer, so the volumes
    # with the largest x and y are the ones furthest off.
    # boundary cladding — one of the two things the model changed
    ax.box(pl, -7, 12.2, 0, 17, 12.8, 2.4,
           top=mix(CLAY, SAND, 0.3), left=mix(CLAY, CHARCOAL, 0.62),
           right=mix(CLAY, SAND, 0.46))
    ax.box(pl, 16.4, -6, 0, 17, 12.8, 2.4,
           top=mix(CLAY, SAND, 0.3), left=mix(CLAY, CHARCOAL, 0.62),
           right=mix(CLAY, SAND, 0.46))

    ax.box(pl, 0, 0, 0, 14, 10, 7)                                  # ground floor
    ax.box(pl, 9, 0, 7, 14, 10, 7.4,                                # terrace over the setback
           top=mix(SAND, BONE, 0.52), left=mix(SAND, BONE, 0.2),
           right=mix(GRAPHITE, SAND, 0.8))
    ax.box(pl, 0, 0, 7, 9, 10, 13,                                  # first floor, set back
           top=mix(SAND, BONE, 0.2), left=mix(SAND, BONE, -0.08),
           right=mix(GRAPHITE, SAND, 0.66))
    ax.box(pl, -3, 3, 0, 0, 7, 3.4,                                 # entry canopy
           top=mix(SAND, BONE, 0.5), left=mix(SAND, BONE, 0.28),
           right=mix(GRAPHITE, SAND, 0.82))

    glass = mix(GRAPHITE, BONE, 0.18)
    for x0, x1 in ((1.2, 3.2), (4.4, 6.4), (10.6, 13.0)):           # ground, right face
        ax.face_y(pl, x0, x1, 0, 2.2, 5.2, glass, CHARCOAL, 0.9)
    for y0, y1 in ((1.4, 3.4), (7.4, 9.4)):                         # ground, left face
        ax.face_x(pl, 0, y0, y1, 2.2, 5.2, glass, CHARCOAL, 0.9)
    for x0, x1 in ((1.2, 3.4), (4.6, 7.8)):                         # first floor
        ax.face_y(pl, x0, x1, 0, 8.8, 11.8, glass, CHARCOAL, 0.9)
    ax.face_x(pl, 0, 2.0, 5.2, 8.8, 11.8, glass, CHARCOAL, 0.9)

    pl.leader(ax.p(16.4, 2, 2.4), (1200, 690), "Boundary cladding")
    pl.text((1240, 708), "revised after the model", 10.5, INK_SOFT, "lm")
    pl.leader(ax.p(-1.6, 4, 3.2), (300, 792), "Entry court", flip=True)
    pl.leader(ax.p(0, 5, 10.4), (300, 452), "First floor set back", flip=True)
    pl.leader(ax.p(9.4, 0.6, 7.4), (1200, 452), "Terrace over the setback")

    pl.text((742, 972), "4,200 SQ FT — MODELLED FROM THE WORKING DRAWINGS",
            10, INK_MUTE, "mm", track=2.2)

    pl.titleblock("P-01", "Axonometric — massing", "—", PROJECT)


def _villa(pl, box, sky, wall, shade, glass, shadow_run, glow=False):
    """One elevation of the same villa, lit three different ways."""
    x0, y0, x1, y1 = box
    gl = y1 - 26
    pl.rect((x0, y0, x1, y1), fill=sky)
    pl.rect((x0, gl, x1, y1), fill=mix(shade, sky, 0.35))

    bx0, bx1 = x0 + 146, x0 + 498
    # cast shadow, the length of which is the whole point
    if shadow_run:
        pl.poly([(bx1, gl), (bx1 + shadow_run, gl), (bx1 + shadow_run - 26, y1),
                 (bx1 - 26, y1)], fill=mix(shade, sky, 0.55))
    pl.rect((bx0, gl - 96, bx1, gl), fill=wall)
    pl.rect((bx0, gl - 170, bx0 + 214, gl - 96), fill=mix(wall, shade, 0.22))
    pl.rect((bx1 - 96, gl - 138, bx1, gl - 96), fill=mix(wall, shade, 0.4))
    pl.rect((bx0, gl - 176, bx0 + 214, gl - 170), fill=shade)
    pl.rect((bx0, gl - 102, bx1, gl - 96), fill=shade)
    pl.line((x0, gl), (x1, gl), shade, 1.4)

    for wx0, wy0, wx1, wy1 in ((bx0 + 26, gl - 156, bx0 + 88, gl - 116),
                               (bx0 + 116, gl - 156, bx0 + 178, gl - 116),
                               (bx0 + 26, gl - 74, bx0 + 118, gl - 16),
                               (bx0 + 250, gl - 74, bx0 + 312, gl - 16)):
        if glow:                                   # light spilling onto the wall
            for k, t in ((9, 0.84), (4, 0.66)):
                pl.rect((wx0 - k, wy0 - k, wx1 + k, wy1 + k), fill=mix(CLAY_SOFT, sky, t))
        pl.rect((wx0, wy0, wx1, wy1), fill=glass)
        pl.rect((wx0, wy0, wx1, wy1), outline=shade, w=0.9)


def plate_02(pl):
    """Three times of day. The same house, and three different buildings."""
    pl.grid(); pl.border()

    pl.text((750, 200), "RENDERED AT THREE TIMES OF DAY", 11, INK_SOFT, "mm", track=3.0)
    pl.line((566, 220), (934, 220), mix(INK_MUTE, BONE, 0.5), 0.7)

    rows = [(250, 452), (482, 684), (714, 916)]
    PX0, PX1 = 508, 1152
    sets = [
        ("09:00", "long shadows, cool light",
         mix(IVORY, BONE, 0.4), mix(SAND, BONE, 0.24), INK_SOFT,
         mix(GRAPHITE, IVORY, 0.4), 128, False),
        ("14:00", "short shadows, full contrast",
         BONE, mix(SAND, BONE, 0.06), CHARCOAL,
         mix(GRAPHITE, BONE, 0.1), 44, False),
        ("19:00", "the house lit from inside",
         mix(CHARCOAL, GRAPHITE, 0.62), mix(GRAPHITE, SAND, 0.86), CHARCOAL,
         mix(CLAY_SOFT, SAND, 0.22), 0, True),
    ]

    for (ry0, ry1), (time, note, sky, wall, shade, glass, run, glow) in zip(rows, sets):
        _villa(pl, (PX0, ry0, PX1, ry1), sky, wall, shade, glass, run, glow)
        pl.rect((PX0, ry0, PX1, ry1), outline=mix(INK_MUTE, BONE, 0.5), w=0.8)
        my = (ry0 + ry1) / 2
        pl.text((344, my - 22), time, 16, CLAY, "lm", bold=True, track=1.6)
        pl.text((344, my + 8), note, 10.5, INK_SOFT, "lm")
        pl.text((344, my + 30), "STILLS 01–14", 8.5, INK_MUTE, "lm", track=1.6)

    pl.text((750, 962), "Fourteen stills and one walkthrough, before a brick was laid",
            10.5, INK_SOFT, "mm")

    pl.titleblock("P-02", "Light study", "—", PROJECT)


def _swatch(pl, box, kind):
    x0, y0, x1, y1 = box
    if kind == "render":
        pl.rect(box, fill=mix(SAND, BONE, 0.3))
        pl.hatch([(x0, y0), (x1, y0), (x1, y1), (x0, y1)],
                 mix(INK_MUTE, BONE, 0.5), spacing=7, angle=90, w=0.8)
    elif kind == "stone":
        pl.rect(box, fill=mix(SAND, BONE, 0.1))
        pl.stipple((x0 + 8, y0 + 8, x1 - 8, y1 - 8), mix(INK_MUTE, BONE, 0.45), 11, 1.3)
    elif kind == "clad":
        pl.rect(box, fill=mix(CLAY, SAND, 0.4))
        for i in range(7):
            y = y0 + (i + 1) * (y1 - y0) / 8
            pl.line((x0, y), (x1, y), mix(CLAY, CHARCOAL, 0.6), 1.0)
    elif kind == "metal":
        pl.rect(box, fill=mix(GRAPHITE, BONE, 0.42))
        for i in range(9):
            x = x0 + (i + 1) * (x1 - x0) / 10
            pl.line((x, y0), (x, y1), mix(GRAPHITE, BONE, 0.16), 0.9)
    elif kind == "wood":
        pl.rect(box, fill=mix(CLAY, SAND, 0.56))
        for i in range(4):
            pl.arc(((x0 + x1) / 2, y1 + 120), 140 + i * 36, 248, 292,
                   mix(CLAY, CHARCOAL, 0.66), 0.9)
    elif kind == "glass":
        pl.rect(box, fill=mix(GRAPHITE, BONE, 0.3))
        pl.poly([(x0, y1 - 40), (x0 + 96, y0), (x0 + 168, y0), (x0, y1 + 4)],
                mix(GRAPHITE, BONE, 0.06))
        pl.rect((x0, y0, x0 + 12, y1), fill=CHARCOAL)
    else:
        pl.rect(box, fill=mix(IVORY_DEEP, BONE, 0.2))
        pl.hatch([(x0, y0), (x1, y0), (x1, y1), (x0, y1)],
                 mix(INK_MUTE, BONE, 0.66), spacing=9, angle=45, w=0.7)
    pl.rect(box, outline=CHARCOAL, w=1.1)


def plate_03(pl):
    """Material study. Two of these changed because of the model."""
    pl.grid(); pl.border()

    pl.text((344, 208), "MATERIAL STUDY", 11, INK_SOFT, "lm", track=2.6)
    pl.text((1156, 208), "TWO CHANGES, BOTH BEFORE SITE", 9.5, CLAY, "rm", track=1.6)
    pl.line((344, 228), (1156, 228), mix(INK_MUTE, BONE, 0.5), 0.7)

    items = [
        ("M1", "BOUNDARY CLADDING", "fluted clay tile", "clad", True),
        ("M2", "STAIR RAILING", "blackened steel, flat bar", "metal", True),
        ("M3", "EXTERNAL PLASTER", "warm off-white, sand finish", "plain", False),
        ("M4", "ENTRY DOOR", "teak, vertical grain", "wood", False),
        ("M5", "COURT PAVING", "kota, honed", "stone", False),
        ("M6", "GLAZING", "clear, 6 mm, dark frame", "glass", False),
    ]
    for i, (code, name, spec, kind, revised) in enumerate(items):
        cx = 344 + (i % 3) * 274
        cy = 274 + (i // 3) * 344
        _swatch(pl, (cx, cy, cx + 232, cy + 178), kind)
        pl.text((cx, cy + 210), code, 12.5, CLAY if revised else INK_SOFT,
                "lm", bold=True, track=2.0)
        pl.text((cx + 48, cy + 209), name, 9.5, INK_SOFT, "lm", track=1.6)
        pl.text((cx, cy + 234), spec, 9.5, INK_MUTE, "lm")
        if revised:
            pl.rect((cx + 156, cy, cx + 232, cy + 26), fill=CLAY)
            pl.text((cx + 194, cy + 13), "REV 02", 8.5, BONE, "mm", bold=True, track=1.4)

    pl.line((344, 964), (1156, 964), mix(INK_MUTE, BONE, 0.5), 0.7)
    pl.text((344, 992), "Both revisions cost a model edit — on site they would have cost a wall",
            10.5, INK_SOFT, "lm")

    pl.titleblock("P-03", "Material study", "—", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
