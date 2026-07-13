import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  MathUtils,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  type Group,
} from "three";
import {
  experienceConfig,
  particleSceneConfig,
} from "../config/experience";
import { createParticleTargets } from "./particle-targets";
import { particleFragmentShader, particleVertexShader } from "./shaders";
import type { StoryProgressStore } from "./story-progress";
import type { ParticleRenderProfile } from "./types";

function getTokenColour(token: string) {
  const channels = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const [hue, saturation, lightness] = channels.split(/\s+/);
  return new Color().setStyle(`hsl(${hue}, ${saturation}, ${lightness})`);
}

type ParticlePointsProps = {
  profile: ParticleRenderProfile;
  progressStore: StoryProgressStore;
  layout: "mobile" | "tablet" | "desktop";
};

export function ParticlePoints({
  profile,
  progressStore,
  layout,
}: ParticlePointsProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const pointerUniformRef = useRef(new Vector2(20, 20));
  const rotationPhaseRef = useRef(0);
  const positionInitialisedRef = useRef(false);
  const targets = useMemo(
    () => createParticleTargets(profile.count, profile.ambientRatio),
    [profile.ambientRatio, profile.count],
  );
  const ambientMotion = experienceConfig.particles.ambientMotion;
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uReachTransition: { value: 0 },
      uWorkExitProgress: { value: 0 },
      uInterludeTransition: { value: 0 },
      uInterludeExitProgress: { value: 0 },
      uTimelineIntakeProgress: { value: 0 },
      uTimelineReleaseProgress: { value: 0 },
      uPointSize: { value: profile.pointSize },
      uTime: { value: 0 },
      uAmbientDrift: { value: ambientMotion.drift },
      uAmbientStrength: { value: 1 },
      uColourCycleSpeed: {
        value: (Math.PI * 2) / ambientMotion.colourCycleSeconds,
      },
      uLightThemeProgress: { value: 0 },
      uPointer: { value: pointerUniformRef.current },
      uPointerStrength: { value: 0 },
      uCyanColour: { value: getTokenColour("--primitive-cyan-400") },
      uBlueColour: { value: getTokenColour("--primitive-blue-500") },
      uDeepColour: { value: getTokenColour("--primitive-blue-700") },
      uSlateColour: { value: getTokenColour("--primitive-slate-800") },
    }),
    [
      ambientMotion.colourCycleSeconds,
      ambientMotion.drift,
      profile.pointSize,
    ],
  );
  const heroScene = particleSceneConfig.hero[layout];
  const reachScene = particleSceneConfig.reach[layout];
  const interludeScene = particleSceneConfig.interlude[layout];
  const processPosition = particleSceneConfig.process[layout];
  const closingPosition = particleSceneConfig.closing[layout];

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) {
        return;
      }

      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
        active: true,
      };
    };
    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, []);

  useFrame(({ clock, viewport }, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;

    if (!material || !group) {
      return;
    }

    const snapshot = progressStore.getSnapshot();
    const introProgress = snapshot.introProgress;
    const interludePresence = snapshot.scenePresence.interlude ?? 0;
    const reachTransition = snapshot.sceneExitProgress.hero ?? 0;
    const workExitProgress = snapshot.sceneExitProgress.reach ?? 0;
    const interludeExitProgress =
      snapshot.sceneExitProgress.interlude ?? 0;
    const interludeTransition = MathUtils.smoothstep(
      interludePresence,
      0.46,
      0.62,
    );
    const intakeProgress = snapshot.timelineIntakeProgress;
    const releaseProgress = snapshot.timelineReleaseProgress;
    const toWorldX = (normalisedX: number) =>
      (normalisedX - 0.5) * viewport.width;
    const toWorldY = (normalisedY: number) =>
      (0.5 - normalisedY) * viewport.height;
    const heroAnchor = snapshot.sceneAnchorPositions.hero;
    const reachAnchor = snapshot.sceneAnchorPositions.reach;
    const interludeAnchor = snapshot.sceneAnchorPositions.interlude;
    let sceneX = MathUtils.lerp(
      toWorldX(heroAnchor.x),
      toWorldX(reachAnchor.x),
      reachTransition,
    );
    let sceneY = MathUtils.lerp(
      toWorldY(heroAnchor.y),
      toWorldY(reachAnchor.y),
      reachTransition,
    );
    let sceneScale = MathUtils.lerp(
      heroScene.scale,
      reachScene.scale,
      reachTransition,
    );

    if (interludeTransition > 0) {
      sceneX = toWorldX(interludeAnchor.x);
      sceneY = toWorldY(interludeAnchor.y);
      sceneScale = interludeScene.scale;
    }

    const inletX =
      (snapshot.timelineInletPosition.x - 0.5) * viewport.width;
    const inletY =
      (0.5 - snapshot.timelineInletPosition.y) * viewport.height;
    if (intakeProgress > 0) {
      const inletTravel = MathUtils.smoothstep(intakeProgress, 0, 0.56);
      sceneX = MathUtils.lerp(
        toWorldX(interludeAnchor.x),
        inletX,
        inletTravel,
      );
      sceneY = MathUtils.lerp(
        toWorldY(interludeAnchor.y),
        inletY,
        inletTravel,
      );
      sceneScale = MathUtils.lerp(
        interludeScene.scale,
        processPosition.scale,
        inletTravel,
      );
    }

    if (intakeProgress >= 0.999 && releaseProgress <= 0) {
      sceneX =
        (snapshot.timelineOutletPosition.x - 0.5) * viewport.width;
      sceneY =
        (0.5 - snapshot.timelineOutletPosition.y) * viewport.height;
      sceneScale = processPosition.scale;
    }

    if (releaseProgress > 0) {
      const outletX =
        (snapshot.timelineOutletPosition.x - 0.5) * viewport.width;
      const outletY =
        (0.5 - snapshot.timelineOutletPosition.y) * viewport.height;
      const closingAnchor = snapshot.sceneAnchorPositions.closing;
      const closingX = toWorldX(closingAnchor.x);
      const closingY = toWorldY(closingAnchor.y);
      const closingTravel = MathUtils.smoothstep(
        releaseProgress,
        0.16,
        0.64,
      );
      sceneX = MathUtils.lerp(outletX, closingX, closingTravel);
      sceneY = MathUtils.lerp(outletY, closingY, closingTravel);
      sceneScale = MathUtils.lerp(
        processPosition.scale,
        closingPosition.scale,
        closingTravel,
      );
    }

    const scenePosition = { x: sceneX, y: sceneY, scale: sceneScale };
    const targetScale = profile.objectScale * scenePosition.scale;
    const transitionStrength = Math.max(
      Math.abs(Math.sin(reachTransition * Math.PI)),
      Math.abs(Math.sin(workExitProgress * Math.PI)),
      Math.abs(Math.sin(interludeTransition * Math.PI)),
      Math.abs(Math.sin(interludeExitProgress * Math.PI)),
      Math.abs(Math.sin(intakeProgress * Math.PI)),
      Math.abs(Math.sin(releaseProgress * Math.PI)),
    );
    const pointer = pointerRef.current;
    const settledProgress = MathUtils.smoothstep(
      material.uniforms.uProgress.value,
      0.72,
      1,
    );
    const idleStrength = settledProgress * (1 - transitionStrength);
    const elapsed = clock.elapsedTime;
    const localPointerX =
      (pointer.x * viewport.width * 0.5 - group.position.x) /
      Math.max(group.scale.x, 0.001);
    const localPointerY =
      (pointer.y * viewport.height * 0.5 - group.position.y) /
      Math.max(group.scale.y, 0.001);

    material.uniforms.uProgress.value = MathUtils.damp(
      material.uniforms.uProgress.value,
      introProgress,
      7,
      delta,
    );
    material.uniforms.uReachTransition.value = reachTransition;
    material.uniforms.uWorkExitProgress.value = workExitProgress;
    material.uniforms.uInterludeTransition.value = interludeTransition;
    material.uniforms.uInterludeExitProgress.value = interludeExitProgress;
    material.uniforms.uTimelineIntakeProgress.value = intakeProgress;
    material.uniforms.uTimelineReleaseProgress.value = releaseProgress;
    const workIsHidden = workExitProgress > 0.02 && interludeTransition <= 0;
    const ambientStrength =
      workIsHidden || interludeExitProgress > 0 || intakeProgress > 0
      ? 0
      : releaseProgress > 0 && releaseProgress < 0.92
        ? 0
        : releaseProgress > 0
        ? 0.15
        : 1;
    material.uniforms.uAmbientStrength.value = MathUtils.damp(
      material.uniforms.uAmbientStrength.value,
      ambientStrength,
      7,
      delta,
    );
    material.uniforms.uLightThemeProgress.value = MathUtils.damp(
      material.uniforms.uLightThemeProgress.value,
      snapshot.activeSceneId === "reach" ||
        snapshot.activeSceneId === "interlude"
        ? 1
        : 0,
      6,
      delta,
    );
    material.uniforms.uPointer.value.x = MathUtils.damp(
      material.uniforms.uPointer.value.x,
      pointer.active ? localPointerX : 20,
      8,
      delta,
    );
    material.uniforms.uPointer.value.y = MathUtils.damp(
      material.uniforms.uPointer.value.y,
      pointer.active ? localPointerY : 20,
      8,
      delta,
    );
    material.uniforms.uPointerStrength.value = MathUtils.damp(
      material.uniforms.uPointerStrength.value,
      pointer.active ? idleStrength : 0,
      9,
      delta,
    );
    material.uniforms.uTime.value = elapsed;
    const pointerTravel = pointer.active
      ? ambientMotion.pointerTravel * idleStrength
      : 0;
    const pointerOffsetX = pointer.x * pointerTravel;
    const pointerOffsetY = pointer.y * pointerTravel * 0.72;
    if (!positionInitialisedRef.current) {
      group.position.set(scenePosition.x, scenePosition.y, 0);
      group.scale.setScalar(targetScale);
      positionInitialisedRef.current = true;
    }
    group.position.x = MathUtils.damp(
      group.position.x,
      scenePosition.x + pointerOffsetX,
      releaseProgress > 0.92 ? 14 : 5,
      delta,
    );
    group.position.y = MathUtils.damp(
      group.position.y,
      scenePosition.y +
        pointerOffsetY +
        Math.sin(elapsed * 0.34) * ambientMotion.floatY * idleStrength,
      releaseProgress > 0.92 ? 14 : 4,
      delta,
    );
    group.position.z = MathUtils.damp(
      group.position.z,
      Math.cos(elapsed * 0.27) * ambientMotion.floatZ * idleStrength,
      4,
      delta,
    );
    rotationPhaseRef.current +=
      delta * ((Math.PI * 2) / ambientMotion.fullRotationSeconds) * idleStrength;
    const pointerTiltX = pointer.active
      ? -pointer.y * ambientMotion.pointerTilt
      : 0;
    const pointerTiltY = pointer.active
      ? pointer.x * ambientMotion.pointerTilt
      : 0;
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      Math.sin(elapsed * 0.2) * ambientMotion.rotationX * idleStrength +
        pointerTiltX,
      3,
      delta,
    );
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      Math.sin(rotationPhaseRef.current) * ambientMotion.rotationY +
        pointerTiltY,
      3,
      delta,
    );
    group.rotation.z = MathUtils.damp(
      group.rotation.z,
      Math.cos(elapsed * 0.13) * ambientMotion.rotationZ * idleStrength +
        (pointer.active ? pointer.x * ambientMotion.pointerTilt * 0.34 : 0),
      3,
      delta,
    );
    group.scale.setScalar(
      MathUtils.damp(group.scale.x, targetScale, 5, delta),
    );
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      scale={profile.objectScale * heroScene.scale}
    >
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[targets.scattered, 3]}
          />
          <bufferAttribute
            attach="attributes-targetPosition"
            args={[targets.folded, 3]}
          />
          <bufferAttribute
            attach="attributes-targetReach"
            args={[targets.reach, 3]}
          />
          <bufferAttribute
            attach="attributes-targetOrbit"
            args={[targets.orbit, 3]}
          />
          <bufferAttribute
            attach="attributes-targetClosing"
            args={[targets.closing, 3]}
          />
          <bufferAttribute
            attach="attributes-particleRandom"
            args={[targets.randomness, 1]}
          />
          <bufferAttribute
            attach="attributes-particleShade"
            args={[targets.facetShade, 1]}
          />
          <bufferAttribute
            attach="attributes-particleAmbient"
            args={[targets.ambientMask, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </points>
    </group>
  );
}
