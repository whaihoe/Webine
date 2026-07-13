import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";

export function PreviewPage() {
  return (
    <SiteShell headerTheme="light">
      <section className="reserved-page theme-light" aria-labelledby="preview-heading">
        <div className="site-container reserved-page__grid">
          <p className="eyebrow">Reserved route / Preview</p>
          <h1 id="preview-heading">Review before publishing.</h1>
          <p>
            Draft previews will reuse the same public components once the CMS workflow is available. This route currently confirms the visual shell only.
          </p>
          <ButtonLink href="/" variant="outline">
            Return home
          </ButtonLink>
        </div>
      </section>
    </SiteShell>
  );
}
