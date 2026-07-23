import { upload } from "@vercel/blob/client";
import type { ApiEnvelope } from "../content/api-envelope";
import type { AdminAsset } from "./api";
import { AdminApiError } from "./api";
import type { AdminTokenProvider } from "./AdminAuthContext";
import { validateImageFile } from "../../shared/media-policy";

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

export async function uploadAdminImage(
  file: File,
  details: UploadDetails,
  onProgress: (value: number) => void,
  completeUpload: (path: string, method: "POST", body: unknown) => Promise<AdminAsset>,
  getToken?: AdminTokenProvider,
) {
  const validationMessage = validateImageFile(file);
  if (validationMessage) {
    throw new AdminApiError(
      422,
      "IMAGE_INVALID",
      validationMessage,
    );
  }

  if (import.meta.env.DEV) return localUpload(file, details, onProgress);

  const sessionToken = await getToken?.();
  const blob = await upload(`webine/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/admin/media/upload-token",
    contentType: file.type,
    headers: sessionToken
      ? { Authorization: `Bearer ${sessionToken}` }
      : undefined,
    multipart: file.size > 4 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress(Math.round(percentage)),
  });
  return completeUpload("/api/admin/media/complete", "POST", {
    ...details,
    url: blob.url,
    pathname: blob.pathname,
    originalFilename: file.name,
  });
}
