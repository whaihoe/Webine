import type { ReactNode } from "react";
import { experienceMode } from "../config/experience";
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
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}
