import { useCallback } from "react";
import { mutateAdminResource } from "./api";
import { useAdminAuth } from "./AdminAuthContext";

export function useAdminMutation() {
  const { getToken } = useAdminAuth();

  return useCallback(
    <T,>(
      path: string,
      method: "POST" | "PATCH" | "DELETE",
      body: unknown,
    ) => mutateAdminResource<T>(path, method, body, getToken),
    [getToken],
  );
}
