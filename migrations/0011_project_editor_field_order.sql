PRAGMA foreign_keys = ON;

UPDATE field_definitions
SET position = position + 1000
WHERE collection_id = 'collection_projects';

DELETE FROM field_definitions
WHERE id = 'project_card_theme';

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
  2000,
  1
)
ON CONFLICT(id) DO UPDATE SET
  label = excluded.label,
  field_type = excluded.field_type,
  required = excluded.required,
  validation_json = excluded.validation_json,
  options_json = excluded.options_json,
  position = excluded.position,
  is_system = excluded.is_system;

UPDATE field_definitions
SET
  label = CASE key
    WHEN 'project_url' THEN 'URL'
    ELSE label
  END,
  position = CASE key
    WHEN 'title' THEN 0
    WHEN 'slug' THEN 1
    WHEN 'industry' THEN 2
    WHEN 'location' THEN 3
    WHEN 'duration' THEN 4
    WHEN 'completed_on' THEN 5
    WHEN 'platform' THEN 6
    WHEN 'about_client' THEN 7
    WHEN 'project_url' THEN 8
    WHEN 'accent_colour' THEN 9
    WHEN 'client' THEN 10
    WHEN 'project_kind' THEN 11
    WHEN 'project_type' THEN 12
    WHEN 'year' THEN 13
    WHEN 'services' THEN 14
    WHEN 'short_summary' THEN 15
    WHEN 'hero_image' THEN 16
    WHEN 'hover_image' THEN 17
    WHEN 'featured' THEN 18
    WHEN 'featured_order' THEN 19
    WHEN 'challenge' THEN 20
    WHEN 'approach' THEN 21
    WHEN 'outcome' THEN 22
    WHEN 'content_blocks' THEN 23
    WHEN 'credits' THEN 24
    WHEN 'seo_title' THEN 25
    WHEN 'seo_description' THEN 26
    WHEN 'social_image' THEN 27
    ELSE position
  END
WHERE collection_id = 'collection_projects';

UPDATE collection_items
SET
  data_json = json_remove(data_json, '$.card_theme'),
  published_data_json = CASE
    WHEN published_data_json IS NULL THEN NULL
    ELSE json_remove(published_data_json, '$.card_theme')
  END
WHERE collection_id = 'collection_projects';

UPDATE item_snapshots
SET data_json = json_remove(data_json, '$.card_theme')
WHERE item_id IN (
  SELECT id
  FROM collection_items
  WHERE collection_id = 'collection_projects'
);
