import type { SceneProgress } from "./types";

export type ViewportPoint = {
  x: number;
  y: number;
};

export type ParticleSceneAnchorId =
  | "hero"
  | "reach"
  | "interlude"
  | "closing";

export type ParticleSceneAnchorPositions = Record<
  ParticleSceneAnchorId,
  ViewportPoint
>;

export type StoryProgressSnapshot = {
  introProgress: number;
  sceneExitProgress: SceneProgress;
  timelineIntakeProgress: number;
  timelineReleaseProgress: number;
  timelineInletPosition: ViewportPoint;
  timelineOutletPosition: ViewportPoint;
  sceneAnchorPositions: ParticleSceneAnchorPositions;
  scenePresence: SceneProgress;
  activeSceneId: string | null;
  isActive: boolean;
};

export type StoryProgressStore = {
  getSnapshot: () => StoryProgressSnapshot;
  getActivitySnapshot: () => StoryActivitySnapshot;
  subscribe: (listener: () => void) => () => void;
  subscribeActivity: (listener: () => void) => () => void;
  setIntroProgress: (progress: number) => void;
  setTimelineGeometry: (geometry: {
    intakeProgress: number;
    inletPosition: ViewportPoint;
    outletPosition: ViewportPoint;
    releaseProgress: number;
  }) => void;
  update: (next: StoryProgressSnapshot) => void;
};

export type StoryActivitySnapshot = Pick<
  StoryProgressSnapshot,
  "activeSceneId" | "isActive"
>;

const initialSnapshot: StoryProgressSnapshot = {
  introProgress: 0,
  sceneExitProgress: {},
  timelineIntakeProgress: 0,
  timelineReleaseProgress: 0,
  timelineInletPosition: { x: 0.5, y: 0.5 },
  timelineOutletPosition: { x: 0.5, y: 0.5 },
  sceneAnchorPositions: {
    hero: { x: 0.75, y: 0.5 },
    reach: { x: 0.8, y: 0.5 },
    interlude: { x: 0.8, y: 0.5 },
    closing: { x: 0.76, y: 0.5 },
  },
  scenePresence: {},
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
  const progressListeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    getActivitySnapshot: () => activitySnapshot,
    subscribe: (listener) => {
      progressListeners.add(listener);
      return () => progressListeners.delete(listener);
    },
    subscribeActivity: (listener) => {
      activityListeners.add(listener);
      return () => activityListeners.delete(listener);
    },
    setIntroProgress: (progress) => {
      snapshot = {
        ...snapshot,
        introProgress: Math.min(Math.max(progress, 0), 1),
      };
      progressListeners.forEach((listener) => listener());
    },
    setTimelineGeometry: ({
      intakeProgress,
      inletPosition,
      outletPosition,
      releaseProgress,
    }) => {
      snapshot = {
        ...snapshot,
        timelineIntakeProgress: Math.min(Math.max(intakeProgress, 0), 1),
        timelineReleaseProgress: Math.min(Math.max(releaseProgress, 0), 1),
        timelineInletPosition: inletPosition,
        timelineOutletPosition: outletPosition,
      };
      progressListeners.forEach((listener) => listener());
    },
    update: (next) => {
      const shouldNotify =
        snapshot.isActive !== next.isActive ||
        snapshot.activeSceneId !== next.activeSceneId;
      snapshot = next;
      progressListeners.forEach((listener) => listener());

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

export function getScenePresence(rect: DOMRect, viewportHeight: number) {
  const travel = Math.max(rect.height + viewportHeight, 1);
  return Math.min(Math.max((viewportHeight - rect.top) / travel, 0), 1);
}

export function getSceneExitProgress(rect: DOMRect, viewportHeight: number) {
  const exitTravel = Math.max(viewportHeight / 2, 1);
  return Math.min(
    Math.max((viewportHeight / 2 - rect.bottom) / exitTravel, 0),
    1,
  );
}
