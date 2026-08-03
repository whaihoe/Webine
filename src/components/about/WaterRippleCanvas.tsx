import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import type { WaterRipplePlaneProps } from "./water-ripple/types";
import { WaterRipplePlane } from "./water-ripple/WaterRipplePlane";

type WaterRippleCanvasProps = Omit<WaterRipplePlaneProps, "disabled"> & {
  visible: boolean;
};

export function WaterRippleCanvas({ visible, ...rippleProps }: WaterRippleCanvasProps) {
  return (
    <Canvas
      className="water-ripple-image__canvas"
      orthographic
      flat
      frameloop={visible ? "always" : "never"}
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
        <WaterRipplePlane {...rippleProps} disabled={false} />
      </Suspense>
    </Canvas>
  );
}
