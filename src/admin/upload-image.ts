import type { ApiEnvelope } from "../content/api-envelope";
import type { AdminAsset } from "./api";
import { AdminApiError } from "./api";
import { validateMediaFile } from "../../shared/media-policy";

export type UploadDetails = {
  altText: string;
  caption: string;
  decorative: boolean;
  focalX: number;
  focalY: number;
};

export const initialUploadDetails: UploadDetails = {
  altText: "",
  caption: "",
  decorative: false,
  focalX: 0.5,
  focalY: 0.5,
};

function uploadToR2(file: File, uploadUrl: string, onProgress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round(event.loaded / event.total * 100));
    request.onerror = () => reject(new AdminApiError(0, "UPLOAD_FAILED", "The upload connection was interrupted."));
    request.onload = () => request.status >= 200 && request.status < 300
      ? resolve()
      : reject(new AdminApiError(request.status, "UPLOAD_FAILED", "The media store rejected the upload."));
    request.send(file);
  });
}

function localUpload(file: File, details: UploadDetails, onProgress: (value: number) => void) {
  return new Promise<AdminAsset>((resolve, reject) => {
    const body = new FormData();
    body.set("file", file);
    Object.entries(details).forEach(([key, value]) => body.set(key, String(value)));
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/media/local-upload");
    request.setRequestHeader("Accept", "application/json");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round(event.loaded / event.total * 100));
    request.onerror = () => reject(new AdminApiError(0, "UPLOAD_FAILED", "The upload connection was interrupted."));
    request.onload = () => {
      try {
        const envelope = JSON.parse(request.responseText) as ApiEnvelope<AdminAsset>;
        if (request.status < 200 || request.status >= 300 || !envelope.data) {
          reject(new AdminApiError(request.status, envelope.error?.code ?? "UPLOAD_FAILED", envelope.error?.message ?? "The image could not be uploaded."));
        } else {
          resolve(envelope.data);
        }
      } catch {
        reject(new AdminApiError(request.status, "UPLOAD_FAILED", "The upload response was invalid."));
      }
    };
    request.send(body);
  });
}

export async function uploadAdminMedia(
  file: File,
  details: UploadDetails,
  onProgress: (value: number) => void,
  completeUpload: (path: string, method: "POST", body: unknown) => Promise<AdminAsset>,
) {
  const validationMessage = validateMediaFile(file);
  if (validationMessage) {
    throw new AdminApiError(
      422,
      "MEDIA_INVALID",
      validationMessage,
    );
  }

  if (import.meta.env.DEV) return localUpload(file, details, onProgress);

  const assetId = crypto.randomUUID();
  const safeFilename = file.name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "upload";
  const token = await completeUpload("/api/admin/media/upload-token", "POST", {
    assetId,
    filename: safeFilename,
    byteSize: file.size,
    mimeType: file.type,
  }) as unknown as { uploadUrl: string; pathname: string; deliveryUrl: string; intent: string };
  await uploadToR2(file, token.uploadUrl, onProgress);
  return completeUpload("/api/admin/media/complete", "POST", {
    ...details,
    assetId,
    pathname: token.pathname,
    intent: token.intent,
    deliveryUrl: token.deliveryUrl,
    originalFilename: file.name,
  });
}
