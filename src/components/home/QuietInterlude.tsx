import { useRef } from "react";
import { InterludeChapterContent } from "./InterludeChapterContent";
import { useParticleSceneAnchor } from "./ParticleSceneController";

export function QuietInterlude() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const registerScene = useParticleSceneAnchor("interlude");

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
