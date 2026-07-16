import { Link } from "react-router-dom";
import type { PublicProject } from "../../content/public-projects";
import { DirectionalArrow } from "../DirectionalArrow";

type ProjectCardProps = {
  project: PublicProject;
  compact?: boolean;
  active?: boolean;
  priority?: boolean;
  revealDelay?: number;
  onFocus?: () => void;
};

export function ProjectCard({
  project,
  compact = false,
  active = false,
  priority = false,
  revealDelay = 0,
  onFocus,
}: ProjectCardProps) {
  return (
    <article
      className={compact
        ? "project-card project-card--compact work-card"
        : "project-card"}
      data-active={active || undefined}
      data-gsap-reveal={compact ? undefined : "card"}
      data-gsap-delay={compact ? undefined : revealDelay}
      onFocus={onFocus}
    >
      <Link
        className={compact
          ? "project-card__media work-card__media"
          : "project-card__media"}
        to={`/works/${project.slug}`}
        aria-label={`View ${project.title}`}
      >
        <span
          className="project-card__media-motion"
          data-gsap-parallax={compact ? undefined : "media"}
        >
          <img
            src={project.heroImage.url}
            alt={project.heroImage.altText}
            width={project.heroImage.width}
            height={project.heroImage.height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{
              objectPosition:
                `${project.heroImage.focalX * 100}% ${project.heroImage.focalY * 100}%`,
            }}
          />
          {project.hoverImage ? (
            <img
              className="project-card__hover-image"
              src={project.hoverImage.url}
              alt=""
              width={project.hoverImage.width}
              height={project.hoverImage.height}
              loading="lazy"
              decoding="async"
              style={{
                objectPosition:
                  `${project.hoverImage.focalX * 100}% ${project.hoverImage.focalY * 100}%`,
              }}
            />
          ) : null}
        </span>
        {!compact ? (
          <span className="project-card__overlay" aria-hidden="true">
            <span className="project-card__overlay-label">{project.label}</span>
            <span className="project-card__overlay-arrow">
              <DirectionalArrow />
            </span>
          </span>
        ) : null}
      </Link>
      <div className={compact
        ? "project-card__content work-card__content"
        : "project-card__content"}
      >
        <div className={compact
          ? "project-card__meta work-card__meta"
          : "project-card__meta"}
        >
          <span>{project.label}</span>
          <span>{project.year}</span>
        </div>
        <h3>
          {compact
            ? project.title
            : <Link className="project-card__title-link" to={`/works/${project.slug}`}>{project.title}</Link>}
        </h3>
        {compact ? (
          <>
            <p>{project.summary}</p>
            <ul aria-label="Services">
              {project.services.map((service) => <li key={service}>{service}</li>)}
            </ul>
            <Link
              className="project-card__link work-card__link"
              to={`/works/${project.slug}`}
            >
              View project <DirectionalArrow />
            </Link>
          </>
        ) : null}
      </div>
    </article>
  );
}
