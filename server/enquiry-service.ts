import { createHmac } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import { CmsRepositoryError } from "./cms-repository.js";
import { getDatabase } from "./database.js";
import { getEnquiryHashSecret } from "./runtime-readiness.js";
import { isValidOptionalWebsite, WEBSITE_FORMAT_MESSAGE } from "../shared/enquiry-validation.js";
import { verifyTurnstile } from "./turnstile.js";

const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const DEDUPLICATION_SECONDS = 24 * 60 * 60;
const CONSENT_VERSION = "2026-07-28";

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

type ParsedEnquiryInput = EnquiryInput & { turnstileToken: string };

const ENQUIRY_FIELDS = new Set([
  "name", "email", "company", "website", "serviceInterest", "budgetRange",
  "timeline", "details", "consent", "consentVersion", "sourcePage",
  "websiteConfirm", "turnstileToken",
]);

function clean(value: unknown, maxLength: number, field: string) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  if (cleaned.length > maxLength) {
    throw new CmsRepositoryError("FIELD_TOO_LONG", `${field} is too long.`, 422);
  }
  return cleaned;
}

function parseInput(value: unknown): ParsedEnquiryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CmsRepositoryError("INVALID_ENQUIRY", "Review the enquiry fields.", 422);
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some((key) => !ENQUIRY_FIELDS.has(key))) {
    throw new CmsRepositoryError("UNKNOWN_FIELD", "Review the enquiry fields.", 422);
  }
  const enquiry: ParsedEnquiryInput = {
    name: clean(input.name, 120, "Name"), email: clean(input.email, 254, "Email").toLowerCase(), company: clean(input.company, 160, "Company"),
    website: clean(input.website, 500, "Website"), serviceInterest: clean(input.serviceInterest, 100, "Service"), budgetRange: clean(input.budgetRange, 100, "Budget"),
    timeline: clean(input.timeline, 100, "Timeline"), details: clean(input.details, 5000, "Project outline"), consent: input.consent === true,
    consentVersion: clean(input.consentVersion, 40, "Consent version"), sourcePage: clean(input.sourcePage, 200, "Source page"), websiteConfirm: "",
    turnstileToken: clean(input.turnstileToken, 2048, "Security token"),
  };
  if (enquiry.name.length < 2) throw new CmsRepositoryError("NAME_REQUIRED", "Enter your name.", 422);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) throw new CmsRepositoryError("EMAIL_INVALID", "Enter a valid email address.", 422);
  if (!isValidOptionalWebsite(enquiry.website)) throw new CmsRepositoryError("WEBSITE_INVALID", WEBSITE_FORMAT_MESSAGE, 422);
  if (enquiry.details.length < 20) throw new CmsRepositoryError("DETAILS_REQUIRED", "Tell us a little more about the project.", 422);
  if (!enquiry.serviceInterest || !enquiry.timeline) throw new CmsRepositoryError("SELECTION_REQUIRED", "Choose a service and timeline.", 422);
  if (!enquiry.consent || !enquiry.consentVersion) throw new CmsRepositoryError("CONSENT_REQUIRED", "Confirm the current privacy notice before submitting.", 422);
  return enquiry;
}

function isHoneypotSubmission(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = (value as Record<string, unknown>).websiteConfirm;
  return typeof candidate === "string" && candidate.trim().length > 0;
}

function secret() {
  const configured = getEnquiryHashSecret();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") throw new CmsRepositoryError("ENQUIRY_NOT_CONFIGURED", "The enquiry service is temporarily unavailable.", 503);
  return "webine-local-enquiry-secret";
}

function digest(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "local";
}

async function enforceRateLimit(request: Request, input: EnquiryInput, client: Client) {
  const now = Math.floor(Date.now() / 1000);
  const bucketKeys = [
    digest(`rate:ip:${clientAddress(request)}`),
    digest(`rate:email:${input.email}`),
  ];
  await client.batch(bucketKeys.map((bucketKey) => ({
    sql: `INSERT INTO enquiry_rate_limits (bucket_key, window_started_at, request_count)
      VALUES (?, ?, 1) ON CONFLICT(bucket_key) DO UPDATE SET
        window_started_at = CASE WHEN ? - window_started_at >= ? THEN ? ELSE window_started_at END,
        request_count = CASE WHEN ? - window_started_at >= ? THEN 1 ELSE request_count + 1 END,
        updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    args: [bucketKey, now, now, RATE_LIMIT_WINDOW_SECONDS, now, now, RATE_LIMIT_WINDOW_SECONDS],
  })), "write");
  const placeholders = bucketKeys.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT request_count FROM enquiry_rate_limits WHERE bucket_key IN (${placeholders})`,
    args: bucketKeys,
  });
  if (result.rows.some((row) => Number(row.request_count ?? 0) > RATE_LIMIT_MAX)) {
    throw new CmsRepositoryError("RATE_LIMITED", "Too many enquiries were submitted. Please wait and try again.", 429);
  }
  if (now % 97 === 0) {
    await client.execute({
      sql: `DELETE FROM enquiry_rate_limits WHERE bucket_key IN (
        SELECT bucket_key FROM enquiry_rate_limits WHERE window_started_at < ? LIMIT 100
      )`,
      args: [now - RATE_LIMIT_WINDOW_SECONDS * 2],
    });
  }
}

function submissionHash(input: EnquiryInput) {
  return digest([input.email, input.company.toLowerCase(), input.details.toLowerCase()].join("\n"));
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function emailText(enquiry: EnquiryInput, id: string) {
  return [
    "New Webine project enquiry",
    "",
    `Reference: ${id}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company: ${enquiry.company || "Not provided"}`,
    `Website: ${enquiry.website || "Not provided"}`,
    `Service: ${enquiry.serviceInterest}`,
    `Budget: ${enquiry.budgetRange || "Not specified"}`,
    `Timeline: ${enquiry.timeline}`,
    "",
    enquiry.details,
    "",
    "The complete enquiry is also stored in the protected Webine Admin workspace.",
  ].join("\n");
}

async function sendEmailNotification(enquiry: EnquiryInput, id: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.ENQUIRY_NOTIFICATION_EMAIL?.trim();
  const sender = process.env.ENQUIRY_NOTIFICATION_FROM_EMAIL?.trim();
  if (!apiKey || !recipient || !sender) return null;

  const subjectName = (enquiry.company || enquiry.name).replace(/\s+/g, " ").trim();
  const text = emailText(enquiry, id);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `webine-enquiry-${id}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: enquiry.email,
      subject: `New Webine enquiry from ${subjectName}`,
      text,
      html: `<h1>New Webine project enquiry</h1><p><strong>Reference:</strong> ${escapeHtml(id)}</p><p><strong>Name:</strong> ${escapeHtml(enquiry.name)}<br><strong>Email:</strong> ${escapeHtml(enquiry.email)}<br><strong>Company:</strong> ${escapeHtml(enquiry.company || "Not provided")}<br><strong>Website:</strong> ${escapeHtml(enquiry.website || "Not provided")}<br><strong>Service:</strong> ${escapeHtml(enquiry.serviceInterest)}<br><strong>Budget:</strong> ${escapeHtml(enquiry.budgetRange || "Not specified")}<br><strong>Timeline:</strong> ${escapeHtml(enquiry.timeline)}</p><p>${escapeHtml(enquiry.details).replace(/\n/g, "<br>")}</p><p>The complete enquiry is also stored in the protected Webine Admin workspace.</p>`,
    }),
    signal: AbortSignal.timeout(8000),
  });

  return response.ok
    ? { status: "sent" as const, error: "", attempted: true }
    : { status: "failed" as const, error: `email_provider_http_${response.status}`, attempted: true };
}

async function sendNotification(enquiry: EnquiryInput, id: string) {
  try {
    const emailResult = await sendEmailNotification(enquiry, id);
    if (emailResult) return emailResult;
  } catch {
    return { status: "failed" as const, error: "email_provider_unreachable", attempted: true };
  }

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
      body: JSON.stringify({
        id,
        name: enquiry.name,
        email: enquiry.email,
        company: enquiry.company,
        website: enquiry.website,
        serviceInterest: enquiry.serviceInterest,
        budgetRange: enquiry.budgetRange,
        timeline: enquiry.timeline,
        details: enquiry.details,
        consentVersion: enquiry.consentVersion,
        sourcePage: enquiry.sourcePage,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok ? { status: "sent" as const, error: "", attempted: true } : { status: "failed" as const, error: `provider_http_${response.status}`, attempted: true };
  } catch { return { status: "failed" as const, error: "provider_unreachable", attempted: true }; }
}

async function updateNotification(id: string, result: Awaited<ReturnType<typeof sendNotification>>, client: Client) {
  await client.execute({ sql: `UPDATE enquiries SET notification_status = ?, notification_attempts = notification_attempts + ?,
    last_notification_error = ?, last_notified_at = CASE WHEN ? = 'sent' THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ELSE last_notified_at END,
    notification_lock_until = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`, args: [result.status, result.attempted ? 1 : 0, result.error, result.status, id] });
}

export async function createEnquiry(
  value: unknown,
  request: Request,
  _requestId: string,
  client: Client = getDatabase(),
  verifyHuman: typeof verifyTurnstile = verifyTurnstile,
) {
  if (isHoneypotSubmission(value)) return { accepted: true, duplicate: false };
  const input = parseInput(value);
  await verifyHuman(input.turnstileToken, request);
  await enforceRateLimit(request, input, client);
  const settingsResult = await client.execute("SELECT published_data_json FROM collection_items WHERE id = 'item_site_settings' AND status = 'published'");
  const settings = typeof settingsResult.rows[0]?.published_data_json === "string" ? JSON.parse(settingsResult.rows[0].published_data_json) as Record<string, unknown> : {};
  const consentVersion = clean(settings.privacy_policy_version, 40, "Consent version") || CONSENT_VERSION;
  if (input.consentVersion !== consentVersion) throw new CmsRepositoryError("CONSENT_REQUIRED", "Confirm the current privacy notice before submitting.", 422);
  const hash = submissionHash(input);
  const now = Math.floor(Date.now() / 1000);
  await client.execute({ sql: "DELETE FROM enquiry_deduplication WHERE submission_hash = ? AND expires_at <= ?", args: [hash, now] });
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
  if (String(row.notification_status) === "sent") {
    return { id, notificationStatus: "sent" };
  }
  const now = Math.floor(Date.now() / 1000);
  const claimed = await client.execute({
    sql: `UPDATE enquiries SET notification_lock_until = ?
      WHERE id = ? AND notification_status != 'sent' AND notification_lock_until <= ?`,
    args: [now + 30, id, now],
  });
  if (claimed.rowsAffected !== 1) {
    throw new CmsRepositoryError("NOTIFICATION_BUSY", "That notification retry is already running.", 409);
  }
  const input: EnquiryInput = { name: String(row.name), email: String(row.email), company: String(row.company), website: String(row.website), serviceInterest: String(row.service_interest), budgetRange: String(row.budget_range), timeline: String(row.timeline), details: String(row.details), consent: true, consentVersion: String(row.consent_version), sourcePage: String(row.source_page), websiteConfirm: "" };
  const notification = await sendNotification(input, id);
  if (notification.status !== "pending" || notification.attempted) await updateNotification(id, notification, client);
  return { id, notificationStatus: notification.status };
}
