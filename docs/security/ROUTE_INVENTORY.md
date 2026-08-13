# Webine security route inventory

This inventory reflects the Cloudflare Worker and R2 deployment. Recheck it whenever a Worker route, static asset, R2 binding, external service or cache policy changes. Public Project and Site Settings reads use R2 content snapshots, not a Turso-backed public API request.

| Route | Methods | Access | Body or query contract | Paid or sensitive work | Cache |
|---|---|---|---|---|---|
| `/content/public.json` | GET, HEAD | Public | No query | Atomic R2 snapshot containing published Projects and Site Settings, written only by a successful publish | Browser 60 s, CDN 300 s plus SWR |
| `/content/versions/:version/public.json` | GET, HEAD | Public | Immutable published version path | R2 immutable snapshot read | One year, immutable |
| `/works/:projectSlug`, `/sitemap.xml` and `/robots.txt` | GET, HEAD through Static Assets | Public | Static generated documents | No Worker invocation or database work on ordinary reads | Hashed assets immutable; documents follow their generated cache policy |
| `/api/enquiries` | POST | Public write | JSON only, 32 KB declared and streamed maximum, strict fields, honeypot then Turnstile | Siteverify, HMAC rate-limit writes, consent read, deduplication, enquiry write and optional notification | Private, no-store |
| `/api/admin/session` | GET | Clerk owner | Plausible Clerk carrier required before Clerk | Clerk only | Private, no-store |
| `/api/admin/dashboard` | GET | Clerk owner | No body | Clerk and Turso | Private, no-store |
| `/api/admin/collections` | GET, POST | Clerk owner | Admin JSON maximum 256 KB | Clerk and Turso | Private, no-store |
| `/api/admin/collections/:key` | GET, PATCH | Clerk owner | Valid collection key; Admin JSON maximum 256 KB | Clerk and Turso | Private, no-store |
| `/api/admin/collections/:key/items` | GET, POST | Clerk owner | Valid collection key; Admin JSON maximum 256 KB | Clerk and Turso | Private, no-store |
| `/api/admin/collections/:key/items/:id` | GET, PATCH, DELETE | Clerk owner | Bounded key and ID; Admin JSON maximum 256 KB | Clerk and Turso | Private, no-store |
| `/api/admin/collections/:key/items/:id/status` | POST | Clerk owner | Bounded key and ID; Admin JSON maximum 256 KB | Clerk and Turso | Private, no-store |
| `/api/admin/preview` and `/api/admin/preview/:key/:id` | GET | Clerk owner | Strict route shapes and bounded identifiers | Clerk and Turso | Private, no-store |
| `/api/admin/enquiries` | GET | Clerk owner | No body | Clerk and Turso | Private, no-store |
| `/api/admin/enquiries/:id/retry` | POST | Clerk owner | Bounded ID; notification lock prevents concurrent retry | Clerk, Turso and one bounded notification attempt | Private, no-store |
| `/api/admin/media` | GET | Clerk owner | No body | Clerk and Turso | Private, no-store |
| `/api/admin/media/:id` | PATCH, DELETE | Clerk owner | Bounded ID; Admin JSON maximum 256 KB | Clerk, Turso and R2 deletion when archiving | Private, no-store |
| `/api/admin/media/local-upload` | POST, development only | Local owner | Multipart media; 15 MB images or 30 MB MP4 | Local filesystem and Sharp metadata | Private, no-store |
| `/api/admin/media/upload-token` | POST | Clerk owner | JSON maximum 64 KB; exact controlled pathname, asset ID, MIME and size | Clerk and short-lived R2 S3 presigned PUT URL issuance | Private, no-store |
| `/api/admin/media/complete` | POST | Clerk owner | JSON maximum 64 KB; controlled pathname and asset ID | Clerk, R2 `head`, bounded R2 verification, processing-state creation and Turso | Private, no-store |
| `/api/admin/media/:assetId/renditions` | POST | Clerk owner | Exactly one landing, Works and case-study R2 key | R2 verification, rendition persistence and asset promotion | Private, no-store |
| `/api/admin/content/refresh` | POST | Clerk owner | Empty request | Regenerates versioned and current R2 public snapshots | Private, no-store |
| `/api/media/:id` | GET, HEAD, development only | Public local development | Bounded asset ID | Local Turso and ignored local file read | Local only |

All other `/api/admin` paths return 404 before Clerk. Unsupported methods are rejected before authentication, database, R2 or Sharp work and include `Allow` where applicable. `worker.ts` owns `/api/admin/*` and `/api/enquiries`; its Worker rate limiters run before those handler paths. Public content is served from the R2 content domain, so cache and public-bucket settings must be reviewed alongside Worker rules. Turnstile and application rate limiting remain required.
