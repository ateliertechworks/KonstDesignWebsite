"""Peelamedu Apartment — 1,150 sq ft in which nothing is allowed one purpose."""

import math
from plate_kit import *

PROJECT = "Peelamedu Apartment — Coimbatore"


def plate_01(pl):
    """Plan. Storage is worked into every wall it can be worked into."""
    pl.grid(); pl.border()

    X0, Y0, X1, Y1 = 392, 226, 1108, 878
    T = 10
    B1, B2 = 452, 528                      # the corridor band

    warm, cool, hall = (mix(SAND, BONE, 0.70), mix(SAND, BONE, 0.56), mix(SAND, BONE, 0.86))
    for box, c in (((X0, Y0, 606, B1), warm), ((606, Y0, 812, B1), warm),
                   ((812, Y0, X1, B1), cool),
                   ((X0, B1, 900, B2), hall), ((900, B1, X1, B2), cool),
                   ((X0, B2, 760, Y1), warm), ((760, B2, 930, Y1), cool),
                   ((930, B2, X1, Y1), warm)):
        tint(pl, box, c)

    walls(pl, (X0, Y0, X1, Y1), t=T)
    for a, b in (((X0, B1), (X1, B1)), ((X0, B2), (X1, B2)),
                 ((606, Y0), (606, B1)), ((812, Y0), (812, B1)),
                 ((900, B1), (900, B2)),
                 ((760, B2), (760, Y1)), ((930, B2), (930, Y1))):
        partition(pl, a, b)

    # storage worked into every wall that could take it
    runs = [((X0 + T, B1 - 34, 880, B1 - T), "wardrobe"),
            ((X0 + T, Y0 + T, X0 + 40, B1 - 34), "wardrobe"),
            ((606 + 5, Y0 + T, 640, B1 - 34), "wardrobe")]
    for box, _ in runs:
        pl.rect(box, fill=mix(SAND, BONE, 0.34))
        pl.hatch([(box[0], box[1]), (box[2], box[1]), (box[2], box[3]), (box[0], box[3])],
                 mix(INK_MUTE, BONE, 0.4), spacing=9, angle=45, w=0.6)
        pl.rect(box, outline=GRAPHITE, w=0.9)
    pl.text((640, B1 - 21), "FULL-HEIGHT WARDROBE RUN", 8.5, INK_SOFT, "mm", track=1.4)

    # a blind stretch of passage becomes the pooja room
    PX0, PY0, PX1, PY1 = 900 + T, B1 + T, X1 - T, B2 - T
    pl.rect((PX0, PY0, PX1, PY1), fill=BONE)
    pl.hatch([(PX0, PY0), (PX1, PY0), (PX1, PY1), (PX0, PY1)],
             mix(CLAY_SOFT, BONE, 0.5), spacing=9, angle=-45, w=0.7)
    pl.rect((PX0, PY0, PX1, PY1), outline=CLAY, w=1.6)
    for k in range(6):                                    # folding shutters
        x = PX0 + k * (PX1 - PX0) / 6
        pl.line((x, PY0), (x + (PX1 - PX0) / 12, PY0 - 13), CLAY, 1.2)
        pl.line((x + (PX1 - PX0) / 12, PY0 - 13), (x + (PX1 - PX0) / 6, PY0), CLAY, 1.2)
    pl.line((PX1, 490), (1176, 490), INK_MUTE, 0.7)
    pl.circle((PX1, 490), 2.4, fill=CLAY)
    pl.text((1184, 483), "POOJA", 10, CLAY, "lm", bold=True, track=2.0)
    pl.text((1184, 501), "behind folding shutters", 10, INK_SOFT, "lm")

    # the dining bench that lifts
    pl.rect((430, 592, 664, 638), fill=mix(CLAY, SAND, 0.5), outline=CHARCOAL, w=1.0)
    pl.dash((430, 615), (664, 615), mix(CLAY, CHARCOAL, 0.5), 0.8, 7, 5)
    pl.text((547, 662), "BENCH — LIFTS FOR STORAGE", 8.5, INK_SOFT, "mm", track=1.2)

    # the modular kitchen run
    pl.rect((770, B2 + T, 920, B2 + T + 30), fill=mix(SAND, BONE, 0.3),
            outline=GRAPHITE, w=0.9)
    pl.rect((770, Y1 - T - 30, 920, Y1 - T), fill=mix(SAND, BONE, 0.3),
            outline=GRAPHITE, w=0.9)

    for box, h in (((X0 + 90, Y0 - 5, X0 + 250, Y0 + 5), True),
                   ((660, Y0 - 5, 790, Y0 + 5), True),
                   ((X0 - 5, 640, X0 + 5, 760), False),
                   ((X1 - 5, 640, X1 + 5, 760), False)):
        window(pl, box, h)
    for hinge, size, a0, a1 in (((470, B1), 40, 92, 180), ((700, B1), 40, 92, 180),
                                ((470, B2), 40, 180, 268), ((830, B1), 40, 92, 180)):
        door(pl, hinge, size, a0, a1)

    room(pl, (X0, Y0, 606, B1), "Bedroom 01", "11'6 x 10'0", 10)
    room(pl, (606, Y0, 812, B1), "Bedroom 02", "10'0 x 10'0", 10)
    room(pl, (812, Y0, X1, B1), "Bath", None, 9.5)
    pl.text((576, 772), "LIVING & DINING", 10.5, INK_SOFT, "mm", track=1.5)
    pl.text((576, 790), "17'0 x 12'0", 9, INK_MUTE, "mm")
    room(pl, (760, B2, 930, Y1), "Kitchen", "9'0 x 8'6", 10)
    room(pl, (930, B2, X1, Y1), "Bedroom 03", "10'0 x 9'0", 10)
    pl.text((520, B1 + 38), "CORRIDOR", 9, INK_MUTE, "mm", track=1.6)

    pl.dim((X0, Y1), (X1, Y1), "1,150 SQ FT CARPET — 3 BHK", 52, 1, 9.5)
    pl.dim((X0, B1), (X0, B2), "3'-6\"", 62, 1, 9.5)
    pl.northpoint((1176, 254))
    pl.leader((880, B1 - 21), (1176, 380), "The corridor gives up")
    pl.text((1216, 398), "six inches to storage", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-01", "Apartment plan", "1:75", PROJECT)


def plate_02(pl):
    """The kitchen — the one place the money went into finish."""
    pl.grid(); pl.border()

    X0, X1 = 396, 1104
    FL, CL = 878, 262

    pl.rect((X0, CL, X1, FL), fill=mix(SAND, BONE, 0.84))
    pl.line((X0, CL), (X1, CL), CHARCOAL, 1.3)
    pl.line((X0, FL), (X1, FL), CHARCOAL, 1.8)
    for x in (X0, X1):
        pl.line((x, CL), (x, FL), CHARCOAL, 1.2)

    CT, BASE = 686, 700                          # counter top, base unit tops
    WU0, WU1 = 418, 556                          # wall units

    # base run, with a drawer stack under the hob
    pl.rect((X0, BASE, 936, FL), fill=mix(SAND, BONE, 0.36))
    for x in (X0 + 152, X0 + 304, X0 + 456, X0 + 608):
        pl.line((x, BASE), (x, FL - 34), GRAPHITE, 0.8)
    for k in range(3):
        pl.line((X0 + 304, BASE + 46 * (k + 1)), (X0 + 456, BASE + 46 * (k + 1)),
                GRAPHITE, 0.8)
        pl.rect((X0 + 350, BASE + 46 * (k + 1) - 6, X0 + 410, BASE + 46 * (k + 1) - 2),
                fill=GRAPHITE)
    pl.rect((X0, FL - 34, 936, FL), fill=mix(GRAPHITE, BONE, 0.62))
    pl.rect((X0, CT, 936, BASE), fill=mix(GRAPHITE, SAND, 0.5))     # quartz
    pl.rect((X0, BASE, 936, FL), outline=CHARCOAL, w=1.1)

    # wall units, and the tall unit at the end of the run
    pl.rect((X0, WU0, 830, WU1), fill=mix(SAND, BONE, 0.24))
    for x in (X0 + 138, X0 + 276, X0 + 414):
        pl.line((x, WU0), (x, WU1), GRAPHITE, 0.8)
    pl.rect((X0, WU0, 830, WU1), outline=CHARCOAL, w=1.1)
    pl.rect((936, 348, X1, FL), fill=mix(SAND, BONE, 0.24))
    for y in (492, 636):
        pl.line((936, y), (X1, y), GRAPHITE, 0.9)
    pl.rect((936, 348, X1, FL), outline=CHARCOAL, w=1.2)
    for y in (420, 564, 756):
        pl.rect((1032, y - 3, 1076, y + 3), fill=GRAPHITE)

    # backsplash, hob, and the tall unit's handles
    pl.hatch([(X0, WU1 + 14), (830, WU1 + 14), (830, CT), (X0, CT)],
             mix(INK_MUTE, BONE, 0.7), spacing=13, angle=0, w=0.7)
    pl.rect((X0 + 318, CT - 6, X0 + 442, CT), fill=CHARCOAL)
    for cx in (X0 + 348, X0 + 412):
        pl.circle((cx, CT - 16), 13, outline=GRAPHITE, w=1.0)

    pl.dim((X0 - 8, CT), (X0 - 8, FL), "900", 34, 1)
    pl.dim((936, 348), (936, FL), "2,100 TALL UNIT", 0, 1, 9)
    pl.dim((X0, FL), (936, FL), "12'-0\" RUN", 66, 1)
    pl.leader((X0 + 380, CT - 30), (330, 470), "Counter deep enough", flip=True)
    pl.text((290, 488), "for two to work at once", 10.5, INK_SOFT, "rm")
    pl.leader((1020, 500), (X1 + 40, 330), "Tall unit — soft-close")
    pl.text((X1 + 80, 348), "hardware throughout", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-02", "Kitchen elevation", "1:30", PROJECT)


def plate_03(pl):
    """The corridor, which is also a wardrobe, and ends in a pooja room."""
    pl.grid(); pl.border()

    X0, X1 = 388, 1112
    FL, CL = 872, 268

    pl.rect((X0, CL, X1, FL), fill=mix(SAND, BONE, 0.86))
    pl.line((X0, CL), (X1, CL), CHARCOAL, 1.3)
    pl.line((X0, FL), (X1, FL), CHARCOAL, 1.8)

    # full-height wardrobe run — six inches of corridor, floor to ceiling
    WX1 = 820
    pl.rect((X0, CL, WX1, FL), fill=mix(SAND, BONE, 0.3))
    for k in range(6):
        x = X0 + (k + 1) * (WX1 - X0) / 6
        pl.line((x, CL), (x, FL), GRAPHITE, 0.9)
    pl.line((X0, CL + 118), (WX1, CL + 118), GRAPHITE, 0.9)
    for k in range(6):
        x = X0 + k * (WX1 - X0) / 6 + (WX1 - X0) / 12
        pl.rect((x - 3, 560, x + 3, 640), fill=GRAPHITE)
    pl.rect((X0, CL, WX1, FL), outline=CHARCOAL, w=1.2)
    pl.text((604, CL + 66), "FULL-HEIGHT WARDROBE RUN", 9.5, INK_SOFT, "mm", track=2.0)

    # the pooja room, behind folding shutters, half open
    PX0 = 860
    pl.rect((PX0, CL, X1, FL), fill=mix(GRAPHITE, BONE, 0.5))
    pl.hatch([(PX0 + 14, CL + 30), (X1 - 14, CL + 30), (X1 - 14, FL - 20),
              (PX0 + 14, FL - 20)], mix(CLAY_SOFT, BONE, 0.24), spacing=10, angle=0, w=0.9)
    pl.rect((974, 470, 1046, 730), fill=mix(CLAY, SAND, 0.4), outline=CHARCOAL, w=1.0)
    pl.circle((1010, 540), 17, outline=mix(CLAY, CHARCOAL, 0.4), w=1.4)
    pl.poly([(1010, 570), (1002, 620), (1018, 620)], fill=mix(CLAY, CHARCOAL, 0.35))
    for k in range(4):                                     # the folded leaves
        x = PX0 + k * 26
        pl.poly([(x, CL), (x + 13, CL + 12), (x + 13, FL - 12), (x, FL)],
                mix(SAND, BONE, 0.2), CHARCOAL, 1.0)
        pl.poly([(x + 13, CL + 12), (x + 26, CL), (x + 26, FL), (x + 13, FL - 12)],
                mix(SAND, BONE, 0.44), CHARCOAL, 1.0)
    pl.rect((PX0, CL, X1, FL), outline=CHARCOAL, w=1.2)
    pl.text((1010, 800), "POOJA", 10.5, CLAY, "mm", bold=True, track=2.2)

    pl.dim((X0, FL), (WX1, FL), "14'-0\"", 46, 1)
    pl.dim((X1 + 10, CL), (X1 + 10, FL), "9'-6\"", 44, -1)
    pl.leader((X0 + 60, 700), (330, 940), "Corridor loses six", flip=True)
    pl.text((290, 958), "inches, and gains a wall", 10.5, INK_SOFT, "rm")
    pl.leader((PX0 + 26, 360), (1150, 214), "Folding shutters —")
    pl.text((1190, 232), "shut, it is passage again", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-03", "Corridor elevation", "1:30", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
