# Webine motion and scene configuration

Stage 2 creates the configuration boundary without enabling advanced effects. The current settings live in `src/config/experience.ts`.

| Feature | Current state | Dedicated stage |
|---|---|---|
| General motion presets | Disabled | Stage 21 for global polish, with component feedback already tokenised |
| Persistent particles | Disabled | Stage 3 onward |
| Smooth scrolling | Disabled | Stage 3 onward |
| Signal Grid response | Disabled | Stage 6 |
| Page transitions | Disabled | Stage 21 |

The static HTML and CSS composition must remain complete when every feature is disabled. Future implementations should read this configuration instead of creating separate hardcoded switches inside page components.
