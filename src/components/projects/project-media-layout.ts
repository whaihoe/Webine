import type { CSSProperties } from "react";

type ProjectMediaDimensions = {
  width?: unknown;
  height?: unknown;
};

type ProjectMediaFrameOptions = {
  maxViewportHeight?: number;
};

function positiveDimension(value: unknown) {
  const dimension = Number(value);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : 1;
}

export function projectMediaFrameStyle(
  dimensions: ProjectMediaDimensions,
  options: ProjectMediaFrameOptions = {},
): CSSProperties {
  const width = positiveDimension(dimensions.width);
  const height = positiveDimension(dimensions.height);
  const aspectRatio = width / height;
  const style: CSSProperties = {
    aspectRatio: `${width} / ${height}`,
  };

  if (options.maxViewportHeight) {
    const maxWidthInViewportHeight = Number(
      (options.maxViewportHeight * aspectRatio).toFixed(4),
    );
    style.maxWidth = `min(100%, ${maxWidthInViewportHeight}svh)`;
  }

  return style;
}
