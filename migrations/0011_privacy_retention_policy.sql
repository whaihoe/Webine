UPDATE collection_items
SET
  data_json = json_set(
    data_json,
    '$.privacy_content',
    json('{"text":"Webine collects the details you submit only to review and respond to your project enquiry. They are stored in the protected Webine Admin workspace, are not sold and are retained for up to 12 months after the last correspondence unless they are needed for an active project, a legal obligation or a dispute. Please avoid including passwords, payment details or other sensitive information."}'),
    '$.privacy_policy_version',
    '2026-07-28'
  ),
  published_data_json = CASE
    WHEN published_data_json IS NULL THEN NULL
    ELSE json_set(
      published_data_json,
      '$.privacy_content',
      json('{"text":"Webine collects the details you submit only to review and respond to your project enquiry. They are stored in the protected Webine Admin workspace, are not sold and are retained for up to 12 months after the last correspondence unless they are needed for an active project, a legal obligation or a dispute. Please avoid including passwords, payment details or other sensitive information."}'),
      '$.privacy_policy_version',
      '2026-07-28'
    )
  END,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 'item_site_settings'
  AND json_extract(data_json, '$.privacy_policy_version') = '2026-07-15';
