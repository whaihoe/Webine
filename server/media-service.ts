import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_MEDIA_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_GIF_FRAMES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  MAX_VIDEO_BYTES,
} from "../shared/media-policy.js";

export {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_MEDIA_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  MAX_VIDEO_BYTES,
};

const extensionByMime = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
  ["video/mp4", ".mp4"],
]);

export type ValidatedMedia = {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
};

export async function validateImageBuffer(bytes: ArrayBuffer, declaredMimeType: string) {
  const buffer = Buffer.from(bytes);
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("IMAGE_SIZE_INVALID");
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(declaredMimeType as typeof ACCEPTED_IMAGE_TYPES[number])) {
    throw new Error("IMAGE_TYPE_INVALID");
  }

  const metadata = await sharp(buffer, { limitInputPixels: MAX_IMAGE_DIMENSION ** 2 }).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const pages = metadata.pages ?? 1;
  const detectedMime = metadata.format === "jpeg" ? "image/jpeg" : `image/${metadata.format}`;

  if (
    detectedMime !== declaredMimeType ||
    width < 1 ||
    height < 1 ||
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION ||
    pages > MAX_GIF_FRAMES
  ) {
    throw new Error("IMAGE_CONTENT_INVALID");
  }

  return { buffer, mimeType: declaredMimeType, width, height, byteSize: buffer.byteLength } satisfies ValidatedImage;
}

export type ValidatedImage = ValidatedMedia;

function readMp4Dimensions(buffer: Buffer) {
  const dimensions: Array<{ width: number; height: number }> = [];
  let offset = 4;

  while (offset + 4 <= buffer.byteLength) {
    const marker = buffer.toString("ascii", offset, offset + 4);
    if (marker === "tkhd" && offset >= 4) {
      const boxStart = offset - 4;
      let boxSize = buffer.readUInt32BE(boxStart);
      let headerSize = 8;
      if (boxSize === 1 && boxStart + 16 <= buffer.byteLength) {
        const largeSize = buffer.readBigUInt64BE(boxStart + 8);
        if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) break;
        boxSize = Number(largeSize);
        headerSize = 16;
      }
      const boxEnd = boxStart + boxSize;
      if (
        boxSize >= headerSize + 8 &&
        boxEnd <= buffer.byteLength
      ) {
        dimensions.push({
          width: Math.round(buffer.readUInt32BE(boxEnd - 8) / 65_536),
          height: Math.round(buffer.readUInt32BE(boxEnd - 4) / 65_536),
        });
      }
    }
    offset += 1;
  }

  return dimensions
    .filter(({ width, height }) => width > 0 && height > 0)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0];
}

export async function validateMediaBuffer(bytes: ArrayBuffer, declaredMimeType: string) {
  if (declaredMimeType !== "video/mp4") {
    return validateImageBuffer(bytes, declaredMimeType);
  }

  const buffer = Buffer.from(bytes);
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_VIDEO_BYTES) {
    throw new Error("VIDEO_SIZE_INVALID");
  }
  if (
    buffer.byteLength < 16 ||
    buffer.toString("ascii", 4, 8) !== "ftyp"
  ) {
    throw new Error("VIDEO_CONTENT_INVALID");
  }

  const dimensions = readMp4Dimensions(buffer);
  if (
    !dimensions ||
    dimensions.width > MAX_IMAGE_DIMENSION ||
    dimensions.height > MAX_IMAGE_DIMENSION
  ) {
    throw new Error("VIDEO_CONTENT_INVALID");
  }

  return {
    buffer,
    mimeType: declaredMimeType,
    width: dimensions.width,
    height: dimensions.height,
    byteSize: buffer.byteLength,
  } satisfies ValidatedMedia;
}

export function localMediaPath(providerAssetId: string) {
  const safeName = providerAssetId.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safeName || safeName !== providerAssetId || extname(safeName).length < 2) throw new Error("INVALID_MEDIA_PATH");
  return resolve(process.cwd(), ".data", "uploads", safeName);
}

export async function storeLocalMedia(id: string, media: ValidatedMedia) {
  const extension = extensionByMime.get(media.mimeType);
  if (!extension) throw new Error("MEDIA_TYPE_INVALID");
  const providerAssetId = `${id}${extension}`;
  await mkdir(resolve(process.cwd(), ".data", "uploads"), { recursive: true });
  await writeFile(localMediaPath(providerAssetId), media.buffer, { flag: "wx" });
  return providerAssetId;
}

export const storeLocalImage = storeLocalMedia;

export function readLocalMedia(providerAssetId: string) {
  return readFile(localMediaPath(providerAssetId));
}

export const readLocalImage = readLocalMedia;
