"""Courtyard House — Pollachi. An 18 x 18 court doing the cooling, not the AC."""

import math
from plate_kit import *

PROJECT = "Courtyard House — Pollachi"


def plate_01(pl):
    """Plan wrapped around the court, two households sharing it."""
    pl.grid(); pl.border()

    BX0, BY0, BX1, BY1 = 420, 200, 1080, 860      # 56 x 56 ft
    CX0, CY0, CX1, CY1 = 644, 424, 856, 636       # the 18 x 18 court
    VX0, VY0, VX1, VY1 = 550, 330, 950, 730       # verandah ring
    T = 11

    # mature trees worth keeping, so the plot is drawn generously
    pl.dashrect((BX0 - 46, BY0 - 46, BX1 + 46, BY1 + 46), mix(INK_MUTE, BONE, 0.24), 0.8, 9, 6)
    for c in ((BX0 - 26, BY1 + 20), (BX1 + 24, BY0 - 22)):
        pl.circle(c, 30, outline=mix(INK_MUTE, BONE, 0.4), w=0.7)
        pl.circle(c, 3.2, fill=mix(INK_MUTE, BONE, 0.2))
    pl.text((BX0 - 26, BY1 + 60), "TREES RETAINED", 8.5, INK_MUTE, "mm", track=1.2)

    # 1 — tints
    warm, cool, ver = (mix(SAND, BONE, 0.68), mix(SAND, BONE, 0.56), mix(SAND, BONE, 0.84))
    tint(pl, (BX0, BY0, BX1, BY1), ver)
    for box, c in (((BX0, BY0, 700, 330), warm), ((700, BY0, 830, 330), cool),
                   ((830, BY0, BX1, 330), cool),
                   ((BX0, 330, VX0, 530), cool), ((BX0, 530, VX0, 730), cool),
                   ((VX1, 330, BX1, 530), warm), ((VX1, 530, BX1, 730), warm),
                   ((BX0, 730, 800, BY1), warm), ((800, 730, BX1, BY1), ver)):
        tint(pl, box, c)

    # 2 — walls
    walls(pl, (BX0, BY0, BX1, BY1), t=T)
    for a, b in (((BX0, 330), (VX0, 330)), ((VX1, 330), (BX1, 330)),
                 ((BX0, 730), (VX0, 730)), ((VX1, 730), (BX1, 730)),
                 ((VX0, BY0), (VX0, 330)), ((VX1, BY0), (VX1, 330)),
                 ((VX0, 730), (VX0, BY1)), ((VX1, 730), (VX1, BY1)),
                 ((700, BY0), (700, 330)), ((830, BY0), (830, 330)),
                 ((BX0, 530), (VX0, 530)), ((VX1, 530), (BX1, 530)),
                 ((800, 730), (800, BY1))):
        partition(pl, a, b)

    # 3 — the court, and the verandah that rings it
    pl.dashrect((VX0, VY0, VX1, VY1), mix(INK_MUTE, BONE, 0.34), 0.8, 8, 6)
    pl.rect((CX0, CY0, CX1, CY1), fill=BONE)
    pl.stipple((CX0 + 12, CY0 + 12, CX1 - 12, CY1 - 12), mix(CLAY_SOFT, BONE, 0.5), 15, 1.1)
    pl.rect((CX0, CY0, CX1, CY1), outline=CLAY, w=1.7)
    for x in (CX0, 750, CX1):
        for y in (CY0, 530, CY1):
            if (x, y) != (750, 530):
                pl.rect((x - 8, y - 8, x + 8, y + 8), fill=CHARCOAL)
    pl.circle((750, 530), 26, outline=mix(CLAY, BONE, 0.3), w=0.9)
    pl.circle((750, 530), 3, fill=CLAY)
    pl.text((750, CY0 - 30), "COURTYARD", 11, CLAY, "mm", bold=True, track=2.2)
    pl.text((750, CY1 + 30), "OPEN TO SKY", 9.5, CLAY, "mm", track=1.8)
    pl.text((750, 578), "18'-0 x 18'-0", 9.5, CLAY, "mm")
    pl.text((VX0 + 44, VY0 + 30), "VERANDAH", 9, INK_MUTE, "mm", track=1.6)

    # 4 — openings: every room takes its light off the court
    for box, h in (((620, 326, 700, 334), True), ((800, 326, 880, 334), True),
                   ((620, 726, 700, 734), True), ((800, 726, 880, 734), True),
                   ((546, 470, 554, 590), False), ((946, 470, 954, 590), False)):
        window(pl, box, h)
    opening(pl, (900, BY1 - 6, 990, BY1 + 6))
    door(pl, (900, BY1), 52, 268, 356)

    # 5 — labels
    room(pl, (BX0, BY0, 700, 330), "Bedroom — elders", "13'0 x 11'0", 9.5)
    room(pl, (700, BY0, 830, 330), "Bath", None, 10)
    room(pl, (830, BY0, BX1, 330), "Stair", None, 10)
    room(pl, (BX0, 330, VX0, 530), "Kitchen", "11'0 x 10'0", 10.5)
    room(pl, (BX0, 530, VX0, 730), "Store", None, 10)
    room(pl, (VX1, 330, BX1, 530), "Dining", "12'0 x 10'0", 10.5)
    room(pl, (VX1, 530, BX1, 730), "Pooja", None, 10)
    room(pl, (BX0, 730, 800, BY1), "Living", "18'0 x 12'0", 11)
    pl.text((940, 762), "ENTRY", 10, INK_SOFT, "mm", track=1.5)

    pl.dim((BX0, BY1 + 46), (BX1, BY1 + 46), "56'-0\"", 62, 1)
    pl.northpoint((1170, 214))
    pl.leader((VX0 + 30, 400), (330, 300), "Deep verandah —", flip=True)
    pl.text((294, 318), "shades the wall, not", 10.5, INK_SOFT, "rm")
    pl.text((294, 334), "the air conditioner", 10.5, INK_SOFT, "rm")
    pl.leader((VX1 - 6, 700), (1178, 742), "Two households share")
    pl.text((1218, 760), "the court, not a corridor", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-01", "Ground floor plan", "1:120", PROJECT)


def plate_02(pl):
    """Section: what actually keeps the house cool through April."""
    pl.grid(); pl.border()

    X0, X1 = 430, 1070
    GL, FF, RF, TOP = 878, 658, 438, 404
    CX0, CX1 = 647, 853
    T = 13

    sun(pl, (352, 176))
    for i in range(4):
        a = (386 + i * 15, 212 + i * 10)
        arrow(pl, a, (a[0] + 152, a[1] + 152), mix(CLAY, BONE, 0.4), 0.9, 7)

    ground(pl, GL, X0 - 60, X1 + 60)
    pl.rect((X0, TOP, X0 + T, GL), fill=CHARCOAL)
    pl.rect((X1 - T, TOP, X1, GL), fill=CHARCOAL)
    for y in (FF, RF):
        slab(pl, (X0, y - T, CX0, y))
        slab(pl, (CX1, y - T, X1, y))
    slab(pl, (X0, GL - 11, X1, GL))

    # roof carries an air gap over the slab
    for x0, x1 in ((X0 - 22, CX0), (CX1, X1 + 22)):
        pl.rect((x0, TOP, x1, TOP + 9), fill=CHARCOAL)
        pl.dash((x0, TOP + 22), (x1, TOP + 22), mix(INK_MUTE, BONE, 0.3), 0.7, 8, 6)
    pl.leader((X1 - 60, TOP + 15), (X1 + 92, 300), "Air gap over the slab")

    # the court, open the full height
    pl.hatch([(CX0, TOP), (CX1, TOP), (CX1, GL - 11), (CX0, GL - 11)],
             mix(CLAY_SOFT, BONE, 0.6), spacing=14, angle=90, w=0.7)
    for x in (CX0, CX1):
        pl.line((x, TOP), (x, GL), CLAY, 1.4)

    # verandah columns onto the court, both floors
    for x in (CX0 - 60, CX1 + 60):
        for y0, y1 in ((FF, GL - 11), (RF, FF)):
            pl.rect((x - 7, y0, x + 7, y1), fill=GRAPHITE)

    # stack effect: hot air out of the top, cool air pulled in low
    arrow(pl, (750, TOP + 40), (750, TOP - 74), CLAY, 1.7, 11)
    pl.text((750, TOP - 92), "STACK EFFECT", 10.5, CLAY, "mm", bold=True, track=2.2)
    for y in (GL - 42, FF - 42):
        arrow(pl, (CX0 - 118, y), (CX0 - 14, y), mix(CLAY, BONE, 0.3), 1.0, 7)
        arrow(pl, (CX1 + 118, y), (CX1 + 14, y), mix(CLAY, BONE, 0.3), 1.0, 7)

    pl.text((505, (GL + FF) / 2 - 12), "GROUND FLOOR", 9.5, INK_MUTE, "mm", track=1.6)
    pl.text((505, (GL + FF) / 2 + 8), "ELDERS", 8.5, INK_MUTE, "mm", track=1.4)
    pl.text((505, (FF + RF) / 2 - 12), "FIRST FLOOR", 9.5, INK_MUTE, "mm", track=1.6)
    pl.text((505, (FF + RF) / 2 + 8), "YOUNGER FAMILY", 8.5, INK_MUTE, "mm", track=1.4)

    pl.dim((CX0, GL + 34), (CX1, GL + 34), "18'-0\"", 26, 1)
    pl.dim((X0, TOP), (X0, GL), "29'-0\"", 56, 1)
    pl.leader((CX1 + 60, 782), (1148, 862), "Verandah depth set")
    pl.text((1188, 880), "by the afternoon sun", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-02", "Section BB — courtyard", "1:120", PROJECT)


def plate_03(pl):
    """Shading study. The verandah depth is a calculation, not a gesture."""
    pl.grid(); pl.border()

    GL, EAVE = 838, 424
    COL, WALL = 706, 1010            # verandah column, face of the house
    EX, EY = COL - 44, EAVE - 14     # outer edge of the eave — what casts the shadow
    DROP = GL - EY

    # The sun is far enough away that its rays are parallel, so each hour is one
    # angle: altitude, the ray that just clears the eave, and where it lands.
    hours = [("13:00", 85, 0.30), ("11:00", 70, 0.46), ("15:30", 51, 0.62)]
    for label, alt, fade in hours:
        rad = math.radians(alt)
        vx, vy = math.cos(rad), math.sin(rad)
        land = EX + DROP * vx / vy
        tone = mix(CLAY, BONE, fade)
        for k in (-1, 0, 1):                       # a small sheaf of parallel rays
            ox, oy = k * 34 * vy, -k * 34 * vx
            sx, sy = EX + ox - vx * 300, EY + oy - vy * 300
            ex, ey = EX + ox, EY + oy
            pl.dash((sx, sy), (ex, ey), tone, 0.9 if k == 0 else 0.6, 10, 7)
        pl.dash((EX, EY), (land, GL), tone, 0.9, 10, 7)
        pl.circle((land, GL), 3.4, fill=tone)
        pl.text((land, GL + 22), label, 9.5, tone, "mm", track=1.4)
        sun(pl, (EX - vx * 296, EY - vy * 296), 14, 12, tone)
        pl.text((EX - vx * 296, EY - vy * 296 - 28), label, 9, INK_MUTE, "mm", track=1.2)

    ground(pl, GL, 336, 1164)
    pl.rect((WALL, 300, WALL + 15, GL), fill=CHARCOAL)
    pl.rect((COL - 8, EAVE, COL + 8, GL), fill=GRAPHITE)
    pl.rect((EX, EY, WALL + 15, EAVE), fill=CHARCOAL)
    pl.rect((WALL + 15, 300, WALL + 128, GL), fill=mix(SAND, BONE, 0.66))
    pl.text((WALL + 72, 620), "INTERIOR", 9.5, INK_MUTE, "mm", track=1.6)

    # the wall the verandah is there to protect
    pl.hatch([(COL + 8, EAVE), (WALL, EAVE), (WALL, GL), (COL + 8, GL)],
             mix(CLAY_SOFT, BONE, 0.66), spacing=12, angle=60, w=0.6)
    pl.text((858, 672), "WALL IN SHADE", 10, CLAY, "mm", bold=True, track=1.8)
    pl.text((858, 692), "UNTIL 15:30", 10, CLAY, "mm", track=1.8)

    pl.dim((COL, EY), (WALL, EY), "8'-0\" VERANDAH", 44, -1)
    pl.dim((WALL + 15, EAVE), (WALL + 15, GL), "11'-0\"", 152, -1)

    pl.rect((336, 926, 812, 994), outline=mix(INK_MUTE, BONE, 0.45), w=0.8)
    pl.text((360, 950), "THROUGH APRIL", 9.5, CLAY, "lm", bold=True, track=2.0)
    pl.text((360, 974), "interior sits 3–4°C below the street", 10.5, INK_SOFT, "lm")

    pl.titleblock("P-03", "Shading study", "1:120", PROJECT)


PLATES = [plate_01, plate_02, plate_03]
