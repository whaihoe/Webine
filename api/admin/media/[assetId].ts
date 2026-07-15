import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { archiveAsset, updateAsset } from "../../../server/media-repository.js";
import { errorResponse, jsonResponse, readJsonRequest } from "../../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const match = new URL(request.url).pathname.match(/^\/api\/admin\/media\/([a-zA-Z0-9-]+)$/);
      if (!match) return errorResponse({ code: "INVALID_ASSET_ID", message: "That media ID is invalid." }, requestId, 400);
      const result = request.method === "DELETE"
        ? await archiveAsset(match[1], identity.userId, requestId)
        : await updateAsset(match[1], await readJsonRequest(request), identity.userId, requestId);
      return jsonResponse(result, requestId);
    }, { methods: ["PATCH", "DELETE"] });
  },
};
