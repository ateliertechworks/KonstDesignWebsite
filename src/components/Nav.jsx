import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NAV, COMPANY } from '../lib/site.js';
import { scrollToId, ScrollTrigger } from '../lib/motion.js';
import '../styles/nav.css';

export default function Nav({ ready }) {
  const [solid, setSolid] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(NAV[0].href);
  const [hover, setHover] = useState(null);

  const lastY = useRef(0);
  const linksRef = useRef(null);
  const itemRefs = useRef({});
  const progRef = useRef(null);

  /* --- scroll state: condense, auto-hide, progress, scroll-spy -----------
     Smooth scrolling fires this on every animation frame, so it may not read
     layout: querySelector + getBoundingClientRect per nav item, plus
     scrollHeight, is five forced reflows a frame on a page that is mostly
     one very tall pinned section. The document offsets are measured once and
     re-measured only when the page itself can have changed size. */
  useEffect(() => {
    let spots = [];
    let max = 1;
    let storyEnd = 0;

    const measure = () => {
      const doc = document.documentElement;
      max = Math.max(1, doc.scrollHeight - window.innerHeight);
      /* Where the pinned sequence lets go of the viewport. */
      const story = document.getElementById('story-sequence');
      storyEnd = story
        ? story.getBoundingClientRect().top + window.scrollY + story.offsetHeight - window.innerHeight
        : 0;
      spots = NAV
        .filter((item) => item.href !== '#top')
        .map((item) => {
          const el = document.querySelector(item.href);
          return el ? { href: item.href, top: el.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter(Boolean);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      /* Three states, because the bar crosses two very different backdrops.
         Over the sequence the frames swing from a blown-out window to a dark
         floor, so the light capsule is unreadable there — and its backdrop
         blur would have to re-filter the canvas on every scrolled pixel. */
      setSolid(y > storyEnd);
      setOnDark(y > vh * 0.35 && y <= storyEnd);
      setHide(y > lastY.current && y > vh * 1.1);
      lastY.current = y;

      if (progRef.current) {
        progRef.current.style.transform = `scaleX(${Math.min(1, y / max)})`;
      }

      /* The section whose top has most recently passed under the bar wins. */
      let current = NAV[0].href;
      const line = y + vh * 0.34;
      for (const spot of spots) if (spot.top <= line) current = spot.href;
      setActive(current);
    };

    const onResize = () => { measure(); onScroll(); };

    measure();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    /* Images and the frame sequence land after mount and change the page
       height — ScrollTrigger already broadcasts exactly that moment. */
    ScrollTrigger.addEventListener('refresh', measure);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ScrollTrigger.removeEventListener('refresh', measure);
    };
  }, []);

  /* --- the indicator slides to whichever link is hovered, else the active - */
  const moveIndicator = useCallback(() => {
    const rail = linksRef.current;
    const el = itemRefs.current[hover || active];
    if (!rail || !el) return;
    rail.style.setProperty('--pill-x', `${el.offsetLeft}px`);
    rail.style.setProperty('--pill-w', `${el.offsetWidth}px`);
  }, [hover, active]);

  useLayoutEffect(() => {
    moveIndicator();
    window.addEventListener('resize', moveIndicator);
    return () => window.removeEventListener('resize', moveIndicator);
  }, [moveIndicator]);

  useEffect(() => {
    document.body.classList.toggle('is-locked', open);
    return () => document.body.classList.remove('is-locked');
  }, [open]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (href === '#top') {
      if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => scrollToId(href), open ? 420 : 0);
  };

  const brand = (className) => (
    <a
      className={className}
      href="#top"
      onClick={(e) => go(e, '#top')}
      aria-label={`${COMPANY.name} — home`}
    >
      <span className="brandmark" aria-hidden="true">
        <span className="brandmark__ink" />
        <span className="brandmark__accent" />
      </span>
    </a>
  );

  return (
    <>
      <header
        className={[
          'nav',
          ready ? 'is-ready' : '',
          solid ? 'is-solid' : '',
          onDark ? 'is-dark' : '',
          hide && !open ? 'is-hidden' : '',
          open ? 'is-open' : '',
        ].join(' ')}
      >
        <span className="nav__prog" aria-hidden="true"><span ref={progRef} /></span>

        <div className="nav__bar">
          {brand('nav__brand')}

          <nav
            className="nav__links"
            aria-label="Primary"
            ref={linksRef}
            onMouseLeave={() => setHover(null)}
          >
            <span className="nav__pill" aria-hidden="true" />
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                ref={(el) => { itemRefs.current[item.href] = el; }}
                onMouseEnter={() => setHover(item.href)}
                onFocus={() => setHover(item.href)}
                onClick={(e) => go(e, item.href)}
                className={active === item.href ? 'is-active' : ''}
                aria-current={active === item.href ? 'page' : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__end">
            <a className="nav__phone" href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            <a className="nav__cta" href="#contact" onClick={(e) => go(e, '#contact')}>
              Start a project
              <span className="arw" aria-hidden="true">→</span>
            </a>
            <button
              className="nav__toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="menu__inner">
          <img className="menu__logo" src="/img/brand/kd-lockup.png" alt={COMPANY.name} />

          <ul className="menu__list">
            {NAV.map((item, i) => (
              <li key={item.href} style={{ '--i': i }}>
                <a href={item.href} onClick={(e) => go(e, item.href)} tabIndex={open ? 0 : -1}>
                  <span className="menu__no num">0{i + 1}</span>
                  <span className="menu__label display">{item.label}</span>
                  <span className="menu__arw" aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="menu__foot">
            <a href={COMPANY.phoneHref} className="ulink">{COMPANY.phone}</a>
            <a href={COMPANY.emailHref} className="ulink">{COMPANY.email}</a>
          </div>
        </div>
      </div>
    </>
  );
}
