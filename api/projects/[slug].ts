import { getPublicProject } from "../../server/public-content.js";
import { errorResponse, jsonResponse } from "../../server/responses.js";

export default { async fetch(request: Request) {
  const requestId = crypto.randomUUID();
  const match = new URL(request.url).pathname.match(/^\/api\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  if (!match) return errorResponse({ code: "INVALID_SLUG", message: "That project address is invalid." }, requestId, 400);
  const project = await getPublicProject(match[1]);
  return project ? jsonResponse(project, requestId) : errorResponse({ code: "NOT_FOUND", message: "That project is not published." }, requestId, 404);
} };
