import { CmsRepositoryError } from "./cms-repository.js";
import { getR2Bucket, type R2Environment } from "./r2-storage.js";

export type MediaStorageRecord = {
  provider: string;
  providerAssetId: string;
};

export async function deleteStoredMedia(
  record: MediaStorageRecord,
  environment: R2Environment = process.env,
  deleteObject: (key: string) => Promise<void> = (key) => getR2Bucket(environment).delete(key),
) {
  if (record.provider !== "r2") {
    return;
  }
  try {
    await deleteObject(record.providerAssetId);
  } catch {
    throw new CmsRepositoryError(
      "MEDIA_STORAGE_DELETE_FAILED",
      "The stored media file could not be deleted from R2. Try archiving it again.",
      502,
    );
  }
}
