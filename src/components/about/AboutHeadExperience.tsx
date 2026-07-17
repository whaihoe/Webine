import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "../../animation/scroll-runtime";

const AboutHeadCanvas = lazy(() => import("../../three/AboutHeadCanvas"));

export function AboutHeadExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ progress: 0 });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "20% 0px" });
    observer.observe(section);
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.25,
      invalidateOnRefresh: true,
      onUpdate: (self) => { motion.current.progress = self.progress; },
    });
    trigger.refresh();
    motion.current.progress = trigger.progress;
    return () => {
      observer.disconnect();
      trigger.kill();
    };
  }, []);

  return (
    <div ref={sectionRef} className="about-head" data-gsap-managed="true">
      <div className="about-head__sticky" aria-hidden="true">
        <div className={`about-head__visual${ready ? " is-ready" : ""}`}>
          <Suspense fallback={<div className="about-head__fallback" />}>
            <AboutHeadCanvas motion={motion} active={active} onReady={handleReady} />
          </Suspense>
        </div>
        <span className="about-head__axis about-head__axis--x" />
        <span className="about-head__axis about-head__axis--y" />
        <p>Form / perspective / release</p>
      </div>
    </div>
  );
}
