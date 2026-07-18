import { useEffect, useRef, useState } from "react";
import { experienceConfig } from "../../config/experience";
import {
  getMobileParticleTarget,
  loadMobileSectionParticleTargets,
  type MobileParticleSceneId,
  type MobileSectionParticleTargets,
} from "../../three/mobile-section-particle-targets";
import type { StoryProgressSnapshot } from "../../three/story-progress";
import { useParticleController } from "./ParticleSceneController";

const MOBILE_QUERY = `(max-width: ${experienceConfig.particles.mobile.maxWidth}px)`;
const MOBILE_PARTICLE_DPR = 1;
const MOBILE_AMBIENT_FRAME_RATE = 24;

type PreparedParticleTarget = {
  targetX: Float32Array;
  targetY: Float32Array;
  targetZ: Float32Array;
  scatterX: Float32Array;
  scatterY: Float32Array;
  colourBucket: Uint8Array;
  scale: number;
};

type MobileSectionParticlesProps = {
  scene: MobileParticleSceneId;
};

function smoothstep(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function getFormationStrength(
  snapshot: StoryProgressSnapshot,
  scene: MobileParticleSceneId,
) {
  const motion = snapshot.sceneMotionProgress[scene];
  const rawFormation = scene === "hero"
    ? snapshot.introProgress
    : motion.formation;
  const formation = scene === "closing"
    ? Math.min(rawFormation / 0.35, 1)
    : rawFormation;
  const rawDispersion = scene === "hero"
    ? Math.max(
        motion.dispersion,
        snapshot.sceneMotionProgress.reach.formation,
      )
    : motion.dispersion;
  const delayedDispersion = scene === "hero"
    ? rawDispersion
    : Math.min(
        Math.max((rawDispersion - 0.18) / 0.82, 0),
        1,
      );

  return smoothstep(formation) * (1 - smoothstep(delayedDispersion));
}

function prepareTarget(
  buffers: MobileSectionParticleTargets,
  scene: MobileParticleSceneId,
  width: number,
  height: number,
): PreparedParticleTarget {
  const target = getMobileParticleTarget(buffers, scene);
  const count = target.length / 3;
  const targetX = new Float32Array(count);
  const targetY = new Float32Array(count);
  const targetZ = new Float32Array(count);
  const scatterX = new Float32Array(count);
  const scatterY = new Float32Array(count);
  const colourBucket = new Uint8Array(count);
  let minRawX = Number.POSITIVE_INFINITY;
  let maxRawX = Number.NEGATIVE_INFINITY;
  let minRawY = Number.POSITIVE_INFINITY;
  let maxRawY = Number.NEGATIVE_INFINITY;
  let minRawZ = Number.POSITIVE_INFINITY;
  let maxRawZ = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    minRawX = Math.min(minRawX, target[offset]);
    maxRawX = Math.max(maxRawX, target[offset]);
    minRawY = Math.min(minRawY, target[offset + 1]);
    maxRawY = Math.max(maxRawY, target[offset + 1]);
    minRawZ = Math.min(minRawZ, target[offset + 2]);
    maxRawZ = Math.max(maxRawZ, target[offset + 2]);
  }

  const centreX = (minRawX + maxRawX) * 0.5;
  const centreY = (minRawY + maxRawY) * 0.5;
  const centreZ = (minRawZ + maxRawZ) * 0.5;
  let minProjectedX = Number.POSITIVE_INFINITY;
  let maxProjectedX = Number.NEGATIVE_INFINITY;
  let minProjectedY = Number.POSITIVE_INFINITY;
  let maxProjectedY = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const x = target[offset] - centreX;
    const y = target[offset + 1] - centreY;
    const z = target[offset + 2] - centreZ;
    const perspective = 6 / Math.max(3.5, 6 - z * 0.45);
    const projectedX = x * perspective;
    const projectedY = y * perspective;

    targetX[index] = x;
    targetY[index] = y;
    targetZ[index] = z;
    minProjectedX = Math.min(minProjectedX, projectedX);
    maxProjectedX = Math.max(maxProjectedX, projectedX);
    minProjectedY = Math.min(minProjectedY, projectedY);
    maxProjectedY = Math.max(maxProjectedY, projectedY);
  }

  const targetWidth = Math.max(maxProjectedX - minProjectedX, 0.001);
  const targetHeight = Math.max(maxProjectedY - minProjectedY, 0.001);
  const fitWidth = scene === "closing" ? width * (64 / 112) : width;
  const fitHeight = scene === "closing" ? height * (36 / 64) : height;
  const padding = Math.min(fitWidth, fitHeight) * 0.08;
  const scale = Math.min(
    (fitWidth - padding * 2) / targetWidth,
    (fitHeight - padding * 2) / targetHeight,
  );
  const scatterScale = Math.min(width, height) * 0.22;

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const x = target[offset] - centreX;
    const y = target[offset + 1] - centreY;
    const z = target[offset + 2] - centreZ;
    const perspective = 6 / Math.max(3.5, 6 - z * 0.45);
    const normalisedX = (x * perspective - minProjectedX) / targetWidth;
    const normalisedY = (y * perspective - minProjectedY) / targetHeight;
    const gradient = 0.12 +
      (normalisedX * 0.68 + (1 - normalisedY) * 0.32) * 0.76;
    colourBucket[index] = hash01(buffers.randomness[index] * 17.3) < gradient
      ? 1
      : 0;
    scatterX[index] = width * 0.5 + buffers.scatter[offset] * scatterScale;
    scatterY[index] = height * 0.5 - buffers.scatter[offset + 1] * scatterScale;
  }

  return {
    targetX,
    targetY,
    targetZ,
    scatterX,
    scatterY,
    colourBucket,
    scale,
  };
}

function hash01(value: number) {
  const sine = Math.sin(value) * 43758.5453123;
  return sine - Math.floor(sine);
}

function getParticleColours() {
  const styles = getComputedStyle(document.documentElement);
  const getColour = (token: string, fallback: string) => {
    const value = styles.getPropertyValue(token).trim();
    const channels = value.split(/\s+/);

    if (channels.length !== 3 || channels.some((channel) => !channel)) {
      return fallback;
    }

    return `hsl(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  };

  return [
    getColour("--primitive-cyan-400", "hsl(188, 86%, 53%)"),
    getColour("--primitive-blue-500", "hsl(217, 91%, 60%)"),
  ] as const;
}

function smoothstepRange(edgeStart: number, edgeEnd: number, value: number) {
  return smoothstep((value - edgeStart) / Math.max(edgeEnd - edgeStart, 0.001));
}

function getTimelineFlowProgress(snapshot: StoryProgressSnapshot) {
  return Math.min(Math.max(snapshot.timelineIntakeProgress, 0), 1);
}

export function MobileTimelineFlowParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { store } = useParticleController();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      canvas.dataset.mobileParticleState = "context-error";
      return;
    }

    const activeCanvas = canvas;
    const drawingContext = context;
    let cancelled = false;
    let drawFrame = 0;
    let lastProgress = Number.NaN;
    let buffers: MobileSectionParticleTargets | null = null;
    const colours = getParticleColours();

    function draw() {
      drawFrame = 0;

      if (cancelled || !buffers) {
        return;
      }

      const width = activeCanvas.width / MOBILE_PARTICLE_DPR;
      const height = activeCanvas.height / MOBILE_PARTICLE_DPR;
      const progress = getTimelineFlowProgress(store.getSnapshot());
      const centreX = width * 0.5;
      const centreY = height * 0.5;
      const scatterRadiusX = width * 0.49;
      const scatterRadiusY = height * 0.48;
      const pointSize = experienceConfig.particles.mobile.pointSize;
      const count = Math.floor(
        buffers.randomness.length * experienceConfig.particles.mobile.renderRatio,
      );
      lastProgress = progress;

      drawingContext.setTransform(
        MOBILE_PARTICLE_DPR,
        0,
        0,
        MOBILE_PARTICLE_DPR,
        0,
        0,
      );
      drawingContext.clearRect(0, 0, width, height);

      for (let bucket = 0; bucket < colours.length; bucket += 1) {
        drawingContext.fillStyle = colours[bucket];

        for (let index = 0; index < count; index += 1) {
          const randomness = hash01(buffers.randomness[index] * 41.7);
          const colourBucket = randomness < 0.5 ? 0 : 1;

          if (colourBucket !== bucket) {
            continue;
          }

          const contactThreshold = 0.5 + randomness * 0.42;
          const gatherProgress = smoothstepRange(
            0.04,
            contactThreshold,
            progress,
          );
          const contactProgress = smoothstepRange(
            contactThreshold - 0.018,
            contactThreshold + 0.018,
            progress,
          );
          const angle = hash01(randomness * 173.1 + index * 1.37) * Math.PI * 2;
          const radius = 0.3 +
            Math.sqrt(hash01(randomness * 91.7 + index * 0.73)) * 0.68;
          const startX = centreX + Math.cos(angle) * scatterRadiusX * radius;
          const startY = centreY + Math.sin(angle) * scatterRadiusY * radius;
          const curve = Math.sin(gatherProgress * Math.PI) *
            (randomness - 0.5) * Math.min(width, height) * 0.08;
          const x = startX + (centreX - startX) * gatherProgress -
            Math.sin(angle) * curve;
          const y = startY + (centreY - startY) * gatherProgress +
            Math.cos(angle) * curve;
          const alpha = 0.82 * (1 - contactProgress);
          const size = pointSize * (0.72 + randomness * 0.36);

          if (alpha <= 0.01) {
            continue;
          }

          drawingContext.globalAlpha = alpha;
          drawingContext.fillRect(x, y, size, size);
        }
      }

      drawingContext.globalAlpha = 1;
      activeCanvas.dataset.mobileParticleState = "live";
    }

    function scheduleDraw() {
      if (!drawFrame) {
        drawFrame = window.requestAnimationFrame(draw);
      }
    }

    function resizeCanvas() {
      const rect = activeCanvas.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const height = Math.max(Math.round(rect.height), 1);

      activeCanvas.width = Math.round(width * MOBILE_PARTICLE_DPR);
      activeCanvas.height = Math.round(height * MOBILE_PARTICLE_DPR);

      if (buffers) {
        draw();
      }
    }

    function handleProgressChange() {
      const progress = getTimelineFlowProgress(store.getSnapshot());

      if (
        Number.isNaN(lastProgress) ||
        Math.abs(progress - lastProgress) > 0.001
      ) {
        scheduleDraw();
      }
    }

    activeCanvas.dataset.mobileParticleState = "loading";
    const resizeObserver = new ResizeObserver(resizeCanvas);
    const unsubscribe = store.subscribe(handleProgressChange);

    resizeObserver.observe(activeCanvas);
    resizeCanvas();

    loadMobileSectionParticleTargets(experienceConfig.particles.mobile.count)
      .then((loadedBuffers) => {
        if (cancelled) {
          return;
        }

        buffers = loadedBuffers;
        activeCanvas.dataset.mobileParticleState = "loaded";
        resizeCanvas();
      })
      .catch((error: unknown) => {
        activeCanvas.dataset.mobileParticleState = "load-error";
        console.error("Webine mobile timeline particles could not load.", error);
      });

    return () => {
      cancelled = true;
      unsubscribe();
      resizeObserver.disconnect();

      if (drawFrame) {
        window.cancelAnimationFrame(drawFrame);
      }
    };
  }, [isMobile, store]);

  if (!isMobile) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="mobile-timeline-flow-particles"
      data-mobile-particle-scene="process-intake"
      aria-hidden="true"
    />
  );
}

export function MobileSectionParticles({
  scene,
}: MobileSectionParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { store } = useParticleController();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(media.matches);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const activeCanvas = canvas;
    const context = activeCanvas.getContext("2d", { alpha: true });

    if (!context) {
      activeCanvas.dataset.mobileParticleState = "context-error";
      return;
    }

    const drawingContext = context;
    let cancelled = false;
    let drawFrame = 0;
    let lastStrength = Number.NaN;
    let buffers: MobileSectionParticleTargets | null = null;
    let projection: PreparedParticleTarget | null = null;
    let ambientTimer = 0;
    let scrollRotation = 0;
    let lastScrollY = window.scrollY;
    const colours = getParticleColours();
    const ambientMotion = experienceConfig.particles.ambientMotion;
    const ambientFrameInterval = 1000 / MOBILE_AMBIENT_FRAME_RATE;

    function isNearViewport() {
      const rect = activeCanvas.getBoundingClientRect();
      return (
        rect.bottom > -window.innerHeight * 0.25 &&
        rect.top < window.innerHeight * 1.25
      );
    }

    function scheduleDraw() {
      if (!drawFrame) {
        drawFrame = window.requestAnimationFrame(draw);
      }
    }

    function scheduleAmbientDraw() {
      if (ambientTimer || cancelled) {
        return;
      }

      ambientTimer = window.setTimeout(() => {
        ambientTimer = 0;
        scheduleDraw();
      }, ambientFrameInterval);
    }

    function draw(timestamp = performance.now()) {
      drawFrame = 0;

      if (cancelled || !buffers || !projection) {
        return;
      }

      const width = activeCanvas.width / MOBILE_PARTICLE_DPR;
      const height = activeCanvas.height / MOBILE_PARTICLE_DPR;
      const strength = getFormationStrength(store.getSnapshot(), scene);
      const targetBlend = 1 - Math.pow(1 - strength, 2.4);
      const pointSize = experienceConfig.particles.mobile.pointSize;
      const count = Math.floor(
        projection.targetX.length * experienceConfig.particles.mobile.renderRatio,
      );
      const elapsed = timestamp / 1000;
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.max(-120, Math.min(120, currentScrollY - lastScrollY));
      scrollRotation = Math.max(
        -ambientMotion.scrollRotationLimit,
        Math.min(
          ambientMotion.scrollRotationLimit,
          scrollRotation + scrollDelta * 0.00072,
        ),
      );
      scrollRotation *= 0.982;
      lastScrollY = currentScrollY;
      const closingRotationScale = scene === "closing"
        ? experienceConfig.particles.closingModel.ambientRotationScale
        : 1;
      const rotationX = Math.sin(elapsed * 0.2) *
        ambientMotion.rotationX * closingRotationScale * strength;
      const rotationPhase = elapsed *
        ((Math.PI * 2) / ambientMotion.fullRotationSeconds);
      const rotationY = Math.sin(rotationPhase) *
        ambientMotion.rotationY * closingRotationScale * strength + scrollRotation;
      const rotationZ = Math.cos(elapsed * 0.13) *
        ambientMotion.rotationZ * closingRotationScale * strength + scrollRotation * 0.12;
      const sinX = Math.sin(rotationX);
      const cosX = Math.cos(rotationX);
      const sinY = Math.sin(rotationY);
      const cosY = Math.cos(rotationY);
      const sinZ = Math.sin(rotationZ);
      const cosZ = Math.cos(rotationZ);
      const floatY = Math.sin(elapsed * 0.34) *
        ambientMotion.floatY * projection.scale * strength;
      const floatZ = Math.cos(elapsed * 0.27) *
        ambientMotion.floatZ * strength;
      lastStrength = strength;

      drawingContext.setTransform(
        MOBILE_PARTICLE_DPR,
        0,
        0,
        MOBILE_PARTICLE_DPR,
        0,
        0,
      );
      drawingContext.clearRect(0, 0, width, height);

      for (let bucket = 0; bucket < colours.length; bucket += 1) {
        drawingContext.fillStyle = colours[bucket];
        drawingContext.globalAlpha = 0.34 + strength * 0.62;

        for (let index = 0; index < count; index += 1) {
          const identity = buffers.randomness[index];
          const colourShift = Math.sin(
            elapsed * experienceConfig.particles.mobile.colourCycleSpeed + identity * 10.7,
          );
          const baseBucket = projection.colourBucket[index];
          const dynamicBucket = colourShift > 0.84 ? 1 - baseBucket : baseBucket;
          if (dynamicBucket !== bucket) {
            continue;
          }

          const sourceX = projection.targetX[index];
          const sourceY = projection.targetY[index];
          const sourceZ = projection.targetZ[index];
          const rotatedX = sourceX * cosY + sourceZ * sinY;
          const rotatedZFromY = -sourceX * sinY + sourceZ * cosY;
          const rotatedY = sourceY * cosX - rotatedZFromY * sinX;
          const rotatedZ = sourceY * sinX + rotatedZFromY * cosX;
          const finalX = rotatedX * cosZ - rotatedY * sinZ;
          const finalY = rotatedX * sinZ + rotatedY * cosZ;
          const perspective = 6 / Math.max(
            3.5,
            6 - (rotatedZ + floatZ) * 0.45,
          );
          const targetX = width * 0.5 +
            finalX * perspective * projection.scale;
          const targetY = height * 0.5 -
            finalY * perspective * projection.scale + floatY;
          const mobility = identity * identity;
          const electronRate = 0.23 + identity * 0.86;
          const electronPhase = identity * Math.PI * 10 + index * 0.017;
          const electronAmplitude = (0.55 + mobility * experienceConfig.particles.mobile.electronDrift) *
            (0.74 + (1 - strength) * 0.62);
          const objectLooseness = experienceConfig.particles.mobile.objectLooseness * targetBlend;
          const spreadX = Math.sin(identity * 91.73 + index * 0.013) * objectLooseness;
          const spreadY = Math.cos(identity * 67.19 + index * 0.009) * objectLooseness * 0.82;
          const electronX = (
            Math.sin(elapsed * electronRate + electronPhase)
            + Math.sin(elapsed * electronRate * 0.31 + electronPhase * 1.61) * 0.38
          ) * electronAmplitude;
          const electronY = (
            Math.cos(elapsed * electronRate * 0.73 + electronPhase * 1.27)
            + Math.sin(elapsed * electronRate * 0.27 + electronPhase * 0.73) * 0.34
          ) * electronAmplitude * 0.78;
          const x = projection.scatterX[index] +
            (targetX - projection.scatterX[index]) * targetBlend + spreadX + electronX;
          const y = projection.scatterY[index] +
            (targetY - projection.scatterY[index]) * targetBlend + spreadY + electronY;
          const size = pointSize *
            (0.72 + buffers.randomness[index] * 0.36);
          drawingContext.fillRect(x, y, size, size);
        }
      }

      drawingContext.globalAlpha = 1;
      activeCanvas.dataset.mobileParticleState = "live";

      if (
        strength > 0.02 &&
        isNearViewport() &&
        document.visibilityState === "visible"
      ) {
        scheduleAmbientDraw();
      }
    }

    function resizeCanvas() {
      const rect = activeCanvas.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const height = Math.max(Math.round(rect.height), 1);
      const pixelWidth = Math.round(width * MOBILE_PARTICLE_DPR);
      const pixelHeight = Math.round(height * MOBILE_PARTICLE_DPR);

      if (activeCanvas.width !== pixelWidth) {
        activeCanvas.width = pixelWidth;
      }

      if (activeCanvas.height !== pixelHeight) {
        activeCanvas.height = pixelHeight;
      }

      if (buffers) {
        projection = prepareTarget(buffers, scene, width, height);
        draw();
      }
    }

    function handleProgressChange() {
      const strength = getFormationStrength(store.getSnapshot(), scene);

      if (
        Number.isNaN(lastStrength) ||
        Math.abs(strength - lastStrength) > 0.001
      ) {
        scheduleDraw();
      }
    }

    activeCanvas.dataset.mobileParticleState = "loading";
    const resizeObserver = new ResizeObserver(resizeCanvas);
    const unsubscribe = store.subscribe(handleProgressChange);

    resizeObserver.observe(activeCanvas);
    resizeCanvas();

    loadMobileSectionParticleTargets(experienceConfig.particles.mobile.count)
      .then((loadedBuffers) => {
        if (cancelled) {
          return;
        }

        buffers = loadedBuffers;
        activeCanvas.dataset.mobileParticleState = "loaded";
        resizeCanvas();
      })
      .catch((error: unknown) => {
        activeCanvas.dataset.mobileParticleState = "load-error";
        console.error("Webine mobile section particles could not load.", error);
      });

    return () => {
      cancelled = true;
      unsubscribe();
      resizeObserver.disconnect();

      if (drawFrame) {
        window.cancelAnimationFrame(drawFrame);
        drawFrame = 0;
      }

      if (ambientTimer) {
        window.clearTimeout(ambientTimer);
        ambientTimer = 0;
      }
    };
  }, [isMobile, scene, store]);

  if (!isMobile) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`mobile-section-particles mobile-section-particles--${scene}`}
      data-mobile-particle-scene={scene}
      aria-hidden="true"
    />
  );
}
