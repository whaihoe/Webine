import { useState, type ReactNode } from "react";
import { experienceMode } from "../config/experience";
import { PublicSmoothScroll } from "./PublicSmoothScroll";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { GsapRevealController } from "./GsapRevealController";
import { KineticCursor } from "./KineticCursor";

type SiteShellProps = {
  children: ReactNode;
  headerTheme?: "dark" | "light";
};

export function SiteShell({
  children,
  headerTheme = "dark",
}: SiteShellProps) {
  const [shellElement, setShellElement] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setShellElement} className="site-shell" data-experience-mode={experienceMode}>
      {shellElement ? <GsapRevealController root={shellElement} /> : null}
      <KineticCursor />
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
