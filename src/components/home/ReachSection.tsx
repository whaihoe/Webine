import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  useParticleController,
  useParticleSceneAnchor,
} from "./ParticleSceneController";
import { MobileSectionParticles } from "./MobileSectionParticles";
import { useSiteSettings } from "../../content/SiteSettingsProvider";

export function ReachSection() {
  const settings = useSiteSettings();
  const sectionRef = useRef<HTMLElement | null>(null);
  const registerScene = useParticleSceneAnchor("reach");
  const { store } = useParticleController();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const connectSection = useCallback(
    (element: HTMLElement | null) => {
      sectionRef.current = element;
      registerScene(element);
    },
    [registerScene],
  );

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const updateProgress = () => {
      const presence = store.getSnapshot().scenePresence.reach ?? 0;
      section.style.setProperty(
        "--reach-progress",
        String(Math.min(Math.max(presence / 0.58, 0), 1)),
      );
    };
    const unsubscribe = store.subscribe(updateProgress);
    updateProgress();
    return unsubscribe;
  }, [store]);

  return (
    <section
      ref={connectSection}
      className="reach-section theme-light"
      aria-labelledby="reach-heading"
      data-particle-scene="reach"
      style={{ "--reach-progress": 0 } as CSSProperties}
    >
      <MobileSectionParticles scene="reach" />
      <div className="site-container reach-section__layout">
        <p className="eyebrow reach-section__eyebrow" data-gsap-reveal="copy">
          02 / Business value
        </p>

        <h2 id="reach-heading" data-gsap-reveal="copy">
          A stronger website makes your business easier to{" "}
          <em>notice, trust and choose.</em>
        </h2>

        <p className="reach-section__intro" data-gsap-reveal="copy">
          {settings.positioningStatement}
        </p>

        <div className="reach-principles">
          {settings.principles.map((principle, index) => {
            const expanded = expandedIndex === index;

            return (
              <article
                key={principle.title}
                className="reach-principle"
                data-gsap-reveal="card"
                data-expanded={expanded}
              >
                <span className="reach-principle__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`reach-example-${index}`}
                  onClick={() => setExpandedIndex(expanded ? null : index)}
                >
                  {expanded ? "Hide example" : "See practical example"}
                  <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                </button>
                <p
                  id={`reach-example-${index}`}
                  className="reach-principle__example"
                  hidden={!expanded}
                >
                  {principle.example}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
