import { CmsRepositoryError } from "./cms-repository.js";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const CONFIGURATION_ERROR_CODES = new Set([
  "missing-input-secret",
  "invalid-input-secret",
  "bad-request",
  "internal-error",
]);

type TurnstileResult = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
  "error-codes"?: unknown;
};

export type TurnstileEnvironment = {
  NODE_ENV?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
};

function configuredValues(environment: TurnstileEnvironment) {
  return {
    secret: environment.TURNSTILE_SECRET?.trim() ?? "",
    hostnames: new Set(
      (environment.TURNSTILE_HOSTNAMES ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
    action: environment.TURNSTILE_EXPECTED_ACTION?.trim() ?? "contact_enquiry",
  };
}

function isLocalDevelopmentRequest(request: Request, environment: TurnstileEnvironment) {
  if (environment.NODE_ENV === "production") return false;
  const hostname = new URL(request.url).hostname.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function errorCodes(result: TurnstileResult) {
  if (!Array.isArray(result["error-codes"])) return [];
  return result["error-codes"].filter((value): value is string => typeof value === "string");
}

export async function verifyTurnstile(
  token: string,
  request: Request,
  environment: TurnstileEnvironment = process.env,
  fetcher: typeof fetch = fetch,
) {
  const configuration = configuredValues(environment);

  if (!configuration.secret || configuration.hostnames.size === 0) {
    // Local Vite development can run without a production secret. Deployed
    // requests must always fail closed, including Workers where NODE_ENV is
    // commonly unset.
    if (isLocalDevelopmentRequest(request, environment)) return;
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (!token || token.length > 2048) {
    throw new CmsRepositoryError("TURNSTILE_REQUIRED", "Complete the security check and try again.", 403);
  }

  const remoteAddress = request.headers.get("CF-Connecting-IP")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();

  let response: Response;
  try {
    response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: configuration.secret,
        response: token,
        ...(remoteAddress ? { remoteip: remoteAddress } : {}),
      }),
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (!response.ok) {
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  let result: TurnstileResult;
  try {
    result = await response.json() as TurnstileResult;
  } catch {
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (result.success !== true) {
    const errors = errorCodes(result);

    if (errors.some((code) => CONFIGURATION_ERROR_CODES.has(code))) {
      throw new CmsRepositoryError(
        "TURNSTILE_UNAVAILABLE",
        "The security check is temporarily unavailable. Please try again later.",
        503,
      );
    }

    if (errors.includes("missing-input-response")) {
      throw new CmsRepositoryError("TURNSTILE_REQUIRED", "Complete the security check and try again.", 403);
    }

    if (errors.includes("timeout-or-duplicate")) {
      throw new CmsRepositoryError("TURNSTILE_EXPIRED", "The security check expired. Please try again.", 403);
    }

    throw new CmsRepositoryError("TURNSTILE_INVALID", "The security check could not be verified. Please try again.", 403);
  }

  const hostname = typeof result.hostname === "string" ? result.hostname.toLowerCase() : "";
  if (!configuration.hostnames.has(hostname) || result.action !== configuration.action) {
    throw new CmsRepositoryError("TURNSTILE_INVALID", "The security check could not be verified. Please try again.", 403);
  }
}
