import type { SceneProgress } from "./types";

export type StoryProgressSnapshot = {
  pageProgress: number;
  sceneProgress: SceneProgress;
  activeSceneId: string | null;
  isActive: boolean;
};

export type StoryProgressStore = {
  getSnapshot: () => StoryProgressSnapshot;
  getActivitySnapshot: () => StoryActivitySnapshot;
  subscribeActivity: (listener: () => void) => () => void;
  update: (next: StoryProgressSnapshot) => void;
};

export type StoryActivitySnapshot = Pick<
  StoryProgressSnapshot,
  "activeSceneId" | "isActive"
>;

const initialSnapshot: StoryProgressSnapshot = {
  pageProgress: 0,
  sceneProgress: {},
  activeSceneId: null,
  isActive: false,
};

export function createStoryProgressStore(): StoryProgressStore {
  let snapshot = initialSnapshot;
  let activitySnapshot: StoryActivitySnapshot = {
    activeSceneId: initialSnapshot.activeSceneId,
    isActive: initialSnapshot.isActive,
  };
  const activityListeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    getActivitySnapshot: () => activitySnapshot,
    subscribeActivity: (listener) => {
      activityListeners.add(listener);
      return () => activityListeners.delete(listener);
    },
    update: (next) => {
      const shouldNotify =
        snapshot.isActive !== next.isActive ||
        snapshot.activeSceneId !== next.activeSceneId;
      snapshot = next;

      if (shouldNotify) {
        activitySnapshot = {
          activeSceneId: next.activeSceneId,
          isActive: next.isActive,
        };
        activityListeners.forEach((listener) => listener());
      }
    },
  };
}

export function getSceneProgress(rect: DOMRect, viewportHeight: number) {
  const start = window.scrollY + rect.top;
  const travel = Math.max(rect.height - viewportHeight * 0.2, viewportHeight * 0.7);
  return Math.min(Math.max((window.scrollY - start) / travel, 0), 1);
}
