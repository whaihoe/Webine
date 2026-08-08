export function createProjectRouteMetadata(project) {
  const path = `/works/${project.slug}`;
  return {
    path,
    canonicalPath: path,
    title: `Webine • ${project.seoTitle || project.title}`,
    description: project.seoDescription || project.summary,
    heading: project.title,
    linkLabel: project.title,
    pageType: "WebPage",
    socialImage: project.heroImage.url,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Works", path: "/works" },
      { name: project.title, path },
    ],
    project: {
      name: project.title,
      description: project.summary,
      image: project.heroImage.url,
      dateCreated: project.completedOn || String(project.year),
      genre: project.category,
    },
  };
}
