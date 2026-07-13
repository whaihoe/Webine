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
    ambientMotion: {
      drift: 0.24,
      rotationX: 0.055,
      rotationY: 0.38,
      rotationZ: 0.025,
      floatY: 0.07,
      floatZ: 0.1,
      colourCycleSeconds: 18,
      fullRotationSeconds: 42,
      pointerTravel: 0.16,
      pointerTilt: 0.1,
    },
    desktop: {
      minWidth: 1024,
      count: 6000,
      ambientRatio: 0.045,
      pointSize: 3.2,
      pixelRatioCap: 1.5,
      objectScale: 1,
    },
    mobile: {
      maxWidth: 599,
      count: 1800,
      ambientRatio: 0.035,
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
    enabled: true,
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
    desktop: { anchorX: 0.75, anchorY: 0.5, scale: 0.82 },
    tablet: { anchorX: 0.76, anchorY: 0.31, scale: 0.46 },
    mobile: { anchorX: 0.5, anchorY: 0.34, scale: 0.56 },
  },
  reach: {
    id: "reach",
    theme: "light",
    desktop: { anchorX: 0.8, anchorY: 0.2, scale: 0.86 },
    tablet: { anchorX: 0.86, anchorY: 0.2, scale: 0.62 },
    mobile: { anchorX: 0.5, anchorY: 0.2, scale: 0.58 },
  },
  interlude: {
    id: "interlude",
    theme: "light",
    desktop: { anchorX: 0.8, anchorY: 0.9, scale: 0.78 },
    tablet: { anchorX: 0.84, anchorY: 0.9, scale: 0.58 },
    mobile: { anchorX: 0.5, anchorY: 0.92, scale: 0.48 },
  },
  process: {
    id: "process",
    theme: "dark",
    desktop: { scale: 0.78 },
    tablet: { scale: 0.65 },
    mobile: { scale: 0.6 },
  },
  closing: {
    id: "closing",
    theme: "dark",
    desktop: { anchorX: 0.76, anchorY: 0.5, scale: 1.06 },
    tablet: { anchorX: 0.76, anchorY: 0.5, scale: 0.72 },
    mobile: { anchorX: 0.5, anchorY: 0.87, scale: 0.48 },
  },
} as const;

export const experienceMode = Object.values(experienceConfig).some(
  (feature) => feature.enabled,
)
  ? "enhanced"
  : "static";
