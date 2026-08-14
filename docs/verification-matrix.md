# Webine verification matrix

Status updated on 23 July 2026. A local browser pass is not a substitute for physical-device, production or cross-browser evidence.

## 2026-08-14 bounded production MP4 completion

- A synthetic 28 MB MP4 with its `moov` metadata after a large `mdat` payload is verified through four bounded R2 reads. The test bucket rejects any unbounded object request.
- The verifier returns the stored 2752 by 1536 display dimensions and original byte size without reading the media payload. Top-level box traversal is capped at 64 boxes and the accepted metadata box is capped at 4 MB.
- Upload authorisation, exact R2 size and MIME checks remain ahead of byte verification, and the shared 30 MB MP4 limit is unchanged.
- The CSP permits Cloudflare's versioned Web Analytics beacon from `static.cloudflareinsights.com`; the security test still rejects broad `https:` script and connection sources.

## Viewport and input matrix

| Viewport or input | Status | Evidence still required |
|---|---|---|
| 320 × 568 mobile | Local browser pass | Physical touch, 200% zoom and real-device motion |
| 390 × 844 iPhone class | Local browser pass, physical open | Safari forward or reverse particle story, native sticky cover, runway and rotation |
| 768 × 1024 tablet portrait | Local browser pass | Physical touch, orientation and GPU composition |
| 1024 × 768 tablet landscape | Local browser pass | Physical touch or precision-pointer confirmation |
| 1280 × 800 laptop | Local browser pass | Cross-browser trackpad and measured frame stability |
| 1440 × 900 desktop | Local browser pass | Cross-browser full visual rhythm |
| 1920 × 1080 large desktop | Local browser pass | Physical maximum-width particle placement |
| Keyboard-only | Public reveal pass | Complete sequential route and Admin dialog operation on a physical browser |
| iOS Safari | Open | Physical-device evidence |
| Android Chrome | Open | Physical-device evidence |
| Safari, Chrome, Firefox and Edge desktop | Open | Live cross-browser evidence |

The in-app browser confirms Home, Works, Contact and a representative case study without horizontal overflow at every listed viewport. The tablet runway stays pinned and horizontal. Timeline nodes centre on the line, Home work cards reveal sequentially and responsive GSAP media parallax remains active. Physical hardware, other browser engines, orientation changes and 200% zoom are still open.

A 640 × 400 CSS viewport, equivalent to the layout pressure of a 1280 × 800 viewport at 200% zoom, has zero overflow on Home, Works, Contact and the representative case study. The in-app browser did not respond to macOS zoom shortcuts, so this is recorded as a zoom-equivalent layout pass rather than literal 200% browser-zoom evidence.

## Automated and production-build evidence

- Production build completes. Public CSS is 19.18 KB gzip and the initial application entry is 74.05 KB gzip after route-level splitting.
- About, Services, Works, Contact, Preview and not-found are separate lazy route chunks. Admin remains a separate lazy chunk at 69.97 KB gzip.
- The React Three Fiber dependency remains lazy at 226.34 KB gzip and is not part of the initial application entry. The remaining Vite large-chunk warning is recorded rather than hidden.
- One WebGL canvas and one particle geometry serve the complete tablet or desktop narrative.
- Section-owned phone canvases use the baked 2D targets and capped controller profile.
- Signal Grid pointer work is visibility-gated and requestAnimationFrame-throttled.
- Published image responses now include intrinsic dimensions. The first Works card and case-study hero receive eager priority while later media loads lazily.
- Browser review from 320 × 568 through 1920 × 1080 confirms no horizontal overflow on Home, Works, Contact or the case-study state. All timeline nodes remain visible independently of their card reveals, paint above the line and activate from their real circle position. Odd and even desktop nodes are centred to within 0.008 CSS pixels of the line.
- Home Project cards show distinct intermediate opacities during entry, confirming the 0.28-second sequence. Works cards, case-study media and Contact fields use coordinated GSAP entry or parallax without adding GSAP attributes to particle elements.
- Rendered 1280 × 800 and 390 × 844 checks confirm the two-colour stippled particle treatment, early Closing formation while its anchor remains below the viewport, the rebuilt Works opening and the floating Contact form without horizontal overflow.
- Rendered 1536 × 900 and 390 × 844 checks confirm the cohesive dark Works gallery, minimal card copy and accessible overlay. Mouse hover or keyboard focus raises the overlay opacity to 1 and exposes its label and direction control. Touch layouts keep the image clean because the essential label, year and title remain visible below it.
- Contact no longer uses the orbit signal. A 58-point ambient canvas sits below the content, and the desktop headline finishes 143 px before the form. The stacked 390 px layout has clear vertical separation.
- Works renders one fixed `GalaxyBackdrop` on both its index and valid case-study states. Browser checks at 320 × 568, 390 × 844, 768 × 1024, 1280 × 800 and 1536 × 900 confirm `position: fixed`, zero page-level overflow and 118 points on desktop and phone.
- The Home hero and Contact each render 58 ambient canvas points on desktop and phone. The renderer bounds its frame rate, caps DPR and pauses outside the viewport or in a hidden document without GSAP ownership.
- Works and Contact GSAP motion is render-verified independently of operating-system motion preferences. At 1280 × 720, the first Works media wrapper moved about 49 px while its copy stayed at `transform: none`, and the Contact form moved about 59 px while retaining 125 px of column clearance. At 390 × 844, the same media moved about 25 px and the form moved about 35 px. Both routes retained zero horizontal overflow and a fresh navigation pass produced no console warnings or errors.
- Production-lifecycle regression: the built preview, not only Vite development, must expose `data-gsap-controller="ready"` on `.site-shell`. The resolved-element correction passes at 1280 × 720 and 390 × 844, assigns the Contact form to parallax motion, preserves the same measured travel and produces no console warnings or errors. A missing ready marker indicates controller initialisation failure even when the minified bundle contains GSAP.
- The deployed `webine.vercel.app` build now passes the same lifecycle gate. Live Works media moves about 49 px at 1280 × 720 and 25 px at 390 × 844 while Project copy remains at `transform: none`. Live Contact moves about 59 px and 35 px at those viewports. Both routes keep zero horizontal overflow and the final desktop and phone navigation passes report no console warnings or errors.
- Home hero stacking is explicit and rendered at both 1280 × 800 and 390 × 844: ambient field layer 0, desktop WebGL or phone-owned logo layer 1 and hero content layer 2. The Webine logo therefore always paints above the decorative ambient points.
- The corrected Works galaxy is rendered at 1280 × 800 and 390 × 844 with a non-empty computed radial gradient, full nebula opacity and zero horizontal overflow. The former commissioning panel and its complete container have been removed without leaving an empty section.
- A text-containment audit across Home, Works, Contact and a representative case study at 320, 390, 768 and 1280 CSS-pixel widths found no unintended clipped text. The only viewport-offset results belong to the Home horizontal runway, whose later cards are deliberately outside the viewport, and transformed media wrappers clipped by their image frames.
- Regular Works cards no longer inherit the Home runway's dark content theme. Mobile headings, service pills and links retain readable light-surface colours. Case-study media respects the available column width at every breakpoint.
- Public GSAP reveals are coordinated through one controller, while the selected-work runway declares its own managed boundary. The development test renderer now uses an isolated Vite cache so it cannot invalidate the running local preview's ScrollTrigger bundle.
- Offscreen Works cards remain visible to accessibility APIs even while their entry opacity is zero. Focusing a Project link immediately produces opacity 1 and a visible two-pixel outline. The same contract passes for Home runway Project links and the offscreen Contact project-outline field. Runway cards become inert only during chapter 04 expansion and return on reverse scroll.
- Production-preview asset inventory confirms that a verified 390 px Home viewport loads neither the Three.js particle chunk nor the Admin chunk. A 1280 px Home viewport loads one particle chunk and one canvas but no Admin code. `/admin` loads the Admin chunk, no particle chunk and retains `noindex, nofollow`.
- Route focus, anchors, browser back-position restoration and listener cleanup are structurally covered.
- Backup and restore, two-connection optimistic concurrency, protected Admin access, publishing, media, enquiries, metadata, robots and sitemap behaviour are automated.
- Vercel uses seven consolidated Function entrypoints. Automated routing coverage protects the Hobby-safe entrypoint count, grouped rewrites and restoration of the original API paths.
- The final dark-gallery and Contact-containment pass completes lint, production build, server type checks, all 45 automated tests, diff whitespace checks and an npm production-dependency audit with zero known vulnerabilities.
- The fixed-galaxy pass completes lint, production build, server type checks, all 45 automated tests, diff whitespace checks and an npm production-dependency audit with zero known vulnerabilities.
- The Admin breadcrumb pass renders a nested new-item route at 390 × 844 with linked Admin, Collections and Projects ancestors, a correctly marked current page, a 64 px topbar and zero document overflow. Automated coverage protects both the breadcrumb link structure and hover-only Works overlay contract.
- The About page passes local rendered checks at desktop and 390 × 844. The supplied head form loads from the compact 9,000-point binary target, scroll dispersion remains section-owned, Kidson and Whai Hoe retain natural 1122 by 1402 proportions and their subject silhouettes form from pixel-aligned masks. Touch retains grayscale without a colour control. No page error was recorded; the only browser warning is the existing Three.js clock deprecation emitted by React Three Fiber.
- The project Admin editor passes rendered checks at 390 × 844 and 1280 × 800. Cover, hover, story and social roles are visible before selection. Choosing the existing seed asset shows the cover preview, changes the editor to `Changes not saved` and enables Save draft. Removing it restores the clean disabled `Draft saved` state. Existing integration coverage still proves upload, draft save, publication, public delivery and archive protection through a temporary database.
- The Services page passes rendered checks at 1280 × 800 and 390 × 844. Desktop keeps one sticky chapter rail while service copy moves in normal document flow. Mobile removes the rail and preserves the complete chapter hierarchy. The 390 px document has a 390 px scroll width, one H1 and no console errors.
- The floating header passes rendered checks at 1280 × 800 and 390 × 844. It uses a translucent canvas-colour surface with backdrop blur at rest and while scrolled, exposes `data-scrolled="true"` after the threshold and retains zero horizontal overflow. Desktop and mobile navigation follow Home, Works, Services and About, while the only Contact entry is the labelled `Start a project` CTA. Opening and closing the mobile dialog does not shift the header or page layout.
- The Stage 4 validation pass completes lint, production build, server type checks and all 48 automated tests.
- The shared secondary-page heading system passes rendered review on About, Services, Works and Contact at 390 × 844, and Works, Services, Contact plus a published case study at 1280 × 800. All checked headings and summaries remain unclipped with zero horizontal overflow. Georgia accents compute to the theme-aware brand blue. The case-study utility row begins below the floating header at both widths.
- The Stage 5 validation pass completes lint, production build, server type checks and all 49 automated tests.
- The earlier radius-scale pass was render-verified on Works and Contact at 1280 × 800 and the Project Admin at 1280 × 800 plus 390 × 844. It measured 14 px standard controls before that value was superseded. The current default control radius is verified later in this matrix as `2rem`; project media remains 20 px, major panels remain 28 px and compact Admin surfaces remain 8 px.
- The Stage 6 validation pass completes lint, production build, server type checks and all 49 automated tests.
- Lenis 1.3.25 input normalisation is measured with real browser wheel events. A normal 24-pixel event settles at 22 pixels, while a 5,000-pixel event settles at 83 pixels instead of jumping through a scene. Eight extreme events advance progressively, five opposite events reverse direction and both `data-scroll-runtime` and the GSAP controller remain ready.
- Rapid controlled input reaches the Home runway with its section held at the viewport top and a live horizontal track transform, then continues into Process without trapping input. The 390 × 844 path retains four section-owned particle canvases, reports live mobile states, loads no desktop particle canvas and has zero horizontal overflow.
- A real pointer click on the Contact privacy anchor updates the URL to `#privacy`, focuses the privacy section and respects the maximum available scroll plus floating-header clearance. Keyboard scroll remains native because the virtual input cap applies only to wheel events. Admin has no `data-scroll-runtime` marker.
- No browser error is recorded during the Stage 7 input pass. The existing React Three Fiber `THREE.Clock` deprecation remains the only warning on About and Home.
- Stage 7 lint and production build pass. The full suite recorded one environment-only temporary-directory cleanup race; the single failed Admin renderer test passed immediately on isolated rerun. The final clean complete-suite run passed all 49 tests.
- Final ship-readiness audit passes lint, production build, server type checks, the test-server build, all 49 automated tests and `git diff --check`. Production-preview review covers Home, About, Services, Works, Contact and the not-found route at 1920 × 1080, 1280 × 800, 768 × 1024, 390 × 844 and 320 × 568. Across those 30 route and viewport states, each page has one H1, its heading remains inside the viewport and no document has horizontal overflow.
- The final production-preview interaction pass confirms the 320 px mobile menu opens with focus on Close, exposes Home, Works, Services, About and Start a project, then closes without header or document-width shift. About loads one compact head canvas and keeps both 1122 by 1402 portraits aligned. Services changes its active desktop rail chapter during scroll and removes that rail on mobile. No production-preview console error was recorded.
- The final source audit finds no stale Contact text-navigation entry, superseded anchor handler, duplicate image-upload implementation, retired radius value or operating-system reduced-motion branch. Public routes own one Lenis runtime and Admin remains native. No environment contract or database migration changed in this work.
- The refined About production preview loads the 9,000-point simple-head source derivative inside a full-frame canvas. Desktop renders all points, while the 390 px runtime selects 5,600 evenly distributed points. Formed and dispersed states use that full frame, both checked viewports retain one H1 and zero horizontal overflow.
- Portrait review confirms contour-only mask sampling, a bottom-up one-shot viewport entrance, particle fade followed by the grayscale photograph and no colour-toggle button. Fine-pointer movement exposes colour only around the pointer. Moving away closes that local reveal. Touch keeps the stable grayscale photograph.
- Services now renders five business-plan-supported chapters: web design and development, website redesign, monthly maintenance, SEO foundations and branding support. The built preview exposes all five semantic articles, keeps the sticky rail as a desktop grid, removes it on the 390 px layout and retains zero horizontal overflow.
- The About and Services refinement passes lint, the production build, server type checks, the isolated test-server build and all 49 automated tests. The built preview reports both the Lenis and GSAP controllers ready. The existing React Three Fiber `THREE.Clock` deprecation is the only About warning; no page error was recorded.
- The fluid portrait pass renders a cyan-to-blue contour rising from below the image, holds the completed silhouette and hands it to the grayscale portrait at 1280 × 800. The fine-pointer colour layer is now a transient canvas mask made from overlapping blurred lobes with a 1.15-second residual decay, replacing the earlier circle clip. The 390 × 844 pass retains zero horizontal overflow and does not create a touch colour-toggle state.
- The 23 July production-readiness pass completes lint, the client production build, server type checks, all 55 automated tests, `git diff --check` and a production dependency audit with zero known vulnerabilities. Browser review at 1280 × 800 and 390 × 844 covers Home, About, Services, Works, Contact and Admin with zero horizontal overflow. Admin renders no branded page loader, accepts GIF input, exposes direct Archive actions and reports the missing local Blob and enquiry configuration accurately. Home and About render their new backlights behind the particle objects rather than above their copy. Vercel configuration now assigns private no-store and noindex headers to Admin and preview documents.
- The Admin lifecycle pass proves that published content cannot be purged directly, archived content can be purged with its snapshots removed and the audit event remains. Clean migrations publish the current Site Settings record, the contact email field stays optional and owner-edited records are protected by the empty-record condition.
- The notification pass stubs the Resend Email API and confirms owner recipient, visitor reply-to, successful status and one recorded attempt. Runtime readiness accepts either complete Resend configuration or the existing webhook, while the production environment check rejects partial Resend values.
- The media pass asserts the 15 MB image and 30 MB MP4 policies and verifies that a real GIF payload retains its original bytes. Browser selection rejects unsupported or oversized files before upload, while upload authorisation, Blob metadata verification and the server repeat type, size, dimensions and frame validation.
- The final automated gate passes lint, the production client build, strict server type checking, the isolated test-server build, all 60 tests and `git diff --check`.
- The final refactor pass expands linting to client, server, API, development adapters, scripts, tests and Vite configuration, and enables unused-code, implicit-return, fallthrough and override compiler checks. All 57 automated tests pass.
- Route-level splitting reduces the initial application entry from approximately 145.01 KB gzip to 74.05 KB gzip. Direct mobile navigation through About, Services, Works, Contact and Preview confirms every lazy route resolves, removes its pending signal and retains zero horizontal overflow.
- Responsive header verification at 320 and 390 CSS pixels confirms exactly 20 px of internal horizontal padding, the requested -4.8 px menu-mark offset and zero horizontal overflow. The 1280 px header retains its existing 12 px desktop padding and desktop navigation.
- The hero-backlight containment check reproduces the pinned transition state where `activeScene` remains `hero` while particle depth has moved to `reach`. At 1280 × 800 the backlight computes to opacity 0 with no transition, Reach particles remain visible and the document has zero horizontal overflow. The 390 × 844 opaque Reach cover also remains clean.

## Measurements still required

- LCP at or below 2.5 seconds at the 75th percentile
- INP at or below 200 ms at the 75th percentile
- CLS at or below 0.1 at the 75th percentile
- Particle frame stability on representative mid-range iOS, Android and laptop hardware
- Automated accessibility scan on rendered Home, Works, Contact and key Admin screens
- Contrast, literal 200% browser zoom and complete keyboard confirmation in physical browsers

## 2026-07-17 full-density particle and layout pass

- Home, About, Services, Works, Contact and the not-found route were inspected at 1280 × 800 and 390 × 844. Every route retained one in-bounds H1 and document width equal to viewport width.
- About begins with centred runtime geometry in its full-frame canvas, using 9,000 points on desktop and 5,600 on mobile. Initial ScrollTrigger progress is applied during layout, preventing the first-scroll centre snap.
- Services shows a 64-point ambient hero and the desktop chapter rail shows the new 780-point interactive particle orb. The mobile linear service layout remains complete without mounting the hidden desktop rail renderer.
- Home mobile keeps the full 2,200 sampled points per section. Works keeps 118 ambient points on phone and desktop. Home and Contact keep 58 points and Services keeps 64.
- Intentional Works media bleed and the Contact honeypot are contained and do not create horizontal page overflow or visible text clipping.
- Lint and production build pass after the renderer and shader changes. The complete automated suite passes after updating its old mobile-density expectation from 0.7 to 1.

## 2026-07-17 About performance correction

- Mobile portrait contours are structurally capped at 850 particles, 30 FPS, 1× DPR and one drawing pass. Desktop retains up to 2,400 points and its soft glow pass.
- The contour draw path no longer calls `getBoundingClientRect`, changes canvas dimensions or creates colour strings during each animation frame.
- The colour reveal checks the real pointer event. Mouse and pen input can start the residual mask, while `pointerType="touch"` is rejected and cannot create a frozen hover state. The prepared renderer remains idle until pointer entry.
- The head renderer centres every source axis around the calculated particle centroid. Its pose depends on ScrollTrigger progress rather than accumulated scroll deltas, so returning to the same scroll position returns the same visual centre.
- The source-wide regression test protects the mobile point limits, centred geometry and responsive DPR caps. Lint, production build, server type checks and all 49 automated tests pass.

## 2026-07-17 About hover and portrait scale correction

- A real Zen browser pointer pass at desktop width visibly paints local colour through the grayscale Kidson portrait and leaves the intended soft residual wake before clearing. The effect is driven by native `pointerenter`, `pointermove` and `pointerleave` listeners, while touch remains excluded.
- The same rendered pass confirms each desktop portrait is capped at 28rem, retains the 1122 by 1402 source proportion and remains balanced with its adjacent copy.
- Lint, the production build, server type checks, the isolated test-server build and all 49 automated tests pass after the correction. Automated coverage protects listener setup and cleanup, the absence of obsolete JSX handlers and the desktop width cap.

## 2026-07-17 rebuilt About portrait system

- A live Zen desktop pass confirms the resting portrait is completely grayscale. Moving diagonally across Whai Hoe's portrait exposes the real skin, shirt and green background colour through a soft connected trail, holding position keeps a local colour anchor and leaving restores the full grayscale layer after the residual decay.
- The rendered desktop composition uses a 25rem portrait cap, oversized indexed names and tighter alternating rows without the earlier image-copy overlap. The following principles section starts sooner, reducing the empty transition area.
- A 390 by 844 responsive pass confirms the image-first stack, large Whai Hoe name, role metadata and description remain within the viewport without clipping or horizontal overflow. Touch simulation does not show the desktop hover hint.
- Automated coverage confirms the colour image and SVG grayscale layers, luminance mask, native listener cleanup, touch rejection, 25rem cap and large-name scale.

## 2026-07-17 About portrait parallax alignment

- Live Zen inspection found active section-specific parallax values of 0.4811% for the visible Kidson wrapper and -2.6364% for the approaching Whai Hoe wrapper at the same scroll position.
- For both portraits, the shared media wrapper, colour image and particle canvas returned identical rendered x, y, width and height values. The visible Kidson stack measured 429.83 by 537.65 pixels across all three layers, proving the parallax transform cannot separate the contour from the photograph.
- A real pointer trail across the already-transformed Kidson portrait continued revealing colour at the correct facial position. The mask samples the transformed media rectangle rather than the outer frame.
- Regression coverage protects the shared wrapper ownership, scrubbed parallax, 1.08 overscan and transformed coordinate space.

## 2026-07-17 About contour density reduction

- Source inspection confirms the desktop limit is 1,680 and the mobile limit is 595, both exactly 70% of their previous budgets.
- The change is isolated to contour sampling. Frame rate, DPR, seeded motion, glow policy, entrance timing, parallax and photograph handoff remain unchanged.

## 2026-07-17 About contour flow refinement

- Source inspection confirms a 1,200-point desktop cap and unchanged 595-point mobile cap.
- Every generated point has independently seeded `floatSpeed`, `floatAmplitudeX`, `floatAmplitudeY`, `curlStrength`, `curlDirection`, `phase` and `flowOffset` values. Travel and settled motion use these values instead of one shared drift frequency.
- The canvas continues drawing throughout formation, the 0.55-second completed-outline hold and the 0.85-second fade, preventing the visible freeze before the grayscale handoff.
- A 402 by 874 simulated phone render shows a complete readable Kidson silhouette at the reduced mobile rendering budget. The entrance remains aligned inside the portrait parallax wrapper.

## 2026-07-18 electron-motion and cursor pass

- Source inspection confirms the persistent GPU shader applies independent three-axis motion through `electronRate`, `electronAmplitude` and `electronPhase`, while its four dispersal branches use the configurable 0.88 transition spread.
- Source inspection confirms all 2,200 mobile object points retain their existing budget and 30 FPS ceiling. Their scatter projection increases from 0.17 to 0.22 and every drawn point receives independently phased two-frequency x and y motion.
- The About head retains 9,000 desktop and 5,600 mobile points with independent three-axis shader movement. The portrait contour uses 900 desktop and 595 mobile points, wider off-frame origins, larger varied currents and continuous drawing through hold and fade.
- The Services orb retains 780 points, capped DPR, 45 FPS ceiling, viewport pause and Page Visibility pause. Every particle now owns a seeded speed, amplitude and orbit bias before the existing object rotation and pointer bulge are applied.
- A live 1280 by 800 Home pass shows the complete folded Webine logo, readable hero content, ambient depth and zero horizontal overflow. Hovering Start a project changes the cursor state to interactive, contracts the core to seven pixels and morphs the halo to approximately 148 by 54 pixels.
- A live 1280 by 800 About pass shows the head centred on initial load. Direct entry to the team section shows the wider contour field, then a clean particle-to-grayscale handoff with a 368 by 460 portrait canvas and zero horizontal overflow.
- A live 1280 by 800 Services pass shows the 351 by 351 service object inside its sticky rail with independent local point movement, readable service content and zero horizontal overflow.
- A 390 by 844 About pass retains a 358 by 447 portrait, complete grayscale handoff and zero horizontal overflow. The cursor CSS and runtime are both gated at 48rem plus fine-pointer capability, so phone layouts do not run the custom cursor.

## 2026-07-18 porous particle and bounded-orientation pass

- The final production shader uses a 0.075 formed-object halo, 0.056 three-axis travel and independent secondary low-frequency paths. The same geometry and particle budgets remain in place, so the change adds surface porosity without duplicating points or adding a renderer.
- Home scroll rotation is clamped to plus or minus 0.26 radians and damped back to zero. Shared idle yaw is reduced to 0.34 radians. Services chapter rotation is bounded from -0.3 to 0.68 radians and its former unlimited time-based turn is replaced by a 0.14-radian reversing oscillation.
- Phone Home objects keep all 2,200 points, a 30 FPS ceiling, a tighter 1.6-pixel static halo and multi-frequency paths. The final 390 by 844 production pass reports all five section canvases live, one H1 and zero horizontal overflow.
- Live 1280 by 800 production checks show the Webine logo retaining its folded silhouette with a wider moving edge, the About head retaining its designed facing and the 351-pixel Services object remaining porous inside the sticky rail. Home, About and Services report zero horizontal overflow and no browser errors.
- The complete ship-readiness run passes the production build, server type checks, isolated test-server build and all 50 automated tests. The existing large React Three Fiber chunk warning remains documented and did not change in this refinement.

## 2026-07-18 restored orientation and mobile-definition pass

- Source comparison against the approved earlier revision confirms the shared object motion values are restored to 0.055 x rotation, 0.38 y rotation and 0.025 z rotation, with the original lighter float and pointer contributions.
- A 390 by 844 production render at the Business Value scene shows the procedural ring as a readable formed object rather than a loose cloud. It retains all 2,200 points, independently phased paths, a 30 FPS ceiling and zero horizontal overflow.
- Live 1280 by 800 production renders show the folded Home logo, centred About head and Services object retaining their intended facings. Home, About and Services have zero horizontal overflow, and the Services console reports no errors.

## 2026-07-18 central particle-control pass

- Source comparison confirms the current 0.055 x, 0.38 y and 0.025 z shared orientation values match the restored approved iteration. The Services endpoint remains -1.1 radians, which preserves its earlier facing without an unlimited revolution.
- A fresh 390 by 844 production render at the Business Value section shows a readable ring with the complete 2,200-point budget, tighter formed-state silhouette and independently moving edge.
- Direct-load and down-then-up About checks at 1280 by 800 retain the same centred head position. The Services object remains readable and bounded during chapter progress.
- The production build passes. The existing large React Three Fiber chunk warning remains unchanged and documented.

## 2026-07-18 coherent surface-field pass

- Source comparison confirms the shared 0.055 x, 0.38 y and 0.025 z object rotation values still match the approved earlier orientation. The Services endpoint remains -1.1 radians and the closing GLB retains its authored 58, -22, 0 degree model preparation.
- Fresh 390 by 844 production renders confirm a defined Business Value ring, centred About head and clearly formed closing planet. Light-scene particles use darker blue endpoints while keeping cyan and blue region movement.
- Fresh 1280 by 800 renders confirm the About head and closing planet retain readable silhouettes with broad moving colour and density regions. Works and Contact mobile renders show the increased ambient fields without obscuring copy.
- Lint, client and server type checks, production builds and all 50 automated tests pass. The existing React Three Fiber chunk warning remains unchanged.

## 2026-07-19 stable About canvas and hero scale pass

- At a 1420 by 1027 viewport, the About Three.js canvas measures 1420 by 955 CSS pixels and 1917 by 1289 render pixels both before and after scrolling. The ready state no longer changes either dimension.
- Fresh desktop and 390 by 844 Home renders show the enlarged Webine logo remaining behind readable hero copy with zero horizontal overflow.
- The live document resolves `--primitive-radius-default` to `2rem`. Lint, production builds and all 50 automated tests pass.

## 2026-07-19 Reach GLB pass

- The production loader reads `reach-rings-particle.glb` without falling back, samples it into the persistent desktop particle geometry and shows the three-ring silhouette at complete Reach formation.
- A 390 by 844 production render shows the baked model-derived Reach rings with zero horizontal overflow. Mobile retains its six lightweight canvases and does not import Three.js.
- Regression coverage protects the model asset, central rotation configuration, desktop model load, removed procedural Reach buffer and mobile rotation path.

## 2026-07-20 mobile portrait lifecycle pass

- At 390 by 844, the mobile Menu control remains 44 pixels high and its 14-pixel corner mark is centred within 0.5 pixels of the trigger centre. The page has zero horizontal overflow.
- Both team entries render Co-founder. Their existing 358 by 447, 595-point outline canvases complete the full entrance and fade before each backing buffer is reduced to a hidden 1 by 1 surface.
- Touch-only CSS removes the unavailable SVG blur layer and keeps the final photograph grayscale. Devices with any fine hover pointer retain the residual colour reveal and pointer-type validation.
- Lint, the production build, server type checks, the test-server build and all 50 automated tests pass. The existing React Three Fiber chunk warning and Three.js Clock deprecation warning remain dependency-owned and unchanged.

## 2026-07-20 liquid reveal and parallax stability pass

- Compared the supplied hover recording against the implemented portrait mask. Fine-pointer movement now creates expanding radial waves with turbulence displacement, a soft edge and a decaying residual trail rather than one fixed circular cutout.
- A direct About reload at scroll position 3387 measured the same portrait frame top and media top immediately and 900 milliseconds later. The media transform remained vertical and did not jump after the pinned hero and ScrollTrigger refresh settled.
- Source checks confirm horizontal image travel for the Home runway and vertical travel for About portraits, Works cards and case-study images. Every shared image tween uses clamped viewport ranges, `immediateRender: false` and refresh invalidation.
- Lint, the production client build, server type checks, test-server build and all 50 automated tests pass. The existing React Three Fiber chunk warning remains unchanged.
## 2026-07-20 asset-aware loader pass

- Fresh Home entry at 1280 by 800 shows the loader while the hero reports `waiting`. After the loader wipe, the hero reports `running`, retains its breathing pause and reaches `complete` without horizontal overflow.
- Fresh About entry at 390 by 844 starts with scroll locked, completes only after the head visual reports ready, restores scrolling and has zero horizontal overflow. Both word halves remain inside the viewport during the separated state.
- Services, Contact and Works show the loader on direct entry, release within the expected readiness window, leave no pending markers and report zero horizontal overflow at 1280 by 800. Admin now deliberately skips the branded loader and uses functional inline skeletons only while workspace data is pending.
- Browser console checks report no application errors. The existing dependency-owned Three.js Clock deprecation warning remains unchanged.
- Lint, the production client build, server type checks, isolated test-server build and all 50 automated tests pass. The existing large React Three Fiber chunk warning remains unchanged.

## 2026-07-20 typography overflow pass

- Source inspection confirms shared copy reveals finish with `clip-path: none`, while media reveals retain their inset mask. This removes the common clipping cause without weakening image reveal choreography.
- Contact now gives the Georgia accent a full-width title measure, responsive scale and glyph-safe right padding. Services gives its accent explicit inline and descender clearance.
- The Works commissioning panel was later removed completely. Project cards and the persistent project CTA provide the remaining conversion paths.
- Lint, the production client build, server type checks, isolated test-server build and all 50 automated tests pass. `git diff --check` reports no whitespace errors. A fresh browser screenshot pass was unavailable because starting the local preview server was not approved in this session.

## 2026-07-23 Project showcase presentation pass

- At 1280 × 720, all four Home runway Project cards measure 382 px high and every media frame measures the same 382 px. The document retains zero horizontal overflow and the next card remains deliberately visible at the right edge.
- The Deszio case-study hero fills its 686 × 429 frame edge to edge. The image keeps 8 percent vertical bleed for parallax, computes to `object-fit: cover` and causes no page-level horizontal overflow.
- A valid slug keeps the fixed galaxy and particle canvas, while `--galaxy-project-accent` changes only the nebula and its secondary haze. The case-study section has no independent background image. The Works index retains the original primitive cyan-to-blue nebula and does not receive the Project modifier or accent variable.
- The migrated local Admin renders `Case study accent colour` with linked colour and text inputs. Editing the text input to `#e879a8` updates both controls without saving during QA. Image content blocks offer Wide and Full width layouts with an ordered maximum of three assets. Bento is a separate multi-image block whose public and protected-preview renderers use the stored image dimensions.

## 2026-07-26 production hero cover and Project interaction pass

- Reproduced the desktop discrepancy at 1280 by 720. Local development pinned `.hero` at the viewport top, while the deployed Vercel build left it `position: relative` even though both environments matched the desktop capability query.
- Traced the difference to `HeroCoverTransition` capturing its sibling ref before the first production layout was complete. The effect now resolves that ref after font readiness and two layout frames, then reports `data-hero-pin-state="ready"`.
- A clean Node 22 production preview keeps the hero fixed at scroll position 84 and lets Reach rise over it by scroll position 756. The Reach particle layer also reports its intended depth and remains visible.
- Home Project foregrounds now use `object-fit: contain`, with a subdued blurred duplicate filling unused frame space. Horizontal scroll parallax moves the media wrapper by 5.5 percent, while hover scale remains on the image.
- The About portrait exposes a fine-pointer 4.5 percent local colour lens and ring at the liquid ripple centre. Touch and coarse-pointer rules remove the unavailable lens while preserving the grayscale fallback.
- Each Works `.project-card__content` is one semantic link. Clicking its metadata, title or description opens the same Project route, with visible hover and keyboard-focus feedback.
- The supplied 14islands Cogent route was traced to a React Three Fiber scroll rig with approximately 5.5 percent texture-coordinate parallax and a displacement-texture `Ripples Effect`. Webine adapts those principles through its existing GSAP and SVG or DOM owners instead of adding another global WebGL renderer.
- Fixed-width frame renders at 320 by 700, 390 by 844, 768 by 1024, 1024 by 768, 1280 by 720 and 1920 by 1080 have zero horizontal overflow. Phones retain native sticky ownership, widths from 768 upward report the production pin ready and all six widths render four contained Home Project thumbnails.
- Zero-warning lint, the Node 22 production build and all 60 automated tests pass. The existing React Three Fiber chunk-size warning and Three.js Clock deprecation warning remain dependency-owned and unchanged.

## 2026-07-26 Project interaction and portrait distortion correction

- Replaced the rejected contained Home thumbnail and blurred duplicate with one `object-fit: cover` image. Its movement owner extends six percent beyond each horizontal edge, which safely contains the complete 5.5 percent travel without letterbox bands or an exposed edge.
- At 320, 390, 768, 1024, 1280 and 1920 pixels wide, all four Home cards render one cover image, no backdrop duplicate and enough left and right layer bleed to cover their frame. Every checked width has zero horizontal page overflow.
- Works content links compute to a transparent background at 320, 768 and 1280 pixels wide. The hover or focus timeline moves metadata down three pixels and the title up three pixels, with a reversible `power3.out` transition and no card lift.
- From a scrolled Works index, clicking Deszio opens `/works/deszio-studio` at scroll position zero. Browser Back restores the prior Works position, proving the new Lenis reset does not replace POP restoration.
- The case-study close action contains the exact supplied SVG path `M6 12H18M6 12L11 7M6 12L11 17` in a `0 0 24 24` view box. The existing source-wide check rejects Unicode arrows and pictographic emoji.
- The About portrait contains no bulge layer, pseudo-element ring or magnification scale. Fine-pointer input updates a soft radial displacement region and the SVG `feDisplacementMap` scale, while touch and coarse-pointer CSS hide the unavailable effect and preserve grayscale.
- Zero-warning lint, the production build, server type checks, test-server build and all 60 automated tests pass. The existing React Three Fiber chunk-size warning remains unchanged.

## 2026-07-26 Works hover and large-surface cursor refinement

- Source and regression checks confirm the Works content timeline has one owner and compresses inward on both axes: metadata down three pixels, title up three pixels, left metadata right three pixels and right metadata left three pixels.
- The Project image overlay contains only a lower-edge slate gradient. Its label and directional arrow compute from white tokens and neither element owns a background surface.
- Both Project media and Works content links opt into the large-surface cursor state. That state is a 58 by 58 pixel circle with the resting 10-pixel core, while ordinary controls retain geometry-aware morphing.
- Touch, coarse-pointer and Admin cursor exclusions are unchanged. Semantic links and focus-visible feedback remain intact.
- Zero-warning lint, the Node 22 production build, server type checks, test-server build and all 60 automated tests pass. The existing React Three Fiber chunk-size warning remains unchanged.

## 2026-07-30 pre-launch audit and corrected-state verification

- Checked Home, Works, Services, About, Contact and the Deszio case study at 320, 375, 430, 768, 1024, 1280, 1440 and 1920 pixels, producing 48 route and viewport checks. Every check has one H1, route-specific metadata, zero page-level horizontal overflow, no missing image alternatives, no broken loaded images and no application alert state.
- Desktop and 390 by 844 checks confirm the shared footer reaches the full measured height, remains interactive and keeps its content inside the viewport. The final section background continues behind the reveal and fixed Works backdrops remain rendered.
- At 390 by 844, the About portrait photograph, threshold image and particle canvas share the same 363.12 by 454.24 rendered surface and 363 by 454 canvas backing size. The visible contour stays aligned with the portrait frame throughout the reveal.
- The mobile menu opens as a labelled dialog, moves focus to Close and returns focus to Menu after closing. Empty Contact submission focuses the first required field and native validation identifies every required control.
- The clean restarted browser run reports no application console errors. A reproduced rapid-width ResizeObserver loop was removed by deferring the Selected Works refresh and footer geometry sync to animation frames. The dependency-owned Three.js Clock deprecation warning remains unchanged.
- Node 22 zero-warning lint, client production build, server type checking, isolated test-server build, all 72 automated tests and `git diff --check` pass.
- `npm audit` clears the earlier brace-expansion and React Router 6 advisories. It still reports the upstream React Router RSC action advisory, which is not reachable in Webine because the application uses client-side `BrowserRouter` and no RSC or server-action mode.

## 2026-08-03 hardening release audit

- Lint, the client production build, server TypeScript, the test-server build, `git diff --check` and all 100 automated tests pass after merging the latest visual fixes into the hardening branch.
- Browser review covers Home, About, Services, Works, Contact, the Deszio case-study route and the not-found route at 320, 375, 430, 768, 1024, 1280, 1440 and 1920 CSS-pixel widths. All 56 states have one H1, one main landmark, no missing image alternative text and no horizontal overflow.
- Production CSS computes `backdrop-filter: blur(3px)` on both the Home process cards and Services cards. The Services particle canvas is present before scrolling and the mobile opening shows the inherited glow. The browser console has no application errors. The remaining Three.js clock deprecation warning originates from the renderer dependency.
- Legacy media IDs containing underscores now reach the protected Admin archive handler. Provider-neutral cleanup leaves external media storage untouched while Vercel Blob media still requires successful Blob deletion before its record can archive.

## 2026-07-30 contact website validation pass

- The browser and server use the same complete-address rule. Empty website values and full addresses such as `https://example.sg` pass, while `https://example` and scheme-less values fail with the same guidance.
- Clicking the consent checkbox with an incomplete website keeps the form rendered and the checkbox checked. A red alert appears at the top of the form and the website field receives the matching inline error.
- At 390 by 844, the alert computes to the error red `rgb(239, 67, 67)`, the page retains zero horizontal overflow and a blocked submission focuses the website field without sending the enquiry.

## 2026-07-30 mobile About portrait motion pass

- The portrait contour keeps its 595-point phone cap, 30 FPS ceiling and single drawing pass. Independently seeded x and y paths now use a visible bounded settled-flow value instead of the former near-static multiplier.
- The complete outline holds for 0.4 seconds before fading, preserving the existing grayscale photograph handoff while making individual particle movement readable at phone size.
- At 390 by 844, the portrait canvas measures 363 by 454 pixels. Two settled-state captures 160 milliseconds apart produced different image hashes while canvas opacity remained 1 and scroll position remained 3254, confirming visible local particle movement rather than page movement or fading.
- Node 22 zero-warning lint, the production build, server type checking, isolated test-server build, all 73 automated tests and the rendered mobile checks pass.

## 2026-07-30 Services redesign and Home timeline pass

- The six generated Services assets each contain one 4,800-point GLB primitive, contain no materials, textures, images or animations and remain below 70 KB. The globe manifest records 3,744 land points and 1,056 ocean points.
- At 1280 by 800, all six semantic service buttons switch the active card and particle target. The opening and closing card heights change continuously through the GSAP interval, the model canvas remains ready and the document has zero horizontal overflow.
- At 390 by 844, Services retains six cards, one H1, two intentional canvases and zero horizontal overflow. The active model stays sticky above the ambient field and below the translucent card surfaces.
- On Home, the timeline ambient state remains `waiting` at page entry and changes to `mounted` only when the process enters its near-viewport threshold. The section then contains the existing Home narrative canvas, mobile flow canvas and the new ambient canvas.
- Timeline cards begin at a 54-pixel vertical offset and 0.7 opacity. When the corresponding node reaches viewport centre, the card reaches zero offset and full opacity while the existing line progress and particle geometry remain active.
- Desktop and 390-pixel rendered checks confirm a 28-pixel Reach principles radius, rounded timeline cards and zero horizontal overflow.

## 2026-07-30 Services placement and timeline reveal refinement

- At 1280 by 800, the Services accordion begins at x 568.96 while the formed particle object occupies the left half. Some particles may cross beneath the card edge, but the object centre and readable silhouette remain left of the content.
- Collapsed and expanded service cards compute to a fully transparent background while retaining blur, border and readable text. The page remains free of horizontal overflow.
- The Services shader now responds to a fine pointer with local depth displacement, outward spread, cyan emphasis and point growth. The canvas remains pointer-transparent to content and the window-owned listener is removed on unmount.
- CRT and A380 rendered checks show their corrected front-facing states after the active card morph completes.
- On the Home timeline at 1280 by 800, the first card surface measures `translateY(104px)` and zero opacity before activation, approximately `translateY(49.98px)` and 0.519 opacity during entry, then zero offset and full opacity after the 0.92-second reveal. Its node remains on the line throughout.
- At 390 by 844, Services and the Home timeline retain zero horizontal overflow. Timeline `dd` elements compute to zero top and left margins, keeping Your part and Output values aligned with their labels.

## 2026-07-30 shared particle engine and final Services tuning

- Home, About Head and Services import the same pointer hook, frame calculation and shader bulge chunk. Source checks confirm those renderers no longer register their own pointer listeners.
- The central scale groups exposed through `particleObjectConfig` supply all Home, About Head and Services model scales. Services point size remains an independent shader uniform, so changing a model scale changes the formed object extent without scaling the dots.
- Services models no longer run an idle or full-turn rotation. Rendered desktop checks confirm the globe and redesign targets hold their resting orientation while retaining subtle pointer travel, tilt and local bulge.
- At 1280 by 800, Home, Services and About each retain one H1 and zero horizontal overflow. Services contains six cards, exactly one expanded trigger and successful card-to-model switching.
- At 390 by 844, Services contains six 358-pixel cards, two intentional canvases and zero horizontal overflow. Transparent card surfaces keep their border and authored backdrop-blur CSS, allowing the particle layers to remain visible beneath them.
- The invalid Current website and consent-checkbox path was repeated in the production build. It remains on `/contact`, does not log a runtime error, keeps the entered value, marks the website field invalid and shows the complete example address in red at the top of the form and below the field.
- Node 22 zero-warning lint, client build, server type checking, isolated test-server build and all 73 automated tests pass.

## 2026-07-30 replacement Möbius, projected bulge and collapsible Services cards

- The replacement Website care derivative records `fita_de_moebius.glb` as its source, contains one 4,800-point primitive, contains no materials or textures and remains below 70 KB.
- At 1280 by 800, the replacement strip reads as a continuous twisted loop. Its 96-point sphere follows the middle curve just above the surface and visibly changes position while its accumulated quaternion provides rolling motion.
- Home, About Head and Services compile the same projected pointer shader. Desktop screenshots at the live pointer position show a small local response rather than a model-wide distortion. The response remains aligned with the cursor after each model’s authored rotation.
- The shared hover radius is aspect-corrected screen space and its depth is view space. Services particle perspective uses the object centre, so changing a model scale does not change point size, pointer radius or bulge depth.
- At 1280 by 800, the first card starts expanded. Closing it produces zero expanded cards while keeping active model index 0. Opening Branding changes both indices to 3, then closing it keeps active model index 3 while expanded state becomes `none`.
- At 390 by 844, the first card also starts expanded. Closing it leaves six 358-pixel cards, zero expanded cards and zero horizontal overflow. Transparent card surfaces and the sticky particle layers remain intact.
- Rendered Home, About and Services checks report one H1 and zero horizontal overflow. Browser logs contain no application errors. The existing dependency-owned Three.js Clock deprecation warning remains unchanged.

## 2026-07-30 medium body token and shared accordion motion

- `--primitive-body-m` defines the medium body scale and the semantic `--body-m` token references it. Existing Services and case-study consumers now resolve through the intended primitive-to-semantic token path.
- Services cards and Reach principles use the same `useExpandablePanel` hook. Both animate panel height for 0.72 seconds with `power3.inOut`, then combine the existing delayed content rise and opacity transition.
- At 1280 by 800, a Reach panel measured 0 pixels before expansion, an intermediate height during the tween and its complete 112-pixel content height after expansion. Collapse returned it to 0 pixels and restored `aria-hidden`.
- At 390 by 844, the expanded panel reached its complete content height, full opacity and `aria-expanded="true"` with zero page-level horizontal overflow.

## 2026-07-30 Vercel Blob archive cleanup

- Repository integration coverage confirms that draft and published references both block media archival. After every reference is removed, a Vercel Blob pathname is passed to the storage cleanup boundary before the asset record changes to archived.
- Failure coverage confirms that a missing Blob token returns a 503 storage-configuration error and a Blob API failure returns a 502 retry message. In both cases the media record remains active.
- Provider coverage confirms that the new cleanup boundary ignores externally managed media and only calls the Vercel Blob deletion client for `vercel_blob` assets.
- The complete verification gate passes zero-warning lint, the production client build, server type checks and all 79 automated tests.

## 2026-07-30 Services particle visual-centre tuning

- At 1280 by 800, the lowered Services globe occupies the visual centre below the 78-pixel floating header rather than the geometric centre of the complete viewport. The A380 retains a balanced reading through its independent positive-Y centre correction.
- At 390 by 844, the particle stage remains below the mobile header, the introduction and cards retain their intended translucent overlap and the page has zero horizontal overflow.
- Source coverage confirms one responsive stage anchor and six per-model `centreOffset` controls. These offsets are applied separately from model scale, shader point size and the shared pointer bulge.

## 2026-07-30 Services large-surface cursor

- Every Services card trigger declares `data-cursor-surface="large"` and therefore uses the existing circular 58-pixel public cursor state rather than the geometry-matched control state.
- The marker stays on the semantic button, preserving the existing accordion click, focus, keyboard and touch contracts without another pointer listener.
- At 1280 by 800, a real pointer over the 661-pixel-wide card trigger produced `data-surface="large"`, a 57.99 by 57.99-pixel outer circle with a 999-pixel radius and the resting 10-pixel core. Moving into the expanded non-clickable details restored the normal 44-pixel circle.
- At 390 by 844, the kinetic cursor remains unmounted from the document state, computes to `display: none` and the page retains zero horizontal overflow.

## 2026-07-30 uniform footer particle brush

- Footer particles now use one uniform random sample across the complete brush radius. The former centre-only particle class, triangular centre weighting and brighter slow-moving core render path have been removed.
- At 1280 by 800, a real pointer stroke across the revealed footer filled the complete brush width without a brighter centre line. The canvas remained active at its 2,000-particle ceiling and the page retained zero horizontal overflow.
- Regression coverage requires uniform `-brushRadius` to `brushRadius` sampling and rejects both the former triangular sampler and any remaining core-particle path.

## 2026-07-30 compact particle stability and Works footer correction

- Compact Home, About Head and Services renderers keep their individual particle paths, formation and object motion. Their colour and density fields are now identity-locked with zero compact time flow, removing the visible mobile twinkle without lowering density.
- Paired 390 by 844 captures confirm that the Home, About Head and Services particles move between frames while retaining stable brightness and colour. All three routes keep zero horizontal overflow.
- At 320 by 568 and 390 by 844, the Works index footer is visible at the bottom of the route, remains above the fixed galaxy and keeps zero horizontal overflow. The same 390-pixel check passes on `/works/deszio-studio`.
- At 1280 by 800, Home retains its travelling desktop surface field and one persistent particle canvas. The Works fixed footer reveal remains visible and correctly clipped.
- Browser logs contain no application errors. The existing dependency-owned Three.js Clock deprecation warning remains unchanged.

## 2026-07-30 navbar-aware process timing

- At 320 by 568, the fixed header bottom measures 74 pixels. The usable reading line is therefore 321 pixels rather than the geometric 284-pixel midpoint. The first timeline card was fully revealed with its node at 291 pixels, before it reached the former threshold.
- At 390 by 844, the same 74-pixel header moves the reading line from 422 to 459 pixels. Crossing that line activates the node and reveals the card, while reversing above it restores the waiting state, zero opacity and 104-pixel offset.
- At 1280 by 800, the live 78-pixel header produces a 439-pixel reading line. The desktop card, line and node remain aligned with zero horizontal overflow.
- The global reveal controller already starts at 92 percent, portrait entry starts at 76 percent and the Selected Work entry starts at 88 percent. Particle anchors, full-range parallax and pinned-scene centres remain deliberately tied to composition geometry rather than content visibility.
- Browser logs contain no application errors. The existing dependency-owned Three.js Clock deprecation warning remains unchanged.

## 2026-07-31 configurable process particle transition

- Source coverage confirms that the process controller, GPU group travel, vertex shader and mobile flow canvas all read the named `particles.processTransition` controls from `experience.ts`.
- At 1280 by 800, the persistent WebGL scene compiles with no shader or application errors, the process atmosphere and timeline remain aligned and the page has zero horizontal overflow.
- At 390 by 844, the section-owned process canvas renders at the configured intake handoff with zero horizontal overflow. Scrolling forward moved the timeline progress to `0.1276`, then reversing restored it to `0`.
- The shader config formatter emits integer-valued controls as GLSL floats, preventing a tunable value such as `0` from invalidating `smoothstep`.

## 2026-08-03 production blur and Services particle readiness

- The production CSS bundle contains both `-webkit-backdrop-filter: blur(3px)` and `backdrop-filter: blur(3px)` for the Home timeline and Services cards. Local computed styles resolve the standard property to `blur(3px)` on both surfaces.
- On a direct local production-preview visit to `/services`, the Services particle state reached `ready` and its canvas was already mounted while the sticky visual remained 1,070 pixels below the viewport.
- Focused Services coverage, zero-warning lint, the client production build and both server TypeScript checks pass. The complete suite has 80 passes from 81 tests, with only the existing process-transition expectation for `startViewportY` remaining unrelated.

## 2026-08-03 metadata, Privacy and mobile effect loading

- Static routes resolve to the `Webine • Page` title pattern, including `Webine • Services` and `Webine • Privacy`. The Privacy route has one H1, nine labelled information sections, a canonical Production URL and no horizontal overflow at 390 by 844 or 1280 by 800.
- At 390 pixels, the About portraits render two fallback images with no ripple canvases. The browser asset inventory contains neither the `WaterRippleCanvas` chunk nor the `KineticCursor` chunk. At 1280 pixels with a fine pointer, both chunks load and two ripple canvases plus one kinetic cursor mount as intended.
- Project hover media is not rendered and its GSAP hover timeline is not created until the viewport is at least 48 rem and a fine hover pointer is available.
- Zero-warning lint, the client production build, server and test-server TypeScript checks, all 102 automated tests and `git diff --check` pass. Browser review found no application errors. The dependency-owned Three.js Clock deprecation warning remains unchanged.

## 2026-08-08 SEO, GEO and AEO route verification

- Local production-preview checks covered `/`, `/about`, `/services`, `/works`, `/contact` and `/privacy` at 1280 by 800 and 390 by 844. Every route has one H1, its expected `www` canonical, route-specific title and description, indexable robots state and zero horizontal overflow.
- Raw generated HTML includes the same metadata, a route-specific H1, useful summary copy and links to every public route before JavaScript runs. Public routes expose valid JSON-LD for their page type, Webine and the website. Relevant routes also expose breadcrumbs, six service entities or a project CreativeWork entity.
- Private Admin and preview documents remain `noindex`. Valid CMS case studies receive project-specific HTML and structured data from the consolidated Projects function, while missing projects return an actual 404 with `noindex`.
- Browser review found no error boundary or application console error. The About and Services direct-answer content remains readable at phone and desktop widths, and route H2 sizes resolve through the intended Webine tokens.
- The live pre-deployment audit confirmed that the apex Contact URL permanently redirects to the indexable `www` URL. It also confirmed that production `/privacy` remains a 404 until this change set is deployed.
- Rendered checks at 320 by 568, 390 by 844, 768 by 1024, 1024 by 768, 1280 by 800 and 1920 by 1080 cover all six public routes. Each route has one main landmark, one H1, zero horizontal overflow, zero duplicate IDs, zero unnamed controls, zero missing image alternatives and no decorative canvas exposed to assistive technology.
- The initial public entry is 360.84 KB raw and 123.26 KB gzip. The 854.34 KB Three.js and React Three Fiber chunk remains route-lazy and is not preloaded by the initial document. Physical-device frame timing and deployed Core Web Vitals remain release evidence gaps.
- The final exact Node 22.23.1 release gate passes the client build, server and test-server type checks and all 109 automated tests.

## 2026-08-08 shared configuration and responsive interaction verification

- Source and architecture coverage confirms one `particleRenderConfig` for renderer-wide particle settings, one `particleObjectConfig` for recognisable particle objects and one shared fine-pointer query owner. Superseded exported scale settings and repeated JavaScript pointer-query strings have been removed.
- At 1280 by 800, the Home Selected Work image remains 424 pixels high and now measures 678.4 pixels wide, producing the shared 1.6 ratio. Its complete card expands to 1017.6 pixels so media and copy no longer overlap. The Works card and Deszio case-study hero also measure 1.6 with zero page-level overflow.
- At 390 by 844, the Home image remains 293.7 pixels high and expands to 469.9 pixels wide inside the clipped horizontal runway. Home, Works and the case-study hero all compute to 1.6 while the page keeps zero horizontal overflow.
- Desktop and mobile menus contain Home, Works, Services and About only. The rendered footer retains Privacy and the static pre-hydration document mirrors the same primary-navigation contract while keeping Start a project and Privacy in their separate roles.
- On a 390 by 844 viewport, all four process cards reached opacity 1 after forward scrolling. Reversing until timeline progress returned to 0.027 kept all four cards at opacity 1 and zero translation, while line, node and particle progress continued reversing. At 1280 by 800, the same reverse check hid the later three cards and retained only the currently reached first card, confirming desktop remains reversible.

## 2026-08-08 mobile process-card hold

- Automated source coverage requires the phone-only monotonic card-reveal state while preserving the existing live `activeStep` path. Rendered phone reverse-scroll confirmation remains required before release.

## 2026-08-11 project story media aspect roles

- The shared Project thumbnail and case-study cover contract remains 16:10. The Works card measures 1184 by 740 pixels at 1280 by 800 and 358 by 223.75 pixels at 390 by 844. The Deszio case-study cover also resolves to 1.6 at both widths.
- Both published two-image Deszio story blocks render every frame at exactly 1:1. Desktop frames measure approximately 582.4 by 582.4 pixels in two columns, while phone frames measure 358 by 358 pixels in one column. Both layouts retain zero page-level horizontal overflow.
- Automated coverage keeps one-image story frames on the existing `--project-media-aspect` token, applies the shared square token only to two-image and three-image blocks and verifies that Bento output retains each asset's stored source ratio.

## 2026-08-11 compact mixed-ratio Bento flow

- The production Deszio baseline at 789 by 988 measured a 725-pixel-wide Bento grid and seven source-ratio assets. The former twelve-column layout measured about 1,355 pixels high and left an approximately 218-pixel hole beneath the fifth image because the adjacent phone image controlled the shared row height.
- Tablet and desktop Bento layouts now balance complete, break-safe image items into two columns. Screens from 80 rem use three columns, while the existing phone grid remains unchanged. All assets retain their inline stored aspect ratio and use `object-fit: contain`.
- Automated coverage requires the two-column and three-column breakpoints, balanced column fill, break-safe items and removal of the former twelve-column row grid. A final rendered confirmation on the deployed Deszio case study remains part of release QA because production CMS content is not present in the local fixture.

## 2026-08-14 Cloudflare production verification

- The apex returns 308 to the matching `www` path and query. `www` serves the main Worker, while the content and media custom domains remain outside its route ownership.
- Production `/admin/` and a direct nested Admin route return the generated application shell with private, no-store and noindex headers. The authenticated browser reaches the owner dashboard and Media workspace.
- The dashboard reports two published projects and two total active projects. Cloudflare R2 uploads, enquiry intake and enquiry notifications all report configured.
- The Production database reports every migration through `0015_project_story_composer.sql`, including the previously absent privacy, security and Project-order migrations. Both project records remain present.
- The R2 bucket CORS contract permits only `https://www.madebywebine.com`, `PUT` and `Content-Type`. The complete Node 22 gate passes the client build, lint, both server TypeScript builds and all 112 automated tests.

## 2026-08-14 Admin media batch upload verification

- The Media workspace accepts multiple picker and drag-and-drop files, caps an active batch at 40 and keeps separate metadata and focal-point controls for every queued asset.
- Batch submission rejects the first non-decorative asset without a description, uploads accepted assets sequentially through the existing R2 upload owner and reports per-file failures without discarding successful uploads.
- Automated coverage requires the multi-file input, full `FileList` conversion, sequential queue traversal, per-asset detail updates and partial-failure retention.
- A rendered local Admin check selected two files through the native multi-file chooser, showed two independent metadata and focal-point forms and blocked submission with the exact filename whose description was missing. At 1280 by 720 and 390 by 844, the queue retained zero page-level horizontal overflow, switched from two internal columns to one and logged no application errors.

## 2026-08-14 Cloudflare public build configuration recovery

- Production evidence reproduced a same-origin `GET /content/public.json` 404 even though the R2 content custom domain returned the current two-Project snapshot with valid `www` CORS headers.
- The deployed Admin chunk also contained no Clerk publishable key, so the client could not mount Clerk or offer a valid login. The Clerk frontend API and server-side Worker configuration remained healthy.
- Regression coverage now requires one public runtime owner and verifies that published snapshots, Clerk Admin and Turnstile consume its production-safe public defaults when a Git build omits `VITE_` values.
- Production Worker traces then isolated the authenticated Admin failure to a missing `TURSO_DATABASE_URL` binding. The prior known-good value was restored as a secret, the runtime was redeployed and an authenticated browser check loaded the existing Media records without an Admin error.
- Final production browser verification loaded both published Projects in the required Webine-then-Deszio order, retained direct static documents for both Project routes and reported no new console errors.
- The static CSP now permits `connect-src` only to the exact account-scoped R2 S3 endpoint used by signed Admin uploads. It does not permit arbitrary Cloudflare storage hosts or a broad HTTPS source.
- Legacy same-origin `/content/*` requests receive a cacheable permanent redirect to `content.madebywebine.com`, allowing already-cached browser bundles to recover instead of returning a 404.
