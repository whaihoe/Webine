import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 12_000;
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

const extensionByMime = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);

export type ValidatedImage = {
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
    pages > 500
  ) {
    throw new Error("IMAGE_CONTENT_INVALID");
  }

  return { buffer, mimeType: declaredMimeType, width, height, byteSize: buffer.byteLength } satisfies ValidatedImage;
}

export function localMediaPath(providerAssetId: string) {
  const safeName = providerAssetId.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safeName || safeName !== providerAssetId || extname(safeName).length < 2) throw new Error("INVALID_MEDIA_PATH");
  return resolve(process.cwd(), ".data", "uploads", safeName);
}

export async function storeLocalImage(id: string, image: ValidatedImage) {
  const extension = extensionByMime.get(image.mimeType);
  if (!extension) throw new Error("IMAGE_TYPE_INVALID");
  const providerAssetId = `${id}${extension}`;
  await mkdir(resolve(process.cwd(), ".data", "uploads"), { recursive: true });
  await writeFile(localMediaPath(providerAssetId), image.buffer, { flag: "wx" });
  return providerAssetId;
}

export function readLocalImage(providerAssetId: string) {
  return readFile(localMediaPath(providerAssetId));
}
