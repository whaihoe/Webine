# Webine decision log

## 2026-07-13, application foundation

- Created the Webine project from the supported Cloudflare-compatible site foundation.
- Kept the starter's vinext routing layer because it provides the server-rendered route and Worker output required by the hosting workflow.
- Created Home, Works, Contact, Admin and preview routes without adding unapproved client or project claims.
- Added explicit local, preview and production environment naming through `WEBINE_ENV`.
- Recorded missing Railway, contact, privacy, project and production inputs as launch blockers rather than inventing replacements.
- Deferred D1 and R2 bindings until the CMS and media stages so preview infrastructure cannot be mistaken for production data.
