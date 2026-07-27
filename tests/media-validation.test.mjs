import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  validateImageBuffer,
  validateMediaBuffer,
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

test("accepts an MP4 container and reads its display dimensions", async () => {
  const mp4 = Buffer.alloc(64);
  mp4.writeUInt32BE(16, 0);
  mp4.write("ftyp", 4, "ascii");
  mp4.write("isom", 8, "ascii");
  mp4.writeUInt32BE(40, 16);
  mp4.write("tkhd", 20, "ascii");
  mp4.writeUInt32BE(1920 * 65_536, 48);
  mp4.writeUInt32BE(1080 * 65_536, 52);

  assert.ok(ACCEPTED_VIDEO_TYPES.includes("video/mp4"));
  const video = await validateMediaBuffer(asArrayBuffer(mp4), "video/mp4");
  assert.equal(video.mimeType, "video/mp4");
  assert.equal(video.width, 1920);
  assert.equal(video.height, 1080);
});

test("rejects a non-MP4 payload declared as video", async () => {
  await assert.rejects(
    () => validateMediaBuffer(asArrayBuffer(onePixelGif), "video/mp4"),
    /VIDEO_CONTENT_INVALID/,
  );
});
