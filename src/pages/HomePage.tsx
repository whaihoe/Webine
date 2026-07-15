import { useCallback, useRef } from "react";
import { ButtonLink } from "../components/ButtonLink";
import { HeroCoverTransition } from "../components/home/HeroCoverTransition";
import { HeroEntranceTimeline } from "../components/home/HeroEntranceTimeline";
import { HomeParticleExperience } from "../components/home/HomeParticleExperience";
import { MobileSectionParticles } from "../components/home/MobileSectionParticles";
import { ClosingCallToAction } from "../components/home/ClosingCallToAction";
import { useParticleSceneAnchor } from "../components/home/ParticleSceneController";
import { ProcessTimeline } from "../components/home/ProcessTimeline";
import { QuietInterlude } from "../components/home/QuietInterlude";
import { ReachSection } from "../components/home/ReachSection";
import { SelectedWorkRunway } from "../components/home/SelectedWorkRunway";
import { SignalGrid } from "../components/home/SignalGrid";
import { SiteShell } from "../components/SiteShell";
import { useSiteSettings } from "../content/SiteSettingsProvider";

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
  const settings = useSiteSettings();
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
      <HeroCoverTransition rootRef={heroRef} />
      <div className="hero-reach-cover">
        <section
          ref={connectHero}
          className="hero-section theme-dark"
          aria-labelledby="home-heading"
          data-particle-scene="hero"
        >
          <SignalGrid className="signal-grid--hero" />
          <MobileSectionParticles scene="hero" />
          <div className="site-container hero-section__grid">
            <div className="hero-section__copy">
              <p className="eyebrow" data-hero-intro="eyebrow">
                {settings.hero.eyebrow}
              </p>
              <h1 id="home-heading">
                <span className="hero-intro-line" data-hero-intro="headline-line">
                  {settings.hero.headingBefore}
                </span>
                <span className="hero-intro-line" data-hero-intro="headline-line">
                  <em>{settings.hero.headingAccent}</em>{settings.hero.headingAfter ? ` ${settings.hero.headingAfter}` : ""}
                </span>
              </h1>
              <p
                className="hero-section__description"
                data-hero-intro="description"
              >
                {settings.hero.supportingCopy}
              </p>
              <div className="hero-section__actions" data-hero-intro="actions">
                <ButtonLink href={settings.hero.primaryCta.href}>{settings.hero.primaryCta.label}</ButtonLink>
                <ButtonLink href={settings.hero.secondaryCta.href} variant="quiet">
                  {settings.hero.secondaryCta.label}
                </ButtonLink>
              </div>
            </div>

            <p
              className="hero-section__scroll-cue"
              data-hero-intro="scroll-cue"
            >
              {settings.hero.scrollCue}
            </p>
          </div>
        </section>

        <ReachSection />
      </div>
      <SelectedWorkRunway />
      <QuietInterlude />
      <ProcessTimeline />
      <ClosingCallToAction />
    </>
  );
}
