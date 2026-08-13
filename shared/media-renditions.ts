export const MEDIA_RENDITION_ROLES = [
  "landing",
  "works",
  "case-study",
] as const;

export type MediaRenditionRole = (typeof MEDIA_RENDITION_ROLES)[number];
export type MediaProcessingStatus = "processing" | "quarantined" | "ready" | "failed";

export type MediaRendition = {
  role: MediaRenditionRole;
  url: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  status: MediaProcessingStatus;
};

export type RenditionAwareMedia = {
  url: string;
  mimeType?: string;
  byteSize?: number;
  width: number;
  height: number;
  renditions?: MediaRendition[];
};

export const mediaRenditionTargets: Record<MediaRenditionRole, {
  maxWidth: number;
  maxVideoWidth: number;
}> = {
  landing: { maxWidth: 960, maxVideoWidth: 960 },
  works: { maxWidth: 1920, maxVideoWidth: 1600 },
  "case-study": { maxWidth: 2560, maxVideoWidth: 2400 },
};

export function isMediaRenditionRole(value: unknown): value is MediaRenditionRole {
  return typeof value === "string" && (MEDIA_RENDITION_ROLES as readonly string[]).includes(value);
}

export function selectMediaRendition<T extends RenditionAwareMedia>(
  asset: T,
  role: MediaRenditionRole,
) {
  const rendition = asset.renditions?.find((candidate) =>
    candidate.role === role && candidate.status === "ready" && Boolean(candidate.url),
  );
  return rendition ?? asset;
}

export function deriveMediaDisplayName(
  altText: string,
  caption: string,
  originalFilename: string,
) {
  const descriptiveText = altText.trim() || caption.trim();
  if (descriptiveText) return descriptiveText.replace(/\s+/g, " ").slice(0, 120);

  const filename = originalFilename
    .replace(/\.[a-z0-9]{1,10}$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return filename || "Untitled media";
}

export function restartHoverVideo(video: Pick<HTMLVideoElement, "pause" | "play" | "currentTime">) {
  video.pause();
  video.currentTime = 0;
  return video.play();
}

export function stopHoverVideo(video: Pick<HTMLVideoElement, "pause" | "currentTime">) {
  video.pause();
  video.currentTime = 0;
}
