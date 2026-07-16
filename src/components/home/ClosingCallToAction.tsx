import { ButtonLink } from "../ButtonLink";
import { SignalGrid } from "./SignalGrid";
import { MobileSectionParticles } from "./MobileSectionParticles";
import { useParticleSceneAnchor } from "./ParticleSceneController";
import { useSiteSettings } from "../../content/SiteSettingsProvider";

export function ClosingCallToAction() {
  const registerScene = useParticleSceneAnchor("closing");
  const settings = useSiteSettings();
  const publicEmail = settings.contact.email || import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim();

  return (
    <section
      ref={(element) => {
        registerScene(element);
      }}
      className="closing-cta theme-dark"
      aria-labelledby="closing-heading"
      data-particle-scene="closing"
    >
      <SignalGrid className="signal-grid--closing" />
      <MobileSectionParticles scene="closing" />
      <div className="site-container closing-cta__layout">
        <p className="eyebrow" data-gsap-reveal="copy">{settings.closing.eyebrow}</p>
        <h2 id="closing-heading" data-gsap-reveal="copy">
          {settings.closing.titleLead} <em>{settings.closing.titleAccent}</em>
        </h2>
        <p data-gsap-reveal="copy">
          {settings.closing.copy}
        </p>
        <div className="closing-cta__action" data-gsap-reveal="copy"><ButtonLink href={settings.closing.cta.href}>{settings.closing.cta.label}</ButtonLink></div>
        <div className="closing-cta__availability" data-gsap-reveal="copy">
          <span>{settings.contact.availability}</span>
          {publicEmail ? <a href={`mailto:${publicEmail}`}>{publicEmail}</a> : <span>Based in {settings.footer.location}</span>}
        </div>
      </div>
    </section>
  );
}
