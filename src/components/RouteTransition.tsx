import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function RouteTransition() {
  const location = useLocation();
  const publicRoute = !location.pathname.startsWith("/admin") && !location.pathname.startsWith("/preview");
  const previousPath = useRef(location.pathname);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    if (!publicRoute) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 760);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, publicRoute]);

  if (!publicRoute || !visible) return null;

  return (
    <div className="route-transition" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}
