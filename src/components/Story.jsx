import { useRef } from 'react';
import { asset, STATS } from '../lib/site.js';
import { Counter, Reveal, RevealLines } from './Bits.jsx';
import { useImageReveal, useParallax } from '../lib/motion.js';
import '../styles/story.css';

export default function Story() {
  const mediaRef = useRef(null);
  const innerRef = useRef(null);
  useImageReveal(mediaRef);
  useParallax(innerRef, { amount: 10 });

  return (
    <section className="section section--dark story-block" id="story">
      <div className="wrap story-block__grid">
        <div className="story-block__copy">
          <Reveal><span className="label">The studio</span></Reveal>

          <RevealLines
            className="story-block__title display"
            lines={['14+ years of', 'designing better', 'spaces.']}
          />

          <Reveal className="story-block__text" stagger={0.1}>
            <p className="lede" data-reveal-item>
              With more than 14 years of experience, Konst Design brings together architectural
              thinking, interior design and 3D visualization to create spaces that are functional,
              beautiful and personal.
            </p>
            <p className="story-block__note" data-reveal-item>
              We work from Coimbatore and Dindigul across residential, retail and commercial
              projects — drawing, detailing and seeing each one through to handover.
            </p>
          </Reveal>
        </div>

        <div className="story-block__media img-frame" ref={mediaRef}>
          <div className="story-block__inner" ref={innerRef}>
            <img
              src={asset('img/misc/story.webp')}
              alt="Completed living room designed by Konst Design, in warm evening light"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      <div className="wrap">
        <Reveal as="ul" className="stats" stagger={0.09}>
          {STATS.map((s) => (
            <li className="stats__item" key={s.label} data-reveal-item>
              <span className="stats__value display">
                <Counter value={s.value} suffix={s.suffix} />
              </span>
              <span className="stats__label">{s.label}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
