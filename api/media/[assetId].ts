import { getAssetStorageRecord } from "../../server/media-repository.js";
import { readLocalImage } from "../../server/media-service.js";

export default {
  async fetch(request: Request) {
    const match = new URL(request.url).pathname.match(/^\/api\/media\/([a-zA-Z0-9-]+)$/);
    const asset = match ? await getAssetStorageRecord(match[1]) : null;
    if (!asset || String(asset.status) !== "ready") return new Response("Not found", { status: 404 });
    if (String(asset.provider) !== "external" || process.env.VERCEL === "1") return new Response("Not found", { status: 404 });
    try {
      return new Response(await readLocalImage(String(asset.provider_asset_id)), {
        headers: { "Content-Type": String(asset.mime_type), "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
};
