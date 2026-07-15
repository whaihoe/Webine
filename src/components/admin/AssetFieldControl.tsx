import type { AdminAsset } from "../../admin/api";
import { useAdminResource } from "../../admin/useAdminResource";
import type { FieldDefinition } from "../../cms/schema";

export function AssetFieldControl({ field, value, onChange }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  const resource = useAdminResource<AdminAsset[]>("/api/admin/media");
  const multiple = field.fieldType === "gallery";
  const selected = new Set(Array.isArray(value) ? value.map(String) : typeof value === "string" ? [value] : []);
  if (resource.status === "loading") return <p className="admin-field-note">Loading media library…</p>;
  if (resource.status === "error") return <p className="admin-field-note">The media library could not load.</p>;
  if (resource.data.length === 0) return <div className="admin-upload-placeholder"><a className="admin-secondary-action" href="/admin/media">Upload an image</a><span>No file path is needed. Upload once, then select it here.</span></div>;
  return (
    <div className="admin-asset-picker">
      {resource.data.map((asset) => {
        const checked = selected.has(asset.id);
        return <label key={asset.id} data-selected={checked}><input type={multiple ? "checkbox" : "radio"} name={field.key} checked={checked} onChange={(event) => {
          if (!multiple) return onChange(event.target.checked ? asset.id : undefined);
          const next = new Set(selected); event.target.checked ? next.add(asset.id) : next.delete(asset.id); onChange([...next]);
        }} /><img src={asset.url} alt="" /><span>{asset.originalFilename}</span></label>;
      })}
    </div>
  );
}
