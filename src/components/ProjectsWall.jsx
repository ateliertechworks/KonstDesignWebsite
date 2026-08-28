/* ===========================================================================
   PROJECTS — "The Drawing Wall"
   ---------------------------------------------------------------------------
   A real CSS-3D gallery. Six project plates stand in perspective space on a
   receding drafting grid; scrolling walks along the wall, swinging the next
   plate square to the viewer while the others fan away with visible physical
   thickness. The pointer tilts the whole rig a few degrees, so the scene has
   parallax even when the page is still.

   It is 3D in the real sense — `perspective` + `preserve-3d` + per-panel
   rotateY/translateZ — not a scale-and-blur impression of depth. Every panel
   carries slab edges that only appear on the side you would actually see, and
   casts a light pool onto the grid floor beneath it.

   Content comes from PROJECTS in lib/site.js — the same six projects, their
   photographs and their drawing plates. Nothing here is placeholder copy.

   Three things you will want to change — search for these markers:
     (a) SCROLL LENGTH ....... SCROLL_PER_PROJECT
     (b) THE 3D RIG .......... the geometry block
     (c) FALLBACK ............ .is-plain in the stylesheet
   =========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PROJECTS } from '../lib/site.js';
import { SectionHead, SheetMark } from './Bits.jsx';
import { gsap, ScrollTrigger, scrollToY } from '../lib/motion.js';
import '../styles/projects-wall.css';

/* ---------------------------------------------------------------------------
   (a) SCROLL LENGTH
   Pixels of scroll each project gets to itself. Larger = slower walk, more
   dwell per plate. Six at 640 is a ~3800px pin.
   --------------------------------------------------------------------------- */
const SCROLL_PER_PROJECT = 640;

/* ---------------------------------------------------------------------------
   (b) THE 3D RIG
   All of it in units the geometry actually uses: SPREAD and STACK are
   multiples of the panel's own width, so the composition holds at every
   breakpoint without a second set of numbers.
   --------------------------------------------------------------------------- */
/* Sideways travel of the first neighbour, in panel widths. */
const SPREAD = 0.88;
/* Extra travel per plate beyond the first. Large enough that the tail spreads
   across the stage instead of hiding behind its own neighbour. */
const STACK = 0.26;
/* How far back a plate has fallen once it is fully off-centre. */
const DEPTH = 540;
/* Forward pop of the plate at centre — it steps out of the wall to be read. */
const POP = 96;
/* Fan angle of an off-centre plate. */
const TILT = 46;
/* Where a plate starts fading out and where it is gone. The wall wraps, so a
   plate has to be invisible at the seam (|u| === n / 2) or it would visibly
   teleport from one end of the deck to the other. */
const FADE_FROM = 2.15;
const FADE_TO = 2.9;

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function ProjectsWall() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const rigRef = useRef(null);
  const panelRefs = useRef([]);
  const scrimRefs = useRef([]);
  const sheenRefs = useRef([]);
  const meterRef = useRef(null);
  const hintRef = useRef(null);
  const plateRef = useRef(null);
  const stRef = useRef(null);

  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);
  const [shot, setShot] = useState(0);

  const n = PROJECTS.length;
  const open = openIndex !== null ? PROJECTS[openIndex] : null;

  /* -----------------------------------------------------------------------
     Walk to a plate. The pinned run has no useful offsetTop of its own, so
     the target is computed from the trigger's own start/end.
     ----------------------------------------------------------------------- */
  const goTo = useCallback((i) => {
    const st = stRef.current;
    if (!st) return;
    scrollToY(st.start + (i / (n - 1)) * (st.end - st.start));
  }, [n]);

  /* =======================================================================
     THE SCROLL RIG
     ======================================================================= */
  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const rig = rigRef.current;
    if (!root || !stage || !rig) return undefined;

    const mm = gsap.matchMedia();

    /* Reduced motion gets the plain grid instead — see .is-plain in the
       stylesheet. No pin, no perspective, every project already open. */
    mm.add('(prefers-reduced-motion: reduce)', () => {
      root.classList.add('is-plain');
      return () => root.classList.remove('is-plain');
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.classList.remove('is-plain');

      /* Re-measured on every refresh so a resize re-lays the rig instead of
         scrubbing against a stale width. */
      let W = panelRefs.current[0]?.offsetWidth || 360;
      let lastActive = -1;

      const paint = (progress) => {
        /* Position along the wall, measured in plates. Plate i is square to
           the viewer when pos === i. */
        const pos = progress * (n - 1);

        for (let i = 0; i < n; i += 1) {
          const panel = panelRefs.current[i];
          if (!panel) continue;

          /* The wall wraps. Without it the deck sits entirely to one side at
             both ends of the run — five plates fanned right with an empty
             left half — and the section only looks composed in the middle.
             Wrapped, every plate has neighbours on both sides at every
             scroll position. */
          let u = i - pos;
          u = ((((u % n) + n) + n / 2) % n) - n / 2;
          const au = Math.abs(u);
          const tu = u < -1 ? -1 : u > 1 ? 1 : u;

          /* tanh spreads the immediate neighbours and saturates after them,
             so the fan opens around the centre and the tail stacks. The
             linear STACK term keeps the stacked plates separable. */
          const x = W * (SPREAD * Math.tanh(u * 1.18) + STACK * u);
          /* Recedes on a decay curve — the fall-off is steep right next to
             the centre and flat further out, which is how a real row of
             objects reads down a corridor. */
          const z = -DEPTH * (1 - Math.exp(-au * 1.15)) + POP * Math.exp(-u * u * 2.4);
          /* Sign matters: a plate to the RIGHT takes a positive rotateY, which
             swings its right edge back and brings its inner edge forward — the
             fanned-deck read, not a billboard turned to face you. */
          const ry = TILT * Math.sin((tu * Math.PI) / 2);
          const sc = 0.94 + 0.06 * Math.exp(-u * u * 2.4);

          const tf =
            `translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) `
            + `rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
          if (panel.__tf !== tf) { panel.style.transform = tf; panel.__tf = tf; }

          const opacity = au >= FADE_TO ? 0
            : au > FADE_FROM ? (FADE_TO - au) / (FADE_TO - FADE_FROM)
              : 1;
          const op = opacity.toFixed(3);
          if (panel.__op !== op) { panel.style.opacity = op; panel.__op = op; }

          const vis = opacity < 0.005 ? 'hidden' : 'visible';
          if (panel.__vis !== vis) { panel.style.visibility = vis; panel.__vis = vis; }

          /* Depth is carried by a scrim rather than a blur: `filter` on a
             preserve-3d element flattens its children, which would kill the
             slab edges and the popped plate number. */
          const scrim = scrimRefs.current[i];
          if (scrim) {
            const d = Math.min(0.62, Math.max(0, au - 0.45) * 0.42).toFixed(3);
            if (scrim.__op !== d) { scrim.style.opacity = d; scrim.__op = d; }
          }

          /* Glancing highlight: the further a plate has swung, the more of
             the room's light rakes across it. Flipped so it always comes off
             the edge nearest the viewer. */
          const sheen = sheenRefs.current[i];
          if (sheen) {
            const s = Math.min(0.5, au * 0.4).toFixed(3);
            if (sheen.__op !== s) { sheen.style.opacity = s; sheen.__op = s; }
            const st2 = u < 0 ? 'translateZ(1px) scaleX(-1)' : 'translateZ(1px)';
            if (sheen.__tf !== st2) { sheen.style.transform = st2; sheen.__tf = st2; }
          }
        }

        if (meterRef.current) {
          const m = `scaleX(${progress.toFixed(4)})`;
          if (meterRef.current.__tf !== m) {
            meterRef.current.style.transform = m;
            meterRef.current.__tf = m;
          }
        }

        if (hintRef.current) {
          const h = clamp01(1 - progress * 14).toFixed(3);
          if (hintRef.current.__op !== h) { hintRef.current.style.opacity = h; hintRef.current.__op = h; }
        }

        /* The detail plate is React text, so it is only touched when the
           nearest project actually changes — six renders across the whole
           run, not one per scrolled pixel. */
        const near = Math.max(0, Math.min(n - 1, Math.round(pos)));
        if (near !== lastActive) { lastActive = near; setActive(near); }
      };

      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${SCROLL_PER_PROJECT * n}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.75,
        invalidateOnRefresh: true,
        onRefreshInit: () => { W = panelRefs.current[0]?.offsetWidth || W; },
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => { W = panelRefs.current[0]?.offsetWidth || W; paint(self.progress); },
      });

      stRef.current = st;
      paint(0);

      return () => { st.kill(); stRef.current = null; };
    });

    /* -------------------------------------------------------------------
       Pointer parallax. A few degrees on the whole rig, lerped, so the wall
       has depth even with the page held still. Pointer-only, and only while
       the stage is on screen — there is no reason to run a lerp against a
       section nobody is looking at.
       ------------------------------------------------------------------- */
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      let tx = 0; let ty = 0; let px = 0; let py = 0;
      let inView = false;
      let settled = true;

      const onMove = (e) => {
        const r = stage.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        settled = false;
      };

      const onLeave = () => { tx = 0; ty = 0; settled = false; };

      const tick = () => {
        if (!inView || settled) return;
        px += (tx - px) * 0.055;
        py += (ty - py) * 0.055;
        if (Math.abs(tx - px) < 0.0006 && Math.abs(ty - py) < 0.0006) {
          px = tx; py = ty; settled = true;
        }
        rig.style.transform = `rotateX(${(py * -3.4).toFixed(3)}deg) rotateY(${(px * 5.6).toFixed(3)}deg)`;
      };

      const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; },
        { threshold: 0 });
      io.observe(stage);

      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
      gsap.ticker.add(tick);

      return () => {
        io.disconnect();
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
        gsap.ticker.remove(tick);
        rig.style.transform = '';
      };
    });

    return () => mm.revert();
  }, [n]);

  /* The detail plate re-letters itself rather than snapping to new text. */
  useLayoutEffect(() => {
    const el = plateRef.current;
    if (!el || rootRef.current?.classList.contains('is-plain')) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('[data-plate-line]'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.045, overwrite: true });
    }, el);
    return () => ctx.revert();
  }, [active]);

  /* --- case study ------------------------------------------------------- */
  const close = useCallback(() => setOpenIndex(null), []);
  const stepShot = useCallback((dir) => {
    setShot((s) => {
      const g = PROJECTS[openIndex]?.gallery.length || 1;
      return (s + dir + g) % g;
    });
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return undefined;
    setShot(0);
    document.body.classList.add('is-locked');
    window.__lenis?.stop();

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') stepShot(1);
      if (e.key === 'ArrowLeft') stepShot(-1);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('is-locked');
      window.__lenis?.start();
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, stepShot]);

  const p = PROJECTS[active];

  return (
    <section className="section section--dark pw" id="projects" ref={rootRef}>
      <div className="wrap">
        <SheetMark index="03" caption="Selected work" />
        <SectionHead
          label="Projects"
          title={['Drawn, detailed,', 'delivered.']}
          aside={(
            <>
              Six built and visualized projects across Coimbatore, Pollachi and Dindigul. Scroll to
              walk the wall — open any plate to read the brief and the drawings behind it.
            </>
          )}
        />
      </div>

      {/* ===================================================================
          THE STAGE — pinned, 3D, one screen tall.
          =================================================================== */}
      <div className="pw__stage" ref={stageRef}>
        <div className="pw__room" aria-hidden="true" />

        <div className="pw__rig" ref={rigRef}>
          {/* A drafting grid stood into the third dimension: the same graph
              paper the rest of the site prints its sections on, laid flat and
              run to the horizon. */}
          <div className="pw__floor" aria-hidden="true" />

          {PROJECTS.map((proj, i) => (
            <article
              className="pw__panel"
              key={proj.slug}
              ref={(el) => { panelRefs.current[i] = el; }}
            >
              <button
                type="button"
                className="pw__face"
                tabIndex={i === active ? 0 : -1}
                aria-label={i === active
                  ? `Open case study — ${proj.title}`
                  : `Go to ${proj.title}`}
                onClick={() => (i === active ? setOpenIndex(i) : goTo(i))}
              >
                <span className="pw__img">
                  <img
                    src={proj.img}
                    alt={`${proj.title}, ${proj.location}`}
                    /* Not lazy. Every plate sits at the centre of the pinned
                       stage, so all six are in the viewport the moment the
                       section arrives — lazy buys nothing here and risks a
                       blank plate mid-effect. Low priority so they still
                       queue behind the work above the fold. */
                    decoding="async"
                    fetchpriority="low"
                    sizes="(max-width: 720px) 78vw, 30vw"
                  />
                </span>

                <span className="pw__foot">
                  <span className="pw__foot-main">
                    <span className="pw__name">{proj.title}</span>
                    <span className="pw__where mono">{proj.location} — {proj.year}</span>
                  </span>
                  <span className="pw__open mono" aria-hidden="true">
                    {i === active ? 'Open' : ''}
                  </span>
                </span>
              </button>

              {/* Popped off the surface so the plate number floats in front of
                  its own plate — the cheapest, most legible depth cue there
                  is, and it only works because nothing here is flattened. */}
              <span className="pw__no mono" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Physical thickness. Each slab carries backface-visibility, so
                  it appears only on the side you would genuinely be able to
                  see it from. No JS decides this — the geometry does. */}
              <span className="pw__edge pw__edge--r" aria-hidden="true" />
              <span className="pw__edge pw__edge--l" aria-hidden="true" />

              <span className="pw__scrim" aria-hidden="true"
                ref={(el) => { scrimRefs.current[i] = el; }} />
              <span className="pw__sheen" aria-hidden="true"
                ref={(el) => { sheenRefs.current[i] = el; }} />

              {/* Lies flat on the grid, so it foreshortens with the floor. */}
              <span className="pw__pool" aria-hidden="true" />
            </article>
          ))}
        </div>

        {/* --- HUD: flat, in front of the rig, never rotated -------------- */}
        <div className="pw__hud">
          {/* The section's own heading has scrolled away by the time the stage
              pins, so the stage re-letters itself in the title-block language
              the rest of the drawing set uses. */}
          <div className="pw__stagehead" aria-hidden="true">
            <span className="pw__stagehead-no mono">P-03</span>
            <span className="pw__stagehead-rule" />
            <span className="pw__stagehead-cap mono">
              Selected work — {String(n).padStart(2, '0')} projects
            </span>
          </div>

          <div className="pw__plate" ref={plateRef}>
            <span className="pw__plate-meta mono" data-plate-line>
              {p.category} · {p.year} · {p.area}
            </span>
            <h3 className="pw__plate-title display" data-plate-line>{p.title}</h3>
            <p className="pw__plate-desc" data-plate-line>{p.desc}</p>
            <button
              type="button"
              className="pw__plate-cta ulink mono"
              data-plate-line
              onClick={() => setOpenIndex(active)}
            >
              View drawings <span className="arw" aria-hidden="true">→</span>
            </button>
          </div>

          <ol className="pw__rail">
            {PROJECTS.map((proj, i) => (
              <li key={proj.slug}>
                <button
                  type="button"
                  className={`pw__rail-btn mono ${i === active ? 'is-on' : ''}`}
                  onClick={() => goTo(i)}
                  aria-current={i === active}
                >
                  <span className="pw__rail-tick" aria-hidden="true" />
                  <span className="pw__rail-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="vh">{proj.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="pw__meter" aria-hidden="true">
            <span ref={meterRef} />
          </div>

          <p className="pw__hint mono" ref={hintRef} aria-hidden="true">
            Scroll to walk the wall
          </p>
        </div>
      </div>

      {/* ===================================================================
          CASE STUDY
          The drawing plates already exist in each project's folder — 01 is the
          view the panel shows, 02 onwards are the sheets. This is the only
          place on the site they are readable.
          =================================================================== */}
      <div
        className={`pwc ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={open ? `${open.title} case study` : undefined}
      >
        <button className="pwc__backdrop" onClick={close} aria-label="Close"
          tabIndex={open ? 0 : -1} />

        {open && (
          <div className="pwc__panel">
            <div className="pwc__media">
              <figure className="pwc__shot img-frame">
                <img
                  src={open.gallery[shot]}
                  alt={shot === 0
                    ? `${open.title} — ${open.location}`
                    : `${open.title} — drawing sheet ${shot + 1}`}
                  decoding="async"
                />
              </figure>

              <div className="pwc__thumbs">
                {open.gallery.map((g, i) => (
                  <button
                    type="button"
                    key={g}
                    className={`pwc__thumb ${i === shot ? 'is-on' : ''}`}
                    onClick={() => setShot(i)}
                    aria-label={i === 0 ? 'View photograph' : `View sheet ${i + 1}`}
                  >
                    <img src={g} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pwc__body">
              <span className="pwc__eyebrow label">
                {open.category} — {String(openIndex + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
              <h3 className="pwc__title display">{open.title}</h3>
              <p className="pwc__where mono">{open.location} · {open.year} · {open.area}</p>

              <div className="pwc__story">
                {open.story.map((para) => <p key={para.slice(0, 32)}>{para}</p>)}
              </div>

              <ul className="pwc__scope">
                {open.scope.map((s) => <li key={s} className="mono">{s}</li>)}
              </ul>

              <dl className="pwc__specs">
                {open.specs.map(([k, v]) => (
                  <div key={k}>
                    <dt className="mono">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="pwc__actions">
                <a className="btn btn--light" href="#contact" onClick={close}>
                  Start a project like this <span className="arw" aria-hidden="true">→</span>
                </a>
              </div>

              <div className="pwc__nav">
                <button type="button"
                  onClick={() => setOpenIndex((i) => (i - 1 + n) % n)}>← Prev project</button>
                <button type="button"
                  onClick={() => setOpenIndex((i) => (i + 1) % n)}>Next project →</button>
              </div>
            </div>

            <button className="pwc__close" onClick={close} aria-label="Close case study">
              <span /><span />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
