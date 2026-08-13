import { useEffect, useState } from "react";
import type { PublicProject } from "../content/public-projects";
import { loadPublicSnapshot } from "../content/public-snapshot";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; projects: PublicProject[] };

export function usePublicProjects(featuredOnly = false) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    setState({ status: "loading" });
    let mounted = true;
    loadPublicSnapshot(attempt > 0)
      .then((snapshot) => {
        if (mounted) setState({ status: "ready", projects: featuredOnly ? snapshot.projects.filter((project) => project.featured) : snapshot.projects });
      })
      .catch((error: unknown) => {
        if (mounted) {
          setState({
            status: "error",
            message: error instanceof Error
              ? error.message
              : "Projects could not be loaded.",
          });
        }
      });
    return () => { mounted = false; };
  }, [attempt, featuredOnly]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
