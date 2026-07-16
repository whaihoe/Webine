import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

type WorkspaceBreadcrumb = {
  label: string;
  to?: string;
};

const sectionLabels: Record<string, string> = {
  collections: "Collections",
  enquiries: "Enquiries",
  media: "Media",
  settings: "Settings",
};

function formatCollectionLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildWorkspaceBreadcrumbs(pathname: string): WorkspaceBreadcrumb[] {
  const segments = pathname
    .replace(/^\/admin\/?/, "")
    .split("/")
    .filter(Boolean);
  const breadcrumbs: WorkspaceBreadcrumb[] = [{ label: "Admin", to: "/admin" }];
  const section = segments[0];

  if (!section) {
    return [{ label: "Admin" }];
  }

  if (section !== "collections") {
    breadcrumbs.push({
      label: sectionLabels[section] ?? formatCollectionLabel(section),
    });
    return breadcrumbs;
  }

  breadcrumbs.push({ label: "Collections", to: "/admin/collections" });
  const collectionKey = segments[1];

  if (!collectionKey) {
    return breadcrumbs.map((breadcrumb, index) =>
      index === breadcrumbs.length - 1
        ? { label: breadcrumb.label }
        : breadcrumb,
    );
  }

  if (collectionKey === "new") {
    breadcrumbs.push({ label: "New collection" });
    return breadcrumbs;
  }

  breadcrumbs.push({
    label: formatCollectionLabel(collectionKey),
    to: `/admin/collections/${collectionKey}/items`,
  });

  if (segments[2] === "schema") {
    breadcrumbs.push({ label: "Edit schema" });
  } else if (segments[2] === "items" && segments[3]) {
    breadcrumbs.push({
      label: segments[3] === "new" ? "New item" : "Edit item",
    });
  }

  return breadcrumbs.map((breadcrumb, index) =>
    index === breadcrumbs.length - 1
      ? { label: breadcrumb.label }
      : breadcrumb,
  );
}

export function WorkspaceShell({
  children,
  title,
  identityLabel,
}: WorkspaceShellProps) {
  const { pathname } = useLocation();
  const breadcrumbs = buildWorkspaceBreadcrumbs(pathname);

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
          <nav
            className="workspace-breadcrumbs"
            aria-label={`${title} breadcrumb`}
          >
            <ol>
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={`${breadcrumb.label}-${index}`}>
                  {index > 0 ? (
                    <span
                      className="workspace-breadcrumbs__separator"
                      aria-hidden="true"
                    >
                      /
                    </span>
                  ) : null}
                  {breadcrumb.to ? (
                    <Link to={breadcrumb.to}>{breadcrumb.label}</Link>
                  ) : (
                    <span aria-current="page">{breadcrumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <Link className="workspace-topbar__website-link" to="/">
            Return to website
          </Link>
        </header>
        <main id="workspace-content">{children}</main>
      </div>
    </div>
  );
}
