# Webine motion and scene configuration

Stage 2 creates the configuration boundary without enabling advanced effects. The current settings live in `src/config/experience.ts`.

| Feature | Current state | Dedicated stage |
|---|---|---|
| General motion presets | Disabled | Stage 21 for global polish, with component feedback already tokenised |
| Persistent particles | Enabled for the Home architecture and first two targets | Stage 3 onward |
| Smooth scrolling | Enabled on fine-pointer desktop layouts, native on mobile | Stage 3 onward |
| Signal Grid response | Disabled | Stage 6 |
| Page transitions | Disabled | Stage 21 |

The static HTML and CSS composition must remain complete when every feature is disabled. Future implementations should read this configuration instead of creating separate hardcoded switches inside page components.

## Stage 3 scene contract

The Home route currently registers one `hero` scene. Its normalised progress drives one geometry from `scattered-field` to `folded-webine`. Stage 4 may change the hero layout, poster art and safe region, but it must keep the `data-particle-scene="hero"` anchor and the shared controller boundary. Stage 5 will add the first-load choreography through the existing progress and target interfaces rather than creating another canvas.
