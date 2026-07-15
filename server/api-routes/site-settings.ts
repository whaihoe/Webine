import { getPublishedSiteSettings } from "../public-content.js";
import { getRequestId, jsonResponse } from "../responses.js";

export async function handleSiteSettingsRequest(request: Request) {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  return jsonResponse(await getPublishedSiteSettings(), getRequestId(request));
}
