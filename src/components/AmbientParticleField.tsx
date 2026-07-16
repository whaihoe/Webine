import type { CSSProperties } from "react";

type AmbientParticleFieldProps = {
  count?: number;
  className?: string;
};

function hash(value: number) {
  const sine = Math.sin(value * 91.173) * 43758.5453;
  return sine - Math.floor(sine);
}

export function AmbientParticleField({
  count = 18,
  className = "",
}: AmbientParticleFieldProps) {
  const particles = Array.from({ length: count }, (_, index) => {
    const seed = index + 1;
    const style = {
      "--ambient-x": `${4 + hash(seed * 1.7) * 92}%`,
      "--ambient-y": `${3 + hash(seed * 2.9) * 94}%`,
      "--ambient-size": `${0.8 + hash(seed * 4.3) * 2.6}px`,
      "--ambient-alpha": `${0.16 + hash(seed * 5.1) * 0.5}`,
      "--ambient-delay": `${-hash(seed * 6.7) * 24}s`,
      "--ambient-duration": `${12 + hash(seed * 7.9) * 16}s`,
      "--ambient-pulse-duration": `${4.5 + hash(seed * 8.3) * 7}s`,
      "--ambient-drift-x": `${-28 + hash(seed * 9.1) * 56}px`,
      "--ambient-drift-y": `${-46 + hash(seed * 11.3) * 58}px`,
      "--ambient-drift-x-mid": `${-42 + hash(seed * 12.7) * 84}px`,
      "--ambient-drift-y-mid": `${-24 + hash(seed * 13.9) * 48}px`,
      "--ambient-depth-scale": `${0.76 + hash(seed * 15.1) * 0.5}`,
    } as CSSProperties;

    return <span key={seed} style={style} />;
  });

  return (
    <div
      className={`ambient-particle-field ${className}`.trim()}
      aria-hidden="true"
    >
      {particles}
    </div>
  );
}
