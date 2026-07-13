export const particleVertexShader = `
  attribute vec3 targetPosition;
  attribute vec3 targetReach;
  attribute vec3 targetOrbit;
  attribute vec3 targetClosing;
  attribute float particleRandom;
  attribute float particleShade;
  attribute float particleAmbient;

  uniform float uProgress;
  uniform float uReachTransition;
  uniform float uWorkExitProgress;
  uniform float uInterludeTransition;
  uniform float uInterludeExitProgress;
  uniform float uTimelineIntakeProgress;
  uniform float uTimelineReleaseProgress;
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

  vec3 scatterMorph(
    vec3 fromTarget,
    vec3 toTarget,
    vec3 scatterTarget,
    float progress
  ) {
    float leaveProgress = smoothstep(0.0, 0.5, progress);
    float formProgress = smoothstep(0.5, 1.0, progress);
    vec3 dispersed = mix(fromTarget, scatterTarget, leaveProgress);
    return mix(dispersed, toTarget, formProgress);
  }

  float particleHash(float value) {
    return fract(sin(value) * 43758.5453123);
  }

  void main() {
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float transitionWave = sin(easedProgress * 3.14159265);
    vec3 scatterTarget = position * 1.2;
    scatterTarget.x += sin(particleRandom * 21.0) * 0.38;
    scatterTarget.y += cos(particleRandom * 17.0) * 0.28;
    scatterTarget.z *= 1.35;

    vec3 narrativeTarget = scatterMorph(
      targetPosition,
      targetReach,
      scatterTarget,
      uReachTransition
    );
    float narrativeVisibility = 1.0;

    if (uWorkExitProgress > 0.0) {
      narrativeTarget = mix(
        targetReach,
        scatterTarget,
        smoothstep(0.0, 0.62, uWorkExitProgress)
      );
      narrativeVisibility = 1.0 - smoothstep(
        0.18,
        0.72,
        uWorkExitProgress
      );
    }

    if (uInterludeTransition > 0.0) {
      narrativeTarget = mix(
        scatterTarget,
        targetOrbit,
        smoothstep(0.28, 1.0, uInterludeTransition)
      );
      narrativeVisibility = smoothstep(0.0, 0.24, uInterludeTransition);
    }

    if (uInterludeExitProgress > 0.0) {
      narrativeTarget = mix(
        targetOrbit,
        scatterTarget,
        smoothstep(0.0, 0.72, uInterludeExitProgress)
      );
      narrativeVisibility = 1.0;
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
      vec3 intakeField = mix(targetOrbit, scatterTarget, intakeRelease);
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
      narrativeVisibility = 1.0 - contactProgress;
    }

    vec3 releaseDirection = normalize(vec3(
      particleHash(particleRandom * 117.3 + 1.0) - 0.5,
      particleHash(particleRandom * 251.7 + 2.0) - 0.5,
      particleHash(particleRandom * 419.2 + 3.0) - 0.5
    ));
    float releaseDepth = mix(
      0.18,
      1.0,
      pow(particleHash(particleRandom * 631.9 + 4.0), 0.333333)
    );

    if (uTimelineReleaseProgress > 0.0) {
      float releaseRadius = mix(
        0.035,
        2.35,
        smoothstep(0.0, 0.4, uTimelineReleaseProgress)
      );
      vec3 releaseCloud = releaseDirection * releaseRadius * releaseDepth;
      narrativeTarget = mix(
        releaseCloud,
        targetClosing,
        smoothstep(0.52, 0.92, uTimelineReleaseProgress)
      );
      float emissionThreshold = particleRandom * 0.22;
      narrativeVisibility = smoothstep(
        emissionThreshold,
        emissionThreshold + 0.11,
        uTimelineReleaseProgress
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
    vNarrativeVisibility = narrativeVisibility;
  }
`;

export const particleFragmentShader = `
  uniform vec3 uCyanColour;
  uniform vec3 uBlueColour;
  uniform vec3 uDeepColour;
  uniform vec3 uSlateColour;
  uniform float uTime;
  uniform float uColourCycleSpeed;
  uniform float uLightThemeProgress;

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
    vec3 lightSectionColour = mix(
      uDeepColour,
      uSlateColour,
      0.52 + vShade * 0.26
    );
    colour = mix(
      colour,
      lightSectionColour,
      uLightThemeProgress * 0.72
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
