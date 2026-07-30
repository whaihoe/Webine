import { particlePointerVertexShaderChunk } from "../particle-pointer";

export const serviceParticleVertexShader = `
  attribute vec3 targetFrom;
  attribute vec3 targetTo;
  attribute float particleRandom;

  uniform float uMorph;
  uniform float uTime;
  uniform float uPointSize;
  uniform float uTransitionSpread;
  uniform float uElectronAmplitude;
  ${particlePointerVertexShaderChunk}

  varying float vRandom;
  varying float vDepth;
  varying float vPointerInfluence;

  void main() {
    float progress = smoothstep(0.0, 1.0, uMorph);
    float transition = sin(progress * 3.14159265);
    vec3 centreTarget = mix(targetFrom, targetTo, progress);
    vec3 spreadDirection = normalize(
      mix(targetFrom, targetTo, 0.5)
      + vec3(
        sin(particleRandom * 91.7),
        cos(particleRandom * 67.2),
        sin(particleRandom * 113.4)
      )
      + vec3(0.001)
    );
    vec3 particlePosition = centreTarget
      + spreadDirection * transition * uTransitionSpread * (0.42 + particleRandom * 0.84);

    float rate = 0.32 + particleRandom * 0.88;
    float phase = particleRandom * 31.4159;
    vec3 localMotion = vec3(
      sin(uTime * rate + phase) + sin(uTime * rate * 0.31 + phase * 1.7) * 0.34,
      cos(uTime * rate * 0.73 + phase * 1.3) + sin(uTime * rate * 0.27 + phase * 0.6) * 0.3,
      sin(uTime * rate * 0.57 + phase * 0.7) + cos(uTime * rate * 0.23 + phase * 1.2) * 0.38
    ) * uElectronAmplitude;
    particlePosition += localMotion * (1.0 - transition * 0.28);

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 objectCentreView = viewMatrix * modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float pointerInfluence = applyParticlePointer(viewPosition);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = applyParticlePointerPointScale(uPointSize, pointerInfluence)
      * (7.0 / max(1.0, -objectCentreView.z));
    vRandom = particleRandom;
    vDepth = clamp((-viewPosition.z - 4.0) / 5.0, 0.0, 1.0);
    vPointerInfluence = pointerInfluence;
  }
`;

export const serviceParticleFragmentShader = `
  uniform float uTime;
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform vec3 uDeepBlueColour;

  varying float vRandom;
  varying float vDepth;
  varying float vPointerInfluence;

  void main() {
    vec2 centred = gl_PointCoord - 0.5;
    float distanceFromCentre = length(centred);
    if (distanceFromCentre > 0.5) discard;
    float core = 1.0 - smoothstep(0.08, 0.5, distanceFromCentre);
    float colourFlow = 0.5 + 0.5 * sin(uTime * 0.34 + vRandom * 18.0);
    vec3 nearColour = mix(uCyanColour, uBlueColour, colourFlow);
    vec3 colour = mix(nearColour, uDeepBlueColour, vDepth * 0.58);
    colour = mix(colour, uCyanColour, vPointerInfluence * 0.42);
    gl_FragColor = vec4(colour, core * (0.58 + vRandom * 0.4));
  }
`;
