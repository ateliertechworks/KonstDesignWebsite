import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { NAV, COMPANY } from '../lib/site.js';
import { scrollToId } from '../lib/motion.js';
import '../styles/nav.css';

export default function Nav({ ready }) {
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(NAV[0].href);
  const [hover, setHover] = useState(null);

  const lastY = useRef(0);
  const linksRef = useRef(null);
  const itemRefs = useRef({});
  const progRef = useRef(null);

  /* --- scroll state: condense, auto-hide, progress, scroll-spy ----------- */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      setSolid(y > vh * 0.5);
      setHide(y > lastY.current && y > vh * 1.1);
      lastY.current = y;

      const max = document.documentElement.scrollHeight - vh;
      if (progRef.current) {
        progRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }

      /* The section whose top has most recently passed under the bar wins. */
      let current = NAV[0].href;
      for (const item of NAV) {
        if (item.href === '#top') continue;
        const el = document.querySelector(item.href);
        if (el && el.getBoundingClientRect().top <= vh * 0.34) current = item.href;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
