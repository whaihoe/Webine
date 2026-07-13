import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { experienceConfig } from "../../config/experience";
import { getParticleCapability } from "../../three/capability";
import {
  useParticleController,
  useStoryActivitySnapshot,
} from "./ParticleSceneController";
import { ParticlePosterFallback } from "./ParticlePosterFallback";

const LazyParticleNarrativeCanvas = lazy(
  () => import("../../three/ParticleNarrativeCanvas"),
);

type ParticleCanvasErrorBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

type ParticleCanvasErrorBoundaryState = {
  failed: boolean;
};

class ParticleCanvasErrorBoundary extends Component<
  ParticleCanvasErrorBoundaryProps,
  ParticleCanvasErrorBoundaryState
> {
  state: ParticleCanvasErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ParticleCanvasErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    console.error("Webine particle rendering failed.");
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function ParticleNarrativeLayer() {
  const { store } = useParticleController();
  const activity = useStoryActivitySnapshot();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [renderState, setRenderState] = useState<
    "loading" | "fallback" | "live"
  >("loading");
  const config = experienceConfig.particles;

  useEffect(() => {
    if (!config.enabled || !getParticleCapability().supported) {
      setRenderState("fallback");
      return;
    }

    const idleWindow = window as IdleWindow;
    let timeout = 0;
    let idleId = 0;

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => setShouldLoad(true), {
        timeout: 650,
      });
    } else {
      timeout = window.setTimeout(
        () => setShouldLoad(true),
        config.lazyLoadDelayMs,
      );
    }

    return () => {
      if (idleId) {
        idleWindow.cancelIdleCallback?.(idleId);
      }

      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [config.enabled, config.lazyLoadDelayMs]);

  const fail = useCallback(() => {
    setShouldLoad(false);
    setRenderState("fallback");
  }, []);
  const markReady = useCallback(() => setRenderState("live"), []);

  return createPortal(
    <div
      className="particle-narrative-layer"
      data-particle-state={renderState}
      aria-hidden="true"
    >
      <ParticlePosterFallback state={renderState} />
      {shouldLoad && renderState !== "fallback" ? (
        <div className="particle-canvas">
          <ParticleCanvasErrorBoundary onFailure={fail}>
            <Suspense fallback={null}>
              <LazyParticleNarrativeCanvas
                active={activity.isActive}
                progressStore={store}
                onReady={markReady}
                onFailure={fail}
              />
            </Suspense>
          </ParticleCanvasErrorBoundary>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
