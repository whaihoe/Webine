import { ClerkProvider, useAuth } from "@clerk/react";
import { useCallback, useMemo } from "react";
import { AdminPage } from "../pages/AdminPage";
import { clerkPublishableKey } from "../config/public-runtime";
import { AdminAuthProvider } from "./AdminAuthContext";

function ClerkAdminBridge() {
  const { getToken, isLoaded, isSignedIn, sessionId } = useAuth();
  const getSessionToken = useCallback(() => getToken(), [getToken]);
  const authValue = useMemo(
    () => ({
      authRevision: isLoaded
        ? `${isSignedIn ? "signed-in" : "signed-out"}:${sessionId ?? "none"}`
        : "loading",
      getToken: getSessionToken,
      ready: isLoaded,
      signedIn: isLoaded ? isSignedIn : null,
    }),
    [getSessionToken, isLoaded, isSignedIn, sessionId],
  );

  return (
    <AdminAuthProvider value={authValue}>
      {isLoaded
        ? <AdminPage />
        : null}
    </AdminAuthProvider>
  );
}

export default function AdminEntry() {
  const publishableKey = clerkPublishableKey();

  return publishableKey
    ? (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkAdminBridge />
      </ClerkProvider>
    )
    : <AdminPage />;
}
