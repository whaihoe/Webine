import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { createCollection } from "../../../server/cms-repository.js";
import { listCollections } from "../../../server/database.js";
import { jsonResponse, readJsonRequest } from "../../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) => {
      if (request.method === "POST") {
        const collection = await createCollection(
          await readJsonRequest(request),
          identity.userId,
          requestId,
        );
        return jsonResponse(collection, requestId, 201);
      }

      return jsonResponse(await listCollections(), requestId);
    }, { methods: ["GET", "POST"] });
  },
};
