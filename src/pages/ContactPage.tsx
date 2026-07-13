import { FormField } from "../components/FormField";
import { SiteShell } from "../components/SiteShell";

export function ContactPage() {
  return (
    <SiteShell>
      <section className="contact-section theme-dark" aria-labelledby="contact-heading">
        <div className="site-container contact-section__grid">
          <div className="contact-section__intro">
            <p className="eyebrow">Start a project / Singapore</p>
            <h1 id="contact-heading">
              Have something worth making <em>unmistakable?</em>
            </h1>
            <p>
              Tell Webine what you are building, where the current website falls short and what a stronger digital presence should change.
            </p>

            <dl className="contact-details">
              <div>
                <dt>Availability</dt>
                <dd>Final wording pending</dd>
              </div>
              <div>
                <dt>Direct email</dt>
                <dd>Contact detail pending</dd>
              </div>
            </dl>
          </div>

          <form className="contact-form-preview" aria-describedby="form-stage-note">
            <div className="contact-form-preview__heading">
              <span className="eyebrow">Enquiry form / Structure preview</span>
              <p id="form-stage-note">
                Fields are intentionally disabled until the enquiry pipeline is implemented.
              </p>
            </div>
            <div className="contact-form-preview__grid">
              <FormField id="name" label="Name" placeholder="Your name" />
              <FormField id="email" label="Email" placeholder="you@company.com" type="email" />
              <FormField id="company" label="Company" placeholder="Business name" />
              <FormField id="website" label="Current website" placeholder="Optional website" />
            </div>
            <FormField
              id="project"
              label="Project outline"
              placeholder="What should the new website help you achieve?"
              multiline
            />
            <button className="form-submit-preview" type="button" disabled>
              Submit enquiry
              <span>Available in Stage 19</span>
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
