import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigationType,
} from "react-router-dom";
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
    setNamedMeta('meta[name="description"]', "name", "description", description);
    setNamedMeta('meta[name="robots"]', "name", "robots", privateRoute ? "noindex, nofollow" : "index, follow");
    setNamedMeta('meta[property="og:title"]', "property", "og:title", title);
    setNamedMeta('meta[property="og:description"]', "property", "og:description", description);

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
          window.scrollTo({ top: savedPosition, behavior: "auto" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
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
