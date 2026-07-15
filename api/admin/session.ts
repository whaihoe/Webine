import { handleProtectedAdminRequest } from "../../server/admin-handler.js";
import { jsonResponse } from "../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (identity, requestId) =>
      jsonResponse({ label: identity.label }, requestId));
  },
};
