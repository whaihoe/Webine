import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { requestRouteScroll } from "../animation/route-scroll";
import { routeDescriptions, routeTitles } from "../config/navigation";

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

function getPublicOrigin() {
  const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim();
  if (!configuredOrigin) {
    return import.meta.env.PROD
      ? "https://www.madebywebine.com"
      : window.location.origin;
  }

  try {
    return new URL(configuredOrigin).origin;
  } catch {
    return import.meta.env.PROD
      ? "https://www.madebywebine.com"
      : window.location.origin;
  }
}

export function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [announcement, setAnnouncement] = useState("");
  const scrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    const key = location.key;
    const positions = scrollPositions.current;
    return () => {
      positions.set(key, window.scrollY);
    };
  }, [location.key]);

  useEffect(() => {
    const title = location.pathname.startsWith("/works/")
      ? routeTitles["/works"]
      : location.pathname.startsWith("/admin/")
        ? routeTitles["/admin"]
        : routeTitles[location.pathname] ?? "Page not found | Webine";
    document.title = title;
    setAnnouncement(title);
    const routeKey = location.pathname.startsWith("/works/")
      ? "/works"
      : location.pathname.startsWith("/admin/")
        ? "/admin"
        : location.pathname;
    const description = routeDescriptions[routeKey] ?? "Webine creates distinctive websites for growing businesses.";
    const privateRoute = routeKey === "/admin" || routeKey === "/preview";
    const publicOrigin = getPublicOrigin();
    const canonicalUrl = new URL(location.pathname, publicOrigin).href;
    const socialImageUrl = new URL("/webine-social-card.png", publicOrigin).href;
    setNamedMeta('meta[name="description"]', "name", "description", description);
    setNamedMeta('meta[name="robots"]', "name", "robots", privateRoute ? "noindex, nofollow" : "index, follow");
    setNamedMeta('meta[property="og:title"]', "property", "og:title", title);
    setNamedMeta('meta[property="og:description"]', "property", "og:description", description);
    setNamedMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setNamedMeta('meta[property="og:image"]', "property", "og:image", socialImageUrl);
    setNamedMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setNamedMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setNamedMeta('meta[name="twitter:image"]', "name", "twitter:image", socialImageUrl);
    setCanonicalUrl(canonicalUrl);

    const frame = window.requestAnimationFrame(() => {
      const hashTarget = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;
      const heading = hashTarget ?? document.querySelector<HTMLHeadingElement>("h1");

      if (hashTarget) {
        hashTarget.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (navigationType === "POP") {
        const savedPosition = scrollPositions.current.get(location.key);
        if (savedPosition !== undefined) {
          requestRouteScroll(savedPosition);
        }
      } else {
        requestRouteScroll(0);
      }

      if (heading && navigationType !== "POP") {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key, location.pathname, navigationType]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
