import { handleSiteSettingsRequest } from "../server/api-routes/site-settings.js";

export default {
  fetch(request: Request) {
    return handleSiteSettingsRequest(request);
  },
};
