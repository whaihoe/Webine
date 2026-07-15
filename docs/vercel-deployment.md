# Webine Vercel and GitHub boundary

## Environment variables in Vercel

Add these in the Vercel project settings. Use separate Preview and Production values for databases and secrets where possible.

| Variable | Required | Scope | Purpose |
|---|---:|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Preview and Production | Public Clerk browser key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Preview and Production | Clerk server verification |
| `CLERK_SECRET_KEY` | Yes | Preview and Production | Private Clerk server key |
| `ADMIN_USER_ID` | Yes | Preview and Production | Exact Clerk user allowed into Admin |
| `CLERK_AUTHORIZED_PARTIES` | Yes | Preview and Production | Comma-separated exact website origins allowed to authenticate |
| `TURSO_DATABASE_URL` | Yes | Preview and Production | libSQL database connection |
| `TURSO_AUTH_TOKEN` | Yes | Preview and Production | Private database token |
| `BLOB_READ_WRITE_TOKEN` | Yes for uploads | Preview and Production | Added when the Vercel Blob store is connected |
| `ENQUIRY_HASH_SECRET` | Yes | Preview and Production | Long random secret used to hash rate-limit and deduplication keys |
| `ENQUIRY_NOTIFICATION_WEBHOOK_URL` | No | Preview and Production | HTTPS endpoint that receives a new-enquiry notification |
| `ENQUIRY_NOTIFICATION_TOKEN` | No | Preview and Production | Bearer token for the optional notification endpoint |
| `VITE_PUBLIC_CONTACT_EMAIL` | No | Preview and Production | Public email shown on Contact, the closing CTA and footer |

`ADMIN_DEV_BYPASS` and `ADMIN_DEV_LABEL` must not be added to Vercel. The application rejects the bypass on Vercel and in production, but keeping it out of the deployment settings avoids ambiguity.

Generate `ENQUIRY_HASH_SECRET` as at least 32 random bytes. For example, run `openssl rand -hex 32` locally, then paste the result directly into Vercel. Do not save it in the repository or Obsidian memory.

For `CLERK_AUTHORIZED_PARTIES`, include the exact public origins that should serve Admin, for example the stable Vercel project domain and the future custom domain. Preview deployments should use a stable approved alias or an environment-specific exact origin rather than accepting arbitrary origins.

When a Turso database is first connected, run the migration command against that environment before using Admin. Preview and Production should not share a database unless that is a deliberate temporary decision.

## Vercel Function topology

The deployment uses seven Vercel Function entrypoints, keeping the project below the Hobby plan function-count limit while preserving the existing browser-facing API URLs. Vercel rewrites group the dynamic routes into their owning function.

| Function | Public routes handled |
|---|---|
| `api/admin.ts` | `/api/admin/*` |
| `api/projects.ts` | `/api/projects` and `/api/projects/:slug` |
| `api/site-settings.ts` | `/api/site-settings` |
| `api/enquiries.ts` | `/api/enquiries` |
| `api/media.ts` | `/api/media/:assetId` for local media delivery |
| `api/robots.ts` | `/robots.txt` |
| `api/sitemap.ts` | `/sitemap.xml` |

Admin business logic remains in `server/` and is routed by `server/api-routes/admin.ts`; the entrypoint does not duplicate CMS, auth or media rules. The development Vite adapter maps local requests to the same seven entrypoints used by Vercel.

The repository includes automated coverage that asserts the function entrypoint count remains at or below 12 and that the rewrite targets restore the original API path before the server handler runs.

## Files to push to GitHub

Push the complete application source and its reviewable operating contract:

- `api/`, `dev/`, `migrations/`, `scripts/`, `server/`, `src/` and `tests/`
- `public/` assets that are intentionally part of the website
- `docs/`, including the design, CMS and deployment decisions
- `.env.example`, which contains names and safe placeholders only
- `.gitignore`, `package.json`, `package-lock.json`, TypeScript, Vite, Tailwind, PostCSS and ESLint configuration
- `vercel.json`, `README.md` and other non-secret project documentation

Do not push:

- `.env`, `.env.development`, `.env.local` or any other real environment file
- `.data/`, local databases or locally uploaded media
- `.vercel/` project metadata
- `node_modules/`, `dist/`, `.test-build/`, coverage, caches or logs
- private keys, certificates, provider tokens or exported customer enquiry data

The repository should contain migrations and example configuration, never the live database or credentials.
