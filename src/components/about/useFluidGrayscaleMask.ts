import { useCallback, useEffect, useRef, type RefObject } from "react";
import { experienceConfig } from "../../config/experience";

type TrailPoint = {
  x: number;
  y: number;
  life: number;
  radius: number;
  driftX: number;
  driftY: number;
};

type PointerPosition = { x: number; y: number };

type RippleWave = PointerPosition & {
  life: number;
  strength: number;
};

const portraitHoverConfig = experienceConfig.particles.aboutPortrait.hoverReveal;
const MAX_TRAIL_POINTS = 40;
const MAX_RIPPLE_WAVES = portraitHoverConfig.maxRipples;
const RIPPLE_CIRCLES_PER_WAVE = 3;
export const RIPPLE_CIRCLE_COUNT = MAX_RIPPLE_WAVES * RIPPLE_CIRCLES_PER_WAVE;
const MASK_HEIGHT = 125;

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function seededVariation(value: number) {
  const wave = Math.sin(value * 12.9898) * 43758.5453;
  return wave - Math.floor(wave);
}

export function useFluidGrayscaleMask(
  interactionRef: RefObject<HTMLDivElement | null>,
  coordinateRef: RefObject<HTMLDivElement | null>,
  trailRef: RefObject<SVGGElement | null>,
  rippleRef: RefObject<SVGGElement | null>,
) {
  const pointsRef = useRef<TrailPoint[]>([]);
  const ripplesRef = useRef<RippleWave[]>([]);
  const lastPointerRef = useRef<PointerPosition | null>(null);
  const lastRipplePointerRef = useRef<PointerPosition | null>(null);
  const lastRippleTimeRef = useRef(0);
  const pointerActiveRef = useRef(false);
  const frameRequestRef = useRef(0);
  const previousTimeRef = useRef(0);
  const pointIdentityRef = useRef(0);

  const render = useCallback((time: number) => {
    frameRequestRef.current = 0;
    const trail = trailRef.current;
    const rippleLayer = rippleRef.current;
    if (!trail || !rippleLayer) return;

    const elapsed = previousTimeRef.current ? Math.min(34, time - previousTimeRef.current) : 16;
    previousTimeRef.current = time;

    for (let index = pointsRef.current.length - 1; index >= 0; index -= 1) {
      const point = pointsRef.current[index];
      point.x += point.driftX * elapsed;
      point.y += point.driftY * elapsed;
      point.life -= elapsed / portraitHoverConfig.trailDecayMs;
      if (point.life <= 0.01) pointsRef.current.splice(index, 1);
    }

    for (let index = ripplesRef.current.length - 1; index >= 0; index -= 1) {
      const ripple = ripplesRef.current[index];
      ripple.life -= elapsed / portraitHoverConfig.rippleDurationMs;
      if (ripple.life <= 0.01) ripplesRef.current.splice(index, 1);
    }

    const anchor = pointerActiveRef.current ? lastPointerRef.current : null;
    if (anchor && time - lastRippleTimeRef.current > portraitHoverConfig.stationaryRippleIntervalMs) {
      ripplesRef.current.unshift({ ...anchor, life: 1, strength: 0.82 });
      if (ripplesRef.current.length > MAX_RIPPLE_WAVES) {
        ripplesRef.current.length = MAX_RIPPLE_WAVES;
      }
      lastRippleTimeRef.current = time;
    }

    const rippleCircles = rippleLayer.children;
    for (let index = 0; index < rippleCircles.length; index += 1) {
      const circle = rippleCircles[index] as SVGCircleElement;
      const ripple = ripplesRef.current[Math.floor(index / RIPPLE_CIRCLES_PER_WAVE)];
      if (!ripple) {
        circle.setAttribute("opacity", "0");
        continue;
      }

      const band = index % RIPPLE_CIRCLES_PER_WAVE;
      const progress = 1 - clamp(ripple.life);
      const expansion = 1 - (1 - progress) ** 3;
      const rippleFadeIn = clamp(progress / 0.16);
      const rippleFadeOut = (1 - progress) ** 0.55;
      const bandRadius = portraitHoverConfig.rippleRadii[band];
      const bandOpacity = portraitHoverConfig.rippleOpacities[band];
      circle.setAttribute("cx", (ripple.x * 100).toFixed(2));
      circle.setAttribute("cy", (ripple.y * MASK_HEIGHT).toFixed(2));
      circle.setAttribute("r", (2.5 + expansion * bandRadius).toFixed(2));
      circle.setAttribute(
        "opacity",
        (bandOpacity * ripple.strength * rippleFadeIn * rippleFadeOut).toFixed(3),
      );
    }

    const circles = trail.children;
    for (let index = 0; index < circles.length; index += 1) {
      const circle = circles[index] as SVGCircleElement;
      if (index === 0 && anchor) {
        circle.setAttribute("cx", (anchor.x * 100).toFixed(2));
        circle.setAttribute("cy", (anchor.y * MASK_HEIGHT).toFixed(2));
        circle.setAttribute("r", "11.8");
        circle.setAttribute("opacity", "1");
        continue;
      }

      const point = pointsRef.current[index - (anchor ? 1 : 0)];
      if (!point) {
        circle.setAttribute("opacity", "0");
        continue;
      }

      const easedLife = clamp(point.life) ** 0.72;
      circle.setAttribute("cx", (point.x * 100).toFixed(2));
      circle.setAttribute("cy", (point.y * MASK_HEIGHT).toFixed(2));
      circle.setAttribute("r", (point.radius * (0.82 + easedLife * 0.18)).toFixed(2));
      circle.setAttribute("opacity", easedLife.toFixed(3));
    }

    if (pointerActiveRef.current || pointsRef.current.length || ripplesRef.current.length) {
      frameRequestRef.current = requestAnimationFrame(render);
    } else {
      previousTimeRef.current = 0;
    }
  }, [rippleRef, trailRef]);

  const ensureAnimation = useCallback(() => {
    if (!frameRequestRef.current) frameRequestRef.current = requestAnimationFrame(render);
  }, [render]);

  const addPoint = useCallback((position: PointerPosition) => {
    pointIdentityRef.current += 1;
    const identity = pointIdentityRef.current;
    const horizontalVariation = seededVariation(identity * 1.71);
    const verticalVariation = seededVariation(identity * 3.19);
    pointsRef.current.unshift({
      x: clamp(position.x + (horizontalVariation - 0.5) * 0.018),
      y: clamp(position.y + (verticalVariation - 0.5) * 0.014),
      life: 1,
      radius: 8.4 + horizontalVariation * 4.8,
      driftX: (horizontalVariation - 0.5) * 0.000006,
      driftY: (verticalVariation - 0.58) * 0.000005,
    });
    if (pointsRef.current.length > MAX_TRAIL_POINTS) pointsRef.current.length = MAX_TRAIL_POINTS;
  }, []);

  const samplePointer = useCallback((event: PointerEvent) => {
    const coordinateSpace = coordinateRef.current;
    if (!coordinateSpace) return { x: 0.5, y: 0.5 };
    const bounds = coordinateSpace.getBoundingClientRect();
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    };
  }, [coordinateRef]);

  const startTrail = useCallback((event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    pointerActiveRef.current = true;
    const position = samplePointer(event);
    lastPointerRef.current = position;
    lastRipplePointerRef.current = position;
    lastRippleTimeRef.current = event.timeStamp;
    ripplesRef.current.unshift({ ...position, life: 1, strength: 1 });
    if (ripplesRef.current.length > MAX_RIPPLE_WAVES) {
      ripplesRef.current.length = MAX_RIPPLE_WAVES;
    }
    addPoint(position);
    addPoint(position);
    ensureAnimation();
  }, [addPoint, ensureAnimation, samplePointer]);

  const moveTrail = useCallback((event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (!pointerActiveRef.current) {
      startTrail(event);
      return;
    }

    const position = samplePointer(event);
    const previous = lastPointerRef.current ?? position;
    const distance = Math.hypot(position.x - previous.x, position.y - previous.y);
    const samples = Math.max(1, Math.min(7, Math.ceil(distance / 0.022)));
    for (let index = 1; index <= samples; index += 1) {
      const progress = index / samples;
      addPoint({
        x: previous.x + (position.x - previous.x) * progress,
        y: previous.y + (position.y - previous.y) * progress,
      });
    }
    const previousRipple = lastRipplePointerRef.current ?? position;
    if (
      Math.hypot(position.x - previousRipple.x, position.y - previousRipple.y)
      > portraitHoverConfig.movementRippleThreshold
    ) {
      ripplesRef.current.unshift({ ...position, life: 1, strength: 0.9 });
      if (ripplesRef.current.length > MAX_RIPPLE_WAVES) {
        ripplesRef.current.length = MAX_RIPPLE_WAVES;
      }
      lastRipplePointerRef.current = position;
      lastRippleTimeRef.current = event.timeStamp;
    }
    lastPointerRef.current = position;
    ensureAnimation();
  }, [addPoint, ensureAnimation, samplePointer, startTrail]);

  const endTrail = useCallback(() => {
    pointerActiveRef.current = false;
    lastPointerRef.current = null;
    lastRipplePointerRef.current = null;
    ensureAnimation();
  }, [ensureAnimation]);

  useEffect(() => {
    const frame = interactionRef.current;
    const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    if (!frame || !finePointer.matches) return;

    frame.addEventListener("pointerenter", startTrail, { passive: true });
    frame.addEventListener("pointermove", moveTrail, { passive: true });
    frame.addEventListener("pointerleave", endTrail, { passive: true });

    return () => {
      frame.removeEventListener("pointerenter", startTrail);
      frame.removeEventListener("pointermove", moveTrail);
      frame.removeEventListener("pointerleave", endTrail);
      cancelAnimationFrame(frameRequestRef.current);
      frameRequestRef.current = 0;
      pointsRef.current = [];
      ripplesRef.current = [];
    };
  }, [endTrail, interactionRef, moveTrail, startTrail]);
}
