import { Link, useParams, useSearchParams } from "react-router-dom";
import { ButtonLink } from "../components/ButtonLink";
import { ProjectCard } from "../components/projects/ProjectCard";
import { SiteShell } from "../components/SiteShell";
import { usePublicProjects } from "../hooks/usePublicProjects";
import type { PublicProject } from "../content/public-projects";
import { usePageMetadata } from "../hooks/usePageMetadata";
import { useSiteSettings } from "../content/SiteSettingsProvider";

function ProjectCaseStudy({ project, projects, index }: { project: PublicProject; projects: PublicProject[]; index: number }) {
  usePageMetadata(project.seoTitle ? `${project.seoTitle} | Webine` : `${project.title} | Webine`, project.seoDescription || project.summary);
  return <section className="project-case-study theme-light" aria-labelledby="case-study-heading">
    <div className="site-container project-case-study__top"><Link to="/works">Close project</Link><p>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</p></div>
    <div className="site-container project-case-study__hero"><div><p className="eyebrow">{project.label} / {project.category}</p><h1 id="case-study-heading">{project.title}</h1><p>{project.summary}</p></div><img src={project.heroImage.url} alt={project.heroImage.altText} width={project.heroImage.width} height={project.heroImage.height} fetchPriority="high" decoding="async" style={{ objectPosition: `${project.heroImage.focalX * 100}% ${project.heroImage.focalY * 100}%` }} /></div>
    <div className="site-container project-case-study__story">{[["Challenge", project.challenge], ["Approach", project.approach], ["Outcome", project.outcome]].map(([heading, copy]) => copy ? <article key={heading}><span>{heading}</span><p>{copy}</p></article> : null)}{project.contentBlocks.map((block, blockIndex) => {
      const image = block.image && typeof block.image === "object" ? block.image as { url?: unknown; altText?: unknown; focalX?: unknown; focalY?: unknown; width?: unknown; height?: unknown } : null;
      return <article key={blockIndex} data-block-type={String(block.type ?? "story")}><span>{String(block.heading ?? block.type ?? "Story")}</span>{image?.url ? <img src={String(image.url)} alt={String(image.altText ?? "")} width={Number(image.width ?? 1)} height={Number(image.height ?? 1)} loading="lazy" decoding="async" style={{ objectPosition: `${Number(image.focalX ?? 0.5) * 100}% ${Number(image.focalY ?? 0.5) * 100}%` }} /> : <p>{String(block.text ?? "")}</p>}</article>;
    })}</div>
    <nav className="site-container project-case-study__nav" aria-label="Adjacent projects">{index > 0 ? <Link to={`/works/${projects[index - 1].slug}`}>Previous / {projects[index - 1].title}</Link> : <span />}{index < projects.length - 1 ? <Link to={`/works/${projects[index + 1].slug}`}>Next / {projects[index + 1].title}</Link> : <Link to="/contact">Start a project</Link>}</nav>
  </section>;
}

export function WorksPage() {
  const settings = useSiteSettings();
  const { projectSlug } = useParams();
  const resource = usePublicProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const projects = resource.status === "ready" ? resource.projects : [];
  const categories = [...new Set(projects.map((project) => project.category))];
  const requestedFilter = searchParams.get("category") ?? "all";
  const filter = requestedFilter === "all" || categories.includes(requestedFilter) ? requestedFilter : "all";
  const visible = filter === "all" ? projects : projects.filter((project) => project.category === filter);
  const activeIndex = projectSlug ? projects.findIndex((project) => project.slug === projectSlug) : -1;
  const active = activeIndex >= 0 ? projects[activeIndex] : undefined;

  if (projectSlug) {
    if (resource.status === "loading") return <SiteShell headerTheme="light"><main className="reserved-page theme-light"><div className="site-container empty-state"><h1>Loading project…</h1></div></main></SiteShell>;
    if (resource.status === "error") return <SiteShell headerTheme="light"><main className="reserved-page theme-light"><div className="site-container empty-state"><h1>Project could not load.</h1><p>{resource.message}</p><button type="button" onClick={resource.retry}>Try again</button></div></main></SiteShell>;
    return <SiteShell headerTheme="light">{active ? <ProjectCaseStudy project={active} projects={projects} index={activeIndex} /> : <main className="reserved-page theme-light"><div className="site-container empty-state"><h1>That project is not published.</h1><Link to="/works">Return to Works</Link></div></main>}</SiteShell>;
  }

  return (
    <SiteShell headerTheme="light">
      <section className="works-intro theme-light route-heading-reveal" aria-labelledby="works-heading">
        <div className="site-container works-intro__grid">
          <p className="eyebrow">{settings.works.eyebrow}</p>
          <h1 id="works-heading">{settings.works.headingBefore} <em>{settings.works.headingAccent}</em>{settings.works.headingAfter ? ` ${settings.works.headingAfter}` : ""}</h1>
          <p>{settings.works.introduction}</p>
        </div>
      </section>

      <section className="works-foundation theme-light" aria-label="Published projects">
        <div className="site-container works-filter" aria-label="Filter projects">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setSearchParams({})}>All</button>
          {categories.map((category) => <button key={category} type="button" aria-pressed={filter === category} onClick={() => setSearchParams({ category })}>{category}</button>)}
          <p className="works-filter__status" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}</p>
        </div>
        <div className="site-container project-grid">
          {resource.status === "loading" ? <div className="project-loading" aria-label="Loading projects"><span /><span /><span /></div> : null}
          {resource.status === "error" ? <div className="empty-state"><h2>Projects could not load.</h2><p>{resource.message}</p><button type="button" onClick={resource.retry}>Try again</button></div> : null}
          {resource.status === "ready" && visible.length === 0 ? <div className="empty-state"><h2>No published work in this view.</h2><p>Choose another filter or publish a project from Admin.</p></div> : null}
          {visible.map((project, index) => <ProjectCard key={project.id} project={project} priority={index === 0} />)}
        </div>
        <div className="site-container empty-state"><p className="eyebrow">No invented client work</p><h2>Have a real project for this workbench?</h2><p>Commissioned projects will replace concept positions as approved material becomes available.</p><ButtonLink href="/contact" variant="outline">Start a project</ButtonLink></div>
      </section>
    </SiteShell>
  );
}
