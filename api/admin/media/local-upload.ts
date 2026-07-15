import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { CmsRepositoryError } from "../../../server/cms-repository.js";
import { createAsset } from "../../../server/media-repository.js";
import { storeLocalImage, validateImageBuffer } from "../../../server/media-service.js";
import { jsonResponse } from "../../../server/responses.js";

function formString(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
        throw new CmsRepositoryError("LOCAL_UPLOAD_DISABLED", "Use the configured Vercel media store.", 404);
      }
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw new CmsRepositoryError("IMAGE_REQUIRED", "Choose an image to upload.", 422);
      const decorative = formString(form, "decorative") === "true";
      if (!decorative && !formString(form, "altText").trim()) throw new CmsRepositoryError("ALT_TEXT_REQUIRED", "Describe the image or mark it as decorative.", 422);
      let image;
      try {
        image = await validateImageBuffer(await file.arrayBuffer(), file.type);
      } catch {
        throw new CmsRepositoryError("IMAGE_INVALID", "Use a JPEG, PNG, WebP or AVIF under 20 MB and 12,000 pixels per side.", 422);
      }
      const id = crypto.randomUUID();
      const providerAssetId = await storeLocalImage(id, image);
      const asset = await createAsset({
        id,
        provider: "external",
        providerAssetId,
        deliveryUrl: `/api/media/${id}`,
        originalFilename: file.name.slice(0, 240),
        mimeType: image.mimeType,
        byteSize: image.byteSize,
        width: image.width,
        height: image.height,
        altText: formString(form, "altText"),
        caption: formString(form, "caption"),
        focalX: Number(formString(form, "focalX") || 0.5),
        focalY: Number(formString(form, "focalY") || 0.5),
        decorative,
      }, identity.userId, requestId);
      return jsonResponse(asset, requestId, 201);
    }, { methods: ["POST"] });
  },
};
