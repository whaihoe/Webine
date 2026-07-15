type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  issues?: Array<{ path: string; code: string; message: string }>;
};

export function getRequestId(request: Request) {
  return request.headers.get("x-vercel-id") ?? crypto.randomUUID();
}

export function jsonResponse(data: unknown, requestId: string, status = 200) {
  return Response.json(
    { data, error: null, meta: { requestId } },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export function errorResponse(
  error: ApiError,
  requestId: string,
  status: number,
) {
  return Response.json(
    { data: null, error, meta: { requestId } },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export async function readJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new RequestBodyError("CONTENT_TYPE_REQUIRED", "Send a JSON request body.", 415);
  }

  if (contentLength > 1_000_000) {
    throw new RequestBodyError("REQUEST_TOO_LARGE", "The request body is too large.", 413);
  }

  try {
    return await request.json() as unknown;
  } catch {
    throw new RequestBodyError("INVALID_JSON", "The request body is not valid JSON.", 400);
  }
}

export class RequestBodyError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "RequestBodyError";
    this.code = code;
    this.status = status;
  }
}
