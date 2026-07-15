import { handleProtectedAdminRequest } from "../../../../../../server/admin-handler.js";
import { changeItemStatus } from "../../../../../../server/cms-repository.js";
import { errorResponse, jsonResponse, readJsonRequest } from "../../../../../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const match = new URL(request.url).pathname.match(/^\/api\/admin\/collections\/([a-z][a-z0-9_]{1,49})\/items\/([a-zA-Z0-9_-]+)\/status$/);
      if (!match) return errorResponse({ code: "INVALID_ITEM_ROUTE", message: "That item route is invalid." }, requestId, 400);
      return jsonResponse(await changeItemStatus(match[1], match[2], await readJsonRequest(request), identity.userId, requestId), requestId);
    }, { methods: ["POST"] });
  },
};
