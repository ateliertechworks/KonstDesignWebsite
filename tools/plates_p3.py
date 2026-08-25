"""The Loft Living Room — 18 ft of height, and what was done with it."""

import math
from plate_kit import *

PROJECT = "The Loft Living Room — Coimbatore"


def plate_01(pl):
    """Interior elevation of the tall wall — the one the room had no answer for."""
    pl.grid(); pl.border()

    X0, X1 = 372, 1128
    FL, CL = 902, 208                       # floor, ceiling — 18 ft between them
    ft = (FL - CL) / 18.0

    pl.rect((X0, CL, X1, FL), fill=mix(SAND, BONE, 0.80))
    pl.stipple((X0 + 10, CL + 10, X1 - 10, FL - 10), mix(INK_MUTE, BONE, 0.76), 19, 0.8)
    pl.line((X0, FL), (X1, FL), CHARCOAL, 1.8)
    pl.line((X0, CL), (X1, CL), CHARCOAL, 1.4)
    for x in (X0, X1):
        pl.line((x, CL), (x, FL), CHARCOAL, 1.4)

    # cove — the upper volume reads as a surface instead of a void
    CV = CL + 86
    pl.hatch([(X0 + 30, CL + 2), (X1 - 30, CL + 2), (X1 - 30, CV), (X0 + 30, CV)],
             mix(CLAY_SOFT, BONE, 0.5), spacing=9, angle=0, w=0.9)
    pl.rect((X0 + 26, CV, X1 - 26, CV + 15), fill=GRAPHITE)
    pl.line((X0 + 26, CV), (X1 - 26, CV), CHARCOAL, 1.0)
    pl.text((750, CL - 18), "COVE — WASHES THE UPPER VOLUME", 9.5, CLAY, "mm", track=2.0)

    # the art wall, picked out by the track
    for i, (ax0, ay0, ax1, ay1) in enumerate(((404, 402, 512, 546), (404, 578, 512, 668))):
        pl.rect((ax0, ay0, ax1, ay1), fill=BONE, outline=GRAPHITE, w=1.1)
        pl.hatch([(ax0 + 8, ay0 + 8), (ax1 - 8, ay0 + 8), (ax1 - 8, ay1 - 8), (ax0 + 8, ay1 - 8)],
                 mix(INK_MUTE, BONE, 0.6), spacing=9, angle=45 if i else -45, w=0.6)
    pl.text((458, 700), "ART WALL", 9, INK_MUTE, "mm", track=1.6)

    # the television, and the nine blank feet that used to sit above it
    pl.rect((640, 452, 900, 606), fill=CHARCOAL)
    pl.rect((652, 464, 888, 594), fill=mix(GRAPHITE, BONE, 0.08))

    # the floating veneer unit: one horizontal line for the tall wall to sit against
    UX0, UX1, UY0, UY1 = 546, 1006, 646, 706
    pl.rect((UX0, UY0, UX1, UY1), fill=mix(CLAY, SAND, 0.42))
    for i in range(19):
        x = UX0 + 12 + i * (UX1 - UX0 - 24) / 18
        pl.line((x, UY0 + 5), (x, UY1 - 5), mix(CLAY, CHARCOAL, 0.66), 0.6)
    pl.rect((UX0, UY0, UX1, UY1), outline=CHARCOAL, w=1.2)
    pl.line((UX0, UY1 + 3), (UX1, UY1 + 3), mix(INK_MUTE, BONE, 0.25), 2.2)   # shadow gap
    pl.dash((UX0, UY1 + 22), (UX1, UY1 + 22), mix(INK_MUTE, BONE, 0.45), 0.7, 7, 5)

    # sofa, off the wall
    pl.rect((596, 800, 956, 902), fill=mix(SAND, BONE, 0.34))
    pl.rect((596, 776, 956, 812), fill=mix(SAND, BONE, 0.16))
    pl.rect((596, 800, 956, 902), outline=GRAPHITE, w=1.0)

    pl.dim((X0, CL), (X0, FL), "18'-0\"", 54, 1)
    pl.dim((UX0, UY0 - 8), (UX1, UY0 - 8), "14'-0\"", 18, -1)
    pl.leader((UX1, UY0 + 30), (X1 + 44, 530), "Floating veneer unit")
    pl.text((X1 + 84, 548), "gives the tall wall a", 10.5, INK_SOFT, "lm")
    pl.text((X1 + 84, 564), "horizontal line to sit against", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-01", "Interior elevation — tall wall", "1:50", PROJECT)


def plate_02(pl):
    """Plan. The sofa comes off the wall and the room gets an axis."""
    pl.grid(); pl.border()

    X0, Y0, X1, Y1 = 396, 286, 1104, 818
    T = 9

    tint(pl, (X0, Y0, X1, Y1), mix(SAND, BONE, 0.80))
    walls(pl, (X0, Y0, X1, Y1), t=T)
    window(pl, (X0 + 120, Y0 - 5, X0 + 300, Y0 + 5), True)
    window(pl, (X0 + 360, Y0 - 5, X0 + 540, Y0 + 5), True)
    opening(pl, (X1 - 5, 420, X1 + 5, 530))

    # the double-height void, which is what makes the axis worth having
    pl.dashrect((X0 + 62, Y0 + 56, X1 - 62, Y1 - 56), mix(INK_MUTE, BONE, 0.4), 0.8, 9, 6)
    pl.text((750, Y0 + 84), "DOUBLE-HEIGHT VOID ABOVE", 9, INK_MUTE, "mm", track=1.8)

    # where the seating used to be — pushed to the walls
    pl.dashrect((X0 + T, 700, X0 + 200, 780), mix(INK_MUTE, BONE, 0.5), 0.7, 6, 5)
    pl.text((X0 + 104, 740), "ORIGINAL", 8, INK_MUTE, "mm", track=1.4)

    # the veneer unit against the tall wall
    pl.rect((546, Y1 - T - 32, 1006, Y1 - T - 6), fill=mix(CLAY, SAND, 0.42))
    pl.rect((546, Y1 - T - 32, 1006, Y1 - T - 6), outline=CHARCOAL, w=1.0)
    pl.text((776, Y1 - T - 48), "VENEER UNIT", 8.5, INK_MUTE, "mm", track=1.4)

    # one long seating axis
    pl.dash((X0 + 34, 596), (X1 - 34, 596), mix(CLAY, BONE, 0.25), 1.0, 13, 8)
    arrow(pl, (X0 + 90, 596), (X0 + 34, 596), CLAY, 1.1, 8)
    arrow(pl, (X1 - 90, 596), (X1 - 34, 596), CLAY, 1.1, 8)

    pl.rect((560, 626, 940, 690), fill=mix(SAND, BONE, 0.30), outline=GRAPHITE, w=1.0)
    for x in (686, 814):
        pl.line((x, 626), (x, 690), GRAPHITE, 0.8)
    pl.text((750, 658), "SOFA", 9, INK_SOFT, "mm", track=1.6)
    for cx in (500, 1000):
        pl.rect((cx - 34, 520, cx + 34, 584), fill=mix(SAND, BONE, 0.30),
                outline=GRAPHITE, w=1.0)
    pl.rect((668, 500, 832, 566), fill=BONE, outline=GRAPHITE, w=1.0)
    pl.text((750, 533), "TABLE", 8.5, INK_MUTE, "mm", track=1.4)
    pl.dashrect((472, 470, 1028, 730), mix(INK_MUTE, BONE, 0.5), 0.7, 7, 5)
    pl.text((504, 488), "RUG", 8.5, INK_MUTE, "mm", track=1.4)

    pl.text((750, 614), "SEATING AXIS — 16'-0\"", 9.5, CLAY, "mm", bold=True, track=2.0)
    pl.dim((X0, Y0), (X0, Y1), "25'-0\"", 52, 1)
    pl.dim((X0, Y1), (X1, Y1), "34'-0\"", 96, 1)
    pl.northpoint((1160, 320))
    pl.leader((X0 + T, 740), (326, 740), "Seating was pushed", flip=True)
    pl.text((286, 758), "to the walls", 10.5, INK_SOFT, "rm")

    pl.titleblock("P-02", "Furniture plan", "1:50", PROJECT)


def _room_shell(pl, box):
    """The same slice of room, drawn three times over."""
    px0, py0, px1, py1 = box
    cl, fl = py0 + 16, py1 - 16
    pl.rect((px0, cl, px1, fl), fill=mix(SAND, BONE, 0.84))
    pl.line((px0, fl), (px1, fl), CHARCOAL, 1.6)
    pl.line((px0, cl), (px1, cl), CHARCOAL, 1.2)
    pl.rect((px1 - 15, cl, px1, fl), fill=GRAPHITE)                 # the tall wall
    pl.rect((px1 - 104, fl - 38, px1 - 15, fl - 24), fill=mix(CLAY, SAND, 0.42))
    pl.rect((px0 + 44, fl - 46, px0 + 190, fl), fill=mix(SAND, BONE, 0.32),
            outline=GRAPHITE, w=0.9)
    pl.rect((px0 + 44, fl - 62, px0 + 96, fl - 40), fill=mix(SAND, BONE, 0.18))
    return px0, cl, px1 - 15, fl


def plate_03(pl):
    """Three circuits. Three completely different rooms."""
    pl.grid(); pl.border()

    pl.text((750, 200), "THREE CIRCUITS — THREE ROOMS", 11, INK_SOFT, "mm", track=3.0)
    pl.line((566, 220), (934, 220), mix(INK_MUTE, BONE, 0.5), 0.7)

    rows = [(252, 448), (482, 678), (712, 908)]
    PX0, PX1 = 512, 1148
    names = [("01", "COVE", "washes the upper volume", "so the ceiling reads",
              "as a surface, not a void"),
             ("02", "TRACK", "picks out the art wall", "three spots, aimed",
              "and left alone"),
             ("03", "LAMPS", "take over after dark", "the upper volume",
              "falls away entirely")]

    for i, ((ry0, ry1), (no, name, note, l1, l2)) in enumerate(zip(rows, names)):
        ix0, cl, ix1, fl = _room_shell(pl, (PX0, ry0, PX1, ry1))

        if i == 0:
            pl.rect((ix0 + 30, cl + 34, ix1 - 30, cl + 46), fill=GRAPHITE)
            pl.hatch([(ix0 + 30, cl + 2), (ix1 - 30, cl + 2), (ix1 - 30, cl + 34),
                      (ix0 + 30, cl + 34)], mix(CLAY_SOFT, BONE, 0.4), spacing=7, angle=0, w=0.9)
            for k in range(22):
                x = ix0 + 44 + k * (ix1 - ix0 - 88) / 21
                pl.line((x, cl + 34), (x, cl + 6), mix(CLAY, BONE, 0.55), 0.7)
        elif i == 1:
            pl.rect((ix0 + 120, cl + 6, ix1 - 40, cl + 16), fill=CHARCOAL)
            for k in range(3):
                sx = ix0 + 150 + k * 74
                pl.circle((sx, cl + 24), 5.5, fill=GRAPHITE)
                pl.hatch([(sx - 7, cl + 28), (sx + 7, cl + 28),
                          (ix1, fl - 118 + k * 32), (ix1, fl - 84 + k * 32)],
                         mix(CLAY_SOFT, BONE, 0.52), spacing=8, angle=40, w=0.7)
            for k, (fy0, fy1) in enumerate(((fl - 132, fl - 96), (fl - 88, fl - 58))):
                pl.rect((ix1 - 3, fy0, ix1 + 12, fy1), fill=BONE,
                        outline=mix(INK_MUTE, BONE, 0.2), w=0.9)
        else:
            pl.hatch([(ix0, cl + 2), (ix1, cl + 2), (ix1, cl + 96), (ix0, cl + 96)],
                     mix(INK_MUTE, BONE, 0.62), spacing=7, angle=0, w=0.9)
            pl.text((ix0 + 300, cl + 40), "UPPER VOLUME UNLIT", 8.5, INK_MUTE, "mm", track=1.6)
            for sx in (ix0 + 226, ix0 + 402):
                pl.rect((sx - 26, fl - 34, sx + 26, fl), fill=mix(SAND, BONE, 0.3),
                        outline=GRAPHITE, w=0.9)
                pl.line((sx, fl - 34), (sx, fl - 58), GRAPHITE, 1.2)
                pl.poly([(sx - 22, fl - 58), (sx + 22, fl - 58), (sx + 14, fl - 92),
                         (sx - 14, fl - 92)], fill=mix(CLAY, SAND, 0.5), outline=GRAPHITE, w=0.9)
                pl.hatch([(sx - 40, fl - 56), (sx + 40, fl - 56), (sx + 62, fl), (sx - 62, fl)],
                         mix(CLAY_SOFT, BONE, 0.46), spacing=8, angle=0, w=0.8)

        my = (ry0 + ry1) / 2
        pl.text((344, my - 30), no, 15, CLAY, "lm", bold=True, track=2.4)
        pl.text((392, my - 28), name, 12, INK_SOFT, "lm", track=2.6)
        pl.text((344, my + 2), note, 10.5, INK_SOFT, "lm")
        pl.text((344, my + 22), l1, 10, INK_MUTE, "lm")
        pl.text((344, my + 38), l2, 10, INK_MUTE, "lm")
        pl.line((344, ry1 + 12), (PX1, ry1 + 12), mix(INK_MUTE, BONE, 0.62), 0.6)

    pl.text((750, 956), "Switched separately — never together", 10.5, INK_SOFT, "mm")

    pl.titleblock("P-03", "Lighting circuits", "—", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
