import { handleProtectedAdminRequest } from "../../../../server/admin-handler.js";
import { retryEnquiryNotification } from "../../../../server/enquiry-service.js";
import { errorResponse, jsonResponse } from "../../../../server/responses.js";

export default { fetch(request: Request) { return handleProtectedAdminRequest(request, async (_identity, requestId) => {
  const match = new URL(request.url).pathname.match(/^\/api\/admin\/enquiries\/([a-zA-Z0-9-]+)\/retry$/);
  return match ? jsonResponse(await retryEnquiryNotification(match[1]), requestId) : errorResponse({ code: "INVALID_ENQUIRY_ID", message: "That enquiry ID is invalid." }, requestId, 400);
}, { methods: ["POST"] }); } };
