import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { experienceConfig } from "../config/experience";
import {
  loadParticleModel,
  sampleParticleModelSurface,
} from "./particle-model-target";
import { ParticlePoints } from "./ParticlePoints";
import type { StoryProgressStore } from "./story-progress";

type ParticleLayout = "tablet" | "desktop";

type LoadedParticleModels = {
  hero: Awaited<ReturnType<typeof loadParticleModel>>;
  reach: Awaited<ReturnType<typeof loadParticleModel>>;
  closing: Awaited<ReturnType<typeof loadParticleModel>>;
};

function getParticleLayout(): ParticleLayout {
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
  const [models, setModels] = useState<LoadedParticleModels | null>(null);

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
    const heroModelConfig = experienceConfig.particles.heroModel;
    const reachModelConfig = experienceConfig.particles.reachModel;
    const closingModelConfig = experienceConfig.particles.closingModel;

    Promise.all([
      loadParticleModel(heroModelConfig.url),
      loadParticleModel(reachModelConfig.url),
      loadParticleModel(closingModelConfig.url),
    ])
      .then(([hero, reach, closing]) => {
        if (!cancelled) {
          setModels({ hero, reach, closing });
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
  const heroTarget = useMemo(() => {
    if (!models) {
      return null;
    }

    return sampleParticleModelSurface(
      models.hero,
      profile.count,
      experienceConfig.particles.heroModel,
    );
  }, [models, profile.count]);
  const closingTarget = useMemo(() => {
    if (!models) {
      return null;
    }

    return sampleParticleModelSurface(
      models.closing,
      profile.count,
      experienceConfig.particles.closingModel,
    );
  }, [models, profile.count]);
  const reachTarget = useMemo(() => {
    if (!models) {
      return null;
    }

    return sampleParticleModelSurface(
      models.reach,
      profile.count,
      experienceConfig.particles.reachModel,
    );
  }, [models, profile.count]);
  if (!heroTarget || !reachTarget || !closingTarget) {
    return null;
  }

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
      <CanvasLifecycle onFailure={onFailure} />
      <ParticlePoints
        profile={profile}
        progressStore={progressStore}
        layout={layout}
        heroTarget={heroTarget}
        reachTarget={reachTarget}
        closingTarget={closingTarget}
        onReady={onReady}
      />
    </Canvas>
  );
}
