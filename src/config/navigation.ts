export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/contact", label: "Contact" },
] as const;

export const routeTitles: Record<string, string> = {
  "/": "Webine | Make the ordinary unmistakable",
  "/works": "Works | Webine",
  "/contact": "Contact | Webine",
  "/admin": "Admin | Webine",
  "/preview": "Content preview | Webine",
};

export const routeDescriptions: Record<string, string> = {
  "/": "Webine shapes distinctive websites around real business potential, clear strategy and purposeful interaction.",
  "/works": "Explore Webine's published website work, internal studies and clearly labelled concept projects.",
  "/contact": "Tell Webine what your business needs from a stronger website and start a project enquiry.",
  "/admin": "Protected Webine content workspace.",
  "/preview": "Protected Webine content preview.",
};
