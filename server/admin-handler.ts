import { authenticateAdminRequest, type AdminIdentity } from "./auth.js";
import { CmsRepositoryError } from "./cms-repository.js";
import { errorResponse, getRequestId, RequestBodyError } from "./responses.js";

type ProtectedRequestOptions = {
  methods?: string[];
};

export async function handleProtectedAdminRequest(
  request: Request,
  operation: (identity: AdminIdentity, requestId: string) => Promise<Response>,
  options: ProtectedRequestOptions = {},
) {
  const requestId = getRequestId(request);
  const methods = options.methods ?? ["GET"];

  if (!methods.includes(request.method)) {
    return errorResponse(
      { code: "METHOD_NOT_ALLOWED", message: "This Admin action is not available yet." },
      requestId,
      405,
    );
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const requestOrigin = new URL(request.url).origin;

    if (!origin || origin !== requestOrigin) {
      return errorResponse(
        { code: "ORIGIN_NOT_ALLOWED", message: "The request origin could not be verified." },
        requestId,
        403,
      );
    }
  }

  const authentication = await authenticateAdminRequest(request);

  if (!authentication.ok) {
    return errorResponse(
      { code: authentication.code, message: authentication.message },
      requestId,
      authentication.status,
    );
  }

  try {
    return await operation(authentication.identity, requestId);
  } catch (error) {
    if (error instanceof CmsRepositoryError) {
      return errorResponse(
        { code: error.code, message: error.message, issues: error.issues },
        requestId,
        error.status,
      );
    }

    if (error instanceof RequestBodyError) {
      return errorResponse(
        { code: error.code, message: error.message },
        requestId,
        error.status,
      );
    }

    console.error("Admin API request failed", { requestId, error });
    return errorResponse(
      { code: "ADMIN_REQUEST_FAILED", message: "The Admin request could not be completed." },
      requestId,
      500,
    );
  }
}
