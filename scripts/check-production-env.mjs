const requiredVariables = [
  "VITE_CLERK_PUBLISHABLE_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "ADMIN_USER_ID",
  "CLERK_AUTHORIZED_PARTIES",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "BLOB_READ_WRITE_TOKEN",
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

if (process.env.ADMIN_DEV_BYPASS?.trim().toLowerCase() === "true") {
  issues.push("ADMIN_DEV_BYPASS must not be enabled in a Vercel deployment");
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
