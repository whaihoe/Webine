export const experienceConfig = {
  motion: {
    enabled: false,
    revealPreset: "clip-rise",
    controlFeedbackMs: 160,
    chapterTransitionMs: 620,
  },
  particles: {
    enabled: false,
    desktopCount: 7200,
    mobileCount: 1800,
    initialScene: "scattered-field",
  },
  smoothScroll: {
    enabled: false,
    desktopSmoothness: 0.9,
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

export const experienceMode = Object.values(experienceConfig).some(
  (feature) => feature.enabled,
)
  ? "enhanced"
  : "static";
