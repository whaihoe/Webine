import { ClerkProvider } from "@clerk/react";
import { AdminPage } from "../pages/AdminPage";

export default function AdminEntry() {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return publishableKey
    ? <ClerkProvider publishableKey={publishableKey}><AdminPage /></ClerkProvider>
    : <AdminPage />;
}
