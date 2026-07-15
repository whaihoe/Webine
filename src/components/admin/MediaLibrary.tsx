import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { AdminApiError, mutateAdminResource, type AdminAsset, type ApiEnvelope } from "../../admin/api";
import { useAdminResource } from "../../admin/useAdminResource";
import { AdminDataState } from "./AdminDataState";

type UploadDetails = {
  altText: string;
  caption: string;
  decorative: boolean;
  focalX: number;
  focalY: number;
};

const initialDetails: UploadDetails = { altText: "", caption: "", decorative: false, focalX: 0.5, focalY: 0.5 };

function MediaAssetCard({ asset, onChanged }: { asset: AdminAsset; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState<UploadDetails>({ altText: asset.altText, caption: asset.caption, decorative: asset.decorative, focalX: asset.focalX, focalY: asset.focalY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await mutateAdminResource(`/api/admin/media/${asset.id}`, "PATCH", { ...details, version: asset.version }); setEditing(false); onChanged(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Media details could not be saved."); }
    finally { setBusy(false); }
  }
  async function archive() {
    setBusy(true); setError("");
    try { await mutateAdminResource(`/api/admin/media/${asset.id}`, "DELETE", {}); onChanged(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "The media item could not be archived."); }
    finally { setBusy(false); }
  }
  return <article className="admin-media-card">
    <img src={asset.url} alt={asset.decorative ? "" : asset.altText} style={{ objectPosition: `${details.focalX * 100}% ${details.focalY * 100}%` }} />
    <div><strong>{asset.originalFilename}</strong><span>{asset.width} × {asset.height}</span><span>{asset.usageCount} use{asset.usageCount === 1 ? "" : "s"}{asset.publishedUsageCount ? `, ${asset.publishedUsageCount} published` : ""}</span><button type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Close details" : "Edit details"}</button></div>
    {editing ? <form className="admin-media-card__editor" onSubmit={save}>
      <label className="admin-field"><span>Alt text</span><input value={details.altText} disabled={details.decorative} onChange={(event) => setDetails({ ...details, altText: event.target.value })} /></label>
      <label className="admin-field"><span>Caption</span><input value={details.caption} onChange={(event) => setDetails({ ...details, caption: event.target.value })} /></label>
      <label className="admin-inline-check"><input type="checkbox" checked={details.decorative} onChange={(event) => setDetails({ ...details, decorative: event.target.checked, altText: event.target.checked ? "" : details.altText })} /><span>Decorative image</span></label>
      <label className="admin-field"><span>Horizontal focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalX} onChange={(event) => setDetails({ ...details, focalX: Number(event.target.value) })} /></label>
      <label className="admin-field"><span>Vertical focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalY} onChange={(event) => setDetails({ ...details, focalY: Number(event.target.value) })} /></label>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={busy}>Save details</button><button className="admin-secondary-action" type="button" disabled={busy || asset.publishedUsageCount > 0} onClick={() => void archive()}>Archive</button></div>
    </form> : null}
  </article>;
}

async function localUpload(file: File, details: UploadDetails, onProgress: (value: number) => void) {
  return new Promise<AdminAsset>((resolve, reject) => {
    const body = new FormData();
    body.set("file", file);
    Object.entries(details).forEach(([key, value]) => body.set(key, String(value)));
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media/local-upload");
    request.setRequestHeader("Accept", "application/json");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round(event.loaded / event.total * 100));
    request.onerror = () => reject(new AdminApiError(0, "UPLOAD_FAILED", "The upload connection was interrupted."));
    request.onload = () => {
      try {
        const envelope = JSON.parse(request.responseText) as ApiEnvelope<AdminAsset>;
        if (request.status < 200 || request.status >= 300 || !envelope.data) {
          reject(new AdminApiError(request.status, envelope.error?.code ?? "UPLOAD_FAILED", envelope.error?.message ?? "The image could not be uploaded."));
        } else resolve(envelope.data);
      } catch {
        reject(new AdminApiError(request.status, "UPLOAD_FAILED", "The upload response was invalid."));
      }
    };
    request.send(body);
  });
}

export function MediaLibrary() {
  const resource = useAdminResource<AdminAsset[]>("/api/admin/media");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState(initialDetails);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(candidate?: File) {
    if (!candidate) return;
    setFile(candidate);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("Choose an image first.");
    if (!details.decorative && !details.altText.trim()) return setError("Add alt text or mark the image as decorative.");
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      if (import.meta.env.DEV) {
        await localUpload(file, details, setProgress);
      } else {
        const blob = await upload(`webine/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/media/upload-token",
          multipart: file.size > 4 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        await mutateAdminResource<AdminAsset>("/api/admin/media/complete", "POST", {
          ...details,
          url: blob.url,
          pathname: blob.pathname,
          originalFilename: file.name,
        });
      }
      setFile(null);
      setDetails(initialDetails);
      setProgress(100);
      if (inputRef.current) inputRef.current.value = "";
      resource.retry();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The image could not be uploaded.");
    } finally {
      setBusy(false);
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    choose(event.dataTransfer.files[0]);
  }

  return (
    <div className="admin-media-layout">
      <form className="admin-media-uploader" onSubmit={submit}>
        <div className="admin-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={drop}>
          <input ref={inputRef} id="media-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0])} />
          <label className="admin-primary-action" htmlFor="media-file">Choose image</label>
          <p>or drop a JPEG, PNG, WebP or AVIF here, up to 20 MB</p>
        </div>
        {file ? (
          <div className="admin-upload-details">
            <img src={previewUrl} alt="New upload preview" style={{ objectPosition: `${details.focalX * 100}% ${details.focalY * 100}%` }} />
            <div className="admin-form-grid">
              <label className="admin-field admin-field--wide"><span>Alt text</span><input value={details.altText} disabled={details.decorative} onChange={(event) => setDetails({ ...details, altText: event.target.value })} /></label>
              <label className="admin-field admin-field--wide"><span>Caption</span><input value={details.caption} onChange={(event) => setDetails({ ...details, caption: event.target.value })} /></label>
              <label className="admin-inline-check"><input type="checkbox" checked={details.decorative} onChange={(event) => setDetails({ ...details, decorative: event.target.checked, altText: event.target.checked ? "" : details.altText })} /><span>Decorative image</span></label>
              <label className="admin-field"><span>Horizontal focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalX} onChange={(event) => setDetails({ ...details, focalX: Number(event.target.value) })} /></label>
              <label className="admin-field"><span>Vertical focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalY} onChange={(event) => setDetails({ ...details, focalY: Number(event.target.value) })} /></label>
            </div>
            {busy ? <progress max="100" value={progress}>{progress}%</progress> : null}
            <button className="admin-primary-action" type="submit" disabled={busy}>{busy ? `Uploading ${progress}%` : "Upload to library"}</button>
          </div>
        ) : null}
        {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      </form>

      <section aria-labelledby="media-assets-heading">
        <div className="workspace-page__heading"><h2 id="media-assets-heading">Reusable assets</h2></div>
        {resource.status === "loading" ? <p>Loading media…</p> : null}
        {resource.status === "error" ? <AdminDataState title="Media could not load." description={resource.error.message} actionLabel="Try again" onAction={resource.retry} tone="error" /> : null}
        {resource.status === "ready" && resource.data.length === 0 ? <AdminDataState title="No media yet." description="Upload the first image without entering a file path." /> : null}
        {resource.status === "ready" && resource.data.length > 0 ? (
          <div className="admin-media-grid">
            {resource.data.map((asset) => <MediaAssetCard key={asset.id} asset={asset} onChanged={resource.retry} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
