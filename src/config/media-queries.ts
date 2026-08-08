export const finePointerQuery = "(hover: hover) and (pointer: fine)";
export const desktopFinePointerQuery =
  `(min-width: 48rem) and ${finePointerQuery}`;
export const desktopAnyFinePointerQuery =
  "(min-width: 48rem) and (any-hover: hover) and (any-pointer: fine)";
