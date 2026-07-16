# Webine launch checklist

This checklist keeps code readiness separate from production approval. Do not mark launch complete while any required row is open.

## Application and content

| Gate | Status | Evidence or next action |
|---|---|---|
| Home, Works and Contact implementation | Pass | Production build and route tests |
| Clerk-protected Admin and preview | Pass in code | Configure production Clerk values and verify deployed login |
| CMS, media, publishing and public Project flow | Pass locally | Repeat smoke test against Preview Turso and Blob |
| Contact storage and Admin review | Pass locally | Configure production hash secret and run a Vercel test enquiry |
| Notification delivery | Open | Choose and configure the HTTPS delivery provider, or approve queued-only launch behaviour |
| Final commissioned Project content | Open | Supply approved copy, media, credits and results |
| Contact email and social links | Open | Supply final public details |
| Privacy wording and retention period | Open | Obtain and approve final wording |
| Licensed Railway webfonts | Open | Supply licensed webfont files and remove the development warning |

## Production services

| Gate | Status | Evidence or next action |
|---|---|---|
| Vercel project | Open | Connect the GitHub repository and configure Preview first |
| Preview and Production Turso | Open | Prefer separate databases, apply all migrations and test restore |
| Clerk | Open | Configure keys, exact owner ID and exact authorised origins |
| Vercel Blob | Open | Link the public store and verify upload or delivery |
| Secrets | Prepared | Add the variables in `docs/vercel-deployment.md`, never GitHub |
| Analytics | Open | Select a privacy-compatible measurement setup |
| Backups | Local pass | Configure provider backups and complete a non-production restore |
| Purchased domain | Open | Connect only after Preview approval |

## Discoverability and security

| Gate | Status | Evidence or next action |
|---|---|---|
| Route titles and descriptions | Pass in code | Final copy review |
| Project-specific metadata | Pass in code | Confirm rendered metadata on Preview |
| Robots and dynamic sitemap | Pass in automated tests | Confirm the deployed origin and published Project URLs |
| Social image | Open | Supply or approve final 1200 × 630 artwork |
| Security headers | Prepared | Verify Vercel response headers and add a tested CSP after Clerk and media hosts are final |
| Repository secret scan | Pass locally | Repeat before first push and each release |

## Quality approval

| Gate | Status | Evidence or next action |
|---|---|---|
| Automated build, types and tests | Pass | Run again on the exact release commit |
| Dependency audit | Pass | Repeat on the exact release commit |
| Responsive visual matrix | Local browser pass | Complete the physical-device and cross-browser rows in `docs/verification-matrix.md` |
| Physical iPhone sticky and particle story | Open | User confirmation on Safari and Chrome |
| Android touch experience | Open | Representative device confirmation |
| Desktop mouse, trackpad and keyboard | Open | Cross-browser live pass |
| LCP, INP and CLS | Open | Record production-build measurements |
| Accessibility scan and 200% zoom | Partial local pass | Run an automated production scan and literal 200% zoom in physical browsers |

## Release operation

1. Back up the target database.
2. Apply migrations.
3. Deploy the exact reviewed Git commit to Preview.
4. Run Admin, media, Project and enquiry smoke tests.
5. Complete the visual, accessibility and performance matrix.
6. Promote the same reviewed source and environment contract to Production.
7. Verify robots, sitemap, headers, analytics and backups on the public origin.
8. Connect the purchased domain only after every required row passes.
