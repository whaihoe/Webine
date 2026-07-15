PRAGMA foreign_keys = ON;

INSERT INTO collections (
  id, key, name_singular, name_plural, description,
  display_field_key, slug_field_key, is_system
) VALUES
  ('collection_projects', 'projects', 'Project', 'Projects', 'Public work and case studies.', 'title', 'slug', 1),
  ('collection_categories', 'categories', 'Category', 'Categories', 'Project categories.', 'name', 'slug', 1),
  ('collection_services', 'services', 'Service', 'Services', 'Services referenced by projects.', 'name', 'slug', 1),
  ('collection_site_settings', 'site_settings', 'Site settings', 'Site settings', 'Singleton public website content and approved presentation choices.', 'home_hero_heading_before', NULL, 1);

INSERT INTO field_definitions (
  id, collection_id, key, label, field_type, required,
  validation_json, options_json, position, is_system
) VALUES
  ('project_title', 'collection_projects', 'title', 'Title', 'short_text', 1, '{"minLength":1,"maxLength":120}', NULL, 0, 1),
  ('project_slug', 'collection_projects', 'slug', 'Slug', 'slug', 1, '{"unique":true}', NULL, 1, 1),
  ('project_client', 'collection_projects', 'client', 'Client', 'short_text', 1, '{"maxLength":120}', NULL, 2, 1),
  ('project_kind', 'collection_projects', 'project_kind', 'Project kind', 'select', 1, '{}', '[{"key":"client","label":"Client"},{"key":"concept","label":"Concept"},{"key":"internal","label":"Internal"}]', 3, 1),
  ('project_type', 'collection_projects', 'project_type', 'Project type', 'reference', 1, '{"targetCollection":"categories"}', NULL, 4, 1),
  ('project_year', 'collection_projects', 'year', 'Year', 'number', 1, '{"integer":true,"min":2000,"max":2100}', NULL, 5, 1),
  ('project_services', 'collection_projects', 'services', 'Services', 'multi_reference', 0, '{"targetCollection":"services","maxItems":12}', NULL, 6, 1),
  ('project_summary', 'collection_projects', 'short_summary', 'Short summary', 'long_text', 1, '{"maxLength":320}', NULL, 7, 1),
  ('project_hero_image', 'collection_projects', 'hero_image', 'Hero image', 'image', 1, '{"requireAltText":true}', NULL, 8, 1),
  ('project_hover_image', 'collection_projects', 'hover_image', 'Hover image', 'image', 0, '{"requireAltText":true}', NULL, 9, 1),
  ('project_card_theme', 'collection_projects', 'card_theme', 'Card theme', 'select', 1, '{}', '[{"key":"light","label":"Light text"},{"key":"dark","label":"Dark text"}]', 10, 1),
  ('project_featured', 'collection_projects', 'featured', 'Featured', 'boolean', 1, '{}', NULL, 11, 1),
  ('project_featured_order', 'collection_projects', 'featured_order', 'Featured order', 'number', 0, '{"integer":true,"min":0}', NULL, 12, 1),
  ('project_challenge', 'collection_projects', 'challenge', 'Challenge', 'rich_text', 0, '{"maxBytes":100000}', NULL, 13, 1),
  ('project_approach', 'collection_projects', 'approach', 'Approach', 'rich_text', 0, '{"maxBytes":100000}', NULL, 14, 1),
  ('project_outcome', 'collection_projects', 'outcome', 'Outcome', 'rich_text', 0, '{"maxBytes":100000}', NULL, 15, 1),
  ('project_blocks', 'collection_projects', 'content_blocks', 'Content blocks', 'content_blocks', 0, '{"maxItems":40}', NULL, 16, 1),
  ('project_url', 'collection_projects', 'project_url', 'Project URL', 'url', 0, '{}', NULL, 17, 1),
  ('project_credits', 'collection_projects', 'credits', 'Credits', 'repeatable_group', 0, '{"maxItems":30}', NULL, 18, 1),
  ('project_seo_title', 'collection_projects', 'seo_title', 'SEO title', 'short_text', 0, '{"maxLength":70}', NULL, 19, 1),
  ('project_seo_description', 'collection_projects', 'seo_description', 'SEO description', 'long_text', 0, '{"maxLength":170}', NULL, 20, 1),
  ('project_social_image', 'collection_projects', 'social_image', 'Social image', 'image', 0, '{"requireAltText":true}', NULL, 21, 1),

  ('category_name', 'collection_categories', 'name', 'Name', 'short_text', 1, '{"maxLength":80}', NULL, 0, 1),
  ('category_slug', 'collection_categories', 'slug', 'Slug', 'slug', 1, '{"unique":true}', NULL, 1, 1),
  ('category_description', 'collection_categories', 'description', 'Description', 'long_text', 0, '{"maxLength":320}', NULL, 2, 1),
  ('category_sort', 'collection_categories', 'sort_order', 'Sort order', 'number', 1, '{"integer":true,"min":0}', NULL, 3, 1),

  ('service_name', 'collection_services', 'name', 'Name', 'short_text', 1, '{"maxLength":80}', NULL, 0, 1),
  ('service_slug', 'collection_services', 'slug', 'Slug', 'slug', 1, '{"unique":true}', NULL, 1, 1),
  ('service_description', 'collection_services', 'short_description', 'Short description', 'long_text', 0, '{"maxLength":320}', NULL, 2, 1),
  ('service_sort', 'collection_services', 'sort_order', 'Sort order', 'number', 1, '{"integer":true,"min":0}', NULL, 3, 1),

  ('settings_hero_eyebrow', 'collection_site_settings', 'home_hero_eyebrow', 'Home hero eyebrow', 'short_text', 1, '{"maxLength":100}', NULL, 0, 1),
  ('settings_hero_before', 'collection_site_settings', 'home_hero_heading_before', 'Home hero heading before', 'short_text', 1, '{"maxLength":120}', NULL, 1, 1),
  ('settings_hero_accent', 'collection_site_settings', 'home_hero_heading_accent', 'Home hero heading accent', 'short_text', 1, '{"maxLength":80}', NULL, 2, 1),
  ('settings_hero_after', 'collection_site_settings', 'home_hero_heading_after', 'Home hero heading after', 'short_text', 0, '{"maxLength":120}', NULL, 3, 1),
  ('settings_hero_copy', 'collection_site_settings', 'home_hero_supporting_copy', 'Home hero supporting copy', 'long_text', 1, '{"maxLength":360}', NULL, 4, 1),
  ('settings_scroll_cue', 'collection_site_settings', 'home_scroll_cue', 'Home scroll cue', 'short_text', 1, '{"maxLength":60}', NULL, 5, 1),
  ('settings_primary_cta', 'collection_site_settings', 'home_primary_cta', 'Home primary CTA', 'field_group', 1, '{}', NULL, 6, 1),
  ('settings_secondary_cta', 'collection_site_settings', 'home_secondary_cta', 'Home secondary CTA', 'field_group', 1, '{}', NULL, 7, 1),
  ('settings_positioning', 'collection_site_settings', 'home_positioning_statement', 'Home positioning statement', 'long_text', 1, '{"maxLength":500}', NULL, 8, 1),
  ('settings_principles', 'collection_site_settings', 'home_principles', 'Home principles', 'repeatable_group', 1, '{"minItems":3,"maxItems":3}', NULL, 9, 1),
  ('settings_interlude', 'collection_site_settings', 'home_support_interlude', 'Home support interlude', 'field_group', 1, '{}', NULL, 10, 1),
  ('settings_process', 'collection_site_settings', 'home_process_steps', 'Home process steps', 'repeatable_group', 1, '{"minItems":4,"maxItems":4}', NULL, 11, 1),
  ('settings_closing', 'collection_site_settings', 'home_closing_cta', 'Home closing CTA', 'field_group', 1, '{}', NULL, 12, 1),
  ('settings_works_eyebrow', 'collection_site_settings', 'works_eyebrow', 'Works eyebrow', 'short_text', 1, '{"maxLength":100}', NULL, 13, 1),
  ('settings_works_before', 'collection_site_settings', 'works_heading_before', 'Works heading before', 'short_text', 1, '{"maxLength":120}', NULL, 14, 1),
  ('settings_works_accent', 'collection_site_settings', 'works_heading_accent', 'Works heading accent', 'short_text', 1, '{"maxLength":80}', NULL, 15, 1),
  ('settings_works_after', 'collection_site_settings', 'works_heading_after', 'Works heading after', 'short_text', 0, '{"maxLength":120}', NULL, 16, 1),
  ('settings_works_intro', 'collection_site_settings', 'works_introduction', 'Works introduction', 'long_text', 1, '{"maxLength":500}', NULL, 17, 1),
  ('settings_contact_heading', 'collection_site_settings', 'contact_heading', 'Contact heading', 'short_text', 1, '{"maxLength":160}', NULL, 18, 1),
  ('settings_contact_intro', 'collection_site_settings', 'contact_introduction', 'Contact introduction', 'long_text', 1, '{"maxLength":600}', NULL, 19, 1),
  ('settings_contact_response', 'collection_site_settings', 'contact_response_note', 'Contact response note', 'long_text', 1, '{"maxLength":320}', NULL, 20, 1),
  ('settings_service_options', 'collection_site_settings', 'contact_service_options', 'Contact service options', 'repeatable_group', 1, '{"maxItems":20}', NULL, 21, 1),
  ('settings_budget_options', 'collection_site_settings', 'contact_budget_options', 'Contact budget options', 'repeatable_group', 1, '{"maxItems":20}', NULL, 22, 1),
  ('settings_timeline_options', 'collection_site_settings', 'contact_timeline_options', 'Contact timeline options', 'repeatable_group', 1, '{"maxItems":20}', NULL, 23, 1),
  ('settings_contact_email', 'collection_site_settings', 'contact_email', 'Contact email', 'email', 1, '{}', NULL, 24, 1),
  ('settings_availability', 'collection_site_settings', 'availability_status', 'Availability status', 'short_text', 1, '{"maxLength":120}', NULL, 25, 1),
  ('settings_social_links', 'collection_site_settings', 'social_links', 'Social links', 'repeatable_group', 0, '{"maxItems":12}', NULL, 26, 1),
  ('settings_footer', 'collection_site_settings', 'footer_text', 'Footer text', 'long_text', 1, '{"maxLength":320}', NULL, 27, 1),
  ('settings_location', 'collection_site_settings', 'service_location', 'Service location', 'short_text', 1, '{"maxLength":120}', NULL, 28, 1),
  ('settings_copyright', 'collection_site_settings', 'copyright_label', 'Copyright label', 'short_text', 1, '{"maxLength":120}', NULL, 29, 1),
  ('settings_seo', 'collection_site_settings', 'seo_defaults', 'SEO defaults', 'field_group', 1, '{}', NULL, 30, 1),
  ('settings_social_image', 'collection_site_settings', 'default_social_image', 'Default social image', 'image', 0, '{"requireAltText":true}', NULL, 31, 1),
  ('settings_privacy', 'collection_site_settings', 'privacy_content', 'Privacy content', 'rich_text', 1, '{"maxBytes":100000}', NULL, 32, 1),
  ('settings_privacy_version', 'collection_site_settings', 'privacy_policy_version', 'Privacy policy version', 'short_text', 1, '{"maxLength":40}', NULL, 33, 1),
  ('settings_motion', 'collection_site_settings', 'motion_intensity', 'Motion intensity', 'select', 0, '{}', '[{"key":"restrained","label":"Restrained"},{"key":"full","label":"Full"}]', 34, 1);

INSERT INTO collection_items (
  id, collection_id, status, data_json, created_by, updated_by
) VALUES (
  'item_site_settings',
  'collection_site_settings',
  'draft',
  '{}',
  'system@webine.local',
  'system@webine.local'
);
