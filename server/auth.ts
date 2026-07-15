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

export async function authenticateAdminRequest(
  request: Request,
  environment: AdminAccessEnvironment = process.env,
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

  try {
    const clerk = createClerkClient({
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
  } catch {
    return {
      ok: false,
      code: "ADMIN_SESSION_INVALID",
      message: "The Admin session could not be verified.",
      status: 401,
    };
  }
}
