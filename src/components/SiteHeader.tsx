import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { publicNavigation } from "../config/navigation";
import { ButtonLink } from "./ButtonLink";
import { MobileMenu } from "./MobileMenu";
import { WebineBrand } from "./WebineBrand";

type SiteHeaderProps = {
  theme: "dark" | "light";
};

export function SiteHeader({ theme }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled((current) => {
        const next = window.scrollY > 24;
        return current === next ? current : next;
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`site-header site-header--${theme}`} data-site-header data-scrolled={scrolled}>
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
