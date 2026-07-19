PRAGMA foreign_keys = ON;

INSERT INTO field_definitions (
  id, collection_id, key, label, field_type, required,
  validation_json, options_json, position, is_system
) VALUES
  ('project_industry', 'collection_projects', 'industry', 'Industry', 'short_text', 0, '{"maxLength":120}', NULL, 22, 1),
  ('project_location', 'collection_projects', 'location', 'Location', 'short_text', 0, '{"maxLength":120}', NULL, 23, 1),
  ('project_duration', 'collection_projects', 'duration', 'Project duration', 'short_text', 0, '{"maxLength":80}', NULL, 24, 1),
  ('project_completed_on', 'collection_projects', 'completed_on', 'Completed on', 'date_time', 0, '{}', NULL, 25, 1),
  ('project_platform', 'collection_projects', 'platform', 'Platform and stack', 'short_text', 0, '{"maxLength":160}', NULL, 26, 1),
  ('project_about_client', 'collection_projects', 'about_client', 'About the client', 'rich_text', 0, '{"maxBytes":100000}', NULL, 27, 1);
