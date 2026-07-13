import { WorkspaceShell } from "../components/WorkspaceShell";

const statusItems = [
  ["Collections", "Schema engine begins in Stage 8"],
  ["Media", "Upload library begins in Stage 11"],
  ["Projects", "Complete workflow begins in Stage 12"],
] as const;

export function AdminPage() {
  return (
    <WorkspaceShell title="Admin foundation">
      <section className="workspace-page" aria-labelledby="admin-heading">
        <div className="workspace-page__heading">
          <div>
            <p className="eyebrow">Owner workspace / Foundation</p>
            <h1 id="admin-heading">Content operations start here.</h1>
          </div>
          <span className="status-pill">Structure only</span>
        </div>

        <div className="workspace-status-grid">
          {statusItems.map(([title, description], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div className="workspace-notice" role="note">
          <strong>Authentication is not active yet.</strong>
          <p>This route remains local and must not be treated as a protected production Admin area.</p>
        </div>
      </section>
    </WorkspaceShell>
  );
}
