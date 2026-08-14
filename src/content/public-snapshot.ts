import type { ApiEnvelope } from "./api-envelope";
import type { PublicProject } from "./public-projects";
import { publicContentBaseUrl } from "../config/public-runtime";

export type PublicSnapshot = {
  projects: PublicProject[];
  siteSettings: Record<string, unknown>;
};

let currentRequest: Promise<PublicSnapshot> | null = null;

export function loadPublicSnapshot(refresh = false) {
  if (refresh) currentRequest = null;
  currentRequest ??= fetch(`${publicContentBaseUrl()}/content/public.json`, {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      const envelope = await response.json() as ApiEnvelope<PublicSnapshot>;
      if (!response.ok || !envelope.data || !Array.isArray(envelope.data.projects)) {
        throw new Error(envelope.error?.message ?? "Published content could not be loaded.");
      }
      return envelope.data;
    })
    .catch((error: unknown) => {
      currentRequest = null;
      throw error;
    });
  return currentRequest;
}
