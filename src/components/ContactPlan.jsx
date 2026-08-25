import { useRef } from 'react';
import { usePlanDraw } from '../lib/motion.js';

/* ---------------------------------------------------------------------------
   The furniture plan that inks itself in behind the contact section — a living
   and dining room, drawn the way the studio would draw one: double-line walls,
   a door swing, the fit-out, then the dimensions.

   Every stroked path carries pathLength="1" so usePlanDraw can dash it without
   measuring; the dashed rugs and the lettering fade instead, because a dash
   array cannot be animated over a dash array.
   --------------------------------------------------------------------------- */
export default function ContactPlan() {
  const ref = useRef(null);
  usePlanDraw(ref);

  return (
    <svg
      ref={ref}
      className="contact__plan"
      viewBox="0 0 760 620"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {/* --- shell: two lines, because that is how a wall is drawn --------- */}
      <g className="plan__wall">
        {[
          'M40 40 H220', 'M360 40 H680', 'M680 40 V500', 'M680 500 H40',
          'M40 500 V380', 'M40 300 V40',
          'M52 52 H220', 'M360 52 H668', 'M668 52 V488', 'M668 488 H52',
          'M52 488 V380', 'M52 300 V52',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="wall" />)}
        {/* stub wall between the two zones */}
        {['M400 52 V168', 'M412 52 V168', 'M400 168 H412'].map((d) => (
          <path key={d} d={d} pathLength="1" data-draw="wall" />
        ))}
      </g>

      {/* --- window, and the door you are being invited through ----------- */}
      <g className="plan__wall">
        {['M220 40 V52', 'M360 40 V52'].map((d) => (
          <path key={d} d={d} pathLength="1" data-draw="wall" />
        ))}
        <path className="plan__glass" d="M220 46 H360" pathLength="1" data-draw="wall" />
      </g>
      <g className="plan__door">
        {['M40 300 H52', 'M40 380 H52'].map((d) => (
          <path key={d} d={d} pathLength="1" data-draw="wall" />
        ))}
        <path d="M52 380 H128" pathLength="1" data-draw="fit" />
        <path className="plan__swing" d="M128 380 A76 76 0 0 0 52 304" pathLength="1" data-draw="fit" />
      </g>

      {/* --- living: media wall, sofa on axis, chairs either side --------- */}
      <g className="plan__fit">
        <path className="plan__soft" d="M80 130 H350 V320 H80 Z" data-fade />
        {[
          'M100 52 H330 V74 H100 Z',                          /* media unit */
          'M100 230 H330 V300 H100 Z',                        /* sofa */
          'M176 230 V300', 'M254 230 V300', 'M100 290 H330',
          'M160 150 H270 V200 H160 Z',                        /* low table */
          'M90 150 H140 V215 H90 Z',                          /* chairs */
          'M300 150 H350 V215 H300 Z',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="fit" />)}
      </g>

      {/* --- dining: table and six ---------------------------------------- */}
      <g className="plan__fit">
        <path className="plan__soft" d="M436 100 H644 V344 H436 Z" data-fade />
        <path
          d="M470 140 H610 A10 10 0 0 1 620 150 V290 A10 10 0 0 1 610 300 H470
             A10 10 0 0 1 460 290 V150 A10 10 0 0 1 470 140 Z"
          pathLength="1"
          data-draw="fit"
        />
        {[
          'M424 168 H454 V202 H424 Z', 'M424 238 H454 V272 H424 Z',
          'M626 168 H656 V202 H626 Z', 'M626 238 H656 V272 H626 Z',
          'M525 104 H555 V134 H525 Z', 'M525 306 H555 V336 H525 Z',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="fit" />)}
      </g>

      {/* --- planting ------------------------------------------------------ */}
      <g className="plan__fit">
        {[
          'M612 432 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0',
          'M110 448 m-17 0 a17 17 0 1 0 34 0 a17 17 0 1 0 -34 0',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="fit" />)}
        {[
          'M612 432 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0',
          'M110 448 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="fit" />)}
      </g>

      {/* --- annotation: dimensions, north, and what the rooms are -------- */}
      <g className="plan__note">
        {[
          'M40 506 V546', 'M680 506 V546', 'M40 540 H680',
          'M33 547 L47 533', 'M673 547 L687 533',
        ].map((d) => <path key={d} d={d} pathLength="1" data-draw="note" />)}
        <path d="M720 90 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0" pathLength="1" data-draw="note" />
        <path className="plan__north" d="M720 74 L713 98 L720 94 L727 98 Z" pathLength="1" data-draw="note" />
      </g>

      <g className="plan__type">
        <text x="360" y="566" textAnchor="middle" data-fade>34&#8242;-0&#8243;</text>
        <text x="215" y="348" textAnchor="middle" data-fade>LIVING</text>
        <text x="540" y="374" textAnchor="middle" data-fade>DINING</text>
        <text x="720" y="122" textAnchor="middle" className="plan__tiny" data-fade>N</text>
        <text x="40" y="598" className="plan__tag" data-fade>INTERIOR PLAN</text>
        <text x="680" y="598" textAnchor="end" className="plan__tiny" data-fade>1:75</text>
      </g>
    </svg>
  );
}
