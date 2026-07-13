type ParticlePosterFallbackProps = {
  state: "loading" | "fallback" | "live";
};

export function ParticlePosterFallback({
  state,
}: ParticlePosterFallbackProps) {
  const loadingParticles = Array.from({ length: 48 }, (_, index) => {
    const x = 12 + ((index * 37) % 76);
    const y = 12 + ((index * 53) % 76);
    const radius = 0.45 + ((index * 7) % 5) * 0.11;

    return <circle key={index} cx={x} cy={y} r={radius} />;
  });

  return (
    <div
      className="particle-poster"
      data-particle-poster-state={state}
      aria-hidden="true"
    >
      <span className="particle-poster__index">W / 01</span>
      <div className="particle-poster__frame">
        <svg
          className="particle-poster__scatter"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {loadingParticles}
        </svg>
        <picture className="particle-poster__fallback-logo">
          <img
            src="/webine-logo-primary.png"
            alt=""
            width="174"
            height="103"
          />
        </picture>
      </div>
      <span className="particle-poster__caption">Identity taking shape</span>
    </div>
  );
}
