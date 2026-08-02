import { routeMediaRequest } from "../server/api-routes/media.js";

export default {
  fetch(request: Request) {
    return routeMediaRequest(request);
  },
};
