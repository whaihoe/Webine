function clampViewportInset(inset: number, viewportHeight: number) {
  return Math.min(Math.max(inset, 0), Math.max(viewportHeight, 0));
}

export function getFixedHeaderBottom(viewportHeight = window.innerHeight) {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;

  return clampViewportInset(headerBottom, viewportHeight);
}

export function getViewportReadingLine(viewportHeight = window.innerHeight) {
  const headerBottom = getFixedHeaderBottom(viewportHeight);

  return headerBottom + (viewportHeight - headerBottom) / 2;
}

export function getHeaderScrollOffset(spacing = 16) {
  return -Math.ceil(getFixedHeaderBottom() + spacing);
}
