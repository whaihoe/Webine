import { restoreRewrittenRequest } from "../server/api-route-request.js";
import { routeAdminRequest } from "../server/api-routes/admin.js";

export default {
  fetch(request: Request) {
    return routeAdminRequest(restoreRewrittenRequest(request, "/api/admin"));
  },
};
