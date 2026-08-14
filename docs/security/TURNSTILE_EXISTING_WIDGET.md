# Turnstile existing-widget integration

The contact form uses the existing Cloudflare Turnstile widget with site key:

`0x4AAAAAAEEf_0NxPkZ_uzj1`

The browser key is public. The matching widget secret must never be committed to this repository.

## Production mapping

- Worker: `webine`
- Wrangler config: `wrangler.toml`
- Site key: `0x4AAAAAAEEf_0NxPkZ_uzj1`
- Worker secret binding: `TURNSTILE_SECRET`
- Accepted hostnames: `madebywebine.com,www.madebywebine.com`
- Expected action: `contact_enquiry`

The matching secret must be stored with Wrangler's secret command, not in `wrangler.toml`:

```bash
wrangler secret list --config wrangler.toml
wrangler secret put TURNSTILE_SECRET --config wrangler.toml
```

Paste only the secret that belongs to site key `0x4AAAAAAEEf_0NxPkZ_uzj1` when Wrangler prompts. An older widget's secret will allow the browser challenge to appear successful but Siteverify will reject the submitted token.

Cloudflare Spin's automatic existing-widget recovery requires Wrangler 4.109 or later. If using `wrangler turnstile widget get <sitekey> --json` to recover the secret, follow the Spin flow: use an approved Wrangler executable, validate the Cloudflare account, site key, widget domains and target Worker first, keep Wrangler logs sanitised and pipe the retrieved secret directly into the secret manager without printing it, adding it to command arguments or writing it to a temporary file.

## Preview

The current Preview Worker expects `preview.madebywebine.com`. If the same widget is intentionally used there, add that hostname to the widget's Hostname Management and bind the same matching secret to the Preview Worker:

```bash
wrangler secret put TURNSTILE_SECRET --config wrangler.toml --env preview
```

A separate Preview widget is preferable if production and Preview should be isolated.

## Expected request lifecycle

1. The React widget renders explicitly with action `contact_enquiry`.
2. Its callback stores the fresh token in memory only.
3. Starting a submission immediately marks that token as consumed so a second request cannot race with the same token.
4. `/api/enquiries` sends the token to Cloudflare Siteverify from the Worker.
5. The Worker requires `success === true`, the configured hostname and the `contact_enquiry` action.
6. Once the request finishes, the page resets the widget so any retry receives a new token.
