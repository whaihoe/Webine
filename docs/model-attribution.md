# Model attribution

## About simple head

- Production derivative: `public/about/simple-head-points.bin`
- Reproduction script: `scripts/generate-about-head-target.mjs`
- Original user-supplied file: `simple_head.glb`
- Work: “Simple head”
- Artist: Podimoncho
- Source: `https://sketchfab.com/3d-models/simple-head-77da7979d60f400bad0e8e426fd8eb9f`
- Licence recorded in the supplied GLB: Creative Commons Attribution 4.0

The About page samples the supplied mesh into a deterministic 9,000-point binary surface target. This preserves the form used by the scroll-linked point scene while reducing the public model payload from about 989 KB to about 105 KB. The derivative contains positions only and does not redistribute the original material payload.

## Colony planet particle source

- File used in production: `public/models/colony-planet-particle.glb`
- Source asset supplied by the user in this chat
- Original user file name: `Colony_Planet_Art.glb`

Webine uses a geometry-only derivative for particle surface sampling. The production derivative keeps the supplied mesh geometry while removing the embedded texture and material payload that the particle renderer does not use.

## Webine logo particle source

- File used in production: `public/models/webine-logo-particle.glb`
- Source asset supplied by the user in this chat
- Original user file name: `webine_w_logo_3d(3).glb`

Webine uses the supplied logo GLB as the hero particle mesh source and thickens it in the particle-preparation step before surface sampling.
