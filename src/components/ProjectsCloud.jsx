/* ===========================================================================
   PROJECTS — scroll-driven "cloud story"
   ---------------------------------------------------------------------------
   Project files drift in a sky of slow-moving clouds. Scrolling pulls each one
   up from a speck to full size, holds it at centre long enough to actually be
   read, opens a detail card beneath it, then lets it settle back into the
   clouds as the next one arrives. A line of italic story text floats in the
   open sky and changes with whichever file is closest to centre.

   Four things you will want to change — search for these markers:
     (a) SWAP IN REAL CLOUDS ..... the CLOUDS constant
     (b) SWAP IN REAL PHOTOS ..... PROJECT_STORY[].img
     (c) REPLACE THE COPY ........ PROJECT_STORY[].detail and .story
     (d) ADJUST SCROLL LENGTH .... SCROLL_PER_FILE

   GSAP and Lenis come from the app bundle (lib/motion.js), not a CDN — this
   project already ships both, and a second copy from cdnjs would run its own
   ticker against the app's.
   =========================================================================== */

import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion.js';
import { asset } from '../lib/site.js';
import '../styles/projects-cloud.css';

/* ---------------------------------------------------------------------------
   (d) ADJUST SCROLL LENGTH
   Pixels of scroll each file gets to itself. Larger = slower, more dwell on
   every project. Six files at 780 is a ~4700px pin.
   --------------------------------------------------------------------------- */
const SCROLL_PER_FILE = 780;

/* Scale a file starts at, before it has zoomed in. */
const SPECK = 0.05;
/* Half-width, in "file slots", of the window where a file sits at full size.
   Raise it to make each project hold longer before the next one starts. */
const HOLD = 0.24;
/* Slots of run-up before the first file and run-out after the last. */
const LEAD = 0.85;

/* ---------------------------------------------------------------------------
   (a) SWAP IN REAL CLOUDS
   Transparent cloud sprites. Regenerate them with tools/make-clouds.py, or
   drop your own RGBA PNG/WebP cutouts in public/img/clouds/ and list them
   here. `depth` only sets which drift keyframe and scale the sprite gets.
   --------------------------------------------------------------------------- */
const CLOUDS = [
  { key: 'a', src: asset('img/clouds/cloud-1.webp'), depth: 'far' },
  { key: 'b', src: asset('img/clouds/cloud-3.webp'), depth: 'far' },
  { key: 'c', src: asset('img/clouds/cloud-2.webp'), depth: 'mid' },
  { key: 'd', src: asset('img/clouds/cloud-4.webp'), depth: 'mid' },
  { key: 'e', src: asset('img/clouds/cloud-1.webp'), depth: 'near' },
  { key: 'f', src: asset('img/clouds/cloud-3.webp'), depth: 'near' },
];

/* ---------------------------------------------------------------------------
   (b) SWAP IN REAL PHOTOS  and  (c) REPLACE THE COPY

   >>> PLACEHOLDER COPY — every `detail` and `story` line below is written to
   >>> be replaced. They are warm and generic on purpose; swap them for what
   >>> actually happened on each job and the section reads twice as well.

   `img` currently points at the photographs already in this project's library.
   --------------------------------------------------------------------------- */
const PROJECT_STORY = [
  {
    chip: 'Kitchen',
    title: 'Modular Kitchen',
    place: 'Coimbatore residence',
    img: asset('img/interiors/kitchen.webp'),
    alt: 'Modular kitchen in warm neutral tones',
    detail:
      'PLACEHOLDER — The family cooks together, so the run was opened up and the '
      + 'island turned to face the room instead of the wall. Handleless fronts in '
      + 'a warm oat, a quiet quartz top, and lighting tucked under every shelf so '
      + 'no one works in their own shadow.',
    story: 'Every home begins in the room where people gather.',
  },
  {
    chip: 'Pooja',
    title: 'Pooja Room',
    place: 'Dindigul villa',
    img: asset('img/interiors/pooja.webp'),
    alt: 'Pooja room with carved detailing and warm light',
    detail:
      'PLACEHOLDER — A small room asked to carry a great deal. Carved teak, a '
      + 'raised threshold, and a single warm downlight that falls exactly where it '
      + 'should. The doors fold back flat so the space belongs to the house on '
      + 'festival days and to one person on ordinary ones.',
    story: 'Some rooms are measured in feeling, not in feet.',
  },
  {
    chip: 'Bedroom',
    title: 'Master Bedroom',
    place: 'Private client',
    img: asset('img/interiors/bedroom.webp'),
    alt: 'Master bedroom with upholstered headboard and soft textiles',
    detail:
      'PLACEHOLDER — The brief was one word: rest. An upholstered headboard the '
      + 'full width of the wall, wardrobes pushed flush so they disappear, and '
      + 'three separate lighting circuits — reading, dressing, and the low one for '
      + 'walking through at two in the morning.',
    story: 'The best rooms are the ones you stop noticing.',
  },
  {
    chip: 'Living',
    title: 'TV Unit & Ceiling',
    place: 'Apartment fit-out',
    img: asset('img/interiors/tv-unit.webp'),
    alt: 'Television unit with integrated joinery and recessed ceiling',
    detail:
      'PLACEHOLDER — Ceiling and joinery were drawn as one piece, so the recess '
      + 'above lines up with the shelving below and the cabling never appears. '
      + 'Storage runs the whole wall but reads as a single quiet plane, which is '
      + 'the only way a television ever sits politely in a living room.',
    story: 'Detail is what you do not see holding everything together.',
  },
  {
    chip: 'Visitors',
    title: 'Visitors Room',
    place: 'Villa project',
    img: asset('img/interiors/visitors.webp'),
    alt: 'Visitors room with seating and layered daylight',
    detail:
      'PLACEHOLDER — A room that has to work for four people and for forty. '
      + 'Seating that pulls apart without looking like it was meant to, a floor '
      + 'that forgives, and curtains sized so the afternoon sun lands on the wall '
      + 'rather than in anyone’s eyes.',
    story: 'A house is really a set of welcomes.',
  },
  {
    chip: '3D',
    title: '3D Drawings',
    place: 'Concept stage',
    img: asset('img/services/visualization.webp'),
    alt: 'Interior perspective render at concept stage',
    detail:
      'PLACEHOLDER — Before anything is cut, the whole thing is built once in '
      + 'the drawing. Clients walk the rooms, move a wall, change a finish, and '
      + 'change their minds — all of which costs nothing here and a great deal on '
      + 'site. Every project on this page started as one of these.',
    story: 'And every one of them was imagined before it was built.',
  },
];

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
/* Soft at both ends, steady through the middle. */
const smoothstep = (t) => t * t * (3 - 2 * t);

export default function ProjectsCloud() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const boxRefs = useRef([]);
  const storyRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return undefined;

    const mm = gsap.matchMedia();

    /* Reduced motion gets the plain stacked list instead — see the .is-plain
       rules in the stylesheet. No pin, no zoom, every detail already open. */
    mm.add('(prefers-reduced-motion: reduce)', () => {
      root.classList.add('is-plain');
      return () => root.classList.remove('is-plain');
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      root.classList.remove('is-plain');

      const n = PROJECT_STORY.length;
      let lastStory = -1;

      const paint = (progress) => {
        /* Position along the run, measured in file slots. File i is centred
           when pos === i; the LEAD margins give the first file a run-up and
           the last one somewhere to go. */
        const pos = -LEAD + progress * (n - 1 + LEAD * 2);

        for (let i = 0; i < n; i += 1) {
          const card = cardRefs.current[i];
          const box = boxRefs.current[i];
          if (!card) continue;

          const u = pos - i;
          const au = Math.abs(u);

          let scale;
          let opacity;
          let blur = 0;
          let y = 0;

          if (au >= 1) {
            scale = u < 0 ? SPECK : 0.78;
            opacity = 0;
          } else if (u < -HOLD) {
            /* Approach. Geometric growth so the rate of zoom looks constant
               rather than lurching, smoothstepped so it leaves the speck and
               arrives at the hold without a jolt. */
            const k = smoothstep((u + 1) / (1 - HOLD));
            scale = SPECK * ((1 / SPECK) ** k);
            opacity = clamp01(k * 3.2);
            blur = (1 - k) * 9;
          } else if (u <= HOLD) {
            scale = 1;            /* the hold — full size, sharp, still */
            opacity = 1;
          } else {
            /* Settling back into the cloud. */
            const k = (u - HOLD) / (1 - HOLD);
            scale = 1 - 0.22 * k;
            opacity = clamp01(1 - k ** 1.25);
            blur = k * 15;
            y = -90 * k;
          }

          const tf = `translate3d(-50%, calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(4)})`;
          if (card.__tf !== tf) { card.style.transform = tf; card.__tf = tf; }

          const op = opacity.toFixed(3);
          if (card.__op !== op) { card.style.opacity = op; card.__op = op; }

          /* blur() is the one expensive write here, so it is rounded hard and
             dropped entirely the moment it stops being visible. */
          const fl = blur < 0.2 ? 'none' : `blur(${blur.toFixed(1)}px)`;
          if (card.__fl !== fl) { card.style.filter = fl; card.__fl = fl; }

          const vis = opacity < 0.004 ? 'hidden' : 'visible';
          if (card.__vis !== vis) { card.style.visibility = vis; card.__vis = vis; }

          /* The detail box opens BECAUSE the file arrived: its own progress is
             how settled the file is, not a separate tween. The window is
             narrower than a slot, so two boxes can never be open at once. */
          if (box) {
            const settled = clamp01(1 - au / (HOLD + 0.14));
            const bop = (settled ** 1.4).toFixed(3);
            if (box.__op !== bop) { box.style.opacity = bop; box.__op = bop; }

            const btf = `translate(-50%, ${((1 - settled) * 24).toFixed(1)}px)`;
            if (box.__tf !== btf) { box.style.transform = btf; box.__tf = btf; }

            const bvis = settled < 0.02 ? 'hidden' : 'visible';
            if (box.__vis !== bvis) { box.style.visibility = bvis; box.__vis = bvis; }
          }

          /* Nearest to centre paints on top. */
          const z = String(100 - Math.round(au * 50));
          if (card.__z !== z) { card.style.zIndex = z; card.__z = z; }
        }

        /* --- story line -------------------------------------------------- */
        const story = storyRef.current;
        if (story) {
          const near = Math.max(0, Math.min(n - 1, Math.round(pos)));
          if (near !== lastStory) {
            story.textContent = PROJECT_STORY[near].story;
            /* Alternate sides so the line always sits in open sky rather than
               landing on the file. */
            story.parentElement.dataset.side = near % 2 === 0 ? 'left' : 'right';
            lastStory = near;
          }
          const sop = clamp01(1 - Math.abs(pos - near) / 0.5).toFixed(3);
          if (story.__op !== sop) { story.style.opacity = sop; story.__op = sop; }
        }
      };

      const st = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${SCROLL_PER_FILE * PROJECT_STORY.length}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => paint(self.progress),
        onRefresh: (self) => paint(self.progress),
      });

      paint(0);

      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="cloudy" id="projects" ref={rootRef}>
      <div className="cloudy__stage" ref={stageRef}>
        <div className="cloudy__sky" aria-hidden="true" />

        <div className="cloudy__clouds" aria-hidden="true">
          {/* Two elements per cloud on purpose: the wrapper carries the
              horizontal drift and the image carries the bob, so both stay on
              `transform`. One element cannot hold two transforms at once. */}
          {CLOUDS.map((c) => (
            <span key={c.key} className={`cld cld--${c.key} cld--${c.depth}`}>
              {/* Not lazy: these are the section's backdrop, and a sky that
                  populates after the reader arrives is worse than the wait. */}
              <img src={c.src} alt="" decoding="async" />
            </span>
          ))}
        </div>

        {/* Section marker. Not part of the effect — remove if you want the sky
            completely bare. */}
        <p className="cloudy__mark">Selected work</p>

        <div className="cloudy__story" data-side="left">
          <p ref={storyRef} />
        </div>

        <div className="cloudy__files">
          {PROJECT_STORY.map((p, i) => (
            <article className="cf" key={p.title}>
              <div className="cf__card" ref={(el) => { cardRefs.current[i] = el; }}>
                <span className="cf__chip">{p.chip}</span>
                <span className="cf__shot">
                  {/* Not lazy either. Every card is laid out at the centre of
                      the pinned stage, so all six are "in the viewport" from
                      the moment the section arrives and lazy buys nothing —
                      it only risks a blank card mid-effect. Low priority so
                      they still queue behind the work above the fold. */}
                  <img src={p.img} alt={p.alt} decoding="async" fetchPriority="low" />
                </span>
                <span className="cf__caption">
                  <span className="cf__title">{p.title}</span>
                  <span className="cf__place">{p.place}</span>
                </span>
              </div>

              <div className="cf__detail" ref={(el) => { boxRefs.current[i] = el; }}>
                <h3 className="cf__detail-title">{p.title}</h3>
                <p className="cf__detail-body">{p.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
