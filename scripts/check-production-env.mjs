const requiredVariables = [
  "VITE_CLERK_PUBLISHABLE_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "ADMIN_USER_ID",
  "CLERK_AUTHORIZED_PARTIES",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_S3_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
  "VITE_CONTENT_BASE_URL",
  "ENQUIRY_HASH_SECRET",
  "VITE_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET_KEY",
  "TURNSTILE_ALLOWED_HOSTNAMES",
  "TURNSTILE_EXPECTED_ACTION",
];

const issues = [];

for (const key of requiredVariables) {
  if (!process.env[key]?.trim()) {
    issues.push(`${key} is missing`);
  }
}

const enquirySecret = process.env.ENQUIRY_HASH_SECRET?.trim() ?? "";
if (enquirySecret && enquirySecret.length < 32) {
  issues.push("ENQUIRY_HASH_SECRET must contain at least 32 characters");
}

const resendVariables = [
  "RESEND_API_KEY",
  "ENQUIRY_NOTIFICATION_EMAIL",
  "ENQUIRY_NOTIFICATION_FROM_EMAIL",
];
const configuredResendVariables = resendVariables.filter((key) =>
  process.env[key]?.trim()
);
const warnings = [];
if (
  configuredResendVariables.length > 0 &&
  configuredResendVariables.length !== resendVariables.length
) {
  warnings.push(
    "Resend enquiry notifications are incomplete and will remain pending in Admin until all three Resend variables are configured",
  );
}

const authorisedParties = (process.env.CLERK_AUTHORIZED_PARTIES ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

for (const party of authorisedParties) {
  try {
    const url = new URL(party);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
      issues.push(`CLERK_AUTHORIZED_PARTIES contains an invalid origin: ${party}`);
    }
  } catch {
    issues.push(`CLERK_AUTHORIZED_PARTIES contains an invalid origin: ${party}`);
  }
}

function requireHttpsOrigin(key) {
  const value = process.env[key]?.trim();
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
      issues.push(`${key} must be an HTTPS origin without a path, query or fragment`);
    }
  } catch {
    issues.push(`${key} must be a valid HTTPS origin`);
  }
}

requireHttpsOrigin("R2_PUBLIC_BASE_URL");
requireHttpsOrigin("VITE_CONTENT_BASE_URL");

const r2Endpoint = process.env.R2_S3_ENDPOINT?.trim();
if (r2Endpoint) {
  try {
    const url = new URL(r2Endpoint);
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".r2.cloudflarestorage.com") ||
      url.pathname.split("/").filter(Boolean).length !== 1 ||
      url.search ||
      url.hash
    ) {
      issues.push("R2_S3_ENDPOINT must be a bucket-specific Cloudflare R2 HTTPS endpoint");
    }
  } catch {
    issues.push("R2_S3_ENDPOINT must be a valid bucket-specific Cloudflare R2 HTTPS endpoint");
  }
}

if (process.env.ADMIN_DEV_BYPASS?.trim().toLowerCase() === "true") {
  issues.push("ADMIN_DEV_BYPASS must not be enabled in a Cloudflare deployment");
}

if (process.env.VITE_SITE_URL?.trim() !== "https://www.madebywebine.com") {
  issues.push("VITE_SITE_URL must use https://www.madebywebine.com in Production");
}

const turnstileHostnames = new Set(
  (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);
for (const hostname of ["madebywebine.com", "www.madebywebine.com"]) {
  if (!turnstileHostnames.has(hostname)) {
    issues.push(`TURNSTILE_ALLOWED_HOSTNAMES must include ${hostname}`);
  }
}
if (process.env.TURNSTILE_EXPECTED_ACTION?.trim() !== "contact_enquiry") {
  issues.push("TURNSTILE_EXPECTED_ACTION must be contact_enquiry");
}

if (issues.length > 0) {
  console.error("Webine production environment is incomplete:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("Webine production environment is configured.");
}

for (const warning of warnings) {
  console.warn(`Webine production warning: ${warning}.`);
}
