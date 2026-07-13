import { Link } from "react-router-dom";

const routes = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/contact", label: "Contact" },
];

type FoundationPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function FoundationPage({
  eyebrow,
  title,
  description,
}: FoundationPageProps) {
  return (
    <main className="foundation-page">
      <div className="foundation-shell">
        <header className="foundation-header">
          <Link className="foundation-brand" to="/" aria-label="Webine home">
            <img
              src="/webine-logo-primary.png"
              alt=""
              width="174"
              height="103"
            />
            <span>Webine</span>
          </Link>
          <nav className="foundation-nav" aria-label="Primary navigation">
            {routes.map((route) => (
              <Link key={route.href} to={route.href}>
                {route.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="foundation-content">
          <div className="foundation-copy">
            <p className="foundation-eyebrow">{eyebrow}</p>
            <h1 className="foundation-title">{title}</h1>
            <p className="foundation-description">{description}</p>
          </div>
        </section>

        <footer className="foundation-footer">
          <span>Digital agency / Singapore</span>
          <span>Local development</span>
        </footer>
      </div>
    </main>
  );
}
