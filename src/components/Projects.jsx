import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS, COMPANY } from '../lib/site.js';
import { DimLine, Reveal, SectionHead, SheetMark } from './Bits.jsx';
import { useImageReveal, useParallax, scrollToId } from '../lib/motion.js';
import '../styles/projects.css';

const no = (i) => String(i + 1).padStart(2, '0');

/* A working enquiry: the project the visitor was actually reading is carried
   into the subject line and the body, so nothing has to be re-typed. */
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

/* ---------------------------------------------------------------------------
   Card. The photograph teases the brief on hover; opening it is what loads
   the full case study.
   --------------------------------------------------------------------------- */
function ProjectCard({ project, index, onOpen }) {
  const mediaRef = useRef(null);
  const innerRef = useRef(null);

  /* once:false so the wipe replays every time the card is scrolled back to. */
  useImageReveal(mediaRef, { once: false });
  useParallax(innerRef, { amount: 9 });

  return (
    <article className={`proj proj--${project.span}`}>
      <div className="proj__media img-frame" ref={mediaRef}>
        <div className="proj__inner" ref={innerRef}>
          <img
            src={project.img}
            alt={`${project.title} — ${project.category}, ${project.location}`}
            loading="lazy"
            decoding="async"
          />
        </div>

        <span className="proj__veil" aria-hidden="true" />
        <span className="proj__no num" aria-hidden="true">{no(index)}</span>
        <span className="proj__badge">{project.category}</span>

        <button
          className="proj__hit"
          onClick={onOpen}
          aria-label={`Open case study — ${project.title}, ${project.location}`}
        />

        <div className="proj__brief" aria-hidden="true">
          <p className="proj__desc">{project.desc}</p>
          <ul className="proj__scope">
            {project.scope.slice(0, 3).map((s) => <li key={s}>{s}</li>)}
          </ul>
          <span className="proj__cta">
            View case study <span className="arw">→</span>
          </span>
        </div>
      </div>

      <Reveal className="proj__meta" once={false} y={26}>
        <h3 className="proj__title display">{project.title}</h3>
        <div className="proj__facts">
          <span>{project.location}</span>
          <span className="proj__dot" aria-hidden="true" />
          <span>{project.area}</span>
          <span className="proj__dot" aria-hidden="true" />
          <span className="num">{project.year}</span>
        </div>
      </Reveal>
    </article>
  );
}

/* ---------------------------------------------------------------------------
   Case study. Gallery on the left, written brief and the spec table on the
   right, with the whole set steppable without closing.
   --------------------------------------------------------------------------- */
function CaseStudy({ project, index, onClose, onStep, onGo }) {
  const [shot, setShot] = useState(0);

  /* A new project always starts on its first photograph. */
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
          <figcaption className="case__count num">
            {no(shot)} / {no(gallery.length - 1)}
          </figcaption>
        </figure>

        {gallery.length > 1 && (
          <div className="case__thumbs">
            {gallery.map((src, i) => (
              <button
                key={src + i}
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
          <span className="case__no label">
            <span className="num">{no(index)}</span> — {project.category}
          </span>
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
          <span className="label">Scope of work</span>
          <ul>
            {project.scope.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>

        <div className="case__actions">
          <a className="btn btn--solid" href={enquiryHref(project)}>
            Enquire about this project <span className="arw" aria-hidden="true">→</span>
          </a>
          <a className="btn" href={COMPANY.phoneHref}>
            Call the studio <span className="arw" aria-hidden="true">→</span>
          </a>
          <button className="case__jump ulink" onClick={() => onGo('#contact')}>
            See all contact details →
          </button>
        </div>

        <div className="case__nav">
          <button onClick={() => onStep(-1)} aria-label="Previous project">← Prev</button>
          <span className="num">{no(index)} / {no(PROJECTS.length - 1)}</span>
          <button onClick={() => onStep(1)} aria-label="Next project">Next →</button>
        </div>
      </div>

      <button className="case__close" onClick={onClose} aria-label="Close case study">
        <span /><span />
      </button>
    </div>
  );
}

export default function Projects() {
  const [openIndex, setOpenIndex] = useState(null);
  const open = openIndex !== null ? PROJECTS[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);

  /* Closing only schedules a state change, and Lenis is still stopped at that
     moment — so the destination is parked and travelled to once the modal has
     actually gone and smooth scroll has been handed back. */
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
    setOpenIndex((i) => (i === null ? null : (i + dir + PROJECTS.length) % PROJECTS.length));
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
    <section className="section projects section--sheet" id="projects">
      <div className="wrap">
        <SheetMark index="03" caption="Portfolio" />
        <SectionHead
          once={false}
          label="Selected projects"
          title={['Recent work,', 'in detail.']}
          aside={
            <>
              <strong className="num">237</strong> projects delivered across Coimbatore, Dindigul
              and Tamil Nadu. Open any photograph for the full case study — drawings, materials,
              areas and how the project was actually built.
            </>
          }
        />

        <DimLine className="proj__dim" label={`${PROJECTS.length} plates — 237 projects total`} />

        <div className="proj-grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} onOpen={() => setOpenIndex(i)} />
          ))}
        </div>
      </div>

      <div
        className={`case ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Project case study"
        aria-hidden={!open}
      >
        <button className="case__backdrop" onClick={close} aria-label="Close" tabIndex={open ? 0 : -1} />
        {open && (
          <CaseStudy project={open} index={openIndex} onClose={close} onStep={step} onGo={goFrom} />
        )}
      </div>
    </section>
  );
}
