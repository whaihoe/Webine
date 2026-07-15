import { restoreRewrittenRequest } from "../server/api-route-request.js";
import { routeMediaRequest } from "../server/api-routes/media.js";

export default {
  fetch(request: Request) {
    return routeMediaRequest(restoreRewrittenRequest(request, "/api/media"));
  },
};
