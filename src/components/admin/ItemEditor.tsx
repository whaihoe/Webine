import { useState, type FormEvent } from "react";
import { useAdminMutation } from "../../admin/useAdminMutation";
import { Link, useNavigate } from "react-router-dom";
import {
  AdminApiError,
  type AdminCollectionDefinition,
  type AdminItem,
  type AdminItemSummary,
} from "../../admin/api";
import { useAdminResource } from "../../admin/useAdminResource";
import type { FieldDefinition } from "../../cms/schema";
import { AssetFieldControl } from "./AssetFieldControl";

type ItemEditorProps = {
  collection: AdminCollectionDefinition;
  item?: AdminItem;
};

function structuredText(value: unknown) {
  if (typeof value === "object" && value !== null && "text" in value) {
    return String((value as { text: unknown }).text ?? "");
  }
  return value ? JSON.stringify(value, null, 2) : "";
}

function repeatedText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map((entry) =>
    typeof entry === "object" && entry !== null && "text" in entry
      ? String((entry as { text: unknown }).text ?? "")
      : JSON.stringify(entry)
  ).join("\n");
}

function ReferenceControl({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const target = field.validation.targetCollection ?? "";
  const resource = useAdminResource<AdminItemSummary[]>(
    `/api/admin/collections/${target}/items`,
  );
  const multiple = field.fieldType === "multi_reference";
  const selected = new Set(Array.isArray(value) ? value : typeof value === "string" ? [value] : []);

  if (resource.status === "loading") return <p className="admin-field-note">Loading referenced items…</p>;
  if (resource.status === "error") return <p className="admin-field-note">Referenced items could not be loaded.</p>;

  return multiple ? (
    <div className="admin-choice-grid">
      {resource.data.map((item) => (
        <label key={item.id}><input type="checkbox" checked={selected.has(item.id)} onChange={(event) => { const next = new Set(selected); event.target.checked ? next.add(item.id) : next.delete(item.id); onChange([...next]); }} /><span>{item.label}</span></label>
      ))}
    </div>
  ) : (
    <select value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value || undefined)}>
      <option value="">Select an item</option>
      {resource.data.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
  );
}

function ContentBlocksControl({ field, value, onChange }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void }) {
  const blocks = Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
  function update(index: number, patch: Record<string, unknown>) {
    onChange(blocks.map((block, blockIndex) => blockIndex === index ? { ...block, ...patch } : block));
  }
  return <div className="admin-content-blocks">
    {blocks.map((block, index) => <article key={index} className="admin-content-block">
      <div className="admin-content-block__top"><strong>Block {index + 1}</strong><select value={String(block.type ?? "statement")} onChange={(event) => update(index, { type: event.target.value })}><option value="statement">Statement</option><option value="text">Text</option><option value="image">Image</option></select><button type="button" onClick={() => onChange(blocks.filter((_, blockIndex) => blockIndex !== index))}>Remove</button></div>
      {block.type === "image" ? <AssetFieldControl field={{ ...field, key: `${field.key}_${index}`, fieldType: "image" }} value={block.assetId} onChange={(assetId) => update(index, { assetId })} /> : <><input value={typeof block.heading === "string" ? block.heading : ""} placeholder="Optional heading" onChange={(event) => update(index, { heading: event.target.value })} /><textarea rows={block.type === "statement" ? 3 : 6} value={typeof block.text === "string" ? block.text : ""} placeholder="Block copy" onChange={(event) => update(index, { text: event.target.value })} /></>}
      <div className="admin-field-card__actions"><button type="button" disabled={index === 0} onClick={() => { const next = [...blocks]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>Move up</button><button type="button" disabled={index === blocks.length - 1} onClick={() => { const next = [...blocks]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; onChange(next); }}>Move down</button></div>
    </article>)}
    <button className="admin-secondary-action" type="button" onClick={() => onChange([...blocks, { type: "statement", text: "" }])}>Add content block</button>
  </div>;
}

function GeneratedControl({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.fieldType === "reference" || field.fieldType === "multi_reference") {
    return <ReferenceControl field={field} value={value} onChange={onChange} />;
  }

  if (field.fieldType === "image" || field.fieldType === "gallery") {
    return <div aria-label="Upload image or select existing media"><AssetFieldControl field={field} value={value} onChange={onChange} /></div>;
  }

  if (field.fieldType === "content_blocks") {
    return <ContentBlocksControl field={field} value={value} onChange={onChange} />;
  }

  if (field.fieldType === "boolean") {
    return <label className="admin-inline-check"><input type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} /><span>Enabled</span></label>;
  }

  if (field.fieldType === "select") {
    return <select value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value || undefined)}><option value="">Choose an option</option>{field.options?.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select>;
  }

  if (field.fieldType === "multi_select") {
    const selected = new Set(Array.isArray(value) ? value : []);
    return <div className="admin-choice-grid">{field.options?.map((option) => <label key={option.key}><input type="checkbox" checked={selected.has(option.key)} onChange={(event) => { const next = new Set(selected); event.target.checked ? next.add(option.key) : next.delete(option.key); onChange([...next]); }} /><span>{option.label}</span></label>)}</div>;
  }

  if (field.fieldType === "number") {
    return <input type="number" value={typeof value === "number" ? value : ""} min={field.validation.min} max={field.validation.max} step={field.validation.integer ? 1 : "any"} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))} />;
  }

  if (field.fieldType === "date_time") {
    return <input type="datetime-local" value={typeof value === "string" ? value.slice(0, 16) : ""} onChange={(event) => onChange(event.target.value || undefined)} />;
  }

  if (field.fieldType === "colour") {
    return <div className="admin-colour-control"><input type="color" value={typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "#2563eb"} onChange={(event) => onChange(event.target.value)} /><input value={typeof value === "string" ? value : ""} placeholder="#2563eb or a design token" onChange={(event) => onChange(event.target.value || undefined)} /></div>;
  }

  if (field.fieldType === "rich_text" || field.fieldType === "field_group") {
    return <textarea rows={field.fieldType === "rich_text" ? 8 : 5} value={structuredText(value)} placeholder={field.placeholder || "Enter structured copy"} onChange={(event) => onChange(event.target.value ? { text: event.target.value } : undefined)} />;
  }

  if (field.fieldType === "repeatable_group") {
    return <textarea rows={8} value={repeatedText(value)} placeholder="One content entry per line" onChange={(event) => onChange(event.target.value ? event.target.value.split("\n").filter(Boolean).map((text) => ({ text })) : [])} />;
  }

  if (field.fieldType === "long_text") {
    return <textarea rows={5} value={typeof value === "string" ? value : ""} placeholder={field.placeholder} minLength={field.validation.minLength} maxLength={field.validation.maxLength} onChange={(event) => onChange(event.target.value || undefined)} />;
  }

  const inputType = field.fieldType === "email" ? "email" : field.fieldType === "url" ? "url" : "text";
  return <input type={inputType} value={typeof value === "string" ? value : ""} placeholder={field.placeholder} minLength={field.validation.minLength} maxLength={field.validation.maxLength} pattern={field.validation.pattern} onChange={(event) => onChange(event.target.value || undefined)} />;
}

export function ItemEditor({ collection, item }: ItemEditorProps) {
  const mutateAdminResource = useAdminMutation();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(item);
  const [data, setData] = useState<Record<string, unknown>>(item?.data ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<AdminApiError | null>(null);

  function setField(key: string, value: unknown) {
    setData((current) => {
      const next = { ...current };
      if (value === undefined || value === "") delete next[key];
      else next[key] = value;
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const path = currentItem
        ? `/api/admin/collections/${collection.key}/items/${currentItem.id}`
        : `/api/admin/collections/${collection.key}/items`;
      const saved = await mutateAdminResource<AdminItem>(
        path,
        currentItem ? "PATCH" : "POST",
        currentItem ? { data, version: currentItem.version } : data,
      );
      setCurrentItem(saved);
      setData(saved.data);
      navigate(`/admin/collections/${collection.key}/items/${saved.id}`, { replace: true });
    } catch (caught) {
      setError(caught instanceof AdminApiError
        ? caught
        : new AdminApiError(500, "SAVE_FAILED", "The item could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(action: "publish" | "unpublish" | "archive") {
    if (!currentItem) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await mutateAdminResource<AdminItem>(
        `/api/admin/collections/${collection.key}/items/${currentItem.id}/status`,
        "POST",
        { action, version: currentItem.version },
      );
      if (action === "archive") {
        navigate(`/admin/collections/${collection.key}/items`, { replace: true });
        return;
      }
      setCurrentItem(saved);
      setData(saved.data);
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught : new AdminApiError(500, "STATUS_FAILED", "The publishing action could not be completed."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-item-form" onSubmit={submit}>
      <div className="admin-item-form__intro">
        <p>Drafts may be saved before every required publishing field is complete. Entered values are still validated now.</p>
        {currentItem ? <span>Version {currentItem.version} · {currentItem.status}</span> : <span>New draft</span>}
      </div>
      <div className="admin-generated-fields">
        {collection.fields.map((field) => (
          <fieldset className="admin-field admin-generated-field" key={field.key}>
            <legend>{field.label}{field.required ? <em>Required to publish</em> : null}</legend>
            {field.helpText ? <small>{field.helpText}</small> : null}
            <GeneratedControl field={field} value={data[field.key]} onChange={(value) => setField(field.key, value)} />
          </fieldset>
        ))}
      </div>
      {error ? <div className="admin-form-error" role="alert"><strong>{error.message}</strong>{error.issues.length ? <ul>{error.issues.map((entry) => <li key={`${entry.path}-${entry.code}`}>{entry.path}: {entry.message}</li>)}</ul> : null}</div> : null}
      <div className="admin-form-actions">
        <button className="admin-primary-action" type="submit" disabled={saving}>{saving ? "Working…" : "Save draft"}</button>
        {currentItem ? <Link className="admin-secondary-action" to={`/preview?collection=${collection.key}&id=${currentItem.id}`}>Preview</Link> : null}
        {currentItem?.status !== "published" ? <button className="admin-secondary-action" type="button" disabled={saving} onClick={() => void changeStatus("publish")}>Publish</button> : <button className="admin-secondary-action" type="button" disabled={saving} onClick={() => void changeStatus("publish")}>Republish</button>}
        {currentItem?.status === "published" ? <button className="admin-secondary-action" type="button" disabled={saving} onClick={() => void changeStatus("unpublish")}>Unpublish</button> : null}
        {currentItem ? <button className="admin-secondary-action" type="button" disabled={saving} onClick={() => void changeStatus("archive")}>Archive</button> : null}
        <button className="admin-secondary-action" type="button" onClick={() => navigate(`/admin/collections/${collection.key}/items`)}>Cancel</button>
      </div>
    </form>
  );
}
