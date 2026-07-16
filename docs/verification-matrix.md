# Webine verification matrix

Status updated on 16 July 2026. A local browser pass is not a substitute for physical-device, production or cross-browser evidence.

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

- Production build completes. Public CSS is about 15.61 KB gzip and the public application entry is about 111.47 KB gzip.
- Admin remains a separate lazy chunk at about 67.41 KB gzip.
- The desktop and tablet particle chunk remains lazy at about 246.08 KB gzip. Phones do not import it.
- One WebGL canvas and one particle geometry serve the complete tablet or desktop narrative.
- Section-owned phone canvases use the baked 2D targets and capped controller profile.
- Signal Grid pointer work is visibility-gated and requestAnimationFrame-throttled.
- Published image responses now include intrinsic dimensions. The first Works card and case-study hero receive eager priority while later media loads lazily.
- Browser review from 320 × 568 through 1920 × 1080 confirms no horizontal overflow on Home, Works, Contact or the case-study state. All timeline nodes remain visible independently of their card reveals, paint above the line and activate from their real circle position. Odd and even desktop nodes are centred to within 0.008 CSS pixels of the line.
- Home Project cards show distinct intermediate opacities during entry, confirming the 0.28-second sequence. Works cards, case-study media and Contact fields use coordinated GSAP entry or parallax without adding GSAP attributes to particle elements.
- Rendered 1280 × 800 and 390 × 844 checks confirm the two-colour stippled particle treatment, early Closing formation while its anchor remains below the viewport, the rebuilt Works opening and the floating Contact form without horizontal overflow.
- Rendered 1536 × 900 and 390 × 844 checks confirm the cohesive dark Works gallery, minimal card copy and accessible overlay. Mouse hover or keyboard focus raises the overlay opacity to 1 and exposes its label and direction control. Touch layouts keep the image clean because the essential label, year and title remain visible below it.
- Contact no longer uses the orbit signal. A sparse CSS-only ambient field sits below the content, and the desktop headline finishes 143 px before the form. The stacked 390 px layout has clear vertical separation.
- Works now renders one fixed `GalaxyBackdrop` on both its index and valid case-study states. Browser checks at 320 × 568, 390 × 844, 768 × 1024, 1280 × 800 and 1536 × 900 confirm `position: fixed`, zero page-level overflow, 84 desktop or tablet stars and the intended 34-point phone cap.
- The Home hero and Contact each render 20 CSS-only ambient points, reduced to 12 on phones. Computed transforms sampled 900 ms apart confirm the independent ambient drift is active without a JavaScript animation loop or GSAP ownership.
- Works and Contact GSAP motion is render-verified independently of operating-system motion preferences. At 1280 × 720, the first Works media wrapper moved about 49 px while its copy stayed at `transform: none`, and the Contact form moved about 59 px while retaining 125 px of column clearance. At 390 × 844, the same media moved about 25 px and the form moved about 35 px. Both routes retained zero horizontal overflow and a fresh navigation pass produced no console warnings or errors.
- Home hero stacking is explicit and rendered at both 1280 × 800 and 390 × 844: ambient field layer 0, desktop WebGL or phone-owned logo layer 1 and hero content layer 2. The Webine logo therefore always paints above the decorative ambient points.
- The corrected Works galaxy is rendered at 1280 × 800 and 390 × 844 with a non-empty computed radial gradient, full nebula opacity and zero horizontal overflow. The lower-half cyan or blue horizon remains visible through the restrained translucent commission panel.
- The commission panel contains an SVG direction mark with no text glyph. A recursive interface-source regression test rejects Unicode arrows, preventing mobile emoji substitution from returning.
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

## Measurements still required

- LCP at or below 2.5 seconds at the 75th percentile
- INP at or below 200 ms at the 75th percentile
- CLS at or below 0.1 at the 75th percentile
- Particle frame stability on representative mid-range iOS, Android and laptop hardware
- Automated accessibility scan on rendered Home, Works, Contact and key Admin screens
- Contrast, literal 200% browser zoom and complete keyboard confirmation in physical browsers
