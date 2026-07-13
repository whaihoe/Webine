import { useEffect, useRef, useState } from "react";
import {
  useParticleController,
  useParticleSceneAnchor,
} from "./ParticleSceneController";

const processSteps = [
  {
    title: "Understand",
    action: "We clarify the business, audience, goals and constraints before deciding what the website needs to say.",
    client: "Share context, priorities and useful source material.",
    output: "A focused brief and content direction.",
  },
  {
    title: "Shape",
    action: "We organise the story, define the visual direction and prototype the interactions that carry the idea.",
    client: "Review the direction and give clear, timely feedback.",
    output: "An agreed structure, design system and motion plan.",
  },
  {
    title: "Build",
    action: "We turn the approved direction into a responsive, maintainable website and test the complete experience.",
    client: "Supply final content and approve realistic checkpoints.",
    output: "A tested website ready for launch preparation.",
  },
  {
    title: "Support",
    action: "We prepare the handover, monitor the launch and keep a clear route for future refinements.",
    client: "Confirm access, ownership and the next priorities.",
    output: "A usable handover and a practical next-step plan.",
  },
];

export function ProcessTimeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLElement | null>>([]);
  const registerScene = useParticleSceneAnchor("process");
  const { store } = useParticleController();
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;

    if (!section || !line) return;

    let frame = 0;
    let measureUntil = 0;

    const measure = () => {
      frame = 0;
      const centre = window.innerHeight / 2;
      const lineRect = line.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportWidth = Math.max(window.innerWidth, 1);
      const progress = Math.min(
        Math.max((centre - lineRect.top) / Math.max(lineRect.height, 1), 0),
        1,
      );
      const releaseProgress = Math.min(
        Math.max(
          (centre - lineRect.bottom) / Math.max(window.innerHeight * 0.42, 1),
          0,
        ),
        1,
      );
      const intakeProgress = Math.min(
        Math.max(
          (viewportHeight * 0.88 - lineRect.top) /
            Math.max(viewportHeight * 0.48, 1),
          0,
        ),
        1,
      );
      const lineCentreX = lineRect.left + lineRect.width / 2;
      let nextActive = -1;

      nodeRefs.current.forEach((node, index) => {
        if (node && node.getBoundingClientRect().top <= centre) nextActive = index;
      });

      section.style.setProperty("--timeline-progress", String(progress));
      section.style.setProperty(
        "--timeline-release-progress",
        String(releaseProgress),
      );
      store.setTimelineGeometry({
        intakeProgress,
        inletPosition: {
          x: lineCentreX / viewportWidth,
          y: lineRect.top / viewportHeight,
        },
        outletPosition: {
          x: lineCentreX / viewportWidth,
          y: lineRect.bottom / viewportHeight,
        },
        releaseProgress,
      });
      setActiveStep((current) => (current === nextActive ? current : nextActive));

      if (performance.now() < measureUntil) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    const schedule = () => {
      measureUntil = performance.now() + 1200;
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
    };
  }, [store]);

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
        registerScene(element);
      }}
      className="process-section theme-dark"
      aria-labelledby="process-heading"
      data-particle-scene="process"
    >
      <div className="site-container process-section__intro">
        <p className="eyebrow">05 / How it moves</p>
        <h2 id="process-heading">
          Clear enough to follow. <em>Flexible enough to fit.</em>
        </h2>
        <p>
          Every project has different needs, but the route stays visible. The
          timeline shows what Webine does, what we need from you and what each
          stage produces.
        </p>
      </div>

      <div className="site-container process-timeline">
        <div ref={lineRef} className="process-timeline__line" aria-hidden="true">
          <span />
        </div>
        <div className="process-timeline__inlet" aria-hidden="true" />
        {processSteps.map((step, index) => (
          <article
            key={step.title}
            ref={(element) => {
              nodeRefs.current[index] = element;
            }}
            className="process-step"
            data-state={
              index < activeStep
                ? "complete"
                : index === activeStep
                  ? "active"
                  : "waiting"
            }
          >
            <div className="process-step__node" aria-hidden="true">
              <span />
            </div>
            <p className="process-step__index">0{index + 1}</p>
            <h3>{step.title}</h3>
            <p className="process-step__action">{step.action}</p>
            <dl>
              <div>
                <dt>Your part</dt>
                <dd>{step.client}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{step.output}</dd>
              </div>
            </dl>
          </article>
        ))}
        <div className="process-timeline__outlet" aria-hidden="true" />
      </div>
    </section>
  );
}
