"""Perspective views for the project cards. One per project — exterior where the
project is a building, interior where it is a fit-out."""

import math
from render_kit import *


# ===========================================================================
# 01  Rathinapuri Residence — the quiet street face, at dusk
# ===========================================================================

def r_rathinapuri(sc):
    p = Persp(hz=706, vpl=-760, vpr=2680)
    CX, TOP, GL = 646, 288, 902                      # near corner of the house
    LX, RX = 296, 1188                               # far ends of each face
    WALL_L = shade(mix(PLASTER, DUSK_MID, 0.42), -0.60)
    WALL_R = mix(PLASTER, WARM, 0.20)

    # --- sky: warmest where the sun has just gone -------------------------
    sc.vgrad((0, 0, W, 470), DUSK_HI, DUSK_MID)
    sc.vgrad((0, 470, W, 760), DUSK_MID, DUSK_LO)
    for cy, cw, ch, al in ((330, 520, 44, 34), (250, 380, 32, 26), (410, 660, 30, 22)):
        sc.glow([(200, cy), (200 + cw, cy - ch), (200 + cw + 160, cy + ch),
                 (140, cy + ch)], shade(DUSK_LO, 0.3), al, 34)
    sc.glow([(1120, 620), (W + 90, 600), (W + 90, 800), (1120, 800)], DUSK_LO, 130, 96)

    # --- the far side of the street ---------------------------------------
    for x0, x1, h, t in ((-40, 236, 146, -0.60), (236, 452, 92, -0.68),
                         (452, 560, 116, -0.64), (1156, 1402, 124, -0.56),
                         (1402, W + 40, 172, -0.64)):
        sc.surface([(x0, 706 - h), (x1, 706 - h), (x1, 714), (x0, 714)],
                   shade(DUSK_MID, t + 0.06), shade(DUSK_MID, t - 0.08), tex=16)
    for i in range(11):
        if i % 4 == 3:
            continue
        sc.rect((26 + i * 46, 636 + (i % 3) * 14, 40 + i * 46, 654 + (i % 3) * 14),
                fill=shade(WARM, -0.44))
    sc.glow([(20, 620), (560, 620), (560, 712), (20, 712)], WARM, 30, 30)

    # --- ground: warm near, cool away, with joints running to the corners --
    sc.vgrad((0, 700, W, H), shade(ROAD, -0.20), shade(ROAD, -0.66))
    for t in (0.2, 0.44, 0.72, 1.0):
        y = 716 + (H - 716) * t
        sc.softline((0, y), (W, y - 46 * t), shade(ROAD, -0.42), 1.6, 84, 3.0)
    sc.poly([(0, 952), (W, 884), (W, 916), (0, 986)], fill=shade(ROAD, -0.44))
    sc.softline((0, 952), (W, 884), shade(ROAD, 0.22), 1.4, 92, 1.8)
    for i in range(5):                                  # centre line, receding
        x0 = -60 + i * 340
        sc.poly([(x0, 1086), (x0 + 150, 1086), (x0 + 128, 1054), (x0 + 4, 1054)],
                fill=shade(ROAD, 0.3))

    # --- cast shadow, thrown left across the road -------------------------
    sc.shadow([(CX - 14, GL + 4), (LX, p.y_at(LX, CX, GL, p.vpl)),
               (LX - 232, p.y_at(LX, CX, GL, p.vpl) + 176), (CX - 30, GL + 214)],
              blur=30, alpha=118)

    # --- neighbours, hard against both long walls -------------------------
    for xa, xb, vp, top, tone in ((LX - 200, LX + 6, p.vpl, TOP + 96, -0.86),
                                  (RX - 6, RX + 230, p.vpr, TOP + 78, -0.84)):
        sc.surface([(xa, p.y_at(xa, CX, top, vp)), (xb, p.y_at(xb, CX, top, vp)),
                    (xb, p.y_at(xb, CX, GL, vp)), (xa, p.y_at(xa, CX, GL, vp))],
                   shade(PLASTER, tone + 0.06), shade(PLASTER, tone - 0.06), tex=20)

    # --- the house ---------------------------------------------------------
    left = p.face(LX, CX, TOP, GL, p.vpl)
    right = p.face(CX, RX, TOP, GL, p.vpr)
    sc.surface(left, shade(WALL_L, 0.10), shade(WALL_L, -0.20), tex=26)
    sc.surface(right, shade(WALL_R, 0.08), shade(WALL_R, -0.30), tex=26)

    # solid parapet, its coping, and the shadow the coping throws
    for vp, xa, xb, tone in ((p.vpl, LX, CX, -0.44), (p.vpr, CX, RX, -0.10)):
        cap = [(xa, p.y_at(xa, CX, TOP - 13, vp)), (xb, p.y_at(xb, CX, TOP - 13, vp)),
               (xb, p.y_at(xb, CX, TOP + 3, vp)), (xa, p.y_at(xa, CX, TOP + 3, vp))]
        sc.poly_grad(cap, shade(CONC_D, tone + 0.34), shade(CONC_D, tone + 0.02))
        sc.softline((xa, p.y_at(xa, CX, TOP + 8, vp)), (xb, p.y_at(xb, CX, TOP + 8, vp)),
                    shade(CHARCOAL, 0.0), 5.0, 54, 5.0)

    # the light well, giving itself away above the parapet
    sc.glow([(CX + 6, TOP - 96), (CX + 150, TOP - 96), (CX + 150, TOP - 8),
             (CX + 6, TOP - 8)], WARM, 74, 34)

    # one deep opening, and the reveal that makes it deep
    ox = p.div(CX, RX, 5, p.vpr)
    op = p.panel(ox[1], ox[3], TOP, GL, p.vpr, 0.30, 0.60, CX, TOP, GL)
    ip = p.panel(ox[1] + 28, ox[3] - 18, TOP, GL, p.vpr, 0.348, 0.556, CX, TOP, GL)
    sc.poly(op, fill=shade(CHARCOAL, 0.16))
    sc.poly_grad([op[0], ip[0], ip[3], op[3]], shade(WALL_R, -0.4), shade(WALL_R, -0.56))
    sc.poly_grad([op[0], op[1], ip[1], ip[0]], shade(CHARCOAL, 0.22), shade(CHARCOAL, 0.04))
    sc.glass(ip, warm=WARM, sheen=0.30)
    sc.glow(ip, WARM, 104, 40)
    lint = p.panel(ox[1] - 17, ox[3] + 13, TOP, GL, p.vpr, 0.266, 0.311, CX, TOP, GL)
    sc.surface(lint, shade(CONC_D, 0.24), shade(CONC_D, -0.16), tex=22)

    # recessed entry, teak only where a hand touches it
    ep = p.panel(ox[3] + 40, ox[4] + 24, TOP, GL, p.vpr, 0.60, 1.0, CX, TOP, GL)
    sc.poly_grad(ep, shade(CHARCOAL, 0.22), shade(CHARCOAL, 0.06))
    dp = p.panel(ox[3] + 58, ox[4] + 16, TOP, GL, p.vpr, 0.625, 0.995, CX, TOP, GL)
    sc.surface(dp, TEAK_L, shade(TEAK, -0.22), tex=30, tone=-0.4)
    for k in range(7):
        t = (k + 1) / 8
        x = dp[0][0] + (dp[1][0] - dp[0][0]) * t
        sc.line((x, dp[0][1] + (dp[1][1] - dp[0][1]) * t),
                (x, dp[3][1] + (dp[2][1] - dp[3][1]) * t), shade(TEAK, -0.34), 0.7)
    sc.circle(((dp[0][0] + dp[1][0]) / 2 + 24, (dp[0][1] + dp[3][1]) / 2), 2.8,
              fill=shade(SAND, 0.34))
    sc.glow([(ep[0][0] - 36, ep[0][1]), (ep[1][0] + 36, ep[1][1]),
             (ep[2][0] + 36, ep[2][1] + 34), (ep[3][0] - 36, ep[3][1] + 34)],
            WARM, 74, 32)

    # --- what holds the form: corner light, contact shadow, plinth ---------
    sc.softline((CX, TOP - 13), (CX, GL), shade(PLASTER, 0.5), 1.4, 90, 1.6)
    sc.occlude([(LX - 60, p.y_at(LX, CX, GL, p.vpl) - 6), (CX, GL - 6),
                (RX + 60, p.y_at(RX, CX, GL, p.vpr) - 6),
                (RX + 60, p.y_at(RX, CX, GL, p.vpr) + 74), (CX, GL + 86),
                (LX - 60, p.y_at(LX, CX, GL, p.vpl) + 74)], blur=34, alpha=132)
    sc.occlude([(LX, p.y_at(LX, CX, GL, p.vpl) - 3), (CX, GL - 3),
                (RX, p.y_at(RX, CX, GL, p.vpr) - 3),
                (RX, p.y_at(RX, CX, GL, p.vpr) + 14), (CX, GL + 16),
                (LX, p.y_at(LX, CX, GL, p.vpl) + 14)], blur=6, alpha=128)
    for vp, xa, xb in ((p.vpl, LX, CX), (p.vpr, CX, RX)):
        sc.poly_grad([(xa, p.y_at(xa, CX, GL - 22, vp)), (xb, p.y_at(xb, CX, GL - 22, vp)),
                      (xb, p.y_at(xb, CX, GL, vp)), (xa, p.y_at(xa, CX, GL, vp))],
                     shade(CONC_D, -0.34), shade(CONC_D, -0.5))

    # street lamp, and planting to break the base line
    sc.rect((1396, 214, 1406, 946), fill=shade(DUSK_HI, 0.22))
    sc.rect((1330, 208, 1408, 220), fill=shade(DUSK_HI, 0.26))
    sc.glow([(1300, 190), (1420, 190), (1420, 258), (1300, 258)], WARM, 168, 44)
    shrub(sc, 1244, p.y_at(1244, CX, GL, p.vpr) + 14, 46, 48, shade(GRASS_D, -0.52))
    shrub(sc, 214, p.y_at(214, CX, GL, p.vpl) + 22, 56, 58, shade(GRASS_D, -0.58))

    sc.vignette(70)
    sc.grain(6, 24)
    sc.caption("RATHINAPURI RESIDENCE", "COIMBATORE · 2025")



# ===========================================================================
# 02  Courtyard House — standing in the verandah shade, looking into the sun
# ===========================================================================

def r_courtyard(sc):
    """Low, long, and mostly verandah — the shade is the architecture."""
    p = Persp(hz=690, vpl=-980, vpr=2460)
    CX, TOP, GL = 552, 396, 856
    LX, RX = 176, 1332
    lit = mix(PLASTER, WARM, 0.16)
    shaded = mix(PLASTER, SKY_MID, 0.30)

    daylight_sky(sc, sun=(250, 180), warm=0.16)
    tree(sc, 1300, 706, 300, spread=0.62, tone=shade(GRASS_D, 0.34), back=True, seed=1)
    tree(sc, 120, 700, 250, spread=0.58, tone=shade(GRASS_D, 0.36), back=True, seed=2)

    # lawn and the plot it sits in
    sc.poly_grad([(0, 686), (W, 686), (W, H), (0, H)],
                 shade(mix(GRASS, WARM, 0.16), 0.24), shade(mix(GRASS, WARM, 0.1), -0.24))
    sc.softline((0, 700), (W, 694), shade(GRASS_D, -0.1), 2.4, 60, 6.0)

    # the house shadow, thrown right, low sun off the left
    sc.shadow([(CX + 10, GL + 4), (RX, p.y_at(RX, CX, GL, p.vpr)),
               (RX + 262, p.y_at(RX, CX, GL, p.vpr) + 128), (CX + 40, GL + 172)],
              blur=30, alpha=112)

    exterior_shell(sc, p, CX, LX, RX, TOP, GL, lit, shaded)

    # --- the deep verandah, along the long face ---------------------------
    VT, VB = TOP + 96, GL                      # verandah opening
    xs = p.div(CX, RX, 6, p.vpr)
    op = [(xs[0], p.y_at(xs[0], CX, VT, p.vpr)), (xs[6], p.y_at(xs[6], CX, VT, p.vpr)),
          (xs[6], p.y_at(xs[6], CX, VB, p.vpr)), (xs[0], p.y_at(xs[0], CX, VB, p.vpr))]
    sc.poly_grad(op, shade(shaded, -0.62), shade(shaded, -0.44))
    for k in range(1, 6):                                  # the wall behind, in shade
        x0, x1 = xs[k] - 6, xs[k] + 6
        if k % 2:
            sc.poly_grad([(x0 - 40, p.y_at(x0 - 40, CX, VT + 60, p.vpr)),
                          (x1 + 40, p.y_at(x1 + 40, CX, VT + 60, p.vpr)),
                          (x1 + 40, p.y_at(x1 + 40, CX, VB - 40, p.vpr)),
                          (x0 - 40, p.y_at(x0 - 40, CX, VB - 40, p.vpr))],
                         shade(WARM, -0.52), shade(WARM, -0.70))
    for k, x in enumerate(xs):                             # columns, foreshortened
        w = 30 * (1 - k * 0.11)
        ty, by = p.y_at(x, CX, VT - 8, p.vpr), p.y_at(x, CX, VB, p.vpr)
        sc.poly_grad([(x - w / 2, ty), (x + w / 2, ty), (x + w / 2, by), (x - w / 2, by)],
                     shade(lit, 0.10), shade(lit, -0.34), horizontal=True)
        sc.softline((x - w / 2, ty), (x - w / 2, by), shade(lit, 0.44), 1.2, 76, 1.4)
    beam = [(xs[0], p.y_at(xs[0], CX, VT - 34, p.vpr)), (xs[6], p.y_at(xs[6], CX, VT - 34, p.vpr)),
            (xs[6], p.y_at(xs[6], CX, VT - 6, p.vpr)), (xs[0], p.y_at(xs[0], CX, VT - 6, p.vpr))]
    sc.poly_grad(beam, shade(lit, 0.12), shade(lit, -0.16))

    # --- entry on the lit face, and the court giving itself away ----------
    ex = p.div(CX, LX, 3, p.vpl)
    dp = p.panel(ex[2], ex[1], TOP, GL, p.vpl, 0.52, 1.0, CX, TOP, GL)
    sc.poly(dp, fill=shade(CHARCOAL, 0.2))
    sc.surface([(dp[0][0] + 12, dp[0][1] + 8), (dp[1][0] - 12, dp[1][1] + 8),
                (dp[2][0] - 12, dp[2][1]), (dp[3][0] + 12, dp[3][1])],
               TEAK_L, shade(TEAK, -0.24), tex=30, tone=-0.4)
    wp = p.panel(ex[1] - 14, ex[0] - 44, TOP, GL, p.vpl, 0.22, 0.48, CX, TOP, GL)
    sc.poly(wp, fill=shade(CHARCOAL, 0.22))
    sc.glass([(wp[0][0] + 8, wp[0][1] + 6), (wp[1][0] - 8, wp[1][1] + 6),
              (wp[2][0] - 8, wp[2][1] - 6), (wp[3][0] + 8, wp[3][1] - 6)], sheen=0.5)

    ground_contact(sc, p, CX, LX, RX, GL)

    # a paved approach, and planting against the base
    sc.poly_grad([(0, 1052), (W, 986), (W, 1125), (0, 1125)],
                 shade(PAVING, 0.04), shade(PAVING, -0.22))
    sc.softline((0, 1052), (W, 986), shade(PAVING_D, -0.2), 2.0, 74, 2.4)
    shrub(sc, 300, p.y_at(300, CX, GL, p.vpl) + 26, 96, 68, shade(GRASS_D, 0.1))
    shrub(sc, 1180, p.y_at(1180, CX, GL, p.vpr) + 30, 104, 62, shade(GRASS_D, 0.04))

    sc.vignette(64)
    sc.grain(6, 20)
    sc.caption("COURTYARD HOUSE", "POLLACHI · 2024")


# ===========================================================================
# 03  The Loft Living Room — the double height, with the cove on
# ===========================================================================

def r_loft(sc):
    rm = Room(vp=(742, 660), back=(486, 244, 1010, 800))
    A, B, C, D = rm.A, rm.B, rm.C, rm.D

    rm.shell(sc,
             ceil=(shade(BONE, -0.2), shade(BONE, -0.06)),
             floor=(shade(mix(SAND, TEAK, 0.24), -0.3), shade(mix(SAND, TEAK, 0.24), -0.5)),
             wall_l=(shade(PLASTER, -0.34), shade(PLASTER, -0.12)),
             wall_r=(shade(PLASTER, -0.08), shade(PLASTER, -0.3)),
             back=(mix(PLASTER, WARM, 0.08), shade(PLASTER, -0.14)))

    # tall window on the left, which is where the daylight comes from
    wx = rm.depth(486, 60, 3)
    win = [(wx[2], rm.ray_y(wx[2], A) + 40), (wx[0], rm.ray_y(wx[0], A) + 22),
           (wx[0], rm.ray_y(wx[0], D) - 30), (wx[2], rm.ray_y(wx[2], D) - 74)]
    sc.glass(win, light=shade(BONE, -0.02), dark=shade(SKY_MID, 0.2), sheen=0.6)
    sc.glow(win, mix(BONE, WARM, 0.2), 96, 60)
    for t in (0.34, 0.67):
        xa = wx[0] + (wx[2] - wx[0]) * t
        sc.line((xa, rm.ray_y(xa, A) + 30), (xa, rm.ray_y(xa, D) - 50), shade(CHARCOAL, 0.24), 1.4)

    # cove, washing the top of the double-height volume
    sc.poly_grad([(486, 244), (1010, 244), (1010, 300), (486, 300)],
                 mix(BONE, WARM, 0.34), shade(mix(PLASTER, WARM, 0.2), -0.06))
    sc.glow([(492, 246), (1004, 246), (1004, 316), (492, 316)], WARM, 116, 34)
    sc.rect((492, 316, 1004, 326), fill=shade(GRAPHITE, 0.16))

    # the art wall, the television, and the floating veneer unit
    for bx0, bx1, by0, by1 in ((508, 574, 402, 500), (508, 574, 526, 600)):
        sc.poly_grad([(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)],
                     shade(SAND, 0.2), shade(SAND, -0.16))
        sc.poly([(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)],
                outline=shade(CHARCOAL, 0.3), w=1.0)
        sc.glow([(bx0 - 20, by0 - 24), (bx1 + 20, by0 - 24), (bx1 + 20, by1), (bx0 - 20, by1)],
                WARM, 44, 22)
    sc.poly_grad([(646, 430), (900, 430), (900, 574), (646, 574)],
                 shade(CHARCOAL, 0.22), shade(CHARCOAL, 0.06))
    UX0, UX1, UY0, UY1 = 594, 962, 624, 668
    sc.surface([(UX0, UY0), (UX1, UY0), (UX1, UY1), (UX0, UY1)],
               TEAK_L, shade(TEAK, -0.18), tex=34, tone=-0.4)
    for k in range(15):
        x = UX0 + (k + 1) * (UX1 - UX0) / 16
        sc.line((x, UY0 + 3), (x, UY1 - 3), shade(TEAK, -0.34), 0.6)
    sc.occlude([(UX0, UY1), (UX1, UY1), (UX1, UY1 + 34), (UX0, UY1 + 34)], blur=13, alpha=124)

    # daylight pooling on the floor, then furniture from the back forward
    sc.glow([(566, 836), (904, 812), (1044, 1004), (474, 1064)],
            mix(BONE, WARM, 0.34), 74, 50)
    sc.poly_grad([(504, 836), (992, 836), (1124, 1074), (364, 1074)],
                 shade(SAND, 0.12), shade(SAND, -0.18))
    sc.shadow([(662, 876), (854, 876), (874, 918), (642, 918)], blur=14, alpha=98)
    sc.poly_grad([(670, 854), (846, 854), (862, 890), (654, 890)],
                 shade(TEAK_L, -0.06), shade(TEAK, -0.26))
    sc.shadow([(486, 986), (1022, 986), (1070, 1084), (444, 1084)], blur=26, alpha=104)
    sc.poly_grad([(470, 928), (536, 928), (536, 1066), (452, 1066)],
                 shade(SAND, 0.22), shade(SAND, -0.02))
    sc.poly_grad([(974, 928), (1042, 928), (1060, 1066), (974, 1066)],
                 shade(SAND, 0.04), shade(SAND, -0.20))
    sc.poly_grad([(536, 914), (974, 914), (974, 1048), (536, 1048)],
                 shade(SAND, 0.26), shade(SAND, 0.02))
    sc.softline((536, 914), (974, 914), shade(SAND, 0.46), 2.2, 96, 2.2)
    for x in (684, 826):
        sc.softline((x, 918), (x, 1044), shade(SAND, -0.24), 1.2, 70, 1.4)

    sc.vignette(72)
    sc.grain(6, 22)
    sc.caption("THE LOFT LIVING ROOM", "COIMBATORE · 2025")



# ===========================================================================
# 04  MAK Complex — the reception, which is the tone-setter
# ===========================================================================

def r_mak(sc):
    rm = Room(vp=(742, 646), back=(474, 322, 1014, 812))
    A, B, C, D = rm.A, rm.B, rm.C, rm.D

    rm.shell(sc,
             ceil=(shade(BONE, -0.26), shade(BONE, -0.08)),
             floor=(shade(mix(SAND, SKY_MID, 0.4), -0.16), shade(mix(SAND, SKY_MID, 0.4), -0.36)),
             wall_l=(shade(PLASTER, -0.30), shade(PLASTER, -0.10)),
             wall_r=(shade(PLASTER, -0.06), shade(PLASTER, -0.28)),
             back=(shade(PLASTER, -0.04), shade(PLASTER, -0.16)))

    # linear downlights, running away over the floor plate
    for x0, x1, corner in ((rm.depth(474, 60, 3), None, A), (rm.depth(1014, 1440, 3), None, B)):
        for i in range(3):
            xa, xb = x0[i], x0[i + 1]
            ya, yb = rm.ray_y(xa, corner), rm.ray_y(xb, corner)
            sc.poly_grad([(xa, ya + 26), (xb, yb + 26), (xb, yb + 40), (xa, ya + 40)],
                         shade(BONE, -0.02), shade(BONE, -0.16))
            sc.glow([(xa, ya + 24), (xb, yb + 24), (xb, yb + 54), (xa, ya + 54)],
                    mix(BONE, WARM, 0.24), 92, 26)

    # the veneer wall — the one place the veneer was spent
    VX0, VX1, VY0, VY1 = 506, 982, 344, 812
    sc.surface([(VX0, VY0), (VX1, VY0), (VX1, VY1), (VX0, VY1)],
               shade(TEAK_L, 0.06), shade(TEAK, -0.30), tex=34, tone=-0.4)
    for k in range(23):
        x = VX0 + (k + 1) * (VX1 - VX0) / 24
        sc.line((x, VY0 + 4), (x, VY1), shade(TEAK, -0.34), 0.7)
    sc.glow([(VX0 - 20, VY0 - 26), (VX1 + 20, VY0 - 26), (VX1 + 20, VY0 + 40),
             (VX0 - 20, VY0 + 40)], WARM, 96, 30)

    # backlit identity
    sc.glow([(566, 396), (922, 396), (922, 512), (566, 512)], mix(WARM, BONE, 0.5), 128, 34)
    sc.text((744, 442), "KONST", 30, mix(BONE, WARM, 0.16), "mm", bold=True, track=11.0)
    sc.text((744, 486), "DESIGN", 12, mix(BONE, WARM, 0.3), "mm", track=11.0)

    # the counter, and the accent that starts here
    sc.shadow([(560, 812), (930, 812), (966, 872), (524, 872)], blur=20, alpha=104)
    sc.poly_grad([(566, 700), (924, 700), (924, 828), (566, 828)],
                 shade(SAND, 0.16), shade(SAND, -0.14))
    sc.poly_grad([(554, 686), (936, 686), (936, 706), (554, 706)],
                 shade(GRAPHITE, 0.34), shade(GRAPHITE, 0.1))
    sc.rect((566, 818, 924, 828), fill=shade(CLAY, -0.1))
    for x in (686, 806):
        sc.softline((x, 706), (x, 818), shade(SAND, -0.24), 1.1, 66, 1.3)

    # vitrified floor, and what it gives back
    sc.poly_grad([(566, 828), (924, 828), (966, 924), (524, 924)],
                 shade(SAND, -0.34), shade(SAND, -0.5))
    sc.glow([(600, 828), (890, 828), (940, 960), (550, 960)], mix(WARM, BONE, 0.3), 44, 40)
    fx = rm.depth(474, 60, 4)
    for x in fx[1:]:
        sc.softline((x, rm.ray_y(x, D)), (1488 - x, rm.ray_y(x, D)),
                    shade(SAND, -0.44), 1.2, 46, 2.0)

    # the accent, running out of frame toward the stair
    sc.poly_grad([(1014, 690), (1440, 664), (1440, 684), (1014, 706)],
                 shade(CLAY, 0.1), shade(CLAY, -0.2))

    sc.vignette(70)
    sc.grain(6, 22)
    sc.caption("MAK COMPLEX INTERIORS", "DINDIGUL · 2024")


# ===========================================================================
# 05  Saravanampatti Villa — the render the client signed off on
# ===========================================================================

def r_villa(sc):
    p = Persp(hz=712, vpl=-880, vpr=2560)
    CX, GL = 604, 892
    LX, RX = 214, 1288
    GF, FF = 560, 262                     # ground floor head, first floor head
    lit = mix(PLASTER, WARM, 0.22)
    shaded = mix(PLASTER, SKY_MID, 0.34)

    daylight_sky(sc, sun=(232, 176), warm=0.28)
    tree(sc, 1352, 726, 372, spread=0.62, tone=shade(GRASS_D, 0.28), back=True, seed=3)

    # the boundary cladding — the material the model changed — runs behind
    sc.surface([(0, 622), (W, 610), (W, 706), (0, 718)],
               shade(mix(CLAY, SAND, 0.30), 0.10), shade(mix(CLAY, SAND, 0.18), -0.26), tex=24)
    for i in range(5):
        t = (i + 1) / 6
        sc.softline((0, 622 + 96 * t), (W, 610 + 96 * t), shade(CLAY, -0.44), 1.6, 82, 1.6)
    sc.softline((0, 620), (W, 608), shade(CONC, 0.3), 3.0, 96, 2.0)
    sc.poly_grad([(0, 704), (W, 704), (W, H), (0, H)],
                 shade(mix(GRASS, WARM, 0.2), 0.26), shade(mix(GRASS, WARM, 0.12), -0.26))
    sc.shadow([(CX + 12, GL + 4), (RX, p.y_at(RX, CX, GL, p.vpr)),
               (RX + 300, p.y_at(RX, CX, GL, p.vpr) + 150), (CX + 44, GL + 196)],
              blur=32, alpha=110)

    # ground floor volume, then the first floor set back over it
    exterior_shell(sc, p, CX, LX, RX, GF, GL, lit, shaded)
    FRX = p.div(CX, RX, 5, p.vpr)[3]
    exterior_shell(sc, p, CX, LX, FRX, FF, GF, shade(lit, 0.06), shade(shaded, 0.04))
    terr = [(FRX, p.y_at(FRX, CX, GF - 16, p.vpr)), (RX, p.y_at(RX, CX, GF - 16, p.vpr)),
            (RX, p.y_at(RX, CX, GF, p.vpr)), (FRX, p.y_at(FRX, CX, GF, p.vpr))]
    sc.poly_grad(terr, shade(CONC, 0.2), shade(CONC, -0.12))

    # glazing: a run on the shaded long face, a tall slot on the lit face
    gx = p.div(CX, RX, 5, p.vpr)
    for k in (0, 1, 2):
        gp = p.panel(gx[k] + 22, gx[k + 1] - 22, GF, GL, p.vpr, 0.22, 0.68, CX, GF, GL)
        sc.poly(gp, fill=shade(CHARCOAL, 0.18))
        sc.glass([(gp[0][0] + 7, gp[0][1] + 6), (gp[1][0] - 7, gp[1][1] + 6),
                  (gp[2][0] - 7, gp[2][1] - 6), (gp[3][0] + 7, gp[3][1] - 6)], sheen=0.55)
    for k in (0, 1):
        gp = p.panel(gx[k] + 26, gx[k + 1] - 26, FF, GF, p.vpr, 0.26, 0.70, CX, FF, GF)
        sc.poly(gp, fill=shade(CHARCOAL, 0.18))
        sc.glass([(gp[0][0] + 7, gp[0][1] + 6), (gp[1][0] - 7, gp[1][1] + 6),
                  (gp[2][0] - 7, gp[2][1] - 6), (gp[3][0] + 7, gp[3][1] - 6)], sheen=0.5)
    lx = p.div(CX, LX, 3, p.vpl)
    tall = p.panel(lx[2], lx[1], FF, GL, p.vpl, 0.16, 0.84, CX, FF, GL)
    sc.poly(tall, fill=shade(CHARCOAL, 0.16))
    sc.glass([(tall[0][0] + 8, tall[0][1] + 8), (tall[1][0] - 8, tall[1][1] + 8),
              (tall[2][0] - 8, tall[2][1] - 8), (tall[3][0] + 8, tall[3][1] - 8)], sheen=0.62)
    ent = p.panel(lx[1] + 8, lx[0] - 34, FF, GL, p.vpl, 0.70, 0.985, CX, FF, GL)
    sc.poly(ent, fill=shade(CHARCOAL, 0.2))
    sc.surface([(ent[0][0] + 10, ent[0][1] + 8), (ent[1][0] - 10, ent[1][1] + 8),
                (ent[2][0] - 10, ent[2][1]), (ent[3][0] + 10, ent[3][1])],
               TEAK_L, shade(TEAK, -0.26), tex=30, tone=-0.4)

    ground_contact(sc, p, CX, LX, RX, GL)

    sc.poly_grad([(430, 1125), (CX + 60, GL + 12), (RX - 120, p.y_at(RX - 120, CX, GL, p.vpr) + 14),
                  (1280, 1125)], shade(PAVING, 0.06), shade(PAVING, -0.24))
    shrub(sc, 268, p.y_at(268, CX, GL, p.vpl) + 28, 104, 70, shade(GRASS_D, 0.12))
    shrub(sc, 1180, p.y_at(1180, CX, GL, p.vpr) + 44, 118, 66, shade(GRASS_D, 0.06))

    sc.vignette(64)
    sc.grain(6, 20)
    sc.caption("SARAVANAMPATTI VILLA", "COIMBATORE · 2023")


# ===========================================================================
# 06  Peelamedu Apartment — the kitchen, where the money went
# ===========================================================================

def r_peelamedu(sc):
    STONE_SILL = mix(GRAPHITE, SAND, 0.34)
    rm = Room(vp=(806, 636), back=(566, 350, 1006, 806))
    A, B, C, D = rm.A, rm.B, rm.C, rm.D

    rm.shell(sc,
             ceil=(shade(BONE, -0.22), shade(BONE, -0.06)),
             floor=(shade(mix(SAND, GRAPHITE, 0.24), -0.14), shade(mix(SAND, GRAPHITE, 0.24), -0.36)),
             wall_l=(shade(PLASTER, -0.26), shade(PLASTER, -0.06)),
             wall_r=(shade(PLASTER, -0.10), shade(PLASTER, -0.3)),
             back=(shade(PLASTER, -0.02), shade(PLASTER, -0.14)))

    # a window on the back wall — the only daylight a compact flat gets
    sc.poly([(722, 400), (942, 400), (942, 570), (722, 570)], fill=shade(GRAPHITE, 0.22))
    sc.glass(((734, 412), (930, 412), (930, 556), (734, 556)),
             light=mix(BONE, WARM, 0.16), dark=shade(SKY_MID, 0.34), sheen=0.7)
    sc.line((832, 412), (832, 556), shade(GRAPHITE, 0.26), 1.6)
    sc.poly_grad([(714, 570), (950, 570), (950, 584), (714, 584)],
                 shade(STONE_SILL, 0.26), shade(STONE_SILL, -0.06))
    sc.glow([(694, 384), (970, 384), (970, 620), (694, 620)], mix(BONE, WARM, 0.3), 116, 52)

    # the modular run, down the left wall
    DOOR = mix(SAND, BONE, 0.34)
    STONE = mix(GRAPHITE, SAND, 0.34)
    kx = rm.depth(566, 96, 4)
    for i in range(4):
        xa, xb = kx[i + 1], kx[i]
        base = rm.wall_panel(xa, xb, A, D, 0.60, 0.96)
        sc.poly_grad(base, shade(DOOR, 0.12), shade(DOOR, -0.20), horizontal=True)
        sc.poly(base, outline=shade(DOOR, -0.44), w=1.0)
        wall = rm.wall_panel(xa, xb, A, D, 0.13, 0.37)
        sc.poly_grad(wall, shade(DOOR, 0.06), shade(DOOR, -0.26), horizontal=True)
        sc.poly(wall, outline=shade(DOOR, -0.44), w=1.0)
        h = rm.wall_panel(xa + (xb - xa) * 0.2, xb - (xb - xa) * 0.2, A, D, 0.645, 0.665)
        sc.poly(h, fill=shade(GRAPHITE, 0.24))
        h2 = rm.wall_panel(xa + (xb - xa) * 0.2, xb - (xb - xa) * 0.2, A, D, 0.345, 0.362)
        sc.poly(h2, fill=shade(GRAPHITE, 0.24))
    # plinth in shadow, so the run does not sit flat on the floor
    sc.poly_grad(rm.wall_panel(kx[4], kx[0], A, D, 0.96, 1.0),
                 shade(GRAPHITE, 0.1), shade(GRAPHITE, -0.16), horizontal=True)
    # quartz counter — dark, which is what makes the doors read as doors
    sc.shadow(rm.wall_panel(kx[4], kx[0], A, D, 0.37, 0.44), blur=12, alpha=118)
    splash = rm.wall_panel(kx[4], kx[0], A, D, 0.37, 0.545)
    sc.poly_grad(splash, shade(mix(SAND, BONE, 0.5), 0.06),
                 shade(mix(SAND, BONE, 0.5), -0.22), horizontal=True)
    sc.glow(rm.wall_panel(kx[4], kx[0], A, D, 0.37, 0.42), mix(WARM, BONE, 0.34), 120, 14)
    ctop = rm.wall_panel(kx[4], kx[0], A, D, 0.545, 0.60)
    sc.poly_grad(ctop, shade(STONE, 0.24), shade(STONE, -0.10), horizontal=True)
    sc.softline((kx[4], ctop[0][1]), (kx[0], ctop[1][1]), mix(BONE, WARM, 0.2), 2.0, 128, 1.4)
    hb = rm.wall_panel(kx[2], kx[1], A, D, 0.548, 0.575)
    sc.poly(hb, fill=shade(CHARCOAL, 0.14))

    # the tall unit closes the run
    tall = rm.wall_panel(kx[4], kx[3], A, D, 0.05, 0.96)
    sc.poly_grad(tall, shade(mix(TEAK_L, SAND, 0.5), 0.06),
                 shade(mix(TEAK, SAND, 0.4), -0.24), horizontal=True)
    sc.poly(tall, outline=shade(TEAK, -0.40), w=1.1)
    for t in (0.36, 0.64):
        ya = tall[0][1] + (tall[3][1] - tall[0][1]) * t
        yb = tall[1][1] + (tall[2][1] - tall[1][1]) * t
        sc.line((kx[4], ya), (kx[3], yb), shade(TEAK, -0.40), 1.0)
    sc.occlude(rm.wall_panel(kx[4], kx[0], A, D, 0.99, 1.0), blur=14, alpha=128)

    # across the passage: the wardrobe run the corridor gave six inches to
    dx = rm.depth(1006, 1500, 3)
    wr = rm.wall_panel(dx[0], dx[2], B, C, 0.04, 0.98)
    sc.poly_grad(wr, shade(mix(SAND, BONE, 0.4), -0.06),
                 shade(mix(SAND, BONE, 0.4), -0.30), horizontal=True)
    for x in dx[1:]:
        sc.softline((x, rm.ray_y(x, B) + 8), (x, rm.ray_y(x, C) - 8),
                    shade(SAND, -0.44), 1.2, 96, 1.4)
    sc.occlude(rm.wall_panel(dx[0], dx[2], B, C, 0.98, 1.0), blur=14, alpha=120)

    sc.vignette(72)
    sc.grain(6, 22)
    sc.caption("PEELAMEDU APARTMENT", "COIMBATORE · 2025")


RENDERS = {
    "rathinapuri-residence": r_rathinapuri,
    "courtyard-house": r_courtyard,
    "loft-living-room": r_loft,
    "mak-complex-interiors": r_mak,
    "saravanampatti-villa": r_villa,
    "peelamedu-apartment": r_peelamedu,
}
