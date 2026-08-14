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

function errorCodes(result: TurnstileResult) {
  if (!Array.isArray(result["error-codes"])) return [];
  return result["error-codes"].filter((value): value is string => typeof value === "string");
}

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

export async function verifyTurnstile(
  token: string,
  request: Request,
  environment: TurnstileEnvironment = process.env,
  fetcher: typeof fetch = fetch,
) {
  const configuration = configuredValues(environment);

  // Match Cloudflare Spin's fail-closed preflight: only a non-empty token of
  // the documented maximum size and a configured production hostname set may
  // proceed. The secret itself is intentionally sent to Siteverify even when
  // missing so Cloudflare can return the canonical error code and the request
  // is visible in Turnstile token-validation analytics.
  if (!token || token.length > 2048) {
    throw new CmsRepositoryError("TURNSTILE_REQUIRED", "Complete the security check and try again.", 403);
  }
  if (configuration.hostnames.size === 0) {
    console.error("Turnstile configuration error", {
      hasSecret: Boolean(configuration.secret),
      hostnameCount: 0,
      expectedAction: configuration.action,
    });
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        secret: configuration.secret,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") ?? "",
      }),
    });
  } catch (error) {
    console.error("Turnstile Siteverify request failed", {
      error: safeErrorMessage(error),
      hasSecret: Boolean(configuration.secret),
      hostnameCount: configuration.hostnames.size,
      expectedAction: configuration.action,
    });
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (!response.ok) {
    console.error("Turnstile Siteverify returned a non-success HTTP status", {
      status: response.status,
    });
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  let result: TurnstileResult;
  try {
    result = await response.json() as TurnstileResult;
  } catch (error) {
    console.error("Turnstile Siteverify returned invalid JSON", {
      error: safeErrorMessage(error),
    });
    throw new CmsRepositoryError(
      "TURNSTILE_UNAVAILABLE",
      "The security check is temporarily unavailable. Please try again later.",
      503,
    );
  }

  if (result.success !== true) {
    const errors = errorCodes(result);
    console.error("Turnstile Siteverify rejected token", {
      errorCodes: errors,
      hasSecret: Boolean(configuration.secret),
    });

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
  const action = typeof result.action === "string" ? result.action : "";
  if (!configuration.hostnames.has(hostname) || action !== configuration.action) {
    console.error("Turnstile Siteverify metadata mismatch", {
      hostname,
      action,
      expectedHostnames: [...configuration.hostnames],
      expectedAction: configuration.action,
    });
    throw new CmsRepositoryError("TURNSTILE_INVALID", "The security check could not be verified. Please try again.", 403);
  }
}
