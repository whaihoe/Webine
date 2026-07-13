import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";
import { featuredProjects } from "../content/featured-projects";

export function WorksPage() {
  return (
    <SiteShell headerTheme="light">
      <section className="works-intro theme-light" aria-labelledby="works-heading">
        <div className="site-container works-intro__grid">
          <p className="eyebrow">Selected work / Current workbench</p>
          <h1 id="works-heading">
            Work with a clear <em>point of view.</em>
          </h1>
          <p>
            Webine's portfolio prioritises clear project stories over a dense wall of cards. Current entries are labelled honestly while commissioned work is being prepared.
          </p>
        </div>
      </section>

      <section className="works-foundation theme-light" aria-label="Project system preview">
        <div className="site-container project-foundation-grid">
          {featuredProjects.map((project, index) => (
            <article
              key={project.slug}
              className={`project-placeholder ${
                index === 0
                  ? "project-placeholder--feature"
                  : "project-placeholder--secondary"
              }`}
            >
              <div
                className={`project-placeholder__media project-placeholder__media--${project.visual}`}
                aria-hidden="true"
              >
                <span>Webine / {project.year}</span>
              </div>
              <div className="project-placeholder__meta">
                <span>{project.label}</span>
                <span>{project.year}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <ul className="project-placeholder__services" aria-label="Services">
                {project.services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="site-container empty-state">
          <p className="eyebrow">No invented client work</p>
          <h2>Have a real project for this workbench?</h2>
          <p>
            Commissioned projects will replace the concept positions as approved material becomes available.
          </p>
          <ButtonLink href="/contact" variant="outline">
            Start a project
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
