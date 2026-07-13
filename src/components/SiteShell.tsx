import type { ReactNode } from "react";
import { experienceMode } from "../config/experience";
import { PublicSmoothScroll } from "./PublicSmoothScroll";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteShellProps = {
  children: ReactNode;
  headerTheme?: "dark" | "light";
};

export function SiteShell({
  children,
  headerTheme = "dark",
}: SiteShellProps) {
  return (
    <div className="site-shell" data-experience-mode={experienceMode}>
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
