import { gsap } from "gsap";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { experienceConfig } from "../config/experience";

type PublicSmoothScrollProps = {
  children: ReactNode;
};

function getHeaderOffset() {
  const headerHeight = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();

  return -(Number.parseFloat(headerHeight) || 0);
}

export function PublicSmoothScroll({ children }: PublicSmoothScrollProps) {
  useEffect(() => {
    const config = experienceConfig.smoothScroll;

    if (!config.enabled) {
      return;
    }

    let cancelled = false;
    let removeScrollTriggerSync = () => {};

    const lenis = new Lenis({
      autoRaf: false,
      lerp: config.lerp,
      smoothWheel: config.smoothWheel,
      wheelMultiplier: config.wheelMultiplier,
      syncTouch: config.syncTouch,
      syncTouchLerp: config.syncTouchLerp,
      touchInertiaExponent: config.touchInertiaExponent,
      touchMultiplier: config.touchMultiplier,
      overscroll: config.overscroll,
      anchors: {
        offset: getHeaderOffset(),
      },
      stopInertiaOnNavigate: true,
    });

    const handleAnchorFocus = (event: MouseEvent) => {
      const eventTarget = event.target;

      if (!(eventTarget instanceof Element)) {
        return;
      }

      const link = eventTarget.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = link?.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector<HTMLElement>(href);

      if (!target) {
        return;
      }

      window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    };

    document.addEventListener("click", handleAnchorFocus);

    void import("gsap/ScrollTrigger")
      .then(({ ScrollTrigger }) => {
        if (cancelled) {
          return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const updateScrollTrigger = () => ScrollTrigger.update();
        const updateLenis = (time: number) => lenis.raf(time * 1000);

        lenis.on("scroll", updateScrollTrigger);
        gsap.ticker.add(updateLenis);
        gsap.ticker.lagSmoothing(0);
        ScrollTrigger.refresh();

        removeScrollTriggerSync = () => {
          lenis.off("scroll", updateScrollTrigger);
          gsap.ticker.remove(updateLenis);
        };
      })
      .catch(() => {
        console.error("Webine smooth scrolling could not start.");
      });

    return () => {
      cancelled = true;
      removeScrollTriggerSync();
      document.removeEventListener("click", handleAnchorFocus);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
