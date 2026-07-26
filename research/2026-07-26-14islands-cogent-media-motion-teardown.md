# Site Teardown: 14islands Cogent Security AI media motion

**URL:** https://www.14islands.com/work/cogent-security-ai  
**Platform:** Next.js with React Three Fiber and a shared WebGL scroll rig  
**Date analysed:** 2026-07-26  
**Scope:** Image parallax and the thumbnail ripple effect requested for adaptation into Webine

## Evidence inspected

- The supplied 113 KB page HTML.
- The three page CSS bundles referenced by the HTML.
- The case-study route bundle and its shared JavaScript chunks.
- The rendered Cogent case-study page at a desktop viewport.

The supplied HTML remains the structural source. The public bundles were inspected to locate the custom code that the HTML references.

## Confirmed stack

| Technology | Evidence | Purpose |
|---|---|---|
| Next.js | `/_next/static/` assets and the dynamic `pages/work/[slug]` route bundle | Page routing, images and code splitting |
| React Three Fiber | Shared canvas components and frame callbacks in chunk `4052` | WebGL image planes, pointer input and render targets |
| Three.js | Plane geometries, shader materials, render targets and textures | Image displacement and parallax rendering |
| Lenis or an equivalent smooth scroll layer | `.lenis` rules and the shared scroll-rig classes | Smooth scroll progress supplied to the WebGL media |
| CSS modules | Hashed selectors such as `Thumbnail_media__kZ7oj` | Component styling |

## Media structure

The related-work thumbnail keeps a normal semantic link and image in the document:

```html
<a class="Thumbnail_link__aVnRR" href="/work/polyai">
  <div class="Thumbnail_media__kZ7oj" style="--aspect-ratio:1.5">
    <img
      class="Thumbnail_image___nURk ScrollRig-visibilityHidden ScrollRig-hiddenIfSmooth"
      alt="Poly AI thumbnail"
    />
  </div>
</a>
```

The original image is hidden only while the shared WebGL canvas is working. CSS restores it on smaller screens or when the global canvas fails. This keeps a usable image and link when the enhanced renderer is unavailable.

## Parallax implementation

The route passes `parallaxSpeed: .11` to related-work thumbnails. Larger case-study media uses values around `.2` to `.3`.

The shader receives normalised scroll progress and applies the movement to image UV coordinates:

```glsl
vUv2 *= 1. - uZoom * progress - .25 * uParallaxSpeed;

float parallax = (uParallax - .5) * 2. * uParallaxSpeed;
vUv2.y += parallax;
```

For the `.11` thumbnail setting, the centre-to-edge shift is roughly 5.5 percent of the texture after UV coordinates return to the zero-to-one range. The shader also applies a small compensating zoom. The important design point is that the frame stays still while only the rendered image travels.

### Webine adaptation

- Keep normal vertical document scrolling as the progress source.
- Use approximately 5 to 5.5 percent travel for ordinary vertical media parallax.
- Keep copy and project metadata stationary.
- Give the Home Selected Works media its own horizontal axis and a safe composition area so the movement does not cut off important screenshot content.
- Keep the existing DOM image as the fallback instead of copying the 14islands global WebGL canvas.

## Ripple effect

“Bubbling” is a reasonable description of the visible result, but the source names it the **Ripples Effect**. It is a real image displacement effect rather than a simple CSS hover scale.

The implementation:

1. Tracks fine-pointer movement over an invisible WebGL interaction plane.
2. Creates up to 50 small brush planes in an offscreen scene.
3. Places a brush when pointer distance and time thresholds are met.
4. Expands, rotates and fades each brush plane.
5. Renders the brush scene into a displacement texture.
6. Samples that texture in the image fragment shader and offsets image UVs around the pointer trail.

The key fragment-shader section is:

```glsl
vec4 displacement = texture2D(uDisplacement, scUv);
float theta = displacement.r * 2. * PI;
vec2 direction = vec2(sin(theta), cos(theta));
vec2 vUv3 = vUv2 + direction * displacement.r * uWaveStrength;
```

Confirmed default tuning from the bundle:

| Setting | Value |
|---|---:|
| Wave strength | `0.14` |
| Initial wave size | `3` |
| Wave expansion rate | `7` |
| Wave rotation | `0.1` |
| Wave fade velocity | `0.05` |
| Initial opacity | `0.22` |
| Minimum pointer distance | `0.005` |
| Minimum time | `0.1` |
| Brush pool | `50` planes |

Additional thumbnails can set `hasReducedRipples`, which halves their wave size and expansion. The shader also includes a separate enter and leave edge wave.

### Webine adaptation

Webine already has a fine-pointer-only SVG ripple and residual trail in the About portrait reveal. Replacing it with another route-wide WebGL media renderer would create duplicate ownership and add unnecessary cost. The suitable adaptation is to add real local turbulence displacement to the existing portrait layer, using the same pointer-local, expanding and fading behaviour while keeping:

- the existing particle-to-grayscale handoff
- the existing touch rejection
- the existing semantic portrait image
- one animation owner inside `PortraitReveal`
- no essential information hidden behind hover

## Responsive and fallback behaviour

- Below 900 px, the CSS makes the normal image visible instead of depending on the WebGL replacement.
- The DOM link and image remain present at every breakpoint.
- Ripple input is pointer-driven and should not be copied to touch as a permanent or simulated hover state.
- Webine should keep its existing fine-pointer capability test and stable touch portrait.

## Implementation decision

Webine will adapt the measured movement and interaction principles, not the complete 14islands renderer:

- 5 to 5.5 percent media travel as the reference range
- vertical travel for normal page media
- horizontal travel only inside Home Selected Works
- one clipping frame and one inner movement owner
- a local fine-pointer portrait ripple with real SVG turbulence displacement and no magnifying lens
- normal images and links retained as the accessible and failure-safe base

This gives Webine the same restrained depth and pointer response without copying 14islands-specific shaders, global canvas architecture or visual identity.
