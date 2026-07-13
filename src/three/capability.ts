export type ParticleCapability = {
  supported: boolean;
  reason: "ready" | "webgl2-unavailable" | "performance-caveat";
};

export function getParticleCapability(): ParticleCapability {
  const canvas = document.createElement("canvas");
  let context: WebGL2RenderingContext | null = null;

  try {
    context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "high-performance",
    });
  } catch {
    return { supported: false, reason: "performance-caveat" };
  }

  if (!context) {
    return { supported: false, reason: "webgl2-unavailable" };
  }

  context.getExtension("WEBGL_lose_context")?.loseContext();
  return { supported: true, reason: "ready" };
}
