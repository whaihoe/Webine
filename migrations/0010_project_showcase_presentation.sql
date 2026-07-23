PRAGMA foreign_keys = ON;

INSERT INTO field_definitions (
  id, collection_id, key, label, field_type, required,
  validation_json, options_json, position, is_system
) VALUES (
  'project_accent_colour',
  'collection_projects',
  'accent_colour',
  'Case study accent colour',
  'colour',
  0,
  '{}',
  NULL,
  28,
  1
);
