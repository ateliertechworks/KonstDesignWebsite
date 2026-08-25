"""
Konst Design — drawing kit for the project plates.

Primitives for architectural line work, drawn 3x oversampled and reduced on
save so PIL's aliased strokes come out clean. Everything is expressed in final
image pixels; the oversampling is applied inside the primitives.
"""

import math
from PIL import Image, ImageDraw, ImageChops, ImageFont

W, H, S = 1500, 1125, 3

# The masters are 4:3. Cards crop them to their own ratio (3/4 .. 5/3) with
# object-fit: cover, so the drawing itself has to live inside the region that
# survives every one of those crops: the middle 56.25% of the width and 80% of
# the height. Anything outside CORE is texture, and may be cropped away.
CORE = (332, 118, 1168, 1008)

BONE       = (251, 249, 245)
IVORY      = (242, 238, 231)
IVORY_DEEP = (233, 227, 218)
SAND       = (220, 211, 198)
CHARCOAL   = (22, 20, 15)
GRAPHITE   = (46, 42, 35)
INK_SOFT   = (74, 68, 58)
INK_MUTE   = (133, 124, 110)
CLAY       = (169, 102, 63)
CLAY_SOFT  = (192, 138, 95)

_MONO   = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
_MONO_B = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
_SERIF  = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"

_cache = {}


def font(size, bold=False, serif=False):
    key = (size, bold, serif)
    if key not in _cache:
        path = _SERIF if serif else (_MONO_B if bold else _MONO)
        _cache[key] = ImageFont.truetype(path, int(size * S))
    return _cache[key]


def _p(pt):
    return (pt[0] * S, pt[1] * S)


def _pts(seq):
    return [(x * S, y * S) for x, y in seq]


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


class Plate:
    """One drawing sheet."""

    def __init__(self, bg=BONE):
        self.img = Image.new("RGB", (W * S, H * S), bg)
        self.d = ImageDraw.Draw(self.img)

    # --- raw strokes ------------------------------------------------------
    def line(self, a, b, color=CHARCOAL, w=1.0):
        self.d.line([_p(a), _p(b)], fill=color, width=max(1, round(w * S)))

    def dash(self, a, b, color=INK_MUTE, w=0.8, on=7, off=5):
        (x0, y0), (x1, y1) = a, b
        dist = math.hypot(x1 - x0, y1 - y0)
        if dist == 0:
            return
        ux, uy = (x1 - x0) / dist, (y1 - y0) / dist
        t = 0.0
        while t < dist:
            e = min(t + on, dist)
            self.line((x0 + ux * t, y0 + uy * t), (x0 + ux * e, y0 + uy * e), color, w)
            t = e + off

    def poly(self, pts, fill=None, outline=None, w=1.0):
        self.d.polygon(_pts(pts), fill=fill, outline=None)
        if outline:
            closed = list(pts) + [pts[0]]
            for a, b in zip(closed, closed[1:]):
                self.line(a, b, outline, w)

    def rect(self, box, fill=None, outline=None, w=1.0):
        x0, y0, x1, y1 = box
        self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], fill, outline, w)

    def dashrect(self, box, color=INK_MUTE, w=0.8, on=7, off=5):
        x0, y0, x1, y1 = box
        pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
        for a, b in zip(pts, pts[1:]):
            self.dash(a, b, color, w, on, off)

    def circle(self, c, r, fill=None, outline=None, w=1.0):
        box = [_p((c[0] - r, c[1] - r)), _p((c[0] + r, c[1] + r))]
        self.d.ellipse([box[0][0], box[0][1], box[1][0], box[1][1]], fill=fill,
                       outline=outline, width=max(1, round(w * S)) if outline else 0)

    def arc(self, c, r, a0, a1, color=INK_MUTE, w=0.8):
        box = [_p((c[0] - r, c[1] - r)), _p((c[0] + r, c[1] + r))]
        self.d.arc([box[0][0], box[0][1], box[1][0], box[1][1]], a0, a1,
                   fill=color, width=max(1, round(w * S)))

    def text(self, xy, s, size=11, color=INK_SOFT, anchor="lm", bold=False,
             serif=False, track=0.0):
        f = font(size, bold, serif)
        if track <= 0:
            self.d.text(_p(xy), s, font=f, fill=color, anchor=anchor)
            return
        # letter-spaced small caps, the way the site sets its labels
        tr = track * S
        widths = [self.d.textlength(ch, font=f) for ch in s]
        total = sum(widths) + tr * (len(s) - 1)
        x, y = _p(xy)
        if anchor[0] == "m":
            x -= total / 2
        elif anchor[0] == "r":
            x -= total
        for ch, cw in zip(s, widths):
            self.d.text((x, y), ch, font=f, fill=color, anchor="l" + anchor[1])
            x += cw + tr

    def vtext(self, xy, s, size=9, color=INK_MUTE, step=None, track=0.0):
        """Letters stacked down the page — for labels that run beside a wall."""
        f = font(size, False, False)
        step = step or size * 1.42
        x, y = xy
        y -= step * (len(s) - 1) / 2
        for ch in s:
            self.d.text(_p((x, y)), ch, font=f, fill=color, anchor="mm")
            y += step

    # --- fills ------------------------------------------------------------
    def fill(self, pts, color):
        self.d.polygon(_pts(pts), fill=color)

    def hatch(self, pts, color=INK_MUTE, spacing=9, angle=45, w=0.7):
        """Parallel ruling clipped to a polygon."""
        mask = Image.new("L", self.img.size, 0)
        ImageDraw.Draw(mask).polygon(_pts(pts), fill=255)
        rule = Image.new("L", self.img.size, 0)
        rd = ImageDraw.Draw(rule)
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
        diag = math.hypot(x1 - x0, y1 - y0)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        rad = math.radians(angle)
        dx, dy = math.cos(rad), math.sin(rad)
        nx, ny = -dy, dx
        n = int(diag / spacing) + 2
        lw = max(1, round(w * S))
        for i in range(-n, n + 1):
            ox, oy = cx + nx * i * spacing, cy + ny * i * spacing
            rd.line([_p((ox - dx * diag, oy - dy * diag)),
                     _p((ox + dx * diag, oy + dy * diag))], fill=255, width=lw)
        layer = Image.new("RGB", self.img.size, color)
        self.img.paste(layer, (0, 0), ImageChops.multiply(mask, rule))

    def stipple(self, box, color=INK_MUTE, step=13, r=1.0):
        x0, y0, x1, y1 = box
        y = y0
        row = 0
        while y <= y1:
            x = x0 + (step / 2 if row % 2 else 0)
            while x <= x1:
                self.circle((x, y), r, fill=color)
                x += step
            y += step
            row += 1

    # --- sheet furniture --------------------------------------------------
    def grid(self, minor=25, major=125):
        for x in range(0, W + 1, minor):
            self.line((x, 0), (x, H), IVORY, 0.5)
        for y in range(0, H + 1, minor):
            self.line((0, y), (W, y), IVORY, 0.5)
        for x in range(0, W + 1, major):
            self.line((x, 0), (x, H), IVORY_DEEP, 0.6)
        for y in range(0, H + 1, major):
            self.line((0, y), (W, y), IVORY_DEEP, 0.6)

    def border(self):
        self.rect((34, 34, W - 34, H - 34), outline=mix(INK_MUTE, BONE, 0.45), w=0.8)
        for cx, cy in ((34, 34), (W - 34, 34), (34, H - 34), (W - 34, H - 34)):
            self.line((cx - 11, cy), (cx + 11, cy), INK_MUTE, 0.7)
            self.line((cx, cy - 11), (cx, cy + 11), INK_MUTE, 0.7)

    def titleblock(self, plate_no, title, scale, project):
        y = H - 74
        self.line((34, y), (W - 34, y), mix(INK_MUTE, BONE, 0.3), 0.8)
        self.text((52, y + 25), plate_no, 13, CLAY, "lm", bold=True, track=2.4)
        self.line((132, y + 12), (132, y + 40), mix(INK_MUTE, BONE, 0.4), 0.7)
        self.text((150, y + 25), title.upper(), 12, INK_SOFT, "lm", track=2.0)
        self.text((W - 52, y + 25), scale, 11, INK_MUTE, "rm", track=1.4)
        self.text((52, 62), project.upper(), 10.5, INK_MUTE, "lm", track=3.0)
        self.text((W - 52, 62), "KONST DESIGN", 10.5, INK_MUTE, "rm", track=3.0)

    # --- annotation -------------------------------------------------------
    def dim(self, a, b, label, off=22, side=1, size=10):
        """Dimension line with 45-degree slash ticks, offset from a-b."""
        (x0, y0), (x1, y1) = a, b
        dist = math.hypot(x1 - x0, y1 - y0)
        if dist == 0:
            return
        ux, uy = (x1 - x0) / dist, (y1 - y0) / dist
        nx, ny = -uy * off * side, ux * off * side
        p0, p1 = (x0 + nx, y0 + ny), (x1 + nx, y1 + ny)
        self.line(p0, p1, INK_MUTE, 0.7)
        # witness lines, run a touch past the dimension line
        self.line((x0, y0), (x0 + nx * 1.14, y0 + ny * 1.14), INK_MUTE, 0.5)
        self.line((x1, y1), (x1 + nx * 1.14, y1 + ny * 1.14), INK_MUTE, 0.5)
        tx, ty = (ux - uy) * 5.5, (uy + ux) * 5.5      # a-b rotated 45 degrees
        for px, py in (p0, p1):
            self.line((px - tx, py - ty), (px + tx, py + ty), INK_MUTE, 0.9)
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        w = len(label) * size * 0.64 + 12
        if abs(uy) > abs(ux):                           # vertical run
            bx = mx + (w / 2 + 5) * (1 if nx >= 0 else -1)   # label sits outboard
            self.rect((bx - w / 2, my - 9, bx + w / 2, my + 9), fill=BONE)
            self.text((bx, my), label, size, INK_MUTE, "mm")
        else:
            self.rect((mx - w / 2, my - 9, mx + w / 2, my + 9), fill=BONE)
            self.text((mx, my), label, size, INK_MUTE, "mm")

    def leader(self, tip, elbow, label, size=10.5, color=INK_SOFT, flip=False):
        self.line(tip, elbow, INK_MUTE, 0.7)
        end = (elbow[0] + (-34 if flip else 34), elbow[1])
        self.line(elbow, end, INK_MUTE, 0.7)
        self.circle(tip, 2.4, fill=CLAY)
        self.text((end[0] + (-6 if flip else 6), end[1]), label, size, color,
                  "rm" if flip else "lm")

    def northpoint(self, c, r=21):
        self.circle(c, r, outline=mix(INK_MUTE, BONE, 0.35), w=0.7)
        self.poly([(c[0], c[1] - r + 3), (c[0] - 5.5, c[1] + 5), (c[0], c[1] + 1.5)],
                  fill=CHARCOAL)
        self.poly([(c[0], c[1] - r + 3), (c[0] + 5.5, c[1] + 5), (c[0], c[1] + 1.5)],
                  fill=INK_MUTE)
        self.text((c[0], c[1] + 13), "N", 9, INK_MUTE, "mm", bold=True)

    def save(self, path):
        out = self.img.resize((W, H), Image.LANCZOS)
        out.save(path, "WEBP", quality=88, method=6)
        return path


# --- composite elements ---------------------------------------------------

def walls(pl, box, t=11, fill=CHARCOAL):
    """Perimeter wall poché: a solid band inside `box`."""
    x0, y0, x1, y1 = box
    pl.rect(box, fill=fill)
    pl.rect((x0 + t, y0 + t, x1 - t, y1 - t), fill=BONE)


def partition(pl, a, b, t=7, fill=GRAPHITE):
    """Internal wall drawn as a thick segment between two points."""
    (x0, y0), (x1, y1) = a, b
    if abs(y1 - y0) < abs(x1 - x0):
        pl.rect((min(x0, x1), y0 - t / 2, max(x0, x1), y0 + t / 2), fill=fill)
    else:
        pl.rect((x0 - t / 2, min(y0, y1), x0 + t / 2, max(y0, y1)), fill=fill)


def opening(pl, box):
    """Knock a door or window out of a wall that is already drawn."""
    pl.rect(box, fill=BONE)


def window(pl, box, horizontal=True):
    opening(pl, box)
    x0, y0, x1, y1 = box
    if horizontal:
        m = (y0 + y1) / 2
        pl.line((x0, m), (x1, m), GRAPHITE, 1.1)
    else:
        m = (x0 + x1) / 2
        pl.line((m, y0), (m, y1), GRAPHITE, 1.1)


def door(pl, hinge, size, a0, a1):
    pl.arc(hinge, size, a0, a1, mix(INK_MUTE, BONE, 0.2), 0.7)
    rad = math.radians(a0)
    pl.line(hinge, (hinge[0] + size * math.cos(rad), hinge[1] + size * math.sin(rad)),
            GRAPHITE, 1.2)


def tint(pl, box, color):
    pl.rect(box, fill=color)


def room(pl, box, name, area=None, size=11.5):
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if area:
        pl.text((cx, cy - 8), name.upper(), size, INK_SOFT, "mm", track=1.5)
        pl.text((cx, cy + 10), area, size - 1.5, INK_MUTE, "mm")
    else:
        pl.text((cx, cy), name.upper(), size, INK_SOFT, "mm", track=1.5)


def ground(pl, y, x0, x1, depth=16):
    """Hatched ground line under a section or elevation."""
    pl.line((x0, y), (x1, y), CHARCOAL, 1.6)
    pl.hatch([(x0, y), (x1, y), (x1, y + depth), (x0, y + depth)],
             mix(INK_MUTE, BONE, 0.25), spacing=8, angle=60, w=0.6)


def slab(pl, box, fill=CHARCOAL):
    pl.rect(box, fill=fill)


def sun(pl, c, r=17, rays=12, color=CLAY):
    pl.circle(c, r * 0.46, outline=color, w=1.1)
    for i in range(rays):
        a = math.radians(i * 360 / rays)
        pl.line((c[0] + math.cos(a) * r * 0.68, c[1] + math.sin(a) * r * 0.68),
                (c[0] + math.cos(a) * r, c[1] + math.sin(a) * r), color, 1.0)


def arrow(pl, a, b, color=CLAY, w=1.3, head=9):
    pl.line(a, b, color, w)
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for s in (+1, -1):
        h = ang + math.pi + s * 0.42
        pl.line(b, (b[0] + math.cos(h) * head, b[1] + math.sin(h) * head), color, w)


# --- axonometric ----------------------------------------------------------

_C30, _S30 = math.cos(math.radians(30)), math.sin(math.radians(30))


class Axo:
    """30-degree axonometric. x runs right-and-down, y left-and-down, z up."""

    def __init__(self, ox, oy, s=26.0):
        self.ox, self.oy, self.s = ox, oy, s

    def p(self, x, y, z=0.0):
        return (self.ox + (x - y) * _C30 * self.s,
                self.oy - (x + y) * _S30 * self.s - z * self.s)

    def box(self, pl, x0, y0, z0, x1, y1, z1,
            top=None, left=None, right=None, edge=CHARCOAL, w=1.0):
        """Both x and y run away from the viewer, so the faces that show are the
        top, the x0 plane (facing left) and the y0 plane (facing right)."""
        top = top or mix(SAND, BONE, 0.34)
        left = left or mix(SAND, BONE, 0.02)
        right = right or mix(GRAPHITE, SAND, 0.72)
        pl.poly([self.p(x0, y0, z1), self.p(x1, y0, z1),
                 self.p(x1, y1, z1), self.p(x0, y1, z1)], top, edge, w)
        pl.poly([self.p(x0, y0, z0), self.p(x0, y1, z0),
                 self.p(x0, y1, z1), self.p(x0, y0, z1)], left, edge, w)
        pl.poly([self.p(x0, y0, z0), self.p(x1, y0, z0),
                 self.p(x1, y0, z1), self.p(x0, y0, z1)], right, edge, w)

    def face_y(self, pl, x0, x1, y, z0, z1, fill=None, edge=None, w=1.0):
        pl.poly([self.p(x0, y, z0), self.p(x1, y, z0),
                 self.p(x1, y, z1), self.p(x0, y, z1)], fill, edge, w)

    def face_x(self, pl, x, y0, y1, z0, z1, fill=None, edge=None, w=1.0):
        pl.poly([self.p(x, y0, z0), self.p(x, y1, z0),
                 self.p(x, y1, z1), self.p(x, y0, z1)], fill, edge, w)

    def grid(self, pl, x0, y0, x1, y1, step=2, color=None):
        color = color or mix(INK_MUTE, BONE, 0.62)
        x = x0
        while x <= x1:
            pl.line(self.p(x, y0), self.p(x, y1), color, 0.6)
            x += step
        y = y0
        while y <= y1:
            pl.line(self.p(x0, y), self.p(x1, y), color, 0.6)
            y += step
