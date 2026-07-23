import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "../animation/scroll-runtime";
import { createImageParallax, type ImageParallaxAxis } from "../animation/image-parallax";

export function GsapRevealController({ root }: { root: HTMLElement }) {
  useLayoutEffect(() => {
    let observer: MutationObserver | null = null;
    let refreshFrame = 0;
    const preparedReveals = new WeakSet<Element>();
    const preparedParallax = new WeakSet<Element>();
    const prepareReveal = (element: HTMLElement) => {
      if (preparedReveals.has(element) || element.closest("[data-gsap-managed='true']")) return;
      preparedReveals.add(element);
      element.dataset.gsapMotionReady = "reveal";
      const mode = element.dataset.gsapReveal ?? "copy";
      const media = mode === "media";
      const requestedDelay = Number.parseFloat(element.dataset.gsapDelay ?? "0");
      const boundedDelay = Number.isFinite(requestedDelay)
        ? Math.min(Math.max(requestedDelay, 0), 0.8)
        : 0;
      const initialRect = element.getBoundingClientRect();
      const startsInViewport = window.scrollY < 32
        && initialRect.bottom > 0
        && initialRect.top < window.innerHeight;
      const delay = boundedDelay + (startsInViewport ? 0.08 : 0);

      gsap.fromTo(element, {
        opacity: 0,
        y: media ? 0 : mode === "card" ? 52 : 34,
        clipPath: media ? "inset(12% 0 12% 0 round 1.25rem)" : "none",
      }, {
        opacity: 1,
        y: 0,
        clipPath: media ? "inset(0% 0 0% 0 round 0rem)" : "none",
        duration: media ? 1.3 : 1,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
      });
    };

    const prepareParallax = (element: HTMLElement) => {
      if (preparedParallax.has(element) || element.closest("[data-gsap-managed='true']")) return;
      preparedParallax.add(element);
      element.dataset.gsapMotionReady = "parallax";
      const mode = element.dataset.gsapParallax ?? "copy";
      const isMedia = mode === "media";
      const isFloatingCard = mode === "float-card";
      const isOrbit = mode === "orbit";
      const horizontalDirection = mode === "drift-left"
        ? -1
        : mode === "drift-right"
          ? 1
          : 0;
      const compactViewport = () => window.innerWidth < 768;

      if (isMedia) {
        const requestedAxis = element.dataset.gsapParallaxAxis
          ?? element.dataset.imageParallaxAxis;
        const axis: ImageParallaxAxis = requestedAxis === "horizontal"
          ? "horizontal"
          : "vertical";
        const configuredDistance = () => {
          const requestedDistance = compactViewport()
            ? element.dataset.gsapParallaxDistanceMobile
            : element.dataset.gsapParallaxDistance;
          const parsedDistance = Number.parseFloat(requestedDistance ?? "");

          return Number.isFinite(parsedDistance)
            ? Math.min(Math.max(parsedDistance, 0), 12)
            : compactViewport() ? 6 : 8;
        };
        createImageParallax({
          target: element,
          axis,
          distancePercent: configuredDistance,
          scrub: 1.05,
        });
        return;
      }

      gsap.fromTo(element, {
        xPercent: horizontalDirection * -4,
        y: isFloatingCard ? () => compactViewport() ? -24 : -72 : 0,
        yPercent: isFloatingCard
          ? 0
          : isOrbit ? 12 : horizontalDirection ? 3 : 4,
        rotation: isOrbit ? -22 : 0,
      }, {
        xPercent: horizontalDirection * 4,
        y: isFloatingCard ? () => compactViewport() ? 36 : 96 : 0,
        yPercent: isFloatingCard
          ? 0
          : isOrbit ? -12 : horizontalDirection ? -3 : -4,
        rotation: isOrbit ? 26 : 0,
        ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          scrub: isFloatingCard ? 1.35 : 1.15,
          invalidateOnRefresh: true,
        },
      });
    };

    const scan = () => {
      root.querySelectorAll<HTMLElement>("[data-gsap-reveal]").forEach(prepareReveal);
      root.querySelectorAll<HTMLElement>("[data-gsap-parallax]").forEach(prepareParallax);
    };

    root.dataset.gsapController = "ready";
    const context = gsap.context(scan, root);
    observer = new MutationObserver(() => {
      context.add(scan);

      if (refreshFrame === 0) {
        refreshFrame = window.requestAnimationFrame(() => {
          refreshFrame = 0;
          ScrollTrigger.refresh();
        });
      }
    });
    observer.observe(root, { childList: true, subtree: true });

    ScrollTrigger.refresh();

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(refreshFrame);
      delete root.dataset.gsapController;
      root.querySelectorAll<HTMLElement>("[data-gsap-motion-ready]").forEach((element) => {
        delete element.dataset.gsapMotionReady;
      });
      context.revert();
    };
  }, [root]);

  return null;
}
