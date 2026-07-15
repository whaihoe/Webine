import { CmsRepositoryError } from "../cms-repository.js";
import { createEnquiry } from "../enquiry-service.js";
import {
  errorResponse,
  getRequestId,
  jsonResponse,
  readJsonRequest,
  RequestBodyError,
} from "../responses.js";

export async function handleEnquiryRequest(request: Request) {
  const requestId = getRequestId(request);

  if (request.method !== "POST") {
    return errorResponse(
      {
        code: "METHOD_NOT_ALLOWED",
        message: "This endpoint accepts enquiries only.",
      },
      requestId,
      405,
    );
  }

  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return errorResponse(
      {
        code: "ORIGIN_NOT_ALLOWED",
        message: "The request origin could not be verified.",
      },
      requestId,
      403,
    );
  }

  try {
    return jsonResponse(
      await createEnquiry(await readJsonRequest(request), request, requestId),
      requestId,
      201,
    );
  } catch (error) {
    if (error instanceof CmsRepositoryError || error instanceof RequestBodyError) {
      return errorResponse(
        {
          code: error.code,
          message: error.message,
          issues:
            error instanceof CmsRepositoryError ? error.issues : undefined,
        },
        requestId,
        error.status,
      );
    }

    return errorResponse(
      {
        code: "ENQUIRY_FAILED",
        message: "The enquiry could not be submitted. Please try again.",
      },
      requestId,
      500,
    );
  }
}
