import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { experienceConfig } from "../config/experience";
import { ParticlePoints } from "./ParticlePoints";
import type { StoryProgressStore } from "./story-progress";

type ParticleLayout = "mobile" | "tablet" | "desktop";

function getParticleLayout(): ParticleLayout {
  if (window.innerWidth <= experienceConfig.particles.mobile.maxWidth) {
    return "mobile";
  }

  if (window.innerWidth < experienceConfig.particles.desktop.minWidth) {
    return "tablet";
  }

  return "desktop";
}

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
  const [layout, setLayout] = useState<ParticleLayout>(getParticleLayout);

  useEffect(() => {
    const handleResize = () => setLayout(getParticleLayout());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);
  const profile = useMemo(
    () => experienceConfig.particles[layout],
    [layout],
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
        layout={layout}
      />
    </Canvas>
  );
}
