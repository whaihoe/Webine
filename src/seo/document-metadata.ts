import type { PageMetadata } from "./page-metadata";
import { createStructuredData } from "./structured-data";

function setNamedMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function setCanonicalUrl(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }
  element.href = url;
}

function setStructuredData(metadata: PageMetadata, origin: string) {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-route-structured-data="true"]');
  if (metadata.noIndex) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.routeStructuredData = "true";
    document.head.append(element);
  }
  element.textContent = JSON.stringify(createStructuredData(metadata, origin));
}

function getPublicOrigin() {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim();
  if (!configuredOrigin) return import.meta.env.PROD ? "https://www.madebywebine.com" : window.location.origin;

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return import.meta.env.PROD ? "https://www.madebywebine.com" : window.location.origin;
  }
}

export function applyPageMetadata(metadata: PageMetadata) {
  const origin = getPublicOrigin();
  const canonicalUrl = new URL(metadata.canonicalPath, origin).href;
  const socialImageUrl = new URL(metadata.socialImage || "/webine-social-card.png", origin).href;
  const robots = metadata.noIndex ? "noindex, nofollow" : "index, follow";

  document.title = metadata.title;
  setNamedMeta('meta[name="description"]', "name", "description", metadata.description);
  setNamedMeta('meta[name="robots"]', "name", "robots", robots);
  setNamedMeta('meta[property="og:title"]', "property", "og:title", metadata.title);
  setNamedMeta('meta[property="og:description"]', "property", "og:description", metadata.description);
  setNamedMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
  setNamedMeta('meta[property="og:image"]', "property", "og:image", socialImageUrl);
  setNamedMeta('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
  setNamedMeta('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);
  setNamedMeta('meta[name="twitter:image"]', "name", "twitter:image", socialImageUrl);
  setCanonicalUrl(canonicalUrl);
  setStructuredData(metadata, origin);
}
