import { ButtonLink } from "../ButtonLink";
import { SignalGrid } from "./SignalGrid";
import { useParticleSceneAnchor } from "./ParticleSceneController";

export function ClosingCallToAction() {
  const registerScene = useParticleSceneAnchor("closing");

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
      <div className="site-container closing-cta__layout">
        <p className="eyebrow">06 / Start somewhere useful</p>
        <h2 id="closing-heading">
          Bring the potential. <em>We will help shape it.</em>
        </h2>
        <p>
          Tell us what the business needs, what is getting in the way and what
          a stronger website should make possible.
        </p>
        <ButtonLink href="/contact">Start a project</ButtonLink>
      </div>
    </section>
  );
}
