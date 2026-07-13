export const experienceConfig = {
  motion: {
    enabled: false,
    revealPreset: "clip-rise",
    controlFeedbackMs: 160,
    chapterTransitionMs: 620,
  },
  particles: {
    enabled: true,
    initialScene: "scattered-field",
    lazyLoadDelayMs: 120,
    desktop: {
      minWidth: 768,
      count: 6000,
      pointSize: 3.2,
      pixelRatioCap: 1.5,
      objectScale: 1,
    },
    mobile: {
      count: 1800,
      pointSize: 5.4,
      pixelRatioCap: 1.25,
      objectScale: 1.22,
    },
  },
  smoothScroll: {
    enabled: true,
    desktopSmoothness: 0.9,
    minWidth: 1024,
    finePointerOnly: true,
    touchMode: "native",
  },
  signalGrid: {
    enabled: false,
    sections: ["hero", "closing-cta"],
    desktopCellSize: 48,
    mobileCellSize: 32,
  },
  pageTransitions: {
    enabled: false,
    preset: "folded-panel-wipe",
    durationMs: 600,
  },
} as const;

export const particleSceneConfig = {
  hero: {
    id: "hero",
    startTarget: "scattered-field",
    endTarget: "folded-webine",
    theme: "dark",
    desktop: { x: 0.24, y: 0.02, scale: 1 },
    mobile: { x: 0, y: -0.1, scale: 1 },
  },
} as const;

export const experienceMode = Object.values(experienceConfig).some(
  (feature) => feature.enabled,
)
  ? "enhanced"
  : "static";
