export type FeaturedProject = {
  slug: string;
  title: string;
  year: string;
  label: "Internal project" | "Concept project";
  services: readonly string[];
  description: string;
  featured: true;
  featuredOrder: number;
  status: "published";
  visual: "fold" | "signal" | "portal";
};

export const featuredProjects: readonly FeaturedProject[] = [
  {
    slug: "webine-identity-system",
    title: "Webine identity system",
    year: "2026",
    label: "Internal project",
    services: ["Brand system", "Web design", "Motion direction"],
    description:
      "A folded visual language and responsive digital system designed to make Webine's own positioning feel clear, precise and memorable.",
    featured: true,
    featuredOrder: 1,
    status: "published",
    visual: "fold",
  },
  {
    slug: "service-business-reframe",
    title: "Service business reframe",
    year: "2026",
    label: "Concept project",
    services: ["Website strategy", "UX writing", "Interface design"],
    description:
      "A concept for turning a dense service offering into a calmer story with clearer proof, useful answers and one focused enquiry path.",
    featured: true,
    featuredOrder: 2,
    status: "published",
    visual: "signal",
  },
  {
    slug: "independent-retail-launch",
    title: "Independent retail launch",
    year: "2026",
    label: "Concept project",
    services: ["E-commerce", "Art direction", "Responsive build"],
    description:
      "An editorial shopping concept that gives products room to lead while keeping discovery, detail and purchase decisions straightforward.",
    featured: true,
    featuredOrder: 3,
    status: "published",
    visual: "portal",
  },
];
