import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";
import { useSiteSettings } from "../content/SiteSettingsProvider";

const privacySections = [
  {
    id: "information",
    title: "Information Webine collects",
    content: (
      <>
        <p>When you submit a project enquiry, Webine receives the details you choose to provide. These can include your name, email address, company, current website, service interest, budget range, preferred timeline and project outline.</p>
        <p>The enquiry record also includes the consent version, source page, submission time and delivery status needed to process and review it. Abuse prevention uses short-lived, keyed identifiers derived from connection and email information. Webine does not store the raw IP address in the enquiry record.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "How the information is used",
    content: (
      <p>Webine uses enquiry information to understand your request, reply to you, prepare possible project work, maintain a reliable enquiry history and protect the website from spam or misuse. It is not used for unrelated advertising profiles.</p>
    ),
  },
  {
    id: "sharing",
    title: "Service providers and sharing",
    content: (
      <>
        <p>Webine does not sell personal information. Limited information is processed by services that operate the website: Cloudflare for hosting, media delivery and abuse protection, Turso for database storage, Clerk for protected Admin authentication and Resend when an enquiry notification email is sent.</p>
        <p>Information may also be disclosed when required by law, to protect Webine or another person, or as part of a business transfer where appropriate safeguards apply.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    content: (
      <p>Enquiries are normally retained for up to 12 months after the last correspondence. They may be kept longer when needed for an active project, a legal obligation or a dispute. Short-lived rate-limit and duplicate-prevention records are removed as they expire. Published project content and media remain until they are updated, archived or no longer needed.</p>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <p>Webine limits Admin access, validates public requests, protects sensitive routes from caching and uses managed providers for encrypted connections and storage access. No internet service can promise absolute security, but access and retention are kept proportionate to the purpose of the information.</p>
    ),
  },
  {
    id: "choices",
    title: "Your choices",
    content: (
      <p>You can ask what information Webine holds about you, request a correction or ask for deletion where the information is no longer required. Webine may need to verify your identity before acting on a request. You can also choose not to submit the enquiry form and contact Webine later when you are ready.</p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and measurement",
    content: (
      <p>The public website does not use advertising trackers. Essential browser or provider storage may be used for security, protected Admin sessions and reliable website operation. If analytics or marketing tools are introduced later, this notice will be updated before they are treated as part of the normal website experience.</p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    content: (
      <p>This page may change when Webine changes its forms, providers or legal responsibilities. The current privacy version is shown at the top of the page so a submitted consent record can be matched to the notice in effect at that time.</p>
    ),
  },
] as const;

export function PrivacyPage() {
  const settings = useSiteSettings();

  return (
    <SiteShell>
      <article className="privacy-page">
        <header className="privacy-page__hero theme-dark" aria-labelledby="privacy-page-heading">
          <div className="site-container privacy-page__hero-grid page-header-copy">
            <p className="eyebrow page-header-copy__eyebrow" data-gsap-reveal="copy">Privacy / Webine</p>
            <h1 className="page-header-copy__title" id="privacy-page-heading" data-gsap-reveal="copy" data-gsap-delay="0.08">
              Clear about what <em>stays private.</em>
            </h1>
            <p className="page-header-copy__summary" data-gsap-reveal="copy" data-gsap-delay="0.16">This notice explains what Webine collects through the website, why it is needed and the choices available to you.</p>
            <p className="privacy-page__version" data-gsap-reveal="copy" data-gsap-delay="0.22">Privacy version {settings.contact.privacyVersion}</p>
          </div>
        </header>

        <div className="privacy-page__body theme-light">
          <div className="site-container privacy-page__layout">
            <aside className="privacy-page__summary" aria-label="Privacy summary" data-gsap-reveal="copy">
              <p className="eyebrow">At a glance</p>
              <p>{settings.contact.privacy}</p>
              <nav aria-label="Privacy sections">
                {privacySections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="privacy-page__sections">
              {privacySections.map((section, index) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} data-gsap-reveal="copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 id={`${section.id}-heading`}>{section.title}</h2>
                    {section.content}
                  </div>
                </section>
              ))}

              <section id="contact-privacy" aria-labelledby="contact-privacy-heading" data-gsap-reveal="copy">
                <span>09</span>
                <div>
                  <h2 id="contact-privacy-heading">Privacy requests</h2>
                  <p>Use the secure project enquiry form and clearly state that your message is about privacy. Include enough information for Webine to identify the earlier enquiry, but do not send passwords, payment details or unnecessary sensitive information.</p>
                  <Link className="privacy-page__contact" to="/contact">Go to the contact form</Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
