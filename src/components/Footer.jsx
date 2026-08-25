import { COMPANY, NAV, FOOTER_SERVICES } from '../lib/site.js';
import { scrollToId } from '../lib/motion.js';
import '../styles/footer.css';

const SOCIAL = [
  { label: 'Instagram', href: COMPANY.instagram },
  { label: 'Facebook', href: COMPANY.facebook },
  { label: 'Twitter / X', href: COMPANY.twitter },
];

export default function Footer() {
  const go = (e, href) => {
    e.preventDefault();
    if (href === '#top') {
      if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToId(href);
    }
  };

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo display">Konst Design</span>
            <span className="footer__tagline">{COMPANY.tagline}</span>
          </div>

          <nav className="footer__col" aria-label="Footer navigation">
            <h4 className="label">Navigation</h4>
            <ul>
              {NAV.map((n) => (
                <li key={n.href}>
                  <a className="ulink" href={n.href} onClick={(e) => go(e, n.href)}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <h4 className="label">Services</h4>
            <ul>
              {FOOTER_SERVICES.map((s) => (
                <li key={s}>
                  <a className="ulink" href="#expertise" onClick={(e) => go(e, '#expertise')}>{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--contact">
            <h4 className="label">Contact</h4>
            <ul>
              <li><a className="ulink" href={COMPANY.phoneHref}>{COMPANY.phone}</a></li>
              <li><a className="ulink" href={COMPANY.phoneDindigulHref}>{COMPANY.phoneDindigul}</a></li>
              <li><a className="ulink footer__mail" href={COMPANY.emailHref}>{COMPANY.email}</a></li>
            </ul>

            <h4 className="label footer__social-h">Follow</h4>
            <ul className="footer__social">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a className="ulink" href={s.href} target="_blank" rel="noreferrer">{s.label} ↗</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Konst Design. All Rights Reserved.</span>
          <span className="footer__place">Coimbatore · Dindigul · Tamil Nadu</span>
          <button className="footer__up ulink" onClick={(e) => go(e, '#top')}>
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
