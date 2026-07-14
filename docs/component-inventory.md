# Webine component inventory

## Implemented components

| Component | Purpose | Current states |
|---|---|---|
| `WebineBrand` | Logo and working text wordmark | Default and focus |
| `SiteHeader` | Public navigation shell | Dark and light |
| `MobileMenu` | Labelled full-screen mobile navigation | Closed, open, current page and focus |
| `SiteFooter` | Public navigation, location and pending contact area | Dark |
| `ButtonLink` | Primary and secondary navigation actions | Primary, outline, quiet, hover and focus |
| `DirectionalArrow` | Vector UI direction mark that avoids platform emoji glyph fallback | Up-right and down |
| `SectionHeading` | Editorial section index, title and explanation | Light and dark through tokens |
| `FormField` | Form structure and field styling | Disabled preview |
| `SiteShell` | Public header, main content and footer composition | Dark or light header |
| `WorkspaceShell` | Reserved Admin application frame | Mobile strip and desktop sidebar |
| `RouteEffects` | Page title, route announcement, scroll and heading focus | Push, replace and browser history |
| `AppErrorBoundary` | Application failure fallback | Error |
| `PublicSmoothScroll` | Lenis public wheel-scroll controller synchronized with GSAP ScrollTrigger | Weighted wheel input, native touch momentum and cleanup |
| `HomeParticleExperience` | Home-only boundary for the persistent visual layer | Mounted and unmounted by route |
| `ParticleSceneController` | Section registration, presence thresholds and section-local anchor measurement | Scroll, resize, visibility and cleanup |
| `ParticleNarrativeCanvas` | One lazy React Three Fiber canvas for the tablet and desktop Home story | Loading, live, paused and failed |
| `MobileSectionParticles` | Section-owned 2D particle canvases that scroll naturally with their phone scenes | Loading, nearby, formed, dispersed and inactive |
| `ParticlePosterFallback` | Visible composition before WebGL and after failure | Loading, fallback and hidden-live |
| `HeroEntranceTimeline` | Coordinates the first-load breathing period, particle formation and staged HTML reveal | First load, short return, restored and interrupted |
| `HeroCoverTransition` | Selects the desktop GSAP pin or native coarse-touch sticky cover | Desktop pin, native sticky and cleanup |
| `SignalGrid` | Faint CSS grid with a fine-pointer local light response | Resting touch, active pointer and offscreen-paused |
| `ReachSection` | Practical found, trusted and chosen business-value chapter | Entered, revealed and expanded examples |
| `SelectedWorkRunway` | Responsive portfolio chapter ending in an expanding chapter 04 card | Vertical-driven horizontal movement on every breakpoint, centred stop, card expansion, progress, keyboard focus and reversible interlude handoff |
| `QuietInterlude` | Full long-term-value chapter aligned directly beneath the expanded runway card | Seamless takeover, section-owned point formation, top-point dispersion and reverse |
| `ProcessTimeline` | Semantic four-stage process with line fill, early point-contact intake and centred outlet geometry | Waiting, absorbing, active, complete, emitting and reverse |
| `ClosingCallToAction` | Final momentum scene and primary contact route | Resting grid and opaque section-anchored particle colony planet |

## Route compositions

- Home: six-scene dark and light narrative with persistent tablet and desktop GPU particles plus phone-owned 2D particle canvases
- Works: light editorial introduction, 8 and 4-column project system preview and honest empty state
- Contact: 5 and 7-column split on desktop with a disabled light form preview
- Admin: 264 px desktop sidebar and flexible content canvas
- Preview: restrained light reserved-route composition
- Not found: dark action-oriented fallback

## Later components

The following components remain outside the current implementation: approved final poster art, commissioned project media, project filters, project case-study panels, the enquiry pipeline, CMS-generated forms, media upload controls and route transitions.
