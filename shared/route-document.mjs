import { createRouteStructuredData } from "./route-structured-data.mjs";
import { createProjectRouteMetadata } from "./project-route-metadata.mjs";
import { publicNavigation } from "./public-navigation.mjs";

export const canonicalSiteOrigin = "https://www.madebywebine.com";
const defaultSocialImage = `${canonicalSiteOrigin}/webine-social-card.png`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function canonicalUrl(path, siteOrigin) {
  return new URL(path, siteOrigin).href;
}

function replaceStaticSeo(html, name, value) {
  const expression = name === "structuredData"
    ? new RegExp(
      `(<!-- static-seo:${name} -->\\s*)<script[^>]*data-route-structured-data=["']true["'][^>]*>[\\s\\S]*?<\\/script>`,
      "i",
    )
    : name === "title"
      ? new RegExp(`(<!-- static-seo:${name} -->\\s*)<title>[\\s\\S]*?<\\/title>`, "i")
      : new RegExp(`(<!-- static-seo:${name} -->\\s*)<[^>]+>`, "i");
  const replacement = {
    title: `<title>${escapeHtml(value)}</title>`,
    description: `<meta name="description" content="${escapeHtml(value)}" />`,
    robots: `<meta name="robots" content="${escapeHtml(value)}" />`,
    ogTitle: `<meta property="og:title" content="${escapeHtml(value)}" />`,
    ogDescription: `<meta property="og:description" content="${escapeHtml(value)}" />`,
    ogUrl: `<meta property="og:url" content="${escapeHtml(value)}" />`,
    ogImage: `<meta property="og:image" content="${escapeHtml(value)}" />`,
    twitterTitle: `<meta name="twitter:title" content="${escapeHtml(value)}" />`,
    twitterDescription: `<meta name="twitter:description" content="${escapeHtml(value)}" />`,
    twitterImage: `<meta name="twitter:image" content="${escapeHtml(value)}" />`,
    canonical: `<link rel="canonical" href="${escapeHtml(value)}" />`,
    structuredData: `<script type="application/ld+json" data-route-structured-data="true">${value}</script>`,
  }[name];

  if (!replacement || !expression.test(html)) {
    throw new Error(`Missing static SEO marker: ${name}`);
  }
  return html.replace(expression, `$1${replacement}`);
}

function removeStaticSeo(html, name) {
  const expression = name === "structuredData"
    ? new RegExp(
      `<!-- static-seo:${name} -->\\s*<script[^>]*data-route-structured-data=["']true["'][^>]*>[\\s\\S]*?<\\/script>\\s*`,
      "i",
    )
    : name === "title"
      ? new RegExp(`<!-- static-seo:${name} -->\\s*<title>[\\s\\S]*?<\\/title>\\s*`, "i")
      : new RegExp(`<!-- static-seo:${name} -->\\s*<[^>]+>\\s*`, "i");
  return html.replace(expression, "");
}

function replaceStaticSeoWithPlaceholder(html, name, placeholder) {
  const expression = name === "structuredData"
    ? new RegExp(
      `(<!-- static-seo:${name} -->\\s*)<script[^>]*data-route-structured-data=["']true["'][^>]*>[\\s\\S]*?<\\/script>`,
      "i",
    )
    : new RegExp(`(<!-- static-seo:${name} -->\\s*)<[^>]+>`, "i");
  if (!expression.test(html)) throw new Error(`Missing static SEO marker: ${name}`);
  return html.replace(expression, `$1${placeholder}`);
}

function renderFallbackNavigation(routes) {
  const publicRoutePaths = new Set(
    routes.filter((route) => !route.noIndex).map((route) => route.path),
  );
  return publicNavigation
    .filter((item) => publicRoutePaths.has(item.href))
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join("\n          ");
}

function renderStaticFallback(route, routes) {
  if (route.noIndex) return '<div id="root"></div>';
  return `<div id="root">
    <div class="static-route-fallback theme-dark" data-static-route-fallback="true">
      <header class="static-route-fallback__header">
        <a href="/" aria-label="Webine home">Webine</a>
        <nav aria-label="Primary navigation">
          ${renderFallbackNavigation(routes)}
        </nav>
      </header>
      <main id="main-content">
        <p>Digital agency / Singapore</p>
        <h1>${escapeHtml(route.heading)}</h1>
        <p>${escapeHtml(route.description)}</p>
        <p><a href="/contact">Start a project</a></p>
      </main>
      <footer><a href="/privacy">Privacy</a></footer>
    </div>
  </div>`;
}

function replaceRoot(html, body) {
  if (!html.includes('<div id="root"></div>')) {
    throw new Error("Missing application root in route document template");
  }
  return html.replace('<div id="root"></div>', body);
}

export function renderRouteDocument(template, route, routes, siteOrigin = canonicalSiteOrigin) {
  const canonical = canonicalUrl(route.canonicalPath, siteOrigin);
  const socialImage = new URL("/webine-social-card.png", siteOrigin).href || defaultSocialImage;
  const values = {
    title: route.title,
    description: route.description,
    robots: route.noIndex ? "noindex, nofollow" : "index, follow",
    ogTitle: route.title,
    ogDescription: route.description,
    ogUrl: canonical,
    ogImage: socialImage,
    twitterTitle: route.title,
    twitterDescription: route.description,
    twitterImage: socialImage,
    canonical,
  };
  const document = Object.entries(values).reduce(
    (html, [name, value]) => replaceStaticSeo(html, name, value),
    template,
  );
  const withSchema = route.noIndex
    ? removeStaticSeo(document, "structuredData")
    : replaceStaticSeo(
        document,
        "structuredData",
        JSON.stringify(createRouteStructuredData(route, siteOrigin)).replace(/</g, "\\u003c"),
      );
  return replaceRoot(withSchema, renderStaticFallback(route, routes));
}

export function renderProjectShellDocument(template, worksRoute, routes, siteOrigin = canonicalSiteOrigin) {
  const document = replaceStaticSeoWithPlaceholder(
    replaceStaticSeoWithPlaceholder(
      replaceStaticSeoWithPlaceholder(
        renderRouteDocument(template, worksRoute, routes, siteOrigin),
        "canonical",
        '<meta data-static-seo-placeholder="canonical" />',
      ),
      "ogUrl",
      '<meta data-static-seo-placeholder="og-url" />',
    ),
    "structuredData",
    '<script type="application/json" data-route-structured-data="true"></script>',
  );
  return document.replace(
    /<div id="root">[\s\S]*?(?=\s*<\/body>)/,
    '<div id="root"></div>',
  );
}

function renderProjectFallback(project) {
  const facts = [project.label, project.category, project.year].filter(Boolean).join(" / ");
  return `<div id="root">
    <div class="static-route-fallback theme-dark" data-static-route-fallback="true">
      <header class="static-route-fallback__header"><a href="/" aria-label="Webine home">Webine</a></header>
      <main id="main-content">
        <p>${escapeHtml(facts)}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p>${escapeHtml(project.summary)}</p>
        <p><a href="/works">View all work</a> <a href="/contact">Start a project</a></p>
      </main>
      <footer><a href="/privacy">Privacy</a></footer>
    </div>
  </div>`;
}

export function renderProjectRouteDocument(template, project, siteOrigin = canonicalSiteOrigin) {
  const route = createProjectRouteMetadata(project);
  const canonical = canonicalUrl(route.canonicalPath, siteOrigin);
  const socialImage = canonicalUrl(route.socialImage, siteOrigin);
  const values = {
    title: route.title,
    description: route.description,
    robots: "index, follow",
    ogTitle: route.title,
    ogDescription: route.description,
    ogUrl: canonical,
    ogImage: socialImage,
    twitterTitle: route.title,
    twitterDescription: route.description,
    twitterImage: socialImage,
    canonical,
    structuredData: JSON.stringify(createRouteStructuredData(route, siteOrigin)).replace(/</g, "\\u003c"),
  };
  const document = Object.entries(values).reduce(
    (html, [name, value]) => replaceStaticSeo(html, name, value),
    template,
  );
  return replaceRoot(document, renderProjectFallback(project));
}

export function renderMissingProjectDocument(template, slug) {
  const title = "Webine • Project not found";
  const description = "That Webine project is not published or does not exist.";
  const values = {
    title,
    description,
    robots: "noindex, nofollow",
    ogTitle: title,
    ogDescription: description,
    ogImage: defaultSocialImage,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: defaultSocialImage,
  };
  let document = Object.entries(values).reduce(
    (html, [name, value]) => replaceStaticSeo(html, name, value),
    template,
  );
  document = removeStaticSeo(removeStaticSeo(removeStaticSeo(document, "canonical"), "ogUrl"), "structuredData");
  return replaceRoot(document, `<div id="root">
    <main class="static-route-fallback theme-dark" id="main-content" data-static-route-fallback="true">
      <h1>Project not found</h1>
      <p>The project “${escapeHtml(slug)}” is not published or does not exist.</p>
      <p><a href="/works">Return to Works</a></p>
    </main>
  </div>`);
}
