import { gsap } from "gsap";
import { useLayoutEffect, type RefObject } from "react";

type HeroCoverTransitionProps = {
  rootRef: RefObject<HTMLElement | null>;
};

export function HeroCoverTransition({
  rootRef,
}: HeroCoverTransitionProps) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    let cancelled = false;
    let pin: { kill: () => void } | null = null;

    const initialise = async () => {
      if (!root) {
        return;
      }

      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      pin = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => `+=${root.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    };

    void initialise();

    return () => {
      cancelled = true;
      pin?.kill();
      if (root) {
        gsap.set(root, { clearProps: "transform" });
      }
    };
  }, [rootRef]);

  return null;
}
