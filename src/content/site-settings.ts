export type CtaSetting = { label: string; href: string };
export type PrincipleSetting = { title: string; description: string; example: string };
export type ProcessStepSetting = { title: string; action: string; client: string; output: string };

export type PublicSiteSettings = {
  hero: { eyebrow: string; headingBefore: string; headingAccent: string; headingAfter: string; supportingCopy: string; scrollCue: string; primaryCta: CtaSetting; secondaryCta: CtaSetting };
  positioningStatement: string;
  principles: PrincipleSetting[];
  interlude: { eyebrow: string; titleLead: string; titleAccent: string; statement: string; foundations: string[] };
  processSteps: ProcessStepSetting[];
  closing: { eyebrow: string; titleLead: string; titleAccent: string; copy: string; cta: CtaSetting };
  works: { eyebrow: string; headingBefore: string; headingAccent: string; headingAfter: string; introduction: string };
  contact: { heading: string; introduction: string; responseNote: string; serviceOptions: string[]; budgetOptions: string[]; timelineOptions: string[]; email: string; availability: string; privacy: string; privacyVersion: string };
  footer: { text: string; location: string; copyrightLabel: string };
};

export const defaultSiteSettings: PublicSiteSettings = {
  hero: {
    eyebrow: "Digital agency / Singapore",
    headingBefore: "Make the ordinary",
    headingAccent: "unmistakable.",
    headingAfter: "",
    supportingCopy: "Webine designs and develops premium, responsive websites that help businesses look credible, stand out and grow.",
    scrollCue: "Scroll to explore",
    primaryCta: { label: "Start a project", href: "/contact" },
    secondaryCta: { label: "View our work", href: "/works" },
  },
  positioningStatement: "Good design is not only about looking different. It gives the right information a clearer structure, supports credibility and guides an interested visitor towards a useful next step.",
  principles: [
    { title: "Be found", description: "A clear structure and technically sound foundation make it easier for people and search engines to understand what you offer.", example: "Clear page hierarchy, useful metadata and responsive performance give every important service a reliable place to be discovered." },
    { title: "Be trusted", description: "Distinctive design and credible communication help the business feel considered before the first conversation begins.", example: "Consistent typography, honest proof and purposeful visual choices replace the uncertainty created by a generic or outdated website." },
    { title: "Be chosen", description: "A focused path from interest to enquiry helps visitors understand the next step without pressure or confusion.", example: "Service context, practical answers and one clear action reduce the effort needed to decide whether the business is a good fit." },
  ],
  interlude: {
    eyebrow: "04 / Built beyond launch",
    titleLead: "A website should keep earning its place",
    titleAccent: "after the first impression.",
    statement: "Webine pairs visual direction with a dependable foundation, so the finished website can support the business as its content and needs change.",
    foundations: ["Responsive development that stays considered across screen sizes", "A clear technical structure with a practical SEO foundation", "Room to refine, maintain and extend the website after launch"],
  },
  processSteps: [
    { title: "Understand", action: "We clarify the business, audience, goals and constraints before deciding what the website needs to say.", client: "Share context, priorities and useful source material.", output: "A focused brief and content direction." },
    { title: "Shape", action: "We organise the story, define the visual direction and prototype the interactions that carry the idea.", client: "Review the direction and give clear, timely feedback.", output: "An agreed structure, design system and motion plan." },
    { title: "Build", action: "We turn the approved direction into a responsive, maintainable website and test the complete experience.", client: "Supply final content and approve realistic checkpoints.", output: "A tested website ready for launch preparation." },
    { title: "Support", action: "We prepare the handover, monitor the launch and keep a clear route for future refinements.", client: "Confirm access, ownership and the next priorities.", output: "A usable handover and a practical next-step plan." },
  ],
  closing: { eyebrow: "06 / Start somewhere useful", titleLead: "Bring the potential.", titleAccent: "We will help shape it.", copy: "Tell us what the business needs, what is getting in the way and what a stronger website should make possible.", cta: { label: "Start a project", href: "/contact" } },
  works: { eyebrow: "Selected work / Current workbench", headingBefore: "Work with a clear", headingAccent: "point of view.", headingAfter: "", introduction: "Webine prioritises clear project stories over a dense wall of cards. Concept and internal entries are labelled honestly while commissioned work is prepared." },
  contact: {
    heading: "Have something worth making unmistakable?",
    introduction: "Tell Webine what you are building, where the current website falls short and what a stronger digital presence should change.",
    responseNote: "Share what you know so far. Required fields are marked with an asterisk.",
    serviceOptions: ["New website", "Website redesign", "Brand and website", "Ongoing website support", "Not sure yet"],
    budgetOptions: ["Below S$5,000", "S$5,000 to S$10,000", "S$10,000 to S$20,000", "Above S$20,000"],
    timelineOptions: ["As soon as practical", "Within 1 to 2 months", "Within 3 to 4 months", "Flexible"],
    email: "",
    availability: "Enquiries are open",
    privacy: "Webine collects the details you submit only to review and respond to your project enquiry. They are stored in the protected Webine Admin workspace and are not sold. Please avoid including passwords, payment details or other sensitive information.",
    privacyVersion: "2026-07-15",
  },
  footer: { text: "Distinctive websites shaped around real business potential.", location: "Singapore", copyrightLabel: "Webine" },
};

function text(value: unknown, fallback: string) { return typeof value === "string" && value.trim() ? value.trim() : fallback; }
function object(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function textList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const values = value.map((entry) => typeof entry === "string" ? entry.trim() : text(object(entry).label ?? object(entry).text, "")).filter(Boolean);
  return values.length ? values : fallback;
}
function cta(value: unknown, fallback: CtaSetting) {
  const record = object(value);
  const href = text(record.href, fallback.href);
  return { label: text(record.label, fallback.label), href: href.startsWith("/") ? href : fallback.href };
}
function structuredText(value: unknown, fallback: string) { return typeof value === "string" ? text(value, fallback) : text(object(value).text, fallback); }

export function normalizeSiteSettings(raw: unknown): PublicSiteSettings {
  const value = object(raw);
  const interlude = object(value.home_support_interlude);
  const closing = object(value.home_closing_cta);
  const principles = Array.isArray(value.home_principles) ? value.home_principles.map((entry, index) => {
    const record = object(entry); const fallback = defaultSiteSettings.principles[index];
    return fallback ? { title: text(record.title, fallback.title), description: text(record.description, fallback.description), example: text(record.example, fallback.example) } : null;
  }).filter((entry): entry is PrincipleSetting => Boolean(entry)) : defaultSiteSettings.principles;
  const processSteps = Array.isArray(value.home_process_steps) ? value.home_process_steps.map((entry, index) => {
    const record = object(entry); const fallback = defaultSiteSettings.processSteps[index];
    return fallback ? { title: text(record.title, fallback.title), action: text(record.action, fallback.action), client: text(record.client, fallback.client), output: text(record.output, fallback.output) } : null;
  }).filter((entry): entry is ProcessStepSetting => Boolean(entry)) : defaultSiteSettings.processSteps;
  return {
    hero: { eyebrow: text(value.home_hero_eyebrow, defaultSiteSettings.hero.eyebrow), headingBefore: text(value.home_hero_heading_before, defaultSiteSettings.hero.headingBefore), headingAccent: text(value.home_hero_heading_accent, defaultSiteSettings.hero.headingAccent), headingAfter: text(value.home_hero_heading_after, defaultSiteSettings.hero.headingAfter), supportingCopy: text(value.home_hero_supporting_copy, defaultSiteSettings.hero.supportingCopy), scrollCue: text(value.home_scroll_cue, defaultSiteSettings.hero.scrollCue), primaryCta: cta(value.home_primary_cta, defaultSiteSettings.hero.primaryCta), secondaryCta: cta(value.home_secondary_cta, defaultSiteSettings.hero.secondaryCta) },
    positioningStatement: text(value.home_positioning_statement, defaultSiteSettings.positioningStatement),
    principles: principles.length === 3 ? principles : defaultSiteSettings.principles,
    interlude: { eyebrow: text(interlude.eyebrow, defaultSiteSettings.interlude.eyebrow), titleLead: text(interlude.titleLead, defaultSiteSettings.interlude.titleLead), titleAccent: text(interlude.titleAccent, defaultSiteSettings.interlude.titleAccent), statement: text(interlude.statement, defaultSiteSettings.interlude.statement), foundations: textList(interlude.foundations, defaultSiteSettings.interlude.foundations) },
    processSteps: processSteps.length === 4 ? processSteps : defaultSiteSettings.processSteps,
    closing: { eyebrow: text(closing.eyebrow, defaultSiteSettings.closing.eyebrow), titleLead: text(closing.titleLead, defaultSiteSettings.closing.titleLead), titleAccent: text(closing.titleAccent, defaultSiteSettings.closing.titleAccent), copy: text(closing.copy, defaultSiteSettings.closing.copy), cta: cta(closing.cta, defaultSiteSettings.closing.cta) },
    works: { eyebrow: text(value.works_eyebrow, defaultSiteSettings.works.eyebrow), headingBefore: text(value.works_heading_before, defaultSiteSettings.works.headingBefore), headingAccent: text(value.works_heading_accent, defaultSiteSettings.works.headingAccent), headingAfter: text(value.works_heading_after, defaultSiteSettings.works.headingAfter), introduction: text(value.works_introduction, defaultSiteSettings.works.introduction) },
    contact: { heading: text(value.contact_heading, defaultSiteSettings.contact.heading), introduction: text(value.contact_introduction, defaultSiteSettings.contact.introduction), responseNote: text(value.contact_response_note, defaultSiteSettings.contact.responseNote), serviceOptions: textList(value.contact_service_options, defaultSiteSettings.contact.serviceOptions), budgetOptions: textList(value.contact_budget_options, defaultSiteSettings.contact.budgetOptions), timelineOptions: textList(value.contact_timeline_options, defaultSiteSettings.contact.timelineOptions), email: text(value.contact_email, defaultSiteSettings.contact.email), availability: text(value.availability_status, defaultSiteSettings.contact.availability), privacy: structuredText(value.privacy_content, defaultSiteSettings.contact.privacy), privacyVersion: text(value.privacy_policy_version, defaultSiteSettings.contact.privacyVersion) },
    footer: { text: text(value.footer_text, defaultSiteSettings.footer.text), location: text(value.service_location, defaultSiteSettings.footer.location), copyrightLabel: text(value.copyright_label, defaultSiteSettings.footer.copyrightLabel) },
  };
}
