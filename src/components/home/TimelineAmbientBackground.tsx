import { useEffect, useRef, useState } from "react";
import { AmbientParticleField } from "../AmbientParticleField";

export function TimelineAmbientBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setMounted(true);
      observer.disconnect();
    }, { rootMargin: "100% 0px" });
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="process-section__ambient"
      data-timeline-ambient-state={mounted ? "mounted" : "waiting"}
      aria-hidden="true"
    >
      <div className="process-section__ambient-sticky">
        {mounted ? <AmbientParticleField variant="timeline" className="ambient-particle-field--timeline" /> : null}
        <span />
      </div>
    </div>
  );
}
