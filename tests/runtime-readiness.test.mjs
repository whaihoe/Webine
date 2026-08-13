import assert from "node:assert/strict";
import test from "node:test";
import {
  getEnquiryHashSecret,
  getRuntimeReadiness,
  hasEnquiryNotificationProvider,
} from "../.test-build/server/runtime-readiness.js";

test("reports the exact production services that still need configuration", () => {
  const missing = getRuntimeReadiness({});
  assert.equal(missing.mediaUploads.configured, false);
  assert.match(missing.mediaUploads.requiredVariable, /R2_ACCESS_KEY_ID/);
  assert.equal(missing.enquiries.configured, false);
  assert.equal(missing.enquiries.requiredVariable, "ENQUIRY_HASH_SECRET");
  assert.equal(missing.enquiryNotifications.configured, false);

  const environment = {
    R2_ACCESS_KEY_ID: "access",
    R2_SECRET_ACCESS_KEY: "secret",
    R2_S3_ENDPOINT: "https://example.r2.cloudflarestorage.com",
    R2_PUBLIC_BASE_URL: "https://media.example.com",
    ENQUIRY_HASH_SECRET: "  enquiry-secret  ",
    RESEND_API_KEY: "  resend-key  ",
    ENQUIRY_NOTIFICATION_EMAIL: "  owner@example.com  ",
    ENQUIRY_NOTIFICATION_FROM_EMAIL: "  Webine <enquiries@example.com>  ",
  };
  const configured = getRuntimeReadiness(environment);
  assert.equal(configured.mediaUploads.configured, true);
  assert.equal(configured.enquiries.configured, true);
  assert.equal(configured.enquiryNotifications.configured, true);
  assert.equal(hasEnquiryNotificationProvider(environment), true);
  assert.equal(getEnquiryHashSecret(environment), "enquiry-secret");
});
