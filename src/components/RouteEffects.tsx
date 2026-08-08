import { useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { requestRouteScroll } from "../animation/route-scroll";
import { applyPageMetadata } from "../seo/document-metadata";
import { getStaticPageMetadata } from "../seo/page-metadata";

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
    const projectRoute = location.pathname.startsWith("/works/");
    const metadata = projectRoute ? null : getStaticPageMetadata(location.pathname);
    if (metadata) applyPageMetadata(metadata);
    setAnnouncement(metadata?.title ?? "Webine project");

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
