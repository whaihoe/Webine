# Webine security hardening implementation report

## Executive summary

The hardening branch removes avoidable production Functions, rejects malformed traffic before paid work and adds layered protection for enquiries, Admin and Blob media. It is pushed and deployed to a Vercel Authentication-protected Preview, but has not been promoted to Production. One verified Vercel production firewall rule now rate-limits the highest-cost public write route. Cloudflare work and the remaining Vercel dashboard work stay in separate manual checklists.

## Implemented source controls

- Strict public query contracts reject unknown, duplicate, malformed and long variants before Turso.
- Public browser, downstream CDN and Vercel CDN cache lifetimes are controlled separately. Sensitive and error responses remain private and no-store.
- Project detail uses one parameterised slug query followed only by that project's assets and references.
- Production media and robots Functions are removed. Production uses direct Blob URLs and static `public/robots.txt`; local media remains development-only.
- Production canonical and sitemap URLs use `https://www.madebywebine.com`, independent of the request Host header.
- Enquiry JSON is limited to 32 KB by both declared and streamed size. Honeypot and strict field checks precede Siteverify, rate limiting and Turso.
- Turnstile is rendered accessibly, reset after attempts and verified server-side for success, hostname and `contact_enquiry` action with a five-second timeout.
- Application rate limiting uses HMAC-derived IP and normalised-email buckets, bounded cleanup and `Retry-After`. Deduplication remains atomic and targeted cleanup replaces a broad per-request delete.
- Notification retry returns immediately for sent enquiries and uses a short database lock against concurrent retries.
- Admin paths and methods are validated before Clerk. Requests without a plausible Clerk carrier return 401 before a Clerk client is created.
- Blob upload authorisation is bound to a controlled asset pathname, MIME, byte size, Admin user and five-minute token. Completion verifies the configured store through `head`, exact metadata, bounded download and idempotent storage identity.
- Image uploads are limited to 15 MB and MP4 to 30 MB. Existing dimension and GIF-frame limits remain until actual media evidence supports lowering them safely.
- A stricter CSP is added in report-only mode while the existing enforced policy preserves Clerk. CORS remains same-origin and private routes receive explicit no-store and noindex headers.

## Database change

Migration `0012_security_hardening.sql` adds `notification_lock_until` and an index supporting bounded rate-limit cleanup. SQLite cannot directly drop an added column on every supported version. Rollback should first deploy code that no longer references the column, then rebuild the enquiries table from a reviewed backup only if removal is genuinely necessary. Leaving the unused integer column is safer than destructive rollback.

## Verification status

Before changes, lint, server TypeScript and the production build passed. The full suite had 79 passes and two pre-existing visual-contract failures in `tests/foundation.test.mjs`: the expected particle transition values and transparent Services card rule no longer match current source. After hardening, the production build, lint and both TypeScript checks pass. The full suite has 99 tests, with 97 passing and the same two pre-existing failures. Focused security, enquiry, media, routing and deployment tests pass.

Secretlint with its recommended rules found no secrets. `npm audit` reports two high entries caused by one React Router RSC-mode CSRF advisory. Webine is a client-only Vite `BrowserRouter` app and does not use React Server Components or React Router actions. npm's suggested downgrade introduced several older router advisories, so 7.18.2 is retained until a patched upstream version is available. Routine tests use local libSQL fixtures and mocks rather than live Turso, Clerk, Cloudflare, Resend or Blob calls.

## Vercel verification and applied change

- Authenticated CLI account: `whaihoe`; scope and project: `webine/webine`; project ID: `prj_Ktp0WoQzCI5BrNKbnWGFpATYrZlf`.
- CLI version: 58.4.4. Production aliases include `madebywebine.com`, `www.madebywebine.com`, `webine.vercel.app` and other exact Vercel aliases.
- Branch `security/vercel-abuse-hardening` is deployed and Ready at `https://webine-git-security-vercel-abuse-hardening-webine.vercel.app`. Deployment `dpl_2yem2epzKMDKKrzuL4ZdU3ZU1Ujc` contains exactly the five expected Functions: Admin, enquiries, projects, site settings and sitemap. Media and robots Functions are absent.
- The Preview build used Node 22.x from the repository engine declaration even though the project setting reports Node 24.x. This confirms the repository pin wins for this build.
- Official Cloudflare Turnstile test credentials and the required site, hostname and Clerk-party settings are configured only for this branch's Preview environment. Their values are not stored in source or documentation. Production credentials and environment values were not changed.
- Vercel Authentication is active for Preview. Anonymous HTTP and CLI route checks redirect to Vercel sign-in, so application-level Preview smoke testing requires an authenticated browser session. Local desktop and 390 px browser checks passed without console errors and the Turnstile test flow enabled submission without sending an enquiry.
- The Production deployment remains unchanged and still contains the old media and robots Functions. The hardening branch has not been promoted to Production.
- Applied through Vercel CLI: `enquiries-abuse`, ID `rule_enquiries_abuse_gthpd8`, enabled, exact `POST /api/enquiries`, IP key, fixed window, 10 requests per 60 seconds, deny when exceeded. The published rule was fetched again and there are no pending drafts.
- Rollback: run `vercel firewall rules remove rule_enquiries_abuse_gthpd8 --yes --project webine --scope webine`, inspect the draft, then `vercel firewall publish --yes --project webine --scope webine`. This reduces abuse protection but does not alter data or deploy source code.
- A controlled production smoke check returned 200 for `/api/projects`, 405 for `GET /api/enquiries` and 200 for `HEAD /sitemap.xml`. No enquiry was submitted.

## Required external work

- Follow [Cloudflare manual setup](CLOUDFLARE_MANUAL_SETUP.md).
- Follow [Vercel manual setup](VERCEL_MANUAL_SETUP.md).
- Confirm the existing Production Turnstile widget is the intended managed widget. Only variable names appear in source.
- Apply migration `0012_security_hardening.sql` to Preview Turso, verify Preview and then apply it to Production through the normal reviewed migration process.
- While signed in to Vercel, test the protected Preview's public navigation, Contact flow, Clerk Admin, CMS edits, direct Blob upload, image, GIF and MP4 display, response headers and CSP reports before considering Production.

## Remaining risks

Distributed attacks can avoid per-IP limits. A direct Vercel alias can bypass Cloudflare. Public Blob URLs remain readable by design. Stolen Admin sessions remain dangerous until revoked. Third-party outages can block Turnstile, Clerk or notifications. The current plan exposed limited firewall capabilities, so Admin and public-read rate limits were not added automatically. Report-only CSP does not block newly identified script or connection sources until evidence supports enforcement.

## First-week monitoring

Monitor Function invocations and duration, CDN and Fast Data Transfer, Turso reads and writes, Blob transfer, enquiry attempts and accepts, Turnstile failures, 429 responses, notification failures, Admin 401 and 403 rates, firewall events, CSP violations and fixed-alias traffic. Review false positives before tightening thresholds.
