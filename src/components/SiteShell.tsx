import { lazy, Suspense, useState, type ReactNode } from "react";
import { experienceMode } from "../config/experience";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePageLoad } from "../loading/page-load-context";
import { PublicSmoothScroll } from "./PublicSmoothScroll";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { GsapRevealController } from "./GsapRevealController";

const KineticCursor = lazy(() =>
  import("./KineticCursor").then((module) => ({ default: module.KineticCursor })));
const KINETIC_CURSOR_QUERY = "(min-width: 48rem) and (hover: hover) and (pointer: fine)";

type SiteShellProps = {
  children: ReactNode;
  headerTheme?: "dark" | "light";
};

export function SiteShell({
  children,
  headerTheme = "dark",
}: SiteShellProps) {
  const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null);
  const { isPageReady } = usePageLoad();
  const showKineticCursor = useMediaQuery(KINETIC_CURSOR_QUERY);

  return (
    <div ref={setShellElement} className="site-shell" data-experience-mode={experienceMode}>
      {shellElement && isPageReady ? <GsapRevealController root={shellElement} /> : null}
      {showKineticCursor ? (
        <Suspense fallback={null}>
          <KineticCursor />
        </Suspense>
      ) : null}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader theme={headerTheme} />
      <PublicSmoothScroll>
        <main className="site-main" id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </PublicSmoothScroll>
    </div>
  );
}
