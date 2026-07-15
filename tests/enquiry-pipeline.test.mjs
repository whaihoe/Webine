import { createClient } from "@libsql/client";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createEnquiry,
  listEnquiries,
  retryEnquiryNotification,
} from "../.test-build/server/enquiry-service.js";
import { CmsRepositoryError } from "../.test-build/server/cms-repository.js";

const projectRoot = new URL("../", import.meta.url);
const migrationRoot = new URL("migrations/", projectRoot);

async function withDatabase(run) {
  const directory = await mkdtemp(join(tmpdir(), "webine-enquiries-"));
  const client = createClient({ url: `file:${join(directory, "cms.sqlite")}` });
  try {
    const names = (await readdir(migrationRoot)).filter((name) => name.endsWith(".sql")).sort();
    for (const name of names) await client.executeMultiple(await readFile(new URL(name, migrationRoot), "utf8"));
    await run(client);
  } finally {
    await client.close();
    await rm(directory, { recursive: true, force: true });
  }
}

function request(ip) {
  return new Request("http://localhost/api/enquiries", { headers: { "x-forwarded-for": ip } });
}

function validInput(index = 0) {
  return {
    name: "Webine prospect",
    email: `prospect${index}@example.com`,
    company: "Example business",
    website: "https://example.com",
    serviceInterest: "New website",
    budgetRange: "Still defining",
    timeline: "Flexible",
    details: `A considered project outline with enough useful detail number ${index}.`,
    consent: true,
    consentVersion: "2026-07-15",
    sourcePage: "/contact",
    websiteConfirm: "",
  };
}

test("stores valid enquiries, hides bot submissions and deduplicates repeats", async () => {
  process.env.ENQUIRY_HASH_SECRET = "test-enquiry-secret";
  delete process.env.ENQUIRY_NOTIFICATION_WEBHOOK_URL;
  await withDatabase(async (client) => {
    assert.deepEqual(await createEnquiry(validInput(), request("10.0.0.1"), "request-1", client), { accepted: true, duplicate: false });
    assert.deepEqual(await createEnquiry(validInput(), request("10.0.0.2"), "request-2", client), { accepted: true, duplicate: true });
    const botInput = { websiteConfirm: "filled-by-bot" };
    assert.deepEqual(await createEnquiry(botInput, request("10.0.0.3"), "request-3", client), { accepted: true, duplicate: false });

    const enquiries = await listEnquiries(client);
    assert.equal(enquiries.length, 1);
    assert.equal(enquiries[0].email, "prospect0@example.com");
    assert.equal(enquiries[0].notificationStatus, "pending");
  });
});

test("rejects invalid submissions and limits repeated clients", async () => {
  process.env.ENQUIRY_HASH_SECRET = "test-enquiry-secret";
  await withDatabase(async (client) => {
    await assert.rejects(
      () => createEnquiry({ ...validInput(), email: "invalid" }, request("10.0.1.1"), "invalid", client),
      (error) => error instanceof CmsRepositoryError && error.code === "EMAIL_INVALID",
    );

    for (let index = 0; index < 5; index += 1) {
      await createEnquiry(validInput(index + 10), request("10.0.1.2"), `request-${index}`, client);
    }
    await assert.rejects(
      () => createEnquiry(validInput(20), request("10.0.1.2"), "request-limited", client),
      (error) => error instanceof CmsRepositoryError && error.code === "RATE_LIMITED" && error.status === 429,
    );
  });
});

test("keeps notification retries reviewable when no provider is configured", async () => {
  process.env.ENQUIRY_HASH_SECRET = "test-enquiry-secret";
  delete process.env.ENQUIRY_NOTIFICATION_WEBHOOK_URL;
  await withDatabase(async (client) => {
    await createEnquiry(validInput(), request("10.0.2.1"), "request-1", client);
    const [enquiry] = await listEnquiries(client);
    assert.deepEqual(await retryEnquiryNotification(enquiry.id, client), { id: enquiry.id, notificationStatus: "pending" });
    const [retried] = await listEnquiries(client);
    assert.equal(retried.notificationAttempts, 0);
  });
});
