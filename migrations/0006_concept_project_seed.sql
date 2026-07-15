PRAGMA foreign_keys = ON;

INSERT INTO assets (id, provider, provider_asset_id, delivery_url, original_filename, mime_type,
  byte_size, width, height, alt_text, status, created_by)
VALUES ('asset_webine_seed', 'external', 'webine-logo-primary.png', '/webine-logo-primary.png',
  'webine-logo-primary.png', 'image/png', 21217, 174, 103,
  'Webine folded blue identity mark', 'ready', 'system');

INSERT INTO collection_items (id, collection_id, slug, status, data_json, published_data_json,
  published_at, created_by, updated_by) VALUES
('category_brand', 'collection_categories', 'brand-systems', 'published',
  '{"name":"Brand systems","slug":"brand-systems","description":"Identity and visual direction.","sort_order":1}',
  '{"name":"Brand systems","slug":"brand-systems","description":"Identity and visual direction.","sort_order":1}', CURRENT_TIMESTAMP, 'system', 'system'),
('category_web', 'collection_categories', 'web-experiences', 'published',
  '{"name":"Web experiences","slug":"web-experiences","description":"Strategic and expressive websites.","sort_order":2}',
  '{"name":"Web experiences","slug":"web-experiences","description":"Strategic and expressive websites.","sort_order":2}', CURRENT_TIMESTAMP, 'system', 'system'),
('service_strategy', 'collection_services', 'strategy', 'published',
  '{"name":"Website strategy","slug":"strategy","short_description":"A clear narrative and conversion path.","sort_order":1}',
  '{"name":"Website strategy","slug":"strategy","short_description":"A clear narrative and conversion path.","sort_order":1}', CURRENT_TIMESTAMP, 'system', 'system'),
('service_design', 'collection_services', 'design', 'published',
  '{"name":"Interface design","slug":"design","short_description":"Editorial systems with purposeful motion.","sort_order":2}',
  '{"name":"Interface design","slug":"design","short_description":"Editorial systems with purposeful motion.","sort_order":2}', CURRENT_TIMESTAMP, 'system', 'system'),
('service_development', 'collection_services', 'development', 'published',
  '{"name":"Responsive development","slug":"development","short_description":"A dependable, performance-aware build.","sort_order":3}',
  '{"name":"Responsive development","slug":"development","short_description":"A dependable, performance-aware build.","sort_order":3}', CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO collection_items (id, collection_id, slug, status, data_json, published_data_json,
  published_at, created_by, updated_by) VALUES
('project_concept_identity', 'collection_projects', 'webine-identity-system', 'published',
  '{"title":"Webine identity system","slug":"webine-identity-system","client":"Webine","project_kind":"internal","project_type":"category_brand","year":2026,"services":["service_strategy","service_design"],"short_summary":"A folded visual language and digital system designed to make Webine feel clear, precise and memorable.","hero_image":"asset_webine_seed","card_theme":"light","featured":true,"featured_order":1,"challenge":{"text":"Shape scattered potential into a coherent identity."},"approach":{"text":"Build one folded form into a flexible editorial system."},"outcome":{"text":"A distinct foundation ready to grow with the studio."},"content_blocks":[{"type":"statement","text":"An internal project, shown as a transparent work in progress."}],"seo_title":"Webine identity system","seo_description":"An internal identity and website system for Webine."}',
  '{"title":"Webine identity system","slug":"webine-identity-system","client":"Webine","project_kind":"internal","project_type":"category_brand","year":2026,"services":["service_strategy","service_design"],"short_summary":"A folded visual language and digital system designed to make Webine feel clear, precise and memorable.","hero_image":"asset_webine_seed","card_theme":"light","featured":true,"featured_order":1,"challenge":{"text":"Shape scattered potential into a coherent identity."},"approach":{"text":"Build one folded form into a flexible editorial system."},"outcome":{"text":"A distinct foundation ready to grow with the studio."},"content_blocks":[{"type":"statement","text":"An internal project, shown as a transparent work in progress."}],"seo_title":"Webine identity system","seo_description":"An internal identity and website system for Webine."}', CURRENT_TIMESTAMP, 'system', 'system'),
('project_concept_service', 'collection_projects', 'service-business-reframe', 'published',
  '{"title":"Service business reframe","slug":"service-business-reframe","client":"Concept study","project_kind":"concept","project_type":"category_web","year":2026,"services":["service_strategy","service_design","service_development"],"short_summary":"A concept for turning a dense service offering into a calm story with one focused enquiry path.","hero_image":"asset_webine_seed","card_theme":"dark","featured":true,"featured_order":2,"challenge":{"text":"Make a complex offer easier to understand."},"approach":{"text":"Use sequencing, proof and clear language to reduce friction."},"outcome":{"text":"A practical concept, not commissioned client work."},"content_blocks":[{"type":"statement","text":"Concept work used to demonstrate Webine’s intended standard."}],"seo_title":"Service business website concept","seo_description":"A clearly labelled Webine website concept for a service business."}',
  '{"title":"Service business reframe","slug":"service-business-reframe","client":"Concept study","project_kind":"concept","project_type":"category_web","year":2026,"services":["service_strategy","service_design","service_development"],"short_summary":"A concept for turning a dense service offering into a calm story with one focused enquiry path.","hero_image":"asset_webine_seed","card_theme":"dark","featured":true,"featured_order":2,"challenge":{"text":"Make a complex offer easier to understand."},"approach":{"text":"Use sequencing, proof and clear language to reduce friction."},"outcome":{"text":"A practical concept, not commissioned client work."},"content_blocks":[{"type":"statement","text":"Concept work used to demonstrate Webine’s intended standard."}],"seo_title":"Service business website concept","seo_description":"A clearly labelled Webine website concept for a service business."}', CURRENT_TIMESTAMP, 'system', 'system'),
('project_concept_retail', 'collection_projects', 'independent-retail-launch', 'published',
  '{"title":"Independent retail launch","slug":"independent-retail-launch","client":"Concept study","project_kind":"concept","project_type":"category_web","year":2026,"services":["service_design","service_development"],"short_summary":"An editorial shopping concept that gives products room to lead while keeping decisions straightforward.","hero_image":"asset_webine_seed","card_theme":"light","featured":true,"featured_order":3,"challenge":{"text":"Balance expression with a clear purchase journey."},"approach":{"text":"Let product imagery lead within a disciplined interface."},"outcome":{"text":"A clearly labelled speculative retail direction."},"content_blocks":[{"type":"statement","text":"Concept work, not a claim of commissioned client delivery."}],"seo_title":"Independent retail website concept","seo_description":"A clearly labelled Webine website concept for independent retail."}',
  '{"title":"Independent retail launch","slug":"independent-retail-launch","client":"Concept study","project_kind":"concept","project_type":"category_web","year":2026,"services":["service_design","service_development"],"short_summary":"An editorial shopping concept that gives products room to lead while keeping decisions straightforward.","hero_image":"asset_webine_seed","card_theme":"light","featured":true,"featured_order":3,"challenge":{"text":"Balance expression with a clear purchase journey."},"approach":{"text":"Let product imagery lead within a disciplined interface."},"outcome":{"text":"A clearly labelled speculative retail direction."},"content_blocks":[{"type":"statement","text":"Concept work, not a claim of commissioned client delivery."}],"seo_title":"Independent retail website concept","seo_description":"A clearly labelled Webine website concept for independent retail."}', CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO asset_usages (asset_id, item_id, field_definition_id, usage_path) VALUES
('asset_webine_seed', 'project_concept_identity', 'project_hero_image', ''),
('asset_webine_seed', 'project_concept_service', 'project_hero_image', ''),
('asset_webine_seed', 'project_concept_retail', 'project_hero_image', '');

INSERT INTO item_references (source_item_id, field_definition_id, target_item_id, position) VALUES
('project_concept_identity', 'project_type', 'category_brand', 0),
('project_concept_identity', 'project_services', 'service_strategy', 0),
('project_concept_identity', 'project_services', 'service_design', 1),
('project_concept_service', 'project_type', 'category_web', 0),
('project_concept_service', 'project_services', 'service_strategy', 0),
('project_concept_service', 'project_services', 'service_design', 1),
('project_concept_service', 'project_services', 'service_development', 2),
('project_concept_retail', 'project_type', 'category_web', 0),
('project_concept_retail', 'project_services', 'service_design', 0),
('project_concept_retail', 'project_services', 'service_development', 1);
