import { particleRenderConfig } from "../config/experience";

export type ParticlePointerState = {
  x: number;
  y: number;
  active: boolean;
};

export type ParticleInteractionState = {
  pointerX: number;
  pointerY: number;
  pointerAspect: number;
  strength: number;
  offsetX: number;
  offsetY: number;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
};

const pointerMotion = particleRenderConfig.motion;

function glslFloat(value: number) {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

export const particlePointerVertexShaderChunk = `
  uniform vec2 uPointer;
  uniform float uPointerAspect;
  uniform float uPointerStrength;

  float applyParticlePointer(inout vec4 viewPosition) {
    vec4 clipPosition = projectionMatrix * viewPosition;
    vec2 screenPosition = clipPosition.xy / max(clipPosition.w, 0.0001);
    vec2 pointerDelta = screenPosition - uPointer;
    pointerDelta.x *= uPointerAspect;
    float pointerInfluence = pow(smoothstep(
      ${glslFloat(pointerMotion.pointerBulge.screenRadius)},
      0.0,
      length(pointerDelta)
    ), ${glslFloat(pointerMotion.pointerBulge.falloffPower)})
      * uPointerStrength
      * ${glslFloat(pointerMotion.pointerBulge.strength)};
    viewPosition.z += pointerInfluence * ${glslFloat(pointerMotion.pointerBulge.depth)};
    return pointerInfluence;
  }

  float applyParticlePointerPointScale(float pointSize, float pointerInfluence) {
    return pointSize * (1.0 + pointerInfluence * ${glslFloat(pointerMotion.pointerBulge.pointScale)});
  }
`;

export function createParticleInteractionState(): ParticleInteractionState {
  return {
    pointerX: 20,
    pointerY: 20,
    pointerAspect: 1,
    strength: 0,
    offsetX: 0,
    offsetY: 0,
    tiltX: 0,
    tiltY: 0,
    tiltZ: 0,
  };
}

export function updateParticleInteraction(
  interaction: ParticleInteractionState,
  pointer: ParticlePointerState,
  {
    viewportWidth,
    viewportHeight,
    formedStrength,
  }: {
    viewportWidth: number;
    viewportHeight: number;
    formedStrength: number;
  },
) {
  const strength = pointer.active
    ? Math.max(0, Math.min(1, formedStrength))
    : 0;
  const travel = pointerMotion.pointerTravel * strength;
  interaction.pointerX = strength > 0 ? pointer.x : 20;
  interaction.pointerY = strength > 0 ? pointer.y : 20;
  interaction.pointerAspect = viewportWidth / Math.max(viewportHeight, 0.001);
  interaction.strength = strength;
  interaction.offsetX = pointer.x * travel;
  interaction.offsetY = pointer.y * travel * 0.72;
  interaction.tiltX = -pointer.y * pointerMotion.pointerTilt * strength;
  interaction.tiltY = pointer.x * pointerMotion.pointerTilt * strength;
  interaction.tiltZ = pointer.x * pointerMotion.pointerTilt * 0.34 * strength;
}
