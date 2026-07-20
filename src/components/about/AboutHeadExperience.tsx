import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../animation/scroll-runtime";
import { experienceConfig } from "../../config/experience";

const AboutHeadCanvas = lazy(() => import("../../three/AboutHeadCanvas"));

export function AboutHeadExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ rotation: 0, dispersion: 0 });
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const hero = section.closest<HTMLElement>(".about-hero");
    const frame = hero?.querySelector<HTMLElement>("[data-about-hero-frame]");
    const copy = hero?.querySelector<HTMLElement>("[data-about-hero-copy]");
    if (!hero || !frame || !copy) return;

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "35% 0px",
    });
    observer.observe(hero);

    const sequence = experienceConfig.particles.aboutHead.sequence;
    const mobile = window.matchMedia("(max-width: 47.99rem)").matches;
    const scrollScreens = mobile ? sequence.scrollScreens.mobile : sequence.scrollScreens.desktop;
    const frameScale = mobile ? sequence.frame.mobile : sequence.frame.desktop;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * scrollScreens)}`,
          pin: hero,
          pinSpacing: true,
          scrub: mobile ? sequence.scrub.mobile : sequence.scrub.desktop,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(motion.current, { rotation: 1, duration: 0.42 }, 0.06)
        .to(motion.current, { dispersion: 1, duration: 0.3, ease: "power1.inOut" }, 0.48)
        .to(copy, { autoAlpha: 0, yPercent: -5, duration: 0.2, ease: "power1.in" }, 0.57)
        .to(frame, {
          scaleX: frameScale.scaleX,
          scaleY: frameScale.scaleY,
          borderRadius: "var(--primitive-radius-default)",
          duration: 0.24,
          ease: "power2.inOut",
        }, 0.76);
    }, hero);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      context.revert();
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
