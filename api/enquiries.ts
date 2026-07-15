import { handleEnquiryRequest } from "../server/api-routes/enquiries.js";

export default {
  fetch(request: Request) {
    return handleEnquiryRequest(request);
  },
};
