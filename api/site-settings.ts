import { getPublishedSiteSettings } from "../server/public-content.js";
import { getRequestId, jsonResponse } from "../server/responses.js";

export default { async fetch(request: Request) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  return jsonResponse(await getPublishedSiteSettings(), getRequestId(request));
} };
