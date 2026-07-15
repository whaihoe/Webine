import { handleProtectedAdminRequest } from "../../server/admin-handler.js";
import { getDashboard } from "../../server/database.js";
import { jsonResponse } from "../../server/responses.js";

export default {
  fetch(request: Request) {
    return handleProtectedAdminRequest(request, async (_identity, requestId) =>
      jsonResponse(await getDashboard(), requestId));
  },
};
