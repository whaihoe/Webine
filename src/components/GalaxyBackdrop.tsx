import { AmbientParticleField } from "./AmbientParticleField";

type GalaxyBackdropProps = {
  className?: string;
};

export function GalaxyBackdrop({ className = "" }: GalaxyBackdropProps) {
  return (
    <div className={`galaxy-backdrop ${className}`.trim()} aria-hidden="true">
      <div className="galaxy-backdrop__nebula" />
      <AmbientParticleField
        count={118}
        className="ambient-particle-field--galaxy"
      />
    </div>
  );
}
