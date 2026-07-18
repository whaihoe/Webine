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
import {
  createParticleTargetBuffers,
  createProceduralParticleTargets,
} from "./particle-targets";
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

function dampUniform(material: ShaderMaterial, uniformName: string, target: number, delta: number) {
  if (target === 0) {
    material.uniforms[uniformName].value = 0;
    return;
  }
  const nextValue = MathUtils.damp(material.uniforms[uniformName].value, target, 3, delta);
  material.uniforms[uniformName].value = Math.abs(nextValue - target) < 0.01 ? target : nextValue;
}

type ParticlePointsProps = {
  profile: ParticleRenderProfile;
  progressStore: StoryProgressStore;
  layout: "tablet" | "desktop";
  heroTarget: Float32Array;
  closingTarget: Float32Array;
  onReady: () => void;
};

export function ParticlePoints({
  profile,
  progressStore,
  layout,
  heroTarget,
  closingTarget,
  onReady,
}: ParticlePointsProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const pointerUniformRef = useRef(new Vector2(20, 20));
  const rotationPhaseRef = useRef(0);
  const scrollRotationRef = useRef(0);
  const lastScrollYRef = useRef<number | null>(null);
  const positionInitialisedRef = useRef(false);
  const proceduralTargets = useMemo(
    () => createProceduralParticleTargets(profile.count, profile.ambientRatio),
    [profile.ambientRatio, profile.count],
  );
  const targets = useMemo(
    () =>
      createParticleTargetBuffers(
        proceduralTargets,
        heroTarget,
        closingTarget,
      ),
    [closingTarget, heroTarget, proceduralTargets],
  );
  const ambientMotion = experienceConfig.particles.ambientMotion;
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uHeroExitProgress: { value: 0 },
      uReachFormationProgress: { value: 0 },
      uReachExitProgress: { value: 0 },
      uWorkFormationProgress: { value: 0 },
      uWorkProjectProgress: { value: 0 },
      uInterludeFormationProgress: { value: 0 },
      uInterludeExitProgress: { value: 0 },
      uTimelineIntakeProgress: { value: 0 },
      uTimelineReleaseProgress: { value: 0 },
      uClosingFormationProgress: { value: 0 },
      uClosingExitProgress: { value: 0 },
      uStoryVisibility: { value: 1 },
      uPointSize: { value: profile.pointSize },
      uTime: { value: 0 },
      uAmbientDrift: { value: ambientMotion.drift },
      uObjectLooseness: { value: ambientMotion.objectLooseness },
      uElectronDrift: { value: ambientMotion.electronDrift },
      uElectronSpeed: { value: ambientMotion.electronSpeed },
      uTransitionSpread: { value: ambientMotion.transitionSpread },
      uAmbientStrength: { value: 1 },
      uColourCycleSpeed: {
        value: (Math.PI * 2) / ambientMotion.colourCycleSeconds,
      },
      uColourCycleRange: { value: ambientMotion.colourCycleRange },
      uDensityContrast: { value: ambientMotion.densityContrast },
      uPointer: { value: pointerUniformRef.current },
      uPointerStrength: { value: 0 },
      uCyanColour: { value: getTokenColour("--primitive-cyan-400") },
      uBlueColour: { value: getTokenColour("--primitive-blue-500") },
    }),
    [
      ambientMotion.colourCycleSeconds,
      ambientMotion.colourCycleRange,
      ambientMotion.densityContrast,
      ambientMotion.drift,
      ambientMotion.electronDrift,
      ambientMotion.electronSpeed,
      ambientMotion.objectLooseness,
      ambientMotion.transitionSpread,
      profile.pointSize,
    ],
  );
  const heroScene = particleSceneConfig.hero[layout];
  const reachScene = particleSceneConfig.reach[layout];
  const interludeScene = particleSceneConfig.interlude[layout];
  const processPosition = particleSceneConfig.process[layout];
  const closingPosition = particleSceneConfig.closing[layout];

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");

    if (!finePointer.matches) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
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
    const heroMotion = snapshot.sceneMotionProgress.hero;
    const reachMotion = snapshot.sceneMotionProgress.reach;
    const interludeMotion = snapshot.sceneMotionProgress.interlude;
    const closingMotion = snapshot.sceneMotionProgress.closing;
    const intakeProgress = snapshot.timelineIntakeProgress;
    const releaseProgress = snapshot.timelineReleaseProgress;
    const storyVisibility = snapshot.workParticleVisibility;
    const workFormation = snapshot.workFormationProgress;
    const workProjectProgress = snapshot.workProjectProgress;
    const chapterFormation = snapshot.workChapterFormationProgress;
    const interludeFormation = Math.max(
      interludeMotion.formation,
      chapterFormation,
    );
    const reachExitVisibility =
      chapterFormation > 0 || interludeMotion.formation > 0
        ? 1
        : 1 - MathUtils.smoothstep(reachMotion.dispersion, 0.18, 0.78);
    const effectiveStoryVisibility = Math.min(
      storyVisibility,
      reachExitVisibility,
    );
    const toWorldX = (normalisedX: number) =>
      (normalisedX - 0.5) * viewport.width;
    const toWorldY = (normalisedY: number) =>
      (0.5 - normalisedY) * viewport.height;
    const heroAnchor = snapshot.sceneAnchorPositions.hero;
    const reachAnchor = snapshot.sceneAnchorPositions.reach;
    const interludeAnchor = snapshot.sceneAnchorPositions.interlude;
    let sceneX = toWorldX(heroAnchor.x);
    let sceneY = toWorldY(heroAnchor.y);
    let sceneScale: number = heroScene.scale;

    const heroIsDispersed =
      heroMotion.dispersion > 0 && reachMotion.formation <= 0;
    const reachIsDispersed =
      reachMotion.dispersion > 0 && interludeMotion.formation <= 0;
    const interludeIsDispersed =
      interludeMotion.dispersion > 0 && intakeProgress <= 0;
    const closingIsDispersed = closingMotion.dispersion > 0;

    if (heroIsDispersed) {
      sceneX = 0;
      sceneY = 0;
      sceneScale = processPosition.scale;
    }

    if (reachMotion.formation > 0) {
      sceneX = toWorldX(reachAnchor.x);
      sceneY = toWorldY(reachAnchor.y);
      sceneScale = reachScene.scale;
    }

    if (reachIsDispersed) {
      sceneX = 0;
      sceneY = 0;
      sceneScale = processPosition.scale;
    }

    if (interludeFormation > 0) {
      sceneX = toWorldX(interludeAnchor.x);
      sceneY = toWorldY(interludeAnchor.y);
      sceneScale = interludeScene.scale;
    }

    if (interludeIsDispersed) {
      sceneX = 0;
      sceneY = 0;
      sceneScale = processPosition.scale;
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
      sceneX = outletX;
      sceneY = outletY;
      sceneScale = processPosition.scale;
    }

    if (closingMotion.formation > 0) {
      const closingAnchor = snapshot.sceneAnchorPositions.closing;
      sceneX = toWorldX(closingAnchor.x);
      sceneY = toWorldY(closingAnchor.y);
      sceneScale = closingPosition.scale;
    }

    if (closingIsDispersed) {
      sceneX = 0;
      sceneY = 0;
      sceneScale = processPosition.scale;
    }

    const targetScale = profile.objectScale * sceneScale;
    const transitionStrength = Math.max(
      Math.abs(Math.sin(heroMotion.dispersion * Math.PI)),
      Math.abs(Math.sin(reachMotion.formation * Math.PI)),
      Math.abs(Math.sin(reachMotion.dispersion * Math.PI)),
      Math.abs(Math.sin(workProjectProgress * Math.PI * 2)),
      Math.abs(Math.sin(interludeFormation * Math.PI)),
      Math.abs(Math.sin(interludeMotion.dispersion * Math.PI)),
      Math.abs(Math.sin(intakeProgress * Math.PI)),
      Math.abs(Math.sin(releaseProgress * Math.PI)),
      Math.abs(Math.sin(closingMotion.formation * Math.PI)),
      Math.abs(Math.sin(closingMotion.dispersion * Math.PI)),
    );
    const pointer = pointerRef.current;
    const currentScrollY = window.scrollY;
    if (lastScrollYRef.current !== null) {
      const scrollDelta = Math.max(-120, Math.min(120, currentScrollY - lastScrollYRef.current));
      scrollRotationRef.current = MathUtils.clamp(
        scrollRotationRef.current + scrollDelta * 0.00062,
        -ambientMotion.scrollRotationLimit,
        ambientMotion.scrollRotationLimit,
      );
    }
    lastScrollYRef.current = currentScrollY;
    scrollRotationRef.current = MathUtils.damp(
      scrollRotationRef.current,
      0,
      ambientMotion.scrollRotationReturn,
      delta,
    );
    const introSettledProgress = MathUtils.smoothstep(
      material.uniforms.uProgress.value,
      0.72,
      1,
    );
    const formedStrength = Math.max(
      introSettledProgress * (1 - heroMotion.dispersion),
      reachMotion.formation * (1 - reachMotion.dispersion),
      workFormation,
      interludeFormation * (1 - interludeMotion.dispersion),
      closingMotion.formation * (1 - closingMotion.dispersion),
    );
    const idleStrength = formedStrength * (1 - transitionStrength);
    const closingSettledStrength =
      closingMotion.formation * (1 - closingMotion.dispersion);
    const ambientRotationScale = MathUtils.lerp(
      1,
      experienceConfig.particles.closingModel.ambientRotationScale,
      closingSettledStrength,
    );
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
    dampUniform(material, "uHeroExitProgress", heroMotion.dispersion, delta);
    dampUniform(material, "uReachFormationProgress", reachMotion.formation, delta);
    dampUniform(material, "uReachExitProgress", reachMotion.dispersion, delta);
    dampUniform(material, "uWorkFormationProgress", workFormation, delta);
    dampUniform(material, "uWorkProjectProgress", workProjectProgress, delta);
    dampUniform(material, "uInterludeFormationProgress", interludeFormation, delta);
    dampUniform(material, "uInterludeExitProgress", interludeMotion.dispersion, delta);
    dampUniform(material, "uTimelineIntakeProgress", intakeProgress, delta);
    dampUniform(material, "uTimelineReleaseProgress", releaseProgress, delta);
    dampUniform(material, "uClosingFormationProgress", closingMotion.formation, delta);
    dampUniform(material, "uClosingExitProgress", closingMotion.dispersion, delta);
    dampUniform(material, "uStoryVisibility", effectiveStoryVisibility, delta);
    const ambientStrength =
      intakeProgress > 0
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
      group.position.set(sceneX, sceneY, 0);
      group.scale.setScalar(targetScale);
      positionInitialisedRef.current = true;
    }
    group.position.x = MathUtils.damp(
      group.position.x,
      sceneX + pointerOffsetX,
      releaseProgress > 0.92 ? 14 : 5,
      delta,
    );
    group.position.y = MathUtils.damp(
      group.position.y,
      sceneY +
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
      Math.sin(elapsed * 0.2) *
        ambientMotion.rotationX *
        idleStrength *
        ambientRotationScale +
        pointerTiltX + scrollRotationRef.current * 0.08,
      3,
      delta,
    );
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      Math.sin(rotationPhaseRef.current) *
        ambientMotion.rotationY *
        ambientRotationScale +
        pointerTiltY + scrollRotationRef.current,
      3,
      delta,
    );
    group.rotation.z = MathUtils.damp(
      group.rotation.z,
      Math.cos(elapsed * 0.13) *
        ambientMotion.rotationZ *
        idleStrength *
        ambientRotationScale +
        (pointer.active ? pointer.x * ambientMotion.pointerTilt * 0.34 : 0) +
        scrollRotationRef.current * 0.14,
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
            args={[targets.source, 3]}
          />
          <bufferAttribute
            attach="attributes-targetScatter"
            args={[targets.scatter, 3]}
          />
          <bufferAttribute
            attach="attributes-targetRelease"
            args={[targets.release, 3]}
          />
          <bufferAttribute
            attach="attributes-targetHero"
            args={[targets.hero, 3]}
          />
          <bufferAttribute
            attach="attributes-targetReach"
            args={[targets.reach, 3]}
          />
          <bufferAttribute attach="attributes-targetWorkA" args={[targets.workA, 3]} />
          <bufferAttribute attach="attributes-targetWorkB" args={[targets.workB, 3]} />
          <bufferAttribute attach="attributes-targetWorkC" args={[targets.workC, 3]} />
          <bufferAttribute
            attach="attributes-targetInterlude"
            args={[targets.interlude, 3]}
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
            attach="attributes-particleAmbient"
            args={[targets.ambientMask, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          precision="highp"
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </points>
    </group>
  );
}
