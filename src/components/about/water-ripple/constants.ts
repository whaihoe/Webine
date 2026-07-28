export const RIPPLE_TEXTURE_SIZE = 320;
export const REVEAL_TEXTURE_SIZE = 256;

export const DEFAULT_WATER_RIPPLE_SETTINGS = {
  strength: 0.5,
  radius: 0.075,
  damping: 0.975,
  propagation: 0.235,
  speedThreshold: 0.14,
  fullStrengthSpeed: 1.55,
  edgeDisplacement: 0.01,
  greyScale: false,
  colorRevealRadius: 0.16,
  colorRevealDecay: 3.2,
  colorRevealShrink: 0.18,
} as const;
