import { restoreRewrittenRequest } from "../server/api-route-request.js";
import { routeProjectRequest } from "../server/api-routes/projects.js";

export default {
  fetch(request: Request) {
    return routeProjectRequest(restoreRewrittenRequest(request, "/api/projects"));
  },
};
