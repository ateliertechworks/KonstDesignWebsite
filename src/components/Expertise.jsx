import { useState } from 'react';
import { EXPERTISE } from '../lib/site.js';
import { SectionHead, RevealImage, SheetMark } from './Bits.jsx';
import { scrollToId } from '../lib/motion.js';
import '../styles/expertise.css';

export default function Expertise() {
  const [openSubs, setOpenSubs] = useState(false);

  return (
    <section className="section expertise section--sheet" id="expertise">
      <div className="wrap">
        <SheetMark index="01" caption="Architecture · Interiors · 3D" />
        <SectionHead
          label="Our expertise"
          title={['Architecture.', 'Interiors.', 'Visualization.']}
          aside={
            <>
              Three disciplines, one studio. Every project moves through the same hands — from the
              first sketch of a plan to the last light fitting on site.
            </>
          }
        />

        <div className="expertise__grid">
          {EXPERTISE.map((s, i) => (
            <article className="svc" key={s.no}>
              <RevealImage
                className={`svc__media ${i === 2 ? 'svc__media--float' : ''}`}
                src={s.img}
                alt={s.alt}
                delay={i * 0.05}
                sizes="(max-width: 720px) 90vw, (max-width: 1180px) 46vw, 31vw"
              />

              <div className="svc__body">
                <div className="svc__top">
                  <span className="svc__no mono">{s.no}</span>
                  <h3 className="svc__title display">{s.title}</h3>
                </div>

                <p className="svc__blurb">{s.blurb}</p>
                <p className="svc__detail">{s.detail}</p>

                {s.subServices && (
                  <div className={`svc__subs ${openSubs ? 'is-open' : ''}`}>
                    <button
                      className="svc__subs-toggle"
                      onClick={() => setOpenSubs((v) => !v)}
                      aria-expanded={openSubs}
                    >
                      <span>{openSubs ? 'Hide' : 'View'} interior services</span>
                      <i aria-hidden="true" />
                    </button>
                    <div className="svc__subs-wrap">
                      <ul className="svc__subs-list">
                        {s.subServices.map((sub) => (
                          <li key={sub}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <button
                  className="svc__cta ulink"
                  onClick={() => scrollToId(s.no === '03' ? '#projects' : '#interiors')}
                >
                  Explore Service <span className="arw" aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
