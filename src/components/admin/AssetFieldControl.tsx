import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { AdminAsset } from "../../admin/api";
import { initialUploadDetails, uploadAdminMedia } from "../../admin/upload-image";
import { useAdminMutation } from "../../admin/useAdminMutation";
import { useAdminResource } from "../../admin/useAdminResource";
import { useAdminAuth } from "../../admin/AdminAuthContext";
import type { FieldDefinition } from "../../cms/schema";
import { validateImageFile, validateMediaFile, validateVideoFile } from "../../../shared/media-policy";

type MediaKind = "image" | "media" | "video";

function fieldRole(field: FieldDefinition) {
  if (field.key === "hero_image") return "Project cover";
  if (field.key === "hover_image") return "Card hover image";
  if (field.key === "social_image") return "Social sharing image";
  if (field.key.startsWith("content_blocks_")) return "Project story media";
  if (field.fieldType === "gallery") return "Project gallery";
  return field.label;
}

function InlineAssetUpload({ field, mediaKind, onUploaded }: { field: FieldDefinition; mediaKind: MediaKind; onUploaded: (asset: AdminAsset) => void }) {
  const mutateAdminResource = useAdminMutation();
  const { getToken } = useAdminAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [details, setDetails] = useState(initialUploadDetails);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit() {
    if (!file) return setError(`Choose ${mediaKind === "video" ? "an MP4" : mediaKind === "media" ? "an image or MP4" : "an image"} first.`);
    if (!details.decorative && !details.altText.trim()) return setError(`Add a description or mark this ${mediaKind === "media" ? "asset" : mediaKind} as decorative.`);
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      const asset = await uploadAdminMedia(
        file,
        details,
        setProgress,
        mutateAdminResource,
        getToken,
      );
      onUploaded(asset);
      setFile(null);
      setDetails(initialUploadDetails);
      if (inputRef.current) inputRef.current.value = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `The ${mediaKind} could not be uploaded.`);
    } finally {
      setBusy(false);
    }
  }

  function choose(candidate: File | null) {
    if (!candidate) {
      setFile(null);
      return;
    }
    const validationMessage = mediaKind === "video"
      ? validateVideoFile(candidate)
      : mediaKind === "media"
        ? validateMediaFile(candidate)
        : validateImageFile(candidate);
    if (validationMessage) {
      setFile(null);
      setError(validationMessage);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(candidate);
    setError("");
  }

  return (
    <div className="admin-inline-upload">
      <div className="admin-inline-upload__intro">
        <strong>Upload for {fieldRole(field)}</strong>
        <span>The file is added to the shared library and selected here. Save the draft to assign it to this project.</span>
      </div>
      <input ref={inputRef} id={`upload-${field.key}`} type="file" accept={mediaKind === "video" ? "video/mp4" : mediaKind === "media" ? "image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4" : "image/jpeg,image/png,image/webp,image/avif,image/gif"} onChange={(event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0] ?? null)} />
      <label className="admin-secondary-action" htmlFor={`upload-${field.key}`}>{file ? `Choose different ${mediaKind === "media" ? "media" : mediaKind}` : `Choose ${mediaKind}`}</label>
      {file ? (
        <div className="admin-inline-upload__details">
          {file.type === "video/mp4"
            ? <video src={previewUrl} muted loop autoPlay playsInline aria-label="New project video preview" />
            : <img src={previewUrl} alt="New project upload preview" />}
          <label className="admin-field"><span>{file.type === "video/mp4" ? "Description" : "Alt text"}</span><input value={details.altText} disabled={details.decorative} onChange={(event) => setDetails({ ...details, altText: event.target.value })} /></label>
          <label className="admin-field"><span>Caption</span><input value={details.caption} onChange={(event) => setDetails({ ...details, caption: event.target.value })} /></label>
          <label className="admin-inline-check"><input type="checkbox" checked={details.decorative} onChange={(event) => setDetails({ ...details, decorative: event.target.checked, altText: event.target.checked ? "" : details.altText })} /><span>Decorative {mediaKind === "media" ? "asset" : mediaKind}</span></label>
          {busy ? <progress max="100" value={progress}>{progress}%</progress> : null}
          <button className="admin-primary-action" type="button" disabled={busy} onClick={() => void submit()}>{busy ? `Uploading ${progress}%` : "Upload and select"}</button>
        </div>
      ) : null}
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
    </div>
  );
}

export function AssetFieldControl({
  field,
  value,
  onChange,
  maxItems,
  mediaKind,
}: {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  maxItems?: number;
  mediaKind?: MediaKind;
}) {
  const resource = useAdminResource<AdminAsset[]>("/api/admin/media");
  const resolvedMediaKind = mediaKind ?? (field.key.includes("social_image") ? "image" : "media");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const multiple = field.fieldType === "gallery";
  const selectedIds = Array.isArray(value) ? value.map(String) : typeof value === "string" ? [value] : [];
  const selected = new Set(selectedIds);
  const maximumReached = Boolean(multiple && maxItems && selectedIds.length >= maxItems);

  function selectUploaded(asset: AdminAsset) {
    if (maximumReached) return;
    onChange(multiple ? [...selectedIds, asset.id] : asset.id);
    setUploadOpen(false);
    resource.retry();
  }

  function selectExisting(assetId: string) {
    if (maximumReached) return;
    onChange(multiple ? [...selectedIds, assetId] : assetId);
    setLibraryOpen(false);
  }

  function remove(assetId: string) {
    if (!multiple) onChange(undefined);
    else onChange(selectedIds.filter((id) => id !== assetId));
  }

  function move(assetId: string, direction: -1 | 1) {
    const index = selectedIds.indexOf(assetId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  if (resource.status === "loading") return <p className="admin-field-note">Loading project media…</p>;
  if (resource.status === "error") return <div className="admin-upload-placeholder"><span>The media library could not load.</span><button type="button" onClick={resource.retry}>Try again</button></div>;

  const byId = new Map(resource.data.map((asset) => [asset.id, asset]));
  const selectedAssets = selectedIds.map((id) => byId.get(id)).filter((asset): asset is AdminAsset => Boolean(asset));
  const matchingAssets = resource.data.filter((asset) =>
    resolvedMediaKind === "video"
      ? asset.mimeType === "video/mp4"
      : resolvedMediaKind === "media"
        ? asset.mimeType.startsWith("image/") || asset.mimeType === "video/mp4"
        : asset.mimeType.startsWith("image/"),
  );
  const availableAssets = matchingAssets.filter((asset) => !selected.has(asset.id));

  return (
    <div className="admin-project-media-field" data-role={fieldRole(field)}>
      <div className="admin-project-media-field__status">
        <strong>{fieldRole(field)}</strong>
        <span>{selectedAssets.length ? `${selectedAssets.length}${maxItems ? ` of ${maxItems}` : ""} selected, pending draft save after changes` : `No ${resolvedMediaKind} selected`}</span>
      </div>

      {selectedAssets.length ? (
        <div className="admin-project-media-selection">
          {selectedAssets.map((asset, index) => (
            <article key={asset.id}>
              {asset.mimeType === "video/mp4"
                ? <video src={asset.url} muted playsInline preload="metadata" aria-label={asset.decorative ? undefined : asset.altText} />
                : <img src={asset.url} alt={asset.decorative ? "" : asset.altText} />}
              <div>
                <span>{multiple ? `Gallery ${index + 1}` : fieldRole(field)}</span>
                <strong>{asset.originalFilename}</strong>
                <small>{asset.width} × {asset.height}</small>
              </div>
              <div className="admin-project-media-selection__actions">
                {multiple ? <button type="button" disabled={index === 0} onClick={() => move(asset.id, -1)}>Move earlier</button> : null}
                {multiple ? <button type="button" disabled={index === selectedAssets.length - 1} onClick={() => move(asset.id, 1)}>Move later</button> : null}
                <button type="button" onClick={() => remove(asset.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="admin-project-media-field__actions">
        <button className="admin-secondary-action" type="button" disabled={maximumReached} aria-expanded={uploadOpen} onClick={() => { setUploadOpen((current) => !current); setLibraryOpen(false); }}>{uploadOpen ? "Close upload" : selectedAssets.length && !multiple ? "Upload replacement" : `Upload new ${resolvedMediaKind}`}</button>
        <button className="admin-secondary-action" type="button" disabled={maximumReached} aria-expanded={libraryOpen} onClick={() => { setLibraryOpen((current) => !current); setUploadOpen(false); }}>{libraryOpen ? "Close media library" : selectedAssets.length && !multiple ? "Choose replacement" : "Choose existing asset"}</button>
      </div>
      {maximumReached ? <p className="admin-field-note">This block has reached its maximum of {maxItems} images.</p> : null}

      {uploadOpen ? <InlineAssetUpload field={field} mediaKind={resolvedMediaKind} onUploaded={selectUploaded} /> : null}

      {libraryOpen ? (
        <section className="admin-project-media-library" aria-label={`Existing assets for ${fieldRole(field)}`}>
          <div className="admin-project-media-library__heading"><strong>Shared media library</strong><span>{availableAssets.length} available</span></div>
          {availableAssets.length ? (
            <div className="admin-asset-picker">
              {availableAssets.map((asset) => (
                <button key={asset.id} type="button" onClick={() => selectExisting(asset.id)}>
                  {asset.mimeType === "video/mp4"
                    ? <video src={asset.url} muted playsInline preload="metadata" aria-hidden="true" />
                    : <img src={asset.url} alt="" />}
                  <span>{asset.originalFilename}</span>
                  <small>{asset.usageCount} existing use{asset.usageCount === 1 ? "" : "s"}</small>
                </button>
              ))}
            </div>
          ) : <p className="admin-field-note">Every available asset is already selected here.</p>}
        </section>
      ) : null}
    </div>
  );
}
