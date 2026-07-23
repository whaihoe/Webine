import assert from "node:assert/strict";
import test from "node:test";
import {
  getBlobReadWriteToken,
  getEnquiryHashSecret,
  getRuntimeReadiness,
} from "../.test-build/server/runtime-readiness.js";

test("reports the exact production services that still need configuration", () => {
  const missing = getRuntimeReadiness({});
  assert.equal(missing.mediaUploads.configured, false);
  assert.equal(missing.mediaUploads.requiredVariable, "BLOB_READ_WRITE_TOKEN");
  assert.equal(missing.enquiries.configured, false);
  assert.equal(missing.enquiries.requiredVariable, "ENQUIRY_HASH_SECRET");

  const environment = {
    BLOB_READ_WRITE_TOKEN: "  blob-token  ",
    ENQUIRY_HASH_SECRET: "  enquiry-secret  ",
  };
  const configured = getRuntimeReadiness(environment);
  assert.equal(configured.mediaUploads.configured, true);
  assert.equal(configured.enquiries.configured, true);
  assert.equal(getBlobReadWriteToken(environment), "blob-token");
  assert.equal(getEnquiryHashSecret(environment), "enquiry-secret");
});
