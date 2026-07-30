import { useState } from "react";
import { servicesContent, type WebineService } from "../../content/services-content";
import { useExpandablePanel } from "../../hooks/useExpandablePanel";
import { ServicesParticleExperience } from "./ServicesParticleExperience";

function ServiceCard({
  service,
  expanded,
  onToggle,
}: {
  service: WebineService;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { panelRef, contentRef } = useExpandablePanel(expanded);

  return (
    <article className="service-card" data-expanded={expanded}>
      <button
        type="button"
        className="service-card__trigger"
        aria-expanded={expanded}
        aria-controls={`service-panel-${service.index}`}
        data-cursor-surface="large"
        onClick={onToggle}
      >
        <span className="service-card__index">{service.index}</span>
        <span className="service-card__heading">
          <strong>{service.title}</strong>
          <small>{service.summary}</small>
        </span>
        <span className="service-card__toggle-mark" aria-hidden="true"><i /><i /></span>
      </button>
      <div
        ref={panelRef}
        id={`service-panel-${service.index}`}
        className="service-card__panel"
        aria-hidden={!expanded}
      >
        <div ref={contentRef} className="service-card__details">
          <div className="service-card__best-for">
            <span>Best for</span>
            <p>{service.bestFor}</p>
          </div>
          <div className="service-card__includes">
            <span>What it includes</span>
            <ul>
              {service.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ServicesChapterController() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  function toggleService(index: number) {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      return;
    }
    setActiveIndex(index);
    setExpandedIndex(index);
  }

  return (
    <div
      className="services-experience"
      data-active-service={activeIndex}
      data-expanded-service={expandedIndex ?? "none"}
      data-gsap-managed="true"
    >
      <div className="services-experience__visual">
        <div className="services-experience__visual-sticky">
          <ServicesParticleExperience activeIndex={activeIndex} />
        </div>
      </div>
      <div className="site-container services-experience__content">
        <div className="services-experience__introduction">
          <p className="eyebrow">What Webine provides</p>
          <p>Choose the closest starting point. The exact scope is shaped around what the website needs to change for the business.</p>
        </div>
        <div className="services-accordion">
          {servicesContent.services.map((service, index) => (
            <ServiceCard
              key={service.key}
              service={service}
              expanded={expandedIndex === index}
              onToggle={() => toggleService(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
