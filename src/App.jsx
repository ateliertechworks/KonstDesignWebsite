import { useEffect, useState } from 'react';
import { useSmoothScroll, ScrollTrigger } from './lib/motion.js';

import Intro from './components/Intro.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import ScrollStory from './components/ScrollStory.jsx';
import Expertise from './components/Expertise.jsx';
import InteriorSpaces from './components/InteriorSpaces.jsx';
import Projects from './components/Projects.jsx';
import Story from './components/Story.jsx';
import Awards from './components/Awards.jsx';
import Why from './components/Why.jsx';
import Contact from './components/Contact.jsx';
import Locations from './components/Locations.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  useSmoothScroll();

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
        <Hero ready={introDone} />
        <ScrollStory />
        <Expertise />
        <InteriorSpaces />
        <Projects />
        <Story />
        <Awards />
        <Why />
        <Contact />
        <Locations />
      </main>

      <Footer />
    </>
  );
}
