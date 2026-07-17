import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";

export function NotFoundPage() {
  return (
    <SiteShell>
      <section className="reserved-page reserved-page--dark theme-dark" aria-labelledby="not-found-heading">
        <div className="site-container reserved-page__grid page-header-copy page-header-copy--case">
          <p className="eyebrow page-header-copy__eyebrow">404 / Not found</p>
          <h1 className="page-header-copy__title" id="not-found-heading">This page has not taken shape.</h1>
          <p className="page-header-copy__summary">The address does not match an available Webine page.</p>
          <ButtonLink href="/" variant="outline">
            Return home
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
