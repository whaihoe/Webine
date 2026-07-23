import assert from "node:assert/strict";
import test from "node:test";
import {
  getBlobReadWriteToken,
  getEnquiryHashSecret,
  getRuntimeReadiness,
  hasEnquiryNotificationProvider,
} from "../.test-build/server/runtime-readiness.js";

test("reports the exact production services that still need configuration", () => {
  const missing = getRuntimeReadiness({});
  assert.equal(missing.mediaUploads.configured, false);
  assert.equal(missing.mediaUploads.requiredVariable, "BLOB_READ_WRITE_TOKEN");
  assert.equal(missing.enquiries.configured, false);
  assert.equal(missing.enquiries.requiredVariable, "ENQUIRY_HASH_SECRET");
  assert.equal(missing.enquiryNotifications.configured, false);

  const environment = {
    BLOB_READ_WRITE_TOKEN: "  blob-token  ",
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
  assert.equal(getBlobReadWriteToken(environment), "blob-token");
  assert.equal(getEnquiryHashSecret(environment), "enquiry-secret");
});
