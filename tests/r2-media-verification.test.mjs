import assert from "node:assert/strict";
import test from "node:test";
import { verifyR2Media } from "../.test-build/server/r2-media-verification.js";
import { createR2UploadUrl } from "../.test-build/server/r2-storage.js";

const bytes = (value) => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
const bucket = (value) => ({ get: async () => ({ arrayBuffer: async () => bytes(value) }) });
const mp4Box = (type, payload = Buffer.alloc(0)) => {
  const value = Buffer.alloc(8 + payload.byteLength);
  value.writeUInt32BE(value.byteLength, 0);
  value.write(type, 4, "ascii");
  payload.copy(value, 8);
  return value;
};

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

test("verifies a large MP4 through bounded R2 metadata ranges", async () => {
  const trackHeaderPayload = Buffer.alloc(84);
  trackHeaderPayload.writeUInt32BE(2752 * 65536, trackHeaderPayload.byteLength - 8);
  trackHeaderPayload.writeUInt32BE(1536 * 65536, trackHeaderPayload.byteLength - 4);
  const fileType = mp4Box("ftyp", Buffer.from("isom\0\0\0\0isomiso2", "binary"));
  const movie = mp4Box("moov", mp4Box("trak", mp4Box("tkhd", trackHeaderPayload)));
  const byteSize = 28 * 1024 * 1024;
  const mediaDataSize = byteSize - fileType.byteLength - movie.byteLength;
  const mediaDataHeader = Buffer.alloc(8);
  mediaDataHeader.writeUInt32BE(mediaDataSize, 0);
  mediaDataHeader.write("mdat", 4, "ascii");
  const movieOffset = byteSize - movie.byteLength;
  const reads = [];
  const rangedBucket = {
    head: async () => ({ size: byteSize }),
    get: async (_key, options) => {
      assert.ok(options?.range, "MP4 verification must not request the complete object");
      const { offset, length } = options.range;
      reads.push({ offset, length });
      const value = Buffer.alloc(length);
      for (const segment of [
        { offset: 0, value: fileType },
        { offset: fileType.byteLength, value: mediaDataHeader },
        { offset: movieOffset, value: movie },
      ]) {
        const start = Math.max(offset, segment.offset);
        const end = Math.min(offset + length, segment.offset + segment.value.byteLength);
        if (end > start) segment.value.copy(value, start - offset, start - segment.offset, end - segment.offset);
      }
      return { arrayBuffer: async () => bytes(value) };
    },
  };

  assert.deepEqual(await verifyR2Media(rangedBucket, "webine/media/hero.mp4", "video/mp4", byteSize), {
    width: 2752,
    height: 1536,
    byteSize,
  });
  assert.equal(reads.length, 4);
  assert.ok(reads.every(({ length }) => length <= movie.byteLength));
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
