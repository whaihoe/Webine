# Webine verification matrix

Status recorded on 15 July 2026. “Automated pass” is not a substitute for the open visual or physical-device rows.

## Viewport and input matrix

| Viewport or input | Status | Evidence still required |
|---|---|---|
| 320 × 568 mobile | Code coverage only | Browser visual pass, touch scroll, 200% zoom and no horizontal page overflow |
| 390 × 844 iPhone class | Needs physical confirmation | Safari forward or reverse particle story, native sticky cover, runway and rotation |
| 768 × 1024 tablet portrait | Code coverage only | Touch, orientation and WebGL composition |
| 1024 × 768 tablet landscape | Code coverage only | Touch or mouse, timeline geometry and runway release |
| 1280 × 800 laptop | Code coverage only | Mouse, trackpad, route motion and frame stability |
| 1440 × 900 desktop | Code coverage only | Mouse, keyboard and full visual rhythm |
| 1920 × 1080 large desktop | Code coverage only | Maximum-width composition and particle placement |
| Keyboard-only | Structural pass | Full live tab-order and dialog-operation pass |
| iOS Safari | Open | Physical-device evidence |
| Android Chrome | Open | Physical-device evidence |
| Safari, Chrome, Firefox and Edge desktop | Open | Live cross-browser evidence |

The in-app browser runtime currently fails before page inspection, so no visual row is marked passed from static code evidence.

## Automated and production-build evidence

- Production build completes. Public CSS is about 13.85 KB gzip and the public application entry is about 108.20 KB gzip.
- Admin remains a separate lazy chunk at about 67.27 KB gzip.
- The desktop and tablet particle chunk remains lazy at about 246.22 KB gzip. Phones do not import it.
- One WebGL canvas and one particle geometry serve the complete tablet or desktop narrative.
- Section-owned phone canvases use the baked 2D targets and capped controller profile.
- Signal Grid pointer work is visibility-gated and requestAnimationFrame-throttled.
- Published image responses now include intrinsic dimensions. The first Works card and case-study hero receive eager priority while later media loads lazily.
- Route focus, anchors, browser back-position restoration and listener cleanup are structurally covered.
- Backup and restore, two-connection optimistic concurrency, protected Admin access, publishing, media, enquiries, metadata, robots and sitemap behaviour are automated.
- Vercel uses seven consolidated Function entrypoints. Automated routing coverage protects the Hobby-safe entrypoint count, grouped rewrites and restoration of the original API paths.

## Measurements still required

- LCP at or below 2.5 seconds at the 75th percentile
- INP at or below 200 ms at the 75th percentile
- CLS at or below 0.1 at the 75th percentile
- Particle frame stability on representative mid-range iOS, Android and laptop hardware
- Automated accessibility scan on rendered Home, Works, Contact and key Admin screens
- Contrast, 200% zoom and keyboard confirmation in real browsers
