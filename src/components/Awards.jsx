import { AWARDS } from '../lib/site.js';
import { Counter, Reveal, SheetMark } from './Bits.jsx';
import '../styles/awards.css';

export default function Awards() {
  const marquee = [...AWARDS, ...AWARDS];

  return (
    <section className="section awards section--sheet" id="awards" aria-labelledby="awards-h">
      <div className="wrap">
        <SheetMark index="04" caption="Recognition" />
        <Reveal className="awards__head" stagger={0.1}>
          <span className="label" data-reveal-item>Recognition</span>
          <h2 className="awards__figure display" id="awards-h" data-reveal-item>
            <Counter value={12} /> <span>Awards won</span>
          </h2>
          <p className="lede awards__lede" data-reveal-item>
            Work recognised for residential architecture, interior craft and visualization —
            across fourteen years of practice.
          </p>
        </Reveal>
      </div>

      <div className="awards__marquee" aria-hidden="true">
        <div className="awards__track">
          {marquee.map((a, i) => (
            <span className="awards__item" key={`${a}-${i}`}>
              <i className="awards__star" />
              {a}
            </span>
          ))}
        </div>
      </div>

      <ul className="vh">
        {AWARDS.map((a) => <li key={a}>{a}</li>)}
      </ul>
    </section>
  );
}
