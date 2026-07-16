# Webine Vercel and GitHub boundary

## Environment variables in Vercel

Add these under **Vercel project → Settings → Environment Variables**. Set the Production values first, then create separate Preview values for databases and private tokens where possible. Development values are only needed if you deliberately use `vercel dev`.

| Variable | Required | Scope | Purpose |
|---|---:|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Preview and Production | Public Clerk browser key used by React |
| `CLERK_PUBLISHABLE_KEY` | Yes | Preview and Production | The same public Clerk key, used by the server verifier |
| `CLERK_SECRET_KEY` | Yes | Preview and Production | Private Clerk server key |
| `ADMIN_USER_ID` | Yes | Preview and Production | Exact Clerk user allowed into Admin |
| `CLERK_AUTHORIZED_PARTIES` | Yes | Preview and Production | Comma-separated exact website origins allowed to authenticate |
| `TURSO_DATABASE_URL` | Yes | Preview and Production | libSQL database connection |
| `TURSO_AUTH_TOKEN` | Yes | Preview and Production | Private database token |
| `BLOB_READ_WRITE_TOKEN` | Yes for Admin uploads | Preview and Production | Added automatically when the Vercel Blob store is connected |
| `ENQUIRY_HASH_SECRET` | Yes | Preview and Production | Long random secret used to hash rate-limit and deduplication keys |
| `ENQUIRY_NOTIFICATION_WEBHOOK_URL` | No | Preview and Production | HTTPS endpoint that receives a new-enquiry notification |
| `ENQUIRY_NOTIFICATION_TOKEN` | No | Preview and Production | Bearer token for the optional notification endpoint |
| `VITE_PUBLIC_CONTACT_EMAIL` | No | Preview and Production | Public email shown on Contact, the closing CTA and footer |

`VITE_` values are compiled into the public browser bundle. Never put a password, database token or private key in a variable whose name begins with `VITE_`.

Do not add `ADMIN_DEV_BYPASS`, `ADMIN_DEV_LABEL` or `WEBINE_BACKUP_DIRECTORY` to Vercel. The application rejects the Admin bypass on Vercel and in production, but keeping local-only values out of deployment settings avoids ambiguity. Vercel supplies `VERCEL` and the production runtime supplies `NODE_ENV`, so do not add either manually.

Generate `ENQUIRY_HASH_SECRET` as at least 32 random bytes. For example, run `openssl rand -hex 32` locally, then paste the result directly into Vercel. Do not save it in the repository or Obsidian memory.

For `CLERK_AUTHORIZED_PARTIES`, include full, exact origins with `https://` and no path. Production should contain the stable Vercel project domain and the future custom domain. Preview Admin access needs a stable preview alias or one explicitly approved preview origin because the server deliberately does not accept a wildcard such as `*.vercel.app`.

When a Turso database is first connected, run the migration command against that environment before using Admin. Preview and Production should not share a database unless that is a deliberate temporary decision.

### Recommended setup order

1. Create the Clerk application, copy its publishable key into both Clerk publishable-key variables and add the secret key.
2. Sign in to Clerk once, copy your exact Clerk user ID into `ADMIN_USER_ID` and approve the Vercel origin in `CLERK_AUTHORIZED_PARTIES`.
3. Create or select the Turso database, add its URL and a newly generated auth token, then apply every file in `migrations/` in filename order.
4. Link a Vercel Blob store. Vercel should create `BLOB_READ_WRITE_TOKEN` for the selected environments.
5. Generate `ENQUIRY_HASH_SECRET`, add the optional notification values only if a webhook exists and add the public contact email if wanted.
6. Redeploy after changing variables. Test `/api/site-settings`, `/works`, `/contact` and finally `/admin` with the approved Clerk account.

If Admin says **“The workspace could not load”**, check the Vercel Function logs first. The most common causes are a missing Turso variable, migrations not applied, an incorrect Clerk secret or the current origin missing from `CLERK_AUTHORIZED_PARTIES`.

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
- `index.html`, `vercel.json`, `README.md` and other non-secret project documentation

Do not push:

- `.env`, `.env.development`, `.env.local`, `.env.production` or any other real environment file
- `.envrc`, `.direnv/`, `.dev.vars*`, `.npmrc` or any local provider credential file
- `.data/`, local databases, backups, private exports or locally uploaded media
- `.vercel/`, `.wrangler/`, `.cloudflare/`, `.netlify/` or `.clerk/` local project state
- `node_modules/`, `dist/`, `.output/`, `.test-build/`, coverage, caches or logs
- private keys, certificates, service-account files, provider tokens or exported customer enquiry data

The practical rule is to push the files shown by `git status` only after reviewing the diff. If `git status --ignored` shows a credential, database, build output or local upload under `!!`, that is expected and it must remain ignored. The repository should contain migrations and example configuration, never the live database or credentials.
