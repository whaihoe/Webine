import type { CSSProperties } from "react";
import { AmbientParticleField } from "./AmbientParticleField";

type GalaxyBackdropProps = {
  accentColour?: string;
  className?: string;
};

export function GalaxyBackdrop({
  accentColour,
  className = "",
}: GalaxyBackdropProps) {
  const style = accentColour
    ? { "--galaxy-project-accent": accentColour } as CSSProperties
    : undefined;

  return (
    <div
      className={[
        "galaxy-backdrop",
        accentColour ? "galaxy-backdrop--project" : "",
        className,
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={style}
    >
      <div className="galaxy-backdrop__nebula" />
      <AmbientParticleField
        variant="works"
        className="ambient-particle-field--galaxy"
      />
    </div>
  );
}
