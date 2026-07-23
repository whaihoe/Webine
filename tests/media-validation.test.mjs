import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  validateImageBuffer,
} from "../.test-build/server/media-service.js";

const onePixelGif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64",
);

function asArrayBuffer(buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

test("accepts verified GIF media without changing the original animation payload", async () => {
  assert.ok(ACCEPTED_IMAGE_TYPES.includes("image/gif"));
  assert.equal(MAX_IMAGE_BYTES, 50 * 1024 * 1024);
  const image = await validateImageBuffer(asArrayBuffer(onePixelGif), "image/gif");
  assert.equal(image.mimeType, "image/gif");
  assert.equal(image.width, 1);
  assert.equal(image.height, 1);
  assert.equal(image.byteSize, onePixelGif.byteLength);
  assert.deepEqual(image.buffer, onePixelGif);
});

test("rejects a GIF payload declared as another image type", async () => {
  await assert.rejects(
    () => validateImageBuffer(asArrayBuffer(onePixelGif), "image/png"),
    /IMAGE_CONTENT_INVALID/,
  );
});
