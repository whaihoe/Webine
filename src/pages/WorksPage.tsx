import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";

export function WorksPage() {
  return (
    <SiteShell headerTheme="light">
      <section className="works-intro theme-light" aria-labelledby="works-heading">
        <div className="site-container works-intro__grid">
          <p className="eyebrow">Selected work / In preparation</p>
          <h1 id="works-heading">
            Work with a clear <em>point of view.</em>
          </h1>
          <p>
            Webine's portfolio will prioritise strong project stories over a dense wall of cards. Approved projects have not been added yet.
          </p>
        </div>
      </section>

      <section className="works-foundation theme-light" aria-label="Project system preview">
        <div className="site-container project-foundation-grid">
          <article className="project-placeholder project-placeholder--feature">
            <div className="project-placeholder__media" aria-hidden="true">
              <span>8 columns</span>
            </div>
            <div className="project-placeholder__meta">
              <span>Featured project position</span>
              <span>Content pending</span>
            </div>
          </article>

          <article className="project-placeholder project-placeholder--secondary">
            <div className="project-placeholder__media" aria-hidden="true">
              <span>4 columns</span>
            </div>
            <div className="project-placeholder__meta">
              <span>Secondary project position</span>
              <span>Content pending</span>
            </div>
          </article>
        </div>

        <div className="site-container empty-state">
          <p className="eyebrow">No invented client work</p>
          <h2>Projects are being prepared.</h2>
          <p>
            Real projects or clearly labelled concepts will replace these layout references when approved material is available.
          </p>
          <ButtonLink href="/contact" variant="outline">
            Start a project
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
