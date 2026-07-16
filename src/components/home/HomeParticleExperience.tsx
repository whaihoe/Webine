import type { ReactNode } from "react";
import { AmbientParticleField } from "../AmbientParticleField";
import { ParticleNarrativeLayer } from "./ParticleNarrativeLayer";
import { ParticleSceneController } from "./ParticleSceneController";

type HomeParticleExperienceProps = {
  children: ReactNode;
};

export function HomeParticleExperience({
  children,
}: HomeParticleExperienceProps) {
  return (
    <ParticleSceneController>
      <div className="home-page">
        <AmbientParticleField count={20} className="ambient-particle-field--hero" />
        <ParticleNarrativeLayer />
        {children}
      </div>
    </ParticleSceneController>
  );
}
