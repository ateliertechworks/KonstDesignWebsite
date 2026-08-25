/* Single source of truth for every piece of company content on the site. */

const B = import.meta.env.BASE_URL;
export const asset = (p) => `${B}${p.replace(/^\//, '')}`;

export const COMPANY = {
  name: 'Konst Design',
  tagline: 'Architecture • Interiors • 3D Visualization',
  phone: '+91 98943 31115',
  phoneHref: 'tel:+919894331115',
  phoneDindigul: '+91 77080 08184',
  phoneDindigulHref: 'tel:+917708008184',
  email: 'Mohasher11@gmail.com',
  emailHref: 'mailto:Mohasher11@gmail.com?subject=Project%20enquiry%20—%20Konst%20Design',
  instagram: 'https://www.instagram.com/konstdesign.cbe/',
  facebook: 'https://www.facebook.com/profile.php?id=61571082531132',
  twitter: 'https://twitter.com/',
};

export const STATS = [
  { value: 14, suffix: '+', label: 'Years of Experience' },
  { value: 237, suffix: '', label: 'Projects Completed' },
  { value: 12, suffix: '', label: 'Awards Won' },
  { value: 11, suffix: 'K', label: 'Twitter Followers' },
];

export const NAV = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#story' },
  { label: 'Services', href: '#expertise' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export const EXPERTISE = [
  {
    no: '01',
    title: 'Architectural Design',
    blurb:
      'From concept to structure, we design spaces that balance functionality and architectural character.',
    detail:
      'Create architectural concepts that combine functionality, modern aesthetics and thoughtful spatial planning.',
    img: asset('img/services/architecture.webp'),
    alt: 'Bare architectural volume with a full-height steel window',
  },
  {
    no: '02',
    title: 'Interior Design',
    blurb: 'Thoughtfully designed interiors tailored to the way you live.',
    detail:
      'Bedrooms, ceilings, pooja rooms, TV units, visitors rooms and modular kitchens — resolved as one language.',
    img: asset('img/services/interiors.webp'),
    alt: 'Furnished living room in warm neutral tones at sunset',
    subServices: [
      'Bedroom Interior Design',
      'Ceiling Interior Design',
      'Pooja Room Interior Design',
      'TV Unit Interior Design',
      'Visitors Room Interior Design',
      'Modular Kitchen Design',
    ],
  },
  {
    no: '03',
    title: '3D Drawings',
    blurb:
      'Realistic 3D visualization that allows you to experience your space before it is built.',
    detail:
      'Architectural renders, interior perspectives and concept drawings produced at photographic fidelity.',
    img: asset('img/services/visualization.webp'),
    alt: 'Interior perspective render of a living space in progress',
  },
];

export const INTERIORS = [
  {
    no: '01',
    title: 'Bedroom Interior',
    img: asset('img/interiors/bedroom.webp'),
    alt: 'Soft textile detail of upholstered seating',
    desc:
      'Restful, low-contrast bedrooms built around natural light, generous storage and warm tactile materials. Wardrobes, headboards, side lighting and finishes are drawn together as a single composition.',
  },
  {
    no: '02',
    title: 'Ceiling Design',
    img: asset('img/interiors/ceiling.webp'),
    alt: 'Ceiling soffit and wall plane washed in daylight',
    desc:
      'False ceilings, coves and recessed profiles designed with the lighting plan rather than after it — so services disappear and the plane above the room becomes part of the architecture.',
  },
  {
    no: '03',
    title: 'Pooja Room',
    img: asset('img/interiors/pooja.webp'),
    alt: 'Timber shelving with objects and warm lighting',
    desc:
      'Traditional proportion handled with a contemporary hand. Carved or minimal teak joinery, considered orientation, concealed storage and lighting that holds the space in a quiet register.',
  },
  {
    no: '04',
    title: 'TV Unit',
    img: asset('img/interiors/tv-unit.webp'),
    alt: 'Wall composition with framed art and planting',
    desc:
      'Media walls detailed as furniture: veneer and stone panelling, back-lit reveals, hidden cable routes and open-shut storage proportioned to the wall it sits on.',
  },
  {
    no: '05',
    title: 'Visitors Room',
    img: asset('img/interiors/visitors.webp'),
    alt: 'Pair of cane and navy lounge chairs',
    desc:
      'The first room a guest reads. Seating arranged for conversation, a restrained material palette and one considered focal point — art, joinery or a single strong light.',
  },
  {
    no: '06',
    title: 'Modular Kitchen',
    img: asset('img/interiors/kitchen.webp'),
    alt: 'Low table with ceramics and books on a woven rug',
    desc:
      'Ergonomic work triangles, full-height tall units, soft-close hardware and quartz or granite counters — specified for Indian cooking and detailed to stay beautiful under daily use.',
  },
];

/* Each project's images live in their own folder — public/img/projects/<slug>/,
   numbered 01.webp upwards. 01 is the perspective view the card shows; 02
   onwards are the drawing plates the case study steps through. Adding one is
   dropping the next number in and raising `shots`. All of them are generated —
   see tools/render_views.py and tools/render.py. */
export const projectShots = (slug, count) =>
  Array.from({ length: count }, (_, i) =>
    asset(`img/projects/${slug}/${String(i + 1).padStart(2, '0')}.webp`));

const PROJECT_LIST = [
  {
    slug: 'rathinapuri-residence',
    shots: 4,
    title: 'Rathinapuri Residence',
    location: 'Coimbatore',
    category: 'Architecture',
    year: '2025',
    area: '2,400 sq ft',
    desc:
      'A three-bedroom family home on a tight urban plot, folded around a central light well so every room borrows daylight without borrowing the street.',
    story: [
      'The site is a standard 30x50 plot with neighbours hard against both long walls, which rules out side windows for most of the plan. Rather than fight that, the house is organised around a central light well that runs the full height of the building. Every habitable room opens onto it, so daylight and cross ventilation come from inside the plot instead of the boundary.',
      'The street face is deliberately quiet — a solid parapet, a recessed entry and a single deep opening — while the rear opens up completely to a small garden. Finishes stay restrained: exposed concrete lintels, plastered walls in a warm off-white, and teak only where a hand actually touches it.',
    ],
    scope: ['Site planning', 'Elevation', 'Working drawings', 'Site supervision'],
    specs: [
      ['Typology', 'Private residence'],
      ['Built area', '2,400 sq ft'],
      ['Plot', '30 x 50 ft'],
      ['Duration', '14 months'],
      ['Status', 'Completed 2025'],
    ],
    span: 'a',
  },
  {
    slug: 'courtyard-house',
    shots: 4,
    title: 'Courtyard House',
    location: 'Pollachi',
    category: 'Architecture',
    year: '2024',
    area: '3,100 sq ft',
    desc:
      'Built around an open courtyard that keeps the house cool through the Pollachi summer — deep verandahs and a shaded roof doing the work, not the air conditioning.',
    story: [
      'The brief was a house for three generations under one roof, on a generous plot with mature trees worth keeping. The plan wraps a square courtyard, with the older couple on the ground floor and the younger family above, so the two households share the court without sharing a corridor.',
      'Passive cooling drove most of the decisions. The courtyard pulls hot air up and out, the verandah depth is set to shade the walls through the worst of the afternoon, and the roof carries an air gap over the slab. Through April the interior sits several degrees below the street.',
    ],
    scope: ['Architecture', 'Landscape', 'Site supervision'],
    specs: [
      ['Typology', 'Multi-generational home'],
      ['Built area', '3,100 sq ft'],
      ['Courtyard', '18 x 18 ft'],
      ['Duration', '18 months'],
      ['Status', 'Completed 2024'],
    ],
    span: 'b',
  },
  {
    slug: 'loft-living-room',
    shots: 4,
    title: 'The Loft Living Room',
    location: 'Coimbatore',
    category: 'Interior Design',
    year: '2025',
    area: '850 sq ft',
    desc:
      'A double-height living room re-planned around one long seating axis, with layered lighting that changes the character of the room after dark.',
    story: [
      'The original room had height but no anchor — seating pushed to the walls and a nine-foot blank above the television. We pulled the sofa off the wall onto a single long axis, and used a floating veneer unit to give the tall wall a horizontal line to sit against.',
      'Lighting does the rest. A cove washes the upper volume so the ceiling reads as a surface rather than a void, track spots pick out the art wall, and low table lamps take over in the evening. Three circuits, three completely different rooms.',
    ],
    scope: ['Space planning', 'Joinery', 'Lighting', 'Furniture'],
    specs: [
      ['Typology', 'Living room fit-out'],
      ['Area', '850 sq ft'],
      ['Ceiling', '18 ft, double height'],
      ['Duration', '5 months'],
      ['Status', 'Completed 2025'],
    ],
    span: 'c',
  },
  {
    slug: 'mak-complex-interiors',
    shots: 4,
    title: 'MAK Complex Interiors',
    location: 'Dindigul',
    category: 'Interior Design',
    year: '2024',
    area: '6,500 sq ft',
    desc:
      'A commercial fit-out across two floors — hard-wearing finishes, clear wayfinding, and a reception that sets the tone the moment you step in.',
    story: [
      'Two floors of an existing complex had to keep working while they were rebuilt, so the fit-out was staged floor by floor over eleven weekends. The ground floor carries reception and client-facing rooms; the upper floor is open workspace with two enclosed cabins.',
      'Everything specified here had to survive commercial traffic. Vitrified floors, laminate on all touched surfaces, veneer reserved for the reception wall and the cabin doors. Signage and colour are the wayfinding: one accent runs the whole route from the door to the meeting room.',
    ],
    scope: ['Commercial fit-out', 'Furniture', 'Signage', 'Lighting'],
    specs: [
      ['Typology', 'Commercial office'],
      ['Built area', '6,500 sq ft'],
      ['Floors', 'Two'],
      ['Duration', '7 months, phased'],
      ['Status', 'Completed 2024'],
    ],
    span: 'd',
  },
  {
    slug: 'saravanampatti-villa',
    shots: 4,
    title: 'Saravanampatti Villa',
    location: 'Coimbatore',
    category: '3D Visualization',
    year: '2023',
    area: '4,200 sq ft',
    desc:
      'Photoreal exteriors and interiors produced before a brick was laid, so material, colour and light were signed off with nothing left to imagination.',
    story: [
      'The client had turned down two elevations on paper and could not picture the third. We modelled the whole villa from the working drawings and rendered it at three times of day, so the decision moved from reading a drawing to looking at the house.',
      'The set ran to fourteen stills and a short walkthrough: street elevation, entry court, living and dining, the stair, and the master suite. Two material choices changed as a direct result — the boundary cladding and the stair railing — both far cheaper to change in the model than on site.',
    ],
    scope: ['3D modelling', 'Material study', 'Lighting study', 'Walkthrough'],
    specs: [
      ['Typology', 'Pre-construction visualization'],
      ['Built area', '4,200 sq ft'],
      ['Deliverables', '14 stills, 1 walkthrough'],
      ['Duration', '6 weeks'],
      ['Status', 'Delivered 2023'],
    ],
    span: 'e',
  },
  {
    slug: 'peelamedu-apartment',
    shots: 4,
    title: 'Peelamedu Apartment',
    location: 'Coimbatore',
    category: 'Interior Design',
    year: '2025',
    area: '1,150 sq ft',
    desc:
      'A compact apartment rebuilt for a young family — modular kitchen, a pooja room carved out of dead corridor space, and storage worked into every wall.',
    story: [
      'Eleven hundred square feet for a family of four means nothing can be single-purpose. The dining bench lifts for storage, the corridor loses six inches to a full-height wardrobe run, and a blind stretch of passage becomes the pooja room behind folding shutters.',
      'The kitchen was the one place we spent properly: a full modular run with a tall unit, soft-close hardware and a countertop deep enough for two people to work at once. Everywhere else the money went into storage and light rather than finish.',
    ],
    scope: ['Modular kitchen', 'Pooja room', 'Wardrobes', 'False ceiling'],
    specs: [
      ['Typology', 'Apartment fit-out'],
      ['Carpet area', '1,150 sq ft'],
      ['Configuration', '3 BHK'],
      ['Duration', '4 months'],
      ['Status', 'Completed 2025'],
    ],
    span: 'f',
  },
];

/* img is simply the first photograph in the folder — the card and the case
   study can never drift apart. */
export const PROJECTS = PROJECT_LIST.map((p) => {
  const gallery = projectShots(p.slug, p.shots);
  return { ...p, img: gallery[0], gallery };
});

export const PRINCIPLES = [
  { no: '01', title: 'Experience', body: '14+ years of architectural and interior design experience.' },
  { no: '02', title: 'Craft', body: 'Attention to materials, proportions, lighting and detail.' },
  { no: '03', title: 'Visualization', body: 'Experience your project through detailed 3D drawings before construction.' },
  { no: '04', title: 'Personalization', body: "Every project is designed around the client's lifestyle and requirements." },
];

export const AWARDS = [
  'Excellence in Residential Architecture',
  'Best Interior Design Studio — Coimbatore',
  'Young Architect Recognition',
  'Modular Kitchen Design Award',
  'Sustainable Residence Citation',
  'Visualization Studio of the Year',
];

export const LOCATIONS = [
  {
    city: 'Coimbatore',
    role: 'Head Studio',
    lines: ['No. 11, Barathi Nagar,', 'Rathinapuri (PO),', 'Coimbatore – 641027,', 'Tamil Nadu, India.'],
    phone: COMPANY.phone,
    phoneHref: COMPANY.phoneHref,
    maps:
      'https://www.google.com/maps/search/?api=1&query=No.%2011%2C%20Barathi%20Nagar%2C%20Rathinapuri%2C%20Coimbatore%20641027%2C%20Tamil%20Nadu',
  },
  {
    city: 'Dindigul',
    role: 'Er. Safeeq Ahmed, BE MBA',
    lines: ['Star Construction,', 'MAK Complex,', 'Old Karur Road,', 'Dindigul – 624001.'],
    phone: COMPANY.phoneDindigul,
    phoneHref: COMPANY.phoneDindigulHref,
    maps:
      'https://www.google.com/maps/search/?api=1&query=Star%20Construction%2C%20MAK%20Complex%2C%20Old%20Karur%20Road%2C%20Dindigul%20624001',
  },
];

export const FOOTER_SERVICES = [
  'Architectural Design',
  'Interior Design',
  'Bedroom Interiors',
  'Modular Kitchen',
  'Pooja Rooms',
  'TV Units',
  '3D Drawings',
];

/* --- scroll story --------------------------------------------------------- */

export const FRAME_COUNT = 80;

/* tier is 'hd' (1920x1080), 'd' (1280x720) or 'm' (960x540) — see
   pickFrameTier() in lib/sequence.js */
export const frameSrc = (i, tier = 'd') =>
  asset(`frames/${tier}/f-${String(i).padStart(3, '0')}.webp`);

/* Each chapter is [enterAt, exitAt] in sequence progress (0 → 1).
   The gaps between them are wide enough for one chapter to fade out
   completely before the next fades in — overlapping statements are
   unreadable. */
export const CHAPTERS = [
  {
    at: [0.0, 0.16],
    title: ['Every space', 'starts with an idea.'],
    sub: 'From an empty room to a thoughtfully designed living experience.',
  },
  {
    at: [0.22, 0.36],
    title: ['Define the space.'],
    sub: 'Architecture creates the foundation.',
  },
  {
    at: [0.42, 0.56],
    title: ['Design for living.'],
    sub: 'Every element has a purpose.',
  },
  {
    at: [0.62, 0.76],
    title: ['Details create', 'the experience.'],
    sub: 'Materials, lighting and form come together.',
  },
  {
    at: [0.82, 1.0],
    title: ['From empty', 'to extraordinary.'],
    sub: 'Designed by Konst Design.',
  },
];
