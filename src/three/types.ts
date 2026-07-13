export type ParticleTargetId = "scattered-field" | "folded-webine";

export type ParticleRenderProfile = {
  count: number;
  pointSize: number;
  pixelRatioCap: number;
  objectScale: number;
};

export type SceneProgress = Record<string, number>;
