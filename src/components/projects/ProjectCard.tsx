import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "../../animation/scroll-runtime";
import { desktopFinePointerQuery } from "../../config/media-queries";
import type { PublicProject } from "../../content/public-projects";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { DirectionalArrow } from "../DirectionalArrow";
import { ProjectMedia } from "./ProjectMedia";

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
  const projectHref = `/works/${project.slug}`;
  const contentRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const metaStartRef = useRef<HTMLSpanElement>(null);
  const metaEndRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const showHoverEffects = useMediaQuery(desktopFinePointerQuery);

  useLayoutEffect(() => {
    if (compact || !showHoverEffects) return;

    const content = contentRef.current;
    const meta = metaRef.current;
    const metaStart = metaStartRef.current;
    const metaEnd = metaEndRef.current;
    const title = titleRef.current;
    if (!content || !meta || !metaStart || !metaEnd || !title) return;

    let timeline: gsap.core.Timeline | null = null;
    const context = gsap.context(() => {
      timeline = gsap.timeline({
        paused: true,
        defaults: {
          duration: 0.42,
          ease: "power3.out",
          overwrite: "auto",
        },
      });
      timeline
        .to(meta, { y: 3 }, 0)
        .to(metaStart, { x: 3 }, 0)
        .to(metaEnd, { x: -3 }, 0)
        .to(title, { y: -3 }, 0);
    }, content);

    const enter = () => timeline?.play();
    const leave = () => timeline?.reverse();
    content.addEventListener("pointerenter", enter);
    content.addEventListener("pointerleave", leave);
    content.addEventListener("focus", enter);
    content.addEventListener("blur", leave);

    return () => {
      content.removeEventListener("pointerenter", enter);
      content.removeEventListener("pointerleave", leave);
      content.removeEventListener("focus", enter);
      content.removeEventListener("blur", leave);
      context.revert();
    };
  }, [compact, showHoverEffects]);

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
        to={projectHref}
        aria-label={`View ${project.title}`}
        data-cursor-surface="large"
        data-image-parallax-viewport={compact ? undefined : "true"}
      >
        <span
          className="project-card__media-motion"
          data-gsap-parallax={compact ? undefined : "media"}
          data-gsap-parallax-axis={compact ? undefined : "vertical"}
        >
          <ProjectMedia
            asset={project.heroImage}
            imageParallaxAxis={compact ? "horizontal" : undefined}
            loading={priority ? "eager" : "lazy"}
            style={{
              objectPosition:
                `${project.heroImage.focalX * 100}% ${project.heroImage.focalY * 100}%`,
            }}
          />
          {project.hoverImage && showHoverEffects ? (
            <ProjectMedia
              asset={project.hoverImage}
              className="project-card__hover-image"
              alt=""
              loading="lazy"
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
      {compact ? (
        <div className="project-card__content work-card__content">
          <div className="project-card__meta work-card__meta">
            <span>{project.label}</span>
            <span>{project.year}</span>
          </div>
          <h3>{project.title}</h3>
          <>
            <p>{project.summary}</p>
            <ul aria-label="Services">
              {project.services.map((service) => <li key={service}>{service}</li>)}
            </ul>
            <Link
              className="project-card__link work-card__link"
              to={projectHref}
            >
              View project <DirectionalArrow />
            </Link>
          </>
        </div>
      ) : (
        <Link
          ref={contentRef}
          className="project-card__content project-card__content-link"
          to={projectHref}
          aria-label={`View ${project.title}`}
          data-cursor-surface="large"
        >
          <div ref={metaRef} className="project-card__meta">
            <span ref={metaStartRef}>{project.label}</span>
            <span ref={metaEndRef}>{project.year}</span>
          </div>
          <h3 ref={titleRef} className="project-card__title-link">{project.title}</h3>
        </Link>
      )}
    </article>
  );
}
