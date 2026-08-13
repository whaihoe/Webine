import assert from "node:assert/strict";
import test from "node:test";
import { verifyR2Media } from "../.test-build/server/r2-media-verification.js";
import { createR2UploadUrl } from "../.test-build/server/r2-storage.js";

const bytes = (value) => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
const bucket = (value) => ({ get: async () => ({ arrayBuffer: async () => bytes(value) }) });

test("parses GIF blocks instead of counting arbitrary comma bytes as frames", async () => {
  const gif = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");
  const verified = await verifyR2Media(bucket(gif), "webine/media/gif", "image/gif");
  assert.deepEqual(verified, { width: 1, height: 1, byteSize: gif.byteLength });
});

test("rejects malformed GIF blocks", async () => {
  const malformed = Buffer.from("GIF89a\x01\x00\x01\x00\x00\x00\x00\x2c", "binary");
  await assert.rejects(() => verifyR2Media(bucket(malformed), "webine/media/gif", "image/gif"));
});

test("verifies AVIF identity and spatial dimensions", async () => {
  const avif = Buffer.alloc(44);
  avif.writeUInt32BE(24, 0);
  avif.write("ftyp", 4, "ascii");
  avif.write("avif", 8, "ascii");
  avif.write("avif", 16, "ascii");
  avif.writeUInt32BE(20, 24);
  avif.write("ispe", 28, "ascii");
  avif.writeUInt32BE(1600, 36);
  avif.writeUInt32BE(1000, 40);
  assert.deepEqual(await verifyR2Media(bucket(avif), "webine/media/image.avif", "image/avif"), {
    width: 1600,
    height: 1000,
    byteSize: avif.byteLength,
  });
});

test("preserves the bucket path in presigned R2 upload URLs", async () => {
  const result = await createR2UploadUrl(
    "webine/media/example image.webp",
    "image/webp",
    {
      R2_ACCESS_KEY_ID: "access-key",
      R2_SECRET_ACCESS_KEY: "secret-key",
      R2_S3_ENDPOINT: "https://account.r2.cloudflarestorage.com/webine-media",
      R2_PUBLIC_BASE_URL: "https://media.madebywebine.com",
    },
    new Date("2026-08-14T00:00:00.000Z"),
  );

  const uploadUrl = new URL(result.uploadUrl);
  assert.equal(uploadUrl.pathname, "/webine-media/webine/media/example%20image.webp");
  assert.equal(result.deliveryUrl, "https://media.madebywebine.com/webine/media/example%20image.webp");
});
