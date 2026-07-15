import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { PublicProject } from "../../content/public-projects";
import { DirectionalArrow } from "../DirectionalArrow";

export function ProjectCard({ project, compact = false, active = false, priority = false, onFocus }: { project: PublicProject; compact?: boolean; active?: boolean; priority?: boolean; onFocus?: () => void }) {
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (compact || !window.matchMedia("(pointer: fine)").matches) return;
    const card = cardRef.current;
    if (!card) return;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const rect = card.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const offset = (Math.min(1, Math.max(0, progress)) - 0.5) * 28;
      card.style.setProperty("--project-parallax", `${offset.toFixed(2)}px`);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestUpdate();
    }, { rootMargin: "20% 0px" });
    observer.observe(card);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.cancelAnimationFrame(frame);
      card.style.removeProperty("--project-parallax");
    };
  }, [compact]);

  return (
    <article ref={cardRef} className={compact ? "project-card project-card--compact work-card" : "project-card"} data-active={active || undefined} onFocus={onFocus}>
      <Link className={compact ? "project-card__media work-card__media" : "project-card__media"} to={`/works/${project.slug}`} aria-label={`View ${project.title}`}>
        <img src={project.heroImage.url} alt={project.heroImage.altText} width={project.heroImage.width} height={project.heroImage.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ objectPosition: `${project.heroImage.focalX * 100}% ${project.heroImage.focalY * 100}%` }} />
        {project.hoverImage ? <img className="project-card__hover-image" src={project.hoverImage.url} alt="" width={project.hoverImage.width} height={project.hoverImage.height} loading="lazy" decoding="async" style={{ objectPosition: `${project.hoverImage.focalX * 100}% ${project.hoverImage.focalY * 100}%` }} /> : null}
      </Link>
      <div className="project-card__content work-card__content">
        <div className="project-card__meta work-card__meta"><span>{project.label}</span><span>{project.year}</span></div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <ul aria-label="Services">{project.services.map((service) => <li key={service}>{service}</li>)}</ul>
        <Link className="work-card__link" to={`/works/${project.slug}`}>View project <DirectionalArrow /></Link>
      </div>
    </article>
  );
}
