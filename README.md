# Webine website

Webine's website currently runs as a local React application. It includes the Home, Works, Contact, Admin and preview foundations without any OpenAI Sites or Cloudflare deployment configuration.

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

Stages 0 and 1 establish the implementation inputs, application routes, error handling and local development foundation. Design tokens, the final site shell, particles, CMS and forms belong to later stages.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/decision-log.md` for implementation decisions.
