import { routeAdminRequest } from "../server/api-routes/admin.js";
import { handleEnquiryRequest } from "../server/api-routes/enquiries.js";
import { handleLocalMediaUpload } from "./local-media-upload.js";
import { routeMediaRequest } from "../server/api-routes/media.js";

export default {
  fetch(request: Request) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/admin/media/local-upload") return handleLocalMediaUpload(request);
    if (pathname.startsWith("/api/media/")) return routeMediaRequest(request);
    return pathname.startsWith("/api/admin/")
      ? routeAdminRequest(request)
      : handleEnquiryRequest(request);
  },
};
