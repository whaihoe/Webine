import { handleProtectedAdminRequest } from "../../../../../server/admin-handler.js";
import { getItem, updateItem } from "../../../../../server/cms-repository.js";
import { errorResponse, jsonResponse, readJsonRequest } from "../../../../../server/responses.js";

function routeValues(request: Request) {
  const match = new URL(request.url).pathname.match(
    /^\/api\/admin\/collections\/([a-z][a-z0-9_]{1,49})\/items\/([a-zA-Z0-9_-]+)$/,
  );
  return match ? { collectionKey: match[1], itemId: match[2] } : null;
}

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const route = routeValues(request);
      if (!route) {
        return errorResponse(
          { code: "INVALID_ITEM_ROUTE", message: "That item route is invalid." },
          requestId,
          400,
        );
      }

      if (request.method === "PATCH") {
        const item = await updateItem(
          route.collectionKey,
          route.itemId,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(item, requestId);
      }

      const item = await getItem(route.collectionKey, route.itemId);
      return item
        ? jsonResponse(item, requestId)
        : errorResponse(
            { code: "NOT_FOUND", message: "That item does not exist." },
            requestId,
            404,
          );
    }, { methods: ["GET", "PATCH"] });
  },
};
