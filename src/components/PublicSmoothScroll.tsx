import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { normaliseScrollInput } from "../animation/scroll-input";
import { gsap, ScrollTrigger } from "../animation/scroll-runtime";
import { experienceConfig } from "../config/experience";

type PublicSmoothScrollProps = {
  children: ReactNode;
};

function getHeaderOffset() {
  const header = document.querySelector<HTMLElement>("[data-site-header]");

  if (!header) {
    return 0;
  }

  return -Math.ceil(header.getBoundingClientRect().bottom + 16);
}

export function PublicSmoothScroll({ children }: PublicSmoothScrollProps) {
  useEffect(() => {
    const config = experienceConfig.smoothScroll;

    if (!config.enabled) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,             // Lower = smoother, Higher = more responsive
      duration: 1.2,         // Scroll duration in seconds
      wheelMultiplier: 1,    // Scroll speed multiplier
      smoothWheel: true,     // Smooth out mouse wheel scrolling
      syncTouch: false,      // Prevent stability issues on older iOS versions
      touchMultiplier: 1, 
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) // Default ease
    });

    const handleAnchorNavigation = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const eventTarget = event.target;

      if (!(eventTarget instanceof Element)) {
        return;
      }

      const link = eventTarget.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = link?.getAttribute("href");

      if (!href || href === "#" || !href.startsWith("#")) {
        return;
      }

      const target = document.getElementById(decodeURIComponent(href.slice(1)));

      if (!target) {
        return;
      }

      event.preventDefault();
      lenis.scrollTo(target, {
        offset: getHeaderOffset(),
        onComplete: () => {
          if (window.location.hash !== href) {
            window.history.pushState(null, "", href);
          }
          target.focus({ preventScroll: true });
        },
      });
    };

    document.addEventListener("click", handleAnchorNavigation);

    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.dataset.scrollRuntime = "ready";
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateLenis);
      document.removeEventListener("click", handleAnchorNavigation);
      delete document.documentElement.dataset.scrollRuntime;
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
