import { handleProtectedAdminRequest } from "../../server/admin-handler.js";
import { getItem } from "../../server/cms-repository.js";
import { listAssets } from "../../server/media-repository.js";
import { errorResponse, jsonResponse } from "../../server/responses.js";

export default { fetch(request: Request) {
  return handleProtectedAdminRequest(request, async (_identity, requestId) => {
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection") ?? "";
    const id = url.searchParams.get("id") ?? "";
    if (!/^[a-z][a-z0-9_]{1,49}$/.test(collection) || !/^[a-zA-Z0-9_-]+$/.test(id)) return errorResponse({ code: "INVALID_PREVIEW", message: "That preview address is invalid." }, requestId, 400);
    const item = await getItem(collection, id);
    return item ? jsonResponse({ collection, item, assets: await listAssets() }, requestId) : errorResponse({ code: "NOT_FOUND", message: "That draft does not exist." }, requestId, 404);
  });
} };
