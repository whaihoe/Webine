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

`ParticleSceneController` measures registered sections through normal document coordinates. It exposes per-scene presence, the active scene, live section-local anchors and a reversible exit value derived from each section bottom. The exit value stays zero until `rect.bottom === viewportHeight / 2`, then reaches one as the bottom leaves the viewport. ScrollSmoother is only a desktop scroll surface. It is not the source of particle progress.

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

The geometry remains mounted while the coordinated hero entrance changes `uProgress`. The hero section-bottom exit value later releases the completed mark into the reach transition, so returning upward restores the completed mark instead of replaying its formation. A fine pointer creates local depth displacement plus restrained whole-object travel and tilt.

After formation, the complete folded object uses bounded 3D yaw, pitch, roll and depth floating. It never spins far enough to lose the Webine silhouette. A stable 4.5 percent desktop or 3.5 percent mobile subset remains loose and drifts around the form, producing USTA-inspired ambient depth without adding a second geometry. The fragment shader cycles slowly through the existing cyan, blue and deep-blue tokens over 18 seconds. All amplitudes, ratios and timing live in `experienceConfig.particles`.

All post-hero targets are sampled as rounded 3D tubes, toruses or capsules with meaningful depth. Thin lines and flat sharp outlines are superseded. A transition never directly interpolates one settled form into another. It first returns the stable particle indices to the seeded dispersed field, then forms the next target and holds it until the section-bottom centre threshold.

The timeline handoff keeps the same particles allocated. The interlude section-exit value first releases the orbit into its dispersed field at the common section-bottom threshold. An intake approach begins later, before line fill, and converges particles into the moving HTML inlet point. Particles then remain invisible while they appear to move through the semantic line. A separate release progress starts exactly when the line bottom reaches viewport centre, fades particles back in from that point, disperses them and forms the rounded closing target. All values are geometry-derived and reversible. No section mounts its own canvas or replaces the geometry during normal scroll.

Superseding intake detail: particle absorption begins in a measured approach zone before line progress starts. The DOM line supplies a normalised inlet position on each scroll update. Stable particle randomness gives every particle its own contact threshold, so particles gather into the moving inlet and fade only when they reach it. Most are already hidden at the viewport-centre crossing. Release keeps its centre trigger, but opacity returns per particle from the outlet before the dispersed field travels to the closing anchor and forms.

The work runway does not render live particles. The same allocated population is moved to its dispersed target and its narrative visibility reaches zero before work. It stays hidden while the final centred card expands into chapter 04, then returns dispersed at the interlude anchor after the real section takes over. This avoids a second canvas or population while keeping portfolio content and the card expansion completely unobstructed.

Every visible settled form uses the same section-local anchor contract. React combines the responsive anchor fraction in `particleSceneConfig` with the live section rectangle, stores the resulting normalised viewport point and converts it into canvas coordinates each frame. Hero, reach and interlude therefore move with their own sections while held instead of remaining fixed to the viewport. The closing arrow uses the same system, stays opaque and leaves with its section when the footer enters.

The hero target samples a closed volumetric Webine mark. Particle positions cover connected front and back faces plus the perimeter side walls, so rotation reads as one solid logo rather than two independent planes.

Fine-pointer response has two layers. The whole object follows the pointer by a small bounded distance and adds a slight tilt. Particles near the pointer stretch primarily in depth and grow slightly, producing a bulge without creating a repulsion hole. Held forms float and complete a slow self-rotation loop so their 3D sides remain visible.

## Profiles

| Profile | Count | Ambient share | Point size | Pixel-ratio cap | Object scale |
|---|---:|---:|---:|---:|---:|
| Desktop | 6,000 | 4.5% | 3.2 | 1.5 | 1 |
| Mobile | 1,800 | 3.5% | 5.4 | 1.25 | 1.22 |

Tablets from 600 to 1023 px use the lower mobile render profile with their own composition position, so the folded mark stays out of the copy without paying the desktop particle cost. These are starting values inside the blueprint limits. Stage 5 real-device testing decides whether they remain final.

## Loading and failure

Readable HTML and a light scattered-field poster render first. WebGL 2 is probed before the lazy canvas is requested. The Webine logo remains available after capability, import, shader or context failure. Both poster treatments remain replaceable when approved final poster art is supplied.

The render loop pauses when no registered Home scene is visible or the document is backgrounded. Route unmount removes observers, scroll listeners, GSAP instances and the React Three Fiber canvas.

## Remaining handoff

The current homepage implements the complete narrative target chain. Final commissioned project media, licensed Railway files and real-device performance measurements remain external gates. Those inputs may refine imagery, typography, density and safe regions without replacing the Home experience boundary, scene registration, canvas or geometry.
