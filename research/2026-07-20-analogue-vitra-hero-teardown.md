# Analogue Agency Vitra hero teardown

## Scope

This teardown focuses on the opening scroll scene supplied for the Webine About page. It does not reproduce the reference page or its content. It isolates the scroll ownership, sticky layout and exit treatment that can be translated to Webine's particle head.

## Evidence

- Supplied page source: `/Users/whaihoe/.codex/attachments/bf93ca41-61f3-489f-b72a-fb88987c0b19/pasted-text.txt`
- Canonical page in the source: `https://analogueagency.com/case/vitra`
- Framer page module: `Pf7xiTZTACpgt9sXvXBDfuOvC1mbnUND0Ev-0PU168g.c9s_Qiui.mjs`
- Framer runtime bundle: `script_main.BszebTAm.mjs`
- Source publication marker: 13 July 2026

## Confirmed implementation

The reference is a Framer site. Its first scroll scene uses a normal document runway rather than blocking wheel or touch events:

- The outer hero is `200vh` tall.
- The visual container is `100vh`, `position: sticky` and `top: 0`.
- Framer names multiple scroll sections, including `trigger1`, `trigger2`, `trigger3`, `circles-animation` and `img`.
- The full page has an unusually long authored height of `31333.5px` at the main desktop variant and `25507px` at the tablet variant. This provides deliberate scroll distance for scrubbed media and section transitions.
- The page includes a fixed overlay container near the end of the document, separate from the sticky opening scene.
- Breakpoints are authored for wide desktop, desktop, tablet and phone layouts rather than relying on one scaled desktop composition.

## Inferred motion model

The minified Framer runtime does not expose descriptive source names for each progress transform. The combination of named scroll sections, a `200vh` runway and a sticky `100vh` visual confirms that document progress is mapped to the hero media while the viewport remains visually held. The visual exit is then handed back to normal page flow.

This is a scroll-linked scene, not a timed video transition. The media itself can be a video, GIF, canvas or WebGL renderer as long as it consumes the same normalised progress.

## Webine adaptation

Webine uses the same interaction principle with different content and rendering ownership:

1. ScrollTrigger owns one pinned About hero timeline and supplies normalised progress.
2. Three.js reads separate mutable values for head rotation and particle dispersal. It does not read or control document scroll.
3. The head rotates first, then the particles disperse across the full hero canvas.
4. During the final quarter, the hero frame contracts slightly on all four sides and gains the system `2rem` radius.
5. The pin ends after the contracted state is readable. The hero then leaves through normal document flow and the light statement section is revealed.
6. Reverse scrolling reconstructs the scene because the sequence is progress-driven.

## Responsive translation

- Desktop uses 2.4 viewport heights of scroll travel, a limited head turn and a restrained final frame scale.
- Mobile uses 2.1 viewport heights, a slightly stronger frame inset and a lower scrub value to keep touch input responsive.
- The canvas remains full-frame at every breakpoint. Only the inner Three.js scene changes, so the renderer does not resize during the contraction.
- The core motion idea remains intact on mobile. There is no operating-system reduced-motion branch.

## Performance and safety decisions

- No manual `wheel`, `touchmove` or `preventDefault` scroll trap.
- No React state updates on every scroll frame.
- No competing sticky element inside the pinned hero.
- The visual frame uses transforms and border radius for its closing movement.
- Three.js continues to own per-frame pointer response, idle movement and shader interpolation.
- ScrollTrigger owns pinning, sequencing, cleanup and reverse playback.

## Files implementing the adaptation

- `src/components/about/AboutHeadExperience.tsx`
- `src/three/AboutHeadCanvas.tsx`
- `src/pages/AboutPage.tsx`
- `src/styles/about.css`
- `src/config/experience.ts`
