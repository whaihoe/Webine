import { AmbientParticleField } from "../components/AmbientParticleField";
import { ServicesChapterController } from "../components/services/ServicesChapterController";
import { SiteShell } from "../components/SiteShell";
import { servicesContent } from "../content/services-content";
import { usePageMetadata } from "../hooks/usePageMetadata";

export function ServicesPage() {
  usePageMetadata(
    "Services | Webine",
    "Website design, redesign, landing pages, branding support, SEO foundations and ongoing website care from Webine.",
  );

  return (
    <SiteShell>
      <div className="services-page theme-dark">
        <div className="services-page__ambient" aria-hidden="true">
          <div className="services-page__ambient-sticky">
            <AmbientParticleField variant="services" className="ambient-particle-field--services" />
            <span />
          </div>
        </div>
        <section className="services-hero" aria-labelledby="services-heading">
          <div className="site-container services-hero__grid page-header-copy">
            <p className="eyebrow page-header-copy__eyebrow" data-gsap-reveal="copy">{servicesContent.hero.eyebrow}</p>
            <h1 className="page-header-copy__title" id="services-heading" data-gsap-reveal="copy" data-gsap-delay="0.08">
              {servicesContent.hero.headingLead} <em>{servicesContent.hero.headingAccent}</em>
            </h1>
            <p className="page-header-copy__summary" data-gsap-reveal="copy" data-gsap-delay="0.16">{servicesContent.hero.introduction}</p>
          </div>
        </section>

        <section className="services-offer" aria-label="Webine services">
          <ServicesChapterController />
        </section>
      </div>
    </SiteShell>
  );
}
