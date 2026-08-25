import { PRINCIPLES } from '../lib/site.js';
import { SectionHead, Reveal, SheetMark, DimLine } from './Bits.jsx';
import '../styles/why.css';

export default function Why() {
  return (
    <section className="section why section--sheet" id="why">
      <div className="wrap">
        <SheetMark index="05" caption="How we work" />
        <SectionHead
          label="Why Konst Design?"
          title={['Four things we', 'never compromise.']}
          aside={
            <>
              The reasons clients stay with us across second and third projects — and refer us to
              their families.
            </>
          }
        />

        <DimLine className="why__dim" label={`4 principles — equal weight`} />

        <Reveal as="ol" className="why__list" stagger={0.09}>
          {PRINCIPLES.map((p) => (
            <li className="why__item" key={p.no} data-reveal-item>
              <span className="xhair why__xhair" aria-hidden="true" />
              <span className="why__no mono">{p.no}</span>
              <h3 className="why__title display">{p.title}</h3>
              <p className="why__body">{p.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
