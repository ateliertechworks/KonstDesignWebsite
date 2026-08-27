import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion.js';
import { EXPERTISE, INTERIORS } from '../lib/site.js';
import '../styles/handoff.css';

/* -------------------------------------------------------------------------
   The third service — 3D Drawings — hands over to the first interior card.

   The render lifts out of the services grid, zig-zags down the page and
   settles into the bedroom photograph, where it cross-fades. That is the
   studio's own argument made as a movement: the visualization becomes the
   built room.

   It is one fixed element driven straight from scroll progress. Both ends are
   measured live every frame rather than cached, so a resize, a reflow or the
   interiors rail shifting underneath cannot leave it landing off target.
   ------------------------------------------------------------------------- */

const SRC = '.svc__media--float';
const DST = '.int-card__media--land';

const lerp = (a, b, t) => a + (b - a) * t;
/* Slow to leave, quick across the middle, slow to land. */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

export default function ServiceHandoff() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const src = document.querySelector(SRC);
      const dst = document.querySelector(DST);
      if (!src || !dst) return undefined;

      let srcFaded = false;

      const paint = (p) => {
        const a = src.getBoundingClientRect();
        const b = dst.getBoundingClientRect();
        if (!a.width || !b.width) return;

        const e = easeInOut(p);

        /* The panel keeps the source's box and is scaled into the target's,
           so the only per-frame writes are composited ones. */
        if (el.__w !== a.width || el.__h !== a.height) {
          el.style.width = `${a.width}px`;
          el.style.height = `${a.height}px`;
          el.__w = a.width;
          el.__h = a.height;
        }

        const vw = window.innerWidth;
        const phone = vw < 781;

        /* One envelope drives everything that only happens mid-flight, so the
           panel leaves its slot and lands on the card with all of it back at
           zero — no drift, no residual tilt. */
        const damp = Math.sin(p * Math.PI);

        /* The panel draws in through the middle of the journey. On a phone the
           service image is nearly the full width of the screen: without the
           pinch there is no room either side to swing into, and the zig-zag
           would be a couple of pixels of wobble. */
        const pinch = 1 - (phone ? 0.34 : 0.12) * damp;
        const scale = lerp(1, b.width / a.width, e) * pinch;

        /* Zig-zag: three lateral swings, sized to the room actually left
           beside the panel at this instant rather than a fixed number, so it
           never swings off the edge of a narrow screen. */
        const room = Math.max(0, (vw - a.width * scale) / 2);
        const amp = Math.min(room * 0.86, 260);
        const swing = Math.sin(p * Math.PI * 3) * amp * damp;
        const tilt = Math.cos(p * Math.PI * 3) * (phone ? 8 : 6.5) * damp;
        const arc = -Math.sin(p * Math.PI * 2) * (phone ? 18 : 30) * damp;

        const cx = lerp(a.left + a.width / 2, b.left + b.width / 2, e) + swing;
        const cy = lerp(a.top + a.height / 2, b.top + b.height / 2, e) + arc;

        /* Source is square, the card is 4:3. Crop towards the target's shape
           rather than scaling the two axes apart, which would squash the
           render. Driven by aspect, not by height, so the pinch above cannot
           disturb it — and clip-path composites, where height would relayout. */
        const aspect = lerp(a.width / a.height, b.width / b.height, e);
        const frac = Math.min(1, 1 / aspect);
        const inset = ((1 - frac) / 2) * 100;

        el.style.transform =
          `translate3d(${cx - a.width / 2}px, ${cy - a.height / 2}px, 0) ` +
          `rotate(${tilt}deg) scale(${scale})`;
        el.style.clipPath = `inset(${inset}% 0)`;
        el.style.opacity = p < 0.84 ? 1 : Math.max(0, 1 - (p - 0.84) / 0.16);

        /* Take the original out of the grid the moment the panel lifts, or
           the same image is on screen twice. */
        const gone = p > 0.015;
        if (gone !== srcFaded) {
          src.style.opacity = gone ? '0' : '';
          srcFaded = gone;
        }
      };

      const st = ScrollTrigger.create({
        trigger: src,
        start: 'center 58%',
        endTrigger: dst,
        end: 'center 62%',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
        onToggle: (self) => {
          el.style.visibility = self.isActive ? 'visible' : 'hidden';
          if (!self.isActive && srcFaded) {
            src.style.opacity = '';
            srcFaded = false;
          }
        },
      });

      return () => {
        st.kill();
        src.style.opacity = '';
        el.style.visibility = 'hidden';
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="handoff" ref={ref} aria-hidden="true">
      <img src={EXPERTISE[2].img} alt="" decoding="async" />
      <span className="handoff__tag label">
        {EXPERTISE[2].title} <i aria-hidden="true">→</i> {INTERIORS[0].title}
      </span>
    </div>
  );
}
