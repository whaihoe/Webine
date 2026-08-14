import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { AdminAsset } from "../../admin/api";
import { initialUploadDetails, uploadAdminMedia, type UploadDetails } from "../../admin/upload-image";
import { useAdminResource } from "../../admin/useAdminResource";
import { useAdminMutation } from "../../admin/useAdminMutation";
import { AdminDataState } from "./AdminDataState";
import { MAX_IMAGE_SIZE_LABEL, MAX_VIDEO_SIZE_LABEL, validateMediaFile } from "../../../shared/media-policy";

const MAX_BATCH_UPLOADS = 40;

type PendingUpload = {
  id: string;
  file: File;
  details: UploadDetails;
  progress: number;
  status: "pending" | "uploading" | "failed";
  error: string;
};

function pendingUploadId(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}

function PendingMediaPreview({ upload }: { upload: PendingUpload }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(upload.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [upload.file]);

  if (!previewUrl) return null;
  return upload.file.type === "video/mp4"
    ? <video src={previewUrl} muted loop autoPlay playsInline aria-label={`Preview of ${upload.file.name}`} />
    : <img src={previewUrl} alt="" style={{ objectPosition: `${upload.details.focalX * 100}% ${upload.details.focalY * 100}%` }} />;
}

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
      {asset.processingState !== "ready" ? <small>This asset is still being verified and cannot be assigned yet.</small> : null}
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
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  function choose(candidates: File[]) {
    if (candidates.length === 0) return;
    const existingIds = new Set(uploads.map((upload) => upload.id));
    const invalid: string[] = [];
    const additions: PendingUpload[] = [];

    for (const candidate of candidates) {
      const id = pendingUploadId(candidate);
      if (existingIds.has(id)) continue;
      const validationMessage = validateMediaFile(candidate);
      if (validationMessage) {
        invalid.push(`${candidate.name}: ${validationMessage}`);
        continue;
      }
      if (uploads.length + additions.length >= MAX_BATCH_UPLOADS) {
        invalid.push(`A batch can contain up to ${MAX_BATCH_UPLOADS} files.`);
        break;
      }
      existingIds.add(id);
      additions.push({
        id,
        file: candidate,
        details: { ...initialUploadDetails },
        progress: 0,
        status: "pending",
        error: "",
      });
    }

    if (additions.length > 0) setUploads((current) => [...current, ...additions]);
    setError(invalid.join(" "));
    setResultMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateUpload(id: string, update: (upload: PendingUpload) => PendingUpload) {
    setUploads((current) => current.map((upload) => upload.id === id ? update(upload) : upload));
  }

  function updateDetails(id: string, details: UploadDetails) {
    updateUpload(id, (upload) => ({ ...upload, details, error: "", status: "pending" }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (uploads.length === 0) return setError("Choose one or more images or MP4 files first.");
    const missingDescription = uploads.find((upload) => !upload.details.decorative && !upload.details.altText.trim());
    if (missingDescription) return setError(`Add a description for ${missingDescription.file.name}, or mark it as decorative.`);

    const batch = [...uploads];
    const uploadedIds = new Set<string>();
    let failedCount = 0;
    setBusy(true);
    setBatchProgress(0);
    setError("");
    setResultMessage("");

    for (const [index, upload] of batch.entries()) {
      updateUpload(upload.id, (current) => ({ ...current, status: "uploading", progress: 0, error: "" }));
      try {
        await uploadAdminMedia(
          upload.file,
          upload.details,
          (progress) => {
            updateUpload(upload.id, (current) => ({ ...current, progress }));
            setBatchProgress(Math.round(((index + progress / 100) / batch.length) * 100));
          },
          mutateAdminResource,
        );
        uploadedIds.add(upload.id);
      } catch (caught) {
        failedCount += 1;
        const message = caught instanceof Error ? caught.message : "The media could not be uploaded.";
        updateUpload(upload.id, (current) => ({ ...current, status: "failed", error: message }));
      }
      setBatchProgress(Math.round(((index + 1) / batch.length) * 100));
    }

    setUploads((current) => current
      .filter((upload) => !uploadedIds.has(upload.id))
      .map((upload) => ({ ...upload, status: upload.status === "uploading" ? "pending" : upload.status })));
    setBusy(false);
    resource.retry();
    const uploadedCount = uploadedIds.size;
    setResultMessage(failedCount > 0
      ? `${uploadedCount} asset${uploadedCount === 1 ? "" : "s"} uploaded. ${failedCount} failed and remain in the queue.`
      : `${uploadedCount} asset${uploadedCount === 1 ? "" : "s"} uploaded successfully.`);
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    choose(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="admin-media-layout">
      <form className="admin-media-uploader" onSubmit={submit}>
        <div className="admin-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={drop}>
          <input ref={inputRef} id="media-file" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4" onChange={(event: ChangeEvent<HTMLInputElement>) => choose(Array.from(event.target.files ?? []))} />
          <label className="admin-primary-action" htmlFor="media-file">Choose media files</label>
          <p>or drop up to {MAX_BATCH_UPLOADS} files here. Images can be up to {MAX_IMAGE_SIZE_LABEL} and MP4 files up to {MAX_VIDEO_SIZE_LABEL}.</p>
        </div>
        {uploads.length > 0 ? <div className="admin-upload-queue">
          <div className="admin-upload-queue__heading">
            <div><strong>{uploads.length} asset{uploads.length === 1 ? "" : "s"} ready</strong><p>Add accurate details before uploading.</p></div>
            <button type="button" disabled={busy} onClick={() => setUploads([])}>Clear queue</button>
          </div>
          {uploads.map((upload) => {
            const isVideo = upload.file.type === "video/mp4";
            return <article className="admin-upload-item" key={upload.id}>
              <PendingMediaPreview upload={upload} />
              <div className="admin-upload-item__body">
                <div className="admin-upload-item__heading">
                  <div><strong>{upload.file.name}</strong><small>{isVideo ? "MP4 video" : "Image"} · {(upload.file.size / 1024 / 1024).toFixed(1)} MB</small></div>
                  <button type="button" disabled={busy} onClick={() => setUploads((current) => current.filter((item) => item.id !== upload.id))}>Remove</button>
                </div>
                <div className="admin-form-grid">
                  <label className="admin-field admin-field--wide"><span>{isVideo ? "Description" : "Alt text"}</span><input value={upload.details.altText} disabled={busy || upload.details.decorative} onChange={(event) => updateDetails(upload.id, { ...upload.details, altText: event.target.value })} /></label>
                  <label className="admin-field admin-field--wide"><span>Caption</span><input value={upload.details.caption} disabled={busy} onChange={(event) => updateDetails(upload.id, { ...upload.details, caption: event.target.value })} /></label>
                  <label className="admin-inline-check"><input type="checkbox" checked={upload.details.decorative} disabled={busy} onChange={(event) => updateDetails(upload.id, { ...upload.details, decorative: event.target.checked, altText: event.target.checked ? "" : upload.details.altText })} /><span>Decorative {isVideo ? "video" : "image"}</span></label>
                  {!isVideo ? <label className="admin-field"><span>Horizontal focal point</span><input type="range" min="0" max="1" step="0.01" value={upload.details.focalX} disabled={busy} onChange={(event) => updateDetails(upload.id, { ...upload.details, focalX: Number(event.target.value) })} /></label> : null}
                  {!isVideo ? <label className="admin-field"><span>Vertical focal point</span><input type="range" min="0" max="1" step="0.01" value={upload.details.focalY} disabled={busy} onChange={(event) => updateDetails(upload.id, { ...upload.details, focalY: Number(event.target.value) })} /></label> : null}
                </div>
                {upload.status === "uploading" ? <progress max="100" value={upload.progress}>{upload.progress}%</progress> : null}
                {upload.error ? <p className="admin-form-error" role="alert">{upload.error}</p> : null}
              </div>
            </article>;
          })}
          {busy ? <div className="admin-upload-queue__progress"><span>Batch progress</span><progress max="100" value={batchProgress}>{batchProgress}%</progress></div> : null}
          <button className="admin-primary-action" type="submit" disabled={busy}>{busy ? `Uploading ${batchProgress}%` : `Upload ${uploads.length} asset${uploads.length === 1 ? "" : "s"}`}</button>
        </div> : null}
        {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
        {resultMessage ? <p className="admin-form-success" role="status">{resultMessage}</p> : null}
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
