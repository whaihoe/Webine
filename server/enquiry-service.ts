import { createHmac } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import { CmsRepositoryError } from "./cms-repository.js";
import { getDatabase } from "./database.js";
import { getEnquiryHashSecret } from "./runtime-readiness.js";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const DEDUPLICATION_SECONDS = 24 * 60 * 60;
const CONSENT_VERSION = "2026-07-15";

export type EnquiryInput = {
  name: string;
  email: string;
  company: string;
  website: string;
  serviceInterest: string;
  budgetRange: string;
  timeline: string;
  details: string;
  consent: boolean;
  consentVersion: string;
  sourcePage: string;
  websiteConfirm: string;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseInput(value: unknown, consentVersion: string): EnquiryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CmsRepositoryError("INVALID_ENQUIRY", "Review the enquiry fields.", 422);
  const input = value as Record<string, unknown>;
  const enquiry: EnquiryInput = {
    name: clean(input.name, 120), email: clean(input.email, 254).toLowerCase(), company: clean(input.company, 160),
    website: clean(input.website, 500), serviceInterest: clean(input.serviceInterest, 100), budgetRange: clean(input.budgetRange, 100),
    timeline: clean(input.timeline, 100), details: clean(input.details, 5000), consent: input.consent === true,
    consentVersion: clean(input.consentVersion, 40), sourcePage: clean(input.sourcePage, 200), websiteConfirm: clean(input.websiteConfirm, 200),
  };
  if (enquiry.name.length < 2) throw new CmsRepositoryError("NAME_REQUIRED", "Enter your name.", 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) throw new CmsRepositoryError("EMAIL_INVALID", "Enter a valid email address.", 422);
  if (enquiry.details.length < 20) throw new CmsRepositoryError("DETAILS_REQUIRED", "Tell us a little more about the project.", 422);
  if (!enquiry.serviceInterest || !enquiry.timeline) throw new CmsRepositoryError("SELECTION_REQUIRED", "Choose a service and timeline.", 422);
  if (!enquiry.consent || enquiry.consentVersion !== consentVersion) throw new CmsRepositoryError("CONSENT_REQUIRED", "Confirm the current privacy notice before submitting.", 422);
  if (enquiry.website) {
    try { const url = new URL(enquiry.website); if (!(["https:", "http:"].includes(url.protocol))) throw new Error(); }
    catch { throw new CmsRepositoryError("WEBSITE_INVALID", "Enter a complete website address or leave it blank.", 422); }
  }
  return enquiry;
}

function isHoneypotSubmission(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return clean((value as Record<string, unknown>).websiteConfirm, 200).length > 0;
}

function secret() {
  const configured = getEnquiryHashSecret();
  if (configured) return configured;
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") throw new CmsRepositoryError("ENQUIRY_NOT_CONFIGURED", "The enquiry service is temporarily unavailable.", 503);
  return "webine-local-enquiry-secret";
}

function digest(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "local";
}

async function enforceRateLimit(request: Request, client: Client) {
  const now = Math.floor(Date.now() / 1000);
  const bucketKey = digest(`rate:${clientAddress(request)}`);
  await client.execute({ sql: `INSERT INTO enquiry_rate_limits (bucket_key, window_started_at, request_count)
    VALUES (?, ?, 1) ON CONFLICT(bucket_key) DO UPDATE SET
      window_started_at = CASE WHEN ? - window_started_at >= ? THEN ? ELSE window_started_at END,
      request_count = CASE WHEN ? - window_started_at >= ? THEN 1 ELSE request_count + 1 END,
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`, args: [bucketKey, now, now, RATE_LIMIT_WINDOW_SECONDS, now, now, RATE_LIMIT_WINDOW_SECONDS] });
  const result = await client.execute({ sql: "SELECT request_count FROM enquiry_rate_limits WHERE bucket_key = ?", args: [bucketKey] });
  if (Number(result.rows[0]?.request_count ?? 0) > RATE_LIMIT_MAX) throw new CmsRepositoryError("RATE_LIMITED", "Too many enquiries were submitted. Please wait and try again.", 429);
}

function submissionHash(input: EnquiryInput) {
  return digest([input.email, input.company.toLowerCase(), input.details.toLowerCase()].join("\n"));
}

async function sendNotification(enquiry: EnquiryInput, id: string) {
  const endpoint = process.env.ENQUIRY_NOTIFICATION_WEBHOOK_URL?.trim();
  if (!endpoint) return { status: "pending" as const, error: "", attempted: false };
  let url: URL;
  try { url = new URL(endpoint); }
  catch { return { status: "failed" as const, error: "invalid_webhook_configuration", attempted: false }; }
  if (url.protocol !== "https:") return { status: "failed" as const, error: "invalid_webhook_configuration", attempted: false };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.ENQUIRY_NOTIFICATION_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_NOTIFICATION_TOKEN}` } : {}) },
      body: JSON.stringify({ id, ...enquiry, consent: undefined, websiteConfirm: undefined }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? { status: "sent" as const, error: "", attempted: true } : { status: "failed" as const, error: `provider_http_${response.status}`, attempted: true };
  } catch { return { status: "failed" as const, error: "provider_unreachable", attempted: true }; }
}

async function updateNotification(id: string, result: Awaited<ReturnType<typeof sendNotification>>, client: Client) {
  await client.execute({ sql: `UPDATE enquiries SET notification_status = ?, notification_attempts = notification_attempts + ?,
    last_notification_error = ?, last_notified_at = CASE WHEN ? = 'sent' THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ELSE last_notified_at END,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`, args: [result.status, result.attempted ? 1 : 0, result.error, result.status, id] });
}

export async function createEnquiry(value: unknown, request: Request, _requestId: string, client: Client = getDatabase()) {
  await enforceRateLimit(request, client);
  if (isHoneypotSubmission(value)) return { accepted: true, duplicate: false };
  const settingsResult = await client.execute("SELECT published_data_json FROM collection_items WHERE id = 'item_site_settings' AND status = 'published'");
  const settings = typeof settingsResult.rows[0]?.published_data_json === "string" ? JSON.parse(settingsResult.rows[0].published_data_json) as Record<string, unknown> : {};
  const consentVersion = clean(settings.privacy_policy_version, 40) || CONSENT_VERSION;
  const input = parseInput(value, consentVersion);
  const hash = submissionHash(input);
  const now = Math.floor(Date.now() / 1000);
  await client.execute({ sql: "DELETE FROM enquiry_deduplication WHERE expires_at <= ?", args: [now] });
  const duplicate = await client.execute({ sql: "SELECT enquiry_id FROM enquiry_deduplication WHERE submission_hash = ? AND expires_at > ?", args: [hash, now] });
  if (duplicate.rows[0]) return { accepted: true, duplicate: true };
  const id = crypto.randomUUID();
  try {
    await client.batch([
      { sql: `INSERT INTO enquiries (id, name, email, company, website, service_interest, budget_range, timeline,
        details, consent_version, source_page) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [id, input.name, input.email, input.company, input.website, input.serviceInterest, input.budgetRange, input.timeline, input.details, input.consentVersion, input.sourcePage || "/contact"] },
      { sql: "INSERT INTO enquiry_deduplication (submission_hash, enquiry_id, expires_at) VALUES (?, ?, ?)", args: [hash, id, now + DEDUPLICATION_SECONDS] },
    ], "write");
  } catch (error) {
    const racedDuplicate = await client.execute({ sql: "SELECT enquiry_id FROM enquiry_deduplication WHERE submission_hash = ? AND expires_at > ?", args: [hash, now] });
    if (racedDuplicate.rows[0]) return { accepted: true, duplicate: true };
    throw error;
  }
  const notification = await sendNotification(input, id);
  if (notification.status !== "pending" || notification.attempted) await updateNotification(id, notification, client);
  return { accepted: true, duplicate: false };
}

function mapEnquiry(row: Row) {
  return { id: String(row.id), name: String(row.name), email: String(row.email), company: String(row.company), website: String(row.website),
    serviceInterest: String(row.service_interest), budgetRange: String(row.budget_range), timeline: String(row.timeline), details: String(row.details),
    consentVersion: String(row.consent_version), status: String(row.status), notificationStatus: String(row.notification_status),
    notificationAttempts: Number(row.notification_attempts), lastNotificationError: String(row.last_notification_error), createdAt: String(row.created_at) };
}

export async function listEnquiries(client: Client = getDatabase()) {
  const result = await client.execute("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200");
  return result.rows.map(mapEnquiry);
}

export async function retryEnquiryNotification(id: string, client: Client = getDatabase()) {
  const result = await client.execute({ sql: "SELECT * FROM enquiries WHERE id = ?", args: [id] });
  if (!result.rows[0]) throw new CmsRepositoryError("NOT_FOUND", "That enquiry does not exist.", 404);
  const row = result.rows[0];
  const input: EnquiryInput = { name: String(row.name), email: String(row.email), company: String(row.company), website: String(row.website), serviceInterest: String(row.service_interest), budgetRange: String(row.budget_range), timeline: String(row.timeline), details: String(row.details), consent: true, consentVersion: String(row.consent_version), sourcePage: String(row.source_page), websiteConfirm: "" };
  const notification = await sendNotification(input, id);
  if (notification.status !== "pending" || notification.attempted) await updateNotification(id, notification, client);
  return { id, notificationStatus: notification.status };
}
