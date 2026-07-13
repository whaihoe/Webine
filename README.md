# Webine website

Webine's website runs as a local React application. Stage 2 now includes the responsive public shell, design tokens, accessible navigation, light and dark themes, an Admin frame and central configuration for later signature effects.

## Run locally

The project supports Node.js 18 or newer.

```bash
cd /Users/whaihoe/Documents/Work/Webine
npm install
npm run dev
```

Open the local address shown in the terminal, normally `http://127.0.0.1:5173`.

## Available routes

- `/`, Home foundation
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

Stages 0 to 2 establish the implementation inputs, local application, design tokens and responsive site shell. Particles, smooth scrolling, live page transitions, the CMS and the enquiry pipeline remain disabled or reserved for their dedicated stages.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md` and `docs/motion-scenes.md` for the Stage 2 system. Important changes are recorded in `docs/decision-log.md`.
