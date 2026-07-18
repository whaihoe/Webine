import { experienceConfig } from "../config/experience";

const surface = experienceConfig.particles.surfaceField;
const TAU = Math.PI * 2;

function smoothstep(edge0: number, edge1: number, value: number) {
  const amount = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return amount * amount * (3 - 2 * amount);
}

export function sampleParticleSurfaceField(
  x: number,
  y: number,
  z: number,
  elapsed: number,
  identity: number,
) {
  const colourTime = elapsed * TAU / surface.colourCycleSeconds;
  const primary = Math.sin(
    (x * 1.13 + y * 0.71 + z * 0.89) * surface.primaryScale + colourTime,
  );
  const secondary = Math.sin(
    (x * -0.62 + y * 1.37 - z * 0.48) * surface.secondaryScale
      - colourTime * 0.68 + 1.7,
  );
  const residual = Math.sin(identity * 43.7 + colourTime * 0.17) * surface.residualMix;
  const colour = Math.min(Math.max(0.5 + primary * 0.27 + secondary * 0.18 + residual, 0), 1);

  const densityTime = elapsed * TAU / surface.densityCycleSeconds;
  const densityPrimary = Math.sin(
    (x * 0.74 - y * 1.08 + z * 0.63) * surface.densityScale + densityTime,
  );
  const densitySecondary = Math.sin(
    (x * -0.39 + y * 0.58 + z * 1.17) * surface.densityScale * 1.7
      - densityTime * 0.61 + 2.1,
  );
  const densityField = 0.5 + densityPrimary * 0.31 + densitySecondary * 0.19;
  const density = 1 - surface.densityContrast * (
    1 - smoothstep(0.24, 0.68, densityField)
  );

  return {
    colourBucket: colour < 0.34 ? 0 : colour > 0.7 ? 2 : 1,
    density,
  } as const;
}

export function getParticleSurfacePalette(theme: "dark" | "light" = "dark") {
  const styles = getComputedStyle(document.documentElement);
  const getColour = (token: string, fallback: string) => {
    const value = styles.getPropertyValue(token).trim();
    const channels = value.split(/\s+/);
    if (channels.length !== 3 || channels.some((channel) => !channel)) return fallback;
    return `hsl(${channels[0]}, ${channels[1]}, ${channels[2]})`;
  };

  return [
    getColour(
      theme === "light" ? "--primitive-blue-700" : "--primitive-blue-600",
      theme === "light" ? "hsl(224, 76%, 48%)" : "hsl(221, 83%, 53%)",
    ),
    getColour("--primitive-cyan-400", "hsl(188, 86%, 53%)"),
    theme === "light"
      ? getColour("--primitive-blue-600", "hsl(221, 83%, 53%)")
      : getColour("--primitive-blue-400", "hsl(213, 94%, 68%)"),
  ] as const;
}
