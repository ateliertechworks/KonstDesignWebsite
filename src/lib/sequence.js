/* -------------------------------------------------------------------------
   Frame sequence loading.

   Frames arrive in three waves so the sequence is scrubbable long before the
   whole set has landed:

     wave 1  the opening frames, so the section can be shown at all
     wave 2  every 6th frame, so any scroll position already has something
             close to draw
     wave 3  everything else, filling the gaps in

   Nothing here touches React state per image — the canvas reads the array
   directly, and only the coarse "loaded" counter is surfaced for the intro.
   ------------------------------------------------------------------------- */

const CONCURRENCY = 8;

export function createSequence({ count, srcFor, onProgress }) {
  const images = new Array(count + 1).fill(null);
  const loaded = new Uint8Array(count + 1);
  let done = 0;
  let cancelled = false;

  const priority = () => {
    const order = [];
    const seen = new Set();
    const push = (i) => {
      if (i >= 1 && i <= count && !seen.has(i)) { seen.add(i); order.push(i); }
    };
    for (let i = 1; i <= Math.min(10, count); i += 1) push(i);   // wave 1
    for (let i = 1; i <= count; i += 6) push(i);                  // wave 2
    for (let i = 1; i <= count; i += 1) push(i);                  // wave 3
    return order;
  };

  const queue = priority();
  let cursor = 0;

  const loadOne = (index) =>
    new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = index <= 10 ? 'high' : 'low';
      const settle = () => {
        if (!cancelled) {
          images[index] = img;
          loaded[index] = 1;
          done += 1;
          onProgress?.(done, count);
        }
        resolve();
      };
      img.onload = () => {
        if (typeof img.decode === 'function') img.decode().then(settle, settle);
        else settle();
      };
      img.onerror = () => { done += 1; onProgress?.(done, count); resolve(); };
      img.src = srcFor(index);
    });

  const worker = async () => {
    while (!cancelled && cursor < queue.length) {
      const index = queue[cursor];
      cursor += 1;
      if (loaded[index]) continue;
      await loadOne(index);
    }
  };

  const started = Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker())
  );

  /* First frames only — used to gate the intro screen. */
  const primed = () =>
    new Promise((resolve) => {
      const check = () => {
        if (cancelled) return resolve();
        let n = 0;
        for (let i = 1; i <= Math.min(8, count); i += 1) if (loaded[i]) n += 1;
        if (n >= Math.min(6, count)) resolve();
        else setTimeout(check, 60);
        return undefined;
      };
      check();
    });

  /* Nearest already-decoded frame, so a scrub never lands on a blank. */
  const nearest = (index) => {
    const i = Math.max(1, Math.min(count, index));
    if (loaded[i]) return images[i];
    for (let step = 1; step <= count; step += 1) {
      if (i - step >= 1 && loaded[i - step]) return images[i - step];
      if (i + step <= count && loaded[i + step]) return images[i + step];
    }
    return null;
  };

  return {
    images,
    nearest,
    primed,
    started,
    get progress() { return done / count; },
    cancel() { cancelled = true; },
  };
}

/* -------------------------------------------------------------------------
   Canvas painter. Cover-fills wide viewports; on portrait screens it fits to
   width and letterboxes, so the room composition is never cropped to a sliver.
   ------------------------------------------------------------------------- */

export const IMG_ASPECT = 1280 / 720;
const PORTRAIT_CUTOFF = 1.15;
const PORTRAIT_FILL = 1.22;   // slight side crop so the band is not too thin
const CANVAS_MAX_W = 2560;    // backing-store ceiling, for GPU cost

/* -------------------------------------------------------------------------
   Which frame tier this display actually needs.

   Worked from the width the frame will really be painted at — which depends
   on how the canvas covers the viewport — rather than a plain breakpoint, so
   a retina laptop and a retina phone each get the right one.
   ------------------------------------------------------------------------- */
export function pickFrameTier() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const vp = w / h;

  const paintedCssWidth =
    vp >= IMG_ASPECT ? w                        // wide — cover by width
      : vp >= PORTRAIT_CUTOFF ? h * IMG_ASPECT  // mildly tall — cover by height
        : w * PORTRAIT_FILL;                    // portrait — letterboxed

  const needed = Math.min(paintedCssWidth * dpr, CANVAS_MAX_W);
  let tier = needed <= 1000 ? 'm' : needed <= 1400 ? 'd' : 'hd';

  /* Eighty decoded 1920x1080 frames is a lot of bitmap to keep warm. Step
     down when the device says it is short of memory, or the visitor has
     asked to save data. Both hints are absent on some browsers, in which
     case we keep the quality. */
  const conn = navigator.connection;
  if (conn && conn.saveData) tier = 'm';
  else if (navigator.deviceMemory && navigator.deviceMemory <= 4 && tier === 'hd') tier = 'd';

  return tier;
}

export function createPainter(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  let cw = 0;
  let ch = 0;
  let current = null;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.round(rect.width);
    ch = Math.round(rect.height);
    canvas.width = Math.min(Math.round(cw * dpr), CANVAS_MAX_W);
    canvas.height = Math.round((canvas.width / Math.max(cw, 1)) * ch);
    ctx.setTransform(canvas.width / Math.max(cw, 1), 0, 0, canvas.width / Math.max(cw, 1), 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (current) paint(current, true);
  };

  function paint(img, force = false) {
    if (!img || (!force && img === current)) return;
    current = img;
    if (!cw || !ch) return;

    const vp = cw / ch;
    let dw;
    let dh;
    let dy;

    if (vp >= IMG_ASPECT) {          // wide — cover by width
      dw = cw; dh = cw / IMG_ASPECT; dy = (ch - dh) / 2;
    } else if (vp >= PORTRAIT_CUTOFF) { // mildly tall — cover by height
      dh = ch; dw = ch * IMG_ASPECT; dy = 0;
    } else {                          // portrait — letterbox, cropped a little
      dw = cw * PORTRAIT_FILL; dh = dw / IMG_ASPECT; dy = (ch - dh) * 0.46;
    }
    const dx = (cw - dw) / 2;

    ctx.fillStyle = '#16140F';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  return { resize, paint, get size() { return { cw, ch }; } };
}
