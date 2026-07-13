import { ButtonLink } from "../components/ButtonLink";
import { SectionHeading } from "../components/SectionHeading";
import { SiteShell } from "../components/SiteShell";

const foundations = [
  {
    index: "01",
    title: "A clear system",
    description: "One token structure now controls colour, type, spacing and component behaviour.",
  },
  {
    index: "02",
    title: "Made for every screen",
    description: "The layout recomposes from a four-column mobile grid to a twelve-column desktop grid.",
  },
  {
    index: "03",
    title: "Expression with purpose",
    description: "The static shell stays complete before particles, smooth scrolling and transitions are enabled.",
  },
];

export function HomePage() {
  return (
    <SiteShell>
      <section className="hero-section theme-dark" aria-labelledby="home-heading">
        <div className="signal-grid signal-grid--resting" aria-hidden="true" />
        <div className="site-container hero-section__grid">
          <div className="hero-section__copy">
            <p className="eyebrow">Digital agency / Singapore</p>
            <h1 id="home-heading">
              Make the ordinary <em>unmistakable.</em>
            </h1>
            <p className="hero-section__description">
              Webine designs and develops premium, responsive websites that help businesses look credible, stand out and grow.
            </p>
            <div className="hero-section__actions">
              <ButtonLink href="/contact">Start a project</ButtonLink>
              <ButtonLink href="/works" variant="quiet">
                View our work
              </ButtonLink>
            </div>
          </div>

          <div className="hero-object" aria-hidden="true">
            <span className="hero-object__index">W / 01</span>
            <div className="hero-object__frame">
              <img src="/webine-logo-primary.png" alt="" width="174" height="103" />
            </div>
            <span className="hero-object__caption">Identity taking shape</span>
          </div>

          <p className="hero-section__scroll-cue">Scroll to explore</p>
        </div>
      </section>

      <section className="foundation-section theme-light">
        <div className="site-container">
          <SectionHeading
            index="02"
            eyebrow="Foundation system"
            title="A precise workshop, built before the spectacle."
            description="Webine's visual foundation is now separate from its future motion layer, so the website remains clear and credible in its simplest form."
          />

          <div className="foundation-list">
            {foundations.map((item) => (
              <article key={item.index} className="foundation-list__item">
                <span>{item.index}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <p className="font-status" role="status">
            Development typography: Arial fallback active. Licensed Railway files are still required before launch.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
