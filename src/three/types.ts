export type ParticleRenderProfile = {
  count: number;
  ambientRatio: number;
  pointSize: number;
  pixelRatioCap: number;
  objectScale: number;
  maxFrameRate: number;
  settledFrameRate?: number;
  renderBurstMs?: number;
};

export type SceneProgress = Record<string, number>;
