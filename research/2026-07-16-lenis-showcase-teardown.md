# Site teardown: Lenis Showcase galaxy field

**URL:** https://lenis.dev/showcase
**Built by:** darkroom.engineering
**Platform:** Next.js with React Three Fiber, Three.js and Lenis
**Date analysed:** 16 July 2026

## Scope

This teardown focuses on the fixed background, sparse points and scroll behaviour referenced for Webine. The attached HTML, its two page stylesheets and the lazy WebGL chunks were inspected directly.

## Confirmed stack

| Technology | Evidence | Purpose |
|---|---|---|
| Next.js | `/_next/static/chunks/` assets and streamed React payload | Page and asset delivery |
| Lenis | `ReactLenis` with `lerp: 0.125` and `allowNestedScroll: true` | Weighted public scrolling |
| React Three Fiber | lazy `WebGL` component rendering a `<Canvas>` | Fixed particle canvas |
| Three.js | `BufferGeometry`, `ShaderMaterial`, orthographic camera and WebGL renderer | Sparse depth-aware points |
| CSS Modules | hashed `showcase-module__...` classes | Page and fixed-layer styling |

## Fixed galaxy construction

The galaxy is split into a fixed WebGL point layer and a CSS atmospheric glow.

### Fixed canvas

Confirmed CSS:

```css
.showcase-module__canvas {
  background-color: var(--theme-primary);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
```

The canvas and all of its descendants use `pointer-events: none`. The document scrolls normally above it, so the background remains spatially stable.

### Atmospheric glow

Confirmed CSS:

```css
.showcase-module__canvas::after {
  content: "";
  background: radial-gradient(var(--color-pink), var(--color-pink-transparent) 70%);
  opacity: 0.5;
  width: 200vw;
  height: 100vw;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%) translateY(50vh);
}
```

The important visual trick is scale. The glow is much wider than the viewport and begins halfway down the screen, so it reads as an atmospheric horizon rather than a circular spotlight.

## Point field implementation

The source renders only 100 points. The density comes from varied glow, size, depth and movement rather than a large particle count.

Confirmed scene parameters:

```text
width = viewport width
height = viewport height
depth = 500
count = 100
scale = 500
size = 150
orthographic camera position z = 1000
pixel ratio = 1 to 2
```

Each point receives stable random attributes:

- Three-dimensional position spread across viewport width, height and 500 depth units
- Three-component noise seed
- Point size from 0 to 150
- Noise speed from 0 to 0.2
- Noise travel scale from 0 to 100

### Vertex movement

The vertex shader samples 2D simplex noise independently for x, y and z:

```glsl
modelPosition.x += snoise(vec2(noise.x, uTime * speed)) * scale;
modelPosition.y += snoise(vec2(noise.y, uTime * speed)) * scale;
modelPosition.z += snoise(vec2(noise.z, uTime * speed)) * scale;
```

This gives each point a non-linear wandering path. It does not move the whole field in one direction.

Scroll is depth weighted:

```glsl
float depth = 1.0 / -(viewMatrix * modelPosition).z;
modelPosition.y += uScroll * depth * 100.0;
modelPosition.y = mod(modelPosition.y, uResolution.y) - uResolution.y / 2.0;
```

Near points travel more than distant points and wrap vertically, creating a subtle endless-space parallax without spawning or deleting geometry.

### Fragment glow

The point sprite uses inverse distance from `gl_PointCoord` centre:

```glsl
float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
float strength = 0.05 / distanceToCenter - 0.1;
gl_FragColor = vec4(uColor, strength);
```

The confirmed point colour is `rgb(255, 207, 206)`. The centre becomes bright while the edge falls away softly, which makes a tiny point feel luminous without a separate texture.

## Webine adaptation

Webine should copy the spatial logic, not Lenis' pink identity:

- Keep the Works background fixed across the complete route.
- Use a very sparse field with independent paths, depth-like scale changes and twinkling.
- Use a broad blue and cyan atmosphere rising from the lower half of the viewport.
- Keep that horizon visibly legible on physical phones. An effect that disappears after mobile positioning, opacity and surface layering does not satisfy the reference.
- Preserve slate-950 as the dominant background so the gallery remains calm.
- Keep all project text and controls above the effect.
- Do not mount another Three.js scene outside Home. The Webine adaptation uses deterministic DOM points and CSS animation, with a lower mobile count.
- Contact and the Home hero receive only the sparse points, not the full galaxy atmosphere.

## Performance notes

- Lenis uses 100 GPU points and a fixed full-viewport renderer.
- Webine already owns a complex Three.js homepage narrative, so a second WebGL route would add bundle and context cost without improving the portfolio content.
- The CSS adaptation keeps one fixed compositing layer, uses transform and opacity animation and caps the phone field separately.
- No essential information belongs inside the background effect.

## Source assets inspected

- Attached raw HTML for `https://lenis.dev/showcase`
- `/_next/static/chunks/3af419f2a73f8c26.css`
- `/_next/static/chunks/820113a6a087e057.css`
- Showcase route chunk `c687ff377728e534.js`
- Lazy WebGL chunks `0a4a99474b586606.js`, `090f4a128a49e295.js` and `5ffa6229b261ebb3.js`
