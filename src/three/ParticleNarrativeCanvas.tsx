import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { experienceConfig } from "../config/experience";
import { ParticlePoints } from "./ParticlePoints";
import type { StoryProgressStore } from "./story-progress";

type ParticleNarrativeCanvasProps = {
  active: boolean;
  progressStore: StoryProgressStore;
  onReady: () => void;
  onFailure: () => void;
};

function CanvasLifecycle({
  onReady,
  onFailure,
}: Pick<ParticleNarrativeCanvasProps, "onReady" | "onFailure">) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    onReady();

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [gl, onFailure, onReady]);

  return null;
}

export default function ParticleNarrativeCanvas({
  active,
  progressStore,
  onReady,
  onFailure,
}: ParticleNarrativeCanvasProps) {
  const media = useMemo(
    () =>
      window.matchMedia(
        `(max-width: ${experienceConfig.particles.desktop.minWidth - 1}px)`,
      ),
    [],
  );
  const [mobile, setMobile] = useState(media.matches);

  useEffect(() => {
    const handleChange = () => setMobile(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [media]);
  const profile = useMemo(
    () =>
      mobile
        ? experienceConfig.particles.mobile
        : experienceConfig.particles.desktop,
    [mobile],
  );

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 7.4], fov: 48, near: 0.1, far: 30 }}
      dpr={profile.pixelRatioCap}
      frameloop={active ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: "high-performance",
      }}
    >
      <CanvasLifecycle onReady={onReady} onFailure={onFailure} />
      <ParticlePoints
        profile={profile}
        progressStore={progressStore}
        mobile={mobile}
      />
    </Canvas>
  );
}
