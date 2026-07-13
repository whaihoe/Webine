# Webine particle architecture

Stage 3 creates the persistent homepage visual system without coupling it to the final Stage 4 hero layout.

## Runtime flow

```text
registered HTML scene
  → normalised story progress
  → shared progress store
  → one lazy particle canvas
  → one geometry with stable target attributes
  → entrance and scroll-exit shader uniforms
```

`ParticleSceneController` measures registered sections through normal document coordinates. It exposes per-scene presence, the active scene, live section-local anchors and independent point-based formation and dispersion values. ScrollSmoother is only a desktop scroll surface. It is not the source of particle progress.

## Geometry contract

The persistent geometry contains:

- `position`, the deterministic scattered field
- `targetPosition`, a closed Webine volume sampled across front, back and perimeter side walls
- `targetReach`, an expanding three-band signal
- `targetOrbit`, a quieter four-band interlude form
- `targetClosing`, a forward-facing open arrow
- `particleRandom`, stable variation for colour and subtle movement
- `particleShade`, stable cyan, blue and deep-blue facet treatment
- `particleAmbient`, a stable mask that keeps a small subset outside the folded form

The geometry remains mounted while the coordinated hero entrance changes `uProgress`. The hero point later owns its dispersion, so returning upward restores the completed mark without replaying the entrance timeline. A fine pointer creates local depth displacement plus restrained whole-object travel and tilt.

After formation, the complete folded object uses bounded 3D yaw, pitch, roll and depth floating. It never spins far enough to lose the Webine silhouette. A stable 4.5 percent desktop or 3.5 percent mobile subset remains loose and drifts around the form, producing USTA-inspired ambient depth without adding a second geometry. The fragment shader cycles slowly through the existing cyan, blue and deep-blue tokens over 18 seconds. All amplitudes, ratios and timing live in `experienceConfig.particles`.

All post-hero targets are sampled as rounded 3D tubes, toruses or capsules with meaningful depth. Thin lines and flat sharp outlines are superseded. A transition never directly interpolates one settled form into another. Each visual section owns formation and dispersion progress derived from its own point. The next target forms around that point from viewport entry to viewport centre, holds there and disperses after the point crosses the top.

The timeline handoff keeps the same particles allocated. The interlude point first disperses the orbit after crossing the viewport top. Intake converges particles into the moving HTML inlet point and fades them on contact. Particles remain invisible while they appear to move through the semantic line. A separate release starts exactly when the line bottom reaches viewport centre, fades particles back in from that point and disperses them. It does not form the arrow. The closing section's own point later gathers and forms that target. All values are geometry-derived and reversible. No section mounts its own canvas or replaces the geometry during normal scroll.

Superseding intake detail: particle absorption begins in a measured approach zone before line progress starts. The DOM line supplies a normalised inlet position on each scroll update. Stable particle randomness gives every particle its own contact threshold, so particles gather into the moving inlet and fade only when they reach it. Most are already hidden at the viewport-centre crossing. Release keeps its centre trigger, but opacity returns per particle from the outlet before the dispersed field travels to the closing anchor and forms.

Between settled targets, the same allocated population expands into a wide radial field with a short overshoot. A stable random mask shows 58 percent of particles while fully dispersed, then returns the complete population as a form gathers. After Section 2, visibility fades from 18 to 78 percent of reach dispersion so the field is gone before Selected Work. It fades back during chapter 04 expansion and forms at the real interlude point while that point is still below the viewport.

Particle progress uniforms ease toward their geometry-derived values. This adds enough visual breathing room for fast wheel and trackpad input without intercepting wheel events. Desktop ScrollSmoother uses slightly more inertia, while the pinned runway uses the same modest scrub delay across desktop, tablet and mobile.

Reverse ownership uses exact endpoints. When a geometry-derived value reaches zero, its shader uniform is set to exact zero instead of approaching it forever. This prevents a later `if (progress > 0)` branch from continuing to override the earlier shape after the visitor scrolls back.

Every visible settled form uses the same anchor measurement contract but keeps independent motion settings. React combines each responsive anchor fraction with the live section rectangle, stores the resulting viewport point and calculates that section's formation and dispersion values. The renderer keeps the object's centre on the point while formed. Shared shader properties provide one cyan-to-blue colour cycle, hover bulge, whole-object tilt, floating and rotation across every section.

The hero target samples a closed volumetric Webine mark. Particle positions cover connected front and back faces plus the perimeter side walls, so rotation reads as one solid logo rather than two independent planes.

Fine-pointer response has two layers. The whole object follows the pointer by a small bounded distance and adds a slight tilt. Particles near the pointer stretch primarily in depth and grow slightly, producing a bulge without creating a repulsion hole. Held forms float and complete a slow self-rotation loop so their 3D sides remain visible.

## Profiles

| Profile | Count | Ambient share | Point size | Pixel-ratio cap | Object scale |
|---|---:|---:|---:|---:|---:|
| Desktop | 6,000 | 4.5% | 3.2 | 1.5 | 1 |
| Tablet | 1,800 | 3.5% | 4.2 | 1.25 | 1.22 |
| Mobile | 1,800 | 3.5% | 3.8 | 1.25 | 1.22 |

Tablets from 600 to 1023 px use the reduced 1,800-particle profile with a separate 4.2 point size. Mobile uses 3.8, so both compact breakpoints can be tuned without changing desktop. These remain starting values until real-device testing.

## Loading and failure

Readable HTML and a light scattered-field poster render first. WebGL 2 is probed before the lazy canvas is requested. The Webine logo remains available after capability, import, shader or context failure. Both poster treatments remain replaceable when approved final poster art is supplied.

The render loop pauses when no registered Home scene is visible or the document is backgrounded. Route unmount removes observers, scroll listeners, GSAP instances and the React Three Fiber canvas.

## Remaining handoff

The current homepage implements the complete narrative target chain. Final commissioned project media, licensed Railway files and real-device performance measurements remain external gates. Those inputs may refine imagery, typography, density and safe regions without replacing the Home experience boundary, scene registration, canvas or geometry.
