# Webine component inventory

## Implemented components

| Component | Purpose | Current states |
|---|---|---|
| `WebineBrand` | Logo and working text wordmark | Default and focus |
| `SiteHeader` | Fixed floating public-navigation shell with one compact inner navigation group and a dedicated project CTA | Dark, light, top, scrolled, current page, hover and focus |
| `MobileMenu` | Labelled full-screen mobile navigation without a duplicate Contact item | Closed, open, current page, focus and project CTA |
| `SiteFooter` | Public navigation, location, contact, privacy and colophon | Dark |
| `ButtonLink` | Primary and secondary navigation actions | Primary, outline, quiet, hover and focus |
| `DirectionalArrow` | The only directional-arrow primitive allowed in the rendered interface, preventing platform emoji glyph fallback | Up-right and down, small controls and large decorative marks |
| `page-header-copy` system | Shared CSS contract for secondary-page eyebrow, display heading, accented Georgia phrase and summary while page layouts keep their own composition | Default, Works, Contact and case-study scales across dark and light themes |
| `FormField` | Accessible controlled input and textarea structure | Text, email, URL, textarea, required, invalid and focused |
| `SiteShell` | Public header, main content, footer and desktop fine-pointer interaction composition | Dark or light header with dual-layer kinetic cursor |
| `KineticCursor` | USTA-informed public desktop cursor with separate tight and loose tracking layers | Resting dot and halo, clickable-control morph, pressed, hidden, touch-disabled and Admin-excluded |
| `WorkspaceShell` | Reserved Admin application frame | Mobile strip, desktop sidebar and horizontally safe clickable ancestor breadcrumbs |
| `RouteEffects` | Page title, route announcement, scroll and heading focus | Push, replace and browser history |
| `PageLoadProvider` | Public route asset-readiness boundary and Webine loading choreography | Initial public entry and route changes, real readiness phases, degraded timeout, fixed scroll lock, left-to-right exit and ready context; Admin deliberately skips branded presentation |
| `page-assets` | Route-specific model, binary, data-signal, font and current-image preparation | Home desktop or mobile, About, CMS-backed routes, Admin lazy entry, failed asset and 12-second ceiling |
| `GsapRevealController` | Shared scroll-entry and parallax choreography for public copy, cards and media | Production-safe resolved shell ownership, loader-gated entry, axis-aware refresh-safe media travel, pixel-owned Contact form float, focus-safe opacity, coalesced async CMS refresh, reverse and cleanup |
| `AmbientParticleField` | Lightweight sparse atmosphere outside the Home narrative geometry | One deterministic canvas, wide two-frequency electron orbits, cyan or blue depth points, fine-pointer parallax, full mobile density, capped DPR and offscreen or hidden-page pause |
| `GalaxyBackdrop` | Fixed atmospheric field shared by the Works index and case studies | Slate-950 base, 118 drifting stars, content-safe fixed layering, original cyan-to-blue index nebula and an optional same-hue Project nebula |
| `AppErrorBoundary` | Application failure fallback | Error |
| `PublicSmoothScroll` | Single Lenis public scroll runtime synchronized with the GSAP ticker and ScrollTrigger | Weighted wheel interpolation, separate nonlinear wheel and touch ceilings, capped touch glide, same-page anchor focus, route cleanup and ready diagnostics |
| `AboutHeadExperience` | About-only full-frame sticky story scene built from the supplied simple head | Initially centred, formed, additive scroll and pointer rotation, viewport-wide dispersion, failed fallback and offscreen pause |
| `AboutHeadCanvas` | Lazy model-derived point renderer with centred runtime geometry | 9,000 desktop points, 5,600 mobile points, porous seeded spacing, individual multi-frequency three-axis drift, loading, ready, deterministic scroll rotation, pointer bulge, dispersed and fallback |
| `PortraitReveal` | Layered colour portrait, SVG-masked grayscale portrait, rising silhouette particles and editorial team copy | Viewport-triggered bottom-up outline, centrally configurable sequence timing, 595-point mobile and 900-point desktop caps, wide-field origins, independently seeded float, curl and breathing motion, 30 FPS mobile rendering, shared-wrapper vertical parallax, grayscale handoff, displaced liquid ripple and residual trail, 25rem desktop frame cap and oversized indexed names |
| `ServicesChapterController` | Scroll-owned service narrative with one sticky chapter rail | Five active offer chapters, scrubbed copy hierarchy, bounded particle-orb orientation and mobile linear flow |
| `ServicesParticleOrb` | Lightweight particle object replacing the previous outlined service circle | 780 porous points with individual multi-frequency three-axis orbits, bounded idle reversal, pointer tilt, local fine-pointer bulge, capped DPR and visibility-aware rendering |
| `HomeParticleExperience` | Home-only boundary for the persistent visual layer | Mounted and unmounted by route |
| `ParticleSceneController` | Section registration, presence thresholds and section-local anchor measurement | Scroll, resize, visibility and cleanup |
| `ParticleNarrativeCanvas` | One lazy React Three Fiber canvas for the tablet and desktop Home story | Loading, live, paused and failed |
| `MobileSectionParticles` | Section-owned 2D particle canvases that scroll naturally with their phone scenes | Loading, nearby, formed, wide dispersed field, independently orbiting and inactive |
| `ParticlePosterFallback` | Visible composition before WebGL and after failure | Loading, fallback and hidden-live |
| `HeroEntranceTimeline` | Coordinates the post-loader breathing period, particle formation and staged HTML reveal | Waiting behind loader, first load, short return, restored and interrupted |
| `HeroCoverTransition` | Selects the desktop GSAP pin or native coarse-touch sticky cover | Desktop pin, native sticky and cleanup |
| `SignalGrid` | Faint CSS grid with a fine-pointer local light response | Resting touch, active pointer and offscreen-paused |
| `ReachSection` | Practical found, trusted and chosen business-value chapter | Entered, revealed and expanded examples |
| `SelectedWorkRunway` | Responsive portfolio chapter ending in an expanding chapter 04 card | Vertical-driven horizontal movement on every breakpoint, centred stop, card expansion, progress, keyboard focus and reversible interlude handoff |
| `ProjectCard` | Shared published Project presentation for Works and Home | Fixed 16:10 Home runway media, priority or lazy loading, restrained GSAP media parallax outside Home, hover or keyboard-focus image overlay, clean touch media, minimal Works metadata and full runway copy inside Home |
| `MediaLibrary` | Admin upload and reusable asset workspace | Drag or button upload, 50 MB client and server validation, animated GIF preservation, progress, preview, metadata, focal point, usage and archive protection |
| `AssetFieldControl` | Project-aware image and gallery selector joined to the shared library | Inline upload, existing asset choice, cover or supporting role, replacement, removal, ordered gallery and pending-save states |
| `ProjectMediaOverview` | Project editor summary of cover, hover, story and social media | Assigned thumbnails, empty roles, saved and unsaved |
| `ItemEditor` | Schema-generated draft and Project workflow | Repeated top and bottom Project actions, save, preview, publish, republish, unpublish, archive, confirmed purge, per-Project case-study colour and flexible image blocks with a final bento layout |
| `QuietInterlude` | Full long-term-value chapter aligned directly beneath the expanded runway card | Seamless takeover, section-owned point formation, top-point dispersion and reverse |
| `ProcessTimeline` | Semantic four-stage process with line fill, early point-contact intake and centred outlet geometry | Waiting, absorbing, active, complete, emitting and reverse |
| `ClosingCallToAction` | Final momentum scene and primary contact route | Resting grid and early-forming opaque section-anchored particle colony planet |
| `ContactPage` | Public project enquiry and privacy experience | Scroll-scrubbed floating form, sparse ambient field, protected headline or form separation, idle, submitting, success, error and recovery |
| `EnquiriesPage` | Protected owner review of stored project enquiries | Loading, empty, ready, Resend or webhook explanation, notification pending or failed and retry |
| `CMS schema domain` | Shared collection, field, item, reference and archive validation for future server handlers | Valid, invalid, incompatible mutation and published-usage block |

## Route compositions

- Home: six-scene dark and light narrative with persistent tablet and desktop GPU particles, phone-owned 2D particle canvases and a separate sparse hero atmosphere beneath the text
- About: dark editorial studio story with an isolated full-frame simple-head point field, two silhouette-outline portrait reveals, team copy, principles and a direct project CTA
- Services: business-outcome hero, five scroll-linked real-offer chapters, ownership statement, CMS-backed working path and project CTA
- Works: cohesive dark editorial introduction, one fixed galaxy across the index and case studies, outlined scroll field, filters, image-led project grid with minimal copy, accessible hover or keyboard overlays and loading or error states
- Contact: responsive dark introduction, slow floating light enquiry form, sparse ambient points and linked privacy section
- Admin: 264 px desktop sidebar, flexible content canvas, clickable ancestor breadcrumbs, stretched-link Project cards with isolated quick actions, visible draft, published and archived states, current Site Settings defaults, reusable JPEG, PNG, WebP, AVIF and GIF media, deployment-readiness diagnostics and protected enquiry inbox. Admin uses functional inline skeletons without the branded public loader.
- Preview: protected draft Project composition using current media and story fields
- Not found: dark action-oriented fallback

Home stays in the initial readable application entry. About, Services, Works, Contact, Preview, not-found and Admin are route-level lazy chunks behind one hidden pending signal that the asset-aware loader can observe. This keeps route ownership clear while preventing a blank or competing visual loader.

## Later components

The following inputs remain outside the current implementation: approved final poster art, commissioned project media, licensed Railway files, final domain and measured production performance evidence. The asset-aware loading transition, coordinated public reveals, CMS database, authenticated Admin, collection builder, generated editors, media library, publishing controls, public Works, CMS-backed homepage runway, enquiry pipeline, robots and sitemap now exist.
