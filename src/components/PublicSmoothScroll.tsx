import { useEffect, useRef, type ReactNode } from "react";
import { experienceConfig } from "../config/experience";

type PublicSmoothScrollProps = {
  children: ReactNode;
};

type SmoothInstance = {
  kill: () => void;
  scrollTo: (
    target: Element | number | string,
    smooth?: boolean,
    position?: string,
  ) => void;
};

export function PublicSmoothScroll({ children }: PublicSmoothScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = experienceConfig.smoothScroll;

    if (!config.enabled) {
      return;
    }

    const pointerCondition = config.finePointerOnly
      ? " and (pointer: fine)"
      : "";
    const media = window.matchMedia(
      `(min-width: ${config.minWidth}px)${pointerCondition}`,
    );
    let cancelled = false;
    let smoother: SmoothInstance | null = null;
    let cleanupActiveInstance = () => {};

    const stop = () => {
      cleanupActiveInstance();
      cleanupActiveInstance = () => {};
      smoother?.kill();
      smoother = null;
    };

    const start = async () => {
      stop();

      if (!media.matches || !wrapperRef.current || !contentRef.current) {
        return;
      }

      try {
        const [{ gsap }, { ScrollTrigger }, { ScrollSmoother }] =
          await Promise.all([
            import("gsap"),
            import("gsap/ScrollTrigger"),
            import("gsap/ScrollSmoother"),
          ]);

        if (cancelled || !media.matches) {
          return;
        }

        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
        smoother = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: config.desktopSmoothness,
          speed: 1,
          smoothTouch: false,
          effects: false,
        });

        const refresh = () => ScrollTrigger.refresh();
        const resizeObserver = new ResizeObserver(refresh);
        resizeObserver.observe(contentRef.current);

        const handleAssetLoad = () => refresh();
        const handleOrientationChange = () => refresh();
        const handleHashLink = (event: MouseEvent) => {
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

          event.preventDefault();
          const headerHeight = getComputedStyle(document.documentElement)
            .getPropertyValue("--header-height")
            .trim();
          smoother?.scrollTo(target, true, `top ${headerHeight}`);
          window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
        };

        contentRef.current.addEventListener("load", handleAssetLoad, true);
        window.addEventListener("orientationchange", handleOrientationChange);
        document.addEventListener("click", handleHashLink);
        void document.fonts.ready.then(() => {
          if (!cancelled && smoother) {
            refresh();
          }
        });
        refresh();

        cleanupActiveInstance = () => {
          resizeObserver.disconnect();
          contentRef.current?.removeEventListener("load", handleAssetLoad, true);
          window.removeEventListener(
            "orientationchange",
            handleOrientationChange,
          );
          document.removeEventListener("click", handleHashLink);
        };
      } catch {
        stop();
        console.error("Webine smooth scrolling could not start.");
      }
    };

    const reconcile = () => {
      if (media.matches) {
        void start();
      } else {
        stop();
      }
    };

    media.addEventListener("change", reconcile);
    reconcile();

    return () => {
      cancelled = true;
      media.removeEventListener("change", reconcile);
      stop();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
