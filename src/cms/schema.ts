export const collectionKeyPattern = /^[a-z][a-z0-9_]{1,49}$/;
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const fieldTypes = [
  "short_text",
  "long_text",
  "rich_text",
  "number",
  "boolean",
  "date_time",
  "select",
  "multi_select",
  "url",
  "email",
  "slug",
  "colour",
  "image",
  "gallery",
  "reference",
  "multi_reference",
  "field_group",
  "repeatable_group",
  "content_blocks",
] as const;

export type FieldType = (typeof fieldTypes)[number];

export type FieldOption = {
  key: string;
  label: string;
};

export type FieldValidation = {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  maxBytes?: number;
  integer?: boolean;
  pattern?: string;
  unique?: boolean;
  requireAltText?: boolean;
  targetCollection?: string;
};

export type FieldDefinition = {
  key: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  fieldType: FieldType;
  required: boolean;
  position: number;
  isSystem: boolean;
  validation: FieldValidation;
  options?: FieldOption[];
};

export type CollectionDefinition = {
  key: string;
  nameSingular: string;
  namePlural: string;
  description?: string;
  displayFieldKey: string;
  slugFieldKey?: string;
  isSystem: boolean;
  status: "active" | "archived";
  version?: number;
  fields: FieldDefinition[];
};

export type ValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export type ValidationContext = {
  allowLocalHttp?: boolean;
  requireRequiredFields?: boolean;
  assets?: Record<string, { status: string; altText: string; decorative?: boolean }>;
  references?: Record<string, { collectionKey: string; status: string }>;
};

export type CollectionMutationContext = {
  itemCount: number;
  valuesByField: Record<string, unknown[]>;
};

function issue(path: string, code: string, message: string): ValidationIssue {
  return { path, code, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "";
}

function validateKey(value: string, path: string) {
  return collectionKeyPattern.test(value)
    ? []
    : [issue(path, "INVALID_KEY", "Use a stable lowercase snake_case key.")];
}

export function validateCollectionDefinition(
  collection: CollectionDefinition,
): ValidationIssue[] {
  const issues = validateKey(collection.key, "key");
  const keys = new Set<string>();
  const positions = new Set<number>();

  if (!collection.nameSingular.trim() || !collection.namePlural.trim()) {
    issues.push(issue("name", "REQUIRED", "Singular and plural names are required."));
  }

  collection.fields.forEach((field) => {
    const path = `fields.${field.key || field.position}`;
    issues.push(...validateKey(field.key, `${path}.key`));

    if (keys.has(field.key)) {
      issues.push(issue(`${path}.key`, "DUPLICATE_KEY", "Field keys must be unique."));
    }

    if (positions.has(field.position) || field.position < 0) {
      issues.push(issue(`${path}.position`, "INVALID_POSITION", "Field positions must be unique and non-negative."));
    }

    if (!field.label.trim()) {
      issues.push(issue(`${path}.label`, "REQUIRED", "A field label is required."));
    }

    if (!fieldTypes.includes(field.fieldType)) {
      issues.push(issue(`${path}.fieldType`, "INVALID_FIELD_TYPE", "Choose a supported field type."));
    }

    if ((field.fieldType === "select" || field.fieldType === "multi_select") &&
        (!field.options || field.options.length === 0)) {
      issues.push(issue(`${path}.options`, "REQUIRED", "Select fields need at least one option."));
    }

    if (field.options) {
      const optionKeys = new Set<string>();
      field.options.forEach((option, optionIndex) => {
        const optionPath = `${path}.options.${optionIndex}`;
        if (!/^[a-z][a-z0-9_]{0,49}$/.test(option.key)) {
          issues.push(issue(`${optionPath}.key`, "INVALID_OPTION_KEY", "Use a lowercase option key."));
        }
        if (!option.label.trim()) {
          issues.push(issue(`${optionPath}.label`, "REQUIRED", "An option label is required."));
        }
        if (optionKeys.has(option.key)) {
          issues.push(issue(`${optionPath}.key`, "DUPLICATE_OPTION", "Option keys must be unique."));
        }
        optionKeys.add(option.key);
      });
    }

    if ((field.fieldType === "reference" || field.fieldType === "multi_reference") &&
        !field.validation.targetCollection) {
      issues.push(issue(`${path}.validation.targetCollection`, "REQUIRED", "Reference fields need a target collection."));
    }


    if (field.validation.targetCollection &&
        !collectionKeyPattern.test(field.validation.targetCollection)) {
      issues.push(issue(`${path}.validation.targetCollection`, "INVALID_KEY", "Use a valid collection key."));
    }

    if (field.validation.min !== undefined && field.validation.max !== undefined &&
        field.validation.min > field.validation.max) {
      issues.push(issue(`${path}.validation`, "INVALID_RANGE", "The minimum cannot be greater than the maximum."));
    }
    if (field.validation.minLength !== undefined && field.validation.maxLength !== undefined &&
        field.validation.minLength > field.validation.maxLength) {
      issues.push(issue(`${path}.validation`, "INVALID_RANGE", "The minimum length cannot be greater than the maximum length."));
    }
    if (field.validation.minItems !== undefined && field.validation.maxItems !== undefined &&
        field.validation.minItems > field.validation.maxItems) {
      issues.push(issue(`${path}.validation`, "INVALID_RANGE", "The minimum item count cannot be greater than the maximum item count."));
    }

    keys.add(field.key);
    positions.add(field.position);
  });

  if (!keys.has(collection.displayFieldKey)) {
    issues.push(issue("displayFieldKey", "UNKNOWN_FIELD", "The display field must exist in this collection."));
  }

  if (collection.slugFieldKey) {
    const slugField = collection.fields.find(
      (field) => field.key === collection.slugFieldKey,
    );

    if (!slugField || slugField.fieldType !== "slug") {
      issues.push(issue("slugFieldKey", "INVALID_SLUG_FIELD", "The slug field must exist and use the slug type."));
    }
  }

  return issues;
}

export function validateCollectionMutation(
  current: CollectionDefinition,
  next: CollectionDefinition,
  context: CollectionMutationContext,
): ValidationIssue[] {
  const issues = validateCollectionDefinition(next);

  if (context.itemCount > 0 && current.key !== next.key) {
    issues.push(issue("key", "STABLE_KEY", "A collection key cannot change after items exist."));
  }

  if (current.isSystem && next.status === "archived") {
    issues.push(issue("status", "SYSTEM_COLLECTION", "System collections cannot be archived."));
  }

  current.fields.forEach((currentField) => {
    const nextField = next.fields.find((field) => field.key === currentField.key);
    const values = context.valuesByField[currentField.key] ?? [];

    if (!nextField && currentField.isSystem) {
      issues.push(issue(`fields.${currentField.key}`, "SYSTEM_FIELD", "System fields cannot be removed."));
      return;
    }

    if (!nextField) {
      if (context.itemCount > 0) {
        issues.push(issue(`fields.${currentField.key}`, "STABLE_KEY", "Fields cannot be removed after items exist. Create a replacement field and migrate the content."));
      }
      return;
    }

    if (context.itemCount > 0 && nextField.key !== currentField.key) {
      issues.push(issue(`fields.${currentField.key}.key`, "STABLE_KEY", "A field key cannot change after items exist."));
    }

    if (currentField.isSystem && nextField.fieldType !== currentField.fieldType) {
      issues.push(issue(`fields.${currentField.key}.fieldType`, "SYSTEM_FIELD", "System field types cannot change."));
    } else if (values.length > 0 && nextField.fieldType !== currentField.fieldType) {
      issues.push(issue(`fields.${currentField.key}.fieldType`, "INCOMPATIBLE_TYPE", "Create a new field and migrate existing values instead."));
    }

    if (!currentField.required && nextField.required && values.some(isEmpty)) {
      issues.push(issue(`fields.${currentField.key}.required`, "INCOMPATIBLE_REQUIRED", "Existing items must contain a valid value before this field becomes required."));
    }

    if (currentField.options && nextField.options) {
      const nextOptions = new Set(nextField.options.map((option) => option.key));
      const removedValueInUse = values.flatMap((value) =>
        Array.isArray(value) ? value : [value],
      ).some((value) => typeof value === "string" && !nextOptions.has(value));

      if (removedValueInUse) {
        issues.push(issue(`fields.${currentField.key}.options`, "OPTION_IN_USE", "An option cannot be removed while items still use it."));
      }
    }
  });

  return issues;
}

function validateString(
  value: unknown,
  field: FieldDefinition,
  path: string,
) {
  if (typeof value !== "string") {
    return [issue(path, "INVALID_TYPE", "Enter a text value.")];
  }

  const issues: ValidationIssue[] = [];
  const { minLength, maxLength, pattern } = field.validation;

  if (minLength !== undefined && value.length < minLength) {
    issues.push(issue(path, "TOO_SHORT", `Enter at least ${minLength} characters.`));
  }

  if (maxLength !== undefined && value.length > maxLength) {
    issues.push(issue(path, "TOO_LONG", `Use no more than ${maxLength} characters.`));
  }

  if (pattern && !new RegExp(pattern).test(value)) {
    issues.push(issue(path, "PATTERN", "The value does not match the required format."));
  }

  return issues;
}

function validateArrayLength(
  value: unknown[],
  field: FieldDefinition,
  path: string,
) {
  const issues: ValidationIssue[] = [];
  const { minItems, maxItems } = field.validation;

  if (minItems !== undefined && value.length < minItems) {
    issues.push(issue(path, "TOO_FEW_ITEMS", `Add at least ${minItems} items.`));
  }

  if (maxItems !== undefined && value.length > maxItems) {
    issues.push(issue(path, "TOO_MANY_ITEMS", `Use no more than ${maxItems} items.`));
  }

  return issues;
}

function validateAsset(
  assetId: unknown,
  field: FieldDefinition,
  path: string,
  context: ValidationContext,
) {
  if (typeof assetId !== "string") {
    return [issue(path, "INVALID_TYPE", "Select an uploaded image.")];
  }

  const asset = context.assets?.[assetId];

  if (!asset || asset.status !== "ready") {
    return [issue(path, "ASSET_NOT_READY", "Select an image that has finished processing.")];
  }

  if (field.validation.requireAltText && !asset.decorative && !asset.altText.trim()) {
    return [issue(path, "ALT_TEXT_REQUIRED", "Add alt text before publishing this image.")];
  }

  return [];
}

function validateReference(
  itemId: unknown,
  field: FieldDefinition,
  path: string,
  context: ValidationContext,
) {
  if (typeof itemId !== "string") {
    return [issue(path, "INVALID_TYPE", "Select a referenced item.")];
  }

  const target = context.references?.[itemId];

  if (!target || target.status === "archived") {
    return [issue(path, "INVALID_REFERENCE", "The referenced item is unavailable.")];
  }

  if (field.validation.targetCollection &&
      target.collectionKey !== field.validation.targetCollection) {
    return [issue(path, "WRONG_COLLECTION", "Select an item from the configured collection.")];
  }

  return [];
}

function validateFieldValue(
  value: unknown,
  field: FieldDefinition,
  path: string,
  context: ValidationContext,
): ValidationIssue[] {
  if (isEmpty(value)) {
    return field.required && context.requireRequiredFields !== false
      ? [issue(path, "REQUIRED", `${field.label} is required.`)]
      : [];
  }

  switch (field.fieldType) {
    case "short_text":
    case "long_text":
      return validateString(value, field, path);
    case "email":
      return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? validateString(value, field, path)
        : [issue(path, "INVALID_EMAIL", "Enter a valid email address.")];
    case "slug":
      return typeof value === "string" && slugPattern.test(value)
        ? []
        : [issue(path, "INVALID_SLUG", "Use lowercase words separated by hyphens.")];
    case "url": {
      if (typeof value !== "string") {
        return [issue(path, "INVALID_URL", "Enter a complete URL.")];
      }

      try {
        const url = new URL(value);
        const allowed = url.protocol === "https:" ||
          (context.allowLocalHttp === true &&
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1"].includes(url.hostname));
        return allowed ? [] : [issue(path, "INVALID_URL", "Use a secure HTTPS URL.")];
      } catch {
        return [issue(path, "INVALID_URL", "Enter a complete URL.")];
      }
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return [issue(path, "INVALID_TYPE", "Enter a number.")];
      }

      const issues: ValidationIssue[] = [];
      if (field.validation.integer && !Number.isInteger(value)) {
        issues.push(issue(path, "INTEGER_REQUIRED", "Enter a whole number."));
      }
      if (field.validation.min !== undefined && value < field.validation.min) {
        issues.push(issue(path, "TOO_SMALL", `Enter ${field.validation.min} or more.`));
      }
      if (field.validation.max !== undefined && value > field.validation.max) {
        issues.push(issue(path, "TOO_LARGE", `Enter ${field.validation.max} or less.`));
      }
      return issues;
    }
    case "boolean":
      return typeof value === "boolean"
        ? []
        : [issue(path, "INVALID_TYPE", "Choose true or false.")];
    case "date_time":
      return typeof value === "string" && !Number.isNaN(Date.parse(value))
        ? []
        : [issue(path, "INVALID_DATE", "Enter a valid date and time.")];
    case "colour":
      return typeof value === "string" &&
        (/^#[0-9a-f]{6}$/i.test(value) || /^[a-z][a-z0-9_-]+$/.test(value))
        ? []
        : [issue(path, "INVALID_COLOUR", "Use a six-digit hex colour or approved token.")];
    case "select": {
      const options = new Set(field.options?.map((option) => option.key));
      return typeof value === "string" && options.has(value)
        ? []
        : [issue(path, "INVALID_OPTION", "Choose one of the available options.")];
    }
    case "multi_select": {
      if (!Array.isArray(value) || new Set(value).size !== value.length) {
        return [issue(path, "INVALID_OPTIONS", "Choose each option no more than once.")];
      }
      const options = new Set(field.options?.map((option) => option.key));
      const issues = validateArrayLength(value, field, path);
      if (value.some((option) => typeof option !== "string" || !options.has(option))) {
        issues.push(issue(path, "INVALID_OPTION", "Choose only available options."));
      }
      return issues;
    }
    case "image":
      return validateAsset(value, field, path, context);
    case "gallery":
      return Array.isArray(value)
        ? [
            ...validateArrayLength(value, field, path),
            ...value.flatMap((assetId, index) =>
              validateAsset(assetId, field, `${path}.${index}`, context),
            ),
          ]
        : [issue(path, "INVALID_TYPE", "Select an ordered set of images.")];
    case "reference":
      return validateReference(value, field, path, context);
    case "multi_reference":
      return Array.isArray(value) && new Set(value).size === value.length
        ? [
            ...validateArrayLength(value, field, path),
            ...value.flatMap((itemId, index) =>
              validateReference(itemId, field, `${path}.${index}`, context),
            ),
          ]
        : [issue(path, "INVALID_REFERENCES", "Choose each referenced item no more than once.")];
    case "rich_text":
    case "field_group": {
      if (!isRecord(value)) {
        return [issue(path, "INVALID_TYPE", "Enter structured content.")];
      }

      const byteLength = new TextEncoder().encode(JSON.stringify(value)).length;
      return field.validation.maxBytes !== undefined &&
        byteLength > field.validation.maxBytes
        ? [issue(path, "TOO_LARGE", "The structured content is too large.")]
        : [];
    }
    case "repeatable_group":
    case "content_blocks":
      return Array.isArray(value) && value.every(isRecord)
        ? validateArrayLength(value, field, path)
        : [issue(path, "INVALID_TYPE", "Enter an ordered list of structured content.")];
  }
}

export function validateItemData(
  collection: CollectionDefinition,
  data: unknown,
  context: ValidationContext = {},
): ValidationIssue[] {
  if (!isRecord(data)) {
    return [issue("data", "INVALID_TYPE", "Item data must be a JSON object.")];
  }

  const issues: ValidationIssue[] = [];
  const fieldKeys = new Set(collection.fields.map((field) => field.key));

  Object.keys(data).forEach((key) => {
    if (!fieldKeys.has(key)) {
      issues.push(issue(key, "UNKNOWN_FIELD", "This field is not part of the collection schema."));
    }
  });

  collection.fields.forEach((field) => {
    issues.push(
      ...validateFieldValue(data[field.key], field, field.key, context),
    );
  });

  return issues;
}

export function canArchiveReferencedEntity(
  inboundPublishedUsages: number,
): ValidationIssue[] {
  return inboundPublishedUsages > 0
    ? [issue("status", "PUBLISHED_USAGE", "Remove this entity from published content before archiving it.")]
    : [];
}
