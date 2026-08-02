# Webine security route inventory

This inventory reflects the security-hardening branch. Recheck it whenever an API route, rewrite, external service or cache policy changes.

| Route | Methods | Access | Body or query contract | Paid or sensitive work | Cache |
|---|---|---|---|---|---|
| `/api/projects` | GET, HEAD | Public | No query or one `featured=true`; duplicates, unknown keys and long queries rejected | Targeted Turso list reads | Browser 60 s, CDN 300 s plus SWR |
| `/api/projects/:slug` | GET, HEAD | Public | No query; lowercase hyphenated slug, maximum 80 characters | Direct published-project Turso lookup, then only related assets and references | Browser 60 s, CDN 300 s plus SWR; errors no-store |
| `/api/site-settings` | GET, HEAD | Public | No query | One Turso settings read | Browser 60 s, CDN 300 s plus SWR |
| `/sitemap.xml` | GET, HEAD | Public | No query | Published-project Turso list read | Browser 300 s, CDN 3,600 s plus SWR |
| `/robots.txt` | GET, HEAD through static hosting | Public | Static file | No Function or database work | Vercel static asset policy |
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
| `/api/admin/media/:id` | PATCH, DELETE | Clerk owner | Bounded ID; Admin JSON maximum 256 KB | Clerk, Turso and Blob deletion when archiving | Private, no-store |
| `/api/admin/media/local-upload` | POST, development only | Local owner | Multipart media; 15 MB images or 30 MB MP4 | Local filesystem and Sharp metadata | Private, no-store |
| `/api/admin/media/upload-token` | POST | Clerk owner | Vercel Blob event JSON maximum 64 KB; exact controlled pathname, asset ID, MIME and size | Clerk and Blob token issuance | Private, no-store |
| `/api/admin/media/complete` | POST | Clerk owner | JSON maximum 64 KB; controlled pathname and asset ID | Clerk, Blob `head`, bounded direct fetch, Sharp metadata and Turso | Private, no-store |
| `/api/media/:id` | GET, HEAD, development only | Public local development | Bounded asset ID | Local Turso and ignored local file read | Local only |

All other `/api/admin` paths return 404 before Clerk. Unsupported methods are rejected before authentication, database, Blob or Sharp work and include `Allow` where applicable. Production custom-domain and fixed Vercel-alias traffic can reach the public and Admin Functions unless an external firewall rule blocks it. Turnstile and application rate limiting therefore remain required even when Cloudflare proxies the custom domain.
