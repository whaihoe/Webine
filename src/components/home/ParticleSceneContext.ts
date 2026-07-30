import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import type {
  StoryActivitySnapshot,
  StoryProgressStore,
} from "../../three/story-progress";

export type ParticleControllerContextValue = {
  store: StoryProgressStore;
  registerScene: (id: string, element: HTMLElement | null) => void;
};

export const ParticleControllerContext =
  createContext<ParticleControllerContextValue | null>(null);

export function useParticleController() {
  const value = useContext(ParticleControllerContext);

  if (!value) {
    throw new Error("Particle scene hooks require ParticleSceneController.");
  }

  return value;
}

export function useParticleSceneAnchor(id: string) {
  const controller = useParticleController();

  return useCallback(
    (element: HTMLElement | null) => controller.registerScene(id, element),
    [controller, id],
  );
}

export function useStoryActivitySnapshot(): StoryActivitySnapshot {
  const { store } = useParticleController();

  return useSyncExternalStore(
    store.subscribeActivity,
    store.getActivitySnapshot,
    store.getActivitySnapshot,
  );
}
