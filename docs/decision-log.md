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
- Added restrained GSAP ScrollSmoother on fine-pointer desktop layouts. Mobile, Admin and unsupported layouts retain native scrolling.
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
- Added a normal-scroll card-to-section expansion. It avoids CSS sticky because the desktop smooth-scroll transform makes sticky containment unreliable.

## 2026-07-13, chapter 04 card expansion clarification

- Superseded the separate matching-panel entry. The final Selected Work card itself now owns the expansion.
- Applied vertical-driven horizontal movement on desktop, tablet and mobile rather than keeping a native nested carousel on smaller screens.
- Locked horizontal travel when the final card reaches the viewport centre. Remaining scrub progress changes only the card size, position, corner radius and compact-to-full content state.
- Aligned the real interlude beneath the full-screen card so pin release is a seamless takeover and reverse scrolling restores the card and runway.
