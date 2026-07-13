import { useCallback, useRef } from "react";
import { ButtonLink } from "../components/ButtonLink";
import { HeroEntranceTimeline } from "../components/home/HeroEntranceTimeline";
import { HomeParticleExperience } from "../components/home/HomeParticleExperience";
import { ClosingCallToAction } from "../components/home/ClosingCallToAction";
import { useParticleSceneAnchor } from "../components/home/ParticleSceneController";
import { ProcessTimeline } from "../components/home/ProcessTimeline";
import { QuietInterlude } from "../components/home/QuietInterlude";
import { ReachSection } from "../components/home/ReachSection";
import { SelectedWorkRunway } from "../components/home/SelectedWorkRunway";
import { SignalGrid } from "../components/home/SignalGrid";
import { SiteShell } from "../components/SiteShell";

export function HomePage() {
  return (
    <SiteShell>
      <HomeParticleExperience>
        <HomeContent />
      </HomeParticleExperience>
    </SiteShell>
  );
}

function HomeContent() {
  const heroSceneRef = useParticleSceneAnchor("hero");
  const heroRef = useRef<HTMLElement | null>(null);
  const connectHero = useCallback(
    (element: HTMLElement | null) => {
      heroRef.current = element;
      heroSceneRef(element);
    },
    [heroSceneRef],
  );

  return (
    <>
      <HeroEntranceTimeline rootRef={heroRef} />
      <section
        ref={connectHero}
        className="hero-section theme-dark"
        aria-labelledby="home-heading"
        data-particle-scene="hero"
      >
        <SignalGrid className="signal-grid--hero" />
        <div className="site-container hero-section__grid">
          <div className="hero-section__copy">
            <p className="eyebrow" data-hero-intro="eyebrow">
              Digital agency / Singapore
            </p>
            <h1 id="home-heading">
              <span className="hero-intro-line" data-hero-intro="headline-line">
                Make the ordinary
              </span>
              <span className="hero-intro-line" data-hero-intro="headline-line">
                <em>unmistakable.</em>
              </span>
            </h1>
            <p
              className="hero-section__description"
              data-hero-intro="description"
            >
              Webine designs and develops premium, responsive websites that help businesses look credible, stand out and grow.
            </p>
            <div className="hero-section__actions" data-hero-intro="actions">
              <ButtonLink href="/contact">Start a project</ButtonLink>
              <ButtonLink href="/works" variant="quiet">
                View our work
              </ButtonLink>
            </div>
          </div>

          <p
            className="hero-section__scroll-cue"
            data-hero-intro="scroll-cue"
          >
            Scroll to explore
          </p>
        </div>
      </section>

      <ReachSection />
      <SelectedWorkRunway />
      <QuietInterlude />
      <ProcessTimeline />
      <ClosingCallToAction />
    </>
  );
}
