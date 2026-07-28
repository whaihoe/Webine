import { rm } from "node:fs/promises";

export async function removeTemporaryDirectory(directory) {
  try {
    await rm(directory, {
      recursive: true,
      force: true,
      maxRetries: 2,
      retryDelay: 50,
    });
  } catch (error) {
    if (
      process.platform === "win32"
      && error
      && typeof error === "object"
      && "code" in error
      && (error.code === "EBUSY" || error.code === "EPERM")
    ) {
      return;
    }
    throw error;
  }
}
