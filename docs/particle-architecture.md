# Particle architecture

Webine uses one persistent GPU particle system with target buffers for the key homepage scenes.

## Target buffers

- `position`, the initial scattered field
- `targetHero`, an area-weighted surface sample of the supplied Webine logo GLB
- `targetReach`, a procedural torus-band formation for the Business Value scene
- `targetInterlude`, a procedural orbit formation used around the work interlude
- `targetClosing`, an area-weighted surface sample of the supplied colony planet GLB

The same `BufferGeometry` stays mounted for the whole homepage. The vertex shader interpolates between these targets according to scroll progress.

## Model-backed targets

Recognisable 3D objects use the same contract as the procedural targets: they are converted into `Float32Array` position buffers and attached to the particle geometry.

### Hero target

The hero target loads `/models/webine-logo-particle.glb`, which is byte-identical to the supplied `webine_w_logo_3d(3).glb`. The logo is centred, fit by its largest dimension, thickened with a local Z scale of `2.5`, then sampled across its real triangle surface. This makes the hero particle object come from the actual Webine logo mesh rather than a hand-built procedural W volume.

### Closing target

The closing target loads `/models/colony-planet-particle.glb`. The planet is centred, fit by its largest dimension and tilted into a raised three-quarter view so the upper colony surface and planetary depth both remain readable. Its real triangle surface is then sampled by area.

Procedural targets remain procedural where that is visually useful, while recognisable 3D objects can enter through the same target-buffer contract. No rendered GLB mesh is placed behind the particles.

## Mobile render path

The mobile profile uses the same target buffers and narrative progress contract but a cheaper shader and render schedule. Scatter and timeline-release vectors are precomputed into `targetScatter` and `targetRelease` attributes. On mobile, progress-store changes wake the demand canvas for a short 30 FPS burst and rendering stops after the morph settles. The mobile shader skips pointer deformation, particle ambient drift and animated colour cycling. Coarse-pointer phones also retain native touch scrolling so Lenis is not advanced from the GSAP ticker continuously on iPhone-class devices.
