import { gsap } from "gsap";
import { useLayoutEffect, type RefObject } from "react";

type HeroCoverTransitionProps = {
  rootRef: RefObject<HTMLElement | null>;
};

function waitForLayoutFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

export function HeroCoverTransition({
  rootRef,
}: HeroCoverTransitionProps) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    let cancelled = false;
    let pin: { kill: () => void } | null = null;
    let removeLoadRefresh = () => {};

    const initialise = async () => {
      if (!root) {
        return;
      }

      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      try {
        await document.fonts.ready;
      } catch {
        // The pin can still initialise if font readiness is unavailable.
      }

      await waitForLayoutFrame();

      if (cancelled) {
        return;
      }

      pin = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${root.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
        refreshPriority: 10,
      });

      ScrollTrigger.refresh(true);

      const refreshAfterLoad = () => ScrollTrigger.refresh(true);
      window.addEventListener("load", refreshAfterLoad, { once: true });
      removeLoadRefresh = () => {
        window.removeEventListener("load", refreshAfterLoad);
      };
    };

    void initialise();

    return () => {
      cancelled = true;
      removeLoadRefresh();
      pin?.kill();

      if (root) {
        gsap.set(root, { clearProps: "transform" });
      }
    };
  }, [rootRef]);

  return null;
}
