PRAGMA foreign_keys = ON;

-- Project story order is stored in content_blocks. Existing records remain safe:
-- the shared normaliser supplies Challenge, Approach and Outcome until each draft
-- is next saved, when their canonical entries and stable IDs are persisted.
UPDATE field_definitions
SET label = 'Project story',
    help_text = 'Arrange Challenge, Approach and Outcome with optional custom story blocks. The three canonical entries are required to publish.',
    validation_json = '{"maxItems":43}',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'project_blocks';

UPDATE field_definitions
SET required = 1,
    help_text = 'Required to publish. Its position is managed in Project story.',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id IN ('project_challenge', 'project_approach', 'project_outcome');
