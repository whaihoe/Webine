# Webine particle architecture

Stage 3 creates the persistent homepage visual system without coupling it to the final Stage 4 hero layout.

## Runtime flow

```text
registered HTML scene
  → normalised story progress
  → shared progress store
  → one lazy particle canvas
  → one geometry with stable target attributes
  → shader interpolation
```

`ParticleSceneController` measures registered sections through normal document coordinates. It exposes page progress, per-scene progress, the active scene and whether rendering should run. ScrollSmoother is only a desktop scroll surface. It is not the source of particle progress.

## Geometry contract

The initial geometry contains:

- `position`, the deterministic scattered field
- `targetPosition`, the procedural folded Webine form
- `particleRandom`, stable variation for colour and subtle movement

The geometry remains mounted while the shader changes `uProgress`. Later scenes must add approved target data to this shared system. They must not mount section-owned canvases or replace the geometry during normal scroll.

## Profiles

| Profile | Count | Point size | Pixel-ratio cap | Object scale |
|---|---:|---:|---:|---:|
| Desktop | 6,000 | 3.2 | 1.5 | 1 |
| Mobile | 1,800 | 5.4 | 1.25 | 1.22 |

These are starting values inside the blueprint limits. Stage 5 real-device testing decides whether they remain final.

## Loading and failure

Readable HTML and the poster render first. WebGL 2 is probed before the lazy canvas is requested. The poster remains visible during loading and after capability, import, shader or context failure. The current logo-based poster is a replaceable placeholder for Stage 4, not the approved final particle poster.

The render loop pauses when no registered Home scene is visible or the document is backgrounded. Route unmount removes observers, scroll listeners, GSAP instances and the React Three Fiber canvas.

## Stage 4 handoff

Stage 4 owns the final static hero composition, approved desktop and mobile posters, copy wrapping, contrast and safe regions. It should keep the Home experience boundary, the `hero` scene registration and the poster component. This lets the poster-only hero pass its own gate before Stage 5 connects the entrance choreography to the existing particle targets.
