import type { ReactNode } from "react";
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
        <ParticleNarrativeLayer />
        {children}
      </div>
    </ParticleSceneController>
  );
}
