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
  createStoryProgressStore,
  getSceneProgress,
  type StoryActivitySnapshot,
  type StoryProgressStore,
} from "../../three/story-progress";

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

    const measure = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const maximumScroll = Math.max(
        document.documentElement.scrollHeight - viewportHeight,
        1,
      );
      const sceneProgress: Record<string, number> = {};
      let activeSceneId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;
      let hasVisibleScene = false;

      scenesRef.current.forEach((element, id) => {
        const rect = element.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < viewportHeight;
        sceneProgress[id] = getSceneProgress(rect, viewportHeight);

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
        pageProgress: Math.min(Math.max(window.scrollY / maximumScroll, 0), 1),
        sceneProgress,
        activeSceneId,
        isActive: !document.hidden && hasVisibleScene,
      });
    };

    const scheduleMeasure = () => {
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
