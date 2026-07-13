import { useEffect, useRef } from "react";
import { InterludeChapterContent } from "./InterludeChapterContent";
import { useParticleSceneAnchor } from "./ParticleSceneController";

export function QuietInterlude() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const registerScene = useParticleSceneAnchor("interlude");

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    section.dataset.motionReady = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) section.dataset.visible = "true";
      },
      { threshold: 0.18 },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
        registerScene(element);
      }}
      className="quiet-interlude theme-light"
      aria-labelledby="interlude-heading"
      data-particle-scene="interlude"
    >
      <div className="quiet-interlude__frame">
        <InterludeChapterContent headingId="interlude-heading" />
      </div>
    </section>
  );
}
