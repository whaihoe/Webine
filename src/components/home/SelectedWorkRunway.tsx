import { DirectionalArrow } from "../DirectionalArrow";
import { gsap } from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { featuredProjects } from "../../content/featured-projects";
import { homeInterludeContent } from "../../content/home-interlude";
import {
  useParticleController,
  useParticleSceneAnchor,
} from "./ParticleSceneController";

type ScrollBoundTween = {
  kill: () => void;
  scrollTrigger?: {
    start: number;
    end: number;
    scroll: (position: number) => void;
    kill: (revert?: boolean) => void;
  };
};

export function SelectedWorkRunway() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const entranceRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef<HTMLElement>(null);
  const chapterCompactRef = useRef<HTMLDivElement>(null);
  const scrollTweenRef = useRef<ScrollBoundTween | null>(null);
  const { store } = useParticleController();
  const registerScene = useParticleSceneAnchor("work");
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalFrames = featuredProjects.length + 1;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const entrance = entranceRef.current;
    const track = trackRef.current;
    const header = headerRef.current;
    const chapter = chapterRef.current;
    const chapterCompact = chapterCompactRef.current;

    if (
      !section ||
      !stage ||
      !entrance ||
      !track ||
      !header ||
      !chapter ||
      !chapterCompact
    ) {
      return;
    }

    const projectCards = Array.from(
      track.querySelectorAll<HTMLElement>(".work-card"),
    );
    const interlude = section.nextElementSibling;
    const interludeRevealItems = interlude?.classList.contains("quiet-interlude")
      ? Array.from(
          interlude.querySelectorAll<HTMLElement>("[data-interlude-reveal]"),
        )
      : [];

    let cancelled = false;
    let tween: ScrollBoundTween | null = null;
    let entranceTween: ScrollBoundTween | null = null;
    let mobileInterludeTween: gsap.core.Tween | null = null;
    let mobileInterludeVisible = false;
    let resizeObserver: ResizeObserver | null = null;
    const horizontalEnd = 0.7;
    const isMobile = window.innerWidth <= 599;
    const mobileInterludeRevealStart = 0.94;
    const interludeRevealStart = 0.9;

    const stop = () => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      tween?.scrollTrigger?.kill(true);
      tween?.kill();
      tween = null;
      entranceTween?.scrollTrigger?.kill(true);
      entranceTween?.kill();
      entranceTween = null;
      mobileInterludeTween?.kill();
      mobileInterludeTween = null;
      mobileInterludeVisible = false;
      scrollTweenRef.current = null;
      delete section.dataset.scrollMode;
      delete section.dataset.scrollPhase;
      delete section.dataset.particleVisibility;
      delete section.dataset.chapterFormation;
      gsap.set(
        [
          stage,
          entrance,
          track,
          header,
          chapter,
          chapterCompact,
          ...projectCards,
          ...interludeRevealItems,
        ],
        { clearProps: "all" },
      );
    };

    const start = async () => {
      stop();

      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      section.dataset.scrollMode = "pinned";
      gsap.set(interludeRevealItems, {
        autoAlpha: 0,
        y: 24,
      });

      entranceTween = gsap.fromTo(
        entrance,
        { y: () => -Math.min(window.innerHeight * 0.14, 120) },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 30%",
            scrub: 1.45,
            invalidateOnRefresh: true,
          },
        },
      ) as ScrollBoundTween;

      const getTravel = () => {
        const sectionRect = section.getBoundingClientRect();
        const chapterRect = chapter.getBoundingClientRect();
        const chapterCenter =
          chapterRect.left - sectionRect.left + chapterRect.width / 2;

        return Math.max(chapterCenter - window.innerWidth / 2, 0);
      };
      const getDistance = () => {
        const travel = getTravel();

        if (window.innerWidth <= 599) {
          return Math.max(
            travel / horizontalEnd,
            window.innerHeight * 1.45,
          );
        }

        return Math.min(
          Math.max(
            travel * 1.08 + window.innerHeight * 1.25,
            window.innerHeight * 3.25,
          ),
          window.innerHeight * 5,
        );
      };

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const runwayProgress = Math.min(self.progress / horizontalEnd, 1);
            setCurrentIndex(
              Math.min(
                totalFrames - 1,
                Math.round(runwayProgress * (totalFrames - 1)),
              ),
            );
            const expandedThreshold = isMobile
              ? mobileInterludeRevealStart
              : 0.98;
            section.dataset.scrollPhase =
              self.progress < horizontalEnd
                ? "horizontal"
                : self.progress < expandedThreshold
                  ? "expanding"
                  : "expanded";

            if (isMobile) {
              const shouldShowInterlude =
                self.progress >= mobileInterludeRevealStart;

              if (shouldShowInterlude !== mobileInterludeVisible) {
                mobileInterludeVisible = shouldShowInterlude;
                mobileInterludeTween?.kill();
                mobileInterludeTween = gsap.to(interludeRevealItems, {
                  autoAlpha: shouldShowInterlude ? 1 : 0,
                  y: shouldShowInterlude ? 0 : 24,
                  duration: shouldShowInterlude ? 0.42 : 0.2,
                  stagger: shouldShowInterlude ? 0.05 : 0.02,
                  ease: "power2.out",
                  overwrite: true,
                });
              }
            }
            const fadeOutEnd = 0.1;
            const fadeInEnd = 0.84;
            const chapterFormationStart = horizontalEnd;
            const chapterFormationEnd = 0.88;
            const visibility =
              self.progress < fadeOutEnd
                ? 1 - self.progress / fadeOutEnd
                : self.progress < horizontalEnd
                  ? 0
                  : Math.min(
                      Math.max(
                        (self.progress - horizontalEnd) /
                          (fadeInEnd - horizontalEnd),
                        0,
                      ),
                      1,
                    );
            const chapterFormationProgress = Math.min(
              Math.max(
                (self.progress - chapterFormationStart) /
                  (chapterFormationEnd - chapterFormationStart),
                0,
              ),
              1,
            );
            store.setWorkParticleState({
              visibility,
              chapterFormationProgress,
            });
            section.dataset.particleVisibility = visibility.toFixed(3);
            section.dataset.chapterFormation =
              chapterFormationProgress.toFixed(3);
          },
        },
      });

      timeline
        .to(
          track,
          { x: () => -getTravel(), duration: horizontalEnd, ease: "none" },
          0,
        )
        .to(header, { autoAlpha: 0, y: -24, duration: 0.1, ease: "none" }, 0.6)
        .to(
          chapterCompact,
          { autoAlpha: 0, duration: 0.08, ease: "none" },
          horizontalEnd,
        )
        .to(
          projectCards,
          { autoAlpha: 0, duration: 0.12, ease: "none" },
          horizontalEnd,
        )
        .to(
          chapter,
          {
            "--chapter-decoration-opacity": 0,
            duration: 0.16,
            ease: "power1.out",
          },
          horizontalEnd,
        )
        .to(
          chapter,
          {
            flexBasis: () => window.innerWidth,
            width: () => window.innerWidth,
            height: () => window.innerHeight,
            x: () =>
              -(window.innerWidth - chapter.getBoundingClientRect().width) / 2,
            y: () => {
              const sectionTop = section.getBoundingClientRect().top;
              return -(chapter.getBoundingClientRect().top - sectionTop);
            },
            borderRadius: 0,
            duration: 0.3,
            ease: "power2.inOut",
          },
          horizontalEnd,
        );

      if (!isMobile) {
        timeline.to(
          interludeRevealItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.07,
            stagger: 0.01,
            ease: "power2.out",
          },
          interludeRevealStart,
        );
      }

      tween = timeline as ScrollBoundTween;
      scrollTweenRef.current = timeline as ScrollBoundTween;

      resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserver.observe(section);
      ScrollTrigger.refresh();
    };

    void start();

    return () => {
      cancelled = true;
      stop();
      store.setWorkParticleState({
        visibility: 1,
        chapterFormationProgress: 0,
      });
    };
  }, [store, totalFrames]);

  const focusFrame = (index: number) => {
    setCurrentIndex(index);
    const trigger = scrollTweenRef.current?.scrollTrigger;

    if (trigger) {
      const progress = 0.7 * (index / Math.max(totalFrames - 1, 1));
      trigger.scroll(trigger.start + (trigger.end - trigger.start) * progress);
    }
  };

  return (
    <section
      ref={(element) => {
        sectionRef.current = element;
        registerScene(element);
      }}
      className="work-runway theme-dark"
      aria-labelledby="selected-work-heading"
      data-particle-scene="work"
    >
      <div ref={stageRef} className="work-runway__stage">
        <div ref={entranceRef} className="work-runway__entrance">
          <div ref={headerRef} className="site-container work-runway__header">
            <div>
              <p className="eyebrow">03 / Selected work</p>
              <h2 id="selected-work-heading">
                Proof lives in the <em>details.</em>
              </h2>
            </div>
            <p>
              A small set of internal and clearly labelled concept projects while
              Webine's commissioned portfolio is being prepared.
            </p>
            <p className="work-runway__progress" aria-hidden="true">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(totalFrames).padStart(2, "0")}
            </p>
          </div>

          <div ref={trackRef} className="work-runway__track">
            {featuredProjects.map((project, index) => (
              <article
                key={project.slug}
                className="work-card"
                onFocus={() => focusFrame(index)}
              >
                <div
                  className={`work-card__media work-card__media--${project.visual}`}
                  aria-hidden="true"
                >
                  <span className="work-card__shape work-card__shape--one" />
                  <span className="work-card__shape work-card__shape--two" />
                  <span className="work-card__media-label">
                    Webine / {project.year}
                  </span>
                </div>
                <div className="work-card__content">
                  <div className="work-card__meta">
                    <span>{project.label}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <ul aria-label="Services">
                    {project.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                  <Link
                    className="work-card__link"
                    to="/works"
                    aria-label={`View ${project.title} in Works`}
                  >
                    View project <DirectionalArrow />
                  </Link>
                </div>
              </article>
            ))}

            <article
              ref={chapterRef}
              className="work-runway__chapter-preview"
              aria-labelledby="work-chapter-preview-heading"
              onFocus={() => focusFrame(totalFrames - 1)}
            >
              <div
                ref={chapterCompactRef}
                className="work-runway__chapter-compact"
              >
                <div
                  className="work-runway__chapter-preview-index"
                  aria-hidden="true"
                >
                  <span>04</span>
                  <span>Next chapter</span>
                </div>
                <p className="eyebrow">{homeInterludeContent.eyebrow}</p>
                <h3 id="work-chapter-preview-heading">
                  {homeInterludeContent.titleLead}{" "}
                  <em>{homeInterludeContent.titleAccent}</em>
                </h3>
                <p>{homeInterludeContent.statement}</p>
                <a
                  className="work-runway__chapter-link"
                  href="#interlude-heading"
                >
                  Expand the chapter <DirectionalArrow direction="down" />
                </a>
              </div>
            </article>
          </div>

          <p className="work-runway__swipe" aria-hidden="true">
            Scroll to explore
          </p>
        </div>
      </div>
    </section>
  );
}
