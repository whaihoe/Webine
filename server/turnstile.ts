import { CmsRepositoryError } from "./cms-repository.js";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResult = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
  "error-codes"?: unknown;
};

export type TurnstileEnvironment = {
  NODE_ENV?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_ALLOWED_HOSTNAMES?: string;
  TURNSTILE_EXPECTED_ACTION?: string;
};

function configuredValues(environment: TurnstileEnvironment) {
  return {
    secret: environment.TURNSTILE_SECRET_KEY?.trim() ?? "",
    hostnames: new Set(
      (environment.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
    action: environment.TURNSTILE_EXPECTED_ACTION?.trim() ?? "contact_enquiry",
  };
}

export async function verifyTurnstile(
  token: string,
  request: Request,
  environment: TurnstileEnvironment = process.env,
  fetcher: typeof fetch = fetch,
) {
  const configuration = configuredValues(environment);
  const hosted = environment.NODE_ENV === "production";
  if (!configuration.secret || configuration.hostnames.size === 0) {
    if (!hosted) return;
    throw new CmsRepositoryError("TURNSTILE_UNAVAILABLE", "The security check could not be verified.", 503);
  }
  if (!token || token.length > 2048) {
    throw new CmsRepositoryError("TURNSTILE_REQUIRED", "Complete the security check and try again.", 403);
  }

  const remoteAddress = request.headers.get("CF-Connecting-IP")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  try {
    const response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: configuration.secret,
        response: token,
        ...(remoteAddress ? { remoteip: remoteAddress } : {}),
      }),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("siteverify_http_error");
    const result = await response.json() as TurnstileResult;
    const hostname = typeof result.hostname === "string" ? result.hostname.toLowerCase() : "";
    if (result.success !== true) {
      const errors = Array.isArray(result["error-codes"]) ? result["error-codes"] : [];
      if (errors.includes("invalid-input-secret")) {
        throw new CmsRepositoryError("TURNSTILE_UNAVAILABLE", "The security check is temporarily unavailable. Please try again later.", 503);
      }
      throw new Error("siteverify_rejected");
    }
    if (!configuration.hostnames.has(hostname) || result.action !== configuration.action) {
      throw new CmsRepositoryError("TURNSTILE_UNAVAILABLE", "The security check is temporarily unavailable. Please try again later.", 503);
    }
  } catch (error) {
    if (error instanceof CmsRepositoryError) throw error;
    throw new CmsRepositoryError("TURNSTILE_INVALID", "The security check could not be verified. Please try again.", 403);
  }
}
