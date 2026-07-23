import { useEffect, useState } from "react";
import type { ApiEnvelope } from "../content/api-envelope";
import type { PublicProject } from "../content/public-projects";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; projects: PublicProject[] };

export function usePublicProjects(featuredOnly = false) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`/api/projects${featuredOnly ? "?featured=true" : ""}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const envelope = await response.json() as ApiEnvelope<PublicProject[]>;
        if (!response.ok || !envelope.data) {
          throw new Error(
            envelope.error?.message ?? "Projects could not be loaded.",
          );
        }
        setState({ status: "ready", projects: envelope.data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            message: error instanceof Error
              ? error.message
              : "Projects could not be loaded.",
          });
        }
      });
    return () => controller.abort();
  }, [attempt, featuredOnly]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
