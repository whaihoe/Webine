import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../animation/scroll-runtime";
import { servicesContent } from "../../content/services-content";
import { ServicesParticleOrb, type ServicesParticleMotion } from "./ServicesParticleOrb";

export function ServicesChapterController() {
  const rootRef = useRef<HTMLDivElement>(null);
  const particleMotion = useRef<ServicesParticleMotion>({ rotation: -0.3, scale: 0.82 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-service-chapter]"));
    const markers = Array.from(root.querySelectorAll<HTMLElement>("[data-service-marker]"));
    const context = gsap.context(() => {
      chapters.forEach((chapter, index) => {
        const copy = chapter.querySelectorAll<HTMLElement>("[data-service-copy]");
        gsap.fromTo(copy, { opacity: 0.24, y: index % 2 ? 38 : 58 }, {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: chapter,
            start: "top 76%",
            end: "top 38%",
            scrub: 0.85,
          },
        });
        ScrollTrigger.create({
          trigger: chapter,
          start: "top center",
          end: "bottom center",
          onToggle: ({ isActive }) => {
            if (!isActive) return;
            markers.forEach((marker, markerIndex) => marker.dataset.active = String(markerIndex === index));
            root.dataset.activeService = String(index);
          },
        });
      });
      gsap.fromTo(particleMotion.current, { rotation: -0.3, scale: 0.82 }, {
          rotation: -1.1,
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 1.4 },
        });
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="services-chapters" data-active-service="0" data-gsap-managed="true">
      <div className="site-container services-chapters__layout">
        <aside className="services-chapters__rail" aria-label="Service chapters">
          <p>What Webine provides</p>
          <ol>
            {servicesContent.services.map((service, index) => (
              <li key={service.index} data-service-marker data-active={index === 0}><span>{service.index}</span>{service.title}</li>
            ))}
          </ol>
          <div className="services-chapters__visual" aria-hidden="true"><ServicesParticleOrb motion={particleMotion} /></div>
        </aside>
        <div className="services-chapters__content">
          {servicesContent.services.map((service) => (
            <article key={service.index} data-service-chapter>
              <span data-service-copy>{service.index}</span>
              <h2 data-service-copy>{service.title}</h2>
              <p className="services-chapters__outcome" data-service-copy>{service.outcome}</p>
              <p data-service-copy>{service.description}</p>
              <ul data-service-copy>
                {service.includes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
