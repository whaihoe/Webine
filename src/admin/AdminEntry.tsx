import { ClerkProvider, useAuth } from "@clerk/react";
import { useCallback, useMemo } from "react";
import { AdminPage } from "../pages/AdminPage";
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
        : <main className="admin-entry-state theme-light">Loading Admin…</main>}
    </AdminAuthProvider>
  );
}

export default function AdminEntry() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return publishableKey
    ? (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkAdminBridge />
      </ClerkProvider>
    )
    : <AdminPage />;
}
