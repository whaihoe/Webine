import { del } from "@vercel/blob";
import { CmsRepositoryError } from "./cms-repository.js";
import { getBlobReadWriteToken } from "./runtime-readiness.js";

export type MediaStorageRecord = {
  provider: string;
  providerAssetId: string;
};

type DeleteBlob = (
  urlOrPathname: string,
  options: { token: string },
) => Promise<void>;

export async function deleteStoredMedia(
  record: MediaStorageRecord,
  environment: NodeJS.ProcessEnv = process.env,
  deleteBlob: DeleteBlob = del,
) {
  if (record.provider !== "vercel_blob") {
    return;
  }

  const token = getBlobReadWriteToken(environment);
  if (!token) {
    throw new CmsRepositoryError(
      "MEDIA_STORAGE_NOT_CONFIGURED",
      "Vercel Blob is not configured, so the stored file could not be deleted.",
      503,
    );
  }

  try {
    await deleteBlob(record.providerAssetId, { token });
  } catch {
    throw new CmsRepositoryError(
      "MEDIA_STORAGE_DELETE_FAILED",
      "The stored media file could not be deleted from Vercel Blob. Try archiving it again.",
      502,
    );
  }
}
