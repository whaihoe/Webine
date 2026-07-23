# Webine decision log

## 2026-07-13, initial hosted application foundation, superseded

- Created the initial Webine project from a hosted site foundation.
- Used its server-rendered routing layer and Worker output for the first milestone.
- Created Home, Works, Contact, Admin and preview routes without adding unapproved client or project claims.
- Added separate local, preview and production environment naming.
- Recorded missing Railway, contact, privacy, project and production inputs as launch blockers rather than inventing replacements.
- This approach was superseded by the local-only decision below. Its hosting files and source remote have been removed.

## 2026-07-13, local-only development

- Replaced the Vinext and Cloudflare-specific runtime with a standard Vite and React Router application.
- Removed OpenAI Sites metadata, the Sites packaging plugin, Worker files and hosted environment configuration.
- Kept Home, Works, Contact, Admin, preview, error handling and the existing visual foundation.
- Lowered the local runtime requirement to Node.js 18 so the project works with the user's current terminal setup.
- Future hosting will be selected and configured separately when the website is ready to publish.

## 2026-07-13, Stage 2 design foundation and site shell

- Added three-layer primitive, semantic and component tokens for colour, typography, spacing, layout, radius and motion.
- Kept Railway as the intended primary typeface and displayed the Arial development fallback clearly instead of substituting another font.
- Built the four, eight and twelve-column responsive grid with the blueprint's 320, 390, 768, 1280 and 1440 px target widths in mind.
- Replaced the generic route placeholder with a dark Home hero, light Works shell, dark Contact split, separate Admin frame, preview shell and designed error states.
- Added accessible current-page navigation, a labelled native-dialog mobile menu, a skip link, route announcements and destination heading focus.
- Added a central configuration for particles, smooth scrolling, Signal Grid, motion presets and page transitions. Every advanced effect remains disabled.
- Kept all project, contact and font gaps visible and honest. No clients, results, email addresses or project claims were invented.

## 2026-07-13, Stage 3 scroll and persistent-particle architecture

- Added one lazy React Three Fiber canvas to the Home route. Three.js and the particle code stay outside the initial readable page bundle.
- Added one reusable buffer geometry with stable scattered and folded-Webine target attributes. Scroll updates a shader uniform instead of reallocating particles.
- Added a normalised story-progress store, section anchor registration and Home-only lifecycle cleanup so later scenes can join the same narrative.
- Added WebGL 2 capability checking, context-loss handling, a visible loading or failure poster and paused rendering when no registered scene is visible or the page is backgrounded.
- Set the starting budgets to 6,000 desktop particles and 1,800 mobile particles, with a 1.5 desktop and 1.25 mobile pixel-ratio cap.
- Added restrained public smooth scrolling while keeping Admin outside the public scroll controller.
- Kept Stage 4 replaceable: the current logo composition is only the poster placeholder. Stage 4 can replace the art and hero layout without changing the particle canvas, geometry or controller.
- Adopted the user's next-stage-aware rule. Each stage must preserve the interfaces needed by the following stage without implementing that later stage early.
- Production dependencies pass the security audit. The local Vite 5 development server retains an esbuild advisory that cannot be removed on Node 18.2 without an incompatible Vite upgrade. The server remains bound to `127.0.0.1` rather than the local network.

## 2026-07-13, hero particle contract correction

- Replaced the thin generic zigzag target with a filled, faceted silhouette sampled from the actual folded Webine mark.
- Separated first-load formation from scrolling. One coordinated GSAP timeline now provides the 400 ms breathing period, particle gather, interface reveal, shorter return entry and immediate completion on early visitor input.
- Kept one persistent geometry and added only stable facet data, pointer uniforms and reversible scroll-exit uniforms. No second canvas or duplicate particle implementation was introduced.
- Repositioned the formed mark into the desktop safe region. Mobile keeps 1,800 larger particles and uses a dark local contrast field behind the copy rather than disabling the live scene.
- Added a dedicated 600 to 1023 px tablet position while retaining the reduced 1,800-particle profile, preventing the desktop mark from entering tablet supporting copy.
- Removed the circular loading-guide treatment, faded the particle layer before the following light section and centralised the hero exit thresholds in scene configuration.
- Removed the remaining CSS `prefers-reduced-motion` branch so operating-system motion preference does not alter Webine's interaction system. Capability, input type and measured device performance remain the fallback criteria.

## 2026-07-13, USTA-inspired particle depth

- Added bounded 3D yaw, pitch, roll and depth floating after the folded mark settles. The movement is slow enough to preserve logo recognition and stops contributing during the hero exit.
- Kept ambient particles inside the existing geometry through a stable mask instead of adding USTA's separate 700-particle layer. Desktop reserves 4.5 percent and mobile or tablet reserves 3.5 percent of the existing budget.
- Added an 18-second shader colour cycle using only Webine's cyan-400, blue-500 and blue-700 tokens. Pointer highlighting still uses the same palette.
- Increased the procedural fold depth so the gentle rotation reveals dimensional facets rather than looking like a flat card.
- Centralised ambient ratios, drift, rotation, floating and colour timing in `experienceConfig.particles` so the treatment can be tuned without rewriting shader logic.

## 2026-07-13, complete Home narrative vertical slice

- Followed the later explicit Home-first instruction and built the remaining public Home scenes ahead of the earlier CMS gate. This changes implementation order only, not the CMS source-of-truth requirement.
- Added the practical reach scene, a pinned desktop and native mobile selected-work runway, a quiet long-term-value interlude, the semantic four-step process and the closing contact invitation.
- Used clearly labelled internal and concept records for the provisional selected work. No client names, results or unverified claims were invented. These records must migrate to the protected Project collection before production content approval.
- Connected Home and Works to the same provisional project module so the two routes cannot drift while the CMS is still reserved.
- Extended the existing single particle geometry with reach, three work, orbit, inlet and right-facing open-arrow targets. No scene-owned canvas or duplicate particle system was added.
- Added one shared `timelineProgress` value for the semantic line fill, node states, particle intake, hidden channel and outlet release. Reverse scroll uses the same calculation rather than callbacks.
- Enabled the CSS Signal Grid only for the hero and closing CTA. It has a faint resting state, a dim fine-pointer mask and no touch tracking or additional canvas.
- Kept text, project media, links and timeline cards above the fixed particle layer. The work underline was lowered after visual review so it no longer crosses project metadata.
- Replaced the footer's public-facing pending-contact placeholder with a real route to the Contact page while preserving Singapore as the only confirmed location.

## 2026-07-13, held rounded particle refinement

- Replaced direct form-to-form interpolation with a held transition contract. Each settled object remains snapped through its tolerance, disperses through the stable seeded field and only then forms the next target.
- Rebuilt post-hero targets from rounded 3D toruses, tubes and capsules. The closing target is now a thick rounded arrow rather than a thin sharp outline.
- Added a slow looping float and self-rotation, bounded whole-object pointer travel, subtle tilt and a local depth bulge that keeps particle density intact.
- Split the process handoff into geometry-derived intake and release values. Intake starts when the line top reaches viewport centre. Release starts when the line bottom reaches viewport centre, grows from a compact centre cloud and forms the arrow.
- Kept project copy clear by suppressing ambient particles in the runway, using opaque content layers and moving responsive work positions into the media-safe area.
- Fixed the public header above the smoothed document and added an explicit closing visibility value so the particle object fades before the footer.
- Browser review covered desktop and 390 px mobile layouts, forward and reverse timeline movement, pointer deformation, footer containment and horizontal overflow. Tests, linting and the production build pass.

## 2026-07-13, explicit anchored particle states

- Superseded the continuously travelling work forms and closing fade. Visible objects now hold at a section anchor until a threshold releases them into the dispersed field.
- Removed all work target buffers and work-to-particle progress plumbing. The field fades out before work, remains absent for the whole runway and returns dispersed only after work has left the viewport.
- Added a live timeline inlet coordinate from the HTML line. Stable per-particle contact thresholds gather the population into that moving point and fade each particle only when it reaches the inlet. Most are hidden at the centre crossing.
- Kept the outlet centre trigger, but changed emission to a staggered point fade-in followed by volumetric dispersion, travel to the closing anchor and arrow formation.
- Removed closing opacity state. The arrow remains opaque and follows a section-local anchor out of the viewport, so it never overlays the footer.
- Rebuilt the hero target as a closed volume with sampled front, back and perimeter side walls.
- Removed obsolete page progress, scene progress, work progress, work targets, timeline target and closing visibility code after migrating every consumer.
- Desktop and 390 px mobile browser reviews confirmed the particle-free work chapter, point-contact intake, point-origin outlet, responsive CTA clearance and section-local footer exit. Tests, linting and the production build pass.

## 2026-07-13, section-local anchors applied to every held form

- Corrected the remaining implementation mismatch where hero, reach and interlude still settled at fixed canvas coordinates even though the closing arrow already followed its section.
- Added one responsive anchor map for hero, reach, interlude and closing. The controller now recalculates every anchor from the live section rectangle and the renderer converts those points into canvas coordinates.
- Kept the existing release thresholds, dispersed transitions, particle-free work interval and timeline handoff. Only the settled object ownership changed.
- Moved the desktop and tablet reach and interlude anchor fractions further into the visual side of the composition so the larger locked objects remain secondary to readable copy.

## 2026-07-13, centre-bottom exits and runway-to-interlude expansion

- Standardised hero, reach and interlude release so each held form starts leaving only when its own section bottom reaches the viewport centre. Closing remains attached to its section because it has no next particle target.
- Added one reversible `sceneExitProgress` measurement to the shared controller and removed the earlier presence-based hero and reach release thresholds.
- Split interlude dispersion from timeline intake. The orbit now releases at the interlude threshold, while the later live inlet progress still owns point gathering and contact fade.
- Replaced the generic end-of-selection tile with a chapter 04 preview that shares one content source with the interlude.
- Added a normal-scroll card-to-section expansion. It avoids CSS sticky so the chapter handoff stays controlled by the same explicit scroll timeline.

## 2026-07-13, chapter 04 card expansion clarification

- Superseded the separate matching-panel entry. The final Selected Work card itself now owns the expansion.
- Applied vertical-driven horizontal movement on desktop, tablet and mobile rather than keeping a native nested carousel on smaller screens.
- Locked horizontal travel when the final card reaches the viewport centre. Remaining scrub progress changes only the card size, position, corner radius and compact-to-full content state.
- Aligned the real interlude beneath the full-screen card so pin release is a seamless takeover and reverse scrolling restores the card and runway.

## 2026-07-13, section-owned particle points supersede centre-bottom exits

- Replaced the shared section-bottom release rule with independent point motion settings for hero, reach, interlude and closing.
- Each section now defines when its point begins formation, reaches a complete form at viewport centre and begins dispersion after crossing the viewport top.
- Kept colour cycling, pointer bulge, whole-object pointer travel, floating and rotation as shared rendering properties so every form belongs to one visual system.
- Kept Selected Work without a settled target. Reach disperses and leaves before the runway, while interlude formation begins only from its own entering point.
- Preserved the live timeline inlet and per-particle contact fade. Changed the outlet to emit and disperse only, then moved arrow formation into the closing section's independent point logic.
- Expanded the fixed canvas to the full viewport so DOM point coordinates and particle centres use the same coordinate space.

## 2026-07-13, viewport-following explosion and clean chapter handoff

- Enlarged the dispersed target into a radial explosion with a short overshoot instead of keeping particles inside a small local cloud.
- Moved the dispersed group to the viewport centre between point-owned forms. It follows the viewport until the next point enters, then gathering starts at that point.
- Added restrained damping to particle progress. Increased desktop scroll weight slightly and applied a 1.25 second runway scrub across breakpoints, giving transitions time to read without intercepting wheel or touch input.
- Removed the duplicate full interlude content from the expanding card. The card now acts as the expanding shell, other work cards fade and one real Section 4 instance owns the handoff.
- Made the hero stack explicit: Signal Grid at layer 0, particles at layer 1 and hero typography and controls at layer 2.

## 2026-07-13, reversible work fade and early chapter formation

- Fixed reverse shape restoration by setting inactive progress uniforms to exact zero. This releases the later shader branch immediately instead of leaving an asymptotic non-zero value that overrides earlier forms.
- Reduced fully dispersed density to a stable 58 percent subset. All particles return progressively as a target gathers.
- Restored the particle-free Selected Work sequence. Visibility fades out during the first tenth of runway progress, remains zero during horizontal work and fades back while the final card expands.
- Added a reversible card-owned formation value from 78 to 94 percent of runway progress. The interlude orbit forms at `0.67` viewport height, then hands off to the real section point.
- Desktop forward and reverse review confirmed the work fade, expansion return, early orbit and folded hero restoration. A 390 px check confirmed the same work and expansion states with zero page-level overflow.

## 2026-07-13, pre-work fade, offscreen formation and weighted scrolling

- Moved the Section 2 fade into reach dispersion. Visibility falls between 18 and 78 percent, so particles are already absent before Selected Work begins.
- Replaced the temporary lower-screen chapter anchor with the real interlude point. Card expansion forms the orbit from 70 to 88 percent while that point is still below the viewport.
- Increased public scroll weight to 1.35 smoothing and 0.88 speed on pointer layouts, with a restrained 0.12 touch smoothing value. Increased runway scrub to 1.45 seconds and particle progress damping to 3.
- Split compact point sizing into tablet 4.2 and mobile 3.8 values. Both retain the 1,800-particle performance profile.
- Browser review confirmed the early Section 2 fade, offscreen Section 4 formation, weighted mobile scroll surface and zero page-level overflow at 390 px.

## 2026-07-13, hero cover transition and selected-work parallax

- Corrected the hero stacking context so the body-level particle canvas remains below every hero text and control layer.
- Replaced the ineffective CSS sticky attempt with an explicit ScrollTrigger pin for predictable hero hold and release timing.
- Gave Section 2 a rounded leading edge, higher scene layer and restrained upward shadow so it reads as one light surface moving over the held hero.
- Added a scrubbed vertical entrance to the complete Selected Work stage. It begins below its resting position as the section enters and resolves when the section reaches the viewport top.
- Desktop and 390 px browser review confirmed the fixed hero, Section 2 cover, correct particle-to-text order, Section 3 translation and zero horizontal page overflow. Linting, the production build and all ten foundation tests pass.

## 2026-07-13, isolated runway parallax and Section 4 layer release

- Moved the Selected Work entrance from the pinned stage onto a dedicated inner motion layer so the entrance and runway pin no longer write to the same transform.
- Reversed the entrance direction. The composition now begins up to 120 px higher and settles downward by the time the section top reaches 30 percent of the viewport.
- Released the generated pin spacer's copied layer only after chapter expansion completes. This lets the real Section 4 layout appear above the empty expansion shell while preserving the preceding card animation.
- Desktop and 390 px review confirmed the downward-settling parallax, visible Section 4 text, reversible expanded state and zero horizontal overflow. Linting, the production build and all ten foundation tests pass.

## 2026-07-14, Lenis smooth-scroll migration

- Replaced the public GSAP ScrollSmoother surface with Lenis while keeping the existing GSAP ScrollTrigger scene timelines.
- Removed the transformed smooth wrapper and content elements, the old media-query start and stop logic, manual smooth anchor scrolling, resize observer, font-ready refresh and orientation refresh that only supported ScrollSmoother.
- Synchronized Lenis with ScrollTrigger through the GSAP ticker, kept fixed-header anchor offset handling and retained focus movement for accessible in-page links.
- Added the recommended Lenis stylesheet and updated the smooth-scroll configuration and foundation tests around the new implementation.

## 2026-07-14, opaque Reach cover and mobile particle budget

- Replaced the translucent Reach background gradient with one fully opaque slate-50 surface. The particle canvas remains above that surface and below the Reach content, while the pinned hero stays fully hidden behind it.
- Replaced Unicode up-right and down arrows with one small SVG direction component so mobile font fallback cannot turn UI marks into emoji-style glyphs.
- Reduced the mobile particle profile from 1,800 to 900 points, lowered its ambient subset to 2.5 percent and capped DPR at 1. Desktop and tablet profiles remain visually unchanged.
- Moved mobile WebGL rendering to a 30 FPS demand loop, capped mobile scene measurements to the same update rate and shortened post-scroll measurement settling from 1.2 seconds to 240 ms.
- Avoided attaching pointer-move listeners on coarse-pointer devices. Linting, the production build and all twelve foundation tests pass.

## 2026-07-14, closing handset target and chapter decoration fade

- Replaced the Section 6 closing arrow target with one rounded 3D telephone handset. The handset now follows a sculpted C-shaped centreline with a thicker lower curve and separate raised rounded-rectangular receiver pads, matching the soft classic telephone reference more closely. The existing persistent particle geometry, closing anchor and formation timing remain unchanged.
- Kept the runway chapter decoration as the existing `::after` layer, but exposed its opacity through `--chapter-decoration-opacity` and scrubbed that value down during the chapter expansion so the rings fade instead of disappearing abruptly.

## 2026-07-14, closing Concorde mesh target

- Replaced the closing telephone target with the supplied Concorde GLB as the real `targetClosing` mesh source.
- Added largest-dimension fitting to the generic model target pipeline so long aircraft geometry can be normalised without scaling from its much smaller vertical height.
- Baked the closing target to `[82, 18, -28]` degrees so the nose rises toward the upper right and the delta wing remains readable in a front-right three-quarter particle view.
- Reduced settled ambient rotation to 22 percent so the plane keeps the chosen showcase angle while retaining the shared floating and pointer response.
- Removed the unused phone particle GLB.
- Rebuilt the 20 MB source aircraft as a geometry-only particle derivative with 9,228 vertices and 22,707 faces. Textures and materials are excluded because the WebGL layer samples positions only.



## 2026-07-14, Webine hero mesh and downward Concorde mirror

- Replaced the hero's procedural W target with the supplied `webine_w_logo_3d(3).glb` as the real `targetHero` mesh source.
- Thickened the prepared hero mesh by 2.5x on its local Z axis before area-weighted surface sampling so the particle W has clearer 3D depth.
- Mirrored the already baked Concorde target vertically with `[1, -1, 1]`, preserving its three-quarter view while sending the nose downward instead of upward.
- Removed the separate mirror flag and kept axis transforms in the existing generic `localScale` model-preparation contract.
- Fixed the model preload so the hero and Concorde GLBs are each loaded exactly once before their target buffers are sampled.

## 2026-07-14, level Concorde closing target

- Changed the Concorde baked particle orientation from the downward mirrored pose to `[82, 18, -90]` with a neutral `[1, 1, 1]` local scale. This preserves the visible delta-wing depth while laying the aircraft almost horizontally across the screen with the nose pointing right.


## 2026-07-14, colony planet closing target

- Replaced the Concorde closing target with the supplied `Colony_Planet_Art.glb` mesh.
- Built a geometry-only `colony-planet-particle.glb` derivative for surface sampling and removed the aircraft asset from production.
- Fit the planet by its largest dimension and baked `[58, -22, 0]` degrees so its upper colony surface and rounded planetary depth are both visible in the closing scene.
- Increased settled ambient rotation from the aircraft-specific 22 percent to 42 percent because the planet silhouette remains readable through a wider slow rotational drift.
- Kept the Webine hero GLB target and its 2.5x local Z thickening unchanged.

## 2026-07-14 — Mobile particle performance pass

- Reduced the mobile particle profile to 640 points, 2.45 point size and a 0.9 DPR cap.
- Added precomputed scatter and release target buffers so direction/hash work is not repeated in the vertex shader every frame.
- Added a simplified mobile shader path without pointer deformation, per-particle ambient trigonometry or animated fragment colour cycling.
- Replaced the permanent mobile particle RAF loop with short demand-render bursts driven by story progress changes. The canvas stops rendering after the morph settles.
- Lenis now remains active across pointer and touch layouts so the heavier scroll feel is consistent on mobile as well as desktop.
- Disabled mobile particle-group idle rotation and float work, and use mediump shader precision on mobile.
- Rebalanced mobile-only particle anchors and scales so the hero W, reach rings, interlude rings and closing planet remain inside a 390 px class viewport.


## 2026-07-15 — Section-owned mobile particles and production pin refresh

- Replaced the fixed mobile WebGL narrative canvas with four section-owned absolute 2D canvases for Hero, Reach, Interlude and Closing.
- Mobile particles no longer use `sceneAnchorPositions` for placement. The section owns the canvas position and scroll only controls `scatter -> formed -> scatter` progress.
- Baked the mobile Webine W, Reach rings, Interlude rings, colony planet and scatter field into a compact binary target asset. This removes Three.js, React Three Fiber, GLTFLoader, MeshSurfaceSampler and shader loading from the mobile particle path.
- Reduced mobile point size to 1.55 and stopped all settled-frame rendering. Local canvases redraw only when story progress changes and only near the viewport.
- Kept the desktop and tablet persistent WebGL architecture unchanged.
- Hardened the Hero ScrollTrigger pin for production by waiting for fonts and two layout frames before creation, then using a safe refresh after creation and again on final window load.

## 2026-07-15 — Mobile particle first-paint StrictMode fix

- Fixed a blank mobile 2D particle canvas caused by retaining a cancelled `requestAnimationFrame` id across React StrictMode effect cleanup and remount in development.
- Mobile section particle frame state is now local to each effect lifetime rather than stored in a persistent ref.
- The first particle frame is painted synchronously after the baked target buffer is projected, so initial visibility does not depend on a queued animation frame.
- Added safe particle colour fallbacks in case CSS token parsing is unavailable during first paint.

## 2026-07-15, native iPhone hero cover and mobile renderer cleanup

- Reproduced the implementation difference behind the real-iPhone hero cover failure: desktop and browser-emulated mobile used the scripted ScrollTrigger pin, while real touch scrolling also depended on Lenis touch synchronisation and mobile WebKit compositor behaviour.
- Added a bounded `hero-reach-cover` wrapper. Desktop and fine-pointer devices retain the ScrollTrigger hero pin, while phones and coarse-touch devices use native CSS sticky for the same Section 2 cover composition.
- Disabled Lenis `syncTouch`, keeping the weighted wheel experience while returning phones to native momentum.
- Removed page-level horizontal clipping from the Home wrapper because an overflow ancestor can interfere with sticky containment. Reach now owns its local clipping instead.
- Removed the superseded mobile WebGL shader, demand-frame loop and unused mobile GPU configuration. Phones now have one clear production path: four section-owned absolute 2D canvases with independently baked mobile targets.
- Updated the foundation tests to protect the hybrid pin, native touch path and absence of the removed mobile WebGL implementation.
- Linting, TypeScript, the production build, all twelve foundation tests and the diff whitespace check pass. Final confirmation on the user's physical iPhone remains required.

## 2026-07-15, denser mobile particles and Stage 8 CMS schema

- Replaced duplicated mobile display copies with 2,200 independently sampled points per target so the particle objects read as finer continuous surfaces instead of clustered copies.
- Reduced the mobile point size to 1.3 while increasing the unique target density, keeping the section-owned canvas architecture and motion behaviour unchanged.
- Added three SQLite and D1-compatible migrations for content collections, field definitions, draft and published items, publish snapshots, references, assets, asset usage, audit events, enquiries and idempotency records.
- Seeded the protected Projects, Categories, Services and Site Settings collection schemas plus the Site Settings singleton.
- Added the shared CMS validation domain for stable keys, schema compatibility, every launch field category, asset readiness, alt text, references and archive protection.
- Added automated clean-database and upgrade-path tests. Linting, TypeScript, the production build, CMS tests, foundation tests and the diff whitespace check pass.

## 2026-07-15, Vercel-first hosting and protected Admin reads

- Confirmed Vercel as the first production host. Cloudflare is now only a possible future migration.
- Removed the unfinished Worker, Wrangler, D1 binding and Cloudflare Access implementation so the repository does not carry two competing server architectures.
- Added Vercel Functions for the Admin session, dashboard, collections and collection item lists.
- Added Clerk session verification, an exact owner user-ID allowlist and authorised-origin checks. The development bypass is accepted only in an explicit local non-production runtime.
- Kept the CMS portable through libSQL. Local development uses SQLite and Vercel Preview or Production can use Turso with the same reviewable migrations.
- Added `vercel.json`, a names-only environment template, a migration runner and server type checks. Production and complete dependency audits report no known vulnerabilities.

## 2026-07-15, Stage 10 collection builder and generated drafts

- Added protected collection creation and compatible schema editing through Vercel Functions, including field ordering, select options, reference targets and approved validation limits.
- Added generated Admin controls for every launch field category. Image and gallery fields expose an upload action rather than a path field, but the action remains disabled until Stage 11 connects storage.
- Added incomplete draft creation and editing. Entered values are validated on the server, references and assets are resolved from the database and stale versions return a conflict instead of overwriting newer work.
- Added exact same-origin checks for mutations and complete audit records using the verified Clerk user ID plus the request ID.
- Renamed the audit actor column through a forward migration rather than rewriting the already-applied operations migration.
- Lazy-loaded the complete Admin and Clerk client bundle so public routes do not download the CMS workspace.
- Verification covers repository mutations, the real protected request handlers, same-origin rejection, schema compatibility, stale writes and server-rendered output for all generated controls. The production build, server type check, lint and 24 automated tests pass. A fresh visual browser pass remains unavailable because the in-app browser runtime could not initialise.

## 2026-07-15, local Admin API development parity

- Fixed the local Admin loading failure where Vite returned the React application for `/api/admin/*` instead of executing the Vercel Function handlers.
- Added a development-only Vite adapter that maps every Admin API route to the same modules used by Vercel Preview and Production. No duplicate business logic or separate mock API was introduced.
- Added a local ignored development identity. The existing authentication policy rejects this bypass on Vercel and whenever `NODE_ENV` is production.
- Verified the live `npm run dev` path on a separate port and on the user's existing port 5173. Both the session and collection endpoints returned valid protected JSON, while a mutation without an Origin header returned 403 without changing data.
- Added route-mapping coverage. The production build, server type check and all 25 automated tests pass.

## 2026-07-15, Stages 11 to 15 media, publishing and public work

- Kept the real production Admin login. Clerk still verifies the session, authorised party and exact owner ID. Only the ignored local development environment uses the guarded bypass.
- Added validated media upload with button and drag-and-drop input, progress, preview, alt or decorative metadata, focal point, reusable selection, metadata editing, usage counts and published-usage archive protection.
- Selected Vercel Blob client-direct upload for production and an ignored local file adapter for development. Both create the same provider-neutral asset records, while editors never enter a storage path.
- Added Project preview, publish, republish, unpublish and archive actions with required-field validation, snapshots, audit events and optimistic versions. Public queries read only published snapshots.
- Seeded three clearly labelled internal or concept projects and removed the former hardcoded featured-project module.
- Built Works from the published API with filters, responsive cards, loading or error states and shareable case studies with adjacent navigation.
- Reused the published query and `ProjectCard` in the homepage runway without replacing its proven horizontal timeline or chapter 04 expansion.
- Added three restrained work formations to the existing persistent particle geometry. Their visibility is capped at 12 percent and mobile deliberately keeps the work interval clear.
- Verified a real local upload through Project creation, publication, public query and archive. The production build, server type check, dependency audit and all 26 automated tests pass. Fresh visual review remains open because the browser-control runtime fails before page inspection.

## 2026-07-15, Stages 16 to 20 process, enquiries and closing action

- Confirmed the existing quiet interlude, semantic four-step timeline and shared particle intake, hidden channel and outlet contract satisfy Stages 16 to 18 without replacing the approved interaction work.
- Activated the Contact form with server validation, accessible success or error recovery, a honeypot, HMAC-based rate limiting, 24-hour deduplication, libSQL storage and optional HTTPS webhook notification.
- Added a Clerk-protected Admin enquiry inbox and safe notification retry state. Private form fields are not written to application logs.
- Completed the privacy deep link, availability, optional public email, closing CTA and footer contact paths.
- Retained the current user-approved colony planet as the final fixed particle form. It supersedes the blueprint's earlier ribbon or arrow suggestion.
- Applied migration 7 to the local database. The production build, server types, dependency audit, diff whitespace check and all 29 automated tests pass. Fresh visual and physical-iPhone review remain open.

## 2026-07-15, Stage 21 and production-readiness foundation

- Added a short public-route curtain that reveals the destination without delaying navigation, while Admin and preview receive no decorative wipe.
- Added staged mobile-menu entry, route heading reveals and fine-pointer-only Works card parallax. The approved homepage particle, pin and runway timelines were not retimed.
- Added route announcements, anchors, focus and browser-back position handling plus URL-backed Works filters.
- Added intrinsic dimensions and intentional eager or lazy priority to all published Project media.
- Added field-associated Contact errors with summary recovery and first-invalid-field focus.
- Added dynamic Project metadata, private-route noindex, origin-correct robots, a published-Project sitemap, HSTS and frame denial.
- Added guarded local backup or restore tools and fixed item or publishing writes so simultaneous database clients cannot commit stale relationship, snapshot or audit side effects.

## 2026-07-16, responsive motion polish and deployment boundary

- Added one GSAP reveal controller for public copy, cards and media. Async CMS results are observed, reverse scrolling remains reversible and section-owned timelines opt out through a managed boundary rather than receiving duplicate animations.
- Added restrained Project image parallax across desktop, tablet and mobile. The Home runway uses card-centre horizontal offsets and the Works grid uses lower coarse-pointer vertical travel.
- Fixed the mobile process line so it paints behind the circular nodes. A follow-up audit found that revealing the whole card also hid its circle, so the reveal now belongs only to an inner content wrapper. All four nodes remain visible and their active state is measured from the circle itself. The result was confirmed at a 390 × 844 browser viewport.
- Fixed the light desktop header CTA contrast found during rendered browser review.
- Isolated the server-rendering test's Vite cache after it invalidated the live development preview's ScrollTrigger dependency files. Removed unsupported React 18 `fetchPriority` props while retaining eager first-image loading.
- Expanded `.gitignore` for all environment variants, provider metadata, private backups, exports, local uploads, databases, credentials and build caches. `.env.example` remains deliberately trackable.
- Documented the exact Vercel Clerk, Turso, Blob and enquiry variables, the recommended setup order, the Admin failure checks and the files that belong in GitHub.
- Validation passes with lint, production build, server type checking and 45 automated tests. Browser review covers Home, Works, Contact, a representative case study and local Admin. Physical-device and production Vercel measurements remain open.
- Added content-entry, verification and launch-checklist documents. Stage 22 physical devices and Stage 23 production field measurements remain open.

## 2026-07-16, complete public-route motion and responsive audit

- Calibrated odd and even desktop process-node offsets independently. Browser geometry shows right nodes exactly centred and left nodes within 0.008 CSS pixels of the one-pixel timeline.
- Sequenced Home Project cards at 0.28-second offsets, followed each media clip 0.04 seconds later and delayed chapter 04 until the Project sequence completes.
- Extended the shared GSAP controller with bounded delays and scrubbed media parallax. Works cards, case-study media and Contact content use it, while the Home runway keeps its dedicated timeline and particles remain outside GSAP.
- Removed the former Works-card requestAnimationFrame scroll listener. A dedicated inner media wrapper now separates GSAP translation from hover scaling and leaves one motion owner per transform.
- Fixed two responsive defects found through rendered review: ordinary Works cards no longer inherit the dark Home runway content surface, and case-study media no longer forces a 614 px minimum width on a 390 px phone.
- Opted into the supported React Router future flags and guarded empty GSAP target collections. No new React Router or missing-target warning appears after route remount. React Three Fiber still emits its dependency-level `THREE.Clock` deprecation notice with Three r183 and newer.
- Local browser evidence covers 320 × 568, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800, 1440 × 900 and 1920 × 1080. Home, Works, Contact and the representative case study have zero horizontal overflow at each checked size.
- Replaced entry `autoAlpha` with opacity-only reveals so unrevealed public links and controls remain in the accessibility tree. Focus-within exposes a target immediately. The Home runway follows the same entry rule and makes old Project cards inert only during chapter 04 expansion, restoring them on reverse scroll.
- Added a 640 × 400 zoom-equivalent layout pass. Literal browser zoom remains open because the in-app browser does not respond to the platform zoom shortcut.
- Production-preview asset inspection confirms the intended route boundary: phone Home excludes both particle and Admin chunks, desktop Home loads one particle chunk and no Admin chunk and `/admin` loads Admin without particles while remaining noindex.

## 2026-07-16, two-colour particles and public-page interaction direction

- Replaced the logo-facet colour regions with one geometry-relative stippled gradient. Every settled GPU form now distributes cyan and blue dots across its live position, removing the hard differently coloured logo corner while preserving subtle colour breathing.
- Matched the phone canvases and timeline flow to the same two-colour contract. Their deterministic colour buckets are calculated from each target's projected position, so the logo, rings and colony planet share the treatment without adding per-frame colour work.
- Advanced Closing formation from a point-entry threshold of 0.94 to 1.28 viewport heights and completes it by 0.62. Rendered phone and desktop evidence shows formation beginning while the colony-planet anchor is still below the viewport.
- Rebuilt the Works opening around a display-scale editorial headline, outlined WORK field, folio and scroll-linked drift. Project copy drifts in alternating directions while media keeps its independent vertical parallax.
- Replaced the weak light Works footer prompt with a dark commission panel and repaired outline-button theme inheritance. Outline controls now retain visible labels and use one directional fill interaction on hover or keyboard focus.
- Added a scrubbed slower-moving Contact form layer and a restrained rotating signal orbit behind it. Mobile uses reduced form travel to retain spacing and avoid overflow.

## 2026-07-16, guaranteed Works and Contact scroll choreography

- Confirmed that operating-system motion preferences do not disable Webine motion, then expanded the regression check across every CSS, TypeScript and TSX source file.
- Moved shared ScrollTrigger registration into one synchronous runtime used by Lenis, the public controller and Home timelines. This removes route-level loading races and keeps ScrollTrigger updates on the same animation loop.
- Delayed initially visible public reveals by 0.42 seconds so the route curtain clears before copy, cards and media animate. Late CMS card insertion now schedules one measurement refresh rather than retaining stale trigger geometry.
- Increased Works and case-study image travel to minus eight through plus eight percent on wider layouts and minus six through plus six percent on phones. Added eight percent media bleed while retaining completely still Project-card text.
- Gave Contact one unambiguous transform owner. The form now travels minus 72 through plus 96 pixels on wider layouts and minus 24 through plus 36 pixels on phones, without a competing percentage transform or CSS transform transition.
- Rendered evidence at 1280 × 720 measured about 49 pixels of Works media travel with zero copy movement and about 59 pixels of Contact form travel with 125 pixels of column clearance. At 390 × 844, Works media moved about 25 pixels and the form moved about 35 pixels. Both routes retained zero horizontal overflow and produced no new console warnings or errors.

## 2026-07-16, production GSAP lifecycle correction

- Compared `webine.vercel.app` with local development. The deployed bundle contained the complete current GSAP code, but `.site-shell` never received its controller-ready marker and no reveal or parallax element received an inline motion transform.
- Traced the production-only difference to `GsapRevealController` reading the parent shell ref during its first child layout effect. The ref was still unavailable, so the controller returned and never retried. React's development lifecycle ran the effect again and concealed the problem locally.
- Changed `SiteShell` to resolve the shell through a callback ref and mount the controller only after the real element exists. The controller now receives the element directly and cannot enter its setup effect with a missing root.
- Added structural regression checks for the resolved-element contract. The local production preview now reports `data-gsap-controller="ready"`, attaches motion ownership and produces no console warnings or errors.
- Production-preview evidence at 1280 × 720 measures about 59 pixels of Contact form travel with 125 pixels of column clearance. At 390 × 844, the form moves about 35 pixels. Both layouts retain zero horizontal overflow.
- Deployed Vercel evidence confirms the same controller-ready state. Works media travels about 49 pixels on desktop and 25 pixels on a 390-pixel phone while Project copy stays still. Contact travels about 59 pixels on desktop and 35 pixels on phone. Both routes retain zero horizontal overflow and produce no console warnings or errors.

## 2026-07-15, Hobby-safe Vercel Function consolidation

- Consolidated 22 individual files under `api/` into seven Vercel Function entrypoints: Admin, Projects, Site Settings, Enquiries, local media delivery, robots and sitemap.
- Kept the existing browser-facing API URLs. `vercel.json` rewrites dynamic Admin, Project and media paths to their grouped functions, then the entrypoints restore the original path before server routing.
- Moved grouped route dispatch into `server/api-routes/` so CMS, Clerk, Turso, Blob and enquiry business logic remain server-owned rather than duplicated in Vercel wrappers.
- Changed protected preview data loading to a path-based Admin API address so its collection and item identity do not depend on preserving query parameters through the Admin rewrite.
- Updated the development-only Vite API adapter to execute the same consolidated entrypoints used in Vercel Preview and Production.
- Added deployment tests that protect the seven-entrypoint topology, path restoration and rewrite configuration. Production build, server type checks and all 39 automated tests pass; the SQLite CLI-dependent tests were also run with an equivalent temporary SQLite test shim in this environment.

## 2026-07-16 — Lenis.dev-aligned synchronised touch profile

- Replaced the previous duration-weighted Webine scroll profile with Lenis' standard `lerp: 0.1` interpolation and neutral wheel/touch multipliers.
- Enabled `syncTouch` for phones with the official Lenis defaults `syncTouchLerp: 0.075`, `touchInertiaExponent: 1.7` and `touchMultiplier: 1`.
- Kept Webine's GSAP ticker integration, ScrollTrigger update hook, anchor offset and navigation inertia cleanup.

## 2026-07-16, dark Works gallery and Contact containment correction

- Removed the alternating Works-card copy drift after visual review. Project titles and metadata are now stable while the media alone keeps restrained scroll parallax.
- Changed the complete Works index and case studies to one dark visual system. Cards use large image-led compositions, minimal label, year and title copy and a blue directional overlay on hover or keyboard focus. Touch layouts retain the same essential information in stable copy without freezing the overlay open.
- Added one reusable CSS-only ambient particle field to Works, case studies and Contact. It uses deterministic cyan and blue DOM points, imports no Three.js code and runs no JavaScript animation loop.
- Removed the Contact orbit signal instead of converting it to a GLB. The lightweight field provides depth while the floating form remains the main interaction.
- Rebalanced the desktop Contact columns and headline scale so the heading finishes 143 px before the form at 1536 × 900. The mobile layout stacks cleanly with no overlap.
- Browser review covers Home, Works, Contact and one case study at 320 × 568, 390 × 844, 768 × 1024, 1280 × 800 and 1536 × 900. No route has page-level horizontal overflow or unintended clipped text. The Home runway intentionally positions later cards outside the viewport until horizontal scroll brings them in.

## 2026-07-16, fixed Works galaxy and livelier ambient field

- Inspected the supplied Lenis showcase HTML plus its exact CSS and lazy WebGL chunks. The reference uses a fixed React Three Fiber canvas, 100 shader points, 3D simplex-noise movement, scroll-linked depth wrapping and a very large radial atmospheric glow.
- Adapted the visual principle rather than its full renderer. Works now uses one fixed CSS `GalaxyBackdrop` across the index and valid case studies, combining a slate-950 field, a broad cyan or blue nebula and deterministic stars without importing a second Three.js bundle.
- Increased ambient point movement through independent curved drift, scale and twinkle timing. Contact and the Home hero use the lighter 20-point field. Hero layering keeps the field above the grid but below its text and narrative particles.
- Phones retain 34 Works stars and 12 ordinary ambient points. Rendered checks at 320, 390, 768, 1280 and 1536 CSS-pixel widths confirm fixed Works positioning, zero page-level horizontal overflow and no unintended text clipping.
- Source and implementation findings are recorded in `research/2026-07-16-lenis-showcase-teardown.md`.

## 2026-07-16, explicit Home hero atmosphere order

- Audited the real stacking contexts rather than relying on DOM order. The original hero-owned ambient field sat below the text but above the fixed desktop Webine logo renderer because the complete hero section formed a higher stacking context.
- Moved the ambient field to the shared `home-page` atmosphere layer. The fixed desktop renderer and section-owned phone canvas now paint above it, while hero typography and controls remain above both particle layers.
- The explicit particle order is ambient atmosphere at layer 0, Webine logo particles at layer 1, then HTML content at layer 2.

## 2026-07-16, real-iPhone Works atmosphere and vector-mark correction

- A physical iPhone screenshot showed that the first Works nebula was effectively invisible. The mobile field had been shifted too far below the viewport, reduced to 80 percent opacity and then covered by an opaque commission surface.
- Rendered inspection also found an undefined `--primitive-blue-950` stop, which caused the browser to discard the complete nebula background declaration. Replaced it with the defined slate-950 token and removed the same stale token from Contact shadows.
- Raised and strengthened the lower-half horizon in Webine cyan and blue, increased its mobile field to 270vw by 104vh at full opacity and made the dark commission panel slightly translucent with restrained backdrop blur. The intent is a readable atmospheric horizon, not a generic glow applied everywhere.
- Replaced the commission panel's Unicode `↗` with the shared outlined `DirectionalArrow` SVG. Added a source-wide test that rejects emoji-prone Unicode arrows in CSS, HTML, TypeScript and TSX interface files.
- These corrections preserve the project-specific fixed galaxy while strengthening the wider quality rule: verify subtle material effects on physical phones and use controlled vector glyphs for interface direction.
- Final validation passes with lint, production build, server type checks, all 45 automated tests, diff whitespace checks and an npm production-dependency audit with zero known vulnerabilities.

## 2026-07-16, touch-clean Works cards and Admin breadcrumbs

- Removed the coarse-pointer rule that permanently exposed every Works image overlay. The overlay is now a deliberate hover or keyboard-focus response only, while the always-visible label, year and title preserve the complete touch path.
- Replaced the Admin topbar's inert page title with semantic breadcrumbs. Overview, Collections and the active collection are real ancestor links, while the current schema or item state uses `aria-current="page"`.
- Made long breadcrumb trails horizontally scrollable inside their own header region so the Admin page does not create viewport overflow on phones.
- Validation passes with lint, production build, server type checks and all 45 automated tests. A rendered 390 × 844 Admin item editor confirms a 390 px document width, a 64 px topbar and a complete clickable trail with no clipping.

## 2026-07-17, About page model and portrait narrative

- Added the public About route as a complete studio story rather than a biography grid. The page moves from Webine's two-perspective positioning through a model-derived point head, working philosophy, Kidson and Whai Hoe portraits, principles and a project CTA.
- Derived a deterministic 9,000-point surface target from the supplied `head_study.glb`. The visitor payload is about 105 KB instead of the original 16 MB GLB, and the source attribution remains recorded in `docs/model-attribution.md`.
- Kept both supplied portraits unchanged. Apple Vision person masks provide exact subject silhouettes, allowing each 2D canvas to draw the person from the bottom upwards before fading into the pixel-aligned grayscale photograph.
- Added a fine-pointer colour spotlight and a labelled touch or keyboard colour toggle. Image and canvas layers share one intrinsic 1122 by 1402 wrapper, preventing responsive drift or subject clipping.
- Implemented the brief's About-only reduced-motion path. It leaves the head formed and portraits visible while retaining their semantic content and colour controls. Existing Home, Works and Contact motion behaviour is unchanged.

## 2026-07-17, project-focused Admin media workflow

- Kept the provider-neutral asset table, item-to-field references and shared media library. The data model already records project context after save, so no destructive migration was needed.
- Extracted the existing local and Vercel Blob upload path into one Admin upload utility. Both the global Media library and project fields now use the same validation, progress and completion flow.
- Added direct upload and existing-library choice inside image fields. Selected media shows its role, dimensions and filename with explicit replacement and removal controls. Generic gallery fields preserve order and expose earlier or later controls.
- Added a Project media overview for cover, hover, story-block and social images. Its saved or unsaved status mirrors the complete draft, and field links move directly to the relevant control.
- Added dirty-state protection. Preview, publish, republish, unpublish and archive cannot use stale data, the save button reflects the real state and browser or Cancel navigation warns before discarding changes.
- Rendered the new-project workflow at 390 × 844 and 1280 × 800. Choosing an existing cover updates the Project summary and enables Save draft without creating or modifying a database record during visual QA.

## 2026-07-17, business-outcome Services page

- Added `/services` using only Webine's documented initial offer: website strategy, interface and visual direction, responsive development and defined ongoing support.
- Structured the page around what each service changes for the client rather than a generic deliverables list. Draft prices, paid media, managed hosting and unproven later-stage services remain excluded.
- Added one section-owned scroll composition. Desktop uses a sticky active-service rail, scrubbed content hierarchy and one rotating outlined scope field. Mobile returns to a clear linear chapter flow with normal vertical scrolling.
- Reused the CMS-backed Understand, Shape, Build and Support content for the working path, then added the documented client-ownership position and a direct project enquiry CTA.
- Rendered checks pass at 1280 × 800 and 390 × 844 with one H1, zero horizontal overflow and no page console errors.

## 2026-07-17, About contour reveal and real service menu refinement

- Replaced the earlier About head study with the user-supplied `simple_head.glb`. The same deterministic preparation script now produces `simple-head-points.bin`, retaining the 9,000-point and approximately 105 KB runtime budget with updated source attribution.
- Removed the 58rem visual cap from the sticky head scene. Its WebGL canvas now occupies the complete visible hero frame, so scroll dispersion travels across the viewport while the semantic hero copy remains above it.
- Replaced filled person-mask sampling with contour detection. Each portrait now draws only the subject outline from bottom to top through a one-shot viewport-entry timeline, then fades the particles and reveals the grayscale photograph.
- Removed the touch and keyboard colour-toggle button. Colour is now a non-essential fine-pointer spotlight that follows the pointer locally and returns to grayscale on exit. Touch retains the complete grayscale portrait without a frozen hover state.

## 2026-07-17, fluid About portrait reveal

- Replaced the hard circular colour spotlight with a canvas-composited organic trail. Overlapping blurred lobes interpolate between pointer samples and decay gradually, creating a soft residual wake instead of a cursor-shaped cut-out.
- Changed the contour reveal from particles appearing at their final coordinates to stable seeded particles travelling from below the frame. Individual stagger, curl, cyan-to-blue stippling, soft cores and settled drift connect the portrait animation to Webine's wider particle language while keeping the route lightweight.
- Preserved the agreed order: viewport entry starts the rise, the full silhouette holds, particles fade and the grayscale photograph appears. The sequence remains one-shot rather than scroll-scrubbed, and touch remains grayscale without a false hover control.
- Replaced the abstract Services labels with five offers supported by the business plan: web design and development, website redesign, monthly maintenance, SEO foundations and branding support. Maintenance is described as a bounded monthly subscription and SEO is explicitly a foundation rather than a ranking guarantee.

## 2026-07-17, floating navigation and singular contact path

- Removed Contact from the repeated desktop, mobile and footer text navigation. The route remains public and `Start a project` remains the consistent conversion action to `/contact`.
- Reworked the fixed header as an inset translucent surface with restrained blur, border and shadow. Its background and elevation strengthen after 24 pixels of scrolling without moving page content or creating a second scroll system.
- Grouped desktop route links in a compact inner pill, retained visible current, hover and focus states and preserved the labelled full-screen mobile menu.
- Rendered the header at 1280 × 800 and 390 × 844. The mobile menu contains Home, About, Services and Works plus the project CTA, and the scrolled desktop state reports no horizontal overflow.
- Added regression coverage for the singular Contact path, floating container and scroll-state contract. Lint, production build, server type checks and all 48 automated tests pass.

## 2026-07-17, flexible secondary-page header system

- Standardised the eyebrow, display-heading, description and floating-header clearance across About, Services, Works, Contact, public case studies, protected previews and the not-found page.
- Used shared classes and variables instead of a wrapper component because each route already owns a deliberately different grid. This avoids new nesting that would weaken the About head, Services field, Works ghost title, Contact form and case-study media compositions.
- Gave every Georgia heading phrase the accessible theme-aware brand blue. Contact and case-study variants keep their narrower scales and measures while inheriting the same typography, wrapping and motion order.
- Removed the superseded per-page title sizes, margins, summary measures and accent colours. Page-specific grid placement and artwork remain local.
- Rendered About, Services, Works and Contact at 390 × 844, plus Works, Services, Contact and a case study at 1280 × 800. Every route has one H1, deliberate accent colour, zero unintended clipped copy and zero horizontal overflow.
- Added structural regression coverage. Lint, production build, server type checks and all 49 automated tests pass.

## 2026-07-17, refined surface radius scale

- Replaced the earlier 4, 8 and 12 pixel accumulation with a deliberate 8, 14, 20 and 28 pixel scale for compact details, controls, media and major panels. True pills and circles remain explicit exceptions.
- Mapped buttons and inputs to the control radius, project and portrait frames to the media radius and the Contact form, commission panel and Admin project-media overview to the panel radius.
- Added appropriate rounding to previously square Admin cards, media surfaces, choice rows and navigation controls without softening the complete application shell.
- Preserved the Home chapter card's intentional animation to a zero radius only when it becomes a full-width section.
- Rendered Works and Contact at 1280 × 800 and the Project Admin at 1280 × 800 and 390 × 844. The hierarchy reads as 14 pixel controls, 20 pixel media and 28 pixel panels with zero horizontal overflow.
- Token regression coverage, lint, production build, server type checks and all 49 automated tests pass.

## 2026-07-17, controlled Lenis input and anchor ownership

- Audited installed Lenis 1.3.25, the GSAP ticker, ScrollTrigger registration, route restoration, section-owned RAF loops and every direct scroll listener. Public pages retain one Lenis instance and Admin remains native.
- Changed wheel interpolation from 0.1 to 0.075 and the wheel multiplier from 1 to 0.92. Added an 84-pixel hyperbolic per-event cap through Lenis `virtualScroll`, preserving small trackpad deltas while compressing extreme wheel bursts.
- Applied the cap only to wheel events. Touch retains the existing official synchronised values and overscroll, so the change does not add delayed touch physics or fight iOS bounce.
- Replaced the incomplete anchor-focus listener with one same-page anchor path owned by Lenis. It measures the real floating header, scrolls with the correct offset, records the hash and focuses the target after completion.
- Real browser input measured a 24-pixel wheel gesture settling at 22 pixels and a 5,000-pixel event settling at 83 pixels. Eight extreme events remained progressive, reversed cleanly after opposite input and kept the GSAP controller ready.
- Rapid input held the Home work scene at its pin while the runway transformed, then reached Process with zero horizontal overflow and no console errors. A 390 × 844 Home pass retained section-owned 2D canvases, no desktop WebGL canvas and no errors.
- Lint and production build pass. The complete suite passed 48 of 49 on its first run because a temporary Vite directory was still being removed; the isolated failed Admin renderer test passed immediately on rerun.

## 2026-07-17, full-density particles and additive object interaction

- Replaced the reusable ambient DOM field with one deterministic canvas renderer. Home and Contact use 58 points, Services uses 64 and the Works galaxy uses 118, including the full count on phones.
- Added ambient particles behind the Services hero and replaced the desktop Services rail circle with a 780-point cyan-to-blue particle orb.
- Standardised particle-object interaction around additive motion. Scroll rotation accumulates from the current pose, pointer movement adds damped whole-object tilt and nearby particles bulge without removing points or carving a hole.
- Applied the same local pointer bulge to the About head shader. Its first ScrollTrigger measurement is synchronised before display and the model offset is corrected so the head begins centred instead of snapping after the first scroll input.
- Removed the superseded About-only operating-system reduced-motion branch. Webine now keeps one complete motion system across all public routes, with responsive implementation differences based on input, viewport and renderer ownership.
- Preserved visual density while reducing avoidable work through capped DPR, bounded frame rates, stable buffers, colour-bucket drawing, offscreen pause and Page Visibility pause. Particle count is not used as the main performance fallback.

## 2026-07-17, About mobile contour performance and stable head centring

- Reduced only the About portrait contour workload where the dense outline was visibly dropping frames. Mobile uses at most 850 contour points instead of the 2,400-point desktop ceiling, while retaining complete silhouette coverage through even spatial selection.
- Removed per-frame layout measurement and canvas resizing from the portrait renderer. Mobile now runs at 30 FPS, 1× DPR and a single core-point pass. Desktop keeps the glow pass and a 45 FPS ceiling.
- Kept the colour engine prepared but idle until a supported pointer enters. Eligibility uses the real pointer event instead of a media query, because capability queries can incorrectly suppress mouse or trackpad hover. Touch events are rejected explicitly. Trail updates mutate stable points instead of allocating a new mapped array each frame.
- Reduced the About head to 5,600 evenly selected runtime points and a 1.05 DPR cap below 768 px while retaining all 9,000 source points on wider layouts.
- Recentered the head geometry around its real particle centroid before rotation, moved ScrollTrigger setup into the layout phase and removed cumulative scroll-delta rotation. The top-of-page pose is now deterministic and cannot depend on scrolling down and back up.

## 2026-07-17, reliable About hover reveal and desktop portrait scale

- Moved the fluid colour reveal from React component pointer props to native pointer listeners attached directly to each portrait frame. This keeps the canvas input path active in the real browser while preserving mouse and pen support and explicitly rejecting touch.
- Capped desktop portrait frames at 28rem while retaining the original aspect ratio and fluid mobile width. The images now support the team copy without dominating the full section.
- Kept the existing organic multi-lobe residual mask, grayscale fallback and idle-until-interaction renderer. No duplicate hover implementation or legacy event props remain.

## 2026-07-17, rebuilt About portrait layers and editorial composition

- Removed the superseded colour-canvas renderer completely after it remained unreliable in the user's browser. The portrait now keeps the real colour image underneath an SVG grayscale layer, and interaction only erases the grayscale mask.
- Built the fluid reveal from 40 reusable SVG circles. The live pointer owns a persistent soft anchor, previous circles form a 1.45-second residual trail and leaving the frame restores the complete grayscale image.
- Reduced the desktop image cap from 28rem to 25rem. Rebuilt the adjacent copy with oversized Railway names, blue Georgia punctuation, indexed role rules, stronger descriptions and alternating alignment.
- Tightened the team gaps, team padding and following principles clearance so the smaller photography does not create empty editorial rows.
- Kept touch intentionally grayscale without a hover hint. The existing particle-outline entrance and grayscale handoff remain unchanged above the new photograph stack.

## 2026-07-17, aligned About portrait parallax

- Added a single moving media wrapper inside each clipped portrait frame. The colour image, SVG grayscale mask and silhouette particle canvas are all children of this one transform owner.
- Applied restrained section-local parallax from -3.8% to 3.8% on desktop and -2.2% to 2.2% on phone, scrubbed at 1.1. The wrapper uses 1.08 overscan so movement cannot expose the frame background.
- Changed hover coordinate sampling to use the transformed media rectangle rather than the static outer frame. The fluid colour reveal therefore stays beneath the pointer after scroll parallax has shifted the photograph.
- Kept the text static for readability. Only the media stack moves.

## 2026-07-17, reduced About contour density

- Reduced the portrait-outline budgets by exactly 30% without changing their timing, seeded movement, parallax ownership or grayscale handoff.
- Desktop now uses at most 1,680 particles instead of 2,400. Mobile now uses at most 595 instead of 850.

## 2026-07-17, varied About contour flow

- Reduced the desktop contour cap again, from 1,680 to 1,200. Mobile stays at 595 because its problem was rigid motion rather than remaining density.
- Replaced the shared-looking settled drift with deterministic per-particle speed, amplitude, curl direction, curl strength, phase and flow offset values.
- Added stronger individual currents during travel, smaller independent floating after arrival and subtle point-specific breathing. Motion remains alive through a 0.55-second hold and the complete fade into the grayscale portrait.

## 2026-07-18, USTA-informed electron motion and kinetic cursor

- Standardised every particle object around seeded point-level motion rather than relying mainly on whole-object rotation. The Home GPU narrative and About head use three-axis shader drift, mobile Home objects use two-frequency pixel-space orbits and the Services orb uses individual local x, y and z orbits.
- Increased dispersal freedom without increasing particle counts. GPU transition spread rises to 0.88, mobile scatter scale rises from 0.17 to 0.22 and About portrait origins now span beyond both sides of the portrait frame.
- Reduced the About desktop contour budget again, from 1,200 to 900. Mobile remains at 595, with wider amplitude and more varied speed because its requested correction was natural flow rather than another density reduction.
- Replaced short shared ambient oscillation with wider two-frequency paths. Existing full mobile density, DPR caps, frame ceilings, offscreen pause and Page Visibility pause remain unchanged.
- Added one public `KineticCursor` through `SiteShell`. A tight higher-opacity core and slower lower-opacity halo follow the pointer independently. The halo morphs toward bounded clickable-control geometry and strengthens on press. It is disabled below 48rem, for touch and coarse pointers and throughout Admin.
- Removed backdrop blur from the cursor after live inspection showed it softened button labels. The final cursor never intercepts input and does not replace keyboard focus or stable link and button states.

## 2026-07-18, porous particle objects with bounded orientation

- Used the supplied USTA motion recording to refine the distinction between particle-level motion and whole-object movement. Held forms now use a small seeded spatial halo plus secondary low-frequency paths, giving the surface visible gaps and a soft moving edge without changing particle counts.
- Increased individual travel across the persistent Home GPU targets, About head, Services orb and section-owned phone targets. The phone envelope remains intentionally tighter than desktop so the Webine W stays legible on a narrow canvas.
- Replaced accumulated Home scroll rotation with a clamped impulse limited to 0.26 radians that eases back to the authored pose. Reduced the shared idle yaw and changed the Services orb from an unlimited turn to a bounded -0.3 to 0.68 radian chapter range with a small reversing idle oscillation.
- Preserved narrative rotations that communicate formation and dispersal. The change applies to idle and input contribution, so section state remains deterministic and reverse scrolling still produces the same scene.

## 2026-07-18, restored particle facing and sharper mobile forms

- Restored the authored whole-object motion profile from the earlier approved iteration, including its 0.38-radian idle yaw, restrained x and z rotation, slower full-turn timing and lighter pointer contribution. The newer point-level movement, porous surfaces and bounded scroll response remain unchanged.
- Set the Services chapter endpoint to -1.1 radians. This reproduces the earlier final facing modulo a complete turn without restoring the unnecessary full revolution.
- Tightened the phone target halo from 1.6 to 0.5 pixels and reduced its orbit envelope. An identity-squared mobility curve keeps most points close to the source form while a smaller group retains the lively independent movement.
- Added an eased formation blend so the ring, Webine logo and closing object read clearly earlier in their section transition without changing the section thresholds or the 2,200-point mobile budget.

## 2026-07-18, central particle tuning and colour-density refinement

- Preserved the restored authored orientation values from the approved earlier iteration. The adjustment targets local point behaviour and silhouette clarity, not additional whole-object tumbling.
- Centralised ambient-field, About-head and Services-orb counts, motion ranges, colour speeds, frame ceilings and pointer limits in `src/config/experience.ts`.
- Added slow point-specific cyan-to-blue changes to the GPU, phone, Services and ambient render paths. Added bounded GPU opacity pockets to create an uneven porous surface while retaining the complete point budget and readable source silhouette.
- Kept phone Home objects at 2,200 points with the tightened 0.5-pixel halo, identity-squared mobility and eased target blend. A 390 by 844 production render shows the Business Value ring clearly defined while retaining the approved individual movement.
- Completed the radius-token pass for Admin status, collection, error, content and asset controls. The expanded kinetic cursor already resolves to the shared card radius while its resting state remains circular.

## 2026-07-18, coherent travelling particle surfaces

- Replaced isolated point colour toggles with two broad moving object-space bands plus a small seeded residual term. Deep blue, cyan and light blue regions now travel across the Webine logo, Home forms, About head, Services orb and ambient canvases without turning the complete object into one colour.
- Added a slower independent density field so sparse areas move coherently across each form. Points are dimmed rather than removed, keeping the full geometry and preserving the authored silhouette.
- Kept the approved whole-object orientation values unchanged. Mobile retains the 2,200-point targets, 0.5-pixel halo and independently phased paths, while light scenes use darker blue endpoints and a higher density floor for definition.
- Increased the shared ambient counts to 84 on Home, 76 on Contact, 84 on Services and 138 on Works. Existing DPR caps, frame ceilings, offscreen pause and hidden-document pause remain in place.

## 2026-07-19, stable About canvas and central hero scale

- Removed the ready-state scale transform from the element that owns the About Three.js canvas. Its entrance is now opacity-only, so React Three Fiber measures one stable viewport instead of resizing from 96% to 100% after the model becomes ready.
- Increased the Home Webine logo scale through `particleSceneConfig.hero` for desktop, tablet and mobile. This remains the single global tuning surface for responsive scene size.
- Changed the default control radius primitive to `2rem` and updated the design-system reference and regression coverage.

## 2026-07-19, GLB-owned Reach particle form

- Replaced the procedural desktop Reach target with `public/models/reach-rings-particle.glb`. The model preserves the existing three elliptical rings as real indexed mesh geometry.
- Added `particles.reachModel.rotationDegrees` to the central experience configuration. Desktop and tablet apply it during GLB surface sampling, while mobile applies the same value to its baked neutral target before projection.
- Added a deterministic model generator that rebuilds both the GLB and the Reach slice of the lightweight mobile binary, avoiding two manually maintained versions of the form.

## 2026-07-20, mobile portrait lifecycle and navigation alignment

- Kept the complete 595-point mobile and 900-point desktop portrait-outline sequences unchanged, including their movement, timing, parallax and grayscale handoff.
- Released each one-shot portrait canvas after its fade completes by disconnecting resize observation, cancelling pending animation work, clearing the particle array and reducing the transparent backing buffer to 1 by 1 pixel.
- Kept the SVG residual colour reveal for devices with any fine hover pointer. Touch-only devices skip its blurred paint layer and use the same photograph with a static grayscale filter because touch has no hover reveal.
- Limited portrait transform promotion to the section's active parallax range and added paint containment around each clipped portrait.
- Rebuilt the mobile menu corner as one border-box-aligned 14-pixel mark centred within its 44-pixel trigger. Kidson and Whai Hoe now share the title Co-founder.

## 2026-07-20, liquid portrait reveal and axis-aware image parallax

- Rebuilt the fine-pointer portrait reveal as expanding, displaced radial waves layered with the existing residual trail. The colour now blooms beyond the pointer with a soft irregular boundary, while leaving the frame still returns the portrait to grayscale.
- Centralised the portrait outline, completed-outline hold, particle fade, image reveal, image reveal delay and hover ripple values in `src/config/experience.ts`.
- Added one `createImageParallax` helper with an explicit horizontal or vertical axis, one transform owner, clamped viewport ranges, refresh-safe measurements and active-only transform promotion.
- Assigned vertical parallax to About portraits, Works cards and case-study media. The Home selected-work runway keeps horizontal image travel through the same axis contract.
- Disabled immediate `from` rendering for image parallax so a pinned hero refresh cannot apply an early transform to content below it and cause a direct-load jump.
## 2026-07-20, asset-aware Webine loading system

- Replaced the public-only two-panel route curtain with one loader shared by Home, Works, Services, About, Contact, Admin, preview and not-found routes.
- Adapted the supplied The First The Last reference at the concept level. Webine's split `WEB` and `INE` wordmark converges across a dotted cyan-to-blue signal, expressing the established scattered-to-shaped brand story without copying the reference's tags, Lottie or fake five-second percentage.
- Reduced the final visual to a flat slate background and a small converging wordmark with generous empty space. `WEB` and `INE` now use the same primary typeface, and their shrinking distance is the only progress indicator. Removed the percentage, line, dots, bar, ambient glow, loader grid, eyebrow and status labels.
- Progress now follows fonts, route-specific GLB or binary assets, Site Settings and CMS pending signals, particle-engine readiness, current image decoding and settled layout frames. A 12-second ceiling prevents a failed asset from trapping the route.
- Delayed global GSAP setup until the loader's left-to-right wipe fully closes. The Home hero holds its particle intro at zero behind the loader, then begins its breathing and gathering choreography after the screen clears.
- Removed `RouteTransition`, its CSS keyframes and the obsolete transition configuration instead of retaining two route-entry systems.

## 2026-07-20, complete particle-object configuration surface

- Added `particles.interludeObject` for the Section 4 elliptical particle form. Band count, x and y radii, band spacing, tube radius and orientation now live in `src/config/experience.ts` instead of being hidden in the target generator.
- Connected the central values to desktop procedural target generation and the same orientation to the mobile baked target path. Default values reproduce the current approved object without a visual reset.
- Confirmed that every formed object now has a named central block: Home hero, Reach, Section 4 interlude and closing objects, About head and portrait outline, and the Services orb. Responsive Home scale and anchors remain alongside them in `particleSceneConfig`.

## 2026-07-20, unclipped editorial typography

- Limited the shared GSAP reveal clip path to media. Copy still receives the coordinated opacity and vertical reveal, but returns to `clip-path: none` so italic overshoots, descenders and wide Georgia phrases remain visible after the entrance completes.
- Gave the Contact accent phrase a wider text column, a responsive single-line scale and a small glyph-safe inline gutter so “unmistakable” remains complete without reducing the surrounding headline unnecessarily.
- Added lower and inline breathing room to the Services hero accent so “Ready to evolve.” retains its descenders and italic edge at wide viewports.
- Removed the oversized decorative outline arrow from the Works commissioning panel. The labelled Start a project control remains the only directional action in that panel.

## 2026-07-23, production service readiness and final interface cleanup

- Added one server-owned readiness contract for Vercel Blob and the enquiry hash secret. The protected Admin overview reports missing configuration without exposing values, while production deployment now fails before compilation when a required Clerk, Turso, Blob or enquiry variable is absent.
- Passed the Clerk session token through the client-direct Blob upload handshake. Missing Blob configuration now returns a specific recovery message instead of the generic workspace failure.
- Added validated GIF upload support to both Media and inline image fields. GIF content is MIME-checked, frame-capped and retained without flattening animation.
- Made Archive a direct Media-card action with published-usage protection, confirmation and visible recovery guidance.
- Removed the branded Webine loader from Admin while keeping its functional local skeleton states. Public routes retain the asset-aware loader and Home breathing sequence.
- Removed the complete Works commissioning container. Project cards and their existing Contact paths remain the only Works conversion surfaces.
- Added restrained cyan-to-blue backlights behind the Home Webine particle logo and About head, with a stronger but still text-safe mobile treatment.
- Added explicit `private, no-store` and `X-Robots-Tag: noindex, nofollow` document headers to `/admin`, nested Admin routes and `/preview`. Client metadata and robots rules remain the second layer rather than the only protection.
- Rechecked Home, About, Services, Works, Contact and Admin at 1280 by 800 and 390 by 844. Every checked route has zero horizontal overflow, the previously clipped Contact and Services accents remain complete and the removed Works panel does not leave a blank section.
- Lint, client production build, server type checking, all 55 automated tests, diff whitespace validation and the production dependency audit pass.

## 2026-07-23, production refactor and mobile navigation precision

- Set the mobile header's internal horizontal padding to the requested 20 px and moved the menu corner mark by -0.3rem on both axes. The desktop header keeps its existing 12 px padding.
- Lazy-loaded About, Services, Works, Contact, Preview and not-found alongside the existing Admin boundary. Home remains eager and readable. The initial application entry falls from approximately 145.01 KB gzip to 74.05 KB gzip without changing route behaviour or adding another visible loader.
- Added strict unused-code, implicit-return, switch-fallthrough, side-effect-import and override compiler checks. Expanded zero-warning ESLint coverage from the browser source to server modules, Vercel handlers, development adapters, scripts, tests and Vite configuration.
- Removed the unused `SectionHeading`, obsolete section-grid and work-card shape styles, one retired font-status style and unused primitive tokens. No compatibility duplicate or commented replacement remains.
- Consolidated the shared API envelope, validation issue and published Project contracts. Admin fetch and mutation responses now pass through one parser and return a stable typed error when a proxy or function responds with non-JSON.
- Added a Node 22 version file, exact navbar and lazy-route regression checks and malformed Admin-response coverage. The complete suite now contains 57 passing tests.
- Browser review at 320 × 700, 390 × 844 and 1280 × 800 confirms the intended responsive padding, zero horizontal overflow, successful lazy loading across every public route and no branded loader in Admin.

## 2026-07-23, hero backlight containment

- Stopped the desktop hero backlight immediately when the persistent particle layer moves above the Reach surface. The Reach particle object keeps its existing position, density, colour and motion.
- The correction is keyed to particle-layer depth rather than the active-scene label because the pinned hero can remain geometrically closest while Reach is already covering it.
- Rendered review confirms zero backlight opacity during the Reach formation at 1280 × 800 and a clean opaque Reach cover at 390 × 844, both without horizontal overflow.

## 2026-07-23, Admin lifecycle, notifications and media policy

- Replaced the Project item table with responsive stretched-link cards. The complete card opens its editor, while isolated quick actions publish drafts, archive published work and permanently delete only draft or archived records.
- Kept archived records visible so the published → archived → purged lifecycle can be completed. Permanent deletion requires typing `DELETE`, rejects published or referenced records, removes snapshots transactionally and retains an audit event.
- Reused one Project editor action component at the top and bottom of the form. Save, preview, publish, republish, unpublish, archive, purge and cancel therefore share one behaviour contract.
- Added direct Resend email delivery after the enquiry has been stored, with visitor reply-to, an idempotency key and the existing HTTPS webhook retained as an alternative. Admin explains pending, sent and failed states and deployment readiness reports whether either notification provider is complete.
- Added migration `0009_site_settings_defaults.sql`. It publishes the exact current website copy only when the singleton is still `{}`, preserving owner edits. Nested setting groups now keep valid object or array structures instead of being flattened into text.
- Kept particle choreography in `src/config/experience.ts` because those settings affect renderer performance and section geometry. Ordinary CMS changes cannot silently destabilise the particle engine.
- Raised the shared image policy from 20 MB to 50 MB, preserved animated GIF payloads and retained the 12,000-pixel and 500-frame safety caps. The browser, Vercel token and completed-upload verifier read the same policy.
- Applied the new migration to the ignored local database. Lint, production build, server type checking and all 60 automated tests pass.

## 2026-07-23, Project media and case-study presentation

- Removed the website-generated inset from Project hero and story images. Frames now fill edge to edge with eight percent vertical bleed for the existing parallax, while the CMS focal point remains the responsive composition control.
- Standardised the Home selected-work runway to a 16:10 media contract and a single full-height desktop grid row. The Works-only featured-card selector is now scoped to the Works grid, so it cannot change the first Home card.
- Added a final `Bento feature` option to the existing image content block. It accepts one finished 16:10 composition and removes the forced section label, letting a shorter case study close visually.
- Added migration `0010_project_showcase_presentation.sql` and the existing schema-generated colour control now edits a per-Project accent. Only `/works/:slug` applies that value to its local background gradient. Invalid or unset legacy values fall back to Webine blue.
- Recommended 2400 × 1500 px for Project cover, hover, story and bento media, with 1600 × 1000 px as the minimum. Important content remains inside the central 80 percent to tolerate focal cropping and parallax.

## 2026-07-23, Project nebula colour ownership correction

- Removed the independent case-study section gradient from the preceding presentation pass.
- Added an optional Project accent to `GalaxyBackdrop`. Valid Project slugs pass their accent to the nebula only, with atmospheric stops derived from the same hue at different transparencies.
- Preserved the fixed dark background, complete ambient particle canvas and original cyan-to-blue `/works` nebula.

## 2026-07-23, Project editor case-study grouping

- Moved Industry, Location, Project duration, Completed on, Platform and stack, About the client, URL and Case study accent colour directly below Slug through migration `0011_project_editor_field_order.sql`.
- Removed the unused Card theme schema field, its public content property and its stored draft, published and snapshot values.
- Restyled the native colour input so its swatch remains visible in WebKit and Firefox, while retaining the linked hex input.

## 2026-07-23, capped touch glide and refined public scroll

- Kept one Lenis runtime and one `virtualScroll` input normaliser. No second physics loop, touch trap or page-owned scroll controller was introduced.
- Changed desktop interpolation from `0.075` to `0.065`, wheel multiplier from `0.92` to `0.86` and the nonlinear wheel ceiling from 84 to 72 pixels.
- Added a separate 48-pixel nonlinear touch ceiling. Reduced the touch release exponent from `1.7` to `1.35`, touch multiplier from `1` to `0.9` and inertia interpolation from `0.075` to `0.05`, compressing extreme swipes while extending the visible glide after release.

## 2026-07-23, protected case-study media framing

- Retained one consistent 16:10 frame for Project hero and story media so mixed case studies keep a stable editorial rhythm.
- Replaced aggressive edge-to-edge cover cropping with a contained 104 by 108 percent image layer inside a dark matte. Most source content now remains visible even when an uploaded screenshot is not exactly 16:10.
- Reduced case-study image parallax to four percent on desktop and three percent on compact viewports. Other Works, Home and About parallax distances remain unchanged.
- Kept 2400 × 1500 px as the preferred Project image export because it matches the frame exactly and provides enough resolution for large desktop displays.
