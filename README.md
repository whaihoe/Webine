# Webine website

Webine's website runs as a local React application. The Home route now implements the complete six-scene narrative on one lazy persistent particle system, from the breathing hero formation through reach, selected work, the quiet interlude, the process timeline and the closing CTA.

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

Stages 0 to 3 establish the implementation inputs, local application, design tokens, responsive site shell and persistent particle foundation. A later Home-first pass extends that foundation through the complete public narrative. Its first-load timeline gathers a seeded scattered field into the closed volumetric Webine mark. Hero, reach, interlude and closing each own a responsive section point plus independent formation and dispersion ranges. A form is complete when its point reaches viewport centre, remains attached to that point and disperses only after the point crosses the viewport top. The same geometry passes through the work interval, the live process inlet and the dispersed outlet before the closing point forms its rounded telephone handset. Colour cycling, hover response and floating remain shared properties. Public smooth scrolling is driven by Lenis and stays synchronized with GSAP ScrollTrigger across wheel and touch input.

The hero is pinned for its first viewport of scroll so Section 2 rises over it as a rounded light surface. Its text and controls sit above the particle canvas, while the canvas remains above the hero background. Selected Work begins up to 120 px above its resting composition and settles downward through an isolated inner motion layer before the stage pins, then maps vertical scroll to horizontal movement on desktop, tablet and mobile. The Section 2 field starts fading during its own dispersal and is gone before horizontal work. A reduced-density field fades back as the final chapter 04 card expands, while card-owned progress forms the orbit on its real point before that point enters the viewport. Once expansion completes, the generated runway pin layer drops behind the real Section 4 content so the text takes over without obstruction. Public scrolling now has modest weight on pointer and touch layouts. Tablet and mobile use separate particle point sizes of 4.2 and 3.8 respectively. Mobile also uses a 900-particle, DPR 1 and 30 FPS demand-render profile to reduce touch-device GPU work. Exact zero endpoints still restore earlier forms on reverse scroll.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md`, `docs/motion-scenes.md` and `docs/particle-architecture.md` for the current system. Important changes are recorded in `docs/decision-log.md`.
