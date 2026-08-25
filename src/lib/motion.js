import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* onEnter / onLeave / onEnterBack / onLeaveBack. Restarting on both entries
   is what makes a reveal replay when the page is scrolled back up, rather
   than only ever playing once on the way down. */
const LOOP = 'restart reverse restart reverse';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 780px)').matches;

/* -------------------------------------------------------------------------
   Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
   and everything settles on a single rAF pass per frame.
   ------------------------------------------------------------------------- */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.4,
    });

    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}

export function scrollToId(id) {
  const el = document.querySelector(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, duration: 1.35 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/* -------------------------------------------------------------------------
   Scroll reveal. Applies to the element and, when `stagger` is set, to its
   [data-reveal-item] descendants.
   ------------------------------------------------------------------------- */
export function useReveal(ref, opts = {}) {
  const { y = 46, delay = 0, stagger = 0, start = 'top 86%', end = 'bottom 14%', once = true } = opts;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(el.querySelectorAll('[data-reveal-item]'), { clearProps: 'all' });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const items = stagger ? el.querySelectorAll('[data-reveal-item]') : [el];
      const targets = items.length ? items : [el];

      gsap.set(targets, { clearProps: 'transform' });
      gsap.set(targets, { opacity: 0, y, yPercent: 0 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        yPercent: 0,
        duration: 1.15,
        delay,
        ease: 'power3.out',
        stagger: stagger || 0,
        /* once:false replays the entrance every time the block enters the
           viewport — scrolling down AND scrolling back up — instead of firing
           a single time and staying put. */
        scrollTrigger: once
          ? { trigger: el, start, once: true }
          : { trigger: el, start, end, toggleActions: LOOP },
      });
    }, el);

    return () => ctx.revert();
  }, [ref, y, delay, stagger, start, end, once]);
}

/* Convenience wrapper: returns a ref you spread onto the container. */
export function useRevealRef(opts) {
  const ref = useRef(null);
  useReveal(ref, opts);
  return ref;
}

/* -------------------------------------------------------------------------
   Image mask reveal: clip-path wipe plus a slow scale settle.
   ------------------------------------------------------------------------- */
export function useImageReveal(ref, { start = 'top 88%', end = 'bottom 14%', delay = 0, once = true } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const img = el.querySelector('img');
      gsap.set(img, { clearProps: 'transform' });
      gsap.set(el, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(img, { scale: 1.22, x: 0, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: once
          ? { trigger: el, start, once: true }
          : { trigger: el, start, end, toggleActions: LOOP },
        delay,
      });
      tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power3.inOut' })
        .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0);
    }, el);

    return () => ctx.revert();
  }, [ref, start, end, delay, once]);
}

/* -------------------------------------------------------------------------
   Split a string into per-word spans that rise into place.
   ------------------------------------------------------------------------- */
export function useLineReveal(ref, { start = 'top 88%', end = 'bottom 14%', delay = 0, stagger = 0.055, once = true } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('[data-word]');
      if (!words.length) return;
      /* y is pinned to 0 alongside yPercent: without it a leftover pixel
         offset from an earlier run survives the tween and the line never
         returns to its resting position. */
      gsap.set(words, { clearProps: 'transform' });
      /* A touch of rotation on the way up keeps the line from reading as a
         flat wipe — the words settle rather than slide. */
      gsap.fromTo(words, { yPercent: 116, y: 0, rotate: 2.4 }, {
        yPercent: 0,
        y: 0,
        rotate: 0,
        duration: 1.25,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: once
          ? { trigger: el, start, once: true }
          : { trigger: el, start, end, toggleActions: LOOP },
      });
    }, el);

    return () => ctx.revert();
  }, [ref, start, end, delay, stagger, once]);
}

/* -------------------------------------------------------------------------
   Plan draw-on: strokes ink themselves in the order a drawing is actually
   built — walls, then the fit-out, then the annotation. Every animated path
   carries pathLength="1", so one dash unit is the whole path whatever its
   real length, and [data-fade] carries the parts a dash would ruin (dashed
   rugs) or that were never strokes (text).
   ------------------------------------------------------------------------- */
export function usePlanDraw(ref, { start = 'top bottom', end = 'bottom top', once = true } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    /* Nothing is set until we know we are animating: with reduced motion the
       drawing has to render as a finished drawing, not an empty frame. */
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const strokes = el.querySelectorAll('[data-draw]');
      const fades = el.querySelectorAll('[data-fade]');
      if (!strokes.length) return;

      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(fades, { opacity: 0 });

      /* The section is the trigger, not the drawing: the drawing is absolutely
         positioned and bleeds out of the section, so its own box is a poor
         thing to measure against. */
      const trigger = el.closest('.section') || el;
      const tl = gsap.timeline({
        scrollTrigger: once
          ? { trigger, start, once: true }
          : { trigger, start, end, toggleActions: LOOP },
      });

      ['wall', 'fit', 'note'].forEach((pass, i) => {
        const set = el.querySelectorAll(`[data-draw="${pass}"]`);
        if (!set.length) return;
        tl.to(set, {
          strokeDashoffset: 0,
          duration: 1.05,
          ease: 'power2.out',
          stagger: 0.05,
        }, i === 0 ? 0 : '-=0.72');
      });

      tl.to(fades, { opacity: 1, duration: 0.7, ease: 'power1.out', stagger: 0.07 }, '-=0.55');
    }, el);

    return () => ctx.revert();
  }, [ref, start, end, once]);
}

/* -------------------------------------------------------------------------
   Count-up. Writes straight to the DOM node — no React re-renders.
   ------------------------------------------------------------------------- */
export function useCountUp(ref, value, { duration = 2.1, start = 'top 88%' } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      el.textContent = String(value);
      return undefined;
    }

    const ctx = gsap.context(() => {
      const counter = { n: 0 };
      el.textContent = '0';
      gsap.to(counter, {
        n: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = String(Math.round(counter.n)); },
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [ref, value, duration, start]);
}

/* -------------------------------------------------------------------------
   Gentle parallax on a child element.
   ------------------------------------------------------------------------- */
export function useParallax(ref, { amount = 12 } = {}) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || isMobileViewport()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ref, amount]);
}

/* Media query as state, for the few places layout must branch in JS. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export { gsap, ScrollTrigger };
