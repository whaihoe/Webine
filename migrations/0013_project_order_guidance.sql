PRAGMA foreign_keys = ON;

UPDATE field_definitions
SET help_text = 'New Projects receive the next number automatically. Higher numbers appear first on Home and Works.',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'project_featured_order';
