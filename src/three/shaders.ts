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
  uniform vec2 uPointer;
  uniform float uPointerStrength;

  varying float vRandom;
  varying float vGradient;
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
    vGradient = clamp(
      0.5 + particlePosition.x * 0.12 - particlePosition.y * 0.055,
      0.04,
      0.96
    );
    vPointerInfluence = pointerInfluence;
    vAmbient = particleAmbient;
    vNarrativeVisibility = narrativeVisibility * uStoryVisibility;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform float uTime;
  uniform float uColourCycleSpeed;
  uniform float uColourCycleRange;
  uniform float uDensityContrast;

  varying float vRandom;
  varying float vGradient;
  varying float vPointerInfluence;
  varying float vAmbient;
  varying float vNarrativeVisibility;

  void main() {
    float distanceToCentre = distance(gl_PointCoord, vec2(0.5));
    float alpha = 1.0 - smoothstep(0.24, 0.5, distanceToCentre);

    if (alpha < 0.02) {
      discard;
    }

    float breathingShift = sin(uTime * uColourCycleSpeed) * uColourCycleRange;
    float ditherEdge = clamp(vGradient + breathingShift, 0.04, 0.96);
    float blueDot = smoothstep(
      ditherEdge - 0.035,
      ditherEdge + 0.035,
      vRandom
    );
    vec3 colour = mix(uCyanColour, uBlueColour, blueDot);
    colour = mix(colour, uCyanColour, vPointerInfluence * 0.24);
    float particleVariation = 0.9 + vRandom * 0.1;
    float densityPocket = (1.0 - uDensityContrast) + uDensityContrast * smoothstep(
      -0.48,
      0.62,
      sin(vGradient * 8.5 + vRandom * 3.0)
    );
    float ambientPulse = mix(
      1.0,
      0.68 + 0.22 * sin(uTime * 0.38 + vRandom * 16.0),
      vAmbient
    );

    gl_FragColor = vec4(
      colour * particleVariation,
      alpha * densityPocket * ambientPulse * vNarrativeVisibility
    );
  }
`;
