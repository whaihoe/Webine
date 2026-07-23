import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { experienceConfig } from "../config/experience";
import { PageLoadContext } from "../loading/page-load-context";
import { preparePageAssets } from "../loading/page-assets";

function useSmoothedProgress(target: number) {
  const [progress, setProgress] = useState(target);
  const liveProgress = useRef(target);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const difference = target - liveProgress.current;
      const smoothing = target === 100 ? 0.24 : 0.12;
      liveProgress.current = Math.abs(difference) < 0.15
        ? target
        : liveProgress.current + difference * smoothing;
      setProgress(liveProgress.current);
      if (liveProgress.current !== target) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);

  return progress;
}

function PageLoadingScreen({
  pathname,
  onClosed,
}: {
  pathname: string;
  onClosed: () => void;
}) {
  const loaderConfig = experienceConfig.pageLoader;
  const [targetProgress, setTargetProgress] = useState(2);
  const [phase, setPhase] = useState<"loading" | "exiting">("loading");
  const progress = useSmoothedProgress(targetProgress);
  const startTime = useRef(performance.now());
  const travelScale = window.innerWidth <= 599 ? 0.035 : 0.07;
  const travel = Math.max(0, (100 - progress) * travelScale);
  const style = {
    "--page-loader-travel": `${travel}vw`,
    "--page-loader-exit-duration": `${loaderConfig.exitDurationMs}ms`,
  } as CSSProperties;

  useEffect(() => {
    const controller = new AbortController();
    const root = document.documentElement;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    root.dataset.pageLoadState = "loading";
    body.style.overflow = "hidden";

    const run = async () => {
      const result = await preparePageAssets({
        pathname,
        signal: controller.signal,
        maximumWaitMs: loaderConfig.maximumWaitMs,
        settleMs: loaderConfig.assetSettleMs,
        reportProgress: setTargetProgress,
      });
      if (controller.signal.aborted) return;

      const elapsed = performance.now() - startTime.current;
      const remaining = Math.max(0, loaderConfig.minimumVisibleMs - elapsed);
      if (remaining) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remaining));
      }
      if (controller.signal.aborted) return;

      setTargetProgress(100);
      root.dataset.pageLoadState = result.timedOut || result.failedAssets
        ? "degraded"
        : "ready";
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, loaderConfig.completionHoldMs),
      );
      if (controller.signal.aborted) return;

      setPhase("exiting");
      root.dataset.pageLoadState = "exiting";
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, loaderConfig.exitDurationMs),
      );
      if (!controller.signal.aborted) onClosed();
    };

    void run();
    return () => {
      controller.abort();
      body.style.overflow = previousOverflow;
      delete root.dataset.pageLoadState;
    };
  }, [loaderConfig, onClosed, pathname]);

  return (
    <div
      className="page-loader"
      data-phase={phase}
      style={style}
      role="status"
      aria-label="Preparing Webine"
      aria-live="polite"
    >
      <div className="page-loader__content" aria-hidden="true">
        <div className="page-loader__wordmark">
          <span className="page-loader__word page-loader__word--first">WEB</span>
          <span className="page-loader__word page-loader__word--last">INE</span>
        </div>
      </div>
    </div>
  );
}

export function PageLoadProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const routeId = location.pathname === "/preview"
    ? `${location.pathname}${location.search}`
    : location.pathname;
  const skipLoader = location.pathname.startsWith("/admin");
  const [closedRoute, setClosedRoute] = useState("");
  const isPageReady = skipLoader || closedRoute === routeId;
  const closeLoader = useCallback(() => setClosedRoute(routeId), [routeId]);

  return (
    <PageLoadContext.Provider value={{ isPageReady }}>
      {children}
      {!skipLoader && !isPageReady ? (
        <PageLoadingScreen
          key={routeId}
          pathname={location.pathname}
          onClosed={closeLoader}
        />
      ) : null}
    </PageLoadContext.Provider>
  );
}
