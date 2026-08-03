import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  Quaternion,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Group,
  type Points,
} from "three";
import { gsap } from "../../animation/scroll-runtime";
import { experienceConfig } from "../../config/experience";
import { useParticlePointer } from "../../hooks/useParticlePointer";
import {
  serviceParticleFragmentShader,
  serviceParticleVertexShader,
} from "../../three/services/service-particle-shaders";
import { loadServiceParticleTargets } from "../../three/services/service-particle-targets";
import {
  createParticleInteractionState,
  updateParticleInteraction,
} from "../../three/particle-pointer";

const morphConfig = experienceConfig.particles.servicesMorph;
const particleGlow = experienceConfig.particles.glow;
const runnerConfig = morphConfig.mobiusRunner;

function getTokenColour(token: string) {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const [hue, saturation, lightness] = channels.split(/\s+/);
  return new Color().setStyle(`hsl(${hue}, ${saturation}, ${lightness})`);
}

function createRandomness(count: number) {
  const randomness = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    randomness[index] = ((Math.sin((index + 1) * 91.173) * 43758.5453) % 1 + 1) % 1;
  }
  return randomness;
}

function createRunnerPoints(count: number, sphereRadius: number) {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - index / Math.max(count - 1, 1) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = goldenAngle * index;
    positions.set([
      Math.cos(angle) * radius * sphereRadius,
      y * sphereRadius,
      Math.sin(angle) * radius * sphereRadius,
    ], index * 3);
  }
  return positions;
}

function ServicesFrameScheduler({ active, maxFrameRate }: { active: boolean; maxFrameRate: number }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let previousFrame = 0;
    const interval = 1000 / maxFrameRate;
    const draw = (time: number) => {
      if (time - previousFrame >= interval) {
        previousFrame = time - (time - previousFrame) % interval;
        invalidate();
      }
      frame = window.requestAnimationFrame(draw);
    };
    invalidate();
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [active, invalidate, maxFrameRate]);
  return null;
}

function MobiusRunner({ visible, mobile }: { visible: boolean; mobile: boolean }) {
  const runnerRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const rollingAxis = useMemo(() => new Vector3(), []);
  const surfaceNormal = useMemo(() => new Vector3(), []);
  const rollingStep = useMemo(() => new Quaternion(), []);
  const geometry = useMemo(() => {
    const next = new BufferGeometry();
    next.setAttribute(
      "position",
      new BufferAttribute(createRunnerPoints(runnerConfig.pointCount, runnerConfig.sphereRadius), 3),
    );
    return next;
  }, []);
  const material = useMemo(() => new ShaderMaterial({
    uniforms: { uColour: { value: getTokenColour("--primitive-cyan-400") }, uOpacity: { value: 0 } },
    vertexShader: `
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = ${(
          mobile
            ? particleGlow.objectPointSize.mobile
            : particleGlow.objectPointSize.desktop
        ).toFixed(2)} * ${particleGlow.shaderSpriteScale.toFixed(2)}
          * (7.0 / max(1.0, -viewPosition.z));
      }
    `,
    fragmentShader: `
      uniform vec3 uColour;
      uniform float uOpacity;
      void main() {
        float distanceFromCentre = length(gl_PointCoord - 0.5);
        if (distanceFromCentre > 0.5) discard;
        float core = 1.0 - smoothstep(
          ${particleGlow.shaderCoreStart},
          ${particleGlow.shaderCoreEnd},
          distanceFromCentre
        );
        float haloDisc = 1.0 - smoothstep(
          ${particleGlow.shaderHaloStart},
          0.5,
          distanceFromCentre
        );
        float halo = haloDisc * ${particleGlow.haloAlpha};
        float glowAlpha = core + halo * (1.0 - core);
        gl_FragColor = vec4(uColour, uOpacity * glowAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  }), [mobile]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame(({ clock }, delta) => {
    const runner = runnerRef.current;
    const runnerMaterial = materialRef.current;
    if (!runner || !runnerMaterial) return;
    runnerMaterial.uniforms.uOpacity.value = MathUtils.damp(
      runnerMaterial.uniforms.uOpacity.value,
      visible ? 0.95 : 0,
      5,
      delta,
    );
    const angle = clock.getElapsedTime() * runnerConfig.speed;
    const halfAngle = angle * 0.5;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const sineHalf = Math.sin(halfAngle);
    const cosineHalf = Math.cos(halfAngle);
    surfaceNormal.set(-cosine * sineHalf, cosineHalf, -sine * sineHalf).normalize();
    runner.position.set(
      runnerConfig.pathCentreX + cosine * runnerConfig.pathRadius,
      0,
      sine * runnerConfig.pathRadius,
    ).addScaledVector(
      surfaceNormal,
      runnerConfig.sphereRadius * 1.08,
    );
    rollingAxis.set(
      cosineHalf * cosine,
      sineHalf,
      cosineHalf * sine,
    ).normalize();
    rollingStep.setFromAxisAngle(
      rollingAxis,
      -runnerConfig.speed * runnerConfig.pathRadius / runnerConfig.sphereRadius * delta,
    );
    runner.quaternion.premultiply(rollingStep);
  });

  return <points ref={runnerRef} geometry={geometry} frustumCulled={false}><primitive ref={materialRef} object={material} attach="material" /></points>;
}

function MorphingServiceObject({
  targets,
  activeIndex,
  mobile,
  visible,
}: {
  targets: Float32Array[];
  activeIndex: number;
  mobile: boolean;
  visible: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const pointerRef = useParticlePointer();
  const pointerInteractionRef = useRef(createParticleInteractionState());
  const count = targets[0].length / 3;
  const geometry = useMemo(() => {
    const next = new BufferGeometry();
    next.setAttribute("position", new BufferAttribute(targets[0].slice(), 3));
    next.setAttribute("targetFrom", new BufferAttribute(targets[0].slice(), 3));
    next.setAttribute("targetTo", new BufferAttribute(targets[0].slice(), 3));
    next.setAttribute("particleRandom", new BufferAttribute(createRandomness(count), 1));
    return next;
  }, [count, targets]);
  const material = useMemo(() => new ShaderMaterial({
    uniforms: {
      uMorph: { value: 1 },
      uTime: { value: 0 },
      uPointSize: {
        value: mobile
          ? particleGlow.objectPointSize.mobile
          : particleGlow.objectPointSize.desktop,
      },
      uTransitionSpread: { value: morphConfig.transitionSpread },
      uElectronAmplitude: { value: morphConfig.electronAmplitude },
      uPointer: { value: new Vector2(20, 20) },
      uPointerAspect: { value: 1 },
      uPointerStrength: { value: 0 },
      uColourFlowScale: {
        value: mobile
          ? experienceConfig.particles.surfaceField.compactFlowScale
          : 1,
      },
      uCyanColour: { value: getTokenColour("--primitive-cyan-400") },
      uBlueColour: { value: getTokenColour("--primitive-blue-500") },
      uDeepBlueColour: { value: getTokenColour("--primitive-blue-700") },
    },
    vertexShader: serviceParticleVertexShader,
    fragmentShader: serviceParticleFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  }), [mobile]);

  useEffect(() => {
    const fromAttribute = geometry.getAttribute("targetFrom") as BufferAttribute;
    const toAttribute = geometry.getAttribute("targetTo") as BufferAttribute;
    const progress = material.uniforms.uMorph.value;
    const eased = progress * progress * (3 - 2 * progress);
    const fromValues = fromAttribute.array as Float32Array;
    const toValues = toAttribute.array as Float32Array;
    const current = new Float32Array(fromValues.length);
    for (let index = 0; index < current.length; index += 1) {
      current[index] = MathUtils.lerp(fromValues[index], toValues[index], eased);
    }
    fromAttribute.copyArray(current);
    toAttribute.copyArray(targets[activeIndex]);
    fromAttribute.needsUpdate = true;
    toAttribute.needsUpdate = true;
    material.uniforms.uMorph.value = 0;
    const tween = gsap.to(material.uniforms.uMorph, {
      value: 1,
      duration: morphConfig.transitionSeconds,
      ease: "power3.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [activeIndex, geometry, material, targets]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame(({ clock, viewport }, delta) => {
    const group = groupRef.current;
    const particleMaterial = materialRef.current;
    if (!group || !particleMaterial) return;
    const model = morphConfig.models[activeIndex];
    const elapsed = clock.getElapsedTime();
    const pointer = pointerRef.current;
    const morphProgress = particleMaterial.uniforms.uMorph.value;
    const settledStrength = 1 - Math.abs(Math.sin(morphProgress * Math.PI));
    const pointerInteraction = pointerInteractionRef.current;
    updateParticleInteraction(pointerInteraction, pointer, {
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      formedStrength: visible ? settledStrength : 0,
    });
    particleMaterial.uniforms.uTime.value = elapsed;
    const rotation = model.rotation;
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      rotation.x + pointerInteraction.tiltX,
      3.4,
      delta,
    );
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      rotation.restingY + pointerInteraction.tiltY,
      3.4,
      delta,
    );
    group.rotation.z = MathUtils.damp(
      group.rotation.z,
      pointerInteraction.tiltZ,
      3.4,
      delta,
    );
    const responsiveScale = model.scale * (mobile ? morphConfig.mobileScale : 1);
    group.scale.setScalar(MathUtils.damp(group.scale.x, responsiveScale, 3.8, delta));
    const anchor = mobile ? morphConfig.anchor.mobile : morphConfig.anchor.desktop;
    group.position.x = MathUtils.damp(
      group.position.x,
      anchor.x + model.centreOffset.x + pointerInteraction.offsetX,
      5,
      delta,
    );
    group.position.y = MathUtils.damp(
      group.position.y,
      anchor.y + model.centreOffset.y + pointerInteraction.offsetY,
      4,
      delta,
    );
    group.position.z = MathUtils.damp(
      group.position.z,
      anchor.z + model.centreOffset.z,
      4,
      delta,
    );
    particleMaterial.uniforms.uPointer.value.x = MathUtils.damp(
      particleMaterial.uniforms.uPointer.value.x,
      pointerInteraction.pointerX,
      8,
      delta,
    );
    particleMaterial.uniforms.uPointer.value.y = MathUtils.damp(
      particleMaterial.uniforms.uPointer.value.y,
      pointerInteraction.pointerY,
      8,
      delta,
    );
    particleMaterial.uniforms.uPointerAspect.value = pointerInteraction.pointerAspect;
    particleMaterial.uniforms.uPointerStrength.value = MathUtils.damp(
      particleMaterial.uniforms.uPointerStrength.value,
      pointerInteraction.strength,
      9,
      delta,
    );
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <primitive ref={materialRef} object={material} attach="material" />
      </points>
      <MobiusRunner visible={visible && activeIndex === 5} mobile={mobile} />
    </group>
  );
}

export function ServicesParticleExperience({ activeIndex }: { activeIndex: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 47.999rem)").matches,
  );
  const [visible, setVisible] = useState(false);
  const [targets, setTargets] = useState<Float32Array[] | null>(null);
  const [failed, setFailed] = useState(false);
  const count = mobile ? morphConfig.count.mobile : morphConfig.count.desktop;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 47.999rem)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "35% 0px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTargets(null);
    setFailed(false);
    loadServiceParticleTargets(morphConfig.models.map((model) => model.url), count)
      .then((nextTargets) => {
        if (!cancelled) setTargets(nextTargets);
      })
      .catch((error: unknown) => {
        console.error("Webine Services particle targets could not load.", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [count]);

  const maxFrameRate = mobile ? morphConfig.maxFrameRate.mobile : morphConfig.maxFrameRate.desktop;

  return (
    <div
      ref={rootRef}
      className="services-particle-experience"
      data-service-particle-state={failed ? "failed" : targets ? "ready" : "loading"}
      aria-hidden="true"
    >
      {targets ? (
        <Canvas
          camera={{ position: [0, 0, 5.8], fov: 44, near: 0.1, far: 20 }}
          dpr={morphConfig.pixelRatioCap}
          frameloop="demand"
          gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        >
          <ServicesFrameScheduler active={visible} maxFrameRate={maxFrameRate} />
          <MorphingServiceObject
            targets={targets}
            activeIndex={activeIndex}
            mobile={mobile}
            visible={visible}
          />
        </Canvas>
      ) : null}
    </div>
  );
}
