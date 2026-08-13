import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { AdminAsset } from "../../admin/api";
import { initialUploadDetails, uploadAdminMedia, type UploadDetails } from "../../admin/upload-image";
import { useAdminResource } from "../../admin/useAdminResource";
import { useAdminMutation } from "../../admin/useAdminMutation";
import { AdminDataState } from "./AdminDataState";
import { MAX_IMAGE_SIZE_LABEL, validateMediaFile } from "../../../shared/media-policy";

function MediaAssetCard({ asset, onChanged }: { asset: AdminAsset; onChanged: () => void }) {
  const mutateAdminResource = useAdminMutation();
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
    if (!window.confirm(`Archive ${asset.originalFilename}? It will be removed from the reusable media library and its stored file will be permanently deleted.`)) return;
    setBusy(true); setError("");
    try { await mutateAdminResource(`/api/admin/media/${asset.id}`, "DELETE", {}); onChanged(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "The media item could not be archived."); }
    finally { setBusy(false); }
  }
  const archiveBlocked = asset.usageCount > 0;
  const isVideo = asset.mimeType === "video/mp4";
  return <article className="admin-media-card">
    {isVideo
      ? <video src={asset.url} muted loop autoPlay playsInline aria-label={asset.decorative ? undefined : asset.altText} />
      : <img src={asset.url} alt={asset.decorative ? "" : asset.altText} style={{ objectPosition: `${details.focalX * 100}% ${details.focalY * 100}%` }} />}
    <div>
      <strong>{asset.displayName}</strong>
      <small>Original: {asset.originalFilename}</small>
      <span>{asset.width} × {asset.height}</span>
      <span>Status: {asset.processingState}</span>
      <small>Asset ID: {asset.id}</small>
      <span>{asset.usageCount} use{asset.usageCount === 1 ? "" : "s"}{asset.publishedUsageCount ? `, ${asset.publishedUsageCount} published` : ""}</span>
      <div className="admin-media-card__actions">
        <button type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Close details" : "Edit details"}</button>
        <button type="button" disabled={busy || archiveBlocked} onClick={() => void archive()}>Archive</button>
      </div>
      {archiveBlocked ? <small>Replace or remove this media from all content before archiving it.</small> : null}
      {asset.processingState !== "ready" ? <small>Process all three renditions using this asset ID before assigning it to a Project.</small> : null}
      {!editing && error ? <p className="admin-form-error" role="alert">{error}</p> : null}
    </div>
    {editing ? <form className="admin-media-card__editor" onSubmit={save}>
      <label className="admin-field"><span>{isVideo ? "Description" : "Alt text"}</span><input value={details.altText} disabled={details.decorative} onChange={(event) => setDetails({ ...details, altText: event.target.value })} /></label>
      <label className="admin-field"><span>Caption</span><input value={details.caption} onChange={(event) => setDetails({ ...details, caption: event.target.value })} /></label>
      <label className="admin-inline-check"><input type="checkbox" checked={details.decorative} onChange={(event) => setDetails({ ...details, decorative: event.target.checked, altText: event.target.checked ? "" : details.altText })} /><span>Decorative {isVideo ? "video" : "image"}</span></label>
      {!isVideo ? <label className="admin-field"><span>Horizontal focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalX} onChange={(event) => setDetails({ ...details, focalX: Number(event.target.value) })} /></label> : null}
      {!isVideo ? <label className="admin-field"><span>Vertical focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalY} onChange={(event) => setDetails({ ...details, focalY: Number(event.target.value) })} /></label> : null}
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={busy}>Save details</button></div>
    </form> : null}
  </article>;
}

export function MediaLibrary() {
  const mutateAdminResource = useAdminMutation();
  const resource = useAdminResource<AdminAsset[]>("/api/admin/media");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState(initialUploadDetails);
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
    const validationMessage = validateMediaFile(candidate);
    if (validationMessage) {
      setFile(null);
      setError(validationMessage);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(candidate);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return setError("Choose an image or MP4 first.");
    if (!details.decorative && !details.altText.trim()) return setError("Add a description or mark the media as decorative.");
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      await uploadAdminMedia(
        file,
        details,
        setProgress,
        mutateAdminResource,
      );
      setFile(null);
      setDetails(initialUploadDetails);
      setProgress(100);
      if (inputRef.current) inputRef.current.value = "";
      resource.retry();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The media could not be uploaded.");
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
          <input ref={inputRef} id="media-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4" onChange={(event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0])} />
          <label className="admin-primary-action" htmlFor="media-file">Choose media</label>
          <p>or drop a JPEG, PNG, WebP, AVIF, animated GIF or MP4 here, up to {MAX_IMAGE_SIZE_LABEL}</p>
        </div>
        {file ? (
          <div className="admin-upload-details">
            {file.type === "video/mp4"
              ? <video src={previewUrl} muted loop autoPlay playsInline aria-label="New video upload preview" />
              : <img src={previewUrl} alt="New upload preview" style={{ objectPosition: `${details.focalX * 100}% ${details.focalY * 100}%` }} />}
            <div className="admin-form-grid">
              <label className="admin-field admin-field--wide"><span>{file.type === "video/mp4" ? "Description" : "Alt text"}</span><input value={details.altText} disabled={details.decorative} onChange={(event) => setDetails({ ...details, altText: event.target.value })} /></label>
              <label className="admin-field admin-field--wide"><span>Caption</span><input value={details.caption} onChange={(event) => setDetails({ ...details, caption: event.target.value })} /></label>
              <label className="admin-inline-check"><input type="checkbox" checked={details.decorative} onChange={(event) => setDetails({ ...details, decorative: event.target.checked, altText: event.target.checked ? "" : details.altText })} /><span>Decorative {file.type === "video/mp4" ? "video" : "image"}</span></label>
              {file.type !== "video/mp4" ? <label className="admin-field"><span>Horizontal focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalX} onChange={(event) => setDetails({ ...details, focalX: Number(event.target.value) })} /></label> : null}
              {file.type !== "video/mp4" ? <label className="admin-field"><span>Vertical focal point</span><input type="range" min="0" max="1" step="0.01" value={details.focalY} onChange={(event) => setDetails({ ...details, focalY: Number(event.target.value) })} /></label> : null}
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
        {resource.status === "ready" && resource.data.length === 0 ? <AdminDataState title="No media yet." description="Upload the first image or MP4 without entering a file path." /> : null}
        {resource.status === "ready" && resource.data.length > 0 ? (
          <div className="admin-media-grid">
            {resource.data.map((asset) => <MediaAssetCard key={asset.id} asset={asset} onChanged={resource.retry} />)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
