import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animation/scroll-runtime";

export function useExpandablePanel(expanded: boolean) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;

    if (!panel || !content) return;

    gsap.killTweensOf([panel, content]);
    const targetHeight = expanded ? content.scrollHeight : 0;
    const panelTween = gsap.to(panel, {
      height: targetHeight,
      duration: 0.72,
      ease: "power3.inOut",
      onComplete: () => {
        if (expanded) panel.style.height = "auto";
      },
    });
    const contentTween = gsap.to(content, {
      y: expanded ? 0 : 18,
      opacity: expanded ? 1 : 0,
      duration: expanded ? 0.58 : 0.28,
      delay: expanded ? 0.12 : 0,
      ease: "power3.out",
    });

    return () => {
      panelTween.kill();
      contentTween.kill();
    };
  }, [expanded]);

  return { panelRef, contentRef };
}
