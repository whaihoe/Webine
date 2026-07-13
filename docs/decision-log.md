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
