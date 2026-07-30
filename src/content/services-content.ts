export const servicesContent = {
  hero: {
    eyebrow: "Services / Design, build and support",
    headingLead: "One clear starting point.",
    headingAccent: "Built around what changes next.",
    introduction:
      "Webine shapes focused digital experiences for businesses that need to launch, evolve or keep improving. Each service combines clear thinking, premium visual direction and dependable implementation.",
  },
  services: [
    {
      key: "website-design",
      index: "01",
      title: "Website design and development",
      summary: "A complete new digital presence, shaped from strategy through launch.",
      bestFor: "Businesses launching something new or replacing a website that no longer represents where the company is going.",
      includes: [
        "Strategy, page structure and enquiry paths",
        "Responsive interface design and purposeful interaction",
        "Development, content systems and forms",
        "Launch preparation and practical SEO foundations",
      ],
    },
    {
      key: "website-redesign",
      index: "02",
      title: "Website redesign",
      summary: "A considered evolution of an existing website, not a cosmetic reskin.",
      bestFor: "Businesses with useful existing content or recognition, but an outdated structure, visual direction or technical experience.",
      includes: [
        "Current-site, content and journey audit",
        "Information architecture improvements",
        "New visual direction and responsive redevelopment",
        "SEO-aware migration, URL and metadata planning",
      ],
    },
    {
      key: "landing-pages",
      index: "03",
      title: "Landing pages and campaign sites",
      summary: "A focused experience built around one launch, offer or audience.",
      bestFor: "A new service, event, product, campaign or early-stage idea that needs a clear destination without a complete company website.",
      includes: [
        "One focused message and action path",
        "Responsive design and development",
        "Purposeful motion and interaction where useful",
        "Forms, analytics-ready structure and launch support",
      ],
    },
    {
      key: "branding-support",
      index: "04",
      title: "Branding support",
      summary: "Focused visual direction that gives the website a coherent identity.",
      bestFor: "Businesses that need more than a template but do not yet need a large standalone identity programme.",
      includes: [
        "Colour palette and typography direction",
        "Moodboard and visual language",
        "Simple logo refinement where appropriate",
        "A website-focused style guide",
      ],
    },
    {
      key: "seo-foundations",
      index: "05",
      title: "SEO foundations",
      summary: "A clear technical and content structure that search engines can understand.",
      bestFor: "Website projects that need sound search foundations without unsupported ranking promises or a separate long-term marketing retainer.",
      includes: [
        "Page titles, descriptions and heading structure",
        "Clean URLs, image alternatives and mobile readiness",
        "Basic keyword and content planning",
        "Search Console connection where required",
      ],
    },
    {
      key: "website-care",
      index: "06",
      title: "Website care and maintenance",
      summary: "Defined ongoing support that keeps the website healthy and current.",
      bestFor: "Teams that need a reliable route for small updates, checks and refinements after launch without hiring in-house.",
      includes: [
        "Text, image and small section updates",
        "Form, layout and website health checks",
        "Basic SEO monitoring and analytics review",
        "Prioritised support within an agreed monthly allowance",
      ],
    },
  ],
} as const;

export type WebineService = (typeof servicesContent.services)[number];
