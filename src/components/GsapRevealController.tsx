import { gsap } from "gsap";
import { useLayoutEffect, type RefObject } from "react";

export function GsapRevealController({ rootRef }: { rootRef: RefObject<HTMLElement | null> }) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let context: gsap.Context | null = null;

    void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const preparedReveals = new WeakSet<Element>();
      const preparedParallax = new WeakSet<Element>();
      context = gsap.context(() => {
        const prepareReveal = (element: HTMLElement) => {
          if (preparedReveals.has(element) || element.closest("[data-gsap-managed='true']")) return;
          preparedReveals.add(element);
          const mode = element.dataset.gsapReveal ?? "copy";
          const media = mode === "media";
          const requestedDelay = Number.parseFloat(element.dataset.gsapDelay ?? "0");
          const delay = Number.isFinite(requestedDelay)
            ? Math.min(Math.max(requestedDelay, 0), 0.8)
            : 0;
          gsap.fromTo(element, {
            opacity: 0,
            y: media ? 0 : mode === "card" ? 44 : 28,
            clipPath: media ? "inset(10% 0 10% 0 round 1.25rem)" : "none",
          }, {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0 0% 0 round 0rem)",
            duration: media ? 1.25 : 0.9,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 91%",
              toggleActions: "play none none reverse",
            },
          });
        };

        const prepareParallax = (element: HTMLElement) => {
          if (preparedParallax.has(element) || element.closest("[data-gsap-managed='true']")) return;
          preparedParallax.add(element);
          const mode = element.dataset.gsapParallax ?? "copy";
          const isMedia = mode === "media";
          const isFloatingCard = mode === "float-card";
          const isOrbit = mode === "orbit";
          const compactViewport = window.innerWidth < 768;
          const horizontalDirection = mode === "drift-left"
            ? -1
            : mode === "drift-right"
              ? 1
              : 0;
          const startYPercent = isMedia
            ? -4
            : isFloatingCard
              ? compactViewport ? -1.5 : -5
              : isOrbit ? 8 : 3;
          const endYPercent = isMedia
            ? 4
            : isFloatingCard
              ? compactViewport ? 3 : 8
              : isOrbit ? -8 : -3;

          gsap.fromTo(element, {
            xPercent: horizontalDirection * -2.5,
            yPercent: startYPercent,
            rotation: isOrbit ? -18 : 0,
          }, {
            xPercent: horizontalDirection * 2.5,
            yPercent: endYPercent,
            rotation: isOrbit ? 22 : 0,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: isFloatingCard ? 1.8 : 1.15,
            },
          });
        };

        const scan = () => {
          const run = () => {
            root.querySelectorAll<HTMLElement>("[data-gsap-reveal]").forEach(prepareReveal);
            root.querySelectorAll<HTMLElement>("[data-gsap-parallax]").forEach(prepareParallax);
          };
          if (context) context.add(run);
          else run();
        };
        scan();
        observer = new MutationObserver(scan);
        observer.observe(root, { childList: true, subtree: true });
      }, root);
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      context?.revert();
    };
  }, [rootRef]);

  return null;
}
