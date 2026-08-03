# Webine launch checklist

This checklist keeps code readiness separate from production approval. Do not mark launch complete while any required row is open.

## Application and content

| Gate | Status | Evidence or next action |
|---|---|---|
| Home, About, Services, Works and Contact implementation | Pass | Production build and route tests |
| Clerk-protected Admin and preview | Pass in code | Configure production Clerk values and verify deployed login |
| CMS, media, publishing and public Project flow | Pass locally | Repeat smoke test against Preview Turso and Blob |
| Contact storage and Admin review | Pass locally | Configure production hash secret and run a Vercel test enquiry |
| Notification delivery | Approved deferred | Enquiries are stored and reviewable in Admin. Configure all three Resend variables after the sending domain is verified |
| Final commissioned Project content | Approved in progress | Current internal and concept work remains clearly labelled while commissioned projects are added |
| Contact email and social links | Optional | Add public details through Site Settings or `VITE_PUBLIC_CONTACT_EMAIL` when approved |
| Privacy wording and retention period | Pass in code | Version 2026-07-28 states the purpose, protected storage and 12-month retention policy |
| Arial typography | Pass | Arial is the approved primary typeface and requires no external font request |

## Production services

| Gate | Status | Evidence or next action |
|---|---|---|
| Vercel project | Ready for reviewed deployment | Confirm the linked branch and deploy the exact reviewed release after local verification |
| Preview and Production Turso | Configured in Vercel | Apply migrations through `0012_security_hardening.sql`, keep Preview separate and test restore |
| Clerk | Configured in Vercel | Verify deployed login with the exact owner account and authorised origins |
| Vercel Blob | Configured in Vercel | Verify one JPEG and GIF upload in Preview before promotion |
| Secrets | Configured in Vercel | Keep values out of GitHub and verify the production environment gate during deployment |
| Analytics | Open | Select a privacy-compatible measurement setup |
| Backups | Local pass | Configure provider backups and complete a non-production restore |
| Purchased domain | In progress | The Vercel origin remains valid until the final domain and Resend sender are ready |

## Discoverability and security

| Gate | Status | Evidence or next action |
|---|---|---|
| Route titles and descriptions | Pass in code | Final copy review |
| Project-specific metadata | Pass in code | Confirm rendered metadata on Preview |
| Robots and dynamic sitemap | Pass in automated tests | Confirm the deployed origin and published Project URLs |
| Social image | Pass in code | Default 1200 by 630 brand artwork, canonical URLs and large Twitter cards are configured |
| Security headers | Pass in code | HSTS, CSP, frame denial, MIME sniffing, referrer, permissions, private-route no-store and noindex controls are configured |
| Repository secret scan | Pass locally | Repeat before first push and each release |

## Quality approval

| Gate | Status | Evidence or next action |
|---|---|---|
| Automated build, types and tests | Pass | Lint, strict client and server types, production build and all 72 tests pass on the exact release source |
| Dependency audit | Partial | The lint-toolchain and Router 6 advisories are resolved. npm still reports the upstream React Router RSC action advisory, but Webine does not enable RSC or server actions and no stable fully clear release is currently available |
| Responsive visual matrix | Local browser pass | Complete the physical-device and cross-browser rows in `docs/verification-matrix.md` |
| Physical iPhone sticky and particle story | Open | User confirmation on Safari and Chrome |
| Android touch experience | Open | Representative device confirmation |
| Desktop mouse, trackpad and keyboard | Open | Cross-browser live pass |
| LCP, INP and CLS | Open | Record production-build measurements |
| Accessibility scan and 200% zoom | Partial local pass | Run an automated production scan and literal 200% zoom in physical browsers |

## Release operation

1. Back up the target database.
2. Apply migrations.
3. Create and connect the public `webine-blob` Vercel Blob store to Preview and Production.
4. Add `ENQUIRY_HASH_SECRET`, confirm every required Clerk and Turso variable and redeploy.
5. Deploy the exact reviewed Git commit to Preview.
6. Run Admin, JPEG, GIF, Project and enquiry smoke tests.
7. Complete the physical-device, accessibility and performance matrix.
8. Promote the same reviewed source and environment contract to Production.
9. Verify robots, sitemap, headers, analytics and backups on the public origin.
10. Connect the purchased domain only after every required row passes.
