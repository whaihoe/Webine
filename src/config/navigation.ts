export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
] as const;

export const routeTitles: Record<string, string> = {
  "/": "Webine • Digital Agency in Singapore",
  "/about": "About • Webine",
  "/services": "Services • Webine",
  "/works": "Works • Webine",
  "/contact": "Contact • Webine",
  "/admin": "Admin • Webine",
  "/preview": "Content preview • Webine",
};

export const routeDescriptions: Record<string, string> = {
  "/": "Webine is a digital agency based in Singapore, providing website design, development, e-commerce and digital experiences for growing businesses.",
  "/about": "Meet the people behind Webine and see how clarity, purposeful motion and dependable development shape the studio's work.",
  "/services": "Web design, website redesign, monthly maintenance, SEO foundations and branding support from Webine.",
  "/works": "Explore Webine's published website work, internal studies and clearly labelled concept projects.",
  "/contact": "Tell Webine what your business needs from a stronger website and start a project enquiry.",
  "/admin": "Protected Webine content workspace.",
  "/preview": "Protected Webine content preview.",
};
