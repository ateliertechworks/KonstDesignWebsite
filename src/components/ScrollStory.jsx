import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToId, scrollToY } from '../lib/motion.js';
import { createSequence, createPainter, pickFrameTier } from '../lib/sequence.js';
import { CHAPTERS, COMPANY, FRAME_COUNT, STATS, frameSrc } from '../lib/site.js';
import '../styles/story-sequence.css';

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
const FADE = 0.028;     // fade width, in chapter progress (< half the chapter gap)
const SMOOTH = 0.16;    // interpolation toward the scroll target
/* Share of the scroll the opening statement owns. The frames are already
   running underneath it — this is only how long the type stays on top. */
const LEDE = 0.12;

export default function ScrollStory({ ready }) {
  const section = useRef(null);
  const canvasRef = useRef(null);
  const ledeRef = useRef(null);
  const chapterRefs = useRef([]);
  const railRef = useRef(null);
  const metaRef = useRef(null);
  const counterRef = useRef(null);

  /* Entrance, held until the intro card has lifted. */
  useEffect(() => {
    const lede = ledeRef.current;
    if (!ready || !lede) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(lede.querySelectorAll('[data-lede]'), { opacity: 1, y: 0, yPercent: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo('[data-lede="eyebrow"]', { yPercent: 120, y: 0 }, { yPercent: 0, y: 0, duration: 1.1 }, 0.15)
        .fromTo('[data-lede="line"]', { yPercent: 118, y: 0 }, { yPercent: 0, y: 0, duration: 1.35, stagger: 0.09 }, 0.25)
        .fromTo('[data-lede="fade"]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.7);
    }, lede);

    return () => ctx.revert();
  }, [ready]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = section.current;
    if (!canvas || !root) return undefined;

    const tier = pickFrameTier();
    const painter = createPainter(canvas, tier);

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

    /* Chapters run 0 → 1 across the stretch left once the lede has gone, so
       the ranges in CHAPTERS stay readable as "share of the story".
       Deliberately NOT clamped at the bottom: a floor of 0 would hold the
       first chapter at full opacity underneath the opening statement, which
       is exactly the two-headlines-at-once collision. */
    const chapterProgress = (p) => Math.min(1, (p - LEDE) / (1 - LEDE));

    /* --- the opening statement ------------------------------------------ */
    const paintLede = (p) => {
      const el = ledeRef.current;
      if (!el) return;
      const o = clamp01(1 - p / LEDE);
      /* squared, so it holds its ground for the first flick of the wheel and
         then leaves decisively */
      const a = o * o;
      if (el.__o === a) return;
      el.style.opacity = a;
      el.style.transform = `translate3d(0, ${(1 - a) * -70}px, 0)`;
      /* hidden rather than transparent, so the faded copy stops swallowing
         clicks meant for the page underneath */
      el.style.visibility = a < 0.01 ? 'hidden' : 'visible';
      el.__o = a;
    };

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

    const paintOverlays = (p) => {
      const cp = chapterProgress(p);
      paintLede(p);
      paintChapters(cp);

      /* The rail and counter belong to the story, not to the opening — they
         arrive with the first chapter. Every write is guarded: this runs on
         every animation frame, and an unchanged style write still costs a
         style recalc. */
      const meta = metaRef.current;
      if (meta) {
        const o = clamp01((p - LEDE) / 0.04);
        if (meta.__o !== o) { meta.style.opacity = o; meta.__o = o; }
      }
      const rail = railRef.current;
      if (rail) {
        const r = clamp01(cp);
        if (rail.__r !== r) { rail.style.transform = `scaleY(${r})`; rail.__r = r; }
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

      paintOverlays(shown.p);
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
        paintOverlays(shown.p);
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
    <section
      className="story"
      id="story-sequence"
      ref={section}
      aria-label="Konst Design — architecture and interior design studio"
    >
      <div className="story__sticky">
        <canvas className="story__canvas" ref={canvasRef} aria-hidden="true" />
        <div className="story__scrim" aria-hidden="true" />

        {/* The opening statement sits on the first frames rather than on a
            static screen of its own — the sequence is the home page. */}
        <div className="story__lede" ref={ledeRef}>
          <div className="story__lede-inner wrap">
            <div className="story__lede-body">
              <h1 className="story__lede-title display">
                <span className="story__lede-mask"><span data-lede="line">Spaces that</span></span>
                <span className="story__lede-mask"><span data-lede="line">tell your story.</span></span>
              </h1>

              <p className="story__lede-sub" data-lede="fade">{COMPANY.tagline}</p>

              <div className="story__lede-cta" data-lede="fade">
                <a
                  className="btn btn--solid"
                  href="#projects"
                  onClick={(e) => { e.preventDefault(); scrollToId('#projects'); }}
                >
                  Explore Our Work
                  <span className="arw" aria-hidden="true">&#8594;</span>
                </a>
                <a className="btn btn--light" href={COMPANY.phoneHref}>
                  Start Your Project
                  <span className="arw" aria-hidden="true">&#8594;</span>
                </a>
              </div>
            </div>

            <footer className="story__lede-foot" data-lede="fade">
              <ul className="story__stats">
                {STATS.slice(0, 3).map((s) => (
                  <li key={s.label}>
                    <span className="story__stat-v num">{s.value}{s.suffix}</span>
                    <span className="story__stat-l">{s.label}</span>
                  </li>
                ))}
              </ul>

              <button className="story__scroll" onClick={() => scrollToY(window.innerHeight * 1.1)}>
                <span className="label">Scroll to explore</span>
                <span className="story__scroll-line" aria-hidden="true"><i /></span>
                <span className="story__scroll-arw" aria-hidden="true">&#8595;</span>
              </button>
            </footer>
          </div>
        </div>

        <div className="story__copy wrap">
          {CHAPTERS.map((ch, i) => (
            <article
              className="story__chapter"
              key={ch.sub}
              ref={(el) => { chapterRefs.current[i] = el; }}
              style={{ opacity: 0, visibility: 'hidden' }}
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

        <div className="story__meta" ref={metaRef}>
          <span className="story__counter num" ref={counterRef}>01 / 05</span>
          <div className="story__rail" aria-hidden="true">
            <span ref={railRef} />
          </div>
          <span className="story__meta-label">Transformation</span>
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
