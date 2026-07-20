# The First The Last preloader teardown

## Scope

This is a focused teardown of the loading screen in the supplied The First The Last HTML. The supplied page is a Nuxt application. Its preloader is not defined only in the initial document, so the linked production CSS and JavaScript bundles were traced to confirm the real component and exit behaviour.

## Confirmed reference implementation

The component uses a fixed full-screen `.preloader` layer with a gradient background, a centred agency-name Lottie, a bottom-centred percentage and six absolutely positioned tags. The tags enter through clip reveals and continue moving between authored positions while loading remains active.

The visible percentage is a five-second GSAP proxy from 0 to 100. It is presentation timing rather than measured byte progress. Exit also waits for the application-level `general.isPageSetuped` signal. The first visit then uses a 0.7-second left-to-right clip-path wipe after a short hold. Repeat visits use a shorter fade, controlled through `localStorage.isPreloaderSlow`.

Confirmed production sources:

- Supplied HTML: `/Users/whaihoe/.codex/attachments/b08fe3e4-57a8-41c3-a3b3-e6a4ab677ed0/pasted-text.txt`
- CSS: `https://thefirstthelast.agency/_nuxt/entry.C0WACAU4.css`
- Preloader component bundle: `https://thefirstthelast.agency/_nuxt/CbHGLtOX.js`

## Webine adaptation

Webine keeps the reference principle of turning the agency name into the loading metaphor, but it does not copy the layout or fake a timed percentage. `WEB` and `INE` use the same Railway-style typeface and begin separated by whitespace. The shrinking distance between them is the complete progress indicator, and the finished state reads as one `WEBINE` wordmark. The final design is deliberately minimal: a flat slate background and a small centred wordmark with generous surrounding space. It has no percentage, line, dots, bar, grid, glow, background gradient or extra loading labels.

The loader waits for:

1. document fonts
2. route-specific particle models and binary targets
3. CMS and Site Settings pending signals
4. Home or About particle-engine readiness
5. current route images and decoded portraits
6. settled layout frames

A 12-second ceiling prevents one broken request from trapping the visitor. Once ready, the loader performs a short left-to-right clip wipe. Global GSAP reveals stay paused until the wipe is complete. The Home hero then begins its own breathing period and particle gathering sequence, so loading and identity formation remain two intentional beats rather than overlapping animations.

## Implementation locations

- `src/components/PageLoadProvider.tsx`
- `src/loading/page-assets.ts`
- `src/styles/page-loader.css`
- `src/config/experience.ts`
- `src/components/home/HeroEntranceTimeline.tsx`
