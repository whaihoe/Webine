export const particleVertexShader = `
  attribute vec3 targetPosition;
  attribute float particleRandom;

  uniform float uProgress;
  uniform float uPointSize;
  uniform float uTime;

  varying float vRandom;

  void main() {
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float transitionWave = sin(easedProgress * 3.14159265);
    vec3 particlePosition = mix(position, targetPosition, easedProgress);
    vec3 direction = normalize(position + vec3(0.001));

    particlePosition += direction * transitionWave * (0.08 + particleRandom * 0.14);
    particlePosition.x += sin(uTime * 0.28 + particleRandom * 12.0) * 0.012;
    particlePosition.y += cos(uTime * 0.24 + particleRandom * 9.0) * 0.012;

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = uPointSize * (10.0 / max(1.0, -viewPosition.z));
    vRandom = particleRandom;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uPrimaryColour;
  uniform vec3 uSecondaryColour;

  varying float vRandom;

  void main() {
    float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.28, 0.5, distanceToCentre);

    if (alpha < 0.02) {
      discard;
    }

    vec3 colour = mix(uPrimaryColour, uSecondaryColour, vRandom);
    gl_FragColor = vec4(colour, alpha * 0.88);
  }
`;
