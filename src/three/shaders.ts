import { experienceConfig } from "../config/experience";
import { particlePointerVertexShaderChunk } from "./particle-pointer";

const particleGlow = experienceConfig.particles.glow;
const processTransition = experienceConfig.particles.processTransition.gpu;
const glslFloat = (value: number) =>
  Number.isInteger(value) ? value.toFixed(1) : String(value);

export const particleVertexShader = `
  attribute vec3 targetHero;
  attribute vec3 targetScatter;
  attribute vec3 targetRelease;
  attribute vec3 targetReach;
  attribute vec3 targetWorkA;
  attribute vec3 targetWorkB;
  attribute vec3 targetWorkC;
  attribute vec3 targetInterlude;
  attribute vec3 targetClosing;
  attribute float particleRandom;
  attribute float particleAmbient;

  uniform float uProgress;
  uniform float uHeroExitProgress;
  uniform float uReachFormationProgress;
  uniform float uReachExitProgress;
  uniform float uWorkFormationProgress;
  uniform float uWorkProjectProgress;
  uniform float uInterludeFormationProgress;
  uniform float uInterludeExitProgress;
  uniform float uTimelineIntakeProgress;
  uniform float uTimelineReleaseProgress;
  uniform float uClosingFormationProgress;
  uniform float uClosingExitProgress;
  uniform float uStoryVisibility;
  uniform float uPointSize;
  uniform float uTime;
  uniform float uAmbientDrift;
  uniform float uAmbientStrength;
  uniform float uObjectLooseness;
  uniform float uElectronDrift;
  uniform float uElectronSpeed;
  uniform float uTransitionSpread;
  uniform float uSurfacePrimaryScale;
  uniform float uSurfaceSecondaryScale;
  uniform float uSurfaceResidualMix;
  uniform float uColourCycleSpeed;
  uniform float uDensityScale;
  uniform float uDensityCycleSpeed;
  uniform float uSurfaceFlowScale;
  uniform float uSurfacePositionLock;
  ${particlePointerVertexShaderChunk}

  varying float vRandom;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;
  varying float vSurfaceColour;
  varying float vSurfaceDensity;

  void main() {
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float transitionWave = sin(easedProgress * 3.14159265);
    vec3 scatterTarget = targetScatter;

    vec3 narrativeTarget = targetHero;
    float narrativeVisibility = 1.0;
    float dispersedParticle = step(0.42, particleRandom);

    if (uHeroExitProgress > 0.0) {
      float heroBurst = 1.0 + sin(uHeroExitProgress * 3.14159265) * uTransitionSpread;
      narrativeTarget = mix(
        targetHero,
        scatterTarget * heroBurst,
        smoothstep(0.0, 1.0, uHeroExitProgress)
      );
      narrativeVisibility = mix(
        1.0,
        dispersedParticle,
        smoothstep(0.0, 1.0, uHeroExitProgress)
      );
    }

    if (uReachFormationProgress > 0.0) {
      narrativeTarget = mix(
        scatterTarget,
        targetReach,
        smoothstep(0.0, 1.0, uReachFormationProgress)
      );
      narrativeVisibility = mix(
        dispersedParticle,
        1.0,
        smoothstep(0.0, 1.0, uReachFormationProgress)
      );
    }

    if (uReachExitProgress > 0.0) {
      float reachBurst = 1.0 + sin(uReachExitProgress * 3.14159265) * uTransitionSpread;
      narrativeTarget = mix(
        targetReach,
        scatterTarget * reachBurst,
        smoothstep(0.0, 1.0, uReachExitProgress)
      );
      narrativeVisibility = mix(
        1.0,
        dispersedParticle,
        smoothstep(0.0, 1.0, uReachExitProgress)
      );
    }

    if (uWorkFormationProgress > 0.0) {
      float workPhase = clamp(uWorkProjectProgress, 0.0, 1.0) * 2.0;
      vec3 firstWorkTarget = mix(targetWorkA, targetWorkB, smoothstep(0.0, 1.0, workPhase));
      vec3 workTarget = mix(firstWorkTarget, targetWorkC, smoothstep(1.0, 2.0, workPhase));
      narrativeTarget = mix(scatterTarget, workTarget, smoothstep(0.0, 1.0, uWorkFormationProgress));
      narrativeVisibility = mix(dispersedParticle, 1.0, smoothstep(0.0, 1.0, uWorkFormationProgress));
    }

    if (uInterludeFormationProgress > 0.0) {
      narrativeTarget = mix(
        scatterTarget,
        targetInterlude,
        smoothstep(0.0, 1.0, uInterludeFormationProgress)
      );
      narrativeVisibility = mix(
        dispersedParticle,
        1.0,
        smoothstep(0.0, 1.0, uInterludeFormationProgress)
      );
    }

    if (uInterludeExitProgress > 0.0) {
      float interludeBurst = 1.0 + sin(uInterludeExitProgress * 3.14159265) * uTransitionSpread;
      narrativeTarget = mix(
        targetInterlude,
        scatterTarget * interludeBurst,
        smoothstep(0.0, 1.0, uInterludeExitProgress)
      );
      narrativeVisibility = mix(
        1.0,
        dispersedParticle,
        smoothstep(0.0, 1.0, uInterludeExitProgress)
      );
    }

    if (uTimelineIntakeProgress > 0.0) {
      float intakeRelease = smoothstep(
        ${glslFloat(processTransition.dispersedFieldStart)},
        ${glslFloat(processTransition.dispersedFieldComplete)},
        uTimelineIntakeProgress
      );
      intakeRelease = max(
        intakeRelease,
        smoothstep(
          ${glslFloat(processTransition.interludeReleaseAssistStart)},
          ${glslFloat(processTransition.interludeReleaseAssistComplete)},
          uInterludeExitProgress
        )
      );
      vec3 intakeField = mix(targetInterlude, scatterTarget, intakeRelease);
      float contactThreshold =
        ${glslFloat(processTransition.contactStart)} +
        particleRandom * ${glslFloat(processTransition.contactRange)};
      float gatherProgress = smoothstep(
        contactThreshold - ${glslFloat(processTransition.gatherLead)},
        contactThreshold,
        uTimelineIntakeProgress
      );
      gatherProgress = max(
        gatherProgress,
        smoothstep(
          ${glslFloat(processTransition.gatherFloorStart)},
          ${glslFloat(processTransition.gatherFloorComplete)},
          uTimelineIntakeProgress
        )
      );
      float contactProgress = smoothstep(
        contactThreshold - ${glslFloat(processTransition.contactFadeFeather)},
        contactThreshold + ${glslFloat(processTransition.contactFadeFeather)},
        uTimelineIntakeProgress
      );
      narrativeTarget = mix(intakeField, vec3(0.0), gatherProgress);
      narrativeVisibility = dispersedParticle * (1.0 - contactProgress);
    }

    if (uTimelineReleaseProgress > 0.0) {
      float releaseRadius = mix(
        0.035,
        2.35,
        smoothstep(0.0, 0.4, uTimelineReleaseProgress)
      );
      vec3 releaseCloud = targetRelease * releaseRadius;
      narrativeTarget = mix(
        releaseCloud,
        scatterTarget,
        smoothstep(0.18, 0.72, uTimelineReleaseProgress)
      );
      float emissionThreshold = particleRandom * 0.22;
      narrativeVisibility = smoothstep(
        emissionThreshold,
        emissionThreshold + 0.11,
        uTimelineReleaseProgress
      ) * dispersedParticle;
    }

    if (uClosingFormationProgress > 0.0) {
      narrativeTarget = mix(
        scatterTarget,
        targetClosing,
        smoothstep(0.0, 1.0, uClosingFormationProgress)
      );
      narrativeVisibility = mix(
        dispersedParticle,
        1.0,
        smoothstep(0.0, 1.0, uClosingFormationProgress)
      );
    }

    if (uClosingExitProgress > 0.0) {
      float closingBurst = 1.0 + sin(uClosingExitProgress * 3.14159265) * uTransitionSpread;
      narrativeTarget = mix(
        targetClosing,
        scatterTarget * closingBurst,
        smoothstep(0.0, 1.0, uClosingExitProgress)
      );
      narrativeVisibility = mix(
        1.0,
        dispersedParticle,
        smoothstep(0.0, 1.0, uClosingExitProgress)
      );
    }

    vec3 formedPosition = mix(position, narrativeTarget, easedProgress);
    vec3 objectSpreadDirection = normalize(vec3(
      sin(particleRandom * 91.73 + 0.17),
      cos(particleRandom * 67.19 + 1.31),
      sin(particleRandom * 113.41 + 2.07)
    ));
    formedPosition += objectSpreadDirection * uObjectLooseness *
      (0.42 + particleRandom * 0.94) * easedProgress;
    vec3 scatterDirection = normalize(position + vec3(0.001));
    formedPosition += scatterDirection * transitionWave *
      (0.18 + particleRandom * 0.32);

    float ambientSpeed = 0.18 + particleRandom * 0.12;
    vec3 ambientPosition = position;
    ambientPosition.x += sin(
      uTime * ambientSpeed + particleRandom * 18.0
    ) * uAmbientDrift;
    ambientPosition.y += cos(
      uTime * ambientSpeed * 0.82 + particleRandom * 13.0
    ) * uAmbientDrift * 0.72;
    ambientPosition.z += sin(
      uTime * ambientSpeed * 0.64 + particleRandom * 9.0
    ) * uAmbientDrift * 0.9;

    vec3 particlePosition = mix(
      formedPosition,
      ambientPosition,
      particleAmbient * uAmbientStrength
    );

    float settledMovement = smoothstep(0.72, 1.0, easedProgress);
    float electronRate = uElectronSpeed * (0.48 + particleRandom * 1.42);
    float electronAmplitude = uElectronDrift * (0.38 + particleRandom * 1.12);
    float electronPhase = particleRandom * 31.4159265;
    vec3 electronMotion = vec3(
      sin(uTime * electronRate + electronPhase) +
        sin(uTime * electronRate * 0.31 + electronPhase * 1.73) * 0.34,
      cos(uTime * electronRate * 0.73 + electronPhase * 1.37) +
        sin(uTime * electronRate * 0.27 + electronPhase * 0.61) * 0.3,
      sin(uTime * electronRate * 0.57 + electronPhase * 0.71) +
        cos(uTime * electronRate * 0.23 + electronPhase * 1.19) * 0.38
    ) * electronAmplitude;
    particlePosition += electronMotion * settledMovement *
      mix(1.0, 0.38, particleAmbient);

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    float pointerInfluence = applyParticlePointer(viewPosition);
    gl_Position = projectionMatrix * viewPosition;

    float releasePointScale = mix(
      0.42,
      1.0,
      smoothstep(0.0, 0.34, uTimelineReleaseProgress)
    );
    gl_PointSize = applyParticlePointerPointScale(
      uPointSize * ${particleGlow.shaderSpriteScale},
      pointerInfluence
    ) *
      mix(1.0, 0.72, particleAmbient) *
      mix(
        1.0,
        releasePointScale,
        step(0.0001, uTimelineReleaseProgress)
      ) *
      (10.0 / max(1.0, -viewPosition.z));

    vRandom = particleRandom;
    vPointerInfluence = pointerInfluence;
    vAmbient = particleAmbient;
    vNarrativeVisibility = narrativeVisibility * uStoryVisibility;
    vec3 surfacePosition = mix(
      particlePosition,
      narrativeTarget,
      uSurfacePositionLock
    );
    float surfacePrimary = sin(
      dot(surfacePosition, vec3(1.13, 0.71, 0.89)) * uSurfacePrimaryScale
        + uTime * uColourCycleSpeed * uSurfaceFlowScale
    );
    float surfaceSecondary = sin(
      dot(surfacePosition, vec3(-0.62, 1.37, -0.48)) * uSurfaceSecondaryScale
        - uTime * uColourCycleSpeed * uSurfaceFlowScale * 0.68 + 1.7
    );
    float residualIsland = sin(
      particleRandom * 43.7
        + uTime * uColourCycleSpeed * uSurfaceFlowScale * 0.17
    ) * uSurfaceResidualMix;
    vSurfaceColour = clamp(
      0.5 + surfacePrimary * 0.27 + surfaceSecondary * 0.18 + residualIsland,
      0.0,
      1.0
    );
    float densityPrimary = sin(
      dot(surfacePosition, vec3(0.74, -1.08, 0.63)) * uDensityScale
        + uTime * uDensityCycleSpeed * uSurfaceFlowScale
    );
    float densitySecondary = sin(
      dot(surfacePosition, vec3(-0.39, 0.58, 1.17)) * uDensityScale * 1.7
        - uTime * uDensityCycleSpeed * uSurfaceFlowScale * 0.61 + 2.1
    );
    vSurfaceDensity = 0.5 + densityPrimary * 0.31 + densitySecondary * 0.19;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform vec3 uDeepBlueColour;
  uniform vec3 uLightBlueColour;
  uniform float uTime;
  uniform float uDensityContrast;
  uniform float uLightThemeStrength;

  varying float vRandom;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;
  varying float vSurfaceColour;
  varying float vSurfaceDensity;

  void main() {
    float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
    float core = 1.0 - smoothstep(
      ${particleGlow.shaderCoreStart},
      ${particleGlow.shaderCoreEnd},
      distanceToCentre
    );
    float haloStart = mix(
      ${particleGlow.shaderHaloStart},
      ${particleGlow.shaderHaloStart * particleGlow.lightHaloScale},
      uLightThemeStrength
    );
    float haloEnd = mix(
      0.5,
      ${0.5 * particleGlow.lightHaloScale},
      uLightThemeStrength
    );
    float haloOpacity = mix(
      ${particleGlow.haloAlpha},
      ${particleGlow.lightHaloAlpha},
      uLightThemeStrength
    );
    float haloDisc = (
      1.0 - smoothstep(haloStart, haloEnd, distanceToCentre)
    );
    float halo = haloDisc * haloOpacity;
    float alpha = core + halo * (1.0 - core);

    if (alpha < 0.02) {
      discard;
    }

    float blueToCyan = smoothstep(0.18, 0.68, vSurfaceColour);
    float cyanToLight = smoothstep(0.7, 0.96, vSurfaceColour);
    vec3 colour = mix(uDeepBlueColour, uCyanColour, blueToCyan);
    colour = mix(colour, uLightBlueColour, cyanToLight * 0.78);
    colour = mix(colour, uBlueColour, (vRandom - 0.5) * 0.14 + 0.07);
    colour = mix(colour, uCyanColour, vPointerInfluence * 0.24);
    float particleVariation = 0.9 + vRandom * 0.1;
    float densityPocket = 1.0 - uDensityContrast * (
      1.0 - smoothstep(0.24, 0.68, vSurfaceDensity)
    );
    float ambientPulse = mix(
      1.0,
      0.68 + 0.22 * sin(uTime * 0.38 + vRandom * 16.0),
      vAmbient
    );

    gl_FragColor = vec4(
      mix(uDeepBlueColour, colour, core) *
        particleVariation *
        (0.78 + core * 0.22),
      alpha * densityPocket * ambientPulse * vNarrativeVisibility
    );
  }
`;
