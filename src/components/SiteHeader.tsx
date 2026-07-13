import { NavLink } from "react-router-dom";
import { publicNavigation } from "../config/navigation";
import { ButtonLink } from "./ButtonLink";
import { MobileMenu } from "./MobileMenu";
import { WebineBrand } from "./WebineBrand";

type SiteHeaderProps = {
  theme: "dark" | "light";
};

export function SiteHeader({ theme }: SiteHeaderProps) {
  return (
    <header className={`site-header site-header--${theme}`} data-site-header>
      <div className="site-container site-header__inner">
        <WebineBrand />

        <div className="site-header__desktop">
          <nav className="desktop-navigation" aria-label="Primary navigation">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.href}
                className="desktop-navigation__link"
                to={item.href}
                end={item.href === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ButtonLink href="/contact" variant="outline" size="small">
            Start a project
          </ButtonLink>
        </div>

        <div className="site-header__mobile">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
