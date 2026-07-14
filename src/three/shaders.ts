export const particleVertexShader = `
  attribute vec3 targetHero;
  attribute vec3 targetScatter;
  attribute vec3 targetRelease;
  attribute vec3 targetReach;
  attribute vec3 targetInterlude;
  attribute vec3 targetClosing;
  attribute float particleRandom;
  attribute float particleShade;
  attribute float particleAmbient;

  uniform float uProgress;
  uniform float uHeroExitProgress;
  uniform float uReachFormationProgress;
  uniform float uReachExitProgress;
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
  uniform vec2 uPointer;
  uniform float uPointerStrength;

  varying float vRandom;
  varying float vShade;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;

  void main() {
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float transitionWave = sin(easedProgress * 3.14159265);
    vec3 scatterTarget = targetScatter;

    vec3 narrativeTarget = targetHero;
    float narrativeVisibility = 1.0;
    float dispersedParticle = step(0.42, particleRandom);

    if (uHeroExitProgress > 0.0) {
      float heroBurst = 1.0 + sin(uHeroExitProgress * 3.14159265) * 0.55;
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
      float reachBurst = 1.0 + sin(uReachExitProgress * 3.14159265) * 0.55;
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
      float interludeBurst = 1.0 + sin(uInterludeExitProgress * 3.14159265) * 0.55;
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
        0.0,
        0.27,
        uTimelineIntakeProgress
      );
      intakeRelease = max(
        intakeRelease,
        smoothstep(0.0, 0.72, uInterludeExitProgress)
      );
      vec3 intakeField = mix(targetInterlude, scatterTarget, intakeRelease);
      float contactThreshold = 0.29 + particleRandom * 0.54;
      float gatherProgress = smoothstep(
        contactThreshold - 0.24,
        contactThreshold,
        uTimelineIntakeProgress
      );
      gatherProgress = max(
        gatherProgress,
        smoothstep(0.24, 0.76, uTimelineIntakeProgress)
      );
      float contactProgress = smoothstep(
        contactThreshold - 0.018,
        contactThreshold + 0.018,
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
      float closingBurst = 1.0 + sin(uClosingExitProgress * 3.14159265) * 0.55;
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
    vec3 scatterDirection = normalize(position + vec3(0.001));
    formedPosition += scatterDirection * transitionWave *
      (0.1 + particleRandom * 0.16);

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
    particlePosition.x += sin(
      uTime * 0.22 + particleRandom * 12.0
    ) * 0.008 * settledMovement * (1.0 - particleAmbient);
    particlePosition.y += cos(
      uTime * 0.18 + particleRandom * 9.0
    ) * 0.008 * settledMovement * (1.0 - particleAmbient);

    vec2 pointerDelta = particlePosition.xy - uPointer;
    float pointerDistance = length(pointerDelta);
    float pointerInfluence = smoothstep(
      1.2,
      0.0,
      pointerDistance
    ) * uPointerStrength;
    particlePosition.z += pointerInfluence * 0.58;
    particlePosition.xy += pointerDelta * pointerInfluence * 0.035;

    vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    float releasePointScale = mix(
      0.42,
      1.0,
      smoothstep(0.0, 0.34, uTimelineReleaseProgress)
    );
    gl_PointSize = uPointSize *
      mix(1.0, 0.72, particleAmbient) *
      (1.0 + pointerInfluence * 0.72) *
      mix(
        1.0,
        releasePointScale,
        step(0.0001, uTimelineReleaseProgress)
      ) *
      (10.0 / max(1.0, -viewPosition.z));

    vRandom = particleRandom;
    vShade = particleShade;
    vPointerInfluence = pointerInfluence;
    vAmbient = particleAmbient;
    vNarrativeVisibility = narrativeVisibility * uStoryVisibility;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform vec3 uDeepColour;
  uniform float uTime;
  uniform float uColourCycleSpeed;

  varying float vRandom;
  varying float vShade;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;

  void main() {
    float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.24, 0.5, distanceToCentre);

    if (alpha < 0.02) {
      discard;
    }

    vec3 upperColour = mix(
      uCyanColour,
      uBlueColour,
      smoothstep(0.0, 0.62, vShade)
    );
    vec3 colour = mix(
      upperColour,
      uDeepColour,
      smoothstep(0.62, 1.0, vShade)
    );
    float colourPhase = 0.5 + 0.5 * sin(
      uTime * uColourCycleSpeed + vShade * 5.2 + vRandom * 1.4
    );
    vec3 cyclingColour = mix(
      uCyanColour,
      uBlueColour,
      smoothstep(0.0, 0.52, colourPhase)
    );
    cyclingColour = mix(
      cyclingColour,
      uDeepColour,
      smoothstep(0.5, 1.0, colourPhase)
    );
    colour = mix(
      colour,
      cyclingColour,
      mix(0.34, 0.68, vAmbient)
    );
    colour = mix(colour, uCyanColour, vPointerInfluence * 0.24);
    float particleVariation = 0.9 + vRandom * 0.1;
    float ambientPulse = mix(
      1.0,
      0.68 + 0.22 * sin(uTime * 0.38 + vRandom * 16.0),
      vAmbient
    );

    gl_FragColor = vec4(
      colour * particleVariation,
      alpha * ambientPulse * vNarrativeVisibility
    );
  }
`;

export const mobileParticleVertexShader = `
  attribute vec3 targetHero;
  attribute vec3 targetScatter;
  attribute vec3 targetRelease;
  attribute vec3 targetReach;
  attribute vec3 targetInterlude;
  attribute vec3 targetClosing;
  attribute float particleRandom;
  attribute float particleShade;
  attribute float particleAmbient;

  uniform float uProgress;
  uniform float uHeroExitProgress;
  uniform float uReachFormationProgress;
  uniform float uReachExitProgress;
  uniform float uInterludeFormationProgress;
  uniform float uInterludeExitProgress;
  uniform float uTimelineIntakeProgress;
  uniform float uTimelineReleaseProgress;
  uniform float uClosingFormationProgress;
  uniform float uClosingExitProgress;
  uniform float uStoryVisibility;
  uniform float uPointSize;

  varying float vRandom;
  varying float vShade;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;

  void main() {
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    vec3 narrativeTarget = targetHero;
    float narrativeVisibility = 1.0;
    float dispersedParticle = step(0.42, particleRandom);

    if (uHeroExitProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uHeroExitProgress);
      narrativeTarget = mix(targetHero, targetScatter, progress);
      narrativeVisibility = mix(1.0, dispersedParticle, progress);
    }
    if (uReachFormationProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uReachFormationProgress);
      narrativeTarget = mix(targetScatter, targetReach, progress);
      narrativeVisibility = mix(dispersedParticle, 1.0, progress);
    }
    if (uReachExitProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uReachExitProgress);
      narrativeTarget = mix(targetReach, targetScatter, progress);
      narrativeVisibility = mix(1.0, dispersedParticle, progress);
    }
    if (uInterludeFormationProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uInterludeFormationProgress);
      narrativeTarget = mix(targetScatter, targetInterlude, progress);
      narrativeVisibility = mix(dispersedParticle, 1.0, progress);
    }
    if (uInterludeExitProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uInterludeExitProgress);
      narrativeTarget = mix(targetInterlude, targetScatter, progress);
      narrativeVisibility = mix(1.0, dispersedParticle, progress);
    }
    if (uTimelineIntakeProgress > 0.0) {
      float gatherProgress = smoothstep(0.18, 0.72, uTimelineIntakeProgress);
      narrativeTarget = mix(targetScatter, vec3(0.0), gatherProgress);
      narrativeVisibility = dispersedParticle * (1.0 - smoothstep(0.58, 0.92, uTimelineIntakeProgress));
    }
    if (uTimelineReleaseProgress > 0.0) {
      float releaseRadius = mix(0.035, 2.35, smoothstep(0.0, 0.4, uTimelineReleaseProgress));
      vec3 releaseCloud = targetRelease * releaseRadius;
      narrativeTarget = mix(releaseCloud, targetScatter, smoothstep(0.18, 0.72, uTimelineReleaseProgress));
      narrativeVisibility = smoothstep(particleRandom * 0.22, particleRandom * 0.22 + 0.11, uTimelineReleaseProgress) * dispersedParticle;
    }
    if (uClosingFormationProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uClosingFormationProgress);
      narrativeTarget = mix(targetScatter, targetClosing, progress);
      narrativeVisibility = mix(dispersedParticle, 1.0, progress);
    }
    if (uClosingExitProgress > 0.0) {
      float progress = smoothstep(0.0, 1.0, uClosingExitProgress);
      narrativeTarget = mix(targetClosing, targetScatter, progress);
      narrativeVisibility = mix(1.0, dispersedParticle, progress);
    }

    vec3 particlePosition = mix(position, narrativeTarget, easedProgress);
    vec4 viewPosition = viewMatrix * modelMatrix * vec4(particlePosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * (10.0 / max(1.0, -viewPosition.z));

    vRandom = particleRandom;
    vShade = particleShade;
    vPointerInfluence = 0.0;
    vAmbient = particleAmbient;
    vNarrativeVisibility = narrativeVisibility * uStoryVisibility;
  }
`;

export const mobileParticleFragmentShader = `
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform vec3 uDeepColour;

  varying float vRandom;
  varying float vShade;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;

  void main() {
    float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.22, 0.5, distanceToCentre);
    if (alpha < 0.03 || vNarrativeVisibility < 0.01) discard;
    vec3 upperColour = mix(uCyanColour, uBlueColour, smoothstep(0.0, 0.62, vShade));
    vec3 colour = mix(upperColour, uDeepColour, smoothstep(0.62, 1.0, vShade));
    gl_FragColor = vec4(colour, alpha * vNarrativeVisibility);
  }
`;
