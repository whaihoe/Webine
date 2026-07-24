import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { ProjectMediaOverview } from "./ProjectMediaOverview";

type ItemEditorProps = {
  collection: AdminCollectionDefinition;
  item?: AdminItem;
};

type ItemEditorActionsProps = {
  collectionKey: string;
  currentItem?: AdminItem;
  dirty: boolean;
  saving: boolean;
  onStatusChange: (action: "publish" | "unpublish" | "archive") => void;
  onPurge: () => void;
  onCancel: () => void;
};

function ItemEditorActions({
  collectionKey,
  currentItem,
  dirty,
  saving,
  onStatusChange,
  onPurge,
  onCancel,
}: ItemEditorActionsProps) {
  return (
    <div className="admin-form-actions">
      <button className="admin-primary-action" type="submit" disabled={saving || !dirty}>
        {saving ? "Working..." : dirty ? "Save draft" : "Draft saved"}
      </button>
      {currentItem && !dirty ? (
        <Link className="admin-secondary-action" to={`/preview?collection=${collectionKey}&id=${currentItem.id}`}>
          Preview
        </Link>
      ) : currentItem ? (
        <span className="admin-action-note">Save changes to preview</span>
      ) : null}
      {currentItem?.status !== "published" ? (
        <button className="admin-secondary-action" type="button" disabled={saving || dirty || !currentItem} onClick={() => onStatusChange("publish")}>
          Publish
        </button>
      ) : (
        <button className="admin-secondary-action" type="button" disabled={saving || dirty} onClick={() => onStatusChange("publish")}>
          Republish
        </button>
      )}
      {currentItem?.status === "published" ? (
        <>
          <button className="admin-secondary-action" type="button" disabled={saving || dirty} onClick={() => onStatusChange("unpublish")}>
            Unpublish
          </button>
          <button className="admin-secondary-action" type="button" disabled={saving || dirty} onClick={() => onStatusChange("archive")}>
            Archive
          </button>
        </>
      ) : null}
      {currentItem && currentItem.status !== "published" && currentItem.id !== "item_site_settings" ? (
        <button className="admin-danger-action" type="button" disabled={saving || dirty} onClick={onPurge}>
          Delete permanently
        </button>
      ) : null}
      <button className="admin-secondary-action" type="button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

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

function StructuredJsonControl({
  value,
  expected,
  onChange,
}: {
  value: unknown;
  expected: "object" | "array";
  onChange: (value: unknown) => void;
}) {
  const fallback = expected === "object" ? {} : [];
  const [draft, setDraft] = useState(() => JSON.stringify(value ?? fallback, null, 2));
  const [message, setMessage] = useState("");

  function update(next: string) {
    setDraft(next);
    try {
      const parsed = JSON.parse(next) as unknown;
      const valid = expected === "array"
        ? Array.isArray(parsed)
        : Boolean(parsed) && typeof parsed === "object" && !Array.isArray(parsed);
      if (!valid) {
        setMessage(`Enter a JSON ${expected}.`);
        return;
      }
      setMessage("");
      onChange(parsed);
    } catch {
      setMessage("Finish the JSON structure before saving.");
    }
  }

  return (
    <div className="admin-json-control">
      <textarea
        rows={12}
        value={draft}
        spellCheck={false}
        aria-invalid={Boolean(message)}
        onChange={(event) => update(event.target.value)}
      />
      <small>{message || `Structured ${expected}. Keep property names and quotation marks intact.`}</small>
    </div>
  );
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
      {block.type === "image" ? (
        <>
          <AssetFieldControl field={{ ...field, key: `${field.key}_${index}`, fieldType: "image" }} value={block.assetId} onChange={(assetId) => update(index, { assetId })} />
          <input value={typeof block.heading === "string" ? block.heading : ""} placeholder="Image section heading" onChange={(event) => update(index, { heading: event.target.value })} />
          <textarea rows={3} value={typeof block.text === "string" ? block.text : ""} placeholder="Optional image caption" onChange={(event) => update(index, { text: event.target.value })} />
          <label>
            <span>Image layout</span>
            <select value={typeof block.layout === "string" ? block.layout : "wide"} onChange={(event) => update(index, { layout: event.target.value })}>
              <option value="wide">Wide</option>
              <option value="full">Full width</option>
              <option value="bento">Bento feature</option>
            </select>
          </label>
          {block.layout === "bento" ? <p className="admin-field-note">Place this block last and upload one finished 16:10 bento composition.</p> : null}
        </>
      ) : <><input value={typeof block.heading === "string" ? block.heading : ""} placeholder="Optional heading" onChange={(event) => update(index, { heading: event.target.value })} /><textarea rows={block.type === "statement" ? 3 : 6} value={typeof block.text === "string" ? block.text : ""} placeholder="Block copy" onChange={(event) => update(index, { text: event.target.value })} /></>}
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

  if (field.fieldType === "field_group") {
    return <StructuredJsonControl value={value} expected="object" onChange={onChange} />;
  }

  if (field.fieldType === "rich_text") {
    return <textarea rows={8} value={structuredText(value)} placeholder={field.placeholder || "Enter structured copy"} onChange={(event) => onChange(event.target.value ? { text: event.target.value } : undefined)} />;
  }

  if (field.fieldType === "repeatable_group") {
    if (field.key === "home_principles" || field.key === "home_process_steps") {
      return <StructuredJsonControl value={value} expected="array" onChange={onChange} />;
    }
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
  const dirty = useMemo(
    () => JSON.stringify(data) !== JSON.stringify(currentItem?.data ?? {}),
    [currentItem?.data, data],
  );

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

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

  async function purge() {
    if (!currentItem) return;
    const label = typeof data[collection.displayFieldKey] === "string"
      ? data[collection.displayFieldKey]
      : "this item";
    const confirmation = window.prompt(
      `Permanently delete ${label} and its saved history? Type DELETE to continue.`,
    );
    if (confirmation !== "DELETE") return;

    setSaving(true);
    setError(null);
    try {
      await mutateAdminResource(
        `/api/admin/collections/${collection.key}/items/${currentItem.id}`,
        "DELETE",
        { version: currentItem.version },
      );
      navigate(`/admin/collections/${collection.key}/items`, { replace: true });
    } catch (caught) {
      setError(caught instanceof AdminApiError
        ? caught
        : new AdminApiError(500, "DELETE_FAILED", "The item could not be deleted."));
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    if (!dirty || window.confirm("Leave without saving these changes?")) {
      navigate(`/admin/collections/${collection.key}/items`);
    }
  }

  return (
    <form className="admin-item-form" onSubmit={submit}>
      <div className="admin-item-form__intro">
        <p>Drafts may be saved before every required publishing field is complete. Entered values are still validated now.</p>
        {currentItem ? <span>Version {currentItem.version} · {currentItem.status} · {dirty ? "Changes not saved" : "Saved"}</span> : <span>New draft · {dirty ? "Changes not saved" : "Nothing entered yet"}</span>}
      </div>
      {collection.key === "projects" ? (
        <ItemEditorActions
          collectionKey={collection.key}
          currentItem={currentItem}
          dirty={dirty}
          saving={saving}
          onStatusChange={(action) => void changeStatus(action)}
          onPurge={() => void purge()}
          onCancel={cancel}
        />
      ) : null}
      {collection.key === "projects" ? <ProjectMediaOverview data={data} dirty={dirty} /> : null}
      <div className="admin-generated-fields">
        {collection.fields.map((field) => (
          <fieldset className="admin-field admin-generated-field" id={`field-${field.key}`} key={field.key}>
            <legend>{field.label}{field.required ? <em>Required to publish</em> : null}</legend>
            {field.helpText ? <small>{field.helpText}</small> : null}
            <GeneratedControl field={field} value={data[field.key]} onChange={(value) => setField(field.key, value)} />
          </fieldset>
        ))}
      </div>
      {error ? <div className="admin-form-error" role="alert"><strong>{error.message}</strong>{error.issues.length ? <ul>{error.issues.map((entry) => <li key={`${entry.path}-${entry.code}`}>{entry.path}: {entry.message}</li>)}</ul> : null}</div> : null}
      <ItemEditorActions
        collectionKey={collection.key}
        currentItem={currentItem}
        dirty={dirty}
        saving={saving}
        onStatusChange={(action) => void changeStatus(action)}
        onPurge={() => void purge()}
        onCancel={cancel}
      />
    </form>
  );
}
