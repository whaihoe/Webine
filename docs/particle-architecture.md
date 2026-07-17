# Particle architecture

Webine uses one persistent GPU particle system on tablet and desktop, plus section-owned 2D particle canvases on mobile.

All recognisable objects now share one USTA-informed electron-motion contract. Stable seeded particle identities receive different rates, amplitudes and phases rather than inheriting only a whole-object rotation. Formed GPU targets keep a restrained three-axis local orbit, mobile targets use two-frequency pixel-space orbits and dispersed targets use a wider field. Whole-object float, rotation, scroll travel and pointer bulge remain additive layers. This keeps the Webine logo, About head, Services orb, Reach form, interlude form and closing planet alive without dissolving their silhouettes.

## Target buffers

- `position`, the initial scattered field
- `targetHero`, an area-weighted surface sample of the supplied Webine logo GLB
- `targetReach`, a procedural torus-band formation for the Business Value scene
- `targetWorkA`, `targetWorkB` and `targetWorkC`, restrained procedural frame, directional underline and diagonal cluster formations for Selected Work
- `targetInterlude`, a procedural orbit formation used around the work interlude
- `targetClosing`, an area-weighted surface sample of the supplied colony planet GLB

On tablet and desktop, the same `BufferGeometry` stays mounted for the whole homepage. The vertex shader interpolates between these targets according to scroll progress.

The work targets are intentionally capped at 12 percent story visibility. The runway sends one continuous project progress value, so the existing particle population streams between the three forms instead of swapping geometries. Chapter 04 formation then takes ownership through the existing reversible interlude branch. Phones omit work particles because their section-owned renderer is the performance-safe alternative and project content must remain dominant.

## Model-backed targets

Recognisable 3D objects use the same contract as the procedural targets: they are converted into `Float32Array` position buffers and attached to the particle geometry.

### Hero target

The hero target loads `/models/webine-logo-particle.glb`, which is byte-identical to the supplied `webine_w_logo_3d(3).glb`. The logo is centred, fit by its largest dimension, thickened with a local Z scale of `2.5`, then sampled across its real triangle surface. This makes the hero particle object come from the actual Webine logo mesh rather than a hand-built procedural W volume.

### Closing target

The closing target loads `/models/colony-planet-particle.glb`. The planet is centred, fit by its largest dimension and tilted into a raised three-quarter view so the upper colony surface and planetary depth both remain readable. Its real triangle surface is then sampled by area.

Procedural targets remain procedural where that is visually useful, while recognisable 3D objects can enter through the same target-buffer contract. No rendered GLB mesh is placed behind the particles.

## Mobile render path

Phones at the mobile breakpoint do not mount the fixed React Three Fiber canvas. The Hero, Reach, Interlude and Closing sections each own an absolutely positioned 2D canvas inside the section. Normal document scrolling therefore moves the particle layer with its section and no particle group has to chase a moving DOM anchor. Scroll progress only controls a local `scatter -> formed -> scatter` interpolation.

The four mobile target point clouds and their scatter positions are baked into `public/mobile-particles/section-targets.bin`. The binary is about 138 KB and contains 2,200 unique source points per target. The renderer draws those independently sampled positions directly instead of creating jittered copies around a smaller point set, which gives the Webine logo, rings and colony planet a finer and more even particle surface. The hero and closing point clouds come from the real Webine logo and colony planet meshes, while the two ring targets remain procedural. Mobile does not load Three.js, React Three Fiber, GLTFLoader, MeshSurfaceSampler or the WebGL shaders. The scatter projection now uses a 0.22 viewport-relative scale and every point receives an inexpensive two-frequency orbit derived from its baked randomness. The canvases run at the existing 30 FPS ceiling and schedule lightweight ambient motion only while the object is near the viewport.

This mobile path is deliberate, not a temporary copy of the earlier WebGL profile. Keeping the canvas absolute inside its section lets the browser move the complete layer during native scrolling. JavaScript changes only the local particle arrangement, which removes the anchor-chasing jitter seen with a fixed particle object on real phones. Mobile density now comes from the independently baked 2,200-point targets rather than duplicated display copies. The removed mobile WebGL shader, demand-frame loop and mobile GPU profile must not be restored unless real-device testing shows a clear benefit.
