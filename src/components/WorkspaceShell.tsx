import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { WebineBrand } from "./WebineBrand";

type WorkspaceShellProps = {
  children: ReactNode;
  title: string;
  identityLabel?: string;
};

const workspaceItems = [
  { label: "Overview", to: "/admin", end: true },
  { label: "Collections", to: "/admin/collections", end: false },
  { label: "Media", to: "/admin/media", end: false },
  { label: "Enquiries", to: "/admin/enquiries", end: false },
  { label: "Settings", to: "/admin/settings", end: false },
] as const;

export function WorkspaceShell({
  children,
  title,
  identityLabel,
}: WorkspaceShellProps) {
  return (
    <div className="workspace-shell theme-light">
      <a className="skip-link" href="#workspace-content">
        Skip to workspace content
      </a>
      <aside className="workspace-sidebar" aria-label="Admin navigation">
        <WebineBrand />
        <nav>
          {workspaceItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? "is-current" : undefined}
            >
              <span>0{index + 1}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p>{identityLabel ?? "Protected owner workspace"}</p>
      </aside>

      <div className="workspace-canvas">
        <header className="workspace-topbar">
          <span>{title}</span>
          <Link to="/">Return to website</Link>
        </header>
        <main id="workspace-content">{children}</main>
      </div>
    </div>
  );
}
