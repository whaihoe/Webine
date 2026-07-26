export const routeScrollEventName = "webine:route-scroll";

export function requestRouteScroll(top: number) {
  window.scrollTo({ top, behavior: "auto" });
  window.dispatchEvent(new CustomEvent(routeScrollEventName, {
    detail: { top },
  }));
}
