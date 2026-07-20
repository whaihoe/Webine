import { Link, useParams, useSearchParams } from "react-router-dom";
import { ButtonLink } from "../components/ButtonLink";
import { DirectionalArrow } from "../components/DirectionalArrow";
import { GalaxyBackdrop } from "../components/GalaxyBackdrop";
import { ProjectCard } from "../components/projects/ProjectCard";
import { SiteShell } from "../components/SiteShell";
import type { PublicProject } from "../content/public-projects";
import { useSiteSettings } from "../content/SiteSettingsProvider";
import { usePageMetadata } from "../hooks/usePageMetadata";
import { usePublicProjects } from "../hooks/usePublicProjects";

type ProjectBlockImage = {
  altText?: unknown;
  focalX?: unknown;
  focalY?: unknown;
  height?: unknown;
  url?: unknown;
  width?: unknown;
};

function formatCompletionDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function ProjectCaseStudy({
  project,
  projects,
  index,
}: {
  project: PublicProject;
  projects: PublicProject[];
  index: number;
}) {
  usePageMetadata(
    project.seoTitle ? `${project.seoTitle} | Webine` : `${project.title} | Webine`,
    project.seoDescription || project.summary,
  );

  const story = [
    ["About the client", project.aboutClient],
    ["Challenge", project.challenge],
    ["Approach", project.approach],
    ["Outcome", project.outcome],
  ] as const;
  const facts = [
    ["Client", project.client],
    ["Industry", project.industry],
    ["Location", project.location],
    ["Duration", project.duration],
    ["Completed", formatCompletionDate(project.completedOn)],
    ["Services", project.services.join(" / ")],
    ["Platform", project.platform],
  ].filter(([, value]) => value) as Array<[string, string]>;

  return (
    <section className="project-case-study theme-dark" aria-labelledby="case-study-heading">
      <div className="site-container project-case-study__top" data-gsap-reveal="copy">
        <Link to="/works">Close project</Link>
        <p>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p>
      </div>

      <div className="site-container project-case-study__hero">
        <div className="page-header-copy page-header-copy--case" data-gsap-reveal="copy" data-gsap-delay="0.08">
          <p className="eyebrow page-header-copy__eyebrow">{project.label} / {project.category}</p>
          <h1 className="page-header-copy__title" id="case-study-heading">{project.title}</h1>
          <p className="page-header-copy__summary">{project.summary}</p>
          {project.projectUrl ? (
            <a className="project-case-study__live-link" href={project.projectUrl} target="_blank" rel="noreferrer">
              Visit live website <DirectionalArrow />
            </a>
          ) : null}
        </div>
        <div className="project-case-study__media-frame" data-gsap-reveal="media" data-gsap-delay="0.16">
          <img
            data-gsap-parallax="media"
            data-gsap-parallax-axis="vertical"
            src={project.heroImage.url}
            alt={project.heroImage.altText}
            width={project.heroImage.width}
            height={project.heroImage.height}
            loading="eager"
            decoding="async"
            style={{ objectPosition: `${project.heroImage.focalX * 100}% ${project.heroImage.focalY * 100}%` }}
          />
        </div>
        {facts.length ? (
          <dl className="project-case-study__facts" data-gsap-reveal="copy">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="site-container project-case-study__story">
        {story.map(([heading, copy], storyIndex) => copy ? (
          <article key={heading} data-gsap-reveal="card" data-gsap-delay={storyIndex * 0.06}>
            <span>{heading}</span>
            <p>{copy}</p>
          </article>
        ) : null)}
        {project.contentBlocks.map((block, blockIndex) => {
          const image = block.image && typeof block.image === "object"
            ? block.image as ProjectBlockImage
            : null;

          return (
            <article
              key={`${String(block.type ?? "story")}-${blockIndex}`}
              data-block-type={String(block.type ?? "story")}
              data-block-layout={String(block.layout ?? "wide")}
              data-gsap-reveal="card"
            >
              <span>{String(block.heading ?? block.type ?? "Story")}</span>
              {image?.url ? (
                <figure>
                  <div className="project-case-study__media-frame project-case-study__media-frame--story">
                    <img
                      data-gsap-parallax="media"
                      data-gsap-parallax-axis="vertical"
                      src={String(image.url)}
                      alt={String(image.altText ?? "")}
                      width={Number(image.width ?? 1)}
                      height={Number(image.height ?? 1)}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: `${Number(image.focalX ?? 0.5) * 100}% ${Number(image.focalY ?? 0.5) * 100}%` }}
                    />
                  </div>
                  {block.text ? <figcaption>{String(block.text)}</figcaption> : null}
                </figure>
              ) : <p>{String(block.text ?? "")}</p>}
            </article>
          );
        })}
      </div>

      <nav className="site-container project-case-study__nav" aria-label="Adjacent projects" data-gsap-reveal="copy">
        {index > 0
          ? <Link to={`/works/${projects[index - 1].slug}`}>Previous / {projects[index - 1].title}</Link>
          : <span />}
        {index < projects.length - 1
          ? <Link to={`/works/${projects[index + 1].slug}`}>Next / {projects[index + 1].title}</Link>
          : <Link to="/contact">Start a project <DirectionalArrow /></Link>}
      </nav>
    </section>
  );
}

function ProjectState({
  title,
  copy,
  retry,
  pending = false,
}: {
  title: string;
  copy?: string;
  retry?: () => void;
  pending?: boolean;
}) {
  return (
    <section className="reserved-page theme-dark" data-page-load-pending={pending ? "true" : undefined}>
      <div className="site-container empty-state">
        <h1>{title}</h1>
        {copy ? <p>{copy}</p> : null}
        {retry ? <button type="button" onClick={retry}>Try again</button> : <Link to="/works">Return to Works</Link>}
      </div>
    </section>
  );
}

export function WorksPage() {
  const settings = useSiteSettings();
  const { projectSlug } = useParams();
  const resource = usePublicProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const projects = resource.status === "ready" ? resource.projects : [];
  const categories = [...new Set(projects.map((project) => project.category))];
  const requestedFilter = searchParams.get("category") ?? "all";
  const filter = requestedFilter === "all" || categories.includes(requestedFilter)
    ? requestedFilter
    : "all";
  const visible = filter === "all"
    ? projects
    : projects.filter((project) => project.category === filter);
  const activeIndex = projectSlug
    ? projects.findIndex((project) => project.slug === projectSlug)
    : -1;
  const active = activeIndex >= 0 ? projects[activeIndex] : undefined;

  if (projectSlug) {
    if (resource.status === "loading") {
      return <SiteShell><ProjectState title="Loading project" pending /></SiteShell>;
    }
    if (resource.status === "error") {
      return <SiteShell><ProjectState title="Project could not load." copy={resource.message} retry={resource.retry} /></SiteShell>;
    }
    return (
      <SiteShell>
        {active
          ? (
              <div className="works-experience">
                <GalaxyBackdrop />
                <ProjectCaseStudy project={active} projects={projects} index={activeIndex} />
              </div>
            )
          : <ProjectState title="That project is not published." />}
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="works-experience">
        <GalaxyBackdrop />
        <section className="works-intro theme-dark" aria-labelledby="works-heading">
          <span className="works-intro__ghost" data-gsap-parallax="drift-left" aria-hidden="true">WORK</span>
          <div className="site-container works-intro__grid page-header-copy page-header-copy--works">
            <p className="eyebrow page-header-copy__eyebrow" data-gsap-reveal="copy">{settings.works.eyebrow}</p>
            <h1 className="page-header-copy__title" id="works-heading" data-gsap-reveal="copy" data-gsap-delay="0.08">
              {settings.works.headingBefore} <em>{settings.works.headingAccent}</em>
              {settings.works.headingAfter ? ` ${settings.works.headingAfter}` : ""}
            </h1>
            <p className="works-intro__description page-header-copy__summary" data-gsap-reveal="copy" data-gsap-delay="0.16">{settings.works.introduction}</p>
            <p className="works-intro__folio" aria-hidden="true">01 / Practice in motion</p>
          </div>
        </section>

        <section className="works-foundation theme-dark" aria-label="Published projects">
          <div className="site-container works-filter" aria-label="Filter projects" data-gsap-reveal="copy">
            <button type="button" aria-pressed={filter === "all"} onClick={() => setSearchParams({})}>All</button>
            {categories.map((category) => (
              <button key={category} type="button" aria-pressed={filter === category} onClick={() => setSearchParams({ category })}>{category}</button>
            ))}
            <p className="works-filter__status" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}</p>
          </div>
          <div className="site-container project-grid">
            {resource.status === "loading" ? <div className="project-loading" data-page-load-pending="true" aria-label="Loading projects"><span /><span /><span /></div> : null}
            {resource.status === "error" ? <div className="empty-state"><h2>Projects could not load.</h2><p>{resource.message}</p><button type="button" onClick={resource.retry}>Try again</button></div> : null}
            {resource.status === "ready" && visible.length === 0 ? <div className="empty-state"><h2>No published work in this view.</h2><p>Choose another filter or publish a project from Admin.</p></div> : null}
            {visible.map((project, index) => (
              <ProjectCard key={project.id} project={project} priority={index === 0} revealDelay={(index % 2) * 0.14} />
            ))}
          </div>
          <div className="site-container">
            <div className="works-commission" data-gsap-reveal="card">
              <p className="eyebrow">No invented client work</p>
              <h2>Have a real project for this workbench?</h2>
              <p>Commissioned projects will replace concept positions as approved material becomes available.</p>
              <ButtonLink href="/contact" variant="outline">Start a project</ButtonLink>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
