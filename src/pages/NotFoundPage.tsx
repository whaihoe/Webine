import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";

export function NotFoundPage() {
  return (
    <SiteShell>
      <section className="reserved-page reserved-page--dark theme-dark" aria-labelledby="not-found-heading">
        <div className="site-container reserved-page__grid page-header-copy page-header-copy--case">
          <p className="eyebrow page-header-copy__eyebrow">404 / Lost in the process</p>
          <h1 className="page-header-copy__title" id="not-found-heading">This page is not part of the story.</h1>
          <p className="page-header-copy__summary">The link may have moved, or the page may no longer exist. Start with the work, or return to the studio.</p>
          <div className="reserved-page__actions">
            <ButtonLink href="/works" variant="primary">View work</ButtonLink>
            <ButtonLink href="/" variant="outline">Return home</ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
