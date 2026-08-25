import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { asset, COMPANY, frameSrc } from '../lib/site.js';
import { pickFrameTier } from '../lib/sequence.js';
import '../styles/intro.css';

/* Warms the hero image and the opening frames behind a short title card. */
export default function Intro({ onDone }) {
  const root = useRef(null);
  const barRef = useRef(null);
  const pctRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let alive = true;
    const mobile = window.matchMedia('(max-width: 780px)').matches;
    const tier = pickFrameTier();
    const sources = [
      asset(mobile ? 'img/misc/hero-m.webp' : 'img/misc/hero.webp'),
      ...Array.from({ length: 6 }, (_, i) => frameSrc(i + 1, tier)),
    ];

    let settled = 0;
    const shown = { v: 0 };

    const bump = () => {
      settled += 1;
      const target = settled / sources.length;
      gsap.to(shown, {
        v: target,
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          if (barRef.current) barRef.current.style.transform = `scaleX(${shown.v})`;
          if (pctRef.current) pctRef.current.textContent = String(Math.round(shown.v * 100)).padStart(2, '0');
        },
      });
    };

    Promise.all(
      sources.map(
        (src) =>
          new Promise((res) => {
            const img = new Image();
            img.onload = img.onerror = () => { bump(); res(); };
            img.src = src;
          })
      )
    ).then(() => {
      if (!alive) return;
      const finish = () => {
        setHidden(true);
        onDone?.();
      };

      if (prefersReducedMotion()) { finish(); return; }

      gsap
        .timeline({ delay: 0.25 })
        .to('[data-intro-line]', { yPercent: -110, duration: 0.85, ease: 'expo.inOut', stagger: 0.06 })
        .to('[data-intro-meter]', { opacity: 0, duration: 0.4 }, '<')
        .to(root.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.0,
          ease: 'expo.inOut',
          onComplete: finish,
        }, '-=0.25');
    });

    /* Safety net: never trap the visitor behind the overlay. */
    const bail = setTimeout(() => { if (alive) { setHidden(true); onDone?.(); } }, 7000);

    return () => { alive = false; clearTimeout(bail); };
  }, [onDone]);

  if (hidden) return null;

  return (
    <div className="intro" ref={root} role="status" aria-label="Loading Konst Design">
      <div className="intro__inner">
        <div className="intro__mask">
          <span className="intro__line display" data-intro-line>Konst</span>
        </div>
        <div className="intro__mask">
          <span className="intro__line display" data-intro-line>Design</span>
        </div>
        <div className="intro__mask intro__mask--sub">
          <span className="intro__sub label" data-intro-line>{COMPANY.tagline}</span>
        </div>
      </div>

      <div className="intro__meter" data-intro-meter>
        <div className="intro__track"><span className="intro__bar" ref={barRef} /></div>
        <span className="intro__pct num" ref={pctRef}>00</span>
      </div>
    </div>
  );
}
