export type ProjectRouteMetadataInput = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  year: number;
  completedOn?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImage: { url: string };
};

export type ProjectRouteMetadata = {
  path: string;
  canonicalPath: string;
  title: string;
  description: string;
  heading: string;
  linkLabel: string;
  pageType: "WebPage";
  socialImage: string;
  breadcrumbs: Array<{ name: string; path: string }>;
  project: {
    name: string;
    description: string;
    image: string;
    dateCreated: string;
    genre: string;
  };
};

export function createProjectRouteMetadata(project: ProjectRouteMetadataInput): ProjectRouteMetadata;
