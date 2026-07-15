import { handleRobotsRequest } from "../server/api-routes/robots.js";

export default {
  fetch(request: Request) {
    return handleRobotsRequest(request);
  },
};
