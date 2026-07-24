# Webine CMS schema engine

Stage 8 establishes the data and validation boundary. Stages 9 and 10 add protected Admin access, schema editing and generated drafts. Stages 11 and 12 complete media and Project publishing.

## Migration order

1. `migrations/0001_content_core.sql` creates collections, field definitions, draft and published item storage, immutable publish snapshots and relational item references.
2. `migrations/0002_operations.sql` adds assets, asset usage, audit events, enquiries and idempotency records.
3. `migrations/0003_system_collections.sql` seeds the protected Projects, Categories, Services and Site Settings schemas plus the Site Settings singleton.
4. `migrations/0004_clerk_actor_identity.sql` renames the historical audit actor column so verified Clerk user IDs are recorded accurately.
5. `migrations/0005_media_delivery.sql` adds provider delivery URLs, decorative metadata and media ordering support.
6. `migrations/0006_concept_project_seed.sql` adds three honest internal or concept Projects plus the references and media needed to exercise the public workflow.
7. `migrations/0007_enquiry_pipeline.sql` adds notification state, privacy-preserving rate-limit buckets and expiring submission deduplication for the Contact pipeline.
8. `migrations/0008_project_case_study_details.sql` extends Project case-study facts.
9. `migrations/0009_site_settings_defaults.sql` publishes the current website copy into the untouched Site Settings singleton without overwriting an edited record.
10. `migrations/0010_project_showcase_presentation.sql` adds the per-Project case-study accent colour used by the schema-generated colour picker.

The SQL is intentionally reviewable and compatible with SQLite or libSQL. Local development uses a file database and Vercel environments can use Turso without changing the content model. The schema also remains close to D1-compatible SQL if a future Cloudflare migration is approved. Foreign keys are enabled, published records must archive before permanent deletion and JSON columns reject invalid documents.

## Validation boundary

`src/cms/schema.ts` is the shared server-domain contract. It validates:

- stable snake_case collection and field keys
- unique field positions and collection display or slug fields
- required select options and reference targets
- every launch field value category
- secure URLs, email, slugs, numeric limits and structured-content size
- ready image assets and required alt text
- active references from the configured target collection
- unknown item fields
- system collection and system field protection
- incompatible required, type and option changes when existing items would break
- archive blocking while a published item still uses an entity

Client forms may reuse these rules for immediate feedback, but future mutation handlers must run them again on the server. Client validation is never authoritative.

## Verified gate

The automated CMS test creates a clean database from all migrations and checks the required tables, system collections, Project fields, Site Settings singleton and JSON constraints. A separate upgrade test creates content after migration 1, applies later migrations and confirms the existing collection remains intact.

## Current Admin boundary

Stage 9 connects this schema to Clerk-authenticated Vercel Functions for the Admin session, dashboard, collections and item lists. The server checks a single approved Clerk user ID and authorised origins. A local bypass exists only when explicitly enabled outside Vercel and outside production.

Stage 10 adds collection creation and compatible schema editing, generated controls for every launch field category plus draft item creation and editing. Mutations require an exact same-origin request, repeat server validation, reject stale versions and append an audit record.

Stage 11 adds validated JPEG, PNG, WebP, AVIF and frame-capped GIF upload, a 50 MB and 12,000 pixel limit, alt or decorative metadata, focal points, reuse, usage records and published-usage archive protection. Production uses direct Vercel Blob upload so large files do not pass through the Vercel Function request body. Local development uses the same asset records with ignored local file storage.

Stage 12 adds flexible Project blocks plus preview, publish, republish, unpublish and archive actions. Image blocks can render as ordinary wide media, full-width media or one final precomposed bento feature. Publishing reruns required-field validation and copies the draft to `published_data_json`; public queries never read the working draft. Project lists keep every lifecycle state visible. Draft or archived records can be purged only after reference checks, with snapshots removed transactionally and an audit event retained.

Stage 19 activates the enquiry records introduced in migration 2. The public boundary validates and limits input, stores only accepted enquiries, keeps client addresses as keyed hashes and records notification outcomes without logging submitted content. Resend provides direct owner email with visitor reply-to, while the existing HTTPS webhook remains an alternative. The Clerk-protected Admin inbox is the only application view of private enquiry data.

Optimistic item writes and publishing actions use explicit write transactions. A stale or simultaneous writer cannot leave relationship changes, snapshots or audit records behind after the primary version check fails. SQLite lock contention is translated into the same reviewable 409 conflict rather than leaking a provider error.
