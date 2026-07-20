import { gsap } from "./scroll-runtime";

export type ImageParallaxAxis = "horizontal" | "vertical";

type ImageParallaxOptions = {
  target: HTMLElement;
  trigger?: HTMLElement;
  axis: ImageParallaxAxis;
  distancePercent: number | (() => number);
  scrub?: number;
};

function axisValues(axis: ImageParallaxAxis, offset: number | (() => number)) {
  return axis === "horizontal"
    ? { xPercent: offset, yPercent: 0 }
    : { xPercent: 0, yPercent: offset };
}

export function createImageParallax({
  target,
  trigger = target,
  axis,
  distancePercent,
  scrub = 1.05,
}: ImageParallaxOptions) {
  const startDistance = typeof distancePercent === "function"
    ? () => -distancePercent()
    : -distancePercent;
  const endDistance = typeof distancePercent === "function"
    ? () => distancePercent()
    : distancePercent;

  target.dataset.imageParallaxAxis = axis;

  return gsap.fromTo(
    target,
    axisValues(axis, startDistance),
    {
      ...axisValues(axis, endDistance),
      ease: "none",
      immediateRender: false,
      scrollTrigger: {
        trigger,
        start: "clamp(top bottom)",
        end: "clamp(bottom top)",
        scrub,
        invalidateOnRefresh: true,
        onEnter: () => { target.style.willChange = "transform"; },
        onEnterBack: () => { target.style.willChange = "transform"; },
        onLeave: () => { target.style.willChange = "auto"; },
        onLeaveBack: () => { target.style.willChange = "auto"; },
      },
    },
  );
}

export function setImageParallaxOffset(
  target: HTMLElement,
  axis: ImageParallaxAxis,
  offsetPercent: number,
) {
  target.dataset.imageParallaxAxis = axis;
  gsap.set(target, axisValues(axis, offsetPercent));
}
