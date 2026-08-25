import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { INTERIORS } from '../lib/site.js';
import { SectionHead, SheetMark } from './Bits.jsx';
import {
  gsap,
  useReveal,
} from '../lib/motion.js';
import '../styles/interiors.css';

export default function InteriorSpaces() {
  const [openIndex, setOpenIndex] = useState(null);
  const sectionRef = useRef(null);
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const progRef = useRef(null);
  const open = openIndex !== null ? INTERIORS[openIndex] : null;

  useReveal(railRef, { stagger: 0.075, y: 54 });

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((dir) => {
    setOpenIndex((i) => (i === null ? null : (i + dir + INTERIORS.length) % INTERIORS.length));
  }, []);

  /* -----------------------------------------------------------------------
     Vertical scroll drives the rail sideways: the rail pins while the six
     cards travel exactly their overflow width, then the page moves on.
     Touch and reduced-motion fall back to a native swipe rail (.is-static).
     ----------------------------------------------------------------------- */
  useLayoutEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    const root = sectionRef.current;
    if (!rail || !track || !root) return undefined;

    /* Recomputed on every refresh so a resize re-measures instead of
       scrubbing to a stale width. */
    const distance = () => Math.max(0, track.scrollWidth - rail.clientWidth);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 781px) and (prefers-reduced-motion: no-preference)', () => {
      root.classList.remove('is-static');

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: rail,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progRef.current) progRef.current.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      return () => root.classList.add('is-static');
    });

    mm.add('(max-width: 780px), (prefers-reduced-motion: reduce)', () => {
      root.classList.add('is-static');
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (openIndex === null) return undefined;
    document.body.classList.add('is-locked');
    window.__lenis?.stop();

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('is-locked');
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, step]);

  return (
    <section className="section section--bone interiors section--sheet" id="interiors" ref={sectionRef}>
      <div className="wrap">
        <SheetMark index="02" caption="Room by room" />
        <SectionHead
          label="Interior spaces"
          title={['Designed around', 'the way you live.']}
          aside={
            <>
              Six rooms we are asked for most often. Each one is drawn, detailed and specified
              in-house, then built with contractors we have worked with for years.
            </>
          }
        />
      </div>

      <div className="int-rail" ref={railRef}>
        <ul className="int-track" ref={trackRef}>
          {INTERIORS.map((item, i) => (
            <li className="int-card" key={item.no} data-reveal-item>
              <button className="int-card__btn" onClick={() => setOpenIndex(i)}>
                <span className="int-card__media img-frame">
                  <img
                    src={item.img}
                    alt={item.alt}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="int-card__plus" aria-hidden="true" />
                </span>
                <span className="int-card__foot">
                  <span className="int-card__no num">{item.no}</span>
                  <span className="int-card__title">{item.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="int-rail__prog" aria-hidden="true">
          <span ref={progRef} />
        </div>
      </div>

      <div className={`lb ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        <button className="lb__backdrop" onClick={close} aria-label="Close" tabIndex={open ? 0 : -1} />

        {open && (
          <div className="lb__panel">
            <figure className="lb__media">
              <img src={open.img} alt={open.alt} />
            </figure>

            <div className="lb__body">
              <span className="lb__no label">Interior Service — {open.no}</span>
              <h3 className="lb__title display">{open.title}</h3>
              <p className="lb__desc">{open.desc}</p>

              <div className="lb__actions">
                <a className="btn btn--solid" href="#contact" onClick={close}>
                  Enquire about this <span className="arw" aria-hidden="true">→</span>
                </a>
              </div>

              <div className="lb__nav">
                <button onClick={() => step(-1)} aria-label="Previous service">← Prev</button>
                <span className="num">{open.no} / 06</span>
                <button onClick={() => step(1)} aria-label="Next service">Next →</button>
              </div>
            </div>

            <button className="lb__close" onClick={close} aria-label="Close">
              <span /><span />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
