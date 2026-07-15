import { useCallback, useEffect, useState } from "react";
import { AdminApiError, fetchAdminResource } from "./api";
import { useAdminAuth } from "./AdminAuthContext";

type ResourceState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: null; error: AdminApiError };

export function useAdminResource<T>(path: string) {
  const { authRevision, getToken, ready } = useAdminAuth();
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    if (!ready) {
      return () => controller.abort();
    }

    fetchAdminResource<T>(path, controller.signal, getToken)
      .then((data) => {
        setState({ status: "ready", data, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const adminError = error instanceof AdminApiError
          ? error
          : new AdminApiError(
              500,
              "ADMIN_REQUEST_FAILED",
              "The Admin request could not be completed.",
            );
        setState({ status: "error", data: null, error: adminError });
      });

    return () => controller.abort();
  }, [authRevision, getToken, path, ready, requestKey]);

  const retry = useCallback(() => {
    setRequestKey((value) => value + 1);
  }, []);

  return { ...state, retry };
}
