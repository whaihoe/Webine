import { useState, type ChangeEvent, type FormEvent } from "react";
import { AmbientParticleField } from "../components/AmbientParticleField";
import { DirectionalArrow } from "../components/DirectionalArrow";
import { FormField } from "../components/FormField";
import { SiteShell } from "../components/SiteShell";
import { useSiteSettings } from "../content/SiteSettingsProvider";
const initialForm = {
  name: "",
  email: "",
  company: "",
  website: "",
  serviceInterest: "",
  budgetRange: "",
  timeline: "",
  details: "",
  websiteConfirm: "",
  consent: false,
};

type ContactForm = typeof initialForm;
type SubmissionState = { status: "idle" | "submitting" | "success" | "error"; message: string };
type FieldErrors = Partial<Record<keyof ContactForm, string>>;

const errorFields: Record<string, Array<keyof ContactForm>> = {
  NAME_REQUIRED: ["name"],
  EMAIL_INVALID: ["email"],
  WEBSITE_INVALID: ["website"],
  SELECTION_REQUIRED: ["serviceInterest", "timeline"],
  DETAILS_REQUIRED: ["details"],
  CONSENT_REQUIRED: ["consent"],
};

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle", message: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const settings = useSiteSettings();
  const publicEmail = settings.contact.email || import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim();
  const headingWords = settings.contact.heading.split(/\s+/);
  const headingAccent = headingWords.pop() ?? "";
  const headingLead = headingWords.join(" ");

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmission({ status: "submitting", message: "" });
    setFieldErrors({});

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consentVersion: settings.contact.privacyVersion, sourcePage: "/contact" }),
      });
      const envelope = await response.json() as { data: { accepted: boolean } | null; error: { code: string; message: string } | null };
      if (!response.ok || !envelope.data?.accepted) {
        const submissionError = new Error(envelope.error?.message || "Your enquiry could not be sent.") as Error & { code?: string };
        submissionError.code = envelope.error?.code;
        throw submissionError;
      }
      setForm(initialForm);
      setSubmission({ status: "success", message: "Thank you. Your enquiry is safely with Webine and we will reply as soon as possible." });
    } catch (error) {
      const code = error instanceof Error && "code" in error ? String(error.code) : "";
      const fields = errorFields[code] ?? [];
      if (fields.length > 0) {
        const message = error instanceof Error ? error.message : "Review this field.";
        setFieldErrors(Object.fromEntries(fields.map((field) => [field, message])) as FieldErrors);
        window.requestAnimationFrame(() => document.getElementById(fields[0])?.focus());
      }
      setSubmission({ status: "error", message: error instanceof Error ? error.message : "Your enquiry could not be sent. Please try again." });
    }
  }

  return (
    <SiteShell>
      <section className="contact-section theme-dark" aria-labelledby="contact-heading">
        <AmbientParticleField variant="contact" />
        <div className="site-container contact-section__grid">
          <div className="contact-section__intro page-header-copy page-header-copy--contact">
            <p className="eyebrow page-header-copy__eyebrow" data-gsap-reveal="copy">Start a project / Singapore</p>
            <h1 className="page-header-copy__title" id="contact-heading" data-gsap-reveal="copy" data-gsap-delay="0.08">{headingLead} <em>{headingAccent}</em></h1>
            <p className="page-header-copy__summary" data-gsap-reveal="copy" data-gsap-delay="0.16">{settings.contact.introduction}</p>

            <dl className="contact-details">
              <div data-gsap-reveal="copy" data-gsap-delay="0.22"><dt>Availability</dt><dd>{settings.contact.availability}</dd></div>
              <div data-gsap-reveal="copy" data-gsap-delay="0.28"><dt>Direct email</dt><dd>{publicEmail ? <a href={`mailto:${publicEmail}`}>{publicEmail}</a> : "Use the secure form"}</dd></div>
            </dl>
          </div>

          <form className="contact-form" onSubmit={submitEnquiry} aria-describedby="contact-form-note" data-gsap-parallax="float-card">
            <div className="contact-form__heading" data-gsap-reveal="copy" data-gsap-delay="0.12">
              <span className="eyebrow">Project enquiry</span>
              <p id="contact-form-note">{settings.contact.responseNote}</p>
            </div>
            <div className="contact-form__grid">
              <FormField id="name" name="name" label="Name" placeholder="Your name" value={form.name} onChange={updateField} required autoComplete="name" error={fieldErrors.name} revealDelay={0.16} />
              <FormField id="email" name="email" label="Email" placeholder="you@company.com" type="email" value={form.email} onChange={updateField} required autoComplete="email" error={fieldErrors.email} revealDelay={0.22} />
              <FormField id="company" name="company" label="Company" placeholder="Business name" value={form.company} onChange={updateField} autoComplete="organization" revealDelay={0.28} />
              <FormField id="website" name="website" label="Current website" placeholder="https://example.com" type="url" value={form.website} onChange={updateField} autoComplete="url" error={fieldErrors.website} revealDelay={0.34} />
              <label className="form-select" htmlFor="service-interest" data-gsap-reveal="copy" data-gsap-delay="0.4"><span>What do you need? *</span><select id="service-interest" name="serviceInterest" value={form.serviceInterest} onChange={updateField} required aria-invalid={Boolean(fieldErrors.serviceInterest)} aria-describedby={fieldErrors.serviceInterest ? "service-interest-error" : undefined}><option value="">Choose one</option>{settings.contact.serviceOptions.map((option) => <option key={option}>{option}</option>)}</select>{fieldErrors.serviceInterest ? <small id="service-interest-error" className="form-field__error">{fieldErrors.serviceInterest}</small> : null}</label>
              <label className="form-select" htmlFor="budget-range" data-gsap-reveal="copy" data-gsap-delay="0.46"><span>Working budget</span><select id="budget-range" name="budgetRange" value={form.budgetRange} onChange={updateField}><option value="">Still defining</option>{settings.contact.budgetOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="form-select" htmlFor="timeline" data-gsap-reveal="copy" data-gsap-delay="0.52"><span>Preferred timeline *</span><select id="timeline" name="timeline" value={form.timeline} onChange={updateField} required aria-invalid={Boolean(fieldErrors.timeline)} aria-describedby={fieldErrors.timeline ? "timeline-error" : undefined}><option value="">Choose one</option>{settings.contact.timelineOptions.map((option) => <option key={option}>{option}</option>)}</select>{fieldErrors.timeline ? <small id="timeline-error" className="form-field__error">{fieldErrors.timeline}</small> : null}</label>
            </div>
            <FormField id="details" name="details" label="Project outline" placeholder="What should the website help the business achieve?" value={form.details} onChange={updateField} multiline required minLength={20} error={fieldErrors.details} revealDelay={0.58} />
            <label className="contact-form__honeypot" aria-hidden="true">Leave this field empty<input name="websiteConfirm" value={form.websiteConfirm} onChange={updateField} tabIndex={-1} autoComplete="off" /></label>
            <label className="contact-form__consent" data-gsap-reveal="copy" data-gsap-delay="0.64"><input id="consent" type="checkbox" checked={form.consent} onChange={(event) => { setForm((current) => ({ ...current, consent: event.currentTarget.checked })); setFieldErrors((current) => ({ ...current, consent: undefined })); }} required aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={fieldErrors.consent ? "consent-error" : undefined} /><span>I have read the <a href="#privacy">privacy notice</a> and agree to Webine using these details to respond to my enquiry.{fieldErrors.consent ? <small id="consent-error" className="form-field__error">{fieldErrors.consent}</small> : null}</span></label>
            <button className="form-submit" type="submit" disabled={submission.status === "submitting"} data-gsap-reveal="copy" data-gsap-delay="0.7">{submission.status === "submitting" ? "Sending enquiry..." : "Submit enquiry"}<DirectionalArrow /></button>
            {submission.status === "success" || submission.status === "error" ? <p className={`contact-form__status contact-form__status--${submission.status}`} role={submission.status === "error" ? "alert" : "status"}>{submission.message}</p> : null}
          </form>
        </div>
      </section>

      <section id="privacy" className="privacy-notice theme-light" aria-labelledby="privacy-heading" tabIndex={-1}>
        <div className="site-container privacy-notice__layout">
          <p className="eyebrow" data-gsap-reveal="copy">Privacy / Enquiries</p>
          <div data-gsap-reveal="copy" data-gsap-delay="0.1"><h2 id="privacy-heading">Your project details stay purposeful.</h2><p>{settings.contact.privacy}</p><p>If you want to ask about or remove an enquiry, use this form again and clearly mention your earlier submission.</p></div>
        </div>
      </section>
    </SiteShell>
  );
}
