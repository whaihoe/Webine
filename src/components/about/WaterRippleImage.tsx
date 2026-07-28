import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DEFAULT_WATER_RIPPLE_SETTINGS } from "./water-ripple/constants";
import type { WaterRippleImageProps } from "./water-ripple/types";
import { WaterRipplePlane } from "./water-ripple/WaterRipplePlane";

export type { WaterRippleImageProps } from "./water-ripple/types";

export function WaterRippleImage({
  src,
  alt,
  className = "",
  aspectRatio = "1122 / 1402",
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
  const [interactive, setInteractive] = useState(false);
  const handleCanvasReady = useCallback(() => setCanvasReady(true), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "20% 0px" },
    );
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(any-hover: hover) and (any-pointer: fine)",
    );
    const update = () => setInteractive(finePointer.matches);

    update();
    finePointer.addEventListener("change", update);
    return () => finePointer.removeEventListener("change", update);
  }, []);

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

      <Canvas
        className="water-ripple-image__canvas"
        orthographic
        flat
        frameloop={interactive ? (visible ? "always" : "never") : "demand"}
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.NoToneMapping;
          gl.setClearColor(0x000000, 0);
        }}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <WaterRipplePlane
            src={src}
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
            disabled={!interactive}
            onReady={handleCanvasReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
