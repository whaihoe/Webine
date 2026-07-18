import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { experienceConfig } from "../../config/experience";

const orbConfig = experienceConfig.particles.servicesOrb;

export type ServicesParticleMotion = {
  rotation: number;
  scale: number;
};

type ServicesParticleOrbProps = {
  motion: MutableRefObject<ServicesParticleMotion>;
};

type OrbParticle = {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
  speed: number;
  amplitude: number;
  orbitBias: number;
  spreadX: number;
  spreadY: number;
  spreadZ: number;
  cyan: boolean;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createOrbParticles(count: number) {
  const random = seededRandom(20260717);
  const particles: OrbParticle[] = [];
  for (let index = 0; index < count; index += 1) {
    const band = index % 3;
    const angle = random() * Math.PI * 2;
    const radius = 0.36 + band * 0.13 + (random() - 0.5) * 0.09;
    const depthAngle = angle * (1.15 + band * 0.12) + band * 1.7;
    particles.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * (0.8 + band * 0.055),
      z: Math.sin(depthAngle) * (0.14 + band * 0.052),
      size: 0.65 + random() * 1.15,
      phase: random() * Math.PI * 2,
      speed: 0.25 + random() * 0.84,
      amplitude: orbConfig.electronAmplitude.min + random() * orbConfig.electronAmplitude.range,
      orbitBias: random() * Math.PI * 2,
      spreadX: (random() - 0.5) * 0.052,
      spreadY: (random() - 0.5) * 0.046,
      spreadZ: (random() - 0.5) * 0.064,
      cyan: random() > 0.54,
    });
  }
  return particles;
}

export function ServicesParticleOrb({ motion }: ServicesParticleOrbProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useMemo(() => createOrbParticles(orbConfig.count), []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const pointerTarget = { x: 0, y: 0, localX: 0.5, localY: 0.5, active: false };
    const pointer = { x: 0, y: 0, localX: 0.5, localY: 0.5, active: false };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let width = 1;
    let height = 1;
    let dpr = 1;
    let visible = false;
    let frame = 0;
    let previousFrame = 0;

    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.visibilityState !== "visible") return;
      if (time - previousFrame < 1000 / orbConfig.maxFrameRate) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      previousFrame = time;
      const elapsed = time / 1000;
      pointer.x += (pointerTarget.x - pointer.x) * 0.075;
      pointer.y += (pointerTarget.y - pointer.y) * 0.075;
      pointer.localX += (pointerTarget.localX - pointer.localX) * 0.09;
      pointer.localY += (pointerTarget.localY - pointer.localY) * 0.09;
      pointer.active = pointerTarget.active;
      const rotationY = motion.current.rotation + pointer.x * orbConfig.pointerTilt.y
        + Math.sin(elapsed * 0.18) * orbConfig.rotation.idleRange;
      const rotationX = -0.18 + pointer.y * -orbConfig.pointerTilt.x + Math.sin(elapsed * 0.21) * 0.055;
      const sinX = Math.sin(rotationX);
      const cosX = Math.cos(rotationX);
      const sinY = Math.sin(rotationY);
      const cosY = Math.cos(rotationY);
      const scale = Math.min(width, height) * 0.82 * motion.current.scale;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let pass = 0; pass < 2; pass += 1) {
        for (let colourIndex = 0; colourIndex < 2; colourIndex += 1) {
          const cyan = colourIndex === 1;
          context.fillStyle = cyan ? "rgb(34, 211, 238)" : "rgb(59, 130, 246)";
          for (const particle of particles) {
            const colourShift = Math.sin(
              elapsed * orbConfig.colourCycleSpeed + particle.phase * 1.7,
            );
            const dynamicCyan = colourShift > 0.78 ? !particle.cyan : particle.cyan;
            if (dynamicCyan !== cyan) continue;
            const electronTime = elapsed * particle.speed;
            const electronX = Math.sin(electronTime + particle.phase) * particle.amplitude
              + Math.sin(electronTime * 0.31 + particle.orbitBias) * particle.amplitude * 0.38;
            const electronY = Math.cos(electronTime * 0.73 + particle.orbitBias) * particle.amplitude * 0.84
              + Math.sin(electronTime * 0.27 + particle.phase * 0.61) * particle.amplitude * 0.31;
            const electronZ = Math.sin(electronTime * 0.57 + particle.phase * 1.31) * particle.amplitude * 1.2
              + Math.cos(electronTime * 0.23 + particle.orbitBias * 0.79) * particle.amplitude * 0.42;
            const localX = particle.x + particle.spreadX + electronX;
            const localY = particle.y + particle.spreadY + electronY;
            const localZ = particle.z + particle.spreadZ + electronZ;
            const xzX = localX * cosY + localZ * sinY;
            const xzZ = -localX * sinY + localZ * cosY;
            const yzY = localY * cosX - xzZ * sinX;
            const yzZ = localY * sinX + xzZ * cosX;
            const perspective = 1 / Math.max(0.74, 1.12 - yzZ * 0.42);
            const baseX = width * 0.5 + xzX * scale * perspective;
            const baseY = height * 0.5 + yzY * scale * perspective;
            const pointerX = pointer.localX * width;
            const pointerY = pointer.localY * height;
            const deltaX = baseX - pointerX;
            const deltaY = baseY - pointerY;
            const distance = Math.hypot(deltaX, deltaY);
            const influence = pointer.active ? Math.max(0, 1 - distance / (Math.min(width, height) * 0.34)) ** 2 : 0;
            const outward = influence * Math.min(width, height) * 0.085;
            const inverseDistance = 1 / Math.max(distance, 1);
            const x = baseX + deltaX * inverseDistance * outward;
            const y = baseY + deltaY * inverseDistance * outward;
            const alpha = (0.35 + perspective * 0.38 + influence * 0.18) * (pass === 0 ? 0.12 : 0.84);
            const radius = particle.size * perspective * (1 + influence * 0.9) * (pass === 0 ? 2.5 : 0.78);
            context.globalAlpha = alpha;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && visible && document.visibilityState === "visible") frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      dpr = Math.min(window.devicePixelRatio || 1, orbConfig.pixelRatioCap);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      start();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      pointerTarget.x = event.clientX / window.innerWidth * 2 - 1;
      pointerTarget.y = event.clientY / window.innerHeight * 2 - 1;
      const bounds = root.getBoundingClientRect();
      pointerTarget.localX = (event.clientX - bounds.left) / Math.max(bounds.width, 1);
      pointerTarget.localY = (event.clientY - bounds.top) / Math.max(bounds.height, 1);
      pointerTarget.active = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    };
    const handlePointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
      pointerTarget.active = false;
    };
    const handleVisibility = () => document.visibilityState === "visible" ? start() : stop();

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "25% 0px" });
    resizeObserver.observe(root);
    visibilityObserver.observe(root);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [motion, particles]);

  return <div ref={rootRef} className="services-particle-orb"><canvas ref={canvasRef} /></div>;
}
