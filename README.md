# Webine website

Webine's public website, protected Admin foundation and content-preview surface. The application is designed for Cloudflare-compatible server rendering and will grow through the gated stages in the Webine website blueprint.

## Requirements

- Node.js 22.13 or newer
- npm

## Local development

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `npm install`.
3. Start the local site with `npm run dev`.

The development site uses `WEBINE_ENV=local`. Hosted preview and production deployments must set `WEBINE_ENV` to `preview` and `production` respectively. Their future data, media and secrets must remain separate.

## Available routes

- `/`, public Home foundation
- `/works`, public Works foundation
- `/contact`, public Contact foundation
- `/admin`, reserved owner-only Admin foundation
- `/preview`, reserved authenticated content preview

Admin and preview are marked not to be indexed, but they are not considered secure until Cloudflare Access and server-side identity validation are implemented in the dedicated Admin stages.

## Checks

- `npm run lint`, code-quality check
- `npm run build`, production-compatible build
- `npm test`, build and server-rendered route checks

## Current scope

Stages 0 and 1 establish the implementation inputs, application routes, environment separation, error boundaries, checks and preview deployment. Design tokens, the final site shell, particles, CMS and forms belong to later stages. Database and media dependencies will be introduced with their actual schemas and bindings instead of leaving unused starter examples in the project.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/decision-log.md` for implementation decisions.
