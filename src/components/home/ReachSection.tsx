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

const principles = [
  {
    index: "01",
    title: "Be found",
    description:
      "A clear structure and technically sound foundation make it easier for people and search engines to understand what you offer.",
    example:
      "Clear page hierarchy, useful metadata and responsive performance give every important service a reliable place to be discovered.",
  },
  {
    index: "02",
    title: "Be trusted",
    description:
      "Distinctive design and credible communication help the business feel considered before the first conversation begins.",
    example:
      "Consistent typography, honest proof and purposeful visual choices replace the uncertainty created by a generic or outdated website.",
  },
  {
    index: "03",
    title: "Be chosen",
    description:
      "A focused path from interest to enquiry helps visitors understand the next step without pressure or confusion.",
    example:
      "Service context, practical answers and one clear action reduce the effort needed to decide whether the business is a good fit.",
  },
];

export function ReachSection() {
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

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    section.dataset.motionReady = "true";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.dataset.visible = "true";
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
        <p className="eyebrow reach-section__eyebrow" data-reveal>
          02 / Business value
        </p>

        <h2 id="reach-heading" data-reveal>
          A stronger website makes your business easier to{" "}
          <em>notice, trust and choose.</em>
        </h2>

        <p className="reach-section__intro" data-reveal>
          Good design is not only about looking different. It gives the right
          information a clearer structure, supports credibility and guides an
          interested visitor towards a useful next step.
        </p>

        <div className="reach-principles" data-reveal>
          {principles.map((principle, index) => {
            const expanded = expandedIndex === index;

            return (
              <article
                key={principle.title}
                className="reach-principle"
                data-expanded={expanded}
              >
                <span className="reach-principle__index">
                  {principle.index}
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
