import { handleProtectedAdminRequest } from "../../../server/admin-handler.js";
import { listEnquiries } from "../../../server/enquiry-service.js";
import { jsonResponse } from "../../../server/responses.js";

export default { fetch(request: Request) { return handleProtectedAdminRequest(request, async (_identity, requestId) => jsonResponse(await listEnquiries(), requestId)); } };
