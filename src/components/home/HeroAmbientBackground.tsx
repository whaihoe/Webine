import { useEffect, useRef, type CSSProperties } from "react";
import { AmbientParticleField } from "../AmbientParticleField";
import { useParticleController } from "./ParticleSceneContext";

const REACH_COVER_START = 0.015;
const REACH_COVER_COMPLETE = 0.5;

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothstep(value: number) {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function getExitProgress(reachPresence: number) {
  const travel = REACH_COVER_COMPLETE - REACH_COVER_START;
  return smoothstep((reachPresence - REACH_COVER_START) / travel);
}

type HeroAmbientBackgroundProps = {
  active: boolean;
};

export function HeroAmbientBackground({
  active,
}: HeroAmbientBackgroundProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { store } = useParticleController();

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    let previousProgress = -1;

    const update = () => {
      const reachPresence = store.getSnapshot().scenePresence.reach ?? 0;
      const progress = getExitProgress(reachPresence);

      if (Math.abs(progress - previousProgress) < 0.001) {
        return;
      }

      previousProgress = progress;
      root.style.setProperty("--hero-ambient-exit", progress.toFixed(4));
      root.dataset.ambientState = !active || progress >= 0.985
        ? "gone"
        : progress > 0.01
          ? "exiting"
          : "idle";
    };

    const unsubscribe = store.subscribe(update);
    update();

    return unsubscribe;
  }, [active, store]);

  return (
    <div
      ref={rootRef}
      className="hero-ambient-background"
      data-ambient-state="idle"
      style={{ "--hero-ambient-exit": 0 } as CSSProperties}
      aria-hidden="true"
    >
      <AmbientParticleField
        variant="home"
        className="ambient-particle-field--hero"
        active={active}
      />
    </div>
  );
}
