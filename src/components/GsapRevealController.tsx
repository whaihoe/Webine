import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "../animation/scroll-runtime";
import {
  createImageParallax,
  imageParallaxDistances,
  type ImageParallaxAxis,
} from "../animation/image-parallax";

export function GsapRevealController({ root }: { root: HTMLElement }) {
  useLayoutEffect(() => {
    let observer: MutationObserver | null = null;
    let refreshFrame = 0;
    let refreshTimer = 0;
    let refreshRequested = false;
    let active = true;
    const imageReadyListeners: Array<{
      image: HTMLImageElement;
      listener: () => void;
    }> = [];
    const observedParallaxFrames = new WeakSet<HTMLElement>();
    const observedFrameSizes = new WeakMap<Element, { width: number; height: number }>();
    const motionSelector = "[data-gsap-reveal], [data-gsap-parallax]";
    const refreshDebounceMs = 140;

    const scheduleRefresh = () => {
      if (!active) return;

      refreshRequested = true;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        refreshTimer = 0;
        if (!active || !refreshRequested) return;

        refreshRequested = false;
        window.cancelAnimationFrame(refreshFrame);
        refreshFrame = window.requestAnimationFrame(() => {
          refreshFrame = 0;
          if (active) ScrollTrigger.refresh();
        });
      }, refreshDebounceMs);
    };

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver((entries) => {
          let geometryChanged = false;

          entries.forEach((entry) => {
            const previousSize = observedFrameSizes.get(entry.target);
            const nextSize = {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            };

            observedFrameSizes.set(entry.target, nextSize);

            if (
              previousSize
              && (
                Math.abs(previousSize.width - nextSize.width) > 0.5
                || Math.abs(previousSize.height - nextSize.height) > 0.5
              )
            ) {
              geometryChanged = true;
            }
          });

          if (geometryChanged) scheduleRefresh();
        });
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
        const trigger = element.closest<HTMLElement>("[data-image-parallax-viewport]")
          ?? element.parentElement
          ?? element;

        if (!observedParallaxFrames.has(trigger)) {
          observedParallaxFrames.add(trigger);
          resizeObserver?.observe(trigger);

          trigger.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
            if (image.complete) return;
            const listener = () => scheduleRefresh();
            imageReadyListeners.push({ image, listener });
            image.addEventListener("load", listener, { once: true });
            image.addEventListener("error", listener, { once: true });
          });
        }

        createImageParallax({
          target: element,
          trigger,
          axis,
          distancePercent: () => compactViewport()
            ? imageParallaxDistances.compact
            : imageParallaxDistances.standard,
          scrub: true,
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
    const mutationAffectsMotion = (mutation: MutationRecord) => {
      const mutationTarget = mutation.target instanceof Element
        ? mutation.target
        : mutation.target.parentElement;

      if (mutationTarget?.closest(motionSelector)) return true;

      return Array.from(mutation.addedNodes).some((node) => {
        if (!(node instanceof Element)) return false;

        return node.matches(motionSelector)
          || Boolean(node.querySelector(motionSelector));
      });
    };

    observer = new MutationObserver((mutations) => {
      if (!mutations.some(mutationAffectsMotion)) return;

      context.add(scan);
      scheduleRefresh();
    });
    observer.observe(root, { childList: true, subtree: true });

    scheduleRefresh();

    return () => {
      active = false;
      observer?.disconnect();
      resizeObserver?.disconnect();
      imageReadyListeners.forEach(({ image, listener }) => {
        image.removeEventListener("load", listener);
        image.removeEventListener("error", listener);
      });
      window.clearTimeout(refreshTimer);
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
