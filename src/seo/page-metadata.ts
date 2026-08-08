import publicRouteMetadata from "../../shared/public-route-metadata.json";
import { createProjectRouteMetadata } from "../../shared/project-route-metadata.mjs";
import type { PublicProject } from "../content/public-projects";

type PageType = "AboutPage" | "CollectionPage" | "ContactPage" | "WebPage" | "WebSite";

type Breadcrumb = {
  name: string;
  path: string;
};

export type PageMetadata = {
  path: string;
  title: string;
  description: string;
  canonicalPath: string;
  pageType: PageType;
  breadcrumbs: Breadcrumb[];
  noIndex?: boolean;
  socialImage?: string;
  project?: {
    name: string;
    description: string;
    image: string;
    dateCreated?: string;
    genre?: string;
  };
};

type JsonRouteMetadata = Omit<PageMetadata, "pageType"> & {
  pageType: PageType;
};

const staticPageMetadata: readonly PageMetadata[] = publicRouteMetadata as JsonRouteMetadata[];

const fallbackMetadata: PageMetadata = {
  path: "/404",
  title: "Webine • Page not found",
  description: "Webine creates distinctive websites for growing businesses.",
  canonicalPath: "/404",
  pageType: "WebPage",
  breadcrumbs: [{ name: "Home", path: "/" }],
  noIndex: true,
};

export function getStaticPageMetadata(pathname: string): PageMetadata {
  const adminMetadata = staticPageMetadata.find((metadata) => metadata.path === "/admin");
  if (pathname.startsWith("/admin/") && adminMetadata) return adminMetadata;
  const exact = staticPageMetadata.find((metadata) => metadata.path === pathname);
  return exact ?? fallbackMetadata;
}

export function getProjectPageMetadata(project: PublicProject): PageMetadata {
  return createProjectRouteMetadata(project);
}

export function getMissingProjectPageMetadata(pathname: string): PageMetadata {
  return {
    path: pathname,
    title: "Webine • Project not found",
    description: "That Webine project is not published or does not exist.",
    canonicalPath: pathname,
    pageType: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Works", path: "/works" },
    ],
    noIndex: true,
  };
}
