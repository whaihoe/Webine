import { createClerkClient } from "@clerk/backend";
import {
  resolveAdminAccessConfiguration,
  type AdminAccessEnvironment,
} from "./admin-access-policy.js";

export type AdminIdentity = {
  label: string;
  userId: string;
};

export type AdminAuthenticationResult =
  | { ok: true; identity: AdminIdentity }
  | { ok: false; code: string; message: string; status: 401 | 403 | 503 };

export function hasAdminCredentialCarrier(request: Request) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  if (/^Bearer\s+\S+$/i.test(authorization)) return true;
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").some((part) => {
    const name = part.split("=", 1)[0]?.trim();
    return name === "__session" || name?.startsWith("__clerk_");
  });
}

export async function authenticateAdminRequest(
  request: Request,
  environment: AdminAccessEnvironment = process.env,
  clerkFactory: typeof createClerkClient = createClerkClient,
): Promise<AdminAuthenticationResult> {
  const configuration = resolveAdminAccessConfiguration(environment);

  if (configuration.mode === "local") {
    return {
      ok: true,
      identity: {
        label: configuration.identityLabel,
        userId: configuration.userId,
      },
    };
  }

  if (configuration.mode === "invalid") {
    return {
      ok: false,
      code: "ADMIN_AUTH_NOT_CONFIGURED",
      message: "Admin authentication is not configured.",
      status: 503,
    };
  }

  if (!hasAdminCredentialCarrier(request)) {
    return {
      ok: false,
      code: "ADMIN_SIGN_IN_REQUIRED",
      message: "Sign in to access Webine Admin.",
      status: 401,
    };
  }

  const requestOrigin = new URL(request.url).origin;

  if (!configuration.authorisedParties.includes(requestOrigin)) {
    return {
      ok: false,
      code: "ADMIN_ORIGIN_NOT_ALLOWED",
      message: "This Webine origin is not approved for Admin authentication.",
      status: 403,
    };
  }

  try {
    const clerk = clerkFactory({
      publishableKey: configuration.publishableKey,
      secretKey: configuration.secretKey,
    });
    const state = await clerk.authenticateRequest(request, {
      acceptsToken: "session_token",
      authorizedParties: configuration.authorisedParties,
    });

    if (!state.isAuthenticated) {
      return {
        ok: false,
        code: "ADMIN_SIGN_IN_REQUIRED",
        message: "Sign in to access Webine Admin.",
        status: 401,
      };
    }

    const auth = state.toAuth();

    if (auth.userId !== configuration.userId) {
      return {
        ok: false,
        code: "ADMIN_NOT_ALLOWED",
        message: "This account is not allowed to access Webine Admin.",
        status: 403,
      };
    }

    return {
      ok: true,
      identity: { label: "Webine owner", userId: auth.userId },
    };
  } catch (error) {
    console.warn("Clerk Admin authentication failed", {
      origin: requestOrigin,
      error: error instanceof Error ? error.message : "Unknown Clerk error",
    });

    return {
      ok: false,
      code: "ADMIN_SESSION_INVALID",
      message: "The Admin session could not be verified.",
      status: 401,
    };
  }
}
