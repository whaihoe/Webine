import { useEffect, useRef } from "react";

type AmbientParticleFieldProps = {
  count?: number;
  className?: string;
};

type AmbientParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  phase: number;
  speed: number;
  travelX: number;
  travelY: number;
  depth: number;
  cyan: boolean;
};

function hash(value: number) {
  const sine = Math.sin(value * 91.173) * 43758.5453;
  return sine - Math.floor(sine);
}

function createParticles(count: number): AmbientParticle[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = index + 1;
    return {
      x: 0.025 + hash(seed * 1.7) * 0.95,
      y: 0.02 + hash(seed * 2.9) * 0.96,
      size: 0.75 + hash(seed * 4.3) * 2.35,
      alpha: 0.17 + hash(seed * 5.1) * 0.5,
      phase: hash(seed * 6.7) * Math.PI * 2,
      speed: 0.055 + hash(seed * 7.9) * 0.075,
      travelX: -34 + hash(seed * 9.1) * 68,
      travelY: -44 + hash(seed * 11.3) * 74,
      depth: 0.45 + hash(seed * 15.1) * 0.8,
      cyan: index % 3 === 0 || index % 7 === 0,
    };
  });
}

export function AmbientParticleField({
  count = 52,
  className = "",
}: AmbientParticleFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const particles = createParticles(count);
    const pointerTarget = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const frameInterval = 1000 / (window.innerWidth < 600 ? 30 : 45);
    let visible = false;
    let frame = 0;
    let previousFrame = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const draw = (time: number) => {
      frame = 0;
      if (!visible || document.visibilityState !== "visible") return;
      if (time - previousFrame < frameInterval) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      previousFrame = time;
      const elapsed = time / 1000;
      pointer.x += (pointerTarget.x - pointer.x) * 0.055;
      pointer.y += (pointerTarget.y - pointer.y) * 0.055;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let pass = 0; pass < 2; pass += 1) {
        for (let colourIndex = 0; colourIndex < 2; colourIndex += 1) {
          const cyan = colourIndex === 1;
          context.fillStyle = cyan ? "rgb(34, 211, 238)" : "rgb(59, 130, 246)";
          for (const particle of particles) {
            if (particle.cyan !== cyan) continue;
            const wave = elapsed * particle.speed + particle.phase;
            const x = particle.x * width
              + Math.sin(wave) * particle.travelX
              + pointer.x * particle.depth * 14;
            const y = particle.y * height
              + Math.cos(wave * 0.83) * particle.travelY
              + pointer.y * particle.depth * 10;
            const pulse = 0.68 + Math.sin(wave * 2.4) * 0.24;
            const radius = particle.size * (pass === 0 ? 2.45 : 0.78);
            context.globalAlpha = particle.alpha * pulse * (pass === 0 ? 0.16 : 0.92);
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
      if (!frame && visible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
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
    };
    const handlePointerLeave = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "20% 0px" });
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
  }, [count]);

  return (
    <div ref={rootRef} className={`ambient-particle-field ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
