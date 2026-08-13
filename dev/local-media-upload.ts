import { handleProtectedAdminRequest } from "../server/admin-handler.js";
import { CmsRepositoryError } from "../server/cms-repository.js";
import { createAsset } from "../server/media-repository.js";
import { storeLocalMedia, validateMediaBuffer } from "../server/media-service.js";
import { jsonResponse } from "../server/responses.js";

function value(form: FormData, key: string) {
  const candidate = form.get(key);
  return typeof candidate === "string" ? candidate : "";
}

export async function handleLocalMediaUpload(request: Request) {
  return handleProtectedAdminRequest(request, async (identity, requestId) => {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new CmsRepositoryError("MEDIA_REQUIRED", "Choose an image or MP4 video to upload.", 422);
    const decorative = value(form, "decorative") === "true";
    if (!decorative && !value(form, "altText").trim()) throw new CmsRepositoryError("ALT_TEXT_REQUIRED", "Describe the image or mark it as decorative.", 422);
    let media;
    try { media = await validateMediaBuffer(await file.arrayBuffer(), file.type); }
    catch { throw new CmsRepositoryError("MEDIA_INVALID", "Use a supported image up to 15 MB or MP4 up to 30 MB.", 422); }
    const id = crypto.randomUUID();
    const providerAssetId = await storeLocalMedia(id, media);
    const asset = await createAsset({
      id, provider: "external", providerAssetId, deliveryUrl: `/api/media/${id}`,
      originalFilename: file.name.slice(0, 240), mimeType: media.mimeType,
      byteSize: media.byteSize, width: media.width, height: media.height,
      altText: value(form, "altText"), caption: value(form, "caption"),
      focalX: Number(value(form, "focalX") || 0.5), focalY: Number(value(form, "focalY") || 0.5), decorative,
    }, identity.userId, requestId);
    return jsonResponse(asset, requestId, 201);
  }, { methods: ["POST"] });
}
