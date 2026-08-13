import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  validateImageBuffer,
  validateMediaBuffer,
} from "../.test-build/server/media-service.js";
import { deleteStoredMedia } from "../.test-build/server/media-storage.js";

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
  assert.equal(MAX_IMAGE_BYTES, 15 * 1024 * 1024);
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

test("rejects oversized media before decoding and excessive dimensions", async () => {
  await assert.rejects(
    () => validateImageBuffer(asArrayBuffer(Buffer.alloc(MAX_IMAGE_BYTES + 1)), "image/png"),
    /IMAGE_SIZE_INVALID/,
  );
  const sharp = (await import("sharp")).default;
  const tooWide = await sharp({
    create: { width: 12_001, height: 1, channels: 3, background: "white" },
  }).png().toBuffer();
  await assert.rejects(
    () => validateImageBuffer(asArrayBuffer(tooWide), "image/png"),
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

test("deletes R2 media by object key", async () => {
  const calls = [];

  await deleteStoredMedia(
    {
      provider: "r2",
      providerAssetId: "webine/archive-me.webp",
    },
    {},
    async (pathname) => {
      calls.push(pathname);
    },
  );

  assert.deepEqual(calls, ["webine/archive-me.webp"]);
});

test("does not delete media managed by another provider", async () => {
  let deleteCalled = false;

  await deleteStoredMedia(
    {
      provider: "external",
      providerAssetId: "/images/local.webp",
    },
    {},
    async () => {
      deleteCalled = true;
    },
  );

  assert.equal(deleteCalled, false);
});

test("maps R2 deletion failures to a retryable repository error", async () => {
  await assert.rejects(
    () => deleteStoredMedia(
      {
        provider: "r2",
        providerAssetId: "webine/archive-me.webp",
      },
      {},
      async () => {
        throw new Error("R2 unavailable");
      },
    ),
    (error) => error.code === "MEDIA_STORAGE_DELETE_FAILED"
      && error.status === 502
      && /Try archiving it again/.test(error.message),
  );
});
