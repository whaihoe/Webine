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
    closingModel: {
      url: "/models/cell-phone-retro-particle.glb",
      targetHeight: 4,
      rotationDegrees: [-4, 156, 0],
      offset: [0, 0, 0],
      ambientRotationScale: 0.35,
      seed: 20260714,
    },
    desktop: {
      minWidth: 1024,
      count: 6000,
      ambientRatio: 0.045,
      pointSize: 3.2,
      pixelRatioCap: 1.5,
      objectScale: 1,
      maxFrameRate: 60,
      measurementSettleMs: 1200,
    },
    tablet: {
      count: 1800,
      ambientRatio: 0.035,
      pointSize: 4.2,
      pixelRatioCap: 1.25,
      objectScale: 1.22,
      maxFrameRate: 60,
      measurementSettleMs: 1200,
    },
    mobile: {
      maxWidth: 599,
      count: 900,
      ambientRatio: 0.025,
      pointSize: 3.8,
      pixelRatioCap: 1,
      objectScale: 1.22,
      maxFrameRate: 30,
      measurementSettleMs: 240,
    },
  },
  smoothScroll: {
    enabled: true,
    duration: 1.35,
    wheelMultiplier: 0.88,
    syncTouch: true,
    syncTouchLerp: 0.12,
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
    motion: {
      formation: { enterViewportY: 1, formedViewportY: 0.5 },
      dispersion: { startViewportY: 0, completeViewportY: -0.34 },
    },
    desktop: { anchorX: 0.75, anchorY: 0.46, scale: 0.82 },
    tablet: { anchorX: 0.76, anchorY: 0.46, scale: 0.46 },
    mobile: { anchorX: 0.88, anchorY: 0.46, scale: 0.38 },
  },
  reach: {
    id: "reach",
    theme: "light",
    motion: {
      formation: { enterViewportY: 0.96, formedViewportY: 0.5 },
      dispersion: { startViewportY: 0, completeViewportY: -0.3 },
    },
    desktop: { anchorX: 0.8, anchorY: 0.2, scale: 0.86 },
    tablet: { anchorX: 0.86, anchorY: 0.2, scale: 0.62 },
    mobile: { anchorX: 0.94, anchorY: 0.2, scale: 0.34 },
  },
  interlude: {
    id: "interlude",
    theme: "light",
    motion: {
      formation: { enterViewportY: 0.96, formedViewportY: 0.67 },
      dispersion: { startViewportY: 0, completeViewportY: -0.28 },
    },
    desktop: { anchorX: 0.8, anchorY: 0.9, scale: 0.78 },
    tablet: { anchorX: 0.84, anchorY: 0.9, scale: 0.58 },
    mobile: { anchorX: 0.82, anchorY: 0.92, scale: 0.34 },
  },
  process: {
    id: "process",
    theme: "dark",
    desktop: { scale: 0.82 },
    tablet: { scale: 0.68 },
    mobile: { scale: 0.62 },
  },
  closing: {
    id: "closing",
    theme: "dark",
    motion: {
      formation: { enterViewportY: 0.94, formedViewportY: 0.5 },
      dispersion: { startViewportY: 0, completeViewportY: -0.28 },
    },
    desktop: { anchorX: 0.76, anchorY: 0.5, scale: 1.06 },
    tablet: { anchorX: 0.76, anchorY: 0.5, scale: 0.72 },
    mobile: { anchorX: 0.8, anchorY: 0.87, scale: 0.38 },
  },
} as const;

export const experienceMode = Object.values(experienceConfig).some(
  (feature) => feature.enabled,
)
  ? "enhanced"
  : "static";
