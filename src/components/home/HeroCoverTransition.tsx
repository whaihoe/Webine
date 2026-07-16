import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { gsap, ScrollTrigger } from "../../animation/scroll-runtime";
import { experienceConfig } from "../../config/experience";

const NATIVE_STICKY_QUERY =
  `(max-width: ${experienceConfig.particles.mobile.maxWidth}px), ` +
  "(hover: none) and (pointer: coarse)";

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
  const [useNativeSticky, setUseNativeSticky] = useState(() =>
    window.matchMedia(NATIVE_STICKY_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(NATIVE_STICKY_QUERY);
    const update = () => setUseNativeSticky(media.matches);

    media.addEventListener("change", update);
    update();

    return () => media.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    if (useNativeSticky) {
      return;
    }

    const root = rootRef.current;
    let cancelled = false;
    let pin: { kill: () => void } | null = null;
    let removeLoadRefresh = () => {};

    const initialise = async () => {
      if (!root) {
        return;
      }

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
        anticipatePin: 1,
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
  }, [rootRef, useNativeSticky]);

  return null;
}
