# Webine website

Webine's website runs as a local React application. The Home route implements the complete six-scene narrative through a persistent GPU particle system on tablet and desktop, with lighter section-owned 2D particle canvases on phones. The story moves from the breathing hero formation through reach, selected work, the quiet interlude, the process timeline and the closing CTA.

## Run locally

The project supports Node.js 18 or newer.

```bash
cd /Users/whaihoe/Documents/Work/Webine
npm install
npm run dev
```

Open the local address shown in the terminal, normally `http://127.0.0.1:5173`.

## Available routes

- `/`, complete Home experience with provisional project content
- `/works`, Works foundation
- `/contact`, Contact foundation
- `/admin`, reserved Admin foundation
- `/preview`, reserved content preview

Admin and preview are route placeholders only. They are not protected until the later authentication and CMS stages are implemented.

## Checks

- `npm run lint`, code-quality check
- `npm run build`, local production build
- `npm test`, build and foundation checks

## Current scope

Stages 0 to 3 establish the implementation inputs, local application, design tokens, responsive site shell and particle foundation. A later Home-first pass extends that foundation through the complete public narrative. Its first-load timeline gathers a seeded scattered field into the volumetric Webine logo. Hero, reach, interlude and closing each own a responsive section point plus independent formation and dispersion ranges. On tablet and desktop, one persistent GPU geometry passes through the work interval, live process inlet and dispersed outlet before the closing point forms the colony planet. Colour cycling, fine-pointer response, floating and slow rotation remain shared properties. Phones preserve the same story with 480-point absolute 2D canvases owned by each section, preventing a fixed WebGL object from jittering while touch scrolling.

The hero remains held for its first viewport of scroll so Section 2 rises over it as a rounded light surface. Desktop and fine-pointer devices use a GSAP ScrollTrigger pin. Phones and coarse-touch devices use native CSS sticky inside a bounded hero-to-reach wrapper, which avoids the real-iPhone pinning failure while keeping the same visual cover. Hero text and controls sit above the particles, while particles remain above the background. Lenis adds restrained weight to wheel scrolling, but touch keeps native momentum.

Selected Work begins up to 120 px above its resting composition and settles downward through an isolated inner motion layer before the stage pins. It then maps vertical scroll to horizontal movement on desktop, tablet and mobile. The Section 2 field starts fading during its own dispersal and is gone before horizontal work. A reduced-density field fades back as the final chapter 04 card expands, while card-owned progress forms the orbit on its real point before that point enters the viewport. Once expansion completes, the generated runway pin layer drops behind the real Section 4 content so the text takes over without obstruction. Exact zero endpoints restore earlier forms on reverse scroll.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md`, `docs/motion-scenes.md` and `docs/particle-architecture.md` for the current system. Important changes are recorded in `docs/decision-log.md`.
