# Webine website

Webine's website runs as a React application prepared for a Vercel-first launch. The Home route implements the complete six-scene narrative through a persistent GPU particle system on tablet and desktop, with lighter section-owned 2D particle canvases on phones. The story moves from the breathing hero formation through reach, selected work, the quiet interlude, the process timeline and the closing CTA. Cloudflare remains a possible later hosting migration, not the current deployment runtime.

## Run locally

The project requires Node.js 22.12 or newer.

```bash
nvm use
npm install
npm run dev
```

Open the local address shown in the terminal, normally `http://127.0.0.1:5173`. The Vite development server also runs the protected Admin API handlers locally, so `/admin` works from the same command. The ignored `.env.development` on this machine contains only a local identity and is rejected automatically on Vercel and in production. Set `ADMIN_DEV_BYPASS=false` in `.env.local` when testing Clerk locally.

## Available routes

- `/`, complete Home experience with CMS-selected work
- `/works`, published project index, filters and case studies
- `/works/:projectSlug`, shareable case-study state inside Works
- `/contact`, working project enquiry form and privacy notice
- `/admin`, protected owner CMS with collections, media, enquiries and publishing
- `/preview?collection=:key&id=:id`, protected draft preview

Admin data APIs use Clerk authentication with a single approved owner ID. The ignored local bypass is development-only. Production always requires the approved Clerk login.

Stages 8 to 20 now provide the schema engine, protected Admin, collection builder, generated forms, media library, complete Project workflow, published public API, Works experience, CMS-backed homepage runway, process timeline, working enquiry pipeline and completed closing action. Project lists retain draft, published and archived records, with quick publishing, safe archiving and audited permanent deletion. Local data uses SQLite through libSQL, while Vercel Preview and Production use Turso. Local media uses ignored application data. Production media uses direct Vercel Blob upload and requires `BLOB_READ_WRITE_TOKEN`.

## Vercel-first environment

Copy `.env.example` to a local `.env` and provide Clerk keys when testing the real sign-in flow. `ADMIN_DEV_BYPASS=true` is accepted only outside Vercel and outside production. Run `npm run db:migrate` to create the local database or apply the same reviewable migrations to a configured Turso database. The ordinary `npm run dev` command runs the same grouped API handlers through a development-only Vite adapter. Vercel Preview and Production use seven consolidated Function entrypoints under `/api`, with rewrites preserving the existing Admin, Projects and media URLs.

Vercel should receive the Clerk, owner allowlist, Turso, Vercel Blob and enquiry-security values listed in `.env.example`. Resend email notification and the alternative webhook are optional, while accepted enquiries are always stored first. Real values must never be committed. `vercel.json` preserves React Router deep links while leaving `/api/*` to Vercel Functions.

The complete environment scope and GitHub boundary are documented in `docs/vercel-deployment.md`.

## Checks

- `npm run lint`, zero-warning quality check across client, server, API handlers, development adapters, scripts, tests and Vite configuration
- `npm run build`, local production build
- `npm run typecheck:server`, Vercel Function and server-module type check
- `npm run db:migrate`, local SQLite or configured Turso migration
- `npm run db:backup`, consistent local SQLite backup
- `npm run db:restore -- /absolute/path/backup.sqlite --confirm`, guarded local restore with an automatic safety copy
- `npm test`, build and foundation checks

## Current scope

Stages 0 to 3 establish the implementation inputs, local application, design tokens, responsive site shell and particle foundation. A later Home-first pass extends that foundation through the complete public narrative. Its first-load timeline gathers a seeded scattered field into the volumetric Webine logo. Hero, reach, interlude and closing each own a responsive section point plus independent formation and dispersion ranges. On tablet and desktop, one persistent GPU geometry passes through the work interval, live process inlet and dispersed outlet before the closing point forms the colony planet. Colour cycling, fine-pointer response, floating and slow rotation remain shared properties. Phones preserve the same story with 480-point absolute 2D canvases owned by each section, preventing a fixed WebGL object from jittering while touch scrolling.

The hero remains held for its first viewport of scroll so Section 2 rises over it as a rounded light surface. Desktop and fine-pointer devices use a GSAP ScrollTrigger pin. Phones and coarse-touch devices use native CSS sticky inside a bounded hero-to-reach wrapper, which avoids the real-iPhone pinning failure while keeping the same visual cover. Hero text and controls sit above the particles, while particles remain above the background. Lenis adds restrained weight to wheel scrolling, but touch keeps native momentum.

Selected Work begins up to 120 px above its resting composition and settles downward through an isolated inner motion layer before the stage pins. It then maps vertical scroll to horizontal movement on desktop, tablet and mobile. The Section 2 field starts fading during its own dispersal and is gone before horizontal work. A reduced-density field fades back as the final chapter 04 card expands, while card-owned progress forms the orbit on its real point before that point enters the viewport. Once expansion completes, the generated runway pin layer drops behind the real Section 4 content so the text takes over without obstruction. Exact zero endpoints restore earlier forms on reverse scroll.

See `docs/implementation-inputs.md` for available and missing inputs. See `docs/design-system.md`, `docs/component-inventory.md`, `docs/motion-scenes.md`, `docs/particle-architecture.md` and `docs/cms-schema.md` for the current system. Content editors should use `docs/content-entry-guide.md`. Release readiness is tracked honestly in `docs/verification-matrix.md` and `docs/launch-checklist.md`. Important changes are recorded in `docs/decision-log.md`.
