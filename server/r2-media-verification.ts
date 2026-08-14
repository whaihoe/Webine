import { MAX_GIF_FRAMES, MAX_IMAGE_DIMENSION } from "../shared/media-policy.js";
import type { R2Bucket } from "./r2-storage.js";

function u16(bytes: Uint8Array, offset: number) { return bytes[offset] | bytes[offset + 1] << 8; }
function be16(bytes: Uint8Array, offset: number) { return bytes[offset] << 8 | bytes[offset + 1]; }
function be32(bytes: Uint8Array, offset: number) { return (bytes[offset] * 2 ** 24) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]; }
function dimensions(width: number, height: number) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) throw new Error("MEDIA_DIMENSIONS_INVALID");
  return { width, height };
}

function jpegDimensions(bytes: Uint8Array) {
  for (let index = 2; index + 9 < bytes.length;) {
    if (bytes[index] !== 0xff) { index += 1; continue; }
    const marker = bytes[index + 1];
    const length = be16(bytes, index + 2);
    if (length < 2 || index + 2 + length > bytes.length) break;
    if (marker >= 0xc0 && marker <= 0xc3) return dimensions(be16(bytes, index + 7), be16(bytes, index + 5));
    index += 2 + length;
  }
  throw new Error("MEDIA_SIGNATURE_INVALID");
}

function webpDimensions(bytes: Uint8Array) {
  const kind = new TextDecoder().decode(bytes.slice(12, 16));
  if (kind === "VP8X" && bytes.length >= 30) return dimensions(1 + bytes[24] + bytes[25] * 256 + bytes[26] * 65536, 1 + bytes[27] + bytes[28] * 256 + bytes[29] * 65536);
  if (kind === "VP8 " && bytes.length >= 30) return dimensions(u16(bytes, 26) & 0x3fff, u16(bytes, 28) & 0x3fff);
  throw new Error("MEDIA_SIGNATURE_INVALID");
}

const MP4_HEADER_BYTES = 16;
const MAX_MP4_TOP_LEVEL_BOXES = 64;
const MAX_MP4_METADATA_BYTES = 4 * 1024 * 1024;

type Mp4Box = { type: string; size: number; headerSize: number };

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

function mp4Box(bytes: Uint8Array, offset: number, availableBytes: number): Mp4Box {
  if (bytes.length < 8) throw new Error("MEDIA_SIGNATURE_INVALID");
  const size32 = be32(bytes, 0);
  const type = ascii(bytes, 4, 8);
  let size = size32;
  let headerSize = 8;
  if (size32 === 1) {
    if (bytes.length < MP4_HEADER_BYTES) throw new Error("MEDIA_SIGNATURE_INVALID");
    size = be32(bytes, 8) * 2 ** 32 + be32(bytes, 12);
    headerSize = MP4_HEADER_BYTES;
  } else if (size32 === 0) {
    size = availableBytes;
  }
  if (!Number.isSafeInteger(size) || size < headerSize || size > availableBytes || offset < 0) {
    throw new Error("MEDIA_SIGNATURE_INVALID");
  }
  return { type, size, headerSize };
}

async function r2Bytes(bucket: R2Bucket, pathname: string, offset: number, length: number) {
  const object = await bucket.get(pathname, { range: { offset, length } });
  if (!object) throw new Error("MEDIA_NOT_FOUND");
  const bytes = new Uint8Array(await object.arrayBuffer());
  if (bytes.byteLength !== length) throw new Error("MEDIA_SIGNATURE_INVALID");
  return bytes;
}

function trackDimensions(bytes: Uint8Array, start: number, end: number) {
  let offset = start;
  while (offset + 8 <= end) {
    const box = mp4Box(bytes.subarray(offset, Math.min(offset + MP4_HEADER_BYTES, end)), offset, end - offset);
    const boxEnd = offset + box.size;
    if (box.type === "tkhd" && box.size >= box.headerSize + 8) {
      const width = Math.round(be32(bytes, boxEnd - 8) / 65536);
      const height = Math.round(be32(bytes, boxEnd - 4) / 65536);
      if (width > 0 && height > 0) return dimensions(width, height);
    }
    offset = boxEnd;
  }
  return null;
}

function moovDimensions(bytes: Uint8Array) {
  const root = mp4Box(bytes.subarray(0, MP4_HEADER_BYTES), 0, bytes.length);
  if (root.type !== "moov" || root.size !== bytes.length) throw new Error("MEDIA_SIGNATURE_INVALID");
  let offset = root.headerSize;
  while (offset + 8 <= bytes.length) {
    const box = mp4Box(bytes.subarray(offset, Math.min(offset + MP4_HEADER_BYTES, bytes.length)), offset, bytes.length - offset);
    const boxEnd = offset + box.size;
    if (box.type === "trak") {
      const result = trackDimensions(bytes, offset + box.headerSize, boxEnd);
      if (result) return result;
    }
    offset = boxEnd;
  }
  throw new Error("MEDIA_SIGNATURE_INVALID");
}

async function verifyMp4(bucket: R2Bucket, pathname: string, byteSize: number) {
  if (!Number.isSafeInteger(byteSize) || byteSize < 16) throw new Error("MEDIA_SIGNATURE_INVALID");
  let offset = 0;
  let foundFileType = false;
  for (let count = 0; count < MAX_MP4_TOP_LEVEL_BOXES && offset < byteSize; count += 1) {
    const headerLength = Math.min(MP4_HEADER_BYTES, byteSize - offset);
    const header = await r2Bytes(bucket, pathname, offset, headerLength);
    const box = mp4Box(header, offset, byteSize - offset);
    if (offset === 0 && box.type !== "ftyp") throw new Error("MEDIA_SIGNATURE_INVALID");
    if (box.type === "ftyp") foundFileType = true;
    if (box.type === "moov") {
      if (!foundFileType || box.size > MAX_MP4_METADATA_BYTES) throw new Error("MEDIA_SIGNATURE_INVALID");
      return moovDimensions(await r2Bytes(bucket, pathname, offset, box.size));
    }
    offset += box.size;
  }
  throw new Error("MEDIA_SIGNATURE_INVALID");
}

function avifDimensions(bytes: Uint8Array) {
  if (bytes.length < 24 || new TextDecoder().decode(bytes.slice(4, 8)) !== "ftyp") throw new Error("MEDIA_SIGNATURE_INVALID");
  const brands = new TextDecoder().decode(bytes.slice(8, Math.min(bytes.length, 40)));
  if (!brands.includes("avif") && !brands.includes("avis")) throw new Error("MEDIA_SIGNATURE_INVALID");
  for (let index = 4; index + 16 <= bytes.length; index += 1) {
    if (new TextDecoder().decode(bytes.slice(index, index + 4)) === "ispe") {
      return dimensions(be32(bytes, index + 8), be32(bytes, index + 12));
    }
  }
  throw new Error("MEDIA_SIGNATURE_INVALID");
}

function gifDimensionsAndFrames(bytes: Uint8Array) {
  if (bytes.length < 14 || new TextDecoder().decode(bytes.slice(0, 3)) !== "GIF") throw new Error("MEDIA_SIGNATURE_INVALID");
  const result = dimensions(u16(bytes, 6), u16(bytes, 8));
  let index = 13 + ((bytes[10] & 0x80) ? 3 * (1 << ((bytes[10] & 0x07) + 1)) : 0);
  let frames = 0;
  while (index < bytes.length) {
    const marker = bytes[index++];
    if (marker === 0x3b) break;
    if (marker === 0x2c) {
      frames += 1; if (frames > MAX_GIF_FRAMES) throw new Error("GIF_FRAMES_INVALID");
      if (index + 9 > bytes.length) throw new Error("MEDIA_SIGNATURE_INVALID");
      const packed = bytes[index + 8]; index += 9 + ((packed & 0x80) ? 3 * (1 << ((packed & 0x07) + 1)) : 0);
      if (index >= bytes.length) throw new Error("MEDIA_SIGNATURE_INVALID"); index += 1;
    } else if (marker === 0x21) { if (index >= bytes.length) throw new Error("MEDIA_SIGNATURE_INVALID"); index += 1; }
    else throw new Error("MEDIA_SIGNATURE_INVALID");
    while (index < bytes.length) { const size = bytes[index++]; if (size === 0) break; index += size; if (index > bytes.length) throw new Error("MEDIA_SIGNATURE_INVALID"); }
  }
  if (frames < 1) throw new Error("MEDIA_SIGNATURE_INVALID");
  return result;
}

export async function verifyR2Media(bucket: R2Bucket, pathname: string, mimeType: string, expectedByteSize?: number) {
  if (mimeType === "video/mp4") {
    const byteSize = expectedByteSize ?? (await bucket.head(pathname))?.size;
    if (!byteSize) throw new Error("MEDIA_NOT_FOUND");
    return { ...await verifyMp4(bucket, pathname, byteSize), byteSize };
  }
  const object = await bucket.get(pathname);
  if (!object) throw new Error("MEDIA_NOT_FOUND");
  const bytes = new Uint8Array(await object.arrayBuffer());
  if (mimeType === "image/png" && bytes.length >= 24 && new TextDecoder().decode(bytes.slice(1, 4)) === "PNG") return { ...dimensions(be32(bytes, 16), be32(bytes, 20)), byteSize: bytes.byteLength };
  if (mimeType === "image/gif") return { ...gifDimensionsAndFrames(bytes), byteSize: bytes.byteLength };
  if (mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) return { ...jpegDimensions(bytes), byteSize: bytes.byteLength };
  if (mimeType === "image/webp" && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return { ...webpDimensions(bytes), byteSize: bytes.byteLength };
  if (mimeType === "image/avif") return { ...avifDimensions(bytes), byteSize: bytes.byteLength };
  throw new Error("MEDIA_SIGNATURE_INVALID");
}
