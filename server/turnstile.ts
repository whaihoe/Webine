import { CmsRepositoryError } from "./cms-repository.js";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResult = {
  success?: unknown;
  hostname?: unknown;
  action?: unknown;
};

function configuredValues(environment: NodeJS.ProcessEnv) {
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
  environment: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
) {
  const configuration = configuredValues(environment);
  const hosted = environment.VERCEL === "1" || environment.NODE_ENV === "production";
  if (!configuration.secret || configuration.hostnames.size === 0) {
    if (!hosted) return;
    throw new CmsRepositoryError("TURNSTILE_UNAVAILABLE", "The security check could not be verified.", 503);
  }
  if (!token || token.length > 2048) {
    throw new CmsRepositoryError("TURNSTILE_REQUIRED", "Complete the security check and try again.", 403);
  }

  const remoteAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim();
  try {
    const response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: configuration.secret,
        response: token,
        ...(remoteAddress ? { remoteip: remoteAddress } : {}),
        idempotency_key: crypto.randomUUID(),
      }),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("siteverify_http_error");
    const result = await response.json() as TurnstileResult;
    const hostname = typeof result.hostname === "string" ? result.hostname.toLowerCase() : "";
    if (
      result.success !== true
      || !configuration.hostnames.has(hostname)
      || result.action !== configuration.action
    ) {
      throw new Error("siteverify_rejected");
    }
  } catch {
    throw new CmsRepositoryError("TURNSTILE_INVALID", "The security check could not be verified. Please try again.", 403);
  }
}
