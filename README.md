# Konst Design — Studio Website

Architecture, interior design and 3D visualization studio site for **Konst Design**,
Coimbatore & Dindigul, Tamil Nadu.

Built with React 18 + Vite, GSAP ScrollTrigger and Lenis smooth scroll.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

`dist/` is a static site — upload its contents to any host (Netlify, Vercel,
cPanel, S3). Paths are relative, so it also works from a subfolder such as
`example.com/konst/`. It must be served over HTTP, not opened as a `file://`
page, because it uses ES modules.

---

## The scroll story

The centrepiece is the 80-frame room transformation in `src/components/ScrollStory.jsx`.

- Frames are drawn to a single `<canvas>` inside a `position: sticky` container —
  there is no slideshow, no per-frame DOM node.
- Scroll position drives the frame index through one ScrollTrigger; a
  `requestAnimationFrame` loop interpolates towards it, so scrubbing both
  directions stays smooth and reverses cleanly.
- All DOM writes in the loop go through refs. The component never re-renders
  while you scroll.
- Frames load in three waves (`src/lib/sequence.js`): the opening frames first,
  then every sixth frame so any scroll position has something close to draw,
  then the gaps. Until a frame arrives the nearest decoded one is used, so the
  canvas never blanks.
- Three resolution tiers ship; `pickFrameTier()` picks **one** per visitor from
  the width the frame will actually be painted at, so nobody downloads more
  than they can see:

  | tier | size      | weight | goes to |
  | ---- | --------- | ------ | ------- |
  | `hd` | 1920×1080 | 9.2 MB | large or retina displays |
  | `d`  | 1280×720  | 6.1 MB | standard displays |
  | `m`  | 960×540   | 3.2 MB | phones |

  It steps down a tier when the browser reports `navigator.deviceMemory ≤ 4 GB`,
  and drops to `m` when the visitor has Data Saver on.
- Portrait viewports letterbox the frame instead of cropping it to a sliver.
- With `prefers-reduced-motion: reduce` the sequence still scrubs, but with no
  interpolation, no smooth scroll and no reveal animations.

Chapter overlay text lives in `CHAPTERS` in `src/lib/site.js`; each entry has an
`at: [enter, exit]` range in sequence progress (0 → 1).

---

## Editing content

**All copy, contact details, services, projects and locations are in one file:
`src/lib/site.js`.** Nothing else needs touching for a text change.

### Replacing images

Drop replacements into `public/img/...` keeping the same filenames, or point
`site.js` at new ones.

| Section          | Files                                  | Aspect        |
| ---------------- | -------------------------------------- | ------------- |
| Services         | `public/img/services/*.webp`           | 4:5 portrait  |
| Interior spaces  | `public/img/interiors/*.webp`          | 4:3 landscape |
| Projects         | `public/img/projects/p1–p6.webp`       | mixed         |
| Story / hero     | `public/img/misc/*.webp`               | mixed         |

Crop boxes for all of them are at the bottom of `tools/build-frames.py`, in
source-frame (1280×720) coordinates.

The frame sequence lives in `public/frames/{hd,d,m}/f-001…080.webp`. To
regenerate everything from new source frames, replace the JPEGs in `frame/`
and run:

```bash
python3 tools/build-frames.py      # needs Pillow and ffmpeg
```

### How the frames are processed

The supplied frames are heavily compressed JPEGs — about 0.25 bits/pixel at
1280×720 — so they carry visible 8×8 blocking and mosquito noise, and simply
re-encoding them compounds the loss. `tools/build-frames.py` instead:

1. paints out the generator's watermark from the lower right of each frame;
2. removes the JPEG block grid (ffmpeg `deblock`);
3. denoises **temporally** across the sequence — the camera never moves, so
   averaging each pixel against its neighbours in time strips compression
   noise without touching real detail;
4. upscales to 1920×1080 with Lanczos and applies one light unsharp pass, so
   the sharpening happens once offline instead of the browser upscaling a
   small frame on every paint;
5. encodes the three tiers at visually lossless quality (≥45 dB PSNR).

The section imagery is cut from those 1920px masters, so the crops downsample
rather than upscale.

The real ceiling here is the source: 1280×720 at 0.25 bpp. **If the original
video or render these frames came from still exists, re-exporting the sequence
from it at 1920×1080 and dropping the JPEGs into `frame/` would raise quality
further than any amount of processing can.**

---

## Placeholders to replace before launch

These were not supplied in the brief and are currently stand-ins:

1. **Project portfolio** — the six project names, locations, categories and years
   in `PROJECTS` (`src/lib/site.js`) are illustrative. Replace with real projects
   and real photography.
2. **Award names** — `AWARDS` lists six illustrative award titles. The count (12)
   is real; the individual names are not.
3. **Twitter / X link** — `COMPANY.twitter` points at `twitter.com`. Set the real
   profile URL.
4. **Google Maps** — both "View on Google Maps" buttons use an address search
   query. Swap in the studio's actual Google Maps place links for pin accuracy.
5. **Section imagery** — every image on the site is cropped from the supplied
   living-room sequence, so the same room recurs. Replace with real project
   photography when available.

---

## Structure

```
index.html
vite.config.js
frame/                     original source frames (not shipped in the build)
tools/build-frames.py      regenerates every image asset from frame/
public/
  frames/hd, frames/d, m   the 80-frame sequence, three resolutions
  img/                     section imagery
src/
  App.jsx
  lib/
    site.js                all content and copy
    motion.js              smooth scroll, reveal/count-up/parallax hooks
    sequence.js            frame loader + canvas painter
  components/              one file per section
  styles/                  global design tokens + one stylesheet per section
```

Design tokens (colours, type scale, spacing, easing) are at the top of
`src/styles/global.css`.
