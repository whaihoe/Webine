# Cloudflare R2, Worker cutover and rollback runbook

## Scope

This is the live manual procedure for the committed Cloudflare implementation: `worker.ts`, `wrangler.toml`, R2 media uploads, R2 content snapshots and `scripts/migrate-vercel-blob-to-r2.mjs`. It uses names only, never secret values. Run commands from the project root and keep `.env`, shell history, migration state and provider exports out of Git.

The Worker owns `/api/admin/*` and `/api/enquiries`. Static assets own public pages and `sitemap.xml`. `VITE_CONTENT_BASE_URL` points browsers to the R2 public-content domain for the atomic `/content/public.json` snapshot. The media custom domain is supplied by `R2_PUBLIC_BASE_URL`.

## 1. Preflight and release window

1. Freeze production publishing and uploads for the copy and DNS window.
2. Record the reviewed commit, existing DNS records, Vercel deployment URL, Vercel Blob inventory and Cloudflare rule IDs.
3. Back up Turso and prove a non-production restore.
4. Install the reviewed dependency set and run the release checks:

   ```bash
   npm ci
   npm run build:cloudflare
   npm run verify
   ```

5. Keep Vercel and its Blob objects unchanged until the observation window ends and retirement has written approval.

## 2. Create R2 resources and Worker bindings

`wrangler.toml` requires the following bucket names. Create them once in the intended Cloudflare account:

```bash
npx wrangler r2 bucket create webine-media
npx wrangler r2 bucket create webine-media-preview
npx wrangler r2 bucket create webine-content
npx wrangler r2 bucket create webine-content-preview
```

The Worker binds `MEDIA_BUCKET` to the media bucket and `CONTENT_BUCKET` to the content bucket. Do not create variables named `MEDIA_BUCKET` or `CONTENT_BUCKET`: those are R2 bindings declared in `wrangler.toml`, not secrets.

In the Cloudflare dashboard, attach the media custom domain used by `R2_PUBLIC_BASE_URL` and the content custom domain used by `VITE_CONTENT_BASE_URL`. Both must be proxied and use HTTPS. The current implementation delivers media and snapshots from these R2 custom domains. Do not use a custom domain for presigned uploads: the browser uploads to the bucket-specific R2 S3 API endpoint. Set `R2_S3_ENDPOINT` to `https://<account-id>.r2.cloudflarestorage.com/<bucket-name>`, including the bucket name in the path. Production and Preview must use their own media bucket endpoint.

## 3. Configure R2 CORS

Browser uploads use a short-lived presigned `PUT` URL and send `Content-Type`. Create one policy per media bucket. Each policy must allow only its matching origin. Do not allow `*`, credentials or read methods.

```json
{
  "rules": [
    {
      "allowed": {
        "origins": ["https://www.madebywebine.com"],
        "methods": ["PUT"],
        "headers": ["Content-Type"]
      },
      "exposeHeaders": ["ETag"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

Save this production policy outside the repository as `r2-cors.production.json`. Create the Preview equivalent with only `https://preview.madebywebine.com` as its origin and save it as `r2-cors.preview.json`, then run:

```bash
npx wrangler r2 bucket cors set webine-media --file r2-cors.production.json
npx wrangler r2 bucket cors set webine-media-preview --file r2-cors.preview.json
```

The website fetches JSON from the separate content custom domain, so configure the content bucket to allow `GET` and `HEAD` from its exact matching website origin. Do not use `*` and do not enable credentials.

## 4. Configure build variables and Worker secrets

`VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SITE_URL`, `VITE_TURNSTILE_SITE_KEY`, `VITE_CONTENT_BASE_URL` and `VITE_PUBLIC_CONTACT_EMAIL` are public Vite build variables. Supply them only to the secure build environment before `npm run build:cloudflare`; they are compiled into browser assets, so `wrangler secret put` after the build cannot change them. `wrangler.toml` supplies the Worker runtime values for `VITE_SITE_URL`, `TURNSTILE_HOSTNAMES` and `TURNSTILE_EXPECTED_ACTION`. The matching Turnstile secret is runtime-only and must be stored as the Worker secret `TURNSTILE_SECRET`.

Set each secret interactively. The command prompts for a value and therefore does not put it in the command line:

```bash
npx wrangler secret put CLERK_PUBLISHABLE_KEY
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put ADMIN_USER_ID
npx wrangler secret put CLERK_AUTHORIZED_PARTIES
npx wrangler secret put TURSO_DATABASE_URL
npx wrangler secret put TURSO_AUTH_TOKEN
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_S3_ENDPOINT
npx wrangler secret put R2_PUBLIC_BASE_URL
npx wrangler secret put ENQUIRY_HASH_SECRET
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ENQUIRY_NOTIFICATION_EMAIL
npx wrangler secret put ENQUIRY_NOTIFICATION_FROM_EMAIL
npx wrangler secret put ENQUIRY_NOTIFICATION_WEBHOOK_URL
npx wrangler secret put ENQUIRY_NOTIFICATION_TOKEN
```

Repeat server-only variables needed by Preview with `--env preview`, for example:

```bash
npx wrangler secret put TURSO_DATABASE_URL --env preview
```

`RESEND_API_KEY`, `ENQUIRY_NOTIFICATION_EMAIL` and `ENQUIRY_NOTIFICATION_FROM_EMAIL` are optional as a group. The webhook variables are an optional alternative. Do not set `BLOB_READ_WRITE_TOKEN`; it belongs only to the historical Vercel deployment. Do not put private values in `VITE_` names.

Before deployment, ensure `CLERK_AUTHORIZED_PARTIES` and the committed `TURNSTILE_HOSTNAMES` values include the exact Preview and Production origins. `TURNSTILE_SECRET` must be the secret paired with site key `0x4AAAAAAEEf_0NxPkZ_uzj1`; do not reuse a secret from an older widget. Keep the historic Vercel origin only for the approved rollback period.

## 5. Deploy and verify Preview

Cloudflare Wrangler environments do not inherit bindings. The committed Preview configuration therefore explicitly binds `MEDIA_BUCKET`, `CONTENT_BUCKET`, `ADMIN_RATE_LIMITER` and `ENQUIRY_RATE_LIMITER` to Preview resources. Verify those names before deployment.

Deploy the configured Preview environment:

```bash
npm run deploy:cloudflare -- --env preview
```

For the first deployment only, the content bucket has no snapshot yet. Export the current published Turso content, review the generated public-only files and upload them to the Preview content bucket:

```bash
npm run export:public-snapshot
npx wrangler r2 object put webine-content-preview/content/public.json --file .data/public-snapshot/public.json --content-type application/json --cache-control "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" --remote
npx wrangler r2 object put webine-content-preview/content/current.json --file .data/public-snapshot/current.json --content-type application/json --cache-control "public, max-age=60, s-maxage=300, stale-while-revalidate=3600" --remote
```

Read the version from `.data/public-snapshot/manifest.json` and upload the same `public.json` to `content/versions/<version>/public.json`. Confirm `/content/public.json` exists on the Preview content domain, then run the normal Preview deployment. After the Worker is reachable, authenticate as the owner and call `POST /api/admin/content/refresh` once to prove normal snapshot publishing. The normal Cloudflare build fails closed when the published snapshot cannot be read, which prevents silently deploying a sitemap without current Project URLs.

In **Workers & Pages → webine-preview → Settings → Domains & Routes**, attach the Preview hostname to the deployed Worker. `workers_dev = false`, so no public workers.dev address is created. Verify the actual Preview hostname, then test:

1. Public Home, Works, one case study, Contact, `robots.txt` and `sitemap.xml`.
2. `https://<content-domain>/content/public.json` returns one published snapshot containing both Projects and Site Settings.
3. Owner sign-in, draft preview, Project publish, then updated snapshot delivery.
4. One JPEG, GIF and MP4 upload. Each begins processing, has its bytes verified in R2, receives required renditions and becomes ready before it can publish.
5. A Contact submission reaches Turso and the optional configured notification service.
6. Repeated Admin and enquiry requests return the expected 429 behaviour from the Worker rate limiters without blocking ordinary flows.

The committed limiter baseline is 120 requests per 60 seconds per IP for Admin and 12 per 60 seconds per IP for enquiries. Any Cloudflare WAF rate-limit rule is additional protection and must be tuned separately.

## 6. Database and Vercel Blob migration

### Dry-run

Use a disposable Turso database to apply schema migrations first:

```bash
npm run db:migrate
```

With the required private migration environment loaded, run the non-mutating Blob copy plan:

```bash
node scripts/migrate-vercel-blob-to-r2.mjs --dry-run
```

The migration script requires `VERCEL_BLOB_READ_WRITE_TOKEN`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_S3_ENDPOINT`. It never deletes the Vercel source objects. Review the printed object paths and SHA-256 values before applying.

### Apply

Take a fresh production Turso backup, confirm the production environment is loaded, then apply all pending SQL migrations:

```bash
npm run db:migrate
```

Run the resumable copy without `--dry-run`:

```bash
node scripts/migrate-vercel-blob-to-r2.mjs
```

The default private state file is `.data/vercel-blob-r2-migration.json`. Do not commit it. Use `WEBINE_MEDIA_MIGRATION_STATE` only when an approved secure location is required.

### Verify

1. In the Turso console, run `SELECT name FROM schema_migrations ORDER BY name;` and compare it with every `migrations/*.sql` filename.
2. Compare the migration state object's path, `byteSize` and `sha256` against the Vercel Blob inventory and R2 object metadata.
3. Confirm current media records use provider `r2` and delivery URLs under `R2_PUBLIC_BASE_URL`.
4. Browse published cover, hover, story, social and video media from the Preview Worker. Confirm archive protection blocks referenced assets and a failed R2 delete leaves an asset retryable.

## 7. Production cutover

1. Before the first production deployment, repeat the reviewed snapshot export and upload for `webine-content`, including `content/public.json`, `content/current.json` and the versioned `content/versions/<version>/public.json`. Confirm the production content custom domain returns the snapshot.
2. Deploy the reviewed release to production:

   ```bash
   npm run deploy:cloudflare
   ```

3. Deploy the isolated apex redirect Worker:

   ```bash
   npm run deploy:cloudflare:apex
   ```

4. Confirm `www.madebywebine.com` is attached only to `webine` and `madebywebine.com` is attached only to `webine-apex-redirect`. The redirect must return 308 while preserving the original path and query. Do not add a wildcard Worker route, because it would intercept the R2 media and content custom domains.
5. Confirm the R2 media and content custom domains are proxied, HTTPS-ready and match `R2_PUBLIC_BASE_URL` and `VITE_CONTENT_BASE_URL` exactly.
6. In incognito and in the approved Clerk session, test `/`, `/works`, one `/works/:projectSlug`, `/contact`, `/admin`, `/preview`, `/robots.txt`, `/sitemap.xml`, public media, content snapshots, an upload and an enquiry.
7. Monitor Worker logs, Security Events, R2 delivery, Turso, Turnstile and Resend through the agreed observation period. Keep the Vercel project and Blob inventory intact.

## 8. Cache and rate-limit operations

1. Keep `/admin*`, `/preview*`, `/api/admin*` and `/api/enquiries` private and no-store. Confirm response headers after every Worker release.
2. Keep `/content/public.json` short-lived. Its versioned path and hashed static assets may be immutable for one year.
3. Because `sitemap.xml` is generated as a static asset, run and deploy a reviewed production build after publishing a new Project or changing a Project slug. Confirm the deployed sitemap contains the current public Project URLs.
4. If a published snapshot is stale, use the protected `POST /api/admin/content/refresh` action. Purge only the affected content-domain URL when a manual cache purge is necessary. Do not use broad Cache Everything rules for `/api/*`.
5. Keep the Worker rate limiter as the first defence. Add WAF rules only after recording the exact expression, plan behaviour, rule ID, normal-flow test and single-rule rollback action.

## 9. Rollback

1. Stop publishing and uploads. Record the Worker deployment ID, affected route, time and Cloudflare event IDs.
2. Disable only the faulty Worker route, Cache Rule or WAF rule where that restores service. Purge only affected paths.
3. If a full deployment rollback is needed, use the prior deployment shown by Wrangler:

   ```bash
   npx wrangler deployments list
   npx wrangler rollback
   ```

   Select the known-good deployment only after checking its ID and release commit.

4. If Cloudflare cannot be restored in the agreed recovery time, repoint only the website DNS records to the recorded Vercel deployment. Preserve mail and unrelated DNS records, and keep the Vercel origins in Clerk and Turnstile allowlists for this purpose.
5. Run public, Admin, media and enquiry smoke tests. Confirm accepted enquiries exist in Turso before reopening Contact.
6. Never delete R2 objects, Vercel Blob objects or database data as part of an incident rollback. Record cause, impact, exact actions and new acceptance evidence before another cutover.

## 10. Retire Vercel

After the approved observation period, verify backups, R2 inventory, Worker route health, custom-domain delivery and absence of Vercel-origin dependencies. Obtain explicit approval before removing Vercel DNS, secrets, Blob objects, project access or billing. Keep the Vercel documents as historical incident evidence, not live operating instructions.
