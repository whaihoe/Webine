# Webine launch checklist

This checklist keeps code readiness separate from production approval. Do not mark launch complete while any required row is open.

## Application and content

| Gate | Status | Evidence or next action |
|---|---|---|
| Home, About, Services, Works and Contact implementation | Pass | Production build and route tests |
| Clerk-protected Admin and preview | Pass in code | Configure production Clerk values and verify deployed login |
| CMS, media, publishing and public Project flow | Pass locally | Repeat smoke test against Preview Turso, R2 media and R2 content snapshots |
| Contact storage and Admin review | Pass locally | Configure production hash secret and run a Cloudflare Worker test enquiry |
| Notification delivery | Approved deferred | Enquiries are stored and reviewable in Admin. Configure all three Resend variables after the sending domain is verified |
| Final commissioned Project content | Approved in progress | Current internal and concept work remains clearly labelled while commissioned projects are added |
| Contact email and social links | Optional | Add public details through Site Settings or `VITE_PUBLIC_CONTACT_EMAIL` when approved |
| Privacy wording and retention period | Pass in code | Version 2026-07-28 states the purpose, protected storage and 12-month retention policy |
| Arial typography | Pass | Arial is the approved primary typeface and requires no external font request |

## Production services

| Gate | Status | Evidence or next action |
|---|---|---|
| Cloudflare Worker and static assets | Ready for reviewed deployment | Deploy the exact reviewed release with `npm run deploy:cloudflare` after local verification |
| Preview and Production Turso | Required | Apply every migration in filename order, keep Preview separate and test restore |
| Clerk | Required in Cloudflare | Verify deployed login with the exact owner account and authorised origins |
| R2 media and content buckets | Required | Verify one JPEG, GIF and MP4 upload, rendition processing, public delivery and published snapshots in Preview |
| Worker secrets and bindings | Required | Keep values out of GitHub, configure all required environment names and verify the production environment gate |
| Analytics | Open | Select a privacy-compatible measurement setup |
| Backups | Local pass | Configure provider backups and complete a non-production restore |
| Purchased domain | Pass | `madebywebine.com` permanently redirects to the canonical `www.madebywebine.com` origin through Cloudflare |

## Discoverability and security

| Gate | Status | Evidence or next action |
|---|---|---|
| Route titles and descriptions | Pass locally | Route-specific raw HTML and rendered metadata verified across all six public routes. Deploy the reviewed source |
| Project-specific metadata | Pass locally | Consolidated Projects function returns project-specific initial HTML, canonical, social data and CreativeWork schema. Missing projects return 404 and noindex |
| Robots and dynamic sitemap | Pass locally | Production robots and sitemap respond successfully. Deploy the Privacy rewrite, then resubmit the sitemap in Search Console |
| Canonical and redirect alignment | Pass locally | All generated public URLs use the `www` origin. The apex 308 redirect is expected to remain excluded as a redirected page |
| Structured data and answer content | Pass locally | Organization, WebSite, page, breadcrumb, service and project entities plus direct About and Services answers verified |
| Social image | Pass locally | Default 1200 by 630 brand artwork, canonical URLs and large Twitter cards are configured |
| Security headers | Partial local pass | HSTS, frame denial, MIME sniffing, referrer, permissions and private-route controls are configured. Promote the narrower report-only CSP only after Preview compatibility checks |
| Repository secret scan | Pass locally | Repeat before first push and each release |

## Quality approval

| Gate | Status | Evidence or next action |
|---|---|---|
| Automated build, types and tests | Pass locally | Exact Node 22.23.1 client build, server and test-server type checks and all 109 automated tests pass |
| Dependency audit | Pass locally | Complete npm audit reports zero known vulnerabilities |
| Responsive visual matrix | Local browser pass | Six public routes pass at 320, 390, 768, 1024, 1280 and 1920 widths. Complete physical-device and cross-browser rows |
| Physical iPhone sticky and particle story | Open | User confirmation on Safari and Chrome |
| Android touch experience | Open | Representative device confirmation |
| Desktop mouse, trackpad and keyboard | Open | Cross-browser live pass |
| LCP, INP and CLS | Open | Record production-build measurements |
| Accessibility scan and 200% zoom | Partial local pass | Run an automated production scan and literal 200% zoom in physical browsers |

## Release operation

1. Back up the target Turso database and prove a non-production restore.
2. Apply every migration to Preview, then run `npm run db:migrate` against Production during the approved window.
3. Create the Preview and Production R2 media and content buckets, configure their bindings, custom domains and least-privilege CORS.
4. Set the required Worker secrets, confirm `ENQUIRY_HASH_SECRET`, Clerk, Turso, R2 and Turnstile configuration, then run `npm run build:cloudflare`.
5. Deploy the exact reviewed Git commit to Preview with `npm run deploy:cloudflare -- --env preview`.
6. Run Admin, JPEG, GIF, MP4, rendition, snapshot, Project and enquiry smoke tests.
7. Complete the physical-device, accessibility and performance matrix.
8. Deploy the same reviewed source and environment contract to Production with `npm run deploy:cloudflare`.
9. Verify robots, sitemap, headers, cache behaviour, rate limits, analytics and backups on the public origin.
10. Change production DNS only after every required row passes. Keep Vercel available through the agreed observation period.
