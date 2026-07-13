type ParticlePosterFallbackProps = {
  state: "loading" | "fallback" | "live";
};

export function ParticlePosterFallback({
  state,
}: ParticlePosterFallbackProps) {
  return (
    <div
      className="particle-poster"
      data-particle-poster-state={state}
      aria-hidden="true"
    >
      <span className="particle-poster__index">W / 01</span>
      <div className="particle-poster__frame">
        <picture>
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
