type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  issues?: Array<{ path: string; code: string; message: string }>;
};

export function getRequestId(request: Request) {
  return request.headers.get("cf-ray") ?? crypto.randomUUID();
}

export function jsonResponse(
  data: unknown,
  requestId: string,
  status = 200,
  cacheControl: string | {
    browser: string;
    cdn?: string;
    edge?: string;
  } = "private, no-store",
) {
  const cacheHeaders = typeof cacheControl === "string"
    ? { "Cache-Control": cacheControl }
    : {
        "Cache-Control": cacheControl.browser,
        ...(cacheControl.cdn ? { "CDN-Cache-Control": cacheControl.cdn } : {}),
        ...(cacheControl.edge ? { "CDN-Cache-Control": cacheControl.edge } : {}),
      };
  return Response.json(
    { data, error: null, meta: { requestId } },
    {
      status,
      headers: {
        ...cacheHeaders,
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
      },
    },
  );
}

export function errorResponse(
  error: ApiError,
  requestId: string,
  status: number,
  additionalHeaders: Record<string, string> = {},
) {
  return Response.json(
    { data: null, error, meta: { requestId } },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Request-Id": requestId,
        ...additionalHeaders,
      },
    },
  );
}

export async function readJsonRequest(request: Request, maximumBytes = 256_000) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader === null
    ? null
    : Number(contentLengthHeader);

  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new RequestBodyError("CONTENT_TYPE_REQUIRED", "Send a JSON request body.", 415);
  }

  if (
    contentLength !== null
    && (!Number.isInteger(contentLength) || contentLength < 0)
  ) {
    throw new RequestBodyError("CONTENT_LENGTH_INVALID", "The request body length is invalid.", 400);
  }

  if (contentLength !== null && contentLength > maximumBytes) {
    throw new RequestBodyError("REQUEST_TOO_LARGE", "The request body is too large.", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new RequestBodyError("EMPTY_BODY", "Send a JSON request body.", 400);
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;
  let finished = false;
  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) {
        finished = true;
        continue;
      }
      receivedBytes += value.byteLength;
      if (receivedBytes > maximumBytes) {
        await reader.cancel();
        throw new RequestBodyError("REQUEST_TOO_LARGE", "The request body is too large.", 413);
      }
      chunks.push(value);
    }
    if (receivedBytes === 0) {
      throw new RequestBodyError("EMPTY_BODY", "Send a JSON request body.", 400);
    }
    const body = new Uint8Array(receivedBytes);
    let offset = 0;
    chunks.forEach((chunk) => {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    });
    return JSON.parse(new TextDecoder().decode(body)) as unknown;
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    if (receivedBytes > maximumBytes) {
      throw new RequestBodyError("REQUEST_TOO_LARGE", "The request body is too large.", 413);
    }
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
