import { useMemo, useState, type FormEvent } from "react";
import { useAdminMutation } from "../../admin/useAdminMutation";
import { useNavigate } from "react-router-dom";
import {
  AdminApiError,
  type AdminCollectionDefinition,
} from "../../admin/api";
import {
  fieldTypes,
  type CollectionDefinition,
  type FieldDefinition,
  type FieldOption,
  type FieldValidation,
} from "../../cms/schema";

type CollectionEditorProps = {
  initial?: AdminCollectionDefinition;
};

function newField(position: number): FieldDefinition {
  return {
    key: position === 0 ? "title" : `field_${position + 1}`,
    label: position === 0 ? "Title" : `Field ${position + 1}`,
    helpText: "",
    placeholder: "",
    fieldType: "short_text",
    required: position === 0,
    position,
    isSystem: false,
    validation: {},
  };
}

const emptyCollection: CollectionDefinition = {
  key: "",
  nameSingular: "",
  namePlural: "",
  description: "",
  displayFieldKey: "title",
  isSystem: false,
  status: "active",
  fields: [newField(0)],
};

function optionsToText(options?: FieldOption[]) {
  return options?.map((option) => `${option.key}: ${option.label}`).join("\n") ?? "";
}

function textToOptions(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [key, ...label] = line.split(":");
    return { key: key.trim(), label: label.join(":").trim() || key.trim() };
  });
}

export function CollectionEditor({ initial }: CollectionEditorProps) {
  const mutateAdminResource = useAdminMutation();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CollectionDefinition>(initial ?? emptyCollection);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<AdminApiError | null>(null);
  const editing = Boolean(initial);
  const slugFields = useMemo(
    () => collection.fields.filter((field) => field.fieldType === "slug"),
    [collection.fields],
  );

  function updateField(index: number, patch: Partial<FieldDefinition>) {
    setCollection((current) => ({
      ...current,
      displayFieldKey: patch.key && current.displayFieldKey === current.fields[index].key
        ? patch.key
        : current.displayFieldKey,
      slugFieldKey: patch.key && current.slugFieldKey === current.fields[index].key
        ? patch.key
        : current.slugFieldKey,
      fields: current.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field),
    }));
  }

  function updateValidationNumber(
    index: number,
    key: keyof FieldValidation,
    value: string,
  ) {
    const field = collection.fields[index];
    updateField(index, {
      validation: {
        ...field.validation,
        [key]: value === "" ? undefined : Number(value),
      },
    });
  }

  function moveField(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= collection.fields.length) return;
    setCollection((current) => {
      const fields = [...current.fields];
      [fields[index], fields[destination]] = [fields[destination], fields[index]];
      return {
        ...current,
        fields: fields.map((field, position) => ({ ...field, position })),
      };
    });
  }

  function removeField(index: number) {
    setCollection((current) => ({
      ...current,
      fields: current.fields
        .filter((_field, fieldIndex) => fieldIndex !== index)
        .map((field, position) => ({ ...field, position })),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const path = editing
        ? `/api/admin/collections/${initial!.key}`
        : "/api/admin/collections";
      const saved = await mutateAdminResource<AdminCollectionDefinition>(
        path,
        editing ? "PATCH" : "POST",
        collection,
      );
      navigate(`/admin/collections/${saved.key}/items`, { replace: true });
    } catch (caught) {
      setError(caught instanceof AdminApiError
        ? caught
        : new AdminApiError(500, "SAVE_FAILED", "The collection could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-schema-form" onSubmit={submit}>
      <section className="admin-form-panel" aria-labelledby="collection-details-heading">
        <div className="admin-form-panel__heading">
          <span>01</span>
          <div>
            <h2 id="collection-details-heading">Collection details</h2>
            <p>Define the names and stable API key used across the website.</p>
          </div>
        </div>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Singular name</span>
            <input required value={collection.nameSingular} onChange={(event) => setCollection({ ...collection, nameSingular: event.target.value })} />
          </label>
          <label className="admin-field">
            <span>Plural name</span>
            <input required value={collection.namePlural} onChange={(event) => setCollection({ ...collection, namePlural: event.target.value })} />
          </label>
          <label className="admin-field admin-field--wide">
            <span>Stable key</span>
            <input required pattern="[a-z][a-z0-9_]{1,49}" disabled={editing} value={collection.key} onChange={(event) => setCollection({ ...collection, key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} />
            <small>Lowercase letters, numbers and underscores. It cannot change after content exists.</small>
          </label>
          <label className="admin-field admin-field--wide">
            <span>Description</span>
            <textarea rows={3} value={collection.description ?? ""} onChange={(event) => setCollection({ ...collection, description: event.target.value })} />
          </label>
          <label className="admin-field">
            <span>Display field</span>
            <select value={collection.displayFieldKey} onChange={(event) => setCollection({ ...collection, displayFieldKey: event.target.value })}>
              {collection.fields.map((field) => <option key={field.key} value={field.key}>{field.label || field.key}</option>)}
            </select>
          </label>
          <label className="admin-field">
            <span>Slug field</span>
            <select value={collection.slugFieldKey ?? ""} onChange={(event) => setCollection({ ...collection, slugFieldKey: event.target.value || undefined })}>
              <option value="">No slug field</option>
              {slugFields.map((field) => <option key={field.key} value={field.key}>{field.label || field.key}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-form-panel" aria-labelledby="collection-fields-heading">
        <div className="admin-form-panel__heading">
          <span>02</span>
          <div>
            <h2 id="collection-fields-heading">Fields</h2>
            <p>Arrange the generated form and define each field without changing code.</p>
          </div>
          <button className="admin-secondary-action" type="button" onClick={() => setCollection((current) => ({ ...current, fields: [...current.fields, newField(current.fields.length)] }))}>Add field</button>
        </div>

        <div className="admin-field-builder">
          {collection.fields.map((field, index) => {
            const usesOptions = field.fieldType === "select" || field.fieldType === "multi_select";
            const usesReference = field.fieldType === "reference" || field.fieldType === "multi_reference";
            const existingField = Boolean(initial?.fields.some((candidate) => candidate.key === field.key));
            const usesItemLimits = ["multi_select", "gallery", "multi_reference", "repeatable_group", "content_blocks"].includes(field.fieldType);
            const usesValueLimits = field.fieldType === "number";
            const minKey: keyof FieldValidation = usesItemLimits ? "minItems" : usesValueLimits ? "min" : "minLength";
            const maxKey: keyof FieldValidation = usesItemLimits ? "maxItems" : usesValueLimits ? "max" : "maxLength";
            return (
              <fieldset className="admin-field-card" key={`${field.key}-${index}`}>
                <legend><span>{String(index + 1).padStart(2, "0")}</span> {field.label || "Untitled field"}</legend>
                <div className="admin-field-card__actions">
                  <button type="button" disabled={index === 0} onClick={() => moveField(index, -1)}>Move up</button>
                  <button type="button" disabled={index === collection.fields.length - 1} onClick={() => moveField(index, 1)}>Move down</button>
                  <button type="button" disabled={field.isSystem} onClick={() => removeField(index)}>Remove</button>
                </div>
                <div className="admin-form-grid">
                  <label className="admin-field"><span>Label</span><input required value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} /></label>
                  <label className="admin-field"><span>Stable key</span><input required disabled={field.isSystem || existingField} value={field.key} onChange={(event) => updateField(index, { key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} /></label>
                  <label className="admin-field"><span>Field type</span><select disabled={field.isSystem || existingField} value={field.fieldType} onChange={(event) => updateField(index, { fieldType: event.target.value as FieldDefinition["fieldType"], options: undefined, validation: {} })}>{fieldTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, " ")}</option>)}</select></label>
                  <label className="admin-field admin-field--check"><input type="checkbox" checked={field.required} onChange={(event) => updateField(index, { required: event.target.checked })} /><span>Required when publishing</span></label>
                  <label className="admin-field admin-field--wide"><span>Help text</span><input value={field.helpText ?? ""} onChange={(event) => updateField(index, { helpText: event.target.value })} /></label>
                  <label className="admin-field admin-field--wide"><span>Placeholder</span><input value={field.placeholder ?? ""} onChange={(event) => updateField(index, { placeholder: event.target.value })} /></label>
                  {usesOptions ? <label className="admin-field admin-field--wide"><span>Options</span><textarea required rows={4} value={optionsToText(field.options)} onChange={(event) => updateField(index, { options: textToOptions(event.target.value) })} /><small>One option per line, written as key: Label.</small></label> : null}
                  {usesReference ? <label className="admin-field admin-field--wide"><span>Target collection key</span><input required value={field.validation.targetCollection ?? ""} onChange={(event) => updateField(index, { validation: { ...field.validation, targetCollection: event.target.value } })} /></label> : null}
                  <details className="admin-field-advanced admin-field--wide">
                    <summary>Validation limits</summary>
                    <div className="admin-form-grid">
                      <label className="admin-field"><span>Minimum {usesItemLimits ? "items" : usesValueLimits ? "value" : "length"}</span><input type="number" min={usesValueLimits ? undefined : 0} value={String(field.validation[minKey] ?? "")} onChange={(event) => updateValidationNumber(index, minKey, event.target.value)} /></label>
                      <label className="admin-field"><span>Maximum {usesItemLimits ? "items" : usesValueLimits ? "value" : "length"}</span><input type="number" min={usesValueLimits ? undefined : 0} value={String(field.validation[maxKey] ?? "")} onChange={(event) => updateValidationNumber(index, maxKey, event.target.value)} /></label>
                      {field.fieldType === "number" ? <label className="admin-field admin-field--check"><input type="checkbox" checked={field.validation.integer === true} onChange={(event) => updateField(index, { validation: { ...field.validation, integer: event.target.checked } })} /><span>Whole numbers only</span></label> : null}
                      {field.fieldType === "image" || field.fieldType === "gallery" ? <label className="admin-field admin-field--check"><input type="checkbox" checked={field.validation.requireAltText === true} onChange={(event) => updateField(index, { validation: { ...field.validation, requireAltText: event.target.checked } })} /><span>Require alt text before publishing</span></label> : null}
                    </div>
                  </details>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      {error ? <div className="admin-form-error" role="alert"><strong>{error.message}</strong>{error.issues.length ? <ul>{error.issues.map((entry) => <li key={`${entry.path}-${entry.code}`}>{entry.path}: {entry.message}</li>)}</ul> : null}</div> : null}
      <div className="admin-form-actions"><button className="admin-primary-action" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save collection" : "Create collection"}</button><button className="admin-secondary-action" type="button" onClick={() => navigate(-1)}>Cancel</button></div>
    </form>
  );
}
