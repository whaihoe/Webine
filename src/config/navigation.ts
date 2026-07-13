export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/contact", label: "Contact" },
] as const;

export const routeTitles: Record<string, string> = {
  "/": "Webine | Make the ordinary unmistakable",
  "/works": "Works | Webine",
  "/contact": "Contact | Webine",
  "/admin": "Admin foundation | Webine",
  "/preview": "Content preview | Webine",
};
