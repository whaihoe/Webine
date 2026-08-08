export type RouteDocumentMetadata = {
  path: string;
  canonicalPath: string;
  title: string;
  description: string;
  heading: string;
  linkLabel: string;
  pageType: string;
  breadcrumbs: Array<{ name: string; path: string }>;
  noIndex?: boolean;
};

export type ProjectDocumentData = {
  slug: string;
  title: string;
  summary: string;
  label: string;
  category: string;
  year: number;
  completedOn?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroImage: { url: string };
};

export const canonicalSiteOrigin: string;
export function renderRouteDocument(template: string, route: RouteDocumentMetadata, routes: RouteDocumentMetadata[], siteOrigin?: string): string;
export function renderProjectShellDocument(template: string, worksRoute: RouteDocumentMetadata, routes: RouteDocumentMetadata[], siteOrigin?: string): string;
export function renderProjectRouteDocument(template: string, project: ProjectDocumentData, siteOrigin?: string): string;
export function renderMissingProjectDocument(template: string, slug: string): string;
