import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { WebineBrand } from "./WebineBrand";

type WorkspaceShellProps = {
  children: ReactNode;
  title: string;
};

const workspaceItems = ["Overview", "Collections", "Media", "Settings"];

export function WorkspaceShell({ children, title }: WorkspaceShellProps) {
  return (
    <div className="workspace-shell theme-light">
      <a className="skip-link" href="#workspace-content">
        Skip to workspace content
      </a>
      <aside className="workspace-sidebar" aria-label="Admin navigation preview">
        <WebineBrand />
        <nav>
          {workspaceItems.map((item, index) => (
            <span
              key={item}
              className={index === 0 ? "is-current" : undefined}
              aria-current={index === 0 ? "page" : undefined}
            >
              <span>0{index + 1}</span>
              {item}
            </span>
          ))}
        </nav>
        <p>Structure preview only</p>
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
