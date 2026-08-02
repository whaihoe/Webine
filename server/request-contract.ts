import { errorResponse, getRequestId } from "./responses.js";

export class RequestContractError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "RequestContractError";
  }
}

export function assertQueryContract(
  url: URL,
  rules: ReadonlyMap<string, (value: string) => boolean>,
  maximumLength = 256,
) {
  if (url.search.length > maximumLength) {
    throw new RequestContractError("QUERY_TOO_LONG", "The query string is not supported.", 400);
  }

  const counts = new Map<string, number>();
  for (const [key, value] of url.searchParams) {
    const validate = rules.get(key);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (!validate || !validate(value) || counts.get(key)! > 1) {
      throw new RequestContractError("QUERY_INVALID", "The query string is not supported.", 400);
    }
  }
}

export function methodNotAllowed(request: Request, methods: string[]) {
  return errorResponse(
    { code: "METHOD_NOT_ALLOWED", message: "That request method is not supported." },
    getRequestId(request),
    405,
    { Allow: methods.join(", ") },
  );
}

export function withoutBodyForHead(request: Request, response: Response) {
  return request.method === "HEAD"
    ? new Response(null, { status: response.status, headers: response.headers })
    : response;
}
