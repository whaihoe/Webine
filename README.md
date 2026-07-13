# Webine website

Webine's website runs as a local React application. Stage 3 adds the lazy persistent particle architecture, normalised story progress, poster fallback and restrained desktop smooth scrolling to the responsive Stage 2 shell.

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

Stages 0 to 3 establish the implementation inputs, local application, design tokens, responsive site shell and persistent particle foundation. The Home route now lazy-loads one reduced-density mobile or desktop particle geometry and morphs it between the scattered field and folded Webine targets. Desktop smooth scrolling is enabled for fine-pointer layouts while mobile remains native.

The current logo composition is the loading and failure fallback. Stage 4 will replace it with the approved desktop and mobile particle poster while keeping the same fallback component. Live page transitions, the Signal Grid response, the CMS and the enquiry pipeline remain disabled or reserved for their dedicated stages.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md`, `docs/motion-scenes.md` and `docs/particle-architecture.md` for the current system. Important changes are recorded in `docs/decision-log.md`.
