import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DEFAULT_WATER_RIPPLE_SETTINGS } from "./water-ripple/constants";
import type { WaterRippleImageProps } from "./water-ripple/types";

const WaterRippleCanvas = lazy(() =>
  import("./WaterRippleCanvas").then((module) => ({ default: module.WaterRippleCanvas })));
const INTERACTIVE_RIPPLE_QUERY = "(min-width: 48rem) and (any-hover: hover) and (any-pointer: fine)";

export type { WaterRippleImageProps } from "./water-ripple/types";

export function WaterRippleImage({
  src,
  alt,
  className = "",
  aspectRatio = "1122 / 1402",
  overlay,
  strength = DEFAULT_WATER_RIPPLE_SETTINGS.strength,
  radius = DEFAULT_WATER_RIPPLE_SETTINGS.radius,
  damping = DEFAULT_WATER_RIPPLE_SETTINGS.damping,
  propagation = DEFAULT_WATER_RIPPLE_SETTINGS.propagation,
  speedThreshold = DEFAULT_WATER_RIPPLE_SETTINGS.speedThreshold,
  fullStrengthSpeed = DEFAULT_WATER_RIPPLE_SETTINGS.fullStrengthSpeed,
  edgeDisplacement = DEFAULT_WATER_RIPPLE_SETTINGS.edgeDisplacement,
  greyScale = DEFAULT_WATER_RIPPLE_SETTINGS.greyScale,
  colorRevealRadius = DEFAULT_WATER_RIPPLE_SETTINGS.colorRevealRadius,
  colorRevealDecay = DEFAULT_WATER_RIPPLE_SETTINGS.colorRevealDecay,
  colorRevealShrink = DEFAULT_WATER_RIPPLE_SETTINGS.colorRevealShrink,
}: WaterRippleImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const interactive = useMediaQuery(INTERACTIVE_RIPPLE_QUERY);
  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);

  useEffect(() => {
    if (!interactive) {
      setVisible(false);
      setCanvasReady(false);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "20% 0px" },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, [interactive]);

  return (
    <div
      ref={rootRef}
      className={`water-ripple-image ${className}`.trim()}
      style={{ aspectRatio }}
      role="img"
      aria-label={alt}
    >
      <div
        className={`water-ripple-image__fallback-frame${
          canvasReady ? " water-ripple-image__fallback-frame--hidden" : ""
        }`}
        aria-hidden="true"
      >
        <img
          className={`water-ripple-image__fallback${
            greyScale ? " water-ripple-image__fallback--greyscale" : ""
          }`}
          src={src}
          alt=""
          width="1122"
          height="1402"
          loading="lazy"
          decoding="async"
          draggable="false"
        />
      </div>

      {interactive ? (
        <Suspense fallback={null}>
          <WaterRippleCanvas
            src={src}
            visible={visible}
            strength={strength}
            radius={radius}
            damping={damping}
            propagation={propagation}
            speedThreshold={speedThreshold}
            fullStrengthSpeed={fullStrengthSpeed}
            edgeDisplacement={edgeDisplacement}
            greyScale={greyScale}
            colorRevealRadius={colorRevealRadius}
            colorRevealDecay={colorRevealDecay}
            colorRevealShrink={colorRevealShrink}
            onReady={handleCanvasReady}
          />
        </Suspense>
      ) : null}
      {overlay}
    </div>
  );
}
