import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/motion.js';
import { createSequence, createPainter, pickFrameTier } from '../lib/sequence.js';
import { CHAPTERS, FRAME_COUNT, frameSrc } from '../lib/site.js';
import '../styles/story-sequence.css';

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const FADE = 0.028;     // fade width, in sequence progress (< half the chapter gap)
const SMOOTH = 0.16;    // interpolation toward the scroll target

export default function ScrollStory() {
  const section = useRef(null);
  const canvasRef = useRef(null);
  const chapterRefs = useRef([]);
  const railRef = useRef(null);
  const counterRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = section.current;
    if (!canvas || !root) return undefined;

    const tier = pickFrameTier();
    const painter = createPainter(canvas);

    let needsRepaint = true;
    const seq = createSequence({
      count: FRAME_COUNT,
      srcFor: (i) => frameSrc(i, tier),
      onProgress: () => { needsRepaint = true; },
    });

    /* --- scroll position → sequence progress ---------------------------- */
    const target = { p: 0 };
    const shown = { p: 0 };
    let lastFrame = -1;
    let lastChapter = -1;

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { target.p = self.progress; },
      onRefresh: (self) => { target.p = self.progress; needsRepaint = true; },
    });

    /* --- text overlays -------------------------------------------------- */
    const paintChapters = (p) => {
      let active = -1;
      CHAPTERS.forEach((ch, i) => {
        const [a, b] = ch.at;
        const inAlpha = clamp01((p - (a - FADE)) / FADE);
        const outAlpha = clamp01(((b + FADE) - p) / FADE);
        const o = Math.min(inAlpha, outAlpha);
        const el = chapterRefs.current[i];
        if (!el) return;
        if (el.__o !== o) {
          el.style.opacity = o;
          el.style.transform = `translate3d(0, ${(1 - o) * 26}px, 0)`;
          el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
          el.__o = o;
        }
        if (o > 0.5) active = i;
      });

      if (active !== -1 && active !== lastChapter) {
        lastChapter = active;
        if (counterRef.current) {
          counterRef.current.textContent = `0${active + 1} / 0${CHAPTERS.length}`;
        }
      }
    };

    /* --- the single render loop ----------------------------------------- */
    const tick = () => {
      const ratio = gsap.ticker.deltaRatio(60);
      const k = 1 - Math.pow(1 - SMOOTH, ratio);
      shown.p += (target.p - shown.p) * k;
      if (Math.abs(target.p - shown.p) < 0.0004) shown.p = target.p;

      const frame = Math.round(1 + shown.p * (FRAME_COUNT - 1));
      if (frame !== lastFrame || needsRepaint) {
        painter.paint(seq.nearest(frame), needsRepaint);
        lastFrame = frame;
        needsRepaint = false;
      }

      paintChapters(shown.p);

      if (railRef.current) railRef.current.style.transform = `scaleY(${shown.p})`;
      if (hintRef.current) hintRef.current.style.opacity = clamp01(1 - shown.p * 14);
    };

    /* --- sizing ---------------------------------------------------------- */
    const onResize = () => { painter.resize(); needsRepaint = true; };
    painter.resize();

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    if (prefersReducedMotion()) {
      /* Straight scrub, no interpolation, no rAF smoothing. */
      const direct = () => {
        shown.p = target.p;
        const frame = Math.round(1 + shown.p * (FRAME_COUNT - 1));
        painter.paint(seq.nearest(frame), true);
        paintChapters(shown.p);
      };
      trigger.vars.onUpdate = (self) => { target.p = self.progress; direct(); };
      seq.primed().then(direct);
    } else {
      gsap.ticker.add(tick);
    }

    seq.primed().then(() => { needsRepaint = true; ScrollTrigger.refresh(); });

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      trigger.kill();
      seq.cancel();
    };
  }, []);

  return (
    <section className="story" id="story-sequence" ref={section}>
      <div className="story__sticky">
        <canvas className="story__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="story__scrim" aria-hidden="true" />

        <div className="story__copy wrap">
          {CHAPTERS.map((ch, i) => (
            <article
              className="story__chapter"
              key={ch.sub}
              ref={(el) => { chapterRefs.current[i] = el; }}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <h2 className="story__title display">
                {ch.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className="story__sub">{ch.sub}</p>
            </article>
          ))}
        </div>

        <div className="story__meta">
          <span className="story__counter num" ref={counterRef}>01 / 05</span>
          <div className="story__rail" aria-hidden="true">
            <span ref={railRef} />
          </div>
          <span className="story__meta-label">Transformation</span>
        </div>

        <div className="story__hint" ref={hintRef} aria-hidden="true">
          <span className="label">Keep scrolling</span>
        </div>
      </div>

      {/* Non-visual fallback so the narrative is available without the canvas. */}
      <div className="vh">
        <h2>From an empty room to a finished home</h2>
        {CHAPTERS.map((ch) => (
          <p key={ch.sub}>{ch.title.join(' ')} — {ch.sub}</p>
        ))}
      </div>
    </section>
  );
}
