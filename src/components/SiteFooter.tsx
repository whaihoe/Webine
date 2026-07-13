import { Link } from "react-router-dom";
import { publicNavigation } from "../config/navigation";
import { WebineBrand } from "./WebineBrand";

export function SiteFooter() {
  return (
    <footer className="site-footer theme-dark">
      <div className="site-container site-footer__grid">
        <div className="site-footer__identity">
          <WebineBrand />
          <p>Distinctive websites shaped around real business potential.</p>
        </div>

        <div className="site-footer__column">
          <span className="eyebrow">Navigate</span>
          <nav aria-label="Footer navigation">
            {publicNavigation.map((item) => (
              <Link key={item.href} to={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-footer__column">
          <span className="eyebrow">Based in</span>
          <p>Singapore</p>
          <Link to="/contact">Start a conversation</Link>
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Webine</span>
          <span>Designed and developed by Webine</span>
        </div>
      </div>
    </footer>
  );
}
