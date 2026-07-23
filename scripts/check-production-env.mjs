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

if (issues.length > 0) {
  console.error("Webine production environment is incomplete:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("Webine production environment is configured.");
}
