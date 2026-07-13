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

Stages 0 to 3 establish the implementation inputs, local application, design tokens, responsive site shell and persistent particle foundation. A later Home-first pass extends that foundation through the complete public narrative. Its first-load timeline gathers a seeded scattered field into the closed volumetric Webine mark. The same geometry then moves through the reach form, a deliberately hidden work interval, the orbit, point-contact process inlet and closing-arrow target. Hero, reach and interlude release only when their section bottom reaches viewport centre. Desktop smooth scrolling is enabled for fine-pointer layouts while mobile remains native.

The selected-work runway maps vertical scroll to horizontal movement on desktop, tablet and mobile. It contains no live particles. Its final chapter 04 card stops in the viewport centre, the horizontal track locks, then that same card expands to the viewport and hands off seamlessly to the full interlude. Shared card and section copy lives in `src/content/home-interlude.ts`. Current project records remain clearly labelled internal or concept work in `src/content/featured-projects.ts` and must be replaced by the protected CMS Project collection before production content is complete. The process line, early particle intake and centred outlet use separate values from measured HTML geometry, so every state reverses cleanly. The Signal Grid is enabled only on the hero and closing CTA. Page transitions, the CMS and the enquiry pipeline remain reserved for their dedicated stages.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md`, `docs/motion-scenes.md` and `docs/particle-architecture.md` for the current system. Important changes are recorded in `docs/decision-log.md`.
