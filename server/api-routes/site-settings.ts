import { getPublishedSiteSettings } from "../public-content.js";
import { errorResponse, getRequestId, jsonResponse } from "../responses.js";
import { assertQueryContract, methodNotAllowed, RequestContractError, withoutBodyForHead } from "../request-contract.js";

const noQuery = new Map<string, (value: string) => boolean>();

export async function handleSiteSettingsRequest(
  request: Request,
  loadSettings: typeof getPublishedSiteSettings = getPublishedSiteSettings,
) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(request, ["GET", "HEAD"]);
  }

  try {
    assertQueryContract(new URL(request.url), noQuery);
    return withoutBodyForHead(request, jsonResponse(
      await loadSettings(),
      getRequestId(request),
      200,
      {
        browser: "public, max-age=60",
        cdn: "public, s-maxage=300, stale-while-revalidate=3600",
        vercel: "public, s-maxage=300, stale-while-revalidate=3600",
      },
    ));
  } catch (error) {
    if (error instanceof RequestContractError) {
      return errorResponse({ code: error.code, message: error.message }, getRequestId(request), error.status);
    }
    throw error;
  }
}
