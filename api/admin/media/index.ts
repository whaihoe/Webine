import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { listAssets } from "../../../server/media-repository.js";
import { jsonResponse } from "../../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (_identity, requestId) =>
      jsonResponse(await listAssets(), requestId));
  },
};
