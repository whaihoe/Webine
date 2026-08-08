import { useEffect, useRef } from "react";
import { finePointerQuery } from "../config/media-queries";

type BrushPoint = {
  x: number;
  y: number;
};

type HslColour = {
  hue: number;
  saturation: number;
  lightness: number;
};

type BrushParticle = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  alpha: number;
  age: number;
  lifetime: number;
  driftPhase: number;
  driftSpeed: number;
  spreadDirectionX: number;
  spreadDirectionY: number;
  spreadAcceleration: number;
  buoyancy: number;
  haze: boolean;
  sprite: HTMLCanvasElement;
  colour: string;
};

type ColourBand = {
  colour: HslColour;
  distance: number;
  blendDistance: number;
};

const maxParticles = 2000;
const brushSpacing = 2.8;
const particlesPerStep = 10;
const entryBurstParticles = 14;
const pixelRatioCap = 1.75;
const spriteSize = 112;

const fallbackDarkBlue: HslColour = {
  hue: 220,
  saturation: 82,
  lightness: 40,
};
const fallbackLightBlue: HslColour = {
  hue: 195,
  saturation: 94,
  lightness: 67,
};
const fallbackWhite: HslColour = {
  hue: 210,
  saturation: 30,
  lightness: 98,
};

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function parseHslChannels(value: string): HslColour | null {
  const match = value.trim().match(
    /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%$/,
  );

  if (!match) return null;

  return {
    hue: Number(match[1]),
    saturation: Number(match[2]),
    lightness: Number(match[3]),
  };
}

function readColourToken(token: string, fallback: HslColour) {
  const styles = getComputedStyle(document.documentElement);
  return parseHslChannels(styles.getPropertyValue(token)) ?? fallback;
}

function readColourBands(): ColourBand[] {
  const darkBlue = readColourToken("--primitive-blue-700", fallbackDarkBlue);
  const lightBlue = readColourToken("--primitive-cyan-400", fallbackLightBlue);
  const mediumBlue = readColourToken("--primitive-blue-400", fallbackLightBlue);

  // Colour is determined when a particle is created. Existing trail sections keep
  // their original colour while only newly emitted particles advance through the
  // sequence, producing long dark-blue, light-blue and white bands along the trail.
  return [
    { colour: darkBlue, distance: 560, blendDistance: 130 },
    { colour: lightBlue, distance: 520, blendDistance: 130 },
    { colour: fallbackWhite, distance: 430, blendDistance: 116 },
    { colour: mediumBlue, distance: 500, blendDistance: 128 },
    { colour: lightBlue, distance: 460, blendDistance: 120 },
    { colour: fallbackWhite, distance: 380, blendDistance: 108 },
  ];
}

function interpolateHue(from: number, to: number, amount: number) {
  const difference = ((to - from + 540) % 360) - 180;
  return (from + difference * amount + 360) % 360;
}

function interpolateColour(
  from: HslColour,
  to: HslColour,
  amount: number,
): HslColour {
  return {
    hue: interpolateHue(from.hue, to.hue, amount),
    saturation: from.saturation + (to.saturation - from.saturation) * amount,
    lightness: from.lightness + (to.lightness - from.lightness) * amount,
  };
}

function smoothstep(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function getEmissionColour(bands: ColourBand[], travelledDistance: number) {
  const totalDistance = bands.reduce((total, band) => total + band.distance, 0);
  let position = ((travelledDistance % totalDistance) + totalDistance) % totalDistance;

  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];

    if (position <= band.distance) {
      const nextBand = bands[(index + 1) % bands.length];
      const blendStart = Math.max(0, band.distance - band.blendDistance);

      if (position > blendStart && band.blendDistance > 0) {
        const amount = smoothstep((position - blendStart) / band.blendDistance);
        return interpolateColour(band.colour, nextBand.colour, amount);
      }

      return band.colour;
    }

    position -= band.distance;
  }

  return bands[0].colour;
}

function quantizeColour(colour: HslColour) {
  return {
    hue: Math.round(colour.hue / 3) * 3,
    saturation: Math.round(colour.saturation / 4) * 4,
    lightness: Math.round(colour.lightness / 3) * 3,
  };
}

function colourChannels(colour: HslColour) {
  return `${colour.hue} ${colour.saturation}% ${colour.lightness}%`;
}

function paintSprite(
  context: CanvasRenderingContext2D,
  colour: HslColour,
) {
  context.clearRect(0, 0, spriteSize, spriteSize);

  const gradient = context.createRadialGradient(
    spriteSize * 0.5,
    spriteSize * 0.5,
    0,
    spriteSize * 0.5,
    spriteSize * 0.5,
    spriteSize * 0.5,
  );
  const channels = colourChannels(colour);

  gradient.addColorStop(0, `hsl(${channels} / 0.9)`);
  gradient.addColorStop(0.2, `hsl(${channels} / 0.58)`);
  gradient.addColorStop(0.5, `hsl(${channels} / 0.18)`);
  gradient.addColorStop(0.78, `hsl(${channels} / 0.045)`);
  gradient.addColorStop(1, `hsl(${channels} / 0)`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, spriteSize, spriteSize);
}

function createSpriteCache() {
  const cache = new Map<string, HTMLCanvasElement>();

  return (colour: HslColour) => {
    const quantized = quantizeColour(colour);
    const key = `${quantized.hue}:${quantized.saturation}:${quantized.lightness}`;
    const cached = cache.get(key);

    if (cached) return cached;

    const sprite = document.createElement("canvas");
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    const context = sprite.getContext("2d");

    if (context) paintSprite(context, quantized);
    cache.set(key, sprite);
    return sprite;
  };
}

function createParticle(
  point: BrushPoint,
  direction: BrushPoint,
  speed: number,
  colour: HslColour,
  getSprite: (colour: HslColour) => HTMLCanvasElement,
): BrushParticle {
  const haze = Math.random() < 0.12;
  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };
  const brushRadius = 25 + Math.min(speed * 0.011, 22);

  // Give every part of the brush the same emission probability instead of
  // concentrating particles on the cursor path.
  const crossBrushOffset = randomBetween(-brushRadius, brushRadius);
  const alongBrushOffset = randomBetween(-9.5, 7.2);
  const trailingPush = Math.min(speed * 0.0065, 10);
  const spreadSide = Math.random() < 0.5 ? -1 : 1;
  const spreadAngle =
    Math.atan2(perpendicular.y * spreadSide, perpendicular.x * spreadSide) +
    randomBetween(-0.58, 0.58);
  const spreadDirectionX = Math.cos(spreadAngle);
  const spreadDirectionY = Math.sin(spreadAngle);
  const initialSpreadSpeed =
    (haze ? randomBetween(14, 29) : randomBetween(7, 18)) +
    Math.min(speed * 0.0035, 6);
  const quantizedColour = quantizeColour(colour);

  return {
    x:
      point.x +
      perpendicular.x * crossBrushOffset +
      direction.x * alongBrushOffset +
      randomBetween(-1.7, 1.7),
    y:
      point.y +
      perpendicular.y * crossBrushOffset +
      direction.y * alongBrushOffset +
      randomBetween(-1.7, 1.7),
    velocityX:
      -direction.x * trailingPush +
      spreadDirectionX * initialSpreadSpeed +
      randomBetween(-2.5, 2.5),
    velocityY:
      -direction.y * trailingPush +
      spreadDirectionY * initialSpreadSpeed +
      randomBetween(-2.5, 2.5),
    radius: haze ? randomBetween(8.8, 14.5) : randomBetween(1.9, 5.2),
    alpha: haze ? randomBetween(0.05, 0.11) : randomBetween(0.22, 0.46),
    age: randomBetween(0, 22),
    lifetime: haze ? randomBetween(1700, 2500) : randomBetween(1250, 2050),
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: randomBetween(0.8, 2.1),
    spreadDirectionX,
    spreadDirectionY,
    spreadAcceleration: haze
      ? randomBetween(6, 12)
      : randomBetween(3, 7.5),
    buoyancy: haze ? randomBetween(1.7, 4.4) : randomBetween(0.45, 2.2),
    haze,
    sprite: getSprite(quantizedColour),
    colour: `hsl(${colourChannels(quantizedColour)})`,
  };
}

export function FooterParticleBrush() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const footer = root?.closest<HTMLElement>(".site-footer__frame") ?? root?.closest<HTMLElement>(".site-footer");
    const context = canvas?.getContext("2d", { alpha: true });
    const finePointer = window.matchMedia(finePointerQuery);

    if (!root || !canvas || !footer || !context || !finePointer.matches) {
      if (canvas) canvas.dataset.brushState = "suspended";
      return;
    }

    canvas.dataset.brushState = "ready";
    canvas.dataset.particleCount = "0";

    const colourBands = readColourBands();
    const getSprite = createSpriteCache();
    const particles: BrushParticle[] = [];
    let previousClientPoint: BrushPoint | null = null;
    let previousTime = 0;
    let emittedDistance = 0;
    let frame = 0;
    let lastFrameTime = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let footerIsVisible = false;

    const clearCanvas = () => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    const draw = (time: number) => {
      frame = 0;

      if (!footerIsVisible || document.visibilityState !== "visible") {
        lastFrameTime = 0;
        return;
      }

      const delta = lastFrameTime
        ? Math.min((time - lastFrameTime) / 1000, 0.034)
        : 1 / 60;
      lastFrameTime = time;
      clearCanvas();
      context.globalCompositeOperation = "screen";

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.age += delta * 1000;
        const progress = particle.age / particle.lifetime;

        if (progress >= 1) {
          particles.splice(index, 1);
          continue;
        }

        const drag = Math.exp(-delta * (particle.haze ? 1.05 : 1.3));
        particle.velocityX *= drag;
        particle.velocityY *= drag;

        const spreadEase = 0.35 + progress * 0.85;
        particle.velocityX +=
          particle.spreadDirectionX *
          particle.spreadAcceleration *
          spreadEase *
          delta;
        particle.velocityY +=
          particle.spreadDirectionY *
          particle.spreadAcceleration *
          spreadEase *
          delta;
        particle.velocityY -= particle.buoyancy * delta;
        particle.driftPhase += particle.driftSpeed * delta;

        const flowStrength = particle.haze ? 4.6 : 2.4;
        const flowX = Math.sin(particle.driftPhase) * flowStrength;
        const flowY = Math.cos(particle.driftPhase * 0.83) * flowStrength * 0.75;
        particle.x += particle.velocityX * delta + flowX * delta;
        particle.y += particle.velocityY * delta + flowY * delta;

        const arrival = Math.min(1, progress * 12);
        const tailGradient = Math.pow(1 - progress, particle.haze ? 1.45 : 1.9);
        const opacity = particle.alpha * arrival * tailGradient;
        const expansion = 1 + progress * (particle.haze ? 1.05 : 0.58);
        const radius = particle.radius * expansion;
        const renderedSize = radius * (particle.haze ? 7 : 5.1);

        context.globalAlpha = opacity * (particle.haze ? 0.34 : 0.42);
        context.drawImage(
          particle.sprite,
          particle.x - renderedSize * 0.5,
          particle.y - renderedSize * 0.5,
          renderedSize,
          renderedSize,
        );

        if (!particle.haze) {
          context.globalAlpha = opacity * 0.32;
          context.fillStyle = particle.colour;
          context.beginPath();
          context.arc(
            particle.x,
            particle.y,
            Math.max(0.55, radius * 0.38),
            0,
            Math.PI * 2,
          );
          context.fill();
        }
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      canvas.dataset.particleCount = String(particles.length);

      if (particles.length > 0) {
        canvas.dataset.brushState = "active";
        frame = window.requestAnimationFrame(draw);
      } else {
        canvas.dataset.brushState = "ready";
        lastFrameTime = 0;
      }
    };

    const start = () => {
      if (
        !frame &&
        footerIsVisible &&
        particles.length > 0 &&
        document.visibilityState === "visible"
      ) {
        canvas.dataset.brushState = "active";
        frame = window.requestAnimationFrame(draw);
      }
    };

    const removeNearlyInvisibleParticles = (requiredSlots: number) => {
      let slotsNeeded = Math.max(0, particles.length + requiredSlots - maxParticles);

      if (!slotsNeeded) return;

      for (let index = particles.length - 1; index >= 0 && slotsNeeded > 0; index -= 1) {
        const particle = particles[index];

        if (particle.age / particle.lifetime > 0.88) {
          particles.splice(index, 1);
          slotsNeeded -= 1;
        }
      }
    };

    const adaptiveParticleAmount = (requestedAmount: number) => {
      const load = particles.length / maxParticles;
      let scale = 1;

      if (load > 0.82) {
        scale = 0.34;
      } else if (load > 0.65) {
        scale = 0.56;
      } else if (load > 0.48) {
        scale = 0.76;
      }

      const exactAmount = requestedAmount * scale;
      const roundedAmount = Math.floor(exactAmount);
      return roundedAmount + (Math.random() < exactAmount - roundedAmount ? 1 : 0);
    };

    const addParticles = (
      point: BrushPoint,
      direction: BrushPoint,
      speed: number,
      requestedAmount: number,
      colour: HslColour,
    ) => {
      const amount = adaptiveParticleAmount(requestedAmount);

      if (amount <= 0) return;

      removeNearlyInvisibleParticles(amount);
      const availableSlots = Math.max(0, maxParticles - particles.length);
      const finalAmount = Math.min(amount, availableSlots);

      for (let index = 0; index < finalAmount; index += 1) {
        particles.push(createParticle(point, direction, speed, colour, getSprite));
      }

      canvas.dataset.particleCount = String(particles.length);
    };

    const emitTrail = (
      previousPoint: BrushPoint,
      point: BrushPoint,
      time: number,
    ) => {
      const deltaX = point.x - previousPoint.x;
      const deltaY = point.y - previousPoint.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 0.22) return;

      const elapsed = Math.max(time - previousTime, 4);
      const speed = distance / elapsed * 1000;
      const direction = {
        x: deltaX / distance,
        y: deltaY / distance,
      };
      const steps = Math.max(1, Math.ceil(distance / brushSpacing));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        const distanceAtStep = emittedDistance + distance * progress;
        const colour = getEmissionColour(colourBands, distanceAtStep);
        const speedBoost = speed > 1500 ? 1 : speed > 850 ? 0.8 : 0;

        addParticles(
          {
            x: previousPoint.x + deltaX * progress,
            y: previousPoint.y + deltaY * progress,
          },
          direction,
          speed,
          particlesPerStep + speedBoost,
          colour,
        );
      }

      emittedDistance += distance;
      start();
    };

    const pointerIsInsideFooter = (point: BrushPoint, bounds: DOMRect) => (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );

    const toLocalPoint = (point: BrushPoint, bounds: DOMRect): BrushPoint => ({
      x: point.x - bounds.left,
      y: point.y - bounds.top,
    });

    const handlePointerSample = (event: PointerEvent, bounds: DOMRect) => {
      const clientPoint = { x: event.clientX, y: event.clientY };

      if (!pointerIsInsideFooter(clientPoint, bounds)) {
        previousClientPoint = null;
        previousTime = 0;
        return;
      }

      footerIsVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      const localPoint = toLocalPoint(clientPoint, bounds);

      if (!previousClientPoint) {
        previousClientPoint = clientPoint;
        previousTime = event.timeStamp;
        const colour = getEmissionColour(colourBands, emittedDistance);
        addParticles(localPoint, { x: 1, y: 0 }, 100, entryBurstParticles, colour);
        start();
        return;
      }

      const previousLocalPoint = toLocalPoint(previousClientPoint, bounds);
      emitTrail(previousLocalPoint, localPoint, event.timeStamp);
      previousClientPoint = clientPoint;
      previousTime = event.timeStamp;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const bounds = root.getBoundingClientRect();
      const coalescedEvents = event.getCoalescedEvents?.() ?? [];
      const samples = coalescedEvents.length > 0 ? coalescedEvents : [event];

      // Coalesced pointer samples preserve the smaller movements browsers collect
      // between frames. Combined with spatial interpolation, this removes visible
      // gaps and clumps when the cursor crosses the footer quickly.
      for (const sample of samples) {
        handlePointerSample(sample, bounds);
      }
    };

    const handlePointerExit = () => {
      previousClientPoint = null;
      previousTime = 0;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        start();
        return;
      }

      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      lastFrameTime = 0;
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      dpr = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      footerIsVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      clearCanvas();
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        footerIsVisible = entry.isIntersecting;

        if (footerIsVisible) {
          start();
        } else if (frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
          lastFrameTime = 0;
        }
      },
      { rootMargin: "10% 0px" },
    );

    resizeObserver.observe(root);
    visibilityObserver.observe(footer);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerExit, { passive: true });
    window.addEventListener("blur", handlePointerExit);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerExit);
      window.removeEventListener("blur", handlePointerExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="site-footer__particle-brush" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
