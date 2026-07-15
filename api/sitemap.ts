import { handleSitemapRequest } from "../server/api-routes/sitemap.js";

export default {
  fetch(request: Request) {
    return handleSitemapRequest(request);
  },
};
