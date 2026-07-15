import { getAssetStorageRecord } from "../media-repository.js";
import { readLocalImage } from "../media-service.js";

const mediaRoute = /^\/api\/media\/([a-zA-Z0-9-]+)\/?$/;

export async function routeMediaRequest(request: Request) {
  const match = new URL(request.url).pathname.match(mediaRoute);
  const asset = match ? await getAssetStorageRecord(match[1]) : null;

  if (!asset || String(asset.status) !== "ready") {
    return new Response("Not found", { status: 404 });
  }

  if (String(asset.provider) !== "external" || process.env.VERCEL === "1") {
    return new Response("Not found", { status: 404 });
  }

  try {
    return new Response(
      request.method === "HEAD"
        ? null
        : await readLocalImage(String(asset.provider_asset_id)),
      {
        headers: {
          "Content-Type": String(asset.mime_type),
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
