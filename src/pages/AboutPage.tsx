import { AboutHeadExperience } from "../components/about/AboutHeadExperience";
import { PortraitReveal } from "../components/about/PortraitReveal";
import { ButtonLink } from "../components/ButtonLink";
import { SiteShell } from "../components/SiteShell";
import { aboutContent } from "../content/about-content";
import { usePageMetadata } from "../hooks/usePageMetadata";

export function AboutPage() {
  usePageMetadata(
    "About | Webine",
    "Meet the people behind Webine and see how clarity, purposeful motion and dependable development shape the studio's work.",
  );

  return (
    <SiteShell>
      <div className="about-page theme-dark">
        <section className="about-hero" aria-labelledby="about-heading">
          <div className="about-hero__frame" data-about-hero-frame>
            <div className="site-container about-hero__copy page-header-copy" data-about-hero-copy>
              <p className="eyebrow page-header-copy__eyebrow" data-gsap-reveal="copy">{aboutContent.hero.eyebrow}</p>
              <h1 className="page-header-copy__title" id="about-heading" data-gsap-reveal="copy" data-gsap-delay="0.08">
                {aboutContent.hero.headingLead} <em>{aboutContent.hero.headingAccent}</em>
              </h1>
              <p className="page-header-copy__summary" data-gsap-reveal="copy" data-gsap-delay="0.16">{aboutContent.hero.introduction}</p>
            </div>
            <AboutHeadExperience />
          </div>
        </section>

        <section className="about-statement" aria-labelledby="about-statement-heading">
          <div className="site-container about-statement__grid">
            <p className="eyebrow" data-gsap-reveal="copy">{aboutContent.statement.eyebrow}</p>
            <div>
              <h2 id="about-statement-heading" data-gsap-reveal="copy">{aboutContent.statement.heading}</h2>
              <p data-gsap-reveal="copy" data-gsap-delay="0.1">{aboutContent.statement.copy}</p>
            </div>
          </div>
        </section>

        <section className="about-team" aria-labelledby="about-team-heading">
          <div className="site-container about-team__heading">
            <p className="eyebrow" data-gsap-reveal="copy">The people behind Webine</p>
            <h2 id="about-team-heading" data-gsap-reveal="copy">A small team with room to look closer.</h2>
          </div>
          <div className="site-container about-team__portraits">
            {aboutContent.team.map((person, index) => (
              <PortraitReveal key={person.name} {...person} index={String(index + 1).padStart(2, "0")} reverse={index % 2 === 1} />
            ))}
          </div>
        </section>

        <section className="about-principles" aria-labelledby="about-principles-heading">
          <div className="site-container about-principles__intro">
            <p className="eyebrow" data-gsap-reveal="copy">Working principles</p>
            <h2 id="about-principles-heading" data-gsap-reveal="copy">Distinctive where it matters. Dependable everywhere else.</h2>
          </div>
          <div className="site-container about-principles__list">
            {aboutContent.principles.map((principle) => (
              <article key={principle.index} data-gsap-reveal="card">
                <span>{principle.index}</span>
                <h3>{principle.title}</h3>
                <p>{principle.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-cta" aria-labelledby="about-cta-heading">
          <div className="site-container about-cta__inner" data-gsap-reveal="copy">
            <p className="eyebrow">Have something worth shaping?</p>
            <h2 id="about-cta-heading">Bring us the scattered version.</h2>
            <p>We can find the structure together.</p>
            <ButtonLink href="/contact">Start a project</ButtonLink>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
