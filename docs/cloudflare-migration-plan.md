# Cloudflare migration plan and phase acceptance criteria

## Status and operating rule

This is the approved implementation and acceptance baseline for Cloudflare R2, Workers and static asset hosting. The repository now contains `worker.ts`, `wrangler.toml`, R2 media uploads, R2 public-content snapshots, a Vercel Blob to R2 migration script and rendition tooling. Vercel remains historical rollback evidence only until the agreed observation period closes.

Each phase ends with a written acceptance record containing the reviewed commit, environment, owner, test evidence, open risks and rollback decision. A phase may not be marked complete because its interface has merely been designed.

## Phase 0, baseline and change control

**Purpose.** Capture a recoverable Vercel baseline before replacing hosting or media services.

**Work.** Inventory every public route, Worker route, redirect, header, CMS collection, R2 object, Vercel Blob object and environment-variable name. Back up the target Turso database and export the Vercel Blob inventory with object path, content type, size, public URL and matching CMS asset ID. Freeze production content changes during the final data-copy and DNS windows. Preserve the Vercel release record until the observation window closes.

**Success criteria.**

- The baseline release is identified by commit and production URL, with a working Preview deployment.
- A database backup is readable in a non-production restore test.
- The Blob inventory reconciles to the active media records, including unreferenced but non-archived objects.
- Existing Cloudflare routes, redirects, headers, enquiry delivery and Admin access have a recorded smoke-test result.
- A named owner can execute the documented DNS and deployment rollback while Vercel remains available as historical fallback.

## Phase 1, Project story composer

**Purpose.** Make the Project editor a practical composer for long-form case studies while keeping current published stories valid.

**Work.** Keep Challenge, Approach and Outcome as required canonical Project copy while representing their positions inside the same ordered story composer as custom text, image, video and bento blocks. Preserve existing `content_blocks` data through the versioned normalisation migration.

**Success criteria.**

- An editor can add, reorder, remove and preview custom blocks. Canonical Challenge, Approach and Outcome entries can move but cannot be duplicated or removed.
- Save, preview, publish, republish, unpublish and archive preserve the exact stored order.
- Invalid block data gives field-level guidance and cannot publish.
- Public and protected-preview renderers produce the same block sequence and no unsupported block silently disappears.
- Keyboard-only operation, visible focus, screen-reader labels and a 390 px layout have recorded QA evidence.

## Phase 2, divider controls

**Purpose.** Give editors restrained control of story pacing without turning layout controls into arbitrary styling.

**Work.** Give every story entry one bounded `showDivider` control. Its default is on. Turning it off removes both the bottom rule and that entry's bottom padding in Admin preview and public rendering.

**Success criteria.**

- The divider option is a boolean, not free-form CSS or raw HTML.
- The composer preview and public case study render the same divider and spacing choice.
- The setting follows its story entry through reordering and draft reloads and cannot create page-level overflow.
- The divider remains presentational and introduces no meaningless screen-reader text.
- Desktop, tablet and phone visual QA confirms consistent spacing around adjacent text, images and video.

## Phase 3, asset names and renditions

**Purpose.** Replace provider-shaped media assumptions with a durable asset identity and predictable delivery variants.

**Work.** Separate an asset's immutable ID from its original filename, display name, R2 storage key and public rendition URLs. The implemented rendition roles are `landing`, `works` and `case-study`. Preserve source metadata, including content type, width, height and processing status. Use `scripts/process-media-renditions.mjs` to create deterministic outputs, then have the provider adapter record final URLs and promote the source to ready.

**Success criteria.**

- User-facing names can change without changing the asset ID or breaking existing CMS references.
- Storage keys use the documented R2 naming convention and never expose local paths or credentials.
- Each required `landing`, `works` and `case-study` rendition is generated once, traceable to its source and retrievable from the R2 media custom domain.
- Failed or incomplete rendition work is visible to an editor and cannot be selected as a published required role.
- Image, GIF and MP4 policies remain explicit. Animated GIF preservation and video handling are verified instead of assumed.
- A sample of current production assets is compared pixel-for-pixel where appropriate, with no broken public URLs.

## Phase 4, hover playback

**Purpose.** Make hover media intentional across image and video cards without degrading touch, keyboard or reduced-motion use.

**Work.** Define separate image-swap and video-preview behaviour. Require desktop fine-pointer capability before hover playback. Set poster, muted, loop, preload, play, pause, error and fallback behaviour. Treat keyboard focus and `prefers-reduced-motion` as first-class states, while touch continues to show the static primary media.

**Success criteria.**

- Hover playback never loads or starts solely on a coarse-touch device.
- A fine-pointer card plays only its assigned preview, pauses on pointer leave, offscreen exit, tab hiding and route teardown, then releases event listeners.
- Keyboard focus communicates the card action without surprise autoplay. Reduced-motion has a documented still-image or non-playing alternative.
- Missing, unsupported or failed preview media falls back cleanly to cover media with no layout shift or console error.
- Tests and browser QA cover image hover, MP4 hover, touch, keyboard, reduced motion and page navigation.

## Phase 5, R2 migration

**Purpose.** Copy production media to R2 without breaking CMS references, uploads or archival protection.

**Work.** Use `scripts/migrate-vercel-blob-to-r2.mjs` for a resumable, one-way copy. It records source URL, byte size and SHA-256 in a private local state file. Run its non-mutating `--dry-run` first, then apply the copy in batches. Do not delete Vercel Blob objects during this phase.

**Success criteria.**

- The adapter supports short-lived upload URLs, metadata lookup, delivery and safe deletion semantics for R2, with no Vercel-only imports on the Cloudflare path.
- A dry run reports planned copies, collisions, missing sources and database changes without mutating production.
- The applied migration copies every active referenced asset and verifies count, byte size, checksum where available, MIME type and public delivery.
- Existing Project cover, hover, story, social and video references still resolve after the read-path switch.
- Archive protection remains reference-aware. A failed object deletion leaves the asset record active and retryable.
- Vercel Blob remains intact until the post-cutover retention period and recovery review have passed.

## Phase 6, Worker and static-hosting implementation

**Purpose.** Move dynamic APIs to a Cloudflare Worker and immutable frontend files to static asset hosting while preserving route behaviour.

**Work.** Maintain the committed Worker entrypoint, static-asset configuration, R2 bucket bindings, rate-limit bindings and compatible headers. `worker.ts` owns `/api/admin/*` and `/api/enquiries`, while static assets own public pages and the public R2 content domain owns snapshots. Keep the compatibility date and Wrangler bindings reviewed with every runtime change.

**Success criteria.**

- Every documented public page, snapshot route, sitemap, Admin route and preview route has a tested Worker/static equivalent.
- Direct deep links and refreshes serve the right static document or API response, not an accidental SPA fallback.
- Private routes return `Cache-Control: private, no-store` and noindex headers. Public API cache headers use Cloudflare-compatible semantics.
- Production secrets are bound through Worker secrets, never `VITE_` variables, committed configuration or browser output.
- A deployed staging Worker passes Admin, public Projects, sitemap, enquiry and media smoke tests against non-production services.
- The deployment configuration, route ownership and known runtime differences are documented before a production DNS change.

## Phase 7, caching and rate limiting

**Purpose.** Make fast public delivery compatible with fresh published content and protected state-changing routes.

**Work.** Keep an explicit cache matrix for HTML, static hashed assets, R2 media, public snapshots, sitemap, Admin, preview and enquiries. `worker.ts` protects Admin and enquiries with Worker rate limiters, currently 120 requests per 60 seconds per IP for Admin and 12 per 60 seconds per IP for enquiries. Version R2 snapshots on publish and use immutable rendition URLs or a documented purge after media changes.

**Success criteria.**

- Immutable hashed build assets and immutable rendition URLs receive long-lived cache headers. Mutable HTML and public CMS reads have bounded TTL and documented purge behaviour.
- `/admin*`, `/preview*`, `/api/admin*` and `/api/enquiries` bypass cache and return private no-store responses.
- Public Projects, site settings and sitemap responses demonstrate the expected HIT, MISS and expiry behaviour without serving stale unpublished content.
- POST `/api/enquiries` and `/api/admin*` Worker rate limits are tested with normal editor and contact flows. Any additional Cloudflare WAF read limits are tuned from observed traffic, not guessed permanently.
- Abuse controls produce a clear event trail and a single-rule rollback does not take the public site offline.

## Phase 8, production cutover and Vercel retirement

**Purpose.** Move the canonical domain to Cloudflare only after the new runtime is proven, then retire Vercel deliberately.

**Work.** Deploy the configured Preview Worker first, complete the manual cutover checklist, make DNS changes within a monitored window and retain the Vercel deployment record and Blob inventory as rollback history. Only after the retention window and explicit approval may the team remove Vercel access or Blob data.

**Success criteria.**

- Canonical `www` and apex redirect, TLS, Clerk authorised origins, Turnstile hostname validation, sitemap and robots all work on the Cloudflare production domain.
- End-to-end smoke tests pass for public browsing, Project media, enquiry creation and owner-only Admin editing/uploading.
- Error rate, Worker logs, Turso activity, R2 delivery, Turnstile verification and Resend delivery are monitored throughout the agreed observation window.
- Rollback to Vercel is rehearsed or executable from the documented DNS and deployment state.
- Vercel retirement has written approval after the observation window, verified database backups and confirmed R2 inventory. No Vercel service is deleted during cutover.

## Phase 9, final QA and operational handover

**Purpose.** Accept the Cloudflare deployment as the normal production platform.

**Work.** Run the full automated suite, release build, migration verification, security checks, visual matrix, accessibility scan and physical-device pass. Update operating documentation to reflect the live provider rather than the historic Vercel setup.

**Success criteria.**

- Lint, build, server type checks and automated tests pass from the release commit.
- Desktop, tablet and phone QA cover public routes, story composer output, dividers, hover playback, Admin, preview and Contact with no critical regressions.
- A production performance and accessibility record includes LCP, INP, CLS, keyboard flow, 200% zoom and reduced-motion checks.
- Backup, incident response, cache purge, rate-limit rollback and Vercel fallback procedures are owned and tested.
- The final architecture, environment-variable names, dashboards and retirement date are documented accurately. Historic Vercel documentation is clearly labelled as fallback or archived.

## Gate summary

The dependency order is intentional: composer and media contracts must settle before R2 copying, the R2 adapter must work before Worker hosting, and the Worker must be deployed in a non-production environment before cache policy or DNS cutover. Vercel retirement is the final operational decision, not a development milestone.
