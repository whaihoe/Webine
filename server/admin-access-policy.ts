export type AdminAccessEnvironment = {
  ADMIN_DEV_BYPASS?: string;
  ADMIN_DEV_LABEL?: string;
  ADMIN_USER_ID?: string;
  CLERK_AUTHORIZED_PARTIES?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  NODE_ENV?: string;
  VERCEL?: string;
};

export type AdminAccessConfiguration =
  | { mode: "local"; identityLabel: string; userId: "local-owner" }
  | {
      mode: "clerk";
      authorisedParties: string[];
      publishableKey: string;
      secretKey: string;
      userId: string;
    }
  | { mode: "invalid"; missing: string[] };


function normaliseAuthorisedParties(value: string) {
  return [...new Set(
    value
      .split(",")
      .map((party) => party.trim())
      .filter(Boolean)
      .map((party) => {
        try {
          return new URL(party).origin;
        } catch {
          return party.replace(/\/+$/, "");
        }
      }),
  )];
}

export function resolveAdminAccessConfiguration(
  environment: AdminAccessEnvironment,
): AdminAccessConfiguration {
  const isLocalRuntime = environment.VERCEL !== "1" &&
    environment.NODE_ENV !== "production";

  if (isLocalRuntime && environment.ADMIN_DEV_BYPASS === "true") {
    return {
      mode: "local",
      identityLabel: environment.ADMIN_DEV_LABEL?.trim() || "Local Webine owner",
      userId: "local-owner",
    };
  }

  const required = [
    "ADMIN_USER_ID",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_AUTHORIZED_PARTIES",
  ] as const;
  const missing = required.filter((key) => !environment[key]?.trim());

  if (missing.length > 0) {
    return { mode: "invalid", missing: [...missing] };
  }

  return {
    mode: "clerk",
    userId: environment.ADMIN_USER_ID!.trim(),
    publishableKey: environment.CLERK_PUBLISHABLE_KEY!.trim(),
    secretKey: environment.CLERK_SECRET_KEY!.trim(),
    authorisedParties: normaliseAuthorisedParties(
      environment.CLERK_AUTHORIZED_PARTIES!,
    ),
  };
}
