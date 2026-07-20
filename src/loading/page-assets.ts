type ProgressReporter = (progress: number) => void;

type PageAssetResult = {
  timedOut: boolean;
  failedAssets: number;
};

function waitForAnimationFrames(count = 2) {
  return new Promise<void>((resolve) => {
    const next = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      window.requestAnimationFrame(() => next(remaining - 1));
    };
    next(count);
  });
}

function routeAssets(pathname: string) {
  if (pathname === "/") {
    return window.innerWidth <= 599
      ? ["/mobile-particles/section-targets.bin"]
      : [
          "/models/webine-logo-particle.glb",
          "/models/reach-rings-particle.glb",
          "/models/colony-planet-particle.glb",
        ];
  }

  if (pathname === "/about") {
    return [
      "/about/simple-head-points.bin",
      "/about/kidson-mask.png",
      "/about/kidson-portrait.png",
      "/about/whai-hoe-mask.png",
      "/about/whai-hoe-portrait.png",
    ];
  }

  return [];
}

async function preloadRequest(url: string, signal: AbortSignal) {
  try {
    const response = await fetch(url, { cache: "force-cache", signal });
    return response.ok;
  } catch {
    return false;
  }
}

function preloadImage(url: string, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", abort);
      resolve(loaded);
    };
    const abort = () => finish(false);
    image.onload = () => {
      void image.decode().catch(() => undefined).finally(() => finish(true));
    };
    image.onerror = () => finish(false);
    signal.addEventListener("abort", abort, { once: true });
    image.decoding = "async";
    image.src = url;
    if (image.complete && image.naturalWidth > 0) finish(true);
  });
}

function currentPageMedia() {
  const sources = new Set<string>();
  document.querySelectorAll<HTMLImageElement>("#root img[src]").forEach((image) => {
    if (image.currentSrc || image.src) sources.add(image.currentSrc || image.src);
  });
  document.querySelectorAll<SVGImageElement>("#root svg image[href]").forEach((image) => {
    const source = image.getAttribute("href");
    if (source) sources.add(new URL(source, window.location.href).href);
  });
  return Array.from(sources);
}

function pageSignalsReady(pathname: string) {
  if (document.querySelector('[data-page-load-pending="true"]')) return false;

  if (pathname === "/") {
    if (window.innerWidth <= 599) {
      const heroCanvas = document.querySelector<HTMLCanvasElement>(
        '[data-particle-scene="hero"] canvas[data-mobile-particle-state]',
      );
      const state = heroCanvas?.dataset.mobileParticleState;
      return Boolean(state && state !== "loading");
    }

    const particleLayer = document.querySelector<HTMLElement>("[data-particle-state]");
    return Boolean(
      particleLayer && particleLayer.dataset.particleState !== "loading",
    );
  }

  if (pathname === "/about") {
    return Boolean(document.querySelector(".about-head__visual.is-ready"));
  }

  return true;
}

function waitForPageSignals(pathname: string, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    let frame = 0;
    const finish = () => {
      window.cancelAnimationFrame(frame);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const check = () => {
      if (signal.aborted || pageSignalsReady(pathname)) {
        finish();
        return;
      }
      frame = window.requestAnimationFrame(check);
    };
    signal.addEventListener("abort", finish, { once: true });
    check();
  });
}

function timeout(milliseconds: number) {
  return new Promise<"timeout">((resolve) => {
    window.setTimeout(() => resolve("timeout"), milliseconds);
  });
}

export async function preparePageAssets({
  pathname,
  signal,
  maximumWaitMs,
  settleMs,
  reportProgress,
}: {
  pathname: string;
  signal: AbortSignal;
  maximumWaitMs: number;
  settleMs: number;
  reportProgress: ProgressReporter;
}): Promise<PageAssetResult> {
  let failedAssets = 0;
  reportProgress(8);

  const preparation = (async () => {
    try {
      await document.fonts.ready;
    } catch {
      // System fallbacks keep the page usable if the Font Loading API fails.
    }
    reportProgress(20);

    await waitForAnimationFrames();
    const staticResults = await Promise.all(
      routeAssets(pathname).map((url) => preloadRequest(url, signal)),
    );
    failedAssets += staticResults.filter((loaded) => !loaded).length;
    reportProgress(56);

    await waitForPageSignals(pathname, signal);
    await waitForAnimationFrames();
    reportProgress(72);

    const mediaResults = await Promise.all(
      currentPageMedia().map((url) => preloadImage(url, signal)),
    );
    failedAssets += mediaResults.filter((loaded) => !loaded).length;
    reportProgress(94);

    await new Promise<void>((resolve) => window.setTimeout(resolve, settleMs));
    await waitForAnimationFrames();
    reportProgress(100);
    return "ready" as const;
  })();

  const outcome = await Promise.race([preparation, timeout(maximumWaitMs)]);
  return { timedOut: outcome === "timeout", failedAssets };
}
