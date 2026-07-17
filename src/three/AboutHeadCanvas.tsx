import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  ShaderMaterial,
  Vector2,
  type Group,
} from "three";

type HeadMotion = {
  progress: number;
};

type AboutHeadCanvasProps = {
  motion: MutableRefObject<HeadMotion>;
  active: boolean;
  onReady?: () => void;
};

const MOBILE_HEAD_POINT_LIMIT = 5600;

function selectRuntimePositions(buffer: ArrayBuffer) {
  const source = new Float32Array(buffer);
  const sourceCount = source.length / 3;
  if (window.innerWidth >= 768 || sourceCount <= MOBILE_HEAD_POINT_LIMIT) return source;
  const selected = new Float32Array(MOBILE_HEAD_POINT_LIMIT * 3);
  for (let index = 0; index < MOBILE_HEAD_POINT_LIMIT; index += 1) {
    const sourceIndex = Math.floor(index * sourceCount / MOBILE_HEAD_POINT_LIMIT);
    selected[index * 3] = source[sourceIndex * 3];
    selected[index * 3 + 1] = source[sourceIndex * 3 + 1];
    selected[index * 3 + 2] = source[sourceIndex * 3 + 2];
  }
  return selected;
}

const vertexShader = `
  attribute vec3 aScatter;
  attribute float aRandom;
  uniform float uDispersion;
  uniform float uPointSize;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  varying float vRandom;
  varying float vDepth;
  varying float vPointerInfluence;

  void main() {
    float eased = smoothstep(0.0, 1.0, uDispersion);
    float burst = sin(eased * 3.14159265);
    vec3 positionNow = mix(position, aScatter, eased);
    positionNow += normalize(aScatter + vec3(0.001)) * burst * (0.12 + aRandom * 0.28);
    positionNow.y += sin(uTime * 0.28 + aRandom * 18.0) * 0.018;
    positionNow.x += cos(uTime * 0.22 + aRandom * 13.0) * 0.012;
    vec4 viewPosition = modelViewMatrix * vec4(positionNow, 1.0);
    vec4 clipPosition = projectionMatrix * viewPosition;
    vec2 screenPosition = clipPosition.xy / max(clipPosition.w, 0.001);
    float pointerDistance = distance(screenPosition, uPointer);
    float pointerInfluence = (1.0 - smoothstep(0.0, 0.38, pointerDistance)) * uPointerStrength;
    vec2 pointerDirection = normalize(screenPosition - uPointer + vec2(0.0001));
    viewPosition.xy += pointerDirection * pointerInfluence * 0.16;
    viewPosition.z += pointerInfluence * 0.38;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * (1.0 + pointerInfluence * 0.75) * (1.0 / max(0.4, -viewPosition.z));
    vRandom = aRandom;
    vDepth = clamp((positionNow.z + 2.4) / 4.8, 0.0, 1.0);
    vPointerInfluence = pointerInfluence;
  }
`;

const fragmentShader = `
  uniform vec3 uBlue;
  uniform vec3 uCyan;
  varying float vRandom;
  varying float vDepth;
  varying float vPointerInfluence;

  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float distanceFromCentre = length(point);
    if (distanceFromCentre > 0.5) discard;
    float edge = 1.0 - smoothstep(0.28, 0.5, distanceFromCentre);
    float colourMix = clamp(vDepth * 0.66 + vRandom * 0.34, 0.0, 1.0);
    vec3 colour = mix(uBlue, uCyan, colourMix);
    colour = mix(colour, uCyan, vPointerInfluence * 0.36);
    gl_FragColor = vec4(colour, edge * (0.62 + vRandom * 0.34 + vPointerInfluence * 0.2));
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function HeadPoints({ motion, positions, onReady }: AboutHeadCanvasProps & { positions: Float32Array }) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const random = useMemo(() => seededRandom(2717), []);
  const geometry = useMemo(() => {
    const count = positions.length / 3;
    const centredPositions = new Float32Array(positions.length);
    const scatter = new Float32Array(positions.length);
    const randomness = new Float32Array(count);
    let centreX = 0;
    let centreY = 0;
    let centreZ = 0;
    for (let index = 0; index < count; index += 1) {
      centreX += positions[index * 3];
      centreY += positions[index * 3 + 1];
      centreZ += positions[index * 3 + 2];
    }
    centreX /= count;
    centreY /= count;
    centreZ /= count;
    for (let index = 0; index < count; index += 1) {
      centredPositions[index * 3] = positions[index * 3] - centreX;
      centredPositions[index * 3 + 1] = positions[index * 3 + 1] - centreY;
      centredPositions[index * 3 + 2] = positions[index * 3 + 2] - centreZ;
      const radius = 3.5 + random() * 4.4;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      scatter[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      scatter[index * 3 + 1] = Math.cos(phi) * radius;
      scatter[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
      randomness[index] = random();
    }
    const value = new BufferGeometry();
    value.setAttribute("position", new BufferAttribute(centredPositions, 3));
    value.setAttribute("aScatter", new BufferAttribute(scatter, 3));
    value.setAttribute("aRandom", new BufferAttribute(randomness, 1));
    return value;
  }, [positions, random]);
  const material = useMemo(() => new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uDispersion: { value: 0 },
      uPointSize: { value: 9.2 },
      uTime: { value: 0 },
      uPointer: { value: new Vector2(20, 20) },
      uPointerStrength: { value: 0 },
      uBlue: { value: new Color("#2563eb") },
      uCyan: { value: new Color("#22d3ee") },
    },
  }), []);

  useEffect(() => {
    onReady?.();
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material, onReady]);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      pointerRef.current.x = event.clientX / window.innerWidth * 2 - 1;
      pointerRef.current.y = event.clientY / window.innerHeight * 2 - 1;
      pointerRef.current.active = true;
    };
    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    const shader = materialRef.current;
    if (!group || !shader) return;
    const target = motion.current.progress;
    const pointer = pointerRef.current;
    const pointerX = pointer.active ? pointer.x * 0.14 : 0;
    const pointerY = pointer.active ? -pointer.y * 0.11 : 0;
    const idleY = Math.sin(clock.elapsedTime * 0.22) * 0.055;
    const idleX = Math.cos(clock.elapsedTime * 0.18) * 0.018;
    shader.uniforms.uDispersion.value = MathUtils.damp(shader.uniforms.uDispersion.value, target, 5.2, delta);
    shader.uniforms.uTime.value = clock.elapsedTime;
    shader.uniforms.uPointer.value.x = MathUtils.damp(
      shader.uniforms.uPointer.value.x,
      pointer.active ? pointer.x : 20,
      8,
      delta,
    );
    shader.uniforms.uPointer.value.y = MathUtils.damp(
      shader.uniforms.uPointer.value.y,
      pointer.active ? -pointer.y : 20,
      8,
      delta,
    );
    shader.uniforms.uPointerStrength.value = MathUtils.damp(
      shader.uniforms.uPointerStrength.value,
      pointer.active ? 1 : 0,
      9,
      delta,
    );
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      -0.2 + target * 1.3 + idleY + pointerX,
      4.2,
      delta,
    );
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      0.03 - target * 0.22 + idleX + pointerY,
      4.2,
      delta,
    );
  });

  return (
    <group ref={groupRef} rotation={[0.03, -0.2, 0]} scale={0.88}>
      <points geometry={geometry} frustumCulled={false}>
        <primitive ref={materialRef} object={material} attach="material" />
      </points>
    </group>
  );
}

export default function AboutHeadCanvas({ motion, active, onReady }: AboutHeadCanvasProps) {
  const [positions, setPositions] = useState<Float32Array | null>(null);
  const failed = positions?.length === 0;

  useEffect(() => {
    let active = true;
    fetch("/about/simple-head-points.bin")
      .then((response) => {
        if (!response.ok) throw new Error("Head study point data could not load.");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (active) setPositions(selectRuntimePositions(buffer));
      })
      .catch(() => {
        if (active) {
          setPositions(new Float32Array());
          onReady?.();
        }
      });
    return () => { active = false; };
  }, [onReady]);

  if (!positions) return null;
  if (failed) return <div className="about-head__fallback" aria-hidden="true" />;
  const mobile = window.innerWidth < 768;

  return (
    <Canvas
      className="about-head__canvas"
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      dpr={mobile ? [0.75, 1.05] : [0.75, 1.35]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <HeadPoints motion={motion} active={active} positions={positions} onReady={onReady} />
    </Canvas>
  );
}
