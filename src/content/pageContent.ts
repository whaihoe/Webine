export type PageContent = {
  path: string;
  browserTitle: string;
  eyebrow: string;
  title: string;
  description: string;
};

export const pageContent: PageContent[] = [
  {
    path: "/",
    browserTitle: "Foundation",
    eyebrow: "Foundation / Home",
    title: "Make the ordinary unmistakable.",
    description:
      "Webine turns ordinary business websites into distinctive digital assets. This first build establishes the routes and local application foundation before the full visual system is added.",
  },
  {
    path: "/works",
    browserTitle: "Works",
    eyebrow: "Foundation / Works",
    title: "Work with a clear point of view.",
    description:
      "The Works route is ready for the future project collection, responsive portfolio grid and shareable case-study states. No client work has been invented for this foundation build.",
  },
  {
    path: "/contact",
    browserTitle: "Contact",
    eyebrow: "Foundation / Contact",
    title: "Start something worth remembering.",
    description:
      "The Contact route is ready for the project enquiry form and privacy section. Final contact details and response wording remain replaceable inputs until they are approved.",
  },
  {
    path: "/admin",
    browserTitle: "Admin Foundation",
    eyebrow: "Reserved route / Admin",
    title: "Content operations start here.",
    description:
      "This route reserves the future owner-only Admin application. Authentication, collections and publishing controls will be added during the dedicated CMS stages.",
  },
  {
    path: "/preview",
    browserTitle: "Content Preview",
    eyebrow: "Reserved route / Preview",
    title: "Review before publishing.",
    description:
      "This route reserves future draft previews. It will use the same components as the public website when the CMS workflow is implemented.",
  },
];
