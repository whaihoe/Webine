import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { CmsRepositoryError } from "../../../server/cms-repository.js";
import { createAsset } from "../../../server/media-repository.js";
import { validateImageBuffer } from "../../../server/media-service.js";
import { jsonResponse, readJsonRequest } from "../../../server/responses.js";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const input = await readJsonRequest(request) as Record<string, unknown>;
      const url = new URL(stringValue(input.url));
      if (!url.hostname.endsWith(".blob.vercel-storage.com")) {
        throw new CmsRepositoryError("MEDIA_PROVIDER_INVALID", "The upload did not come from the configured media store.", 422);
      }
      const response = await fetch(url, { redirect: "error" });
      if (!response.ok) throw new CmsRepositoryError("MEDIA_VERIFY_FAILED", "The uploaded image could not be verified.", 422);
      let image;
      try {
        image = await validateImageBuffer(await response.arrayBuffer(), response.headers.get("content-type")?.split(";")[0] ?? "");
      } catch {
        throw new CmsRepositoryError("IMAGE_INVALID", "The uploaded image is not an accepted website image.", 422);
      }
      const id = crypto.randomUUID();
      const asset = await createAsset({
        id,
        provider: "vercel_blob",
        providerAssetId: stringValue(input.pathname),
        deliveryUrl: url.toString(),
        originalFilename: stringValue(input.originalFilename).slice(0, 240),
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        width: image.width,
        height: image.height,
        altText: stringValue(input.altText),
        caption: stringValue(input.caption),
        focalX: Number(input.focalX ?? 0.5),
        focalY: Number(input.focalY ?? 0.5),
        decorative: input.decorative === true,
      }, identity.userId, requestId);
      return jsonResponse(asset, requestId, 201);
    }, { methods: ["POST"] });
  },
};
