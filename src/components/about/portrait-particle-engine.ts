export type SilhouetteParticle = {
  targetX: number;
  targetY: number;
  originX: number;
  originY: number;
  random: number;
  phase: number;
  blue: boolean;
};

type DrawSilhouetteOptions = {
  canvas: HTMLCanvasElement;
  particles: SilhouetteParticle[];
  progress: number;
  time: number;
  width: number;
  height: number;
  dpr: number;
  glow: boolean;
};

type CreateSilhouetteOptions = {
  mobile: boolean;
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
  const progress = clamp((value - edgeStart) / (edgeEnd - edgeStart));
  return progress * progress * (3 - 2 * progress);
}

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function createSilhouetteParticles(mask: HTMLImageElement, { mobile }: CreateSilhouetteOptions) {
  const sampleCanvas = document.createElement("canvas");
  const width = Math.min(mask.naturalWidth, mobile ? 360 : 560);
  const height = Math.round(width * mask.naturalHeight / mask.naturalWidth);
  sampleCanvas.width = width;
  sampleCanvas.height = height;
  const context = sampleCanvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [];

  context.drawImage(mask, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const particles: SilhouetteParticle[] = [];
  const step = mobile ? 5 : width < 420 ? 4 : 3;
  const edgeDistance = step * 2;
  const random = createSeededRandom(9173 + width + height);
  const isInside = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    return pixels[(Math.floor(y) * width + Math.floor(x)) * 4] > 52;
  };

  for (let y = edgeDistance; y < height - edgeDistance; y += step) {
    for (let x = edgeDistance; x < width - edgeDistance; x += step) {
      if (!isInside(x, y)) continue;
      const isEdge = !isInside(x - edgeDistance, y)
        || !isInside(x + edgeDistance, y)
        || !isInside(x, y - edgeDistance)
        || !isInside(x, y + edgeDistance)
        || !isInside(x - edgeDistance, y - edgeDistance)
        || !isInside(x + edgeDistance, y - edgeDistance)
        || !isInside(x - edgeDistance, y + edgeDistance)
        || !isInside(x + edgeDistance, y + edgeDistance);

      if (!isEdge || random() <= 0.08) continue;
      const targetX = x / width;
      const targetY = y / height;
      const identity = random();
      const gradient = clamp(0.5 + targetX * 0.12 - targetY * 0.055, 0.04, 0.96);
      particles.push({
        targetX,
        targetY,
        originX: clamp(targetX + (random() - 0.5) * 0.24, -0.08, 1.08),
        originY: 1.04 + random() * 0.22,
        random: identity,
        phase: random() * Math.PI * 2,
        blue: identity > gradient,
      });
    }
  }

  const limit = mobile ? 850 : 2400;
  if (particles.length <= limit) return particles;
  return Array.from({ length: limit }, (_, index) => particles[Math.floor(index * particles.length / limit)]);
}

export function drawSilhouetteParticles({ canvas, particles, progress, time, width, height, dpr, glow }: DrawSilhouetteOptions) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = "lighter";

  const firstPass = glow ? 0 : 1;
  for (let pass = firstPass; pass < 2; pass += 1) {
    for (let colourIndex = 0; colourIndex < 2; colourIndex += 1) {
      const blue = colourIndex === 1;
      context.fillStyle = blue ? "rgb(59, 130, 246)" : "rgb(34, 211, 238)";
      for (const particle of particles) {
        if (particle.blue !== blue) continue;
        const formationStart = (1 - particle.targetY) * 0.7 + particle.random * 0.075;
        const localProgress = smoothstep(formationStart, formationStart + 0.27, progress);
        if (localProgress <= 0.002) continue;

        const eased = 1 - Math.pow(1 - localProgress, 3);
        const unsettled = 1 - eased;
        const settled = smoothstep(0.72, 1, localProgress);
        const curl = Math.sin(particle.phase + localProgress * Math.PI * 4.5) * 0.04 * unsettled;
        const driftX = Math.sin(time * 0.00032 + particle.phase) * 0.0018 * settled;
        const driftY = Math.cos(time * 0.00027 + particle.phase * 1.4) * 0.0015 * settled;
        const x = (particle.originX + (particle.targetX - particle.originX) * eased + curl + driftX) * width;
        const y = (particle.originY + (particle.targetY - particle.originY) * eased + driftY) * height;
        const alpha = smoothstep(0.02, 0.18, localProgress) * (0.72 + particle.random * 0.26);
        const radius = (0.68 + particle.random * 0.92) * dpr;

        context.globalAlpha = pass === 0 ? alpha * 0.18 : alpha;
        context.beginPath();
        context.arc(x, y, pass === 0 ? radius * 2.35 : radius, 0, Math.PI * 2);
        context.fill();
      }
    }
  }
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}
