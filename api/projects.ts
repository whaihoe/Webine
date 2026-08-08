import { restoreRewrittenRequest } from "../server/api-route-request.js";
import {
  routeProjectDocumentRequest,
  routeProjectRequest,
} from "../server/api-routes/projects.js";

export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    const documentSlug = url.searchParams.get("__webine_document");
    if (documentSlug !== null) {
      url.searchParams.delete("__webine_document");
      return routeProjectDocumentRequest(new Request(url, request), documentSlug);
    }
    return routeProjectRequest(restoreRewrittenRequest(request, "/api/projects"));
  },
};
