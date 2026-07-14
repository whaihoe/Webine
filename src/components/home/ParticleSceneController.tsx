import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  experienceConfig,
  particleSceneConfig,
} from "../../config/experience";
import {
  createStoryProgressStore,
  getPointDispersionProgress,
  getPointFormationProgress,
  getScenePresence,
  type ParticleSceneAnchorId,
  type ParticleSceneAnchorPositions,
  type ParticleSceneMotionProgressMap,
  type StoryActivitySnapshot,
  type StoryProgressStore,
} from "../../three/story-progress";

type ParticleLayout = "mobile" | "tablet" | "desktop";

const particleAnchorSceneIds = new Set<ParticleSceneAnchorId>([
  "hero",
  "reach",
  "interlude",
  "closing",
]);

function getParticleLayout(viewportWidth: number): ParticleLayout {
  if (viewportWidth >= experienceConfig.particles.desktop.minWidth) {
    return "desktop";
  }

  if (viewportWidth > experienceConfig.particles.mobile.maxWidth) {
    return "tablet";
  }

  return "mobile";
}

type ParticleSceneControllerProps = {
  children: ReactNode;
};

type ParticleControllerContextValue = {
  store: StoryProgressStore;
  registerScene: (id: string, element: HTMLElement | null) => void;
};

const ParticleControllerContext = createContext<ParticleControllerContextValue | null>(
  null,
);

export function ParticleSceneController({
  children,
}: ParticleSceneControllerProps) {
  const store = useMemo(() => createStoryProgressStore(), []);
  const scenesRef = useRef(new Map<string, HTMLElement>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const scheduleMeasureRef = useRef<() => void>(() => {});

  const registerScene = useCallback((id: string, element: HTMLElement | null) => {
    const previous = scenesRef.current.get(id);

    if (previous) {
      resizeObserverRef.current?.unobserve(previous);
    }

    if (element) {
      scenesRef.current.set(id, element);
      resizeObserverRef.current?.observe(element);
    } else {
      scenesRef.current.delete(id);
    }

    scheduleMeasureRef.current();
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastMeasureAt = 0;
    let measureUntil = 0;

    const measure = (timestamp: number) => {
      frame = 0;
      const layout = getParticleLayout(window.innerWidth);
      const profile = experienceConfig.particles[layout];
      const frameInterval = 1000 / profile.maxFrameRate;

      if (timestamp - lastMeasureAt < frameInterval) {
        if (!document.hidden && timestamp < measureUntil) {
          frame = window.requestAnimationFrame(measure);
        }

        return;
      }

      lastMeasureAt = timestamp;
      const viewportHeight = window.innerHeight;
      const scenePresence: Record<string, number> = {};
      const sceneMotionProgress: ParticleSceneMotionProgressMap = {
        ...store.getSnapshot().sceneMotionProgress,
      };
      let activeSceneId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;
      let hasVisibleScene = false;
      const sceneAnchorPositions: ParticleSceneAnchorPositions = {
        ...store.getSnapshot().sceneAnchorPositions,
      };

      scenesRef.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < viewportHeight;
        scenePresence[id] = getScenePresence(rect, viewportHeight);

        if (particleAnchorSceneIds.has(id as ParticleSceneAnchorId)) {
          const anchorId = id as ParticleSceneAnchorId;
          const sceneConfig = particleSceneConfig[anchorId][layout];
          const pointViewportY =
            (rect.top + rect.height * sceneConfig.anchorY) /
            Math.max(viewportHeight, 1);
          sceneAnchorPositions[anchorId] = {
            x: sceneConfig.anchorX,
            y: pointViewportY,
          };
          const motionProgress = {
            formation: getPointFormationProgress(
              pointViewportY,
              particleSceneConfig[anchorId].motion.formation,
            ),
            dispersion: getPointDispersionProgress(
              pointViewportY,
              particleSceneConfig[anchorId].motion.dispersion,
            ),
          };
          sceneMotionProgress[anchorId] = motionProgress;
          element.dataset.particleFormation =
            motionProgress.formation.toFixed(3);
          element.dataset.particleDispersion =
            motionProgress.dispersion.toFixed(3);
        }

        if (visible) {
          hasVisibleScene = true;
          const distance = Math.abs(
            rect.top + rect.height / 2 - viewportHeight / 2,
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            activeSceneId = id;
          }
        }
      });

      store.update({
        introProgress: store.getSnapshot().introProgress,
        sceneMotionProgress,
        timelineIntakeProgress:
          store.getSnapshot().timelineIntakeProgress,
        timelineReleaseProgress:
          store.getSnapshot().timelineReleaseProgress,
        workParticleVisibility:
          store.getSnapshot().workParticleVisibility,
        workChapterFormationProgress:
          store.getSnapshot().workChapterFormationProgress,
        timelineInletPosition:
          store.getSnapshot().timelineInletPosition,
        timelineOutletPosition:
          store.getSnapshot().timelineOutletPosition,
        sceneAnchorPositions,
        scenePresence,
        activeSceneId,
        isActive: !document.hidden && hasVisibleScene,
      });

      if (!document.hidden && performance.now() < measureUntil) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    const scheduleMeasure = () => {
      const layout = getParticleLayout(window.innerWidth);
      measureUntil =
        performance.now() +
        experienceConfig.particles[layout].measurementSettleMs;

      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    scheduleMeasureRef.current = scheduleMeasure;
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserverRef.current = resizeObserver;
    scenesRef.current.forEach((element) => resizeObserver.observe(element));

    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("orientationchange", scheduleMeasure);
    document.addEventListener("visibilitychange", scheduleMeasure);
    scheduleMeasure();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      resizeObserver.disconnect();
      resizeObserverRef.current = null;
      scheduleMeasureRef.current = () => {};
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      document.removeEventListener("visibilitychange", scheduleMeasure);
    };
  }, [store]);

  const value = useMemo(
    () => ({ store, registerScene }),
    [registerScene, store],
  );

  return (
    <ParticleControllerContext.Provider value={value}>
      {children}
    </ParticleControllerContext.Provider>
  );
}

export function useParticleSceneAnchor(id: string) {
  const controller = useParticleController();

  return useCallback(
    (element: HTMLElement | null) => controller.registerScene(id, element),
    [controller, id],
  );
}

export function useParticleController() {
  const value = useContext(ParticleControllerContext);

  if (!value) {
    throw new Error("Particle scene hooks require ParticleSceneController.");
  }

  return value;
}

export function useStoryActivitySnapshot(): StoryActivitySnapshot {
  const { store } = useParticleController();

  return useSyncExternalStore(
    store.subscribeActivity,
    store.getActivitySnapshot,
    store.getActivitySnapshot,
  );
}
