"""Rathinapuri Residence — 30 x 50 plot, plan folded around a central light well."""

import math
from plate_kit import *

PROJECT = "Rathinapuri Residence — Coimbatore"


def plate_01(pl):
    """Ground floor plan. Blind on both long sides, so the plan looks inward."""
    pl.grid(); pl.border()

    BX0, BY0, BX1, BY1 = 516, 152, 984, 932       # 30 x 50 ft footprint
    T = 10                                         # wall thickness
    B1, B2 = 348, 730                              # sleeping / service / living
    WX0, WY0, WX1, WY1 = 688, 478, 813, 603        # the 8 x 8 light well

    # neighbours hard against both long walls — the reason there are no side windows
    for x0, x1 in ((BX0 - 34, BX0 - 10), (BX1 + 10, BX1 + 34)):
        pl.hatch([(x0, BY0), (x1, BY0), (x1, BY1), (x0, BY1)],
                 mix(INK_MUTE, BONE, 0.42), spacing=11, angle=45, w=0.6)
    pl.vtext((BX0 - 52, (BY0 + BY1) / 2), "NEIGHBOUR")
    pl.vtext((BX1 + 52, (BY0 + BY1) / 2), "NEIGHBOUR")
    pl.dashrect((BX0 - 10, BY0 - 10, BX1 + 10, BY1 + 10), mix(INK_MUTE, BONE, 0.2), 0.8, 9, 6)

    # 1 — floor tints, laid down before any wall so nothing paints them out
    warm, cool, hall = (mix(SAND, BONE, 0.70), mix(SAND, BONE, 0.58), mix(SAND, BONE, 0.86))
    for box, c in (((BX0, BY0, 750, B1), warm), ((750, BY0, BX1, B1), warm),
                   ((BX0, B1, 680, 545), cool), ((BX0, 545, 680, B2), cool),
                   ((820, B1, BX1, 540), cool), ((820, 540, BX1, B2), cool),
                   ((680, B1, 820, B2), hall),
                   ((BX0, B2, 820, BY1), warm), ((820, B2, BX1, BY1), hall)):
        tint(pl, box, c)

    # 2 — walls
    walls(pl, (BX0, BY0, BX1, BY1), t=T)
    partition(pl, (BX0, B1), (BX1, B1))
    partition(pl, (BX0, B2), (BX1, B2))
    partition(pl, (750, BY0), (750, B1))
    partition(pl, (680, B1), (680, B2))
    partition(pl, (820, B1), (820, B2))
    partition(pl, (820, B2), (820, BY1))
    partition(pl, (BX0, 545), (680, 545))
    partition(pl, (820, 540), (984, 540))

    # 3 — the light well: the whole point of the plan
    pl.rect((WX0, WY0, WX1, WY1), fill=BONE)
    pl.hatch([(WX0, WY0), (WX1, WY0), (WX1, WY1), (WX0, WY1)],
             mix(CLAY_SOFT, BONE, 0.55), spacing=10, angle=-45, w=0.7)
    pl.rect((WX0, WY0, WX1, WY1), outline=CLAY, w=1.7)
    for a, b in (((750, WY0 - 20), (750, WY0 + 6)), ((750, WY1 + 20), (750, WY1 - 6)),
                 ((WX0 - 20, 540), (WX0 + 6, 540)), ((WX1 + 20, 540), (WX1 - 6, 540))):
        arrow(pl, a, b, CLAY, 1.0, 6)

    # 4 — openings. Every habitable room takes its light off the well.
    for box, horiz in (((BX0 + 40, B1 - 4, BX0 + 130, B1 + 4), True),
                       ((BX0 + 40, B2 - 4, BX0 + 130, B2 + 4), True),
                       ((676, 500, 684, 585), False),
                       ((816, 500, 824, 585), False)):
        window(pl, box, horiz)
    window(pl, (566, BY1 - 5, 676, BY1 + 5), True)
    opening(pl, (858, BY1 - 5, 944, BY1 + 5))
    door(pl, (858, BY1), 50, 268, 356)
    for hinge, size, a0, a1 in (((694, B1), 40, 0, 88), ((694, B2), 40, 272, 360),
                                ((806, B1), 40, 92, 180), ((806, B2), 40, 180, 268)):
        door(pl, hinge, size, a0, a1)

    # 5 — labels
    room(pl, (BX0, BY0, 750, B1), "Bedroom 01", "12'0 x 11'6")
    room(pl, (750, BY0, BX1, B1), "Bedroom 02", "11'0 x 11'6")
    room(pl, (BX0, B1, 680, 545), "Kitchen", "9'6 x 8'0")
    room(pl, (BX0, 545, 680, B2), "Dining", "10'0 x 11'0")
    room(pl, (820, B1, BX1, 540), "Stair", None, 10.5)
    room(pl, (820, 540, BX1, B2), "Bath", None, 10.5)
    room(pl, (BX0, B2, 820, BY1), "Living", "16'0 x 12'6")
    room(pl, (820, B2, BX1, BY1), "Entry", None, 10.5)
    pl.text((750, 420), "PASSAGE", 9, INK_MUTE, "mm", track=1.4)
    pl.text((750, 662), "PASSAGE", 9, INK_MUTE, "mm", track=1.4)
    pl.text((750, WY0 - 34), "LIGHT WELL", 10.5, CLAY, "mm", bold=True, track=2.2)
    pl.text((750, 533), "OPEN", 9.5, CLAY, "mm", track=1.6)
    pl.text((750, 550), "TO SKY", 9.5, CLAY, "mm", track=1.6)

    # 6 — the street, and the notes
    gy = BY1 + 96
    pl.line((418, gy), (1082, gy), mix(INK_MUTE, BONE, 0.3), 1.0)
    pl.text((750, gy + 18), "STREET", 9.5, INK_MUTE, "mm", track=3.0)

    pl.dim((BX0, BY1 + 10), (BX1, BY1 + 10), "30'-0\"", 34, 1)
    pl.dim((BX1 + 10, BY0), (BX1 + 10, BY1), "50'-0\"", 80, -1)
    pl.northpoint((1108, 196))
    pl.leader((WX1 + 4, 500), (1040, 318), "Daylight and cross")
    pl.text((1046, 336), "ventilation from inside", 10.5, INK_SOFT, "lm")
    pl.text((1046, 352), "the plot, not the boundary", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-01", "Ground floor plan", "1:100", PROJECT)


def plate_02(pl):
    """Section through the well — where the daylight actually comes from."""
    pl.grid(); pl.border()

    X0, X1 = 452, 1048
    GL, FF, RF, PAR = 892, 668, 444, 386
    WX0, WX1 = 700, 810
    T = 13

    sun(pl, (1092, 172))
    for i in range(4):
        a = (1048 - i * 15, 208 + i * 10)
        arrow(pl, a, (a[0] - 150, a[1] + 150), mix(CLAY, BONE, 0.38), 0.9, 7)

    ground(pl, GL, X0 - 46, X1 + 46)

    # outer walls, full height, blind on both sides
    pl.rect((X0, PAR, X0 + T, GL), fill=CHARCOAL)
    pl.rect((X1 - T, PAR, X1, GL), fill=CHARCOAL)
    # slabs, broken either side of the well
    for y in (FF, RF):
        slab(pl, (X0, y - T, WX0, y))
        slab(pl, (WX1, y - T, X1, y))
    slab(pl, (X0, GL - 11, X1, GL))
    # parapet, also broken at the well
    for x0, x1 in ((X0, WX0), (WX1, X1)):
        pl.rect((x0, PAR, x1, PAR + 9), fill=CHARCOAL)

    # the shaft, open the full height
    pl.hatch([(WX0, PAR + 9), (WX1, PAR + 9), (WX1, GL - 11), (WX0, GL - 11)],
             mix(CLAY_SOFT, BONE, 0.42), spacing=11, angle=90, w=0.7)
    for x in (WX0, WX1):
        pl.line((x, PAR), (x, GL), CLAY, 1.4)

    # daylight down the shaft, spilling into both floors
    for x in (728, 755, 782):
        pl.dash((x, PAR + 16), (x, GL - 18), mix(CLAY, BONE, 0.4), 0.8, 9, 7)
    for y in (FF - 46, GL - 46):
        arrow(pl, (WX0 - 6, y), (WX0 - 104, y), mix(CLAY, BONE, 0.3), 1.0, 7)
        arrow(pl, (WX1 + 6, y), (WX1 + 104, y), mix(CLAY, BONE, 0.3), 1.0, 7)

    # stack ventilation — hot air leaves the way the light came in
    arrow(pl, (755, PAR + 22), (755, PAR - 56), CLAY, 1.5, 10)
    pl.text((755, PAR - 72), "STACK VENTILATION", 10, CLAY, "mm", bold=True, track=2.0)

    for y0, y1, label in ((FF, GL, "GROUND FLOOR"), (RF, FF, "FIRST FLOOR")):
        pl.text((X0 + 112, (y0 + y1) / 2), label, 10, INK_MUTE, "mm", track=1.8)
    pl.text((560, PAR - 26), "TERRACE", 10, INK_MUTE, "mm", track=1.8)

    pl.dim((WX0, GL + 30), (WX1, GL + 30), "8'-0\"", 26, 1)
    pl.dim((X0, PAR), (X0, GL), "31'-6\"", 54, 1)
    pl.leader((WX1 + 4, 496), (1092, 496), "Every room opens")
    pl.text((1132, 514), "onto the well", 10.5, INK_SOFT, "lm")
    pl.leader((X0 + T, 780), (X0 - 108, 780), "Blind boundary", flip=True)
    pl.text((X0 - 148, 798), "wall", 10.5, INK_SOFT, "rm")

    pl.titleblock("P-02", "Section AA — light well", "1:100", PROJECT)


def plate_03(pl):
    """Street elevation. Quiet to the road, and only where it has to be."""
    pl.grid(); pl.border()

    X0, X1 = 462, 1038
    GL, PAR, TOP = 902, 386, 368

    ground(pl, GL, X0 - 54, X1 + 54)

    pl.rect((X0, TOP, X1, GL), fill=mix(SAND, BONE, 0.52))       # warm off-white plaster
    pl.stipple((X0 + 8, TOP + 8, X1 - 8, GL - 8), mix(INK_MUTE, BONE, 0.72), 17, 0.8)
    pl.rect((X0, TOP, X1, GL), outline=CHARCOAL, w=1.5)

    # solid parapet, capped
    pl.rect((X0, TOP, X1, PAR), fill=mix(SAND, BONE, 0.34))
    pl.line((X0, PAR), (X1, PAR), GRAPHITE, 1.0)
    pl.rect((X0 - 9, TOP - 9, X1 + 9, TOP), fill=CHARCOAL)

    # the single deep opening — reveal drawn, because the depth is the point
    OX0, OY0, OX1, OY1 = 636, 470, 866, 664
    pl.rect((OX0, OY0, OX1, OY1), fill=mix(GRAPHITE, BONE, 0.12))
    pl.rect((OX0 + 15, OY0 + 15, OX1 - 15, OY1 - 15), fill=CHARCOAL)
    for a, b in (((OX0, OY0), (OX0 + 15, OY0 + 15)), ((OX1, OY0), (OX1 - 15, OY0 + 15)),
                 ((OX0, OY1), (OX0 + 15, OY1 - 15)), ((OX1, OY1), (OX1 - 15, OY1 - 15))):
        pl.line(a, b, mix(INK_MUTE, BONE, 0.3), 0.7)
    pl.rect((OX0, OY0, OX1, OY1), outline=CHARCOAL, w=1.3)
    pl.line(((OX0 + OX1) / 2, OY0 + 15), ((OX0 + OX1) / 2, OY1 - 15), mix(CLAY, CHARCOAL, 0.55), 1.4)
    # exposed concrete lintel
    pl.rect((OX0 - 16, OY0 - 20, OX1 + 16, OY0), fill=mix(GRAPHITE, BONE, 0.42))
    pl.text(((OX0 + OX1) / 2, OY0 - 10), "EXPOSED CONCRETE LINTEL", 8.5, BONE, "mm", track=1.2)

    # recessed entry, teak only where a hand touches it
    EX0, EY0, EX1, EY1 = 505, 668, 600, GL
    pl.rect((EX0, EY0, EX1, EY1), fill=mix(GRAPHITE, BONE, 0.16))
    pl.rect((EX0 + 13, EY0 + 13, EX1, EY1), fill=CLAY)
    pl.hatch([(EX0 + 13, EY0 + 13), (EX1, EY0 + 13), (EX1, EY1), (EX0 + 13, EY1)],
             mix(CLAY, CHARCOAL, 0.6), spacing=7, angle=90, w=0.6)
    pl.rect((EX0, EY0, EX1, EY1), outline=CHARCOAL, w=1.3)
    pl.circle((EX1 - 13, (EY0 + EY1) / 2), 3.2, fill=BONE)

    pl.dim((X0, GL + 34), (X1, GL + 34), "30'-0\"", 28, 1)
    pl.dim((X1 + 12, TOP), (X1 + 12, GL), "34'-6\"", 40, -1)
    pl.leader((X0 + 62, TOP + 9), (X0 - 76, 296), "Solid parapet", flip=True)
    pl.leader((OX1, OY0 + 34), (X1 + 46, 452), "One deep opening")
    pl.leader((EX0, EY0 + 60), (X0 - 76, 706), "Teak — recessed entry", flip=True)

    pl.titleblock("P-03", "Street elevation", "1:100", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
