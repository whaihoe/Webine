import { createContext, useContext, type ReactNode } from "react";

export type AdminTokenProvider = () => Promise<string | null>;

type AdminAuthContextValue = {
  authRevision: string;
  getToken?: AdminTokenProvider;
  ready: boolean;
  signedIn: boolean | null;
};

const localAdminAuth: AdminAuthContextValue = {
  authRevision: "local",
  ready: true,
  signedIn: null,
};

const AdminAuthContext = createContext<AdminAuthContextValue>(localAdminAuth);

export function AdminAuthProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AdminAuthContextValue;
}) {
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
