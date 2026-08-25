"""
Konst Design — render kit.

The plates are line drawings; these are the perspective views that sit on the
project cards. Same palette, different job: gradients on every large surface,
soft cast shadows, glazing that reflects, and a little grain, so the card reads
as a visualisation rather than a diagram.

Drawn 2x oversampled — these are soft fills rather than hairlines, and the
blurs are expensive at 3x.
"""

import math
from PIL import Image, ImageDraw, ImageChops, ImageFilter, ImageFont

from plate_kit import (BONE, IVORY, IVORY_DEEP, SAND, CHARCOAL, GRAPHITE,
                       INK_SOFT, INK_MUTE, CLAY, CLAY_SOFT, mix)

W, H, S = 1500, 1125, 2

# Same contract as the plates: the card crops this master to anything from
# 3/4 to 5/3, so the subject stays inside the middle 56% x 80%.
CORE = (332, 118, 1168, 1008)

# --- render palette, kept warm so it sits beside the site's ivory -----------
SKY_HI   = (168, 182, 190)
SKY_MID  = (206, 210, 208)
SKY_LO   = (240, 235, 226)
DUSK_HI  = (52, 52, 58)
DUSK_MID = (124, 106, 100)
DUSK_LO  = (206, 148, 100)
GRASS    = (142, 146, 116)
GRASS_D  = (98, 104, 82)
PAVING   = (196, 190, 180)
PAVING_D = (156, 150, 140)
ROAD     = (142, 138, 132)
CONC     = (228, 221, 209)
CONC_D   = (178, 170, 158)
PLASTER  = (238, 230, 216)
GLASS_D  = (54, 60, 64)
GLASS_L  = (146, 162, 168)
WARM     = (236, 182, 118)
WARM_D   = (188, 128, 72)
TEAK     = (150, 92, 54)
TEAK_L   = (186, 124, 76)

_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
_fc = {}


def font(size, bold=False):
    key = (size, bold)
    if key not in _fc:
        path = _MONO.replace(".ttf", "-Bold.ttf") if bold else _MONO
        _fc[key] = ImageFont.truetype(path, int(size * S))
    return _fc[key]


def _pts(seq):
    return [(x * S, y * S) for x, y in seq]


def shade(c, t):
    """Darken (t<0) or lighten (t>0) a colour, staying in gamut."""
    if t >= 0:
        return mix(c, (255, 255, 255), t)
    return mix(c, (0, 0, 0), -t)


class Scene:
    def __init__(self):
        self.img = Image.new("RGB", (W * S, H * S), SKY_LO)
        self.d = ImageDraw.Draw(self.img)

    # --- flat ---------------------------------------------------------------
    def poly(self, pts, fill=None, outline=None, w=1.0):
        self.d.polygon(_pts(pts), fill=fill,
                       outline=outline, width=max(1, round(w * S)) if outline else 0)

    def rect(self, box, fill=None, outline=None, w=1.0):
        x0, y0, x1, y1 = box
        self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, outline, w)

    def line(self, a, b, color, w=1.0):
        self.d.line([(a[0] * S, a[1] * S), (b[0] * S, b[1] * S)],
                    fill=color, width=max(1, round(w * S)))

    def circle(self, c, r, fill=None, outline=None, w=1.0):
        self.d.ellipse([(c[0] - r) * S, (c[1] - r) * S, (c[0] + r) * S, (c[1] + r) * S],
                       fill=fill, outline=outline,
                       width=max(1, round(w * S)) if outline else 0)

    def text(self, xy, s, size=11, color=BONE, anchor="lm", bold=False, track=0.0):
        f = font(size, bold)
        if track <= 0:
            self.d.text((xy[0] * S, xy[1] * S), s, font=f, fill=color, anchor=anchor)
            return
        tr = track * S
        widths = [self.d.textlength(ch, font=f) for ch in s]
        total = sum(widths) + tr * (len(s) - 1)
        x, y = xy[0] * S, xy[1] * S
        if anchor[0] == "m":
            x -= total / 2
        elif anchor[0] == "r":
            x -= total
        for ch, cw in zip(s, widths):
            self.d.text((x, y), ch, font=f, fill=color, anchor="l" + anchor[1])
            x += cw + tr

    # --- graded -------------------------------------------------------------
    def _grad_layer(self, box, c0, c1, horizontal=False):
        x0, y0, x1, y1 = [int(v * S) for v in box]
        w_, h_ = max(1, x1 - x0), max(1, y1 - y0)
        n = w_ if horizontal else h_
        strip = Image.new("RGB", (w_ if horizontal else 1, 1 if horizontal else h_))
        px = strip.load()
        for i in range(n):
            t = i / max(1, n - 1)
            c = mix(c0, c1, t)
            if horizontal:
                px[i, 0] = c
            else:
                px[0, i] = c
        return strip.resize((w_, h_), Image.BILINEAR), (x0, y0)

    def vgrad(self, box, c_top, c_bot, horizontal=False):
        layer, at = self._grad_layer(box, c_top, c_bot, horizontal)
        self.img.paste(layer, at)

    def poly_grad(self, pts, c0, c1, horizontal=False):
        """A gradient clipped to a polygon — every large surface wants one."""
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        box = (min(xs), min(ys), max(xs), max(ys))
        layer, at = self._grad_layer(box, c0, c1, horizontal)
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=255)
        full = Image.new("RGB", self.img.size, c1)
        full.paste(layer, at)
        self.img.paste(full, (0, 0), mask)

    def surface(self, pts, c0, c1, horizontal=False, tex=0, tone=-0.5):
        """A graded plane with a little tooth in it. Flat fills read as vector
        art; a few levels of noise are most of what reads as 'rendered'."""
        self.poly_grad(pts, c0, c1, horizontal)
        if tex <= 0:
            return
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=255)
        n = Image.effect_noise((W * S, H * S), 26).convert("L")
        n = n.filter(ImageFilter.GaussianBlur(0.7 * S)).point(
            lambda v: int(max(0, v - 128) * tex / 100))
        self.img.paste(Image.new("RGB", self.img.size, shade(c1, tone)), (0, 0),
                       ImageChops.multiply(mask, n))

    def occlude(self, pts, blur=16, alpha=90):
        """Soft contact darkening — where a plane meets another plane."""
        self.shadow(pts, blur=blur, alpha=alpha)

    def softline(self, a, b, color, w=1.0, alpha=140, blur=1.2):
        m = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(m).line([(a[0] * S, a[1] * S), (b[0] * S, b[1] * S)],
                               fill=alpha, width=max(1, round(w * S)))
        m = m.filter(ImageFilter.GaussianBlur(blur * S))
        self.img.paste(Image.new("RGB", self.img.size, color), (0, 0), m)

    # --- light and shadow ---------------------------------------------------
    def shadow(self, pts, blur=14, alpha=104, color=(0, 0, 0)):
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=alpha)
        mask = mask.filter(ImageFilter.GaussianBlur(blur * S))
        self.img.paste(Image.new("RGB", self.img.size, color), (0, 0), mask)

    def glow(self, pts, color=WARM, alpha=150, blur=22):
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=alpha)
        mask = mask.filter(ImageFilter.GaussianBlur(blur * S))
        self.img.paste(Image.new("RGB", self.img.size, color), (0, 0), mask)

    def glass(self, pts, dark=GLASS_D, light=GLASS_L, sheen=0.5, warm=None):
        """Glazing: graded, with one diagonal sheen across it."""
        if warm:
            self.poly_grad(pts, shade(warm, 0.16), shade(warm, -0.24))
        else:
            self.poly_grad(pts, light, dark)
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=255)
        band = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(band).polygon(_pts([
            (x0 - 20, y1), (x0 + (x1 - x0) * 0.55, y0 - 10),
            (x0 + (x1 - x0) * 0.85, y0 - 10), (x0 - 20, y1 + (y1 - y0) * 0.5)]),
            fill=int(78 * sheen))
        band = band.filter(ImageFilter.GaussianBlur(5 * S))
        self.img.paste(Image.new("RGB", self.img.size, (255, 255, 255)), (0, 0),
                       ImageChops.multiply(mask, band))

    # --- finish -------------------------------------------------------------
    def grain(self, sigma=7, alpha=26):
        n = Image.effect_noise((W * S, H * S), sigma).convert("L")
        self.img = Image.blend(self.img, Image.merge("RGB", (n, n, n)), alpha / 255)
        self.d = ImageDraw.Draw(self.img)

    def vignette(self, strength=52):
        m = Image.new("L", (W * S, H * S), 0)
        ImageDraw.Draw(m).ellipse(
            [-W * S * 0.30, -H * S * 0.34, W * S * 1.30, H * S * 1.34], fill=255)
        m = m.filter(ImageFilter.GaussianBlur(120 * S))
        m = ImageChops.invert(m).point(lambda v: int(v * strength / 255))
        self.img.paste(Image.new("RGB", self.img.size, (0, 0, 0)), (0, 0), m)
        self.d = ImageDraw.Draw(self.img)

    def caption(self, label, sub):
        """A quiet strip, so the card still names what it is."""
        m = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(m).rectangle([0, int(1006 * S), W * S, H * S], fill=150)
        m = m.filter(ImageFilter.GaussianBlur(26 * S))
        self.img.paste(Image.new("RGB", self.img.size, (0, 0, 0)), (0, 0), m)
        self.d = ImageDraw.Draw(self.img)
        self.text((52, 1062), label, 11, BONE, "lm", bold=True, track=2.6)
        self.text((W - 52, 1062), sub, 9.5, mix(BONE, CHARCOAL, 0.42), "rm", track=2.2)

    def save(self, path):
        out = self.img.resize((W, H), Image.LANCZOS)
        out.save(path, "WEBP", quality=86, method=6)
        return path


class Persp:
    """Two-point perspective. Verticals stay vertical; horizontals run to a
    vanishing point on the horizon."""

    def __init__(self, hz, vpl, vpr):
        self.hz, self.vpl, self.vpr = hz, vpl, vpr

    def y_at(self, x, x0, y0, vp):
        """Follow the line from (x0, y0) to the vanishing point."""
        if abs(vp - x0) < 1e-6:
            return y0
        return y0 + (self.hz - y0) * (x - x0) / (vp - x0)

    def face(self, x0, x1, y_top, y_bot, vp):
        return [(x0, self.y_at(x0, x0, y_top, vp)), (x1, self.y_at(x1, x0, y_top, vp)),
                (x1, self.y_at(x1, x0, y_bot, vp)), (x0, self.y_at(x0, x0, y_bot, vp))]

    def div(self, x0, x1, n, vp):
        """n equal real-world widths between x0 and x1, foreshortened properly:
        1/(x - vp) is what runs linearly with depth."""
        u0, u1 = 1.0 / (x0 - vp), 1.0 / (x1 - vp)
        return [vp + 1.0 / (u0 + (u1 - u0) * i / n) for i in range(n + 1)]

    def panel(self, xa, xb, y_top, y_bot, vp, t0, t1, ref_x, ref_top, ref_bot):
        """A rectangle on a face, between height fractions t0..t1 of that face."""
        out = []
        for x in (xa, xb):
            ty = self.y_at(x, ref_x, ref_top, vp)
            by = self.y_at(x, ref_x, ref_bot, vp)
            out.append((ty + (by - ty) * t0, ty + (by - ty) * t1))
        return [(xa, out[0][0]), (xb, out[1][0]), (xb, out[1][1]), (xa, out[0][1])]


def tree(sc, cx, base_y, h, spread=0.44, trunk=0.16, tone=GRASS_D, back=False,
         seed=0):
    """A planting silhouette. A few overlapping circles read as a blob; a cluster
    of many, in two tones, reads as a canopy."""
    body = shade(tone, 0.20 if back else 0.0)
    hi = shade(body, 0.16)
    lo = shade(body, -0.18)
    tw = h * 0.020
    sc.poly([(cx - tw, base_y), (cx + tw, base_y),
             (cx + tw * 0.55, base_y - h * 0.46), (cx - tw * 0.55, base_y - h * 0.46)],
            fill=shade(tone, -0.42))
    for dx, dy in ((-1, 0.62), (1, 0.66)):
        sc.line((cx, base_y - h * 0.44), (cx + dx * h * 0.1, base_y - h * dy),
                shade(tone, -0.42), max(1.0, h * 0.012))
    rx, ry = h * spread * 0.5, h * 0.30
    cy = base_y - h * 0.66
    blobs = [(0.00, 0.00, 1.00), (-0.62, 0.16, 0.70), (0.60, 0.12, 0.74),
             (-0.34, -0.42, 0.66), (0.36, -0.46, 0.62), (0.00, -0.62, 0.54),
             (-0.82, -0.10, 0.44), (0.84, -0.06, 0.42), (-0.20, 0.52, 0.60),
             (0.26, 0.54, 0.56), (-0.56, 0.50, 0.42), (0.58, 0.46, 0.40)]
    for i, (bx, by, br) in enumerate(blobs):
        c = lo if (i + seed) % 3 == 0 else body
        sc.circle((cx + bx * rx, cy + by * ry), br * ry * 0.86, fill=c)
    for bx, by, br in ((-0.30, -0.34, 0.42), (0.16, -0.48, 0.34), (-0.66, 0.06, 0.28)):
        sc.circle((cx + bx * rx, cy + by * ry), br * ry * 0.86, fill=hi)


def shrub(sc, cx, base_y, w, h, tone=GRASS_D):
    sc.circle((cx, base_y - h * 0.5), h * 0.55, fill=tone)
    sc.circle((cx - w * 0.3, base_y - h * 0.34), h * 0.46, fill=shade(tone, -0.1))
    sc.circle((cx + w * 0.32, base_y - h * 0.36), h * 0.44, fill=shade(tone, 0.1))


# --- one-point interiors ---------------------------------------------------

class Room:
    """A one-point room: a back wall, and four planes running out past the frame."""

    def __init__(self, vp, back):
        self.vp = vp
        self.back = back
        x0, y0, x1, y1 = back
        self.A, self.B, self.C, self.D = (x0, y0), (x1, y0), (x1, y1), (x0, y1)

    def out(self, c, k=8.0):
        return (self.vp[0] + (c[0] - self.vp[0]) * k,
                self.vp[1] + (c[1] - self.vp[1]) * k)

    def shell(self, sc, ceil, floor, wall_l, wall_r, back):
        A, B, C, D = self.A, self.B, self.C, self.D
        oA, oB, oC, oD = (self.out(p) for p in (A, B, C, D))
        sc.poly_grad([oA, oB, B, A], ceil[0], ceil[1])
        sc.poly_grad([D, C, oC, oD], floor[0], floor[1])
        sc.poly_grad([oA, A, D, oD], wall_l[0], wall_l[1], horizontal=True)
        sc.poly_grad([B, oB, oC, C], wall_r[0], wall_r[1], horizontal=True)
        sc.poly_grad([A, B, C, D], back[0], back[1])
        return oA, oB, oC, oD

    def ray_y(self, x, corner):
        """y on the line from the vanishing point out through a back corner."""
        vx, vy = self.vp
        if abs(corner[0] - vx) < 1e-6:
            return vy
        return vy + (x - vx) * (corner[1] - vy) / (corner[0] - vx)

    def depth(self, x_back, x_front, n):
        """n equal real-world steps along a wall running away from the viewer."""
        vx = self.vp[0]
        u0, u1 = 1.0 / (x_back - vx), 1.0 / (x_front - vx)
        return [vx + 1.0 / (u0 + (u1 - u0) * i / n) for i in range(n + 1)]

    def wall_panel(self, xa, xb, top_corner, bot_corner, t0, t1):
        """A rectangle on a side wall, between height fractions t0..t1."""
        out = []
        for x in (xa, xb):
            ty = self.ray_y(x, top_corner)
            by = self.ray_y(x, bot_corner)
            out.append((ty + (by - ty) * t0, ty + (by - ty) * t1))
        return [(xa, out[0][0]), (xb, out[1][0]), (xb, out[1][1]), (xa, out[0][1])]


def daylight_sky(sc, sun=(300, 190), warm=0.18):
    sc.vgrad((0, 0, W, 760), mix(SKY_HI, CHARCOAL, 0.12), mix(SKY_MID, BONE, 0.4))
    sc.vgrad((0, 470, W, 760), mix(SKY_MID, BONE, 0.4), mix(SKY_LO, WARM, warm))
    for cx, cy, cw, ch, al in ((420, 250, 300, 40, 40), (980, 200, 380, 46, 34),
                               (700, 340, 260, 30, 26)):
        sc.glow([(cx, cy), (cx + cw, cy - ch), (cx + cw + 120, cy + ch), (cx - 60, cy + ch)],
                BONE, al, 40)
    sc.glow([(sun[0] - 150, sun[1] - 120), (sun[0] + 150, sun[1] - 120),
             (sun[0] + 150, sun[1] + 120), (sun[0] - 150, sun[1] + 120)],
            mix(BONE, WARM, 0.4), 120, 90)


def exterior_shell(sc, p, CX, LX, RX, TOP, GL, lit, shaded, coping=True, tex=26):
    """The two faces of a two-point volume, its coping, and its contact shadow.
    Left face lit, right face shaded — the sun sits off to the upper left."""
    left = p.face(LX, CX, TOP, GL, p.vpl)
    right = p.face(CX, RX, TOP, GL, p.vpr)
    sc.surface(left, shade(lit, 0.08), shade(lit, -0.20), tex=tex)
    sc.surface(right, shade(shaded, 0.04), shade(shaded, -0.26), tex=tex)
    if coping:
        for vp, xa, xb, t in ((p.vpl, LX, CX, 0.30), (p.vpr, CX, RX, 0.02)):
            cap = [(xa, p.y_at(xa, CX, TOP - 13, vp)), (xb, p.y_at(xb, CX, TOP - 13, vp)),
                   (xb, p.y_at(xb, CX, TOP + 3, vp)), (xa, p.y_at(xa, CX, TOP + 3, vp))]
            sc.poly_grad(cap, shade(CONC, t + 0.14), shade(CONC, t - 0.18))
            sc.softline((xa, p.y_at(xa, CX, TOP + 8, vp)),
                        (xb, p.y_at(xb, CX, TOP + 8, vp)), shade(CHARCOAL, 0.0), 5.0, 50, 5.0)
    sc.softline((CX, TOP - 13), (CX, GL), shade(lit, 0.42), 1.4, 84, 1.6)
    return left, right


def ground_contact(sc, p, CX, LX, RX, GL):
    sc.occlude([(LX - 60, p.y_at(LX, CX, GL, p.vpl) - 6), (CX, GL - 6),
                (RX + 60, p.y_at(RX, CX, GL, p.vpr) - 6),
                (RX + 60, p.y_at(RX, CX, GL, p.vpr) + 70), (CX, GL + 82),
                (LX - 60, p.y_at(LX, CX, GL, p.vpl) + 70)], blur=32, alpha=120)
    sc.occlude([(LX, p.y_at(LX, CX, GL, p.vpl) - 3), (CX, GL - 3),
                (RX, p.y_at(RX, CX, GL, p.vpr) - 3),
                (RX, p.y_at(RX, CX, GL, p.vpr) + 13), (CX, GL + 15),
                (LX, p.y_at(LX, CX, GL, p.vpl) + 13)], blur=6, alpha=126)
