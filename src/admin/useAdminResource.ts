import { useCallback, useEffect, useState } from "react";
import { AdminApiError, fetchAdminResource } from "./api";

type ResourceState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: null; error: AdminApiError };

export function useAdminResource<T>(path: string) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<ResourceState<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    fetchAdminResource<T>(path, controller.signal)
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
  }, [path, requestKey]);

  const retry = useCallback(() => {
    setRequestKey((value) => value + 1);
  }, []);

  return { ...state, retry };
}
