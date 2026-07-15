import { Link } from "react-router-dom";
import { publicNavigation } from "../config/navigation";
import { WebineBrand } from "./WebineBrand";
import { useSiteSettings } from "../content/SiteSettingsProvider";

export function SiteFooter() {
  const settings = useSiteSettings();
  const publicEmail = settings.contact.email || import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <footer className="site-footer theme-dark">
      <div className="site-container site-footer__grid">
        <div className="site-footer__identity">
          <WebineBrand />
          <p>{settings.footer.text}</p>
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
          <p>{settings.footer.location}</p>
          <Link to="/contact">Start a conversation</Link>
          {publicEmail ? <a href={`mailto:${publicEmail}`}>{publicEmail}</a> : null}
        </div>

        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} {settings.footer.copyrightLabel}</span>
          <span><Link to="/contact#privacy">Privacy</Link> / Designed and developed by Webine</span>
        </div>
      </div>
    </footer>
  );
}
