import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { routeTitles } from "../config/navigation";

export function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const title = routeTitles[location.pathname] ?? "Page not found | Webine";
    document.title = title;
    setAnnouncement(title);

    if (navigationType === "POP") {
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });

    window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLHeadingElement>("h1");

      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  }, [location.pathname, navigationType]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  );
}
