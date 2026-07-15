import { listPublicProjects } from "../../server/public-content.js";
import { jsonResponse } from "../../server/responses.js";

export default { async fetch(request: Request) {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const featuredOnly = new URL(request.url).searchParams.get("featured") === "true";
  return jsonResponse(await listPublicProjects({ featuredOnly }), crypto.randomUUID());
} };
