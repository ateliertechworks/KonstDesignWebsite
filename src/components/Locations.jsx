import { LOCATIONS } from '../lib/site.js';
import { SectionHead, Reveal, SheetMark } from './Bits.jsx';
import '../styles/locations.css';

export default function Locations() {
  return (
    <section className="section locations section--sheet" id="locations">
      <div className="wrap">
        <SheetMark index="06" caption="Studios" />
        <SectionHead
          label="Locations"
          title={['Two studios.', 'One standard.']}
          aside={<>Visit us in Coimbatore or Dindigul — or send us your plan and we will call you back.</>}
        />

        <Reveal as="div" className="loc__grid" stagger={0.1}>
          {LOCATIONS.map((loc) => (
            <article className="loc" key={loc.city} data-reveal-item>
              <header className="loc__head">
                <h3 className="loc__city display">{loc.city}</h3>
                <span className="loc__role">{loc.role}</span>
              </header>

              <address className="loc__addr">
                {loc.lines.map((l) => <span key={l}>{l}</span>)}
              </address>

              <a className="loc__phone ulink" href={loc.phoneHref}>{loc.phone}</a>

              <a className="btn loc__maps" href={loc.maps} target="_blank" rel="noreferrer">
                View on Google Maps <span className="arw" aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
