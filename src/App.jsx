import { useEffect, useState } from 'react';
import { useSmoothScroll, ScrollTrigger } from './lib/motion.js';

import Intro from './components/Intro.jsx';
import Nav from './components/Nav.jsx';
import ScrollStory from './components/ScrollStory.jsx';
import ServiceHandoff from './components/ServiceHandoff.jsx';
import Expertise from './components/Expertise.jsx';
import InteriorSpaces from './components/InteriorSpaces.jsx';
import ProjectsWall from './components/ProjectsWall.jsx';
import Story from './components/Story.jsx';
import Awards from './components/Awards.jsx';
import Why from './components/Why.jsx';
import Contact from './components/Contact.jsx';
import Locations from './components/Locations.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  useSmoothScroll();

  /* The sequence is the home page, so the home page is frame 1 — the empty
     room. A reload that restores the previous scroll offset would drop the
     visitor into the middle of the sequence instead, which reads as the site
     opening on a half-furnished room. */
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  /* The intro overlay holds the page still; release scroll once it lifts. */
  useEffect(() => {
    document.body.classList.toggle('is-locked', !introDone);
    if (introDone) {
      window.__lenis?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      window.__lenis?.stop();
    }
  }, [introDone]);

  return (
    <>
      <Intro onDone={() => setIntroDone(true)} />
      <div className="grain" aria-hidden="true" />

      <Nav ready={introDone} />

      <main id="top">
        {/* The frame sequence is the home page: it is pinned from the very
            top, so the effect runs from the first pixel of scroll. */}
        <ScrollStory ready={introDone} />
        <Expertise />
        <InteriorSpaces />
        <ProjectsWall />
        <Story />
        <Awards />
        <Why />
        <Contact />
        <Locations />
      </main>

      <Footer />

      {/* Outside <main> on purpose: a transformed ancestor would make its
          `fixed` positioning relative to that ancestor instead of the
          viewport, and the flight would drift. */}
      <ServiceHandoff />
    </>
  );
}
