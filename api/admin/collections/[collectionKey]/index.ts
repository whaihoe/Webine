import { handleProtectedAdminRequest } from "../../../../server/admin-handler.js";
import {
  getCollectionDefinition,
  updateCollection,
} from "../../../../server/cms-repository.js";
import { errorResponse, jsonResponse, readJsonRequest } from "../../../../server/responses.js";

function collectionKeyFromRequest(request: Request) {
  const match = new URL(request.url).pathname.match(
    /^\/api\/admin\/collections\/([a-z][a-z0-9_]{1,49})$/,
  );
  return match?.[1] ?? null;
}

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      const collectionKey = collectionKeyFromRequest(request);
      if (!collectionKey) {
        return errorResponse(
          { code: "INVALID_COLLECTION_KEY", message: "That collection key is invalid." },
          requestId,
          400,
        );
      }

      if (request.method === "PATCH") {
        const collection = await updateCollection(
          collectionKey,
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(collection, requestId);
      }

      const collection = await getCollectionDefinition(collectionKey);
      return collection
        ? jsonResponse(collection, requestId)
        : errorResponse(
            { code: "NOT_FOUND", message: "That collection does not exist." },
            requestId,
            404,
          );
    }, { methods: ["GET", "PATCH"] });
  },
};
