import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";

export function NotFoundPage() {
  return (
    <SiteShell>
      <section className="reserved-page reserved-page--dark theme-dark" aria-labelledby="not-found-heading">
        <div className="site-container reserved-page__grid">
          <p className="eyebrow">404 / Not found</p>
          <h1 id="not-found-heading">This page has not taken shape.</h1>
          <p>The address does not match an available Webine page.</p>
          <ButtonLink href="/" variant="outline">
            Return home
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
