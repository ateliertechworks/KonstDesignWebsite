import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, scrollToId } from '../lib/motion.js';
import { asset, COMPANY, STATS } from '../lib/site.js';
import '../styles/hero.css';

export default function Hero({ ready }) {
  const root = useRef(null);
  const media = useRef(null);

  /* Entrance, held until the intro card has lifted. */
  useEffect(() => {
    if (!ready || !root.current) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(root.current.querySelectorAll('[data-hero]'), { opacity: 1, y: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo(media.current, { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power3.out' })
        .fromTo('[data-hero="eyebrow"]', { yPercent: 120, y: 0 }, { yPercent: 0, y: 0, duration: 1.1 }, 0.15)
        .fromTo('[data-hero="line"]', { yPercent: 118, y: 0 }, { yPercent: 0, y: 0, duration: 1.35, stagger: 0.09 }, 0.25)
        .fromTo('[data-hero="fade"]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.7);
    }, root);

    return () => ctx.revert();
  }, [ready]);

  /* Slow drift + fade as the hero leaves. */
  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-parallax]', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('[data-hero-copy]', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '60% top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root} aria-label="Konst Design — architecture and interior design studio">
      <div className="hero__media" ref={media} data-hero-parallax>
        <picture>
          <source media="(max-width: 780px)" srcSet={asset('img/misc/hero-m.webp')} />
          <img src={asset('img/misc/hero.webp')} alt="An empty loft living room in warm evening light, before design begins" />
        </picture>
        <div className="hero__veil" />
      </div>

      <div className="hero__body wrap" data-hero-copy>
        <div className="hero__mask">
          <span className="hero__eyebrow label" data-hero="eyebrow">Konst Design</span>
        </div>

        <h1 className="hero__title display">
          <span className="hero__mask"><span data-hero="line">Spaces that</span></span>
          <span className="hero__mask"><span data-hero="line">tell your story.</span></span>
        </h1>

        <p className="hero__sub" data-hero="fade">Architecture • Interior Design</p>

        <div className="hero__cta" data-hero="fade">
          <a
            className="btn btn--solid"
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToId('#projects'); }}
          >
            Explore Our Work
            <span className="arw" aria-hidden="true">→</span>
          </a>
          <a className="btn btn--light" href={COMPANY.phoneHref}>
            Start Your Project
            <span className="arw" aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <div className="hero__foot wrap">
        <ul className="hero__stats" data-hero="fade">
          {STATS.slice(0, 3).map((s) => (
            <li key={s.label}>
              <span className="hero__stat-v num">{s.value}{s.suffix}</span>
              <span className="hero__stat-l">{s.label}</span>
            </li>
          ))}
        </ul>

        <button
          className="hero__scroll"
          onClick={() => scrollToId('#story-sequence')}
          data-hero="fade"
        >
          <span className="label">Scroll to explore</span>
          <span className="hero__scroll-line" aria-hidden="true"><i /></span>
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  );
}
