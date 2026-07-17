import { ButtonLink } from "../components/ButtonLink";
import { AmbientParticleField } from "../components/AmbientParticleField";
import { ServicesChapterController } from "../components/services/ServicesChapterController";
import { SiteShell } from "../components/SiteShell";
import { servicesContent } from "../content/services-content";
import { useSiteSettings } from "../content/SiteSettingsProvider";
import { usePageMetadata } from "../hooks/usePageMetadata";

export function ServicesPage() {
  const settings = useSiteSettings();
  usePageMetadata(
    "Services | Webine",
    "Web design, website redesign, maintenance, SEO foundations and branding support for businesses that need a stronger digital presence.",
  );

  return (
    <SiteShell>
      <div className="services-page theme-dark">
        <section className="services-hero" aria-labelledby="services-heading">
          <AmbientParticleField count={64} className="ambient-particle-field--services" />
          <div className="services-hero__field" aria-hidden="true"><span /><span /><span /></div>
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

        <section className="services-ownership theme-light" aria-labelledby="services-ownership-heading">
          <div className="site-container services-ownership__grid">
            <p className="eyebrow" data-gsap-reveal="copy">{servicesContent.ownership.eyebrow}</p>
            <div>
              <h2 id="services-ownership-heading" data-gsap-reveal="copy">{servicesContent.ownership.heading}</h2>
              <p data-gsap-reveal="copy" data-gsap-delay="0.1">{servicesContent.ownership.copy}</p>
            </div>
          </div>
        </section>

        <section className="services-process" aria-labelledby="services-process-heading">
          <div className="site-container services-process__heading">
            <p className="eyebrow" data-gsap-reveal="copy">A clear working path</p>
            <h2 id="services-process-heading" data-gsap-reveal="copy">Enough structure to move. Enough room to think.</h2>
          </div>
          <div className="site-container services-process__steps">
            {settings.processSteps.map((step, index) => (
              <article key={step.title} data-gsap-reveal="card" data-gsap-delay={index * 0.05}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.action}</p>
                <small>{step.output}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="services-cta" aria-labelledby="services-cta-heading">
          <div className="site-container services-cta__inner" data-gsap-reveal="copy">
            <p className="eyebrow">Start with the real problem</p>
            <h2 id="services-cta-heading">Not sure which service you need?</h2>
            <p>Tell us what the website needs to change for the business. The right scope can follow from there.</p>
            <ButtonLink href="/contact">Start a project</ButtonLink>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
