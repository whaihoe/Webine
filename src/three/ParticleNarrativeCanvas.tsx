import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { experienceConfig } from "../config/experience";
import {
  loadParticleModel,
  sampleParticleModelSurface,
} from "./particle-model-target";
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

function MobileDemandFrameLoop({
  active,
  frameRate,
}: {
  active: boolean;
  frameRate: number;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();

    if (!active) {
      return;
    }

    const frameInterval = 1000 / frameRate;
    let frame = 0;
    let lastFrameAt = 0;

    const tick = (timestamp: number) => {
      if (timestamp - lastFrameAt >= frameInterval) {
        lastFrameAt = timestamp;
        invalidate();
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, frameRate, invalidate]);

  return null;
}

function CanvasLifecycle({
  onFailure,
}: Pick<ParticleNarrativeCanvasProps, "onFailure">) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
    };
  }, [gl, onFailure]);

  return null;
}

export default function ParticleNarrativeCanvas({
  active,
  progressStore,
  onReady,
  onFailure,
}: ParticleNarrativeCanvasProps) {
  const [layout, setLayout] = useState<ParticleLayout>(getParticleLayout);
  const [closingModel, setClosingModel] = useState<Awaited<
    ReturnType<typeof loadParticleModel>
  > | null>(null);

  useEffect(() => {
    const handleResize = () => setLayout(getParticleLayout());
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const modelConfig = experienceConfig.particles.closingModel;

    loadParticleModel(modelConfig.url)
      .then((model) => {
        if (!cancelled) {
          setClosingModel(model);
        }
      })
      .catch((error: unknown) => {
        console.error("Webine particle model failed to load.", error);

        if (!cancelled) {
          onFailure();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onFailure]);

  const profile = useMemo(
    () => experienceConfig.particles[layout],
    [layout],
  );
  const closingTarget = useMemo(() => {
    if (!closingModel) {
      return null;
    }

    return sampleParticleModelSurface(
      closingModel,
      profile.count,
      experienceConfig.particles.closingModel,
    );
  }, [closingModel, profile.count]);
  const isMobile = layout === "mobile";

  if (!closingTarget) {
    return null;
  }

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0, 7.4], fov: 48, near: 0.1, far: 30 }}
      dpr={profile.pixelRatioCap}
      frameloop={isMobile ? "demand" : active ? "always" : "never"}
      gl={{
        alpha: true,
        antialias: false,
        failIfMajorPerformanceCaveat: true,
        powerPreference: "high-performance",
      }}
    >
      <CanvasLifecycle onFailure={onFailure} />
      {isMobile ? (
        <MobileDemandFrameLoop
          active={active}
          frameRate={profile.maxFrameRate}
        />
      ) : null}
      <ParticlePoints
        profile={profile}
        progressStore={progressStore}
        layout={layout}
        closingTarget={closingTarget}
        onReady={onReady}
      />
    </Canvas>
  );
}
