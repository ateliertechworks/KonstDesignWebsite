import { COMPANY } from '../lib/site.js';
import { Reveal, RevealLines } from './Bits.jsx';
import ContactPlan from './ContactPlan.jsx';
import '../styles/contact.css';

export default function Contact() {
  return (
    <section className="section section--dark contact" id="contact">
      <ContactPlan />

      <div className="wrap contact__body">
        <Reveal><span className="label">Start a project</span></Reveal>

        <RevealLines className="contact__title display" lines={["Let's design", 'your space.']} />

        <Reveal className="contact__grid" stagger={0.1}>
          <p className="lede contact__lede" data-reveal-item>
            Have a project in mind? Talk to our team and let's turn your idea into a space.
          </p>

          <div className="contact__actions" data-reveal-item>
            <a className="btn btn--clay" href={COMPANY.phoneHref}>
              Call us <span className="arw" aria-hidden="true">→</span>
            </a>
            <a className="btn btn--light" href={COMPANY.emailHref}>
              Send an email <span className="arw" aria-hidden="true">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
