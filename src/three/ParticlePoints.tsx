import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  MathUtils,
  ShaderMaterial,
  type Group,
} from "three";
import { particleSceneConfig } from "../config/experience";
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
  mobile: boolean;
};

export function ParticlePoints({
  profile,
  progressStore,
  mobile,
}: ParticlePointsProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const targets = useMemo(
    () => createParticleTargets(profile.count),
    [profile.count],
  );
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uPointSize: { value: profile.pointSize },
      uTime: { value: 0 },
      uPrimaryColour: { value: getTokenColour("--primitive-blue-500") },
      uSecondaryColour: { value: getTokenColour("--primitive-cyan-400") },
    }),
    [profile.pointSize],
  );
  const scenePosition = mobile
    ? particleSceneConfig.hero.mobile
    : particleSceneConfig.hero.desktop;
  const targetScale = profile.objectScale * scenePosition.scale;

  useFrame(({ clock }, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;

    if (!material || !group) {
      return;
    }

    const targetProgress = progressStore.getSnapshot().sceneProgress.hero ?? 0;
    material.uniforms.uProgress.value = MathUtils.damp(
      material.uniforms.uProgress.value,
      targetProgress,
      5,
      delta,
    );
    material.uniforms.uTime.value = clock.elapsedTime;
    group.position.x = MathUtils.damp(group.position.x, scenePosition.x, 5, delta);
    group.position.y = MathUtils.damp(group.position.y, scenePosition.y, 5, delta);
    group.scale.setScalar(
      MathUtils.damp(group.scale.x, targetScale, 5, delta),
    );
  });

  return (
    <group ref={groupRef} scale={targetScale}>
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
            attach="attributes-particleRandom"
            args={[targets.randomness, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
