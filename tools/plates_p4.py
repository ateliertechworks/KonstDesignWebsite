"""MAK Complex Interiors — two floors kept working while they were rebuilt."""

import math
from plate_kit import *

PROJECT = "MAK Complex Interiors — Dindigul"

ROUTE = mix(CLAY, BONE, 0.0)


def _floor(pl, box, label, sub):
    x0, y0, x1, y1 = box
    pl.text((x0, y0 - 26), label, 11, INK_SOFT, "lm", track=2.4)
    pl.text((x0 + 208, y0 - 26), sub, 9, INK_MUTE, "lm", track=1.6)
    pl.line((x0, y0 - 12), (x1, y0 - 12), mix(INK_MUTE, BONE, 0.5), 0.7)


def plate_01(pl):
    """Both floors, and the one accent that ties them together."""
    pl.grid(); pl.border()

    X0, X1 = 402, 1098
    T = 9
    FF = (X0, 232, X1, 542)          # upper floor drawn above, as it is built
    GF = (X0, 628, X1, 938)
    SX = 1014                        # the stair, in the same place on both floors

    # ---- first floor: open workspace, two cabins, the meeting room
    tint(pl, FF, mix(SAND, BONE, 0.80))
    for box, c in (((760, 232, X1, 400), mix(SAND, BONE, 0.50)),
                   ((760, 400, 930, 542), mix(SAND, BONE, 0.62)),
                   ((930, 400, X1, 542), mix(SAND, BONE, 0.40))):
        tint(pl, box, c)
    walls(pl, FF, t=T)
    for a_, b_ in (((760, 232), (760, 542)), ((760, 400), (X1, 400)),
                   ((930, 400), (930, 542))):
        partition(pl, a_, b_)
    for cx in range(5):
        for cy in range(2):
            dx, dy = 462 + cx * 62, 316 + cy * 116
            pl.rect((dx - 25, dy - 19, dx + 25, dy + 19), fill=BONE,
                    outline=mix(INK_MUTE, BONE, 0.2), w=0.8)
    pl.text((578, 264), "OPEN WORKSPACE", 10, INK_SOFT, "mm", track=1.8)
    room(pl, (760, 400, 930, 542), "Cabin 01 / 02", None, 9.5)
    _floor(pl, FF, "FIRST FLOOR", "OPEN WORKSPACE + TWO CABINS")

    # ---- ground floor: everything a client sees
    tint(pl, GF, mix(SAND, BONE, 0.80))
    for box, c in (((X0, 628, 606, 800), mix(SAND, BONE, 0.62)),
                   ((606, 628, 812, 800), mix(SAND, BONE, 0.62)),
                   ((812, 628, X1, 800), mix(SAND, BONE, 0.50)),
                   ((930, 800, X1, 938), mix(SAND, BONE, 0.40))):
        tint(pl, box, c)
    walls(pl, GF, t=T)
    for a_, b_ in (((X0, 800), (X1, 800)), ((606, 628), (606, 800)),
                   ((812, 628), (812, 800)), ((606, 800), (606, 938)),
                   ((930, 800), (930, 938))):
        partition(pl, a_, b_)
    room(pl, (X0, 628, 606, 800), "Client room 01", None, 9.5)
    room(pl, (606, 628, 812, 800), "Client room 02", None, 9.5)
    room(pl, (812, 628, X1, 800), "Waiting", None, 10)
    pl.text((504, 826), "ENTRY", 10, INK_SOFT, "mm", track=1.6)
    pl.text((768, 826), "RECEPTION", 10.5, INK_SOFT, "mm", track=1.8)
    pl.rect((640, 894, 900, 928), fill=mix(CLAY, SAND, 0.42), outline=CHARCOAL, w=1.0)
    opening(pl, (446, 933, 546, 943))
    door(pl, (446, 938), 52, 268, 356)
    _floor(pl, GF, "GROUND FLOOR", "CLIENT FACING")

    # ---- the accent: one route, front door to meeting room
    for x in (606, 930):                                  # it runs through doorways
        opening(pl, (x - 5, 852, x + 5, 892))
    gf = [(496, 966), (496, 872), (SX, 872)]
    ff = [(SX, 470), (SX, 300)]
    for path in (gf, ff):
        for a_, b_ in zip(path, path[1:]):
            pl.line(a_, b_, CLAY, 2.8)
    pl.dash((SX, 872), (SX, 640), mix(CLAY, BONE, 0.42), 1.8, 13, 10)
    pl.dash((SX, 578), (SX, 470), mix(CLAY, BONE, 0.42), 1.8, 13, 10)
    pl.text((SX, 610), "UP", 9, CLAY, "mm", bold=True, track=1.6)
    pl.text((SX, 471), "STAIR", 9.5, INK_MUTE, "mm", track=1.6)
    for c, lab, dy in (((496, 966), "ENTRY", 26), ((768, 872), "RECEPTION", -22),
                       ((SX, 872), "STAIR", 26), ((SX, 300), "MEETING ROOM", -26)):
        pl.circle(c, 7, fill=BONE, outline=CLAY, w=2.2)
        pl.text((c[0], c[1] + dy), lab, 9, CLAY, "mm", bold=True, track=1.6)

    pl.dim((X0, 990), (X1, 990), "6,500 SQ FT OVER TWO FLOORS", 40, 1, 9.5)
    pl.leader((X0 + T, 470), (330, 470), "Phased floor by floor", flip=True)
    pl.text((290, 488), "over eleven weekends", 10.5, INK_SOFT, "rm")

    pl.titleblock("P-01", "Floor plans", "1:200", PROJECT)


def plate_02(pl):
    """Reception. The one wall the veneer was saved for."""
    pl.grid(); pl.border()

    X0, X1 = 388, 1112
    FL, CL = 872, 268

    pl.rect((X0, CL, X1, FL), fill=mix(SAND, BONE, 0.84))
    pl.line((X0, CL), (X1, CL), CHARCOAL, 1.4)
    pl.rect((X0, CL - 16, X1, CL), fill=CHARCOAL)
    for x in range(int(X0) + 70, int(X1) - 40, 96):        # downlights
        pl.circle((x, CL + 16), 7, fill=BONE, outline=GRAPHITE, w=1.0)
        pl.hatch([(x - 9, CL + 24), (x + 9, CL + 24), (x + 40, FL), (x - 40, FL)],
                 mix(CLAY_SOFT, BONE, 0.84), spacing=11, angle=0, w=0.6)

    # vitrified floor — hard-wearing, and the only thing under commercial traffic
    pl.line((X0, FL), (X1, FL), CHARCOAL, 1.8)
    for x in range(int(X0), int(X1), 78):
        pl.line((x, FL), (x, FL + 16), mix(INK_MUTE, BONE, 0.55), 0.6)
    pl.line((X0, FL + 16), (X1, FL + 16), mix(INK_MUTE, BONE, 0.4), 0.7)
    pl.text((X0 + 6, FL + 34), "VITRIFIED FLOOR", 8.5, INK_MUTE, "lm", track=1.6)

    # the veneer wall
    VX0, VX1, VY0 = 508, 992, 300
    pl.rect((VX0, VY0, VX1, FL), fill=mix(CLAY, SAND, 0.46))
    for i in range(25):
        x = VX0 + 10 + i * (VX1 - VX0 - 20) / 24
        pl.line((x, VY0 + 6), (x, FL - 6), mix(CLAY, CHARCOAL, 0.66), 0.6)
    pl.rect((VX0, VY0, VX1, FL), outline=CHARCOAL, w=1.3)

    # backlit identity
    pl.hatch([(VX0 + 54, VY0 + 52), (VX1 - 54, VY0 + 52), (VX1 - 54, VY0 + 172),
              (VX0 + 54, VY0 + 172)], mix(CLAY_SOFT, BONE, 0.3), spacing=8, angle=0, w=0.9)
    pl.text((750, VY0 + 106), "KONST", 22, BONE, "mm", serif=True, track=6.0)
    pl.text((750, VY0 + 146), "DESIGN", 10, BONE, "mm", track=6.0)

    # counter
    pl.rect((572, 700, 928, FL), fill=mix(SAND, BONE, 0.28))
    for x in (692, 812):
        pl.line((x, 700), (x, FL), mix(INK_MUTE, BONE, 0.2), 0.8)
    pl.rect((558, 686, 942, 704), fill=GRAPHITE)
    pl.rect((572, 700, 928, FL), outline=CHARCOAL, w=1.2)

    pl.dim((558, 686), (558, FL), "1,050", 42, 1)
    pl.dim((VX0, FL), (VX1, FL), "16'-0\" VENEER", 60, 1)
    pl.leader((VX1, 420), (X1 + 46, 400), "Veneer kept for this wall")
    pl.text((X1 + 86, 438), "and the cabin doors only —", 10.5, INK_SOFT, "lm")
    pl.text((X1 + 86, 454), "laminate everywhere else", 10.5, INK_SOFT, "lm")
    pl.leader((750, VY0 + 158), (X0 - 46, 360), "Backlit identity", flip=True)

    pl.titleblock("P-02", "Reception elevation", "1:40", PROJECT)


def plate_03(pl):
    """Wayfinding. Colour and signage are the same decision."""
    pl.grid(); pl.border()

    pl.text((344, 214), "ONE ACCENT, DOOR TO MEETING ROOM", 11, INK_SOFT, "lm", track=2.6)
    pl.line((344, 234), (1156, 234), mix(INK_MUTE, BONE, 0.5), 0.7)

    # --- the route, drawn as the sequence a visitor actually walks
    nodes = [("01", "ENTRY", 396), ("02", "RECEPTION", 552), ("03", "STAIR", 708),
             ("04", "LANDING", 864), ("05", "MEETING ROOM", 1020)]
    ry = 372
    pl.line((396, ry), (1020, ry), CLAY, 3.0)
    for i, (no, name, x) in enumerate(nodes):
        pl.circle((x, ry), 15, fill=BONE, outline=CLAY, w=2.2)
        pl.text((x, ry), no, 9, CLAY, "mm", bold=True)
        pl.text((x, ry - 34), name, 9, INK_SOFT, "mm", track=1.4)
        if i:
            pl.text(((x + nodes[i - 1][2]) / 2, ry + 26),
                    ["", "18 m", "12 m", "1 FL", "9 m"][i], 8.5, INK_MUTE, "mm")
    pl.text((396, ry + 66), "GROUND FLOOR", 8.5, INK_MUTE, "lm", track=1.6)
    pl.text((1020, ry + 66), "FIRST FLOOR", 8.5, INK_MUTE, "rm", track=1.6)
    pl.dash((786, ry + 22), (786, ry + 58), mix(INK_MUTE, BONE, 0.4), 0.7)

    # --- signage schedule
    pl.text((344, 502), "SIGNAGE", 10, INK_SOFT, "lm", track=2.4)
    pl.line((344, 520), (1156, 520), mix(INK_MUTE, BONE, 0.5), 0.7)

    signs = [("S1", "WALL PLATE", "reception, lift lobby"),
             ("S2", "SUSPENDED", "corridor junctions"),
             ("S3", "DOOR PLATE", "cabins and meeting")]
    for i, (code, kind, where) in enumerate(signs):
        bx = 344 + i * 274
        pl.rect((bx, 552, bx + 232, 764), outline=mix(INK_MUTE, BONE, 0.5), w=0.8)
        if i == 0:
            pl.rect((bx + 46, 596, bx + 186, 668), fill=mix(SAND, BONE, 0.5),
                    outline=GRAPHITE, w=1.0)
            pl.rect((bx + 46, 596, bx + 58, 668), fill=CLAY)
            pl.line((bx + 74, 622), (bx + 166, 622), INK_MUTE, 1.4)
            pl.line((bx + 74, 642), (bx + 138, 642), INK_MUTE, 1.0)
        elif i == 1:
            pl.line((bx + 116, 566), (bx + 116, 596), GRAPHITE, 1.0)
            pl.rect((bx + 40, 596, bx + 192, 650), fill=mix(SAND, BONE, 0.5),
                    outline=GRAPHITE, w=1.0)
            pl.rect((bx + 40, 644, bx + 192, 650), fill=CLAY)
            pl.line((bx + 60, 618), (bx + 172, 618), INK_MUTE, 1.4)
        else:
            pl.rect((bx + 78, 588, bx + 154, 676), fill=mix(SAND, BONE, 0.5),
                    outline=GRAPHITE, w=1.0)
            pl.rect((bx + 78, 588, bx + 154, 602), fill=CLAY)
            pl.line((bx + 92, 626), (bx + 140, 626), INK_MUTE, 1.2)
        pl.text((bx + 12, 708), code, 11, CLAY, "lm", bold=True, track=2.0)
        pl.text((bx + 52, 708), kind, 10, INK_SOFT, "lm", track=1.8)
        pl.text((bx + 12, 734), where, 9.5, INK_MUTE, "lm")

    # --- the accent itself
    pl.text((344, 838), "ACCENT", 10, INK_SOFT, "lm", track=2.4)
    pl.line((344, 856), (1156, 856), mix(INK_MUTE, BONE, 0.5), 0.7)
    for i, (sw, name) in enumerate(((CLAY, "ACCENT — SIGNAGE + ROUTE"),
                                    (mix(SAND, BONE, 0.3), "LAMINATE — ALL TOUCHED SURFACES"),
                                    (mix(CLAY, SAND, 0.46), "VENEER — RECEPTION + CABIN DOORS"))):
        bx = 344 + i * 274
        pl.rect((bx, 884, bx + 52, 926), fill=sw, outline=CHARCOAL, w=0.9)
        pl.text((bx, 950), name, 9, INK_MUTE, "lm", track=1.0)

    pl.titleblock("P-03", "Wayfinding", "—", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
