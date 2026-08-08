function absoluteUrl(path, origin) {
  return new URL(path, origin).href;
}

function organizationSchema(origin) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: "Webine",
    url: `${origin}/`,
    logo: absoluteUrl("/webine-icon-512.png", origin),
    description: "A Singapore digital agency that designs and develops distinctive, responsive websites for growing businesses.",
    areaServed: { "@type": "Country", name: "Singapore" },
  };
}

function pageSchema(metadata, origin) {
  const pageType = metadata.pageType === "WebSite" ? "WebPage" : metadata.pageType;
  const canonical = absoluteUrl(metadata.canonicalPath, origin);
  const page = {
    "@context": "https://schema.org",
    "@type": pageType,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: metadata.breadcrumbs.at(-1)?.name || "Webine",
    description: metadata.description,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#organization` },
  };
  if (metadata.project) page.mainEntity = { "@id": `${canonical}#project` };
  return page;
}

function websiteSchema(origin) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: "Webine",
    publisher: { "@id": `${origin}/#organization` },
  };
}

function breadcrumbSchema(metadata, origin) {
  if (metadata.breadcrumbs.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: metadata.breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: absoluteUrl(breadcrumb.path, origin),
    })),
  };
}

function serviceSchemas(services, origin) {
  return services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${origin}/services#${service.key}`,
    name: service.title,
    description: service.summary,
    url: `${origin}/services#${service.key}`,
    provider: { "@id": `${origin}/#organization` },
    areaServed: { "@type": "Country", name: "Singapore" },
  }));
}

function projectSchema(metadata, origin) {
  if (!metadata.project) return null;
  const canonical = absoluteUrl(metadata.canonicalPath, origin);
  const project = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${canonical}#project`,
    name: metadata.project.name,
    description: metadata.project.description,
    url: canonical,
    image: absoluteUrl(metadata.project.image, origin),
    creator: { "@id": `${origin}/#organization` },
  };
  if (metadata.project.dateCreated) project.dateCreated = metadata.project.dateCreated;
  if (metadata.project.genre) project.genre = metadata.project.genre;
  return project;
}

export function createRouteStructuredData(metadata, origin, services = []) {
  if (metadata.noIndex) return [];

  const schemas = [organizationSchema(origin), pageSchema(metadata, origin)];
  if (metadata.path === "/") schemas.push(websiteSchema(origin));
  if (metadata.path === "/services") schemas.push(...serviceSchemas(services, origin));
  const project = projectSchema(metadata, origin);
  if (project) schemas.push(project);
  const breadcrumbs = breadcrumbSchema(metadata, origin);
  if (breadcrumbs) schemas.push(breadcrumbs);
  return schemas;
}
