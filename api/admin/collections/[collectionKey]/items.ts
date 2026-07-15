import { handleProtectedAdminRequest } from "../../../../server/admin-handler.js";
import { createItem } from "../../../../server/cms-repository.js";
import { listCollectionItems } from "../../../../server/database.js";
import { errorResponse, jsonResponse, readJsonRequest } from "../../../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const pathname = new URL(request.url).pathname;
      const match = pathname.match(
        /^\/api\/admin\/collections\/([a-z][a-z0-9_]{1,49})\/items$/,
      );

      if (!match) {
        return errorResponse(
          { code: "INVALID_COLLECTION_KEY", message: "That collection key is invalid." },
          requestId,
          400,
        );
      }

      if (request.method === "POST") {
        const item = await createItem(
          match[1],
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(item, requestId, 201);
      }

      const items = await listCollectionItems(match[1]);

      return items
        ? jsonResponse(items, requestId)
        : errorResponse(
            { code: "NOT_FOUND", message: "That collection does not exist." },
            requestId,
            404,
          );
    }, { methods: ["GET", "POST"] });
  },
};
