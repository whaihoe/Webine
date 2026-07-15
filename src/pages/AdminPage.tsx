import { useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { SignInButton } from "@clerk/react";
import type {
  AdminCollectionDefinition,
  AdminCollectionSummary,
  AdminDashboard,
  AdminEnquiry,
  AdminItem,
  AdminItemSummary,
  AdminSession,
} from "../admin/api";
import { useAdminResource } from "../admin/useAdminResource";
import { useAdminMutation } from "../admin/useAdminMutation";
import { useAdminAuth } from "../admin/AdminAuthContext";
import { AdminDataState } from "../components/admin/AdminDataState";
import { CollectionEditor } from "../components/admin/CollectionEditor";
import { ItemEditor } from "../components/admin/ItemEditor";
import { MediaLibrary } from "../components/admin/MediaLibrary";
import { WorkspaceShell } from "../components/WorkspaceShell";

function LoadingState() {
  return (
    <div className="admin-skeleton" aria-label="Loading Admin content" aria-busy="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function ResourceError({
  status,
  message,
  retry,
}: {
  status: number;
  message: string;
  retry: () => void;
}) {
  const { signedIn } = useAdminAuth();
  const unauthorised = status === 401 || status === 403;
  const canSignIn =
    status === 401 &&
    signedIn !== true &&
    Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  return (
    <>
      <AdminDataState
        title={unauthorised ? "Admin access is required." : "The workspace could not load."}
        description={unauthorised
          ? status === 401
            ? "Sign in with the approved Webine owner account, then try again."
            : "This signed-in account is not approved for Webine Admin."
          : message}
        actionLabel="Try again"
        onAction={retry}
        tone="error"
      />
      {canSignIn ? (
        <SignInButton mode="modal">
          <button className="admin-primary-action" type="button">Sign in</button>
        </SignInButton>
      ) : null}
    </>
  );
}

function DashboardPage() {
  const resource = useAdminResource<AdminDashboard>("/api/admin/dashboard");

  if (resource.status === "loading") return <LoadingState />;
  if (resource.status === "error") {
    return <ResourceError status={resource.error.status} message={resource.error.message} retry={resource.retry} />;
  }

  const statistics = [
    ["Draft projects", resource.data.draftProjects],
    ["Published projects", resource.data.publishedProjects],
    ["Total active projects", resource.data.totalProjects],
  ] as const;

  return (
    <section className="workspace-page" aria-labelledby="admin-heading">
      <div className="workspace-page__heading">
        <div>
          <p className="eyebrow">Owner workspace / Overview</p>
          <h1 id="admin-heading">Content operations, clearly organised.</h1>
        </div>
        <Link className="admin-primary-action" to="/admin/collections/projects/items/new">
          New project
        </Link>
      </div>

      <div className="workspace-status-grid">
        {statistics.map(([title, value], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <strong>{value}</strong>
            <h2>{title}</h2>
          </article>
        ))}
      </div>

      <div className="workspace-notice" role="note">
        <strong>Protected content workspace</strong>
        <p>Collections, media, draft previews and publishing now share one protected workspace. Public work reads only approved published snapshots.</p>
      </div>
    </section>
  );
}

function CollectionsPage() {
  const resource = useAdminResource<AdminCollectionSummary[]>(
    "/api/admin/collections",
  );

  if (resource.status === "loading") return <LoadingState />;
  if (resource.status === "error") {
    return <ResourceError status={resource.error.status} message={resource.error.message} retry={resource.retry} />;
  }

  return (
    <section className="workspace-page" aria-labelledby="collections-heading">
      <div className="workspace-page__heading">
        <div>
          <p className="eyebrow">Content model / Collections</p>
          <h1 id="collections-heading">Structured sources of truth.</h1>
        </div>
        <Link className="admin-secondary-action" to="/admin/collections/new">
          New collection
        </Link>
      </div>

      {resource.data.length === 0 ? (
        <AdminDataState
          title="No collections yet."
          description="Create the first collection to begin organising content."
        />
      ) : (
        <div className="admin-collection-list">
          {resource.data.map((collection) => (
            <Link
              key={collection.key}
              to={`/admin/collections/${collection.key}/items`}
              className="admin-collection-card"
            >
              <div>
                <span>{collection.isSystem ? "System" : "Custom"}</span>
                <h2>{collection.namePlural}</h2>
                <p>{collection.description || "No description yet."}</p>
              </div>
              <dl>
                <div><dt>Items</dt><dd>{collection.itemCount}</dd></div>
                <div><dt>Published</dt><dd>{collection.publishedCount}</dd></div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CollectionItemsPage() {
  const { collectionKey = "" } = useParams();
  const resource = useAdminResource<AdminItemSummary[]>(
    `/api/admin/collections/${collectionKey}/items`,
  );

  if (resource.status === "loading") return <LoadingState />;
  if (resource.status === "error") {
    return <ResourceError status={resource.error.status} message={resource.error.message} retry={resource.retry} />;
  }

  return (
    <section className="workspace-page" aria-labelledby="items-heading">
      <div className="workspace-page__heading">
        <div>
          <p className="eyebrow">Collection / {collectionKey.replace(/_/g, " ")}</p>
          <h1 id="items-heading">Items and publishing state.</h1>
        </div>
        <Link className="admin-primary-action" to={`/admin/collections/${collectionKey}/items/new`}>
          New item
        </Link>
        <Link className="admin-secondary-action" to={`/admin/collections/${collectionKey}/schema`}>
          Edit schema
        </Link>
      </div>

      {resource.data.length === 0 ? (
        <AdminDataState
          title="This collection is empty."
          description="Create the first draft item when the generated form stage is ready."
        />
      ) : (
        <div className="admin-item-table-wrap">
          <table className="admin-item-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Updated</th>
                <th><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {resource.data.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td><span className="status-pill">{item.status}</span></td>
                  <td>{new Intl.DateTimeFormat("en-SG", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</td>
                  <td><Link to={`/admin/collections/${collectionKey}/items/${item.id}`}>Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function NewItemEditorPage({ collectionKey }: { collectionKey: string }) {
  const collection = useAdminResource<AdminCollectionDefinition>(`/api/admin/collections/${collectionKey}`);
  if (collection.status === "loading") return <LoadingState />;
  if (collection.status === "error") return <ResourceError status={collection.error.status} message={collection.error.message} retry={collection.retry} />;
  return <ItemEditor collection={collection.data} />;
}

function ExistingItemEditorPage({ collectionKey, itemId }: { collectionKey: string; itemId: string }) {
  const collection = useAdminResource<AdminCollectionDefinition>(`/api/admin/collections/${collectionKey}`);
  const item = useAdminResource<AdminItem>(`/api/admin/collections/${collectionKey}/items/${itemId}`);
  if (collection.status === "loading" || item.status === "loading") return <LoadingState />;
  if (collection.status === "error") return <ResourceError status={collection.error.status} message={collection.error.message} retry={collection.retry} />;
  if (item.status === "error") return <ResourceError status={item.error.status} message={item.error.message} retry={item.retry} />;
  return <ItemEditor collection={collection.data} item={item.data} />;
}

function ItemEditorPage() {
  const { collectionKey, itemId } = useParams();
  const creating = itemId === "new";

  if (!collectionKey || !itemId) return <Navigate to="/admin/collections" replace />;

  return (
    <section className="workspace-page admin-editor-shell" aria-labelledby="editor-heading">
      <p className="eyebrow">{collectionKey?.replace(/_/g, " ")} / {creating ? "New item" : "Editor"}</p>
      <h1 id="editor-heading">{creating ? "Create a structured draft." : "Edit this structured item."}</h1>
      {creating
        ? <NewItemEditorPage collectionKey={collectionKey} />
        : <ExistingItemEditorPage collectionKey={collectionKey} itemId={itemId} />}
    </section>
  );
}

function NewCollectionEditorPage() {
  return (
    <section className="workspace-page admin-editor-shell" aria-labelledby="collection-editor-heading">
      <p className="eyebrow">Collection builder / New</p>
      <h1 id="collection-editor-heading">Define a structured collection.</h1>
      <CollectionEditor />
    </section>
  );
}

function CollectionSchemaPage() {
  const { collectionKey = "" } = useParams();
  const collection = useAdminResource<AdminCollectionDefinition>(`/api/admin/collections/${collectionKey}`);
  if (collection.status === "loading") return <LoadingState />;
  if (collection.status === "error") return <ResourceError status={collection.error.status} message={collection.error.message} retry={collection.retry} />;

  return (
    <section className="workspace-page admin-editor-shell" aria-labelledby="collection-schema-heading">
      <p className="eyebrow">Collection builder / {collection.data.namePlural}</p>
      <h1 id="collection-schema-heading">Shape the generated editor.</h1>
      <CollectionEditor initial={collection.data} />
    </section>
  );
}

function SettingsEditorPage() {
  return (
    <section className="workspace-page admin-editor-shell" aria-labelledby="settings-editor-heading">
      <p className="eyebrow">Website content / Site settings</p>
      <h1 id="settings-editor-heading">Edit the shared website content.</h1>
      <ExistingItemEditorPage collectionKey="site_settings" itemId="item_site_settings" />
    </section>
  );
}

function EnquiriesPage() {
  const mutateAdminResource = useAdminMutation();
  const resource = useAdminResource<AdminEnquiry[]>("/api/admin/enquiries");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState("");

  async function retryNotification(enquiryId: string) {
    setRetryingId(enquiryId);
    setRetryError("");
    try {
      await mutateAdminResource(`/api/admin/enquiries/${enquiryId}/retry`, "POST", {});
      resource.retry();
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "The notification could not be retried.");
    } finally {
      setRetryingId(null);
    }
  }

  if (resource.status === "loading") return <LoadingState />;
  if (resource.status === "error") return <ResourceError status={resource.error.status} message={resource.error.message} retry={resource.retry} />;

  return (
    <section className="workspace-page" aria-labelledby="enquiries-heading">
      <div className="workspace-page__heading">
        <div>
          <p className="eyebrow">Contact operations / Enquiries</p>
          <h1 id="enquiries-heading">New conversations, kept private.</h1>
        </div>
      </div>
      {retryError ? <p className="admin-inline-error" role="alert">{retryError}</p> : null}
      {resource.data.length === 0 ? (
        <AdminDataState title="No enquiries yet." description="New Contact form submissions will appear here." />
      ) : (
        <div className="admin-enquiry-list">
          {resource.data.map((enquiry) => (
            <article className="admin-enquiry-card" key={enquiry.id}>
              <header>
                <div>
                  <span className="eyebrow">{new Intl.DateTimeFormat("en-SG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(enquiry.createdAt))}</span>
                  <h2>{enquiry.name}{enquiry.company ? ` / ${enquiry.company}` : ""}</h2>
                </div>
                <div className="admin-enquiry-card__status"><span className="status-pill">{enquiry.status}</span><span className={`status-pill status-pill--${enquiry.notificationStatus}`}>Notification {enquiry.notificationStatus}</span></div>
              </header>
              <dl>
                <div><dt>Email</dt><dd><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></dd></div>
                <div><dt>Need</dt><dd>{enquiry.serviceInterest}</dd></div>
                <div><dt>Timeline</dt><dd>{enquiry.timeline}</dd></div>
                <div><dt>Budget</dt><dd>{enquiry.budgetRange || "Not specified"}</dd></div>
                {enquiry.website ? <div><dt>Website</dt><dd><a href={enquiry.website} target="_blank" rel="noreferrer">Open website</a></dd></div> : null}
              </dl>
              <p className="admin-enquiry-card__details">{enquiry.details}</p>
              {enquiry.notificationStatus !== "sent" ? <button className="admin-secondary-action" type="button" onClick={() => void retryNotification(enquiry.id)} disabled={retryingId === enquiry.id}>{retryingId === enquiry.id ? "Retrying..." : "Retry notification"}</button> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProtectedWorkspace({ session }: { session: AdminSession }) {
  return (
    <WorkspaceShell title="Webine Admin" identityLabel={session.label}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="collections/new" element={<NewCollectionEditorPage />} />
        <Route path="collections/:collectionKey/schema" element={<CollectionSchemaPage />} />
        <Route path="collections/:collectionKey/items" element={<CollectionItemsPage />} />
        <Route path="collections/:collectionKey/items/:itemId" element={<ItemEditorPage />} />
        <Route path="media" element={<section className="workspace-page" aria-labelledby="media-heading"><p className="eyebrow">Content operations / Media</p><h1 id="media-heading">Upload once, reuse everywhere.</h1><MediaLibrary /></section>} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="settings" element={<SettingsEditorPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </WorkspaceShell>
  );
}

export function AdminPage() {
  const session = useAdminResource<AdminSession>("/api/admin/session");

  if (session.status === "loading") {
    return <main className="admin-entry-state theme-light"><LoadingState /></main>;
  }

  if (session.status === "error") {
    return (
      <main className="admin-entry-state theme-light">
        <ResourceError status={session.error.status} message={session.error.message} retry={session.retry} />
        <Link to="/">Return to website</Link>
      </main>
    );
  }

  return <ProtectedWorkspace session={session.data} />;
}
