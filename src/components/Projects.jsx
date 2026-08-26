/* ===========================================================================
   PROJECTS — scroll-driven "motion path" section
   ---------------------------------------------------------------------------
   Self-contained: markup, styles and motion all live in this one file.
   Drop it in, import it, done.

   How it works
     • A hidden <svg> holds the route paths. Cards are ordinary <div>s that are
       flown along that route by GSAP MotionPathPlugin.
     • The stage pins; one scrubbed timeline drives every card's position,
       scale, tilt and fade. Cards are staggered so they trail one another
       through the curve instead of moving as one clump.
     • Lenis (already running app-wide in lib/motion.js) supplies the momentum.

   Three things you will want to tune — search for these markers:
     (a) RESHAPE THE PATH ....... the ROUTES constant, just below
     (b) SWAP IN REAL PHOTOS .... inside <ProjectCard>
     (c) ADJUST SCROLL LENGTH ... the FLOW constant, just below
   =========================================================================== */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import { PROJECTS, INTERIORS, COMPANY } from '../lib/site.js';
import { scrollToId } from '../lib/motion.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/* ---------------------------------------------------------------------------
   (a) RESHAPE THE PATH
   Both routes are drawn in a 1000 x 1000 viewBox that is stretched over the
   pinned stage (preserveAspectRatio="none"), so:
       x = 0 is the left edge, x = 1000 the right edge
       y = 0 is the top edge,  y = 1000 the bottom edge
   Start above the top (y < 0) and finish below the bottom (y > 1000) so cards
   enter and leave off-screen rather than popping.

   Keep the widest x roughly inside 200 - 800 on desktop and 370 - 630 on
   mobile: that is what stops a card clipping the screen edge.
   --------------------------------------------------------------------------- */
const ROUTES = {
  /* Desktop: a full S — in at the top, out right, back across to the left,
     then home to centre. */
  wide: 'M 500 -60 C 500 130, 800 190, 800 350 C 800 505, 200 500, 200 655 C 200 815, 500 875, 500 1060',

  /* Mobile (<= 640px): same shape, a much gentler sway. */
  soft: 'M 500 -60 C 500 140, 630 200, 630 360 C 630 520, 370 515, 370 665 C 370 820, 500 880, 500 1060',
};

/* ---------------------------------------------------------------------------
   (c) ADJUST SCROLL LENGTH + the feel of the flow
   --------------------------------------------------------------------------- */
const FLOW = {
  scroll: 2800,   // px of scroll the pinned stage consumes ("+=2800"). 2500-3000 is the sweet spot.
  scrub: 1,       // seconds the animation lags behind the scrollbar — the buttery bit.
  travel: 1,      // timeline units one card takes to cross the whole route.
  lead: 0.13,     // per-card delay, so they trail instead of clumping.
  scaleMin: 0.7,  // size at both ends of the route.
  scaleMax: 1,    // size as it passes the vertical centre — the come-forward moment.
  tilt: 6,        // degrees of drift, alternating per card (+-6).
};

/* ---------------------------------------------------------------------------
   THE HANDOFF from the services rail
   The last tile in the Interior Spaces rail (06 — Modular Kitchen) does not
   just scroll away: its photograph lifts off the rail, floats down the page
   and lands on the route, then rides it at the head of the pack.

   `from` must point at the image box of that tile. It is 4:3, exactly like a
   project card's photo slot, so the two morph into each other with nothing
   but a uniform scale — the swap is invisible.
   --------------------------------------------------------------------------- */
const BRIDGE = {
  from: '#interiors .int-card:last-child .int-card__media',
  title: 'Modular Kitchen',
  sub: 'Interior spaces — service',
  did: 'Tall units · Soft-close · Quartz counters',
  lift: 0.06,   // progress over which the rail hands the photo across
  /* The polaroid frame cannot exist during the crossfade — a white card
     appearing around the rail tile would give the swap away — so it builds
     itself afterwards, and the caption lands after that. */
  frame: 0.18,
  label: 0.55,  // progress at which its caption starts to appear
  /* Where along the route it touches down. The route's first point sits above
     the top edge, so landing at 0 would mean flying up and off the screen only
     to re-enter a moment later. A tenth of the way in is the first point that
     is comfortably on-screen, so the photo simply settles onto the curve. */
  enter: 0.1,
};

/* Never fly more than six: beyond that the route stops reading as a route. */
const MAX_CARDS = 6;
const DECK = PROJECTS.slice(0, MAX_CARDS);

/* The rail's last tile — the same photograph, so the handoff is one object. */
const KITCHEN = INTERIORS[INTERIORS.length - 1];

/* One muted accent per card — warm neutrals, nothing loud. */
const ACCENTS = ['#A9663F', '#8C7A5B', '#7C6A62', '#9A8462', '#6E7A6B', '#A3766A'];

/* Displayed numbers are always whole. */
const plate = (i) => String(Math.round(i) + 1).padStart(2, '0');

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Icon slot. One line-drawn glyph per discipline.
   -------------------------------------------------------------------------- */
function CategoryIcon({ category }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (category === 'Architecture') {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 4l9 6.5" />
        <path d="M5.5 9.4V20h13V9.4" />
        <path d="M10 20v-5.2h4V20" />
      </svg>
    );
  }
  if (category === '3D Visualization') {
    return (
      <svg {...common}>
        <path d="M12 3.2 20 7.6v8.8L12 20.8 4 16.4V7.6z" />
        <path d="M4 7.6 12 12l8-4.4" />
        <path d="M12 12v8.8" />
      </svg>
    );
  }
  /* Interior Design (default) */
  return (
    <svg {...common}>
      <path d="M5 11V7.2A2.2 2.2 0 0 1 7.2 5h9.6A2.2 2.2 0 0 1 19 7.2V11" />
      <path d="M4 11h16v5H4z" />
      <path d="M6 16v3M18 16v3" />
    </svg>
  );
}

/* ===========================================================================
   CARD
   GSAP owns the transform on <article.pj-card>, so every hover / hand-made
   effect lives on the inner button instead — otherwise the two fight.
   =========================================================================== */
function ProjectCard({ project, index, onOpen, cardRef }) {
  return (
    <article
      className="pj-card"
      ref={cardRef}
      style={{ '--accent': ACCENTS[index % ACCENTS.length] }}
    >
      <button
        type="button"
        className="pj-card__inner"
        onClick={onOpen}
        aria-label={`Open case study — ${project.title}, ${project.location}`}
      >
        <span className="pj-card__top">
          <span className="pj-card__icon">
            <CategoryIcon category={project.category} />
          </span>
          <span className="pj-card__plate">{plate(index)}</span>
        </span>

        {/* (b) SWAP IN REAL PHOTOS
            This <img> is the photo slot. Point src at the real project shot —
            any 4:3-ish image works; object-fit: cover handles the rest. */}
        <span className="pj-card__shot">
          <img
            src={project.img}
            alt={`${project.title} — ${project.category}, ${project.location}`}
            loading="lazy"
            decoding="async"
          />
        </span>

        <span className="pj-card__body">
          <span className="pj-card__title">{project.title}</span>
          <span className="pj-card__sub">
            {project.location} — {project.category}
          </span>

          {/* What was actually done on the project. */}
          <span className="pj-card__did">
            {project.scope.slice(0, 3).join(' · ')}
          </span>
        </span>

        <span className="pj-card__cta">
          Case study <span className="pj-card__arw" aria-hidden="true">→</span>
        </span>
      </button>
    </article>
  );
}

/* ===========================================================================
   THE MOTION
   One scrubbed timeline. Each card gets four tweens laid down at its own
   offset: route, scale, tilt, fade.
   =========================================================================== */
function useMotionPath(stageRef, cardRefs, bridgeRef, flyRef, enabled) {
  /* MotionPath measures the route against the live size of the SVG, so a
     resize means a rebuild. Bumped only on a real width change to keep mobile
     URL-bar height jitter from thrashing it. */
  const [sizeKey, setSizeKey] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let w = window.innerWidth;
    let t;
    const onResize = () => {
      if (Math.abs(window.innerWidth - w) < 40) return;
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => setSizeKey((n) => n + 1), 180);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !enabled) return undefined;

    /* matchMedia owns its own cleanup: mm.revert() kills every timeline,
       ScrollTrigger and gsap.set made inside it. That matters because this
       effect re-runs on resize — without it a rebuild would stack a second
       pin on top of the first. */
    const mm = gsap.matchMedia();

    mm.add(
      {
        wide: '(min-width: 641px)',
        soft: '(max-width: 640px)',
        /* The services rail only runs sideways above 780px; below that it is a
           native swipe list, so there is no settled tile to hand off from. */
        bridged: '(min-width: 781px)',
      },
      (self) => {
        const path = self.conditions.wide ? '#route' : '#route-mobile';
        const cards = cardRefs.current.filter(Boolean);
        if (!cards.length) return;

        /* The kitchen photo joins the route only if the rail is really there. */
        const tile = self.conditions.bridged
          ? document.querySelector(BRIDGE.from)
          : null;
        const outer = tile && bridgeRef.current;
        const fly = outer && flyRef.current;
        const bridge = fly ? outer : null;

        /* The bridge leads; the six project cards trail it. */
        const flight = bridge ? [bridge, ...cards] : cards;

        /* Parked out of sight until their own leg of the timeline begins. */
        gsap.set(flight, { opacity: 0, xPercent: 0, yPercent: 0 });
        /* ...except the bridge, which arrives already visible — it was handed
           over from the rail rather than fading up out of nowhere. */
        if (bridge) gsap.set(bridge, { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: `+=${FLOW.scroll}`,   // (c) ADJUST SCROLL LENGTH
            scrub: FLOW.scrub,
            pin: stage,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            /* Drives the thin progress rail down the side of the stage. */
            onUpdate: (st) =>
              stage.style.setProperty('--flow', String(st.progress)),
          },
        });

        const { travel, lead, scaleMin, scaleMax, tilt } = FLOW;

        flight.forEach((card, i) => {
          const at = i * lead;            // stagger: card i sets off a beat later
          const lean = i % 2 ? -1 : 1;    // alternate the drift direction

          /* The bridge joins part-way along, everything else runs the lot. */
          const from = card === bridge ? BRIDGE.enter : 0;
          const dur = travel * (1 - from);

          /* 1. the route itself */
          tl.to(
            card,
            {
              duration: dur,
              motionPath: {
                path,
                align: path,
                alignOrigin: [0.5, 0.5],
                autoRotate: false,
                start: from,
                end: 1,
              },
            },
            at
          );

          /* 2. depth — grows toward the vertical centre, recedes at both ends */
          tl.fromTo(
            card,
            { scale: scaleMin, zIndex: 1 },
            { scale: scaleMax, zIndex: 6, duration: dur / 2, ease: 'sine.out' },
            at
          );
          tl.to(
            card,
            { scale: scaleMin, zIndex: 1, duration: dur / 2, ease: 'sine.in' },
            at + dur / 2
          );

          /* 3. a few degrees of drift */
          tl.fromTo(
            card,
            { rotate: -tilt * lean },
            { rotate: tilt * lean, duration: dur },
            at
          );

          /* 4. edges of the run, softened. The bridge skips the entrance —
             phase one below already carried it in. */
          if (card !== bridge) {
            tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: dur * 0.12 }, at);
          }
          tl.to(card, { opacity: 0, duration: dur * 0.12 }, at + dur * 0.88);
        });

        if (!bridge) return undefined;

        /* -------------------------------------------------------------------
           PHASE ONE — the flight down.
           Runs from the moment the services section bottoms out until the
           projects stage pins, which is exactly where the timeline above
           picks the photo up.

           Both ends are measured live, every frame:
             • where the tile actually is  (it may still be sliding sideways)
             • where the route start actually is (the timeline above parks the
               bridge there while its own trigger is still ahead)
           so the two ends always agree and a resize cannot leave it stale.

           The outer element carries the route; this inner one carries only the
           deviation from it. At progress 1 that deviation is the identity
           transform, so the handoff is seamless by construction.
           ------------------------------------------------------------------- */
        const shot = tile;
        const foot = fly.querySelector('.pj-bridge__foot');
        const frame = fly.querySelector('.pj-bridge__frame');
        const top = fly.querySelector('.pj-bridge__top');
        /* Leaves the rail briskly, settles gently onto the route — an ease that
           dawdles at the start loses a race with the rail scrolling upward and
           the photo exits the top of the screen before coming back down. */
        const ease = gsap.parseEase('power2.out');
        const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

        /* place() below measures where the route is holding the card. That is
           only meaningful once something has put it there, and the timeline's
           own trigger is still ahead of us — so park it explicitly. This is
           the exact state the timeline itself renders at time 0. */
        gsap.set(bridge, {
          motionPath: {
            path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false,
            start: BRIDGE.enter, end: BRIDGE.enter,
          },
          scale: scaleMin,
          rotate: -tilt,
        });

        const place = (p) => {
          /* Nothing moves until the crossfade has finished: two identical 4:3
             boxes swapping opacity in the same spot is genuinely invisible,
             whereas a few px of drift mid-fade reads as a ghost. */
          const e = ease(clamp01((p - BRIDGE.lift) / (1 - BRIDGE.lift)));

          /* Where the route currently holds the card. Rotation inflates a
             bounding box, so scale comes from the matrix and only the centre
             is read off the rect — that pair is rotation-proof. */
          const t = getComputedStyle(bridge).transform;
          const m = t && t !== 'none' ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
          const oScale = Math.hypot(m.a, m.b) || 1;
          const oAngle = Math.atan2(m.b, m.a);
          const oRect = bridge.getBoundingClientRect();
          const oW = bridge.offsetWidth * oScale;
          if (!oW) return;

          const tRect = shot.getBoundingClientRect();

          /* Screen-space gap between the route and the tile, closing as p rises. */
          const dx = (tRect.left + tRect.width / 2) - (oRect.left + oRect.width / 2);
          const dy = (tRect.top + tRect.height / 2) - (oRect.top + oRect.height / 2);

          /* That gap has to be expressed in the parent's own rotated, scaled
             frame, hence the inverse rotation and the divide. */
          const cos = Math.cos(-oAngle);
          const sin = Math.sin(-oAngle);
          const lx = ((dx * cos - dy * sin) / oScale) * (1 - e);
          const ly = ((dx * sin + dy * cos) / oScale) * (1 - e);

          /* Match the tile's size at the top, the card's at the bottom. */
          const s = 1 + (1 - e) * (tRect.width / oW - 1);
          /* Sit square on the rail, adopt the route's lean on arrival. */
          const r = -oAngle * (180 / Math.PI) * (1 - e);

          fly.style.transform = `translate(${lx}px, ${ly}px) rotate(${r}deg) scale(${s})`;

          /* A crossfade between two pixel-aligned 4:3 boxes reads as nothing
             happening at all — which is the point. */
          const swap = clamp01(p / BRIDGE.lift);
          fly.style.opacity = String(swap);
          shot.style.opacity = String(1 - swap);

          /* The card builds itself around the photo: frame and top row first,
             caption after. Both are read straight off progress, so scrolling
             back up runs the identical states in reverse rather than replaying
             an animation. */
          const built = clamp01((p - BRIDGE.frame) / (BRIDGE.label - BRIDGE.frame));
          frame.style.opacity = String(built);
          frame.style.transform = `scale(${0.97 + 0.03 * built})`;
          top.style.opacity = String(built);

          foot.style.opacity = String(clamp01((p - BRIDGE.label) / (1 - BRIDGE.label)));
        };

        const hop = ScrollTrigger.create({
          trigger: '#interiors',
          start: 'bottom bottom',
          endTrigger: stage,
          end: 'top top',
          /* Only the clamped ends need a callback; the ticker below owns
             everything in between. */
          onLeave: () => place(1),
          onLeaveBack: () => place(0),
        });

        /* Driven from the ticker rather than from onUpdate, because place()
           reads where the route is currently holding the card and that can
           still be moving after the scroll itself has stopped — the timeline
           scrubs with a one second lag, and a jump landing (a nav link
           straight to #projects) leaves it catching up for that long. Reading
           every frame while in range is both cheaper than it looks and immune
           to the ordering entirely.

           GSAP's ticker runs Lenis first, which fires the scroll event that
           updates ScrollTrigger, which renders the timeline — so by the time
           this runs the route position is already this frame's. */
        const tick = () => { if (hop.isActive) place(hop.progress); };
        gsap.ticker.add(tick);

        place(hop.progress);

        /* Hand the rail its photograph back. */
        return () => {
          gsap.ticker.remove(tick);
          shot.style.opacity = '';
          fly.style.transform = '';
          fly.style.opacity = '';
          foot.style.opacity = '';
          frame.style.opacity = '';
          frame.style.transform = '';
          top.style.opacity = '';
        };
      }
    );

    return () => mm.revert();
  }, [stageRef, cardRefs, enabled, sizeKey]);
}

/* ===========================================================================
   CASE STUDY — opened by any card. Gallery left, written brief and the spec
   table right, steppable without closing.
   =========================================================================== */
const enquiryHref = (p) => {
  const subject = `Project enquiry — ${p.title}`;
  const body = [
    'Hello Konst Design,',
    '',
    `I was reading the ${p.title} case study (${p.category}, ${p.location}, ${p.year}) on your website`,
    'and I would like to discuss something similar.',
    '',
    'My project:',
    '  Location:',
    '  Approximate area:',
    '  Timeline:',
    '',
    'Thank you.',
  ].join('\n');
  return `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function CaseStudy({ project, index, onClose, onStep, onGo }) {
  const [shot, setShot] = useState(0);
  useEffect(() => { setShot(0); }, [index]);

  const gallery = project.gallery?.length ? project.gallery : [project.img];

  /* data-lenis-prevent: Lenis keeps hold of the wheel even while stopped, so
     the panel opts out of it and scrolls natively. */
  return (
    <div className="case__panel" role="document" data-lenis-prevent>
      <div className="case__gallery">
        <figure className="case__stage">
          <img
            key={gallery[shot]}
            src={gallery[shot]}
            alt={`${project.title} — view ${shot + 1} of ${gallery.length}`}
          />
          <figcaption className="case__count">
            {plate(shot)} / {plate(gallery.length - 1)}
          </figcaption>
        </figure>

        {gallery.length > 1 && (
          <div className="case__thumbs">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                type="button"
                className={`case__thumb ${i === shot ? 'is-on' : ''}`}
                onClick={() => setShot(i)}
                aria-label={`View photograph ${i + 1}`}
                aria-pressed={i === shot}
              >
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="case__body">
        <div className="case__head">
          <span className="case__no">{plate(index)} — {project.category}</span>
          <h3 className="case__title display">{project.title}</h3>
          <p className="case__lede lede">{project.desc}</p>
        </div>

        <div className="case__story">
          {project.story.map((para) => <p key={para.slice(0, 24)}>{para}</p>)}
        </div>

        <dl className="case__specs">
          {project.specs.map(([k, v]) => (
            <div className="case__spec" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div className="case__spec">
            <dt>Location</dt>
            <dd>{project.location}</dd>
          </div>
        </dl>

        <div className="case__scope">
          <span className="case__scope-label">Scope of work</span>
          <ul>{project.scope.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>

        <div className="case__actions">
          <a className="btn btn--solid" href={enquiryHref(project)}>
            Enquire about this project <span className="arw" aria-hidden="true">→</span>
          </a>
          <a className="btn" href={COMPANY.phoneHref}>
            Call the studio <span className="arw" aria-hidden="true">→</span>
          </a>
          <button type="button" className="case__jump" onClick={() => onGo('#contact')}>
            See all contact details →
          </button>
        </div>

        <div className="case__nav">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous project">← Prev</button>
          <span>{plate(index)} / {plate(DECK.length - 1)}</span>
          <button type="button" onClick={() => onStep(1)} aria-label="Next project">Next →</button>
        </div>
      </div>

      <button type="button" className="case__close" onClick={onClose} aria-label="Close case study">
        <span /><span />
      </button>
    </div>
  );
}

/* ===========================================================================
   SECTION
   =========================================================================== */
export default function Projects() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const bridgeRef = useRef(null);   // carries the route
  const flyRef = useRef(null);      // carries the flight down to it

  /* Reduced motion opts straight out of the flight: cards become a plain
     vertical list that fades in. Resolved once, on mount, so the first paint
     is the safe static layout. */
  const [flying, setFlying] = useState(false);
  useLayoutEffect(() => { setFlying(!prefersReduced()); }, []);

  useMotionPath(stageRef, cardRefs, bridgeRef, flyRef, flying);

  /* --- case study ------------------------------------------------------- */
  const [openIndex, setOpenIndex] = useState(null);
  const open = openIndex !== null ? DECK[openIndex] : null;
  const close = useCallback(() => setOpenIndex(null), []);

  /* Closing only schedules a state change, and Lenis is still stopped at that
     moment — so the destination is parked and travelled to once the modal has
     gone and smooth scroll has been handed back. */
  const pending = useRef(null);
  const goFrom = useCallback((href) => {
    pending.current = href;
    setOpenIndex(null);
  }, []);

  useEffect(() => {
    if (openIndex !== null || !pending.current) return undefined;
    const href = pending.current;
    pending.current = null;
    const id = requestAnimationFrame(() => scrollToId(href));
    return () => cancelAnimationFrame(id);
  }, [openIndex]);

  const step = useCallback((dir) => {
    setOpenIndex((i) => (i === null ? null : (i + dir + DECK.length) % DECK.length));
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
    <>
      <style>{CSS}</style>

      <section className={`pj ${flying ? 'pj--flying' : 'pj--static'}`} id="projects">
        {/* --- heading, scrolls past normally before the stage pins --------- */}
        <header className="pj__head">
          <span className="pj__label">Selected projects</span>
          <h2 className="pj__title">Recent work,<br />in detail.</h2>
          <p className="pj__aside">
            <strong>237</strong> projects delivered across Coimbatore, Dindigul and Tamil Nadu.
            Open any card for the full case study — drawings, materials, areas and how the
            project was actually built.
          </p>
          <span className="pj__rule">
            <em>{plate(DECK.length - 1)} plates</em>
            <em>237 projects total</em>
          </span>
        </header>

        {/* --- the pinned stage the cards fly across ------------------------ */}
        <div className="pj__stage" ref={stageRef}>
          {/* (a) RESHAPE THE PATH — edit the d="" strings in ROUTES above.
              This SVG is invisible (no fill, no stroke) but must stay laid out:
              MotionPathPlugin measures the real, on-screen path.
              To see the route while tuning, give .pj__route a
              `stroke: var(--accent); opacity:.25` and set stroke-dasharray. */}
          <svg
            className="pj__route"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path id="route" d={ROUTES.wide} />
            <path id="route-mobile" d={ROUTES.soft} />
          </svg>

          <span className="pj__caption" aria-hidden="true">
            Portfolio — the route
          </span>

          {/* Scroll progress through the pinned stage. */}
          <span className="pj__rail" aria-hidden="true"><i /></span>

          {/* The photograph handed over by the services rail. Inert by design:
              it must never sit between a cursor and a project card. */}
          <div className="pj-bridge" ref={bridgeRef} aria-hidden="true">
            <div className="pj-bridge__fly" ref={flyRef}>
              {/* The frame is drawn around the photo rather than wrapping it,
                  so the photo's box stays the element the route and the rail
                  tile are both measured against. */}
              <span className="pj-bridge__frame" />

              <span className="pj-bridge__top">
                <span className="pj-bridge__icon">
                  <CategoryIcon category="Interior Design" />
                </span>
                <span className="pj-bridge__plate">{KITCHEN?.no}</span>
              </span>

              <span className="pj-bridge__shot">
                <img src={KITCHEN?.img} alt="" decoding="async" />
              </span>

              <span className="pj-bridge__foot">
                <span className="pj-bridge__title">{BRIDGE.title}</span>
                <span className="pj-bridge__sub">{BRIDGE.sub}</span>
                <span className="pj-bridge__did">{BRIDGE.did}</span>
              </span>
            </div>
          </div>

          {DECK.map((p, i) => (
            <ProjectCard
              key={p.slug ?? p.title}
              project={p}
              index={i}
              cardRef={(el) => { cardRefs.current[i] = el; }}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
        </div>
      </section>

      <div
        className={`case ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Project case study"
        aria-hidden={!open}
      >
        <button type="button" className="case__backdrop" onClick={close} aria-label="Close" tabIndex={open ? 0 : -1} />
        {open && (
          <CaseStudy project={open} index={openIndex} onClose={close} onStep={step} onGo={goFrom} />
        )}
      </div>
    </>
  );
}

/* ===========================================================================
   STYLES
   Kept in-file so the component is a single drop-in. Colours fall back to
   literals when the host page has no design tokens, so it works standalone.
   Every font-size here is >= 12px.
   =========================================================================== */
const CSS = `
.pj {
  --pj-ivory:  var(--ivory, #F2EEE7);
  --pj-bone:   var(--bone, #FBF9F5);
  --pj-ink:    var(--ink, #16140F);
  --pj-soft:   var(--ink-soft, #4A443A);
  --pj-mute:   var(--ink-mute, #857C6E);
  --pj-rule:   var(--rule, rgba(22, 20, 15, 0.14));
  --pj-ease:   var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
  --pj-mono:   var(--mono, "JetBrains Mono", ui-monospace, Menlo, monospace);
  --pj-disp:   var(--display, "Cormorant Garamond", Georgia, serif);

  position: relative;
  background: var(--pj-ivory);
  /* clip, not hidden: hidden turns this into a scroll container and can
     upset a pinned child. The @supports below covers older browsers. */
  overflow-x: clip;
}
@supports not (overflow-x: clip) { .pj { overflow-x: hidden; } }

/* --- heading -------------------------------------------------------------- */
.pj__head {
  max-width: var(--maxw, 1620px);
  margin: 0 auto;
  padding: clamp(88px, 12vw, 184px) var(--gutter, clamp(20px, 5vw, 84px)) clamp(30px, 4vw, 56px);
}
.pj__label {
  display: block;
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--clay, #A9663F);
}
.pj__title {
  font-family: var(--pj-disp);
  font-weight: 300;
  font-size: clamp(2.1rem, 5.2vw, 5.2rem);
  line-height: 1.02;
  margin: clamp(14px, 1.8vw, 26px) 0 0;
  color: var(--pj-ink);
}
.pj__aside {
  max-width: 58ch;
  margin: clamp(18px, 2.2vw, 30px) 0 0;
  font-size: clamp(14px, 1.05vw, 17px);
  line-height: 1.75;
  color: var(--pj-soft);
}
.pj__aside strong { font-weight: 500; color: var(--pj-ink); }
.pj__rule {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: clamp(26px, 3.4vw, 52px);
  padding-top: 12px;
  border-top: 1px solid var(--pj-rule);
  font-family: var(--pj-mono);
  font-size: 12px;
  font-style: normal;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--pj-mute);
}
.pj__rule em { font-style: normal; }

/* --- the stage ------------------------------------------------------------ */
.pj__stage {
  position: relative;
  height: 100vh;
  height: 100svh;
}

/* The route is present for measurement, invisible by design. */
.pj__route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}
.pj__route path { fill: none; stroke: none; }

.pj__caption {
  position: absolute;
  top: clamp(18px, 2.4vw, 34px);
  left: var(--gutter, clamp(20px, 5vw, 84px));
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--pj-mute);
}

/* Progress rail, fed by --flow (0 -> 1) from the ScrollTrigger. */
.pj__rail {
  position: absolute;
  top: 22%;
  bottom: 22%;
  right: clamp(14px, 2vw, 34px);
  width: 1px;
  background: var(--pj-rule);
}
.pj__rail i {
  position: absolute;
  inset: 0 0 auto;
  height: 100%;
  background: var(--clay, #A9663F);
  transform: scaleY(var(--flow, 0));
  transform-origin: top center;
}

/* --- card ----------------------------------------------------------------- */
.pj-card {
  position: absolute;
  top: 0;
  left: 0;
  width: clamp(240px, 22vw, 320px);
  will-change: transform, opacity;
}
.pj-card__inner {
  display: block;
  width: 100%;
  text-align: left;
  padding: clamp(14px, 1.1vw, 18px);
  background: var(--pj-bone);
  border: 1px solid var(--pj-rule);
  border-radius: 2px;
  box-shadow: 0 22px 48px -30px rgba(22, 20, 15, 0.42);
  cursor: pointer;
  transition: border-color 0.45s var(--pj-ease), box-shadow 0.45s var(--pj-ease);
}
.pj-card__inner:hover,
.pj-card__inner:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 26px 54px -28px rgba(22, 20, 15, 0.5);
}

.pj-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(12px, 1vw, 16px);
}
/* icon slot, top-left */
.pj-card__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
.pj-card__icon svg { width: 18px; height: 18px; }
.pj-card__plate {
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--pj-mute);
}

.pj-card__shot {
  display: block;
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--ivory-deep, #E9E3DA);
}
.pj-card__shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 1s var(--pj-ease);
}
.pj-card__inner:hover .pj-card__shot img { transform: scale(1.05); }

.pj-card__body { display: block; padding-top: clamp(12px, 1vw, 16px); }
.pj-card__title {
  display: block;
  font-family: var(--pj-disp);
  font-weight: 400;
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1.15;
  color: var(--pj-ink);
}
.pj-card__sub {
  display: block;
  margin-top: 6px;
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pj-mute);
}
/* what was done on the project */
.pj-card__did {
  display: block;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--pj-rule);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--pj-soft);
}
.pj-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: clamp(10px, 1vw, 14px);
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}
.pj-card__arw { transition: transform 0.45s var(--pj-ease); }
.pj-card__inner:hover .pj-card__arw { transform: translateX(5px); }

/* --- the bridge ----------------------------------------------------------
   Same width as a project card, so the scale handoff is 1:1. The caption is
   taken out of flow: the outer box must stay exactly the photo's box, because
   that is what gets measured against the rail tile. */
.pj-bridge {
  position: absolute;
  top: 0;
  left: 0;
  width: clamp(240px, 22vw, 320px);
  z-index: 7;
  pointer-events: none;
  will-change: transform, opacity;
}
.pj-bridge__fly {
  display: block;
  opacity: 0;
  transform-origin: 50% 50%;
  will-change: transform, opacity;
}
/* Card metrics, mirrored from .pj-card__inner so the two read as one family. */
.pj-bridge {
  --b-pad:  clamp(14px, 1.1vw, 18px);   /* .pj-card__inner padding */
  --b-top:  50px;                        /* icon row + its margin */
  --b-foot: 104px;                       /* title + sub + scope line */
}

/* The polaroid frame: the card's body, drawn outward from the photo. Behind
   everything, so the photo and its furniture sit on top of it. */
.pj-bridge__frame {
  position: absolute;
  z-index: 0;
  left: calc(-1 * var(--b-pad));
  right: calc(-1 * var(--b-pad));
  top: calc(-1 * (var(--b-pad) + var(--b-top)));
  bottom: calc(-1 * (var(--b-pad) + var(--b-foot)));
  background: var(--pj-bone);
  border: 1px solid var(--pj-rule);
  border-radius: 2px;
  box-shadow: 0 22px 48px -30px rgba(22, 20, 15, 0.42);
  opacity: 0;
  transform-origin: 50% 50%;
}

/* Icon slot and plate number, sitting above the photo where a card puts them. */
.pj-bridge__top {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 100%;
  height: var(--b-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 0;
}
.pj-bridge__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--clay, #A9663F);
  background: color-mix(in srgb, var(--clay, #A9663F) 12%, transparent);
}
.pj-bridge__icon svg { width: 18px; height: 18px; }
.pj-bridge__plate {
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--pj-mute);
}

.pj-bridge__shot {
  display: block;
  position: relative;
  z-index: 1;
  overflow: hidden;
  aspect-ratio: 4 / 3;            /* matches .int-card__media exactly */
  background: var(--ivory-deep, #E9E3DA);
}
.pj-bridge__shot img { width: 100%; height: 100%; object-fit: cover; }

.pj-bridge__foot {
  position: absolute;             /* out of flow — see note above */
  z-index: 2;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;   /* the box is card-width; a row would wrap the title */
  padding-top: clamp(12px, 1vw, 16px);
  opacity: 0;
}
.pj-bridge__title,
.pj-bridge__sub { white-space: nowrap; }
.pj-bridge__title {
  font-family: var(--pj-disp);
  font-size: clamp(18px, 1.5vw, 24px);
  line-height: 1.15;
  color: var(--pj-ink);
}
.pj-bridge__sub {
  margin-top: 6px;
  font-family: var(--pj-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--clay, #A9663F);
}
/* The scope line, ruled off exactly as a project card rules its own. */
.pj-bridge__did {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--pj-rule);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--pj-soft);
}

/* --- mobile: gentler sway, smaller cards, nothing near the edges ---------- */
/* No sideways rail below 781px, so nothing to hand over. */
@media (max-width: 780px) {
  .pj-bridge { display: none; }
}

@media (max-width: 640px) {
  .pj { overflow-x: hidden; }
  .pj-card { width: min(58vw, 240px); }
  .pj-card__did { display: none; }        /* keeps the card short enough to fly */
  .pj__rail { right: 10px; }
  .pj__caption { font-size: 12px; }
}

/* --- reduced motion / no-JS: a plain vertical list that fades in ---------- */
.pj--static .pj__stage {
  height: auto;
  display: grid;
  gap: clamp(24px, 4vw, 44px);
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  max-width: var(--maxw, 1620px);
  margin: 0 auto;
  padding: 0 var(--gutter, clamp(20px, 5vw, 84px)) clamp(88px, 12vw, 184px);
}
.pj--static .pj__route,
.pj--static .pj__rail,
.pj--static .pj-bridge,
.pj--static .pj__caption { display: none; }
.pj--static .pj-card {
  position: static;
  width: 100%;
  opacity: 0;
  animation: pj-fade 0.5s var(--pj-ease) forwards;
}
.pj--static .pj-card:nth-of-type(2) { animation-delay: 0.06s; }
.pj--static .pj-card:nth-of-type(3) { animation-delay: 0.12s; }
.pj--static .pj-card:nth-of-type(4) { animation-delay: 0.18s; }
.pj--static .pj-card:nth-of-type(5) { animation-delay: 0.24s; }
.pj--static .pj-card:nth-of-type(6) { animation-delay: 0.30s; }
.pj--static .pj-card__did { display: block; }
@keyframes pj-fade { to { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .pj-card__shot img,
  .pj-card__arw,
  .pj-card__inner { transition: none; }
}

/* ===========================================================================
   CASE STUDY
   =========================================================================== */
.case {
  position: fixed;
  inset: 0;
  z-index: 9500;
  display: grid;
  place-items: center;
  padding: clamp(10px, 2.5vw, 44px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case.is-open { opacity: 1; pointer-events: auto; }

.case__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(12, 11, 8, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
}

.case__panel {
  position: relative;
  width: min(1340px, 100%);
  max-height: 100%;
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--bone, #FBF9F5);
  display: grid;
  grid-template-columns: 1.08fr 1fr;
  transform: translateY(28px) scale(0.985);
  opacity: 0;
  animation: case-in 0.7s var(--ease, cubic-bezier(0.22, 1, 0.36, 1)) 0.05s forwards;
}
@keyframes case-in { to { transform: none; opacity: 1; } }

.case__gallery {
  position: sticky;
  top: 0;
  align-self: start;
  background: var(--ivory-deep, #E9E3DA);
  padding: clamp(12px, 1.2vw, 20px);
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1vw, 16px);
}
.case__stage {
  position: relative;
  margin: 0;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: var(--ivory, #F2EEE7);
}
.case__stage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: case-shot 0.65s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
@keyframes case-shot {
  from { opacity: 0; transform: scale(1.05); }
  to { opacity: 1; transform: none; }
}
.case__count {
  position: absolute;
  right: 14px;
  bottom: 12px;
  padding: 0.5em 0.9em;
  background: rgba(14, 12, 9, 0.62);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--ivory, #F2EEE7);
}

.case__thumbs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: clamp(8px, 0.8vw, 14px);
}
.case__thumb {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  opacity: 0.55;
  transition: opacity 0.45s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case__thumb img { width: 100%; height: 100%; object-fit: cover; }
.case__thumb::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 1px solid var(--clay, #A9663F);
  opacity: 0;
  transition: opacity 0.45s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case__thumb:hover { opacity: 0.85; }
.case__thumb.is-on { opacity: 1; }
.case__thumb.is-on::after { opacity: 1; }

.case__body {
  padding: clamp(26px, 3.2vw, 62px);
  display: flex;
  flex-direction: column;
  gap: clamp(22px, 2.6vw, 38px);
}
.case__no {
  display: block;
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--clay, #A9663F);
}
.case__title {
  font-family: var(--display, serif);
  font-weight: 300;
  font-size: clamp(1.9rem, 3.2vw, 3.1rem);
  margin: 12px 0 0;
  line-height: 1.05;
}
.case__lede {
  margin-top: clamp(12px, 1.4vw, 20px);
  font-size: clamp(15px, 1.2vw, 19px);
  line-height: 1.7;
  color: var(--ink-soft, #4A443A);
}

.case__story {
  display: flex;
  flex-direction: column;
  gap: 1.1em;
  padding-top: clamp(20px, 2.4vw, 32px);
  border-top: 1px solid var(--rule, rgba(22, 20, 15, 0.14));
  color: var(--ink-soft, #4A443A);
  font-size: clamp(14px, 1.02vw, 16.5px);
  line-height: 1.78;
}

.case__specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule-soft, rgba(22, 20, 15, 0.08));
  border: 1px solid var(--rule-soft, rgba(22, 20, 15, 0.08));
  margin: 0;
}
.case__spec { background: var(--bone, #FBF9F5); padding: clamp(12px, 1.3vw, 18px); }
.case__spec dt {
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-mute, #857C6E);
}
.case__spec dd {
  margin: 8px 0 0;
  font-family: var(--display, serif);
  font-size: clamp(16px, 1.25vw, 20px);
}

.case__scope-label {
  display: block;
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-mute, #857C6E);
}
.case__scope ul { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.case__scope li {
  font-family: var(--mono, monospace);
  padding: 0.6em 1em;
  border: 1px solid var(--rule, rgba(22, 20, 15, 0.14));
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft, #4A443A);
}

.case__actions {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(10px, 1.2vw, 18px);
}
.case__jump {
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-mute, #857C6E);
  transition: color 0.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case__jump:hover { color: var(--clay, #A9663F); }

.case__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: clamp(18px, 2.2vw, 30px);
  border-top: 1px solid var(--rule, rgba(22, 20, 15, 0.14));
  font-family: var(--mono, monospace);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-mute, #857C6E);
}
.case__nav button { transition: color 0.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1)); }
.case__nav button:hover { color: var(--clay, #A9663F); }

.case__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  width: 42px;
  height: 42px;
  background: rgba(251, 249, 245, 0.92);
  border: 1px solid var(--rule, rgba(22, 20, 15, 0.14));
  border-radius: 50%;
  transition: background-color 0.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case__close span {
  position: absolute;
  left: 13px; right: 13px; top: 50%;
  height: 1px;
  background: var(--ink, #16140F);
  transition: background-color 0.4s var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
}
.case__close span:first-child { transform: rotate(45deg); }
.case__close span:last-child { transform: rotate(-45deg); }
.case__close:hover { background: var(--ink, #16140F); }
.case__close:hover span { background: var(--bone, #FBF9F5); }

@media (max-width: 980px) {
  .case__panel { grid-template-columns: 1fr; }
  .case__gallery { position: static; }
  .case__stage { aspect-ratio: 16 / 10; }
}
@media (max-width: 620px) {
  .case__specs { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .case__panel, .case__stage img { animation-duration: 0.01ms; }
}
`;
