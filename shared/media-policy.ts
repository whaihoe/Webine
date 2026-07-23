export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_SIZE_LABEL = "50 MB";
export const MAX_IMAGE_DIMENSION = 12_000;
export const MAX_GIF_FRAMES = 500;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export function validateImageFile(file: Pick<File, "size" | "type">) {
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) {
    return `Choose an image no larger than ${MAX_IMAGE_SIZE_LABEL}.`;
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(
    file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
  )) {
    return "Choose a JPEG, PNG, WebP, AVIF or GIF.";
  }

  return "";
}
