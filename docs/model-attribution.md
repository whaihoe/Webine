# Model attribution

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
