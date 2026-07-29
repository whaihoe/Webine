import type { CSSProperties, ReactNode } from "react";

export type WaterRippleImageProps = {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: CSSProperties["aspectRatio"];
  overlay?: ReactNode;
  strength?: number;
  radius?: number;
  damping?: number;
  propagation?: number;
  speedThreshold?: number;
  fullStrengthSpeed?: number;
  edgeDisplacement?: number;
  greyScale?: boolean;
  colorRevealRadius?: number;
  colorRevealDecay?: number;
  colorRevealShrink?: number;
};

export type WaterRipplePlaneProps = Required<
  Pick<
    WaterRippleImageProps,
    | "src"
    | "strength"
    | "radius"
    | "damping"
    | "propagation"
    | "speedThreshold"
    | "fullStrengthSpeed"
    | "edgeDisplacement"
    | "greyScale"
    | "colorRevealRadius"
    | "colorRevealDecay"
    | "colorRevealShrink"
  >
> & {
  disabled: boolean;
  onReady: () => void;
};
