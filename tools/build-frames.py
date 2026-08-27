#!/usr/bin/env python3
"""
Rebuild every image asset from the source frames in ../frame.

  python3 tools/build-frames.py

The source frames are heavily compressed JPEGs (~0.25 bits/pixel at 1280x720),
so they carry visible 8x8 blocking and mosquito noise. Simply re-encoding them
compounds that loss, and letting the browser upscale them to a retina canvas
makes it worse. This script instead:

  1. paints out the generator's watermark from the lower right of each frame
  2. removes JPEG blocking (ffmpeg `deblock`)
  3. denoises *temporally* across the sequence - the camera never moves, so
     averaging a pixel against its neighbours in time removes compression
     noise without touching real detail
  4. upscales to 1920x1080 with Lanczos and applies a light unsharp pass, so
     the sharpening is done once, offline, instead of by the browser every frame
  5. encodes three resolution tiers at visually lossless quality

Outputs:

  public/frames/hd/f-NNN.webp   1920x1080  large / retina displays
  public/frames/d/f-NNN.webp    1280x720   standard displays
  public/frames/m/f-NNN.webp     960x540   phones
  public/img/...                section crops, cut from the 1920px masters

Requires Pillow and ffmpeg:  pip install Pillow  /  apt install ffmpeg
"""

import glob
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'frame')
PUB = os.path.join(ROOT, 'public')

SRC_W, SRC_H = 1280, 720
MASTER_W, MASTER_H = 1920, 1080
SCALE = MASTER_W / SRC_W          # crop boxes below are written in source coords

# The generator's sparkle mark sits in the same place in every frame.
WATERMARK_BOX = (1120, 564, 1196, 640)

# deblock    - kill the 8x8 JPEG grid
# atadenoise - adaptive TEMPORAL averaging over a 9-frame window. The camera
#              never moves, so for every static pixel this averages nine
#              independent samples of the same detail and recovers real
#              information the compressor threw away. It is adaptive, so the
#              parts that DO move (the sheet, the furniture arriving) are
#              excluded rather than smeared. A wider window (s=15) recovers
#              marginally more on the walls but leaves a visible ghost trail
#              of the sheet across the floor, so 9 is the ceiling here.
# hqdn3d     - gentle spatial pass to clean up what is left, mostly mosquito
#              noise clinging to the window mullions
# scale up   - to 2x the master, so the sharpening below has sub-pixel room
# unsharp    - edge definition, done once offline instead of by the browser
# scale down - back to the master size. Sharpening at 2x and resampling down
#              is what keeps the mullions crisp without ringing halos, which
#              a single-pass unsharp at 1x could not do.
SS_W, SS_H = MASTER_W * 2, MASTER_H * 2
FILTERS = (
    'deblock=filter=strong:block=8,'
    'atadenoise=s=9:0a=0.02:0b=0.05:1a=0.02:1b=0.05:2a=0.02:2b=0.05,'
    'hqdn3d=1.0:1.0:5:5,'
    f'scale={SS_W}:{SS_H}:flags=lanczos+accurate_rnd+full_chroma_int,'
    'unsharp=3:3:1.0:3:3:0.45,'
    f'scale={MASTER_W}:{MASTER_H}:flags=lanczos+accurate_rnd'
)

# Quality is raised across the board: the masters are much cleaner than they
# used to be, and there is no point spending a restoration pass only to hand
# the result back to a lossy encoder at the old settings. The phone tier moves
# the most (86 -> 92) because it was the one showing WebP blocking of its own
# on top of the source's.
# A 16:9 frame on a 9:19.5 phone letterboxes down to about a third of the
# screen, which leaves the opening statement floating in dead space. So phones
# get their own tier: the master cropped to 4:5 and painted full width, image
# above and type below. 4:5 rather than 9:16 because the room composition is
# wide - a taller crop would keep the window and throw away the room.
PORTRAIT_CROP_ASPECT = 0.8            # 4:5

TIERS = [
    ('hd', (1920, 1080), 93),
    ('d',  (1280, 720),  93),
    ('m',  (960, 540),   92),
    ('p',  (720, 900),   93),         # phones - cropped, see above
]


def _feather(w, h, inset=8, blur=5):
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rectangle([inset, inset, w - 1 - inset, h - 1 - inset], fill=255)
    return mask.filter(ImageFilter.GaussianBlur(blur))


def inpaint(im):
    """Fill the watermark box by interpolating the four surrounding edges."""
    x0, y0, x1, y1 = WATERMARK_BOX
    w, h = x1 - x0, y1 - y0

    left = im.crop((x0 - 3, y0, x0, y1)).resize((w, h), Image.BILINEAR)
    right = im.crop((x1, y0, x1 + 3, y1)).resize((w, h), Image.BILINEAR)
    top = im.crop((x0, y0 - 3, x1, y0)).resize((w, h), Image.BILINEAR)
    bottom = im.crop((x0, y1, x1, y1 + 3)).resize((w, h), Image.BILINEAR)

    gx = Image.linear_gradient('L').transpose(Image.ROTATE_270).resize((w, h), Image.BILINEAR)
    gy = Image.linear_gradient('L').resize((w, h), Image.BILINEAR)

    fill = Image.blend(Image.composite(right, left, gx),
                       Image.composite(bottom, top, gy), 0.5)
    fill = fill.filter(ImageFilter.GaussianBlur(2.2))

    out = im.copy()
    out.paste(fill, (x0, y0), _feather(w, h))
    return out


def build_masters(files, workdir):
    """Watermark-free, deblocked, temporally denoised 1920x1080 PNG masters."""
    clean = os.path.join(workdir, 'clean')
    master = os.path.join(workdir, 'master')
    os.makedirs(clean)
    os.makedirs(master)

    print('cleaning watermark...')
    for i, path in enumerate(files, 1):
        # PNG intermediates so ffmpeg never sees a second generation of JPEG
        inpaint(Image.open(path).convert('RGB')).save(
            os.path.join(clean, f'c-{i:03d}.png'))

    print('deblock + temporal denoise + upscale...')
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '25',
         '-start_number', '1', '-i', os.path.join(clean, 'c-%03d.png'),
         '-vf', FILTERS,
         '-start_number', '1', os.path.join(master, 'm-%03d.png')],
        check=True)

    out = sorted(glob.glob(os.path.join(master, 'm-*.png')))
    if len(out) != len(files):
        sys.exit(f'ffmpeg produced {len(out)} frames, expected {len(files)}')
    return out


def main():
    if not shutil.which('ffmpeg'):
        sys.exit('ffmpeg not found - install it, or see the notes in this file')

    for tier, _, _ in TIERS:
        os.makedirs(os.path.join(PUB, 'frames', tier), exist_ok=True)
    for folder in ('img/services', 'img/interiors', 'img/projects', 'img/misc'):
        os.makedirs(os.path.join(PUB, folder), exist_ok=True)

    files = sorted(glob.glob(os.path.join(SRC, 'ezgif-frame-*.jpg')))
    if not files:
        sys.exit(f'no source frames found in {SRC}')
    print(f'{len(files)} source frames')

    with tempfile.TemporaryDirectory(prefix='konst-frames-') as workdir:
        masters = build_masters(files, workdir)

        print('encoding tiers...')
        cache = {}
        for i, path in enumerate(masters, 1):
            im = Image.open(path).convert('RGB')
            if i in (1, 2, 4, 11, 24, 31, 43, 48, 56, 58, 70, 71, 74, 76, 79, 80):
                cache[i] = im.copy()          # frames the section crops need
            for tier, size, q in TIERS:
                src = im
                if tier == 'p':
                    cw = round(MASTER_H * PORTRAIT_CROP_ASPECT)
                    x = (MASTER_W - cw) // 2
                    src = im.crop((x, 0, x + cw, MASTER_H))
                out = src if src.size == size else src.resize(size, Image.LANCZOS)
                out.save(os.path.join(PUB, 'frames', tier, f'f-{i:03d}.webp'),
                         'WEBP', quality=q, method=6)

        print('section imagery...')

        def shot(frame, box, size, out, sharpen=False, warm=1.0):
            b = tuple(round(v * SCALE) for v in box)
            im = cache[frame].crop(b).resize(size, Image.LANCZOS)
            if sharpen:
                im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=35, threshold=3))
            if warm != 1.0:
                im = ImageEnhance.Color(im).enhance(warm)
            im.save(os.path.join(PUB, out), 'WEBP', quality=90, method=6)
            print(' ', out)

        P45 = (760, 950)      # 4:5 portrait cards
        P34 = (820, 1093)     # 3:4 portrait
        L43 = (1000, 750)     # 4:3 landscape
        SQ = (900, 900)
        CARD = (760, 554)     # interior-space cards

        # Services - three defining moments of the transformation
        shot(4,  (300,   0, 1020, 720), P45, 'img/services/architecture.webp')
        shot(58, (330,  40, 1050, 720), P45, 'img/services/interiors.webp')
        shot(31, (250,   0,  970, 720), P45, 'img/services/visualization.webp')

        # Interior spaces - six distinct areas of the room
        shot(74, (380, 300,  956, 720), CARD, 'img/interiors/bedroom.webp')
        shot(48, (  0,   0,  520, 380), CARD, 'img/interiors/ceiling.webp')
        shot(79, (  0,  40,  576, 460), CARD, 'img/interiors/pooja.webp')
        shot(70, (860, 200, 1280, 620), (760, 760), 'img/interiors/tv-unit.webp')
        shot(56, ( 20, 300,  596, 720), CARD, 'img/interiors/visitors.webp')
        shot(80, (430, 380, 1006, 700), (760, 422), 'img/interiors/kitchen.webp')

        # Projects - wide portfolio crops across the whole sequence
        shot(2,  (180,   0, 1100, 690), L43, 'img/projects/p1.webp')
        shot(24, (300,  60, 1020, 720), P34, 'img/projects/p2.webp')
        shot(43, (140,  90, 1140, 690), (1100, 660), 'img/projects/p3.webp')
        shot(76, (  0,  60,  540, 720), P34, 'img/projects/p4.webp')
        shot(71, (  0, 120,  720, 720), SQ,  'img/projects/p5.webp')
        shot(80, (120,  20, 1160, 700), (1120, 733), 'img/projects/p6.webp')

        # Hero and story
        shot(1,  (0, 0, 1280, 720), (1920, 1080), 'img/misc/hero.webp')
        shot(1,  (0, 0, 1280, 720), (1000, 563),  'img/misc/hero-m.webp')
        shot(80, (0, 0, 1280, 720), (1920, 1080), 'img/misc/story.webp')
        shot(11, (240, 0, 960, 720), P45, 'img/misc/awards.webp')

    def size_of(rel):
        base = os.path.join(PUB, rel)
        return sum(os.path.getsize(os.path.join(dp, f))
                   for dp, _, fs in os.walk(base) for f in fs) / 1e6

    print()
    for tier, size, q in TIERS:
        print(f"  frames/{tier:<2} {size[0]}x{size[1]:<5} q{q}  {size_of(f'frames/{tier}'):>5.1f} MB")
    print(f"  img                       {size_of('img'):>5.1f} MB")


if __name__ == '__main__':
    main()
