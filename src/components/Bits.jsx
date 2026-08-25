import { useRef } from 'react';
import { useReveal, useImageReveal, useLineReveal, useCountUp } from '../lib/motion.js';

/* Fade-and-rise wrapper. With `stagger`, children marked
   data-reveal-item animate in sequence. */
export function Reveal({ as: Tag = 'div', children, className, stagger = 0, y, delay, once, ...rest }) {
  const ref = useRef(null);
  useReveal(ref, {
    stagger,
    ...(y !== undefined && { y }),
    ...(delay !== undefined && { delay }),
    ...(once !== undefined && { once }),
  });
  return (
    <Tag ref={ref} className={className} data-reveal {...rest}>
      {children}
    </Tag>
  );
}

/* Masked image that wipes up and settles from a slow zoom. */
export function RevealImage({ src, alt, className = '', sizes, loading = 'lazy', delay, once }) {
  const ref = useRef(null);
  useImageReveal(ref, {
    ...(delay !== undefined && { delay }),
    ...(once !== undefined && { once }),
  });
  return (
    <div className={`img-frame ${className}`} ref={ref}>
      <img src={src} alt={alt} loading={loading} decoding="async" sizes={sizes} />
    </div>
  );
}

/* One line split into per-word masks. Each word rides up out of its own
   clipped box, so the line assembles itself instead of sliding in whole. */
export function Words({ text }) {
  return text.split(' ').map((word, i) => (
    <span className="w-mask" key={`${word}-${i}`}>
      <span data-word>{word}</span>
    </span>
  ));
}

/* Headline whose words rise into place, one after another. */
export function RevealLines({ lines, className = '', tag: Tag = 'h2', delay, once, stagger }) {
  const ref = useRef(null);
  useLineReveal(ref, {
    ...(delay !== undefined && { delay }),
    ...(once !== undefined && { once }),
    ...(stagger !== undefined && { stagger }),
  });
  return (
    <Tag className={`line-words ${className}`} ref={ref}>
      {lines.map((line) => (
        <span className="line" key={line}>
          <Words text={line} />
        </span>
      ))}
    </Tag>
  );
}

export function Counter({ value, suffix = '' }) {
  const ref = useRef(null);
  useCountUp(ref, value);
  return (
    <span className="num">
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}

/* Title block for a section: sheet number, ruled scale, discipline, monogram.
   Decorative — the section's real heading follows in SectionHead. */
export function SheetMark({ index, caption }) {
  return (
    <div className="sheet" aria-hidden="true">
      <span className="sheet__no num">{index}</span>
      <span className="sheet__scale" />
      {caption ? <span className="sheet__caption">{caption}</span> : null}
      <span className="brandmark sheet__mark">
        <span className="brandmark__ink" />
        <span className="brandmark__accent" />
      </span>
    </div>
  );
}

/* A dimension line — extension uprights, arrow terminators and a measured
   value. Decorative annotation, in the language of the drawing set. */
export function DimLine({ label, className = '' }) {
  return (
    <div className={`dim ${className}`} aria-hidden="true">
      <span className="dim__ext" />
      <span className="dim__line">
        <span className="dim__label">{label}</span>
      </span>
      <span className="dim__ext" />
    </div>
  );
}

export function SectionHead({ label, title, aside, className = '', once }) {
  return (
    <div className={`sec-head ${className}`}>
      <div>
        <Reveal as="span" className="sec-head__label label" once={once} y={18}>
          {label}
        </Reveal>
        <RevealLines
          className="sec-head__title display"
          lines={title}
          once={once}
          stagger={0.05}
        />
      </div>
      {aside ? (
        <Reveal className="sec-head__aside lede" once={once} delay={0.18}>{aside}</Reveal>
      ) : <div />}
    </div>
  );
}
